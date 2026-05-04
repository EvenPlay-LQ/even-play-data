const url = 'https://zkvurokcdlkuygrsfjqr.supabase.co/rest/v1/athletes?select=*&limit=1';
const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdnVyb2tjZGxrdXlncnNmanFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDI1OTksImV4cCI6MjA4ODk3ODU5OX0.FmZDAa7z3xsQZDE58EWrM0LxYC2J8SCUbWlBVN5q70U';

async function run() {
  const res = await fetch(url, {
    headers: {
      apikey: apikey,
      Authorization: `Bearer ${apikey}`
    }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
