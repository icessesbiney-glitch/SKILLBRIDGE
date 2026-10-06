-- =========================================================================
-- SKILLBRIDGE LIVE GLOBAL MARKETPLACE HUB BASELINE DATABASE SCHEMA
-- =========================================================================

-- 1. ENUMS SETUP
CREATE TYPE user_role_tier AS ENUM ('customer', 'vendor_micro', 'vendor_elite', 'driver_rider', 'admin_central');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'suspended');
CREATE TYPE delivery_status AS ENUM ('idle', 'active_routine', 'part_time');

-- 2. CORE USER PROFILES TABLE (Requires Ghana Card Verification metadata)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    legal_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    role_tier user_role_tier DEFAULT 'customer'::user_role_tier,
    verification verification_status DEFAULT 'pending'::verification_status,
    national_id_hash TEXT, -- Cryptographic placeholder for Ghana Card signups
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. MARKETPLACE VENDORS ENGINE TABLE
CREATE TABLE public.vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT NOT NULL,
    store_name TEXT NOT NULL,
    product_categories TEXT[] DEFAULT '{}', -- garments, devices, accessories, lights, raw drinks
    wholesaler_commission_rate NUMERIC(5,2) DEFAULT 0.00, -- Wholesale distribution commission fee rules
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. DELIVERY LOGISTICS TRACKING TABLE (With decline tracking penalizations)
CREATE TABLE public.logistics_agents (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    current_status delivery_status DEFAULT 'idle'::delivery_status NOT NULL,
    live_gps_latitude DOUBLE PRECISION,
    live_gps_longitude DOUBLE PRECISION,
    declined_orders_count INT DEFAULT 0 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are visible to verified users." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Vendors can update their own store metrics." ON public.vendors FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all system real-time GPS tracking coordinates." ON public.logistics_agents FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role_tier = 'admin_central')
);

-- =========================================================================
-- AUTOMATED MARKETPLACE WALLET STATE INITIALIZATION SYSTEM
-- =========================================================================

CREATE OR REPLACE FUNCTION public.handle_new_profile_wallet_provision()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.platform_wallets (profile_id, balance_cents, currency)
    VALUES (NEW.id, 0, 'GHS')
    ON CONFLICT (profile_id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_on_profile_signup_provision_wallet
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_profile_wallet_provision();
