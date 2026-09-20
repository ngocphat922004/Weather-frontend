import {
  AlertTriangle,
  LoaderCircle,
  Sprout,
} from 'lucide-react';

import {
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import weatherService from '../../services/weatherService';

import type {
  AgricultureRecommendationItem,
} from './AgricultureRecommendation';

import AgricultureRecommendation from './AgricultureRecommendation';

interface CropPredictionForm {
  temperature: string;
  humidity: string;
  rainfall: string;
  tempMin: string;
  tempMax: string;
  regionCode: string;
  season: string;
}

const initialForm: CropPredictionForm = {
  temperature: '28',
  humidity: '75',
  rainfall: '100',
  tempMin: '24',
  tempMax: '32',
  regionCode: 'bac_bo',
  season: 'Mùa Mưa',
};

function parseRequiredNumber(
  value: string,
  label: string,
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `${label} không hợp lệ.`,
    );
  }

  return parsed;
}

function parseOptionalNumber(
  value: string,
): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function CropPredictionPanel() {
  const [form, setForm] =
    useState<CropPredictionForm>(
      initialForm,
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [items, setItems] =
    useState<
      AgricultureRecommendationItem[]
    >([]);

  const [hasResult, setHasResult] =
    useState(false);

  const canSubmit = useMemo(
    () =>
      form.temperature.trim() !== '' &&
      form.humidity.trim() !== '' &&
      form.rainfall.trim() !== '',
    [
      form.temperature,
      form.humidity,
      form.rainfall,
    ],
  );

  const updateField = (
    field: keyof CropPredictionForm,
    value: string,
  ) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setHasResult(false);

      const temperature =
        parseRequiredNumber(
          form.temperature,
          'Nhiệt độ',
        );

      const humidity =
        parseRequiredNumber(
          form.humidity,
          'Độ ẩm',
        );

      const rainfall =
        parseRequiredNumber(
          form.rainfall,
          'Lượng mưa',
        );

      if (
        humidity < 0 ||
        humidity > 100
      ) {
        throw new Error(
          'Độ ẩm phải nằm trong khoảng 0 đến 100%.',
        );
      }

      if (rainfall < 0) {
        throw new Error(
          'Lượng mưa không được nhỏ hơn 0.',
        );
      }

      const tempMin =
        parseOptionalNumber(
          form.tempMin,
        );

      const tempMax =
        parseOptionalNumber(
          form.tempMax,
        );

      if (
        tempMin !== null &&
        tempMax !== null &&
        tempMin > tempMax
      ) {
        throw new Error(
          'Nhiệt độ thấp nhất không được lớn hơn nhiệt độ cao nhất.',
        );
      }

      const response =
        await weatherService.predictCrops(
          {
            temperature,
            humidity,
            rainfall,
            temp_min: tempMin,
            temp_max: tempMax,
            region_code:
              form.regionCode.trim() ||
              undefined,
            season:
              form.season.trim() ||
              undefined,
          },
        );

      const result =
        response.prediction_results;

      const nextItems:
        AgricultureRecommendationItem[] =
        [];

      result.top_recommended_crops
        .slice(0, 5)
        .forEach(
          (crop, index) => {
            const details = [
              crop.fit_level,
              `Độ phù hợp ${crop.suitability_score}%`,
              crop.care_tips,
            ]
              .filter(Boolean)
              .join(' · ');

            nextItems.push({
              id:
                crop.crop_id ||
                `prediction-${index}`,
              title: crop.name,
              description: details,
              category: 'crop',
            });

            if (
              index === 0 &&
              crop.disease_risk
            ) {
              nextItems.push({
                id: `disease-${crop.crop_id}`,
                title: `Nguy cơ với ${crop.name}`,
                description:
                  crop.disease_risk,
                category: 'pest',
                status: 'warning',
              });
            }
          },
        );

      result.agricultural_weather_risks
        .slice(0, 3)
        .forEach(
          (risk, index) => {
            const severity =
              risk.severity.toUpperCase();

            nextItems.push({
              id: `prediction-risk-${index}`,
              title: risk.risk,
              description:
                risk.message,
              category: 'weather',
              status:
                severity ===
                  'WARNING' ||
                severity ===
                  'CRITICAL'
                  ? 'warning'
                  : 'normal',
            });
          },
        );

      if (
        result.irrigation_and_soil_plan
      ) {
        nextItems.push({
          id: 'prediction-irrigation',
          title:
            'Kế hoạch tưới và đất',
          description:
            result.irrigation_and_soil_plan,
          category: 'irrigation',
        });
      }

      setItems(nextItems);
      setHasResult(true);
    } catch (
      requestError: unknown
    ) {
      setItems([]);

      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Không thể dự đoán cây trồng.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setItems([]);
    setError(null);
    setHasResult(false);
  };

  return (
    <section className="crop-prediction app-card">
      <header className="crop-prediction__header">
        <div>
          <span className="crop-prediction__eyebrow">
            <Sprout
              aria-hidden="true"
            />
            Crop Prediction
          </span>

          <h2>
            Dự đoán cây trồng
          </h2>

          <p>
            Nhập điều kiện thời tiết để tìm cây trồng phù hợp
          </p>
        </div>
      </header>

      <form
        className="crop-prediction__form"
        onSubmit={handleSubmit}
      >
        <label>
          <span>
            Nhiệt độ trung bình
          </span>

          <input
            type="number"
            step="0.1"
            value={
              form.temperature
            }
            onChange={(event) =>
              updateField(
                'temperature',
                event.target.value,
              )
            }
            required
          />

          <small>°C</small>
        </label>

        <label>
          <span>Độ ẩm</span>

          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.humidity}
            onChange={(event) =>
              updateField(
                'humidity',
                event.target.value,
              )
            }
            required
          />

          <small>%</small>
        </label>

        <label>
          <span>Lượng mưa</span>

          <input
            type="number"
            min="0"
            step="0.1"
            value={form.rainfall}
            onChange={(event) =>
              updateField(
                'rainfall',
                event.target.value,
              )
            }
            required
          />

          <small>mm</small>
        </label>

        <label>
          <span>
            Nhiệt độ thấp nhất
          </span>

          <input
            type="number"
            step="0.1"
            value={form.tempMin}
            onChange={(event) =>
              updateField(
                'tempMin',
                event.target.value,
              )
            }
          />

          <small>°C</small>
        </label>

        <label>
          <span>
            Nhiệt độ cao nhất
          </span>

          <input
            type="number"
            step="0.1"
            value={form.tempMax}
            onChange={(event) =>
              updateField(
                'tempMax',
                event.target.value,
              )
            }
          />

          <small>°C</small>
        </label>

        <label>
          <span>Mã vùng</span>

          <input
            type="text"
            value={
              form.regionCode
            }
            onChange={(event) =>
              updateField(
                'regionCode',
                event.target.value,
              )
            }
          />
        </label>

        <label>
          <span>Mùa</span>

          <input
            type="text"
            value={form.season}
            onChange={(event) =>
              updateField(
                'season',
                event.target.value,
              )
            }
          />
        </label>

        <div className="crop-prediction__actions">
          <button
            className="app-button app-button--secondary"
            type="button"
            onClick={handleReset}
            disabled={loading}
          >
            Đặt lại
          </button>

          <button
            className="app-button app-button--primary"
            type="submit"
            disabled={
              loading ||
              !canSubmit
            }
          >
            {loading ? (
              <LoaderCircle
                className="crop-prediction__spinner"
                aria-hidden="true"
              />
            ) : (
              <Sprout
                aria-hidden="true"
              />
            )}

            <span>
              {loading
                ? 'Đang dự đoán...'
                : 'Dự đoán cây trồng'}
            </span>
          </button>
        </div>
      </form>

      {error && (
        <div className="crop-prediction__error">
          <AlertTriangle
            aria-hidden="true"
          />

          <span>{error}</span>
        </div>
      )}

      {hasResult && (
        <AgricultureRecommendation
          items={items}
          title="Kết quả dự đoán"
          description="Danh sách cây trồng và khuyến nghị dựa trên dữ liệu đã nhập"
        />
      )}
    </section>
  );
}

export default CropPredictionPanel;