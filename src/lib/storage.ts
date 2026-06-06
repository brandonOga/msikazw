import { supabase, isSupabaseConfigured } from './supabase';

// ── Bucket names ──────────────────────────────────────────────────────────────
export const BUCKET_SELLER_DOCS    = 'seller-docs';
export const BUCKET_PRODUCT_IMAGES = 'product-images';

// ── Upload a file and return its public URL ───────────────────────────────────
export async function uploadFile(
  bucket: string,
  path: string,       // e.g. "userId/filename.jpg"
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured) return { url: null, error: 'Supabase not configured' };

  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: '3600' });

  if (upErr) return { url: null, error: upErr.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

// ── Upload a seller document ───────────────────────────────────────────────────
export async function uploadSellerDoc(
  userId: string,
  docId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const ext  = file.name.split('.').pop() ?? 'bin';
  const path = `${userId}/${docId}.${ext}`;
  return uploadFile(BUCKET_SELLER_DOCS, path, file);
}

// ── Upload a product image ─────────────────────────────────────────────────────
export async function uploadProductImage(
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const name = `${Date.now()}.${ext}`;
  const path = `${userId}/${name}`;
  return uploadFile(BUCKET_PRODUCT_IMAGES, path, file);
}

// ── Delete a file ─────────────────────────────────────────────────────────────
export async function deleteFile(bucket: string, path: string) {
  if (!isSupabaseConfigured) return;
  await supabase.storage.from(bucket).remove([path]);
}
