"use client";

import Papa from "papaparse";
import useChartStore from "@/store/useChartStore";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Upload } from "lucide-react";


// Function to generate complete chart configuration from data
async function generateChartFromData(data: Record<string, unknown>[]) {
    try {
        console.log('Starting LLM chart generation...');
        console.log('Data sample:', data.slice(0, 3));
        
        // Set generating state to true
        useChartStore.getState().setGenerating(true);
        
        // Send data to LLM for complete chart generation
        const chartConfig = await generateCompleteChartConfig(data);
        console.log('Generated complete chart config:', chartConfig);
        
        // Apply the generated configuration
        useChartStore.getState().setConfig(chartConfig);
        useChartStore.getState().setChartInitialized(true);
        
    } catch (error) {
        console.error('Error in LLM chart generation:', error);
        // Fallback to basic config
        const fallbackConfig = createFallbackConfig(data);
        useChartStore.getState().setConfig(fallbackConfig);
        useChartStore.getState().setChartInitialized(true);
    } finally {
        // Set generating state to false
        useChartStore.getState().setGenerating(false);
    }
}

// Generate complete chart configuration using LLM
async function generateCompleteChartConfig(data: Record<string, unknown>[]) {
    // Prepare a sample of the data for LLM analysis (first 50 rows to stay within context limits)
    const dataSample = data.slice(0, 50);
    const columns = Object.keys(data[0]);
    
    // Analyze data structure to determine chart type
    const dataAnalysis = analyzeDataStructure(data);
    
    const prompt = `You are a data visualization expert. Analyze this dataset and create a complete chart configuration.

DATASET:
${JSON.stringify(dataSample, null, 2)}

COLUMNS: ${columns.join(', ')}

DATA ANALYSIS:
${JSON.stringify(dataAnalysis, null, 2)}

CHART TYPE SELECTION RULES (FOLLOW THESE EXACTLY):
1. If ANY column contains DATE/TIME data → USE "line" chart type
2. If you have DATE + NUMERIC + CATEGORICAL → USE "line" chart with separate lines for each category
3. If you have DATE + NUMERIC (no categories) → USE "line" chart
4. Only use "bar" charts for PURELY CATEGORICAL comparisons (no dates involved)
5. Use "scatter" only for CORRELATION analysis between numeric fields
6. Use "area" for cumulative data over time
7. Use "pie" for simple categorical breakdowns (no dates)

CRITICAL: Based on the data analysis above, the chart type MUST be: "${dataAnalysis.recommendedChartType}"

SPACING AND LAYOUT REQUIREMENTS:
${dataAnalysis.spacingIssues && dataAnalysis.spacingIssues.issues.length > 0 ? 
  `ISSUES DETECTED:
${dataAnalysis.spacingIssues.issues.map(issue => `- ${issue}`).join('\n')}

RECOMMENDATIONS:
${dataAnalysis.spacingIssues.recommendations.map(rec => `- ${rec}`).join('\n')}

YOU MUST ADDRESS THESE ISSUES IN YOUR CONFIGURATION.` : 
  'No spacing issues detected - use standard spacing.'}

DATA DENSITY INFO:
- Total data points: ${dataAnalysis.spacingIssues?.dataDensity?.totalPoints || 0}
- Unique X-axis values: ${dataAnalysis.spacingIssues?.dataDensity?.uniqueXValues || 0}
- Unique categories: ${dataAnalysis.spacingIssues?.dataDensity?.uniqueCategories || 0}

TASK: Create a complete chart configuration that includes:
1. Chart type: MUST be "${dataAnalysis.recommendedChartType}" based on data analysis
2. X and Y axis selections
3. Chart title: ALWAYS include a descriptive title that summarizes the data and chart type
4. Color palette
5. Legend configuration
6. All styling (fonts, sizes, colors, etc.)
7. Grid and layout settings
8. PROPER SPACING: Ensure axis titles don't overlap with labels
9. LABEL DENSITY: Use appropriate interval settings based on data density
10. Any other visual elements needed

CRITICAL TITLE REQUIREMENT: You MUST always include a descriptive title that explains what the chart shows. Examples:
- "Weekly Revenue Trends by Product (2024)"
- "Monthly Sales Performance Comparison"
- "Customer Rating Distribution Over Time"
- "Revenue vs Ad Spend Correlation"

The title should be informative and help users understand the chart content at a glance.

IMPORTANT SPACING RULES:
- If you have many X-axis points (>20), use interval: 1 or 2 to show every other label
- If you have long labels (>10 chars), rotate them 45 degrees and increase nameGap
- Always ensure axis titles have sufficient nameGap (at least 40px for X, 60px for Y)
- For dense data, use label rotation and interval spacing to prevent overlap

IMPORTANT: When you see categorical columns (like "Product" with multiple values), create separate series for each category. For example:
- If you have Date, Product, Revenue data, create a LINE chart with separate lines for each Product
- Include a legend positioned at the bottom to distinguish between the different categories
- Use different colors for each category

Return ONLY valid JSON with the complete chart configuration. The chart type MUST be "${dataAnalysis.recommendedChartType}". Include all necessary fields for a beautiful, professional chart.`;

    try {
        const response = await fetch('/api/vibe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userPrompt: prompt,
                currentConfig: {} // Start with empty config, let LLM build everything
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`Failed to generate chart config: ${response.status} - ${errorText}`);
        }
        
        let config = await response.json();
        
        // Ensure the correct chart type is used
        const dataAnalysis = analyzeDataStructure(data);
        if (config.chartType !== dataAnalysis.recommendedChartType) {
            console.warn(`LLM chose wrong chart type: ${config.chartType}, correcting to: ${dataAnalysis.recommendedChartType}`);
            config.chartType = dataAnalysis.recommendedChartType;
        }
        
        // Apply automatic spacing fixes based on data analysis
        config = applyAutomaticSpacingFixes(config, dataAnalysis);
        
        return config;
    } catch (error) {
        console.error('Error generating chart config:', error);
        throw error;
    }
}

