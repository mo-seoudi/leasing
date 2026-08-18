import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getDashboardTone } from "./dashboardTheme";

export default function DashboardBarChart({
  data = [],
  categoryKey,
  series = [],
  formatAxis,
  tooltipContent,
  height = 290,
  showLegend = true,
  yAxisWidth = 84,
}) {
  return (
    <div className="dashboard-chart-canvas" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 24, bottom: 5 }}
          barCategoryGap="22%"
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={formatAxis}
            tickLine={false}
            axisLine={false}
            width={yAxisWidth}
          />
          {tooltipContent ? <Tooltip content={tooltipContent} /> : null}
          {showLegend ? <Legend /> : null}
          {series.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label || item.key}
              fill={item.color || getDashboardTone(item.tone)}
              radius={item.radius || [5, 5, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
