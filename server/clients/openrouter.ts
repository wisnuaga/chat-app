export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export interface OpenRouterClient {
  chatCompletion(messages: ChatMessage[], model?: string): Promise<{ content: string; raw: unknown }>;
  embedText(input: string, model?: string): Promise<number[]>;
}

import { openRouterClient as defaultOpenRouterClient } from '@/server/infra/clients/openrouter';

export const openRouterClient: OpenRouterClient = defaultOpenRouterClient;

export async function chatCompletion(messages: ChatMessage[], model = 'openrouter/auto') {
  return openRouterClient.chatCompletion(messages, model);
}

export async function embedText(input: string, model = 'text-embedding-3-small') {
  return openRouterClient.embedText(input, model);
}
