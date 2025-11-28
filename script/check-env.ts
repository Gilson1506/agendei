console.log("🔍 Verificando configuração SSL...");
console.log(`NODE_TLS_REJECT_UNAUTHORIZED: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`DATABASE_URL configurado: ${process.env.DATABASE_URL ? 'Sim' : 'Não'}`);
