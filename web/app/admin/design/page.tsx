"use client";

import { useEffect, useState } from "react";
import type { Profile, SocialLink } from "@/lib/types";
import { getPlatform } from "@/lib/platforms";

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const templates = [
  {
    id: "prairie-dark",
    name: "Prairie Dark",
    bg: "#1a1a1a",
    text: "#ffffff",
    accent: "#3b82f6",
    gradient: null,
  },
  {
    id: "black-metal",
    name: "Black Metal",
    bg: "#0d0d0d",
    text: "#e0e0e0",
    accent: "#c0392b",
    gradient: null,
  },
  {
    id: "midnight",
    name: "Midnight",
    bg: "#0f172a",
    text: "#e2e8f0",
    accent: "#6366f1",
    gradient: null,
  },
  {
    id: "gradient-ocean",
    name: "Ocean",
    bg: "#0c1445",
    text: "#ffffff",
    accent: "#06b6d4",
    gradient: "linear-gradient(135deg, #0c1445 0%, #1e3a5f 50%, #0c4a6e 100%)",
  },
  {
    id: "gradient-sunset",
    name: "Sunset",
    bg: "#1a0a2e",
    text: "#fde68a",
    accent: "#f97316",
    gradient: "linear-gradient(135deg, #1a0a2e 0%, #4a1942 50%, #2d1b4e 100%)",
  },
  {
    id: "gradient-forest",
    name: "Forest",
    bg: "#0d1f0d",
    text: "#d4edda",
    accent: "#22c55e",
    gradient: "linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 50%, #0d2818 100%)",
  },
  {
    id: "warm",
    name: "Warm",
    bg: "#1c1410",
    text: "#f5e6d3",
    accent: "#f59e0b",
    gradient: null,
  },
  {
    id: "clean-light",
    name: "Light",
    bg: "#f8f9fa",
    text: "#1a1a1a",
    accent: "#3b82f6",
    gradient: null,
  },
  {
    id: "gradient-rose",
    name: "Rose",
    bg: "#1a0a14",
    text: "#fce7f3",
    accent: "#ec4899",
    gradient: "linear-gradient(135deg, #1a0a14 0%, #3b1029 50%, #1a0a20 100%)",
  },
];

export default function DesignPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [styles, setStyles] = useState({
    bg_color: "#1a1a1a",
    text_color: "#ffffff",
    accent_color: "#3b82f6",
  });
  const [gradient, setGradient] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const p = await res.json();
        if (p && !p.error) {
          setProfile(p);
          setStyles(p.custom_styles);
          if (p.custom_styles.gradient) setGradient(p.custom_styles.gradient);
          const linksRes = await fetch(`/api/links?profile_id=${p.id}`);
          if (linksRes.ok) setLinks(await linksRes.json());
        }
      }
      setLoading(false);
    })();
  }, []);

  const applyTemplate = (t: (typeof templates)[0]) => {
    setSelectedTemplate(t.id);
    setStyles({ bg_color: t.bg, text_color: t.text, accent_color: t.accent });
    setGradient(t.gradient);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id, custom_styles: { ...styles, gradient }, template_id: selectedTemplate }),
    });
    if (res.ok) {
      const updated = await res.json();
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">読み込み中...</div>;
  if (!profile) return <div className="text-center py-12 text-gray-500">プロフィールが見つかりません</div>;

  const visibleLinks = links.filter((l) => l.is_visible).sort((a, b) => a.sort_order - b.sort_order);
  const cardBg = gradient || styles.bg_color;

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      {/* Left: Live Preview */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Card */}
        <div
          className="w-full max-w-[480px] relative overflow-hidden rounded-xl"
          style={{
            aspectRatio: "1.75 / 1",
            background: gradient || styles.bg_color,
            boxShadow: `0 1px 0 ${lighten(styles.bg_color, 8)}44, 0 20px 40px rgba(0,0,0,0.4)`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent 10%, ${lighten(styles.bg_color, 20)}40 50%, transparent 90%)` }}
          />
          <div className="h-full flex flex-col justify-between p-6">
            <div className="flex items-center gap-3">
              {profile.avatar_url && (
                <div className="w-9 h-9 rounded-full overflow-hidden" style={{ border: `1px solid ${lighten(styles.bg_color, 18)}60` }}>
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <p className="text-sm font-semibold tracking-wide" style={{ color: styles.text_color }}>{profile.name}</p>
                {profile.title && (
                  <p className="text-[8px] tracking-[0.15em] uppercase" style={{ color: `${styles.text_color}55` }}>{profile.title}</p>
                )}
              </div>
            </div>
            <div>
              {profile.bio && (
                <p className="text-[9px] leading-relaxed mb-2" style={{ color: `${styles.text_color}66` }}>{profile.bio}</p>
              )}
              <div className="flex gap-2">
                {visibleLinks.map((link) => {
                  const platform = getPlatform(link.platform);
                  if (!platform) return null;
                  const Icon = platform.icon;
                  return <Icon key={link.id} className="text-[11px]" style={{ color: `${styles.accent_color}90` }} />;
                })}
              </div>
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent 10%, ${lighten(styles.bg_color, 10)}20 50%, transparent 90%)` }}
          />
        </div>
        <p className="text-gray-500 text-xs mt-4">リアルタイムプレビュー</p>
      </div>

      {/* Right: Settings */}
      <div className="w-[380px] flex flex-col gap-4 justify-center">
        {/* Templates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">テンプレート</label>
          <div className="grid grid-cols-3 gap-1.5">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className={`p-2.5 rounded-lg border transition-all text-left ${selectedTemplate === t.id ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200 hover:border-gray-400"}`}
              >
                <div
                  className="w-full h-7 rounded mb-1.5"
                  style={{ background: t.gradient || t.bg }}
                />
                <p className="text-xs text-gray-600 truncate">{t.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">カラー設定</label>

          <div className="flex items-center gap-2">
            <input type="color" value={styles.bg_color} onChange={(e) => { setStyles({ ...styles, bg_color: e.target.value }); setGradient(null); }} className="w-8 h-8 rounded cursor-pointer border-0" />
            <input type="text" value={styles.bg_color} onChange={(e) => { setStyles({ ...styles, bg_color: e.target.value }); setGradient(null); }} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono" />
            <span className="text-xs text-gray-400 w-16">背景</span>
          </div>

          <div className="flex items-center gap-2">
            <input type="color" value={styles.text_color} onChange={(e) => setStyles({ ...styles, text_color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0" />
            <input type="text" value={styles.text_color} onChange={(e) => setStyles({ ...styles, text_color: e.target.value })} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono" />
            <span className="text-xs text-gray-400 w-16">テキスト</span>
          </div>

          <div className="flex items-center gap-2">
            <input type="color" value={styles.accent_color} onChange={(e) => setStyles({ ...styles, accent_color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0" />
            <input type="text" value={styles.accent_color} onChange={(e) => setStyles({ ...styles, accent_color: e.target.value })} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs font-mono" />
            <span className="text-xs text-gray-400 w-16">アクセント</span>
          </div>
        </div>

        {/* Save */}
        <div className="pt-2">
          {saved && (
            <p className="text-green-600 text-xs text-center mb-2">保存しました</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "デザインを保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
