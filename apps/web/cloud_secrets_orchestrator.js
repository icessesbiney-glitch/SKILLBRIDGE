const https = require('https');
const crypto = require('crypto');

const PAT_TOKEN = "ghp_YOUR_ACTUAL_TOKEN_HERE";
const REPO_OWNER = "icessesbiney-glitch";
const REPO_NAME = "SKILLBRIDGE";
const BASE_URL = `https://github.com{REPO_OWNER}/${REPO_NAME}`;

const headers = {
  'Authorization': `Bearer ${PAT_TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'User-Agent': 'SkillBridge-Terminal-Matrix',
  'X-GitHub-Api-Version': '2022-11-28'
};

function makeRequest(url, method, data = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method, headers }, (res) => {
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
  const keyPair = crypto.generateKeyPairSync('x25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' }
  });
  const rawPubKey = keyPair.publicKey.slice(-32);
  const sharedSecret = crypto.diffieHellman({ privateKey: keyPair.privateKey, publicKey: publicKeyBuffer });
  const nonce = crypto.createHash('sha256').update(Buffer.concat([rawPubKey, publicKeyBuffer])).digest().slice(0, 24);
  const cipher = crypto.createCipheriv('chacha20-poly1305', sharedSecret, nonce, { authTagLength: 16 });
  const ciphertext = Buffer.concat([cipher.update(messageBuffer), cipher.final()]);
  return Buffer.concat([rawPubKey, ciphertext, cipher.getAuthTag()]).toString('base64');
}

async function startAutomation() {
  try {
    console.log('📡 Syncing repository public key encryption tokens...');
    const keyRes = await makeRequest(`${BASE_URL}/actions/secrets/public-key`, 'GET');
    if (keyRes.status !== 200) throw new Error(`Auth failed: ${keyRes.status} ${keyRes.data}`);
    const { key, key_id } = JSON.parse(keyRes.data);

    const secrets = {
      NEXT_PUBLIC_SUPABASE_URL: "https://aolfuonsuaeoitumuvqc.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo",
      PAYSTACK_SECRET_KEY: "sk_live_0c4438dc6168f7d3e51fea88d6962e259416cac5"
    };

    for (const [n, v] of Object.entries(secrets)) {
      const payload = { encrypted_value: sealedBoxEncrypt(v, key), key_id };
      const res = await makeRequest(`${BASE_URL}/actions/secrets/${n}`, 'PUT', payload);
      console.log(`🔹 Secret [${n}] Status: ${res.status}`);
    }

    console.log('🚀 Triggering GitHub Actions CI/CD deployment...');
    const trig = await makeRequest(`${BASE_URL}/actions/workflows/deploy-web-production.yml/dispatches`, 'POST', { ref: 'main' });
    console.log(`🔹 Dispatch Pipeline Status: ${trig.status}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}
startAutomation();
