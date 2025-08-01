"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import PremiumUpgrade from '@/components/premium/PremiumUpgrade';
import { getStripe } from '@/lib/stripe';

export default function WelcomePage() {
  const { user, loading: authLoading } = useAuth();
  const { loading: subLoading } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleUpgrade = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const { sessionId, error } = await response.json();
      
      if (error) {
        console.error('Error creating checkout session:', error);
        return;
      }

      const stripe = await getStripe();
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error during upgrade:', error);
    }
  };

  const handleSkip = () => {
    router.push('/upload');
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PremiumUpgrade onSkip={handleSkip} onUpgrade={handleUpgrade} />
  );
} 