"use client";
import { useEffect, useRef, useState } from "react";
import { ConversationsApi } from "@/app/lib/conversationsApi";

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string };

type Props = {
  conversationId: string;
  messages: Msg[];
  setMessages: React.Dispatch<React.SetStateAction<Msg[]>>;
  nextCursor?: string;
  setNextCursor: React.Dispatch<React.SetStateAction<string | undefined>>;
  sending?: boolean;
};

export default function MessageList({ conversationId, messages, setMessages, nextCursor, setNextCursor, sending }: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const isPrependingRef = useRef(false);

  useEffect(() => {
    if (isPrependingRef.current) {
      isPrependingRef.current = false;
      return;
    }
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
      const mj = await api.listMessages(conversationId, nextCursor, 10);
      const olderAsc = [...mj.items].reverse();
      isPrependingRef.current = true;
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

  return (
    <div ref={listRef} onScroll={handleScroll} className="h-[60vh] sm:h-[65vh] md:h-[70vh] w-full overflow-y-auto rounded-lg border border-zinc-200 p-4">
      {messages.length === 0 && (
        <div className="text-sm text-zinc-600">Start the chat by typing below</div>
      )}
      <div className="flex flex-col gap-3">
        {messages.map(m => (
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
  );
}
