export type MessageRole = 'user' | 'assistant' | 'system';

export type Message = {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export type MessagesListResponse = {
  items: Message[];
  nextCursor?: string;
};
