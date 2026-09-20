import {
  BarChart3,
  CloudRain,
  Droplets,
  RefreshCw,
  Thermometer,
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
import ExtremeWeatherAlert from '../../components/weather/ExtremeWeatherAlert';
import WeatherMetricCard from '../../components/weather/WeatherMetricCard';

import { useWeather } from '../../hooks/useWeather';

import weatherService from '../../services/weatherService';

import type {
  AgricultureRecommendationResponse,
  AirQualityResponse,
  ExtremeWeatherResponse,
  JsonObject,
  LifestyleRecommendationResponse,
  WeatherAnalysisSummaryResponse,
  WeatherTrendsApiResponse,
} from '../../types/weather';

import CropPredictionPanel from '../../components/analysis/CropPredictionPanel';

import {
  asArray,
  asObject,
  formatPercentage,
  formatRainfall,
  formatTemperature,
  formatWindSpeed,
  toNumber,
  toText,
} from '../../utils/formatters';

import './AnalysisPage.scss';

type AnalysisTab =
  | 'overview'
  | 'air-quality'
  | 'agriculture'
  | 'lifestyle';

type AlertSeverity =
  | 'safe'
  | 'info'
  | 'warning'
  | 'danger';

interface OverviewData {
  summary:
    | WeatherAnalysisSummaryResponse
    | null;

  trends:
    | WeatherTrendsApiResponse
    | null;

  extremes:
    | ExtremeWeatherResponse
    | null;
}

const analysisTabs: Array<{
  id: AnalysisTab;
  label: string;
}> = [
  {
    id: 'overview',
    label: 'Tổng quan',
  },
  {
    id: 'air-quality',
    label: 'Chất lượng không khí',
  },
  {
    id: 'agriculture',
    label: 'Nông nghiệp thông minh',
  },
  {
    id: 'lifestyle',
    label: 'Gợi ý sinh hoạt',
  },
];

function getRequestError(
  error: unknown,
): string {
  return error instanceof Error
    ? error.message
    : 'Không thể tải dữ liệu phân tích.';
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
    clothing.accessories_and_gears,
  )
    .slice(0, 2)
    .forEach((rawAccessory, index) => {
      const accessory = toText(
        rawAccessory,
        '',
      );

      if (!accessory) {
        return;
      }

      items.push({
        id: `accessory-${index}`,
        title: 'Phụ kiện nên mang theo',
        description: accessory,
        category: 'clothing',
      });
    });

  asArray(
    lifestyle.outdoor_activities,
  )
    .slice(0, 5)
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

  asArray(
    lifestyle.health_and_safety_advice,
  )
    .slice(0, 3)
    .forEach((rawAdvice, index) => {
      const advice = toText(
        rawAdvice,
        '',
      );

      if (!advice) {
        return;
      }

      items.push({
        id: `health-${index}`,
        title: 'Sức khỏe và an toàn',
        description: advice,
        category: 'health',
      });
    });

  const commute = asObject(
    lifestyle.commute_and_travel,
  );

  const roadCondition = toText(
    commute.road_condition,
    '',
  );

  if (roadCondition) {
    items.push({
      id: 'road-condition',
      title: 'Điều kiện giao thông',
      description: roadCondition,
      category: 'traffic',
    });
  }

  asArray(commute.travel_advice)
    .slice(0, 3)
    .forEach((rawAdvice, index) => {
      const advice = toText(
        rawAdvice,
        '',
      );

      if (!advice) {
        return;
      }

      items.push({
        id: `traffic-${index}`,
        title: 'Di chuyển',
        description: advice,
        category: 'traffic',
      });
    });

  return items;
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
      title: 'Kế hoạch tưới và đất',
      description: irrigationPlan,
      category: 'irrigation',
    });
  }

  asArray(
    agriculture.top_recommended_crops,
  )
    .slice(0, 5)
    .forEach((rawCrop, index) => {
      const crop = asObject(rawCrop);

      const cropName = toText(
        crop.name,
        '',
      );

      if (!cropName) {
        return;
      }

      const fitLevel = toText(
        crop.fit_level,
        '',
      );

      const careTips = toText(
        crop.care_tips,
        '',
      );

      const score = toNumber(
        crop.suitability_score,
        Number.NaN,
      );

      const scoreText =
        Number.isNaN(score)
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
          crop.crop_id,
          `crop-${index}`,
        ),
        title: cropName,
        description,
        category: 'crop',
      });

      const diseaseRisk = toText(
        crop.disease_risk,
        '',
      );

      if (
        diseaseRisk &&
        index === 0
      ) {
        items.push({
          id: 'disease-risk',
          title: `Nguy cơ với ${cropName}`,
          description: diseaseRisk,
          category: 'pest',
          status: 'warning',
        });
      }
    });

  asArray(
    agriculture.agricultural_weather_risks,
  )
    .slice(0, 4)
    .forEach((rawRisk, index) => {
      const risk = asObject(rawRisk);

      const title = toText(
        risk.risk,
        'Rủi ro thời tiết',
      );

      const description = toText(
        risk.message,
        '',
      );

      if (!description) {
        return;
      }

      const severity = toText(
        risk.severity,
        '',
      ).toUpperCase();

      items.push({
        id: `weather-risk-${index}`,
        title,
        description,
        category: 'weather',
        status:
          severity === 'WARNING' ||
          severity === 'CRITICAL'
            ? 'warning'
            : 'normal',
      });
    });

  return items;
}

