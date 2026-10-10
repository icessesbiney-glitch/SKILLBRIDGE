-- Create tracking lookup metadata values for system riders and delivery drivers
CREATE TYPE vehicle_status AS ENUM ('part_time', 'personal_routine', 'active_delivery', 'offline');

-- Primary real-time GPS tracking schema matrix table
CREATE TABLE IF NOT EXISTS public.system_trackers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_name TEXT NOT NULL,
    associated_identity_card TEXT NOT NULL, -- Ghana Card Verification Linkage Record
    current_latitude NUMERIC(10, 8) NOT NULL,
    current_longitude NUMERIC(11, 8) NOT NULL,
    active_status vehicle_status DEFAULT 'offline'::vehicle_status,
    last_ping_timestamp TIMESTAMPTZ DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- Turn on row level security gating mechanisms for protection bounds
ALTER TABLE public.system_trackers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select transactions for close location matching"
    ON public.system_trackers FOR SELECT USING (true);

CREATE POLICY "Allow authenticated internal sync overrides on tracking pings"
    ON public.system_trackers FOR ALL TO authenticated USING (true) WITH CHECK (true);