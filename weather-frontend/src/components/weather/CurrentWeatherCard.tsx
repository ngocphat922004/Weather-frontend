import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
} from 'lucide-react';

import type {
  ReactNode,
} from 'react';

import './CurrentWeatherCard.scss';

interface CurrentWeatherCardProps {
  location: string;
  temperature: string;
  condition: string;
  feelsLike?: string;
  highestTemperature?: string;
  lowestTemperature?: string;
  updatedAt?: string;
  weatherCode?: number;
}

function renderWeatherIcon(
  weatherCode?: number,
): ReactNode {
  if (weatherCode === undefined) {
    return <CloudSun />;
  }

  if (weatherCode === 0) {
    return <Sun />;
  }

  if ([1, 2, 3].includes(weatherCode)) {
    return <CloudSun />;
  }

  if ([45, 48].includes(weatherCode)) {
    return <CloudFog />;
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
    return <CloudRain />;
  }

  if (
    [71, 73, 75, 77, 85, 86].includes(
      weatherCode,
    )
  ) {
    return <Snowflake />;
  }

  if (
    [95, 96, 99].includes(weatherCode)
  ) {
    return <CloudLightning />;
  }

  return <Cloud />;
}

function CurrentWeatherCard({
  location,
  temperature,
  condition,
  feelsLike,
  highestTemperature,
  lowestTemperature,
  updatedAt,
  weatherCode,
}: CurrentWeatherCardProps) {
  return (
    <article className="current-weather">
      <div className="current-weather__content">
        <div className="current-weather__heading">
          <div>
            <h2>{location}</h2>

            {updatedAt && (
              <p>
                Cập nhật lúc {updatedAt}
              </p>
            )}
          </div>

          <span className="status-badge status-badge--info">
            Hiện tại
          </span>
        </div>

        <div className="current-weather__main">
          <div className="current-weather__temperature">
            <strong>{temperature}</strong>

            <span>{condition}</span>
          </div>

          <div
            className="current-weather__visual"
            aria-hidden="true"
          >
            <span className="current-weather__sun" />

            {renderWeatherIcon(weatherCode)}
          </div>
        </div>

        <div className="current-weather__details">
          {feelsLike && (
            <span>
              Cảm giác như{' '}
              <strong>{feelsLike}</strong>
            </span>
          )}

          {highestTemperature && (
            <span>
              Cao nhất{' '}
              <strong>
                {highestTemperature}
              </strong>
            </span>
          )}

          {lowestTemperature && (
            <span>
              Thấp nhất{' '}
              <strong>
                {lowestTemperature}
              </strong>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default CurrentWeatherCard;