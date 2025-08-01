import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a client-side only Supabase instance
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = () => {
  if (!supabaseInstance) {
    console.log('Initializing Supabase client...');
    console.log('Environment variables check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseAnonKey?.length || 0
    });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables:', {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey
      });
      throw new Error('Supabase environment variables are not configured');
    }
    
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
      console.log('Supabase client created successfully');
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      throw error;
    }
  }
  return supabaseInstance;
};

// For server-side usage (API routes)
export const createServerSupabaseClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase server environment variables:', {
      url: !!supabaseUrl,
      serviceKey: !!supabaseServiceKey
    });
    throw new Error('Supabase server environment variables are not configured');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}; 