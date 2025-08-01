-- Complete user data deletion script
-- This will delete ALL data for a specific user

-- Function to delete all user data
CREATE OR REPLACE FUNCTION delete_user_data(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
    user_id TEXT;
    deleted_charts INTEGER := 0;
    deleted_sessions INTEGER := 0;
    deleted_subscriptions INTEGER := 0;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RETURN 'User not found: ' || user_email;
    END IF;
    
    -- Delete user sessions
    DELETE FROM user_sessions 
    WHERE sessionId IN (
        SELECT sessionId 
        FROM user_sessions 
        WHERE currentState::text LIKE '%' || user_id || '%'
    );
    GET DIAGNOSTICS deleted_sessions = ROW_COUNT;
    
    -- Delete charts (this will cascade to chart_data)
    DELETE FROM charts 
    WHERE config::text LIKE '%' || user_id || '%'
       OR name LIKE '%' || user_email || '%';
    GET DIAGNOSTICS deleted_charts = ROW_COUNT;
    
    -- Delete subscription data
    DELETE FROM user_subscriptions 
    WHERE user_id = user_id;
    GET DIAGNOSTICS deleted_subscriptions = ROW_COUNT;
    
    -- Finally, delete the auth user
    DELETE FROM auth.users WHERE id = user_id;
    
    RETURN 'Deleted user data: ' || 
           deleted_charts || ' charts, ' || 
           deleted_sessions || ' sessions, ' || 
           deleted_subscriptions || ' subscriptions';
END;
$$ LANGUAGE plpgsql;

-- Function to delete ALL data (nuclear option)
CREATE OR REPLACE FUNCTION delete_all_data()
RETURNS TEXT AS $$
DECLARE
    deleted_charts INTEGER := 0;
    deleted_sessions INTEGER := 0;
    deleted_subscriptions INTEGER := 0;
    deleted_users INTEGER := 0;
BEGIN
    -- Delete all sessions
    DELETE FROM user_sessions;
    GET DIAGNOSTICS deleted_sessions = ROW_COUNT;
    
    -- Delete all charts (this will cascade to chart_data)
    DELETE FROM charts;
    GET DIAGNOSTICS deleted_charts = ROW_COUNT;
    
    -- Delete all subscriptions
    DELETE FROM user_subscriptions;
    GET DIAGNOSTICS deleted_subscriptions = ROW_COUNT;
    
    -- Delete all auth users (be very careful with this!)
    DELETE FROM auth.users;
    GET DIAGNOSTICS deleted_users = ROW_COUNT;
    
    RETURN 'Deleted ALL data: ' || 
           deleted_charts || ' charts, ' || 
           deleted_sessions || ' sessions, ' || 
           deleted_subscriptions || ' subscriptions, ' ||
           deleted_users || ' users';
END;
$$ LANGUAGE plpgsql;

-- Usage examples:
-- To delete a specific user's data:
-- SELECT delete_user_data('user@example.com');

-- To delete ALL data (nuclear option):
-- SELECT delete_all_data();

-- To see what data exists:
-- SELECT 'charts' as table_name, COUNT(*) as count FROM charts
-- UNION ALL
-- SELECT 'user_sessions', COUNT(*) FROM user_sessions
-- UNION ALL
-- SELECT 'user_subscriptions', COUNT(*) FROM user_subscriptions
-- UNION ALL
-- SELECT 'auth_users', COUNT(*) FROM auth.users; 