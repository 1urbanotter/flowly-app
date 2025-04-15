// src/db.ts
export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: string;
  current_balance: number;
  created_at: number; // JS timestamp (ms)
}

export type TransactionType =
  | "Purchase"
  | "Sale"
  | "Expense"
  | "Transfer"
  | "Adjustment";

export interface Transaction {
  id: number;
  timestamp: number; // JS timestamp (ms)
  type: TransactionType;
  amount: number;
  weightChange: number;
  notes?: string;
  account_id: string;
  category?: string;
  user_id: string;
  created_at: number; // JS timestamp (ms)
  related_transaction_id?: number;
}

// Helper types for database operations
export type TransactionInsert = Omit<
  Transaction,
  "id" | "user_id" | "created_at" | "timestamp"
> & {
  timestamp?: string; // ISO string for Supabase
};

export type TransactionUpdate = Partial<TransactionInsert>;
