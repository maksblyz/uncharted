import { z } from "zod";

export const ChartConfig = z.object({
  chartType: z.enum(["bar", "line", "scatter"]),
  style: z.object({
    bg: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
    palette: z.array(z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/)).max(5),
    animate: z.boolean(),
    barWidth: z.enum(["narrow", "medium", "chunky"]),
    grid: z.enum(["none", "solid", "dashed"])
  })
});
