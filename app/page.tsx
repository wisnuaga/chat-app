"use client";
import { useEffect, useRef, useState } from "react";
import { ConversationsApi } from '@/app/lib/conversationsApi';

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string };

export default function Home() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Do not create a conversation until the first message is sent
  }, []);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleScroll = async () => {
    const el = listRef.current;
    if (!el || loadingMore || !nextCursor || !conversationId) return;
    const nearTop = el.scrollTop <= 50;
    if (nearTop) {
      setLoadingMore(true);
      const prevHeight = el.scrollHeight;
      const api = new ConversationsApi();
      const mj = await api.listMessages(conversationId!, nextCursor, 10);
      const olderAsc = [...mj.items].reverse();
      setNextCursor(mj.nextCursor);
      setMessages(prev => {
        const merged = [...olderAsc, ...prev];
        const seen = new Set<string>();
        return merged.filter(m => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
      });
      setTimeout(() => {
        if (listRef.current) {
          const newHeight = listRef.current.scrollHeight;
          listRef.current.scrollTop = listRef.current.scrollTop + (newHeight - prevHeight);
        }
        setLoadingMore(false);
      }, 0);
    }
  };

  const send = async () => {
    if (!input.trim() || sending) return;
    let convId = conversationId;
    if (!convId) {
      const api = new ConversationsApi();
      const cj = await api.create();
      convId = cj.conversationId as string;
      setConversationId(convId);
    }
    setSending(true);
    setMessages((prev) => [...prev, { id: Math.random().toString(), role: "user", content: input }]);
    const api = new ConversationsApi();
    await api.sendMessage(convId!, input);
    setInput("");
    const mj = await api.listMessages(convId!, undefined, 10);
    setMessages([...mj.items].reverse());
    setNextCursor(mj.nextCursor);
    setSending(false);
  };

  const upload = async () => {
    if (!uploadFile || uploading) return;
    setUploading(true);
    setUploadStatus(null);
    const fd = new FormData();
    fd.append("file", uploadFile);
    if (uploadTitle.trim()) fd.append("title", uploadTitle.trim());
    const res = await fetch("/api/v1/documents", { method: "POST", body: fd });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      setUploadStatus(`Error ${res.status}${txt ? ": " + txt : ""}`);
    } else {
      const json = await res.json();
      setUploadStatus(`Uploaded: ${json.title} (${json.chunkCount} chunks)`);
      setUploadFile(null);
      setUploadTitle("");
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
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
              <div className="mb-3 text-lg font-semibold">Upload Document</div>
              <div className="mb-3">
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              </div>
              <div className="mb-3">
                <input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="w-full rounded-md border border-zinc-300 px-2 py-2 text-sm outline-none"
                />
              </div>
              {uploadStatus && <div className="mb-3 text-xs text-zinc-600">{uploadStatus}</div>}
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setShowUpload(false)} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">Cancel</button>
                <button onClick={upload} disabled={uploading || !uploadFile} className="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-50">{uploading ? "Uploading..." : "Upload"}</button>
              </div>
            </div>
          </div>
        )}
        <div ref={listRef} onScroll={handleScroll} className="h-[60vh] sm:h-[65vh] md:h-[70vh] w-full overflow-y-auto rounded-lg border border-zinc-200 p-4">
          {messages.length === 0 && (
            <div className="text-sm text-zinc-600">Start the chat by typing below</div>
          )}
          <div className="flex flex-col gap-3">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "self-end max-w-[80%] rounded-2xl bg-zinc-900 text-white px-4 py-2" : "self-start max-w-[80%] rounded-2xl bg-zinc-100 px-4 py-2"}>
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="self-start max-w-[80%] rounded-2xl bg-zinc-100 px-4 py-2 text-zinc-600">Typing...</div>
            )}
            {loadingMore && (
              <div className="self-center rounded-md bg-zinc-100 px-3 py-1 text-xs text-zinc-600">Loading more...</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 hover:bg-zinc-50"
            aria-label="Upload"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16V4M12 4L7 9M12 4L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 20H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Type a message"
            className="flex-1 rounded-full border border-zinc-300 px-4 py-3 outline-none"
          />
          <button
            onClick={send}
            disabled={sending || !input.trim()}
            className="rounded-full bg-black px-4 py-3 text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
