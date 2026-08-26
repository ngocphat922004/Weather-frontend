import './LoadingSkeleton.scss';

type SkeletonVariant =
  | 'dashboard'
  | 'page'
  | 'cards'
  | 'chart';

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  message?: string;
  cardCount?: number;
}

function LoadingSkeleton({
  variant = 'page',
  message = 'Đang tải dữ liệu...',
  cardCount = 4,
}: LoadingSkeletonProps) {
  if (variant === 'cards') {
    return (
      <section
        className="loading-skeleton"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="loading-skeleton__cards">
          {Array.from({
            length: cardCount,
          }).map((_, index) => (
            <div
              className="skeleton-block skeleton-block--card"
              key={index}
            />
          ))}
        </div>

        <p className="loading-skeleton__message">
          {message}
        </p>
      </section>
    );
  }

  if (variant === 'chart') {
    return (
      <section
        className="loading-skeleton"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="skeleton-block skeleton-block--chart" />

        <p className="loading-skeleton__message">
          {message}
        </p>
      </section>
    );
  }

  if (variant === 'dashboard') {
    return (
      <section
        className="loading-skeleton loading-skeleton--dashboard"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="loading-skeleton__heading">
          <div className="skeleton-block skeleton-block--title" />
          <div className="skeleton-block skeleton-block--subtitle" />
        </div>

        <div className="skeleton-block skeleton-block--alert" />

        <div className="loading-skeleton__dashboard-grid">
          <div className="skeleton-block skeleton-block--weather" />

          <div className="loading-skeleton__metrics">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                className="skeleton-block skeleton-block--metric"
                key={index}
              />
            ))}
          </div>
        </div>

        <div className="loading-skeleton__cards">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              className="skeleton-block skeleton-block--card"
              key={index}
            />
          ))}
        </div>

        <p className="loading-skeleton__message">
          {message}
        </p>
      </section>
    );
  }

  return (
    <section
      className="loading-skeleton"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-skeleton__heading">
        <div className="skeleton-block skeleton-block--title" />
        <div className="skeleton-block skeleton-block--subtitle" />
      </div>

      <div className="loading-skeleton__cards">
        {Array.from({
          length: cardCount,
        }).map((_, index) => (
          <div
            className="skeleton-block skeleton-block--card"
            key={index}
          />
        ))}
      </div>

      <div className="skeleton-block skeleton-block--chart" />

      <p className="loading-skeleton__message">
        {message}
      </p>
    </section>
  );
}

export default LoadingSkeleton;