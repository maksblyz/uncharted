"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import useChartStore from "@/store/useChartStore";
import ExportDropdown from "@/components/ExportDropdown";
import { useRouter } from "next/navigation";

export default function ChatHeader() {
  const { csvData, chartInitialized } = useChartStore();
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
        

        
        <Button
          onClick={() => router.push('/settings')}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-lg p-0 hover:opacity-80 transition-opacity"
          style={{ backgroundColor: '#3b82f6' }}
        >
          M
        </Button>
      </div>
    </div>
  );
} 