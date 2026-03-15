"use client";

import type { Profile, SocialLink } from "@/lib/types";
import { getPlatform } from "@/lib/platforms";
import TiltCard from "./TiltCard";

interface Props {
  profile: Profile;
  links: SocialLink[];
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export default function LivePreview({ profile, links }: Props) {
  const { custom_styles: styles } = profile;
  const visibleLinks = links
    .filter((l) => l.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Card */}
      <TiltCard>
      <div
        className="w-full max-w-[480px] relative overflow-hidden rounded-xl"
        style={{
          aspectRatio: "1.75 / 1",
          background: styles.gradient || styles.bg_color,
          boxShadow: `0 1px 0 ${lighten(styles.bg_color, 8)}44, 0 20px 40px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Top metallic edge */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 10%, ${lighten(styles.bg_color, 20)}40 50%, transparent 90%)`,
          }}
        />

        {/* Content */}
        <div className="h-full flex flex-col justify-between p-6">
          {/* Top: Avatar + Name + Title */}
          <div className="flex items-center gap-3">
            {profile.avatar_url && (
              <div
                className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
                style={{ border: `1px solid ${lighten(styles.bg_color, 18)}60` }}
              >
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <p
                className="text-sm font-semibold tracking-wide"
                style={{ color: styles.text_color }}
              >
                {profile.name}
              </p>
              {profile.title && (
                <p
                  className="text-[8px] tracking-[0.15em] uppercase"
                  style={{ color: `${styles.text_color}55` }}
                >
                  {profile.title}
                </p>
              )}
            </div>
          </div>

          {/* Bottom: Bio + Icons */}
          <div>
            {profile.bio && (
              <p
                className="text-[9px] leading-relaxed mb-2"
                style={{ color: `${styles.text_color}66` }}
              >
                {profile.bio}
              </p>
            )}
            <div className="flex gap-2">
              {visibleLinks.map((link) => {
                const platform = getPlatform(link.platform);
                if (!platform) return null;
                const Icon = platform.icon;
                return (
                  <Icon
                    key={link.id}
                    className="text-[11px]"
                    style={{ color: `${styles.accent_color}90` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom metallic edge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 10%, ${lighten(styles.bg_color, 10)}20 50%, transparent 90%)`,
          }}
        />
      </div>
      </TiltCard>
      <p className="text-gray-500 text-xs mt-4">リアルタイムプレビュー</p>
    </div>
  );
}