// Analyze data structure to determine the correct chart type
function analyzeDataStructure(data: Record<string, unknown>[]) {
    if (!data || data.length === 0) {
        return { recommendedChartType: 'bar', reason: 'No data available' };
    }

    const columns = Object.keys(data[0]);
    const dateColumns: string[] = [];
    const numericColumns: string[] = [];
    const categoricalColumns: string[] = [];

    // Analyze each column
    columns.forEach(column => {
        const sampleValues = data.slice(0, 20).map(row => row[column]);
        
        // Check if it's a date column
        const isDate = sampleValues.every(val => {
            if (typeof val === 'string') {
                const date = new Date(val);
                return !isNaN(date.getTime()) && val.includes('-'); // Basic date detection
            }
            return false;
        });
        
        // Check if it's numeric
        const isNumeric = sampleValues.every(val => typeof val === 'number' && !isNaN(val as number));
        
        if (isDate) {
            dateColumns.push(column);
        } else if (isNumeric) {
            numericColumns.push(column);
        } else {
            categoricalColumns.push(column);
        }
    });

    // Determine chart type based on data structure
    let recommendedChartType = 'bar';
    let reason = '';

    if (dateColumns.length > 0) {
        if (numericColumns.length > 0) {
            if (categoricalColumns.length > 0) {
                recommendedChartType = 'line';
                reason = 'Temporal data with categories - line chart with separate lines for each category';
            } else {
                recommendedChartType = 'line';
                reason = 'Temporal data with numeric values - line chart';
            }
        } else {
            recommendedChartType = 'line';
            reason = 'Temporal data only - line chart';
        }
    } else if (numericColumns.length >= 2) {
        recommendedChartType = 'scatter';
        reason = 'Multiple numeric columns - scatter plot for correlation analysis';
    } else if (categoricalColumns.length > 0 && numericColumns.length > 0) {
        if (categoricalColumns.length <= 5) {
            recommendedChartType = 'pie';
            reason = 'Categorical breakdown with numeric values - pie chart';
        } else {
            recommendedChartType = 'bar';
            reason = 'Categorical comparison with numeric values - bar chart';
        }
    } else {
        recommendedChartType = 'bar';
        reason = 'Default fallback - bar chart';
    }

    // Analyze data density and spacing issues
    const spacingAnalysis = analyzeSpacingIssues(data, dateColumns, categoricalColumns);

    return {
        recommendedChartType,
        reason,
        dataStructure: {
            dateColumns,
            numericColumns,
            categoricalColumns,
            totalRows: data.length
        },
        spacingIssues: spacingAnalysis
    };
}

