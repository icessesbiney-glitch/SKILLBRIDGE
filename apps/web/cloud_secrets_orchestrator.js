const https = require('https');
const crypto = require('crypto');

const OWNER = "icessesbiney-glitch";
const REPO = "SKILLBRIDGE";
const BASE_URL = `/repos/${OWNER}/${REPO}`;

const secrets = {
  NEXT_PUBLIC_SUPABASE_URL: "https://aolfuonsuaeoitumuvqc.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo",
  PAYSTACK_SECRET_KEY: "sk_live_0c4438dc6168f7d3e51fea88d6962e259416cac5"
};

function makeRequest(path, method, token, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'SkillBridge-Terminal-Matrix',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }, (res) => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, data: b }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function sealedBoxEncrypt(secretValue, publicKeyB64) {
  const msgBuf = Buffer.from(secretValue);
  const pkBuf = Buffer.from(publicKeyB64, 'base64');
  const kp = crypto.generateKeyPairSync('x25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' }
  });
  const rawEpPubKey = kp.publicKey.slice(-32);
  const sharedSec = crypto.diffieHellman({ privateKey: kp.privateKey, publicKey: pkBuf });
  const nonce = crypto.createHash('sha256').update(Buffer.concat([rawEpPubKey, pkBuf])).digest().slice(0, 24);
  const cipher = crypto.createCipheriv('chacha20-poly1305', sharedSec, nonce, { authTagLength: 16 });
  const ciphertext = Buffer.concat([cipher.update(msgBuf), cipher.final()]);
  return Buffer.concat([rawEpPubKey, ciphertext, cipher.getAuthTag()]).toString('base64');
}

async function start() {
  const token = process.argv[2];
  if (!token || !token.startsWith('ghp_')) {
    console.error('❌ Error: Input token must be a valid GitHub token starting with ghp_');
    process.exit(1);
  }
  try {
    console.log('📡 Fetching repository encryption metrics from GitHub API...');
    const keyRes = await makeRequest(`${BASE_URL}/actions/secrets/public-key`, 'GET', token);
    if (keyRes.status !== 200) throw new Error(`Auth failed: ${keyRes.status} ${keyRes.data}`);
    const { key, key_id } = JSON.parse(keyRes.data);

    console.log('\n🔒 Encrypting and pushing production parameters straight into repository secrets slots...');
    for (const [name, val] of Object.entries(secrets)) {
      const payload = { encrypted_value: sealedBoxEncrypt(val, key), key_id };
      const res = await makeRequest(`${BASE_URL}/actions/secrets/${name}`, 'PUT', token, payload);
      console.log(`  🔹 Secret [${name}] Sync Status: ${res.status}`);
    }

    console.log('\n🚀 Dispatching trigger payload to GitHub Actions production pipeline...');
    const trig = await makeRequest(`${BASE_URL}/actions/workflows/deploy-web-production.yml/dispatches`, 'POST', token, { ref: 'main' });
    console.log(`  🔹 Production Workflow Trigger Status: ${trig.status} (204 = SUCCESS)`);
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Crash Error:', err.message);
    process.exit(1);
  }
}
start();
