import { supabase, isSupabaseConfigured } from '../supabase';
import type { UserRole } from '../../app/context/StoreContext';

export interface SignUpParams {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role: 'buyer' | 'seller';
}

export interface SignInParams {
  email: string;
  password: string;
}

export async function signUp({ email, password, name, phone, role }: SignUpParams) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase not configured — running in offline mode') };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone, role },
    },
  });

  return { data, error };
}

export async function signIn({ email, password }: SignInParams) {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase not configured — running in offline mode') };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getProfile(userId: string) {
  if (!isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) { console.error('[auth] getProfile:', error); return null; }
  return data as { id: string; name: string; phone: string | null; role: UserRole; location: string | null; preferred_payment: string | null };
}

export async function resendConfirmationEmail(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  return { error: error ? error.message : null };
}

export async function verifyEmailOtp(
  email: string,
  token: string,
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null }; // offline — skip

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  return { error: error ? error.message : null };
}

export async function requestPasswordReset(email: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { error: error ? error.message : null };
}

export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error ? error.message : null };
}

export async function updateProfile(userId: string, updates: { name?: string; phone?: string; location?: string; preferredPayment?: string }) {
  if (!isSupabaseConfigured) return null;

  const { preferredPayment, ...rest } = updates;
  const dbUpdates: Record<string, unknown> = { ...rest };
  if (preferredPayment !== undefined) dbUpdates.preferred_payment = preferredPayment;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) { console.error('[auth] updateProfile:', error); return null; }
  return data;
}
