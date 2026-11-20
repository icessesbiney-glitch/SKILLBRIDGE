create table if not exists public.paystack_transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique,
  recipient_code text,
  transfer_code text,
  amount_cents bigint not null check (amount_cents >= 5000),
  currency text not null default 'GHS' check (currency = 'GHS'),
  status text not null default 'initialized'
    check (status in ('initialized', 'pending', 'success', 'reversed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.paystack_transfers enable row level security;
revoke all on public.paystack_transfers from public, anon, authenticated;
grant select, insert, update on public.paystack_transfers to service_role;

create unique index if not exists paystack_transfers_one_active_per_user
on public.paystack_transfers (user_id)
where status in ('initialized', 'pending');

create or replace function public.execute_wallet_withdrawal(
  target_profile_id uuid,
  requested_amount_cents bigint,
  payment_reference text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  wallet uuid;
  current_balance bigint;
  existing_wallet uuid;
  existing_amount bigint;
begin
  if target_profile_id is null
    or requested_amount_cents is null
    or requested_amount_cents < 5000
    or payment_reference is null
    or payment_reference !~ '^cashout_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  then
    return jsonb_build_object('success', false, 'error', 'Invalid cashout request.');
  end if;

  perform pg_advisory_xact_lock(hashtextextended(payment_reference, 0));

  select id, balance_cents
  into wallet, current_balance
  from public.platform_wallets
  where profile_id = target_profile_id
  for update;

  if wallet is null then
    return jsonb_build_object('success', false, 'error', 'Wallet not initialized.');
  end if;

  if exists (
    select 1
    from public.paystack_transfers
    where user_id = target_profile_id
      and status in ('initialized', 'pending')
  ) then
    return jsonb_build_object('success', false, 'error', 'A cashout is already being processed.');
  end if;

  select wallet_id, amount_cents
  into existing_wallet, existing_amount
  from public.ledger_entries
  where reference_id = payment_reference
    and entry_type = 'withdrawal'
  limit 1;

  if found then
    if existing_wallet = wallet and existing_amount = -requested_amount_cents then
      return jsonb_build_object('success', true, 'already_debited', true);
    end if;
    return jsonb_build_object('success', false, 'error', 'Cashout reference has already been used.');
  end if;

  if current_balance < requested_amount_cents then
    return jsonb_build_object('success', false, 'error', 'Insufficient wallet balance.');
  end if;

  update public.platform_wallets
  set balance_cents = balance_cents - requested_amount_cents,
      updated_at = now()
  where id = wallet;

  insert into public.ledger_entries (wallet_id, amount_cents, entry_type, reference_id)
  values (wallet, -requested_amount_cents, 'withdrawal', payment_reference);

  insert into public.paystack_transfers (user_id, reference, amount_cents)
  values (target_profile_id, payment_reference, requested_amount_cents);

  return jsonb_build_object(
    'success', true,
    'already_debited', false,
    'balance_cents', current_balance - requested_amount_cents
  );
end;
$$;

revoke all on function public.execute_wallet_withdrawal(uuid, bigint, text)
from public, anon, authenticated;
grant execute on function public.execute_wallet_withdrawal(uuid, bigint, text)
to service_role;

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
  select id into wallet
  from public.platform_wallets
  where profile_id = target_profile_id
  for update;
  if wallet is null then
    return jsonb_build_object('success', false, 'error', 'Wallet not initialized.');
  end if;

  select -amount_cents into original
  from public.ledger_entries
  where wallet_id = wallet
    and reference_id = failed_reference
    and entry_type = 'withdrawal';
  if original is null or original <= 0 then
    return jsonb_build_object('success', false, 'error', 'No matching withdrawal.');
  end if;

  if exists (
    select 1 from public.ledger_entries
    where reference_id = 'reversal_' || failed_reference
  ) then
    update public.paystack_transfers
    set status = 'reversed', updated_at = now(), completed_at = coalesce(completed_at, now())
    where reference = failed_reference;
    return jsonb_build_object('success', true, 'already_reversed', true);
  end if;

  update public.platform_wallets
  set balance_cents = balance_cents + original, updated_at = now()
  where id = wallet;

  insert into public.ledger_entries (wallet_id, amount_cents, entry_type, reference_id)
  values (wallet, original, 'withdrawal', 'reversal_' || failed_reference);

  update public.paystack_transfers
  set status = 'reversed', updated_at = now(), completed_at = now()
  where reference = failed_reference;

  return jsonb_build_object('success', true, 'restored_cents', original);
end;
$$;

revoke all on function public.reverse_wallet_withdrawal(uuid, bigint, text)
from public, anon, authenticated;
grant execute on function public.reverse_wallet_withdrawal(uuid, bigint, text)
to service_role;
