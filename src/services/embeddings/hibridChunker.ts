import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

/**
 * Chunker híbrido: primero divide por secciones, luego corta por tokens si hace falta.
 * @param content Texto completo a procesar
 * @param maxTokens Máximo de tokens por chunk (por defecto: 600)
 * @param overlap Tokens de superposición entre chunks (por defecto: 150)
 * @returns Array de chunks autocontenidos
 */
export async function hybridChunkText(
  content: string,
  maxTokens = 600,
  overlap = 150
): Promise<string[]> {
  const sections = splitByHeadings(content);
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: maxTokens,
    chunkOverlap: overlap,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  });

  const allChunks: string[] = [];

  for (const section of sections) {
    if (section.tokenCount > maxTokens) {
      const subChunks = await splitter.splitText(section.fullText);
      allChunks.push(...subChunks);
    } else {
      allChunks.push(section.fullText.trim());
    }
  }

  return allChunks;
}

/**
 * Divide el contenido por encabezados (títulos en mayúscula o estilo markdown)
 */
function splitByHeadings(content: string): { fullText: string; tokenCount: number }[] {
  const sectionRegex = /(?=^([A-Z][^\n]{5,}?)$|^#{1,3} .+)/gm;
  const matches = [...content.matchAll(sectionRegex)].map((m) => m.index || 0);

  const sections: { fullText: string; tokenCount: number }[] = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i];
    const end = matches[i + 1] || content.length;
    const chunk = content.slice(start, end).trim();
    const tokenCount = estimateTokenCount(chunk);
    sections.push({ fullText: chunk, tokenCount });
  }

  return sections;
}

/**
 * Estimación simple de tokens (usa espacios como aproximación: 1 token ≈ 0.75 palabras)
 */
function estimateTokenCount(text: string): number {
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / 0.75);
}
