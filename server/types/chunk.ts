export type Chunk = {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  createdAt: number;
  updatedAt: number;
};
