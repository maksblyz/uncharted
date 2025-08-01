"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import useChartStore from "@/store/useChartStore";
import ExportDropdown from "@/components/ExportDropdown";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function ChatHeader() {
  const { csvData, chartInitialized } = useChartStore();
  const { isPremium } = useSubscription();
  const router = useRouter();

  return (
    <div className="absolute top-8 left-8 right-8 z-10 flex items-center justify-between">
      <Image 
        src="/uncharted.webp" 
        alt="Uncharted Logo" 
        width={150} 
        height={60}
        className="h-12 w-auto"
      />
      
      <div className="flex items-center gap-4">
        {/* Only show export dropdown when chart is loaded */}
        {csvData && csvData.length > 0 && chartInitialized && (
          <ExportDropdown />
        )}
        
        {/* Premium button - only show if user is not premium */}
        {!isPremium && (
          <Button
            onClick={() => router.push('/premium')}
            className="h-10 px-4 text-white flex items-center gap-2"
            style={{ backgroundColor: '#3b82f6' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
          >
            Premium
          </Button>
        )}
        
        <Button
          onClick={() => router.push('/settings')}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-lg p-0 hover:opacity-80 transition-opacity"
          style={{ backgroundColor: '#6b7280' }}
        >
          M
        </Button>
      </div>
    </div>
  );
} 