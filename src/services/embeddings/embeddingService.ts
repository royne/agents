import { OpenAIEmbeddings } from '@langchain/openai';
import { supabase } from '../../lib/supabase';
import { ScriptEmbedding } from '../../types/embeddings';
import { Database } from '../../types/database';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// Asegurarse de que la clave de API esté disponible
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
if (!apiKey) {
  console.error('Error: OPENAI_API_KEY no está definida en las variables de entorno');
}

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: apiKey,
  modelName: 'text-embedding-3-small'
});

export const embeddingService = {
  /**
   * Divide un texto en fragmentos más pequeños
   * @param text Texto a dividir
   * @returns Array de fragmentos de texto
   */
  async splitTextIntoChunks(text: string): Promise<string[]> {
    // Configurar el divisor de texto
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,       // Tamaño máximo de cada fragmento
      chunkOverlap: 200,     // Superposición entre fragmentos para mantener contexto
      separators: ['\n\n', '\n', '. ', ' ', ''],  // Separadores en orden de preferencia
    });
    
    // Dividir el texto en fragmentos
    const chunks = await textSplitter.splitText(text);
    return chunks;
  },
  
  /**
   * Crea embeddings para un contenido dividiéndolo en fragmentos y los guarda en la base de datos
   * @param content Texto para el cual generar los embeddings
   * @param metadata Metadatos adicionales para guardar con los embeddings
   * @returns Array de IDs de los embeddings creados
   */
  async createEmbedding(content: string, metadata: Record<string, any> = {}): Promise<string> {
    try {
      // Extraer título si existe en los metadatos o generar uno a partir del contenido
      const title = metadata.title || this.generateTitle(content);
      
      // Dividir el contenido en fragmentos
      const chunks = await this.splitTextIntoChunks(content);
      
      // Crear embeddings para cada fragmento
      const ids: string[] = [];
      
      // Agregar metadatos sobre el documento original y el fragmento
      const baseMetadata = {
        ...metadata,
        title: title,                // Título del documento
        description: this.generateDescription(content), // Descripción generada
        original_content: content,  // Contenido original completo
        total_chunks: chunks.length, // Número total de fragmentos
        created_at: new Date().toISOString() // Fecha de creación
      };
      
      // Procesar cada fragmento
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkMetadata = {
          ...baseMetadata,
          chunk_index: i,
          chunk_content: chunk,
          chunk_title: `${title} - Parte ${i+1}/${chunks.length}` // Título específico para el fragmento
        };
        
        // Generar embedding para el fragmento
        const embeddingVector = await embeddings.embedQuery(chunk);
        
        // Guardar en Supabase
        const { data, error } = await supabase
          .from('script_embeddings')
          .insert({
            content: chunk,
            embedding: embeddingVector,
            metadata: chunkMetadata
          })
          .select('id');
        
        if (error) throw error;
        if (!data || data.length === 0) throw new Error(`No se pudo crear el embedding para el fragmento ${i}`);
        
        ids.push(data[0].id);
      }
      
      // Devolver el ID del primer fragmento como referencia
      return ids[0];
    } catch (error) {
      console.error('Error al crear embeddings:', error);
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
      // Verificar si hay embeddings en la base de datos
      const { count, error: countError } = await supabase
        .from('script_embeddings')
        .select('id', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error al contar embeddings:', countError);
        return [];
      }
      
      if (!count || count === 0) {
        return [];
      }
      
      // Generar embedding para la consulta
      const queryEmbedding = await embeddings.embedQuery(query);
      
      // Buscar scripts similares usando la función RPC de Supabase
      const { data, error } = await supabase
        .rpc('match_scripts', {
          query_embedding: queryEmbedding,
          match_threshold: 0.2,
          match_count: limit
        }) as {
          data: ScriptEmbedding[] | null,
          error: any
        };
      
      if (error) {
        console.error('Error en RPC match_scripts:', error);
        throw error;
      }
      
      const results = data || [];
      
      if (results.length > 0) {
        console.log('Resultados:');
        results.forEach((script, index) => {
          console.log(`  ${index + 1}. Similitud: ${Math.round(script.similarity * 100)}%, ID: ${script.id.substring(0, 8)}...`);
        });
      } else {
        console.log('No se encontraron scripts similares');
      }
      
      return results;
    } catch (error) {
      console.error('Error al buscar scripts similares:', error);
      console.error(error);
      return [];
    }
  },
  
  /**
   * Elimina un embedding por su ID
   * @param id ID del embedding a eliminar
   * @returns true si se eliminó correctamente
   */
  /**
   * Genera un título a partir del contenido
   * @param content Contenido del texto
   * @returns Título generado
   */
  generateTitle(content: string): string {
    // Extraer la primera línea o frase significativa para usar como título
    const firstLine = content.split('\n')[0].trim();
    
    // Si la primera línea es muy larga, truncarla
    if (firstLine.length > 50) {
      return firstLine.substring(0, 47) + '...';
    }
    
    return firstLine || 'Documento sin título';
  },
  
  /**
   * Genera una descripción breve del contenido
   * @param content Contenido del texto
   * @returns Descripción generada
   */
  generateDescription(content: string): string {
    // Tomar los primeros 150 caracteres como descripción
    const description = content.substring(0, 200).trim();
    
    // Añadir puntos suspensivos si se trunca
    if (content.length > 200) {
      return description + '...';
    }
    
    return description;
  },
  
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