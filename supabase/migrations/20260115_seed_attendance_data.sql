-- Seed Attendance Data for TODAY
-- Using Vijako Tower as the center: 21.0285, 105.8542

WITH today_date AS (
    SELECT CURRENT_DATE AS date_val
)
INSERT INTO attendance (
    employee_id,
    check_in,
    check_out,
    location_lat,
    location_lng,
    site_id,
    status
)
SELECT 
    e.id as employee_id,
    -- Check-in time: 07:30 to 08:30 AM today
    (CURRENT_DATE + interval '7 hours' + interval '30 minutes' + (random() * interval '60 minutes')) as check_in,
    NULL as check_out,
    -- Location Logic
    CASE 
        -- 90% chance to be INSIDE geofence (approx 200m radius ~ 0.0018 degrees)
        WHEN random() < 0.9 THEN 
            21.0285 + ((random() * 2 - 1) * 0.0015)
        -- 10% chance to be OUTSIDE (shifted further away)
        ELSE 
            21.0285 + ((random() * 2 - 1) * 0.01) -- Approx 1km spread
    END as location_lat,
    CASE 
        -- Same logic for Longitude
        WHEN random() < 0.9 THEN 
            105.8542 + ((random() * 2 - 1) * 0.0015)
        ELSE 
            105.8542 + ((random() * 2 - 1) * 0.01)
    END as location_lng,
    e.site as site_id,
    'present' as status
FROM employees e
-- Avoid duplicates for today if ran multiple times
WHERE NOT EXISTS (
    SELECT 1 FROM attendance a 
    WHERE a.employee_id = e.id 
    AND a.check_in >= CURRENT_DATE 
    AND a.check_in < CURRENT_DATE + interval '1 day'
);

-- Update last_checkin in employees table
UPDATE employees e
SET last_checkin = a.check_in
FROM attendance a
WHERE e.id = a.employee_id
AND a.check_in >= CURRENT_DATE;
