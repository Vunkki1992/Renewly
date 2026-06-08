-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────

create type billing_cycle as enum ('weekly', 'monthly', 'quarterly', 'yearly');
create type subscription_status as enum ('active', 'cancelled', 'paused', 'trial');
create type invoice_status as enum ('pending', 'processing', 'processed', 'failed');
create type subscription_category as enum (
  'entertainment',
  'productivity',
  'utilities',
  'finance',
  'health',
  'education',
  'gaming',
  'news',
  'storage',
  'other'
);

-- ─────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ─────────────────────────────────────────────

create table subscriptions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  description   text,
  website_url   text,
  logo_url      text,
  category      subscription_category not null default 'other',
  status        subscription_status not null default 'active',
  amount        numeric(10, 2) not null,
  currency      char(3) not null default 'USD',
  billing_cycle billing_cycle not null default 'monthly',
  start_date    date not null default current_date,
  next_billing_date date,
  cancelled_at  timestamptz,
  -- AI fill tracking
  ai_detected   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- INVOICES
-- ─────────────────────────────────────────────

create table invoices (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete set null,
  file_url        text not null,
  file_name       text not null,
  file_type       text not null,
  file_size       int,
  -- AI extraction
  raw_text        text,
  ai_result       jsonb,   -- { name, amount, currency, billing_cycle, next_billing_date, ... }
  status          invoice_status not null default 'pending',
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────────

create table payments (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  invoice_id      uuid references invoices(id) on delete set null,
  amount          numeric(10, 2) not null,
  currency        char(3) not null default 'USD',
  payment_date    date not null,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────

create index subscriptions_user_id_idx on subscriptions(user_id);
create index subscriptions_status_idx on subscriptions(user_id, status);
create index subscriptions_next_billing_idx on subscriptions(next_billing_date);
create index invoices_user_id_idx on invoices(user_id);
create index invoices_subscription_id_idx on invoices(subscription_id);
create index invoices_status_idx on invoices(status);
create index payments_subscription_id_idx on payments(subscription_id);
create index payments_user_id_idx on payments(user_id);

-- ─────────────────────────────────────────────
-- AUTO-UPDATE updated_at
-- ─────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at();

create trigger invoices_updated_at
  before update on invoices
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

alter table subscriptions enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;

-- subscriptions: own rows only
create policy "users manage own subscriptions"
  on subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- invoices: own rows only
create policy "users manage own invoices"
  on invoices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- payments: own rows only
create policy "users manage own payments"
  on payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
