interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

function ErrorState({
  title = 'Không thể tải dữ liệu',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <section
      className="weather-error"
      role="alert"
    >
      <div
        className="weather-error__icon"
        aria-hidden="true"
      >
        !
      </div>

      <div className="weather-error__content">
        <h2>{title}</h2>
        <p>{message}</p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
          >
            Thử lại
          </button>
        )}
      </div>
    </section>
  );
}

export default ErrorState;