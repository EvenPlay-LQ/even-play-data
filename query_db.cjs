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
  const res = await client.query("SELECT proname, pg_get_function_identity_arguments(oid) as args FROM pg_proc WHERE proname = 'find_or_create_athlete';");
  console.log("Functions found:");
  res.rows.forEach(r => console.log(r.proname + "(" + r.args + ")"));
  
  // Check execute privileges
  const privs = await client.query(`
    SELECT grantee, privilege_type 
    FROM information_schema.routine_privileges 
    WHERE routine_name = 'find_or_create_athlete';
  `);
  console.log("Privileges:");
  privs.rows.forEach(r => console.log(r.grantee, r.privilege_type));

  await client.end();
}

main().catch(console.error);
