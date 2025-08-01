import { z } from "zod";

export const VibeConfig = z.object({
  chartType: z.enum(["bar", "line", "scatter", "area", "pie"]),
  xKey: z.string(),
  yKey: z.string(),
  palette: z.array(z.string()),
  axisStyle: z.union([
    z.enum(["minimal", "classic"]),
    z.object({
      color: z.string(),
      width: z.number()
    })
  ]),
  animation: z.union([
    z.literal("none"),
    z.object({
      easing: z.string(),
      duration: z.number()
    })
  ]),
  font: z.object({
    family: z.string(),
    size: z.number(),
    weight: z.number()
  }),
  tooltipStyle: z.union([
    z.literal("shadow"),
    z.object({
      bg: z.string(),
      border: z.string()
    })
  ]),
  grid: z.enum(["none", "solid", "dashed"]),
  themePreset: z.enum(["light", "dark", "vintage", "macarons", "custom", "shadcn-dark"]),
  barStyle: z.object({
    borderRadius: z.number().optional(),
    width: z.number().optional(),
    shadow: z.boolean().optional(),
    gradient: z.boolean().optional(),
    opacity: z.number().optional(),
    colors: z.array(z.string()).optional()
  }).optional(),
  lineStyle: z.object({
    width: z.number().optional(),
    smooth: z.boolean().optional(),
    areaOpacity: z.number().optional(),
    lineOpacity: z.number().optional(),
    shadow: z.boolean().optional(),
    gradient: z.boolean().optional()
  }).optional(),
  scatterStyle: z.object({
    size: z.number().optional(),
    shape: z.enum(["circle", "square", "diamond", "triangle"]).optional(),
    opacity: z.number().optional(),
    borderWidth: z.number().optional()
  }).optional(),
  pieStyle: z.object({
    radius: z.number().optional(),
    roseType: z.boolean().optional(),
    donut: z.boolean().optional(),
    center: z.union([z.array(z.number()), z.array(z.string())]).optional(),
    gradient: z.boolean().optional()
  }).optional(),
  backgroundColor: z.string().optional(),
  borderStyle: z.object({
    color: z.string().optional(),
    width: z.number().optional(),
    type: z.enum(["solid", "dashed", "dotted"]).optional()
  }).optional(),
  legend: z.object({
    show: z.boolean().optional(),
    position: z.enum(["top", "bottom", "left", "right"]).optional(),
    textColor: z.string().optional()
  }).optional(),
  title: z.object({
    text: z.string().optional(),
    color: z.string().optional(),
    fontSize: z.number().optional(),
    position: z.enum(["top", "bottom", "left", "right"]).optional(),
    backgroundColor: z.string().optional(),
    padding: z.string().optional(),
    borderRadius: z.string().optional(),
    border: z.string().optional(),
    show: z.boolean().optional()
  }).optional(),
  axisTitles: z.object({
    xTitle: z.object({
      text: z.string().optional(),
      fontSize: z.number().optional(),
      fontFamily: z.string().optional(),
      fontWeight: z.number().optional(),
      color: z.string().optional(),
      nameGap: z.number().optional()
    }).optional(),
    yTitle: z.object({
      text: z.string().optional(),
      fontSize: z.number().optional(),
      fontFamily: z.string().optional(),
      fontWeight: z.number().optional(),
      color: z.string().optional(),
      nameGap: z.number().optional()
    }).optional()
  }).optional(),
  axisLines: z.object({
    color: z.string().optional(),
    width: z.number().optional(),
    show: z.boolean().optional()
  }).optional(),
  axisLabels: z.object({
    xLabels: z.object({
      color: z.string().optional(),
      fontSize: z.number().optional(),
      fontFamily: z.string().optional(),
      fontWeight: z.number().optional(),
      rotate: z.number().optional(),
      interval: z.number().optional(),
      showMaxLabel: z.boolean().optional(),
      margin: z.number().optional(),
      formatter: z.string().optional()
    }).optional(),
    yLabels: z.object({
      color: z.string().optional(),
      fontSize: z.number().optional(),
      fontFamily: z.string().optional(),
      fontWeight: z.number().optional(),
      rotate: z.number().optional(),
      interval: z.number().optional(),
      showMaxLabel: z.boolean().optional(),
      margin: z.number().optional(),
      formatter: z.string().optional()
    }).optional()
  }).optional(),
  yAxis: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    scale: z.boolean().optional(),
    type: z.enum(["value", "log"]).optional()
  }).optional(),
  binning: z.object({
    enabled: z.boolean().optional(),
    groupSize: z.number().optional(),
    method: z.enum(["sum", "average", "max", "min"]).optional()
  }).optional(),
  chartSize: z.object({
    aspectRatio: z.number().optional(), // width/height ratio, 1.0 = square, 2.0 = twice as wide, 0.5 = twice as tall
    maxWidth: z.number().optional(), // maximum width in pixels
    maxHeight: z.number().optional()  // maximum height in pixels
  }).optional()
});

export type VibeConfig = z.infer<typeof VibeConfig>; 