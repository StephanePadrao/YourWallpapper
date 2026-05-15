import { createHash } from 'crypto';
import type { RequestEvent } from '@sveltejs/kit';
import { getAdminClient } from './supabase';
import type { Tier } from '$lib/generators/types';

const LIMITS: Record<Tier, number> = {
	anonymous: 50,
	free: 50,
	pro: 500
};

export function hashIp(ip: string): string {
	return createHash('sha256').update(ip + (process.env.IP_HASH_SALT ?? 'yw-salt')).digest('hex');
}

export async function checkAndIncrementAnonymousQuota(ip: string): Promise<boolean> {
	const ipHash = hashIp(ip);
	const db = getAdminClient();
	const today = new Date().toISOString().slice(0, 10);

	const { data, error } = await db
		.from('quota_anonymous')
		.select('count, reset_at')
		.eq('ip_hash', ipHash)
		.maybeSingle();

	if (error) return true; // fail open

	if (!data || data.reset_at !== today) {
		await db
			.from('quota_anonymous')
			.upsert({ ip_hash: ipHash, count: 1, reset_at: today }, { onConflict: 'ip_hash' });
		return true;
	}

	if (data.count >= LIMITS.anonymous) return false;

	await db
		.from('quota_anonymous')
		.update({ count: data.count + 1 })
		.eq('ip_hash', ipHash);

	return true;
}

export async function checkUserQuota(userId: string, tier: Tier): Promise<boolean> {
	// Pro tier: high limit, enforce via Supabase generation count query
	const db = getAdminClient();
	const today = new Date().toISOString().slice(0, 10);

	const { count } = await db
		.from('generations')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', userId)
		.gte('created_at', today);

	return (count ?? 0) < LIMITS[tier];
}

export function getClientIp(event: RequestEvent): string {
	return (
		event.request.headers.get('cf-connecting-ip') ??
		event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		'unknown'
	);
}
