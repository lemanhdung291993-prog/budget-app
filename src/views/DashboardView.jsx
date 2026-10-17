import { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Landmark,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Stat } from '../components/Stat';
import { colors } from '../utils/constants';

export function DashboardView({
  transactionsOnly = false,
  expenses,
  income,
  monthlyBudget,
  budgetLoading,
  budgetError,
  onSaveMonthlyBudget,
  onClearMonthlyBudget,
  month,
  monthLabel,
  onMonthChange,
  onEditTransaction,
  onDeleteTransaction,
  onSearchChange,
  search,
  transactions,
  categoryTransactions,
  onManageCategories,
  onAddTransaction,
}) {
  const categoryTotals = categoryTransactions
    .filter(transaction => transaction.amount < 0)
    .reduce((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] || 0) + Math.abs(transaction.amount);
      return totals;
    }, {});
  const topCategories = Object.entries(categoryTotals)
    .sort((first, second) => second[1] - first[1]);
  const maxCategorySpend = topCategories[0]?.[1] || 1;
  const transactionsByDay = transactions.reduce((groups, transaction) => {
    const currentDay = groups[groups.length - 1];
    if (currentDay?.date === transaction.date) {
      currentDay.transactions.push(transaction);
    } else {
      groups.push({ date: transaction.date, transactions: [transaction] });
    }
    return groups;
  }, []);
  const [budgetDraft, setBudgetDraft] = useState('');
  const [repeatBudgetMonthly, setRepeatBudgetMonthly] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetFormError, setBudgetFormError] = useState('');

  useEffect(() => {
    setBudgetDraft(monthlyBudget == null ? '' : String(monthlyBudget.amount));
    setRepeatBudgetMonthly(monthlyBudget?.repeatMonthly ?? false);
    setEditingBudget(false);
    setBudgetFormError('');
  }, [month, monthlyBudget]);

  const budgetAmount = monthlyBudget?.amount ?? null;
  const budgetProgress = budgetAmount > 0
    ? Math.min((expenses / budgetAmount) * 100, 100)
    : 0;
  const budgetRemaining = budgetAmount == null ? null : budgetAmount - expenses;

  const submitBudget = async event => {
    event.preventDefault();
    const amount = Number(budgetDraft);
    if (!Number.isFinite(amount) || amount <= 0) {
      setBudgetFormError('Enter a monthly budget greater than zero.');
      return;
    }
    setBudgetFormError('');
    try {
      await onSaveMonthlyBudget(amount, repeatBudgetMonthly);
      setEditingBudget(false);
    } catch {
      // The parent displays the database error and keeps the editor open for retry.
    }
  };

  return (
    <>
      {!transactionsOnly && <section className="balance-card">
        <div className="balance-info">
          <p>Net this month</p>
          <h2>{(income - expenses).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</h2>
        </div>
        <div className="balance-stats">
          <Stat icon={<ArrowDownLeft />} label="Income" value={income} color="green" />
          <Stat icon={<ArrowUpRight />} label="Expenses" value={expenses} color="rose" />
          <Stat icon={<Landmark />} label="Net" value={income - expenses} color="purple" />
        </div>
      </section>}

      {!transactionsOnly && <section className="content-grid">
        <div className="panel spending">
          <div className="panel-head">
            <div><h3>Spending overview</h3><p>{monthLabel}</p></div>
            <label className="month-picker">
              Month
              <input type="month" value={month} onChange={event => onMonthChange(event.target.value)} />
            </label>
          </div>
          <div className="chart">
            <div className="chart-y"><span>$3k</span><span>$2k</span><span>$1k</span><span>$0</span></div>
            <div className="chart-area">
              <div className="gridlines" />
              <svg viewBox="0 0 560 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="#7765f5" stopOpacity=".3" />
                    <stop offset="1" stopColor="#7765f5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 142 C25 132 39 138 57 116 S87 124 104 105 S135 129 151 91 S183 114 201 94 S230 117 252 76 S277 90 300 61 S332 82 352 46 S384 66 404 42 S435 55 460 28 S489 41 510 18 S538 27 560 7 L560 180 L0 180Z" fill="url(#fill)" />
                <path d="M0 142 C25 132 39 138 57 116 S87 124 104 105 S135 129 151 91 S183 114 201 94 S230 117 252 76 S277 90 300 61 S332 82 352 46 S384 66 404 42 S435 55 460 28 S489 41 510 18 S538 27 560 7" fill="none" stroke="#7765f5" strokeWidth="3" />
              </svg>
              <div className="days"><span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span></div>
            </div>
          </div>
          <div className="chart-foot"><span><i className="dot purple" />{monthLabel}</span><b>${expenses.toFixed(2)}</b></div>
        </div>

        <div className="panel budget">
          <div className="panel-head">
            <div>
              <h3>Monthly budget</h3>
              <p>{budgetAmount == null ? 'No spending limit set' : `${expenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} spent of ${budgetAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}</p>
            </div>
            {budgetAmount != null && !editingBudget && (
              <button className="budget-edit" onClick={() => setEditingBudget(true)}>Edit</button>
            )}
          </div>
          <div className="donut-wrap">
            <div className="donut" style={{ background: budgetAmount == null ? '#eeeef7' : `conic-gradient(#7866f2 0 ${budgetProgress}%, #eeeef7 ${budgetProgress}% 100%)` }}>
              <div><b>{budgetAmount == null ? '—' : `${Math.round((expenses / budgetAmount) * 100)}%`}</b><span>{budgetAmount == null ? 'not set' : 'used'}</span></div>
            </div>
          </div>
          <div className="budget-bottom">
            <span>{budgetRemaining != null && budgetRemaining < 0 ? 'Over budget' : 'Remaining'}</span>
            <b>{budgetRemaining == null ? '—' : budgetRemaining.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</b>
          </div>
          {editingBudget ? (
            <form className="budget-editor" onSubmit={submitBudget}>
              <label htmlFor="monthly-budget-amount">Budget for {monthLabel}</label>
              <input
                id="monthly-budget-amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={budgetDraft}
                onChange={event => setBudgetDraft(event.target.value)}
                placeholder="Enter amount"
              />
              <label className="budget-repeat-option">
                <input
                  type="checkbox"
                  checked={repeatBudgetMonthly}
                  onChange={event => setRepeatBudgetMonthly(event.target.checked)}
                />
                Repeat this budget every month
              </label>
              {budgetFormError && <p className="manage-error" role="alert">{budgetFormError}</p>}
              {budgetError && <p className="manage-error" role="alert">{budgetError}</p>}
              <div className="budget-editor-actions">
                <button className="budget-btn" type="button" onClick={() => { setEditingBudget(false); setBudgetFormError(''); }}>Cancel</button>
                <button className="add-btn" type="submit" disabled={budgetLoading}>{budgetLoading ? 'Saving…' : 'Save budget'}</button>
              </div>
            </form>
          ) : (
            <>
              {budgetError && <p className="manage-error" role="alert">{budgetError}</p>}
              <button className="budget-btn" onClick={() => setEditingBudget(true)}>
                {monthlyBudget == null ? 'Set monthly budget' : 'Update budget'}
              </button>
              {budgetAmount != null && monthlyBudget?.sourceMonth === month && (
                <button className="budget-clear" onClick={onClearMonthlyBudget} disabled={budgetLoading}>Remove budget</button>
              )}
            </>
          )}
        </div>
      </section>}

      <section className={`lower-grid${transactionsOnly ? ' transactions-only' : ''}`}>
        <div className="panel transactions">
          <div className="panel-head">
            <div><h3>Transactions</h3><p>{transactions.length} transaction{transactions.length !== 1 ? 's' : ''} in {monthLabel}</p></div>
            <button className="add-btn transaction-add-btn" onClick={onAddTransaction}>
              <Plus size={17} /><span>Add transaction</span>
            </button>
          </div>
          <div className="search">
            <Search size={17} />
            <input value={search} onChange={event => onSearchChange(event.target.value)} placeholder="Search transactions" />
          </div>
          <div className="tx-list">
            {transactions.length ? transactionsByDay.map(day => (
              <section className="tx-day-group" key={day.date}>
                <h4>{new Date(`${day.date}T12:00:00`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}</h4>
                {day.transactions.map(transaction => (
                  <div className="tx" key={`${transaction.occurrenceId}-${transaction.date}`}>
                    <span className="tx-icon">{transaction.icon}</span>
                    <div className="tx-name">
                      <b>{transaction.title}{transaction.recurrence === 'monthly' && <span className="recurring-tag">Monthly</span>}</b>
                      <small>{transaction.category} · {transaction.account}</small>
                    </div>
                    <small className="tx-date">{new Date(`${transaction.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small>
                    <strong className={transaction.amount > 0 ? 'positive' : ''}>
                      {transaction.amount > 0 ? '+' : '−'}${Math.abs(transaction.amount).toFixed(2)}
                    </strong>
                    <div className="tx-actions">
                      <button title="Edit transaction" onClick={() => onEditTransaction(transaction)}><Pencil size={15} /></button>
                      <button
                        title="Delete transaction"
                        className="delete"
                        onClick={() => onDeleteTransaction(transaction.occurrenceId, transaction.recurrence === 'monthly')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            )) : <p className="empty">No transactions found for this month.</p>}
          </div>
        </div>

        {!transactionsOnly && <div className="panel categories">
          <div className="panel-head">
            <div><h3>Top categories</h3><p>By spending this month</p></div>
            <button className="dots"><MoreHorizontal size={20} /></button>
          </div>
          {topCategories.length ? topCategories.map(([name, value], index) => (
            <div className="category" key={name}>
              <div><span className="cat-color" style={{ background: colors[index % colors.length] }} />{name}</div>
              <b>${value.toFixed(2)}</b>
              <div className="progress">
                <i style={{ width: `${(value / maxCategorySpend) * 100}%`, background: colors[index % colors.length] }} />
              </div>
            </div>
          )) : <p className="empty category-empty">No spending recorded for this month.</p>}
          <button className="view-cats" onClick={onManageCategories}>Manage categories <ChevronRight size={16} /></button>
        </div>}
      </section>
    </>
  );
}
