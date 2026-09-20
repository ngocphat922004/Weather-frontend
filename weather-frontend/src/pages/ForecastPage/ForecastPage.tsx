import { Droplets, RefreshCw, Thermometer, Umbrella, Wind } from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

import RainfallChart, {
  type RainfallChartItem,
} from "../../components/charts/RainfallChart";

import TemperatureChart, {
  type TemperatureChartItem,
} from "../../components/charts/TemperatureChart";

import PageHeader from "../../components/common/PageHeader";
import ErrorState from "../../components/states/ErrorState";
import LoadingSkeleton from "../../components/states/LoadingSkeleton";
import CurrentWeatherCard from "../../components/weather/CurrentWeatherCard";
import ExtremeWeatherAlert from "../../components/weather/ExtremeWeatherAlert";
import WeatherMetricCard from "../../components/weather/WeatherMetricCard";

import WeeklyForecast, {
  type WeeklyForecastItem,
} from "../../components/weather/WeeklyForecast";

import { useWeather } from "../../hooks/useWeather";

import weatherService from "../../services/weatherService";

import type {
  CurrentWeatherApiResponse,
  Weather15DaysApiResponse,
  WeatherAlertItem,
  WeatherAlertsApiResponse,
  WeatherDailyItem,
} from "../../types/weather";

import {
  formatDate,
  formatPercentage,
  formatRainfall,
  formatShortDate,
  formatTemperature,
  formatTime,
  formatWindSpeed,
  getWeatherDescription,
} from "../../utils/formatters";

import "./ForecastPage.scss";

interface ForecastPageData {
  current: CurrentWeatherApiResponse | null;
  forecast: Weather15DaysApiResponse | null;
  alerts: WeatherAlertsApiResponse | null;
}

type AlertSeverity = "safe" | "info" | "warning" | "danger";

function getErrorMessage(reason: unknown): string {
  return reason instanceof Error
    ? reason.message
    : "Không thể tải dữ liệu dự báo.";
}

function getTodayWeather(
  forecast: Weather15DaysApiResponse | null,
): WeatherDailyItem | undefined {
  if (!forecast) {
    return undefined;
  }

  return forecast.daily[forecast.period.past_days];
}

function getFutureWeather(
  forecast: Weather15DaysApiResponse | null,
): WeatherDailyItem[] {
  if (!forecast) {
    return [];
  }

  const startIndex = forecast.period.past_days + forecast.period.today;

  return forecast.daily.slice(
    startIndex,
    startIndex + forecast.period.future_days,
  );
}

function buildWeeklyItems(items: WeatherDailyItem[]): WeeklyForecastItem[] {
  return items.map((item, index) => ({
    id: `${item.date}-${index}`,

    dayLabel: formatDate(item.date, {
      weekday: "long",
    }),

    dateLabel: formatShortDate(item.date),

    minimumTemperature:
      item.temperature.min === null
        ? "—"
        : formatTemperature(item.temperature.min),

    maximumTemperature:
      item.temperature.max === null
        ? "—"
        : formatTemperature(item.temperature.max),

    precipitation:
      item.rain_probability === null
        ? undefined
        : formatPercentage(item.rain_probability),

    weatherCode: item.weather_code === null ? undefined : item.weather_code,
  }));
}

function buildTemperatureChart(
  items: WeatherDailyItem[],
): TemperatureChartItem[] {
  return items
    .filter((item) => item.temperature.max !== null)
    .map((item) => ({
      label: formatDate(item.date, {
        day: "2-digit",
        month: "2-digit",
      }),

      temperature: item.temperature.max as number,
    }));
}

function buildRainfallChart(items: WeatherDailyItem[]): RainfallChartItem[] {
  return items
    .filter((item) => item.precipitation !== null)
    .map((item) => ({
      label: formatDate(item.date, {
        day: "2-digit",
        month: "2-digit",
      }),

      rainfall: item.precipitation as number,
    }));
}

function mapAlertSeverity(level?: string): AlertSeverity {
  switch (level?.toUpperCase()) {
    case "CRITICAL":
      return "danger";

    case "WARNING":
      return "warning";

    case "INFO":
      return "info";

    case "SAFE":
      return "safe";

    default:
      return "warning";
  }
}

