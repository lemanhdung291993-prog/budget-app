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
  TrendingUp,
} from 'lucide-react';
import { Stat } from '../components/Stat';
import { colors } from '../utils/constants';

export function DashboardView({
  transactionsOnly = false,
  expenses,
  income,
  month,
  monthLabel,
  onMonthChange,
  onEditTransaction,
  onDeleteTransaction,
  onSearchChange,
  search,
  transactions,
  onManageCategories,
  onAddTransaction,
}) {
  return (
    <>
      {!transactionsOnly && <section className="balance-card">
        <div className="balance-info">
          <p>Total balance</p>
          <h2>${(income - expenses + 5400).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
          <span className="trend"><TrendingUp size={15} /> 12.4% <em>vs. last month</em></span>
        </div>
        <div className="balance-stats">
          <Stat icon={<ArrowDownLeft />} label="Income" value={income} color="green" />
          <Stat icon={<ArrowUpRight />} label="Expenses" value={expenses} color="rose" />
          <Stat icon={<Landmark />} label="Savings" value={income - expenses} color="purple" />
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
            <div><h3>Monthly budget</h3><p>$1,847 spent of $2,800</p></div>
            <button className="dots"><MoreHorizontal size={20} /></button>
          </div>
          <div className="donut-wrap"><div className="donut"><div><b>66%</b><span>used</span></div></div></div>
          <div className="budget-bottom"><span>Remaining</span><b>$952.65</b></div>
          <button className="budget-btn">View budget details <ChevronRight size={16} /></button>
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
            {transactions.length ? transactions.map(transaction => (
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
            )) : <p className="empty">No transactions found for this month.</p>}
          </div>
        </div>

        {!transactionsOnly && <div className="panel categories">
          <div className="panel-head">
            <div><h3>Top categories</h3><p>By spending this month</p></div>
            <button className="dots"><MoreHorizontal size={20} /></button>
          </div>
          {[
            ['Groceries', 482.80, 36],
            ['Dining', 295.50, 22],
            ['Transport', 210.24, 16],
            ['Shopping', 185.90, 14],
          ].map(([name, value, percentage], index) => (
            <div className="category" key={name}>
              <div><span className="cat-color" style={{ background: colors[index] }} />{name}</div>
              <b>${value.toFixed(2)}</b>
              <div className="progress"><i style={{ width: `${percentage}%`, background: colors[index] }} /></div>
            </div>
          ))}
          <button className="view-cats" onClick={onManageCategories}>Manage categories <ChevronRight size={16} /></button>
        </div>}
      </section>
    </>
  );
}
