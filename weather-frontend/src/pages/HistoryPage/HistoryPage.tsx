import {
  CalendarDays,
  CloudRain,
  Download,
  Droplets,
  RefreshCw,
  RotateCcw,
  Search,
  Thermometer,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react';

import PageHeader from '../../components/common/PageHeader';
import ErrorState from '../../components/states/ErrorState';
import LoadingSkeleton from '../../components/states/LoadingSkeleton';
import WeatherMetricCard from '../../components/weather/WeatherMetricCard';
import { useWeather } from '../../hooks/useWeather';
import weatherService from '../../services/weatherService';

import type {
  Weather15DaysApiResponse,
  WeatherDailyItem,
} from '../../types/weather';

import {
  formatDate,
  formatPercentage,
  formatRainfall,
  formatTemperature,
} from '../../utils/formatters';

import './HistoryPage.scss';

interface DateRange {
  from: string;
  to: string;
}

function toInputDate(date: Date): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');

  const day = String(
    date.getDate(),
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDefaultRange(): DateRange {
  const to = new Date();
  const from = new Date();

  from.setDate(from.getDate() - 6);

  return {
    from: toInputDate(from),
    to: toInputDate(to),
  };
}

function average(
  values: number[],
): number | undefined {
  if (values.length === 0) {
    return undefined;
  }

  return (
    values.reduce(
      (total, value) => total + value,
      0,
    ) / values.length
  );
}

function getDailyAverageTemperature(
  item: WeatherDailyItem,
): number | undefined {
  const values = [
    item.temperature.max,
    item.temperature.min,
  ].filter(
    (value): value is number =>
      value !== null,
  );

  return average(values);
}

function getRainfall(
  item: WeatherDailyItem,
): number | undefined {
  if (item.rain !== null) {
    return item.rain;
  }

  if (item.precipitation !== null) {
    return item.precipitation;
  }

  return undefined;
}

function HistoryPage() {
  const { city } = useWeather();

  const [range, setRange] =
    useState<DateRange>(getDefaultRange);

  const [formVersion, setFormVersion] =
    useState(0);

  const [data, setData] =
    useState<Weather15DaysApiResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const requestSequence = useRef(0);

  const loadHistory = useCallback(
    async (forceRefresh = false) => {
      const requestId =
        ++requestSequence.current;

      try {
        setLoading(true);
        setError(null);

        const response =
          await weatherService.getWeather15Days(
            city,
            forceRefresh,
          );

        if (
          requestId !==
          requestSequence.current
        ) {
          return;
        }

        setData(response);
      } catch (requestError: unknown) {
        if (
          requestId !==
          requestSequence.current
        ) {
          return;
        }

        setData(null);

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Không thể tải dữ liệu lịch sử.',
        );
      } finally {
        if (
          requestId ===
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
        void loadHistory();
      }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      requestSequence.current += 1;
    };
  }, [loadHistory]);

  const historyItems = useMemo(() => {
    if (!data) {
      return [];
    }

    const historyLength =
      data.period.past_days +
      data.period.today;

    return data.daily.slice(
      0,
      historyLength,
    );
  }, [data]);

  const selectedItems = useMemo(
    () =>
      historyItems.filter(
        (item) =>
          item.date >= range.from &&
          item.date <= range.to,
      ),
    [historyItems, range],
  );

  const availableFrom =
    historyItems[0]?.date;

  const availableTo =
    historyItems[
      historyItems.length - 1
    ]?.date;

  const temperature = average(
    selectedItems
      .map(getDailyAverageTemperature)
      .filter(
        (value): value is number =>
          value !== undefined,
      ),
  );

  const maximumTemperature =
    selectedItems
      .map((item) => item.temperature.max)
      .filter(
        (value): value is number =>
          value !== null,
      )
      .reduce<number | undefined>(
        (maximum, value) =>
          maximum === undefined
            ? value
            : Math.max(maximum, value),
        undefined,
      );

  const rainfallValues = selectedItems
    .map(getRainfall)
    .filter(
      (value): value is number =>
        value !== undefined,
    );

  const rainfall =
    rainfallValues.length === 0
      ? undefined
      : rainfallValues.reduce(
          (total, value) =>
            total + value,
          0,
        );

  const humidity = average(
    selectedItems
      .map((item) => item.humidity)
      .filter(
        (value): value is number =>
          value !== null,
      ),
  );

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget,
    );

    const from = String(
      formData.get('from') ?? '',
    );

    const to = String(
      formData.get('to') ?? '',
    );

    if (!from || !to) {
      setError(
        'Vui lòng chọn đầy đủ từ ngày và đến ngày.',
      );
      return;
    }

    if (from > to) {
      setError(
        'Từ ngày không được lớn hơn đến ngày.',
      );
      return;
    }

    setError(null);

    setRange({
      from,
      to,
    });
  };

  const handleReset = () => {
    if (
      availableFrom &&
      availableTo
    ) {
      const startIndex = Math.max(
        0,
        historyItems.length - 7,
      );

      setRange({
        from:
          historyItems[startIndex]
            ?.date ?? availableFrom,
        to: availableTo,
      });
    } else {
      setRange(getDefaultRange());
    }

    setError(null);

    setFormVersion(
      (currentVersion) =>
        currentVersion + 1,
    );
  };

  const handleExport = () => {
    if (selectedItems.length === 0) {
      setError(
        'Không có dữ liệu trong khoảng ngày đã chọn để xuất.',
      );
      return;
    }

    const header = [
      'Thành phố',
      'Ngày',
      'Nhiệt độ thấp nhất (°C)',
      'Nhiệt độ cao nhất (°C)',
      'Độ ẩm (%)',
      'Lượng mưa (mm)',
      'Khả năng mưa (%)',
      'Tốc độ gió (km/h)',
    ];

    const rows = selectedItems.map(
      (item) => [
        data?.location.name ?? city,
        item.date,
        item.temperature.min ?? '',
        item.temperature.max ?? '',
        item.humidity ?? '',
        getRainfall(item) ?? '',
        item.rain_probability ?? '',
        item.wind_speed ?? '',
      ],
    );

    const csv = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""',
              )}"`,
          )
          .join(','),
      )
      .join('\n');

    const blob = new Blob(
      [`\uFEFF${csv}`],
      {
        type:
          'text/csv;charset=utf-8',
      },
    );

    const downloadUrl =
      URL.createObjectURL(blob);

    const downloadLink =
      document.createElement('a');

    downloadLink.href = downloadUrl;

    downloadLink.download =
      `weather-history-${range.from}-${range.to}.csv`;

    downloadLink.click();

    URL.revokeObjectURL(
      downloadUrl,
    );
  };

  if (loading && !data) {
    return (
      <div className="page-container">
        <LoadingSkeleton
          message="Đang tải dữ liệu lịch sử..."
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-container">
        <ErrorState
          title="Không thể tải lịch sử"
          message={
            error ??
            'Backend chưa trả dữ liệu lịch sử.'
          }
          onRetry={() =>
            loadHistory(true)
          }
        />
      </div>
    );
  }

  return (
    <div className="history-page page-container">
      <PageHeader
        eyebrow="Dữ liệu lịch sử"
        title={`Lịch sử thời tiết - ${data.location.name ?? city}`}
        description="Tra cứu dữ liệu thời tiết trong 7 ngày gần nhất do API cung cấp"
        icon={<CalendarDays />}
        actions={
          <button
            className="app-button app-button--secondary"
            type="button"
            onClick={() => {
              void loadHistory(true);
            }}
            disabled={loading}
          >
            <RefreshCw
              className={
                loading
                  ? 'history-page__spinner'
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

      <form
        className="history-page__filters app-card"
        onSubmit={handleSubmit}
        key={formVersion}
      >
        <label>
          <span>Từ ngày</span>

          <input
            name="from"
            type="date"
            defaultValue={range.from}
            min={availableFrom}
            max={availableTo}
          />
        </label>

        <label>
          <span>Đến ngày</span>

          <input
            name="to"
            type="date"
            defaultValue={range.to}
            min={availableFrom}
            max={availableTo}
          />
        </label>

        <div className="history-page__actions">
          <button
            className="app-button app-button--secondary"
            type="button"
            onClick={handleReset}
          >
            <RotateCcw
              aria-hidden="true"
            />

            <span>Đặt lại</span>
          </button>

          <button
            className="app-button app-button--primary"
            type="submit"
          >
            <Search
              aria-hidden="true"
            />

            <span>Tra cứu</span>
          </button>

          <button
            className="app-button app-button--secondary"
            type="button"
            onClick={handleExport}
          >
            <Download
              aria-hidden="true"
            />

            <span>Xuất CSV</span>
          </button>
        </div>
      </form>

      {error && (
        <ErrorState
          title="Khoảng ngày chưa hợp lệ"
          message={error}
          compact
        />
      )}

      {selectedItems.length === 0 ? (
        <ErrorState
          title="Không có dữ liệu"
          message="Không có dữ liệu lịch sử trong khoảng ngày đã chọn."
          compact
        />
      ) : (
        <section className="history-page__metrics">
          <WeatherMetricCard
            label="Nhiệt độ trung bình"
            value={
              temperature === undefined
                ? '—'
                : formatTemperature(
                    temperature,
                    1,
                  )
            }
            description={`${formatDate(
              range.from,
            )} - ${formatDate(
              range.to,
            )}`}
            icon={<Thermometer />}
            tone="temperature"
          />

          <WeatherMetricCard
            label="Nhiệt độ cao nhất"
            value={
              maximumTemperature ===
              undefined
                ? '—'
                : formatTemperature(
                    maximumTemperature,
                    1,
                  )
            }
            icon={<Thermometer />}
            tone="warning"
          />

          <WeatherMetricCard
            label="Tổng lượng mưa"
            value={
              rainfall === undefined
                ? '—'
                : formatRainfall(
                    rainfall,
                  )
            }
            icon={<CloudRain />}
            tone="rain"
          />

          <WeatherMetricCard
            label="Độ ẩm trung bình"
            value={
              humidity === undefined
                ? '—'
                : formatPercentage(
                    humidity,
                    1,
                  )
            }
            icon={<Droplets />}
            tone="humidity"
            progress={humidity}
          />
        </section>
      )}
    </div>
  );
}

export default HistoryPage;