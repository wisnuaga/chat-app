"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Conversation = { id: string; title?: string | null; createdAt: number };

export default function ConversationItem({ c }: { c: Conversation }) {
  const router = useRouter();
  const open = () => router.push(`/conversations/${c.id}`);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(c.title || '');
  const rename = async () => {
    const res = await fetch(`/api/v1/conversations/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: title })
    });
    await res.json().catch(() => null);
    setShowModal(false);
    router.refresh();
  };
  const remove = async () => {
    if (!confirm('Delete this conversation?')) return;
    const res = await fetch(`/api/v1/conversations/${c.id}`, { method: 'DELETE' });
    await res.json().catch(() => null);
    router.refresh();
  };
  return (
    <li onClick={open} className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-200 p-3 hover:bg-zinc-50">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{c.title || 'Untitled'}</span>
        <span className="text-xs text-zinc-600">{new Date(c.createdAt).toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <button aria-label="Edit" onClick={() => setShowModal(true)} className="rounded-md border border-zinc-300 p-1 text-xs hover:bg-zinc-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" fill="currentColor"/>
            <path d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
          </svg>
        </button>
        <button aria-label="Delete" onClick={remove} className="rounded-md border border-zinc-300 p-1 text-xs hover:bg-zinc-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 7h12M9 7V5h6v2m-8 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7H7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-sm rounded-lg bg-white p-4" onClick={e => e.stopPropagation()}>
            <div className="mb-2 text-sm font-medium">Rename Conversation</div>
            <input value={title} onChange={e => setTitle(e.target.value)} className="mb-3 w-full rounded-md border border-zinc-300 px-2 py-2 text-sm outline-none" />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="rounded-md border border-zinc-300 px-3 py-1 text-sm">Cancel</button>
              <button onClick={rename} className="rounded-md bg-black px-3 py-1 text-sm text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
