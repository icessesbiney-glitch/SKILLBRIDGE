-- 1. Create the master table tracking delivery orders parameters
CREATE TABLE IF NOT EXISTS public.delivery_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_reference TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL,
    vendor_id UUID NOT NULL,
    pickup_latitude NUMERIC(10, 7) NOT NULL,
    pickup_longitude NUMERIC(10, 7) NOT NULL,
    delivery_latitude NUMERIC(10, 7) NOT NULL,
    delivery_longitude NUMERIC(10, 7) NOT NULL,
    order_total NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the real-time assignment mapping matrix table
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
    rider_profile_id UUID REFERENCES public.gps_profiles(id) ON DELETE SET NULL,
    assignment_status TEXT NOT NULL DEFAULT 'pending' CHECK (assignment_status IN ('pending', 'accepted', 'declined', 'expired')),
    decline_reason TEXT,
    rejection_count_at_assignment INT DEFAULT 0,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the rider penalty compliance matrix log table
CREATE TABLE IF NOT EXISTS public.rider_compliance_logs (
    id BIGSERIAL PRIMARY KEY,
    rider_profile_id UUID REFERENCES public.gps_profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
    violation_type TEXT NOT NULL CHECK (violation_type IN ('proximity_decline', 'timeout_expiry', 'unauthorized_offline')),
    penalty_fee NUMERIC(10, 2) DEFAULT 0.00,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index maps for rapid localized delivery dispatch lookups
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_order ON public.delivery_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_rider ON public.delivery_assignments(rider_profile_id);
CREATE INDEX IF NOT EXISTS idx_rider_compliance_rider ON public.rider_compliance_logs(rider_profile_id);
