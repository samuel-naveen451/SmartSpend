import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Check, Download } from 'lucide-react';
import { Transaction } from '../types/finance';
import {
  compareWithPreviousMonth,
  computeCategoryBreakdown,
  computeMonthSummary,
  getMonthTransactions,
} from '../utils/categorizer';
import { formatINR, formatMonthLabel, generateReportCsv } from '../utils/format';

interface ReportsPageProps {
  transactions: Transaction[];
  selectedMonth: string;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  transactions,
  selectedMonth,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const summary = useMemo(
    () => computeMonthSummary(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const breakdown = useMemo(
    () => computeCategoryBreakdown(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const comparison = useMemo(
    () => compareWithPreviousMonth(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const highestCategory = breakdown[0] ?? null;
  const monthLabel = formatMonthLabel(selectedMonth);
  const prevMonthLabel = formatMonthLabel(comparison.previousMonth);

  const handleDownloadCsv = () => {
    const monthTxs = getMonthTransactions(transactions, selectedMonth);
    const csvContent = generateReportCsv(selectedMonth, monthTxs, breakdown);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smartspend-report-${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
            Monthly Expense Report
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Financial summary, category distribution, and month-over-month variance for {monthLabel}.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {downloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
          <span>{downloaded ? 'CSV Downloaded' : 'Download report as CSV'}</span>
        </button>
      </div>

      {/* Key Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-neutral-500">Total Income</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950 font-mono-num">
            {formatINR(summary.totalIncome)}
          </p>
          <p className="mt-1.5 text-xs text-neutral-600">{monthLabel}</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-neutral-500">Total Expenses</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950 font-mono-num">
            {formatINR(summary.totalExpenses)}
          </p>
          <p className="mt-1.5 text-xs text-neutral-600 tabular-nums">
            {summary.transactionCount} entries logged
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-neutral-500">Highest Spending Category</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950 truncate">
            {highestCategory ? highestCategory.category : '—'}
          </p>
          <p className="mt-1.5 text-xs text-neutral-600 font-mono-num">
            {highestCategory
              ? `${formatINR(highestCategory.amount)} (${highestCategory.percentage}%)`
              : 'No expenses'}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-neutral-500">vs {prevMonthLabel}</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950 font-mono-num">
            {comparison.previousExpenses > 0
              ? `${comparison.deltaAmount >= 0 ? '+' : ''}${formatINR(comparison.deltaAmount)}`
              : '—'}
          </p>
          <p className="mt-1.5 text-xs text-neutral-600 tabular-nums">
            {comparison.previousExpenses > 0
              ? `${comparison.deltaAmount >= 0 ? '+' : ''}${comparison.deltaPercent}% spending change`
              : 'No prior month baseline'}
          </p>
        </div>
      </section>

      {/* Chart + Comparison Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <h2 className="text-base font-semibold text-neutral-950">Category Spend Distribution</h2>
          <p className="text-xs text-neutral-500 mt-0.5 mb-5">
            Amount spent per category during {monthLabel}
          </p>

          {breakdown.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-sm text-neutral-500">
              No expense data available for {monthLabel}.
            </div>
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={breakdown}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5E5" />
                  <XAxis
                    type="number"
                    tick={{ fill: '#525252', fontSize: 11 }}
                    axisLine={{ stroke: '#E5E5E5' }}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: '#171717', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={96}
                    interval={0}
                  />
                  <Tooltip
                    formatter={(val) => [formatINR(Number(val ?? 0)), 'Spent']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e5e5',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#0A0A0A" radius={[0, 4, 4, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Month Comparison Card */}
        <div className="lg:col-span-5 rounded-xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-950">Previous Month Comparison</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {monthLabel} compared against {prevMonthLabel}
            </p>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <dt className="text-sm text-neutral-600">{monthLabel} expenses</dt>
                <dd className="text-sm font-semibold text-neutral-950 font-mono-num">
                  {formatINR(comparison.currentExpenses)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <dt className="text-sm text-neutral-600">{prevMonthLabel} expenses</dt>
                <dd className="text-sm font-semibold text-neutral-950 font-mono-num">
                  {formatINR(comparison.previousExpenses)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <dt className="text-sm text-neutral-600">Net variance</dt>
                <dd className="text-sm font-semibold text-neutral-950 font-mono-num">
                  {comparison.deltaAmount >= 0 ? '+' : ''}
                  {formatINR(comparison.deltaAmount)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-600">Net monthly savings</dt>
                <dd className="text-sm font-semibold text-neutral-950 font-mono-num">
                  {formatINR(summary.remainingBalance)} ({summary.savingsRate}%)
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Category-wise Breakdown Table */}
      <section className="rounded-xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-200">
          <h2 className="text-base font-semibold text-neutral-950">Category-wise Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500">
                <th className="py-3 px-5 sm:px-6">Category</th>
                <th className="py-3 px-4 text-right">Transactions</th>
                <th className="py-3 px-4 text-right">Share</th>
                <th className="py-3 px-5 sm:px-6 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {breakdown.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-neutral-500">
                    No category expenses recorded for {monthLabel}.
                  </td>
                </tr>
              ) : (
                breakdown.map((item) => (
                  <tr key={item.category} className="hover:bg-neutral-50/70">
                    <td className="py-3 px-5 sm:px-6 font-medium text-neutral-950">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-600 font-mono-num">
                      {item.count}
                    </td>
                    <td className="py-3 px-4 text-right text-neutral-600 font-mono-num">
                      {item.percentage}%
                    </td>
                    <td className="py-3 px-5 sm:px-6 text-right font-semibold text-neutral-950 font-mono-num">
                      {formatINR(item.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
