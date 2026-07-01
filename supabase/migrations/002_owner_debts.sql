-- Create ops_owner_debts table
create table if not exists public.ops_owner_debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  owner text not null check (owner in ('abdo', 'osha')),
  type text not null check (type in ('withdraw', 'repay', 'ops_owes')),
  name text not null, -- البيان / الوصف
  amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.ops_owner_debts enable row level security;

-- Policies
create policy "ops_owner_debts_all" on public.ops_owner_debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
