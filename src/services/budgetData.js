import { supabase } from '../lib/supabase';

function transactionFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    category: row.category,
    account: row.account,
    note: row.note,
    date: row.transaction_date,
    recurrence: row.recurrence,
    icon: row.icon,
  };
}

function transactionToRow(transaction, userId) {
  return {
    user_id: userId,
    title: transaction.title,
    amount: transaction.amount,
    category: transaction.category,
    account: transaction.account,
    note: transaction.note || '',
    transaction_date: transaction.date,
    recurrence: transaction.recurrence || 'none',
    icon: transaction.icon || '●',
  };
}

async function loadNames(table, userId) {
  const { data, error } = await supabase
    .from(table)
    .select('name')
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  return data.map(row => row.name);
}

export async function loadBudget(userId) {
  const { data: rows, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });
  if (error) throw error;

  const [categories, accounts] = await Promise.all([
    loadNames('categories', userId),
    loadNames('accounts', userId),
  ]);

  return { transactions: rows.map(transactionFromRow), categories, accounts };
}

export async function saveTransactionRecord(transaction, userId) {
  const query = transaction.id
    ? supabase.from('transactions').update(transactionToRow(transaction, userId)).eq('id', transaction.id).eq('user_id', userId)
    : supabase.from('transactions').insert(transactionToRow(transaction, userId));
  const { data, error } = await query.select().single();
  if (error) throw error;
  return transactionFromRow(data);
}

export async function deleteTransactionRecord(id, userId) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function saveNames(table, previousNames, nextNames, userId) {
  const { error: upsertError } = await supabase
    .from(table)
    .upsert(nextNames.map(name => ({ user_id: userId, name })), { onConflict: 'user_id,name' });
  if (upsertError) throw upsertError;

  const removedNames = previousNames.filter(name => !nextNames.includes(name));
  for (const name of removedNames) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('user_id', userId)
      .eq('name', name);
    if (error) throw error;
  }
}
