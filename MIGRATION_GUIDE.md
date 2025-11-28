# Guia de Migração do Banco de Dados

Este guia explica como aplicar as mudanças do schema no Supabase.

## Opção 1: Usando o SQL Editor do Supabase (Recomendado)

1. Acesse o dashboard do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New query**
5. Copie e cole o conteúdo do arquivo `migrations/add_upload_fields.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Verifique se apareceu a mensagem: "Todas as colunas foram criadas com sucesso!"

## Opção 2: Usando Drizzle Kit (Se configurado)

Se você tem o Drizzle Kit configurado, pode usar:

```bash
npm run db:push
```

Isso irá sincronizar o schema automaticamente com o banco de dados.

## Opção 3: Executar SQL Manualmente

Se preferir executar cada comando separadamente:

### 1. Adicionar campos em services:
```sql
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS pix_link TEXT,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
```

### 2. Adicionar campo em barbers:
```sql
ALTER TABLE barbers 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
```

### 3. Adicionar campo em appointments:
```sql
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;
```

## Verificação

Após executar a migração, você pode verificar se as colunas foram criadas:

```sql
-- Verificar colunas em services
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name IN ('pix_link', 'qr_code_url');

-- Verificar colunas em barbers
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'barbers' 
AND column_name = 'profile_photo_url';

-- Verificar colunas em appointments
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name = 'payment_receipt_url';
```

## Campos Adicionados

### Tabela `services`
- `pix_link` (TEXT, nullable): Link PIX para pagamento
- `qr_code_url` (TEXT, nullable): URL do QR Code PIX no Supabase Storage

### Tabela `barbers`
- `profile_photo_url` (TEXT, nullable): URL da foto de perfil no Supabase Storage

### Tabela `appointments`
- `payment_receipt_url` (TEXT, nullable): URL do comprovante de pagamento no Supabase Storage

## Notas Importantes

- Todos os campos são **nullable** (podem ser NULL), então não há risco de quebrar dados existentes
- O uso de `IF NOT EXISTS` garante que a migração seja idempotente (pode ser executada múltiplas vezes sem erro)
- Os campos são do tipo TEXT para armazenar URLs completas

## Troubleshooting

### Erro: "permission denied"
- Certifique-se de estar usando uma conta com permissões de administrador
- Verifique se está conectado ao projeto correto

### Erro: "column already exists"
- Isso é normal se a migração já foi executada
- O `IF NOT EXISTS` previne esse erro, mas se aparecer, pode ignorar

### Verificar se a migração funcionou
Execute este SQL para verificar todas as colunas:

```sql
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('services', 'barbers', 'appointments')
AND column_name IN ('pix_link', 'qr_code_url', 'profile_photo_url', 'payment_receipt_url')
ORDER BY table_name, column_name;
```

