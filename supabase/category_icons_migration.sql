alter table public.categories
  add column if not exists icon text not null default 'CircleHelp';

update public.categories
set icon = case lower(name)
  when 'groceries' then 'ShoppingCart'
  when 'dining' then 'Utensils'
  when 'transport' then 'Car'
  when 'transportation' then 'Car'
  when 'shopping' then 'ShoppingBag'
  when 'bills' then 'Home'
  when 'housing' then 'Home'
  when 'entertainment' then 'Clapperboard'
  when 'health' then 'HeartPulse'
  when 'income' then 'ArrowDownLeft'
  else icon
end
where icon = 'CircleHelp';
