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

import weatherMockData from '../mocks/weatherMockData';

import apiClient, {
    isWeatherApiUnavailableError,
} from './apiClient';

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

const USE_MOCK_API =
    import.meta.env.VITE_USE_MOCK_API === 'true';

const ENABLE_MOCK_FALLBACK =
    import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false';

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

async function getApiOrMock<T>(
    apiRequest: () => Promise<T>,
    mockFactory: () => T,
): Promise<T> {
    if (USE_MOCK_API) {
        return mockFactory();
    }

    try {
        return await apiRequest();
    } catch (error: unknown) {
        if (
            ENABLE_MOCK_FALLBACK &&
            isWeatherApiUnavailableError(error)
        ) {
            console.warn(
                '[Weather] API không khả dụng, chuyển sang mock data.',
                error,
            );

            return mockFactory();
        }

        throw error;
    }
}

async function getCachedWeather<T>(
    resource: string,
    endpoint: string,
    city: string,
    mockFactory: (city: string) => T,
    forceRefresh = false,
): Promise<T> {
    const normalizedCity =
        normalizeCity(city);

    if (USE_MOCK_API) {
        return mockFactory(normalizedCity);
    }

    const cacheKey = createCacheKey(
        resource,
        normalizedCity,
    );

    if (forceRefresh) {
        clearRequestCache(cacheKey);
    }

    return requestWithCache<T>(
        cacheKey,
        () =>
            getApiOrMock<T>(
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
                () => mockFactory(normalizedCity),
            ),
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
        weatherMockData.current,
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
        weatherMockData.forecast15Days,
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
        weatherMockData.alerts,
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
        weatherMockData.analysisSummary,
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
        weatherMockData.analysisTrends,
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
        weatherMockData.extremes,
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
        weatherMockData.airQuality,
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
        weatherMockData.lifestyle,
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
        weatherMockData.agriculture,
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
        weatherMockData.overview,
        forceRefresh,
    );
}

export function predictCrops(
    payload: CropPredictionInput,
    forceRefresh = false,
): Promise<CropPredictionResponse> {
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

    if (USE_MOCK_API) {
        return Promise.resolve(
            weatherMockData.predictCrops(
                normalizedPayload,
            ),
        );
    }

    const cacheKey =
        createCropPredictionCacheKey(
            normalizedPayload,
        );

    if (forceRefresh) {
        clearRequestCache(cacheKey);
    }

    return requestWithCache<CropPredictionResponse>(
        cacheKey,
        () =>
            getApiOrMock<CropPredictionResponse>(
                async () => {
                    const response =
                        await apiClient.post<CropPredictionResponse>(
                            ENDPOINTS.predictCrops,
                            normalizedPayload,
                        );

                    return response.data;
                },
                () =>
                    weatherMockData.predictCrops(
                        normalizedPayload,
                    ),
            ),
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