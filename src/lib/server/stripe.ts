import Stripe from 'stripe';
import {
	STRIPE_SECRET_KEY,
	STRIPE_PRICE_ONE_SHOT,
	STRIPE_PRICE_PRO_MONTHLY,
	STRIPE_PRICE_PRO_ANNUAL,
	STRIPE_PRICE_COMMERCIAL
} from '$env/static/private';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
	if (!stripeClient) {
		stripeClient = new Stripe(STRIPE_SECRET_KEY, {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		apiVersion: '2026-04-22.dahlia' as any
		});
	}
	return stripeClient;
}

export function getPrices() {
	return {
		oneShot: STRIPE_PRICE_ONE_SHOT,
		proMonthly: STRIPE_PRICE_PRO_MONTHLY,
		proAnnual: STRIPE_PRICE_PRO_ANNUAL,
		commercial: STRIPE_PRICE_COMMERCIAL
	};
}
