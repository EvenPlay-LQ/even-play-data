const { Client } = require('pg');
const dns = require('dns');

dns.setServers(['8.8.8.8']);
function customLookup(h, o, c) {
  dns.lookup(h, o, (e, a, f) => {
    if (e) dns.resolve4(h, (e2, a2) => c(null, a2[0], 4));
    else c(null, a, f);
  });
}

const client = new Client({
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.zkvurokcdlkuygrsfjqr',
  password: 'Jd5Bw7pgt4GiUo7e',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  lookup: customLookup
});

async function main() {
  await client.connect();
  
  // Reload schema cache
  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log("PostgREST schema cache reloaded.");

  // Check function signatures
  const res = await client.query(`
    SELECT n.nspname as schema, p.proname, pg_get_function_identity_arguments(p.oid) as args 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE p.proname = 'find_or_create_athlete';
  `);
  console.log("Functions found:");
  res.rows.forEach(r => console.log(r.schema + "." + r.proname + "(" + r.args + ")"));
  
  // Test execution as authenticated
  try {
    await client.query("SET ROLE authenticated;");
    const res = await client.query(`
      SELECT public.find_or_create_athlete(
        'Test Player', '2005-01-01', 'Football', 'test2@example.com', 'Striker', 'athlete', '{}'::text[]
      );
    `);
    console.log("TEST SUCCESS! Result:", res.rows[0]);
  } catch (err) {
    console.error("TEST FAILED:", err.message);
  } finally {
    await client.query("RESET ROLE;");
  }

  await client.end();
}

main().catch(console.error);
