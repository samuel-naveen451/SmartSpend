import { Category, Transaction } from '../types/finance';

export function formatINR(amount: number, options?: { showDecimals?: boolean }): string {
  const showDecimals = options?.showDecimals ?? false;
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(abs);
  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
}

export function formatDateShort(isoDate: string): string {
  const [yearStr, monthStr, dayStr] = isoDate.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!year || !month || !day) return isoDate;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) return monthKey;
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatMonthShort(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!year || !month) return monthKey;
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function getPreviousMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  let year = Number(yearStr);
  let month = Number(monthStr) - 1;
  if (month <= 0) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateReportCsv(
  month: string,
  transactions: Transaction[],
  categoryTotals: { category: Category; amount: number; percentage: number }[]
): string {
  const lines: string[] = [];
  lines.push(`SmartSpend Monthly Expense Report,${escapeCsvCell(formatMonthLabel(month))}`);
  lines.push('');
  lines.push('Category Summary');
  lines.push('Category,Amount (INR),Share (%)');
  for (const item of categoryTotals) {
    lines.push(`${escapeCsvCell(item.category)},${item.amount},${item.percentage.toFixed(1)}%`);
  }
  lines.push('');
  lines.push('Transactions');
  lines.push('Date,Description,Category,Type,Amount (INR)');
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  for (const tx of sorted) {
    lines.push(
      [
        escapeCsvCell(tx.date),
        escapeCsvCell(tx.description),
        escapeCsvCell(tx.category),
        escapeCsvCell(tx.type === 'income' ? 'Income' : 'Expense'),
        tx.amount,
      ].join(',')
    );
  }
  return lines.join('\n');
}
