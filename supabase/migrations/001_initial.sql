-- Veroula Ops — تشغيل مرة واحدة في Supabase SQL Editor
-- Project: https://supabase.com/dashboard/project/llrbznzcyfwylfpuuoky

-- ── Profiles (مرتبط بـ auth.users) ─────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  role text not null default 'admin' check (role in ('admin', 'moderator')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Ops tables (user_id = auth.uid()) ─────────────────────────────
create table if not exists public.ops_executors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null default '',
  address text not null default '',
  rating int not null default 5 check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique,
  description text not null default '',
  price numeric not null default 0,
  discount_price numeric,
  cost_price numeric not null default 0,
  image text not null default '',
  stock int not null default 0,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  external_order_id text unique,
  source text not null default 'manual',
  order_items text not null default '[]',
  website_note text,
  governorate text not null default '',
  external_placed_at timestamptz,
  customer_meta text,
  images text not null default '[]',
  client_name text not null,
  client_phone text not null default '',
  address text not null default '',
  total_price numeric not null default 0,
  deposit numeric not null default 0,
  remaining numeric not null default 0,
  shipping_cost numeric not null default 0,
  executor_id uuid references public.ops_executors(id) on delete set null,
  executor_price numeric not null default 0,
  executor_deposit numeric not null default 0,
  executor_remaining numeric not null default 0,
  moderator_commission numeric not null default 0,
  delivery_period text not null default '',
  net_profit numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  is_urgent boolean not null default false,
  product_id uuid references public.ops_products(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_capitals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  amount numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_supply_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  images text not null default '[]',
  executor_name text not null,
  phone text not null default '',
  address text not null default '',
  price numeric not null default 0,
  deposit numeric not null default 0,
  shipping_cost numeric not null default 0,
  remaining numeric not null default 0,
  delivery_date text not null default '',
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_moderator_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null default 0,
  screenshot text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default '',
  message text not null default '',
  created_at timestamptz not null default now()
);

-- ── Trigger: profile + capital عند التسجيل ───────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'مدير'),
    coalesce(new.raw_user_meta_data->>'role', 'admin')
  );
  insert into public.ops_capitals (user_id, amount)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS ───────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.ops_executors enable row level security;
alter table public.ops_products enable row level security;
alter table public.ops_orders enable row level security;
alter table public.ops_expenses enable row level security;
alter table public.ops_capitals enable row level security;
alter table public.ops_supply_orders enable row level security;
alter table public.ops_moderator_payments enable row level security;
alter table public.ops_activities enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- generic ops policies
create policy "ops_executors_all" on public.ops_executors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ops_products_all" on public.ops_products for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ops_orders_all" on public.ops_orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ops_expenses_all" on public.ops_expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ops_capitals_all" on public.ops_capitals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ops_supply_orders_all" on public.ops_supply_orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ops_moderator_payments_all" on public.ops_moderator_payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ops_activities_all" on public.ops_activities for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Storage bucket للصور ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('ops-images', 'ops-images', true)
on conflict (id) do nothing;

create policy "ops_images_public_read"
  on storage.objects for select
  using (bucket_id = 'ops-images');

create policy "ops_images_auth_upload"
  on storage.objects for insert
  with check (bucket_id = 'ops-images' and auth.role() = 'authenticated');

create policy "ops_images_auth_update"
  on storage.objects for update
  using (bucket_id = 'ops-images' and auth.uid() = owner);

create policy "ops_images_auth_delete"
  on storage.objects for delete
  using (bucket_id = 'ops-images' and auth.uid() = owner);
