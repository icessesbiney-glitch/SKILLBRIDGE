const { spawn } = require('child_process');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

console.log('?? Booting live dev server matrix configuration with direct file environment layer...');

// Set explicit secret token directly into the immediate process runtime index
process.env.PAYSTACK_SECRET_KEY = 'sk_live_0c4438dc6168f7d3e51fea88d6962e259416cac5';

const srv = spawn('npx', ['next', 'dev', '-p', '3000'], { 
  shell: true, 
  env: { ...process.env, PAYSTACK_SECRET_KEY: 'sk_live_0c4438dc6168f7d3e51fea88d6962e259416cac5' } 
});

srv.stdout.on('data', (d) => {
  if (d.toString().includes('Ready') || d.toString().includes('Ready in')) {
    console.log('? Port 3000 online! Dispatching verification payloads...');
    setTimeout(runTests, 3000);
  }
});

function runTests() {
  const dataA = JSON.stringify({ 
    fullName: 'Joshua Biney', 
    phoneNumber: '0241234567', 
    ghanaCardPin: 'GHA-123456789-0', 
    accountTier: 'Standard Customer' 
  });
  
  // POST Request to Compliance Route
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
    let b = ''; 
    res.on('data', c => b += c); 
    res.on('end', () => console.log(`\n========================================\n?? Compliance Route Check Status: ${res.statusCode}\n?? Content Check: ${res.statusCode === 404 ? 'Route path missing. Please check file placement.' : 'Processed'}`));
  });
  reqA.write(dataA); reqA.end();

  // POST Request to Paystack Webhook Route
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
    let b = ''; 
    res.on('data', c => b += c); 
    res.on('end', () => {
      console.log(`\n? Paystack Webhook Integration Status: ${res.statusCode}\n?? Response: ${b}\n========================================`);
      process.exit(0);
    });
  });
  reqB.write(dataB); reqB.end();
}
