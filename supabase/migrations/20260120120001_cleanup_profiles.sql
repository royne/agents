-- Migración para limpiar tabla profiles de campos obsoletos
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS google_api_key,
DROP COLUMN IF EXISTS openai_api_key,
DROP COLUMN IF EXISTS groq_api_key;

-- Forzar recarga de esquema
NOTIFY pgrst, 'reload schema';
