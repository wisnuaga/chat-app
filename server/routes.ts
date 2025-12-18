import { conversationsController } from '@/server/controllers/conversations';
import { documentsController } from '@/server/controllers/documents';
import type { ConversationListResponse } from '@/server/types/conversation';
import type { MessagesListResponse } from '@/server/types/message';

const MAX_LIMIT = 20;

export async function listConversations(limit: number, offset: number): Promise<ConversationListResponse> {
  // validation
  limit = Math.max(Math.min(limit, MAX_LIMIT), 0);
  offset = Math.max(offset, 0);

  return conversationsController.list(limit, offset);
}

export async function createConversation(title?: string) {
  return conversationsController.create(title);
}

export async function listConversationMessages(conversationId: string, limit = 100): Promise<MessagesListResponse> {
  return conversationsController.listMessages(conversationId, limit);
}

export async function sendMessage(conversationId: string, content: string) {
  return conversationsController.sendMessage(conversationId, content);
}

export async function ingestTextDocument(title: string, text: string) {
  return documentsController.ingestText(title, text);
}

export async function restoreConversation(id: string) {
  return conversationsController.restore(id);
}

export async function renameConversation(id: string, title?: string) {
  return conversationsController.rename(id, title);
}

export async function removeConversation(id: string) {
  return conversationsController.remove(id);
}
