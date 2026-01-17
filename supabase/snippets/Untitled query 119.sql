-- Asegurar que el bucket existe y es público
INSERT INTO storage.buckets (id, name, public)
VALUES ('visual-references', 'visual-references', true)
ON CONFLICT (id) DO NOTHING;
-- Permitir acceso público de lectura a los objetos del bucket
CREATE POLICY "Acceso Público Visual References"
ON storage.objects FOR SELECT
USING ( bucket_id = 'visual-references' );
-- Permitir a los superadmin subir archivos
CREATE POLICY "Admins pueden subir referencias"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'visual-references' AND
    (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid() AND profiles.role = 'superadmin'
    ))
);
-- Permitir a los superadmin borrar archivos
CREATE POLICY "Admins pueden borrar referencias"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'visual-references' AND
    (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid() AND profiles.role = 'superadmin'
    ))
);