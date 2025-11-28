# Configuração do Supabase Storage

Este documento descreve como configurar o Supabase Storage para suportar uploads de arquivos no sistema.

## Passos para Configuração

### 1. Criar o Bucket "uploads"

1. Acesse o dashboard do Supabase
2. Vá em **Storage** no menu lateral
3. Clique em **New bucket**
4. Configure:
   - **Name**: `uploads`
   - **Public bucket**: ✅ Marque como público (para permitir acesso às imagens)
   - **File size limit**: Configure conforme necessário (recomendado: 5MB)
   - **Allowed MIME types**: Deixe vazio ou configure tipos específicos (ex: `image/*,application/pdf`)

### 2. Configurar Políticas de Segurança (RLS)

O Supabase usa Row Level Security (RLS) para controlar acesso. Configure as políticas:

1. Vá em **Storage** → **Policies**
2. Selecione o bucket `uploads`
3. Crie políticas para permitir:
   - **INSERT**: Permitir uploads autenticados ou anônimos (conforme sua necessidade)
   - **SELECT**: Permitir leitura pública (para imagens públicas)
   - **UPDATE**: Permitir atualizações autenticadas
   - **DELETE**: Permitir exclusão autenticada

**Exemplo de política para leitura pública:**
```sql
-- Permitir leitura pública
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');
```

**Exemplo de política para upload:**
```sql
-- Permitir upload autenticado
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' AND
  auth.role() = 'authenticated'
);
```

### 3. Estrutura de Pastas

O sistema organiza os arquivos da seguinte forma:
- `barbers/{barberId}/{timestamp}-{filename}` - Fotos de perfil dos barbeiros
- `receipts/{appointmentId}/{timestamp}-{filename}` - Comprovantes de pagamento
- `qrcodes/{serviceId}/{timestamp}-{filename}` - QR Codes PIX

### 4. Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estão configuradas no seu `.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-key
```

### 5. Testar Upload

Após configurar, você pode testar o upload:

1. Acesse o painel admin
2. Tente fazer upload de uma foto de perfil de um barbeiro
3. Verifique se o arquivo aparece no bucket `uploads` no Supabase
4. Verifique se a URL pública está funcionando

## Troubleshooting

### Erro: "Bucket not found"
- Verifique se o bucket `uploads` foi criado
- Verifique se o nome está exatamente como `uploads` (case-sensitive)

### Erro: "Permission denied"
- Verifique as políticas RLS do bucket
- Certifique-se de que as políticas permitem INSERT/SELECT conforme necessário

### Erro: "File too large"
- Aumente o limite de tamanho do bucket
- Ou reduza o tamanho do arquivo antes do upload

### Imagens não aparecem
- Verifique se o bucket está marcado como público
- Verifique as políticas de SELECT
- Verifique se a URL pública está correta

## Notas Importantes

- O sistema usa base64 para enviar arquivos, o que pode aumentar o tamanho da requisição
- Para arquivos grandes, considere usar upload direto para o Supabase Storage do frontend
- Mantenha backups regulares dos arquivos importantes
- Configure limites de tamanho apropriados para evitar abusos

