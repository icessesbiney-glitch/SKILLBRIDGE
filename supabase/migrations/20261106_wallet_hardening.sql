-- Wallet and Paystack hardening. Run once in the Supabase SQL editor.

alter table public.ledger_entries drop constraint if exists check_entry_type;
alter table public.ledger_entries add constraint check_entry_type
  check (entry_type in ('payout', 'withdrawal', 'commission', 'deposit'));

create table if not exists public.paystack_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  reference text unique not null,
  paystack_transaction_id text,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'GHS',
  status text not null default 'initialized',
  metadata jsonb default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.paystack_transactions enable row level security;

drop policy if exists "Users read own paystack transactions" on public.paystack_transactions;
create policy "Users read own paystack transactions" on public.paystack_transactions
  for select using (auth.uid() = user_id);

drop policy if exists "Users start own paystack transactions" on public.paystack_transactions;
create policy "Users start own paystack transactions" on public.paystack_transactions
  for insert with check (auth.uid() = user_id and status = 'initialized');

-- Restores a failed withdrawal exactly once, using the amount recorded in the ledger.
create or replace function public.reverse_wallet_withdrawal(
  target_profile_id uuid,
  returned_amount_cents bigint,
  failed_reference text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  wallet uuid;
  original bigint;
begin
  select id into wallet from public.platform_wallets where profile_id = target_profile_id for update;
  if wallet is null then
    return jsonb_build_object('success', false, 'error', 'Wallet not initialized.');
  end if;

  select -amount_cents into original from public.ledger_entries
    where wallet_id = wallet and reference_id = failed_reference and entry_type = 'withdrawal';
  if original is null or original <= 0 then
    return jsonb_build_object('success', false, 'error', 'No matching withdrawal.');
  end if;

  if exists (select 1 from public.ledger_entries where reference_id = 'reversal_' || failed_reference) then
    return jsonb_build_object('success', true, 'already_reversed', true);
  end if;

  update public.platform_wallets set balance_cents = balance_cents + original, updated_at = now() where id = wallet;
  insert into public.ledger_entries (wallet_id, amount_cents, entry_type, reference_id)
    values (wallet, original, 'withdrawal', 'reversal_' || failed_reference);

  return jsonb_build_object('success', true, 'restored_cents', original);
end;
$$;

-- Marks a Paystack payment successful only when amount and currency match what was initialized.
create or replace function public.settle_paystack_payment(
  payment_reference text,
  paid_pesewas bigint,
  paid_currency text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  tx public.paystack_transactions;
  wallet uuid;
begin
  select * into tx from public.paystack_transactions where reference = payment_reference for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'Unknown reference.');
  end if;
  if tx.status = 'success' then
    return jsonb_build_object('success', true, 'already_settled', true);
  end if;
  if round(tx.amount * 100)::bigint <> paid_pesewas or tx.currency <> paid_currency then
    update public.paystack_transactions set status = 'amount_mismatch' where id = tx.id;
    return jsonb_build_object('success', false, 'error', 'Amount or currency mismatch.');
  end if;
  update public.paystack_transactions set status = 'success', paid_at = now() where id = tx.id;

  -- Credit the payer's wallet in the same transaction; the unique ledger reference makes this idempotent.
  select id into wallet from public.platform_wallets where profile_id = tx.user_id for update;
  if wallet is not null then
    insert into public.ledger_entries (wallet_id, amount_cents, entry_type, reference_id)
      values (wallet, paid_pesewas, 'deposit', 'deposit_' || payment_reference);
    update public.platform_wallets set balance_cents = balance_cents + paid_pesewas, updated_at = now() where id = wallet;
  end if;
  return jsonb_build_object('success', true, 'user_id', tx.user_id, 'amount', tx.amount, 'credited', wallet is not null);
end;
$$;

-- Money-moving functions must only be callable by the server (service role), never by browsers.
do $$
declare f record;
begin
  for f in
    select oid::regprocedure as sig from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname in (
        'execute_wallet_withdrawal', 'reverse_wallet_withdrawal', 'settle_paystack_payment',
        'increment_wallet_balance', 'decrement_wallet_balance'
      )
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;

-- Profiles: users may read their own row (used by the admin check) but never change role or verification.
alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

revoke update on public.profiles from anon, authenticated;
grant update (legal_name, phone_number) on public.profiles to authenticated;
