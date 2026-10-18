import { X } from 'lucide-react';

export function TransactionModal({
  editingId,
  form,
  onClose,
  onManage,
  onSave,
  onFormChange,
  categories,
  accounts,
  transactions,
}) {
  if (!form) return null;

  const transactionCategories = form.type === 'income'
    ? [...new Set(['Income', ...categories])]
    : categories;

  const changeType = type => {
    const category = type === 'income'
      ? (form.category !== 'Income' && categories.includes(form.category) ? form.category : 'Income')
      : (categories.includes(form.category) ? form.category : categories[0] || '');
    onFormChange({ ...form, type, category });
  };

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form
        className="modal"
        onSubmit={onSave}
        onMouseDown={event => event.stopPropagation()}
        onClick={event => event.stopPropagation()}
      >
        <button type="button" className="close" onClick={onClose}><X size={19} /></button>
        <h2>{editingId ? 'Edit transaction' : 'Add transaction'}</h2>
        <p>Keep your spending picture up to date.</p>
        <div className="type-toggle">
          <button type="button" className={form.type === 'expense' ? 'selected expense' : ''} onClick={() => changeType('expense')}>Expense</button>
          <button type="button" className={form.type === 'income' ? 'selected income' : ''} onClick={() => changeType('income')}>Income</button>
        </div>
        <div className="form-field">
          <label htmlFor="transaction-title">Description</label>
          <input
            id="transaction-title"
            autoFocus
            list="description-suggestions"
            value={form.title}
            onChange={event => onFormChange({ ...form, title: event.target.value })}
            placeholder="e.g. Coffee shop"
          />
          <datalist id="description-suggestions">
            {[...new Set(transactions.map(transaction => transaction.title))].map(title => <option key={title} value={title} />)}
          </datalist>
          <small className="field-hint">Suggestions come from your previous transactions.</small>
        </div>
        <div className="form-field">
          <label htmlFor="transaction-amount">Amount</label>
          <input id="transaction-amount" type="number" step="0.01" value={form.amount} onChange={event => onFormChange({ ...form, amount: event.target.value })} placeholder="0.00" />
        </div>
        <div className="form-field">
          <label htmlFor="transaction-account">Account</label>
          <select required value={form.account} onChange={event => onFormChange({ ...form, account: event.target.value })}>
            <option value="" disabled>{accounts.length ? 'Choose an account' : 'Add an account first'}</option>
            {accounts.map(account => <option key={account}>{account}</option>)}
          </select>
          <button type="button" className="manage-link" onClick={() => onManage('accounts')}>Manage accounts</button>
        </div>
        <div className="form-field">
          <label htmlFor="transaction-date">Date</label>
          <input id="transaction-date" type="date" value={form.date} onChange={event => onFormChange({ ...form, date: event.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="transaction-time">Time</label>
          <input id="transaction-time" type="time" value={form.time || ''} onChange={event => onFormChange({ ...form, time: event.target.value })} />
        </div>
        <div className="form-field">
          <label htmlFor="transaction-category">Category</label>
          <select id="transaction-category" required value={form.category} onChange={event => onFormChange({ ...form, category: event.target.value })}>
            <option value="" disabled>{transactionCategories.length ? 'Choose a category' : 'Add a category first'}</option>
            {transactionCategories.map(category => <option key={category}>{category}</option>)}
          </select>
          <button type="button" className="manage-link" onClick={() => onManage('categories')}>Manage categories</button>
        </div>
        <div className="form-field">
          <label htmlFor="transaction-recurrence">Repeat</label>
          <select value={form.recurrence} onChange={event => onFormChange({ ...form, recurrence: event.target.value })}>
            <option value="none">Does not repeat</option>
            <option value="monthly">Every month</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="transaction-note">Note <span className="optional">optional</span></label>
          <input id="transaction-note" value={form.note} onChange={event => onFormChange({ ...form, note: event.target.value })} placeholder="Add a note" />
        </div>
        <button className="submit">{editingId ? 'Save changes' : 'Save transaction'}</button>
      </form>
    </div>
  );
}
