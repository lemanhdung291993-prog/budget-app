import React from 'react';

export function Reports({ transactions, month, setMonth, monthLabel }) {
  const spending = transactions.filter(t => 
    t.amount < 0 && (t.date.startsWith(month) || (t.recurrence === 'monthly' && t.date.slice(0,7) < month))
  ).reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const income = transactions.filter(t =>
    t.amount > 0 && (t.date.startsWith(month) || (t.recurrence === 'monthly' && t.date.slice(0, 7) < month))
  ).reduce((sum, t) => sum + t.amount, 0);

  const categories = Object.entries(
    transactions.filter(t => 
      t.amount < 0 && (t.date.startsWith(month) || (t.recurrence === 'monthly' && t.date.slice(0,7) < month))
    ).reduce((all, t) => ({ ...all, [t.category]: (all[t.category] || 0) + Math.abs(t.amount) }), {}
  ).sort((a, b) => b[1] - a[1]));

  const max = categories[0]?.[1] || 1;

  return (
    <section className="reports">
      <div className="report-top">
        <div>
          <h2>Spending report</h2>
          <p>A complete view of your spending for {monthLabel}.</p>
        </div>
        <label className="month-picker">
          Report month
          <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
        </label>
      </div>
      <div className="report-cards">
        <div>
          <span>Total spent</span>
          <b>${spending.toFixed(2)}</b>
        </div>
        <div>
          <span>Income</span>
          <b className="report-income">${income.toFixed(2)}</b>
        </div>
        <div>
          <span>Net cash flow</span>
          <b className={income - spending >= 0 ? 'report-income' : 'report-expense'}>
            ${(income - spending).toFixed(2)}
          </b>
        </div>
      </div>
      <div className="report-chart">
        {categories.map(([name, val]) => (
          <div className="report-bar" key={name}>
            <div className="bar-info">
              <span>{name}</span>
              <b>${val.toFixed(2)}</b>
            </div>
            <div className="bar-track">
              <i style={{ width: `${(val / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
