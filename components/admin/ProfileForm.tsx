"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import ImageUploader from "./ImageUploader";

interface Props {
  profile: Profile;
  onSave: (profile: Profile) => void;
}

export default function ProfileForm({ profile, onSave }: Props) {
  const [form, setForm] = useState({
    name: profile.name,
    title: profile.title || "",
    bio: profile.bio || "",
    avatar_url: profile.avatar_url || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id, ...form }),
    });

    if (res.ok) {
      const updated = await res.json();
      onSave(updated);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ImageUploader
        currentUrl={form.avatar_url}
        onUpload={(url) => setForm({ ...form, avatar_url: url })}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">名前 *</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">肩書き</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="例: Software Engineer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="あなたについて..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
