
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno manualmente desde .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const BOLD_IDENTITY_KEY = env.BOLD_IDENTITY_KEY;

if (!BOLD_IDENTITY_KEY) {
  console.error('❌ BOLD_IDENTITY_KEY no encontrada en .env.local');
  process.exit(1);
}

function generateSignature(body, secret) {
  const base64Body = Buffer.from(body).toString('base64');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(base64Body);
  return hmac.digest('hex');
}

async function simulateWebhook(userId, planKey) {
  const payload = {
    event: 'SALE_APPROVED',
    data: {
      reference: `${userId}_${planKey}_${Date.now()}`,
      payment_method: 'CREDIT_CARD'
    }
  };

  const body = JSON.stringify(payload);

  // Opción 1: Con Base64 intermedio
  const base64Body = Buffer.from(body).toString('base64');
  const hmac1 = crypto.createHmac('sha256', BOLD_IDENTITY_KEY);
  hmac1.update(base64Body);
  const sig1 = hmac1.digest('hex');

  // Opción 2: Sin Base64 (Directo)
  const hmac2 = crypto.createHmac('sha256', BOLD_IDENTITY_KEY);
  hmac2.update(body);
  const sig2 = hmac2.digest('hex');

  console.log('\n🚀 Simulando Webhook de Bold...');
  console.log('-----------------------------------');
  console.log(`👤 Usuario ID: ${userId}`);
  console.log(`📦 Plan: ${planKey}`);
  console.log(`🔑 Firma (con Base64): ${sig1}`);
  console.log(`🔑 Firma (Directa):    ${sig2}`);
  console.log('-----------------------------------\n');

  console.log('Copia y pega este comando en tu terminal para probar la firma DIRECTA (recomendado):\n');

  const curlCommand = `curl -X POST http://localhost:3000/api/payments/webhook \\
  -H "Content-Type: application/json" \\
  -H "x-bold-signature: ${sig2}" \\
  -d '${body}'`;

  console.log(curlCommand);
  console.log('\n-----------------------------------');
}

const [, , userId, planKey] = process.argv;

if (!userId || !planKey) {
  console.log('Uso: node scripts/test-webhook.js <userId> <planKey>');
  console.log('Ejemplo: node scripts/test-webhook.js 72c9b4eb-ba16-4610-8af3-af5779f79973 pro');
  process.exit(1);
}

simulateWebhook(userId, planKey);
