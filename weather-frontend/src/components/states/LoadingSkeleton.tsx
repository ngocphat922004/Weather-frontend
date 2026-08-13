interface LoadingSkeletonProps {
  message?: string;
}

function LoadingSkeleton({
  message = 'Đang tải dữ liệu thời tiết...',
}: LoadingSkeletonProps) {
  return (
    <section
      className="weather-loading"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="weather-loading__heading">
        <span className="skeleton skeleton--title" />
        <span className="skeleton skeleton--subtitle" />
      </div>

      <div className="skeleton skeleton--alert" />

      <div className="skeleton skeleton--current" />

      <div className="skeleton skeleton--forecast" />

      <div className="weather-loading__metrics">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <span
              className="skeleton skeleton--metric"
              key={index}
            />
          ),
        )}
      </div>

      <p>{message}</p>
    </section>
  );
}

export default LoadingSkeleton;