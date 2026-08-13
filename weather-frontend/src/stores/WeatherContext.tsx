import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import weatherService from '../services/weatherService';

import type {
  CurrentWeatherApiResponse,
  Weather15DaysApiResponse,
} from '../types/weather';

import {
  WeatherContext,
  type WeatherContextValue,
} from './weatherContextDefinition';

interface WeatherProviderProps {
  children: ReactNode;
}

const DEFAULT_CITY = 'Ho Chi Minh City';

export function WeatherProvider({
  children,
}: WeatherProviderProps) {
  const [city, setCity] =
    useState<string>(DEFAULT_CITY);

  const [currentWeather, setCurrentWeather] =
    useState<CurrentWeatherApiResponse | null>(
      null,
    );

  const [weather15Days, setWeather15Days] =
    useState<Weather15DaysApiResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadWeather = useCallback(
    async (selectedCity: string) => {
      try {
        setLoading(true);
        setError(null);

        const [
          currentWeatherResponse,
          weather15DaysResponse,
        ] = await Promise.all([
          weatherService.getCurrentWeather(
            selectedCity,
          ),

          weatherService.getWeather15Days(
            selectedCity,
          ),
        ]);

        setCurrentWeather(
          currentWeatherResponse,
        );

        setWeather15Days(
          weather15DaysResponse,
        );
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Không thể tải dữ liệu thời tiết.';

        setError(message);
        setCurrentWeather(null);
        setWeather15Days(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadWeather(city);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [city, loadWeather]);

  const changeCity = useCallback(
    (newCity: string) => {
      const normalizedCity = newCity.trim();

      if (
        !normalizedCity ||
        normalizedCity === city
      ) {
        return;
      }

      setCity(normalizedCity);
    },
    [city],
  );

  const refreshWeather =
    useCallback(async () => {
      await loadWeather(city);
    }, [city, loadWeather]);

  const contextValue =
    useMemo<WeatherContextValue>(
      () => ({
        city,
        currentWeather,
        weather15Days,
        loading,
        error,
        changeCity,
        refreshWeather,
      }),
      [
        city,
        currentWeather,
        weather15Days,
        loading,
        error,
        changeCity,
        refreshWeather,
      ],
    );

  return (
    <WeatherContext.Provider
      value={contextValue}
    >
      {children}
    </WeatherContext.Provider>
  );
}