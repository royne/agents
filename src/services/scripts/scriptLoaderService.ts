import { embeddingService } from '../embeddings/embeddingService';

export const scriptLoaderService = {
  async loadScripts(scripts: string[], metadata: any = {}) {
    const results = [];
    
    for (const script of scripts) {
      try {
        const id = await embeddingService.createEmbedding(script, metadata);
        results.push({ id, success: true });
      } catch (error) {
        console.error('Error al cargar script:', error);
        results.push({ script: script.substring(0, 50) + '...', success: false, error });
      }
    }
    
    return results;
  }
};