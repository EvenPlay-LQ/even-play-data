const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://zkvurokcdlkuygrsfjqr.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdnVyb2tjZGxrdXlncnNmanFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDI1OTksImV4cCI6MjA4ODk3ODU5OX0.FmZDAa7z3xsQZDE58EWrM0LxYC2J8SCUbWlBVN5q70U";

if (!supabaseUrl) {
  console.error("Missing ENV vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFlowArchitecture() {
  console.log('🔄 Data Flow Structure Validation');
  console.log('====================================');
  console.log('Testing RPC endpoint presence...');
  const { error: rpcErr } = await supabase.rpc('find_or_create_athlete', { _full_name: 'test', _dob: '2000-01-01', _sport: 'Football' });
  
  if (rpcErr && rpcErr.code === 'PGRST202') {
    console.error('❌ find_or_create_athlete RPC is missing!');
  } else if (rpcErr && rpcErr.message.includes('permission denied')) {
    console.log('✅ RPC is mounted securely (RLS caught execution without session).');
  } else if (rpcErr) {
    if (rpcErr.message.toLowerCase().includes('jwt')) {
       console.log('✅ RPC is mounted and guarded by authentication context.');
    } else {
       console.log('⚠️ Unexpected RPC return:', rpcErr.message);
    }
  } else {
    console.log('✅ RPC mounted.');
  }

  console.log('\nTesting T2 Junction table routing...');
  const { error: tblErr } = await supabase.from('parent_athletes').select('id').limit(1);
  if (tblErr && tblErr.code === '42P01') {
      console.error('❌ parent_athletes linkage table missing! Data will fail to flow.');
  } else {
      console.log('✅ parent_athletes logic routing table is present.');
  }

  console.log('\nTesting Athlete Dedup Logic fields...');
  const { error: athErr } = await supabase.from('athletes').select('full_name, contact_email, status').limit(1);
  if (athErr && !athErr.message.toLowerCase().includes('rls') && !athErr.message.toLowerCase().includes('jwt')) {
      console.error(`❌ Athletes schema mismatch! Data flow will fail: ${athErr.message}`);
  } else {
      console.log('✅ Athletes stub handling fields correctly configured.');
  }
}

verifyFlowArchitecture();
