"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import ImageUploader from "@/components/admin/ImageUploader";

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", title: "", bio: "", avatar_url: "" });

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const p = await res.json();
        if (p && !p.error) {
          setProfile(p);
          setForm({ name: p.name, title: p.title || "", bio: p.bio || "", avatar_url: p.avatar_url || "" });
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id, ...form }),
    });
    if (res.ok) {
      setProfile(await res.json());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">読み込み中...</div>;
  if (!profile) return <div className="text-center py-12 text-gray-500">プロフィールが見つかりません</div>;

  return (
    <div className="h-[calc(100vh-120px)] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">プロフィール編集</h2>
        {saved && <div className="p-2 bg-green-50 text-green-700 rounded-lg text-sm">保存しました!</div>}

        <ImageUploader currentUrl={form.avatar_url} onUpload={(url) => setForm({ ...form, avatar_url: url })} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名前 *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">肩書き</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="例: Software Engineer" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">自己紹介</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" placeholder="あなたについて..." />
        </div>

        <button type="submit" disabled={saving}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {saving ? "保存中..." : "保存する"}
        </button>
      </form>
    </div>
  );
}
