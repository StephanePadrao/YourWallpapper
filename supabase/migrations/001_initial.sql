-- ================================================
-- YourWallpaper — Initial Schema
-- ================================================

-- 1. Profil étendu (extends auth.users)
create table if not exists users_extended (
  id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'fr',
  created_at timestamptz not null default now()
);

-- 2. Générations (log pour cache R2 + quota)
create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  asset_hash text not null,
  style text not null,
  params jsonb not null,
  resolution text not null,
  r2_key text,
  created_at timestamptz not null default now()
);
create index if not exists generations_hash_idx on generations (asset_hash);
create index if not exists generations_user_date_idx on generations (user_id, created_at desc);

-- 3. Achats one-shot et licenses commerciales
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_session_id text not null unique,
  type text not null check (type in ('one_shot', 'commercial_license')),
  asset_hash text,
  amount_cents int,
  created_at timestamptz not null default now()
);
create index if not exists purchases_user_idx on purchases (user_id);
create index if not exists purchases_hash_idx on purchases (asset_hash) where asset_hash is not null;

-- 4. Abonnements Pro
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_subscription_id text not null,
  status text not null check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- 5. Quotas anonymes (par IP hashée, reset quotidien)
create table if not exists quota_anonymous (
  ip_hash text primary key,
  count int not null default 0,
  reset_at date not null default current_date
);

-- ================================================
-- Row Level Security
-- ================================================
alter table users_extended enable row level security;
alter table generations enable row level security;
alter table purchases enable row level security;
alter table subscriptions enable row level security;

-- users_extended : lecture/écriture sur son propre profil
create policy "own profile" on users_extended
  for all using (auth.uid() = id);

-- generations : lecture/écriture sur ses propres générations
create policy "own generations" on generations
  for all using (auth.uid() = user_id or user_id is null);

-- purchases : lecture seule sur ses achats
create policy "read own purchases" on purchases
  for select using (auth.uid() = user_id);

-- subscriptions : lecture seule sur son abonnement
create policy "read own subscription" on subscriptions
  for select using (auth.uid() = user_id);

-- ================================================
-- Trigger : créer profil à l'inscription
-- ================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into users_extended (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
