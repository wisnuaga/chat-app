import { ClientImpl } from '@/server/infra/clients/openrouter';
import { ConversationsImpl } from '@/server/infra/repositories/conversations';
import { MessagesImpl } from '@/server/infra/repositories/messages';
import { ChunksImpl } from '@/server/infra/repositories/chunks';
import { DocumentsImpl } from '@/server/infra/repositories/documents';
import { ConversationsService } from '@/server/services/conversations';
import { DocumentsService } from '@/server/services/documents';

const openRouterClient = new ClientImpl();
const documentsRepository = new DocumentsImpl();
const chunksRepository = new ChunksImpl();
const messagesRepository = new MessagesImpl();
const conversationsRepository = new ConversationsImpl();

const documentsService = new DocumentsService(documentsRepository, chunksRepository, openRouterClient);
const conversationsService = new ConversationsService(conversationsRepository, messagesRepository, openRouterClient, documentsService, chunksRepository);

export const services = { conversations: conversationsService, documents: documentsService };
export { conversationsService, documentsService };
