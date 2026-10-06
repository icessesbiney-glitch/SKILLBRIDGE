-- =========================================================================
-- SKILLBRIDGE PRODUCTION SYSTEM WALLET LEDGER ROUTINES
-- =========================================================================

-- 1. TRACKING AND BALANCES TRANSACTIONS SCHEMA
CREATE TABLE IF NOT EXISTS public.platform_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL UNIQUE,
    balance_cents BIGINT DEFAULT 0 NOT NULL CONSTRAINT check_positive_balance CHECK (balance_cents >= 0),
    currency TEXT DEFAULT 'GHS' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID REFERENCES public.platform_wallets(id) ON DELETE RESTRICT NOT NULL,
    amount_cents BIGINT NOT NULL,
    entry_type TEXT NOT NULL CONSTRAINT check_entry_type CHECK (entry_type IN ('payout', 'withdrawal', 'commission')),
    reference_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.platform_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- 2. ATOMIC WITHDRAWAL ROUTINE TRANSACTION WITH DOUBLE-SPENDING PROTECTION
CREATE OR REPLACE FUNCTION public.execute_wallet_withdrawal(
    target_profile_id UUID,
    requested_amount_cents BIGINT,
    payment_reference TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_wallet_id UUID;
    available_cents BIGINT;
    response_payload JSONB;
BEGIN
    -- Enforce row locking to safeguard against simultaneous runtime races
    SELECT id, balance_cents INTO current_wallet_id, available_cents
    FROM public.platform_wallets
    WHERE profile_id = target_profile_id
    FOR UPDATE;

    IF current_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Platform user does not possess an active wallet account state.';
    END IF;

    -- Enforce platform-wide checkout limits (e.g., minimum 50 GHS / 5000 Cents threshold)
    IF requested_amount_cents < 5000 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Withdrawal requests must meet the baseline 50 GHS minimum threshold.');
    END IF;

    IF available_cents < requested_amount_cents THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds available inside wallet balance.');
    END IF;

    -- Deduct transaction values atomically
    UPDATE public.platform_wallets
    SET balance_cents = balance_cents - requested_amount_cents,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = current_wallet_id;

    -- Log transaction path tracking inside table
    INSERT INTO public.ledger_entries (wallet_id, amount_cents, entry_type, reference_id)
    VALUES (current_wallet_id, -requested_amount_cents, 'withdrawal', payment_reference);

    RETURN jsonb_build_object(
        'success', true,
        'reference', payment_reference,
        'withdrawn_cents', requested_amount_cents,
        'remaining_balance_cents', (available_cents - requested_amount_cents)
    );
END;
$$;
