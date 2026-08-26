import {
  Bug,
  CloudSun,
  Droplets,
  Leaf,
  Sprout,
} from 'lucide-react';

import type {
  ReactNode,
} from 'react';

import './AgricultureRecommendation.scss';

export type AgricultureCategory =
  | 'crop'
  | 'irrigation'
  | 'pest'
  | 'weather'
  | 'general';

export interface AgricultureRecommendationItem {
  id: string;
  title: string;
  description: string;
  category?: AgricultureCategory;
  status?: 'normal' | 'warning';
}

interface AgricultureRecommendationProps {
  items: AgricultureRecommendationItem[];
  title?: string;
  description?: string;
}

function renderCategoryIcon(
  category: AgricultureCategory,
): ReactNode {
  switch (category) {
    case 'crop':
      return <Sprout />;

    case 'irrigation':
      return <Droplets />;

    case 'pest':
      return <Bug />;

    case 'weather':
      return <CloudSun />;

    default:
      return <Leaf />;
  }
}

function AgricultureRecommendation({
  items,
  title = 'Nông nghiệp thông minh',
  description = 'Khuyến nghị cây trồng và chăm sóc theo điều kiện thời tiết',
}: AgricultureRecommendationProps) {
  return (
    <section className="agriculture-recommendation app-card">
      <header className="agriculture-recommendation__header">
        <div>
          <span className="agriculture-recommendation__eyebrow">
            <Leaf aria-hidden="true" />
            Smart Agriculture
          </span>

          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <span className="status-badge status-badge--success">
          Đề xuất
        </span>
      </header>

      {items.length > 0 ? (
        <div className="agriculture-recommendation__grid">
          {items.map((item) => {
            const category =
              item.category ?? 'general';

            return (
              <article
                className={[
                  'agriculture-recommendation__item',
                  item.status === 'warning'
                    ? 'agriculture-recommendation__item--warning'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={item.id}
              >
                <span
                  className="agriculture-recommendation__icon"
                  aria-hidden="true"
                >
                  {renderCategoryIcon(
                    category,
                  )}
                </span>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="agriculture-recommendation__empty">
          Chưa có khuyến nghị nông nghiệp.
        </p>
      )}
    </section>
  );
}

export default AgricultureRecommendation;