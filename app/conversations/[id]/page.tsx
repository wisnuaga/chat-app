"use client";
import { useEffect, useState } from 'react';
import { ConversationsApi } from '@/app/lib/conversationsApi';
import MessageList from '@/app/components/MessageList';

type Msg = { id: string; role: 'user' | 'assistant' | 'system'; content: string };

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      setConversationId(id);
      const api = new ConversationsApi();
      const mj = await api.listMessages(id, undefined, 10);
      setMessages([...mj.items].reverse());
      setNextCursor(mj.nextCursor);
    };
    init();
  }, [params]);

  const send = async () => {
    if (!conversationId || !input.trim() || sending) return;
    setSending(true);
    setMessages(prev => [...prev, { id: Math.random().toString(), role: 'user', content: input }]);
    const api = new ConversationsApi();
    await api.sendMessage(conversationId, input);
    setInput('');
    const mj = await api.listMessages(conversationId, undefined, 10);
    setMessages([...mj.items].reverse());
    setNextCursor(mj.nextCursor);
    setSending(false);
  };

  const upload = async () => {
    if (!uploadFile || uploading) return;
    setUploading(true);
    setUploadStatus(null);
    const fd = new FormData();
    fd.append('file', uploadFile);
    if (uploadTitle.trim()) fd.append('title', uploadTitle.trim());
    const res = await fetch('/api/v1/documents', { method: 'POST', body: fd });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      setUploadStatus(`Error ${res.status}${txt ? ': ' + txt : ''}`);
    } else {
      const json = await res.json();
      setUploadStatus(`Uploaded: ${json.title} (${json.chunkCount} chunks)`);
      setUploadFile(null);
      setUploadTitle('');
      setShowUpload(false);
    }
    setUploading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col gap-4 py-8 px-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">Chat</div>
        </div>
        {conversationId && (
          <MessageList
            conversationId={conversationId}
            messages={messages}
            setMessages={setMessages}
            nextCursor={nextCursor}
            setNextCursor={setNextCursor}
            sending={sending}
          />
        )}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
              <div className="mb-3 text-lg font-semibold">Upload Document</div>
              <div className="mb-3">
                <input type="file" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="w-full text-sm" />
              </div>
              <div className="mb-3">
                <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Title (optional)" className="w-full rounded-md border border-zinc-300 px-2 py-2 text-sm outline-none" />
              </div>
              {uploadStatus && <div className="mb-3 text-xs text-zinc-600">{uploadStatus}</div>}
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setShowUpload(false)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">Cancel</button>
                <button onClick={upload} disabled={uploading || !uploadFile} className="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowUpload(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 hover:bg-zinc-50" aria-label="Upload">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V4M12 4L7 9M12 4L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 20H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
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
