import { listConversations } from '@/server/routes';
import ConversationItem from './ConversationItem';

export default async function HistoriesPage() {
  const { items } = await listConversations(100);
  return (
    <div className="mx-auto w-full max-w-3xl py-8">
      <h1 className="mb-4 text-xl font-semibold">Histories</h1>
      {items.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600">No conversations yet</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((c) => (
            <ConversationItem key={c.id} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
