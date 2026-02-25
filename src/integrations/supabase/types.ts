export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cms_pricing_plans: {
        Row: {
          id: string
          name: string
          price: string
          description: string
          features: string[]
          popular: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: string
          description: string
          features: string[]
          popular?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: string
          description?: string
          features?: string[]
          popular?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_properties: {
        Row: {
          id: string
          title: string
          location: string
          image_url: string | null
          guests: number
          beds: number
          baths: number
          price: string
          description: string | null
          amenities: string[] | null
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          location: string
          image_url?: string | null
          guests: number
          beds: number
          baths: number
          price: string
          description?: string | null
          amenities?: string[] | null
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          location?: string
          image_url?: string | null
          guests?: number
          beds?: number
          baths?: number
          price?: string
          description?: string | null
          amenities?: string[] | null
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          address: string | null
          category: string | null
          city: string | null
          country: string | null
          email: string | null
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          address?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          email?: string | null
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          address?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          email?: string | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      content_pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: Json
          meta: Json
          published: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: Json
          meta?: Json
          published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: Json
          meta?: Json
          published?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      media_files: {
        Row: {
          id: string
          filename: string
          url: string
          type: string
          size: number | null
          alt_text: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          filename: string
          url: string
          type: string
          size?: number | null
          alt_text?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          filename?: string
          url?: string
          type?: string
          size?: number | null
          alt_text?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}