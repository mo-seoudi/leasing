import { useEffect, useState } from "react";
import { FaChartBar, FaChartPie } from "react-icons/fa";

import ChartCard from "./ChartCard";
import DashboardBarChart from "./DashboardBarChart";
import DashboardPieChart from "./DashboardPieChart";
import MetricToggle from "./MetricToggle";

const METRIC_OPTIONS = ["Overview", "Sales", "Commission"];
const VIEW_OPTIONS = [
  { value: "Bar", label: "Bar chart", icon: FaChartBar },
  { value: "Pie", label: "Pie chart", icon: FaChartPie },
];

export default function PerformanceChart({
  title,
  description,
  data = [],
  categoryKey,
  formatAxis,
  formatValue,
  tooltipContent,
  height = 290,
  defaultMetric = "Overview",
  defaultView = "Bar",
}) {
  const [metric, setMetric] = useState(defaultMetric);
  const [view, setView] = useState(defaultView);
  const [initialPieReady, setInitialPieReady] = useState(
    defaultView !== "Pie"
  );

  useEffect(() => {
    if (defaultView !== "Pie") {
      setInitialPieReady(true);
      return undefined;
    }

    setInitialPieReady(false);

    const timer = window.setTimeout(() => {
      setInitialPieReady(true);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [defaultView]);

  function handleMetricChange(nextMetric) {
    if (view === "Pie" && nextMetric === "Overview") {
      setView("Bar");
    }

    setMetric(nextMetric);
  }

  function handleViewChange(nextView) {
    setInitialPieReady(true);
    setView(nextView);

    if (nextView === "Pie" && metric === "Overview") {
      setMetric("Sales");
    }
  }

  const barSeries =
    metric === "Overview"
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
            onChange={handleMetricChange}
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
        initialPieReady ? (
          <DashboardPieChart
            data={data}
            categoryKey={categoryKey}
            valueKey={pieValueKey}
            metricLabel={pieMetric}
            formatValue={formatValue}
            height={height}
          />
        ) : (
          <div
            className="dashboard-chart-canvas"
            style={{ height }}
            aria-hidden="true"
          />
        )
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
