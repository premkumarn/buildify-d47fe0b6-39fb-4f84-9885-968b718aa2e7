
export type ResourceType = 'pdf' | 'video' | 'audio';
export type UserRole = 'student' | 'teacher' | 'admin';
export type AccessType = 'paid' | 'free' | 'promo';
export type GradeLevel = '6' | '7' | '8' | '9' | '10';

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
  language?: Language;
}

export interface Kit {
  id: string;
  title: string;
  description: string | null;
  grade: GradeLevel;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  resources?: Resource[];
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
  access_type: AccessType;
  can_access_pdf: boolean;
  can_access_video: boolean;
  can_access_audio: boolean;
  granted_by: string | null;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
  kit?: Kit;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  role: UserRole | null;
  school: string | null;
  grade: GradeLevel | null;
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

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  kit_id: string | null;
  is_all_kits: boolean | null;
  max_uses: number | null;
  current_uses: number | null;
  valid_from: string | null;
  valid_until: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  kit?: Kit;
}

export interface UserActivity {
  id: string;
  user_id: string;
  resource_id: string;
  viewed_at: string | null;
  view_duration: number | null;
  completed: boolean | null;
  resource?: Resource;
}

export interface PaymentInfo {
  userId: string;
  kitId: string;
  paymentMethod: string;
  paymentId: string;
  amount: number;
}

export interface PromoRedemption {
  userId: string;
  promoCode: string;
}