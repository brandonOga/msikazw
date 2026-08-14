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

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
drop policy if exists "Profile created on signup" on public.profiles;
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

drop policy if exists "Anyone can view approved sellers" on public.sellers;
create policy "Anyone can view approved sellers"
  on public.sellers for select using (status = 'approved');
drop policy if exists "Seller owner can view their own record" on public.sellers;
create policy "Seller owner can view their own record"
  on public.sellers for select using (auth.uid() = user_id);
drop policy if exists "Admin can view all seller applications" on public.sellers;
create policy "Admin can view all seller applications"
  on public.sellers for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
drop policy if exists "Seller owner can update their own record" on public.sellers;
create policy "Seller owner can update their own record"
  on public.sellers for update using (auth.uid() = user_id);
drop policy if exists "Admin can update seller records" on public.sellers;
create policy "Admin can update seller records"
  on public.sellers for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
drop policy if exists "Authenticated users can create a seller application" on public.sellers;
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

drop policy if exists "Seller can view own documents" on public.seller_documents;
create policy "Seller can view own documents"
  on public.seller_documents for select using (
    exists (select 1 from public.sellers s where s.id = seller_id and s.user_id = auth.uid())
  );
drop policy if exists "Seller can upload own documents" on public.seller_documents;
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

drop policy if exists "Anyone can view in-stock products from approved sellers" on public.products;
create policy "Anyone can view in-stock products from approved sellers"
  on public.products for select using (
    exists (select 1 from public.sellers s where s.id = seller_id and s.status = 'approved')
  );
drop policy if exists "Seller can manage own products" on public.products;
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

drop policy if exists "Anyone can view reviews" on public.reviews;
create policy "Anyone can view reviews" on public.reviews for select using (true);
drop policy if exists "Authenticated users can write reviews" on public.reviews;
create policy "Authenticated users can write reviews"
  on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists "User can delete own review" on public.reviews;
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

drop policy if exists "User can manage own cart" on public.cart_items;
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

drop policy if exists "User can manage own wishlist" on public.wishlist;
create policy "User can manage own wishlist"
  on public.wishlist for all using (auth.uid() = user_id);

-- ── Migration: seller review/notification tracking ────────────────────────────
alter table public.sellers
  add column if not exists notify_attempts integer DEFAULT 0,
  add column if not exists notified_at timestamptz NULL,
  add column if not exists approved_at timestamptz NULL,
  add column if not exists review_notes text;

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

drop policy if exists "Buyer can view own orders" on public.orders;
create policy "Buyer can view own orders"
  on public.orders for select using (auth.uid() = buyer_id);
drop policy if exists "Buyer can create orders" on public.orders;
create policy "Buyer can create orders"
  on public.orders for insert with check (auth.uid() = buyer_id);
drop policy if exists "Buyer can update own orders" on public.orders;
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

drop policy if exists "Buyer can view own order items" on public.order_items;
create policy "Buyer can view own order items"
  on public.order_items for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );
drop policy if exists "System can insert order items" on public.order_items;
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

drop policy if exists "Buyer can view own disputes" on public.disputes;
create policy "Buyer can view own disputes"
  on public.disputes for select using (auth.uid() = buyer_id);
drop policy if exists "Buyer can create disputes" on public.disputes;
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

drop policy if exists "User can view own notifications" on public.notifications;
create policy "User can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "User can mark own notifications read" on public.notifications;
create policy "User can mark own notifications read"
  on public.notifications for update using (auth.uid() = user_id);
drop policy if exists "System can insert notifications" on public.notifications;
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

drop policy if exists "Buyer can manage own quotations" on public.quotations;
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

drop policy if exists "Buyer can manage own pre-orders" on public.pre_orders;
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

drop policy if exists "User can manage own back-in-stock subscriptions" on public.back_in_stock;
create policy "User can manage own back-in-stock subscriptions"
  on public.back_in_stock for all using (auth.uid() = user_id);

