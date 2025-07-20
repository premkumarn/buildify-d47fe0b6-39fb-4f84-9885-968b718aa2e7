
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      company_settings: {
        Row: {
          id: string
          company_name: string
          logo_url: string | null
          product_name: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          website: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_name: string
          logo_url?: string | null
          product_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          website?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_name?: string
          logo_url?: string | null
          product_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          website?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      kits: {
        Row: {
          id: string
          title: string
          description: string | null
          grade: 'grade_level' // '6' | '7' | '8' | '9' | '10'
          thumbnail_url: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          grade: 'grade_level' // '6' | '7' | '8' | '9' | '10'
          thumbnail_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          grade?: 'grade_level' // '6' | '7' | '8' | '9' | '10'
          thumbnail_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      languages: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'user_role' | null // 'student' | 'teacher' | 'admin'
          school: string | null
          grade: 'grade_level' | null // '6' | '7' | '8' | '9' | '10'
          phone: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'user_role' | null // 'student' | 'teacher' | 'admin'
          school?: string | null
          grade?: 'grade_level' | null // '6' | '7' | '8' | '9' | '10'
          phone?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'user_role' | null // 'student' | 'teacher' | 'admin'
          school?: string | null
          grade?: 'grade_level' | null // '6' | '7' | '8' | '9' | '10'
          phone?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          description: string | null
          kit_id: string | null
          is_all_kits: boolean | null
          max_uses: number | null
          current_uses: number | null
          valid_from: string | null
          valid_until: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          kit_id?: string | null
          is_all_kits?: boolean | null
          max_uses?: number | null
          current_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          kit_id?: string | null
          is_all_kits?: boolean | null
          max_uses?: number | null
          current_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      resources: {
        Row: {
          id: string
          kit_id: string
          title: string
          description: string | null
          language_id: string
          resource_type: 'resource_type' // 'pdf' | 'video' | 'audio'
          file_path: string
          file_size: number | null
          duration: number | null
          thumbnail_url: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          kit_id: string
          title: string
          description?: string | null
          language_id: string
          resource_type: 'resource_type' // 'pdf' | 'video' | 'audio'
          file_path: string
          file_size?: number | null
          duration?: number | null
          thumbnail_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          kit_id?: string
          title?: string
          description?: string | null
          language_id?: string
          resource_type?: 'resource_type' // 'pdf' | 'video' | 'audio'
          file_path?: string
          file_size?: number | null
          duration?: number | null
          thumbnail_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_access: {
        Row: {
          id: string
          user_id: string
          kit_id: string
          access_type: 'access_type' // 'paid' | 'free' | 'promo'
          can_access_pdf: boolean | null
          can_access_video: boolean | null
          can_access_audio: boolean | null
          granted_by: string | null
          valid_from: string | null
          valid_until: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          kit_id: string
          access_type: 'access_type' // 'paid' | 'free' | 'promo'
          can_access_pdf?: boolean | null
          can_access_video?: boolean | null
          can_access_audio?: boolean | null
          granted_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          kit_id?: string
          access_type?: 'access_type' // 'paid' | 'free' | 'promo'
          can_access_pdf?: boolean | null
          can_access_video?: boolean | null
          can_access_audio?: boolean | null
          granted_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_activity: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          viewed_at: string | null
          view_duration: number | null
          completed: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          viewed_at?: string | null
          view_duration?: number | null
          completed?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          viewed_at?: string | null
          view_duration?: number | null
          completed?: boolean | null
        }
      }
    }
    Views: {
      user_kit_access: {
        Row: {
          user_id: string
          kit_id: string
          kit_title: string
          kit_description: string | null
          kit_thumbnail_url: string | null
          kit_grade: 'grade_level' // '6' | '7' | '8' | '9' | '10'
          access_type: 'access_type' // 'paid' | 'free' | 'promo'
          can_access_pdf: boolean | null
          can_access_video: boolean | null
          can_access_audio: boolean | null
          valid_until: string | null
        }
      }
    }
    Functions: {
      redeem_promo_code: {
        Args: {
          p_user_id: string
          p_promo_code: string
        }
        Returns: Json
      }
    }
  }
}