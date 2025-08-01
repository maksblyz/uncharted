"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import {
  GridComponent,
  TooltipComponent,
  DatasetComponent,
  TitleComponent,
  LegendComponent,
} from "echarts/components";
import { BarChart, LineChart, ScatterChart, PieChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import useChartStore from "@/store/useChartStore";
import { VibeConfig } from "@/lib/vibe-config";
import shadcnDark from "@/theme/shadcnDark";

interface EChartsParams {
  dataIndex: number;
  [key: string]: unknown;
}

// Register all necessary ECharts components and charts
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  BarChart,
  LineChart,
  ScatterChart,
  PieChart,
  CanvasRenderer,
]);

// Register the custom dark theme
echarts.registerTheme("shadcn-dark", shadcnDark);

/**
 * Bins data by grouping rows and aggregating them.
 */
export function binData(
  data: Record<string, unknown>[],
  xKey: string,
  yKey: string,
  binning?: { enabled?: boolean; groupSize?: number; method?: string }
) {
  if (!binning?.enabled || !binning.groupSize || binning.groupSize <= 1) {
    return data;
  }

  const grouped: Record<string, Record<string, unknown>[]> = {};
  data.forEach((row, idx) => {
    const groupIndex = Math.floor(idx / binning.groupSize!);
    // Use the first item's xKey in the group as the new label
    const label = String(data[groupIndex * binning.groupSize!][xKey]);
    (grouped[label] ??= []).push(row);
  });

  return Object.entries(grouped).map(([label, rows]) => {
    const numericValues = rows.map(r => Number(r[yKey])).filter(v => !isNaN(v));
    const aggFunctions: Record<string, (arr: number[]) => number> = {
      average: arr => arr.reduce((s, v) => s + v, 0) / arr.length,
      max: arr => Math.max(...arr),
      min: arr => Math.min(...arr),
      sum: arr => arr.reduce((s, v) => s + v, 0),
    };
    const aggregateValue = aggFunctions[binning.method ?? "sum"](numericValues);
    return { [xKey]: label, [yKey]: aggregateValue };
  });
}

/**
 * Creates a series object based on chart type and configuration.
 */
