import pg from "pg";
const { Client } = pg;

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:access1221mate24412@db.lduljzvcukjttpheecsq.supabase.co:5432/postgres";

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("SUCCESS: Connected to PostgreSQL!");
    const res = await client.query("SELECT version();");
    console.log("PostgreSQL Version:", res.rows[0].version);

    const tablesRes = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log("Existing tables in public schema:", tablesRes.rows);
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

main();
