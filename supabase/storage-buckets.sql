-- ============================================================
-- Msika Marketplace — Supabase Storage Buckets
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Create buckets ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('seller-docs',    'seller-docs',    true, 5242880,  array['image/jpeg','image/png','image/webp','application/pdf']),
  ('product-images', 'product-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

-- ── RLS policies for seller-docs ─────────────────────────────────────────────
create policy "Seller can upload own docs"
  on storage.objects for insert
  with check (bucket_id = 'seller-docs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view seller docs"
  on storage.objects for select
  using (bucket_id = 'seller-docs');

create policy "Seller can delete own docs"
  on storage.objects for delete
  using (bucket_id = 'seller-docs' and auth.uid()::text = (storage.foldername(name))[1]);

-- ── RLS policies for product-images ──────────────────────────────────────────
create policy "Seller can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Seller can delete own product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);
