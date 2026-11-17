import {
  Category,
  CategoryBreakdownItem,
  MonthlyTrendPoint,
  MonthSummary,
  ParsedCsvRow,
  SpendingInsight,
  Transaction,
} from '../types/finance';
import { formatINR, formatMonthLabel, formatMonthShort, getPreviousMonthKey } from './format';

interface CategoryRule {
  category: Category;
  keywords: string[];
  confidence: number;
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Income',
    keywords: ['salary', 'payroll', 'freelance', 'dividend', 'interest credit', 'refund', 'stipend', 'cashback', 'deposit'],
    confidence: 0.96,
  },
  {
    category: 'Education',
    keywords: ['college', 'tuition', 'university', 'course', 'udemy', 'coursera', 'school', 'exam', 'bookstore', 'crossword', 'library'],
    confidence: 0.95,
  },
  {
    category: 'Food',
    keywords: ['swiggy', 'zomato', 'bigbasket', 'zepto', 'blinkit', 'instamart', 'coffee', 'chai', 'restaurant', 'cafe', 'pizza', 'domino', 'haldiram', 'udupi', 'dairy', 'milk', 'supermarket', 'grocery', 'eatfit', 'bakery'],
    confidence: 0.94,
  },
  {
    category: 'Transport',
    keywords: ['uber', 'ola', 'rapido', 'metro', 'petrol', 'fuel', 'hpcl', 'bpcl', 'shell', 'bmtc', 'irctc', 'rail', 'toll', 'fastag', 'parking', 'cab', 'auto'],
    confidence: 0.93,
  },
  {
    category: 'Utilities',
    keywords: ['bescom', 'electricity', 'water', 'bwssb', 'airtel', 'jio', 'broadband', 'fiber', 'postpaid', 'lpg', 'indane', 'gas', 'recharge', 'wifi'],
    confidence: 0.94,
  },
  {
    category: 'Entertainment',
    keywords: ['netflix', 'spotify', 'bookmyshow', 'pvr', 'inox', 'prime video', 'hotstar', 'playstation', 'steam', 'cinema', 'concert'],
    confidence: 0.93,
  },
  {
    category: 'Shopping',
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'decathlon', 'croma', 'reliance digital', 'ikea', 'nykaa', 'zudio', 'mall'],
    confidence: 0.91,
  },
  {
    category: 'Healthcare',
    keywords: ['apollo', 'pharmacy', '1mg', 'pharmeasy', 'practo', 'medplus', 'hospital', 'clinic', 'dental', 'lab test', 'diagnostic'],
    confidence: 0.92,
  },
  {
    category: 'Housing',
    keywords: ['rent', 'maintenance', 'society', 'nobroker', 'house', 'lease'],
    confidence: 0.93,
  },
];

export function categorizeTransaction(
  description: string,
  isCredit = false
): { category: Category; confidence: number } {
  const normalized = description.toLowerCase().trim();
  if (isCredit) {
    return { category: 'Income', confidence: 0.97 };
  }
  for (const rule of CATEGORY_RULES) {
    if (rule.category === 'Income') continue;
    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) {
        return { category: rule.category, confidence: rule.confidence };
      }
    }
  }
  return { category: 'Other', confidence: 0.68 };
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function normalizeDate(raw: string): string {
  const cleaned = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  // Support DD/MM/YYYY or DD-MM-YYYY
  const dmy = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    const year = dmy[3];
    return `${year}-${month}-${day}`;
  }
  return '2026-11-15';
}

function parseNumericAmount(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[₹,\s]/g, '');
  const val = Number(cleaned);
  return Number.isFinite(val) ? val : 0;
}

