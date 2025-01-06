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
      players: {
        Row: {
          id: string
          name: string
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      player_stats: {
        Row: {
          id: string
          player_id: string
          wins: number
          losses: number
          pin: string | null
          password: string | null
          approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          wins?: number
          losses?: number
          pin?: string | null
          password?: string | null
          approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          wins?: number
          losses?: number
          pin?: string | null
          password?: string | null
          approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          winner_id: string
          loser_id: string
          winner_rating_change: number
          loser_rating_change: number
          created_at: string
        }
        Insert: {
          id?: string
          winner_id: string
          loser_id: string
          winner_rating_change: number
          loser_rating_change: number
          created_at?: string
        }
        Update: {
          id?: string
          winner_id?: string
          loser_id?: string
          winner_rating_change?: number
          loser_rating_change?: number
          created_at?: string
        }
      }
      challenges: {
        Row: {
          id: string
          challenger_id: string
          challenged_id: string
          game: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          challenger_id: string
          challenged_id: string
          game: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          challenger_id?: string
          challenged_id?: string
          game?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}