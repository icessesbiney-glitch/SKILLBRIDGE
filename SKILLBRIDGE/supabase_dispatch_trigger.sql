-- 1. Create the trigger function that automatically runs when an order is created
CREATE OR REPLACE FUNCTION public.trigger_auto_dispatch_matching_loop()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS \[ DECLARE     matched_rider_id UUID;     calculated_distance DOUBLE PRECISION; BEGIN     -- Execute your compiled PostGIS proximity function to find the nearest active rider within 5000 meters     SELECT matched_rider_profile_id, calculated_distance_meters     INTO matched_rider_id, calculated_distance     FROM public.match_closest_delivery_rider(         NEW.id,         NEW.pickup_latitude,         NEW.pickup_longitude,         5000.00     );      -- If a close, active rider is found, instantly assign the delivery tracking row     IF matched_rider_id IS NOT NULL THEN         INSERT INTO public.delivery_assignments (             order_id,             rider_profile_id,             assignment_status,             rejection_count_at_assignment         ) VALUES (             NEW.id,             matched_rider_id,             'pending',             0         );     END IF;      RETURN NEW; END; \];

-- 2. Bind the trigger to fire instantly AFTER any row insertion into delivery_orders
DROP TRIGGER IF EXISTS trg_after_order_creation_dispatch ON public.delivery_orders;
CREATE TRIGGER trg_after_order_creation_dispatch
    AFTER INSERT ON public.delivery_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_auto_dispatch_matching_loop();
