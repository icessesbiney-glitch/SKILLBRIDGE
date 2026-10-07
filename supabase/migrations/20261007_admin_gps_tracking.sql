-- Create a secure table for tracking real-time delivery rider paths
CREATE TABLE IF NOT EXISTS public.admin_gps_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    live_latitude NUMERIC(9, 6) NOT NULL,
    live_longitude NUMERIC(9, 6) NOT NULL,
    bearing NUMERIC(5, 2) DEFAULT 0.0,
    speed NUMERIC(4, 2) DEFAULT 0.0,
    is_active_delivery BOOLEAN DEFAULT TRUE,
    last_ping_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index geo-coordinates for smooth real-time querying performance
CREATE INDEX IF NOT EXISTS idx_gps_rider_active ON public.admin_gps_tracking (rider_id) WHERE is_active_delivery = TRUE;

-- Turn on Row Level Security to lock down coordinates
ALTER TABLE public.admin_gps_tracking ENABLE ROW LEVEL SECURITY;

-- Apply security policy: Only the verified admin role can watch live updates
CREATE POLICY "Only administrators can read live tracking data" 
ON public.admin_gps_tracking FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
