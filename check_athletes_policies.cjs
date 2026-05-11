const { Client } = require('pg');
const dns = require('dns');
const fs = require('fs');

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
  const res = await client.query(`
    SELECT polname, polcmd, polroles, polqual, polwithcheck 
    FROM pg_policy 
    WHERE polrelid = 'public.athletes'::regclass;
  `);
  fs.writeFileSync('scratch_policies.json', JSON.stringify(res.rows, null, 2));
  console.log("Done");
  await client.end();
}

main().catch(console.error);
