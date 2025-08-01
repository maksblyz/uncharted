"use client";

import useChartStore from "@/store/useChartStore";

export default function SessionInfo() {
  const { sessionId, isLoading, isSaving } = useChartStore();

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded-lg text-xs opacity-75 hover:opacity-100 transition-opacity">
      <div>Session: {sessionId.slice(0, 8)}...</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      <div>Saving: {isSaving ? 'Yes' : 'No'}</div>
    </div>
  );
} 