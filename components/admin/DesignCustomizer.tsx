"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";

interface Props {
  profile: Profile;
  onSave: (profile: Profile) => void;
}

const presets = [
  { name: "Prairie Dark", bg_color: "#1a1a1a", text_color: "#ffffff" },
  { name: "Black Metal", bg_color: "#0d0d0d", text_color: "#e0e0e0" },
  { name: "Midnight Blue", bg_color: "#0f172a", text_color: "#e2e8f0" },
  { name: "Forest", bg_color: "#0d1f0d", text_color: "#d4edda" },
  { name: "Warm", bg_color: "#1c1410", text_color: "#f5e6d3" },
  { name: "Clean Light", bg_color: "#ffffff", text_color: "#1a1a1a" },
];

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function DesignCustomizer({ profile, onSave }: Props) {
  const [styles, setStyles] = useState(profile.custom_styles);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: profile.id, custom_styles: styles }),
    });

    if (res.ok) {
      const updated = await res.json();
      onSave(updated);
    }
    setSaving(false);
  };

  const applyPreset = (preset: (typeof presets)[0]) => {
    setStyles({
      ...styles,
      bg_color: preset.bg_color,
      text_color: preset.text_color,
    });
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">プリセット</label>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="p-3 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors text-left"
            >
              <div className="flex gap-1 mb-1">
                <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: preset.bg_color }} />
                <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: preset.text_color }} />
              </div>
              <p className="text-xs text-gray-600">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">背景色</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={styles.bg_color}
              onChange={(e) => setStyles({ ...styles, bg_color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={styles.bg_color}
              onChange={(e) => setStyles({ ...styles, bg_color: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">テキスト色</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={styles.text_color}
              onChange={(e) => setStyles({ ...styles, text_color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={styles.text_color}
              onChange={(e) => setStyles({ ...styles, text_color: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            />
          </div>
        </div>

      </div>

      {/* Preview - matches iOS card design */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">プレビュー</label>
        <div
          className="rounded-xl overflow-hidden relative"
          style={{
            aspectRatio: "1.75 / 1",
            backgroundColor: styles.bg_color,
            boxShadow: `0 1px 0 ${lighten(styles.bg_color, 8)}44`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent 10%, ${lighten(styles.bg_color, 20)}40 50%, transparent 90%)` }}
          />
          <div className="h-full flex flex-col justify-between p-5">
            <div>
              <p className="text-sm font-semibold tracking-wide" style={{ color: styles.text_color }}>
                {profile.name || "名前"}
              </p>
              <p className="text-[7px] tracking-[0.15em] uppercase" style={{ color: `${styles.text_color}55` }}>
                {profile.title || "肩書き"}
              </p>
            </div>
            <div>
              <p className="text-[8px] mb-2" style={{ color: `${styles.text_color}66` }}>
                {profile.bio || "自己紹介文がここに表示されます"}
              </p>
              <div className="flex gap-2">
                {["</>"," ✕","🔗"].map((icon, i) => (
                  <span key={i} className="text-[10px]" style={{ color: `${styles.text_color}40` }}>{icon}</span>
                ))}
              </div>
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent 10%, ${lighten(styles.bg_color, 10)}20 50%, transparent 90%)` }}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "保存中..." : "デザインを保存"}
      </button>
    </div>
  );
}
