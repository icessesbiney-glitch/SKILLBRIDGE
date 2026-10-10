const fs = require('fs');
const { Client } = require('pg');
const client = new Client({
    user: 'postgres.lhpdxsnsepvlhwkwsvel',
    host: 'aws-0-eu-central-1.pooler.supabase.com',
    database: 'postgres',
    password: decodeURIComponent('10042705icesses'),
    port: 6543,
    ssl: { rejectUnauthorized: false }
});
async function run() {
    try {
        await client.connect();
        console.log("📡 Connected securely to the live central AWS transaction pooler...");
        const sql = fs.readFileSync("C:\\Windows\\System32\\SKILLBRIDGE\\supabase_wallet_logic.sql", 'utf8').trim();
        await client.query(sql);
        console.log("✅ [SUCCESS] All backend rider and vendor wallet financial data tables compiled perfectly inside your database!");
    } catch (err) {
        console.error("❌ [DATABASE ERROR]:", err.message);
    } finally {
        await client.end();
    }
}
run();
