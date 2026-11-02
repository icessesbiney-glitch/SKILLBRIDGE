-- Finalize the GPS migration without seeding fake rider data.
-- Runtime telemetry is written by the service-role API route.

ALTER TABLE IF EXISTS public.admin_gps_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated admins read access" ON public.admin_gps_tracking;
CREATE POLICY "Allow authenticated admins read access"
ON public.admin_gps_tracking
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role_tier = 'admin_central'
  )
);
