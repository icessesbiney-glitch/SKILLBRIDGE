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
    or payment_reference !~ '^cashout_[0-9a-f-]{36}$'
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
