import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("❌ Expected Supabase credentials missing in .env:");
  console.error("- VITE_SUPABASE_URL:", !!url);
  console.error("- VITE_SUPABASE_PUBLISHABLE_KEY:", !!key);
  process.exit(1);
}

const supabase = createClient(url, key);

async function verifyConnection() {
  console.log(`🔌 Verifying Supabase connection to ${url} ...`);
  try {
    const { error } = await supabase.from('__health_check_ping').select('*').limit(1);

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        console.log("✅ Supabase connection successful! (Received expected missing table error)");
        // Allow graceful exit to prevent Windows Node.js fetch async assertion errors
        return;
      } else {
        console.error("❌ Supabase connection failed with unexpected error:", error);
        process.exitCode = 1;
        return;
      }
    } else {
      console.log("✅ Supabase connection successful! (Table exists?!)");
      return;
    }
  } catch (err) {
    console.error("❌ Supabase handshake failed:", err.message);
    process.exitCode = 1;
  }
}

verifyConnection();
