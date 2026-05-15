import type { PageServerLoad } from './$types';
import { getAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
	const { session, user } = await safeGetSession();

	if (!session || !user) {
		return { user: null, subscription: null, purchases: [] };
	}

	const db = getAdminClient();

	const [{ data: subscription }, { data: purchases }] = await Promise.all([
		db
			.from('subscriptions')
			.select('status, current_period_end, stripe_subscription_id')
			.eq('user_id', user.id)
			.maybeSingle(),
		db
			.from('purchases')
			.select('type, amount_cents, created_at, asset_hash')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(20)
	]);

	return { user, subscription, purchases: purchases ?? [] };
};
