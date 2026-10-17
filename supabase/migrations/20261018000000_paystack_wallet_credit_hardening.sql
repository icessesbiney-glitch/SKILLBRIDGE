-- SkillBridge Paystack: verified, atomic, idempotent wallet credits.
-- This migration intentionally stops if the deployed wallet schema differs.
-- Confirm public.platform_wallets(user_id, available_balance, total_earnings)
-- before applying it to a production database.

DO $preflight$
BEGIN
  IF to_regclass('public.platform_wallets') IS NULL THEN
    RAISE EXCEPTION 'Missing public.platform_wallets; wallet schema must be resolved first.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='platform_wallets'
      AND column_name='user_id'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='platform_wallets'
      AND column_name='available_balance'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='platform_wallets'
      AND column_name='total_earnings'
  ) THEN
    RAISE EXCEPTION 'Wallet schema mismatch: expected platform_wallets(user_id, available_balance, total_earnings). No wallet changes made.';
  END IF;
  IF to_regclass('public.paystack_transactions') IS NULL THEN
    RAISE EXCEPTION 'Missing public.paystack_transactions.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='paystack_transactions'
      AND column_name='user_id'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='paystack_transactions'
      AND column_name='reference'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='paystack_transactions'
      AND column_name='amount'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='paystack_transactions'
      AND column_name='currency'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='paystack_transactions'
      AND column_name='status'
  ) THEN
    RAISE EXCEPTION 'Paystack transaction table is missing required columns.';
  END IF;
END;
$preflight$;

ALTER TABLE public.paystack_transactions
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS paystack_transaction_id bigint,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS public.paystack_wallet_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  paystack_transaction_id bigint NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL CHECK (currency = 'GHS'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS paystack_transactions_reference_uidx
  ON public.paystack_transactions(reference);

CREATE UNIQUE INDEX IF NOT EXISTS paystack_transactions_provider_id_uidx
  ON public.paystack_transactions(paystack_transaction_id)
  WHERE paystack_transaction_id IS NOT NULL;

ALTER TABLE public.paystack_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paystack_wallet_ledger ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.paystack_wallet_ledger FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.paystack_wallet_ledger TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.paystack_transactions TO service_role;

-- Remove the legacy function that marked payments successful without
-- verifying or crediting the wallet. The new five-argument function replaces it.
DROP FUNCTION IF EXISTS public.credit_paystack_wallet(uuid, numeric, text, jsonb);
CREATE OR REPLACE FUNCTION public.credit_paystack_wallet(
  p_reference text,
  p_paystack_transaction_id bigint,
  p_amount numeric,
  p_currency text,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  payment_row public.paystack_transactions%ROWTYPE;
  ledger_row public.paystack_wallet_ledger%ROWTYPE;
BEGIN
  IF p_reference IS NULL OR length(trim(p_reference)) = 0
     OR p_paystack_transaction_id IS NULL OR p_paystack_transaction_id <= 0
     OR p_amount IS NULL OR p_amount <= 0
     OR p_currency IS DISTINCT FROM 'GHS'
     OR p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid payment parameters.');
  END IF;

  SELECT * INTO payment_row
  FROM public.paystack_transactions
  WHERE reference = p_reference
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment reference not found.');
  END IF;

  IF payment_row.user_id IS DISTINCT FROM p_user_id
     OR payment_row.currency IS DISTINCT FROM p_currency
     OR payment_row.amount IS DISTINCT FROM p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment details do not match.');
  END IF;

  IF payment_row.paystack_transaction_id IS NOT NULL
     AND payment_row.paystack_transaction_id <> p_paystack_transaction_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Provider transaction ID mismatch.');
  END IF;

  IF payment_row.status = 'success' THEN
    SELECT * INTO ledger_row
    FROM public.paystack_wallet_ledger
    WHERE reference = p_reference;

    IF FOUND
       AND ledger_row.user_id = p_user_id
       AND ledger_row.amount = p_amount
       AND ledger_row.currency = p_currency
       AND ledger_row.paystack_transaction_id = p_paystack_transaction_id THEN
      RETURN jsonb_build_object('success', true, 'already_processed', true);
    END IF;

    RETURN jsonb_build_object('success', false, 'error', 'Successful transaction has no matching ledger credit.');
  END IF;

  IF payment_row.status <> 'initialized' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment is not awaiting credit.');
  END IF;

  -- Unique ledger keys, wallet update, and transaction status update all run
  -- in this same database transaction. Any failure rolls back every change.
  INSERT INTO public.paystack_wallet_ledger
    (reference, paystack_transaction_id, user_id, amount, currency)
  VALUES
    (p_reference, p_paystack_transaction_id, p_user_id, p_amount, p_currency);

  INSERT INTO public.platform_wallets
    (user_id, available_balance, total_earnings, updated_at)
  VALUES
    (p_user_id, p_amount, p_amount, now())
  ON CONFLICT (user_id) DO UPDATE
  SET available_balance = public.platform_wallets.available_balance + EXCLUDED.available_balance,
      total_earnings = public.platform_wallets.total_earnings + EXCLUDED.total_earnings,
      updated_at = now();

  UPDATE public.paystack_transactions
  SET status = 'success',
      paystack_transaction_id = p_paystack_transaction_id,
      updated_at = now()
  WHERE reference = p_reference;

  RETURN jsonb_build_object('success', true, 'already_processed', false);
END;
$function$;

REVOKE ALL ON FUNCTION public.credit_paystack_wallet(text, bigint, numeric, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.credit_paystack_wallet(text, bigint, numeric, text, uuid) TO service_role;
