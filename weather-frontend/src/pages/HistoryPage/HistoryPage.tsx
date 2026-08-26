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
  WeatherAnalysisSummaryResponse,
} from '../../types/weather';

import {
  formatDate,
  formatPercentage,
  formatRainfall,
  formatTemperature,
  getFirstValue,
  toNumber,
} from '../../utils/formatters';

import './HistoryPage.scss';

interface DateRange {
  from: string;
  to: string;
}

function toInputDate(
  date: Date,
): string {
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

  from.setDate(
    from.getDate() - 6,
  );

  return {
    from: toInputDate(from),
    to: toInputDate(to),
  };
}

function readNumber(
  source: unknown,
  paths: string[],
): number | undefined {
  const value = toNumber(
    getFirstValue(source, paths),
    Number.NaN,
  );

  return Number.isNaN(value)
    ? undefined
    : value;
}

function HistoryPage() {
  const { city } = useWeather();

  const [range, setRange] =
    useState<DateRange>(
      getDefaultRange,
    );

  const [
    formVersion,
    setFormVersion,
  ] = useState(0);

  const [data, setData] =
    useState<WeatherAnalysisSummaryResponse | null>(
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
          await weatherService
            .getAnalysisSummary(
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

    if (
      from &&
      to &&
      from <= to
    ) {
      /*
       * Chỉ cập nhật bộ lọc hiển thị.
       * Không gửi thêm request API.
       */
      setRange({
        from,
        to,
      });
    }
  };

  const handleReset = () => {
    setRange(getDefaultRange());

    setFormVersion(
      (currentVersion) =>
        currentVersion + 1,
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

  const temperature = readNumber(
    data.analysis,
    [
      'temperature.average',
      'temperature.avg',
      'avg_temperature',
    ],
  );

  const maximumTemperature =
    readNumber(data.analysis, [
      'temperature.maximum',
      'temperature.max',
      'max_temperature',
    ]);

  const rainfall = readNumber(
    data.analysis,
    [
      'rainfall.total',
      'precipitation.total',
      'total_rainfall',
    ],
  );

  const humidity = readNumber(
    data.analysis,
    [
      'humidity.average',
      'humidity.avg',
      'avg_humidity',
    ],
  );

  const handleExport = () => {
    const header = [
      'Thành phố',
      'Từ ngày',
      'Đến ngày',
      'Nhiệt độ trung bình',
      'Nhiệt độ cao nhất',
      'Lượng mưa',
      'Độ ẩm',
    ];

    const values = [
      city,
      range.from,
      range.to,
      temperature ?? '',
      maximumTemperature ?? '',
      rainfall ?? '',
      humidity ?? '',
    ];

    const csv = [
      header,
      values,
    ]
      .map((row) =>
        row
          .map((value) =>
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

  return (
    <div className="history-page page-container">
      <PageHeader
        eyebrow="Dữ liệu lịch sử"
        title={`Lịch sử thời tiết - ${city}`}
        description="API hiện cung cấp số liệu tổng hợp theo chu kỳ 15 ngày. Bộ lọc ngày không tạo thêm request."
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
          />
        </label>

        <label>
          <span>Đến ngày</span>

          <input
            name="to"
            type="date"
            defaultValue={range.to}
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
    </div>
  );
}

export default HistoryPage;