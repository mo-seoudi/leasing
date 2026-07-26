import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MonthlyTrendChart({
  data,
  dataKey,
  title,
  color = "#0f4c81",
}) {
  return (
    <div className="card">

      <h2>{title}</h2>

      <ResponsiveContainer
        width="100%"
        height={380}
      >

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="month"
          />

          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat("en-AE", {
                notation: "compact",
              }).format(value)
            }
          />

          <Tooltip
            formatter={(value) => formatCurrency(value)}
          />

          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 7 }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}
