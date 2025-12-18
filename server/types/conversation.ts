export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type ConversationListResponse = {
  items: Conversation[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};
