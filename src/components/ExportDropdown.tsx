"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileImage, Code } from "lucide-react";
import { exportChart, ExportFormat } from "@/lib/export";
import useChartStore from "@/store/useChartStore";
import * as echarts from 'echarts/core';

export default function ExportDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { config, csvData } = useChartStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportMessage(null);
    
    try {
      console.log('Starting export for format:', format);
      
      // Try multiple methods to find the chart instance
      let chartInstance = null;
      
      // Method 1: Try to find by data attribute
      const chartElement = document.querySelector('[data-echarts-instance]') as HTMLElement;
      console.log('Chart element found:', !!chartElement);
      if (chartElement) {
        chartInstance = echarts.getInstanceByDom(chartElement);
        console.log('Chart instance from data attribute:', !!chartInstance);
      }
      
      // Method 2: Try to find by canvas element
      if (!chartInstance) {
        const canvas = document.querySelector('canvas');
        console.log('Canvas element found:', !!canvas);
        if (canvas) {
          chartInstance = echarts.getInstanceByDom(canvas);
          console.log('Chart instance from canvas:', !!chartInstance);
        }
      }
      
      // Method 3: Try to find by any div that might contain the chart
      if (!chartInstance) {
        const chartDivs = document.querySelectorAll('div');
        console.log('Total divs found:', chartDivs.length);
        for (const div of chartDivs) {
          const instance = echarts.getInstanceByDom(div);
          if (instance) {
            chartInstance = instance;
            console.log('Chart instance found from div search');
            break;
          }
        }
      }
      
      if (!chartInstance) {
        throw new Error('Chart instance not found. Please make sure a chart is displayed.');
      }

      console.log('Chart instance found, proceeding with export');
      
      await exportChart(format, chartInstance, config, csvData);
      
      if (format === 'html') {
        setExportMessage('HTML code copied to clipboard!');
      } else {
        setExportMessage(`${format.toUpperCase()} exported successfully!`);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      setExportMessage(`Failed to export as ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      // Clear message after 3 seconds
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  const exportOptions = [
    {
      format: 'png' as ExportFormat,
      label: 'Download PNG',
      icon: FileImage,
      description: 'High-quality image file'
    },
    {
      format: 'html' as ExportFormat,
      label: 'Copy HTML Code',
      icon: Code,
      description: 'Embeddable HTML code'
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="h-10 w-10 p-0 text-white"
        style={{ backgroundColor: '#444444' }}
        onMouseEnter={(e) => !isExporting && (e.currentTarget.style.backgroundColor = '#555555')}
        onMouseLeave={(e) => !isExporting && (e.currentTarget.style.backgroundColor = '#444444')}
      >
        <Download className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={isExporting}
                  className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-400">{option.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Export message */}
      {exportMessage && (
        <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-green-600 text-white text-sm rounded-md shadow-lg z-50">
          {exportMessage}
        </div>
      )}
    </div>
  );
} 