export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export interface OpenRouterClient {
  chatCompletion(messages: ChatMessage[], model?: string): Promise<{ content: string; raw: unknown }>;
  embedText(input: string, model?: string): Promise<number[]>;
}