-- ── Updated-at triggers ───────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace trigger set_profiles_updated_at   before update on public.profiles   for each row execute procedure public.set_updated_at();
create or replace trigger set_sellers_updated_at    before update on public.sellers    for each row execute procedure public.set_updated_at();
create or replace trigger set_products_updated_at   before update on public.products   for each row execute procedure public.set_updated_at();
create or replace trigger set_orders_updated_at     before update on public.orders     for each row execute procedure public.set_updated_at();
create or replace trigger set_disputes_updated_at   before update on public.disputes   for each row execute procedure public.set_updated_at();

-- ── Migration: shipment tracking columns ──────────────────────────────────────
-- Run after initial schema setup if upgrading an existing database
alter table public.orders
  add column if not exists shipment_id     text,
  add column if not exists shipment_status text;

-- ── Migration: dispute resolution column ─────────────────────────────────────
alter table public.disputes
  add column if not exists resolution text;

-- ── Migration: seller EcoCash payout number ───────────────────────────────────
alter table public.sellers
  add column if not exists ecocash_phone text;

-- ── Seller order access policies ─────────────────────────────────────────────
-- Allow sellers to view order_items for their own products
drop policy if exists "Seller can view order items for their products" on public.order_items;
create policy "Seller can view order items for their products"
  on public.order_items for select using (
    exists (
      select 1 from public.products p
      join public.sellers s on s.id = p.seller_id
      where p.id = product_id and s.user_id = auth.uid()
    )
  );

-- Allow sellers to view orders that contain their products
drop policy if exists "Seller can view orders containing their products" on public.orders;
create policy "Seller can view orders containing their products"
  on public.orders for select using (
    buyer_id = auth.uid()
    or exists (
      select 1 from public.order_items oi
      join public.products p on p.id = oi.product_id
      join public.sellers s on s.id = p.seller_id
      where oi.order_id = orders.id and s.user_id = auth.uid()
    )
  );

-- ── Admin bootstrap ───────────────────────────────────────────────────────────
-- To grant admin role to a user, run:
--   update public.profiles set role = 'admin' where id = '<user-uuid>';
-- Replace <user-uuid> with the UUID from Supabase Auth → Users dashboard.
-- Only do this for trusted users — admin role grants full dashboard access.

-- ── Migration: notify seller on quotation request ────────────────────────────
-- Buyers requesting a quote never notified the seller — nothing wrote to
-- public.notifications for the seller's user_id. Add a trigger that does it
-- server-side (security definer), since RLS forbids a buyer's client from
-- inserting a notification row owned by another user (the seller).

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('order','promo','system','quotation'));

create or replace function public.handle_new_quotation()
returns trigger language plpgsql security definer as $$
declare
  seller_user_id uuid;
begin
  if new.product_id is null then
    return new;
  end if;

  select s.user_id into seller_user_id
  from public.products p
  join public.sellers s on s.id = p.seller_id
  where p.id = new.product_id;

  if seller_user_id is not null then
    insert into public.notifications (user_id, type, title, body)
    values (
      seller_user_id,
      'quotation',
      'New Quotation Request',
      new.buyer_name || ' requested a quote for "' || new.product_name || '" (qty: ' || coalesce(new.quantity, 1) || ')'
    );
  end if;

  return new;
end;
$$;

create or replace trigger on_quotation_created
  after insert on public.quotations
  for each row execute procedure public.handle_new_quotation();

-- Sellers could not view quotation requests for their own products at all
-- (the only quotations policy was "buyer can manage own quotations").
drop policy if exists "Seller can view quotations for their products" on public.quotations;
create policy "Seller can view quotations for their products"
  on public.quotations for select using (
    exists (
      select 1 from public.products p
      join public.sellers s on s.id = p.seller_id
      where p.id = product_id and s.user_id = auth.uid()
    )
  );

-- Sellers can update status (e.g. mark 'replied') on quotations for their products
drop policy if exists "Seller can update quotations for their products" on public.quotations;
create policy "Seller can update quotations for their products"
  on public.quotations for update using (
    exists (
      select 1 from public.products p
      join public.sellers s on s.id = p.seller_id
      where p.id = product_id and s.user_id = auth.uid()
    )
  );

