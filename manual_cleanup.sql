-- Manual cleanup script - Run these commands in order

-- 1. Delete all user sessions
DELETE FROM user_sessions;

-- 2. Delete all charts (this will automatically delete related chart_data due to CASCADE)
DELETE FROM charts;

-- 3. Delete all subscription data
DELETE FROM user_subscriptions;

-- 4. Delete all auth users (this will completely reset your auth system)
DELETE FROM auth.users;

-- 5. Reset any auto-incrementing sequences (if any)
-- Note: This is not needed for CUID-based IDs, but included for completeness

-- Verify everything is deleted
SELECT 'charts' as table_name, COUNT(*) as remaining_records FROM charts
UNION ALL
SELECT 'user_sessions', COUNT(*) FROM user_sessions
UNION ALL
SELECT 'user_subscriptions', COUNT(*) FROM user_subscriptions
UNION ALL
SELECT 'auth_users', COUNT(*) FROM auth.users; 