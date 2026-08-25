import { useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const PIE_COLORS = [
  "#1679a7",
  "#d85f1b",
  "#7c3aed",
  "#16a34a",
  "#2563eb",
  "#ca8a04",
  "#0891b2",
  "#db2777",
  "#64748b",
  "#9333ea",
];

function PieTooltip({ active, payload, formatValue }) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const percentage = Number(item.payload?.percentage || 0);

  return (
    <div className="dashboard-chart-tooltip">
      <strong>{item.name}</strong>
      <div>
        <span>Value</span>
        <b>{formatValue ? formatValue(item.value) : item.value}</b>
      </div>
      <div>
        <span>Share</span>
        <b>{percentage.toFixed(1)}%</b>
      </div>
    </div>
  );
}

export default function DashboardPieChart({
  data = [],
  categoryKey,
  valueKey,
  metricLabel,
  formatValue,
  height = 290,
}) {
  const [isHoveringSlice, setIsHoveringSlice] = useState(false);

  const total = data.reduce(
    (sum, item) => sum + Number(item[valueKey] || 0),
    0
  );

  const chartData = data
    .map((item) => ({
      ...item,
      __name: item[categoryKey],
      __value: Number(item[valueKey] || 0),
      percentage: total
        ? (Number(item[valueKey] || 0) / total) * 100
        : 0,
    }))
    .filter((item) => item.__value > 0);

  if (!chartData.length) {
    return (
      <div className="dashboard-chart-empty" style={{ height }}>
        No data available for this metric.
      </div>
    );
  }

  const animationKey = `${valueKey}-${chartData
    .map((item) => `${item.__name}:${item.__value}`)
    .join("|")}`;

  return (
    <div
      className="dashboard-chart-canvas dashboard-pie-canvas"
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            key={animationKey}
            data={chartData}
            dataKey="__value"
            nameKey="__name"
            cx="50%"
            cy="47%"
            innerRadius="48%"
            outerRadius="72%"
            paddingAngle={2}
            stroke="#ffffff"
            strokeWidth={2}
            isAnimationActive
            animationBegin={80}
            animationDuration={650}
            animationEasing="ease-out"
            onMouseEnter={() => setIsHoveringSlice(true)}
            onMouseLeave={() => setIsHoveringSlice(false)}
          >
            {chartData.map((item, index) => (
              <Cell
                key={`${item.__name}-${index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            content={<PieTooltip formatValue={formatValue} />}
          />

          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 9, color: "#667085" }}
            formatter={(value) => {
              const item = chartData.find(
                (row) => row.__name === value
              );
              return item
                ? `${value} ${item.percentage.toFixed(1)}%`
                : value;
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {!isHoveringSlice && (
        <div className="dashboard-pie-centre" aria-hidden="true">
          <span>{metricLabel}</span>
          <strong>{formatValue ? formatValue(total) : total}</strong>
        </div>
      )}
    </div>
  );
}
