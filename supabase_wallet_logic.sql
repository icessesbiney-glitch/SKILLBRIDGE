-- 1. Create the base rider wallet balance master table mapping
CREATE TABLE IF NOT EXISTS public.rider_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_profile_id UUID REFERENCES public.gps_profiles(id) ON DELETE CASCADE UNIQUE,
    current_balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (current_balance >= -50.00),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the immutable double-entry ledger transaction logs matrix
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id BIGSERIAL PRIMARY KEY,
    wallet_id UUID REFERENCES public.rider_wallets(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('delivery_payout', 'compliance_penalty', 'withdrawal_payout')),
    reference_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Trigger function to dynamically recalculate and enforce wallet balance modifiers
CREATE OR REPLACE FUNCTION public.process_rider_wallet_transaction()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS \[ BEGIN     INSERT INTO public.rider_wallets (rider_profile_id, current_balance, updated_at)     VALUES (NEW.rider_profile_id, 0.00, NOW())     ON CONFLICT (rider_profile_id) DO NOTHING;      IF NEW.violation_type IS NOT NULL THEN         UPDATE public.rider_wallets         SET current_balance = current_balance - NEW.penalty_fee,             updated_at = NOW()         WHERE rider_profile_id = NEW.rider_profile_id;                          INSERT INTO public.wallet_transactions (wallet_id, amount, transaction_type, reference_id)         SELECT id, -NEW.penalty_fee, 'compliance_penalty', 'PENALTY-' \vert{}\vert{} NEW.id::text         FROM public.rider_wallets WHERE rider_profile_id = NEW.rider_profile_id;     END IF;      RETURN NEW; END; \];

-- 4. Bind the ledger hook trigger to run automatically after a penalty event hits your logs
DROP TRIGGER IF EXISTS trg_after_compliance_penalty_deduction ON public.rider_compliance_logs;
CREATE TRIGGER trg_after_compliance_penalty_deduction
    AFTER INSERT ON public.rider_compliance_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.process_rider_wallet_transaction();

-- Index tables mapping profiles for lightning-fast localized accounting calculations lookup
CREATE INDEX IF NOT EXISTS idx_rider_wallets_profile ON public.rider_wallets(rider_profile_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id);
