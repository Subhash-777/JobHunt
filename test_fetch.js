const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

fetch(`${url}/auth/v1/signup`, {
  method: 'POST',
  headers: {
    'apikey': key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: `subhash+${Date.now()}@gmail.com`,
    password: 'Password123!',
    data: { full_name: 'Test Trigger' }
  })
}).then(res => res.json()).then(data => console.log(data));
