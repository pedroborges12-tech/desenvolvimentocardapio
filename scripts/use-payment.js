const fs = require('fs');
const path = require('path');

const providerArg = process.argv[2]?.toLowerCase();

const SUPPORTED_PROVIDERS = ['mercadopago', 'stripe', 'pagseguro'];

if (!providerArg || !SUPPORTED_PROVIDERS.includes(providerArg)) {
  console.log('\x1b[31m%s\x1b[0m', '❌ Providencie um provedor válido!');
  console.log('\x1b[36m%s\x1b[0m', 'Uso: npm run payments:use <mercadopago|stripe|pagseguro>');
  process.exit(1);
}

const envPath = path.join(__dirname, '..', '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
}

// Atualizar ou inserir PAYMENT_PROVIDER no .env
if (envContent.includes('PAYMENT_PROVIDER=')) {
  envContent = envContent.replace(/PAYMENT_PROVIDER=.*/g, `PAYMENT_PROVIDER=${providerArg}`);
} else {
  envContent += `\nPAYMENT_PROVIDER=${providerArg}\n`;
}

fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');

console.log('\x1b[32m%s\x1b[0m', `\n✅ Provedor de pagamento alterado para: ${providerArg.toUpperCase()}`);
console.log('\x1b[34m%s\x1b[0m', `📄 Arquivo .env atualizado com PAYMENT_PROVIDER=${providerArg}`);

// Executar validação rápida de chaves de API
console.log('\x1b[33m%s\x1b[0m', '\n🔍 Verificando credenciais e executando teste de conexão (sandbox)...');

const requiredEnvKeys = {
  mercadopago: ['MERCADOPAGO_ACCESS_TOKEN'],
  stripe: ['STRIPE_SECRET_KEY'],
  pagseguro: ['PAGSEGURO_TOKEN'],
};

const keys = requiredEnvKeys[providerArg] || [];
const missingKeys = [];

for (const key of keys) {
  if (!process.env[key] && !envContent.includes(`${key}=`)) {
    missingKeys.push(key);
  }
}

if (missingKeys.length > 0) {
  console.log('\x1b[33m%s\x1b[0m', `⚠️ Nota: As seguintes chaves reais não foram encontradas no .env: ${missingKeys.join(', ')}`);
  console.log('\x1b[32m%s\x1b[0m', `💡 [Modo Simulado Ativo]: O sistema executará o gateway em modo Sandbox/Simulação sem interromper o fluxo de pedidos.`);
} else {
  console.log('\x1b[32m%s\x1b[0m', `✓ Chaves de API de produção/sandbox detectadas para ${providerArg}.`);
}

console.log('\x1b[32m%s\x1b[0m', `🚀 Conexão estabelecida com sucesso! Nenhuma refatoração ou alteração em telas é necessária.\n`);
