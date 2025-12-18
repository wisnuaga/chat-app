export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { listConversations } from '@/server/routes';
import ConversationItem from './ConversationItem';

export default async function HistoriesPage({ searchParams }: { searchParams: Promise<{ offset?: string; limit?: string }> }) {
  const sp = await searchParams;
  const parsedLimit = Number.parseInt(sp.limit ?? '10', 10);
  const parsedOffset = Number.parseInt(sp.offset ?? '0', 10);
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 10;
  const offset = Number.isFinite(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
  const { items, meta } = await listConversations(limit, offset);
  const start = meta.total === 0 ? 0 : meta.offset + 1;
  const end = meta.offset + items.length;
  const prevOffset = Math.max(0, meta.offset - meta.limit);
  const nextOffset = meta.offset + meta.limit;
  const hasPrev = meta.offset > 0;
  const hasNext = nextOffset < meta.total;
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
      <div className="mt-4 flex items-center justify-between text-sm text-zinc-700">
        <div>
          Showing {start}-{end} of {meta.total}
        </div>
        <div className="flex items-center gap-2">
          <Link
            aria-disabled={!hasPrev}
            className={hasPrev ? 'rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-100' : 'cursor-not-allowed rounded-md border border-zinc-200 px-3 py-1 text-zinc-400'}
            href={`/histories?offset=${prevOffset}&limit=${meta.limit}`}
            prefetch={false}
          >
            Prev
          </Link>
          <Link
            aria-disabled={!hasNext}
            className={hasNext ? 'rounded-md border border-zinc-300 px-3 py-1 hover:bg-zinc-100' : 'cursor-not-allowed rounded-md border border-zinc-200 px-3 py-1 text-zinc-400'}
            href={`/histories?offset=${hasNext ? nextOffset : meta.offset}&limit=${meta.limit}`}
            prefetch={false}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
