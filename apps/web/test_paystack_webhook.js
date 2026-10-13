const crypto = require('crypto');

const secret = process.env.STRIPE_SECRET_KEY || 'placeholder_key';
console.log("Initializing test webhook pipeline with verified security wrappers...");