function mapExtremeSeverity(
  severity?: string,
): AlertSeverity {
  switch (
    severity?.toUpperCase()
  ) {
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

function AnalysisPage() {
  const { city } = useWeather();

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<AnalysisTab>(
      'overview',
    );

  const [
    overviewByCity,
    setOverviewByCity,
  ] = useState<
    Record<string, OverviewData>
  >({});

  const [
    airQualityByCity,
    setAirQualityByCity,
  ] = useState<
    Record<
      string,
      AirQualityResponse
    >
  >({});

  const [
    agricultureByCity,
    setAgricultureByCity,
  ] = useState<
    Record<
      string,
      AgricultureRecommendationResponse
    >
  >({});

  const [
    lifestyleByCity,
    setLifestyleByCity,
  ] = useState<
    Record<
      string,
      LifestyleRecommendationResponse
    >
  >({});

  const [
    loadingKey,
    setLoadingKey,
  ] =
    useState<string | null>(
      null,
    );

  const [
    errors,
    setErrors,
  ] =
    useState<
      Record<string, string>
    >({});

  const requestSequence =
    useRef(0);

  const normalizedCity =
    city
      .trim()
      .toLocaleLowerCase();

  const currentKey =
    `${normalizedCity}:${activeTab}`;

  const hasCurrentData =
    activeTab === 'overview'
      ? Boolean(
          overviewByCity[
            normalizedCity
          ],
        )
      : activeTab ===
          'air-quality'
        ? Boolean(
            airQualityByCity[
              normalizedCity
            ],
          )
        : activeTab ===
            'agriculture'
          ? Boolean(
              agricultureByCity[
                normalizedCity
              ],
            )
          : Boolean(
              lifestyleByCity[
                normalizedCity
              ],
            );

  const loadTab = useCallback(
    async (
      tab: AnalysisTab,
      forceRefresh = false,
    ) => {
      const cityKey =
        city
          .trim()
          .toLocaleLowerCase();

      const key =
        `${cityKey}:${tab}`;

      const currentRequest =
        ++requestSequence.current;

      try {
        setLoadingKey(key);

        setErrors(
          (
            currentErrors,
          ) => {
            const nextErrors = {
              ...currentErrors,
            };

            delete nextErrors[
              key
            ];

            return nextErrors;
          },
        );

        if (
          tab === 'overview'
        ) {
          const results =
            await Promise.allSettled(
              [
                weatherService.getAnalysisSummary(
                  city,
                  forceRefresh,
                ),

                weatherService.getAnalysisTrends(
                  city,
                  forceRefresh,
                ),

                weatherService.getExtremeWeather(
                  city,
                  forceRefresh,
                ),
              ],
            );

          if (
            currentRequest !==
            requestSequence.current
          ) {
            return;
          }

          const [
            summaryResult,
            trendsResult,
            extremesResult,
          ] = results;

          const allFailed =
            results.every(
              (result) =>
                result.status ===
                'rejected',
            );

          if (allFailed) {
            const firstFailure =
              results.find(
                (result) =>
                  result.status ===
                  'rejected',
              );

            if (
              firstFailure?.status ===
              'rejected'
            ) {
              throw firstFailure.reason;
            }

            throw new Error(
              'Không thể tải dữ liệu phân tích.',
            );
          }

          setOverviewByCity(
            (currentData) => ({
              ...currentData,

              [cityKey]: {
                summary:
                  summaryResult.status ===
                  'fulfilled'
                    ? summaryResult.value
                    : null,

                trends:
                  trendsResult.status ===
                  'fulfilled'
                    ? trendsResult.value
                    : null,

                extremes:
                  extremesResult.status ===
                  'fulfilled'
                    ? extremesResult.value
                    : null,
              },
            }),
          );

          return;
        }

        if (
          tab ===
          'air-quality'
        ) {
          const response =
            await weatherService.getAirQuality(
              city,
              forceRefresh,
            );

          if (
            currentRequest !==
            requestSequence.current
          ) {
            return;
          }

          setAirQualityByCity(
            (currentData) => ({
              ...currentData,
              [cityKey]:
                response,
            }),
          );

          return;
        }

        if (
          tab ===
          'agriculture'
        ) {
          const response =
            await weatherService.getAgricultureRecommendations(
              city,
              forceRefresh,
            );

          if (
            currentRequest !==
            requestSequence.current
          ) {
            return;
          }

          setAgricultureByCity(
            (currentData) => ({
              ...currentData,
              [cityKey]:
                response,
            }),
          );

          return;
        }

        const response =
          await weatherService.getLifestyleRecommendations(
            city,
            forceRefresh,
          );

        if (
          currentRequest !==
          requestSequence.current
        ) {
          return;
        }

        setLifestyleByCity(
          (currentData) => ({
            ...currentData,
            [cityKey]:
              response,
          }),
        );
      } catch (
        requestError: unknown
      ) {
        if (
          currentRequest !==
          requestSequence.current
        ) {
          return;
        }

        setErrors(
          (
            currentErrors,
          ) => ({
            ...currentErrors,

            [key]:
              getRequestError(
                requestError,
              ),
          }),
        );
      } finally {
        if (
          currentRequest ===
          requestSequence.current
        ) {
          setLoadingKey(null);
        }
      }
    },
    [city],
  );

  useEffect(() => {
    if (hasCurrentData) {
      return;
    }

    const timeoutId =
      window.setTimeout(
        () => {
          void loadTab(
            activeTab,
          );
        },
        0,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );

      requestSequence.current +=
        1;
    };
  }, [
    activeTab,
    hasCurrentData,
    loadTab,
  ]);

  const isLoading =
    loadingKey ===
    currentKey;

  const currentError =
    errors[currentKey];

  const renderOverview =
    () => {
      const overview =
        overviewByCity[
          normalizedCity
        ];

      if (!overview) {
        return null;
      }

      const analysis =
        overview.summary
          ?.analysis;

      const temperature =
        analysis
          ?.temperature_analysis
          ?.avg_temp;

      const humidity =
        analysis
          ?.humidity_analysis
          ?.avg_humidity;

      const rainfall =
        analysis
          ?.precipitation_analysis
          ?.total_rain;

      const windSpeed =
        analysis
          ?.wind_analysis
          ?.avg_wind_speed;

      const trends =
        overview.trends
          ?.trend_comparison ??
        overview.summary
          ?.comparison_trend;

      const temperatureTrend =
        trends?.temperature;

      const precipitationTrend =
        trends?.precipitation;

      const humidityTrend =
        trends?.humidity;

      const windTrend =
        trends?.wind;

      const extremes =
        overview.extremes;

      return (
        <div className="analysis-page__overview">
          <div className="analysis-page__metrics">
            <WeatherMetricCard
              label="Nhiệt độ trung bình"
              value={
                temperature ===
                undefined
                  ? '—'
                  : formatTemperature(
                      temperature,
                      1,
                    )
              }
              icon={
                <Thermometer />
              }
              tone="temperature"
            />

            <WeatherMetricCard
              label="Độ ẩm trung bình"
              value={
                humidity ===
                undefined
                  ? '—'
                  : formatPercentage(
                      humidity,
                      1,
                    )
              }
              icon={
                <Droplets />
              }
              tone="humidity"
              progress={
                humidity
              }
            />

            <WeatherMetricCard
              label="Tổng lượng mưa"
              value={
                rainfall ===
                undefined
                  ? '—'
                  : formatRainfall(
                      rainfall,
                    )
              }
              icon={
                <CloudRain />
              }
              tone="rain"
            />

            <WeatherMetricCard
              label="Gió trung bình"
              value={
                windSpeed ===
                undefined
                  ? '—'
                  : formatWindSpeed(
                      windSpeed,
                      1,
                    )
              }
              icon={<Wind />}
              tone="wind"
            />
          </div>

          {trends && (
            <div className="analysis-page__metrics">
              <WeatherMetricCard
                label="Xu hướng nhiệt độ"
                value={
                  temperatureTrend
                    ? formatTemperature(
                        temperatureTrend.forecast_avg,
                        1,
                      )
                    : '—'
                }
                description={
                  temperatureTrend
                    ? `${temperatureTrend.trend} · Chênh lệch ${temperatureTrend.difference.toFixed(1)}°C`
                    : 'Chưa có dữ liệu'
                }
                icon={
                  <Thermometer />
                }
                tone="temperature"
              />

              <WeatherMetricCard
                label="Xu hướng lượng mưa"
                value={
                  precipitationTrend
                    ? formatRainfall(
                        precipitationTrend.forecast_total,
                      )
                    : '—'
                }
                description={
                  precipitationTrend
                    ? `${precipitationTrend.trend} · Chênh lệch ${precipitationTrend.difference.toFixed(1)} mm`
                    : 'Chưa có dữ liệu'
                }
                icon={
                  <CloudRain />
                }
                tone="rain"
              />

              <WeatherMetricCard
                label="Xu hướng độ ẩm"
                value={
                  humidityTrend
                    ? formatPercentage(
                        humidityTrend.forecast_avg,
                        1,
                      )
                    : '—'
                }
                description={
                  humidityTrend
                    ? `${humidityTrend.trend} · Chênh lệch ${humidityTrend.difference.toFixed(1)}%`
                    : 'Chưa có dữ liệu'
                }
                icon={
                  <Droplets />
                }
                tone="humidity"
              />

              <WeatherMetricCard
                label="Xu hướng gió"
                value={
                  windTrend
                    ? formatWindSpeed(
                        windTrend.forecast_avg_speed,
                        1,
                      )
                    : '—'
                }
                description={
                  windTrend
                    ? `${windTrend.trend} · Chênh lệch ${windTrend.difference.toFixed(1)} km/h`
                    : 'Chưa có dữ liệu'
                }
                icon={<Wind />}
                tone="wind"
              />
            </div>
          )}

          {trends?.overall_trend_summary && (
            <ExtremeWeatherAlert
              severity="info"
              title="Xu hướng thời tiết"
              message={
                trends.overall_trend_summary
              }
            />
          )}

          <ExtremeWeatherAlert
            severity={mapExtremeSeverity(
              extremes
                ?.overall_severity,
            )}
            title={
              extremes
                ? `${extremes.total_alerts} cảnh báo thời tiết`
                : 'Phân tích hiện tượng cực đoan'
            }
            message={
              extremes?.summary ??
              'Backend chưa trả dữ liệu phân tích hiện tượng cực đoan.'
            }
            advice={
              extremes
                ?.alerts?.[0]
                ?.advice ??
              undefined
            }
          />
        </div>
      );
    };

  const renderAirQuality =
    () => {
      const response =
        airQualityByCity[
          normalizedCity
        ];

      if (!response) {
        return null;
      }

      const airQuality =
        response.air_quality;

      const aqi = toNumber(
        airQuality.aqi,
        0,
      );

      return (
        <AirQualityCard
          aqi={aqi}
          pollutants={buildPollutants(
            airQuality,
          )}
          summary={toText(
            airQuality.description,

            toText(
              airQuality.health_effects,
              '',
            ),
          )}
        />
      );
    };

  const renderAgriculture =
  () => {
    const response =
      agricultureByCity[
        normalizedCity
      ];

    if (!response) {
      return null;
    }

    return (
      <div className="analysis-page__agriculture">
        <AgricultureRecommendation
          items={buildAgricultureItems(
            response
              .agriculture_recommendations,
          )}
        />

        <CropPredictionPanel />
      </div>
    );
  };

  const renderLifestyle =
    () => {
      const response =
        lifestyleByCity[
          normalizedCity
        ];

      if (!response) {
        return null;
      }

      return (
        <LifestyleRecommendation
          items={buildLifestyleItems(
            response
              .lifestyle_recommendations,
          )}
        />
      );
    };

  return (
    <div className="analysis-page page-container">
      <PageHeader
        eyebrow="Phân tích thông minh"
        title={`Dữ liệu phân tích cho ${city}`}
        description="Chất lượng không khí, xu hướng thời tiết và các khuyến nghị theo khu vực"
        icon={<BarChart3 />}
        actions={
          <button
            className="app-button app-button--secondary"
            type="button"
            onClick={() => {
              void loadTab(
                activeTab,
                true,
              );
            }}
            disabled={
              isLoading
            }
          >
            <RefreshCw
              className={
                isLoading
                  ? 'analysis-page__spinner'
                  : ''
              }
              aria-hidden="true"
            />

            <span>
              {isLoading
                ? 'Đang tải...'
                : 'Làm mới'}
            </span>
          </button>
        }
      />

      <nav
        className="analysis-page__tabs"
        aria-label="Nhóm phân tích"
      >
        {analysisTabs.map(
          (tab) => (
            <button
              className={
                activeTab ===
                tab.id
                  ? 'analysis-page__tab analysis-page__tab--active'
                  : 'analysis-page__tab'
              }
              type="button"
              key={tab.id}
              onClick={() => {
                setActiveTab(
                  tab.id,
                );
              }}
            >
              {tab.label}
            </button>
          ),
        )}
      </nav>

      <section className="analysis-page__content">
        {isLoading &&
        !hasCurrentData ? (
          <LoadingSkeleton
            variant="cards"
            cardCount={4}
            message="Đang tải dữ liệu phân tích..."
          />
        ) : currentError &&
          !hasCurrentData ? (
          <ErrorState
            title="Không thể tải phân tích"
            message={
              currentError
            }
            onRetry={() =>
              loadTab(
                activeTab,
                true,
              )
            }
          />
        ) : (
          <>
            {activeTab ===
              'overview' &&
              renderOverview()}

            {activeTab ===
              'air-quality' &&
              renderAirQuality()}

            {activeTab ===
              'agriculture' &&
              renderAgriculture()}

            {activeTab ===
              'lifestyle' &&
              renderLifestyle()}
          </>
        )}
      </section>
    </div>
  );
}

export default AnalysisPage;