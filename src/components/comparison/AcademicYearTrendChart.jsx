import { useMemo, useState } from "react";

import ChartCard from "../dashboard/ChartCard";
import DashboardLineChart from "../dashboard/DashboardLineChart";
import MetricToggle from "../dashboard/MetricToggle";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LOOKUP = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9,
  sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};
const YEAR_COLORS = ["#1679a7", "#d85f1b", "#7c3aed", "#667085", "#16a085", "#b54708"];

function getMonthNumber(record) {
  const raw = String(record.month || "").trim();
  const dateMatch = raw.match(/^20\d{2}-(\d{1,2})/);
  if (dateMatch) return Number(dateMatch[1]);
  return MONTH_LOOKUP[raw.toLowerCase()] || 0;
}

function getOrderedMonths(startMonth) {
  return Array.from({ length: 12 }, (_, index) => ((startMonth - 1 + index) % 12) + 1);
}

export default function AcademicYearTrendChart({
  records = [], academicYears = [], metrics = [], metricKey = "metric", startMonth = 9,
  formatAxis, formatCurrency, height = 300,
}) {
  const [metricLabel, setMetricLabel] = useState(metrics[0]?.label || "");
  const selectedMetric = metrics.find((item) => item.label === metricLabel) || metrics[0];
  const years = useMemo(() => [...academicYears].sort((a, b) => a.localeCompare(b)), [academicYears]);
  const monthOrder = useMemo(() => getOrderedMonths(startMonth), [startMonth]);

  const data = useMemo(() => monthOrder.map((monthNumber) => {
    const row = { label: MONTH_NAMES[monthNumber - 1] };
    years.forEach((academicYear, index) => {
      row[`year${index}`] = records.reduce((total, record) => {
        if (record.academicYear === academicYear && getMonthNumber(record) === monthNumber && record[metricKey] === selectedMetric?.source) {
          return total + Number(record.amount || 0);
        }
        return total;
      }, 0);
    });
    return row;
  }), [records, years, monthOrder, metricKey, selectedMetric]);

  const series = years.map((academicYear, index) => ({
    key: `year${index}`,
    label: academicYear,
    color: YEAR_COLORS[index % YEAR_COLORS.length],
    strokeWidth: index === years.length - 1 ? 3 : 2,
    dot: { r: index === years.length - 1 ? 3 : 2.5 },
  }));

  const tooltipContent = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return <div className="dashboard-chart-tooltip"><strong>{label}</strong>{payload.map((item) => <div key={item.dataKey}><span>{item.name}</span><b>{formatCurrency ? formatCurrency(item.value) : item.value}</b></div>)}</div>;
  };

  if (!selectedMetric || !years.length) return null;

  return <ChartCard
    title="Monthly Trend by Academic Year"
    description={`${selectedMetric.label} by month across all available academic years.`}
    className="comparison-year-trend-card"
    action={<MetricToggle options={metrics.map((item) => item.label)} value={selectedMetric.label} onChange={setMetricLabel} ariaLabel="Academic year trend metric" />}
  >
    <DashboardLineChart data={data} xKey="label" series={series} formatAxis={formatAxis} tooltipContent={tooltipContent} height={height} />
    <div className="comparison-year-trend-legend">
      {years.map((year, index) => <span key={year}><i style={{ backgroundColor: YEAR_COLORS[index % YEAR_COLORS.length] }} />{year}</span>)}
    </div>
  </ChartCard>;
}
