import { useMemo, useState } from "react";

import ChartCard from "./ChartCard";
import DashboardLineChart from "./DashboardLineChart";
import MetricToggle from "./MetricToggle";

const DEFAULT_METRICS = [
  { key: "sales", label: "Sales", tone: "primary" },
  { key: "commission", label: "Commission", tone: "secondary" },
];

export default function MonthlyTrendChart({
  data = [],
  metrics = DEFAULT_METRICS,
  defaultMetric,
  formatAxis,
  tooltipContent,
  className = "",
  height = 290,
}) {
  const initialMetric = defaultMetric || metrics[0]?.label || "";
  const [metric, setMetric] = useState(initialMetric);

  const selectedMetric = useMemo(
    () =>
      metrics.find((item) => item.label === metric) || metrics[0],
    [metric, metrics]
  );

  return (
    <ChartCard
      title="Monthly Trend"
      description={`${selectedMetric?.label || "Performance"} by month for the selected reporting scope.`}
      className={className}
      action={
        <MetricToggle
          options={metrics.map((item) => item.label)}
          value={selectedMetric?.label || ""}
          onChange={setMetric}
          ariaLabel="Monthly trend metric"
        />
      }
    >
      <DashboardLineChart
        data={data}
        xKey="label"
        series={
          selectedMetric
            ? [
                {
                  key: selectedMetric.key,
                  label: selectedMetric.label,
                  tone: selectedMetric.tone,
                },
              ]
            : []
        }
        formatAxis={formatAxis}
        tooltipContent={tooltipContent}
        height={height}
      />
    </ChartCard>
  );
}
