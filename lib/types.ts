export interface Profile {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  template_id: string;
  custom_styles: {
    bg_color: string;
    text_color: string;
    accent_color: string;
    gradient?: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: string;
  profile_id: string;
  platform: string;
  url: string;
  label: string | null;
  sort_order: number;
  is_visible: boolean;
}
