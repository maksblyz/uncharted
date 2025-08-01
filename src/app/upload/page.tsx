// src/app/upload/page.tsx

"use client";

import DropUpload from "@/components/DropUpload";
import ChartRenderer from "@/components/ChartRenderer";
import ChatBox from "@/components/ChatBox";
import ChatHeader from "@/components/ChatHeader";
import UpgradePrompt from "@/components/premium/UpgradePrompt";
import useChartStore from "@/store/useChartStore";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Undo2, Plus } from "lucide-react";
// Import useEffect, useState, and useSearchParams
import { useEffect, useState, Suspense } from "react"; 
import { useSearchParams } from "next/navigation";

// Wrap your component logic in a new component to use Suspense
function UploadPageContent() {
  const { csvData, chartInitialized, canUndo, undo, loadChart, isLoading, resetChart } = useChartStore();
  const { isPremium, checkUploadLimit, loading: subLoading, uploadCount, subscription, refreshSubscription } = useSubscription();
  const searchParams = useSearchParams();
  
  const isSuccessRedirect = searchParams.get('success') === 'true';
  const isUpgraded = searchParams.get('upgraded') === 'true';
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

  // Load chart on page load
  useEffect(() => {
    if (!isFinalizing) {
      loadChart();
    }
  }, [loadChart, isFinalizing]);

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
  
  // Show loading spinner while subscription data is loading or chart is loading
  if (subLoading || isLoading) {
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

  return (
    <div className="h-screen relative flex flex-col overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Header with logo */}
      <ChatHeader />
      
      <div className="flex-1 flex items-center justify-center pt-20 pb-24">
        <div className="w-full max-w-7xl mx-auto px-4 mt-6">
          {/* Main content area */}
          {csvData && csvData.length > 0 && chartInitialized ? (
            // Show chart when data is loaded AND chart has been initialized
            <div className="w-full max-w-7xl mx-auto h-[500px] overflow-hidden">
              <ChartRenderer />
            </div>
                      ) : (
              // Show upload area with white outline when no data OR chart not initialized
              <div className="border-2 border-white rounded-3xl p-8 min-h-[500px] relative max-w-2xl mx-auto" style={{ backgroundColor: '#1a1a1a' }}>
                <DropUpload />
              </div>
          )}
          
          {/* Chat box - only show after chart is generated */}
          {csvData && csvData.length > 0 && chartInitialized && (
            <div className="mt-5 w-full max-w-2xl mx-auto">
              <ChatBox />
            </div>
          )}
          
          {/* Action buttons - only show after chart is generated */}
          {csvData && csvData.length > 0 && chartInitialized && (
            <div className="mt-6 w-full max-w-2xl mx-auto flex items-center justify-center gap-4">
              <Button
                onClick={undo}
                disabled={!canUndo}
                className="h-10 px-4 text-white flex items-center gap-2"
                style={{ backgroundColor: canUndo ? '#444444' : '#222222' }}
                onMouseEnter={(e) => canUndo && (e.currentTarget.style.backgroundColor = '#555555')}
                onMouseLeave={(e) => canUndo && (e.currentTarget.style.backgroundColor = '#444444')}
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </Button>
              
              <Button
                onClick={resetChart}
                className="h-10 px-4 text-white flex items-center gap-2"
                style={{ backgroundColor: '#3b82f6' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                <Plus className="h-4 w-4" />
                New Chart
              </Button>
            </div>
          )}
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