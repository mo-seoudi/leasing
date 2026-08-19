import { useEffect, useMemo, useState } from "react";

import ChartCard from "./ChartCard";
import DashboardBarChart from "./DashboardBarChart";
import DashboardPieChart from "./DashboardPieChart";
import MetricToggle from "./MetricToggle";
import {
  BarChartViewIcon,
  PieChartViewIcon,
} from "./DashboardViewIcons";

const VIEW_OPTIONS = [
  { value: "Bar", label: "Bar chart", icon: BarChartViewIcon },
  { value: "Pie", label: "Pie chart", icon: PieChartViewIcon },
];

const DEFAULT_METRICS = [
  { key: "sales", label: "Sales", tone: "primary" },
  { key: "commission", label: "Commission", tone: "secondary" },
];

export default function PerformanceChart({
  title,
  description,
  data = [],
  categoryKey,
  metrics = DEFAULT_METRICS,
  overviewLabel = "Overview",
  formatAxis,
  formatValue,
  tooltipContent,
  height = 290,
  defaultMetric = "Overview",
  defaultView = "Bar",
}) {
  const metricOptions = useMemo(
    () => [overviewLabel, ...metrics.map((item) => item.label)],
    [metrics, overviewLabel]
  );

  const fallbackMetric = metrics[0]?.label || overviewLabel;
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
    if (view === "Pie" && nextMetric === overviewLabel) {
      setView("Bar");
    }

    setMetric(nextMetric);
  }

  function handleViewChange(nextView) {
    setInitialPieReady(true);
    setView(nextView);

    if (nextView === "Pie" && metric === overviewLabel) {
      setMetric(fallbackMetric);
    }
  }

  const selectedMetric =
    metrics.find((item) => item.label === metric) || metrics[0];

  const barSeries =
    metric === overviewLabel
      ? metrics
      : selectedMetric
        ? [selectedMetric]
        : [];

  const pieMetric = selectedMetric || metrics[0];

  return (
    <ChartCard
      title={title}
      description={description}
      action={
        <div className="dashboard-chart-controls">
          <MetricToggle
            options={metricOptions}
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
        initialPieReady && pieMetric ? (
          <DashboardPieChart
            data={data}
            categoryKey={categoryKey}
            valueKey={pieMetric.key}
            metricLabel={pieMetric.label}
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
