"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ConfirmPageContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');

      if (token_hash && type === 'signup') {
        try {
          const { error } = await supabase().auth.verifyOtp({
            token_hash,
            type: 'signup',
          });

          if (error) {
            setStatus('error');
            setMessage('Invalid or expired confirmation link. Please try signing up again.');
          } else {
            setStatus('success');
            setMessage('Email confirmed successfully! You can now sign in to your account.');
          }
        } catch {
          setStatus('error');
          setMessage('Something went wrong. Please try again.');
        }
      } else {
        setStatus('error');
        setMessage('Invalid confirmation link.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <h1 className="text-white text-2xl" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
              Confirming your email...
            </h1>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-white text-2xl" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
              Email Confirmed!
            </h1>
            <p className="text-gray-400" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
              {message}
            </p>
            <Link href="/auth/signin">
              <Button 
                className="bg-white text-black hover:bg-gray-100"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
              >
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-2xl">!</span>
            </div>
            <h1 className="text-white text-2xl" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
              Confirmation Failed
            </h1>
            <p className="text-gray-400" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
              {message}
            </p>
            <div className="space-y-3">
              <Link href="/auth/signup">
                <Button 
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-800"
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
                >
                  Try Signing Up Again
                </Button>
              </Link>
              <Link href="/">
                <Button 
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="w-full max-w-md text-center">
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <h1 className="text-white text-2xl" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <ConfirmPageContent />
    </Suspense>
  );
} 