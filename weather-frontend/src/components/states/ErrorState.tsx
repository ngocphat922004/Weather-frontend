import {
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

import {
  useState,
} from 'react';

import './ErrorState.scss';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void | Promise<void>;
  compact?: boolean;
}

function ErrorState({
  title = 'Không thể tải dữ liệu',
  message,
  onRetry,
  compact = false,
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] =
    useState(false);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) {
      return;
    }

    try {
      setIsRetrying(true);
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <section
      className={[
        'error-state',
        compact
          ? 'error-state--compact'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="alert"
    >
      <div
        className="error-state__icon"
        aria-hidden="true"
      >
        <AlertTriangle />
      </div>

      <h2>{title}</h2>

      <p>{message}</p>

      {onRetry && (
        <button
          className="app-button app-button--primary"
          type="button"
          onClick={() => {
            void handleRetry();
          }}
          disabled={isRetrying}
        >
          <RefreshCw
            className={
              isRetrying
                ? 'error-state__spinner'
                : ''
            }
            aria-hidden="true"
          />

          <span>
            {isRetrying
              ? 'Đang thử lại...'
              : 'Thử lại'}
          </span>
        </button>
      )}
    </section>
  );
}

export default ErrorState;