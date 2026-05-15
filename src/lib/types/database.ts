export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
	public: {
		Tables: {
			users_extended: {
				Row: { id: string; locale: string; created_at: string };
				Insert: { id: string; locale?: string };
				Update: { locale?: string };
				Relationships: [];
			};
			generations: {
				Row: {
					id: string;
					user_id: string | null;
					asset_hash: string;
					style: string;
					params: Json;
					resolution: string;
					r2_key: string | null;
					created_at: string;
				};
				Insert: {
					user_id?: string | null;
					asset_hash: string;
					style: string;
					params: Json;
					resolution: string;
					r2_key?: string | null;
				};
				Update: { r2_key?: string | null };
				Relationships: [];
			};
			purchases: {
				Row: {
					id: string;
					user_id: string;
					stripe_session_id: string;
					type: 'one_shot' | 'commercial_license';
					asset_hash: string | null;
					amount_cents: number | null;
					created_at: string;
				};
				Insert: {
					user_id: string;
					stripe_session_id: string;
					type: 'one_shot' | 'commercial_license';
					asset_hash?: string | null;
					amount_cents?: number | null;
				};
				Update: Record<string, never>;
				Relationships: [];
			};
			subscriptions: {
				Row: {
					id: string;
					user_id: string;
					stripe_subscription_id: string;
					status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
					current_period_end: string | null;
					updated_at: string;
				};
				Insert: {
					user_id: string;
					stripe_subscription_id: string;
					status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
					current_period_end?: string | null;
					updated_at?: string;
				};
				Update: {
					status?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
					current_period_end?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
			quota_anonymous: {
				Row: { ip_hash: string; count: number; reset_at: string };
				Insert: { ip_hash: string; count?: number; reset_at?: string };
				Update: { count?: number; reset_at?: string };
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
}
