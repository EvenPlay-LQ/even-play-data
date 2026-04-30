const { Client } = require('pg');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
function customLookup(hostname, options, callback) {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) { dns.resolve4(hostname, (err2, addresses) => { if (err2) return callback(err2); callback(null, addresses[0], 4); }); } 
    else { callback(null, address, family); }
  });
}
const DB_CONFIG = { host: 'aws-1-eu-west-1.pooler.supabase.com', port: 6543, user: 'postgres.zkvurokcdlkuygrsfjqr', password: 'Jd5Bw7pgt4GiUo7e', database: 'postgres', ssl: { rejectUnauthorized: false }, lookup: customLookup };

async function main() {
  const client = new Client(DB_CONFIG);
  try {
    await client.connect();
    
    // Check schemas
    const schemaRes = await client.query(`
      SELECT nspname, nspacl FROM pg_namespace WHERE nspname = 'internal';
    `);
    console.log("Internal schema:", schemaRes.rows);

    // Let's grant usage just in case
    await client.query("GRANT USAGE ON SCHEMA internal TO postgres, anon, authenticated, service_role;");
    console.log("Granted USAGE on internal schema.");

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}
main();
