-- Create ops_owner_debts table
create table if not exists public.ops_owner_debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.ops_owner_debts enable row level security;

-- Policies
create policy "ops_owner_debts_all" on public.ops_owner_debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
