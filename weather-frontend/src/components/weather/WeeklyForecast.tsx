import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Snowflake,
  Sun,
} from 'lucide-react';

import type {
  ReactNode,
} from 'react';

import './WeeklyForecast.scss';

export interface WeeklyForecastItem {
  id: string;
  dayLabel: string;
  dateLabel?: string;
  minimumTemperature: string;
  maximumTemperature: string;
  precipitation?: string;
  weatherCode?: number;
  isToday?: boolean;
}

interface WeeklyForecastProps {
  items: WeeklyForecastItem[];
  title?: string;
}

function renderForecastIcon(
  weatherCode?: number,
): ReactNode {
  if (weatherCode === undefined) {
    return (
      <CloudSun aria-hidden="true" />
    );
  }

  if (weatherCode === 0) {
    return <Sun aria-hidden="true" />;
  }

  if ([1, 2, 3].includes(weatherCode)) {
    return (
      <CloudSun aria-hidden="true" />
    );
  }

  if ([45, 48].includes(weatherCode)) {
    return (
      <CloudFog aria-hidden="true" />
    );
  }

  if (
    [
      51,
      53,
      55,
      56,
      57,
      61,
      63,
      65,
      66,
      67,
      80,
      81,
      82,
    ].includes(weatherCode)
  ) {
    return (
      <CloudRain aria-hidden="true" />
    );
  }

  if (
    [71, 73, 75, 77, 85, 86].includes(
      weatherCode,
    )
  ) {
    return (
      <Snowflake aria-hidden="true" />
    );
  }

  if (
    [95, 96, 99].includes(weatherCode)
  ) {
    return (
      <CloudLightning
        aria-hidden="true"
      />
    );
  }

  return <Cloud aria-hidden="true" />;
}

function WeeklyForecast({
  items,
  title = 'Dự báo 7 ngày',
}: WeeklyForecastProps) {
  return (
    <section className="weekly-forecast app-card">
      <header className="weekly-forecast__header">
        <h2>{title}</h2>

        <span>
          Nhiệt độ thấp nhất và cao nhất
        </span>
      </header>

      {items.length > 0 ? (
        <div className="weekly-forecast__list">
          {items.map((item) => (
            <article
              className={[
                'weekly-forecast__item',
                item.isToday
                  ? 'weekly-forecast__item--today'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={item.id}
            >
              <div className="weekly-forecast__date">
                <strong>
                  {item.dayLabel}
                </strong>

                {item.dateLabel && (
                  <span>
                    {item.dateLabel}
                  </span>
                )}
              </div>

              {renderForecastIcon(
                item.weatherCode,
              )}

              {item.precipitation && (
                <span className="weekly-forecast__rain">
                  <Droplets
                    aria-hidden="true"
                  />

                  {item.precipitation}
                </span>
              )}

              <div className="weekly-forecast__temperature">
                <strong>
                  {item.maximumTemperature}
                </strong>

                <span>
                  {item.minimumTemperature}
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="weekly-forecast__empty">
          Chưa có dữ liệu dự báo 7 ngày.
        </p>
      )}
    </section>
  );
}

export default WeeklyForecast;