-- ============================================
-- Configuração do Bucket de Storage
-- ============================================
-- Este script configura o bucket 'uploads' e suas políticas de segurança
-- 
-- IMPORTANTE: Crie o bucket primeiro no dashboard do Supabase:
-- 1. Vá em Storage > New bucket
-- 2. Nome: uploads
-- 3. Marque como Público
-- 4. Depois execute este script
-- ============================================

-- ============================================
-- 1. Verificar se o bucket existe
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'uploads'
    ) THEN
        RAISE WARNING '⚠️  Bucket "uploads" não encontrado!';
        RAISE NOTICE '';
        RAISE NOTICE '📋 INSTRUÇÕES PARA CRIAR O BUCKET:';
        RAISE NOTICE '1. Acesse o Supabase Dashboard';
        RAISE NOTICE '2. Vá em Storage (no menu lateral)';
        RAISE NOTICE '3. Clique em "New bucket"';
        RAISE NOTICE '4. Configure:';
        RAISE NOTICE '   - Name: uploads';
        RAISE NOTICE '   - Public bucket: ✅ Marque como PÚBLICO';
        RAISE NOTICE '   - File size limit: 5MB (ou mais)';
        RAISE NOTICE '   - Allowed MIME types: Deixe vazio';
        RAISE NOTICE '5. Clique em "Create bucket"';
        RAISE NOTICE '6. Depois execute este script novamente';
        RAISE NOTICE '';
        RAISE EXCEPTION 'Crie o bucket primeiro e execute este script novamente';
    END IF;
    
    RAISE NOTICE '✅ Bucket "uploads" encontrado!';
END $$;

-- ============================================
-- 2. Remover políticas antigas (se existirem)
-- ============================================
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
    DROP POLICY IF EXISTS "Public uploads" ON storage.objects;
    DROP POLICY IF EXISTS "Public read" ON storage.objects;
    DROP POLICY IF EXISTS "Public read access" ON storage.objects;
    DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
    DROP POLICY IF EXISTS "Public update access" ON storage.objects;
    DROP POLICY IF EXISTS "Public delete access" ON storage.objects;
    
    RAISE NOTICE '🧹 Políticas antigas removidas (se existiam)';
END $$;

-- ============================================
-- 3. Criar política de LEITURA PÚBLICA (SELECT)
-- ============================================
-- Permite que qualquer pessoa veja as imagens/comprovantes
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');

-- ============================================
-- 4. Criar política de UPLOAD PÚBLICO (INSERT)
-- ============================================
-- Permite uploads sem autenticação (necessário para o sistema funcionar)
CREATE POLICY "Public upload access"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'uploads');

-- ============================================
-- 5. Criar política de ATUALIZAÇÃO (UPDATE)
-- ============================================
-- Permite atualizar arquivos (opcional, mas útil)
CREATE POLICY "Public update access"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- ============================================
-- 6. Criar política de EXCLUSÃO (DELETE)
-- ============================================
-- Permite excluir arquivos (opcional, mas útil para limpeza)
CREATE POLICY "Public delete access"
ON storage.objects
FOR DELETE
USING (bucket_id = 'uploads');

-- ============================================
-- Verificação Final
-- ============================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND (policyname LIKE '%Public%' OR policyname LIKE '%uploads%');
    
    IF policy_count >= 4 THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 SUCESSO! Configuração concluída!';
        RAISE NOTICE '📊 Total de políticas criadas: %', policy_count;
        RAISE NOTICE '';
        RAISE NOTICE '✅ Você pode testar os uploads agora!';
    ELSE
        RAISE WARNING '⚠️  Apenas % políticas foram encontradas. Esperado: 4', policy_count;
    END IF;
END $$;

-- ============================================
-- Listar políticas criadas
-- ============================================
SELECT 
    policyname as "Nome da Política",
    cmd as "Operação",
    CASE 
        WHEN cmd = 'SELECT' THEN 'Leitura pública'
        WHEN cmd = 'INSERT' THEN 'Upload público'
        WHEN cmd = 'UPDATE' THEN 'Atualização'
        WHEN cmd = 'DELETE' THEN 'Exclusão'
    END as "Descrição"
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND (policyname LIKE '%Public%' OR policyname LIKE '%uploads%')
ORDER BY cmd;
