"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase().auth.signUp({
        email,
        password,
        options: {
          data: {
            name: email.split('@')[0], // Use email prefix as default name
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        console.log("Signup response:", { user: data.user, session: data.session });
        
        if (data.session) {
          // User is immediately signed in (email confirmation not required)
          console.log("Session available, redirecting to premium upgrade...");
          window.location.href = '/settings';
        } else {
          // Email confirmation required
          console.log("No session, email confirmation required");
          setError("Account created! Please check your email to confirm, then sign in.");
        }
      }
    } catch (err) {
      console.error('Unexpected error during sign up:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🔍 [GOOGLE] Starting Google OAuth signup...');
      
      const { error } = await supabase().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/signup-redirect`
        }
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        setError(error.message || 'Failed to sign up with Google');
      } else {
        console.log('🔍 [GOOGLE] Google OAuth signup initiated successfully');
      }
    } catch (err) {
      console.error('Unexpected error during Google sign up:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-base"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: 'white' }}
            disabled={loading}
          />
        </div>

        <div>
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 text-base"
            style={{ backgroundColor: '#1a1a1a', borderColor: '#333', color: 'white' }}
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base bg-white text-black hover:bg-gray-100"
          style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
          disabled={loading}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-black text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-full h-12 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md border border-gray-300 flex items-center justify-center font-medium text-sm"
            style={{ fontFamily: 'Roboto, Arial, sans-serif' }}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing up...' : 'Sign up with Google'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 text-sm text-red-400 bg-red-900/20 border border-red-500 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
} 