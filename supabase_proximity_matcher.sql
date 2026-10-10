-- Database function to calculate distances and match the closest rider within a 5km radius cell boundary
CREATE OR REPLACE FUNCTION public.match_closest_delivery_rider(
    target_order_id UUID,
    pickup_lat NUMERIC,
    pickup_lng NUMERIC,
    max_radius_meters NUMERIC DEFAULT 5000.00
)
RETURNS TABLE (
    matched_rider_profile_id UUID,
    calculated_distance_meters DOUBLE PRECISION
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS \[ BEGIN     RETURN QUERY     SELECT          p.id AS matched_rider_profile_id,         ST_Distance(             ST_SetSRID(ST_MakePoint(t.longitude::DOUBLE PRECISION, t.latitude::DOUBLE PRECISION), 4362),             ST_SetSRID(ST_MakePoint(pickup_lng::DOUBLE PRECISION, pickup_lat::DOUBLE PRECISION), 4362)         ) AS calculated_distance_meters     FROM public.gps_profiles p     JOIN public.gps_telemetry t ON t.profile_id = p.id     WHERE p.profile_type = 'rider'       AND p.is_active = true       AND t.current_status = 'on_duty'       -- Verify rider's latest telemetry location timestamp is fresh within the past 10 minutes       AND t.recorded_at >= NOW() - INTERVAL '10 minutes'       -- Limit lookup radius bounds cleanly (Default to 5000 meters / 5 kilometers)       AND ST_DWithin(             ST_SetSRID(ST_MakePoint(t.longitude::DOUBLE PRECISION, t.latitude::DOUBLE PRECISION), 4362),             ST_SetSRID(ST_MakePoint(pickup_lng::DOUBLE PRECISION, pickup_lat::DOUBLE PRECISION), 4362),             max_radius_meters       )     -- Exclude riders who have already declined this specific dispatch layout structure     AND NOT EXISTS (         SELECT 1          FROM public.delivery_assignments da          WHERE da.order_id = target_order_id            AND da.rider_profile_id = p.id            AND da.assignment_status = 'declined'     )     ORDER BY calculated_distance_meters ASC     LIMIT 1; END; \];
