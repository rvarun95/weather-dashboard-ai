# Weather Dashboard AI Project

## Project Overview

This is a **React + TypeScript Weather Dashboard** project with backend Node.js (or Java). It is designed to integrate **Generative AI, Agentic AI, and MCP** in later phases. Users can customize their dashboard with dynamic widgets.

---

## Folder Structure (VS Code / Cursor IDE Ready)

```
weather-dashboard-ai/
│
├── backend/                  # Node.js / Express backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app.ts             # Express app entry point
│   │   ├── routes/
│   │   │   ├── weather.ts      # Weather API route
│   │   │   └── widgets.ts      # Widget CRUD API route
│   │   ├── controllers/       # Business logic
│   │   └── services/          # Weather API service
│   └── .env                   # API keys
│
├── frontend/                 # React + TypeScript frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts         # Vite config if using Vite
│   ├── public/
│   └── src/
│       ├── App.tsx            # Main app entry
│       ├── index.tsx          # React DOM render
│       ├── components/        # Reusable UI components
│       │   ├── WeatherWidget.tsx
│       │   └── Dashboard.tsx
│       ├── services/          # API calls to backend
│       │   └── weatherService.ts
│       └── styles/            # Tailwind or CSS files
│
├── README.md
└── .gitignore
```

---

## Backend Quick Start (Node.js)

```bash
cd backend
npm install
npm run dev  # start server on localhost:3000
```

### Example Weather API Endpoint (Express)

```ts
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.get('/api/weather/:city', async (req, res) => {
    const city = req.params.city;
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
    const data = await response.json();
    res.json(data);
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Frontend Quick Start (React + TypeScript)

```bash
cd frontend
npm install
npm run dev  # start React app
```

### Example Weather Widget Component

```tsx
interface WeatherWidgetProps {
  title: string;
  value: string;
}

export const WeatherWidget = ({ title, value }: WeatherWidgetProps) => {
  return (
    <div className="widget border p-4 rounded shadow">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-xl">{value}</p>
    </div>
  );
};
```

### Example Dashboard Component

```tsx
import { useEffect, useState } from 'react';
import { WeatherWidget } from './WeatherWidget';

interface WeatherData {
  temp: number;
  humidity: number;
}

export const Dashboard = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch('/api/weather/Rockville')
      .then(res => res.json())
      .then(data => setWeather({ temp: data.main.temp, humidity: data.main.humidity }));
  }, []);

  return (
    <div className="dashboard grid grid-cols-2 gap-4 p-4">
      {weather && (
        <>
          <WeatherWidget title="Temperature" value={`${weather.temp}°C`} />
          <WeatherWidget title="Humidity" value={`${weather.humidity}%`} />
        </>
      )}
    </div>
  );
};
```

---

## Next Steps / Progressive Enhancements

1. Add more widgets: wind, rain, forecast.
2. Implement CRUD for widgets with backend persistence.
3. Integrate Generative AI for weather summaries.
4. Implement Agentic AI for automated widget updates.
5. Add MCP integration to let AI agents call dashboard tools.
6. Later: Try Figma MCP to generate React components from Figma designs.

---

## Notes

* Use **.env** for all API keys (OpenWeatherMap, OpenAI, etc.)
* Tailwind can be used for quick styling.
* Keep components reusable for AI to generate new widgets later.
* Folder structure is **VS Code / Cursor IDE ready**.

---

This setup will allow you to start **coding immediately** while leaving room for **AI, MCP, and Figma MCP integration later**.