-- ── Migration: notify buyer on quotation status change ───────────────────────
-- When a seller declines/replies/accepts a quote, nothing told the buyer.
-- Same rationale as the on_quotation_created trigger: the seller's client
-- can't insert a notification row owned by the buyer's user_id under RLS,
-- so this has to run server-side.

create or replace function public.handle_quotation_status_change()
returns trigger language plpgsql security definer as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'declined' then
    insert into public.notifications (user_id, type, title, body)
    values (
      new.buyer_id, 'quotation', 'Quotation Declined',
      'Your quote request for "' || new.product_name || '" was declined by the seller.'
    );
  elsif new.status = 'accepted' then
    insert into public.notifications (user_id, type, title, body)
    values (
      new.buyer_id, 'quotation', 'Quotation Accepted',
      'Your quote request for "' || new.product_name || '" was accepted!'
    );
  elsif new.status = 'replied' then
    insert into public.notifications (user_id, type, title, body)
    values (
      new.buyer_id, 'quotation', 'Quotation Update',
      'The seller responded to your quote request for "' || new.product_name || '".'
    );
  end if;

  return new;
end;
$$;

create or replace trigger on_quotation_status_changed
  after update on public.quotations
  for each row execute procedure public.handle_quotation_status_change();

-- ── Migration: notify admins on new seller application ───────────────────────
-- Sellers submitting an onboarding application never notified anyone — nothing
-- wrote to public.notifications for admin user_ids. Add a trigger that does it
-- server-side (security definer), since RLS forbids a seller's client from
-- inserting a notification row owned by another user (the admin), and there
-- can be more than one admin account.

create or replace function public.handle_new_seller_application()
returns trigger language plpgsql security definer as $$
begin
  -- Skip the seed/demo user's sellers (inserted by seed.sql) so re-seeding
  -- doesn't spam admins with fake application notifications.
  if new.user_id = '00000000-0000-0000-0000-000000000000' then
    return new;
  end if;

  insert into public.notifications (user_id, type, title, body)
  select id, 'system', 'New Seller Application',
    new.business_name || ' just applied to become a seller. Review it in the Stores tab.'
  from public.profiles
  where role = 'admin';

  return new;
end;
$$;

create or replace trigger on_seller_application_created
  after insert on public.sellers
  for each row execute procedure public.handle_new_seller_application();

-- ── Migration: buyer preferred payment number ─────────────────────────────────
alter table public.profiles
  add column if not exists preferred_payment text;

-- ── Migration: seller bank payout details (optional) ──────────────────────────
alter table public.sellers
  add column if not exists bank_name text,
  add column if not exists bank_account text;

-- ── Migration: notify seller when their application is approved/rejected ─────
-- Admins reviewing an application never notified the seller in-app — nothing
-- wrote to public.notifications for the seller's user_id. Add a trigger that
-- does it server-side (security definer), since RLS forbids the admin's
-- client from inserting a notification row owned by another user (the
-- seller). Fires on any UPDATE that changes status, regardless of whether
-- the admin dashboard or a serverless endpoint performed it.

create or replace function public.handle_seller_status_change()
returns trigger language plpgsql security definer as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'approved' then
    insert into public.notifications (user_id, type, title, body)
    values (
      new.user_id, 'system', 'Store Approved',
      'Congratulations! "' || new.business_name || '" has been approved and is now live on Msika.'
    );
  elsif new.status = 'rejected' then
    insert into public.notifications (user_id, type, title, body)
    values (
      new.user_id, 'system', 'Application Not Approved',
      'Your application for "' || new.business_name || '" was not approved.'
        || case when new.review_notes is not null and new.review_notes <> ''
             then ' Reason: ' || new.review_notes
             else '' end
    );
  end if;

  return new;
end;
$$;

create or replace trigger on_seller_status_changed
  after update on public.sellers
  for each row execute procedure public.handle_seller_status_change();

-- ── Migration: admins can update any profile ──────────────────────────────────
-- Approving a seller needs to set profiles.role = 'seller' for the SELLER's
-- profile, but the only update policy was "own profile only" — an admin's
-- client had no RLS path to do this, so the role bump silently no-opped.
drop policy if exists "Admin can update any profile" on public.profiles;
create policy "Admin can update any profile"
  on public.profiles for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
