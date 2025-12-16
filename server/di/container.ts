import { openRouterClient } from '@/server/clients/openrouter';
import { conversationsRepository } from '@/server/repositories/conversations';
import { messagesRepository } from '@/server/repositories/messages';
import { chunksRepository } from '@/server/repositories/chunks';
import { documentsRepository } from '@/server/repositories/documents';
import { ConversationsService } from '@/server/services/conversations';
import { DocumentsService } from '@/server/services/documents';

const conversationsService = new ConversationsService(conversationsRepository, messagesRepository, openRouterClient);
const documentsService = new DocumentsService(documentsRepository, chunksRepository, openRouterClient);

export const services = { conversations: conversationsService, documents: documentsService };
export { conversationsService, documentsService };
