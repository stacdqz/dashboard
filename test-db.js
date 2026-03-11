const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const dbUrl = process.env.SUPABASE_DB_URL;

async function test() {
  if (!dbUrl) {
    console.error('SUPABASE_DB_URL not found in .env.local');
    return;
  }
  console.log('Testing connection to:', dbUrl.split('@')[1]); // Don't log password
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Successfully connected!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.end();
  }
}

test();
