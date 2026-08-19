import { useState } from "react";

import ChartCard from "./ChartCard";
import DashboardLineChart from "./DashboardLineChart";
import MetricToggle from "./MetricToggle";

export default function MonthlyTrendChart({
  data = [],
  formatAxis,
  tooltipContent,
  className = "",
  height = 290,
}) {
  const [metric, setMetric] = useState("Sales");
  const dataKey = metric === "Sales" ? "sales" : "commission";

  return (
    <ChartCard
      title="Monthly Trend"
      description={`${metric} by month for the selected reporting scope.`}
      className={className}
      action={
        <MetricToggle
          options={["Sales", "Commission"]}
          value={metric}
          onChange={setMetric}
          ariaLabel="Monthly trend metric"
        />
      }
    >
      <DashboardLineChart
        data={data}
        xKey="label"
        series={[
          {
            key: dataKey,
            label: metric,
            tone: metric === "Sales" ? "primary" : "secondary",
          },
        ]}
        formatAxis={formatAxis}
        tooltipContent={tooltipContent}
        height={height}
      />
    </ChartCard>
  );
}
