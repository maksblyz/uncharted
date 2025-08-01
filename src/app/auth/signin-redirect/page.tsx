"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SigninRedirect() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleSigninRedirect = async () => {
      try {
        console.log('🔍 [SIGNIN-REDIRECT] Starting signin redirect handler...');
        
        // Get the current session
        const { data: { session } } = await supabase().auth.getSession();
        
        if (!session) {
          console.log('🔍 [SIGNIN-REDIRECT] No session found');
          setError("No session found. Please try signing in again.");
          setLoading(false);
          return;
        }

        console.log("🔍 [SIGNIN-REDIRECT] Session found, redirecting to upload page...");
        console.log("🔍 [SIGNIN-REDIRECT] User:", session.user.email);
        
        // Redirect to upload page on successful sign in
        window.location.href = '/upload';
        
      } catch (error) {
        console.error("🔍 [SIGNIN-REDIRECT] Error in signin redirect:", error);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    handleSigninRedirect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="text-center">
          <div className="text-gray-400 mb-4">Signing you in...</div>
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
            onClick={() => window.location.href = '/auth/signin'}
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