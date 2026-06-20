export type AIModelTier = "fast" | "primary" | "embedding";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  tier?: AIModelTier;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
}

export interface AICompletionResult {
  content: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export interface AIEmbeddingResult {
  embedding: number[];
  model: string;
}

export interface AIProvider {
  complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResult>;
  embed(text: string): Promise<AIEmbeddingResult>;
  isAvailable(): boolean;
}

export interface CachedAIRecord {
  id: string;
  user_id: string;
  json_result: Record<string, unknown>;
  model_used: string;
  created_at: string;
  updated_at: string;
}
