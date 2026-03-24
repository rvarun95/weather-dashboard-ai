import type { Request, Response } from "express";
import { fetchWeatherByCity } from "../services/weatherService";
import { generateWeatherSummary } from "../services/weatherSummaryService";

const handleWeatherError = (error: unknown, res: Response) => {
  // eslint-disable-next-line no-console
  console.error("Weather API error:", error);

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as any).response?.data
  ) {
    const axiosError = error as any;
    const status = axiosError.response.status ?? 500;
    const data = axiosError.response.data;
    const message =
      data?.message ?? data?.error?.message ?? "Upstream weather API error.";

    return res.status(status).json({ error: message });
  }

  return res.status(500).json({ error: "Failed to fetch weather data." });
};

export const getWeatherForCity = async (req: Request, res: Response) => {
  const city = req.params.city;

  if (!city) {
    return res.status(400).json({ error: "City parameter is required." });
  }

  try {
    const data = await fetchWeatherByCity(city);
    return res.json(data);
  } catch (error: unknown) {
    return handleWeatherError(error, res);
  }
};

export const getWeatherSummaryForCity = async (
  req: Request,
  res: Response
) => {
  const city = req.params.city;

  if (!city) {
    return res.status(400).json({ error: "City parameter is required." });
  }

  try {
    const weather = await fetchWeatherByCity(city);
    const summary = await generateWeatherSummary(weather);
    return res.json({ summary });
  } catch (error: unknown) {
    return handleWeatherError(error, res);
  }
};

