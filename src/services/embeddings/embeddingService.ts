import { OpenAIEmbeddings } from '@langchain/openai';
import { supabase } from '../../lib/supabase';
import { ScriptEmbedding } from '../../types/embeddings';
import { Database } from '../../types/database';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-3-small'
});

export const embeddingService = {
  /**
   * Crea un embedding para un contenido y lo guarda en la base de datos
   * @param content Texto para el cual generar el embedding
   * @param metadata Metadatos adicionales para guardar con el embedding
   * @returns ID del embedding creado
   */
  async createEmbedding(content: string, metadata: Record<string, any> = {}): Promise<string> {
    try {
      // Generar embedding
      const embeddingVector = await embeddings.embedQuery(content);
      
      // Guardar en Supabase
      const { data, error } = await supabase
        .from('script_embeddings')
        .insert({
          content,
          embedding: embeddingVector,
          metadata
        })
        .select('id');
      
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No se pudo crear el embedding');
      
      return data[0].id;
    } catch (error) {
      console.error('Error al crear embedding:', error);
      throw error;
    }
  },
  
  /**
   * Busca scripts similares basados en una consulta
   * @param query Consulta para buscar scripts similares
   * @param limit Número máximo de resultados a devolver
   * @returns Array de scripts similares con su contenido y similitud
   */
  async searchSimilarScripts(query: string, limit: number = 5): Promise<ScriptEmbedding[]> {
    try {
      // Generar embedding para la consulta
      const queryEmbedding = await embeddings.embedQuery(query);
      
      // Buscar scripts similares usando la función RPC de Supabase
      const { data, error } = await supabase
        .rpc('match_scripts', {
          query_embedding: queryEmbedding,
          match_threshold: 0.7,
          match_count: limit
        }) as {
          data: ScriptEmbedding[] | null,
          error: any
        };
      
      if (error) {
        console.error('Error en RPC match_scripts:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error al buscar scripts similares:', error);
      return [];
    }
  },
  
  /**
   * Elimina un embedding por su ID
   * @param id ID del embedding a eliminar
   * @returns true si se eliminó correctamente
   */
  async deleteEmbedding(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('script_embeddings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar embedding:', error);
      return false;
    }
  }
};