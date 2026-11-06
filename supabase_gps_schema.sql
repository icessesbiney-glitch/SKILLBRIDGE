-- Enable PostGIS extension for accurate location geography metrics
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Create tracking profiles for system tracking
CREATE TABLE IF NOT EXISTS public.gps_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    profile_type TEXT NOT NULL CHECK (profile_type IN ('driver', 'rider')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the live coordinates telemetry data matrix
CREATE TABLE IF NOT EXISTS public.gps_telemetry (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID REFERENCES public.gps_profiles(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    current_status TEXT NOT NULL DEFAULT 'on_duty' CHECK (current_status IN ('on_duty', 'off_duty', 'on_delivery', 'paused')),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for rapid hyper-local geo querying capabilities
CREATE INDEX IF NOT EXISTS idx_gps_profiles_user ON public.gps_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_gps_telemetry_recorded_at ON public.gps_telemetry(recorded_at DESC);
