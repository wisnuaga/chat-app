"use client";
import React from "react";

type Props = {
  value: string;
  sending: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
  onShowUpload: () => void;
};

export default function ChatComposer({ value, sending, onChange, onSend, onShowUpload }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onShowUpload} className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 hover:bg-zinc-50" aria-label="Upload">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16V4M12 4L7 9M12 4L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 20H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSend(); }}
        placeholder="Type a message"
        className="flex-1 rounded-full border border-zinc-300 px-4 py-3 outline-none"
      />
      <button onClick={onSend} disabled={sending || !value.trim()} className="rounded-full bg-black px-4 py-3 text-white disabled:opacity-50">
        Send
      </button>
    </div>
  );
}

