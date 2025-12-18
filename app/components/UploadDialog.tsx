"use client";
import React from "react";

type Props = {
  show: boolean;
  uploading: boolean;
  uploadTitle: string;
  uploadFile: File | null;
  uploadStatus: string | null;
  onClose: () => void;
  onTitleChange: (v: string) => void;
  onFileChange: (f: File | null) => void;
  onUpload: () => void;
};

export default function UploadDialog({ show, uploading, uploadTitle, uploadFile, uploadStatus, onClose, onTitleChange, onFileChange, onUpload }: Props) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-3 text-lg font-semibold">Upload Document</div>
        <div className="mb-3">
          <input type="file" onChange={e => onFileChange(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>
        <div className="mb-3">
          <input value={uploadTitle} onChange={e => onTitleChange(e.target.value)} placeholder="Title (optional)" className="w-full rounded-md border border-zinc-300 px-2 py-2 text-sm outline-none" />
        </div>
        {uploadStatus && <div className="mb-3 text-xs text-zinc-600">{uploadStatus}</div>}
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-zinc-300 px-3 py-2 text-sm">Cancel</button>
          <button onClick={onUpload} disabled={uploading || !uploadFile} className="rounded-md bg-black px-3 py-2 text-sm text-white disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload'}</button>
        </div>
      </div>
    </div>
  );
}

