import React, { useState } from 'react';
import { UserProfile } from '../types/finance';

interface SettingsPageProps {
  userProfile: UserProfile;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onResetDemoData: () => void;
  onDeleteAccount: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userProfile,
  onUpdateProfile,
  onResetDemoData,
  onDeleteAccount,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [role, setRole] = useState(userProfile.role);
  const [savingsGoal, setSavingsGoal] = useState(String(userProfile.monthlySavingsGoal));
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [demoResetDone, setDemoResetDone] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim() || userProfile.name,
      email: email.trim() || userProfile.email,
      role: role.trim() || userProfile.role,
      monthlySavingsGoal: Math.max(0, Number(savingsGoal) || 0),
    });
    setProfileSaved(true);
    window.setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordStatus({ type: 'err', text: 'Enter your current password.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'err', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'err', text: 'New passwords do not match.' });
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordStatus({ type: 'ok', text: 'Password updated successfully.' });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Manage your profile details, security credentials, and automation preferences.
        </p>
      </div>

      {/* Profile Information */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <h2 className="text-base font-semibold text-neutral-950">User Profile Information</h2>
        <p className="text-xs text-neutral-500 mt-0.5 mb-5">
          Used across your dashboard greeting and exported monthly reports.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="set-name" className="block text-xs font-medium text-neutral-700 mb-1">
                Full name
              </label>
              <input
                id="set-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 focus:outline-none focus:border-neutral-950"
              />
            </div>

            <div>
              <label htmlFor="set-email" className="block text-xs font-medium text-neutral-700 mb-1">
                Email address
              </label>
              <input
                id="set-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 focus:outline-none focus:border-neutral-950"
              />
            </div>

            <div>
              <label htmlFor="set-role" className="block text-xs font-medium text-neutral-700 mb-1">
                Occupation / City
              </label>
              <input
                id="set-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 focus:outline-none focus:border-neutral-950"
              />
            </div>

            <div>
              <label htmlFor="set-goal" className="block text-xs font-medium text-neutral-700 mb-1">
                Monthly savings target (₹)
              </label>
              <input
                id="set-goal"
                type="number"
                min="0"
                step="500"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 font-mono-num focus:outline-none focus:border-neutral-950"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 cursor-pointer"
            >
              Save changes
            </button>
            {profileSaved && (
              <span role="status" className="text-xs font-medium text-neutral-700">
                Profile updated.
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Change Password */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <h2 className="text-base font-semibold text-neutral-950">Change Password</h2>
        <p className="text-xs text-neutral-500 mt-0.5 mb-5">
          Update your SmartSpend account password.
        </p>

        {passwordStatus && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-neutral-300 bg-neutral-100 px-3.5 py-2 text-xs text-neutral-950"
          >
            {passwordStatus.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="pw-current" className="block text-xs font-medium text-neutral-700 mb-1">
                Current password
              </label>
              <input
                id="pw-current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 focus:outline-none focus:border-neutral-950"
              />
            </div>
            <div>
              <label htmlFor="pw-new" className="block text-xs font-medium text-neutral-700 mb-1">
                New password
              </label>
              <input
                id="pw-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 focus:outline-none focus:border-neutral-950"
              />
            </div>
            <div>
              <label htmlFor="pw-confirm" className="block text-xs font-medium text-neutral-700 mb-1">
                Confirm new password
              </label>
              <input
                id="pw-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 focus:outline-none focus:border-neutral-950"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 cursor-pointer"
          >
            Update password
          </button>
        </form>
      </section>

      {/* Account Preferences */}
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <h2 className="text-base font-semibold text-neutral-950">Account Preferences</h2>
        <p className="text-xs text-neutral-500 mt-0.5 mb-5">
          Configure automated categorization and insight alerts.
        </p>

        <div className="divide-y divide-neutral-100">
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-950">Automatic transaction categorization</p>
              <p className="text-xs text-neutral-500">
                Classify uploaded CSV merchants into spending categories automatically
              </p>
            </div>
            <input
              type="checkbox"
              aria-label="Automatic transaction categorization"
              checked={userProfile.aiAutoCategorize}
              onChange={(e) => onUpdateProfile({ aiAutoCategorize: e.target.checked })}
              className="h-4 w-4 accent-neutral-950 cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-950">Unusual spending detection</p>
              <p className="text-xs text-neutral-500">
                Flag single transactions noticeably above your monthly average
              </p>
            </div>
            <input
              type="checkbox"
              aria-label="Unusual spending detection"
              checked={userProfile.unusualSpendAlerts}
              onChange={(e) => onUpdateProfile({ unusualSpendAlerts: e.target.checked })}
              className="h-4 w-4 accent-neutral-950 cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-950">Weekly spending digest</p>
              <p className="text-xs text-neutral-500">
                Receive a monochrome summary of top spending categories every Sunday
              </p>
            </div>
            <input
              type="checkbox"
              aria-label="Weekly spending digest"
              checked={userProfile.weeklyDigest}
              onChange={(e) => onUpdateProfile({ weeklyDigest: e.target.checked })}
              className="h-4 w-4 accent-neutral-950 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Data & Account Deletion */}
      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <h2 className="text-base font-semibold text-neutral-950">Account Data &amp; Deletion</h2>
        <p className="text-xs text-neutral-600 mt-1 mb-5">
          Restore the default Indian Rupee sample ledger or permanently remove your local SmartSpend account.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onResetDemoData();
              setDemoResetDone(true);
              window.setTimeout(() => setDemoResetDone(false), 2500);
            }}
            className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-sm font-medium text-neutral-900 hover:bg-neutral-100 cursor-pointer"
          >
            Reset demo data
          </button>

          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="px-4 py-2 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 cursor-pointer"
          >
            Delete account
          </button>

          {demoResetDone && (
            <span role="status" className="text-xs font-medium text-neutral-700">
              Sample data restored.
            </span>
          )}
        </div>

        {confirmDeleteOpen && (
          <div
            role="alertdialog"
            aria-labelledby="delete-acc-title"
            className="mt-5 rounded-xl border border-neutral-300 bg-white p-4"
          >
            <p id="delete-acc-title" className="text-sm font-semibold text-neutral-950">
              Confirm account deletion
            </p>
            <p className="text-xs text-neutral-600 mt-1">
              This will clear your saved transactions, custom budgets, and profile preferences and return you to the login screen.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={onDeleteAccount}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-950 text-white text-xs font-medium hover:bg-neutral-800"
              >
                Confirm delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-medium text-neutral-900 hover:bg-neutral-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
