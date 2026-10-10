const crypto = require("crypto");
const http = require("http");

const payload = JSON.stringify({
  event: "charge.success",
  data: { reference: "test_ref_joshua", status: "success", amount: 5000 }
});

const secret = "sk_test_6cb9d1b091f092e071c356778adcb0239b1a2082";
const signature = crypto.createHmac("sha512", secret).update(payload).digest("hex");

const req = http.request({
  hostname: "localhost",
  port: 3000,
  path: "/api/paystack-webhook",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-paystack-signature": signature,
    "Content-Length": Buffer.byteLength(payload)
  }
}, (res) => {
  console.log(`\n=========================================`);
  console.log(`📡 Handshake Status Code Response: ${res.statusCode}`);
  res.setEncoding("utf8");
  res.on("data", (chunk) => console.log(`💻 Server Output Narrative: ${chunk}`));
  console.log(`=========================================\n`);
});

req.on("error", (e) => console.error(`❌ Network Failure: ${e.message}`));
req.write(payload);
req.end();
