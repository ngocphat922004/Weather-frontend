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
  toNumber,
  toText,
} from '../../utils/formatters';

import './DashboardPage.scss';

type AlertSeverity =
  | 'safe'
  | 'info'
  | 'warning'
  | 'danger';

function readNumber(
  source: JsonObject,
  key: string,
): number | undefined {
  const value = toNumber(
    source[key],
    Number.NaN,
  );

  return Number.isNaN(value)
    ? undefined
    : value;
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
        label: toText(
          pollutant.name,
          key,
        ),
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

  asArray(
    lifestyle.outdoor_activities,
  )
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

      const status = toText(
        activity.status,
        '',
      ).toLowerCase();

      items.push({
        id: `outdoor-${index}`,
        title,
        description,
        category: 'outdoor',
        priority:
          status.includes('lưu ý') ||
          status.includes(
            'không khuyến khích',
          )
            ? 'important'
            : 'normal',
      });
    });

  const healthAdvice = toText(
    asArray(
      lifestyle.health_and_safety_advice,
    )[0],
    '',
  );

  if (healthAdvice) {
    items.push({
      id: 'health',
      title: 'Sức khỏe',
      description: healthAdvice,
      category: 'health',
    });
  }

  const commute = asObject(
    lifestyle.commute_and_travel,
  );

  const travelAdvice = toText(
    asArray(commute.travel_advice)[0],
    '',
  );

  if (travelAdvice) {
    items.push({
      id: 'traffic',
      title: 'Di chuyển',
      description: travelAdvice,
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

  const firstCrop = asObject(
    asArray(
      agriculture.top_recommended_crops,
    )[0],
  );

  const cropName = toText(
    firstCrop.name,
    '',
  );

  if (cropName) {
    const score = toNumber(
      firstCrop.suitability_score,
      Number.NaN,
    );

    const fitLevel = toText(
      firstCrop.fit_level,
      '',
    );

    const careTips = toText(
      firstCrop.care_tips,
      '',
    );

    const scoreText = Number.isNaN(score)
      ? ''
      : `Độ phù hợp ${score}%`;

    const description = [
      fitLevel,
      scoreText,
      careTips,
    ]
      .filter(Boolean)
      .join(' · ');

    items.push({
      id: toText(
        firstCrop.crop_id,
        'recommended-crop',
      ),
      title: `Cây trồng phù hợp: ${cropName}`,
      description,
      category: 'crop',
    });
  }

  const firstRisk = asObject(
    asArray(
      agriculture.agricultural_weather_risks,
    )[0],
  );

  const riskMessage = toText(
    firstRisk.message,
    '',
  );

  if (riskMessage) {
    const severity = toText(
      firstRisk.severity,
      '',
    ).toUpperCase();

    items.push({
      id: 'agriculture-risk',
      title: toText(
        firstRisk.risk,
        'Cảnh báo nông nghiệp',
      ),
      description: riskMessage,
      category: 'weather',
      status:
        severity === 'WARNING' ||
        severity === 'CRITICAL'
          ? 'warning'
          : 'normal',
    });
  }

  return items.slice(0, 3);
}

function mapAlertSeverity(
  severity: string,
): AlertSeverity {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return 'danger';

    case 'WARNING':
      return 'warning';

    case 'INFO':
      return 'info';

    case 'SAFE':
      return 'safe';

    default:
      return 'info';
  }
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
    const timeoutId =
      window.setTimeout(() => {
        void loadDashboard();
      }, 0);

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

  if (!dashboardData) {
    return (
      <div className="page-container">
        <ErrorState
          title="Không thể tải Dashboard"
          message={
            error ??
            'Không có dữ liệu tổng quan.'
          }
          onRetry={() =>
            loadDashboard(true)
          }
        />
      </div>
    );
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

  const weatherSummary = asObject(
    agriculture.weather_summary,
  );

  const temperature = readNumber(
    currentWeather,
    'temperature',
  );

  const feelsLike = readNumber(
    currentWeather,
    'feels_like',
  );

  const humidity = readNumber(
    currentWeather,
    'humidity',
  );

  const windSpeed = readNumber(
    currentWeather,
    'wind_speed',
  );

  const weatherCode = readNumber(
    currentWeather,
    'weather_code',
  );

  const rainProbability = readNumber(
    weatherCondition,
    'rain_probability',
  );

  const maximumTemperature = readNumber(
    weatherSummary,
    'max_temperature',
  );

  const minimumTemperature = readNumber(
    weatherSummary,
    'min_temperature',
  );

  const aqi = readNumber(
    airQuality,
    'aqi',
  );

  const condition = toText(
    weatherCondition.weather_name,
    'Chưa xác định',
  );

  const pollutants =
    buildPollutants(airQuality);

  const lifestyleItems =
    buildLifestyleItems(lifestyle);

  const agricultureItems =
    buildAgricultureItems(agriculture);

  const overallSeverity = toText(
    extremeAlerts.overall_severity,
    'SAFE',
  );

  const alertSummary = toText(
    extremeAlerts.summary,
    'Không có cảnh báo thời tiết đáng chú ý.',
  );

  const firstAlert = asObject(
    asArray(extremeAlerts.alerts)[0],
  );

  const alertTitle = toText(
    firstAlert.type,
    overallSeverity === 'SAFE'
      ? 'Thời tiết an toàn'
      : 'Cảnh báo thời tiết',
  );

  const alertAdvice = toText(
    firstAlert.advice,
    '',
  );

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
        severity={mapAlertSeverity(
          overallSeverity,
        )}
        title={alertTitle}
        message={alertSummary}
        advice={
          alertAdvice || undefined
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
          updatedAt={formatTime(
            new Date(),
          )}
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
            description="Độ ẩm hiện tại"
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
            description="Xác suất mưa hôm nay"
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

      <section className="dashboard-page__insights">
        <AirQualityCard
          aqi={aqi ?? 0}
          pollutants={pollutants}
          summary={toText(
            airQuality.description,
            '',
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