export interface WeatherLocationSummary {
  city: string;
  state?: string;
  country?: string;
}

export interface WeatherSummary {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;
  rainChance?: number | null;
  forecastHigh?: number | null;
  forecastLow?: number | null;
  location: WeatherLocationSummary;
}

export const getWeatherByCity = async (city: string): Promise<WeatherSummary> => {
  const response = await fetch(`/api/weather/${encodeURIComponent(city)}`);

  if (!response.ok) {
    // Try to surface backend error message if present
    try {
      const errorBody = (await response.json()) as { error?: string };
      if (errorBody?.error) {
        throw new Error(errorBody.error);
      }
    } catch {
      // ignore JSON parse errors and fall back to generic message
    }

    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return {
    temp: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    windDirection: data.wind.direction,
    rainChance: data.rain?.probability ?? null,
    forecastHigh: data.forecast?.dailyHigh ?? null,
    forecastLow: data.forecast?.dailyLow ?? null,
    location: {
      city: data.location?.city ?? city,
      state: data.location?.state,
      country: data.location?.country
    }
  };
};

export const getWeatherSummary = async (city: string): Promise<string> => {
  const response = await fetch(
    `/api/weather/${encodeURIComponent(city)}/summary`
  );

  if (!response.ok) {
    try {
      const errorBody = (await response.json()) as { error?: string };
      if (errorBody?.error) {
        throw new Error(errorBody.error);
      }
    } catch {
      // ignore parse issues
    }

    throw new Error(
      `Weather summary API error: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as { summary?: string };
  return data.summary ?? "AI summary is currently unavailable.";
};


