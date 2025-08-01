"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
            signUp: (email: string, password: string, name: string, company?: string) => Promise<{ error: Error | null }>;
          signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
          signInWithGoogle: () => Promise<{ error: Error | null }>;
          signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase().auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session loaded:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id 
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase().auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', { 
        event, 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id 
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, company?: string) => {
    const { error } = await supabase().auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company: company || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase().auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    console.log('Starting Google OAuth sign in...');
    console.log('Redirect URL:', `${window.location.origin}/auth/callback`);
    
    // Also log to server terminal
    console.log('🔍 [AUTH] Google OAuth initiated');
    console.log('🔍 [AUTH] Redirect URL:', `${window.location.origin}/auth/callback`);
    
    const { data, error } = await supabase().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    console.log('Google OAuth response:', { data, error });
    console.log('🔍 [AUTH] Google OAuth response:', { 
      hasData: !!data, 
      hasError: !!error, 
      errorMessage: error?.message,
      url: data?.url,
      fullUrl: data?.url ? new URL(data.url).toString() : null
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase().auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 