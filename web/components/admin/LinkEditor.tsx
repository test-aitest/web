"use client";

import { useState } from "react";
import type { SocialLink } from "@/lib/types";
import { platforms, getPlatform } from "@/lib/platforms";

interface Props {
  profileId: string;
  links: SocialLink[];
  onUpdate: (links: SocialLink[]) => void;
}

export default function LinkEditor({ profileId, links, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ platform: "linkedin", url: "", label: "" });
  const [showAdd, setShowAdd] = useState(false);

  const addLink = async () => {
    if (!newLink.url) return;

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile_id: profileId,
        platform: newLink.platform,
        url: newLink.url,
        label: newLink.label || null,
        sort_order: links.length,
        is_visible: true,
      }),
    });

    if (res.ok) {
      const created = await res.json();
      onUpdate([...links, created]);
      setNewLink({ platform: "linkedin", url: "", label: "" });
      setShowAdd(false);
    }
  };

  const updateLink = async (link: SocialLink) => {
    const res = await fetch("/api/links", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(link),
    });

    if (res.ok) {
      const updated = await res.json();
      onUpdate(links.map((l) => (l.id === updated.id ? updated : l)));
      setEditingId(null);
    }
  };

  const deleteLink = async (id: string) => {
    const res = await fetch(`/api/links?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      onUpdate(links.filter((l) => l.id !== id));
    }
  };

  const moveLink = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= links.length) return;

    const sorted = [...links].sort((a, b) => a.sort_order - b.sort_order);
    const [moved] = sorted.splice(index, 1);
    sorted.splice(newIndex, 0, moved);

    const updated = sorted.map((l, i) => ({ ...l, sort_order: i }));
    onUpdate(updated);

    // Update sort orders on backend
    for (const link of updated) {
      await fetch("/api/links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: link.id, sort_order: link.sort_order }),
      });
    }
  };

  const sorted = [...links].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4">
      {/* Existing links */}
      {sorted.map((link, index) => {
        const platform = getPlatform(link.platform);
        const Icon = platform?.icon;
        const isEditing = editingId === link.id;

        return (
          <div key={link.id} className="border border-gray-200 rounded-lg p-4">
            {isEditing ? (
              <EditLinkForm
                link={link}
                onSave={(updated) => updateLink(updated)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveLink(index, -1)} className="text-gray-400 hover:text-gray-600 text-xs">▲</button>
                  <button onClick={() => moveLink(index, 1)} className="text-gray-400 hover:text-gray-600 text-xs">▼</button>
                </div>
                {Icon && <Icon className="text-xl" style={{ color: platform?.color }} />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{link.label || platform?.label}</p>
                  <p className="text-xs text-gray-500 truncate">{link.url}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const updated = { ...link, is_visible: !link.is_visible };
                      updateLink(updated);
                    }}
                    className={`text-xs px-2 py-1 rounded ${link.is_visible ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {link.is_visible ? "表示" : "非表示"}
                  </button>
                  <button onClick={() => setEditingId(link.id)} className="text-xs text-blue-600 hover:underline">
                    編集
                  </button>
                  <button onClick={() => deleteLink(link.id)} className="text-xs text-red-600 hover:underline">
                    削除
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add new link */}
      {showAdd ? (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プラットフォーム</label>
            <select
              value={newLink.platform}
              onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder={getPlatform(newLink.platform)?.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ラベル (任意)</label>
            <input
              type="text"
              value={newLink.label}
              onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
              placeholder="カスタムラベル"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={addLink} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              追加
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-gray-600 text-sm hover:underline">
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
        >
          + リンクを追加
        </button>
      )}
    </div>
  );
}

function EditLinkForm({
  link,
  onSave,
  onCancel,
}: {
  link: SocialLink;
  onSave: (link: SocialLink) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(link);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
        <input
          type="url"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ラベル</label>
        <input
          type="text"
          value={form.label || ""}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(form)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">保存</button>
        <button onClick={onCancel} className="px-4 py-2 text-gray-600 text-sm">キャンセル</button>
      </div>
    </div>
  );
}
