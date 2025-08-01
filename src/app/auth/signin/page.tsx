"use client";

import SignInForm from '@/components/auth/SignInForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-white text-3xl mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            Welcome Back
          </h1>
          <p className="text-gray-400" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            Sign in to your account
          </p>
        </div>

        <SignInForm />

        <div className="mt-8 text-center">
          <p className="text-gray-400" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-white hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 