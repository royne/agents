-- Añadir columna operation_name a image_generations para LRO
ALTER TABLE image_generations ADD COLUMN IF NOT EXISTS operation_name TEXT;
CREATE INDEX IF NOT EXISTS idx_image_generations_operation_name ON image_generations(operation_name);
