import {
  CloudOff,
} from 'lucide-react';

import type {
  ReactNode,
} from 'react';

import './EmptyState.scss';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

function EmptyState({
  title = 'Chưa có dữ liệu',
  message = 'Không tìm thấy dữ liệu phù hợp để hiển thị.',
  icon,
  actionLabel,
  onAction,
  compact = false,
}: EmptyStateProps) {
  return (
    <section
      className={[
        'empty-state',
        compact
          ? 'empty-state--compact'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="empty-state__icon"
        aria-hidden="true"
      >
        {icon ?? <CloudOff />}
      </div>

      <h2>{title}</h2>

      <p>{message}</p>

      {actionLabel && onAction && (
        <button
          className="app-button app-button--primary"
          type="button"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </section>
  );
}

export default EmptyState;