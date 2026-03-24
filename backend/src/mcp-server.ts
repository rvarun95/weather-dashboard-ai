import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import { fetchWeatherByCity } from "./services/weatherService";
import { generateWeatherSummary } from "./services/weatherSummaryService";

dotenv.config();

const server = new McpServer({
  name: "weather-dashboard",
  version: "1.0.0",
});

// Tool 1: Get current weather data for a city
server.tool(
  "get_weather",
  "Get current weather data for a given city, including temperature, wind, rain chance, and daily forecast.",
  {
    city: z.string().describe("The city name to look up weather for (e.g. 'London', 'New York')"),
  },
  async ({ city }) => {
    try {
      const weather = await fetchWeatherByCity(city);
      const { location, main, wind, rain, forecast } = weather;

      const text = [
        `Weather for ${location.city}${location.state ? ", " + location.state : ""}${location.country ? ", " + location.country : ""}`,
        ``,
        `Temperature: ${main.temp.toFixed(1)} °C (${((main.temp * 9) / 5 + 32).toFixed(1)} °F)`,
        `Feels like: ${main.feels_like.toFixed(1)} °C`,
        `Humidity: ${main.humidity}%`,
        `Wind: ${wind.speed.toFixed(1)} m/s${wind.direction != null ? ` at ${wind.direction.toFixed(0)}°` : ""}`,
        `Rain chance: ${rain?.probability != null ? `${rain.probability}%` : "unknown"}`,
        `Today's high: ${forecast?.dailyHigh != null ? forecast.dailyHigh.toFixed(1) + " °C" : "N/A"}`,
        `Today's low: ${forecast?.dailyLow != null ? forecast.dailyLow.toFixed(1) + " °C" : "N/A"}`,
      ].join("\n");

      return {
        content: [{ type: "text" as const, text }],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch weather data.";
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

// Tool 2: Get an AI-generated weather summary for a city
server.tool(
  "get_weather_summary",
  "Get an AI-generated natural-language summary of the current weather for a given city.",
  {
    city: z.string().describe("The city name to get a weather summary for (e.g. 'Tokyo', 'Paris')"),
  },
  async ({ city }) => {
    try {
      const weather = await fetchWeatherByCity(city);
      const summary = await generateWeatherSummary(weather);

      return {
        content: [{ type: "text" as const, text: summary }],
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate weather summary.";
      return {
        content: [{ type: "text" as const, text: `Error: ${message}` }],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("MCP server failed to start:", error);
  process.exit(1);
});
