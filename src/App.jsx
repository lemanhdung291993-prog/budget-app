import React, { useEffect, useMemo, useState } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { occurrenceDate } from './utils/constants';
import { AppNavigation } from './components/AppNavigation';
import { AuthScreen } from './components/AuthScreen';
import { ManageList } from './components/ManageList';
import { TransactionModal } from './components/TransactionModal';
import { DashboardView } from './views/DashboardView';
import { Reports } from './views/Reports';
import { supabase, supabaseConfigured } from './lib/supabase';
import {
  deleteMonthlyBudget,
  deleteTransactionRecord,
  loadBudget,
  loadMonthlyBudget,
  saveCategories,
  saveMonthlyBudget,
  saveNames,
  saveTransactionRecord,
} from './services/budgetData';

const createForm = (month, categories, accounts) => ({
  title: '',
  amount: '',
  category: categories[0] || '',
  account: accounts[0] || '',
  note: '',
  type: 'expense',
  date: `${month}-01`,
  time: '',
  recurrence: 'none',
});

const getCurrentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
};

const getCurrentDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const getCurrentTime = () => {
  const today = new Date();
  return `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState('');
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [manage, setManage] = useState(null);
  const [active, setActive] = useState('Overview');
  const [filter, setFilter] = useState('');
  const [month, setMonth] = useState(getCurrentMonth);
  const [categories, setCategories] = useState([]);
  const [categoryIcons, setCategoryIcons] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState(() => createForm(getCurrentMonth(), [], []));

  useEffect(() => {
    if (!supabaseConfigured) {
      setSessionReady(true);
      setLoading(false);
      return undefined;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }

    let current = true;
    setLoading(true);
    setError('');
    loadBudget(user.id)
      .then(data => {
        if (!current) return;
        setTransactions(data.transactions);
        setCategories(data.categories);
        setCategoryIcons(data.categoryIcons);
        setAccounts(data.accounts);
      })
      .catch(loadError => {
        if (current) {
          const migrationHint = loadError.message.toLowerCase().includes('icon')
            ? ' Run supabase/category_icons_migration.sql in the Supabase SQL Editor.'
            : '';
          setError(`Could not load your budget: ${loadError.message}.${migrationHint}`);
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [user?.id, reloadKey]);

  useEffect(() => {
    if (!user) {
      setMonthlyBudget(null);
      return undefined;
    }

    let current = true;
    setBudgetLoading(true);
    setBudgetError('');
    setMonthlyBudget(null);
    loadMonthlyBudget(user.id, month)
      .then(amount => {
        if (current) setMonthlyBudget(amount);
      })
      .catch(loadError => {
        if (current) {
          setBudgetError(`Could not load this month's budget: ${loadError.message}. Run supabase/monthly_budget_repeat_migration.sql in the Supabase SQL Editor.`);
        }
      })
      .finally(() => {
        if (current) setBudgetLoading(false);
      });

    return () => {
      current = false;
    };
  }, [user?.id, month]);

  const monthTransactions = useMemo(() => transactions.flatMap(transaction => {
    if (transaction.date.startsWith(month)) {
      return [{ ...transaction, occurrenceId: transaction.id }];
    }
    if (transaction.recurrence === 'monthly' && transaction.date.slice(0, 7) < month) {
      return [{
        ...transaction,
        date: occurrenceDate(transaction.date, month),
        occurrenceId: transaction.id,
        recurrenceStartDate: transaction.date,
        isRecurringOccurrence: true,
      }];
    }
    return [];
  }).sort((first, second) => second.date.localeCompare(first.date)), [transactions, month]);

  const expenses = useMemo(
    () => monthTransactions.filter(transaction => transaction.amount < 0)
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [monthTransactions],
  );
  const income = useMemo(
    () => monthTransactions.filter(transaction => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    [monthTransactions],
  );
  const shownTransactions = monthTransactions.filter(transaction =>
    `${transaction.title} ${transaction.category}`.toLowerCase().includes(filter.toLowerCase()));
  const monthLabel = new Date(`${month}-01T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const accountName = user?.user_metadata?.full_name?.trim()
    || user?.email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim()
    || 'there';
  const firstName = accountName.split(/\s+/)[0];
  const displayName = `${firstName[0].toLocaleUpperCase()}${firstName.slice(1)}`;

  const saveTransaction = async event => {
    event.preventDefault();
    if (!form.title || !form.amount || !form.account || !form.category) return;

    const amount = Math.abs(Number(form.amount)) * (form.type === 'income' ? 1 : -1);
    const transaction = {
      ...(editingId ? { id: editingId } : {}),
      title: form.title,
      amount,
      category: form.category,
      account: form.account,
      note: form.note,
      date: form.date,
      time: form.time,
      recurrence: form.recurrence,
      icon: form.type === 'income' ? '✦' : '●',
    };
    try {
      const savedTransaction = await saveTransactionRecord(transaction, user.id);
      setTransactions(current => editingId
        ? current.map(item => item.id === editingId ? savedTransaction : item)
        : [savedTransaction, ...current]);
      setError('');
      setModal(false);
      setEditingId(null);
      window.location.reload();
    } catch (saveError) {
      setError(`Could not save the transaction: ${saveError.message}`);
    }
  };

  const startNewTransaction = () => {
    setEditingId(null);
    setForm({
      ...createForm(month, categories, accounts),
      date: getCurrentDate(),
      time: getCurrentTime(),
    });
    setModal(true);
  };

  const startEditTransaction = transaction => {
    setEditingId(transaction.occurrenceId);
    setForm({
      title: transaction.title,
      amount: Math.abs(transaction.amount),
      category: transaction.category,
      account: transaction.account,
      note: transaction.note || '',
      type: transaction.amount > 0 ? 'income' : 'expense',
      date: transaction.recurrenceStartDate || transaction.date,
      time: transaction.time || '',
      recurrence: transaction.recurrence || 'none',
    });
    setModal(true);
  };

  const removeTransaction = async (id, recurring) => {
    const message = recurring
      ? 'Delete this recurring transaction and all future occurrences?'
      : 'Delete this transaction? This cannot be undone.';
    if (window.confirm(message)) {
      try {
        await deleteTransactionRecord(id, user.id);
        setTransactions(current => current.filter(transaction => transaction.id !== id));
        setError('');
      } catch (deleteError) {
        setError(`Could not delete the transaction: ${deleteError.message}`);
      }
    }
  };

  const saveList = async (type, nextItems, nextCategoryIcons = categoryIcons) => {
    const previousItems = type === 'categories' ? categories : accounts;
    if (type === 'categories') {
      await saveCategories(previousItems, nextItems, nextCategoryIcons, user.id);
      setCategoryIcons(nextCategoryIcons);
    } else {
      await saveNames('accounts', previousItems, nextItems, user.id);
    }
    (type === 'categories' ? setCategories : setAccounts)(nextItems);
    setError('');
  };

  const updateMonthlyBudget = async (amount, repeatMonthly) => {
    try {
      await saveMonthlyBudget(user.id, month, amount, repeatMonthly);
      setMonthlyBudget({ amount, repeatMonthly, sourceMonth: month });
      setBudgetError('');
    } catch (saveError) {
      setBudgetError(`Could not save this month's budget: ${saveError.message}. Run supabase/monthly_budget_repeat_migration.sql in the Supabase SQL Editor.`);
      throw saveError;
    }
  };

  const clearMonthlyBudget = async () => {
    try {
      await deleteMonthlyBudget(user.id, month);
      const inheritedBudget = await loadMonthlyBudget(user.id, month);
      setMonthlyBudget(inheritedBudget);
      setBudgetError('');
    } catch (deleteError) {
      setBudgetError(`Could not remove this month's budget: ${deleteError.message}`);
    }
  };

  const signOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(`Could not sign out: ${signOutError.message}`);
  };

  if (!sessionReady || loading) {
    return <main className="auth-screen"><p>{loading ? 'Loading your budget…' : 'Checking sign-in…'}</p></main>;
  }

  if (!supabaseConfigured) {
    return <AuthScreen configured={false} />;
  }

  if (!user) {
    return <AuthScreen configured />;
  }

  if (error && transactions.length === 0) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <h1>Could not load your budget</h1>
          <p className="auth-error" role="alert">{error}</p>
          <button className="submit" onClick={() => setReloadKey(value => value + 1)}>Try again</button>
          <button className="auth-switch" onClick={signOut}>Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <main>
        <header>
          <div className="header-leading">
            <AppNavigation active={active} onNavigate={setActive} onManage={setManage} />
            <div><p className="eyebrow">{monthLabel.toUpperCase()}</p><h1>Good morning, {displayName} <span>👋</span></h1></div>
          </div>
          <div className="header-actions">
            <button className="icon-btn"><Bell size={19} /><i /></button>
            <button className="icon-btn" title={`Sign out ${user.email || ''}`} onClick={signOut}><LogOut size={18} /></button>
          </div>
        </header>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {active === 'Reports' ? (
          <Reports transactions={transactions} month={month} setMonth={setMonth} monthLabel={monthLabel} />
        ) : (
          <DashboardView
            transactionsOnly={active === 'Transactions'}
            expenses={expenses}
            income={income}
            monthlyBudget={monthlyBudget}
            budgetLoading={budgetLoading}
            budgetError={budgetError}
            onSaveMonthlyBudget={updateMonthlyBudget}
            onClearMonthlyBudget={clearMonthlyBudget}
            month={month}
            monthLabel={monthLabel}
            onMonthChange={setMonth}
            onEditTransaction={startEditTransaction}
            onDeleteTransaction={removeTransaction}
            onSearchChange={setFilter}
            search={filter}
            transactions={shownTransactions}
            categoryTransactions={monthTransactions}
            categoryIcons={categoryIcons}
            onManageCategories={() => setManage('categories')}
            onAddTransaction={startNewTransaction}
          />
        )}
      </main>
      <TransactionModal
        editingId={editingId}
        form={modal ? form : null}
        onClose={() => setModal(false)}
        onManage={setManage}
        onSave={saveTransaction}
        onFormChange={setForm}
        categories={categories}
        accounts={accounts}
        transactions={transactions}
      />
      {manage && (
        <ManageList
          type={manage}
          items={manage === 'categories' ? categories : accounts}
          categoryIcons={categoryIcons}
          onClose={() => setManage(null)}
          onSave={(nextItems, nextCategoryIcons) => saveList(manage, nextItems, nextCategoryIcons)}
        />
      )}
    </div>
  );
}
