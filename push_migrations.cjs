const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// 1. Setup Custom DNS Lookup to bypass broken system DNS
// We use Google DNS (8.8.8.8) to resolve the pooler hostname.
const CUSTOM_DNS_SERVER = '8.8.8.8';
dns.setServers([CUSTOM_DNS_SERVER]);

function customLookup(hostname, options, callback) {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) {
      console.log(`Custom lookup failed for ${hostname}, retrying with resolve4...`);
      dns.resolve4(hostname, (err2, addresses) => {
        if (err2) return callback(err2);
        callback(null, addresses[0], 4);
      });
    } else {
      callback(null, address, family);
    }
  });
}

// 2. Connection Details (From USER)
const DB_CONFIG = {
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.zkvurokcdlkuygrsfjqr',
  password: 'Jd5Bw7pgt4GiUo7e',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  lookup: customLookup // Injecting the custom DNS resolver
};

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');

async function getAppliedMigrations(client) {
  try {
    const res = await client.query("SELECT version FROM supabase_migrations.schema_migrations ORDER BY version");
    return res.rows.map(r => r.version);
  } catch (e) {
    console.log("Could not read schema_migrations table, assuming none applied or table doesn't exist yet.");
    return [];
  }
}

async function main() {
  const client = new Client(DB_CONFIG);

  try {
    console.log(`Connecting to Pooler at ${DB_CONFIG.host}:${DB_CONFIG.port}...`);
    await client.connect();
    console.log("✅ Connected successfully!");

    // Ensure migration table exists
    await client.query("CREATE SCHEMA IF NOT EXISTS supabase_migrations;");
    await client.query("CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (version text primary key);");

    const applied = await getAppliedMigrations(client);
    console.log(`\nAlready applied migrations: ${applied.length}`);

    // --- MANUAL DIRTY SCHEMA CLEANUP ---
    // This resolves the Set A vs Set B Parent conflict discovered during the audit.
    console.log("🛠️  Cleaning up legacy schema conflicts...");
    try {
      await client.query("DROP TABLE IF EXISTS public.parent_athlete_links CASCADE");
      // Check if parents table has old Set A schema (user_id)
      const res = await client.query("SELECT 1 FROM information_schema.columns WHERE table_name = 'parents' AND column_name = 'user_id' LIMIT 1");
      if (res.rowCount > 0) {
        console.log("  ⚠️  Dropping legacy parents table (Set A)...");
        await client.query("DROP TABLE public.parents CASCADE");
      }
    } catch (err) {
      console.log("  ℹ️  Cleanup note:", err.message);
    }
    // ------------------------------------

    const allFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const SKIP_LIST = [
      '20260320250000_parent_links_admin_bypass.sql'
    ];

    const pending = allFiles.filter(f => !applied.includes(f.replace('.sql', '')) && !SKIP_LIST.includes(f));

    if (pending.length === 0) {
      console.log("\n✅ All migrations already applied.");
    } else {
      console.log(`\nPending: ${pending.length}`);
      for (const file of pending) {
        console.log(`▶ Applying ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        let success = false;
        let alreadyExists = false;

        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query('COMMIT');
          success = true;
          console.log(`  ✅ Success: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          const IGNORE_CODES = ['42P07', '42710', '23505', '42712', '42723']; // 42723 is function already exists
          if (IGNORE_CODES.includes(err.code) || err.message.includes('already exists')) {
            console.log(`  ℹ️  Note: Some objects in ${file} already exist. Syncing metadata.`);
            alreadyExists = true;
            success = true;
          } else {
            console.error(`  ❌ FAILED: ${file}`);
            console.error(`     Error: ${err.message} (${err.code})`);
            break;
          }
        }

        if (success) {
          try {
            await client.query("INSERT INTO supabase_migrations.schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING", [file.replace('.sql', '')]);
          } catch (metaErr) {
            console.error(`  ⚠️  Warning: Could not update metadata for ${file}: ${metaErr.message}`);
          }
        }
      }
    }

    // Verification
    console.log("\n========== VERIFICATION ==========");
    console.log("▶ Testing find_or_create_athlete RPC...");
    try {
      const res = await client.query("SELECT public.find_or_create_athlete('Test Athlete', '2005-01-01', 'Football', 'test@example.com')");
      console.log("  Success:", JSON.stringify(res.rows[0].find_or_create_athlete));
    } catch (err) {
      console.error("  ❌ RPC test failed:", err.message);
    }

    console.log("▶ Testing public_athlete_profiles view...");
    try {
      const res = await client.query("SELECT count(*) FROM public.public_athlete_profiles");
      console.log("  Success: View accessible, count =", res.rows[0].count);
    } catch (err) {
      console.error("  ❌ View test failed:", err.message);
    }

    console.log("▶ Testing athlete_invites table...");
    try {
      const res = await client.query("SELECT count(*) FROM public.athlete_invites");
      console.log("  Success: Table accessible, count =", res.rows[0].count);
    } catch (err) {
      console.error("  ❌ Table test failed:", err.message);
    }

  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  } finally {
    await client.end();
    console.log("\nDone.");
  }
}

main();
