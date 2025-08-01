import * as echarts from 'echarts/core';
import { VibeConfig } from './vibe-config';

// Import the actual chart building logic to ensure consistency
import { binData, buildEchartsOption } from '../components/ChartRenderer';

export type ExportFormat = 'png' | 'svg' | 'html';

/**
 * Export chart as PNG
 */
export async function exportAsPNG(chartInstance: echarts.EChartsType, filename?: string): Promise<void> {
  try {
    // Wait a bit for the chart to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const dataURL = chartInstance.getDataURL({
      type: 'png',
      pixelRatio: 2, // Higher quality
      backgroundColor: '#1a1a1a'
    });
    
    if (!dataURL || dataURL === 'data:,' || dataURL.startsWith('data:,')) {
      throw new Error('Chart data is empty or invalid');
    }
    
    const link = document.createElement('a');
    link.download = filename || `chart-${Date.now()}.png`;
    link.href = dataURL;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export as PNG:', error);
    throw new Error('Failed to export chart as PNG');
  }
}

/**
 * Export chart as SVG
 */
export async function exportAsSVG(chartInstance: echarts.EChartsType, filename?: string): Promise<void> {
  try {
    // Wait a bit for the chart to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const dataURL = chartInstance.getDataURL({
      type: 'svg',
      backgroundColor: '#1a1a1a'
    });
    
    if (!dataURL || dataURL === 'data:,' || dataURL.startsWith('data:,')) {
      throw new Error('Chart data is empty or invalid');
    }
    
    const link = document.createElement('a');
    link.download = filename || `chart-${Date.now()}.svg`;
    link.href = dataURL;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export as SVG:', error);
    throw new Error('Failed to export chart as SVG');
  }
}

/**
 * Generate HTML code for the chart
 */
