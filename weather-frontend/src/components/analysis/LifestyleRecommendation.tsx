import {
  Activity,
  Car,
  HeartPulse,
  Shirt,
  Umbrella,
} from 'lucide-react';

import type {
  ReactNode,
} from 'react';

import './LifestyleRecommendation.scss';

export type LifestyleCategory =
  | 'clothing'
  | 'outdoor'
  | 'health'
  | 'traffic'
  | 'general';

export interface LifestyleRecommendationItem {
  id: string;
  title: string;
  description: string;
  category?: LifestyleCategory;
  priority?: 'normal' | 'important';
}

interface LifestyleRecommendationProps {
  items: LifestyleRecommendationItem[];
  title?: string;
  description?: string;
}

function renderCategoryIcon(
  category: LifestyleCategory,
): ReactNode {
  switch (category) {
    case 'clothing':
      return <Shirt />;

    case 'outdoor':
      return <Umbrella />;

    case 'health':
      return <HeartPulse />;

    case 'traffic':
      return <Car />;

    default:
      return <Activity />;
  }
}

function LifestyleRecommendation({
  items,
  title = 'Gợi ý sinh hoạt',
  description = 'Khuyến nghị dựa trên điều kiện thời tiết hiện tại',
}: LifestyleRecommendationProps) {
  return (
    <section className="lifestyle-recommendation app-card">
      <header className="lifestyle-recommendation__header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <span className="status-badge status-badge--success">
          Thông minh
        </span>
      </header>

      {items.length > 0 ? (
        <div className="lifestyle-recommendation__list">
          {items.map((item) => {
            const category =
              item.category ?? 'general';

            return (
              <article
                className={[
                  'lifestyle-recommendation__item',
                  item.priority === 'important'
                    ? 'lifestyle-recommendation__item--important'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                key={item.id}
              >
                <span
                  className="lifestyle-recommendation__icon"
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
        <p className="lifestyle-recommendation__empty">
          Chưa có khuyến nghị sinh hoạt.
        </p>
      )}
    </section>
  );
}

export default LifestyleRecommendation;