function createSeries(config: VibeConfig, category?: string) {
  const { chartType, palette = [], barStyle, lineStyle, scatterStyle } = config;
  const color = palette[0] || "#7dd3fc"; // Fallback color

  const baseSeries = {
    type: chartType,
    name: category,
    emphasis: {
      focus: "series",
      blurScope: 'coordinateSystem',
    },
    animation: config.animation !== "none",
    animationEasing: typeof config.animation === 'object' ? config.animation.easing : 'cubicOut',
    animationDuration: typeof config.animation === 'object' ? config.animation.duration : 1000,
  };

  switch (chartType) {
    case "bar":
      return {
        ...baseSeries,
        barWidth: barStyle?.width ? `${barStyle.width}%` : 'auto',
        itemStyle: barStyle?.colors ? {
          borderRadius: barStyle?.borderRadius ?? 6,
          shadowBlur: barStyle?.shadow ? 10 : 0,
          shadowColor: barStyle?.shadow ? "rgba(0, 0, 0, 0.5)" : undefined,
          opacity: barStyle?.opacity ?? 1,
        } : {
          color,
          borderRadius: barStyle?.borderRadius ?? 6,
          shadowBlur: barStyle?.shadow ? 10 : 0,
          shadowColor: barStyle?.shadow ? "rgba(0, 0, 0, 0.5)" : undefined,
          opacity: barStyle?.opacity ?? 1,
        },
        ...(barStyle?.colors && {
          itemStyle: {
            color: (params: EChartsParams) => {
              const colors = barStyle.colors!;
              return colors[params.dataIndex % colors.length];
            },
            borderRadius: barStyle?.borderRadius ?? 6,
            shadowBlur: barStyle?.shadow ? 10 : 0,
            shadowColor: barStyle?.shadow ? "rgba(0, 0, 0, 0.5)" : undefined,
            opacity: barStyle?.opacity ?? 1,
          }
        }),
        ...(barStyle?.gradient && {
          itemStyle: {
            color: (params: EChartsParams) => {
              const baseColor = barStyle?.colors ? 
                barStyle.colors[params.dataIndex % barStyle.colors.length] : 
                color;
              return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: baseColor },
                { offset: 1, color: echarts.color.modifyAlpha(baseColor, 0.3) }
              ]);
            },
            borderRadius: barStyle?.borderRadius ?? 6,
            shadowBlur: barStyle?.shadow ? 10 : 0,
            shadowColor: barStyle?.shadow ? "rgba(0, 0, 0, 0.5)" : undefined,
            opacity: barStyle?.opacity ?? 1,
          }
        })
      };
    case "line":
      return {
        ...baseSeries,
        smooth: lineStyle?.smooth !== false,
        symbol: 'circle',
        symbolSize: lineStyle?.width ? lineStyle.width + 2 : 5,
        lineStyle: {
          width: lineStyle?.width ?? 3,
          shadowBlur: lineStyle?.shadow ? 8 : 0,
          shadowColor: lineStyle?.shadow ? "rgba(0, 0, 0, 0.3)" : undefined,
          opacity: lineStyle?.lineOpacity ?? 1, // Allow separate control of line opacity
        },
        itemStyle: { color },
        areaStyle: lineStyle?.areaOpacity
          ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color },
                { offset: 1, color: echarts.color.modifyAlpha(color, 0.1) },
              ]),
              opacity: lineStyle.areaOpacity,
            }
          : undefined,
      };
    case "scatter":
      return {
        ...baseSeries,
        symbolSize: scatterStyle?.size ?? 12,
        itemStyle: {
          color,
          opacity: scatterStyle?.opacity ?? 0.85,
          borderWidth: scatterStyle?.borderWidth ?? 1,
          borderColor: echarts.color.modifyAlpha(color, 0.5),
        },
      };
    default:
      return { ...baseSeries, itemStyle: { color } };
  }
}

/**
 * Builds the final ECharts option object from the configuration.
 */
