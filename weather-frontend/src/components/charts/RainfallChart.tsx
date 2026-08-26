import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import './TemperatureChart.scss';

export interface RainfallChartItem {
  label: string;
  rainfall: number;
}

interface RainfallChartProps {
  data: RainfallChartItem[];
  title?: string;
  description?: string;
}

function RainfallChart({
  data,
  title = 'Biểu đồ lượng mưa',
  description = 'Lượng mưa ghi nhận theo thời gian',
}: RainfallChartProps) {
  return (
    <section className="weather-chart app-card">
      <header className="weather-chart__header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <span className="weather-chart__legend weather-chart__legend--rain">
          <i />
          Lượng mưa
        </span>
      </header>

      {data.length > 0 ? (
        <div className="weather-chart__content">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
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
                  `${value}`
                }
              />

              <Tooltip
                cursor={{
                  fill:
                    'var(--color-primary-soft)',
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
                  `${Number(value)} mm`,
                  'Lượng mưa',
                ]}
              />

              <Bar
                dataKey="rainfall"
                fill="var(--color-rain)"
                radius={[6, 6, 2, 2]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="weather-chart__empty">
          Chưa có dữ liệu lượng mưa.
        </div>
      )}
    </section>
  );
}

export default RainfallChart;