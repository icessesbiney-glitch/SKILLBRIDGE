const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');

console.log('?? Initializing optimized live development execution server context...');
const server = spawn('npx', ['next', 'dev', '-p', '3000'], { shell: true });

server.stdout.on('data', (data) => {
  const log = data.toString();
  if (log.includes('Ready in') || log.includes('Ready')) {
    console.log('? Server loaded on http://localhost:3000! Executing data routing tests...');
    setTimeout(executeTests, 2000);
  }
});

function executeTests() {
  const compliancePayload = JSON.stringify({
    fullName: 'Joshua Biney',
    phoneNumber: '0241234567',
    ghanaCardPin: 'GHA-123456789-0',
    accountTier: 'Standard Customer'
  });

  const reqA = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/compliance',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(compliancePayload) }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log(`\n? Compliance Integration Status: ${res.statusCode}\n?? Response Payload: ${body.substring(0, 100)}`));
  });
  reqA.write(compliancePayload);
  reqA.end();

  const paystackPayload = JSON.stringify({
    event: 'charge.success',
    data: { id: 1788759637486, domain: 'live', status: 'success', reference: 'SB-2f33ef1e-1788759637486', amount: 5000, currency: 'GHS', channel: 'mobile_money', customer: { email: 'joshua.biney@example.com' } }
  });

  const secretKey = 'sk_live_0c4438dc6168f7d3e51fea88d6962e259416cac5';
  const calculatedSignature = crypto.createHmac('sha512', secretKey).update(paystackPayload).digest('hex');

  const reqB = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/paystack-webhook',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-paystack-signature': calculatedSignature, 'Content-Length': Buffer.byteLength(paystackPayload) }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log(`\n========================================`);
      console.log(`? Paystack Webhook Network Status: ${res.statusCode}`);
      console.log(`?? Response Data: ${body}`);
      console.log(`========================================`);
      process.exit(0);
    });
  });
  reqB.write(paystackPayload);
  reqB.end();
}
