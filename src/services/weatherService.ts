import axios from "axios";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const weatherCache = new Map<string, { data: WeatherApiResponse; timestamp: number }>();

export interface WeatherLocation {
  city: string;
  state?: string;
  country?: string;
  lat: number;
  lon: number;
  // Open-Meteo geocoding API does not provide ZIP/postal code,
  // so we expose it as optional for future providers.
  zip?: string | null;
}

// We keep this interface compatible with what the frontend expects
// (main.temp, main.feels_like, main.humidity, wind.speed)
// and extend it with a "location" block.
export interface WeatherApiResponse {
  location: WeatherLocation;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
    direction?: number;
  };
  rain?: {
    probability?: number | null;
  };
  forecast?: {
    dailyHigh?: number | null;
    dailyLow?: number | null;
  };
}

interface OpenMeteoResponse {
  current_weather: {
    temperature: number; // °C
    windspeed: number; // km/h
    winddirection: number; // degrees
  };
  hourly?: {
    time: string[];
    precipitation_probability?: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

interface GeocodingResponse {
  results?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country?: string;
    admin1?: string; // region / state equivalent
  }>;
}

const geocodeCity = async (city: string): Promise<WeatherLocation> => {
  const response = await axios.get<GeocodingResponse>(OPEN_METEO_GEOCODING_URL, {
    params: {
      name: city,
      count: 1
    }
  });

  const first = response.data.results?.[0];

  if (!first) {
    throw new Error(`Could not find coordinates for city "${city}".`);
  }

  return {
    city: first.name,
    state: first.admin1,
    country: first.country,
    lat: first.latitude,
    lon: first.longitude,
    zip: null
  };
};

export const fetchWeatherByCity = async (
  city: string
): Promise<WeatherApiResponse> => {
  const cacheKey = city.trim().toLowerCase();
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL_MS) {
    return cached.data;
  }

  // 1) Look up coordinates and metadata for the given city
  const location = await geocodeCity(city);

  // 2) Fetch current weather + basic rain/forecast info for those coordinates
  const response = await axios.get<OpenMeteoResponse>(OPEN_METEO_URL, {
    params: {
      latitude: location.lat,
      longitude: location.lon,
      current_weather: true,
      hourly: "precipitation_probability",
      daily: "temperature_2m_max,temperature_2m_min",
      forecast_days: 1
    }
  });

  const { temperature, windspeed, winddirection } =
    response.data.current_weather;

  // Convert km/h → m/s to approximate previous API behaviour
  const windSpeedMs = windspeed / 3.6;

  // Basic rain probability: take the max precipitation probability for "today" if available
  let rainProbability: number | null = null;
  if (response.data.hourly?.precipitation_probability?.length) {
    rainProbability = Math.max(
      ...response.data.hourly.precipitation_probability
    );
  }

  // Basic daily forecast: today's max/min
  let dailyHigh: number | null = null;
  let dailyLow: number | null = null;
  if (
    response.data.daily?.temperature_2m_max?.length &&
    response.data.daily?.temperature_2m_min?.length
  ) {
    dailyHigh = response.data.daily.temperature_2m_max[0] ?? null;
    dailyLow = response.data.daily.temperature_2m_min[0] ?? null;
  }

  return {
    location,
    main: {
      temp: temperature,
      feels_like: temperature,
      // Open-Meteo current_weather doesn’t include humidity; use 0 as placeholder for now
      humidity: 0
    },
    wind: {
      speed: windSpeedMs,
      direction: winddirection
    },
    rain: {
      probability: rainProbability
    },
    forecast: {
      dailyHigh,
      dailyLow
    }
  };
};

