import { services } from '@/server/di/container';

export class DocumentsController {
  async ingestText(title: string, text: string) {
    return services.documents.ingestText(title, text);
  }
}

export const documentsController = new DocumentsController();
