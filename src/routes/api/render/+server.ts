import { json, error } from '@sveltejs/kit';
import { createHash } from 'crypto';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import type { Json } from '$lib/types/database';
import { generateCapsulesSVG } from '$lib/generators/style-b/capsules';
import { svgToPng } from '$lib/server/render';
import { applyWatermarkToSVG } from '$lib/server/watermark';
import { isR2Configured, uploadToR2, objectExists, getSignedDownloadUrl } from '$lib/server/r2';
import { getAdminClient } from '$lib/server/supabase';
import { checkAndIncrementAnonymousQuota, checkUserQuota, getClientIp } from '$lib/server/quota';
import { FREE_TIER_MAX_PIXELS, HARD_LIMIT_WIDTH, HARD_LIMIT_HEIGHT } from '$lib/generators/constants';
import type { Tier } from '$lib/generators/types';

const OklchColorSchema = z.object({
	l: z.number().min(0).max(1),
	c: z.number().min(0).max(0.4),
	h: z.number().min(0).max(360)
});

const StyleBParamsSchema = z.object({
	seed: z.string().min(1).max(100),
	palette: z.union([z.string().min(1).max(50), z.array(OklchColorSchema).min(3).max(9)]),
	layout: z.enum(['grid', 'row']),
	gridCols: z.number().int().min(3).max(10),
	gridRows: z.number().int().min(3).max(10),
	heightVariation: z.number().min(0).max(100),
	gradientIntensity: z.number().min(0).max(100),
	count: z.number().int().min(2).max(20),
	overlap: z.number().min(0).max(70)
});

const RenderRequestSchema = z.object({
	style: z.literal('B'),
	params: StyleBParamsSchema,
	resolution: z.object({
		width: z.number().int().min(64).max(HARD_LIMIT_WIDTH),
		height: z.number().int().min(64).max(HARD_LIMIT_HEIGHT)
	}),
	format: z.enum(['png', 'jpeg'])
});

function sortedJson(obj: unknown): string {
	return JSON.stringify(obj, Object.keys(obj as Record<string, unknown>).sort());
}

function computeHash(body: z.infer<typeof RenderRequestSchema>): string {
	const canonical = sortedJson({
		style: body.style,
		params: body.params,
		resolution: body.resolution,
		format: body.format
	});
	return createHash('sha256').update(canonical).digest('hex');
}

async function getUserTier(userId: string): Promise<Tier> {
	const db = getAdminClient();
	const { data } = await db
		.from('subscriptions')
		.select('status')
		.eq('user_id', userId)
		.eq('status', 'active')
		.maybeSingle();
	return data ? 'pro' : 'free';
}

async function hasPurchasedHash(userId: string, hash: string): Promise<boolean> {
	const db = getAdminClient();
	const { data } = await db
		.from('purchases')
		.select('id')
		.eq('user_id', userId)
		.eq('asset_hash', hash)
		.maybeSingle();
	return !!data;
}

export const POST: RequestHandler = async (event) => {
	const body = await event.request.json().catch(() => null);
	if (!body) throw error(400, 'Invalid JSON');

	const parsed = RenderRequestSchema.safeParse(body);
	if (!parsed.success)
		throw error(400, { message: 'Validation error', errors: parsed.error.flatten() } as never);

	const { style, params, resolution, format } = parsed.data;
	const { width, height } = resolution;
	const hash = computeHash(parsed.data);

	const { session } = await event.locals.safeGetSession();
	let tier: Tier = 'anonymous';

	if (!session) {
		const ip = getClientIp(event);
		const allowed = await checkAndIncrementAnonymousQuota(ip);
		if (!allowed) throw error(429, 'Quota anonyme atteint (50/jour)');
	} else {
		tier = await getUserTier(session.user.id);
		const allowed = await checkUserQuota(session.user.id, tier);
		if (!allowed) throw error(429, 'Quota journalier atteint');
	}

	const pixelCount = width * height;
	const purchased = session ? await hasPurchasedHash(session.user.id, hash) : false;
	const isUnlocked = tier === 'pro' || purchased;

	if (!isUnlocked && pixelCount > FREE_TIER_MAX_PIXELS) {
		throw error(403, 'Résolution supérieure à 2560×1440 nécessite un compte Pro ou un achat');
	}

	const r2Key = `${hash}/${width}x${height}.${format}`;
	const r2 = isR2Configured();

	// Cache lookup (R2 only)
	if (r2 && (await objectExists(r2Key))) {
		const url = await getSignedDownloadUrl(r2Key, 3600);
		return json({ url, hash, expiresAt: new Date(Date.now() + 3600_000).toISOString() });
	}

	// Generate
	let svgString = generateCapsulesSVG(params, width, height);
	if (!isUnlocked) svgString = applyWatermarkToSVG(svgString, width, height);
	const buffer = await svgToPng(svgString);

	if (r2) {
		await uploadToR2(r2Key, buffer, `image/${format}`);

		if (session) {
			await getAdminClient()
				.from('generations')
				.insert({
					user_id: session.user.id,
					asset_hash: hash,
					style,
					params: params as unknown as Json,
					resolution: `${width}x${height}`,
					r2_key: r2Key
				});
		}

		const url = await getSignedDownloadUrl(r2Key, 3600);
		return json({ url, hash, expiresAt: new Date(Date.now() + 3600_000).toISOString() });
	}

	// No R2 — return inline base64 (dev mode)
	const dataUrl = `data:image/${format};base64,${buffer.toString('base64')}`;
	return json({ url: dataUrl, hash, expiresAt: null });
};
