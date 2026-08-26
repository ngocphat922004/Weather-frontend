import {
  Activity,
  Wind,
} from 'lucide-react';

import AqiScale from './AqiScale';

import './AirQualityCard.scss';

export interface AirPollutantItem {
  id: string;
  label: string;
  value: string;
  description?: string;
}

interface AirQualityCardProps {
  aqi: number;
  pollutants: AirPollutantItem[];
  summary?: string;
  title?: string;
}

function AirQualityCard({
  aqi,
  pollutants,
  summary,
  title = 'Chất lượng không khí',
}: AirQualityCardProps) {
  return (
    <section className="air-quality-card app-card">
      <header className="air-quality-card__header">
        <div>
          <span className="air-quality-card__eyebrow">
            <Wind aria-hidden="true" />

            <span>AQI</span>
          </span>

          <h2>{title}</h2>
        </div>

        <span className="status-badge status-badge--info">
          Hiện tại
        </span>
      </header>

      <div className="air-quality-card__content">
        <div className="air-quality-card__overview">
          <AqiScale
            value={aqi}
            size="large"
            label="Chỉ số AQI tổng hợp"
          />

          {summary && (
            <p>{summary}</p>
          )}
        </div>

        <div className="air-quality-card__pollutants">
          {pollutants.length > 0 ? (
            pollutants.map(
              (pollutant) => (
                <article
                  className="air-quality-card__pollutant"
                  key={pollutant.id}
                >
                  <span
                    className="air-quality-card__pollutant-icon"
                    aria-hidden="true"
                  >
                    <Activity />
                  </span>

                  <div>
                    <span>
                      {pollutant.label}
                    </span>

                    <strong>
                      {pollutant.value}
                    </strong>

                    {pollutant.description && (
                      <small>
                        {
                          pollutant.description
                        }
                      </small>
                    )}
                  </div>
                </article>
              ),
            )
          ) : (
            <p className="air-quality-card__empty">
              Chưa có dữ liệu thành phần
              không khí.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AirQualityCard;