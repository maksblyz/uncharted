"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useChartStore from "@/store/useChartStore";
import { Send, Loader2 } from "lucide-react";

export default function ChatBox() {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { config, setConfig, chartInitialized, setChartInitialized } = useChartStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/vibe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userPrompt: input,
                    currentConfig: config
                })
            });

            console.log("Response status:", res.status);
            console.log("Response headers:", res.headers);

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Error response text:", errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch (parseError) {
                    console.error("Failed to parse error response:", parseError);
                    throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
                }
                
                throw new Error(errorData.details || errorData.error || `HTTP error! status: ${res.status}`);
            }

            const responseText = await res.text();
            console.log("Response text:", responseText);
            
            let updated;
            try {
                updated = JSON.parse(responseText);
            } catch (parseError) {
                console.error("Failed to parse response:", parseError);
                throw new Error("Invalid JSON response from server");
            }
            
            if (updated.error) {
                throw new Error(updated.error);
            }
            
            setConfig(updated);
            setInput("");
            
            // Initialize chart on first successful prompt
            if (!chartInitialized) {
                setChartInitialized(true);
            }
        } catch (error) {
            console.error("Error updating chart:", error);
            setError(error instanceof Error ? error.message : "Failed to update chart");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
            <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tweak your chart... (e.g., 'make bars wider', 'add title', 'change colors')"
                className="h-12 pr-12 pl-4 border-white text-white placeholder:text-gray-400 focus:border-gray-300 rounded-full text-base"
                style={{ backgroundColor: '#1a1a1a' }}
                disabled={isLoading}
            />
            <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-1 top-1 h-10 w-10 p-0 bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 rounded-full"
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Send className="h-4 w-4" />
                )}
            </Button>
            
            {error && (
                <div className="mt-2 text-sm text-red-400 bg-red-900/20 border border-red-500 p-3 rounded-md">
                    {error}
                </div>
            )}
        </form>
    )
}
