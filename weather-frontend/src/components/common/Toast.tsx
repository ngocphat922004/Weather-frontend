import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';

import {
  useEffect,
} from 'react';

import './Toast.scss';

type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

const toastIcons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function Toast({
  message,
  type = 'info',
  duration = 4000,
  onClose,
}: ToastProps) {
  const Icon = toastIcons[type];

  useEffect(() => {
    if (duration <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(
      onClose,
      duration,
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [duration, onClose]);

  return (
    <div
      className={[
        'app-toast',
        `app-toast--${type}`,
      ].join(' ')}
      role={
        type === 'error'
          ? 'alert'
          : 'status'
      }
      aria-live={
        type === 'error'
          ? 'assertive'
          : 'polite'
      }
    >
      <span
        className="app-toast__icon"
        aria-hidden="true"
      >
        <Icon />
      </span>

      <p className="app-toast__message">
        {message}
      </p>

      <button
        className="app-toast__close"
        type="button"
        onClick={onClose}
        aria-label="Đóng thông báo"
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}

export default Toast;