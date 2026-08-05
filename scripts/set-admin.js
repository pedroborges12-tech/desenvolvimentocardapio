const fs = require('fs');
const path = require('path');

const usernameArg = process.argv[2];
const passwordArg = process.argv[3];

if (!usernameArg || !passwordArg) {
  console.log('\x1b[31m%s\x1b[0m', '❌ Forneça usuário e senha!');
  console.log('\x1b[36m%s\x1b[0m', 'Uso: npm run admin:set <usuario> <senha>');
  console.log('\x1b[33m%s\x1b[0m', 'Exemplo: npm run admin:set cliente_burger minhasenha123');
  process.exit(1);
}

const envPath = path.join(__dirname, '..', '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
}

// Atualizar ou inserir ADMIN_USERNAME
if (envContent.includes('ADMIN_USERNAME=')) {
  envContent = envContent.replace(/ADMIN_USERNAME=.*/g, `ADMIN_USERNAME=${usernameArg}`);
} else {
  envContent += `\nADMIN_USERNAME=${usernameArg}\n`;
}

// Atualizar ou inserir ADMIN_PASSWORD
if (envContent.includes('ADMIN_PASSWORD=')) {
  envContent = envContent.replace(/ADMIN_PASSWORD=.*/g, `ADMIN_PASSWORD=${passwordArg}`);
} else {
  envContent += `ADMIN_PASSWORD=${passwordArg}\n`;
}

fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');

console.log('\x1b[32m%s\x1b[0m', `\n✅ Credenciais de acesso do painel atualizadas com sucesso!`);
console.log('\x1b[36m%s\x1b[0m', `👤 Usuário: ${usernameArg}`);
console.log('\x1b[36m%s\x1b[0m', `🔑 Senha:   ${passwordArg}`);
console.log('\x1b[32m%s\x1b[0m', `🚀 Cadastre essas mesmas variáveis no Vercel (ADMIN_USERNAME e ADMIN_PASSWORD) para valer em produção!\n`);
