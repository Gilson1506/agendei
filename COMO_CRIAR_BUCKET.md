# 📦 Como Criar o Bucket no Supabase

## Passo a Passo Visual

### 1. Acesse o Dashboard do Supabase
- Vá para: https://app.supabase.com
- Faça login na sua conta
- Selecione seu projeto

### 2. Navegue até Storage
- No menu lateral esquerdo, clique em **Storage**
- Você verá a lista de buckets (se houver algum)

### 3. Criar Novo Bucket
- Clique no botão **New bucket** (geralmente no canto superior direito)
- Ou clique em **Create a new bucket**

### 4. Configurar o Bucket

Preencha o formulário com estas configurações:

#### Nome do Bucket
```
uploads
```
⚠️ **IMPORTANTE**: O nome deve ser exatamente `uploads` (minúsculo, sem espaços, sem caracteres especiais)

#### Configurações
- ✅ **Public bucket**: **MARQUE ESTA OPÇÃO** (muito importante!)
  - Isso permite que as imagens sejam acessíveis publicamente via URL
  
- **File size limit**: 
  - Recomendado: `5242880` (5MB em bytes)
  - Ou deixe vazio para sem limite
  
- **Allowed MIME types**: 
  - Deixe **VAZIO** (permite todos os tipos)
  - Ou configure: `image/*,application/pdf` se quiser restringir

### 5. Criar o Bucket
- Clique no botão **Create bucket** ou **Save**
- Aguarde a confirmação

### 6. Verificar se Foi Criado
- Você deve ver o bucket `uploads` na lista de buckets
- O status deve mostrar como **Public** (se marcou como público)

## ✅ Após Criar o Bucket

Depois de criar o bucket, execute um destes scripts SQL:

### Opção 1: Script Completo (com verificação)
Execute: `migrations/setup_storage_bucket.sql`
- Verifica se o bucket existe
- Configura todas as políticas

### Opção 2: Apenas Políticas (se bucket já existe)
Execute: `migrations/setup_storage_policies_only.sql`
- Configura apenas as políticas
- Mais rápido se o bucket já existe

## 🔍 Verificar se Está Configurado Corretamente

Execute este SQL para verificar:

```sql
-- Verificar se o bucket existe
SELECT name, public, file_size_limit 
FROM storage.buckets 
WHERE name = 'uploads';

-- Verificar políticas
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%Public%';
```

## ❌ Problemas Comuns

### "Bucket name already exists"
- O bucket já foi criado
- Você pode pular a criação e ir direto para configurar as políticas

### Não consigo marcar como público
- Verifique se você tem permissões de administrador
- Alguns planos podem ter restrições

### Bucket criado mas não aparece
- Atualize a página
- Verifique se está no projeto correto

## 📸 Imagens de Referência

O formulário de criação deve ter esta aparência:

```
┌─────────────────────────────────────┐
│ Create a new bucket                 │
├─────────────────────────────────────┤
│ Name: [uploads            ]        │
│                                     │
│ ☑ Public bucket                    │
│                                     │
│ File size limit: [5242880  ] bytes │
│                                     │
│ Allowed MIME types: [        ]     │
│                                     │
│         [Cancel]  [Create bucket]   │
└─────────────────────────────────────┘
```

## ✅ Checklist Final

Antes de executar os scripts SQL, verifique:

- [ ] Bucket `uploads` criado
- [ ] Bucket marcado como **Público**
- [ ] Bucket aparece na lista de Storage
- [ ] Você está no projeto correto do Supabase

Depois disso, execute o script SQL de políticas! 🚀

