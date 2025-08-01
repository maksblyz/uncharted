"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getStripe } from '@/lib/stripe';

export default function UpgradePrompt() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const handleUpgrade = async () => {
    if (!user) {
      console.error('No user found for upgrade');
      setError('User not found. Please try signing in again.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError('Failed to create checkout session. Please try again.');
        return;
      }

      const { sessionId, error } = await response.json();
      
      if (error) {
        setError('Failed to create checkout session. Please try again.');
        return;
      }

      if (!sessionId) {
        setError('Failed to create checkout session. Please try again.');
        return;
      }
      
      const stripe = await getStripe();
      if (stripe) {
        const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });
        
        if (redirectError) {
          setError('Failed to redirect to payment page. Please try again.');
        }
      } else {
        setError('Payment system not available. Please try again later.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mx-auto mb-6">
              <Image 
                src="/uncharted.webp" 
                alt="Uncharted Logo" 
                width={120} 
                height={120}
                className="h-24 w-auto"
              />
            </div>
            
            <h1 className="text-white text-3xl mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
              Free Limit Reached
            </h1>
            
            <p className="text-gray-400 text-lg mb-8" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
              You&apos;ve used all 3 free chart generations. Upgrade to Premium for unlimited charts and advanced features.
            </p>
          </div>

          <div className="bg-gray-700 rounded-2xl p-6 mb-8">
            <h2 className="text-white text-xl mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
              Premium Features
            </h2>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
                  Unlimited chart generations
                </span>
              </div>
              
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
                  Priority support
                </span>
              </div>
              
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-gray-300" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
                  Export high-resolution charts
                </span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="text-center">
                <span className="text-white text-3xl font-bold" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  $9.99
                </span>
                <span className="text-gray-400 ml-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
                  /month
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full h-12 text-white"
              style={{ backgroundColor: '#3b82f6', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              {loading ? 'Processing...' : 'Upgrade to Premium'}
            </Button>
            
            <Button
              onClick={handleSettings}
              variant="ghost"
              className="w-full h-12 text-gray-400 hover:text-black"
              style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Settings
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 text-sm text-red-400 bg-red-900/20 border border-red-500 rounded-md">
              {error}
            </div>
          )}

          {/* Manual refresh button for after payment */}
          <div className="mt-4 text-center">
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              className="text-gray-400 hover:text-white text-sm"
              style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
            >
              Already paid? Click here to refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 