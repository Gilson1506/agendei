// Script de teste para verificar conexão com Supabase
import { neon } from '@neondatabase/serverless';

console.log('🔍 Testando conexão com o banco de dados...\n');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERRO: DATABASE_URL não está definida no arquivo .env');
  console.log('\n📝 Passos para corrigir:');
  console.log('1. Abra o arquivo .env na raiz do projeto');
  console.log('2. Adicione sua connection string do Supabase:');
  console.log('   DATABASE_URL=postgresql://postgres:SUA-SENHA@seu-projeto.supabase.co:5432/postgres');
  process.exit(1);
}

try {
  const sql = neon(process.env.DATABASE_URL);
  const result = await sql`SELECT version()`;
  
  console.log('✅ Conexão bem-sucedida!');
  console.log('📊 Versão do PostgreSQL:', result[0].version);
  console.log('\n🎉 Tudo pronto! Agora você pode executar:');
  console.log('   npm run db:push  - Para criar as tabelas');
  console.log('   npm run dev      - Para iniciar o servidor');
} catch (error) {
  console.error('❌ Erro ao conectar:', error.message);
  console.log('\n🔧 Verifique:');
  console.log('1. A connection string está correta no .env');
  console.log('2. A senha está correta');
  console.log('3. Você tem acesso à internet');
}
