# Uncharted

Zero hallucinations. Infinite customization.

## Features

- **AI-Powered Chart Generation**: Upload CSV data and describe your vision in natural language
- **Real-time Customization**: Chat with AI to modify charts instantly
- **Multiple Chart Types**: Bar, line, scatter, pie charts with extensive styling options
- **Persistent Storage**: Charts are automatically saved and persist across page refreshes
- **Session Management**: Each browser session maintains its own chart state
- **Premium Features**: Advanced customization options for premium users

## Persistence Feature

The application now includes automatic persistence using Prisma and PostgreSQL:

- **Auto-save**: Charts are automatically saved after data upload and configuration changes
- **Session-based**: Each browser session maintains its own chart state
- **Cross-refresh**: Charts persist when you refresh the page or close/reopen the browser
- **Database**: Uses Prisma with PostgreSQL (via Prisma Accelerate) for reliable storage

### Database Schema

- `Chart`: Stores chart configurations and metadata
- `ChartData`: Stores the actual CSV data for each chart
- `UserSession`: Tracks browser sessions and their associated charts

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables in `.env`:
   - `DATABASE_URL`: Your Prisma Accelerate database URL
   - `DEEPSEEK_API_KEY`: Your DeepSeek API key
   - Other required API keys (see `.env.example`)
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `pnpm dev`

## Usage

1. Upload a CSV file
2. Describe your desired chart in natural language
3. Chat with the AI to customize the chart
4. Your changes are automatically saved
5. Refresh the page to see your chart persist

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: ECharts
- **Database**: PostgreSQL with Prisma
- **AI**: DeepSeek API
- **Authentication**: Supabase Auth
- **Payments**: Stripe

## Development

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm lint`: Run ESLint
- `npx prisma studio`: Open Prisma Studio for database management
- `npx prisma migrate dev`: Run database migrations
