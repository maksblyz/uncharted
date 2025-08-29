import { VibeConfig } from "@/lib/vibe-config";

export const runtime = "edge";

// Check if API key exists
if (!process.env.DEEPSEEK_API_KEY) {
  console.error("DEEPSEEK_API_KEY is not set in environment variables");
}

// Deep merge function for nested objects
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge((target[key] as Record<string, unknown>) || {}, source[key] as Record<string, unknown>);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

// Beautifier function to enhance default appearance
function beautify(cfg: VibeConfig): VibeConfig {
  // Ensure all required fields are present
  const beautified = {
    ...cfg, // Keep all existing fields
    chartType: cfg.chartType || "bar",
    xKey: cfg.xKey || "Date",
    yKey: cfg.yKey || "Revenue",
    palette: cfg.palette?.length ? cfg.palette : ['#7dd3fc', '#60a5fa', '#818cf8', '#c084fc', '#f472b6'],
    axisStyle: cfg.axisStyle || "classic",
    animation: cfg.animation || { easing: "cubicOut", duration: 1000 },
    font: cfg.font || { family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", size: 12, weight: 500 },
    tooltipStyle: cfg.tooltipStyle || "shadow",
    grid: cfg.grid || "none",
    themePreset: cfg.themePreset || "shadcn-dark"
  };

  // 1. If palette is empty or white, pick 5 Tailwind accent colors
  if (!beautified.palette?.length || beautified.palette[0] === '#ffffff') {
    beautified.palette = ['#7dd3fc', '#60a5fa', '#818cf8', '#c084fc', '#f472b6'];
  }

  // 2. Auto-round bars unless explicitly set to squared (borderRadius: 0)
  if (beautified.chartType === 'bar' && beautified.barStyle?.borderRadius === undefined) {
    beautified.barStyle = { ...beautified.barStyle, borderRadius: 6 };
  }

  // 3. Smooth lines if <50 points
  if (beautified.chartType === 'line' && beautified.animation !== 'none' && beautified.lineStyle?.smooth === undefined) {
    beautified.lineStyle = { ...beautified.lineStyle, smooth: true };
  }

  // 4. Set default theme to shadcn-dark if not specified
  if (!beautified.themePreset || beautified.themePreset === 'dark') {
    beautified.themePreset = 'shadcn-dark';
  }

  // 5. Set default chart size to be wider if not specified
  if (!beautified.chartSize) {
    beautified.chartSize = { aspectRatio: 1.8 }; // Wider default (1.8:1 ratio)
  } else if (beautified.chartSize.aspectRatio) {
    // Clamp aspect ratio to reasonable bounds to prevent cutoff
    beautified.chartSize.aspectRatio = Math.max(0.3, Math.min(3.0, beautified.chartSize.aspectRatio));
  }

  // 6. Always ensure there's a title, positioned at bottom by default
  if (!beautified.title) {
    beautified.title = {
      text: "Data Visualization",
      color: "#ffffff",
      fontSize: 16,
      position: "bottom",
      backgroundColor: "#2a2a2a",
      padding: "8px 12px",
      borderRadius: "6px"
    };
  } else if (!beautified.title.position) {
    // If title exists but no position specified, default to bottom
    beautified.title.position = "bottom";
  }

  // 7. Always ensure legend is shown and positioned at bottom by default
  if (!beautified.legend) {
    beautified.legend = {
      show: true,
      position: "bottom",
      textColor: "#ffffff"
    };
  } else if (!beautified.legend.position) {
    beautified.legend.position = "bottom";
  }
  if (beautified.legend.show === undefined) {
    beautified.legend.show = true;
  }

  // 8. Set default axis title spacing and styling for better visual separation
  if (!beautified.axisTitles) {
    beautified.axisTitles = {
      xTitle: { nameGap: 80, fontSize: 16, color: "#ffffff" },
      yTitle: { nameGap: 60, fontSize: 16, color: "#ffffff" }
    };
  } else {
    if (!beautified.axisTitles.xTitle) {
      beautified.axisTitles.xTitle = { nameGap: 80, fontSize: 16, color: "#ffffff" };
    } else {
      if (beautified.axisTitles.xTitle.nameGap === undefined) {
        beautified.axisTitles.xTitle.nameGap = 80;
      }
      if (beautified.axisTitles.xTitle.fontSize === undefined) {
        beautified.axisTitles.xTitle.fontSize = 16;
      }
      if (beautified.axisTitles.xTitle.color === undefined) {
        beautified.axisTitles.xTitle.color = "#ffffff";
      }
    }
    if (!beautified.axisTitles.yTitle) {
      beautified.axisTitles.yTitle = { nameGap: 60, fontSize: 16, color: "#ffffff" };
    } else {
      if (beautified.axisTitles.yTitle.nameGap === undefined) {
        beautified.axisTitles.yTitle.nameGap = 60;
      }
      if (beautified.axisTitles.yTitle.fontSize === undefined) {
        beautified.axisTitles.yTitle.fontSize = 16;
      }
      if (beautified.axisTitles.yTitle.color === undefined) {
        beautified.axisTitles.yTitle.color = "#ffffff";
      }
    }
  }

  // 9. Set grid to "none" by default for cleaner appearance
  if (beautified.grid === undefined) {
    beautified.grid = "none";
  }

  return beautified;
}

export async function POST(req: Request) {
  try {
    // Check if API key is available
    if (!process.env.DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ 
        error: "DeepSeek API key not configured",
        details: "Please set DEEPSEEK_API_KEY in your environment variables"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body",
        details: "Request body must be valid JSON"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { userPrompt, currentConfig } = body;

    if (!userPrompt) {
      return new Response(JSON.stringify({ error: "No prompt provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log("Processing request:", { userPrompt, currentConfig });

    const systemPrompt = `You are a data visualization expert. Your job is to create complete chart configurations based on data analysis and user requests.

IMPORTANT: You can return either:
1. A COMPLETE configuration (when analyzing new data with empty currentConfig)
2. A PARTIAL configuration (when making tweaks to existing charts)

For complete configurations, include ALL necessary fields. For partial updates, include only the fields you want to change.

Return ONLY valid JSON. For new data analysis (empty currentConfig), return complete config. For tweaks, return only changed fields.

IMPORTANT JSON FORMATTING RULES:
- Use double quotes for all strings and property names
- No trailing commas
- No comments in JSON
- All property names must be quoted
- Use proper JSON syntax, not JavaScript object syntax

You can include any of these fields:
{
  "chartType": "bar" | "line" | "scatter" | "area" | "pie",
  "xKey": "string",
  "yKey": "string", 
  "palette": ["#hexcolor"],
  "axisStyle": "minimal" | "classic" | {"color": "#hex", "width": number},
  "animation": "none" | {"easing": "string", "duration": number},
  "font": {"family": "string", "size": number, "weight": number},
  "tooltipStyle": "shadow" | {"bg": "#hex", "border": "#hex"},
  "grid": "none" | "solid" | "dashed",
  "themePreset": "light" | "dark" | "vintage" | "macarons" | "custom" | "shadcn-dark",
  "barStyle": {
    "borderRadius": number (0-50),
    "width": number (1-100),
    "shadow": boolean,
    "gradient": boolean,
    "opacity": number (0-1),
    "colors": ["#hexcolor1", "#hexcolor2", "#hexcolor3"],
    "borderColor": "#hexcolor",
    "borderWidth": number (0-10)
  },
  "lineStyle": {
    "width": number (1-20),
    "smooth": boolean,
    "areaOpacity": number (0-1),
    "lineOpacity": number (0-1),
    "shadow": boolean,
    "gradient": boolean
  },
  "scatterStyle": {
    "size": number (1-50),
    "shape": "circle" | "square" | "diamond" | "triangle",
    "opacity": number (0-1),
    "borderWidth": number (0-10)
  },
  "pieStyle": {
    "radius": number (10-100),
    "roseType": boolean,
    "donut": boolean,
    "center": [number | string, number | string],
    "gradient": boolean,
    "borderColor": "#hexcolor",
    "borderWidth": number (0-10),
    "borderRadius": number (0-50)
  },
  "backgroundColor": "#hexcolor (only use for light themes, otherwise keep default dark)",
  "borderStyle": {
    "color": "#hexcolor",
    "width": number (0-10),
    "type": "solid" | "dashed" | "dotted"
  },
  "legend": {
    "show": boolean,
    "position": "top" | "bottom" | "left" | "right",
    "textColor": "#hexcolor"
  },
  "title": {
    "text": "string",
    "color": "#hexcolor",
    "fontSize": number (8-32),
    "position": "top" | "bottom" | "left" | "right"
  },
  "axisTitles": {
    "xTitle": {
      "text": "string",
      "fontSize": number (8-24),
      "fontFamily": "string",
      "fontWeight": number (100-900),
      "color": "#hexcolor",
      "nameGap": number (0-100)
    },
    "yTitle": {
      "text": "string", 
      "fontSize": number (8-24),
      "fontFamily": "string",
      "fontWeight": number (100-900),
      "color": "#hexcolor",
      "nameGap": number (0-100)
    }
  },
  "axisLines": {
    "color": "#hexcolor",
    "width": number (1-10),
    "show": boolean
  },
  "axisLabels": {
    "xLabels": {
      "color": "#hexcolor",
      "fontSize": number (8-20),
      "fontFamily": "string",
      "fontWeight": number (100-900),
      "rotate": number (-90 to 90),
      "interval": number (0 = show all, 1 = show every other, 2 = show every third, etc),
      "showMaxLabel": boolean,
      "formatter": "string (JavaScript function or template)"
    },
    "yLabels": {
      "color": "#hexcolor",
      "fontSize": number (8-20),
      "fontFamily": "string",
      "fontWeight": number (100-900),
      "rotate": number (-90 to 90),
      "interval": number (0 = show all, 1 = show every other, 2 = show every third, etc),
      "showMaxLabel": boolean,
      "formatter": "string (JavaScript function or template)"
    }
  },
  "binning": {
    "enabled": boolean,
    "groupSize": number (2-10),
    "method": "sum" | "average" | "max" | "min"
  },
  "chartSize": {
    "aspectRatio": number (0.3-3.0)
  },
  "yAxis": {
    "min": number,
    "max": number,
    "scale": boolean,
    "type": "value" | "log"
  }
}

When analyzing new data (empty currentConfig):
- Choose the most appropriate chart type based on data structure
- Select meaningful x and y axes
- ALWAYS add a descriptive title that summarizes the chart content
- Include legends for categorical data, positioned at bottom by default
- Use professional styling
- Set appropriate axis title spacing: xTitle nameGap should be 80-100 for good separation from labels, yTitle nameGap should be 60-80
- Make axis titles bigger (fontSize: 16-18) and white (color: "#ffffff") by default
- Set grid to "none" by default for cleaner appearance (unless user specifically requests grid lines)
- For light themes, use a warm cream background (#fdf6e3) by default unless user specifies a different color
- The chart canvas has rounded corners for a modern appearance

When making tweaks (existing currentConfig):
- Return only the fields you want to change
- The system will merge with the current configuration

Examples of tweaks:
- "rounded bars" → {"barStyle": {"borderRadius": 10}}
- "squared bars" → {"barStyle": {"borderRadius": 0}}
- "wider bars" → {"barStyle": {"width": 80}}
- "make bars different colors" → {"barStyle": {"colors": ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"]}}
- "colorful bars" → {"barStyle": {"colors": ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"]}}
- "rainbow bars" → {"barStyle": {"colors": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]}}
- "different colored bars" → {"barStyle": {"colors": ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"]}}
- "make them gradients" → {"barStyle": {"gradient": true}}
- "gradient bars" → {"barStyle": {"gradient": true}}
- "add gradients" → {"barStyle": {"gradient": true}}
- "gradient fill" → {"barStyle": {"gradient": true}}
- "gradient bars with different colors" → {"barStyle": {"gradient": true, "colors": ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"]}}
- "colorful gradient bars" → {"barStyle": {"gradient": true, "colors": ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"]}}
- "rainbow gradients" → {"barStyle": {"gradient": true, "colors": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]}}
- "change pie chart colors" → {"palette": ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"]}
- "different pie colors" → {"palette": ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"]}
- "colorful pie chart" → {"palette": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]}
- "rainbow pie" → {"palette": ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]}
- "pie chart gradients" → {"pieStyle": {"gradient": true}}
- "gradient pie" → {"pieStyle": {"gradient": true}}
- "add gradients to pie" → {"pieStyle": {"gradient": true}}
- "pie with gradients" → {"pieStyle": {"gradient": true}}
- "light mode" → {"themePreset": "light"}
- "light theme" → {"themePreset": "light"}
- "switch to light" → {"themePreset": "light"}
- "dark mode" → {"themePreset": "shadcn-dark"}
- "dark theme" → {"themePreset": "shadcn-dark"}
- "switch to dark" → {"themePreset": "shadcn-dark"}
- "cream background" → {"backgroundColor": "#fdf6e3"}
- "warm background" → {"backgroundColor": "#fef8e7"}
- "beige background" → {"backgroundColor": "#f5f5dc"}
- "ivory background" → {"backgroundColor": "#fffff0"}
- "white background" → {"backgroundColor": "#ffffff"}
- "light blue background" → {"backgroundColor": "#f0f8ff"}
- "light gray background" → {"backgroundColor": "#f8f9fa"}
- "pink background" → {"backgroundColor": "#fff0f5"}
- "mint background" → {"backgroundColor": "#f0fff0"}
- "lavender background" → {"backgroundColor": "#f8f4ff"}
- "peach background" → {"backgroundColor": "#fff5ee"}
- "yellow background" → {"backgroundColor": "#fffff0"}
- "orange background" → {"backgroundColor": "#fff8dc"}
- "red background" → {"backgroundColor": "#fff5f5"}
- "green background" → {"backgroundColor": "#f0fff0"}
- "blue background" → {"backgroundColor": "#f0f8ff"}
- "purple background" → {"backgroundColor": "#f8f4ff"}
- "background color #ffebee" → {"backgroundColor": "#ffebee"}
- "background color #e3f2fd" → {"backgroundColor": "#e3f2fd"}
- "background color #e8f5e8" → {"backgroundColor": "#e8f5e8"}
- "background color #fff3e0" → {"backgroundColor": "#fff3e0"}
- "background color #fce4ec" → {"backgroundColor": "#fce4ec"}
- "background color #f1f8e9" → {"backgroundColor": "#f1f8e9"}
- "background color #e0f2f1" → {"backgroundColor": "#e0f2f1"}
- "background color #f3e5f5" → {"backgroundColor": "#f3e5f5"}
- "background color #fff8e1" → {"backgroundColor": "#fff8e1"}
- "background color #ffebee" → {"backgroundColor": "#ffebee"}
- "background color #e8eaf6" → {"backgroundColor": "#e8eaf6"}
- "background color #e0f7fa" → {"backgroundColor": "#e0f7fa"}
- "background color #f1f8e9" → {"backgroundColor": "#f1f8e9"}
- "background color #fff3e0" → {"backgroundColor": "#fff3e0"}
- "background color #fce4ec" → {"backgroundColor": "#fce4ec"}
- "thick lines" → {"lineStyle": {"width": 8}}
- "smooth curves" → {"lineStyle": {"smooth": true}}
- "add lines back" → {"lineStyle": {"lineOpacity": 1}}
- "show lines" → {"lineStyle": {"lineOpacity": 1}}
- "make lines visible" → {"lineStyle": {"lineOpacity": 1}}
- "hide lines" → {"lineStyle": {"lineOpacity": 0}}
- "remove lines" → {"lineStyle": {"lineOpacity": 0}}
- "keep area but show lines" → {"lineStyle": {"areaOpacity": 0.3, "lineOpacity": 1}}
- "area with lines" → {"lineStyle": {"areaOpacity": 0.3, "lineOpacity": 1}}
- "large dots" → {"scatterStyle": {"size": 20}}
- "add title" → {"title": {"text": "Chart Title", "color": "#ffffff", "fontSize": 16, "position": "bottom"}}
- "remove title" → {"title": {"show": false}}
- "style title" → {"title": {"text": "Chart Title", "color": "#ffffff", "fontSize": 18, "position": "bottom", "backgroundColor": "#333333", "padding": "10px", "borderRadius": "8px"}}
- "title in box" → {"title": {"text": "Chart Title", "position": "bottom", "backgroundColor": "#2a2a2a", "padding": "12px", "borderRadius": "6px", "border": "1px solid #444444"}}
- "show legend" → {"legend": {"show": true, "position": "bottom", "textColor": "#ffffff"}}
- "legend on top" → {"legend": {"show": true, "position": "top", "textColor": "#ffffff"}}
- "legend on right" → {"legend": {"show": true, "position": "right", "textColor": "#ffffff"}}
- "change x-axis title to 'Time Period'" → {"axisTitles": {"xTitle": {"text": "Time Period"}}}
- "make y-axis title bigger" → {"axisTitles": {"yTitle": {"fontSize": 18}}}
- "white axis titles" → {"axisTitles": {"xTitle": {"color": "#ffffff"}, "yTitle": {"color": "#ffffff"}}}
- "bigger axis titles" → {"axisTitles": {"xTitle": {"fontSize": 18}, "yTitle": {"fontSize": 18}}}
- "remove grid lines" → {"grid": "none"}
- "add grid lines" → {"grid": "solid"}
- "dashed grid" → {"grid": "dashed"}
- "hide background lines" → {"grid": "none"}
- "no background lines" → {"grid": "none"}
- "remove background lines" → {"grid": "none"}
- "get rid of background lines" → {"grid": "none"}
- "no grid" → {"grid": "none"}
- "add outline to bars" → {"barStyle": {"borderColor": "#ffffff", "borderWidth": 2}}
- "bar outline" → {"barStyle": {"borderColor": "#ffffff", "borderWidth": 2}}
- "bars with outline" → {"barStyle": {"borderColor": "#ffffff", "borderWidth": 2}}
- "border around bars" → {"barStyle": {"borderColor": "#ffffff", "borderWidth": 2}}
- "white outline on bars" → {"barStyle": {"borderColor": "#ffffff", "borderWidth": 2}}
- "black outline on bars" → {"barStyle": {"borderColor": "#000000", "borderWidth": 2}}
- "thick bar outline" → {"barStyle": {"borderColor": "#ffffff", "borderWidth": 4}}
- "thin bar outline" → {"barStyle": {"borderColor": "#ffffff", "borderWidth": 1}}
- "remove bar outline" → {"barStyle": {"borderWidth": 0}}
- "no bar outline" → {"barStyle": {"borderWidth": 0}}
- "remove pie outline" → {"pieStyle": {"borderWidth": 0}}
- "no pie outline" → {"pieStyle": {"borderWidth": 0}}
- "pie without outline" → {"pieStyle": {"borderWidth": 0}}
- "get rid of pie outline" → {"pieStyle": {"borderWidth": 0}}
- "hide pie border" → {"pieStyle": {"borderWidth": 0}}
- "pie chart outline" → {"pieStyle": {"borderColor": "#ffffff", "borderWidth": 2}}
- "white outline on pie" → {"pieStyle": {"borderColor": "#ffffff", "borderWidth": 2}}
- "black outline on pie" → {"pieStyle": {"borderColor": "#000000", "borderWidth": 2}}
- "thick pie outline" → {"pieStyle": {"borderColor": "#ffffff", "borderWidth": 4}}
- "rotate x-axis labels" → {"axisLabels": {"xLabels": {"rotate": 45}}}
- "group every 2 data points" → {"binning": {"enabled": true, "groupSize": 2, "method": "sum"}}
- "bin every 3 points" → {"binning": {"enabled": true, "groupSize": 3, "method": "average"}}
- "group data by 2s" → {"binning": {"enabled": true, "groupSize": 2, "method": "sum"}}
- "show every other bin" → {"binning": {"enabled": true, "groupSize": 2, "method": "sum"}}
- "average every 2 points" → {"binning": {"enabled": true, "groupSize": 2, "method": "average"}}
- "sum every 3 points" → {"binning": {"enabled": true, "groupSize": 3, "method": "sum"}}
- "make chart wider" → {"chartSize": {"aspectRatio": 2.0}}
- "make chart taller" → {"chartSize": {"aspectRatio": 0.7}}
- "make chart square" → {"chartSize": {"aspectRatio": 1.0}}
- "wider chart" → {"chartSize": {"aspectRatio": 1.8}}
- "taller chart" → {"chartSize": {"aspectRatio": 0.6}}
- "landscape chart" → {"chartSize": {"aspectRatio": 2.2}}
- "portrait chart" → {"chartSize": {"aspectRatio": 0.5}}
- "make chart narrower" → {"chartSize": {"aspectRatio": 0.8}}
- "make chart wider" → {"chartSize": {"aspectRatio": 2.0}}
- "narrow chart" → {"chartSize": {"aspectRatio": 0.6}}
- "wide chart" → {"chartSize": {"aspectRatio": 2.5}}
- "fix overlapping labels" → {"axisLabels": {"xLabels": {"rotate": 45, "interval": 1}}}
- "rotate x-axis labels" → {"axisLabels": {"xLabels": {"rotate": 45}}}
- "vertical labels" → {"axisLabels": {"xLabels": {"rotate": 90}}}
- "more space for labels" → {"axisTitles": {"xTitle": {"nameGap": 100}, "yTitle": {"nameGap": 80}}}
- "tighten label spacing" → {"axisTitles": {"xTitle": {"nameGap": 40}, "yTitle": {"nameGap": 40}}}
- "default spacing" → {"axisTitles": {"xTitle": {"nameGap": 80}, "yTitle": {"nameGap": 60}}}
- "show every other label" → {"axisLabels": {"xLabels": {"interval": 1}}}
- "show every third label" → {"axisLabels": {"xLabels": {"interval": 2}}}
- "prevent label overlap" → {"axisLabels": {"xLabels": {"rotate": 45, "interval": 1}}, "axisTitles": {"xTitle": {"nameGap": 50}}}
- "make y axis more dramatic" → {"yAxis": {"scale": true}}
- "dramatic y scale" → {"yAxis": {"scale": true}}
- "exaggerate y axis" → {"yAxis": {"scale": true}}
- "start y axis from zero" → {"yAxis": {"scale": false}}
- "logarithmic y axis" → {"yAxis": {"type": "log"}}
- "log scale y" → {"yAxis": {"type": "log"}}
- "set y axis range 0 to 100" → {"yAxis": {"min": 0, "max": 100}}
- "y axis from 0 to 50" → {"yAxis": {"min": 0, "max": 50}}
- "less data labels on x" → {"axisLabels": {"xLabels": {"interval": 2}}}
- "fewer x labels" → {"axisLabels": {"xLabels": {"interval": 1}}}
- "reduce x axis labels" → {"axisLabels": {"xLabels": {"interval": 2}}}
- "show fewer x labels" → {"axisLabels": {"xLabels": {"interval": 1}}}
- "shorten x axis labels" → {"axisLabels": {"xLabels": {"formatter": "return value.toString().slice(-2);"}}}
- "shorten year labels" → {"axisLabels": {"xLabels": {"formatter": "return value.toString().slice(-2);"}}}
- "2024 to 24" → {"axisLabels": {"xLabels": {"formatter": "return value.toString().slice(-2);"}}}
- "abbreviate x labels" → {"axisLabels": {"xLabels": {"formatter": "return value.toString().substring(0, 3);"}}}
- "short x labels" → {"axisLabels": {"xLabels": {"formatter": "return value.toString().substring(0, 3);"}}}
- "make x labels more terse" → {"axisLabels": {"xLabels": {"formatter": "return value.toString().substring(0, 3);"}}}
- "terse x labels" → {"axisLabels": {"xLabels": {"formatter": "return value.toString().substring(0, 3);"}}}
- "remove first label" → {"axisLabels": {"xLabels": {"formatter": "return params.dataIndex === 0 ? '' : value;"}}}
- "hide first x label" → {"axisLabels": {"xLabels": {"formatter": "return params.dataIndex === 0 ? '' : value;"}}}
- "remove first date" → {"axisLabels": {"xLabels": {"formatter": "return params.dataIndex === 0 ? '' : value;"}}}
- "hide first date" → {"axisLabels": {"xLabels": {"formatter": "return params.dataIndex === 0 ? '' : value;"}}}
- "remove first x axis label" → {"axisLabels": {"xLabels": {"formatter": "return params.dataIndex === 0 ? '' : value;"}}}
- "hide first x axis label" → {"axisLabels": {"xLabels": {"formatter": "return params.dataIndex === 0 ? '' : value;"}}}
- "remove first label on x axis" → {"axisLabels": {"xLabels": {"formatter": "return params.dataIndex === 0 ? '' : value;"}}}
- "hide first label on x axis" → {"axisLabels": {"xLabels": {"formatter": "return params.dataIndex === 0 ? '' : value;"}}}

Example of correct JSON:
{
  "chartType": "line",
  "xKey": "Date",
  "yKey": "Revenue",
  "title": {
    "text": "Weekly Revenue Trends",
    "color": "#ffffff",
    "fontSize": 18
  }
}

NOT like this (incorrect):
{
  chartType: "line",
  xKey: "Date",
  'yKey': "Revenue",
  title: {
    text: "Weekly Revenue Trends",
    color: "#ffffff",
    fontSize: 18,
  }
}

Current config: ${JSON.stringify(currentConfig, null, 2)}

User request: "${userPrompt}"

Return ONLY valid JSON. For new data analysis (empty currentConfig), return complete config. For tweaks, return only changed fields.`;

    console.log("Making DeepSeek API request...");

    let response;
    try {
      response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 600
        })
      });
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      return new Response(JSON.stringify({ 
        error: "Failed to connect to DeepSeek API",
        details: fetchError instanceof Error ? fetchError.message : "Network error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log("DeepSeek response status:", response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API error:", errorData);
      return new Response(JSON.stringify({ 
        error: "DeepSeek API error",
        details: `Status: ${response.status} - ${errorData}`
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error("Failed to parse DeepSeek response:", parseError);
      return new Response(JSON.stringify({ 
        error: "Invalid response from DeepSeek API",
        details: "Failed to parse API response"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log("DeepSeek response data:", data);
    
    const aiResponse = data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("No response from DeepSeek");
    }

    console.log("AI Response:", aiResponse);

    // Try to extract JSON from the response with better error handling
    let jsonString = '';
    let partialUpdate = null;
    
    try {
        // First, try to find JSON in the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No valid JSON found in response");
        }

        jsonString = jsonMatch[0];
        console.log("Extracted JSON:", jsonString);

        // Try to parse the JSON
        partialUpdate = JSON.parse(jsonString);
        console.log("Parsed partial update:", partialUpdate);
        
    } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Raw AI response:", aiResponse);
        console.error("Attempted to parse:", jsonString);
        
        // Try to fix common JSON issues
        try {
            // Remove any trailing commas
            let fixedJson = jsonString.replace(/,(\s*[}\]])/g, '$1');
            
            // Fix missing quotes around property names
            fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
            
            // Fix single quotes to double quotes
            fixedJson = fixedJson.replace(/'/g, '"');
            
            console.log("Attempting to parse fixed JSON:", fixedJson);
            partialUpdate = JSON.parse(fixedJson);
            console.log("Successfully parsed fixed JSON:", partialUpdate);
            
        } catch (fixError) {
            console.error("Failed to fix JSON:", fixError);
            
            // Return a basic fallback configuration
            partialUpdate = {
                chartType: "bar",
                xKey: "Date",
                yKey: "Revenue",
                palette: ["#7dd3fc", "#60a5fa", "#818cf8", "#c084fc", "#f472b6"],
                axisStyle: "classic",
                animation: { easing: "cubicOut", duration: 1000 },
                font: { family: "Inter", size: 12, weight: 500 },
                tooltipStyle: "shadow",
                grid: "none",
                themePreset: "shadcn-dark",
                axisTitles: {
                    xTitle: { nameGap: 80, fontSize: 16, color: "#ffffff" },
                    yTitle: { nameGap: 60, fontSize: 16, color: "#ffffff" }
                }
            };
            console.log("Using fallback configuration:", partialUpdate);
        }
    }

    // Deep merge with current config
    const mergedConfig = deepMerge(currentConfig || {}, partialUpdate) as VibeConfig;
    console.log("Merged config:", mergedConfig);
    
    // Beautify the merged config
    const beautifiedConfig = beautify(mergedConfig);
    console.log("Beautified config:", beautifiedConfig);
    
    // Validate the beautified config
    try {
      const parsed = VibeConfig.parse(beautifiedConfig);
      console.log("Validated config:", parsed);
      
      return new Response(JSON.stringify(parsed), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (validationError) {
      console.error("Schema validation failed:", validationError);
      console.error("Config that failed validation:", JSON.stringify(beautifiedConfig, null, 2));
      
      // Try to fix common validation issues
      const fixedConfig = {
        ...beautifiedConfig,
        axisStyle: beautifiedConfig.axisStyle || "classic",
        animation: beautifiedConfig.animation || { easing: "cubicOut", duration: 1000 },
        font: beautifiedConfig.font || { family: "Inter", size: 12, weight: 500 },
        tooltipStyle: beautifiedConfig.tooltipStyle || "shadow",
        grid: beautifiedConfig.grid || "none",
        themePreset: beautifiedConfig.themePreset || "shadcn-dark"
      };
      
      try {
        const parsed = VibeConfig.parse(fixedConfig);
        console.log("Fixed and validated config:", parsed);
        
        return new Response(JSON.stringify(parsed), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (finalError) {
        console.error("Final validation failed:", finalError);
        throw new Error(`Schema validation failed: ${finalError}`);
      }
    }

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to process request",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
