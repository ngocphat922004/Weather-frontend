import { createContext } from 'react';

import type {
    CurrentWeatherApiResponse,
    Weather15DaysApiResponse,
} from '../types/weather';

export interface WeatherContextValue {
    city: string;

    currentWeather:
    | CurrentWeatherApiResponse
    | null;

    weather15Days:
    | Weather15DaysApiResponse
    | null;

    loading: boolean;
    error: string | null;

    changeCity: (city: string) => void;
    refreshWeather: () => Promise<void>;
}

export const WeatherContext =
    createContext<WeatherContextValue | null>(null);