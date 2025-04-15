import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAppStore, TransactionType } from "./store";
import { format } from "date-fns";
import {
  DollarSign,
  Scale,
  TrendingUp,
  PlusCircle,
  Edit,
  Trash2,
  X,
  Check,
  LogOut,
  Landmark,
  CreditCard,
  Smartphone,
  Wallet,
  HelpCircle,
  Briefcase,
  User as UserIcon,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import cn from "classnames";

// --- Helper Functions ---
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatWeight = (value: number): string => `${value.toFixed(2)}g`;

const formatCurrencyChange = (value: number): string =>
  `${value >= 0 ? "+" : ""}${formatCurrency(value)}`;

const formatWeightChange = (value: number): string =>
  `${value >= 0 ? "+" : ""}${formatWeight(value)}`;

const getRatingClass = (rating: number | null): string => {
  if (rating === null) return "text-ratio-nodata";
  if (rating >= 10) return "text-ratio-good";
  if (rating >= 5) return "text-ratio-ok";
  return "text-ratio-poor";
};

// --- Icon Mapping ---
const getAccountIcon = (type: string) => {
  const lowerType = type.toLowerCase();
  const icons = {
    cashapp: <Smartphone className="h-5 w-5 text-emerald-400" />,
    paypal: <Smartphone className="h-5 w-5 text-blue-500" />,
    chime: <CreditCard className="h-5 w-5 text-teal-400" />,
    moneynetwork: <CreditCard className="h-5 w-5 text-gray-400" />,
    cash: <Wallet className="h-5 w-5 text-emerald-500" />,
    bank: <Landmark className="h-5 w-5 text-indigo-500" />,
    credit: <CreditCard className="h-5 w-5 text-rose-500" />,
  };
  return (
    icons[lowerType as keyof typeof icons] || (
      <HelpCircle className="h-5 w-5 text-gray-400" />
    )
  );
};

const getCategoryIcon = (category?: string) => {
  if (!category) return <HelpCircle className="h-4 w-4 text-gray-400" />;
  const lowerCat = category.toLowerCase();
  const icons = {
    business: <Briefcase className="h-4 w-4 text-blue-500" />,
    personal: <UserIcon className="h-4 w-4 text-emerald-500" />,
    groceries: <HelpCircle className="h-4 w-4 text-amber-500" />,
    income: <HelpCircle className="h-4 w-4 text-emerald-500" />,
    supplies: <HelpCircle className="h-4 w-4 text-indigo-500" />,
    utilities: <HelpCircle className="h-4 w-4 text-violet-500" />,
    other: <HelpCircle className="h-4 w-4 text-gray-400" />,
  };
  return (
    icons[lowerCat as keyof typeof icons] || (
      <HelpCircle className="h-4 w-4 text-gray-400" />
    )
  );
};

function App() {
  // --- UI State ---
  const [darkMode, setDarkMode] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountFormData, setAccountFormData] = useState({
    name: "",
    type: "Bank",
    current_balance: "",
  });
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // --- Transaction Form State ---
  const [formType, setFormType] = useState<TransactionType>("Sale");
  const [amountInput, setAmountInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Personal");
  const [isEditingTransaction, setIsEditingTransaction] = useState<
    number | null
  >(null);

  // --- Store ---
  const {
    session,
    user,
    accounts,
    transactions,
    overallNetCash,
    weightOnHand,
    dollarPerGramRatio,
    isLoading,
    signOut,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useAppStore();

  // --- Effects ---
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // --- Handlers ---
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleAccountFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAccountFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accountData = {
      name: accountFormData.name,
      type: accountFormData.type,
      current_balance: parseFloat(accountFormData.current_balance) || 0,
    };

    if (editingAccountId) {
      await updateAccount(editingAccountId, accountData);
    } else {
      await addAccount(accountData);
    }

    setShowAccountForm(false);
    setAccountFormData({ name: "", type: "Bank", current_balance: "" });
    setEditingAccountId(null);
  };

  const handleEditAccount = (account: Account) => {
    setAccountFormData({
      name: account.name,
      type: account.type,
      current_balance: account.current_balance.toString(),
    });
    setEditingAccountId(account.id);
    setShowAccountForm(true);
  };

  const handleDeleteAccount = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      await deleteAccount(id);
    }
  };

  const clearTransactionForm = useCallback(() => {
    setFormType("Sale");
    setAmountInput("");
    setWeightInput("");
    setNotesInput("");
    setSelectedAccountId(accounts.length > 0 ? accounts[0].id : "");
    setSelectedCategory("Personal");
    setIsEditingTransaction(null);
  }, [accounts]);

  const handleEditTransaction = useCallback((tx: Transaction) => {
    setIsEditingTransaction(tx.id);
    setFormType(tx.type);
    setAmountInput(String(Math.abs(tx.amount)));
    setWeightInput(String(Math.abs(tx.weightChange)));
    setNotesInput(tx.notes || "");
    setSelectedAccountId(tx.account_id);
    setSelectedCategory(tx.category || "Personal");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmitTransaction = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const amount = parseFloat(amountInput || "0");
      const weight = parseFloat(weightInput || "0");

      if (!selectedAccountId) {
        alert("Please select an account.");
        return;
      }

      if (isNaN(amount) || (formType !== "Expense" && isNaN(weight))) {
        alert("Please enter valid numbers for amount and weight.");
        return;
      }

      if (amount === 0 && weight === 0 && formType !== "Expense") {
        alert("Amount and weight cannot both be zero.");
        return;
      }

      if (formType === "Expense" && amount === 0) {
        alert("Expense amount cannot be zero.");
        return;
      }

      const transactionData = {
        type: formType,
        amount:
          formType === "Purchase" || formType === "Expense"
            ? -Math.abs(amount)
            : Math.abs(amount),
        weightChange:
          formType === "Purchase"
            ? Math.abs(weight)
            : formType === "Sale"
            ? -Math.abs(weight)
            : 0,
        notes: notesInput || undefined,
        account_id: selectedAccountId,
        category: selectedCategory,
      };

      const success = isEditingTransaction
        ? await updateTransaction(isEditingTransaction, transactionData)
        : await addTransaction(transactionData);

      if (success) {
        clearTransactionForm();
      }
    },
    [
      amountInput,
      weightInput,
      notesInput,
      formType,
      selectedAccountId,
      selectedCategory,
      isEditingTransaction,
      addTransaction,
      updateTransaction,
      clearTransactionForm,
    ]
  );

  // --- Breakdowns ---
  const breakdowns = useMemo(() => {
    const income: { [key: string]: number } = {};
    const expenses: { [key: string]: number } = {};
    const accountNames: { [key: string]: string } = {};

    accounts.forEach((acc) => (accountNames[acc.id] = acc.name));

    transactions.forEach((tx) => {
      const accountName = accountNames[tx.account_id] || "Unknown";
      if (tx.amount > 0) {
        income[accountName] = (income[accountName] || 0) + tx.amount;
      } else if (tx.amount < 0) {
        expenses[accountName] =
          (expenses[accountName] || 0) + Math.abs(tx.amount);
      }
    });

    return { income, expenses };
  }, [transactions, accounts]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-emerald-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Authenticating
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we verify your session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "dark bg-gradient-to-br from-gray-900 to-gray-800"
          : "bg-gradient-to-br from-gray-50 to-white"
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Flowly
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email
                ? `Welcome, ${user.email}`
                : "Your Financial Tracker"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={signOut}
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </header>

        <main className="space-y-10">
          {/* Dashboard */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Dashboard
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Net Cash Card */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Net Cash
                  </h3>
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <p
                  className={`text-3xl font-bold ${
                    overallNetCash >= 0
                      ? "text-gray-900 dark:text-white"
                      : "text-rose-600"
                  }`}
                >
                  {formatCurrency(overallNetCash)}
                </p>
              </div>

              {/* Weight On Hand Card */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Weight On Hand
                  </h3>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300">
                    <Scale className="h-5 w-5" />
                  </div>
                </div>
                <p
                  className={`text-3xl font-bold ${
                    weightOnHand >= 0
                      ? "text-gray-900 dark:text-white"
                      : "text-rose-600"
                  }`}
                >
                  {formatWeight(weightOnHand)}
                </p>
              </div>

              {/* Ratio Card */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Overall Ratio
                  </h3>
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <p
                  className={`text-3xl font-bold ${getRatingClass(
                    dollarPerGramRatio
                  )}`}
                >
                  {dollarPerGramRatio !== null
                    ? `${formatCurrency(dollarPerGramRatio)}/g`
                    : "N/A"}
                </p>
              </div>
            </div>
          </section>

          {/* Account Management */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Accounts
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {accounts.length} account{accounts.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => {
                    setShowAccountForm(true);
                    setEditingAccountId(null);
                    setAccountFormData({
                      name: "",
                      type: "Bank",
                      current_balance: "",
                    });
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Account
                </button>
              </div>
            </div>

            {/* Account Form Modal */}
            {showAccountForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {editingAccountId ? "Edit Account" : "Add Account"}
                    </h3>
                    <button
                      onClick={() => setShowAccountForm(false)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleAccountSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={accountFormData.name}
                        onChange={handleAccountFormChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Account Type
                      </label>
                      <select
                        name="type"
                        value={accountFormData.type}
                        onChange={handleAccountFormChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="Bank">Bank</option>
                        <option value="Credit">Credit Card</option>
                        <option value="Cash">Cash</option>
                        <option value="CashApp">CashApp</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Chime">Chime</option>
                        <option value="MoneyNetwork">MoneyNetwork</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Balance
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="current_balance"
                        value={accountFormData.current_balance}
                        onChange={handleAccountFormChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAccountForm(false)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {editingAccountId ? "Save Changes" : "Add Account"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Accounts List */}
            {isLoading && accounts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Loading accounts...
                </p>
              </div>
            ) : accounts.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No accounts added yet.
                </p>
                <button
                  onClick={() => setShowAccountForm(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Account
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                          {getAccountIcon(acc.type)}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {acc.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {acc.type}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-xl font-bold ${
                          acc.current_balance >= 0
                            ? "text-gray-900 dark:text-white"
                            : "text-rose-600"
                        }`}
                      >
                        {formatCurrency(acc.current_balance)}
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => handleEditAccount(acc)}
                        className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="p-2 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Transaction Form */}
          <section className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditingTransaction ? "Edit Transaction" : "Add Transaction"}
              </h2>
              {isEditingTransaction && (
                <button
                  onClick={clearTransactionForm}
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              )}
            </div>
            <form onSubmit={handleSubmitTransaction} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction Type
                  </label>
                  <div className="inline-flex rounded-lg shadow-sm">
                    {(["Sale", "Purchase", "Expense"] as TransactionType[]).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormType(type)}
                          className={cn(
                            "px-4 py-2 text-sm font-medium first:rounded-l-lg last:rounded-r-lg focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors",
                            formType === type
                              ? "bg-indigo-600 text-white hover:bg-indigo-700"
                              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                          )}
                        >
                          {type}
                        </button>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="account"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Account
                  </label>
                  <div className="relative">
                    <select
                      id="account"
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none pr-8"
                      required
                      disabled={accounts.length === 0 || isLoading}
                    >
                      {accounts.length === 0 ? (
                        <option value="">No accounts available</option>
                      ) : (
                        accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({formatCurrency(acc.current_balance)})
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  {accounts.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAccountForm(true)}
                      className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      + Add an account first
                    </button>
                  )}
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Amount (
                    {formType === "Purchase" || formType === "Expense"
                      ? "Spent (-)"
                      : "Received (+)"}
                    )
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                {formType !== "Expense" && (
                  <div>
                    <label
                      htmlFor="weight"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Weight (
                      {formType === "Purchase"
                        ? "Received (+)"
                        : "Dispensed (-)"}
                      )
                    </label>
                    <div className="relative">
                      <input
                        id="weight"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                        disabled={isLoading}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">g</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    {[
                      "Personal",
                      "Business",
                      "Groceries",
                      "Income",
                      "Supplies",
                      "Utilities",
                      "Other",
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    placeholder="Add a description..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                {isEditingTransaction && (
                  <button
                    type="button"
                    onClick={clearTransactionForm}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                  disabled={isLoading || accounts.length === 0}
                >
                  {isEditingTransaction ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Transaction
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Transaction History */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Transaction History
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {transactions.length} transaction
                {transactions.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
              {isLoading && transactions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading transactions...
                  </p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No transactions recorded yet.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map((tx) => {
                    const account = accounts.find(
                      (acc) => acc.id === tx.account_id
                    );
                    return (
                      <li
                        key={tx.id}
                        className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={cn(
                                  "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                                  tx.type === "Sale"
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200"
                                    : tx.type === "Purchase"
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                                    : "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200"
                                )}
                              >
                                {tx.type}
                              </span>
                              <div className="flex items-center gap-2 overflow-hidden">
                                {tx.category && (
                                  <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    {getCategoryIcon(tx.category)}
                                    <span className="ml-1 truncate">
                                      {tx.category}
                                    </span>
                                  </span>
                                )}
                                {account && (
                                  <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    {getAccountIcon(account.type)}
                                    <span className="ml-1 truncate">
                                      {account.name}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>
                                {format(new Date(tx.timestamp), "MMM d, yyyy")}
                              </span>
                              <span>•</span>
                              <span>
                                {format(new Date(tx.timestamp), "h:mm a")}
                              </span>
                            </div>
                            {tx.notes && (
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 truncate">
                                {tx.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="text-right">
                              <p
                                className={`text-lg font-semibold ${
                                  tx.amount > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : tx.amount < 0
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {formatCurrencyChange(tx.amount)}
                              </p>
                              {tx.weightChange !== 0 && (
                                <p
                                  className={`text-sm ${
                                    tx.weightChange > 0
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : tx.weightChange < 0
                                      ? "text-rose-600 dark:text-rose-400"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {formatWeightChange(tx.weightChange)}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditTransaction(tx)}
                                className="p-2 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(tx.id)}
                                className="p-2 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          {/* Breakdowns */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Financial Breakdown
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    Income
                  </h3>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                {Object.keys(breakdowns.income).length > 0 ? (
                  <ul className="space-y-3">
                    {Object.entries(breakdowns.income).map(
                      ([accName, total]) => (
                        <li key={accName} className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            {accName}
                          </span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(total)}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No income recorded.
                  </p>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-400">
                    Expenses
                  </h3>
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                    <TrendingUp className="h-5 w-5 transform rotate-180" />
                  </div>
                </div>
                {Object.keys(breakdowns.expenses).length > 0 ? (
                  <ul className="space-y-3">
                    {Object.entries(breakdowns.expenses).map(
                      ([accName, total]) => (
                        <li key={accName} className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">
                            {accName}
                          </span>
                          <span className="font-medium text-rose-600 dark:text-rose-400">
                            {formatCurrency(total)}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No expenses recorded.
                  </p>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
