import {
  Droplets,
  Gauge,
  RefreshCw,
  Umbrella,
  Wind,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import AirQualityCard, {
  type AirPollutantItem,
} from '../../components/analysis/AirQualityCard';

import AgricultureRecommendation, {
  type AgricultureRecommendationItem,
} from '../../components/analysis/AgricultureRecommendation';

import LifestyleRecommendation, {
  type LifestyleRecommendationItem,
} from '../../components/analysis/LifestyleRecommendation';

import PageHeader from '../../components/common/PageHeader';

import ErrorState from '../../components/states/ErrorState';
import LoadingSkeleton from '../../components/states/LoadingSkeleton';

import CurrentWeatherCard from '../../components/weather/CurrentWeatherCard';
import ExtremeWeatherAlert from '../../components/weather/ExtremeWeatherAlert';
import HourlyForecast, {
  type HourlyForecastItem,
} from '../../components/weather/HourlyForecast';
import WeatherMetricCard from '../../components/weather/WeatherMetricCard';

import { useWeather } from '../../hooks/useWeather';

import weatherService from '../../services/weatherService';

import type {
  JsonObject,
  OverviewRecommendationResponse,
} from '../../types/weather';

import {
  asArray,
  asObject,
  formatPercentage,
  formatTemperature,
  formatTime,
  formatWindSpeed,
  getFirstValue,
  getWeatherDescription,
  toNumber,
  toText,
} from '../../utils/formatters';

import './DashboardPage.scss';

function readNumber(
  source: unknown,
  paths: string[],
): number | undefined {
  const value = getFirstValue(
    source,
    paths,
  );

  const numberValue = toNumber(
    value,
    Number.NaN,
  );

  return Number.isNaN(numberValue)
    ? undefined
    : numberValue;
}

function readText(
  source: unknown,
  paths: string[],
): string | undefined {
  const value = getFirstValue(
    source,
    paths,
  );

  const textValue = toText(value, '');

  return textValue || undefined;
}

function hasObjectData(
  value: JsonObject,
): boolean {
  return Object.keys(value).length > 0;
}

function buildHourlyItems(
  currentWeather: JsonObject,
): HourlyForecastItem[] {
  const times = asArray(
    getFirstValue(currentWeather, [
      'hourly.time',
      'hourly.times',
      'hourly.timestamps',
    ]),
  );

  const temperatures = asArray(
    getFirstValue(currentWeather, [
      'hourly.temperature_2m',
      'hourly.temperatures',
      'hourly.temperature',
    ]),
  );

  const weatherCodes = asArray(
    getFirstValue(currentWeather, [
      'hourly.weather_code',
      'hourly.weathercode',
      'hourly.weather_codes',
    ]),
  );

  const precipitation = asArray(
    getFirstValue(currentWeather, [
      'hourly.precipitation_probability',
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
        precipitation[index],
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

function buildPollutants(
  airQuality: JsonObject,
): AirPollutantItem[] {
  const pollutants = asObject(
    airQuality.pollutants,
  );

  return Object.entries(pollutants)
    .slice(0, 6)
    .map(([key, rawPollutant]) => {
      const pollutant =
        asObject(rawPollutant);

      const name = toText(
        pollutant.name,
        key,
      );

      const value = toText(
        pollutant.value,
        '—',
      );

      const unit = toText(
        pollutant.unit,
        '',
      );

      return {
        id: key,
        label: name,
        value: unit
          ? `${value} ${unit}`
          : value,

        description: toText(
          pollutant.description,
          '',
        ),
      };
    });
}

function buildLifestyleItems(
  lifestyle: JsonObject,
): LifestyleRecommendationItem[] {
  const items:
    LifestyleRecommendationItem[] = [];

  const clothing = asObject(
    lifestyle.clothing_recommendation,
  );

  const clothingSummary = toText(
    clothing.summary,
    '',
  );

  if (clothingSummary) {
    items.push({
      id: 'clothing',
      title: 'Trang phục',
      description: clothingSummary,
      category: 'clothing',
    });
  }

  const outdoorActivities = asArray(
    lifestyle.outdoor_activities,
  );

  outdoorActivities
    .slice(0, 2)
    .forEach((rawActivity, index) => {
      const activity =
        asObject(rawActivity);

      const title = toText(
        activity.name,
        '',
      );

      const description = toText(
        activity.description,
        '',
      );

      if (!title || !description) {
        return;
      }

      items.push({
        id: `outdoor-${index}`,
        title,
        description,
        category: 'outdoor',

        priority:
          toText(
            activity.status,
            '',
          ).toLowerCase() ===
          'cần lưu ý'
            ? 'important'
            : 'normal',
      });
    });

  const healthAdvice = asArray(
    lifestyle.health_and_safety_advice,
  );

  const firstHealthAdvice = toText(
    healthAdvice[0],
    '',
  );

  if (firstHealthAdvice) {
    items.push({
      id: 'health',
      title: 'Sức khỏe',
      description: firstHealthAdvice,
      category: 'health',
    });
  }

  const commute = asObject(
    lifestyle.commute_and_travel,
  );

  const travelAdvice = asArray(
    commute.travel_advice,
  );

  const firstTravelAdvice = toText(
    travelAdvice[0],
    '',
  );

  if (firstTravelAdvice) {
    items.push({
      id: 'traffic',
      title: 'Di chuyển',
      description: firstTravelAdvice,
      category: 'traffic',
    });
  }

  return items.slice(0, 4);
}

function buildAgricultureItems(
  agriculture: JsonObject,
): AgricultureRecommendationItem[] {
  const items:
    AgricultureRecommendationItem[] = [];

  const irrigationPlan = toText(
    agriculture.irrigation_and_soil_plan,
    '',
  );

  if (irrigationPlan) {
    items.push({
      id: 'irrigation',
      title: 'Tưới tiêu và đất',
      description: irrigationPlan,
      category: 'irrigation',
    });
  }

  const crops = asArray(
    agriculture.top_recommended_crops,
  );

  const firstCrop = asObject(crops[0]);

  const cropName = toText(
    firstCrop.name,
    '',
  );

  if (cropName) {
    const fitLevel = toText(
      firstCrop.fit_level,
      '',
    );

    items.push({
      id: toText(
        firstCrop.crop_id,
        'recommended-crop',
      ),

      title: `Cây trồng phù hợp: ${cropName}`,

      description:
        toText(
          firstCrop.care_tips,
          '',
        ) ||
        fitLevel ||
        'Có trong danh sách cây trồng được đề xuất.',

      category: 'crop',
    });
  }

  const risks = asArray(
    agriculture.agricultural_weather_risks,
  );

  const firstRisk = risks[0];

  if (firstRisk !== undefined) {
    const riskObject =
      asObject(firstRisk);

    const riskDescription =
      toText(
        riskObject.description,
        '',
      ) ||
      toText(firstRisk, '');

    if (riskDescription) {
      items.push({
        id: 'agriculture-risk',
        title: 'Cảnh báo nông nghiệp',
        description: riskDescription,
        category: 'pest',
        status: 'warning',
      });
    }
  }

  return items.slice(0, 3);
}

function DashboardPage() {
  const { city } = useWeather();

  const [
    dashboardData,
    setDashboardData,
  ] =
    useState<OverviewRecommendationResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const requestSequence = useRef(0);

  const loadDashboard = useCallback(
    async (forceRefresh = false) => {
      const currentRequest =
        ++requestSequence.current;

      try {
        setLoading(true);
        setError(null);

        const response =
          await weatherService.getOverview(
            city,
            forceRefresh,
          );

        if (
          currentRequest !==
          requestSequence.current
        ) {
          return;
        }

        setDashboardData(response);
      } catch (requestError: unknown) {
        if (
          currentRequest !==
          requestSequence.current
        ) {
          return;
        }

        setDashboardData(null);

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Không thể tải dữ liệu Dashboard.',
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
        void loadDashboard();
      },
      0,
    );

    return () => {
      window.clearTimeout(timeoutId);
      requestSequence.current += 1;
    };
  }, [loadDashboard]);

  if (loading && !dashboardData) {
    return (
      <div className="page-container">
        <LoadingSkeleton
          variant="dashboard"
          message="Đang tải tổng quan thời tiết..."
        />
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="page-container">
        <ErrorState
          title="Không thể tải Dashboard"
          message={error}
          onRetry={() =>
            loadDashboard(true)
          }
        />
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const {
    location,
    current_weather: currentWeather,
    air_quality: airQuality,
    extreme_alerts: extremeAlerts,
    lifestyle_recommendations:
      lifestyle,
    agriculture_recommendations:
      agriculture,
  } = dashboardData;

  const weatherCondition = asObject(
    lifestyle.weather_condition,
  );

  const temperature = readNumber(
    dashboardData,
    [
      'current_weather.temperature',
      'current_weather.current.temperature_2m',
      'current_weather.current.temperature',
      'lifestyle_recommendations.weather_condition.temperature',
    ],
  );

  const feelsLike = readNumber(
    dashboardData,
    [
      'current_weather.feels_like',
      'current_weather.current.apparent_temperature',
      'lifestyle_recommendations.weather_condition.feels_like',
    ],
  );

  const weatherCode = readNumber(
    dashboardData,
    [
      'current_weather.weather_code',
      'current_weather.current.weather_code',
    ],
  );

  const condition =
    readText(dashboardData, [
      'current_weather.weather_name',
      'current_weather.condition',
      'lifestyle_recommendations.weather_condition.weather_name',
    ]) ??
    getWeatherDescription(weatherCode);

  const humidity = readNumber(
    dashboardData,
    [
      'current_weather.humidity',
      'current_weather.current.relative_humidity_2m',
      'agriculture_recommendations.weather_summary.avg_humidity',
    ],
  );

  const windSpeed = readNumber(
    dashboardData,
    [
      'current_weather.wind_speed',
      'current_weather.current.wind_speed_10m',
      'lifestyle_recommendations.weather_condition.wind_speed',
    ],
  );

  const rainProbability = readNumber(
    dashboardData,
    [
      'current_weather.rain_probability',
      'lifestyle_recommendations.weather_condition.rain_probability',
    ],
  );

  const maximumTemperature = readNumber(
    dashboardData,
    [
      'current_weather.max_temperature',
      'agriculture_recommendations.weather_summary.max_temperature',
    ],
  );

  const minimumTemperature = readNumber(
    dashboardData,
    [
      'current_weather.min_temperature',
      'agriculture_recommendations.weather_summary.min_temperature',
    ],
  );

  const aqi = readNumber(
    airQuality,
    ['aqi'],
  );

  const hourlyItems =
    buildHourlyItems(currentWeather);

  const pollutants =
    buildPollutants(airQuality);

  const lifestyleItems =
    buildLifestyleItems(lifestyle);

  const agricultureItems =
    buildAgricultureItems(agriculture);

  const alertSummary = readText(
    extremeAlerts,
    ['summary', 'message'],
  );

  const hasAlertData =
    hasObjectData(extremeAlerts);

  return (
    <div className="dashboard-page page-container">
      <PageHeader
        eyebrow="Tổng quan"
        title="Chào buổi sáng, Quản trị viên"
        description={`Dữ liệu thời tiết tại ${location.name}`}
        actions={
          <button
            className="app-button app-button--secondary"
            type="button"
            onClick={() => {
              void loadDashboard(true);
            }}
            disabled={loading}
          >
            <RefreshCw
              className={
                loading
                  ? 'dashboard-page__spinner'
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

      <ExtremeWeatherAlert
        severity={
          hasAlertData
            ? 'warning'
            : 'info'
        }
        title={
          hasAlertData
            ? 'Cảnh báo thời tiết'
            : 'Thông tin cảnh báo'
        }
        message={
          alertSummary ??
          'Backend chưa trả dữ liệu cảnh báo cho khu vực này.'
        }
      />

      <section className="dashboard-page__weather-grid">
        <CurrentWeatherCard
          location={location.name}
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
          highestTemperature={
            maximumTemperature ===
            undefined
              ? undefined
              : formatTemperature(
                  maximumTemperature,
                )
          }
          lowestTemperature={
            minimumTemperature ===
            undefined
              ? undefined
              : formatTemperature(
                  minimumTemperature,
                )
          }
          updatedAt={formatTime(new Date())}
          weatherCode={weatherCode}
        />

        <div className="dashboard-page__metrics">
          <WeatherMetricCard
            label="Độ ẩm"
            value={
              humidity === undefined
                ? '—'
                : formatPercentage(
                    humidity,
                  )
            }
            description="Độ ẩm trung bình"
            icon={<Droplets />}
            tone="humidity"
            progress={humidity}
          />

          <WeatherMetricCard
            label="Gió"
            value={
              windSpeed === undefined
                ? '—'
                : formatWindSpeed(
                    windSpeed,
                  )
            }
            description={toText(
              weatherCondition.wind_category,
              'Tốc độ gió',
            )}
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
            description="Xác suất mưa"
            icon={<Umbrella />}
            tone="rain"
            progress={rainProbability}
          />

          <WeatherMetricCard
            label="Chỉ số AQI"
            value={
              aqi === undefined
                ? '—'
                : String(
                    Math.round(aqi),
                  )
            }
            description={toText(
              airQuality.level,
              'Chưa xác định',
            )}
            icon={<Gauge />}
            tone="warning"
          />
        </div>
      </section>

      {hourlyItems.length > 0 && (
        <HourlyForecast
          items={hourlyItems}
        />
      )}

      <section className="dashboard-page__insights">
        <AirQualityCard
          aqi={aqi ?? 0}
          pollutants={pollutants}
          summary={readText(
            airQuality,
            ['description'],
          )}
        />

        <LifestyleRecommendation
          items={lifestyleItems}
        />
      </section>

      <AgricultureRecommendation
        items={agricultureItems}
      />

      {error && (
        <p className="dashboard-page__refresh-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default DashboardPage;