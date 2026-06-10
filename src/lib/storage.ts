import { supabase, isSupabaseConfigured } from './supabase';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

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

// ── Upload a seller profile image (logo or banner) ────────────────────────────
// userId must be the Supabase auth UID — RLS on product-images checks the first path segment
export async function uploadSellerImage(
  userId: string,
  type: 'logo' | 'banner',
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  if (!isSupabaseConfigured) return { url: null, error: 'Supabase not configured' };

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  if (!allowed.includes(ext)) return { url: null, error: 'Only JPG, PNG, WEBP or GIF images are allowed' };
  if (file.size > 5 * 1024 * 1024) return { url: null, error: 'Image must be under 5 MB' };

  const path = `${userId}/profile-${type}.${ext}`;
  return uploadFile(BUCKET_PRODUCT_IMAGES, path, file);
}

// ── Upload with XHR progress tracking ────────────────────────────────────────
export function uploadFileWithProgress(
  bucket: string,
  path: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<{ url: string | null; error: string | null }> {
  return new Promise(resolve => {
    if (!isSupabaseConfigured) {
      // Offline: simulate progress then return object URL
      let pct = 0;
      const iv = setInterval(() => {
        pct = Math.min(100, pct + 20);
        onProgress(pct);
        if (pct >= 100) { clearInterval(iv); resolve({ url: URL.createObjectURL(file), error: null }); }
      }, 120);
      return;
    }

    const session = supabase.auth.getSession();
    session.then(({ data }) => {
      const token = data.session?.access_token ?? supabaseKey;
      const endpoint = `${supabaseUrl}/storage/v1/object/${bucket}/${path}`;

      const xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.setRequestHeader('x-upsert', 'true');

      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
          onProgress(100);
          resolve({ url: urlData.publicUrl, error: null });
        } else {
          resolve({ url: null, error: `Upload failed (${xhr.status})` });
        }
      });

      xhr.addEventListener('error', () => resolve({ url: null, error: 'Network error during upload' }));
      xhr.send(file);
    });
  });
}

// ── Upload a product image with progress ──────────────────────────────────────
export function uploadProductImageWithProgress(
  userId: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<{ url: string | null; error: string | null }> {
  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const name = `${Date.now()}.${ext}`;
  const path = `${userId}/${name}`;
  return uploadFileWithProgress(BUCKET_PRODUCT_IMAGES, path, file, onProgress);
}

// ── Delete a file ─────────────────────────────────────────────────────────────
export async function deleteFile(bucket: string, path: string) {
  if (!isSupabaseConfigured) return;
  await supabase.storage.from(bucket).remove([path]);
}
