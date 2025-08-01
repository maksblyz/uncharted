"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupRedirect() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleSignupRedirect = async () => {
      try {
        console.log('🔍 [SIGNUP-REDIRECT] Starting signup redirect handler...');
        
        // Get the current session
        const { data: { session } } = await supabase().auth.getSession();
        
        if (!session) {
          console.log('🔍 [SIGNUP-REDIRECT] No session found');
          setError("No session found. Please try signing up again.");
          setLoading(false);
          return;
        }

        console.log("🔍 [SIGNUP-REDIRECT] Session found, redirecting to premium page...");
        console.log("🔍 [SIGNUP-REDIRECT] User:", session.user.email);
        
        // Redirect to premium page on successful signup
        window.location.href = '/premium';
        
      } catch (error) {
        console.error("🔍 [SIGNUP-REDIRECT] Error in signup redirect:", error);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    handleSignupRedirect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="text-center">
          <div className="text-gray-400 mb-4">Setting up your account...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="text-center">
          <div className="text-red-400 text-sm mb-4">{error}</div>
          <button
            onClick={() => window.location.href = '/auth/signup'}
            className="px-4 py-2 text-sm font-medium text-white border border-white rounded-md hover:bg-white hover:text-black transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return null;
} 