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

import './HourlyForecast.scss';

export interface HourlyForecastItem {
  id: string;
  time: string;
  temperature: string;
  weatherCode?: number;
  precipitation?: string;
  isCurrent?: boolean;
}

interface HourlyForecastProps {
  items: HourlyForecastItem[];
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

function HourlyForecast({
  items,
  title = 'Dự báo hàng giờ',
}: HourlyForecastProps) {
  return (
    <section className="hourly-forecast app-card">
      <header className="hourly-forecast__header">
        <h2>{title}</h2>

        <span>24 giờ tới</span>
      </header>

      {items.length > 0 ? (
        <div className="hourly-forecast__list">
          {items.map((item) => (
            <article
              className={[
                'hourly-forecast__item',
                item.isCurrent
                  ? 'hourly-forecast__item--current'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              key={item.id}
            >
              <time>{item.time}</time>

              {renderForecastIcon(
                item.weatherCode,
              )}

              <strong>
                {item.temperature}
              </strong>

              {item.precipitation && (
                <span>
                  <Droplets
                    aria-hidden="true"
                  />

                  {item.precipitation}
                </span>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="hourly-forecast__empty">
          Chưa có dữ liệu dự báo theo giờ.
        </p>
      )}
    </section>
  );
}

export default HourlyForecast;