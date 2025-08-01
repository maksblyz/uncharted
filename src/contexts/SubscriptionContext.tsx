"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface UserSubscription {
  id: string;
  user_id: string;
  upload_count: number;
  is_premium: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  loading: boolean;
  uploadCount: number;
  isPremium: boolean;
  incrementUploadCount: () => Promise<void>;
  checkUploadLimit: () => boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching subscription for user:', user.id);
      
      // Ensure Supabase client is initialized
      let supabaseClient;
      try {
        supabaseClient = supabase();
        console.log('Supabase client initialized:', !!supabaseClient);
      } catch (initError) {
        console.error('Failed to initialize Supabase client:', initError);
        setLoading(false);
        return;
      }
      
      // Test basic connection
      const { data: authData, error: authError } = await supabaseClient.auth.getUser();
      console.log('Auth test:', { authData, authError });
      
      // Test if we can access the table at all
      const { data: testData, error: testError } = await supabaseClient
        .from('user_subscriptions')
        .select('count')
        .limit(1);
      
      console.log('Table access test:', { testData, testError });
      
      // If we can't access the table at all, it might not exist
      if (testError && testError.code === 'PGRST116') {
        console.error('user_subscriptions table does not exist or is not accessible');
        console.error('Please run the SQL setup from SUPABASE_SETUP.md');
        setLoading(false);
        return;
      }

      const { data, error } = await supabaseClient
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('Subscription fetch result:', { data, error });

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching subscription:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      }

      if (data) {
        setSubscription(data as unknown as UserSubscription);
      } else {
        // Create new subscription for user
        console.log('Creating new subscription for user:', user.id);
        
        // Try to insert the subscription directly (upsert approach)
        const { data: newSubscription, error: createError } = await supabaseClient
          .from('user_subscriptions')
          .upsert({
            user_id: user.id,
            upload_count: 0,
            is_premium: false,
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        console.log('Subscription creation result:', { newSubscription, createError });

        if (createError) {
          console.error('Error creating subscription:', createError);
          console.error('Create error details:', {
            message: createError.message,
            code: createError.code,
            details: createError.details,
            hint: createError.hint
          });
          
          // If upsert fails, try a simple insert
          console.log('Trying simple insert as fallback...');
          const { data: fallbackSubscription, error: fallbackError } = await supabaseClient
            .from('user_subscriptions')
            .insert({
              user_id: user.id,
              upload_count: 0,
              is_premium: false,
            })
            .select()
            .single();
            
          console.log('Fallback insert result:', { fallbackSubscription, fallbackError });
          
          if (!fallbackError && fallbackSubscription) {
            setSubscription(fallbackSubscription as unknown as UserSubscription);
          }
        } else {
          setSubscription(newSubscription as unknown as UserSubscription);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserSubscription:', error);
      console.error('Error type:', typeof error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserSubscription();
  }, [fetchUserSubscription]);

  const incrementUploadCount = async () => {
    if (!subscription) return;

    const newCount = subscription.upload_count + 1;
    const supabaseClient = supabase();
    
    const { data, error } = await supabaseClient
      .from('user_subscriptions')
      .update({ upload_count: newCount })
      .eq('id', subscription.id)
      .select()
      .single();

    if (error) {
      console.error('Error incrementing upload count:', error);
    } else {
      setSubscription(data as unknown as UserSubscription);
    }
  };

  const checkUploadLimit = () => {
    // If still loading, assume user can upload (don't block them)
    if (loading) return true;
    // If no subscription loaded yet, assume user can upload
    if (!subscription) return true;
    // Premium users have unlimited uploads
    if (subscription.is_premium) return true;
    // Free users get 3 uploads
    return subscription.upload_count < 3;
  };

  const refreshSubscription = async () => {
    await fetchUserSubscription();
  };

  const value = {
    subscription,
    loading,
    uploadCount: subscription?.upload_count || 0,
    isPremium: subscription?.is_premium || false,
    incrementUploadCount,
    checkUploadLimit,
    refreshSubscription,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
} 