/**
 * Helios Depot Operations Console: Lakebase Connectivity Verification (Node.js)
 * File: databricks/test_lakebase_connection.mjs
 * 
 * Verifies connectivity and permissions for the dedicated reader role
 * against the Lakebase PostgreSQL endpoint using Node.js pg client.
 */

import pg from 'pg';

const { Client } = pg;

const host = process.env.PGHOST || 'ep-falling-block-d8w4wp7m.database.us-east-2.cloud.databricks.com';
const port = parseInt(process.env.PGPORT || '5432', 10);
const database = process.env.PGDATABASE || 'databricks_postgres';
const user = process.env.PGUSER || 'convex_reader';
const password = process.env.PGPASSWORD;

console.log('='.repeat(60));
console.log('🛰️ HELIOS LAKEBASE POSTGRES READINESS TEST (Node.js)');
console.log('='.repeat(60));
console.log(`Host:     ${host}`);
console.log(`Port:     ${port}`);
console.log(`Database: ${database}`);
console.log(`User:     ${user}`);
console.log(`SSL:      require`);
console.log('-'.repeat(60));

if (!password) {
  console.log('⚠️ Please set PGPASSWORD before testing:');
  console.log('  export PGPASSWORD="your_password"');
  console.log('  node databricks/test_lakebase_connection.mjs');
  process.exit(1);
}

const client = new Client({
  host,
  port,
  database,
  user,
  password,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

async function main() {
  try {
    console.log('Connecting to Lakebase endpoint...');
    await client.connect();
    console.log('✅ Connected successfully to Lakebase PostgreSQL!');

    const versionRes = await client.query('SELECT version();');
    console.log(`✅ Engine: ${versionRes.rows[0].version}`);

    const countRes = await client.query('SELECT count(*) FROM public.depot_ops_summary;');
    console.log(`✅ Read permission confirmed: ${countRes.rows[0].count} depots found in public.depot_ops_summary.`);

    const rowsRes = await client.query(`
      SELECT depot, warehouse_id, revenue, gross_margin_rate, on_time_rate 
      FROM public.depot_ops_summary 
      ORDER BY revenue DESC;
    `);

    console.log('\nCurated Depot Records from Lakebase:');
    for (const r of rowsRes.rows) {
      console.log(`  - ${r.depot} (${r.warehouse_id}): Revenue=${parseFloat(r.revenue).toLocaleString()} CR, Margin=${(parseFloat(r.gross_margin_rate) * 100).toFixed(1)}%, OnTime=${(parseFloat(r.on_time_rate) * 100).toFixed(1)}%`);
    }
  } catch (err) {
    console.error('❌ Connection check failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
