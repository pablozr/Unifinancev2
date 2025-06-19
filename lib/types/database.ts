/**
 * @fileoverview Tipos do database para Supabase
 * @description Define os tipos das tabelas baseados no schema existente
 */

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string
          category_id: string | null
          date: string
          type: 'credit' | 'debit'
          csv_import_id: string | null
          category: string | null
          month: number | null
          year: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description: string
          category_id?: string | null
          date: string
          type: 'credit' | 'debit'
          csv_import_id?: string | null
          category?: string | null
          month?: number | null
          year?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string
          category_id?: string | null
          date?: string
          type?: 'credit' | 'debit'
          csv_import_id?: string | null
          category?: string | null
          month?: number | null
          year?: number | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          period: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          period: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          period?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      csv_imports: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_path: string
          file_size: number
          file_hash: string | null
          total_rows: number
          valid_rows: number
          status: string
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_path: string
          file_size: number
          file_hash?: string | null
          total_rows: number
          valid_rows: number
          status?: string
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_path?: string
          file_size?: number
          file_hash?: string | null
          total_rows?: number
          valid_rows?: number
          status?: string
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      monthly_summaries: {
        Row: {
          id: string
          user_id: string
          csv_import_id: string | null
          month: number
          year: number
          total_income: number
          total_expenses: number
          net_balance: number
          transaction_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          csv_import_id?: string | null
          month: number
          year: number
          total_income: number
          total_expenses: number
          net_balance: number
          transaction_count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          csv_import_id?: string | null
          month?: number
          year?: number
          total_income?: number
          total_expenses?: number
          net_balance?: number
          transaction_count?: number
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