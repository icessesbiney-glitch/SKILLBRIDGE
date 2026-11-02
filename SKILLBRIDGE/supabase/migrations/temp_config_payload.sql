-- Compatibility migration for deployments that previously applied the temporary
-- GPS configuration payload. The canonical table is created by
-- 20261007_admin_gps_tracking.sql; this migration only makes its read policy
-- idempotent and does not insert synthetic production telemetry.

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
