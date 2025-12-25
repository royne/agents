-- 1. Renombrar la tabla para mayor claridad semántica
ALTER TABLE public.image_pro_templates RENAME TO visual_references;

-- 2. Añadir columnas de clasificación
ALTER TABLE public.visual_references ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'inspiration'; -- 'template' | 'inspiration'
ALTER TABLE public.visual_references ADD COLUMN IF NOT EXISTS base_category TEXT; -- 'landing-hero', 'landing-prices', 'ads-mockup', 'product-beauty'
ALTER TABLE public.visual_references ADD COLUMN IF NOT EXISTS prompt_hint TEXT;

-- 3. Asegurar que las políticas de RLS se mantengan (al renombrar se suelen mantener pero es bueno verificar)
-- Si las políticas no se migraron automáticamente:
/*
DROP POLICY IF EXISTS "Templates are viewable by everyone" ON public.visual_references;
CREATE POLICY "References are viewable by everyone" ON public.visual_references
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage templates" ON public.visual_references;
CREATE POLICY "Admins can manage references" ON public.visual_references
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );
*/

-- 4. Instrucción para crear el Bucket (Esto se hace generalmente desde el Dashboard de Supabase)
-- Nombre Sugerido: visual-references
-- Acceso: Público

/*
CREATE TABLE IF NOT EXISTS public.visual_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'inspiration',
    base_category TEXT,
    prompt_hint TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
*/