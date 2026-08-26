import type {
  ReactNode,
} from 'react';

import './WeatherMetricCard.scss';

type MetricTone =
  | 'primary'
  | 'temperature'
  | 'rain'
  | 'humidity'
  | 'wind'
  | 'warning'
  | 'success';

interface WeatherMetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  description?: string;
  trend?: string;
  tone?: MetricTone;
  progress?: number;
}

function normalizeProgress(
  progress: number,
): number {
  return Math.min(
    100,
    Math.max(0, progress),
  );
}

function WeatherMetricCard({
  label,
  value,
  icon,
  description,
  trend,
  tone = 'primary',
  progress,
}: WeatherMetricCardProps) {
  const normalizedProgress =
    typeof progress === 'number'
      ? normalizeProgress(progress)
      : undefined;

  return (
    <article
      className={[
        'weather-metric',
        `weather-metric--${tone}`,
      ].join(' ')}
    >
      <div className="weather-metric__header">
        <span className="weather-metric__label">
          {label}
        </span>

        <span
          className="weather-metric__icon"
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      <strong className="weather-metric__value">
        {value}
      </strong>

      {(description || trend) && (
        <div className="weather-metric__footer">
          {description && (
            <span>{description}</span>
          )}

          {trend && (
            <small>{trend}</small>
          )}
        </div>
      )}

      {normalizedProgress !== undefined && (
        <div
          className="weather-metric__progress"
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={normalizedProgress}
        >
          <span
            style={{
              width: `${normalizedProgress}%`,
            }}
          />
        </div>
      )}
    </article>
  );
}

export default WeatherMetricCard;