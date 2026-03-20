const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = "https://zkvurokcdlkuygrsfjqr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdnVyb2tjZGxrdXlncnNmanFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDI1OTksImV4cCI6MjA4ODk3ODU5OX0.FmZDAa7z3xsQZDE58EWrM0LxYC2J8SCUbWlBVN5q70U";
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('Verifying tables...');
  const tables = [
    'profiles', 'athletes', 'athlete_matches', 'performance_metrics', 
    'parents', 'parent_athlete_links', 'coach_feedback'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error && error.code === '42P01') {
      console.error(`❌ Table "${table}" does not exist.`);
    } else if (error && error.code === '42501') {
      console.log(`✅ Table "${table}" exists (but RLS denied access, which is expected for anon).`);
    } else if (error) {
      console.error(`❓ Table "${table}" returned error: ${error.message} (${error.code})`);
    } else {
      console.log(`✅ Table "${table}" exists and is accessible.`);
    }
  }
}

verify();
