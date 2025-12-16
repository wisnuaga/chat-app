"use client";
import { useEffect, useRef, useState } from 'react';

type Msg = { id: string; role: 'user' | 'assistant' | 'system'; content: string };

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      setConversationId(id);
      const m = await fetch(`/api/v1/conversations/${id}/messages`);
      const mj = await m.json();
      setMessages(mj.items);
    };
    init();
  }, [params]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!conversationId || !input.trim() || sending) return;
    setSending(true);
    setMessages(prev => [...prev, { id: Math.random().toString(), role: 'user', content: input }]);
    const res = await fetch(`/api/v1/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: input })
    });
    setInput('');
    await res.json().catch(() => null);
    const m = await fetch(`/api/v1/conversations/${conversationId}/messages`);
    const mj = await m.json();
    setMessages(mj.items);
    setSending(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col gap-4 py-8 px-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">Chat</div>
        </div>
        <div ref={listRef} className="flex-1 overflow-y-auto rounded-lg border border-zinc-200 p-4">
          {messages.length === 0 && (
            <div className="text-sm text-zinc-600">Start the chat by typing below</div>
          )}
          <div className="flex flex-col gap-3">
            {messages.map(m => (
              <div key={m.id} className={m.role === 'user' ? 'self-end max-w-[80%] rounded-2xl bg-zinc-900 text-white px-4 py-2' : 'self-start max-w-[80%] rounded-2xl bg-zinc-100 px-4 py-2'}>
                {m.content}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send(); }}
            placeholder="Type a message"
            className="flex-1 rounded-full border border-zinc-300 px-4 py-3 outline-none"
          />
          <button onClick={send} disabled={sending || !input.trim()} className="rounded-full bg-black px-4 py-3 text-white disabled:opacity-50">
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
