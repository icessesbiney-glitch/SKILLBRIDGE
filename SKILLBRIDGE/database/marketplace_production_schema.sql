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
