const https = require('https');
const crypto = require('crypto');

// 🔴 PASTE YOUR ACTUAL COPIED GITHUB TOKEN DIRECTLY INSIDE THESE QUOTES BELOW:
const PAT_TOKEN = "ghp_YOUR_TOKEN_HERE";

const REPO_OWNER = "icessesbiney-glitch";
const REPO_NAME = "SKILLBRIDGE";
const BASE_URL = `https://github.com{REPO_OWNER}/${REPO_NAME}`;

const headers = {
  'Authorization': `Bearer ${PAT_TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'SkillBridge-Terminal-Automation-Matrix',
  'X-GitHub-Api-Version': '2022-11-28'
};

function makeRequest(url, method, data = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = { hostname: u.hostname, path: u.pathname + u.search, method, headers };
    const req = https.request(options, (res) => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, data: b }));
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

function sealedBoxEncrypt(secretValue, publicKeyB64) {
  const messageBuffer = Buffer.from(secretValue);
  const publicKeyBuffer = Buffer.from(publicKeyB64, 'base64');
  const ephemeralKeyPair = crypto.generateKeyPairSync('x25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' }
  });
  const rawEphemeralPubKey = ephemeralKeyPair.publicKey.slice(-32);
  const sharedSecret = crypto.diffieHellman({ privateKey: ephemeralKeyPair.privateKey, publicKey: publicKeyBuffer });
  const nonce = crypto.createHash('sha256').update(Buffer.concat([rawEphemeralPubKey, publicKeyBuffer])).digest().slice(0, 24);
  const cipher = crypto.createCipheriv('chacha20-poly1305', sharedSecret, nonce, { authTagLength: 16 });
  const ciphertext = Buffer.concat([cipher.update(messageBuffer), cipher.final()]);
  return Buffer.concat([rawEphemeralPubKey, ciphertext, cipher.getAuthTag()]).toString('base64');
}

async function startAutomation() {
  try {
    console.log('📡 Requesting repository public key metadata fields from GitHub...');
    const keyRes = await makeRequest(`${BASE_URL}/actions/secrets/public-key`, 'GET');
    if (keyRes.status !== 200) throw new Error(`Authentication failure or invalid repository: ${keyRes.status} ${keyRes.data}`);
    
    const { key, key_id } = JSON.parse(keyRes.data);
    console.log(`✅ Public Key Linked: ${key_id}`);

    const secrets = {
      NEXT_PUBLIC_SUPABASE_URL: "https://aolfuonsuaeoitumuvqc.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo",
      PAYSTACK_SECRET_KEY: "sk_live_0c4438dc6168f7d3e51fea88d6962e259416cac5"
    };

    console.log('\n🔒 Encrypting and pushing production parameters straight into cloud storage slots...');
    for (const [name, val] of Object.entries(secrets)) {
      const encryptedValue = sealedBoxEncrypt(val, key);
      const payload = { encrypted_value: encryptedValue, key_id };
      const secretRes = await makeRequest(`${BASE_URL}/actions/secrets/${name}`, 'PUT', payload);
      console.log(`🔹 Secret [${name}] Sync Status: ${secretRes.status} (${secretRes.status === 201 || secretRes.status === 204 ? 'SUCCESS' : 'FAILED'})`);
    }

    console.log('\n🚀 Dispatching execution payload trigger to GitHub Actions CI/CD matrix...');
    const triggerRes = await makeRequest(`${BASE_URL}/actions/workflows/deploy-web-production.yml/dispatches`, 'POST', { ref: 'main' });
    console.log(`🔹 Production Deployment Pipeline Dispatch Status: ${triggerRes.status}`);

    setTimeout(async () => {
      console.log('\n📊 Pulling active deployment tracking metrics from cloud logs...');
      const runRes = await makeRequest(`${BASE_URL}/actions/runs?per_page=1`, 'GET');
      const runs = JSON.parse(runRes.data);
      if (runs.workflow_runs && runs.workflow_runs.length > 0) {
        const r = runs.workflow_runs[0];
        console.log(`\n========================================\n📊 REMOTE WORKFLOW RUN DETAILS:\n========================================\n🔹 Name: ${r.name}\n🔹 Event: ${r.event}\n🔹 Current Status: ${r.status} (${r.conclusion || 'running'})\n🔹 URL: ${r.html_url}\n========================================`);
      }
      process.exit(0);
    }, 4000);

  } catch (err) {
    console.error('\n❌ Automation engine crash error:', err.message);
    process.exit(1);
  }
}

startAutomation();
