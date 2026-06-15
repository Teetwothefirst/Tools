const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split('\n');
const config = {};
lines.forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    config[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = config.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = config.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  // Let's try executing a raw SQL query or check via RPC or inspect error by inserting a dummy column
  const { data, error } = await supabase.from('jobs').insert([{
    company: 'Test Co',
    title: 'Test Title',
    status: 'Saved',
    priority: 'Medium',
    category: 'Engineering'
  }]);
  
  if (error) {
    console.log("Error inserting with category (expected if column is missing):", error.message);
  } else {
    console.log("Success inserting with category! Column exists.", data);
    // Cleanup
    await supabase.from('jobs').delete().eq('company', 'Test Co');
  }
}

test();
