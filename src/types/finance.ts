export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Utilities'
  | 'Education'
  | 'Healthcare'
  | 'Housing'
  | 'Income'
  | 'Other';

export const EXPENSE_CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Education',
  'Healthcare',
  'Housing',
  'Other',
];

export const ALL_CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Education',
  'Healthcare',
  'Housing',
  'Income',
  'Other',
];

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // Always positive INR value
  type: TransactionType;
  category: Category;
  source?: 'manual' | 'csv' | 'statement';
  confidence?: number; // AI categorization confidence 0..1
}

export interface Budget {
  id: string;
  category: Exclude<Category, 'Income'>;
  limit: number;
  month: string; // YYYY-MM
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  currency: 'INR';
  monthlySavingsGoal: number;
  aiAutoCategorize: boolean;
  unusualSpendAlerts: boolean;
  weeklyDigest: boolean;
}

export interface ParsedCsvRow {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  category: Category;
  confidence: number;
}

export interface MonthSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
  transactionCount: number;
  savingsRate: number;
}

export interface CategoryBreakdownItem {
  category: Category;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyTrendPoint {
  month: string;
  label: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface SpendingInsight {
  id: string;
  title: string;
  detail: string;
  metric: string;
  kind: 'highest' | 'trend' | 'unusual' | 'ai-tip';
}

export type PageRoute =
  | 'dashboard'
  | 'transactions'
  | 'upload'
  | 'budgets'
  | 'reports'
  | 'settings'
  | 'login'
  | 'register';
