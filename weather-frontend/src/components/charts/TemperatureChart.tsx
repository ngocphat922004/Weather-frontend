import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import './TemperatureChart.scss';

export interface TemperatureChartItem {
  label: string;
  temperature: number;
}

interface TemperatureChartProps {
  data: TemperatureChartItem[];
  title?: string;
  description?: string;
}

function TemperatureChart({
  data,
  title = 'Biểu đồ nhiệt độ',
  description = 'Mức nhiệt thay đổi theo thời gian',
}: TemperatureChartProps) {
  return (
    <section className="weather-chart app-card">
      <header className="weather-chart__header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <span className="weather-chart__legend">
          <i />
          Nhiệt độ
        </span>
      </header>

      {data.length > 0 ? (
        <div className="weather-chart__content">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={data}
              margin={{
                top: 12,
                right: 14,
                bottom: 2,
                left: -18,
              }}
              accessibilityLayer
            >
              <CartesianGrid
                stroke="var(--color-border)"
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill:
                    'var(--color-text-muted)',
                  fontSize: 10,
                }}
                minTickGap={18}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill:
                    'var(--color-text-muted)',
                  fontSize: 10,
                }}
                width={42}
                tickFormatter={(value) =>
                  `${value}°`
                }
              />

              <Tooltip
                cursor={{
                  stroke:
                    'var(--color-primary-border)',
                  strokeDasharray: '4 4',
                }}
                contentStyle={{
                  border:
                    '1px solid var(--color-border)',
                  borderRadius: '10px',
                  color:
                    'var(--color-text-primary)',
                  background:
                    'var(--color-card-background)',
                  boxShadow:
                    'var(--shadow-dropdown)',
                  fontSize: '12px',
                }}
                labelStyle={{
                  color:
                    'var(--color-text-secondary)',
                  marginBottom: '4px',
                }}
                formatter={(value) => [
                  `${Number(value)}°C`,
                  'Nhiệt độ',
                ]}
              />

              <Line
                type="monotone"
                dataKey="temperature"
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 5,
                  fill:
                    'var(--color-primary)',
                  stroke:
                    'var(--color-card-background)',
                  strokeWidth: 3,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="weather-chart__empty">
          Chưa có dữ liệu nhiệt độ.
        </div>
      )}
    </section>
  );
}

export default TemperatureChart;