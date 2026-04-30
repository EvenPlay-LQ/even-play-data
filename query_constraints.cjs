const { Client } = require('pg');
const dns = require('dns');

dns.setServers(['8.8.8.8']);
function customLookup(hostname, options, callback) {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) {
      dns.resolve4(hostname, (err2, addresses) => {
        if (err2) return callback(err2);
        callback(null, addresses[0], 4);
      });
    } else {
      callback(null, address, family);
    }
  });
}

const DB_CONFIG = {
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.zkvurokcdlkuygrsfjqr',
  password: 'Jd5Bw7pgt4GiUo7e',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  lookup: customLookup
};

async function main() {
  const client = new Client(DB_CONFIG);
  try {
    await client.connect();
    
    // Check constraint
    const res = await client.query(`
      SELECT pg_get_constraintdef(c.oid) AS constraint_def
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'institutions' AND c.conname = 'institutions_institution_type_check';
    `);
    console.log("Constraint:", res.rows);

    // Apply the fix if it doesn't contain 'club'
    if (res.rows.length === 0 || !res.rows[0].constraint_def.includes('club')) {
       console.log("Applying constraint fix...");
       await client.query("ALTER TABLE institutions DROP CONSTRAINT IF EXISTS institutions_institution_type_check;");
       await client.query("ALTER TABLE institutions ADD CONSTRAINT institutions_institution_type_check CHECK (institution_type IN ('school', 'club', 'federation'));");
       console.log("Constraint fixed!");
    }
    
    // Check if there are any SECURITY DEFINER functions with search_path = '' or missing schemas
    const funcRes = await client.query(`
      SELECT proname, proconfig
      FROM pg_proc
      WHERE prosecdef = true AND pronamespace = 'public'::regnamespace;
    `);
    console.log("Security Definer Functions:", funcRes.rows);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

main();
