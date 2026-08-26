export type JsonPrimitive =
    | string
    | number
    | boolean
    | null;

export type JsonValue =
    | JsonPrimitive
    | JsonObject
    | JsonValue[];

export interface JsonObject {
    [key: string]: JsonValue;
}

export interface ValidationErrorItem {
    loc: Array<string | number>;
    msg: string;
    type: string;
    input?: JsonValue;
    ctx?: JsonObject;
}

export interface ApiErrorResponse {
    detail?: string | ValidationErrorItem[];
    message?: string;
}

export interface WeatherCityParams {
    city: string;
}

export interface LocationData {
    name: string;
    lat: number;
    lon: number;
    country?: string | null;
    state?: string | null;
    timezone?: string | null;
}

export interface BaseApiResponse {
    success: boolean;
    location: LocationData;
}

/*
 * Swagger chưa khai báo chi tiết cấu trúc bên trong
 * của Current Weather và Forecast 15 Days.
 *
 * Dùng JsonObject thay cho any để vẫn bảo đảm an toàn kiểu.
 */
export type CurrentWeatherApiResponse =
    JsonObject;

export type Weather15DaysApiResponse =
    JsonObject;

export type WeatherAlertsApiResponse =
    JsonObject;

export type WeatherTrendsApiResponse =
    JsonObject;

export interface WeatherAlertItem {
    date: string;
    type: string;
    level: string;
    message: string;
    advice?: string | null;
}

export interface ExtremeWeatherResponse
    extends BaseApiResponse {
    overall_severity: string;
    total_alerts: number;
    summary: string;
    alerts: WeatherAlertItem[];
    historical_comparison?: JsonObject | null;
}

export interface WeatherAnalysisSummaryResponse
    extends BaseApiResponse {
    period: JsonObject;
    analysis: JsonObject;
    comparison_trend?: JsonObject | null;
}

export interface AirQualityResponse
    extends BaseApiResponse {
    air_quality: JsonObject;
}

export interface LifestyleRecommendationResponse
    extends BaseApiResponse {
    lifestyle_recommendations: JsonObject;
}

export interface AgricultureRecommendationResponse
    extends BaseApiResponse {
    agriculture_recommendations: JsonObject;
}

export interface OverviewRecommendationResponse
    extends BaseApiResponse {
    current_weather: JsonObject;
    air_quality: JsonObject;
    extreme_alerts: JsonObject;
    lifestyle_recommendations: JsonObject;
    agriculture_recommendations: JsonObject;
}