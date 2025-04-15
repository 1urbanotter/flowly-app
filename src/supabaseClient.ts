// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Environment variables should be validated
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Please check your environment variables."
  );
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Optional: Add types for your database if you have them
export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          current_balance: number;
          created_at: string;
        };
      };
      transactions: {
        Row: {
          id: number;
          user_id: string;
          account_id: string;
          type: string;
          amount: number;
          weight_change: number;
          notes: string | null;
          category: string | null;
          timestamp: string;
          created_at: string;
          related_transaction_id: number | null;
        };
      };
    };
  };
};
