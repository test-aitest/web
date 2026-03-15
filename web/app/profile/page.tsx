import { supabase } from "@/lib/supabase";
import ProfileCard from "@/components/profile/ProfileCard";
import type { Profile, SocialLink } from "@/lib/types";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

async function getProfileData() {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .limit(1)
    .single();

  if (!profile) return { profile: null, links: [] };

  const { data: links } = await supabase
    .from("social_links")
    .select("*")
    .eq("profile_id", profile.id)
    .order("sort_order", { ascending: true });

  return { profile: profile as Profile, links: (links || []) as SocialLink[] };
}

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getProfileData();
  if (!profile) return { title: "CardLink" };

  return {
    title: `${profile.name} - CardLink`,
    description: profile.bio || `${profile.name}のデジタル名刺`,
    openGraph: {
      title: `${profile.name} - CardLink`,
      description: profile.bio || `${profile.name}のデジタル名刺`,
      ...(profile.avatar_url && { images: [profile.avatar_url] }),
    },
    twitter: {
      card: "summary",
      title: `${profile.name} - CardLink`,
      description: profile.bio || `${profile.name}のデジタル名刺`,
    },
  };
}

export default async function ProfilePage() {
  const { profile, links } = await getProfileData();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">CardLink</h1>
          <p className="opacity-60">プロフィールがまだ設定されていません</p>
        </div>
      </div>
    );
  }

  return <ProfileCard profile={profile} links={links} />;
}
