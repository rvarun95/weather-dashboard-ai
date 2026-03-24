# Weather Dashboard AI

A full-stack weather dashboard with **AI-powered summaries** and **MCP (Model Context Protocol)** integration. Built with React, TypeScript, Node.js, and Express.

## Features

- **Live Weather Data** — Fetches real-time weather via [Open-Meteo API](https://open-meteo.com/) (no API key required)
- **AI Summaries** — Natural-language weather summaries powered by Hugging Face LLM (Llama 3.2)
- **MCP Server** — Exposes weather tools for AI assistants (GitHub Copilot, Claude Desktop, etc.)
- **Responsive UI** — Dark-themed dashboard with 7 weather widgets, mobile-friendly
- **Caching** — 5-minute weather cache, 10-minute AI summary cache to reduce API calls

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Weather API | Open-Meteo (geocoding + forecast) |
| AI | Hugging Face Router (Llama 3.2 1B Instruct) |
| MCP | `@modelcontextprotocol/sdk` with stdio transport |

## Project Structure

```
weather-dashboard-ai/
├── backend/
│   └── src/
│       ├── app.ts                  # Express server (port 3001)
│       ├── mcp-server.ts           # MCP server (stdio)
│       ├── controllers/
│       │   └── weatherController.ts
│       ├── routes/
│       │   ├── weather.ts          # GET /:city, GET /:city/summary
│       │   └── widgets.ts          # Placeholder for widget CRUD
│       └── services/
│           ├── weatherService.ts        # Open-Meteo weather fetching
│           └── weatherSummaryService.ts # Hugging Face AI summaries
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── components/
│       │   ├── Dashboard.tsx       # Main dashboard with search + widgets
│       │   └── WeatherWidget.tsx   # Reusable widget card
│       ├── services/
│       │   └── weatherService.ts   # API client
│       └── styles/
│           └── global.css          # Dark theme styling
└── .vscode/
    └── mcp.json                    # MCP server configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Clone and Install

```bash
git clone <repo-url>
cd weather-dashboard-ai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
HF_API_KEY=your_huggingface_api_key
HF_MODEL=meta-llama/Llama-3.2-1B-Instruct   # optional, this is the default
PORT=3001                                      # optional, defaults to 3001
```

> **Note:** Weather data uses Open-Meteo which requires no API key. The HF_API_KEY is only needed for AI summaries.

### 3. Run the Application

```bash
# Terminal 1 — Start backend
cd backend
npm run dev        # Express server on http://localhost:3001

# Terminal 2 — Start frontend
cd frontend
npm run dev        # Vite dev server on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/weather/:city` | Returns weather data (temp, wind, humidity, rain, forecast) |
| `GET` | `/api/weather/:city/summary` | Returns AI-generated weather summary |
| `GET` | `/api/widgets` | Placeholder — returns `{ widgets: [] }` |
| `GET` | `/health` | Health check |

## MCP Integration

The project includes an MCP server that exposes weather tools for AI assistants.

### MCP Tools

| Tool | Description |
|------|-------------|
| `get_weather` | Get current weather data for a city (temp, wind, rain, forecast) |
| `get_weather_summary` | Get an AI-generated natural-language weather summary |

### Usage with VS Code / GitHub Copilot

The MCP server is auto-configured via `.vscode/mcp.json`. After opening this project in VS Code:

1. Reload the window (`Ctrl+Shift+P` → "Reload Window")
2. Open Copilot Chat and ask: *"What's the weather in Tokyo?"*
3. Copilot will automatically discover and call the MCP tools

### Toggle MCP On/Off

- **Command Palette:** `Ctrl+Shift+P` → "MCP: List Servers" → Start/Stop
- **Config:** Set `"disabled": true` in `.vscode/mcp.json`

### Usage with Other MCP Clients

Point any MCP-compatible client (Claude Desktop, etc.) to:

```json
{
  "type": "stdio",
  "command": "npx",
  "args": ["ts-node-dev", "--transpile-only", "src/mcp-server.ts"],
  "cwd": "/path/to/weather-dashboard-ai/backend"
}
```

### Run MCP Server Standalone

```bash
cd backend
npm run mcp
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser UI                     │
│              (React + Vite :5173)                │
└──────────────────┬──────────────────────────────┘
                   │ /api/weather/:city
                   ▼
┌─────────────────────────────────────────────────┐
│              Express Backend (:3001)             │
│   Routes → Controllers → Services               │
└──────┬────────────────────────┬─────────────────┘
       │                        │
       ▼                        ▼
┌──────────────┐    ┌──────────────────────┐
│  Open-Meteo  │    │   Hugging Face LLM   │
│  Weather API │    │  (AI Summaries)      │
└──────────────┘    └──────────────────────┘

┌─────────────────────────────────────────────────┐
│           MCP Server (stdio)                     │
│  get_weather  |  get_weather_summary             │
│  Reuses same services as Express backend         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
        AI Assistants (Copilot, Claude, etc.)
```

## Available Scripts

### Backend (`cd backend`)

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `ts-node-dev` | Start Express server with hot reload |
| `npm run mcp` | `ts-node-dev` | Start MCP server (stdio) |
| `npm run build` | `tsc` | Compile TypeScript to `dist/` |
| `npm start` | `node dist/app.js` | Run compiled production server |

### Frontend (`cd frontend`)

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `vite` | Start dev server with HMR |
| `npm run build` | `vite build` | Production build |

## Roadmap

- [ ] Widget CRUD with backend persistence
- [ ] Additional widgets (wind rose, forecast chart)
- [ ] Agentic AI for automated widget updates
- [ ] Figma MCP for component generation from designs
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## License

Private project.
