import {
  X,
} from 'lucide-react';

import {
  useEffect,
  type MouseEvent,
  type ReactNode,
} from 'react';

import {
  createPortal,
} from 'react-dom';

import './Modal.scss';

type ModalSize =
  | 'small'
  | 'medium'
  | 'large';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  onClose: () => void;
}

function Modal({
  isOpen,
  title,
  children,
  footer,
  size = 'medium',
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';

    window.addEventListener(
      'keydown',
      handleEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        'keydown',
        handleEscape,
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (
    event: MouseEvent<HTMLDivElement>,
  ) => {
    if (
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="app-modal"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className={[
          'app-modal__dialog',
          `app-modal__dialog--${size}`,
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
      >
        <header className="app-modal__header">
          <h2 id="app-modal-title">
            {title}
          </h2>

          <button
            className="app-icon-button"
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
          >
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="app-modal__body">
          {children}
        </div>

        {footer && (
          <footer className="app-modal__footer">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body,
  );
}

export default Modal;