// Apply automatic spacing fixes based on data analysis
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyAutomaticSpacingFixes(config: any, dataAnalysis: any) {
    const spacingIssues = dataAnalysis.spacingIssues;
    if (!spacingIssues) return config;

    // Initialize axisLabels and axisTitles if they don't exist
    if (!config.axisLabels) config.axisLabels = {};
    if (!config.axisTitles) config.axisTitles = {};
    if (!config.axisLabels.xLabels) config.axisLabels.xLabels = {};
    if (!config.axisTitles.xTitle) config.axisTitles.xTitle = {};
    if (!config.axisTitles.yTitle) config.axisTitles.yTitle = {};

    // Apply X-axis fixes based on data density
    const uniqueXValues = spacingIssues.dataDensity.uniqueXValues;
    const totalPoints = spacingIssues.dataDensity.totalPoints;

    if (uniqueXValues > 50) {
        // Too many points - show every 3rd label
        config.axisLabels.xLabels.interval = 2;
        config.axisLabels.xLabels.rotate = 45;
        config.axisTitles.xTitle.nameGap = 60;
    } else if (uniqueXValues > 20) {
        // Many points - show every 2nd label
        config.axisLabels.xLabels.interval = 1;
        config.axisLabels.xLabels.rotate = 45;
        config.axisTitles.xTitle.nameGap = 50;
    } else if (uniqueXValues < 5) {
        // Very few points - show all labels
        config.axisLabels.xLabels.interval = 0;
        config.axisTitles.xTitle.nameGap = 35;
    } else {
        // Moderate number - show all labels but rotate if needed
        config.axisLabels.xLabels.interval = 0;
        if (totalPoints > 30) {
            config.axisLabels.xLabels.rotate = 45;
            config.axisTitles.xTitle.nameGap = 50;
        } else {
            config.axisTitles.xTitle.nameGap = 35;
        }
    }

    // Always ensure Y-axis has proper spacing
    config.axisTitles.yTitle.nameGap = 60;

    // Ensure legend is shown for categorical data
    if (dataAnalysis.dataStructure?.categoricalColumns?.length > 0) {
        if (!config.legend) config.legend = {};
        config.legend.show = true;
        config.legend.position = 'bottom'; // Changed from 'top' to 'bottom'
        config.legend.textColor = '#ffffff';
    }

    console.log('Applied automatic spacing fixes:', {
        xInterval: config.axisLabels.xLabels.interval,
        xRotation: config.axisLabels.xLabels.rotate,
        xNameGap: config.axisTitles.xTitle.nameGap,
        yNameGap: config.axisTitles.yTitle.nameGap
    });

    return config;
}

