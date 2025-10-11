// SCRIPT AGENT
import { basePayload } from './agent';
import type { Agent, Message } from '../../types/groq';
import { embeddingService } from '../../services/embeddings/embeddingService';
import { chatHistoryService } from '../../services/storage/chatHistory';

const AGENT_PROMPT = `
  # Description

  Samuel is an AI assistant specialized in digital marketing and impulse sales in eCommerce, with the mission of answering users' questions based on the context provided to him. This context works with a retrieval-augmented generation (RAG) system that feeds the conversation so that Samuel can generate accurate and relevant responses.

  ## Tasks

  When a user requests help, Samuel must:

  1. **Analyze the provided context** to understand the relevant information about digital marketing and impulse sales in eCommerce, especially in the Colombian market.
  2. **Respond to the user's questions** in a clear and understandable manner, using only the information from the context given to him, without inventing additional data.
  3. **Adopt a human and friendly tone** in his responses, so that users feel they are interacting with a real person.
  4. **Focus on the particularities of the Colombian market**, taking into account the trends, behaviors, and preferences of consumers in this region.
  5. **Be receptive to user feedback** and adjust his responses as necessary to improve the clarity and relevance of the information provided.

  Samuel is here to help and guide users in their inquiries about digital marketing and impulse sales in eCommerce, ensuring that each response is useful and aligned with the provided context.


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
    model: process.env.NEXT_PUBLIC_GROQ_MODEL || 'llama-3.3-70b-versatile',
    temperature: 0.5,
    max_tokens: 1024,
    stream: false
  }
};

/**
 * Enriquece los mensajes del usuario con contexto relevante utilizando RAG
 * @param messages Lista de mensajes de la conversación
 * @returns Lista de mensajes enriquecida con contexto relevante
 */
export async function enrichWithRAG(messages: Message[], openAIApiKey?: string): Promise<Message[]> {
  try {
    // Solo procesamos el último mensaje del usuario
    const lastUserMessageIndex = messages.findLastIndex(msg => msg.role === 'user');
    
    if (lastUserMessageIndex === -1) {
      // No se encontró ningún mensaje del usuario para enriquecer
      return messages;
    }
    
    const userQuery = messages[lastUserMessageIndex].content;

    
    // Buscar scripts similares
    const similarScripts = await embeddingService.searchSimilarScripts(userQuery, 5, openAIApiKey);
    
    if (similarScripts.length === 0) {

      return messages;
    }
    
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
    
    // Intentar reducir nuevamente el contexto tras insertar el bloque RAG
    try {
      const systemMsg = messages[0];
      if (systemMsg && systemMsg.role === 'system') {
        const reduced = chatHistoryService.reduceContextIfNeeded(enrichedMessages as any, systemMsg as any);
        return reduced as any;
      }
    } catch (e) {
      console.warn('[RAG] No se pudo reducir el contexto post-enriquecimiento:', e);
    }

    return enrichedMessages;
  } catch (error) {
    console.error('Error al enriquecer mensajes con RAG:', error);
    // En caso de error, devolvemos los mensajes originales sin modificar
    return messages;
  }
}