-- ====================================================================
-- SKILLBRIDGE PRODUCTION MIGRATION: LIVE TELEMETRY TRIGGER ENGINE
-- ====================================================================

-- 1. Create a dedicated database table to store system logs securely
CREATE TABLE IF NOT EXISTS public.admin_gps_tracking (
    id BIGSERIAL PRIMARY KEY,
    rider_id TEXT NOT NULL,
    rider_name TEXT NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    battery_percentage INT NOT NULL,
    status TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Construct the database procedure framework to clean old coordinates automatically
CREATE OR REPLACE FUNCTION public.process_live_telemetry_packet()
RETURNS TRIGGER AS $$
BEGIN
    -- Business rule: Automatically truncate log data older than 24 hours to keep computing memory clean
    DELETE FROM public.admin_gps_tracking WHERE updated_at < NOW() - INTERVAL '24 hours';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Wire up the persistent trigger rule onto the target schema
DROP TRIGGER IF EXISTS on_telemetry_update ON public.admin_gps_tracking;
CREATE TRIGGER on_telemetry_update
    AFTER INSERT ON public.admin_gps_tracking
    FOR EACH STATEMENT
    EXECUTE FUNCTION public.process_live_telemetry_packet();

COMMENT ON TABLE public.admin_gps_tracking IS 'Production telemetry tracking ledger active for Accra metropolitan delivery dispatch nodes.';
