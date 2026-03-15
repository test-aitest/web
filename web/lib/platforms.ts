import {
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaTiktok,
  FaDiscord,
  FaBlog,
  FaGlobe,
  FaEnvelope,
} from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import { SiQiita, SiZenn, SiNote } from "react-icons/si";
import type { IconType } from "react-icons";

export interface PlatformDef {
  id: string;
  label: string;
  icon: IconType;
  color: string;
  placeholder: string;
}

export const platforms: PlatformDef[] = [
  { id: "linkedin", label: "LinkedIn", icon: FaLinkedin, color: "#0A66C2", placeholder: "https://linkedin.com/in/username" },
  { id: "x", label: "X (Twitter)", icon: FaXTwitter, color: "#000000", placeholder: "https://x.com/username" },
  { id: "github", label: "GitHub", icon: FaGithub, color: "#333333", placeholder: "https://github.com/username" },
  { id: "blog", label: "Blog", icon: FaBlog, color: "#FF5722", placeholder: "https://yourblog.com" },
  { id: "instagram", label: "Instagram", icon: FaInstagram, color: "#E4405F", placeholder: "https://instagram.com/username" },
  { id: "facebook", label: "Facebook", icon: FaFacebook, color: "#1877F2", placeholder: "https://facebook.com/username" },
  { id: "qiita", label: "Qiita", icon: SiQiita, color: "#55C500", placeholder: "https://qiita.com/username" },
  { id: "zenn", label: "Zenn", icon: SiZenn, color: "#3EA8FF", placeholder: "https://zenn.dev/username" },
  { id: "youtube", label: "YouTube", icon: FaYoutube, color: "#FF0000", placeholder: "https://youtube.com/@channel" },
  { id: "email", label: "Email", icon: FaEnvelope, color: "#EA4335", placeholder: "mailto:you@example.com" },
  { id: "website", label: "Website", icon: FaGlobe, color: "#4285F4", placeholder: "https://yoursite.com" },
  { id: "note", label: "note", icon: SiNote, color: "#41C9B4", placeholder: "https://note.com/username" },
  { id: "tiktok", label: "TikTok", icon: FaTiktok, color: "#000000", placeholder: "https://tiktok.com/@username" },
  { id: "discord", label: "Discord", icon: FaDiscord, color: "#5865F2", placeholder: "https://discord.gg/invite" },
];

export function getPlatform(id: string): PlatformDef | undefined {
  return platforms.find((p) => p.id === id);
}
