-- Create Categories Table
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text, -- hex code
  created_at timestamptz default now()
);

-- Create Transactions Table
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  category_id uuid references categories(id) on delete set null,
  amount numeric not null,
  type text check (type in ('income', 'expense')) not null,
  description text,
  transaction_date date not null default current_date,
  created_at timestamptz default now()
);

-- Enable RLS
alter table categories enable row level security;
alter table transactions enable row level security;

-- Policies for Categories
create policy "Users can view their own categories"
on categories for select
using (auth.uid() = user_id);

create policy "Users can insert their own categories"
on categories for insert
with check (auth.uid() = user_id);

create policy "Users can update their own categories"
on categories for update
using (auth.uid() = user_id);

create policy "Users can delete their own categories"
on categories for delete
using (auth.uid() = user_id);

-- Policies for Transactions
create policy "Users can view their own transactions"
on transactions for select
using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
on transactions for insert
with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
on transactions for update
using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
on transactions for delete
using (auth.uid() = user_id);

-- Create indexes for performance
create index idx_transactions_user_date on transactions(user_id, transaction_date);
create index idx_transactions_category on transactions(category_id);
