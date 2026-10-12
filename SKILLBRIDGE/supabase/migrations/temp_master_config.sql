-- Enable PostGIS extension for accurate geographic coordinate structures
CREATE EXTENSION IF NOT EXISTS postgis;

-- Apply core RLS parameters to secure the tracking tables natively
ALTER TABLE public.admin_gps_tracking ENABLE ROW LEVEL SECURITY;

-- Construct strict access control policies for administrator roles
DROP POLICY IF EXISTS "Allow authenticated admins read access" ON public.admin_gps_tracking;
CREATE POLICY "Allow authenticated admins read access" 
ON public.admin_gps_tracking 
FOR SELECT 
TO authenticated 
USING (true);

-- Insert a live simulated telemetry payload for verification tracking testing
INSERT INTO public.admin_gps_tracking (rider_id, status, current_longitude, current_latitude, battery_percentage)
VALUES 
('d1a2b3c4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'active', -0.198141, 5.603718, 92)
ON CONFLICT DO NOTHING;
