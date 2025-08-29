// src/app/upload/page.tsx

"use client";

import DropUpload, { generateChartFromData } from "@/components/DropUpload";
import ChatHeader from "@/components/ChatHeader";
import UpgradePrompt from "@/components/premium/UpgradePrompt";
import useChartStore from "@/store/useChartStore";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
// Import useEffect, useState, and useSearchParams
import { useEffect, useState, Suspense } from "react"; 
import { useSearchParams, useRouter } from "next/navigation";

// Wrap your component logic in a new component to use Suspense
function UploadPageContent() {
  const { csvData, resetChart } = useChartStore();
  const { isPremium, checkUploadLimit, loading: subLoading, refreshSubscription } = useSubscription();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  
  const isSuccessRedirect = searchParams.get('success') === 'true';
  const [isFinalizing, setIsFinalizing] = useState(isSuccessRedirect);

  // This effect will poll for the subscription update
  useEffect(() => {
    if (!isFinalizing) return;

    console.log("Checkout success detected. Polling for subscription update...");
    const pollSubscription = setInterval(async () => {
      await refreshSubscription();
      // Since useSubscription's state updates, we can just rely on the component re-rendering
    }, 2000); // Poll every 2 seconds

    // Stop polling after 20 seconds to prevent an infinite loop
    const timeout = setTimeout(() => {
      console.error("Subscription update polling timed out.");
      clearInterval(pollSubscription);
      setIsFinalizing(false);
    }, 20000);

    return () => {
      clearInterval(pollSubscription);
      clearTimeout(timeout);
    };
  }, [isFinalizing, refreshSubscription]);

  // This effect will stop polling once the user is premium
  useEffect(() => {
    if (isPremium && isFinalizing) {
      console.log("Premium status confirmed. Stopping polling.");
      setIsFinalizing(false);
    }
  }, [isPremium, isFinalizing]);

  // Reset state when component mounts
  useEffect(() => {
    if (!isFinalizing) {
      setFileUploaded(false);
      setPrompt("");
    }
  }, [isFinalizing]);

  // Check if file is uploaded when csvData changes
  useEffect(() => {
    if (csvData && csvData.length > 0) {
      setFileUploaded(true);
    } else {
      setFileUploaded(false);
    }
  }, [csvData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvData || csvData.length === 0) {
      alert('Please upload a CSV file first');
      return;
    }
    if (!prompt.trim()) {
      alert('Please enter a prompt for your chart');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate the chart with user prompt
      await generateChartFromData(csvData, prompt);
      // Navigate to chart page
      router.push('/chart');
    } catch (error) {
      console.error('Error generating chart:', error);
      alert('Failed to generate chart. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUploaded = () => {
    setFileUploaded(true);
  };

  // Show a loading screen while finalizing the upgrade
  if (isFinalizing) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Finalizing your premium upgrade...</p>
          <p className="text-gray-400">This may take a few moments.</p>
        </div>
      </div>
    );
  }
  
  // Show loading spinner while subscription data is loading
  if (subLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Show upgrade prompt if user has hit their limit and is not premium
  if (!isPremium && !checkUploadLimit()) {
    console.log('Showing upgrade prompt - user hit limit');
    return <UpgradePrompt />;
  }

  // Show generating state
  if (isGenerating) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Generating your chart...</p>
          <p className="text-gray-400">This may take a few moments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative flex flex-col overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Header with logo */}
      <ChatHeader />
      
      <div className="flex-1 flex items-center justify-center pt-20 pb-24">
        <div className="w-full max-w-2xl mx-auto px-4 mt-6">
          {/* Upload area with white outline */}
          <div className="border-2 border-white rounded-3xl p-8 min-h-[400px] relative mb-6" style={{ backgroundColor: '#1a1a1a' }}>
            <DropUpload onFileUploaded={handleFileUploaded} />
          </div>

          {/* File status */}
          {fileUploaded && (
            <div className="mb-4 text-center">
              <p className="text-green-400 text-sm">✓ File uploaded successfully!</p>
            </div>
          )}
          
          {/* Prompt input and submit */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the chart you want to create..."
                className="h-12 pr-4 pl-4 border-white text-white placeholder:text-gray-400 focus:border-gray-300 rounded-lg text-base"
                style={{ backgroundColor: '#1a1a1a' }}
                disabled={isGenerating}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={!fileUploaded || !prompt.trim() || isGenerating}
              className="w-full h-12 text-white flex items-center justify-center gap-2 rounded-lg"
              style={{ backgroundColor: fileUploaded && prompt.trim() ? '#3b82f6' : '#444444' }}
              onMouseEnter={(e) => {
                if (fileUploaded && prompt.trim() && !isGenerating) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (fileUploaded && prompt.trim() && !isGenerating) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Chart...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Create Chart
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Export a new parent component that wraps the page content in Suspense
export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  );
}