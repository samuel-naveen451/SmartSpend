import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { PageRoute } from '../types/finance';

interface LoginPageProps {
  onLogin: (email: string) => void;
  onNavigate: (route: PageRoute) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('aarav.sharma@smartspend.in');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.trim().length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setError(null);
    onLogin(email);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-950 flex flex-col justify-between px-4 py-8 sm:px-6">
      <header className="max-w-md w-full mx-auto flex items-center justify-between">
        <BrandMark />
        <button
          type="button"
          onClick={() => onNavigate('register')}
          className="text-sm font-medium text-neutral-600 hover:text-neutral-950 underline underline-offset-4 whitespace-nowrap"
        >
          Create account
        </button>
      </header>

      <main className="max-w-md w-full mx-auto my-auto py-12">
        <div className="border border-neutral-200 rounded-2xl bg-neutral-50/60 p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Sign in to SmartSpend
            </h1>
            <p className="mt-1.5 text-sm text-neutral-600">
              Track monthly expenses, upload CSV statements, and review spending insights.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-neutral-300 bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-900"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-neutral-800 mb-1.5"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-neutral-800 mb-1.5"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <span>Log in</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-200 flex items-center justify-between text-sm">
            <span className="text-neutral-600">New to SmartSpend?</span>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-medium text-neutral-950 hover:underline underline-offset-4"
            >
              Register now
            </button>
          </div>
        </div>
      </main>

      <footer className="max-w-md w-full mx-auto text-center text-xs text-neutral-500">
        SmartSpend Personal Finance · Monochrome Prototype
      </footer>
    </div>
  );
};
