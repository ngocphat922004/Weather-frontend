import type {
  ReactNode,
} from 'react';

import './PageHeader.scss';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  actions,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__content">
        {icon && (
          <span
            className="page-header__icon"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        <div className="page-header__text">
          {eyebrow && (
            <span className="page-header__eyebrow">
              {eyebrow}
            </span>
          )}

          <h1 className="page-title">
            {title}
          </h1>

          {description && (
            <p className="page-description">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="page-header__actions">
          {actions}
        </div>
      )}
    </header>
  );
}

export default PageHeader;