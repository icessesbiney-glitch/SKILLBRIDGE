const fs = require('fs');
const { Client } = require('pg');

const projectRef = "lhpdxsnsepvlhwkwsvel";
const dbPassword = encodeURIComponent("10042705icesses");
const sqlPath = "C:\\Windows\\System32\\SKILLBRIDGE\\supabase_delivery_dispatch.sql";

const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require`;

async function runMigration() {
    console.log("📡 Connecting directly to Supabase cloud compute engine to load dispatch matrices...");
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("🔓 Session verified. Loading raw assignment SQL payload...");
        const sqlPayload = fs.readFileSync(sqlPath, 'utf8').trim();

        console.log("🚀 Syncing and applying dispatch tracking alterations...");
        await client.query(sqlPayload);
        console.log("✅ [SUCCESS] Hyperlocal assignment matrix tables created perfectly inside your database!");
    } catch (err) {
        console.error("❌ [DATABASE ERROR]:", err.message);
    } finally {
        await client.end();
    }
}
runMigration();
