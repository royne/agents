-- Migración para agregar soporte al Agente Pro de Imágenes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS google_api_key TEXT,
ADD COLUMN IF NOT EXISTS image_gen_count INTEGER DEFAULT 0;

-- Comentario para documentación
COMMENT ON COLUMN profiles.google_api_key IS 'API Key de Google AI Studio para el modelo Imagen 3 Pro';
COMMENT ON COLUMN profiles.image_gen_count IS 'Contador de imágenes generadas por el usuario';
