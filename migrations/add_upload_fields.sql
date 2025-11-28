-- Migration: Adicionar campos de upload e pagamento
-- Data: 2024
-- Descrição: Adiciona campos para uploads de fotos, comprovantes e QR codes

-- ============================================
-- 1. Adicionar campos de pagamento em services
-- ============================================
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS pix_link TEXT,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

COMMENT ON COLUMN services.pix_link IS 'Link PIX para pagamento';
COMMENT ON COLUMN services.qr_code_url IS 'URL do QR Code PIX no Supabase Storage';

-- ============================================
-- 2. Adicionar campo de foto de perfil em barbers
-- ============================================
ALTER TABLE barbers 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

COMMENT ON COLUMN barbers.profile_photo_url IS 'URL da foto de perfil no Supabase Storage';

-- ============================================
-- 3. Adicionar campo de comprovante em appointments
-- ============================================
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS payment_receipt_url TEXT;

COMMENT ON COLUMN appointments.payment_receipt_url IS 'URL do comprovante de pagamento no Supabase Storage';

-- ============================================
-- Verificação: Verificar se as colunas foram criadas
-- ============================================
DO $$
BEGIN
    -- Verificar services
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'pix_link'
    ) THEN
        RAISE EXCEPTION 'Coluna pix_link não foi criada na tabela services';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'qr_code_url'
    ) THEN
        RAISE EXCEPTION 'Coluna qr_code_url não foi criada na tabela services';
    END IF;
    
    -- Verificar barbers
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'barbers' AND column_name = 'profile_photo_url'
    ) THEN
        RAISE EXCEPTION 'Coluna profile_photo_url não foi criada na tabela barbers';
    END IF;
    
    -- Verificar appointments
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointments' AND column_name = 'payment_receipt_url'
    ) THEN
        RAISE EXCEPTION 'Coluna payment_receipt_url não foi criada na tabela appointments';
    END IF;
    
    RAISE NOTICE 'Todas as colunas foram criadas com sucesso!';
END $$;

