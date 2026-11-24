import fs from "fs";
import path from "path";
import pg from "pg";
const { Client } = pg;

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:access1221mate24412@db.lduljzvcukjttpheecsq.supabase.co:5432/postgres";
const migrationPath = path.resolve("supabase/migrations/20261125_accessmate_primary_schema.sql");

async function applyMigration() {
  console.log("Connecting to Supabase PostgreSQL at:", connectionString.replace(/:[^:@]+@/, ":***@"));
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL database.");

    const sql = fs.readFileSync(migrationPath, "utf-8");
    console.log(`Executing migration file: ${migrationPath} (${sql.length} bytes)...`);

    await client.query(sql);
    console.log("SUCCESS: Migration applied cleanly!");

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("Tables in public schema now:", res.rows.map(r => r.table_name));

    // Verify policies
    const polRes = await client.query(`
      SELECT schemaname, tablename, policyname, roles, cmd 
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);
    console.log(`Verified ${polRes.rows.length} RLS policies active in public schema.`);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