export function parseBankStatementCsv(csvText: string): {
  rows: ParsedCsvRow[];
  error: string | null;
} {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      rows: [],
      error: 'CSV file must contain a header row and at least one transaction row.',
    };
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
  const dateIdx = headers.findIndex((h) => h.includes('date'));
  const descIdx = headers.findIndex(
    (h) => h.includes('desc') || h.includes('narration') || h.includes('particular') || h.includes('merchant')
  );
  const debitIdx = headers.findIndex(
    (h) => h.includes('debit') || h.includes('withdrawal') || /\bdr\b/.test(h)
  );
  const creditIdx = headers.findIndex(
    (h) => h.includes('credit') || h.includes('deposit') || /\bcr\b/.test(h)
  );
  const amountIdx = headers.findIndex((h) => h === 'amount' || h.includes('amount'));
  const catIdx = headers.findIndex((h) => h.includes('category'));

  if (dateIdx === -1 || descIdx === -1 || (debitIdx === -1 && creditIdx === -1 && amountIdx === -1)) {
    return {
      rows: [],
      error: 'Expected columns: Date, Description, and Debit/Credit (or Amount).',
    };
  }

  const rows: ParsedCsvRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = splitCsvLine(lines[i]);
    if (cols.length < 2) continue;

    const rawDate = cols[dateIdx] ?? '';
    const description = (cols[descIdx] ?? '').trim();
    if (!description) continue;

    let debit = 0;
    let credit = 0;

    if (debitIdx !== -1 || creditIdx !== -1) {
      debit = Math.max(0, parseNumericAmount(debitIdx !== -1 ? cols[debitIdx] : '0'));
      credit = Math.max(0, parseNumericAmount(creditIdx !== -1 ? cols[creditIdx] : '0'));
    } else if (amountIdx !== -1) {
      const signed = parseNumericAmount(cols[amountIdx]);
      if (signed < 0) {
        debit = Math.abs(signed);
      } else {
        credit = signed;
      }
    }

    if (debit === 0 && credit === 0) continue;

    const isCredit = credit > 0 && debit === 0;
    const auto = categorizeTransaction(description, isCredit);
    const explicitCat = catIdx !== -1 ? (cols[catIdx] as Category) : undefined;
    const category = explicitCat && explicitCat.trim().length > 0 ? explicitCat : auto.category;

    rows.push({
      id: `csv-row-${i}-${Date.now()}`,
      date: normalizeDate(rawDate),
      description,
      debit,
      credit,
      category,
      confidence: auto.confidence,
    });
  }

  if (rows.length === 0) {
    return {
      rows: [],
      error: 'No valid transactions with numeric Debit or Credit values were found in this CSV.',
    };
  }

  return { rows, error: null };
}

export function getMonthTransactions(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((tx) => tx.date.startsWith(month));
}

export function computeMonthSummary(transactions: Transaction[], month: string): MonthSummary {
  const monthTxs = getMonthTransactions(transactions, month);
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of monthTxs) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
    }
  }

  const remainingBalance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((remainingBalance / totalIncome) * 100) : 0;

  return {
    month,
    totalIncome,
    totalExpenses,
    remainingBalance,
    transactionCount: monthTxs.length,
    savingsRate,
  };
}

