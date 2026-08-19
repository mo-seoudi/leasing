import { useState } from "react";

import ChartCard from "./ChartCard";
import DashboardBarChart from "./DashboardBarChart";
import DashboardPieChart from "./DashboardPieChart";
import MetricToggle from "./MetricToggle";

const METRIC_OPTIONS = ["Both", "Sales", "Commission"];
const VIEW_OPTIONS = ["Bar", "Pie"];

export default function PerformanceChart({
  title,
  description,
  data = [],
  categoryKey,
  formatAxis,
  formatValue,
  tooltipContent,
  height = 290,
}) {
  const [metric, setMetric] = useState("Both");
  const [view, setView] = useState("Bar");

  function handleViewChange(nextView) {
    setView(nextView);

    if (nextView === "Pie" && metric === "Both") {
      setMetric("Sales");
    }
  }

  const barSeries =
    metric === "Both"
      ? [
          { key: "sales", label: "Sales", tone: "primary" },
          { key: "commission", label: "Commission", tone: "secondary" },
        ]
      : metric === "Sales"
        ? [{ key: "sales", label: "Sales", tone: "primary" }]
        : [{ key: "commission", label: "Commission", tone: "secondary" }];

  const pieMetric = metric === "Commission" ? "Commission" : "Sales";
  const pieValueKey = pieMetric === "Sales" ? "sales" : "commission";

  return (
    <ChartCard
      title={title}
      description={description}
      action={
        <div className="dashboard-chart-controls">
          <MetricToggle
            options={METRIC_OPTIONS}
            value={metric}
            onChange={setMetric}
            ariaLabel={`${title} metric`}
          />
          <MetricToggle
            options={VIEW_OPTIONS}
            value={view}
            onChange={handleViewChange}
            ariaLabel={`${title} chart type`}
          />
        </div>
      }
    >
      {view === "Pie" ? (
        <DashboardPieChart
          data={data}
          categoryKey={categoryKey}
          valueKey={pieValueKey}
          metricLabel={pieMetric}
          formatValue={formatValue}
          height={height}
        />
      ) : (
        <DashboardBarChart
          data={data}
          categoryKey={categoryKey}
          series={barSeries}
          formatAxis={formatAxis}
          tooltipContent={tooltipContent}
          height={height}
        />
      )}
    </ChartCard>
  );
}
