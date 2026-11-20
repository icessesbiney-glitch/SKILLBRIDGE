drop function if exists public.reverse_wallet_withdrawal(uuid, bigint, text);

create or replace function public.reverse_wallet_withdrawal(
  target_profile_id uuid,
  returned_amount_cents bigint,
  failed_reference text,
  allow_success_reversal boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  wallet uuid;
  transfer_user_id uuid;
  transfer_status text;
  transfer_amount bigint;
  original bigint;
begin
  if target_profile_id is null
    or returned_amount_cents is null
    or returned_amount_cents <= 0
    or failed_reference is null
  then
    return jsonb_build_object('success', false, 'error', 'Invalid reversal request.');
  end if;

  select id into wallet
  from public.platform_wallets
  where profile_id = target_profile_id
  for update;
  if wallet is null then
    return jsonb_build_object('success', false, 'error', 'Wallet not initialized.');
  end if;

  select user_id, status, amount_cents
  into transfer_user_id, transfer_status, transfer_amount
  from public.paystack_transfers
  where reference = failed_reference
  for update;
  if not found or transfer_user_id <> target_profile_id then
    return jsonb_build_object('success', false, 'error', 'No matching cashout.');
  end if;

  select -amount_cents into original
  from public.ledger_entries
  where wallet_id = wallet
    and reference_id = failed_reference
    and entry_type = 'withdrawal';
  if original is null or original <= 0 or original <> transfer_amount then
    return jsonb_build_object('success', false, 'error', 'Cashout ledger amount does not match.');
  end if;
  if returned_amount_cents <> original then
    return jsonb_build_object('success', false, 'error', 'Provider amount does not match the cashout.');
  end if;

  if exists (
    select 1
    from public.ledger_entries
    where reference_id = 'reversal_' || failed_reference
      and wallet_id = wallet
      and entry_type = 'withdrawal'
  ) then
    update public.paystack_transfers
    set status = 'reversed', updated_at = now(), completed_at = coalesce(completed_at, now())
    where reference = failed_reference;
    return jsonb_build_object('success', true, 'already_reversed', true);
  end if;

  if transfer_status = 'reversed' then
    return jsonb_build_object('success', false, 'error', 'Cashout is reversed without a matching ledger entry.');
  end if;
  if transfer_status not in ('initialized', 'pending', 'success') then
    return jsonb_build_object('success', false, 'error', 'Cashout is not reversible.');
  end if;
  if transfer_status = 'success' and allow_success_reversal is distinct from true then
    return jsonb_build_object('success', false, 'error', 'A failed event cannot reverse a completed cashout.');
  end if;

  update public.platform_wallets
  set balance_cents = balance_cents + original, updated_at = now()
  where id = wallet;

  insert into public.ledger_entries (wallet_id, amount_cents, entry_type, reference_id)
  values (wallet, original, 'withdrawal', 'reversal_' || failed_reference);

  update public.paystack_transfers
  set status = 'reversed', updated_at = now(), completed_at = coalesce(completed_at, now())
  where reference = failed_reference;

  return jsonb_build_object('success', true, 'restored_cents', original);
end;
$$;

revoke all on function public.reverse_wallet_withdrawal(uuid, bigint, text, boolean)
from public, anon, authenticated;
grant execute on function public.reverse_wallet_withdrawal(uuid, bigint, text, boolean)
to service_role;

revoke update (legal_name, phone_number) on public.profiles from anon, authenticated;
revoke insert, update, delete on public.profiles from anon, authenticated;
