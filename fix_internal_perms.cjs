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
  
  await client.query(`
    -- Grant USAGE on internal schema
    GRANT USAGE ON SCHEMA internal TO authenticated, anon, service_role;
    
    -- Grant EXECUTE on the internal function
    GRANT EXECUTE ON FUNCTION internal.find_or_create_athlete(
      TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT[]
    ) TO authenticated, service_role;
  `);

  console.log("Granted privileges to internal schema and function.");

  // Reload schema cache
  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log("PostgREST schema cache reloaded.");

  await client.end();
}

main().catch(console.error);
