import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { AVAILABLE_MONTHS } from '../data/seedData';
import {
  ALL_CATEGORIES,
  Category,
  Transaction,
  TransactionType,
} from '../types/finance';
import { formatDateShort, formatINR } from '../utils/format';

interface TransactionsPageProps {
  transactions: Transaction[];
  selectedMonth: string;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onUpdateCategory: (id: string, category: Category) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  selectedMonth,
  onAddTransaction,
  onUpdateCategory,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState<string>(selectedMonth);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Manual Transaction Form State
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(`${selectedMonth}-17`);
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<TransactionType>('expense');
  const [newCategory, setNewCategory] = useState<Category>('Food');
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return transactions
      .filter((tx) => {
        if (monthFilter !== 'ALL' && !tx.date.startsWith(monthFilter)) return false;
        if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) return false;
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (query && !tx.description.toLowerCase().includes(query) && !tx.category.toLowerCase().includes(query)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, searchQuery, monthFilter, categoryFilter, typeFilter]);

  const filteredTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filtered) {
      if (tx.type === 'income') income += tx.amount;
      else expense += tx.amount;
    }
    return { income, expense };
  }, [filtered]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(newAmount);
    if (!newDesc.trim()) {
      setFormError('Please enter a merchant or description.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Please enter a valid amount greater than zero.');
      return;
    }
    if (!newDate) {
      setFormError('Please select a transaction date.');
      return;
    }
    setFormError(null);
    onAddTransaction({
      description: newDesc.trim(),
      date: newDate,
      amount: Math.round(numericAmount),
      type: newType,
      category: newType === 'income' ? 'Income' : newCategory,
      source: 'manual',
    });
    setNewDesc('');
    setNewAmount('');
    setShowAddModal(false);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setMonthFilter('ALL');
    setCategoryFilter('ALL');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Search, filter, recategorize, or add manual entries to your ledger.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNewDate(`${selectedMonth}-17`);
            setFormError(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add transaction</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <section
        aria-label="Filter transactions"
        className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col lg:flex-row lg:items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <label htmlFor="tx-search" className="sr-only">
            Search transactions
          </label>
          <input
            id="tx-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by merchant or description..."
            className="w-full rounded-lg border border-neutral-300 bg-white pl-9 pr-3 py-2 text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="tx-month-filter" className="sr-only">
              Filter by month
            </label>
            <select
              id="tx-month-filter"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-950"
            >
              <option value="ALL">All months</option>
              {AVAILABLE_MONTHS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tx-category-filter" className="sr-only">
              Filter by category
            </label>
            <select
              id="tx-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-neutral-950"
            >
              <option value="ALL">All categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div
            role="group"
            aria-label="Filter by income or expense"
            className="inline-flex items-center rounded-lg border border-neutral-300 bg-white p-0.5"
          >
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-neutral-950 text-white'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600 px-1">
        <span className="tabular-nums">
          Showing <strong className="text-neutral-950">{filtered.length}</strong> transactions
        </span>
        <div className="flex items-center gap-4 font-mono-num">
          <span>
            Income: <strong className="text-neutral-950">{formatINR(filteredTotals.income)}</strong>
          </span>
          <span>
            Expenses: <strong className="text-neutral-950">{formatINR(filteredTotals.expense)}</strong>
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <section className="rounded-xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-neutral-900">
              No transactions match your current filters.
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Try clearing search terms or switching the month filter.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-4 py-2 rounded-lg border border-neutral-300 bg-white text-xs font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-medium text-neutral-500">
                  <th className="py-3 px-5 sm:px-6">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-5 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-5 sm:px-6 text-xs text-neutral-600 whitespace-nowrap font-mono-num">
                      {formatDateShort(tx.date)}
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-950">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        aria-label={`Edit category for ${tx.description}`}
                        value={tx.category}
                        onChange={(e) =>
                          onUpdateCategory(tx.id, e.target.value as Category)
                        }
                        className="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-800 hover:border-neutral-400 focus:outline-none focus:border-neutral-950"
                      >
                        {ALL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
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
                    <td className="py-3 px-4 text-right font-mono-num font-medium whitespace-nowrap text-neutral-950">
                      {tx.type === 'income' ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                    </td>
                    <td className="py-3 px-5 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onDeleteTransaction(tx.id)}
                        aria-label={`Delete ${tx.description}`}
                        className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add Manual Transaction Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-tx-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 id="add-tx-title" className="text-lg font-semibold text-neutral-950">
                Add manual transaction
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal"
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

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label htmlFor="manual-type" className="block text-xs font-medium text-neutral-700 mb-1">
                  Transaction type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['expense', 'income'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewType(t)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium capitalize border transition-colors ${
                        newType === t
                          ? 'bg-neutral-950 text-white border-neutral-950'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="manual-desc" className="block text-xs font-medium text-neutral-700 mb-1">
                  Description / Merchant
                </label>
                <input
                  id="manual-desc"
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Swiggy Dinner"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="manual-amount" className="block text-xs font-medium text-neutral-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    id="manual-amount"
                    type="number"
                    min="1"
                    step="1"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="350"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 font-mono-num focus:outline-none focus:border-neutral-950"
                  />
                </div>
                <div>
                  <label htmlFor="manual-date" className="block text-xs font-medium text-neutral-700 mb-1">
                    Date
                  </label>
                  <input
                    id="manual-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 font-mono-num focus:outline-none focus:border-neutral-950"
                  />
                </div>
              </div>

              {newType === 'expense' && (
                <div>
                  <label htmlFor="manual-category" className="block text-xs font-medium text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    id="manual-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 focus:outline-none focus:border-neutral-950"
                  >
                    {ALL_CATEGORIES.filter((c) => c !== 'Income').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-800 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 cursor-pointer"
                >
                  Save transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
