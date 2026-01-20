-- Add budget_limit to categories table
alter table categories 
add column if not exists budget_limit numeric default 0;

-- Update existing rows to have 0 if needed (default handles it, but good for clarity)
update categories set budget_limit = 0 where budget_limit is null;
