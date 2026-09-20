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

export interface FallbackApiResponse {
    is_fallback?: boolean;
    fallback_warning?: string | null;
}

export interface CurrentWeatherData {
    temperature: number | null;
    feels_like: number | null;
    humidity: number | null;
    precipitation: number | null;
    wind_speed: number | null;
    weather_code: number | null;
}

export interface CurrentWeatherApiResponse
    extends FallbackApiResponse {
    success: boolean;
    is_fallback: boolean;
    fallback_warning: string | null;
    cached_at: string | null;
    location: LocationData;
    current: CurrentWeatherData;
}

export interface WeatherTemperatureRange {
    max: number | null;
    min: number | null;
}

export interface WeatherDailyItem {
    date: string;
    temperature: WeatherTemperatureRange;
    feels_like: WeatherTemperatureRange;
    humidity: number | null;
    precipitation: number | null;
    rain: number | null;
    rain_probability: number | null;
    wind_speed: number | null;
    weather_code: number | null;
}

export interface WeatherPeriod {
    past_days: number;
    today: number;
    future_days: number;
    total_days: number;
}

export interface TemperatureAnalysis {
    avg_temp: number;
    max_temp: number;
    min_temp: number;
    temp_amplitude_avg: number;
    trend: string;
    trend_description: string;
}

export interface ApparentTemperatureAnalysis {
    avg_feels_like: number;
    max_feels_like: number;
    min_feels_like: number;
}

export interface PrecipitationAnalysis {
    total_rain: number;
    avg_rain: number;
    rainy_days_count: number;
    rainy_days_ratio: number;
    max_rain_day: string | null;
    max_rain_amount: number;
    rain_evaluation: string;
}

export interface WindAnalysis {
    max_wind_speed: number;
    avg_wind_speed: number;
    min_wind_speed: number;
    wind_scale_level: number;
    wind_category: string;
    unit: string;
}

export interface HumidityAnalysis {
    avg_humidity: number;
    max_humidity: number;
    min_humidity: number;
    evaluation: string;
}

export interface WeatherAnalysisData {
    temperature_analysis?: TemperatureAnalysis;
    apparent_temperature_analysis?: ApparentTemperatureAnalysis;
    precipitation_analysis?: PrecipitationAnalysis;
    wind_analysis?: WindAnalysis;
    humidity_analysis?: HumidityAnalysis;
}

export interface TemperatureTrendComparison {
    history_avg: number;
    forecast_avg: number;
    difference: number;
    trend: string;
}

export interface PrecipitationTrendComparison {
    history_total: number;
    forecast_total: number;
    difference: number;
    trend: string;
}

export interface HumidityTrendComparison {
    history_avg: number;
    forecast_avg: number;
    difference: number;
    trend: string;
}

export interface WindTrendComparison {
    history_avg_speed: number;
    forecast_avg_speed: number;
    difference: number;
    trend: string;
}

export interface WeatherTrendComparison {
    temperature?: TemperatureTrendComparison;
    precipitation?: PrecipitationTrendComparison;
    humidity?: HumidityTrendComparison;
    wind?: WindTrendComparison;
    overall_trend_summary?: string;
    error?: string;
}

export interface Weather15DaysApiResponse {
    success: boolean;
    is_fallback: boolean;
    fallback_warning: string | null;
    cached_at: string | null;
    location: LocationData;
    period: WeatherPeriod;
    analysis: WeatherAnalysisData;
    comparison_trend: WeatherTrendComparison;
    daily: WeatherDailyItem[];
}

export interface WeatherAlertItem {
    date: string;
    type: string;
    level: string;
    message: string;
    advice?: string | null;
}

export interface HistoricalWeatherComparison {
    historical_temp_avg?: number;
    current_temp_avg?: number;
    temperature_deviation?: number;
    temperature_status?: string;
    historical_rain_total?: number;
    current_rain_total?: number;
    rain_deviation?: number;
    rain_status?: string;
}

export interface ExtremeWeatherData {
    overall_severity: string;
    total_alerts: number;
    summary: string;
    alerts: WeatherAlertItem[];
    historical_comparison?: HistoricalWeatherComparison;
}

export interface WeatherAlertsApiResponse {
    success: boolean;
    message?: string;
    location?: {
        name: string;
        country: string;
    };
    alerts_data?: ExtremeWeatherData;
}

export interface WeatherTrendsApiResponse
    extends BaseApiResponse {
    trend_comparison: WeatherTrendComparison;
}

export interface ExtremeWeatherResponse
    extends BaseApiResponse,
    ExtremeWeatherData { }

export interface WeatherAnalysisSummaryResponse
    extends BaseApiResponse {
    period: WeatherPeriod;
    analysis: WeatherAnalysisData;
    comparison_trend: WeatherTrendComparison;
}

export interface AirQualityResponse
    extends BaseApiResponse,
    FallbackApiResponse {
    air_quality: JsonObject;
}

export interface LifestyleRecommendationResponse
    extends BaseApiResponse,
    FallbackApiResponse {
    lifestyle_recommendations: JsonObject;
}

export interface AgricultureRecommendationResponse
    extends BaseApiResponse,
    FallbackApiResponse {
    agriculture_recommendations: JsonObject;
}

export interface OverviewRecommendationResponse
    extends BaseApiResponse,
    FallbackApiResponse {
    current_weather: JsonObject;
    air_quality: JsonObject;
    extreme_alerts: JsonObject;
    lifestyle_recommendations: JsonObject;
    agriculture_recommendations: JsonObject;
}

export interface CropPredictionInput {
    temperature: number;
    humidity: number;
    rainfall: number;
    temp_min?: number | null;
    temp_max?: number | null;
    region_code?: string;
    season?: string;
}

export interface CropEvaluationItem {
    crop_id: string;
    name: string;
    category: string;
    icon: string;
    suitability_score: number;
    fit_level: string;
    reasons: string[];
    care_tips: string;
    disease_risk: string;
}

export interface AgriculturalWeatherRisk {
    risk: string;
    severity: string;
    message: string;
}

export interface AgricultureLocationInfo {
    city: string;
    region: string;
    climate_type: string;
    current_season: string;
    season_description: string;
}

export interface AgricultureWeatherSummary {
    avg_temperature: number;
    min_temperature: number;
    max_temperature: number;
    avg_humidity: number;
    total_rain_15d: number;
    estimated_monthly_rain: number;
}

export interface CropPredictionResult {
    location_info: AgricultureLocationInfo;
    weather_summary: AgricultureWeatherSummary;
    irrigation_and_soil_plan: string;
    agricultural_weather_risks: AgriculturalWeatherRisk[];
    top_recommended_crops: CropEvaluationItem[];
    all_crops_evaluation: CropEvaluationItem[];
}

export interface CropPredictionResponse {
    success: boolean;
    input: CropPredictionInput;
    prediction_results: CropPredictionResult;
}