export function generateHTMLCode(config: VibeConfig, csvData: Record<string, unknown>[]): string {
  // Use the exact same chart building logic as the main app
  const processedData = binData(csvData, config.xKey, config.yKey, config.binning);
  const chartOption = buildEchartsOption(processedData, config);
  const chartOptionJson = JSON.stringify(chartOption, null, 2);
  const chartTitle = config.title?.text || 'Chart Export';
  
  return `<!DOCTYPE html>
<!-- 
  Standalone Chart HTML File
  This file contains a complete, self-contained chart that can be opened in any web browser.
  No external dependencies or server required - just save as .html and open!
-->
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${chartTitle}</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@6.0.0/dist/echarts.min.js"></script>
    <script>
        // Register the custom dark theme (same as main app)
        const shadcnDark = {
            color: [
                '#7dd3fc',
                '#60a5fa', 
                '#818cf8',
                '#c084fc',
                '#f472b6',
                '#fb7185',
                '#fbbf24',
                '#34d399',
                '#a78bfa',
                '#f87171'
            ],
            backgroundColor: 'transparent',
            textStyle: {},
            title: {
                textStyle: {
                    color: '#ffffff'
                },
                subtextStyle: {
                    color: '#9ca3af'
                }
            },
            line: {
                itemStyle: {
                    borderWidth: 1
                },
                lineStyle: {
                    width: 2
                },
                symbolSize: 4,
                symbol: 'circle',
                smooth: false
            },
            radar: {
                itemStyle: {
                    borderWidth: 1
                },
                lineStyle: {
                    width: 2
                },
                symbolSize: 4,
                symbol: 'circle',
                smooth: false
            },
            bar: {
                itemStyle: {
                    barBorderWidth: 0,
                    barBorderColor: '#ccc'
                }
            },
            pie: {
                itemStyle: {
                    borderWidth: 0,
                    borderColor: '#ccc'
                }
            },
            scatter: {
                itemStyle: {
                    borderWidth: 0,
                    borderColor: '#ccc'
                }
            },
            boxplot: {
                itemStyle: {
                    borderWidth: 0,
                    borderColor: '#ccc'
                }
            },
            parallel: {
                itemStyle: {
                    borderWidth: 0,
                    borderColor: '#ccc'
                }
            },
            sankey: {
                itemStyle: {
                    borderWidth: 0,
                    borderColor: '#ccc'
                }
            },
            funnel: {
                itemStyle: {
                    borderWidth: 0,
                    borderColor: '#ccc'
                }
            },
            gauge: {
                itemStyle: {
                    borderWidth: 0,
                    borderColor: '#ccc'
                }
            },
            candlestick: {
                itemStyle: {
                    color: '#fd1050',
                    color0: '#0cf49b',
                    borderColor: '#fd1050',
                    borderColor0: '#0cf49b',
                    borderWidth: 1
                }
            },
            graph: {
                itemStyle: {
                    borderWidth: 0,
                    borderColor: '#ccc'
                },
                lineStyle: {
                    width: 1,
                    color: '#aaa'
                },
                symbolSize: 4,
                symbol: 'circle',
                smooth: false,
                color: [
                    '#7dd3fc',
                    '#60a5fa',
                    '#818cf8',
                    '#c084fc',
                    '#f472b6'
                ],
                label: {
                    color: '#eee'
                }
            },
            map: {
                itemStyle: {
                    normal: {
                        areaColor: '#eee',
                        borderColor: '#444',
                        borderWidth: 0.5
                    },
                    emphasis: {
                        areaColor: 'rgba(255,215,0,0.8)',
                        borderColor: '#444',
                        borderWidth: 1
                    }
                },
                label: {
                    normal: {
                        textStyle: {
                            color: '#000'
                        }
                    },
                    emphasis: {
                        textStyle: {
                            color: 'rgb(100,0,0)'
                        }
                    }
                }
            },
            geo: {
                itemStyle: {
                    normal: {
                        areaColor: '#eee',
                        borderColor: '#444',
                        borderWidth: 0.5
                    },
                    emphasis: {
                        areaColor: 'rgba(255,215,0,0.8)',
                        borderColor: '#444',
                        borderWidth: 1
                    }
                },
                label: {
                    normal: {
                        textStyle: {
                            color: '#000'
                        }
                    },
                    emphasis: {
                        textStyle: {
                            color: 'rgb(100,0,0)'
                        }
                    }
                }
            },
            categoryAxis: {
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#374151'
                    }
                },
                axisTick: {
                    show: false,
                    lineStyle: {
                        color: '#374151'
                    }
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#94a3b8'
                    }
                },
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: ['#374151']
                    }
                },
                splitArea: {
                    show: false,
                    areaStyle: {
                        color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
                    }
                }
            },
            valueAxis: {
                axisLine: {
                    show: false,
                    lineStyle: {
                        color: '#374151'
                    }
                },
                axisTick: {
                    show: false,
                    lineStyle: {
                        color: '#374151'
                    }
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#94a3b8'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#374151']
                    }
                },
                splitArea: {
                    show: false,
                    areaStyle: {
                        color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
                    }
                }
            },
            logAxis: {
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#374151'
                    }
                },
                axisTick: {
                    show: false,
                    lineStyle: {
                        color: '#374151'
                    }
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#94a3b8'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#374151']
                    }
                },
                splitArea: {
                    show: false,
                    areaStyle: {
                        color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
                    }
                }
            },
            timeAxis: {
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#374151'
                    }
                },
                axisTick: {
                    show: false,
                    lineStyle: {
                        color: '#374151'
                    }
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#94a3b8'
                    }
                },
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: ['#374151']
                    }
                },
                splitArea: {
                    show: false,
                    areaStyle: {
                        color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
                    }
                }
            },
            toolbox: {
                iconStyle: {
                    normal: {
                        borderColor: '#999'
                    },
                    emphasis: {
                        borderColor: '#666'
                    }
                }
            },
            legend: {
                textStyle: {
                    color: '#cbd5e1'
                }
            },
            tooltip: {
                axisPointer: {
                    lineStyle: {
                        color: '#ccc',
                        width: 1
                    },
                    crossStyle: {
                        color: '#ccc',
                        width: 1
                    }
                }
            },
            timeline: {
                lineStyle: {
                    color: '#ccc',
                    width: 2
                },
                controlStyle: {
                    normal: {
                        color: '#ccc',
                        borderColor: '#ccc'
                    },
                    emphasis: {
                        color: '#ccc',
                        borderColor: '#ccc'
                    }
                },
                checkpointStyle: {
                    color: '#eee',
                    borderColor: '#ddd'
                },
                label: {
                    normal: {
                        textStyle: {
                            color: '#ccc'
                        }
                    },
                    emphasis: {
                        textStyle: {
                            color: '#ccc'
                        }
                    }
                }
            },
            visualMap: {
                color: ['#7dd3fc', '#60a5fa', '#818cf8']
            },
            dataZoom: {
                backgroundColor: 'rgba(47,69,84,0)',
                dataBackgroundColor: 'rgba(167,183,204,0.4)',
                fillerColor: 'rgba(167,183,204,0.4)',
                handleColor: '#a7b7cc',
                handleSize: '100%',
                textStyle: {
                    color: '#333'
                }
            },
            markPoint: {
                label: {
                    normal: {
                        textStyle: {
                            color: '#eee'
                        }
                    },
                    emphasis: {
                        textStyle: {
                            color: '#eee'
                        }
                    }
                }
            }
        };
        
        // Register the theme
        echarts.registerTheme('shadcn-dark', shadcnDark);
    </script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: #1a1a1a;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #chart {
            width: 100%;
            height: 600px;
            border-radius: 8px;
            overflow: hidden;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: white;
            text-align: center;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${chartTitle}</h1>
        <div id="chart"></div>
    </div>
    
    <script>
        // Initialize chart with the correct theme
        const chartDom = document.getElementById('chart');
        const myChart = echarts.init(chartDom, 'shadcn-dark');
        
        // Chart configuration with embedded data
        const option = ${chartOptionJson};
        
        // Set option and render
        myChart.setOption(option);
        
        // Handle window resize
        window.addEventListener('resize', function() {
            myChart.resize();
        });
    </script>
</body>
</html>`;
}

/**
 * Copy HTML code to clipboard
 */
export async function copyHTMLToClipboard(config: VibeConfig, csvData: Record<string, unknown>[]): Promise<void> {
  try {
    const htmlCode = generateHTMLCode(config, csvData);
    await navigator.clipboard.writeText(htmlCode);
  } catch (error) {
    console.error('Failed to copy HTML to clipboard:', error);
    throw new Error('Failed to copy HTML code to clipboard');
  }
}

/**
 * Export chart in the specified format
 */
export async function exportChart(
  format: ExportFormat,
  chartInstance: echarts.EChartsType,
  config: VibeConfig,
  csvData: Record<string, unknown>[],
  filename?: string
): Promise<void> {
  // Generate filename from chart title or use provided filename
  let finalFilename = filename;
  if (!finalFilename && config.title?.text) {
    // Clean the title for use as filename
    const cleanTitle = config.title.text
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()
      .substring(0, 50); // Limit length
    finalFilename = cleanTitle || `chart-${new Date().toISOString().slice(0, 10)}`;
  } else if (!finalFilename) {
    finalFilename = `chart-${new Date().toISOString().slice(0, 10)}`;
  }

  switch (format) {
    case 'png':
      await exportAsPNG(chartInstance, finalFilename);
      break;
    case 'svg':
      await exportAsSVG(chartInstance, finalFilename);
      break;
    case 'html':
      await copyHTMLToClipboard(config, csvData);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
} 