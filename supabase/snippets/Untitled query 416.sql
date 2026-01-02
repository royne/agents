-- Migración para persistencia de generaciones de imágenes y soporte de polling

-- 1. Tabla de Generaciones de Imágenes
CREATE TABLE IF NOT EXISTS image_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    image_url TEXT,
    prompt TEXT,
    mode TEXT,
    sub_mode TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- 2. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_image_generations_user_id ON image_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_image_generations_status ON image_generations(status);
CREATE INDEX IF NOT EXISTS idx_image_generations_expires_at ON image_generations(expires_at);

-- 3. Políticas RLS
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propias generaciones
CREATE POLICY "Users can see their own image generations" 
ON image_generations FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Admins pueden ver todas
CREATE POLICY "Admins can manage all image generations" 
ON image_generations FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND (role = 'owner' OR role = 'superadmin')));