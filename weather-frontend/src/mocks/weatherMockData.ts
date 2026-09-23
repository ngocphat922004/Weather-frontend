import type {
  AgricultureRecommendationResponse,
  AirQualityResponse,
  CropEvaluationItem,
  CropPredictionInput,
  CropPredictionResponse,
  CurrentWeatherApiResponse,
  ExtremeWeatherResponse,
  JsonObject,
  LifestyleRecommendationResponse,
  LocationData,
  OverviewRecommendationResponse,
  Weather15DaysApiResponse,
  WeatherAlertItem,
  WeatherAlertsApiResponse,
  WeatherAnalysisSummaryResponse,
  WeatherDailyItem,
  WeatherTrendComparison,
  WeatherTrendsApiResponse,
} from '../types/weather';

const MOCK_WARNING =
  'API thời tiết hiện không khả dụng. Hệ thống đang hiển thị dữ liệu mô phỏng để bạn vẫn có thể sử dụng giao diện.';

const CITY_PRESETS: Record<
  string,
  Pick<LocationData, 'name' | 'lat' | 'lon' | 'country' | 'state' | 'timezone'>
> = {
  'ho chi minh city': {
    name: 'Ho Chi Minh City',
    lat: 10.8231,
    lon: 106.6297,
    country: 'Vietnam',
    state: 'Ho Chi Minh City',
    timezone: 'Asia/Ho_Chi_Minh',
  },

  'hồ chí minh': {
    name: 'Hồ Chí Minh',
    lat: 10.8231,
    lon: 106.6297,
    country: 'Vietnam',
    state: 'Ho Chi Minh City',
    timezone: 'Asia/Ho_Chi_Minh',
  },

  'ho chi minh': {
    name: 'Ho Chi Minh',
    lat: 10.8231,
    lon: 106.6297,
    country: 'Vietnam',
    state: 'Ho Chi Minh City',
    timezone: 'Asia/Ho_Chi_Minh',
  },

  hanoi: {
    name: 'Hanoi',
    lat: 21.0278,
    lon: 105.8342,
    country: 'Vietnam',
    state: 'Hanoi',
    timezone: 'Asia/Ho_Chi_Minh',
  },

  'hà nội': {
    name: 'Hà Nội',
    lat: 21.0278,
    lon: 105.8342,
    country: 'Vietnam',
    state: 'Hanoi',
    timezone: 'Asia/Ho_Chi_Minh',
  },

  'da nang': {
    name: 'Da Nang',
    lat: 16.0544,
    lon: 108.2022,
    country: 'Vietnam',
    state: 'Da Nang',
    timezone: 'Asia/Ho_Chi_Minh',
  },

  'đà nẵng': {
    name: 'Đà Nẵng',
    lat: 16.0544,
    lon: 108.2022,
    country: 'Vietnam',
    state: 'Da Nang',
    timezone: 'Asia/Ho_Chi_Minh',
  },
};

function normalizeCity(city: string): string {
  return city.trim().replace(/\s+/g, ' ');
}

function getMockLocation(city: string): LocationData {
  const normalizedCity = normalizeCity(city) || 'Ho Chi Minh City';

  const preset =
    CITY_PRESETS[normalizedCity.toLocaleLowerCase()];

  if (preset) {
    return {
      ...preset,
    };
  }

  return {
    name: normalizedCity,
    lat: 10.8231,
    lon: 106.6297,
    country: 'Vietnam',
    state: null,
    timezone: 'Asia/Ho_Chi_Minh',
  };
}

