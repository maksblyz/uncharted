"use client";

import SignUpForm from '@/components/auth/SignUpForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-white text-3xl mb-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            Create Account
          </h1>
          <p className="text-gray-400" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            Join Uncharted and start creating perfect charts
          </p>
        </div>

        <SignUpForm />

        <div className="mt-8 text-center">
          <p className="text-gray-400" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-white hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 