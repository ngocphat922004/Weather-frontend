import {
  Droplets,
  RefreshCw,
  Thermometer,
  Umbrella,
  Wind,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import RainfallChart, {
  type RainfallChartItem,
} from '../../components/charts/RainfallChart';

import TemperatureChart, {
  type TemperatureChartItem,
} from '../../components/charts/TemperatureChart';

import PageHeader from '../../components/common/PageHeader';

import ErrorState from '../../components/states/ErrorState';
import LoadingSkeleton from '../../components/states/LoadingSkeleton';

import CurrentWeatherCard from '../../components/weather/CurrentWeatherCard';
import ExtremeWeatherAlert from '../../components/weather/ExtremeWeatherAlert';
import HourlyForecast, {
  type HourlyForecastItem,
} from '../../components/weather/HourlyForecast';
import WeatherMetricCard from '../../components/weather/WeatherMetricCard';
import WeeklyForecast, {
  type WeeklyForecastItem,
} from '../../components/weather/WeeklyForecast';

import { useWeather } from '../../hooks/useWeather';

import weatherService from '../../services/weatherService';

import type {
  CurrentWeatherApiResponse,
  Weather15DaysApiResponse,
  WeatherAlertsApiResponse,
} from '../../types/weather';

import {
  asArray,
  asObject,
  formatDate,
  formatPercentage,
  formatRainfall,
  formatShortDate,
  formatTemperature,
  formatTime,
  formatWindSpeed,
  getFirstValue,
  getWeatherDescription,
  toNumber,
  toText,
} from '../../utils/formatters';

import './ForecastPage.scss';

interface ForecastPageData {
  current: CurrentWeatherApiResponse | null;
  forecast: Weather15DaysApiResponse | null;
  alerts: WeatherAlertsApiResponse | null;
}

function readNumber(
  source: unknown,
  paths: string[],
): number | undefined {
  const value = getFirstValue(
    source,
    paths,
  );

  const result = toNumber(
    value,
    Number.NaN,
  );

  return Number.isNaN(result)
    ? undefined
    : result;
}

function readText(
  source: unknown,
  paths: string[],
): string | undefined {
  const value = getFirstValue(
    source,
    paths,
  );

  const result = toText(value, '');

  return result || undefined;
}

function buildHourlyItems(
  source: unknown,
): HourlyForecastItem[] {
  const times = asArray(
    getFirstValue(source, [
      'hourly.time',
      'data.hourly.time',
      'forecast.hourly.time',
    ]),
  );

  const temperatures = asArray(
    getFirstValue(source, [
      'hourly.temperature_2m',
      'data.hourly.temperature_2m',
      'forecast.hourly.temperature',
    ]),
  );

  const weatherCodes = asArray(
    getFirstValue(source, [
      'hourly.weather_code',
      'hourly.weathercode',
      'data.hourly.weather_code',
    ]),
  );

  const rainProbabilities = asArray(
    getFirstValue(source, [
      'hourly.precipitation_probability',
      'data.hourly.precipitation_probability',
      'hourly.rain_probability',
    ]),
  );

  return times
    .slice(0, 8)
    .map((time, index) => {
      const temperature = toNumber(
        temperatures[index],
        Number.NaN,
      );

      const weatherCode = toNumber(
        weatherCodes[index],
        Number.NaN,
      );

      const rainProbability = toNumber(
        rainProbabilities[index],
        Number.NaN,
      );

      return {
        id: `${toText(time, 'hour')}-${index}`,
        time: formatTime(time),

        temperature: Number.isNaN(
          temperature,
        )
          ? '—'
          : formatTemperature(temperature),

        weatherCode: Number.isNaN(
          weatherCode,
        )
          ? undefined
          : weatherCode,

        precipitation: Number.isNaN(
          rainProbability,
        )
          ? undefined
          : formatPercentage(
              rainProbability,
            ),

        isCurrent: index === 0,
      };
    });
}

function buildWeeklyItems(
  source: unknown,
): WeeklyForecastItem[] {
  const dates = asArray(
    getFirstValue(source, [
      'daily.time',
      'data.daily.time',
      'forecast.daily.time',
    ]),
  );

  const minimumTemperatures = asArray(
    getFirstValue(source, [
      'daily.temperature_2m_min',
      'data.daily.temperature_2m_min',
      'forecast.daily.min_temperature',
    ]),
  );

  const maximumTemperatures = asArray(
    getFirstValue(source, [
      'daily.temperature_2m_max',
      'data.daily.temperature_2m_max',
      'forecast.daily.max_temperature',
    ]),
  );

  const weatherCodes = asArray(
    getFirstValue(source, [
      'daily.weather_code',
      'daily.weathercode',
      'data.daily.weather_code',
    ]),
  );

  const rainProbabilities = asArray(
    getFirstValue(source, [
      'daily.precipitation_probability_max',
      'data.daily.precipitation_probability_max',
      'daily.rain_probability',
    ]),
  );

  return dates
    .slice(0, 7)
    .map((date, index) => {
      const minimumTemperature =
        toNumber(
          minimumTemperatures[index],
          Number.NaN,
        );

      const maximumTemperature =
        toNumber(
          maximumTemperatures[index],
          Number.NaN,
        );

      const weatherCode = toNumber(
        weatherCodes[index],
        Number.NaN,
      );

      const rainProbability = toNumber(
        rainProbabilities[index],
        Number.NaN,
      );

      return {
        id: `${toText(date, 'day')}-${index}`,

        dayLabel:
          index === 0
            ? 'Hôm nay'
            : formatDate(date, {
                weekday: 'long',
              }),

        dateLabel: formatShortDate(date),

        minimumTemperature:
          Number.isNaN(
            minimumTemperature,
          )
            ? '—'
            : formatTemperature(
                minimumTemperature,
              ),

        maximumTemperature:
          Number.isNaN(
            maximumTemperature,
          )
            ? '—'
            : formatTemperature(
                maximumTemperature,
              ),

        precipitation: Number.isNaN(
          rainProbability,
        )
          ? undefined
          : formatPercentage(
              rainProbability,
            ),

        weatherCode: Number.isNaN(
          weatherCode,
        )
          ? undefined
          : weatherCode,

        isToday: index === 0,
      };
    });
}

function buildTemperatureChart(
  source: unknown,
): TemperatureChartItem[] {
  const times = asArray(
    getFirstValue(source, [
      'hourly.time',
      'data.hourly.time',
      'forecast.hourly.time',
    ]),
  );

  const temperatures = asArray(
    getFirstValue(source, [
      'hourly.temperature_2m',
      'data.hourly.temperature_2m',
      'forecast.hourly.temperature',
    ]),
  );

  return times
    .slice(0, 12)
    .map((time, index) => ({
      label: formatTime(time),

      temperature: toNumber(
        temperatures[index],
        Number.NaN,
      ),
    }))
    .filter((item) =>
      Number.isFinite(item.temperature),
    );
}

function buildRainfallChart(
  source: unknown,
): RainfallChartItem[] {
  const times = asArray(
    getFirstValue(source, [
      'hourly.time',
      'data.hourly.time',
      'forecast.hourly.time',
    ]),
  );

  const rainfallValues = asArray(
    getFirstValue(source, [
      'hourly.precipitation',
      'hourly.rain',
      'data.hourly.precipitation',
    ]),
  );

  return times
    .slice(0, 12)
    .map((time, index) => ({
      label: formatTime(time),

      rainfall: toNumber(
        rainfallValues[index],
        Number.NaN,
      ),
    }))
    .filter((item) =>
      Number.isFinite(item.rainfall),
    );
}

function getErrorMessage(
  reason: unknown,
): string {
  return reason instanceof Error
    ? reason.message
    : 'Không thể tải dữ liệu dự báo.';
}

function ForecastPage() {
  const { city } = useWeather();

  const [data, setData] =
    useState<ForecastPageData | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const requestSequence = useRef(0);

  const loadForecast = useCallback(
    async (forceRefresh = false) => {
      const currentRequest =
        ++requestSequence.current;

      try {
        setLoading(true);
        setError(null);

        const results =
          await Promise.allSettled([
            weatherService.getCurrentWeather(
              city,
              forceRefresh,
            ),

            weatherService.getWeather15Days(
              city,
              forceRefresh,
            ),

            weatherService.getWeatherAlerts(
              city,
              forceRefresh,
            ),
          ]);

        if (
          currentRequest !==
          requestSequence.current
        ) {
          return;
        }

        const [
          currentResult,
          forecastResult,
          alertsResult,
        ] = results;

        const nextData: ForecastPageData = {
          current:
            currentResult.status ===
            'fulfilled'
              ? currentResult.value
              : null,

          forecast:
            forecastResult.status ===
            'fulfilled'
              ? forecastResult.value
              : null,

          alerts:
            alertsResult.status ===
            'fulfilled'
              ? alertsResult.value
              : null,
        };

        const successfulRequests =
          results.filter(
            (result) =>
              result.status ===
              'fulfilled',
          ).length;

        if (successfulRequests === 0) {
          const firstFailure =
            results.find(
              (result) =>
                result.status ===
                'rejected',
            );

          throw new Error(
            firstFailure?.status ===
            'rejected'
              ? getErrorMessage(
                  firstFailure.reason,
                )
              : 'Không thể tải dữ liệu dự báo.',
          );
        }

        setData(nextData);

        if (successfulRequests < 3) {
          setError(
            'Một phần dữ liệu dự báo chưa thể tải. Các nội dung còn lại vẫn được hiển thị.',
          );
        }
      } catch (requestError: unknown) {
        if (
          currentRequest !==
          requestSequence.current
        ) {
          return;
        }

        setData(null);
        setError(
          getErrorMessage(requestError),
        );
      } finally {
        if (
          currentRequest ===
          requestSequence.current
        ) {
          setLoading(false);
        }
      }
    },
    [city],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => {
        void loadForecast();
      },
      0,
    );

    return () => {
      window.clearTimeout(timeoutId);
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
          message={
            error ??
            'Không có dữ liệu dự báo.'
          }
          onRetry={() =>
            loadForecast(true)
          }
        />
      </div>
    );
  }

  const current =
    data.current ?? {};

  const forecast =
    data.forecast ?? {};

  const alerts =
    data.alerts ?? {};

  const locationName =
    readText(current, [
      'location.name',
      'city',
      'location',
    ]) ?? city;

  const temperature = readNumber(
    current,
    [
      'temperature',
      'current.temperature_2m',
      'current.temperature',
      'data.temperature',
    ],
  );

  const feelsLike = readNumber(
    current,
    [
      'feels_like',
      'current.apparent_temperature',
      'data.feels_like',
    ],
  );

  const humidity = readNumber(
    current,
    [
      'humidity',
      'current.relative_humidity_2m',
      'data.humidity',
    ],
  );

  const windSpeed = readNumber(
    current,
    [
      'wind_speed',
      'current.wind_speed_10m',
      'data.wind_speed',
    ],
  );

  const rainProbability = readNumber(
    current,
    [
      'rain_probability',
      'precipitation_probability',
      'current.precipitation_probability',
    ],
  );

  const rainfall = readNumber(
    current,
    [
      'rain',
      'precipitation',
      'current.precipitation',
    ],
  );

  const weatherCode = readNumber(
    current,
    [
      'weather_code',
      'current.weather_code',
      'current.weathercode',
    ],
  );

  const condition =
    readText(current, [
      'weather_name',
      'condition',
      'description',
    ]) ??
    getWeatherDescription(weatherCode);

  const hourlyItems =
    buildHourlyItems(forecast);

  const weeklyItems =
    buildWeeklyItems(forecast);

  const temperatureChart =
    buildTemperatureChart(forecast);

  const rainfallChart =
    buildRainfallChart(forecast);

  const alertObject = asObject(
    getFirstValue(alerts, [
      'alerts.0',
      'data.alerts.0',
    ]),
  );

  const alertMessage =
    readText(alertObject, [
      'message',
      'summary',
      'description',
    ]) ??
    readText(alerts, [
      'message',
      'summary',
    ]);

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
              className={
                loading
                  ? 'forecast-page__spinner'
                  : ''
              }
              aria-hidden="true"
            />

            <span>
              {loading
                ? 'Đang tải...'
                : 'Làm mới'}
            </span>
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

      {alertMessage && (
        <ExtremeWeatherAlert
          severity="warning"
          message={alertMessage}
          advice={readText(alertObject, [
            'advice',
          ])}
        />
      )}

      <section className="forecast-page__overview">
        <CurrentWeatherCard
          location={locationName}
          temperature={
            temperature === undefined
              ? '—'
              : formatTemperature(
                  temperature,
                )
          }
          condition={condition}
          feelsLike={
            feelsLike === undefined
              ? undefined
              : formatTemperature(
                  feelsLike,
                )
          }
          updatedAt={formatTime(new Date())}
          weatherCode={weatherCode}
        />

        <div className="forecast-page__metrics">
          <WeatherMetricCard
            label="Độ ẩm"
            value={
              humidity === undefined
                ? '—'
                : formatPercentage(
                    humidity,
                  )
            }
            icon={<Droplets />}
            tone="humidity"
            progress={humidity}
          />

          <WeatherMetricCard
            label="Tốc độ gió"
            value={
              windSpeed === undefined
                ? '—'
                : formatWindSpeed(
                    windSpeed,
                  )
            }
            icon={<Wind />}
            tone="wind"
          />

          <WeatherMetricCard
            label="Khả năng mưa"
            value={
              rainProbability === undefined
                ? '—'
                : formatPercentage(
                    rainProbability,
                  )
            }
            icon={<Umbrella />}
            tone="rain"
            progress={rainProbability}
          />

          <WeatherMetricCard
            label="Lượng mưa"
            value={
              rainfall === undefined
                ? '—'
                : formatRainfall(
                    rainfall,
                  )
            }
            icon={<Thermometer />}
            tone="temperature"
          />
        </div>
      </section>

      <section className="forecast-page__forecast-grid">
        <HourlyForecast
          items={hourlyItems}
        />

        <WeeklyForecast
          items={weeklyItems}
        />
      </section>

      <section className="forecast-page__charts">
        <TemperatureChart
          data={temperatureChart}
        />

        <RainfallChart
          data={rainfallChart}
        />
      </section>
    </div>
  );
}

export default ForecastPage;