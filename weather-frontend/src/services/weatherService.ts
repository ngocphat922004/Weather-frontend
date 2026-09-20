import type {
    AgricultureRecommendationResponse,
    AirQualityResponse,
    CropPredictionInput,
    CropPredictionResponse,
    CurrentWeatherApiResponse,
    ExtremeWeatherResponse,
    LifestyleRecommendationResponse,
    OverviewRecommendationResponse,
    Weather15DaysApiResponse,
    WeatherAlertsApiResponse,
    WeatherAnalysisSummaryResponse,
    WeatherTrendsApiResponse,
} from '../types/weather';

import apiClient from './apiClient';

import {
    clearRequestCache,
    clearRequestCacheByPrefix,
    requestWithCache,
} from './requestCache';

const ENDPOINTS = {
    current: '/api/weather/current',
    forecast15Days: '/api/weather/15-days',
    alerts: '/api/weather/alerts',

    analysisSummary: '/api/analysis/summary',
    analysisTrends: '/api/analysis/trends',
    analysisExtremes: '/api/analysis/extremes',

    airQuality:
        '/api/recommendations/air-quality',

    lifestyle:
        '/api/recommendations/lifestyle',

    agriculture:
        '/api/recommendations/agriculture',

    overview:
        '/api/recommendations/overview',

    predictCrops:
        '/api/recommendations/predict-crops',
} as const;

function normalizeCity(city: string): string {
    const normalizedCity = city.trim();

    if (!normalizedCity) {
        throw new Error(
            'Vui lòng nhập tên thành phố.',
        );
    }

    return normalizedCity;
}

function createCacheKey(
    resource: string,
    city: string,
): string {
    return `weather:${resource}:${city}`;
}

function createCropPredictionCacheKey(
    payload: CropPredictionInput,
): string {
    const normalizedPayload = {
        temperature: payload.temperature,
        humidity: payload.humidity,
        rainfall: payload.rainfall,
        temp_min:
            payload.temp_min ?? null,
        temp_max:
            payload.temp_max ?? null,
        region_code:
            payload.region_code ?? 'bac_bo',
        season:
            payload.season ?? 'Mùa Mưa',
    };

    return `weather:predict-crops:${JSON.stringify(
        normalizedPayload,
    )}`;
}

async function getCachedWeather<T>(
    resource: string,
    endpoint: string,
    city: string,
    forceRefresh = false,
): Promise<T> {
    void forceRefresh;

    const normalizedCity =
        normalizeCity(city);

    const cacheKey = createCacheKey(
        resource,
        normalizedCity,
    );

    return requestWithCache<T>(
        cacheKey,
        async () => {
            const response =
                await apiClient.get<T>(
                    endpoint,
                    {
                        params: {
                            city: normalizedCity,
                        },
                    },
                );

            return response.data;
        },
    );
}

export function getCurrentWeather(
    city: string,
    forceRefresh = false,
): Promise<CurrentWeatherApiResponse> {
    return getCachedWeather<CurrentWeatherApiResponse>(
        'current',
        ENDPOINTS.current,
        city,
        forceRefresh,
    );
}

export function getWeather15Days(
    city: string,
    forceRefresh = false,
): Promise<Weather15DaysApiResponse> {
    return getCachedWeather<Weather15DaysApiResponse>(
        '15-days',
        ENDPOINTS.forecast15Days,
        city,
        forceRefresh,
    );
}

export function getWeatherAlerts(
    city: string,
    forceRefresh = false,
): Promise<WeatherAlertsApiResponse> {
    return getCachedWeather<WeatherAlertsApiResponse>(
        'alerts',
        ENDPOINTS.alerts,
        city,
        forceRefresh,
    );
}

export function getAnalysisSummary(
    city: string,
    forceRefresh = false,
): Promise<WeatherAnalysisSummaryResponse> {
    return getCachedWeather<WeatherAnalysisSummaryResponse>(
        'analysis-summary',
        ENDPOINTS.analysisSummary,
        city,
        forceRefresh,
    );
}

