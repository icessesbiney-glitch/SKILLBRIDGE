-- =========================================================================
-- SKILLBRIDGE CENTRALIZED LIVE RELEASE PRODUCTION MIGRATION PAYLOAD
-- GENERATED AUTOMATICALLY VIA TERMINATION DEPLOYMENT LOOPS
-- =========================================================================

-- FILE SOURCE TARGET: database/marketplace_production_schema.sql
-- =========================================================================
-- SKILLBRIDGE LIVE GLOBAL MARKETPLACE HUB BASELINE DATABASE SCHEMA
-- =========================================================================

CREATE TYPE user_role_tier AS ENUM ('customer', 'vendor_micro', 'vendor_elite', 'driver_rider', 'admin_central');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'suspended');
CREATE TYPE delivery_status AS ENUM ('idle', 'active_routine', 'part_time');

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    legal_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    role_tier user_role_tier DEFAULT 'customer'::user_role_tier,
    verification verification_status DEFAULT 'pending'::verification_status,
    national_id_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.platform_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL UNIQUE,
    balance_cents BIGINT DEFAULT 0 NOT NULL CONSTRAINT check_positive_balance CHECK (balance_cents >= 0),
    currency TEXT DEFAULT 'GHS' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.handle_new_profile_wallet_provision()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.platform_wallets (profile_id, balance_cents, currency)
    VALUES (NEW.id, 0, 'GHS') ON CONFLICT (profile_id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_on_profile_signup_provision_wallet
    AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_wallet_provision();


-- FILE SOURCE TARGET: supabase_wallet_logic.sql
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
$$;


-- FILE SOURCE TARGET: database/supabase_wallet_triggers.sql
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


