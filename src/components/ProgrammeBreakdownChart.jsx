import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "../lib/dashboardData";

function shortenLabel(value, maxLength = 22) {
  if (!value) {
    return "";
  }

  return value.length > maxLength
    ? `${value.slice(0, maxLength)}…`
    : value;
}

export default function ProgrammeBreakdownChart({
  data = [],
  dataKey = "schoolIncome",
  title = "Programme Performance",
}) {
  const chartData = data.map((item) => ({
    ...item,
    displayProgramme: shortenLabel(item.programme),
  }));

  return (
    <section className="card chart-card">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>

          <p>
            Comparison of programme performance based on the selected filters.
          </p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="chart-wrapper chart-wrapper-large">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 10,
                right: 30,
                bottom: 10,
                left: 20,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
              />

              <XAxis
                type="number"
                tickFormatter={(value) =>
                  new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(value)
                }
              />

              <YAxis
                type="category"
                dataKey="displayProgramme"
                width={170}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.programme ??
                  "Programme"
                }
              />

              <Bar
                dataKey={dataKey}
                name="School Income"
                fill="#0f4c81"
                radius={[0, 5, 5, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="empty-state">
          No programme data is available for the selected filters.
        </div>
      )}
    </section>
  );
}