export function getAnalysisTrends(
    city: string,
    forceRefresh = false,
): Promise<WeatherTrendsApiResponse> {
    return getCachedWeather<WeatherTrendsApiResponse>(
        'analysis-trends',
        ENDPOINTS.analysisTrends,
        city,
        forceRefresh,
    );
}

export function getExtremeWeather(
    city: string,
    forceRefresh = false,
): Promise<ExtremeWeatherResponse> {
    return getCachedWeather<ExtremeWeatherResponse>(
        'analysis-extremes',
        ENDPOINTS.analysisExtremes,
        city,
        forceRefresh,
    );
}

export function getAirQuality(
    city: string,
    forceRefresh = false,
): Promise<AirQualityResponse> {
    return getCachedWeather<AirQualityResponse>(
        'air-quality',
        ENDPOINTS.airQuality,
        city,
        forceRefresh,
    );
}

export function getLifestyleRecommendations(
    city: string,
    forceRefresh = false,
): Promise<LifestyleRecommendationResponse> {
    return getCachedWeather<LifestyleRecommendationResponse>(
        'lifestyle',
        ENDPOINTS.lifestyle,
        city,
        forceRefresh,
    );
}

export function getAgricultureRecommendations(
    city: string,
    forceRefresh = false,
): Promise<AgricultureRecommendationResponse> {
    return getCachedWeather<AgricultureRecommendationResponse>(
        'agriculture',
        ENDPOINTS.agriculture,
        city,
        forceRefresh,
    );
}

export function getOverview(
    city: string,
    forceRefresh = false,
): Promise<OverviewRecommendationResponse> {
    return getCachedWeather<OverviewRecommendationResponse>(
        'overview',
        ENDPOINTS.overview,
        city,
        forceRefresh,
    );
}

export function predictCrops(
    payload: CropPredictionInput,
    forceRefresh = false,
): Promise<CropPredictionResponse> {
    void forceRefresh;

    const normalizedPayload:
        CropPredictionInput = {
        temperature: payload.temperature,
        humidity: payload.humidity,
        rainfall: payload.rainfall,
        temp_min:
            payload.temp_min ?? null,
        temp_max:
            payload.temp_max ?? null,
        region_code:
            payload.region_code ?? 'bac_bo',
        season:
            payload.season ?? 'Mùa Mưa',
    };

    const cacheKey =
        createCropPredictionCacheKey(
            normalizedPayload,
        );

    return requestWithCache<CropPredictionResponse>(
        cacheKey,
        async () => {
            const response =
                await apiClient.post<CropPredictionResponse>(
                    ENDPOINTS.predictCrops,
                    normalizedPayload,
                );

            return response.data;
        },
    );
}

export function clearCityWeatherCache(
    city: string,
): void {
    const normalizedCity =
        normalizeCity(city).toLowerCase();

    const resources = [
        'current',
        '15-days',
        'alerts',
        'analysis-summary',
        'analysis-trends',
        'analysis-extremes',
        'air-quality',
        'lifestyle',
        'agriculture',
        'overview',
    ];

    resources.forEach((resource) => {
        clearRequestCache(
            createCacheKey(
                resource,
                normalizedCity,
            ),
        );
    });
}

export function clearCropPredictionCache(
    payload: CropPredictionInput,
): void {
    clearRequestCache(
        createCropPredictionCacheKey(
            payload,
        ),
    );
}

export function clearAllWeatherCache(): void {
    clearRequestCacheByPrefix(
        'weather:',
    );
}

export const weatherService = {
    getCurrentWeather,
    getWeather15Days,
    getWeatherAlerts,

    getAnalysisSummary,
    getAnalysisTrends,
    getExtremeWeather,

    getAirQuality,
    getLifestyleRecommendations,
    getAgricultureRecommendations,
    getOverview,
    predictCrops,

    clearCityWeatherCache,
    clearCropPredictionCache,
    clearAllWeatherCache,
};

export default weatherService;