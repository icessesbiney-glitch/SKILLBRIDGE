export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      todos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          completed?: boolean;
          updated_at?: string;
        };
      };
      student_tasks: {
        Row: {
          id: string;
          student_id: string;
          task_name: string;
          payout_amount: number;
          payment_status: 'pending' | 'completed' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          task_name: string;
          payout_amount: number;
          payment_status?: 'pending' | 'completed' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          task_name?: string;
          payout_amount?: number;
          payment_status?: 'pending' | 'completed' | 'rejected';
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
