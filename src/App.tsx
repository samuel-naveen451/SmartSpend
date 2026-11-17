import { AppShell } from './components/AppShell';
import { BudgetsPage } from './pages/BudgetsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { UploadStatementPage } from './pages/UploadStatementPage';
import { useFinanceStore } from './state/useFinanceStore';

export default function App() {
  const store = useFinanceStore();

  if (store.route === 'login' || (!store.isAuthenticated && store.route !== 'register')) {
    return <LoginPage onLogin={store.login} onNavigate={store.navigate} />;
  }

  if (store.route === 'register') {
    return <RegisterPage onRegister={store.register} onNavigate={store.navigate} />;
  }

  return (
    <AppShell
      route={store.route}
      onNavigate={store.navigate}
      selectedMonth={store.selectedMonth}
      onSelectMonth={store.setSelectedMonth}
      userProfile={store.userProfile}
      onLogout={store.logout}
    >
      {store.route === 'dashboard' && (
        <DashboardPage
          transactions={store.transactions}
          selectedMonth={store.selectedMonth}
          onNavigate={store.navigate}
        />
      )}

      {store.route === 'upload' && (
        <UploadStatementPage
          onImportRows={store.importCsvRows}
          onNavigate={store.navigate}
        />
      )}

      {store.route === 'transactions' && (
        <TransactionsPage
          transactions={store.transactions}
          selectedMonth={store.selectedMonth}
          onAddTransaction={store.addTransaction}
          onUpdateCategory={store.updateTransactionCategory}
          onDeleteTransaction={store.deleteTransaction}
        />
      )}

      {store.route === 'budgets' && (
        <BudgetsPage
          budgets={store.budgets}
          transactions={store.transactions}
          selectedMonth={store.selectedMonth}
          onUpsertBudget={store.upsertBudget}
          onDeleteBudget={store.deleteBudget}
        />
      )}

      {store.route === 'reports' && (
        <ReportsPage
          transactions={store.transactions}
          selectedMonth={store.selectedMonth}
        />
      )}

      {store.route === 'settings' && (
        <SettingsPage
          userProfile={store.userProfile}
          onUpdateProfile={store.updateUserProfile}
          onResetDemoData={store.resetDemoData}
          onDeleteAccount={store.deleteAccount}
        />
      )}
    </AppShell>
  );
}
