export enum DocumentType {
  Internal = 1,
  UserInput = 2,
}

export type Document = {
  id: string;
  title: string;
  type: DocumentType;
  createdAt: number;
  updatedAt: number;
};