export function computeCategoryBreakdown(
  transactions: Transaction[],
  month: string
): CategoryBreakdownItem[] {
  const expenses = getMonthTransactions(transactions, month).filter((tx) => tx.type === 'expense');
  const total = expenses.reduce((acc, tx) => acc + tx.amount, 0);
  const map = new Map<Category, { amount: number; count: number }>();

  for (const tx of expenses) {
    const prev = map.get(tx.category) ?? { amount: 0, count: 0 };
    map.set(tx.category, { amount: prev.amount + tx.amount, count: prev.count + 1 });
  }

  return Array.from(map.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? Number(((data.amount / total) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function computeMonthlyTrend(transactions: Transaction[], months: string[]): MonthlyTrendPoint[] {
  return months.map((month) => {
    const summary = computeMonthSummary(transactions, month);
    return {
      month,
      label: formatMonthShort(month),
      income: summary.totalIncome,
      expenses: summary.totalExpenses,
      savings: Math.max(0, summary.remainingBalance),
    };
  });
}

export function compareWithPreviousMonth(
  transactions: Transaction[],
  month: string
): {
  previousMonth: string;
  currentExpenses: number;
  previousExpenses: number;
  deltaAmount: number;
  deltaPercent: number;
} {
  const previousMonth = getPreviousMonthKey(month);
  const current = computeMonthSummary(transactions, month);
  const previous = computeMonthSummary(transactions, previousMonth);
  const deltaAmount = current.totalExpenses - previous.totalExpenses;
  const deltaPercent =
    previous.totalExpenses > 0
      ? Number(((deltaAmount / previous.totalExpenses) * 100).toFixed(1))
      : 0;

  return {
    previousMonth,
    currentExpenses: current.totalExpenses,
    previousExpenses: previous.totalExpenses,
    deltaAmount,
    deltaPercent,
  };
}

export function detectUnusualTransactions(transactions: Transaction[], month: string): Transaction[] {
  const expenses = getMonthTransactions(transactions, month).filter((tx) => tx.type === 'expense');
  if (expenses.length === 0) return [];
  const avg = expenses.reduce((sum, tx) => sum + tx.amount, 0) / expenses.length;
  const threshold = Math.max(1500, avg * 2.2);
  return expenses
    .filter((tx) => tx.amount >= threshold)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
}

export function generateSpendingInsights(transactions: Transaction[], month: string): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  const breakdown = computeCategoryBreakdown(transactions, month);
  const comparison = compareWithPreviousMonth(transactions, month);
  const unusual = detectUnusualTransactions(transactions, month);
  const summary = computeMonthSummary(transactions, month);

  if (breakdown.length > 0) {
    const top = breakdown[0];
    insights.push({
      id: 'insight-highest',
      title: 'Highest spending category',
      detail: `${top.category} accounts for ${top.percentage}% of your expenses in ${formatMonthLabel(month)}.`,
      metric: `${top.category} · ${formatINR(top.amount)}`,
      kind: 'highest',
    });
  }

  if (comparison.previousExpenses > 0) {
    const direction = comparison.deltaAmount >= 0 ? 'higher' : 'lower';
    const sign = comparison.deltaAmount >= 0 ? '+' : '';
    insights.push({
      id: 'insight-trend',
      title: 'Month-over-month spending change',
      detail: `Your spending is ${Math.abs(comparison.deltaPercent)}% ${direction} than ${formatMonthLabel(comparison.previousMonth)} (${formatINR(comparison.previousExpenses)}).`,
      metric: `${sign}${comparison.deltaPercent}% (${sign}${formatINR(comparison.deltaAmount)})`,
      kind: 'trend',
    });
  }

  if (unusual.length > 0) {
    const outlier = unusual[0];
    insights.push({
      id: 'insight-unusual',
      title: 'Unusual transaction flagged',
      detail: `${outlier.description} (${outlier.category}) is noticeably above your average ticket size this month.`,
      metric: formatINR(outlier.amount),
      kind: 'unusual',
    });
  }

  const foodItem = breakdown.find((b) => b.category === 'Food');
  if (summary.totalIncome > 0) {
    const tip =
      foodItem && foodItem.percentage > 15
        ? `Food & dining took ${foodItem.percentage}% of expenses. Setting a weekly cap of ${formatINR(Math.round(foodItem.amount / 4))} can improve monthly savings.`
        : `You saved ${summary.savingsRate}% of your income this month (${formatINR(summary.remainingBalance)}). Keeping recurring subscriptions lean preserves your buffer.`;
    insights.push({
      id: 'insight-ai-tip',
      title: 'SmartSpend AI summary',
      detail: tip,
      metric: `${summary.savingsRate}% saved`,
      kind: 'ai-tip',
    });
  }

  return insights;
}
