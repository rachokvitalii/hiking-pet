import { z } from "zod";

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const weatherCodeLabels: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const openMeteoDailyForecastSchema = z.object({
  time: z.array(z.string()),
  weather_code: z.array(z.number()),
  temperature_2m_max: z.array(z.number()),
  temperature_2m_min: z.array(z.number()),
  apparent_temperature_max: z.array(z.number()),
  apparent_temperature_min: z.array(z.number()),
  precipitation_sum: z.array(z.number()),
  precipitation_probability_max: z.array(z.number().nullable()),
  wind_speed_10m_max: z.array(z.number()),
  wind_gusts_10m_max: z.array(z.number()),
  uv_index_max: z.array(z.number().nullable()),
});

const openMeteoForecastSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
  daily: openMeteoDailyForecastSchema,
});

export type WeatherForecastInput = {
  latitude: number;
  longitude: number;
  days?: number;
};

export type WeatherForecastDay = {
  date: string;
  condition: string;
  temperatureMinC: number;
  temperatureMaxC: number;
  apparentTemperatureMinC: number;
  apparentTemperatureMaxC: number;
  precipitationMm: number;
  precipitationProbabilityPct: number | null;
  windSpeedMaxKmh: number;
  windGustsMaxKmh: number;
  uvIndexMax: number | null;
};

export type WeatherForecastForLLM = {
  provider: "open-meteo";
  location: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
  forecastDays: WeatherForecastDay[];
  llmContext: string;
};

export async function getWeatherForecastForLLM({
  latitude,
  longitude,
  days = 7,
}: WeatherForecastInput): Promise<WeatherForecastForLLM> {
  const forecastDays = clampForecastDays(days);
  const url = buildOpenMeteoUrl({ latitude, longitude, days: forecastDays });
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Open-Meteo forecast request failed: ${response.status}`);
  }

  const parsed = openMeteoForecastSchema.parse(await response.json());
  const dailyForecast = normalizeDailyForecast(parsed.daily);

  return {
    provider: "open-meteo",
    location: {
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      timezone: parsed.timezone,
    },
    forecastDays: dailyForecast,
    llmContext: buildWeatherLLMContext(dailyForecast),
  };
}

function buildOpenMeteoUrl({
  latitude,
  longitude,
  days,
}: Required<WeatherForecastInput>) {
  const url = new URL(OPEN_METEO_FORECAST_URL);

  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("forecast_days", String(days));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "wind_gusts_10m_max",
      "uv_index_max",
    ].join(","),
  );

  return url;
}

function normalizeDailyForecast(
  daily: z.infer<typeof openMeteoDailyForecastSchema>,
): WeatherForecastDay[] {
  return daily.time.map((date, index) => ({
    date,
    condition: weatherCodeLabels[daily.weather_code[index] ?? -1] ?? "Unknown",
    temperatureMinC: daily.temperature_2m_min[index] ?? 0,
    temperatureMaxC: daily.temperature_2m_max[index] ?? 0,
    apparentTemperatureMinC: daily.apparent_temperature_min[index] ?? 0,
    apparentTemperatureMaxC: daily.apparent_temperature_max[index] ?? 0,
    precipitationMm: daily.precipitation_sum[index] ?? 0,
    precipitationProbabilityPct:
      daily.precipitation_probability_max[index] ?? null,
    windSpeedMaxKmh: daily.wind_speed_10m_max[index] ?? 0,
    windGustsMaxKmh: daily.wind_gusts_10m_max[index] ?? 0,
    uvIndexMax: daily.uv_index_max[index] ?? null,
  }));
}

function buildWeatherLLMContext(days: WeatherForecastDay[]) {
  return days
    .map((day) => {
      const precipitationProbability =
        day.precipitationProbabilityPct === null
          ? "unknown"
          : `${day.precipitationProbabilityPct}%`;
      const uvIndex =
        day.uvIndexMax === null ? "unknown" : String(day.uvIndexMax);

      return [
        `${day.date}: ${day.condition}`,
        `temp ${day.temperatureMinC}-${day.temperatureMaxC}C`,
        `feels ${day.apparentTemperatureMinC}-${day.apparentTemperatureMaxC}C`,
        `precipitation ${day.precipitationMm}mm`,
        `precipitation probability ${precipitationProbability}`,
        `max wind ${day.windSpeedMaxKmh}km/h`,
        `gusts ${day.windGustsMaxKmh}km/h`,
        `UV ${uvIndex}`,
      ].join("; ");
    })
    .join("\n");
}

function clampForecastDays(days: number) {
  return Math.max(1, Math.min(Math.trunc(days), 16));
}
