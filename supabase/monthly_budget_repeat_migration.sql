alter table public.monthly_budgets
  add column if not exists repeat_monthly boolean not null default false;
