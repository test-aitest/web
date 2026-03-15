"use client";

import type { Profile, SocialLink } from "@/lib/types";
import { getPlatform } from "@/lib/platforms";
import Image from "next/image";

interface Props {
  profile: Profile;
  links: SocialLink[];
}

export default function ProfileCard({ profile, links }: Props) {
  const { custom_styles: styles } = profile;
  const gradient = styles.gradient || null;
  const visibleLinks = links
    .filter((l) => l.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Card container - business card aspect ratio */}
      <div
        className="relative w-full max-w-[420px] overflow-hidden select-none"
        style={{
          aspectRatio: "1.75 / 1",
          background: gradient || styles.bg_color,
          borderRadius: "12px",
          boxShadow: `0 1px 0 ${lighten(styles.bg_color, 8)}44,
                      0 30px 60px rgba(0,0,0,0.5),
                      0 0 1px rgba(255,255,255,0.05)`,
        }}
      >
        {/* Top edge highlight - metallic effect */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 10%, ${lighten(styles.bg_color, 20)}40 50%, transparent 90%)`,
          }}
        />

        {/* Card content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-8">
          {/* Top section: name + title */}
          <div>
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <div
                  className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0"
                  style={{
                    border: `1.5px solid ${lighten(styles.bg_color, 18)}60`,
                  }}
                >
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}
              <div>
                <h1
                  className="text-lg font-semibold tracking-wide leading-tight"
                  style={{ color: styles.text_color }}
                >
                  {profile.name}
                </h1>
                {profile.title && (
                  <p
                    className="text-[10px] tracking-[0.2em] uppercase mt-0.5"
                    style={{ color: `${styles.text_color}55` }}
                  >
                    {profile.title}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom section: bio + social */}
          <div>
            {profile.bio && (
              <p
                className="text-[11px] leading-relaxed mb-3 line-clamp-2"
                style={{ color: `${styles.text_color}45` }}
              >
                {profile.bio}
              </p>
            )}
            {/* Social icons row */}
            <div className="flex gap-3">
              {visibleLinks.map((link) => {
                const platform = getPlatform(link.platform);
                if (!platform) return null;
                const Icon = platform.icon;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.label || platform.label}
                    className="transition-opacity duration-300 hover:opacity-100"
                    style={{ color: `${styles.accent_color}90` }}
                  >
                    <Icon className="text-sm" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom edge - subtle */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 10%, ${lighten(styles.bg_color, 10)}20 50%, transparent 90%)`,
          }}
        />
      </div>
    </div>
  );
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
