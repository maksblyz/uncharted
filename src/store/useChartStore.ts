import { create } from "zustand";
import { VibeConfig } from "@/lib/vibe-config";
import { getSessionId } from "@/lib/session";

type Store = {
  csvData: Record<string, unknown>[];
  config: VibeConfig;
  chartInitialized: boolean;
  configHistory: VibeConfig[];
  canUndo: boolean;
  sessionId: string;
  isLoading: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  setCsvData: (d: Record<string, unknown>[]) => void;
  setConfig: (c: VibeConfig) => void;
  setChartInitialized: (initialized: boolean) => void;
  setGenerating: (generating: boolean) => void;
  undo: () => void;
  saveChart: () => Promise<void>;
  loadChart: () => Promise<void>;
  autoSave: () => Promise<void>;
  resetChart: () => void;
};

const defaultConfig: VibeConfig = {
  chartType: "bar",
  xKey: "",
  yKey: "",
  palette: ["#7dd3fc", "#60a5fa", "#818cf8", "#c084fc", "#f472b6"],
  axisStyle: "classic",
  animation: { easing: "cubicOut", duration: 1000 },
  font: { family: "Inter", size: 12, weight: 500 },
  tooltipStyle: "shadow",
  grid: "none",
  themePreset: "shadcn-dark",
  legend: {
    show: true,
    position: "bottom",
    textColor: "#ffffff"
  },
  axisTitles: {
    xTitle: {
      fontSize: 18,
      fontWeight: 600,
      color: "#ffffff",
      nameGap: 80
    },
    yTitle: {
      fontSize: 18,
      fontWeight: 600,
      color: "#ffffff",
      nameGap: 80
    }
  },
  axisLabels: {
    xLabels: {
      interval: 0
    },
    yLabels: {
      interval: 0
    }
  }
};

const useChartStore = create<Store>((set, get) => ({
  csvData: [],
  config: defaultConfig,
  chartInitialized: false,
  configHistory: [defaultConfig],
  canUndo: false,
  sessionId: getSessionId(),
  isLoading: false,
  isSaving: false,
  isGenerating: false,
  setCsvData: (d) => {
    console.log('Chart store: Setting CSV data:', { dataLength: d.length, firstRow: d[0] });
    set({ csvData: d });
    
    // Auto-save after data changes
    setTimeout(() => {
      get().autoSave();
    }, 1000);
  },
  setConfig: (c) => {
    console.log('Chart store: Setting config:', c);
    const currentState = get();
    const newHistory = [...currentState.configHistory, c];
    set({ 
      config: c, 
      configHistory: newHistory,
      canUndo: newHistory.length > 1 
    });
    
    // Auto-save after config changes
    setTimeout(() => {
      get().autoSave();
    }, 1000);
  },
  setChartInitialized: (initialized) => {
    console.log('Chart store: Setting chart initialized:', initialized);
    set({ chartInitialized: initialized });
  },
  setGenerating: (generating) => {
    console.log('Chart store: Setting generating state:', generating);
    set({ isGenerating: generating });
  },
  undo: () => {
    const currentState = get();
    if (currentState.canUndo) {
      const newHistory = currentState.configHistory.slice(0, -1);
      const previousConfig = newHistory[newHistory.length - 1];
      set({ 
        config: previousConfig, 
        configHistory: newHistory, 
        canUndo: newHistory.length > 1 
      });
      console.log('Chart store: Undone to previous config');
    }
  },
  saveChart: async () => {
    const currentState = get();
    const currentConfig = currentState.config;
    const csvData = currentState.csvData;
    
    // Create a chart save object
    const chartToSave = {
      id: Date.now().toString(),
      name: `Chart ${new Date().toLocaleDateString()}`,
      config: currentConfig,
      data: csvData,
      createdAt: new Date().toISOString()
    };
    
    // In a real app, this would save to localStorage or API
    console.log('Chart store: Saving chart to library:', chartToSave);
    
    // For now, just show a success message
    alert('Chart saved to your library!');
  },
  loadChart: async () => {
    const currentState = get();
    set({ isLoading: true });
    
    try {
      const response = await fetch(`/api/charts?sessionId=${currentState.sessionId}`);
      const data = await response.json();
      
      if (data.currentState) {
        const { config, chartData } = data.currentState;
        set({ 
          config, 
          csvData: chartData || [],
          chartInitialized: true,
          configHistory: [config]
        });
        console.log('Chart store: Loaded chart from persistence');
      }
    } catch (error) {
      console.error('Chart store: Failed to load chart:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  autoSave: async () => {
    const currentState = get();
    // Only auto-save if we have data AND the chart has been initialized
    if (!currentState.csvData.length || !currentState.chartInitialized) return;
    
    set({ isSaving: true });
    
    try {
      await fetch('/api/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentState.sessionId,
          chartData: currentState.csvData,
          config: currentState.config
        })
      });
      console.log('Chart store: Auto-saved chart');
    } catch (error) {
      console.error('Chart store: Failed to auto-save chart:', error);
    } finally {
      set({ isSaving: false });
    }
  },
  resetChart: () => {
    console.log('Chart store: Resetting chart to default state');
    set({ 
      csvData: [],
      config: defaultConfig,
      chartInitialized: false,
      configHistory: [defaultConfig],
      canUndo: false
    });
  }
}));

export default useChartStore;
