-- ============================================================
-- Msika Marketplace — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Profiles ─────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-level profile data
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  phone       text,
  role        text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  location    text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Profile created on signup"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'buyer')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Sellers ──────────────────────────────────────────────────────────────────
create table if not exists public.sellers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  business_name   text not null,
  business_type   text,
  category        text,
  description     text,
  logo_url        text,
  banner_url      text,
  whatsapp        text,
  location        text,
  city            text,
  address         text,
  rating          numeric(3,2) default 0,
  review_count    int default 0,
  followers       int default 0,
  verified        boolean default false,
  status          text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'suspended')),
  reference_no    text unique,
  response_time   text default '< 1 hour',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.sellers enable row level security;

create policy "Anyone can view approved sellers"
  on public.sellers for select using (status = 'approved');
create policy "Seller owner can view their own record"
  on public.sellers for select using (auth.uid() = user_id);
create policy "Seller owner can update their own record"
  on public.sellers for update using (auth.uid() = user_id);
create policy "Authenticated users can create a seller application"
  on public.sellers for insert with check (auth.uid() = user_id);

-- ── Seller Documents ─────────────────────────────────────────────────────────
create table if not exists public.seller_documents (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.sellers(id) on delete cascade,
  name        text not null,
  url         text not null,
  type        text,
  uploaded_at timestamptz not null default now()
);

alter table public.seller_documents enable row level security;

create policy "Seller can view own documents"
  on public.seller_documents for select using (
    exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid())
  );
create policy "Seller can upload own documents"
  on public.seller_documents for insert with check (
    exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid())
  );

-- ── Products ─────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  seller_id       uuid not null references public.sellers(id) on delete cascade,
  name            text not null,
  description     text,
  price           numeric(12,2) not null,
  original_price  numeric(12,2),
  category        text not null,
  image           text,
  images          text[] default '{}',
  rating          numeric(3,2) default 0,
  review_count    int default 0,
  tags            text[] default '{}',
  is_new          boolean default false,
  is_deal         boolean default false,
  in_stock        boolean default true,
  delivery_badge  text default 'Standard Delivery',
  payment_methods text[] default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view in-stock products from approved sellers"
  on public.products for select using (
    exists (select 1 from public.sellers s where s.id = seller_id and s.status = 'approved')
  );
create policy "Seller can manage own products"
  on public.products for all using (
    exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid())
  );

-- ── Product Reviews ───────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references public.profiles(id),
  user_name   text not null,
  rating      int not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)
);

alter table public.reviews enable row level security;

create policy "Anyone can view reviews" on public.reviews for select using (true);
create policy "Authenticated users can write reviews"
  on public.reviews for insert with check (auth.uid() = user_id);
create policy "User can delete own review"
  on public.reviews for delete using (auth.uid() = user_id);

-- ── Cart ─────────────────────────────────────────────────────────────────────
create table if not exists public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  quantity    int not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "User can manage own cart"
  on public.cart_items for all using (auth.uid() = user_id);

-- ── Wishlist ─────────────────────────────────────────────────────────────────
create table if not exists public.wishlist (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.wishlist enable row level security;

create policy "User can manage own wishlist"
  on public.wishlist for all using (auth.uid() = user_id);

-- ── Orders ───────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  buyer_id        uuid not null references public.profiles(id),
  status          text not null default 'pending'
                    check (status in ('pending','confirmed','in_transit','delivered','cancelled')),
  escrow_status   text not null default 'awaiting_payment'
                    check (escrow_status in (
                      'awaiting_payment','payment_confirmed','funds_held',
                      'in_transit','delivery_confirmed','released','disputed'
                    )),
  total           numeric(12,2) not null,
  payment_method  text,
  delivery_method text,
  delivery_partner text,
  name            text,
  phone           text,
  address         text,
  tracking_number text,
  confirmation_pin text,
  date            timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Buyer can view own orders"
  on public.orders for select using (auth.uid() = buyer_id);
create policy "Buyer can create orders"
  on public.orders for insert with check (auth.uid() = buyer_id);
create policy "Buyer can update own orders"
  on public.orders for update using (auth.uid() = buyer_id);

-- ── Order Items ───────────────────────────────────────────────────────────────
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id),
  product_name text not null,
  product_image text,
  seller_name  text,
  price       numeric(12,2) not null,
  quantity    int not null default 1
);

alter table public.order_items enable row level security;

create policy "Buyer can view own order items"
  on public.order_items for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );
create policy "System can insert order items"
  on public.order_items for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );

