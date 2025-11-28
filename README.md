# SaaSAgora - Configuração do Banco de Dados

## 🎯 Status Atual

O projeto está configurado para usar **Supabase PostgreSQL** como banco de dados.

## ⚙️ Configuração Necessária

### 1. Criar Projeto no Supabase

- Acesse: https://supabase.com
- Crie uma conta ou faça login
- Clique em "New Project"
- Anote a senha do banco de dados!

### 2. Obter Connection String

1. No dashboard do Supabase, vá em **Settings → Database**
2. Encontre "Connection string" e selecione modo **URI**
3. Copie a string (formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)

### 3. Configurar Arquivo .env

Edite o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=postgresql://postgres:SUA-SENHA@seu-projeto.supabase.co:5432/postgres
NODE_ENV=development
PORT=5000
```

### 4. Criar Tabelas no Banco

```bash
npm run db:push
```

### 5. Iniciar o Servidor

```bash
npm run dev
```

## 📊 Schema do Banco de Dados

O projeto usa as seguintes tabelas:
- `users` - Usuários admin
- `services` - Serviços oferecidos
- `barbers` - Barbeiros
- `barber_services` - Relação barbeiro-serviço
- `appointments` - Agendamentos

## 🔧 Comandos Úteis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run db:push` - Sincroniza schema com o banco
- `npm run build` - Build para produção
- `npm start` - Inicia servidor de produção

## ❓ Precisa de Ajuda?

Veja o guia completo em: `.gemini/antigravity/brain/[ID]/supabase_setup_guide.md`
