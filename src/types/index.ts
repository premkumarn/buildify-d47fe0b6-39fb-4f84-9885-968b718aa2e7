
export type ResourceType = 'pdf' | 'video' | 'audio';

export interface Resource {
  id: string;
  kit_id: string;
  title: string;
  description: string | null;
  language_id: string;
  resource_type: ResourceType;
  file_path: string;
  file_size: number | null;
  duration: number | null;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Kit {
  id: string;
  title: string;
  description: string | null;
  grade: string;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Language {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface UserAccess {
  id: string;
  user_id: string;
  kit_id: string;
  access_type: 'paid' | 'free' | 'promo';
  can_access_pdf: boolean;
  can_access_video: boolean;
  can_access_audio: boolean;
  granted_by: string | null;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: 'student' | 'teacher' | 'admin' | null;
  school: string | null;
  grade: string | null;
  phone: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  logo_url: string | null;
  product_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}