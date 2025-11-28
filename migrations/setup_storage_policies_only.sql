-- ============================================
-- Configurar APENAS as Políticas do Bucket
-- ============================================
-- Use este script se o bucket 'uploads' já foi criado
-- e você só precisa configurar as políticas
-- ============================================

-- ============================================
-- Remover políticas antigas (se existirem)
-- ============================================
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;

-- ============================================
-- Criar política de LEITURA PÚBLICA (SELECT)
-- ============================================
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');

-- ============================================
-- Criar política de UPLOAD PÚBLICO (INSERT)
-- ============================================
CREATE POLICY "Public upload access"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'uploads');

-- ============================================
-- Criar política de ATUALIZAÇÃO (UPDATE)
-- ============================================
CREATE POLICY "Public update access"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- ============================================
-- Criar política de EXCLUSÃO (DELETE)
-- ============================================
CREATE POLICY "Public delete access"
ON storage.objects
FOR DELETE
USING (bucket_id = 'uploads');

-- ============================================
-- Verificar políticas criadas
-- ============================================
SELECT 
    policyname as "Política",
    cmd as "Operação"
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%Public%'
ORDER BY cmd;

