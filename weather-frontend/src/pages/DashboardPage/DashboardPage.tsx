import ErrorState from '../../components/states/ErrorState';
import LoadingSkeleton from '../../components/states/LoadingSkeleton';
import { useWeather } from '../../hooks/useWeather';

import './DashboardPage.scss';

function DashboardPage() {
  const {
    city,
    currentWeather,
    weather15Days,
    loading,
    error,
    refreshWeather,
  } = useWeather();

  if (loading) {
    return (
      <LoadingSkeleton message="Đang tải dữ liệu thời tiết..." />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Không thể tải thời tiết"
        message={error}
        onRetry={() => {
          void refreshWeather();
        }}
      />
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <p className="dashboard-page__eyebrow">
            Tổng quan thời tiết
          </p>

          <h1>Dashboard</h1>

          <p>
            Dữ liệu thời tiết hiện tại tại{' '}
            <strong>{city}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void refreshWeather();
          }}
        >
          Làm mới
        </button>
      </header>

      <section className="api-debug-card">
        <div className="api-debug-card__heading">
          <div>
            <h2>Current Weather API</h2>
            <p>
              GET /api/weather/current
            </p>
          </div>

          <span>
            {currentWeather
              ? 'Thành công'
              : 'Không có dữ liệu'}
          </span>
        </div>

        <pre>
          {JSON.stringify(
            currentWeather,
            null,
            2,
          )}
        </pre>
      </section>

      <section className="api-debug-card">
        <div className="api-debug-card__heading">
          <div>
            <h2>15 Days Weather API</h2>
            <p>
              GET /api/weather/15-days
            </p>
          </div>

          <span>
            {weather15Days
              ? 'Thành công'
              : 'Không có dữ liệu'}
          </span>
        </div>

        <pre>
          {JSON.stringify(
            weather15Days,
            null,
            2,
          )}
        </pre>
      </section>
    </main>
  );
}

export default DashboardPage;