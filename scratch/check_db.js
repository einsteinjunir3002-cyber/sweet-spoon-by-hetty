const { Client } = require('pg');

const hosts = [
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-eu-west-2.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-ap-northeast-1.pooler.supabase.com',
  'aws-0-sa-east-1.pooler.supabase.com',
  'aws-0-ca-central-1.pooler.supabase.com'
];

async function check() {
  for (const host of hosts) {
    const client = new Client({
      connectionString: `postgresql://postgres.oohspprzozjzjacofdps:SweetSpoonHetty2026!@${host}:6543/postgres`,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      console.log('MATCH FOUND:', host);
      await client.end();
      return host;
    } catch (e) {
      console.log(host, '->', e.message);
    }
  }
}
check();
