import React, { useState } from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  Settings,
  Upload,
  User,
  X,
} from 'lucide-react';
import { AVAILABLE_MONTHS } from '../data/seedData';
import { PageRoute, UserProfile } from '../types/finance';
import { BrandMark } from './BrandMark';

interface AppShellProps {
  route: PageRoute;
  onNavigate: (route: PageRoute) => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  userProfile: UserProfile;
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { id: PageRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'upload', label: 'Upload Statement', icon: Upload },
  { id: 'budgets', label: 'Budgets', icon: PieChart },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const AppShell: React.FC<AppShellProps> = ({
  route,
  onNavigate,
  selectedMonth,
  onSelectMonth,
  userProfile,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const firstName = userProfile.name.split(' ')[0] || 'User';

  const handleNavClick = (target: PageRoute) => {
    onNavigate(target);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-neutral-200 bg-neutral-50/70">
        <div className="flex h-16 items-center px-6 border-b border-neutral-200 bg-white">
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-md"
            aria-label="Go to SmartSpend Dashboard"
          >
            <BrandMark />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = route === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-neutral-950 text-white'
                    : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-950'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-200 bg-white">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-950 truncate">{userProfile.name}</p>
              <p className="text-xs text-neutral-500 truncate">{userProfile.email}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Sign out"
              title="Sign out"
              className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-neutral-950/30"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-white border-r border-neutral-200 flex flex-col h-full">
            <div className="flex h-16 items-center justify-between px-5 border-b border-neutral-200">
              <BrandMark />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-5 space-y-1" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = route === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-neutral-950 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-neutral-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-neutral-700 hover:bg-neutral-100 shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold text-neutral-950 truncate">
                <span className="sm:hidden">Hi, {firstName}</span>
                <span className="hidden sm:inline">Welcome back, {firstName}</span>
              </p>
              <p className="hidden sm:block text-xs text-neutral-500 truncate">
                Personal expense ledger &amp; statement analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <label htmlFor="global-month-selector" className="sr-only">
                Select reporting month
              </label>
              <select
                id="global-month-selector"
                value={selectedMonth}
                onChange={(e) => onSelectMonth(e.target.value)}
                className="appearance-none bg-neutral-50 border border-neutral-200 rounded-lg pl-3 pr-8 py-2 text-xs sm:text-sm font-medium text-neutral-900 hover:border-neutral-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 cursor-pointer"
              >
                {AVAILABLE_MONTHS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="h-3.5 w-3.5 text-neutral-500 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                aria-expanded={profileMenuOpen}
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 hover:bg-neutral-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950 text-white text-xs font-semibold">
                  <User className="h-3.5 w-3.5" />
                </span>
                <span className="hidden md:inline text-sm font-medium text-neutral-900 whitespace-nowrap">
                  {firstName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-500 hidden md:inline" />
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white py-1.5 shadow-lg z-50">
                    <div className="px-3.5 py-2 border-b border-neutral-100">
                      <p className="text-sm font-medium text-neutral-950 truncate">{userProfile.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{userProfile.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full text-left px-3.5 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4 text-neutral-500" />
                      <span>Account settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4 text-neutral-500" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1320px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
