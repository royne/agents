// SCRIPT AGENT
import { basePayload } from './agent';
import type { Agent, Message } from '../../types/groq';
import { embeddingService } from '../../services/embeddings/embeddingService';

const AGENT_PROMPT = `
  # Description
  
  responde con el contexto que se te pasa, si no sabes reponde soy un robot loco y aun estoy trabajando lol 
  ## Special Considerations
  
  - Always respond in Spanish.
`;

export const scriptAgent: Agent = {
  systemPrompt: {
    role: "system",
    content: AGENT_PROMPT
  },
  basePayload: {
    ...basePayload,
    model: 'deepseek-r1-distill-llama-70b',
    temperature: 0.5,
    max_tokens: 1024,
    stream: false,
    reasoning_format: "hidden"
  }
};

/**
 * Enriquece los mensajes del usuario con contexto relevante utilizando RAG
 * @param messages Lista de mensajes de la conversación
 * @returns Lista de mensajes enriquecida con contexto relevante
 */
export async function enrichWithRAG(messages: Message[]): Promise<Message[]> {
  try {
    // Solo procesamos el último mensaje del usuario
    const lastUserMessageIndex = messages.findLastIndex(msg => msg.role === 'user');
    
    if (lastUserMessageIndex === -1) {
      console.log('No se encontró ningún mensaje del usuario para enriquecer');
      return messages;
    }
    
    const userQuery = messages[lastUserMessageIndex].content;
    console.log(`Buscando scripts similares para la consulta: "${userQuery.substring(0, 50)}..."`);
    
    // Buscar scripts similares
    const similarScripts = await embeddingService.searchSimilarScripts(userQuery);
    
    if (similarScripts.length === 0) {
      console.log('No se encontraron scripts similares');
      return messages;
    }
    
    console.log(`Se encontraron ${similarScripts.length} scripts similares`);
    
    // Ordenar por similitud (de mayor a menor)
    const sortedScripts = [...similarScripts].sort((a, b) => b.similarity - a.similarity);
    
    // Crear contexto con los scripts similares
    const context = `
## Contexto adicional (scripts similares relevantes):

${sortedScripts.map((script, index) => {
  // Incluir el índice, contenido y puntuación de similitud
  return `### Script ${index + 1} (Similitud: ${Math.round(script.similarity * 100)}%)
${script.content}`;
}).join('\n\n')}

Por favor, utiliza estos ejemplos como referencia para generar una respuesta que siga un estilo y estructura similar, adaptada a la solicitud del usuario.
`;
    
    // Crear una copia de los mensajes
    const enrichedMessages = [...messages];
    
    // Añadir un mensaje de sistema con el contexto antes del último mensaje del usuario
    enrichedMessages.splice(lastUserMessageIndex, 0, {
      role: 'system',
      content: context
    });
    
    console.log('Mensajes enriquecidos con RAG correctamente', enrichedMessages);
    return enrichedMessages;
  } catch (error) {
    console.error('Error al enriquecer mensajes con RAG:', error);
    // En caso de error, devolvemos los mensajes originales sin modificar
    return messages;
  }
}