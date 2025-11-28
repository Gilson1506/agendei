process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import 'dotenv/config';

async function testSupabaseConnection() {
    console.log('\n🔍 Testando conectividade com Supabase...\n');

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.log('❌ DATABASE_URL não configurado');
        return;
    }

    try {
        const url = new URL(dbUrl);
        console.log(`📍 Host: ${url.hostname}`);
        console.log(`🔌 Porta: ${url.port}`);
        console.log(`👤 Usuário: ${url.username}`);
        console.log(`🗄️  Database: ${url.pathname.substring(1)}\n`);

        // Teste 1: DNS Resolution
        console.log('1️⃣ Testando resolução DNS...');
        try {
            const testUrl = `https://${url.hostname}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            await fetch(testUrl, {
                method: 'HEAD',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            console.log('   ✅ DNS resolvido com sucesso\n');
        } catch (e: any) {
            console.log(`   ❌ Erro DNS: ${e.message}\n`);
            if (e.cause) {
                console.log(`   Causa: ${e.cause.code || e.cause.message}\n`);
            }
            return;
        }

        // Teste 2: Conexão com Neon
        console.log('2️⃣ Testando conexão com banco de dados...');
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(dbUrl);

        const result = await sql`SELECT version()`;
        console.log('   ✅ Conexão bem-sucedida!');
        console.log(`   📊 PostgreSQL: ${result[0].version.split(' ')[1]}\n`);

        console.log('🎉 Tudo funcionando! O problema deve estar em outro lugar.\n');

    } catch (error: any) {
        console.log(`\n❌ Erro na conexão: ${error.message}`);

        if (error.cause) {
            console.log(`📋 Causa: ${error.cause.code || error.cause.message}`);
        }

        console.log('\n💡 Possíveis soluções:');
        console.log('   1. Verifique se a senha está correta no .env');
        console.log('   2. Tente resetar a Database Password no Supabase');
        console.log('   3. Verifique se o IP não está bloqueado no Supabase');
        console.log('   4. Tente usar a connection string do "Pooler" em vez de "Direct"');
    }
}

testSupabaseConnection();