function formatLocalDate(offsetDays: number): string {
  const date = new Date();

  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildDailyWeather(): WeatherDailyItem[] {
  const temperatureOffsets = [
    -0.7,
    -0.3,
    0.2,
    -0.2,
    0.5,
    0.8,
    0.1,
    0.6,
    0.9,
    0.4,
    -0.1,
    0.7,
    1.1,
    0.3,
    0.8,
  ];

  const rainValues = [
    4.2,
    1.4,
    0.3,
    8.8,
    12.6,
    2.1,
    0.0,
    3.4,
    7.8,
    1.2,
    0.0,
    5.6,
    9.1,
    2.7,
    0.8,
  ];

  return Array.from(
    {
      length: 15,
    },
    (_, index) => {
      const offset = index - 7;

      const temperatureOffset =
        temperatureOffsets[index] ?? 0;

      const rain =
        rainValues[index] ?? 0;

      const maximum =
        31.5 + temperatureOffset;

      const minimum =
        24.6 + temperatureOffset * 0.45;

      const humidity = Math.round(
        70 +
          Math.min(rain, 10) * 0.8 +
          (index % 3),
      );

      const rainProbability = Math.min(
        92,
        Math.round(
          24 + rain * 5.2,
        ),
      );

      const weatherCode =
        rain >= 8
          ? 61
          : rain >= 3
            ? 51
            : index % 4 === 0
              ? 3
              : 2;

      return {
        date: formatLocalDate(offset),

        temperature: {
          max: Number(
            maximum.toFixed(1),
          ),

          min: Number(
            minimum.toFixed(1),
          ),
        },

        feels_like: {
          max: Number(
            (maximum + 2.5).toFixed(1),
          ),

          min: Number(
            (minimum + 1.2).toFixed(1),
          ),
        },

        humidity,

        precipitation: rain,

        rain,

        rain_probability:
          rainProbability,

        wind_speed: Number(
          (
            9.5 +
            (index % 5) * 1.4
          ).toFixed(1),
        ),

        weather_code:
          weatherCode,
      };
    },
  );
}

function buildTrendComparison(): WeatherTrendComparison {
  return {
    temperature: {
      history_avg: 28.1,
      forecast_avg: 28.8,
      difference: 0.7,
      trend: 'Tăng nhẹ',
    },

    precipitation: {
      history_total: 29.4,
      forecast_total: 30.6,
      difference: 1.2,
      trend: 'Ổn định',
    },

    humidity: {
      history_avg: 74.2,
      forecast_avg: 75.1,
      difference: 0.9,
      trend: 'Tăng nhẹ',
    },

    wind: {
      history_avg_speed: 11.1,
      forecast_avg_speed: 11.8,
      difference: 0.7,
      trend: 'Ổn định',
    },

    overall_trend_summary:
      'Nhiệt độ và độ ẩm có xu hướng tăng nhẹ; mưa và gió nhìn chung ổn định trong giai đoạn dự báo.',
  };
}

function buildAnalysis() {
  return {
    temperature_analysis: {
      avg_temp: 28.4,
      max_temp: 32.6,
      min_temp: 24.2,
      temp_amplitude_avg: 7.8,
      trend: 'Tăng nhẹ',

      trend_description:
        'Nhiệt độ trung bình có xu hướng tăng nhẹ trong các ngày tới.',
    },

    apparent_temperature_analysis: {
      avg_feels_like: 31.2,
      max_feels_like: 35.4,
      min_feels_like: 25.7,
    },

    precipitation_analysis: {
      total_rain: 60.0,
      avg_rain: 4.0,
      rainy_days_count: 11,
      rainy_days_ratio: 73.3,
      max_rain_day:
        formatLocalDate(-3),
      max_rain_amount: 12.6,

      rain_evaluation:
        'Mưa rào rải rác, tập trung vào chiều và tối.',
    },

    wind_analysis: {
      max_wind_speed: 15.1,
      avg_wind_speed: 11.4,
      min_wind_speed: 8.8,
      wind_scale_level: 3,
      wind_category: 'Gió nhẹ',
      unit: 'km/h',
    },

    humidity_analysis: {
      avg_humidity: 75.3,
      max_humidity: 83,
      min_humidity: 68,
      evaluation:
        'Độ ẩm khá cao.',
    },
  };
}

function buildAlerts(): WeatherAlertItem[] {
  return [
    {
      date: formatLocalDate(0),

      type:
        'Mưa rào cục bộ',

      level:
        'INFO',

      message:
        'Có khả năng xuất hiện mưa rào ngắn vào chiều tối.',

      advice:
        'Nên mang theo áo mưa hoặc ô khi di chuyển ngoài trời.',
    },
  ];
}

function buildAirQuality(): JsonObject {
  return {
    aqi: 58,

    level:
      'Trung bình',

    description:
      'Chất lượng không khí ở mức trung bình; đa số người dùng có thể sinh hoạt bình thường.',

    health_effects:
      'Người nhạy cảm nên cân nhắc giảm hoạt động ngoài trời kéo dài khi cảm thấy khó chịu.',

    pollutants: {
      pm2_5: {
        name: 'PM2.5',
        value: 18.4,
        unit: 'µg/m³',
        description:
          'Bụi mịn PM2.5',
      },

      pm10: {
        name: 'PM10',
        value: 34.2,
        unit: 'µg/m³',
        description:
          'Bụi PM10',
      },

      co: {
        name: 'CO',
        value: 410,
        unit: 'µg/m³',
        description:
          'Carbon monoxide',
      },

      no2: {
        name: 'NO₂',
        value: 21.5,
        unit: 'µg/m³',
        description:
          'Nitrogen dioxide',
      },

      so2: {
        name: 'SO₂',
        value: 7.8,
        unit: 'µg/m³',
        description:
          'Sulfur dioxide',
      },

      o3: {
        name: 'O₃',
        value: 52.1,
        unit: 'µg/m³',
        description:
          'Ozone tầng mặt đất',
      },
    },
  };
}

function buildLifestyle(): JsonObject {
  return {
    weather_condition: {
      weather_name:
        'Nhiều mây, có mưa rào',

      rain_probability: 62,

      wind_category:
        'Gió nhẹ',
    },

    clothing_recommendation: {
      summary:
        'Ưu tiên trang phục thoáng, nhẹ và dễ khô do thời tiết nóng ẩm.',

      accessories_and_gears: [
        'Mang theo ô hoặc áo mưa gọn nhẹ.',

        'Nên dùng kem chống nắng khi hoạt động ngoài trời ban ngày.',
      ],
    },

    outdoor_activities: [
      {
        name:
          'Đi bộ / chạy bộ',

        description:
          'Phù hợp vào sáng sớm; hạn chế thời điểm nắng gắt giữa trưa.',

        status:
          'Phù hợp',
      },

      {
        name:
          'Hoạt động ngoài trời buổi chiều',

        description:
          'Có khả năng mưa rào, nên theo dõi thời tiết trước khi ra ngoài.',

        status:
          'Lưu ý',
      },
    ],

    health_and_safety_advice: [
      'Uống đủ nước do nhiệt độ và độ ẩm tương đối cao.',

      'Người nhạy cảm với chất lượng không khí nên tránh vận động quá lâu gần đường đông xe.',
    ],

    commute_and_travel: {
      road_condition:
        'Mặt đường có thể trơn trong thời gian mưa rào.',

      travel_advice: [
        'Mang theo áo mưa khi di chuyển bằng xe máy.',

        'Giảm tốc độ khi trời mưa và giữ khoảng cách an toàn.',
      ],
    },
  };
}

function buildCropItems(): CropEvaluationItem[] {
  return [
    {
      crop_id:
        'water-spinach',

      name:
        'Rau muống',

      category:
        'Rau ăn lá',

      icon:
        '🌿',

      suitability_score: 91,

      fit_level:
        'Rất phù hợp',

      reasons: [
        'Nhiệt độ ấm',
        'Độ ẩm cao',
        'Nguồn nước thuận lợi',
      ],

      care_tips:
        'Giữ đất đủ ẩm và bảo đảm thoát nước sau mưa lớn.',

      disease_risk:
        'Theo dõi sâu ăn lá và nấm bệnh khi độ ẩm duy trì cao.',
    },

    {
      crop_id:
        'cucumber',

      name:
        'Dưa leo',

      category:
        'Rau quả',

      icon:
        '🥒',

      suitability_score: 86,

      fit_level:
        'Phù hợp',

      reasons: [
        'Nhiệt độ thích hợp',
        'Ẩm độ tốt',
      ],

      care_tips:
        'Làm giàn thông thoáng và tránh để rễ bị úng.',

      disease_risk:
        'Có nguy cơ nấm lá khi mưa liên tục.',
    },

    {
      crop_id:
        'okra',

      name:
        'Đậu bắp',

      category:
        'Rau quả',

      icon:
        '🌱',

      suitability_score: 82,

      fit_level:
        'Phù hợp',

      reasons: [
        'Chịu nóng tốt',
        'Phù hợp khí hậu nhiệt đới',
      ],

      care_tips:
        'Bổ sung hữu cơ và giữ đất tơi xốp.',

      disease_risk:
        'Nguy cơ sâu chích hút ở mức trung bình.',
    },

    {
      crop_id:
        'basil',

      name:
        'Húng quế',

      category:
        'Rau gia vị',

      icon:
        '🌿',

      suitability_score: 79,

      fit_level:
        'Khá phù hợp',

      reasons: [
        'Nhiệt độ ấm',
        'Sinh trưởng nhanh',
      ],

      care_tips:
        'Tỉa ngọn thường xuyên và tránh ngập úng.',

      disease_risk:
        'Có thể xuất hiện nấm nếu tán lá quá dày.',
    },

    {
      crop_id:
        'tomato',

      name:
        'Cà chua',

      category:
        'Rau quả',

      icon:
        '🍅',

      suitability_score: 72,

      fit_level:
        'Có thể trồng',

      reasons: [
        'Nhiệt độ chấp nhận được',
      ],

      care_tips:
        'Cần che mưa và tăng thông thoáng trong giai đoạn ẩm cao.',

      disease_risk:
        'Nguy cơ bệnh nấm tăng khi mưa nhiều và ẩm kéo dài.',
    },
  ];
}

function buildAgriculture(): JsonObject {
  const crops =
    buildCropItems();

  return {
    location_info: {
      region:
        'Nam Bộ',

      climate_type:
        'Nhiệt đới gió mùa',

      current_season:
        'Mùa Mưa',

      season_description:
        'Nóng ẩm, thường có mưa rào vào chiều tối.',
    },

    weather_summary: {
      avg_temperature: 28.4,

      min_temperature: 24.2,

      max_temperature: 32.6,

      avg_humidity: 75.3,

      total_rain_15d: 60,

      estimated_monthly_rain: 120,
    },

    irrigation_and_soil_plan:
      'Giảm tưới khi có mưa, ưu tiên rãnh thoát nước và giữ đất tơi xốp để hạn chế úng rễ.',

    agricultural_weather_risks: [
      {
        risk:
          'Ẩm độ cao',

        severity:
          'WARNING',

        message:
          'Ẩm độ cao làm tăng nguy cơ nấm bệnh trên cây trồng.',
      },

      {
        risk:
          'Mưa rào cục bộ',

        severity:
          'INFO',

        message:
          'Cần kiểm tra hệ thống thoát nước sau các đợt mưa lớn.',
      },
    ],

    top_recommended_crops:
      crops
        .slice(0, 3)
        .map(
          (crop) =>
            ({
              ...crop,
            }) as JsonObject,
        ),

    all_crops_evaluation:
      crops.map(
        (crop) =>
          ({
            ...crop,
          }) as JsonObject,
      ),
  };
}

function buildExtremeAlertsJson(): JsonObject {
  return {
    overall_severity:
      'INFO',

    total_alerts: 1,

    summary:
      'Không có hiện tượng thời tiết cực đoan nghiêm trọng; lưu ý mưa rào cục bộ.',

    alerts:
      buildAlerts().map(
        (alert) =>
          ({
            ...alert,
          }) as JsonObject,
      ),

    historical_comparison: {
      historical_temp_avg: 28.1,

      current_temp_avg: 28.4,

      temperature_deviation: 0.3,

      temperature_status:
        'Gần mức trung bình',

      historical_rain_total: 57.8,

      current_rain_total: 60,

      rain_deviation: 2.2,

      rain_status:
        'Nhỉnh hơn trung bình',
    },
  };
}

export function createMockCurrentWeather(
  city: string,
): CurrentWeatherApiResponse {
  return {
    success: true,

    is_fallback: true,

    fallback_warning:
      MOCK_WARNING,

    cached_at:
      new Date().toISOString(),

    location:
      getMockLocation(city),

    current: {
      temperature: 30.2,

      feels_like: 33.7,

      humidity: 74,

      precipitation: 0.4,

      wind_speed: 11.6,

      weather_code: 2,
    },
  };
}

export function createMockWeather15Days(
  city: string,
): Weather15DaysApiResponse {
  return {
    success: true,

    is_fallback: true,

    fallback_warning:
      MOCK_WARNING,

    cached_at:
      new Date().toISOString(),

    location:
      getMockLocation(city),

    period: {
      past_days: 7,

      today: 1,

      future_days: 7,

      total_days: 15,
    },

    analysis:
      buildAnalysis(),

    comparison_trend:
      buildTrendComparison(),

    daily:
      buildDailyWeather(),
  };
}

export function createMockWeatherAlerts(
  city: string,
): WeatherAlertsApiResponse {
  const location =
    getMockLocation(city);

  return {
    success: true,

    message:
      MOCK_WARNING,

    location: {
      name:
        location.name,

      country:
        location.country ??
        'Vietnam',
    },

    alerts_data: {
      overall_severity:
        'INFO',

      total_alerts: 1,

      summary:
        'Không có cảnh báo nghiêm trọng; lưu ý mưa rào cục bộ vào chiều tối.',

      alerts:
        buildAlerts(),

      historical_comparison: {
        historical_temp_avg: 28.1,

        current_temp_avg: 28.4,

        temperature_deviation: 0.3,

        temperature_status:
          'Gần mức trung bình',

        historical_rain_total: 57.8,

        current_rain_total: 60,

        rain_deviation: 2.2,

        rain_status:
          'Nhỉnh hơn trung bình',
      },
    },
  };
}

export function createMockAnalysisSummary(
  city: string,
): WeatherAnalysisSummaryResponse {
  return {
    success: true,

    location:
      getMockLocation(city),

    period: {
      past_days: 7,

      today: 1,

      future_days: 7,

      total_days: 15,
    },

    analysis:
      buildAnalysis(),

    comparison_trend:
      buildTrendComparison(),
  };
}

export function createMockAnalysisTrends(
  city: string,
): WeatherTrendsApiResponse {
  return {
    success: true,

    location:
      getMockLocation(city),

    trend_comparison:
      buildTrendComparison(),
  };
}

export function createMockExtremeWeather(
  city: string,
): ExtremeWeatherResponse {
  return {
    success: true,

    location:
      getMockLocation(city),

    overall_severity:
      'INFO',

    total_alerts: 1,

    summary:
      'Không có hiện tượng thời tiết cực đoan nghiêm trọng; lưu ý mưa rào cục bộ.',

    alerts:
      buildAlerts(),

    historical_comparison: {
      historical_temp_avg: 28.1,

      current_temp_avg: 28.4,

      temperature_deviation: 0.3,

      temperature_status:
        'Gần mức trung bình',

      historical_rain_total: 57.8,

      current_rain_total: 60,

      rain_deviation: 2.2,

      rain_status:
        'Nhỉnh hơn trung bình',
    },
  };
}

export function createMockAirQuality(
  city: string,
): AirQualityResponse {
  return {
    success: true,

    is_fallback: true,

    fallback_warning:
      MOCK_WARNING,

    location:
      getMockLocation(city),

    air_quality:
      buildAirQuality(),
  };
}

export function createMockLifestyle(
  city: string,
): LifestyleRecommendationResponse {
  return {
    success: true,

    is_fallback: true,

    fallback_warning:
      MOCK_WARNING,

    location:
      getMockLocation(city),

    lifestyle_recommendations:
      buildLifestyle(),
  };
}

export function createMockAgriculture(
  city: string,
): AgricultureRecommendationResponse {
  return {
    success: true,

    is_fallback: true,

    fallback_warning:
      MOCK_WARNING,

    location:
      getMockLocation(city),

    agriculture_recommendations:
      buildAgriculture(),
  };
}

export function createMockOverview(
  city: string,
): OverviewRecommendationResponse {
  const current =
    createMockCurrentWeather(city);

  return {
    success: true,

    is_fallback: true,

    fallback_warning:
      MOCK_WARNING,

    location:
      getMockLocation(city),

    current_weather: {
      temperature:
        current.current.temperature,

      feels_like:
        current.current.feels_like,

      humidity:
        current.current.humidity,

      precipitation:
        current.current.precipitation,

      wind_speed:
        current.current.wind_speed,

      weather_code:
        current.current.weather_code,
    },

    air_quality:
      buildAirQuality(),

    extreme_alerts:
      buildExtremeAlertsJson(),

    lifestyle_recommendations:
      buildLifestyle(),

    agriculture_recommendations:
      buildAgriculture(),
  };
}

export function createMockCropPrediction(
  payload: CropPredictionInput,
): CropPredictionResponse {
  const baseCrops =
    buildCropItems();

  const heatPenalty =
    Math.max(
      0,
      Math.abs(
        payload.temperature - 28,
      ) * 1.5,
    );

  const humidityPenalty =
    Math.max(
      0,
      Math.abs(
        payload.humidity - 75,
      ) * 0.15,
    );

  const rainPenalty =
    payload.rainfall > 250
      ? 8
      : payload.rainfall < 20
        ? 6
        : 0;

  const crops =
    baseCrops.map(
      (
        crop,
        index,
      ) => ({
        ...crop,

        suitability_score:
          Math.max(
            45,

            Math.min(
              96,

              Math.round(
                crop.suitability_score -
                  heatPenalty -
                  humidityPenalty -
                  rainPenalty -
                  index,
              ),
            ),
          ),
      }),
    );

  return {
    success: true,

    input: {
      temperature:
        payload.temperature,

      humidity:
        payload.humidity,

      rainfall:
        payload.rainfall,

      temp_min:
        payload.temp_min ??
        null,

      temp_max:
        payload.temp_max ??
        null,

      region_code:
        payload.region_code ??
        'bac_bo',

      season:
        payload.season ??
        'Mùa Mưa',
    },

    prediction_results: {
      location_info: {
        city:
          'Dữ liệu mô phỏng',

        region:
          payload.region_code ??
          'bac_bo',

        climate_type:
          'Nhiệt đới gió mùa',

        current_season:
          payload.season ??
          'Mùa Mưa',

        season_description:
          'Kết quả được mô phỏng khi dịch vụ dự đoán không khả dụng.',
      },

      weather_summary: {
        avg_temperature:
          payload.temperature,

        min_temperature:
          payload.temp_min ??
          payload.temperature - 3,

        max_temperature:
          payload.temp_max ??
          payload.temperature + 3,

        avg_humidity:
          payload.humidity,

        total_rain_15d:
          payload.rainfall,

        estimated_monthly_rain:
          Number(
            (
              payload.rainfall * 2
            ).toFixed(1),
          ),
      },

      irrigation_and_soil_plan:
        payload.rainfall >= 120
          ? 'Ưu tiên thoát nước, giảm lượng tưới và kiểm tra độ ẩm đất trước mỗi lần tưới.'
          : 'Duy trì tưới đều, phủ gốc để giữ ẩm và tránh để đất khô kéo dài.',

      agricultural_weather_risks: [
        {
          risk:
            payload.humidity >= 80
              ? 'Độ ẩm cao'
              : 'Biến động thời tiết',

          severity:
            payload.humidity >= 80
              ? 'WARNING'
              : 'INFO',

          message:
            payload.humidity >= 80
              ? 'Độ ẩm cao có thể làm tăng nguy cơ nấm bệnh; cần tăng thông thoáng.'
              : 'Theo dõi nhiệt độ, lượng mưa và độ ẩm để điều chỉnh chăm sóc cây trồng.',
        },
      ],

      top_recommended_crops:
        crops.slice(0, 3),

      all_crops_evaluation:
        crops,
    },
  };
}

export const weatherMockData = {
  current:
    createMockCurrentWeather,

  forecast15Days:
    createMockWeather15Days,

  alerts:
    createMockWeatherAlerts,

  analysisSummary:
    createMockAnalysisSummary,

  analysisTrends:
    createMockAnalysisTrends,

  extremes:
    createMockExtremeWeather,

  airQuality:
    createMockAirQuality,

  lifestyle:
    createMockLifestyle,

  agriculture:
    createMockAgriculture,

  overview:
    createMockOverview,

  predictCrops:
    createMockCropPrediction,
};

export default weatherMockData;