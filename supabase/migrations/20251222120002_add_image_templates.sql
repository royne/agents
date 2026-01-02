-- Crear tabla para plantillas globales del Agente Pro de Imágenes
CREATE TABLE IF NOT EXISTS public.image_pro_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.image_pro_templates ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
-- Todos pueden leer las plantillas (para inspiración)
CREATE POLICY "Templates are viewable by everyone" ON public.image_pro_templates
    FOR SELECT USING (true);

-- Solo súper admins pueden insertar/actualizar/borrar
CREATE POLICY "Admins can manage templates" ON public.image_pro_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'superadmin'
        )
    );
