import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  X,
} from 'lucide-react';

import './ExtremeWeatherAlert.scss';

type AlertSeverity =
  | 'safe'
  | 'info'
  | 'warning'
  | 'danger';

interface ExtremeWeatherAlertProps {
  title?: string;
  message: string;
  advice?: string;
  severity?: AlertSeverity;
  onDismiss?: () => void;
}

const alertIcons = {
  safe: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  danger: ShieldAlert,
};

function ExtremeWeatherAlert({
  title = 'Cảnh báo thời tiết',
  message,
  advice,
  severity = 'warning',
  onDismiss,
}: ExtremeWeatherAlertProps) {
  const Icon = alertIcons[severity];

  return (
    <section
      className={[
        'extreme-alert',
        `extreme-alert--${severity}`,
      ].join(' ')}
      role={
        severity === 'danger'
          ? 'alert'
          : 'status'
      }
    >
      <span
        className="extreme-alert__icon"
        aria-hidden="true"
      >
        <Icon />
      </span>

      <div className="extreme-alert__content">
        <h2>{title}</h2>

        <p>{message}</p>

        {advice && (
          <small>{advice}</small>
        )}
      </div>

      {onDismiss && (
        <button
          className="extreme-alert__dismiss"
          type="button"
          onClick={onDismiss}
          aria-label="Ẩn cảnh báo"
        >
          <X aria-hidden="true" />
        </button>
      )}
    </section>
  );
}

export default ExtremeWeatherAlert;