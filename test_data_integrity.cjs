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
    
    console.log("Simulating Frontend Input...");
    const rawInput = "   Test Club !@#$%   ";
    // Frontend does trim()
    const cleanInput = rawInput.trim();
    
    console.log("Cleaned input to insert:", cleanInput);
    
    // We need a profile ID. Let's find one of the confirmed users.
    const userRes = await client.query("SELECT id FROM auth.users WHERE email = 'test.audit.prod.1@gmail.com'");
    if (userRes.rows.length === 0) {
      console.error("Test user not found.");
      return;
    }
    const userId = userRes.rows[0].id;
    
    // Insert into institutions
    await client.query(`
      INSERT INTO public.institutions (profile_id, institution_name, institution_type)
      VALUES ($1, $2, 'club')
      ON CONFLICT DO NOTHING;
    `, [userId, cleanInput]);
    
    // Retrieve and verify
    const res = await client.query(`
      SELECT institution_name, created_at, updated_at 
      FROM public.institutions 
      WHERE profile_id = $1
    `, [userId]);
    
    console.log("Inserted Record:", res.rows[0]);
    if (res.rows[0].created_at && res.rows[0].updated_at) {
      console.log("✅ Timestamps correctly set by default/trigger.");
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}
main();
