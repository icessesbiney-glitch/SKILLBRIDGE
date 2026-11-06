-- =========================================================================
-- SKILLBRIDGE PRODUCTION SYSTEM WALLET MUTATION TRIGGERS
-- =========================================================================

CREATE OR REPLACE FUNCTION public.increment_wallet_balance(
    target_user_email TEXT,
    amount_cents_to_add BIGINT,
    transaction_reference_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    matched_profile_id UUID;
    target_wallet_id UUID;
    new_balance_cents BIGINT;
BEGIN
    -- 1. Identify internal profile reference identities from user email records
    SELECT id INTO matched_profile_id 
    FROM public.profiles 
    WHERE phone_number = target_user_email OR legal_name = target_user_email
    LIMIT 1;

    IF matched_profile_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unable to resolve marketplace user profile identity matching given credentials.');
    END IF;

    -- 2. Obtain explicit system row-level lock states to safeguard against race validations
    SELECT id, balance_cents INTO target_wallet_id, new_balance_cents
    FROM public.platform_wallets
    WHERE profile_id = matched_profile_id
    FOR UPDATE;

    -- Automatically provision a ledger wallet state if one does not exist yet
    IF target_wallet_id IS NULL THEN
        INSERT INTO public.platform_wallets (profile_id, balance_cents, currency)
        VALUES (matched_profile_id, amount_cents_to_add, 'GHS')
        RETURNING id, balance_cents INTO target_wallet_id, new_balance_cents;
    ELSE
        UPDATE public.platform_wallets
        SET balance_cents = balance_cents + amount_cents_to_add,
            updated_at = TIMEZONE('utc'::text, NOW())
        WHERE id = target_wallet_id
        RETURNING balance_cents INTO new_balance_cents;
    END IF;

    -- 3. Log matching auditing data tracks inside ledger logs
    INSERT INTO public.ledger_entries (wallet_id, amount_cents, entry_type, reference_id)
    VALUES (target_wallet_id, amount_cents_to_add, 'payout', transaction_reference_id);

    RETURN jsonb_build_object(
        'success', true,
        'wallet_id', target_wallet_id,
        'updated_balance_cents', new_balance_cents
    );
END;
$$;
