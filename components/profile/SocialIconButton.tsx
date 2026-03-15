"use client";

import { getPlatform } from "@/lib/platforms";
import type { SocialLink } from "@/lib/types";

interface Props {
  link: SocialLink;
  size?: "sm" | "md" | "lg";
  accentColor?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-base",
  md: "w-10 h-10 text-xl",
  lg: "w-12 h-12 text-2xl",
};

export default function SocialIconButton({ link, size = "md", accentColor }: Props) {
  const platform = getPlatform(link.platform);
  if (!platform) return null;

  const Icon = platform.icon;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={link.label || platform.label}
      className={`${sizeMap[size]} inline-flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 hover:opacity-80`}
      style={{
        backgroundColor: accentColor || platform.color,
        color: "#ffffff",
      }}
    >
      <Icon />
    </a>
  );
}
