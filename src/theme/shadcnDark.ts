// Prettier axes configuration
const prettierAxes = {
  axisLine: { lineStyle: { color: '#94a3b833', width: 1 } },      // hairline slate border
  axisTick: { show: false },
  axisLabel: { color: '#cbd5e1', fontSize: 12, fontFamily: 'Inter', margin: 12, fontWeight: 500 }
};

// Prettier grid configuration - whisper-thin and almost invisible
const prettierGrid = {
  splitLine: { 
    lineStyle: { 
      color: '#33415522', 
      width: 1, 
      type: 'dashed',
      opacity: 0.08  // tint grid almost invisible
    } 
  },
  splitArea: { show: false }
};

export default {
  color: ['#7dd3fc', '#60a5fa', '#818cf8', '#c084fc', '#f472b6'],
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'Inter, sans-serif', fontWeight: 500 },
  axisPointer: { lineStyle: { color: '#4b5563' } },
  axisLine: { lineStyle: { color: '#4b5563' } },
  splitLine: { lineStyle: { color: '#37415122' } },
  tooltip: {
    backgroundColor: '#111827',
    borderColor: '#334155',
    borderRadius: 6,
    textStyle: { 
      color: '#f9fafb',
      fontFamily: 'Inter, sans-serif',
      fontSize: 14,
      fontWeight: 400
    },
    extraCssText: 'box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);'
  },
  legend: { textStyle: { color: '#e5e7eb' } },
  title: { textStyle: { color: '#f9fafb', fontWeight: 600 } },
  xAxis: prettierAxes,
  yAxis: { 
    ...prettierAxes, 
    splitLine: prettierGrid.splitLine,
    axisLine: { lineStyle: { color: '#94a3b833', width: 1, opacity: 0.4 } }  // fade zero-line
  },
  grid: {
    show: false,  // drop shadows off grid
    containLabel: true  // hide x-axis top/left border
  }
} as const; 