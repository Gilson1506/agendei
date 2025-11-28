# ✅ Verificação Rápida do Bucket

## Checklist de Configuração

Antes de testar, verifique se tudo está configurado:

### ✅ 1. Bucket Criado
- [ ] Acesse o Supabase Dashboard
- [ ] Vá em **Storage** → **Buckets**
- [ ] Verifique se existe um bucket chamado **`uploads`** (exatamente assim, minúsculo)
- [ ] Se não existir, crie:
  - Clique em **New bucket**
  - Nome: `uploads`
  - **Public bucket**: ✅ Marque como PÚBLICO
  - File size limit: 5MB (ou mais, conforme necessário)
  - Allowed MIME types: Deixe vazio ou `image/*,application/pdf`

### ✅ 2. Políticas de Segurança Configuradas
- [ ] Execute o script `migrations/setup_storage_bucket.sql` no SQL Editor do Supabase
- [ ] Ou configure manualmente:
  - Vá em **Storage** → **Policies** → Selecione bucket `uploads`
  - Crie políticas para: SELECT (público), INSERT (público), UPDATE, DELETE

### ✅ 3. Variáveis de Ambiente
- [ ] Verifique se o `.env` tem:
  ```env
  SUPABASE_URL=https://seu-projeto.supabase.co
  SUPABASE_ANON_KEY=sua-chave-anon-key
  ```

### ✅ 4. Banco de Dados Migrado
- [ ] Execute `migrations/add_upload_fields.sql` no SQL Editor
- [ ] Verifique se as colunas foram criadas

## 🧪 Como Testar

### Teste 1: Upload de Foto de Barbeiro
1. Acesse o painel admin: `/admin/dashboard`
2. Vá na aba **Profissionais**
3. Clique em **Editar** em um barbeiro existente
4. Clique em **Upload Foto de Perfil**
5. Selecione uma imagem (JPG, PNG)
6. Aguarde o upload
7. ✅ **Sucesso**: A foto deve aparecer no preview
8. ✅ **Verificar**: No Supabase Storage → `uploads` → `barbers/{barberId}/` deve ter o arquivo

### Teste 2: Upload de QR Code
1. Vá na aba **Serviços**
2. Clique em **Editar** em um serviço existente
3. Role até **QR Code PIX**
4. Clique em **Escolher arquivo** e selecione uma imagem de QR Code
5. Aguarde o upload
6. ✅ **Sucesso**: O QR Code deve aparecer no preview
7. ✅ **Verificar**: No Supabase Storage → `uploads` → `qrcodes/{serviceId}/` deve ter o arquivo

### Teste 3: Upload de Comprovante
1. Acesse a página de agendamento: `/booking`
2. Complete o fluxo até a etapa de pagamento
3. No campo **Enviar Comprovante**, selecione uma imagem ou PDF
4. Clique em **ENVIAR COMPROVANTE E CONFIRMAR**
5. Aguarde o processamento
6. ✅ **Sucesso**: Deve aparecer mensagem de sucesso
7. ✅ **Verificar**: 
   - No Supabase Storage → `uploads` → `receipts/{appointmentId}/` deve ter o arquivo
   - No admin → Dashboard → Últimos Agendamentos → deve ter ícone de olho para ver o comprovante

### Teste 4: Visualizar Comprovante no Admin
1. Acesse o admin → Dashboard
2. Na tabela **Últimos Agendamentos**, procure um agendamento com comprovante
3. Clique no ícone de **olho** (👁️) na coluna Comprovante
4. ✅ **Sucesso**: Deve abrir um modal mostrando o comprovante
5. Teste os botões:
   - **Abrir em Nova Aba**: Deve abrir o arquivo em nova aba
   - **Download**: Deve baixar o arquivo

## 🔍 Verificação no Supabase

### Verificar Arquivos no Storage
1. Acesse **Storage** → **uploads**
2. Você deve ver pastas:
   - `barbers/` - Fotos de barbeiros
   - `receipts/` - Comprovantes
   - `qrcodes/` - QR Codes

### Verificar URLs Públicas
1. Clique em um arquivo no Storage
2. Copie a URL pública
3. Cole no navegador
4. ✅ **Sucesso**: A imagem/PDF deve abrir

## ❌ Problemas Comuns

### Erro: "Bucket not found"
**Solução**: Crie o bucket `uploads` no dashboard do Supabase

### Erro: "Permission denied" ou "new row violates row-level security policy"
**Solução**: Execute `migrations/setup_storage_bucket.sql` para configurar as políticas

### Erro: "File too large"
**Solução**: Aumente o limite de tamanho do bucket ou reduza o tamanho do arquivo

### Imagens não aparecem
**Solução**: 
1. Verifique se o bucket está marcado como público
2. Verifique as políticas de SELECT
3. Verifique se a URL pública está correta

### Upload funciona mas URL não abre
**Solução**:
1. Verifique se o bucket está público
2. Verifique as políticas de SELECT
3. Tente acessar a URL diretamente no navegador

## 📝 Notas

- O bucket deve se chamar exatamente **`uploads`** (minúsculo, sem espaços)
- As políticas devem permitir acesso público para leitura (SELECT)
- Para uploads, você pode usar políticas públicas ou autenticadas
- Os arquivos são organizados automaticamente em pastas por tipo

## ✅ Tudo Pronto?

Se todos os itens do checklist estão marcados, você pode testar! 🚀

