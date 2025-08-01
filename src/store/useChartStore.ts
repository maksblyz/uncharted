import { create } from "zustand";
import { VibeConfig } from "@/lib/vibe-config";

type Store = {
  csvData: Record<string, unknown>[];
  config: VibeConfig;
  chartInitialized: boolean;
  configHistory: VibeConfig[];
  canUndo: boolean;
  setCsvData: (d: Record<string, unknown>[]) => void;
  setConfig: (c: VibeConfig) => void;
  setChartInitialized: (initialized: boolean) => void;
  undo: () => void;
  saveChart: () => Promise<void>;
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
  setCsvData: (d) => {
    console.log('Chart store: Setting CSV data:', { dataLength: d.length, firstRow: d[0] });
    set({ csvData: d });
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
  },
  setChartInitialized: (initialized) => {
    console.log('Chart store: Setting chart initialized:', initialized);
    set({ chartInitialized: initialized });
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
  }
}));

export default useChartStore;
