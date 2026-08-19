import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import DashboardCurrencyTooltip from "../../components/dashboard/DashboardCurrencyTooltip";
import KpiCard from "../../components/dashboard/KpiCard";
import MonthlyResultsTable from "../../components/dashboard/MonthlyResultsTable";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import PerformanceChart from "../../components/dashboard/PerformanceChart";
import "../../components/dashboard/dashboardComponents.css";

import {
  academicYears,
  calculateKPIs,
  filterRecords,
  formatCompactCurrency,
  formatCurrency,
  formatPercentage,
  getMonthlyTrend,
  getSchoolBreakdown,
  getTermBreakdown,
  schools,
} from "../../lib/dashboardData";

const LEASING_METRICS = [
  { key: "totalRevenue", label: "Revenue", tone: "primary" },
  { key: "schoolIncome", label: "School Income", tone: "secondary" },
];

export default function LeasingDashboardPage() {
  const { setHeaderControls } = useOutletContext();
  const latestAcademicYear = academicYears[academicYears.length - 1] || "";
  const [filters, setFilters] = useState({ academicYear: latestAcademicYear, school: "" });

  const filteredRecords = useMemo(() => filterRecords(filters), [filters]);
  const summary = useMemo(() => calculateKPIs(filteredRecords), [filteredRecords]);
  const monthlyData = useMemo(() => getMonthlyTrend(filteredRecords), [filteredRecords]);
  const schoolData = useMemo(() => getSchoolBreakdown(filteredRecords), [filteredRecords]);
  const termData = useMemo(() => getTermBreakdown(filteredRecords), [filteredRecords]);

  const months = new Set(monthlyData.map((item) => item.monthKey)).size;
  const includedSchools = new Set(filteredRecords.map((item) => item.school).filter(Boolean)).size;
  const incomeRate = summary.totalRevenue ? (summary.schoolIncome / summary.totalRevenue) * 100 : 0;
  const tableResetKey = `${filters.academicYear}|${filters.school}`;

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  useEffect(() => {
    setHeaderControls(
      <div className="header-page-filters">
        <label className="header-filter-control">
          <span>Academic Year</span>
          <select value={filters.academicYear} onChange={(e) => handleFilterChange("academicYear", e.target.value)}>
            <option value="">All Years</option>
            {academicYears.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label className="header-filter-control wide">
          <span>School</span>
          <select value={filters.school} onChange={(e) => handleFilterChange("school", e.target.value)}>
            <option value="">All Schools</option>
            {schools.map((school) => <option key={school} value={school}>{school}</option>)}
          </select>
        </label>
      </div>
    );
    return () => setHeaderControls(null);
  }, [filters, setHeaderControls]);

  const tooltip = <DashboardCurrencyTooltip formatValue={formatCurrency} />;
  const columns = [
    { key: "academicYear", label: "Academic Year" },
    { key: "label", label: "Month" },
    { key: "term", label: "Term" },
    { key: "totalRevenue", label: "Revenue", numeric: true, tone: "sales", render: formatCurrency },
    { key: "schoolIncome", label: "School Income", numeric: true, tone: "commission", render: formatCurrency },
    { key: "incomeRate", label: "Income Rate", numeric: true, render: formatPercentage },
  ];

  return (
    <section className="dashboard-page leasing-dashboard-page">
      <section className="dashboard-kpi-grid">
        <KpiCard label="Total Revenue" value={formatCurrency(summary.totalRevenue)} detail={`${months} reporting months`} />
        <KpiCard label="Total School Income" value={formatCurrency(summary.schoolIncome)} detail={`${includedSchools} schools included`} />
        <KpiCard label="Effective School Income Rate" value={formatPercentage(incomeRate)} detail="School income divided by revenue" />
        <KpiCard label="Rental Income" value={formatCurrency(summary.rentalFees)} detail="Income from rental arrangements" />
      </section>
      <section className="dashboard-two-column-grid">
        <PerformanceChart title="School Performance" description="Revenue and school income by school." data={schoolData} categoryKey="school" metrics={LEASING_METRICS} formatAxis={formatCompactCurrency} formatValue={formatCurrency} tooltipContent={tooltip} />
        <PerformanceChart title="Term Performance" description="Performance across finance terms." data={termData} categoryKey="term" metrics={LEASING_METRICS} formatAxis={formatCompactCurrency} formatValue={formatCurrency} tooltipContent={tooltip} defaultMetric="Revenue" defaultView="Pie" />
      </section>
      <MonthlyTrendChart data={monthlyData} metrics={LEASING_METRICS} defaultMetric="Revenue" formatAxis={formatCompactCurrency} tooltipContent={tooltip} className="dashboard-wide-card" />
      <MonthlyResultsTable data={monthlyData} columns={columns} totals={{ totalRevenue: formatCurrency(summary.totalRevenue), schoolIncome: formatCurrency(summary.schoolIncome), incomeRate: formatPercentage(incomeRate) }} emptyMessage="No leasing records match the selected filters." resetKey={tableResetKey} />
    </section>
  );
}
