# Uncharted - AI-Powered Chart Styling

Upload a CSV and get a clean, styled chart instantly. Below it, you can type natural language tweaks—"make it dark," "use chunky bars," "gridless background"—and the chart updates in real time. The LLM never touches your data; it only outputs style configs (colors, layout, animation) that are validated and safely applied.

## Features

- **CSV Upload**: Drag and drop or select CSV files for instant visualization
- **Multiple Chart Types**: Bar, line, and scatter charts with automatic data detection
- **Natural Language Styling**: Use plain English to modify chart appearance
- **Real-time Updates**: See changes applied instantly as you type
- **Safe Data Handling**: LLM only processes styling instructions, never your data
- **Responsive Design**: Beautiful, accessible charts that work on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Charts**: Recharts for beautiful, responsive visualizations
- **State Management**: Zustand for lightweight state management
- **AI**: OpenAI GPT-4 for natural language processing
- **Data Parsing**: PapaParse for CSV handling
- **Validation**: Zod for type-safe configuration

## Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd uncharted
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your OpenAI API key:
```
OPENAI_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Upload Data**: Click the upload area and select a CSV file. The app will automatically detect the first two columns for visualization.

2. **View Chart**: Your data will be displayed as a bar chart by default, with clean styling and responsive design.

3. **Style with AI**: Use the text area below the chart to describe your desired changes:
   - "make it dark" → Dark theme with appropriate colors
   - "use chunky bars" → Wider, more prominent bars
   - "gridless background" → Remove grid lines
   - "change to line chart" → Switch to line visualization
   - "use blue colors" → Apply blue color palette

4. **Real-time Updates**: Watch as your chart updates instantly with the new styling.

## Sample Data

Use the included `sample-data.csv` file to test the application:

```csv
Month,Sales
January,1200
February,1500
March,1800
...
```

## Configuration Schema

The app uses a validated configuration schema for chart styling:

```typescript
{
  chartType: "bar" | "line" | "scatter",
  style: {
    bg: "#ffffff", // Background color (hex)
    palette: ["#64748b"], // Color palette (array of hex colors)
    animate: true, // Animation enabled
    barWidth: "narrow" | "medium" | "chunky", // Bar width
    grid: "none" | "solid" | "dashed" // Grid style
  }
}
```

## API Endpoints

### POST /api/vibe

Processes natural language styling requests and returns validated chart configuration.

**Request Body:**
```json
{
  "userPrompt": "make it dark",
  "currentConfig": { /* current chart config */ }
}
```

**Response:**
```json
{
  "chartType": "bar",
  "style": {
    "bg": "#1f2937",
    "palette": ["#3b82f6"],
    "animate": true,
    "barWidth": "medium",
    "grid": "solid"
  }
}
```

## Development

### Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── ChartRenderer.tsx
│   ├── ChatBox.tsx
│   └── DropUpload.tsx
├── lib/               # Utilities and schemas
│   ├── config-schema.ts
│   └── utils.ts
└── store/             # State management
    └── useChartStore.ts
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- AI powered by [OpenAI](https://openai.com/)
