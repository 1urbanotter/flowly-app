// src/store.ts
import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import {
  Account,
  Transaction,
  TransactionType,
  TransactionInsert,
  TransactionUpdate,
} from "./db";
import { supabase, Database } from "./supabaseClient";

// Helper types
type Tables = Database["public"]["Tables"];
type AccountRow = Tables["accounts"]["Row"];
type TransactionRow = Tables["transactions"]["Row"];

interface AppState {
  // Auth State
  session: Session | null;
  user: User | null;
  isSessionLoading: boolean;

  // Data State
  accounts: Account[];
  transactions: Transaction[];
  isLoading: boolean;

  // Calculated Values
  overallNetCash: number;
  weightOnHand: number;
  dollarPerGramRatio: number | null;

  // Actions
  setSession: (session: Session | null) => void;
  checkSession: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchAccounts: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transactionData: TransactionInsert) => Promise<boolean>;
  updateTransaction: (
    id: number,
    changes: TransactionUpdate
  ) => Promise<boolean>;
  deleteTransaction: (id: number) => Promise<boolean>;
  recalculateSummaries: () => void;
  addAccount: (
    account: Omit<Account, "id" | "user_id" | "created_at">
  ) => Promise<boolean>;
  updateAccount: (id: string, changes: Partial<Account>) => Promise<boolean>;
  deleteAccount: (id: string) => Promise<boolean>;
}

// Mapper functions
const mapAccount = (account: AccountRow): Account => ({
  ...account,
  created_at: new Date(account.created_at).getTime(),
});

const mapTransaction = (transaction: TransactionRow): Transaction => ({
  id: transaction.id,
  timestamp: new Date(transaction.timestamp).getTime(),
  type: transaction.type as TransactionType,
  amount: transaction.amount,
  weightChange: transaction.weight_change,
  notes: transaction.notes || undefined,
  account_id: transaction.account_id,
  category: transaction.category || undefined,
  user_id: transaction.user_id,
  created_at: new Date(transaction.created_at).getTime(),
  related_transaction_id: transaction.related_transaction_id || undefined,
});

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  session: null,
  user: null,
  isSessionLoading: true,
  accounts: [],
  transactions: [],
  isLoading: false,
  overallNetCash: 0,
  weightOnHand: 0,
  dollarPerGramRatio: null,

  // Auth Actions
  setSession: (session) => set({ session, user: session?.user ?? null }),

  checkSession: async () => {
    set({ isSessionLoading: true });
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      set({ session, user: session?.user ?? null });

      if (session?.user) {
        await Promise.all([get().fetchAccounts(), get().fetchTransactions()]);
      } else {
        set({ accounts: [], transactions: [] });
      }
    } catch (error) {
      console.error("Session check failed:", error);
    } finally {
      set({ isSessionLoading: false });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ session: null, user: null, accounts: [], transactions: [] });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  },

  // Data Fetching
  fetchAccounts: async () => {
    const user = get().user;
    if (!user) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) throw error;

      const accounts = data?.map(mapAccount) || [];
      set({ accounts });
      get().recalculateSummaries();
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      set({ accounts: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTransactions: async () => {
    const user = get().user;
    if (!user) return;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: false });

      if (error) throw error;

      const transactions = data?.map(mapTransaction) || [];
      set({ transactions });
      get().recalculateSummaries();
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      set({ transactions: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // Data Mutations
  addTransaction: async (transactionData) => {
    const user = get().user;
    if (!user) return false;

    set({ isLoading: true });
    try {
      const { error } = await supabase.from("transactions").insert({
        ...transactionData,
        user_id: user.id,
        timestamp: transactionData.timestamp || new Date().toISOString(),
      });

      if (error) throw error;

      await Promise.all([get().fetchAccounts(), get().fetchTransactions()]);
      return true;
    } catch (error) {
      console.error("Failed to add transaction:", error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransaction: async (id, changes) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from("transactions")
        .update(changes)
        .eq("id", id);

      if (error) throw error;

      await Promise.all([get().fetchAccounts(), get().fetchTransactions()]);
      return true;
    } catch (error) {
      console.error(`Failed to update transaction ${id}:`, error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await Promise.all([get().fetchAccounts(), get().fetchTransactions()]);
      return true;
    } catch (error) {
      console.error(`Failed to delete transaction ${id}:`, error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // Summary Calculations
  recalculateSummaries: () => {
    const { accounts, transactions } = get();

    // Calculate net cash from accounts
    const overallNetCash = accounts.reduce(
      (sum, acc) => sum + acc.current_balance,
      0
    );

    // Calculate weight on hand
    const weightOnHand = transactions.reduce(
      (sum, tx) => sum + tx.weightChange,
      0
    );

    // Calculate dollar per gram ratio (only from sales)
    const sales = transactions.filter((tx) => tx.type === "Sale");
    const totalSalesAmount = sales.reduce((sum, tx) => sum + tx.amount, 0);
    const totalSalesWeight = sales.reduce(
      (sum, tx) => sum + Math.abs(tx.weightChange),
      0
    );
    const dollarPerGramRatio =
      totalSalesWeight > 0 ? totalSalesAmount / totalSalesWeight : null;

    set({ overallNetCash, weightOnHand, dollarPerGramRatio });
  },
}));

// Initialize auth listener
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAppStore.getState();
  store.setSession(session);

  if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
    if (event === "SIGNED_IN") {
      Promise.all([store.fetchAccounts(), store.fetchTransactions()]);
    } else {
      store.recalculateSummaries();
    }
  }
});

// Initial session check
useAppStore.getState().checkSession();
