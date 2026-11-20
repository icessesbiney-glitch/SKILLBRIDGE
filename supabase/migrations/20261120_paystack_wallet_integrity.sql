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
  select * into tx
  from public.paystack_transactions
  where reference = payment_reference
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Unknown reference.');
  end if;
  if tx.status = 'success' then
    return jsonb_build_object('success', true, 'already_settled', true);
  end if;
  if tx.status <> 'initialized' then
    return jsonb_build_object('success', false, 'error', 'Transaction is not payable.');
  end if;
  if round(tx.amount * 100)::bigint <> paid_pesewas or tx.currency <> paid_currency then
    update public.paystack_transactions
    set status = 'amount_mismatch'
    where id = tx.id;
    return jsonb_build_object('success', false, 'error', 'Amount or currency mismatch.');
  end if;

  select id into wallet
  from public.platform_wallets
  where profile_id = tx.user_id
  for update;

  if wallet is null then
    return jsonb_build_object('success', false, 'error', 'Wallet is not initialized.');
  end if;

  insert into public.ledger_entries (wallet_id, amount_cents, entry_type, reference_id)
  values (wallet, paid_pesewas, 'deposit', 'deposit_' || payment_reference);

  update public.platform_wallets
  set balance_cents = balance_cents + paid_pesewas, updated_at = now()
  where id = wallet;

  update public.paystack_transactions
  set status = 'success', paid_at = now()
  where id = tx.id;

  return jsonb_build_object('success', true, 'user_id', tx.user_id, 'amount', tx.amount, 'credited', true);
end;
$$;
