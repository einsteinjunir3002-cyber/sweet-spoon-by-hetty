const net = require('net');

const hosts = [
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-eu-west-2.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-us-east-2.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-us-west-2.pooler.supabase.com',
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-ap-northeast-1.pooler.supabase.com',
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-sa-east-1.pooler.supabase.com',
  'aws-0-ca-central-1.pooler.supabase.com',
  'aws-0-me-central-1.pooler.supabase.com',
  'aws-0-af-south-1.pooler.supabase.com'
];

// Startup message for postgres pooler:
// Length: 4 bytes int32 (len)
// Protocol version: 196608 (3.0)
// key: "user", val: "postgres.oohspprzozjzjacofdps\0"
// key: "database", val: "postgres\0"
function makeStartupPacket(user, database) {
  let buf = Buffer.alloc(1024);
  let pos = 4;
  buf.writeInt32BE(196608, pos); pos += 4;
  buf.write('user\0', pos); pos += 5;
  buf.write(user + '\0', pos); pos += user.length + 1;
  buf.write('database\0', pos); pos += 9;
  buf.write(database + '\0', pos); pos += database.length + 1;
  buf.write('\0', pos); pos += 1;
  buf.writeInt32BE(pos, 0);
  return buf.slice(0, pos);
}

const pkt = makeStartupPacket('postgres.oohspprzozjzjacofdps', 'postgres');

hosts.forEach(host => {
  const sock = net.createConnection(6543, host, () => {
    sock.write(pkt);
  });
  sock.on('data', data => {
    const str = data.toString();
    console.log(host, '->', str.includes('tenant') || str.includes('not found') ? 'NOT FOUND' : str);
    sock.destroy();
  });
  sock.on('error', () => {});
});
