import { useEffect, useState } from "react";
import {
  getWeatherByCity,
  getWeatherSummary,
  type WeatherSummary
} from "../services/weatherService";
import { WeatherWidget } from "./WeatherWidget";

const DEFAULT_CITY = "Rockville";

export const Dashboard = () => {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [query, setQuery] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState<WeatherSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const loadWeather = async (targetCity: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWeatherByCity(targetCity);
      setWeather(data);
      setCity(targetCity);
      try {
        const aiSummary = await getWeatherSummary(targetCity);
        setSummary(aiSummary);
      } catch (summaryError) {
        // eslint-disable-next-line no-console
        console.error("Failed to load AI summary:", summaryError);
        setSummary(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch weather data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWeather(DEFAULT_CITY);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    void loadWeather(query.trim());
  };

  const formatWindDirection = (direction?: number) => {
    if (direction == null || Number.isNaN(direction)) return "N/A";
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const idx = Math.round(direction / 45) % 8;
    return `${dirs[idx]} (${direction.toFixed(0)}°)`;
  };

  return (
    <div className="dashboard">
      <section className="dashboard-controls">
        <form onSubmit={handleSubmit} className="city-form">
          <label htmlFor="city-input">City</label>
          <div className="city-form-row">
            <input
              id="city-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a city (e.g. Rockville)"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </form>
        <p className="dashboard-subtitle">
          Showing current conditions for{" "}
          {weather ? (
            <strong>
              {weather.location.city}
              {weather.location.state ? `, ${weather.location.state}` : ""}
              {weather.location.country
                ? `, ${weather.location.country}`
                : ""}
            </strong>
          ) : (
            <strong>{city}</strong>
          )}
        </p>
        {error && <p className="error-text">{error}</p>}
        {summary && !error && (
          <p className="dashboard-subtitle">
            <strong>AI summary:</strong> {summary}
          </p>
        )}
      </section>

      {weather && (
        <section className="dashboard-grid">
          <WeatherWidget
            title="Temperature"
            value={`${weather.temp.toFixed(1)} °C / ${(
              weather.temp * (9 / 5) +
              32
            ).toFixed(1)} °F`}
            accent="orange"
          />
          <WeatherWidget
            title="Feels like"
            value={`${weather.feelsLike.toFixed(1)} °C`}
            accent="purple"
          />
          <WeatherWidget
            title="Humidity"
            value={`${weather.humidity.toFixed(0)} %`}
            accent="blue"
          />
          <WeatherWidget
            title="Wind speed"
            value={`${weather.windSpeed.toFixed(1)} m/s`}
            accent="green"
          />
          <WeatherWidget
            title="Wind direction"
            value={formatWindDirection(weather.windDirection)}
            accent="blue"
          />
          <WeatherWidget
            title="Rain (chance today)"
            value={
              weather.rainChance != null
                ? `${weather.rainChance.toFixed(0)} %`
                : "N/A"
            }
            accent="purple"
          />
          <WeatherWidget
            title="Today’s forecast"
            value={
              weather.forecastHigh != null && weather.forecastLow != null
                ? `H ${weather.forecastHigh.toFixed(
                    1
                  )} °C / L ${weather.forecastLow.toFixed(1)} °C`
                : "N/A"
            }
            accent="orange"
          />
        </section>
      )}
    </div>
  );
};

