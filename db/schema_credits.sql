-- User Credits Table
create table if not exists public.user_credits (
  user_id uuid references auth.users(id) primary key,
  balance integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure updated_at exists if table was created previously without it
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'user_credits' and column_name = 'updated_at') then
    alter table public.user_credits add column updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
  end if;
end $$;

-- Enable RLS
alter table public.user_credits enable row level security;

-- Policy: Users can read their own balance
drop policy if exists "Users can read own balance" on public.user_credits;
create policy "Users can read own balance"
  on public.user_credits for select
  using (auth.uid() = user_id);

-- Policy: Service role can update (Backend usage) - implicit full access for service role

-- RPC: Deduct Credits (Transactional)
create or replace function deduct_credits(uid uuid, amount int)
returns int
language plpgsql
security definer
as $$
declare
  current_bal int;
  new_bal int;
begin
  -- Lock the row for update
  select balance into current_bal from public.user_credits where user_id = uid for update;
  
  if not found then
    -- Auto-create wallet if missing? Or error?
    -- Let's auto-create with 0 balance for graceful handling
    insert into public.user_credits (user_id, balance) values (uid, 0) returning balance into current_bal;
  end if;

  if current_bal < amount then
    raise exception 'Insufficient credits';
  end if;

  update public.user_credits 
  set balance = balance - amount,
      updated_at = now()
  where user_id = uid 
  returning balance into new_bal;
  
  return new_bal;
end;
$$;

-- RPC: Increment Credits (For Testing/Demo)
create or replace function increment_credits(user_id uuid, amount int)
returns void
language sql
security definer
as $$
  insert into public.user_credits (user_id, balance)
  values (user_id, amount)
  on conflict (user_id) do update
  set balance = user_credits.balance + amount,
      updated_at = now();
$$;
