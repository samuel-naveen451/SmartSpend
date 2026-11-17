import test from 'node:test';
import assert from 'node:assert/strict';
import {
  categorizeTransaction,
  compareWithPreviousMonth,
  computeCategoryBreakdown,
  computeMonthSummary,
  generateSpendingInsights,
  parseBankStatementCsv,
} from './categorizer';
import { formatINR, generateReportCsv } from './format';
import { SAMPLE_BANK_CSV, SEED_TRANSACTIONS } from '../data/seedData';

test('formatINR formats Indian Rupee currency with en-IN grouping', () => {
  assert.equal(formatINR(45000), '₹45,000');
  assert.equal(formatINR(28500), '₹28,500');
  assert.equal(formatINR(120000), '₹1,20,000');
  assert.equal(formatINR(-350), '-₹350');
});

test('November 2026 seed data totals match exact ₹45,000 income, ₹28,500 expenses, ₹16,500 balance, 48 transactions', () => {
  const summary = computeMonthSummary(SEED_TRANSACTIONS, '2026-11');
  assert.equal(summary.totalIncome, 45000);
  assert.equal(summary.totalExpenses, 28500);
  assert.equal(summary.remainingBalance, 16500);
  assert.equal(summary.transactionCount, 48);
});

test('categorizeTransaction maps Indian merchants accurately', () => {
  assert.equal(categorizeTransaction('Swiggy Instamart').category, 'Food');
  assert.equal(categorizeTransaction('Uber Trip').category, 'Transport');
  assert.equal(categorizeTransaction('Amazon Marketplace').category, 'Shopping');
  assert.equal(categorizeTransaction('Netflix Subscription').category, 'Entertainment');
  assert.equal(categorizeTransaction('BESCOM Electricity').category, 'Utilities');
  assert.equal(categorizeTransaction('College Fees').category, 'Education');
  assert.equal(categorizeTransaction('Salary Deposit', true).category, 'Income');
  assert.equal(categorizeTransaction('Unknown Local Vendor').category, 'Other');
});

test('parseBankStatementCsv extracts rows, normalizes DD/MM/YYYY dates, and auto-categorizes', () => {
  const result = parseBankStatementCsv(SAMPLE_BANK_CSV);
  assert.equal(result.error, null);
  assert.equal(result.rows.length, 8);
  assert.equal(result.rows[0].date, '2026-11-18');
  assert.equal(result.rows[0].category, 'Food');
  assert.equal(result.rows[0].debit, 425);
  assert.equal(result.rows[5].credit, 5000);
  assert.equal(result.rows[5].category, 'Income');
});

test('parseBankStatementCsv rejects empty or malformed CSVs', () => {
  const empty = parseBankStatementCsv('Date,Description,Debit,Credit\n');
  assert.ok(empty.error);
  assert.equal(empty.rows.length, 0);

  const missingCols = parseBankStatementCsv('Name,Value\nTest,100');
  assert.ok(missingCols.error);
});

test('computeCategoryBreakdown and generateSpendingInsights identify highest category and month comparison', () => {
  const breakdown = computeCategoryBreakdown(SEED_TRANSACTIONS, '2026-11');
  assert.equal(breakdown[0].category, 'Education');
  assert.equal(breakdown[0].amount, 8120);

  const comparison = compareWithPreviousMonth(SEED_TRANSACTIONS, '2026-11');
  assert.equal(comparison.currentExpenses, 28500);
  assert.equal(comparison.previousExpenses, 24800);
  assert.equal(comparison.deltaAmount, 3700);

  const insights = generateSpendingInsights(SEED_TRANSACTIONS, '2026-11');
  assert.ok(insights.length >= 3);
  assert.ok(insights.some((i) => i.kind === 'highest'));
  assert.ok(insights.some((i) => i.kind === 'unusual'));
});

test('generateReportCsv generates valid CSV text', () => {
  const breakdown = computeCategoryBreakdown(SEED_TRANSACTIONS, '2026-11');
  const novTxs = SEED_TRANSACTIONS.filter((t) => t.date.startsWith('2026-11'));
  const csv = generateReportCsv('2026-11', novTxs, breakdown);
  assert.ok(csv.includes('SmartSpend Monthly Expense Report'));
  assert.ok(csv.includes('College Fees'));
});
