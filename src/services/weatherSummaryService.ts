import axios from "axios";
import type { WeatherApiResponse } from "./weatherService";

const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/Llama-3.2-1B-Instruct";

const SUMMARY_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const summaryCache = new Map<string, { summary: string; timestamp: number }>();

export const generateWeatherSummary = async (
  weather: WeatherApiResponse
): Promise<string> => {
  const cacheKey = `${weather.location.city}_${weather.main.temp.toFixed(1)}`;
  const cached = summaryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < SUMMARY_CACHE_TTL_MS) {
    return cached.summary;
  }

  const apiKey = process.env.HF_API_KEY;

  if (!apiKey) {
    throw new Error("HF_API_KEY is not set.");
  }

  const model = process.env.HF_MODEL ?? DEFAULT_MODEL;

  const { location, main, wind, rain, forecast } = weather;

  const userPrompt = [
    `Location: ${location.city}${
      location.state ? ", " + location.state : ""
    }${location.country ? ", " + location.country : ""}`,
    `Current temperature: ${main.temp.toFixed(1)} °C (feels like ${main.feels_like.toFixed(
      1
    )} °C)`,
    `Wind: ${wind.speed.toFixed(1)} m/s${
      wind.direction != null ? ` at ${wind.direction.toFixed(0)}°` : ""
    }`,
    `Rain chance today: ${
      rain?.probability != null ? `${rain.probability.toFixed(0)} %` : "unknown"
    }`,
    `Today's high / low: ${
      forecast?.dailyHigh != null ? forecast.dailyHigh.toFixed(1) + " °C" : "N/A"
    } / ${
      forecast?.dailyLow != null ? forecast.dailyLow.toFixed(1) + " °C" : "N/A"
    }`,
    ``,
    `Summarize today's weather in 2-3 short sentences for a general audience.`,
    `Focus on what it feels like, wind, rain chance, and today's high/low.`
  ].join("\n");

  try {
    const response = await axios.post(
      HF_ROUTER_URL,
      {
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a concise, friendly weather assistant. Use clear, simple language.",
          },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content =
      response.data?.choices?.[0]?.message?.content?.trim() ??
      "AI summary is currently unavailable.";

    summaryCache.set(cacheKey, { summary: content, timestamp: Date.now() });
    return content;
  } catch (error: unknown) {
    const status = (error as any)?.response?.status;
    if (status === 410 || status === 404 || status === 503 || status === 403) {
      return "AI summary is temporarily unavailable. The language model may be loading or has been retired.";
    }
    throw error;
  }
};

