import { Budget, Transaction, UserProfile } from '../types/finance';

export const AVAILABLE_MONTHS = [
  { key: '2026-11', label: 'November 2026' },
  { key: '2026-10', label: 'October 2026' },
  { key: '2026-09', label: 'September 2026' },
  { key: '2026-08', label: 'August 2026' },
  { key: '2026-07', label: 'July 2026' },
  { key: '2026-06', label: 'June 2026' },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@smartspend.in',
  role: 'Product Analyst · Bengaluru',
  currency: 'INR',
  monthlySavingsGoal: 15000,
  aiAutoCategorize: true,
  unusualSpendAlerts: true,
  weeklyDigest: false,
};

// November 2026 totals:
// Income: 42,000 + 3,000 = ₹45,000 (2 transactions)
// Expenses: ₹28,500 (46 transactions)
// Remaining Balance: ₹16,500
// Total Transactions: 48
export const SEED_TRANSACTIONS: Transaction[] = [
  // --- November 2026 (48 transactions) ---
  { id: 'nov-01', date: '2026-11-17', description: 'Swiggy', amount: 350, type: 'expense', category: 'Food', source: 'statement', confidence: 0.96 },
  { id: 'nov-02', date: '2026-11-17', description: 'Uber', amount: 180, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.95 },
  { id: 'nov-03', date: '2026-11-16', description: 'Amazon', amount: 1200, type: 'expense', category: 'Shopping', source: 'statement', confidence: 0.93 },
  { id: 'nov-04', date: '2026-11-15', description: 'Netflix', amount: 649, type: 'expense', category: 'Entertainment', source: 'statement', confidence: 0.98 },
  { id: 'nov-05', date: '2026-11-14', description: 'BESCOM', amount: 1500, type: 'expense', category: 'Utilities', source: 'statement', confidence: 0.97 },
  { id: 'nov-06', date: '2026-11-12', description: 'College Fees', amount: 8000, type: 'expense', category: 'Education', source: 'statement', confidence: 0.99 },
  { id: 'nov-07', date: '2026-11-10', description: 'Freelance UI Consultation', amount: 3000, type: 'income', category: 'Income', source: 'statement', confidence: 0.98 },
  { id: 'nov-08', date: '2026-11-01', description: 'Salary Credit - TechCorp India', amount: 42000, type: 'income', category: 'Income', source: 'statement', confidence: 0.99 },

  // Food (13 additional = 5215 - 302 = 4913)
  { id: 'nov-09', date: '2026-11-16', description: 'BigBasket Groceries', amount: 1148, type: 'expense', category: 'Food', source: 'statement', confidence: 0.95 },
  { id: 'nov-10', date: '2026-11-15', description: 'Zomato Dinner', amount: 420, type: 'expense', category: 'Food', source: 'statement', confidence: 0.95 },
  { id: 'nov-11', date: '2026-11-14', description: 'Zepto Essentials', amount: 340, type: 'expense', category: 'Food', source: 'statement', confidence: 0.94 },
  { id: 'nov-12', date: '2026-11-13', description: 'Third Wave Coffee', amount: 220, type: 'expense', category: 'Food', source: 'statement', confidence: 0.93 },
  { id: 'nov-13', date: '2026-11-12', description: 'Blinkit Fresh Produce', amount: 310, type: 'expense', category: 'Food', source: 'statement', confidence: 0.94 },
  { id: 'nov-14', date: '2026-11-11', description: 'Udupi Upahar Breakfast', amount: 140, type: 'expense', category: 'Food', source: 'statement', confidence: 0.91 },
  { id: 'nov-15', date: '2026-11-10', description: 'Swiggy Instamart', amount: 410, type: 'expense', category: 'Food', source: 'statement', confidence: 0.95 },
  { id: 'nov-16', date: '2026-11-09', description: 'Chai Point', amount: 110, type: 'expense', category: 'Food', source: 'statement', confidence: 0.92 },
  { id: 'nov-17', date: '2026-11-08', description: 'Haldiram Snacks', amount: 240, type: 'expense', category: 'Food', source: 'statement', confidence: 0.90 },
  { id: 'nov-18', date: '2026-11-07', description: 'Nandini Milk & Dairy', amount: 160, type: 'expense', category: 'Food', source: 'statement', confidence: 0.93 },
  { id: 'nov-19', date: '2026-11-06', description: 'EatFit Lunch Bowl', amount: 255, type: 'expense', category: 'Food', source: 'statement', confidence: 0.92 },
  { id: 'nov-20', date: '2026-11-04', description: 'Domino Pizza', amount: 480, type: 'expense', category: 'Food', source: 'statement', confidence: 0.96 },
  { id: 'nov-21', date: '2026-11-02', description: 'Ratnadeep Supermarket', amount: 680, type: 'expense', category: 'Food', source: 'statement', confidence: 0.94 },

  // Transport (8 additional = 3345)
  { id: 'nov-22', date: '2026-11-16', description: 'Namma Metro Card Top-up', amount: 400, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.95 },
  { id: 'nov-23', date: '2026-11-13', description: 'HPCL Petrol Station', amount: 950, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.96 },
  { id: 'nov-24', date: '2026-11-11', description: 'Rapido Auto', amount: 85, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.94 },
  { id: 'nov-25', date: '2026-11-09', description: 'Ola Cab Airport Drop', amount: 520, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.95 },
  { id: 'nov-26', date: '2026-11-07', description: 'Uber Commute', amount: 190, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.95 },
  { id: 'nov-27', date: '2026-11-05', description: 'Metro Rail Smart Card', amount: 250, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.94 },
  { id: 'nov-28', date: '2026-11-03', description: 'BMTC Bus Pass', amount: 300, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.92 },
  { id: 'nov-29', date: '2026-11-02', description: 'Shell Fuel Station', amount: 650, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.96 },

  // Shopping (5 additional = 3047)
  { id: 'nov-30', date: '2026-11-14', description: 'Myntra Apparel', amount: 1150, type: 'expense', category: 'Shopping', source: 'statement', confidence: 0.92 },
  { id: 'nov-31', date: '2026-11-10', description: 'Decathlon Sports', amount: 649, type: 'expense', category: 'Shopping', source: 'statement', confidence: 0.91 },
  { id: 'nov-32', date: '2026-11-08', description: 'Flipkart Electronics', amount: 550, type: 'expense', category: 'Shopping', source: 'statement', confidence: 0.93 },
  { id: 'nov-33', date: '2026-11-05', description: 'Croma USB-C Cable', amount: 399, type: 'expense', category: 'Shopping', source: 'statement', confidence: 0.90 },
  { id: 'nov-34', date: '2026-11-03', description: 'Reliance Digital', amount: 299, type: 'expense', category: 'Shopping', source: 'statement', confidence: 0.91 },

  // Utilities (4 additional = 2328)
  { id: 'nov-35', date: '2026-11-11', description: 'Airtel Fiber Broadband', amount: 799, type: 'expense', category: 'Utilities', source: 'statement', confidence: 0.97 },
  { id: 'nov-36', date: '2026-11-09', description: 'Jio Mobile Postpaid', amount: 399, type: 'expense', category: 'Utilities', source: 'statement', confidence: 0.96 },
  { id: 'nov-37', date: '2026-11-06', description: 'Indane LPG Refill', amount: 850, type: 'expense', category: 'Utilities', source: 'statement', confidence: 0.95 },
  { id: 'nov-38', date: '2026-11-04', description: 'BWSSB Water Bill', amount: 280, type: 'expense', category: 'Utilities', source: 'statement', confidence: 0.95 },

  // Entertainment (4 additional = 1488)
  { id: 'nov-39', date: '2026-11-13', description: 'BookMyShow IMAX', amount: 480, type: 'expense', category: 'Entertainment', source: 'statement', confidence: 0.95 },
  { id: 'nov-40', date: '2026-11-08', description: 'Spotify Duo', amount: 149, type: 'expense', category: 'Entertainment', source: 'statement', confidence: 0.96 },
  { id: 'nov-41', date: '2026-11-05', description: 'PlayStation Store', amount: 499, type: 'expense', category: 'Entertainment', source: 'statement', confidence: 0.93 },
  { id: 'nov-42', date: '2026-11-02', description: 'PVR Cinema', amount: 360, type: 'expense', category: 'Entertainment', source: 'statement', confidence: 0.94 },

  // Healthcare (4 additional = 1300)
  { id: 'nov-43', date: '2026-11-15', description: 'Apollo Pharmacy', amount: 340, type: 'expense', category: 'Healthcare', source: 'statement', confidence: 0.95 },
  { id: 'nov-44', date: '2026-11-11', description: '1mg Lab Test', amount: 450, type: 'expense', category: 'Healthcare', source: 'statement', confidence: 0.94 },
  { id: 'nov-45', date: '2026-11-06', description: 'Practo Consultation', amount: 300, type: 'expense', category: 'Healthcare', source: 'statement', confidence: 0.93 },
  { id: 'nov-46', date: '2026-11-03', description: 'MedPlus Medicines', amount: 210, type: 'expense', category: 'Healthcare', source: 'statement', confidence: 0.94 },

  // Education & Other (2 additional = 200)
  { id: 'nov-47', date: '2026-11-07', description: 'Crossword Bookstore', amount: 120, type: 'expense', category: 'Education', source: 'statement', confidence: 0.92 },
  { id: 'nov-48', date: '2026-11-04', description: 'India Post Courier', amount: 80, type: 'expense', category: 'Other', source: 'statement', confidence: 0.85 },

  // --- October 2026 (Income 44,000, Expenses 24,800) ---
  { id: 'oct-01', date: '2026-10-01', description: 'Salary Credit - TechCorp India', amount: 42000, type: 'income', category: 'Income', source: 'statement', confidence: 0.99 },
  { id: 'oct-02', date: '2026-10-14', description: 'Dividend & Interest Credit', amount: 2000, type: 'income', category: 'Income', source: 'statement', confidence: 0.95 },
  { id: 'oct-03', date: '2026-10-28', description: 'BigBasket Groceries', amount: 3250, type: 'expense', category: 'Food', source: 'statement', confidence: 0.95 },
  { id: 'oct-04', date: '2026-10-25', description: 'Swiggy', amount: 1850, type: 'expense', category: 'Food', source: 'statement', confidence: 0.96 },
  { id: 'oct-05', date: '2026-10-22', description: 'BESCOM Electricity', amount: 1620, type: 'expense', category: 'Utilities', source: 'statement', confidence: 0.97 },
  { id: 'oct-06', date: '2026-10-20', description: 'Airtel Fiber Broadband', amount: 799, type: 'expense', category: 'Utilities', source: 'statement', confidence: 0.97 },
  { id: 'oct-07', date: '2026-10-18', description: 'Amazon Festive Sale', amount: 4800, type: 'expense', category: 'Shopping', source: 'statement', confidence: 0.94 },
  { id: 'oct-08', date: '2026-10-15', description: 'Uber & Metro Commute', amount: 2450, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.95 },
  { id: 'oct-09', date: '2026-10-12', description: 'HPCL Petrol Station', amount: 1400, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.96 },
  { id: 'oct-10', date: '2026-10-10', description: 'Netflix & BookMyShow', amount: 1430, type: 'expense', category: 'Entertainment', source: 'statement', confidence: 0.95 },
  { id: 'oct-11', date: '2026-10-08', description: 'House Maintenance', amount: 4500, type: 'expense', category: 'Housing', source: 'statement', confidence: 0.94 },
  { id: 'oct-12', date: '2026-10-05', description: 'Apollo Pharmacy', amount: 901, type: 'expense', category: 'Healthcare', source: 'statement', confidence: 0.95 },
  { id: 'oct-13', date: '2026-10-03', description: 'Udemy Tech Course', amount: 1800, type: 'expense', category: 'Education', source: 'statement', confidence: 0.96 },

  // --- September 2026 (Income 42,000, Expenses 22,400) ---
  { id: 'sep-01', date: '2026-09-01', description: 'Salary Credit - TechCorp India', amount: 42000, type: 'income', category: 'Income', source: 'statement', confidence: 0.99 },
  { id: 'sep-02', date: '2026-09-24', description: 'Swiggy & Zomato', amount: 4400, type: 'expense', category: 'Food', source: 'statement', confidence: 0.96 },
  { id: 'sep-03', date: '2026-09-20', description: 'BESCOM & Airtel Fiber', amount: 2950, type: 'expense', category: 'Utilities', source: 'statement', confidence: 0.96 },
  { id: 'sep-04', date: '2026-09-17', description: 'Uber & Petrol', amount: 3100, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.95 },
  { id: 'sep-05', date: '2026-09-14', description: 'Myntra & Amazon', amount: 3850, type: 'expense', category: 'Shopping', source: 'statement', confidence: 0.93 },
  { id: 'sep-06', date: '2026-09-10', description: 'House Maintenance', amount: 4500, type: 'expense', category: 'Housing', source: 'statement', confidence: 0.94 },
  { id: 'sep-07', date: '2026-09-06', description: 'Netflix & PVR Cinema', amount: 1600, type: 'expense', category: 'Entertainment', source: 'statement', confidence: 0.95 },
  { id: 'sep-08', date: '2026-09-04', description: '1mg Lab & Pharmacy', amount: 2000, type: 'expense', category: 'Healthcare', source: 'statement', confidence: 0.94 },

  // --- August 2026 (Income 42,000, Expenses 26,100) ---
  { id: 'aug-01', date: '2026-08-01', description: 'Salary Credit - TechCorp India', amount: 42000, type: 'income', category: 'Income', source: 'statement', confidence: 0.99 },
  { id: 'aug-02', date: '2026-08-22', description: 'BigBasket & Swiggy', amount: 5200, type: 'expense', category: 'Food', source: 'statement', confidence: 0.95 },
  { id: 'aug-03', date: '2026-08-18', description: 'Flipkart & Amazon', amount: 6100, type: 'expense', category: 'Shopping', source: 'statement', confidence: 0.93 },
  { id: 'aug-04', date: '2026-08-15', description: 'Uber, Metro & Fuel', amount: 3600, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.95 },
  { id: 'aug-05', date: '2026-08-12', description: 'BESCOM & Broadband', amount: 3100, type: 'expense', category: 'Utilities', source: 'statement', confidence: 0.96 },
  { id: 'aug-06', date: '2026-08-08', description: 'House Maintenance', amount: 4500, type: 'expense', category: 'Housing', source: 'statement', confidence: 0.94 },
  { id: 'aug-07', date: '2026-08-05', description: 'Coursera Annual Plan', amount: 3600, type: 'expense', category: 'Education', source: 'statement', confidence: 0.96 },

  // --- July 2026 (Income 43,500, Expenses 23,200) ---
  { id: 'jul-01', date: '2026-07-01', description: 'Salary Credit - TechCorp India', amount: 42000, type: 'income', category: 'Income', source: 'statement', confidence: 0.99 },
  { id: 'jul-02', date: '2026-07-14', description: 'Freelance Design Audit', amount: 1500, type: 'income', category: 'Income', source: 'statement', confidence: 0.97 },
  { id: 'jul-03', date: '2026-07-21', description: 'BigBasket & Dining', amount: 4800, type: 'expense', category: 'Food', source: 'statement', confidence: 0.95 },
  { id: 'jul-04', date: '2026-07-18', description: 'Utilities & Mobile', amount: 3200, type: 'expense', category: 'Utilities', source: 'statement', confidence: 0.96 },
  { id: 'jul-05', date: '2026-07-12', description: 'Transport & Petrol', amount: 3400, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.95 },
  { id: 'jul-06', date: '2026-07-09', description: 'Amazon Shopping', amount: 4200, type: 'expense', category: 'Shopping', source: 'statement', confidence: 0.93 },
  { id: 'jul-07', date: '2026-07-06', description: 'House Maintenance', amount: 4500, type: 'expense', category: 'Housing', source: 'statement', confidence: 0.94 },
  { id: 'jul-08', date: '2026-07-03', description: 'Healthcare & Streaming', amount: 3100, type: 'expense', category: 'Entertainment', source: 'statement', confidence: 0.90 },

  // --- June 2026 (Income 40,000, Expenses 21,900) ---
  { id: 'jun-01', date: '2026-06-01', description: 'Salary Credit - TechCorp India', amount: 40000, type: 'income', category: 'Income', source: 'statement', confidence: 0.99 },
  { id: 'jun-02', date: '2026-06-20', description: 'Groceries & Food', amount: 4600, type: 'expense', category: 'Food', source: 'statement', confidence: 0.95 },
  { id: 'jun-03', date: '2026-06-16', description: 'Electricity & Broadband', amount: 2900, type: 'expense', category: 'Utilities', source: 'statement', confidence: 0.96 },
  { id: 'jun-04', date: '2026-06-12', description: 'Metro & Fuel', amount: 3200, type: 'expense', category: 'Transport', source: 'statement', confidence: 0.95 },
  { id: 'jun-05', date: '2026-06-09', description: 'Shopping & Gear', amount: 4900, type: 'expense', category: 'Shopping', source: 'statement', confidence: 0.92 },
  { id: 'jun-06', date: '2026-06-05', description: 'House Maintenance', amount: 4500, type: 'expense', category: 'Housing', source: 'statement', confidence: 0.94 },
  { id: 'jun-07', date: '2026-06-03', description: 'Entertainment & Cinema', amount: 1800, type: 'expense', category: 'Entertainment', source: 'statement', confidence: 0.93 },
];