-- ── Disputes ─────────────────────────────────────────────────────────────────
create table if not exists public.disputes (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id),
  buyer_id    uuid not null references public.profiles(id),
  reason      text not null,
  description text,
  status      text not null default 'open'
                check (status in ('open','under_review','resolved','closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.disputes enable row level security;

create policy "Buyer can view own disputes"
  on public.disputes for select using (auth.uid() = buyer_id);
create policy "Buyer can create disputes"
  on public.disputes for insert with check (auth.uid() = buyer_id);

-- ── Notifications ─────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('order','promo','system')),
  title       text not null,
  body        text not null,
  read        boolean default false,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "User can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);
create policy "User can mark own notifications read"
  on public.notifications for update using (auth.uid() = user_id);
create policy "System can insert notifications"
  on public.notifications for insert with check (auth.uid() = user_id);

-- ── Quotations ───────────────────────────────────────────────────────────────
create table if not exists public.quotations (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid references public.products(id),
  product_name  text not null,
  product_image text,
  seller_name   text,
  buyer_id      uuid not null references public.profiles(id),
  buyer_name    text not null,
  buyer_phone   text,
  message       text,
  quantity      int default 1,
  offered_price numeric(12,2),
  status        text not null default 'pending'
                  check (status in ('pending','replied','accepted','declined')),
  created_at    timestamptz not null default now()
);

alter table public.quotations enable row level security;

create policy "Buyer can manage own quotations"
  on public.quotations for all using (auth.uid() = buyer_id);

-- ── Pre-Orders ────────────────────────────────────────────────────────────────
create table if not exists public.pre_orders (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid references public.products(id),
  product_name    text not null,
  product_image   text,
  seller_name     text,
  buyer_id        uuid not null references public.profiles(id),
  deposit_amount  numeric(12,2) not null,
  total_amount    numeric(12,2) not null,
  remaining_amount numeric(12,2) not null,
  status          text not null default 'deposit_paid'
                    check (status in ('deposit_paid','ready','paid_full','cancelled')),
  created_at      timestamptz not null default now()
);

alter table public.pre_orders enable row level security;

create policy "Buyer can manage own pre-orders"
  on public.pre_orders for all using (auth.uid() = buyer_id);

-- ── Back-in-Stock Subscriptions ───────────────────────────────────────────────
create table if not exists public.back_in_stock (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.back_in_stock enable row level security;

create policy "User can manage own back-in-stock subscriptions"
  on public.back_in_stock for all using (auth.uid() = user_id);

-- ── Updated-at triggers ───────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_profiles_updated_at   before update on public.profiles   for each row execute procedure public.set_updated_at();
create trigger set_sellers_updated_at    before update on public.sellers    for each row execute procedure public.set_updated_at();
create trigger set_products_updated_at   before update on public.products   for each row execute procedure public.set_updated_at();
create trigger set_orders_updated_at     before update on public.orders     for each row execute procedure public.set_updated_at();
create trigger set_disputes_updated_at   before update on public.disputes   for each row execute procedure public.set_updated_at();

-- ── Migration: shipment tracking columns ──────────────────────────────────────
-- Run after initial schema setup if upgrading an existing database
alter table public.orders
  add column if not exists shipment_id     text,
  add column if not exists shipment_status text;

-- ── Migration: seller review notes ───────────────────────────────────────────
alter table public.sellers
  add column if not exists review_notes text;

-- ── Migration: dispute resolution column ─────────────────────────────────────
alter table public.disputes
  add column if not exists resolution text;

-- ── Seller order access policies ─────────────────────────────────────────────
-- Allow sellers to view order_items for their own products
create policy "Seller can view order items for their products"
  on public.order_items for select using (
    exists (
      select 1 from public.products p
      join public.sellers s on s.id = p.seller_id
      where p.id = product_id and s.user_id = auth.uid()
    )
  );

-- Allow sellers to view orders that contain their products
create policy "Seller can view orders containing their products"
  on public.orders for select using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.order_items oi
      join public.products p on p.id = oi.product_id
      join public.sellers s on s.id = p.seller_id
      where oi.order_id = id and s.user_id = auth.uid()
    )
  );

-- ── Admin bootstrap ───────────────────────────────────────────────────────────
-- To grant admin role to a user, run:
--   update public.profiles set role = 'admin' where id = '<user-uuid>';
-- Replace <user-uuid> with the UUID from Supabase Auth → Users dashboard.
-- Only do this for trusted users — admin role grants full dashboard access.
