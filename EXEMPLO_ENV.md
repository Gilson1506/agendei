# 📝 EXEMPLO DE COMO EDITAR O ARQUIVO .env

## ❌ ANTES (Como está agora - NÃO FUNCIONA)
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST].supabase.co:5432/postgres
NODE_ENV=development
PORT=5000
```

## ✅ DEPOIS (Como deve ficar - FUNCIONA)

### Exemplo 1: Connection string completa
```
DATABASE_URL=postgresql://postgres:minhaSenha123@db.abc123xyz.supabase.co:5432/postgres
NODE_ENV=development
PORT=5000
```

### Exemplo 2: Com SSL (recomendado)
```
DATABASE_URL=postgresql://postgres:minhaSenha123@db.abc123xyz.supabase.co:5432/postgres?sslmode=require
NODE_ENV=development
PORT=5000
```

---

## 🔍 Como Identificar Cada Parte

Sua connection string do Supabase será algo como:
```
postgresql://postgres.abc123xyz:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

Você precisa:
1. Copiar a string COMPLETA do Supabase
2. Substituir `[PASSWORD]` pela sua senha real
3. Colar no arquivo `.env`

---

## 📍 Onde Encontrar no Supabase

1. Dashboard do Supabase → Seu Projeto
2. Menu lateral: **Settings** (ícone de engrenagem ⚙️)
3. Clique em: **Database**
4. Role até: **Connection string**
5. Selecione: **URI** (não "Transaction pooler")
6. Copie a string
7. Substitua `[YOUR-PASSWORD]` pela senha que você criou

---

## 🧪 Testar Depois de Editar

```bash
npm run test:db
```

Se aparecer "✅ Conexão bem-sucedida!" → Tudo certo!
Se aparecer erro → Me mostre a mensagem de erro (sem a senha!)
