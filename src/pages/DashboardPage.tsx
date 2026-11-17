import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { AVAILABLE_MONTHS } from '../data/seedData';
import { PageRoute, Transaction } from '../types/finance';
import {
  compareWithPreviousMonth,
  computeCategoryBreakdown,
  computeMonthlyTrend,
  computeMonthSummary,
  generateSpendingInsights,
  getMonthTransactions,
} from '../utils/categorizer';
import { formatDateShort, formatINR, formatMonthLabel } from '../utils/format';

interface DashboardPageProps {
  transactions: Transaction[];
  selectedMonth: string;
  onNavigate: (route: PageRoute) => void;
}

const MONOCHROME_SHADES = [
  '#0A0A0A',
  '#2E2E2E',
  '#525252',
  '#737373',
  '#9CA3AF',
  '#C4C4C4',
  '#E0E0E0',
  '#F0F0F0',
];

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  dataKey?: string;
}

const MonochromeTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-sm text-xs">
      {label && <p className="font-semibold text-neutral-950 mb-1">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-neutral-700">
            <span className="capitalize">{entry.name || entry.dataKey}</span>
            <span className="font-mono-num font-medium text-neutral-950">
              {formatINR(Number(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  transactions,
  selectedMonth,
  onNavigate,
}) => {
  const summary = useMemo(
    () => computeMonthSummary(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const breakdown = useMemo(
    () => computeCategoryBreakdown(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const trendMonths = useMemo(
    () => [...AVAILABLE_MONTHS].map((m) => m.key).reverse(),
    []
  );

  const monthlyTrend = useMemo(
    () => computeMonthlyTrend(transactions, trendMonths),
    [transactions, trendMonths]
  );

  const comparison = useMemo(
    () => compareWithPreviousMonth(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const insights = useMemo(
    () => generateSpendingInsights(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const recentTransactions = useMemo(() => {
    return getMonthTransactions(transactions, selectedMonth)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8);
  }, [transactions, selectedMonth]);

  const monthLabel = formatMonthLabel(selectedMonth);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
            Financial Overview
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Summary and spending analytics for {monthLabel}.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors whitespace-nowrap"
          >
            View report
          </button>
          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap"
          >
            <Upload className="h-4 w-4" />
            <span>Upload CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Summary Cards */}
      <section aria-label="Financial summary" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-neutral-500">Total Income</p>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950 font-mono-num">
            {formatINR(summary.totalIncome)}
          </p>
          <p className="mt-2 text-xs text-neutral-600">
            Credited in {monthLabel}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-neutral-500">Total Expenses</p>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950 font-mono-num">
            {formatINR(summary.totalExpenses)}
          </p>
          <p className="mt-2 text-xs text-neutral-600 tabular-nums">
            {comparison.previousExpenses > 0
              ? `${comparison.deltaAmount >= 0 ? '+' : ''}${comparison.deltaPercent}% vs previous month`
              : 'Tracked across categories'}
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-neutral-500">Remaining Balance</p>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950 font-mono-num">
            {formatINR(summary.remainingBalance)}
          </p>
          <p className="mt-2 text-xs text-neutral-600 tabular-nums">
            {summary.savingsRate}% net savings rate
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-neutral-500">Transactions</p>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950 font-mono-num">
            {summary.transactionCount}
          </p>
          <p className="mt-2 text-xs text-neutral-600">
            Auto-categorized entries
          </p>
        </div>
      </section>

      {/* Spending Analytics Charts */}
      <section aria-label="Spending analytics" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Income vs Expense Bar Chart */}
        <div className="lg:col-span-7 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                Monthly Income vs Expenses
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Six-month cash flow comparison in INR
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-600 shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-neutral-950 inline-block" aria-hidden="true" />
                Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-neutral-400 inline-block" aria-hidden="true" />
                Expenses
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#525252', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E5E5' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#525252', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  width={46}
                />
                <Tooltip content={<MonochromeTooltip />} cursor={{ fill: '#F5F5F5' }} />
                <Bar dataKey="income" name="Income" fill="#0A0A0A" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expenses" name="Expenses" fill="#A3A3A3" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category-wise Expense Donut Chart */}
        <div className="lg:col-span-5 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-neutral-950">
              Category Breakdown
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Expense distribution for {monthLabel}
            </p>
          </div>

          {breakdown.length === 0 ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-center px-4">
              <p className="text-sm font-medium text-neutral-700">No expenses logged this month</p>
              <button
                type="button"
                onClick={() => onNavigate('upload')}
                className="mt-3 px-4 py-2 rounded-lg bg-neutral-950 text-white text-xs font-medium hover:bg-neutral-800"
              >
                Upload statement
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4">
              <div className="sm:col-span-5 h-[220px] w-full">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={2}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    >
                      {breakdown.map((entry, idx) => (
                        <Cell
                          key={entry.category}
                          fill={MONOCHROME_SHADES[idx % MONOCHROME_SHADES.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<MonochromeTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="sm:col-span-7 space-y-2.5">
                {breakdown.slice(0, 7).map((item, idx) => (
                  <div key={item.category} className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-sm shrink-0 border border-neutral-300"
                        style={{
                          backgroundColor: MONOCHROME_SHADES[idx % MONOCHROME_SHADES.length],
                        }}
                        aria-hidden="true"
                      />
                      <span className="text-neutral-800 font-medium whitespace-nowrap">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono-num text-neutral-600">
                      <span className="text-neutral-950 font-medium">{formatINR(item.amount)}</span>
                      <span className="w-10 text-right">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Spending Trend + AI Insights */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Spending Trend */}
        <div className="lg:col-span-6 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                Monthly Spending Trend
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Expense trajectory over the past six months
              </p>
            </div>
            <TrendingUp className="h-4 w-4 text-neutral-500 shrink-0" aria-hidden="true" />
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="monoSpendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#171717" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#171717" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#525252', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E5E5' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#525252', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
                  width={46}
                />
                <Tooltip content={<MonochromeTooltip />} />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#0A0A0A"
                  strokeWidth={2}
                  fill="url(#monoSpendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Spending Insights */}
        <div className="lg:col-span-6 rounded-xl border border-neutral-200 bg-neutral-50 p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                Spending Insights
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Automated patterns and unusual activity for {monthLabel}
              </p>
            </div>
            <BrainCircuit className="h-4 w-4 text-neutral-600 shrink-0" aria-hidden="true" />
          </div>

          {insights.length === 0 ? (
            <p className="text-sm text-neutral-600 py-8 text-center">
              Upload a bank statement to generate automated spending insights.
            </p>
          ) : (
            <div className="divide-y divide-neutral-200">
              {insights.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {item.kind === 'unusual' && (
                        <AlertCircle className="h-3.5 w-3.5 text-neutral-900 shrink-0" aria-hidden="true" />
                      )}
                      <p className="text-sm font-medium text-neutral-950">{item.title}</p>
                    </div>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{item.detail}</p>
                  </div>
                  <span className="text-xs font-semibold text-neutral-950 font-mono-num whitespace-nowrap shrink-0">
                    {item.metric}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Transactions Table */}
      <section
        aria-label="Recent transactions"
        className="rounded-xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden"
      >
        <div className="px-5 sm:px-6 py-4 border-b border-neutral-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-950">Recent Transactions</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Latest entries recorded for {monthLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('transactions')}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-neutral-900 hover:text-neutral-600 whitespace-nowrap"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-neutral-600">No transactions found for {monthLabel}.</p>
            <button
              type="button"
              onClick={() => onNavigate('upload')}
              className="mt-3 px-4 py-2 rounded-lg bg-neutral-950 text-white text-xs font-medium hover:bg-neutral-800"
            >
              Upload Bank Statement
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-medium text-neutral-500">
                  <th className="py-3 px-5 sm:px-6">Transaction</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-5 sm:px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-5 sm:px-6 font-medium text-neutral-950">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-600 whitespace-nowrap font-mono-num">
                      {formatDateShort(tx.date)}
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-700 whitespace-nowrap">
                      {tx.category}
                    </td>
                    <td className="py-3 px-4 text-xs text-neutral-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        {tx.type === 'income' ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-neutral-900" aria-hidden="true" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-neutral-500" aria-hidden="true" />
                        )}
                        <span>{tx.type === 'income' ? 'Income' : 'Expense'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-5 sm:px-6 text-right font-mono-num font-medium whitespace-nowrap text-neutral-950">
                      {tx.type === 'income' ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