export const SEED_BUDGETS: Budget[] = [
  { id: 'b-food', category: 'Food', limit: 6000, month: '2026-11' },
  { id: 'b-transport', category: 'Transport', limit: 4000, month: '2026-11' },
  { id: 'b-shopping', category: 'Shopping', limit: 4000, month: '2026-11' },
  { id: 'b-utilities', category: 'Utilities', limit: 4200, month: '2026-11' },
  { id: 'b-entertainment', category: 'Entertainment', limit: 2500, month: '2026-11' },
  { id: 'b-education', category: 'Education', limit: 8500, month: '2026-11' },
  { id: 'b-healthcare', category: 'Healthcare', limit: 2000, month: '2026-11' },
];

export const SAMPLE_BANK_CSV = `Date,Description,Debit,Credit
18/11/2026,"Swiggy Order - Koramangala",425,0
18/11/2026,"Uber Premier Ride",240,0
17/11/2026,"Amazon India Marketplace",1899,0
17/11/2026,"Airtel Postpaid Bill",599,0
16/11/2026,"Apollo Pharmacy Bengaluru",380,0
16/11/2026,"Project Bonus Credit",0,5000
15/11/2026,"BookMyShow IMAX Ticket",550,0
14/11/2026,"Coursera Data Analytics",1499,0`;
