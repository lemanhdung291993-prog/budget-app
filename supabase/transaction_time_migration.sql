alter table public.transactions
  add column if not exists transaction_time time;
