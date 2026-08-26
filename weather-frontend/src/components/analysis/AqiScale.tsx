import './AqiScale.scss';

interface AqiScaleProps {
  value: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

type AqiLevel =
  | 'good'
  | 'moderate'
  | 'sensitive'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous';

function getAqiLevel(
  value: number,
): {
  level: AqiLevel;
  text: string;
} {
  if (value <= 50) {
    return {
      level: 'good',
      text: 'Tốt',
    };
  }

  if (value <= 100) {
    return {
      level: 'moderate',
      text: 'Trung bình',
    };
  }

  if (value <= 150) {
    return {
      level: 'sensitive',
      text: 'Kém',
    };
  }

  if (value <= 200) {
    return {
      level: 'unhealthy',
      text: 'Xấu',
    };
  }

  if (value <= 300) {
    return {
      level: 'very-unhealthy',
      text: 'Rất xấu',
    };
  }

  return {
    level: 'hazardous',
    text: 'Nguy hại',
  };
}

function normalizeAqi(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(
    500,
    Math.max(0, value),
  );
}

function AqiScale({
  value,
  label,
  size = 'medium',
}: AqiScaleProps) {
  const normalizedValue =
    normalizeAqi(value);

  const percentage =
    (normalizedValue / 500) * 100;

  const { level, text } =
    getAqiLevel(normalizedValue);

  return (
    <div
      className={[
        'aqi-scale',
        `aqi-scale--${size}`,
        `aqi-scale--${level}`,
      ].join(' ')}
      role="meter"
      aria-label={
        label ??
        `Chỉ số chất lượng không khí ${text}`
      }
      aria-valuemin={0}
      aria-valuemax={500}
      aria-valuenow={normalizedValue}
    >
      <div
        className="aqi-scale__ring"
        style={{
          '--aqi-progress':
            `${percentage * 3.6}deg`,
        } as React.CSSProperties}
      >
        <div className="aqi-scale__center">
          <strong>
            {Math.round(normalizedValue)}
          </strong>

          <span>{text}</span>
        </div>
      </div>

      {label && (
        <p className="aqi-scale__label">
          {label}
        </p>
      )}
    </div>
  );
}

export default AqiScale;