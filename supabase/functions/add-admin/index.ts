import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { email, name, password, adminRole } = await req.json();
  if (!email || !name || !password) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Verify the caller is an admin
  const authHeader = req.headers.get('Authorization');
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader?.replace('Bearer ', '') ?? ''
  );
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { data: caller } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (caller?.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  // Create the new auth user
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role: 'admin' },
  });
  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), { status: 400 });
  }

  // Upsert their profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: created.user.id,
    name,
    email,
    role: 'admin',
    admin_role: adminRole,
  });
  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