export function buildEchartsOption(data: Record<string, unknown>[], c: VibeConfig): echarts.EChartsCoreOption {
  if (!data.length || !c.xKey || !c.yKey) return {};

  // Filter out any rows with empty or null values for the selected keys
  const filteredData = data.filter(row => 
    row[c.xKey] !== null && 
    row[c.xKey] !== undefined && 
    row[c.xKey] !== '' &&
    row[c.yKey] !== null && 
    row[c.yKey] !== undefined && 
    row[c.yKey] !== ''
  );

  if (!filteredData.length) return {};

  const theme = c.themePreset === 'light' ? 'light' : 'shadcn-dark';
  const isPie = c.chartType === "pie";

  // Identify a categorical column for multi-series charts (if not a pie chart)
  const categoricalCol = !isPie
    ? Object.keys(filteredData[0]).find(col => {
        if (col === c.xKey || col === c.yKey) return false;
        const uniqueValues = new Set(filteredData.map(r => r[col]));
        return uniqueValues.size > 1 && uniqueValues.size <= 12; // Limit to 12 categories
      })
    : undefined;

  let series;
  if (isPie) {
    series = [
      {
        type: "pie",
        roseType: c.pieStyle?.roseType,
        radius: c.pieStyle?.donut ? ["40%", "70%"] : c.pieStyle?.radius ? `${c.pieStyle.radius}%` : "70%",
        center: c.pieStyle?.center ? c.pieStyle.center.map(val => typeof val === 'number' ? `${val}%` : val) : ["50%", "50%"],
        itemStyle: { 
          borderRadius: 10, 
          borderColor: "#1a1a1a", 
          borderWidth: 2,
          color: c.pieStyle?.gradient ? (params: EChartsParams) => {
            const colors = c.palette || ['#7dd3fc', '#60a5fa', '#818cf8', '#c084fc', '#f472b6'];
            const baseColor = colors[params.dataIndex % colors.length];
            return new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
              { offset: 0, color: baseColor },
              { offset: 1, color: echarts.color.modifyAlpha(baseColor, 0.3) }
            ]);
          } : (params: EChartsParams) => {
            const colors = c.palette || ['#7dd3fc', '#60a5fa', '#818cf8', '#c084fc', '#f472b6'];
            return colors[params.dataIndex % colors.length];
          }
        },
        label: { show: false },
        emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold' }
        },
        encode: { value: c.yKey, itemName: c.xKey },
      },
    ];
  } else if (categoricalCol) {
    const categories = [...new Set(filteredData.map(r => String(r[categoricalCol])))];
    series = categories.map((cat, i) => ({
      ...createSeries({ ...c, palette: [c.palette?.[i] || '#7dd3fc'] }, cat),
      data: filteredData.filter(r => r[categoricalCol] === cat).map(r => [r[c.xKey], r[c.yKey]]),
    }));
  } else {
    series = [{ ...createSeries(c), encode: { x: c.xKey, y: c.yKey } }];
  }

  return {
    theme,
    backgroundColor: c.backgroundColor || (c.themePreset === 'light' ? '#fdf6e3' : 'transparent'),
    textStyle: { 
      fontFamily: c.font?.family ?? "system-ui", 
      fontWeight: c.font?.weight ?? 400,
      color: c.themePreset === 'light' ? '#1e293b' : '#ffffff'
    },
    grid: {
      show: c.grid !== "none",
      containLabel: true,
      left: "15%",
      right: "15%",
      top: "15%",
      bottom: c.legend?.position === "bottom" ? "18%" : "15%",
      backgroundColor: c.borderStyle ? 'transparent' : undefined,
      borderColor: c.borderStyle?.color,
      borderWidth: c.borderStyle?.width,
    },
    title: {
      show: c.title?.show !== false && !!c.title?.text,
      text: c.title?.text,
      left: "center",
      top: c.title?.position === "top" ? "2%" : undefined,
      bottom: c.title?.position === "bottom" ? "2%" : undefined,
      textStyle: {
        color: c.title?.color || (c.themePreset === 'light' ? '#1e293b' : '#ffffff'),
        fontSize: c.title?.fontSize ?? 18,
        fontWeight: "bold",
      },
      backgroundColor: c.title?.backgroundColor,
      borderColor: c.title?.border,
      borderWidth: c.title?.border ? 1 : undefined,
      padding: c.title?.padding ? Number(String(c.title.padding).replace('px','')) : 10,
      borderRadius: c.title?.borderRadius
    },
    tooltip: {
      trigger: isPie ? "item" : "axis",
      backgroundColor: c.themePreset === 'light' ? "#ffffff" : "#111827",
      borderColor: c.themePreset === 'light' ? "#e2e8f0" : "#374151",
      borderWidth: 1,
      textStyle: { 
        color: c.themePreset === 'light' ? "#1e293b" : "#f9fafb", 
        fontSize: 13 
      },
      padding: [8, 12],
    },
    legend: {
      show: c.legend?.show ?? true,
      orient: (c.legend?.position === "left" || c.legend?.position === "right") ? "vertical" : "horizontal",
      top: c.legend?.position === "top" ? '8%' : 'auto',
      bottom: c.legend?.position === "bottom" ? '2%' : 'auto',
      left: c.legend?.position === "left" ? "2%" : c.legend?.position === "right" ? "auto" : "center",
      right: c.legend?.position === "right" ? "2%" : "auto",
      textStyle: { 
        color: c.legend?.textColor || (c.themePreset === 'light' ? '#475569' : '#cbd5e1') 
      },
      icon: "circle",
    },
    dataset: { source: filteredData },
    xAxis: isPie ? undefined : {
      type: "category",
      name: c.axisTitles?.xTitle?.text || c.xKey,
      nameLocation: "middle",
      nameGap: c.axisTitles?.xTitle?.nameGap ?? 100,
      nameTextStyle: {
        color: c.axisTitles?.xTitle?.color || (c.themePreset === 'light' ? '#1e293b' : '#ffffff'),
        fontSize: c.axisTitles?.xTitle?.fontSize ?? 16,
        fontWeight: 'bold',
      },
      axisLabel: {
        rotate: c.axisLabels?.xLabels?.rotate ?? 'auto',
        interval: c.axisLabels?.xLabels?.interval ?? 'auto',
        showMaxLabel: c.axisLabels?.xLabels?.showMaxLabel ?? true,
        color: c.axisLabels?.xLabels?.color || (c.themePreset === 'light' ? '#64748b' : '#94a3b8'),
        fontSize: 12,
        formatter: c.axisLabels?.xLabels?.formatter ? (value: string, index: number) => {
          try {
            const formatter = c.axisLabels?.xLabels?.formatter;
            if (formatter) {
              return new Function('value', 'params', formatter)(value, { dataIndex: index });
            }
            return value;
          } catch (e) {
            console.warn('Formatter error:', e);
            return value;
          }
        } : undefined,
      },
      axisLine: { 
        show: true, 
        lineStyle: { 
          color: c.themePreset === 'light' ? '#cbd5e1' : '#374151' 
        } 
      },
      axisTick: { show: false },
      boundaryGap: c.chartType === "bar" ? true : false,
    },
    yAxis: isPie ? undefined : {
      type: c.yAxis?.type ?? "value",
      min: c.yAxis?.min,
      max: c.yAxis?.max,
      scale: c.yAxis?.scale,
      name: c.axisTitles?.yTitle?.text || c.yKey,
      nameLocation: "middle",
      nameGap: c.axisTitles?.yTitle?.nameGap ?? 80,
      nameTextStyle: {
        color: c.axisTitles?.yTitle?.color || (c.themePreset === 'light' ? '#1e293b' : '#ffffff'),
        fontSize: c.axisTitles?.yTitle?.fontSize ?? 18,
        fontWeight: 'bold',
      },
      axisLabel: { 
        color: c.axisLabels?.yLabels?.color || (c.themePreset === 'light' ? '#64748b' : '#94a4b8'), 
        fontSize: 12,
        formatter: c.axisLabels?.yLabels?.formatter ? (value: string) => {
          try {
            const formatter = c.axisLabels?.yLabels?.formatter;
            if (formatter) {
              return new Function('value', formatter)(value);
            }
            return value;
          } catch (e) {
            console.warn('Formatter error:', e);
            return value;
          }
        } : undefined,
      },
      splitLine: { 
        lineStyle: { 
          color: c.themePreset === 'light' ? '#e2e8f0' : '#374151', 
          type: c.grid === "dashed" ? "dashed" : "solid" 
        } 
      },
      axisLine: { show: false },
    },
    series,
  };
}

/**
 * Main chart rendering component.
 */
export default function ChartRenderer() {
  const { csvData, config } = useChartStore();

  const chartOption = useMemo(() => {
    if (!csvData?.length) return null;
    const processedData = binData(csvData, config.xKey, config.yKey, config.binning);
    return buildEchartsOption(processedData, config);
  }, [csvData, config]);

  if (!csvData?.length || !chartOption) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-gray-600 bg-gray-900/20 text-gray-500">
        No data to display
      </div>
    );
  }

  const maxWidth = 800; // Set a reasonable max width

  return (
    <div className="flex w-full justify-center p-4 h-full">
      <div
        className="overflow-hidden w-full h-full rounded-lg"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: `${maxWidth}px`
        }}
      >
        <ReactECharts
          option={chartOption}
          style={{ width: "100%", height: "100%" }}
          opts={{ renderer: "canvas" }}
          theme="shadcn-dark"
          notMerge={true}
          lazyUpdate={true}
          data-echarts-instance="true"
        />
      </div>
    </div>
  );
}