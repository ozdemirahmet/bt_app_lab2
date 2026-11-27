export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '17.1';
  };
  public: {
    Tables: {
      pomodoro_sessions: {
        Row: {
          completed_at: string;
          duration_seconds: number;
          id: string;
          phase: string;
          session_date: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string;
          duration_seconds: number;
          id?: string;
          phase?: string;
          session_date?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string;
          duration_seconds?: number;
          id?: string;
          phase?: string;
          session_date?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          daily_pomodoro_goal: number;
          full_name: string | null;
          id: string;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          created_at?: string;
          daily_pomodoro_goal?: number;
          full_name?: string | null;
          id: string;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          created_at?: string;
          daily_pomodoro_goal?: number;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      todos: {
        Row: {
          completed: boolean;
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean;
          created_at?: string;
          id?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed?: boolean;
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type TodoRow = Database['public']['Tables']['todos']['Row'];
export type PomodoroSessionRow =
  Database['public']['Tables']['pomodoro_sessions']['Row'];
