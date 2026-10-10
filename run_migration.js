const fs = require('fs');
const { Client } = require('pg');

// Swapped out the old id for your active production project architecture routing reference
const projectRef = "aolfuonsuaeoitumuvqc";
const dbPassword = encodeURIComponent("10042705icesses@");
const sqlPath = "C:\\Windows\\System32\\SKILLBRIDGE\\supabase_gps_schema.sql";

const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require`;

async function runMigration() {
    console.log("📡 Establishing verified connection line directly to production compute cluster...");
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("🔓 Session authenticated successfully. Reading GPS structural script...");
        const sqlPayload = fs.readFileSync(sqlPath, 'utf8');

        console.log("🚀 Commencing database tracking schema table adjustments...");
        await client.query(sqlPayload);
        console.log("✅ [SUCCESS] GPS monitoring schema table matrices created perfectly inside your database!");
    } catch (err) {
        console.error("❌ [DATABASE ERROR]:", err.message);
    } finally {
        await client.end();
    }
}
runMigration();
