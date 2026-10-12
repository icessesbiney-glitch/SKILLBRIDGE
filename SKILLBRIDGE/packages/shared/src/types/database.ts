export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          skillbridge_balance: number;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          skillbridge_balance?: number;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          skillbridge_balance?: number;
          updated_at?: string;
        };
      };
      course_catalog: {
        Row: {
          id: string;
          title: string;
          category: string;
          instructor_name: string;
          price: number;
          currency: string;
          description: string | null;
          thumbnail_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: string;
          instructor_name?: string;
          price?: number;
          currency?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          category?: string;
          instructor_name?: string;
          price?: number;
          currency?: string;
          description?: string | null;
          thumbnail_url?: string | null;
        };
      };
      skillbridge_admin_registry: {
        Row: {
          id: string;
          user_id: string;
          role: 'academy_admin' | 'course_instructor' | 'technical_mentor';
          assigned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'academy_admin' | 'course_instructor' | 'technical_mentor';
          assigned_at?: string;
        };
        Update: {
          role?: 'academy_admin' | 'course_instructor' | 'technical_mentor';
        };
      };
      course_progression: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          sessions_attended: number;
          total_sessions: number;
          assessments_completed: number;
          total_assessments: number;
          is_certified: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          sessions_attended?: number;
          total_sessions?: number;
          assessments_completed?: number;
          total_assessments?: number;
          is_certified?: boolean;
          updated_at?: string;
        };
        Update: {
          sessions_attended?: number;
          total_sessions?: number;
          assessments_completed?: number;
          total_assessments?: number;
          is_certified?: boolean;
          updated_at?: string;
        };
      };
      dodo_payments_log: {
        Row: {
          id: string;
          transaction_id: string;
          user_id: string | null;
          amount: number;
          currency: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          user_id?: string | null;
          amount: number;
          currency?: string;
          status: string;
          created_at?: string;
        };
        Update: {
          status?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
