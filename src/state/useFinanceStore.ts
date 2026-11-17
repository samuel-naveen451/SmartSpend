import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_USER_PROFILE,
  SEED_BUDGETS,
  SEED_TRANSACTIONS,
} from '../data/seedData';
import {
  Budget,
  Category,
  PageRoute,
  ParsedCsvRow,
  Transaction,
  UserProfile,
} from '../types/finance';

const STORAGE_KEY_TX = 'smartspend_v1_transactions';
const STORAGE_KEY_BUDGETS = 'smartspend_v1_budgets';
const STORAGE_KEY_USER = 'smartspend_v1_user';
const STORAGE_KEY_AUTH = 'smartspend_v1_auth';

function parseRouteFromLocation(): PageRoute {
  if (typeof window === 'undefined') return 'dashboard';
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();

  if (params.get('autostart') === '1') {
    return 'dashboard';
  }

  switch (path) {
    case '/login':
      return 'login';
    case '/register':
      return 'register';
    case '/transactions':
      return 'transactions';
    case '/upload':
      return 'upload';
    case '/budgets':
      return 'budgets';
    case '/reports':
      return 'reports';
    case '/settings':
      return 'settings';
    case '/dashboard':
    case '':
    default:
      return 'dashboard';
  }
}

function routeToPath(route: PageRoute): string {
  return route === 'dashboard' ? '/' : `/${route}`;
}

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useFinanceStore() {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    readStoredJson<Transaction[]>(STORAGE_KEY_TX, SEED_TRANSACTIONS)
  );
  const [budgets, setBudgets] = useState<Budget[]>(() =>
    readStoredJson<Budget[]>(STORAGE_KEY_BUDGETS, SEED_BUDGETS)
  );
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    readStoredJson<UserProfile>(STORAGE_KEY_USER, DEFAULT_USER_PROFILE)
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    if (params?.get('autostart') === '1') return true;
    return readStoredJson<boolean>(STORAGE_KEY_AUTH, true);
  });
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [route, setRoute] = useState<PageRoute>(() => parseRouteFromLocation());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch {
      // Ignore storage quota errors
    }
  }, [transactions]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    } catch {
      // Ignore
    }
  }, [budgets]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userProfile));
    } catch {
      // Ignore
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(isAuthenticated));
    } catch {
      // Ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRouteFromLocation());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((nextRoute: PageRoute) => {
    setRoute(nextRoute);
    const targetPath = routeToPath(nextRoute);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const login = useCallback(
    (email: string) => {
      setIsAuthenticated(true);
      setUserProfile((prev) => ({
        ...prev,
        email: email.trim() || prev.email,
      }));
      navigate('dashboard');
    },
    [navigate]
  );

  const register = useCallback(
    (name: string, email: string) => {
      setIsAuthenticated(true);
      setUserProfile((prev) => ({
        ...prev,
        name: name.trim() || prev.name,
        email: email.trim() || prev.email,
      }));
      navigate('dashboard');
    },
    [navigate]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    navigate('login');
  }, [navigate]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const created: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setTransactions((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateTransactionCategory = useCallback((id: string, category: Category) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, category } : tx))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  }, []);

  const importCsvRows = useCallback((rows: ParsedCsvRow[]) => {
    const imported: Transaction[] = rows.map((row, idx) => {
      const isIncome = row.credit > 0 && row.debit === 0;
      return {
        id: `csv-${Date.now()}-${idx}`,
        date: row.date,
        description: row.description,
        amount: isIncome ? row.credit : row.debit,
        type: isIncome ? 'income' : 'expense',
        category: row.category,
        source: 'csv',
        confidence: row.confidence,
      };
    });
    setTransactions((prev) => [...imported, ...prev]);
    if (imported.length > 0) {
      const latestMonth = imported[0].date.slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(latestMonth)) {
        setSelectedMonth(latestMonth);
      }
    }
    return imported.length;
  }, []);

  const upsertBudget = useCallback(
    (category: Exclude<Category, 'Income'>, limit: number, month: string) => {
      setBudgets((prev) => {
        const existingIdx = prev.findIndex(
          (b) => b.category === category && b.month === month
        );
        if (existingIdx !== -1) {
          const next = [...prev];
          next[existingIdx] = { ...next[existingIdx], limit };
          return next;
        }
        return [
          ...prev,
          {
            id: `budget-${category.toLowerCase()}-${month}-${Date.now()}`,
            category,
            limit,
            month,
          },
        ];
      });
    },
    []
  );

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const updateUserProfile = useCallback((patch: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDemoData = useCallback(() => {
    setTransactions(SEED_TRANSACTIONS);
    setBudgets(SEED_BUDGETS);
    setUserProfile(DEFAULT_USER_PROFILE);
    setSelectedMonth('2026-11');
  }, []);

  const deleteAccount = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY_TX);
    window.localStorage.removeItem(STORAGE_KEY_BUDGETS);
    window.localStorage.removeItem(STORAGE_KEY_USER);
    setTransactions(SEED_TRANSACTIONS);
    setBudgets(SEED_BUDGETS);
    setUserProfile(DEFAULT_USER_PROFILE);
    setIsAuthenticated(false);
    navigate('login');
  }, [navigate]);

  return {
    route,
    navigate,
    isAuthenticated,
    login,
    register,
    logout,
    selectedMonth,
    setSelectedMonth,
    transactions,
    budgets,
    userProfile,
    addTransaction,
    updateTransactionCategory,
    deleteTransaction,
    importCsvRows,
    upsertBudget,
    deleteBudget,
    updateUserProfile,
    resetDemoData,
    deleteAccount,
  };
}
