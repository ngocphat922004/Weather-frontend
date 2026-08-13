import type {
    CurrentWeatherApiResponse,
    Weather15DaysApiResponse,
    WeatherCityParams,
} from '../types/weather';

import apiClient from './apiClient';

const CURRENT_WEATHER_ENDPOINT =
    '/api/weather/current';

const WEATHER_15_DAYS_ENDPOINT =
    '/api/weather/15-days';

export async function getCurrentWeather(
    city: string,
): Promise<CurrentWeatherApiResponse> {
    const params: WeatherCityParams = { city };

    const response =
        await apiClient.get<CurrentWeatherApiResponse>(
            CURRENT_WEATHER_ENDPOINT,
            { params },
        );

    return response.data;
}

export async function getWeather15Days(
    city: string,
): Promise<Weather15DaysApiResponse> {
    const params: WeatherCityParams = { city };

    const response =
        await apiClient.get<Weather15DaysApiResponse>(
            WEATHER_15_DAYS_ENDPOINT,
            { params },
        );

    return response.data;
}

export const weatherService = {
    getCurrentWeather,
    getWeather15Days,
};

export default weatherService;