import type { ChatMessage, OpenRouterClient } from '@/server/clients/openrouter';

class ClientImpl implements OpenRouterClient {
  async chatCompletion(messages: ChatMessage[], model = 'openrouter/auto') {
    const key = process.env.OPENROUTER_KEY || process.env.OPENROUTER_API_KEY;
    if (!key) {
      return { content: 'OpenRouter API key not set', raw: null };
    }
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ model, messages })
    });
    if (!res.ok) {
      return { content: `Error ${res.status}`, raw: null };
    }
    const json = await res.json();
    const choice = json.choices?.[0]?.message?.content ?? '';
    return { content: choice, raw: json };
  }
  async embedText(input: string, model = 'text-embedding-3-small') {
    const key = process.env.OPENROUTER_KEY || process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error('OpenRouter API key not set');
    const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ model, input })
    });
    if (!res.ok) throw new Error(`Embeddings error: ${res.status}`);
    const json = await res.json();
    return json.data?.[0]?.embedding as number[];
  }
}

export const openRouterClient = new ClientImpl();
