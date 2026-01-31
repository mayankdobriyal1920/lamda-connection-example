import axios from "axios";
import {
  WeatherService,
  weatherHandler,
  clearWeatherCache,
} from "../src/weatherService";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("weather service", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    clearWeatherCache();
    jest.clearAllMocks();
    jest.useRealTimers();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("returns simplified weather data on success", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        name: "London",
        main: { temp: 285.15 },
        weather: [{ main: "Rain", description: "light rain" }],
      },
    });

    const result = await weatherHandler({ city: "London" });

    expect(result).toEqual({
      city: "London",
      temp: 12,
      conditions: "Rain",
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("caches responses for 1 minute", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        name: "Paris",
        main: { temp: 300 },
        weather: [{ main: "Clouds" }],
      },
    });

    const service = new WeatherService(mockedAxios as any);

    const first = await service.fetchWeather({ city: "Paris" });
    const second = await service.fetchWeather({ city: "Paris" });

    expect(first).toEqual(second);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("retries failed calls with exponential backoff", async () => {
    jest.useFakeTimers();
    mockedAxios.get
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockResolvedValueOnce({
        data: {
          name: "Berlin",
          main: { temp: 280 },
          weather: [{ main: "Clear" }],
        },
      });

    const promise = weatherHandler({ city: "Berlin" });

    await jest.runAllTimersAsync();
    const result = await promise;

    expect(result).toEqual({
      city: "Berlin",
      temp: 6.85,
      conditions: "Clear",
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
  });

  it("returns structured error on validation issues", async () => {
    const result = await weatherHandler({ city: "" });
    expect(result).toEqual({
      error: "VALIDATION_ERROR",
      message: "City is required",
    });
  });

  it("returns structured error on API failure after retries", async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 404 },
    });

    const result = await weatherHandler({ city: "Nowhere" });

    expect(result).toEqual({
      error: "API_ERROR",
      message: "City not found (404)",
    });
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });
});
