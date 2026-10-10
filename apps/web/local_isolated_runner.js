const { spawn } = require('child_process');
const http = require('http');
const crypto = require('crypto');

console.log('?? Booting live dev server matrix configuration with direct file environment layer...');

const extendedEnv = Object.assign({}, process.env, {
  NEXT_PUBLIC_SUPABASE_URL: "https://aolfuonsuaeoitumuvqc.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_f21PTSo3zKr1oayFCTTyxA_yn6C7QKo",
  PAYSTACK_SECRET_KEY: "sk_live_0c4438dc6168f7d3e51fea88d6962e259416cac5"
});

const srv = spawn('npx', ['next', 'dev', '-p', '3000'], { shell: true, env: extendedEnv });

srv.stdout.on('data', (d) => {
  const output = d.toString();
  if (output.includes('Ready') || output.includes('Ready in')) {
    console.log('? Port 3000 online! Dispatching verification payloads...');
    setTimeout(runTests, 4000);
  }
});

function runTests() {
  const dataA = JSON.stringify({ 
    fullName: 'Joshua Biney', 
    phoneNumber: '0241234567', 
    ghanaCardPin: 'GHA-123456789-0', 
    accountTier: 'Standard Customer' 
  });
  
  // Test Dispatch to Compliance endpoint
  const reqA = http.request({ 
    hostname: 'localhost', 
    port: 3000, 
    path: '/api/admin/compliance', 
    method: 'POST', 
    headers: { 
      'Content-Type': 'application/json', 
      'Content-Length': Buffer.byteLength(dataA) 
    } 
  }, (res) => {
    let b = ''; res.on('data', c => b += c); 
    res.on('end', () => console.log(`\n========================================\n? Compliance Integration Status: ${res.statusCode}\n?? Response: ${b}`));
  });
  reqA.write(dataA); reqA.end();

  // Test Dispatch to Paystack Webhook verification endpoint
  const dataB = JSON.stringify({ 
    event: 'charge.success', 
    data: { 
      id: 1788759637486, 
      domain: 'live', 
      status: 'success', 
      reference: 'SB-2f33ef1e-1788759637486', 
      amount: 5000, 
      currency: 'GHS', 
      channel: 'mobile_money', 
      customer: { email: 'joshua.biney@example.com' } 
    } 
  });
  
  const sig = crypto.createHmac('sha512', 'sk_live_0c4438dc6168f7d3e51fea88d6962e259416cac5').update(dataB).digest('hex');
  
  const reqB = http.request({ 
    hostname: 'localhost', 
    port: 3000, 
    path: '/api/paystack-webhook', 
    method: 'POST', 
    headers: { 
      'Content-Type': 'application/json', 
      'x-paystack-signature': sig, 
      'Content-Length': Buffer.byteLength(dataB) 
    } 
  }, (res) => {
    let b = ''; res.on('data', c => b += c); 
    res.on('end', () => {
      console.log(`\n? Paystack Webhook Integration Status: ${res.statusCode}\n?? Response: ${b}\n========================================`);
      process.exit(0);
    });
  });
  reqB.write(dataB); reqB.end();
}
