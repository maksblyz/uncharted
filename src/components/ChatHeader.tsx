"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import useChartStore from "@/store/useChartStore";

export default function ChatHeader() {
  const { csvData, chartInitialized } = useChartStore();

  const handleExport = () => {
    // Export functionality - could save as image or export data
    alert('Export functionality coming soon!');
  };

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
        {/* Only show export button when chart is loaded */}
        {csvData && csvData.length > 0 && chartInitialized && (
          <Button 
            onClick={handleExport}
            className="h-10 w-10 p-0 text-white"
            style={{ backgroundColor: '#444444' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555555'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444444'}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
        
        <Button 
          className="h-10 text-white"
          style={{ backgroundColor: '#444444' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#555555'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#444444'}
        >
          My Charts
        </Button>
        
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-lg" style={{ backgroundColor: '#3b82f6' }}>
          M
        </div>
      </div>
    </div>
  );
} 