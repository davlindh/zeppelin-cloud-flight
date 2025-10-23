-- Fix ambiguous column reference in get_available_times function
-- The issue: variable name 'available_times' conflicts with column name 'available_times'
DROP FUNCTION IF EXISTS public.get_available_times(uuid, text);

CREATE OR REPLACE FUNCTION public.get_available_times(service_uuid uuid, selected_date text)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  service_times TEXT[];
  booked_times TEXT[];
  result_times TEXT[];
BEGIN
  -- Explicitly qualify the column with table name to avoid ambiguity
  SELECT s.available_times INTO service_times
  FROM public.services s
  WHERE s.id = service_uuid;

  -- Get booked times for the selected date
  SELECT ARRAY_AGG(b.selected_time) INTO booked_times
  FROM public.bookings b
  WHERE b.service_id = service_uuid
    AND b.selected_date = get_available_times.selected_date
    AND b.status != 'cancelled';

  -- Return available times if no bookings exist
  IF booked_times IS NULL THEN
    RETURN service_times;
  ELSE
    -- Filter out booked times from service times
    SELECT ARRAY_AGG(t) INTO result_times
    FROM UNNEST(service_times) AS t
    WHERE t != ALL(booked_times);
    
    RETURN COALESCE(result_times, ARRAY[]::TEXT[]);
  END IF;
END;
$function$;