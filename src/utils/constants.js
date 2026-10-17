export const initialTransactions = [
  { id: 1, title: 'Whole Foods Market', category: 'Groceries', account: 'Daily checking', date: '2026-09-30', amount: -86.42, icon: '🛒' },
  { id: 2, title: 'Salary deposit', category: 'Income', account: 'Daily checking', date: '2026-09-30', amount: 2400, icon: '💼' },
  { id: 3, title: 'Netflix', category: 'Entertainment', account: 'Visa •• 2491', date: '2026-09-29', amount: -15.49, icon: '🎬' },
  { id: 4, title: 'Shell', category: 'Transport', account: 'Visa •• 2491', date: '2026-09-28', amount: -54.20, icon: '⛽' },
  { id: 5, title: 'Freelance project', category: 'Income', account: 'Daily checking', date: '2026-09-27', amount: 680, icon: '✦' },
  { id: 6, title: 'Sweetgreen', category: 'Dining', account: 'Daily checking', date: '2026-09-26', amount: -18.75, icon: '🥗' },
  { id: 7, title: 'August rent', category: 'Bills', account: 'Daily checking', date: '2026-08-02', amount: -1250, icon: '🏠' },
  { id: 8, title: 'Coffee Club', category: 'Dining', account: 'Daily checking', date: '2026-08-16', amount: -24.50, icon: '☕' },
];

export const initialCategories = ['Groceries', 'Dining', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health'];
export const initialAccounts = ['Daily checking', 'Visa •• 2491', 'Savings account'];
export const colors = ['#7a66ff','#e8b45a','#e87d73','#68b7a2','#e280a7','#8297d5'];

export const daysInMonth = month => new Date(`${month}-01T12:00:00`).getMonth() === 11 ? 31 : new Date(new Date(`${month}-01T12:00:00`).getFullYear(), new Date(`${month}-01T12:00:00`).getMonth() + 1, 0).getDate();
export const occurrenceDate = (startDate, month) => `${month}-${String(Math.min(Number(startDate.slice(-2)), daysInMonth(month))).padStart(2, '0')}`;
