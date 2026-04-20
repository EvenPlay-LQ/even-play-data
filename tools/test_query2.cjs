const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zkvurokcdlkuygrsfjqr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdnVyb2tjZGxrdXlncnNmanFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDI1OTksImV4cCI6MjA4ODk3ODU5OX0.FmZDAa7z3xsQZDE58EWrM0LxYC2J8SCUbWlBVN5q70U';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testQuery() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, athletes(id, sport, institution_id), institutions(id, institution_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  console.log("Error:", error);
  console.log("Data count:", data ? data.length : null);
}

testQuery();
