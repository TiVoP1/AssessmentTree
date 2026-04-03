import { config } from '#src/config/index.js';

interface WeatherstackLocation {
  lat: string;
  lon: string;
}

export interface WeatherstackCurrentData extends Record<string, unknown> {
  observation_time: string;
  temperature: number;
  weather_code: number;
  weather_icons: string[];
  weather_descriptions: string[];
  wind_speed: number;
  wind_degree: number;
  wind_dir: string;
  pressure: number;
  precip: number;
  humidity: number;
  cloudcover: number;
  feelslike: number;
  uv_index: number;
  visibility: number;
}

interface WeatherstackResponse {
  success?: boolean;
  error?: { code: number; info: string };
  location: WeatherstackLocation;
  current: WeatherstackCurrentData;
}

export interface WeatherResult {
  lat: number;
  long: number;
  current: WeatherstackCurrentData;
}

export async function fetchWeatherForLocation(zipCode: string): Promise<WeatherResult> {
  const query = `${zipCode},US`;

  const url = new URL(config.weatherstack.baseUrl);
  url.searchParams.set('access_key', config.weatherstack.apiKey);
  url.searchParams.set('query', query);
  url.searchParams.set('units', 'f');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Weatherstack API returned status ${response.status.toString()}`);
  }

  const data = (await response.json()) as WeatherstackResponse;

  if (data.success === false && data.error) {
    throw new Error(`Weatherstack API error: ${data.error.info}`);
  }

  return {
    lat: parseFloat(data.location.lat),
    long: parseFloat(data.location.lon),
    current: data.current,
  };
}
