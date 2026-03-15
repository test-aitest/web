"use client";

import { useEffect, useState } from "react";
import type { Profile, SocialLink } from "@/lib/types";
import LivePreview from "@/components/admin/LivePreview";
import Link from "next/link";

export default function AdminDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const p = await profileRes.json();
        if (p && !p.error) {
          setProfile(p);
          const linksRes = await fetch(`/api/links?profile_id=${p.id}`);
          if (linksRes.ok) setLinks(await linksRes.json());
        }
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">読み込み中...</div>;

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-2">ようこそ CardLink へ!</h2>
        <p className="text-gray-500 mb-6">まずプロフィールを作成しましょう</p>
        <CreateProfileButton onCreated={setProfile} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 max-w-5xl mx-auto">
      {/* Left: Preview */}
      <div className="flex-1 flex items-center justify-center">
        <LivePreview profile={profile} links={links} />
      </div>

      {/* Right: Quick actions */}
      <div className="w-[380px] flex flex-col gap-4 justify-center">
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="リンク数" value={links.length} />
          <StatCard label="表示中" value={links.filter((l) => l.is_visible).length} />
        </div>
        <QuickLink href="/admin/edit" label="プロフィール編集" desc="名前、肩書き、自己紹介" />
        <QuickLink href="/admin/links" label="リンク管理" desc="SNSリンクの追加・編集" />
        <QuickLink href="/admin/design" label="デザイン変更" desc="テンプレート・カラー" />
        <Link href="/profile" target="_blank" className="text-center text-sm text-blue-600 hover:underline mt-2">
          公開ページを見る →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function QuickLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link href={href} className="block bg-white rounded-lg border border-gray-200 p-3.5 hover:border-blue-400 transition-colors">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </Link>
  );
}

function CreateProfileButton({ onCreated }: { onCreated: (p: Profile) => void }) {
  const [creating, setCreating] = useState(false);

  const create = async () => {
    setCreating(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Your Name" }),
    });
    if (res.ok) onCreated(await res.json());
    setCreating(false);
  };

  return (
    <button onClick={create} disabled={creating} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
      {creating ? "作成中..." : "プロフィールを作成"}
    </button>
  );
}
