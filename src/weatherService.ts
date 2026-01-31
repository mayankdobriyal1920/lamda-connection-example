import axios, { AxiosInstance } from "axios";
import {
  StructuredError,
  WeatherInput,
  WeatherOutput,
  WeatherSuccess,
} from "./types";

const CACHE_TTL_MS = 60_000;

interface CachedEntry {
  data: WeatherSuccess;
  expiresAt: number;
}

export class WeatherService {
  private cache = new Map<string, CachedEntry>();

  constructor(private readonly client: AxiosInstance = axios) {}

  private kelvinToCelsius(kelvin: number): number {
    return Math.round((kelvin - 273.15) * 100) / 100;
  }

  private buildUrl(city: string): string {
    const encoded = encodeURIComponent(city);
    return `https://api.openweathermap.org/data/2.5/weather?q=${encoded}&appid=82f661980014b5dbe9cc60e5995e7eab`;
  }

  private buildErrorMessage(error: unknown): string {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as any).response?.status
    ) {
      const status = (error as any).response.status;
      if (status === 404) {
        return "City not found (404)";
      }
      if (status === 429) {
        return "Rate limited by weather API (429)";
      }
      return `Weather API error (status ${status})`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "Unknown error calling weather API";
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private shouldRetry(error: unknown): boolean {
    const status = (error as any)?.response?.status;
    return (
      status === undefined || status >= 500 || status === 429 || status === 408
    );
  }

  private getCached(city: string): WeatherSuccess | undefined {
    const entry = this.cache.get(city.toLowerCase());
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }
    return undefined;
  }

  private setCache(city: string, data: WeatherSuccess): void {
    this.cache.set(city.toLowerCase(), {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  async fetchWeather(event: WeatherInput): Promise<WeatherOutput> {
    const city = event.city?.trim();
    if (!city) {
      const error: StructuredError = {
        error: "VALIDATION_ERROR",
        message: "City is required",
      };
      return error;
    }

    const cached = this.getCached(city);
    if (cached) {
      return cached;
    }

    const maxAttempts = 3;
    let attempt = 0;
    let lastError: unknown;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const response = await this.client.get(this.buildUrl(city));
        const body = response.data;
        const tempK = body?.main?.temp;
        if (typeof tempK !== "number") {
          throw new Error("Temperature missing from API response");
        }

        const conditions =
          body?.weather?.[0]?.main ||
          body?.weather?.[0]?.description ||
          "Unknown";

        const result: WeatherSuccess = {
          city: body?.name || city,
          temp: this.kelvinToCelsius(tempK),
          conditions,
        };

        this.setCache(city, result);
        return result;
      } catch (error) {
        lastError = error;
        console.error(
          `Weather fetch failed (attempt ${attempt}/${maxAttempts}):`,
          error instanceof Error ? error.message : String(error),
        );

        if (attempt >= maxAttempts || !this.shouldRetry(error)) {
          break;
        }

        const delay = 1000 * 2 ** (attempt - 1); // 1s -> 2s
        await this.sleep(delay);
      }
    }

    const apiError: StructuredError = {
      error: "API_ERROR",
      message: this.buildErrorMessage(lastError),
    };
    return apiError;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

const defaultService = new WeatherService();

export const weatherHandler = async (
  event: WeatherInput,
): Promise<WeatherOutput> => defaultService.fetchWeather(event);

export const clearWeatherCache = (): void => {
  defaultService.clearCache();
};
