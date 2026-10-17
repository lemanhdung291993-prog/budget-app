create table if not exists public.monthly_budgets (
  user_id uuid not null references auth.users(id) on delete cascade,
  budget_month date not null,
  budget_amount numeric(12, 2) not null check (budget_amount > 0),
  repeat_monthly boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, budget_month),
  check (extract(day from budget_month) = 1)
);

alter table public.monthly_budgets enable row level security;

create policy "Users manage their monthly budgets"
  on public.monthly_budgets
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
