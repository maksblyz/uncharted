"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';

interface PremiumUpgradeProps {
  onSkip: () => void;
  onUpgrade: () => void;
}

export default function PremiumUpgrade({ onSkip, onUpgrade }: PremiumUpgradeProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await onUpgrade();
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-white text-3xl mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            Welcome to Uncharted!
          </h1>
          
          <p className="text-gray-400 text-lg mb-8" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            You get 3 free chart generations. Upgrade to Premium for unlimited charts and advanced features.
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
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
                Advanced customization options
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
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
          >
            {loading ? 'Processing...' : 'Upgrade to Premium'}
          </Button>
          
          <Button
            onClick={onSkip}
            variant="ghost"
            className="w-full h-12 text-gray-400 hover:text-white"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
          >
            Start with Free Plan
          </Button>
        </div>

        <p className="text-gray-500 text-sm mt-6" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
          You can upgrade anytime from your account settings
        </p>
      </div>
    </div>
  );
} 