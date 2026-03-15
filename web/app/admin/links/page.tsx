"use client";

import { useEffect, useState } from "react";
import type { Profile, SocialLink } from "@/lib/types";
import LinkEditor from "@/components/admin/LinkEditor";

export default function LinksPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const p = await res.json();
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
  if (!profile) return <div className="text-center py-12 text-gray-500">プロフィールが見つかりません</div>;

  return (
    <div className="h-[calc(100vh-120px)] flex items-start justify-center pt-4 overflow-y-auto">
      <div className="w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">SNSリンク管理</h2>
        <LinkEditor profileId={profile.id} links={links} onUpdate={setLinks} />
      </div>
    </div>
  );
}
