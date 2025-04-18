export interface ScriptEmbedding {
  id: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
  created_at: string;
}
