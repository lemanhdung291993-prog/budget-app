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

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form className="modal" onSubmit={onSave} onMouseDown={event => event.stopPropagation()}>
        <button type="button" className="close" onClick={onClose}><X size={19} /></button>
        <h2>{editingId ? 'Edit transaction' : 'Add transaction'}</h2>
        <p>Keep your spending picture up to date.</p>
        <div className="type-toggle">
          <button type="button" className={form.type === 'expense' ? 'selected expense' : ''} onClick={() => onFormChange({ ...form, type: 'expense' })}>Expense</button>
          <button type="button" className={form.type === 'income' ? 'selected income' : ''} onClick={() => onFormChange({ ...form, type: 'income' })}>Income</button>
        </div>
        <label>
          Description
          <input
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
        </label>
        <label>Amount<input type="number" step="0.01" value={form.amount} onChange={event => onFormChange({ ...form, amount: event.target.value })} placeholder="0.00" /></label>
        <label>
          Account
          <select required value={form.account} onChange={event => onFormChange({ ...form, account: event.target.value })}>
            <option value="" disabled>{accounts.length ? 'Choose an account' : 'Add an account first'}</option>
            {accounts.map(account => <option key={account}>{account}</option>)}
          </select>
          <button type="button" className="manage-link" onClick={() => onManage('accounts')}>Manage accounts</button>
        </label>
        <label>Date<input type="date" value={form.date} onChange={event => onFormChange({ ...form, date: event.target.value })} /></label>
        {form.type === 'expense' && (
          <>
            <label>
              Category
              <select required value={form.category} onChange={event => onFormChange({ ...form, category: event.target.value })}>
                <option value="" disabled>{categories.length ? 'Choose a category' : 'Add a category first'}</option>
                {categories.map(category => <option key={category}>{category}</option>)}
              </select>
              <button type="button" className="manage-link" onClick={() => onManage('categories')}>Manage categories</button>
            </label>
          </>
        )}
        <label>
          Repeat
          <select value={form.recurrence} onChange={event => onFormChange({ ...form, recurrence: event.target.value })}>
            <option value="none">Does not repeat</option>
            <option value="monthly">Every month</option>
          </select>
        </label>
        <label>Note <span className="optional">optional</span><input value={form.note} onChange={event => onFormChange({ ...form, note: event.target.value })} placeholder="Add a note" /></label>
        <button className="submit">{editingId ? 'Save changes' : 'Save transaction'}</button>
      </form>
    </div>
  );
}
