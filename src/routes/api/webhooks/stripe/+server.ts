import { json, error } from '@sveltejs/kit';
import type Stripe from 'stripe';
import type { RequestHandler } from './$types';
import { getStripe } from '$lib/server/stripe';
import { getAdminClient } from '$lib/server/supabase';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) throw error(400, 'Missing stripe-signature');

	let event: Stripe.Event;
	try {
		event = getStripe().webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
	} catch {
		throw error(400, 'Invalid webhook signature');
	}

	const db = getAdminClient();

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object as Stripe.Checkout.Session;
			const userId = session.metadata?.userId;
			if (!userId) break;

			await db.from('purchases').insert({
				user_id: userId,
				stripe_session_id: session.id,
				type: (session.metadata?.type as 'one_shot' | 'commercial_license') ?? 'one_shot',
				asset_hash: session.metadata?.assetHash ?? null,
				amount_cents: session.amount_total
			});
			break;
		}

		case 'customer.subscription.updated':
		case 'customer.subscription.deleted': {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const sub = event.data.object as any;
			const userId: string | undefined = sub.metadata?.userId;
			if (!userId) break;

			const periodEnd: number = sub.current_period_end ?? sub.billing_cycle_anchor ?? 0;

			await db.from('subscriptions').upsert(
				{
					user_id: userId,
					stripe_subscription_id: sub.id as string,
					status: sub.status as 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete',
					current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
					updated_at: new Date().toISOString()
				},
				{ onConflict: 'user_id' }
			);
			break;
		}

		case 'invoice.payment_failed': {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const invoice = event.data.object as any;
			const subId: string | undefined =
				typeof invoice.subscription === 'string'
					? invoice.subscription
					: invoice.subscription?.id;
			if (subId) {
				await db
					.from('subscriptions')
					.update({ status: 'past_due', updated_at: new Date().toISOString() })
					.eq('stripe_subscription_id', subId);
			}
			break;
		}
	}

	return json({ received: true });
};
