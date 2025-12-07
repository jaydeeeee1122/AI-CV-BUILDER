
-- Run this in your Supabase SQL Editor

-- 1. Create the Credits Table
create table if not exists public.user_credits (
  user_id uuid references auth.users not null primary key,
  balance int not null default 0,
  created_at timestamptz default now()
);

-- 2. Enable RLS (Security)
alter table public.user_credits enable row level security;

-- 3. Policy: Users can read their own balance
create policy "Users can read own balance"
  on public.user_credits for select
  using ( auth.uid() = user_id );

-- 4. Policy: Only Postgres/Service Role can update balance (Prevent frontend hacking)
-- No update policy for public/authenticated users implies they cannot update it directly.

-- 5. Function to handle new user signup (The 30 Credit Bonus)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_credits (user_id, balance)
  values (new.id, 30); -- Promising 30 Free Credits
  return new;
end;
$$ language plpgsql security definer;

-- 6. Trigger to call the function on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. RPC Function for backend to deduct credits safely
create or replace function deduct_credits(uid uuid, amount int)
returns int
language plpgsql
security definer
as $$
declare
  current_bal int;
  new_bal int;
begin
  select balance into current_bal from public.user_credits where user_id = uid;
  
  if current_bal < amount then
    raise exception 'Insufficient credits';
  end if;

  update public.user_credits
  set balance = balance - amount
  where user_id = uid
  returning balance into new_bal;
  
  return new_bal;
end;
$$;

-- 8. RPC Function to add credits (For Stripe Webhook or Demo)
create or replace function increment_credits(user_id uuid, amount int)
returns void
language plpgsql
security definer
as $$
begin
  update public.user_credits
  set balance = balance + amount
  where user_id = increment_credits.user_id;
  
  -- If row doesn't exist (edge case), insert it
  if not found then
    insert into public.user_credits (user_id, balance) values (user_id, amount);
  end if;
end;
$$;
