import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getDashboardTone } from "./dashboardTheme";

export default function DashboardLineChart({
  data = [],
  xKey,
  series = [],
  formatAxis,
  tooltipContent,
  height = 290,
  yAxisWidth = 80,
}) {
  return (
    <div className="dashboard-chart-canvas" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 15, right: 20, left: 10, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={formatAxis}
            tickLine={false}
            axisLine={false}
            width={yAxisWidth}
          />
          {tooltipContent ? <Tooltip content={tooltipContent} /> : null}
          {series.map((item) => (
            <Line
              key={item.key}
              type={item.type || "monotone"}
              dataKey={item.key}
              name={item.label || item.key}
              stroke={item.color || getDashboardTone(item.tone)}
              strokeWidth={item.strokeWidth || 3}
              dot={item.dot ?? { r: 3 }}
              activeDot={item.activeDot ?? { r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
