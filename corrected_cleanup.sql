-- Corrected cleanup script - Only deletes from existing tables

-- 1. Delete all charts (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'charts') THEN
        DELETE FROM charts;
        RAISE NOTICE 'Deleted all charts';
    ELSE
        RAISE NOTICE 'Charts table does not exist';
    END IF;
END $$;

-- 2. Delete all chart_data (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chart_data') THEN
        DELETE FROM chart_data;
        RAISE NOTICE 'Deleted all chart_data';
    ELSE
        RAISE NOTICE 'Chart_data table does not exist';
    END IF;
END $$;

-- 3. Delete all user_sessions (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_sessions') THEN
        DELETE FROM user_sessions;
        RAISE NOTICE 'Deleted all user_sessions';
    ELSE
        RAISE NOTICE 'User_sessions table does not exist';
    END IF;
END $$;

-- 4. Delete all user_subscriptions (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') THEN
        DELETE FROM user_subscriptions;
        RAISE NOTICE 'Deleted all user_subscriptions';
    ELSE
        RAISE NOTICE 'User_subscriptions table does not exist';
    END IF;
END $$;

-- 5. Delete all auth users
DO $$
BEGIN
    DELETE FROM auth.users;
    RAISE NOTICE 'Deleted all auth users';
END $$;

-- 6. Show what's left (only for tables that exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'charts') THEN
        RAISE NOTICE 'Charts remaining: %', (SELECT COUNT(*) FROM charts);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chart_data') THEN
        RAISE NOTICE 'Chart_data remaining: %', (SELECT COUNT(*) FROM chart_data);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_sessions') THEN
        RAISE NOTICE 'User_sessions remaining: %', (SELECT COUNT(*) FROM user_sessions);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') THEN
        RAISE NOTICE 'User_subscriptions remaining: %', (SELECT COUNT(*) FROM user_subscriptions);
    END IF;
    
    RAISE NOTICE 'Auth users remaining: %', (SELECT COUNT(*) FROM auth.users);
END $$; 