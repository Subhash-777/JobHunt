const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSignup() {
  const email = `testuser_${Date.now()}@example.com`;
  console.log(`Signing up ${email}...`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
    options: {
      data: {
        full_name: 'Test User'
      }
    }
  });

  if (error) {
    console.error('Signup error:', error);
    process.exit(1);
  }

  console.log('Signup successful, User ID:', data.user.id);
  
  // Wait a moment for trigger to run
  await new Promise(r => setTimeout(r, 1000));

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
    process.exit(1);
  }

  console.log('Trigger success! Profile created:', profile);
}

testSignup();
