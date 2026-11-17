import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { PageRoute } from '../types/finance';

interface RegisterPageProps {
  onRegister: (name: string, email: string) => void;
  onNavigate: (route: PageRoute) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    onRegister(fullName, email);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-950 flex flex-col justify-between px-4 py-8 sm:px-6">
      <header className="max-w-md w-full mx-auto flex items-center justify-between">
        <BrandMark />
        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="text-sm font-medium text-neutral-600 hover:text-neutral-950 underline underline-offset-4 whitespace-nowrap"
        >
          Sign in
        </button>
      </header>

      <main className="max-w-md w-full mx-auto my-auto py-10">
        <div className="border border-neutral-200 rounded-2xl bg-neutral-50/60 p-6 sm:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-neutral-600">
              Start organizing monthly bank statements and spending budgets in minutes.
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
                htmlFor="reg-name"
                className="block text-sm font-medium text-neutral-800 mb-1.5"
              >
                Full name
              </label>
              <input
                id="reg-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                autoComplete="name"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div>
              <label
                htmlFor="reg-email"
                className="block text-sm font-medium text-neutral-800 mb-1.5"
              >
                Email address
              </label>
              <input
                id="reg-email"
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
                htmlFor="reg-password"
                className="block text-sm font-medium text-neutral-800 mb-1.5"
              >
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <div>
              <label
                htmlFor="reg-confirm-password"
                className="block text-sm font-medium text-neutral-800 mb-1.5"
              >
                Confirm password
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <span>Create account</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-200 flex items-center justify-between text-sm">
            <span className="text-neutral-600">Already have an account?</span>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="font-medium text-neutral-950 hover:underline underline-offset-4"
            >
              Back to login
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
