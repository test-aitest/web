"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Props {
  currentUrl: string;
  onUpload: (url: string) => void;
}

export default function ImageUploader({ currentUrl, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const { url } = await res.json();
      onUpload(url);
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onClick={() => fileRef.current?.click()}
        className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden"
      >
        {currentUrl ? (
          <Image src={currentUrl} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-xs text-center">画像を<br />アップロード</span>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      {uploading && <p className="text-sm text-gray-500">アップロード中...</p>}
    </div>
  );
}
