-- Migración para el sistema de Lanzamientos (V2)
-- Fecha: 2026-01-24

-- 1. Tabla de Lanzamientos
CREATE TABLE IF NOT EXISTS launches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    product_dna JSONB DEFAULT '{}'::jsonb,
    creative_strategy JSONB DEFAULT '{}'::jsonb,
    landing_structure JSONB DEFAULT '{}'::jsonb,
    ad_concepts JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Añadir launch_id a image_generations para vinculación
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='image_generations' AND COLUMN_NAME='launch_id') THEN
        ALTER TABLE image_generations ADD COLUMN launch_id UUID REFERENCES launches(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_launches_user_id ON launches(user_id);
CREATE INDEX IF NOT EXISTS idx_launches_status ON launches(status);
CREATE INDEX IF NOT EXISTS idx_image_generations_launch_id ON image_generations(launch_id);

-- 4. RLS (Row Level Security)
ALTER TABLE launches ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver sus propios lanzamientos
CREATE POLICY "Users can manage their own launches" 
ON launches FOR ALL 
TO authenticated 
USING (auth.uid() = user_id);

-- Admins pueden ver todos
CREATE POLICY "Admins can manage all launches" 
ON launches FOR ALL 
TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND (role = 'owner' OR role = 'superadmin')));

-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_launches_updated_at
    BEFORE UPDATE ON launches
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
