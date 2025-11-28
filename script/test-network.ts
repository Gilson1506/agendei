import 'dotenv/config';

async function testConnection() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
        console.log("❌ DATABASE_URL não configurado");
        return;
    }

    console.log("🔍 Testando conexão com Supabase...\n");

    try {
        const url = new URL(dbUrl);
        const hostname = url.hostname;

        console.log(`📍 Hostname: ${hostname}`);
        console.log(`🔌 Tentando conectar via fetch...\n`);

        // Test basic HTTPS connectivity to the host
        const testUrl = `https://${hostname}`;
        const response = await fetch(testUrl, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
        });

        console.log(`✅ Conexão HTTPS bem-sucedida! Status: ${response.status}`);
        console.log(`ℹ️  O problema pode estar na autenticação do banco, não na rede.`);

    } catch (error: any) {
        console.log(`❌ Erro de conexão: ${error.message}`);

        if (error.cause) {
            console.log(`📋 Causa raiz: ${error.cause.message || error.cause}`);

            if (error.cause.code === 'ENOTFOUND') {
                console.log(`\n💡 Solução: Problema de DNS. Tente:`);
                console.log(`   1. Mudar DNS para 8.8.8.8 (Google) ou 1.1.1.1 (Cloudflare)`);
                console.log(`   2. Verificar se há firewall/antivírus bloqueando`);
                console.log(`   3. Testar com VPN desligada (se estiver usando)`);
            } else if (error.cause.code === 'ETIMEDOUT') {
                console.log(`\n💡 Solução: Timeout de conexão. Verifique:`);
                console.log(`   1. Firewall corporativo/escola`);
                console.log(`   2. Proxy configurado`);
            }
        }
    }
}

testConnection();