function getPrimaryAlert(
  alerts: WeatherAlertsApiResponse | null,
): WeatherAlertItem | undefined {
  return alerts?.alerts_data?.alerts?.[0];
}

function getAverageRangeValue(
  maximum: number | null | undefined,
  minimum: number | null | undefined,
): number | undefined {
  if (
    maximum !== null &&
    maximum !== undefined &&
    minimum !== null &&
    minimum !== undefined
  ) {
    return (maximum + minimum) / 2;
  }

  return maximum ?? minimum ?? undefined;
}

function ForecastPage() {
  const { city } = useWeather();

  const [data, setData] = useState<ForecastPageData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const requestSequence = useRef(0);

  const loadForecast = useCallback(
    async (forceRefresh = false) => {
      const currentRequest = ++requestSequence.current;

      try {
        setLoading(true);
        setError(null);

        const results = await Promise.allSettled([
          weatherService.getWeather15Days(city, forceRefresh),

          weatherService.getCurrentWeather(city, forceRefresh),

          weatherService.getWeatherAlerts(city, forceRefresh),
        ]);

        if (currentRequest !== requestSequence.current) {
          return;
        }

        const [forecastResult, currentResult, alertsResult] = results;

        const nextData: ForecastPageData = {
          forecast:
            forecastResult.status === "fulfilled" ? forecastResult.value : null,

          current:
            currentResult.status === "fulfilled" ? currentResult.value : null,

          alerts:
            alertsResult.status === "fulfilled" ? alertsResult.value : null,
        };

        const successfulRequests = results.filter(
          (result) => result.status === "fulfilled",
        ).length;

        if (successfulRequests === 0) {
          const firstFailure = results.find(
            (result) => result.status === "rejected",
          );

          throw new Error(
            firstFailure?.status === "rejected"
              ? getErrorMessage(firstFailure.reason)
              : "Không thể tải dữ liệu dự báo.",
          );
        }

        setData(nextData);

        if (successfulRequests < 3) {
          setError(
            "Một phần dữ liệu dự báo chưa thể tải. Các nội dung còn lại vẫn được hiển thị.",
          );
        }
      } catch (requestError: unknown) {
        if (currentRequest !== requestSequence.current) {
          return;
        }

        setData(null);

        setError(getErrorMessage(requestError));
      } finally {
        if (currentRequest === requestSequence.current) {
          setLoading(false);
        }
      }
    },
    [city],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadForecast();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      requestSequence.current += 1;
    };
  }, [loadForecast]);

  if (loading && !data) {
    return (
      <div className="page-container">
        <LoadingSkeleton
          variant="page"
          message="Đang tải dự báo thời tiết..."
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-container">
        <ErrorState
          title="Không thể tải dự báo"
          message={error ?? "Không có dữ liệu dự báo."}
          onRetry={() => {
            void loadForecast(true);
          }}
        />
      </div>
    );
  }

  const current = data.current;

  const forecast = data.forecast;

  const todayWeather = getTodayWeather(forecast);

  const futureWeather = getFutureWeather(forecast);

  const weeklyItems = buildWeeklyItems(futureWeather);

  const temperatureChart = buildTemperatureChart(futureWeather);

  const rainfallChart = buildRainfallChart(futureWeather);

  const primaryAlert = getPrimaryAlert(data.alerts);

  const locationName =
    current?.location.name ?? forecast?.location.name ?? city;

  const fallbackTemperature = getAverageRangeValue(
    todayWeather?.temperature.max,
    todayWeather?.temperature.min,
  );

  const fallbackFeelsLike = getAverageRangeValue(
    todayWeather?.feels_like.max,
    todayWeather?.feels_like.min,
  );

  const temperature = current?.current.temperature ?? fallbackTemperature;

  const feelsLike = current?.current.feels_like ?? fallbackFeelsLike;

  const humidity = current?.current.humidity ?? todayWeather?.humidity;

  const windSpeed = current?.current.wind_speed ?? todayWeather?.wind_speed;

  const rainfall =
    current?.current.precipitation ?? todayWeather?.precipitation;

  const rainProbability = todayWeather?.rain_probability;

  const weatherCode =
    current?.current.weather_code ?? todayWeather?.weather_code;

  const fallbackWarning =
    current?.fallback_warning ?? forecast?.fallback_warning;

  return (
    <div className="forecast-page page-container">
      <PageHeader
        eyebrow="Dự báo thời tiết"
        title={locationName}
        description={`Dữ liệu hiện tại và dự báo tại ${city}`}
        actions={
          <button
            className="app-button app-button--secondary"
            type="button"
            onClick={() => {
              void loadForecast(true);
            }}
            disabled={loading}
          >
            <RefreshCw
              className={loading ? "forecast-page__spinner" : ""}
              aria-hidden="true"
            />

            <span>{loading ? "Đang tải..." : "Làm mới"}</span>
          </button>
        }
      />

      {error && (
        <ExtremeWeatherAlert
          severity="info"
          title="Dữ liệu chưa đầy đủ"
          message={error}
        />
      )}

      {fallbackWarning && (
        <ExtremeWeatherAlert
          severity="info"
          title="Đang sử dụng dữ liệu dự phòng"
          message={fallbackWarning}
        />
      )}

      {primaryAlert && (
        <ExtremeWeatherAlert
          severity={mapAlertSeverity(primaryAlert.level)}
          title={primaryAlert.type}
          message={primaryAlert.message}
          advice={primaryAlert.advice ?? undefined}
        />
      )}

      <section className="forecast-page__overview">
        <CurrentWeatherCard
          location={locationName}
          temperature={
            temperature === null || temperature === undefined
              ? "—"
              : formatTemperature(temperature)
          }
          condition={getWeatherDescription(weatherCode)}
          feelsLike={
            feelsLike === null || feelsLike === undefined
              ? undefined
              : formatTemperature(feelsLike)
          }
          highestTemperature={
            todayWeather?.temperature.max === null ||
            todayWeather?.temperature.max === undefined
              ? undefined
              : formatTemperature(todayWeather.temperature.max)
          }
          lowestTemperature={
            todayWeather?.temperature.min === null ||
            todayWeather?.temperature.min === undefined
              ? undefined
              : formatTemperature(todayWeather.temperature.min)
          }
          updatedAt={
            current?.cached_at
              ? formatTime(current.cached_at)
              : formatTime(new Date())
          }
          weatherCode={weatherCode ?? undefined}
        />

        <div className="forecast-page__metrics">
          <WeatherMetricCard
            label="Độ ẩm"
            value={
              humidity === null || humidity === undefined
                ? "—"
                : formatPercentage(humidity)
            }
            icon={<Droplets />}
            tone="humidity"
            progress={humidity ?? undefined}
          />

          <WeatherMetricCard
            label="Tốc độ gió"
            value={
              windSpeed === null || windSpeed === undefined
                ? "—"
                : formatWindSpeed(windSpeed)
            }
            icon={<Wind />}
            tone="wind"
          />

          <WeatherMetricCard
            label="Khả năng mưa hôm nay"
            value={
              rainProbability === null || rainProbability === undefined
                ? "—"
                : formatPercentage(rainProbability)
            }
            icon={<Umbrella />}
            tone="rain"
            progress={rainProbability ?? undefined}
          />

          <WeatherMetricCard
            label="Lượng mưa hiện tại"
            value={
              rainfall === null || rainfall === undefined
                ? "—"
                : formatRainfall(rainfall)
            }
            icon={<Thermometer />}
            tone="temperature"
          />
        </div>
      </section>

      {weeklyItems.length > 0 && (
        <WeeklyForecast items={weeklyItems} title="Dự báo 7 ngày tới" />
      )}

      {(temperatureChart.length > 0 || rainfallChart.length > 0) && (
        <section className="forecast-page__charts">
          {temperatureChart.length > 0 && (
            <TemperatureChart
              data={temperatureChart}
              title="Nhiệt độ cao nhất 7 ngày tới"
              description="Nhiệt độ cao nhất dự báo theo từng ngày"
            />
          )}

          {rainfallChart.length > 0 && (
            <RainfallChart
              data={rainfallChart}
              title="Lượng mưa 7 ngày tới"
              description="Tổng lượng mưa dự báo theo từng ngày"
            />
          )}
        </section>
      )}
    </div>
  );
}

export default ForecastPage;
