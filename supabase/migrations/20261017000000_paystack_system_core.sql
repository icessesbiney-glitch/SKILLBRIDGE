-- Core live transaction table structure for handling real payment items
CREATE TABLE IF NOT EXISTS public.paystack_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reference TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'GHS',
    status TEXT NOT NULL DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure absolute transactional safety by creating a unique reference constraint index
CREATE UNIQUE INDEX IF NOT EXISTS idx_paystack_transactions_reference ON public.paystack_transactions(reference);

-- Real-time system core wallet or ledger updating functionality for completed payments
CREATE OR REPLACE FUNCTION public.credit_paystack_wallet(
    p_user_id UUID,
    p_amount NUMERIC,
    p_reference TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.paystack_transactions (user_id, reference, amount, status, metadata)
    VALUES (p_user_id, p_reference, p_amount, 'success', p_metadata)
    ON CONFLICT (reference) 
    DO UPDATE SET 
        status = 'success', 
        updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
