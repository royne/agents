-- Habilitar la extensión vector para poder trabajar con embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Crear tabla para almacenar los embeddings de scripts
CREATE TABLE IF NOT EXISTS script_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- Dimensión para text-embedding-3-small
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsqueda por similitud
CREATE INDEX IF NOT EXISTS script_embeddings_embedding_idx ON script_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Función para buscar scripts similares basados en un embedding de consulta
CREATE OR REPLACE FUNCTION match_scripts(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    script_embeddings.id,
    script_embeddings.content,
    1 - (script_embeddings.embedding <=> query_embedding) AS similarity,
    script_embeddings.metadata,
    script_embeddings.created_at
  FROM script_embeddings
  WHERE 1 - (script_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Comentarios sobre la implementación:
-- 1. El operador <=> calcula la distancia coseno entre dos vectores
-- 2. La similitud coseno es 1 - distancia coseno
-- 3. Filtramos resultados con similitud mayor al umbral especificado
-- 4. Ordenamos por similitud descendente
-- 5. Limitamos el número de resultados según el parámetro match_count
