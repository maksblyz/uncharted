"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="space-y-6">
          <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white text-2xl">!</span>
          </div>
          
          <h1 className="text-white text-2xl" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            Authentication Error
          </h1>
          
          <p className="text-gray-400" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            There was an issue with the authentication process. This could be due to:
          </p>
          
          <ul className="text-gray-400 text-sm text-left space-y-2" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            <li>• Invalid or expired authentication link</li>
            <li>• OAuth provider configuration issue</li>
            <li>• Network connectivity problems</li>
          </ul>
          
          <div className="space-y-3 pt-4">
            <Link href="/auth/signin">
              <Button 
                className="w-full bg-white text-black hover:bg-gray-100"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
              >
                Try Signing In Again
              </Button>
            </Link>
            
            <Link href="/auth/signup">
              <Button 
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-800"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
              >
                Create New Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 