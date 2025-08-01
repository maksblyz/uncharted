"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to upload page
  useEffect(() => {
    if (user && !loading) {
      router.push('/upload');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Hero Section */}
      <section className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Background Chart */}
        <div className="absolute inset-0 opacity-20">
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
          >
            {/* Background bars - using same animation as actual app */}
            <defs>
              <linearGradient id="barGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a4a4a" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="barGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a4a4a" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="barGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a4a4a" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="barGradient4" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a4a4a" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="barGradient5" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a4a4a" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            
            <rect x="2" y="20" width="16" height="0" rx="2" fill="url(#barGradient1)">
              <animate attributeName="height" values="0;70" dur="1s" begin="0s" fill="freeze" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" />
              <animate attributeName="y" values="90;20" dur="1s" begin="0s" fill="freeze" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" />
            </rect>
            <rect x="22" y="30" width="16" height="0" rx="2" fill="url(#barGradient2)">
              <animate attributeName="height" values="0;60" dur="1s" begin="0.1s" fill="freeze" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" />
              <animate attributeName="y" values="90;30" dur="1s" begin="0.1s" fill="freeze" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" />
            </rect>
            <rect x="42" y="40" width="16" height="0" rx="2" fill="url(#barGradient3)">
              <animate attributeName="height" values="0;50" dur="1s" begin="0.2s" fill="freeze" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" />
              <animate attributeName="y" values="90;40" dur="1s" begin="0.2s" fill="freeze" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" />
            </rect>
            <rect x="62" y="50" width="16" height="0" rx="2" fill="url(#barGradient4)">
              <animate attributeName="height" values="0;40" dur="1s" begin="0.3s" fill="freeze" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" />
              <animate attributeName="y" values="90;50" dur="1s" begin="0.3s" fill="freeze" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" />
            </rect>
            <rect x="82" y="60" width="16" height="0" rx="2" fill="url(#barGradient5)">
              <animate attributeName="height" values="0;30" dur="1s" begin="0.4s" fill="freeze" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" />
              <animate attributeName="y" values="90;60" dur="1s" begin="0.4s" fill="freeze" calcMode="spline" keySplines="0.25 0.46 0.45 0.94" />
            </rect>
          </svg>
        </div>

        {/* Header with Login/Sign Up */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 md:gap-4 z-10">
          {user ? (
            <>
              <span className="text-white text-xs md:text-sm hidden sm:block" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
                Welcome, {user.user_metadata?.name || user.email}
              </span>
              <Button 
                onClick={() => signOut()}
                variant="ghost" 
                className="text-white hover:text-gray-300 text-xs md:text-sm px-2 md:px-4"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-gray-300 text-xs md:text-sm px-2 md:px-4"
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
                >
                  Log In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button 
                  className="text-white text-xs md:text-sm px-2 md:px-4"
                  style={{ backgroundColor: '#3b82f6', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="text-center relative z-10 px-4">
          {/* Logo and Brand Name */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-11 mb-8 md:mb-16">
            <Image 
              src="/uncharted.webp" 
              alt="Uncharted Logo" 
              width={250} 
              height={250}
              className="h-24 md:h-48 w-auto"
            />
            <span className="text-white text-6xl sm:text-7xl md:text-6xl lg:text-9xl tracking-wider" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
              UNCHARTED
            </span>
          </div>
          
          {/* Slogan */}
          <p className="text-gray-400 text-xl md:text-3xl lg:text-5xl mb-12 md:mb-20 px-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
            Zero hallucinations. Infinite customization.
          </p>
          
          {/* Call-to-Action Button */}
          <Link href="/upload">
            <Button 
              size="lg"
              className="text-black text-lg md:text-xl lg:text-2xl px-4 md:px-6 py-2 md:py-3 h-auto bg-white hover:bg-gray-100"
              style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
            >
              Try It Now
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Video Section */}
      <section className="relative py-12 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center">
            <div className="relative w-full max-w-4xl rounded-lg md:rounded-2xl overflow-hidden shadow-2xl">
              <video 
                className="w-full h-auto"
                autoPlay 
                loop 
                muted 
                playsInline
                poster="/video-poster.jpg"
              >
                <source src="/demo-video.mp4" type="video/mp4" />
                <source src="/demo-video.webm" type="video/webm" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video overlay with play button for visual appeal */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 md:p-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[8px] md:border-l-[12px] border-l-black border-t-[6px] md:border-t-[8px] border-t-transparent border-b-[6px] md:border-b-[8px] border-b-transparent ml-0.5 md:ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-16 md:py-32 px-4 md:px-8 overflow-hidden">
        {/* grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 80px),
              repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 80px)
            `,
            maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
          }}
        />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-white text-3xl md:text-5xl lg:text-6xl mb-8 md:mb-12" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
              How It Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <span className="text-white text-lg md:text-xl font-bold" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  1
                </span>
              </div>
              <h3 className="text-white text-lg md:text-xl lg:text-2xl mb-2 md:mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
                You upload a CSV
              </h3>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <span className="text-white text-lg md:text-xl font-bold" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  2
                </span>
              </div>
              <h3 className="text-white text-lg md:text-xl lg:text-2xl mb-2 md:mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
                Describe your vision
              </h3>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <span className="text-white text-lg md:text-xl font-bold" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                  3
                </span>
              </div>
              <h3 className="text-white text-lg md:text-xl lg:text-2xl mb-2 md:mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}>
                AI renders it perfectly
              </h3>
            </div>
          </div>
          
          {/* Try for Free Button */}
          <div className="text-center mt-16 md:mt-24">
            <Link href="/upload">
              <Button 
                size="lg"
                className="text-black text-lg md:text-xl px-6 md:px-8 py-3 md:py-4 h-auto bg-white hover:bg-gray-100"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400 }}
              >
                Try For Free
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative py-12 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Empty footer content */}
        </div>
      </footer>
    </div>
  );
}