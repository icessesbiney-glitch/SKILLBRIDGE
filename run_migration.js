const { Client } = require('pg');
const fs = require('fs');

// Restored your correct active project reference ID string
const dbUser = "postgres.lhpdxsnsepvlhwkwsvel";
const dbPassword = encodeURIComponent("10042705icesses@");
const dbHost = "aws-0-eu-central-1.pooler.supabase.com";
const dbPort = "5432";
const dbName = "postgres";

const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?sslmode=require`;
const sqlPath = "C:\\Windows\\System32\\SKILLBRIDGE\\supabase_gps_schema.sql";

async function runMigration() {
    console.log("📡 Establishing connection to transaction pooler...");
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("🔓 Connected to Supabase Cloud Instance. Reading GPS SQL Payload...");
        const sqlPayload = fs.readFileSync(sqlPath, 'utf8');

        console.log("🚀 Executing database structural migrations...");
        await client.query(sqlPayload);
        console.log("✅ [SUCCESS] GPS monitoring schema table matrices created perfectly inside your database!");
    } catch (err) {
        console.error("❌ [DATABASE ERROR]:", err.message);
    } finally {
        await client.end();
    }
}
runMigration();