// Analyze spacing issues and data density
function analyzeSpacingIssues(data: Record<string, unknown>[], dateColumns: string[], categoricalColumns: string[]) {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check X-axis data density
    if (dateColumns.length > 0) {
        const xColumn = dateColumns[0];
        const uniqueXValues = [...new Set(data.map(row => row[xColumn]))];
        
        if (uniqueXValues.length > 50) {
            issues.push('Too many X-axis data points (over 50)');
            recommendations.push('Use interval: 2 or 3 to show every 2nd or 3rd label');
        } else if (uniqueXValues.length > 20) {
            issues.push('Many X-axis data points (over 20)');
            recommendations.push('Use interval: 1 to show every other label');
        } else if (uniqueXValues.length < 5) {
            issues.push('Very few X-axis data points (less than 5)');
            recommendations.push('Show all labels with interval: 0');
        }
        
        // Check label length
        const avgLabelLength = uniqueXValues.reduce((sum: number, val) => sum + String(val).length, 0) / uniqueXValues.length;
        if (avgLabelLength > 10) {
            issues.push('Long X-axis labels (average over 10 characters)');
            recommendations.push('Rotate labels 45 degrees and increase nameGap');
        }
    }
    
    // Check categorical data density
    categoricalColumns.forEach(col => {
        const uniqueValues = [...new Set(data.map(row => row[col]))];
        if (uniqueValues.length > 10) {
            issues.push(`Too many categories in ${col} (over 10)`);
            recommendations.push('Consider grouping or filtering categories');
        }
    });
    
    // Check for potential overlap issues
    if (data.length > 30) {
        issues.push('Large dataset may cause label overlap');
        recommendations.push('Use label rotation and interval spacing');
    }
    
    return {
        issues,
        recommendations,
        dataDensity: {
            totalPoints: data.length,
            uniqueXValues: dateColumns.length > 0 ? [...new Set(data.map(row => row[dateColumns[0]]))].length : 0,
            uniqueCategories: categoricalColumns.length > 0 ? [...new Set(data.map(row => row[categoricalColumns[0]]))].length : 0
        }
    };
}

// Fallback configuration if LLM fails
function createFallbackConfig(data: Record<string, unknown>[]) {
    const columns = Object.keys(data[0]);
    const chartType = columns.length >= 2 ? "scatter" : "bar";

    return {
        chartType,
        xKey: columns[0],
        yKey: columns[1],
        palette: ["#7dd3fc", "#60a5fa", "#818cf8", "#c084fc", "#f472b6"],
        axisStyle: "classic",
        animation: { easing: "cubicOut", duration: 1000 },
        font: { family: "Inter", size: 12, weight: 500 },
        tooltipStyle: "shadow",
        grid: "solid",
        themePreset: "shadcn-dark"
    } as any;
}

export default function DropUpload() {
    const { setCsvData, csvData, chartInitialized } = useChartStore();
    const { checkUploadLimit, incrementUploadCount } = useSubscription();

    // If data is loaded but chart not initialized, show generating state
    if (csvData && csvData.length > 0 && !chartInitialized) {
        return (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <div className="text-white text-lg mb-2">
                    Generating
                    <span className="animate-pulse">...</span>
                </div>
                <div className="text-gray-400 text-base">
                    Creating your chart with AI
                </div>
            </div>
        );
    }

    const handleFile = async (file: File) => {
        console.log('File selected:', { name: file.name, size: file.size, type: file.type });
        
        // Check upload limit
        if (!checkUploadLimit()) {
            alert('You have reached your free upload limit. Please upgrade to Premium for unlimited uploads.');
            return;
        }

        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: async (results) => {
                console.log('CSV parsing complete:', {
                    dataLength: results.data.length,
                    fields: results.meta.fields,
                    firstRow: results.data[0],
                    errors: results.errors
                });
                
                const rows = results.data as Record<string, unknown>[];
                console.log('Setting CSV data:', { rowsLength: rows.length, firstRow: rows[0] });
                setCsvData(rows);
                
                // Increment upload count
                await incrementUploadCount();
                
                // Trigger generative chart pipeline
                await generateChartFromData(rows);
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
            }
        })
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        handleFile(file);
    }

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('file-input')?.click();
    }

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                handleFile(file);
            }
        }
    }

    return (
        <div 
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-colors rounded-3xl"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
            <Upload className="h-16 w-16 text-white mb-4" />
            <div className="text-gray-400 text-lg">
                Drop your files or click to upload
            </div>
            <input 
                id="file-input"
                type="file" 
                accept=".csv" 
                onChange={handleFileInput}
                className="hidden"
            />
        </div>
    );
}