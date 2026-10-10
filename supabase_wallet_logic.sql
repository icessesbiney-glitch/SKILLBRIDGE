-- =========================================================================
-- SKILLBRIDGE PRODUCTION SYSTEM WALLET LEDGER ROUTINES
-- =========================================================================

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
BEGIN
    SELECT id, balance_cents INTO current_wallet_id, available_cents
    FROM public.platform_wallets
    WHERE profile_id = target_profile_id
    FOR UPDATE;

    IF current_wallet_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Wallet not initialized.');
    END IF;

    IF requested_amount_cents < 5000 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Withdrawal must meet 50 GHS minimum.');
    END IF;

    IF available_cents < requested_amount_cents THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds available.');
    END IF;

    UPDATE public.platform_wallets
    SET balance_cents = balance_cents - requested_amount_cents,
        updated_at = NOW()
    WHERE id = current_wallet_id;

    INSERT INTO public.ledger_entries (wallet_id, amount_cents, entry_type, reference_id)
    VALUES (current_wallet_id, -requested_amount_cents, 'withdrawal', payment_reference);

    RETURN jsonb_build_object(
        'success', true,
        'reference', payment_reference,
        'withdrawn_cents', requested_amount_cents,
        'remaining_balance_cents', (available_cents - requested_amount_cents)
    );
END;
<<<<<<< HEAD
$$;
=======
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Lock the wallet functions down so only the server (service role key) can call them.
-- Without this, anyone holding the public publishable key could credit or debit any wallet.
REVOKE EXECUTE ON FUNCTION increment_wallet_balance(TEXT, NUMERIC) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION decrement_wallet_balance(TEXT, NUMERIC) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_wallet_balance(TEXT, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION decrement_wallet_balance(TEXT, NUMERIC) TO service_role;
>>>>>>> cfc2e2d86a438fc386c68b7927c07fe07b861bb0
