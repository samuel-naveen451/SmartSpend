import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { Budget, Category, EXPENSE_CATEGORIES, Transaction } from '../types/finance';
import { computeCategoryBreakdown } from '../utils/categorizer';
import { formatINR, formatMonthLabel } from '../utils/format';

interface BudgetsPageProps {
  budgets: Budget[];
  transactions: Transaction[];
  selectedMonth: string;
  onUpsertBudget: (category: Exclude<Category, 'Income'>, limit: number, month: string) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({
  budgets,
  transactions,
  selectedMonth,
  onUpsertBudget,
  onDeleteBudget,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formCategory, setFormCategory] = useState<Exclude<Category, 'Income'>>('Food');
  const [formLimit, setFormLimit] = useState('5000');
  const [formError, setFormError] = useState<string | null>(null);

  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === selectedMonth),
    [budgets, selectedMonth]
  );

  // Fallback to November limits if user views an earlier month without explicit custom limits
  const effectiveBudgets = useMemo(() => {
    if (monthBudgets.length > 0) return monthBudgets;
    return budgets
      .filter((b) => b.month === '2026-11')
      .map((b) => ({ ...b, month: selectedMonth }));
  }, [monthBudgets, budgets, selectedMonth]);

  const breakdown = useMemo(
    () => computeCategoryBreakdown(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of breakdown) {
      map.set(item.category, item.amount);
    }
    return map;
  }, [breakdown]);

  const totals = useMemo(() => {
    let totalLimit = 0;
    let totalSpent = 0;
    for (const b of effectiveBudgets) {
      totalLimit += b.limit;
      totalSpent += spentByCategory.get(b.category) ?? 0;
    }
    const remaining = totalLimit - totalSpent;
    const pct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
    return { totalLimit, totalSpent, remaining, pct };
  }, [effectiveBudgets, spentByCategory]);

  const openEdit = (category: Exclude<Category, 'Income'>, limit: number) => {
    setFormCategory(category);
    setFormLimit(String(limit));
    setFormError(null);
    setModalOpen(true);
  };

  const openNew = () => {
    const existingCats = new Set(effectiveBudgets.map((b) => b.category));
    const available =
      (EXPENSE_CATEGORIES.find((c) => c !== 'Income' && !existingCats.has(c as Exclude<Category, 'Income'>)) as Exclude<Category, 'Income'>) ||
      'Food';
    setFormCategory(available);
    setFormLimit('3000');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(formLimit);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setFormError('Budget limit must be greater than ₹0.');
      return;
    }
    setFormError(null);
    onUpsertBudget(formCategory, Math.round(numeric), selectedMonth);
    setModalOpen(false);
  };

  const monthLabel = formatMonthLabel(selectedMonth);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
            Monthly Budgets
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Category spending limits and remaining allowances for {monthLabel}.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add or edit budget</span>
        </button>
      </div>

      {/* Overview Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-neutral-500">Total Monthly Budget</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950 font-mono-num">
            {formatINR(totals.totalLimit)}
          </p>
          <p className="mt-1.5 text-xs text-neutral-600">
            Across {effectiveBudgets.length} categories
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-neutral-500">Budgeted Spend</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950 font-mono-num">
            {formatINR(totals.totalSpent)}
          </p>
          <p className="mt-1.5 text-xs text-neutral-600 tabular-nums">
            {totals.pct}% of total budget used
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p className="text-xs font-medium text-neutral-500">Remaining Allowance</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-950 font-mono-num">
            {formatINR(totals.remaining)}
          </p>
          <p className="mt-1.5 text-xs text-neutral-600">
            {totals.remaining >= 0 ? 'Within monthly target' : 'Over overall monthly budget'}
          </p>
        </div>
      </section>

      {/* Category-wise Budget Limits */}
      <section aria-label="Category budgets" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {effectiveBudgets.map((budget) => {
          const spent = spentByCategory.get(budget.category) ?? 0;
          const remaining = budget.limit - spent;
          const pctRaw = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
          const barWidth = Math.min(100, pctRaw);
          const isOver = spent > budget.limit;

          return (
            <div
              key={budget.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-neutral-950">{budget.category}</h2>
                  <p className="text-xs text-neutral-500 mt-0.5 font-mono-num">
                    {formatINR(spent)} spent of {formatINR(budget.limit)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(budget.category, budget.limit)}
                    aria-label={`Edit ${budget.category} budget`}
                    className="p-1.5 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {monthBudgets.some((mb) => mb.id === budget.id) && (
                    <button
                      type="button"
                      onClick={() => onDeleteBudget(budget.id)}
                      aria-label={`Delete ${budget.category} budget`}
                      className="p-1.5 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isOver ? 'bg-neutral-950' : 'bg-neutral-800'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span className={`font-medium ${isOver ? 'text-neutral-950' : 'text-neutral-600'}`}>
                    {isOver
                      ? `Over limit by ${formatINR(Math.abs(remaining))}`
                      : `${formatINR(remaining)} remaining`}
                  </span>
                  <span className="font-mono-num font-semibold text-neutral-900">{pctRaw}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Add / Edit Budget Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="budget-modal-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 id="budget-modal-title" className="text-lg font-semibold text-neutral-950">
                Set category budget
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close budget modal"
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-neutral-300 bg-neutral-100 px-3 py-2 text-xs text-neutral-900"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="budget-category" className="block text-xs font-medium text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  id="budget-category"
                  value={formCategory}
                  onChange={(e) =>
                    setFormCategory(e.target.value as Exclude<Category, 'Income'>)
                  }
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 focus:outline-none focus:border-neutral-950"
                >
                  {EXPENSE_CATEGORIES.filter((c) => c !== 'Income').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="budget-limit" className="block text-xs font-medium text-neutral-700 mb-1">
                  Monthly Limit (₹)
                </label>
                <input
                  id="budget-limit"
                  type="number"
                  min="1"
                  step="100"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 font-mono-num focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 cursor-pointer"
                >
                  Save budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
