import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import DashboardCurrencyTooltip from "../../components/dashboard/DashboardCurrencyTooltip";
import KpiCard from "../../components/dashboard/KpiCard";
import MonthlyResultsTable from "../../components/dashboard/MonthlyResultsTable";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import PerformanceChart from "../../components/dashboard/PerformanceChart";
import "../../components/dashboard/dashboardComponents.css";

import {
  calculateKPIs,
  formatCompactCurrency,
  formatCurrency,
  formatPercentage,
  getMonthlyTrend,
  getSchoolBreakdown,
  getTermBreakdown,
} from "../../lib/dashboardData";
import {
  fetchLeasingDashboardDimensions,
  fetchLeasingDashboardRecords,
} from "../../lib/leasingSupabaseData";

const LEASING_METRICS = [
  { key: "totalRevenue", label: "Revenue", tone: "primary" },
  { key: "schoolIncome", label: "School Income", tone: "secondary" },
];

export default function LeasingDashboardPage() {
  const { setHeaderControls } = useOutletContext();
  const [records, setRecords] = useState([]);
  const [dimensions, setDimensions] = useState({ academicYears: [], schools: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState({ academicYear: "", school: "" });
  const [dimensionsReady, setDimensionsReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDimensions() {
      try {
        setLoading(true);
        setLoadError("");
        const nextDimensions = await fetchLeasingDashboardDimensions();

        if (!active) return;

        setDimensions(nextDimensions);
        const latestAcademicYear =
          nextDimensions.academicYears[nextDimensions.academicYears.length - 1] || "";
        setFilters((current) => ({
          ...current,
          academicYear: current.academicYear || latestAcademicYear,
        }));
        setDimensionsReady(true);
      } catch (error) {
        if (!active) return;
        console.error("Unable to load Leasing dimensions from Supabase", error);
        setLoadError("Unable to load Leasing data from Supabase.");
        setLoading(false);
      }
    }

    loadDimensions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!dimensionsReady) return undefined;

    let active = true;

    async function loadRecords() {
      try {
        setLoading(true);
        setLoadError("");

        const selectedSchool = dimensions.schools.find(
          (school) => school.display === filters.school
        );

        const nextRecords = await fetchLeasingDashboardRecords({
          academicYear: filters.academicYear,
          schoolCode: selectedSchool?.code || "",
        });

        if (!active) return;
        setRecords(nextRecords);
      } catch (error) {
        if (!active) return;
        console.error("Unable to load Leasing records from Supabase", error);
        setLoadError("Unable to load Leasing records from Supabase.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRecords();
    return () => {
      active = false;
    };
  }, [dimensionsReady, filters.academicYear, filters.school, dimensions.schools]);

  const summary = useMemo(() => calculateKPIs(records), [records]);
  const monthlyData = useMemo(() => getMonthlyTrend(records), [records]);
  const schoolData = useMemo(() => getSchoolBreakdown(records), [records]);
  const termData = useMemo(() => getTermBreakdown(records), [records]);

  const months = new Set(monthlyData.map((item) => item.monthKey)).size;
  const includedSchools = new Set(records.map((item) => item.school).filter(Boolean)).size;
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
            {dimensions.academicYears.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label className="header-filter-control wide">
          <span>School</span>
          <select value={filters.school} onChange={(e) => handleFilterChange("school", e.target.value)}>
            <option value="">All Schools</option>
            {dimensions.schools.map((school) => <option key={school.code} value={school.display}>{school.display}</option>)}
          </select>
        </label>
      </div>
    );
    return () => setHeaderControls(null);
  }, [filters, dimensions, setHeaderControls]);

  const tooltip = <DashboardCurrencyTooltip formatValue={formatCurrency} />;
  const columns = [
    { key: "academicYear", label: "Academic Year" },
    { key: "label", label: "Month" },
    { key: "term", label: "Term" },
    { key: "totalRevenue", label: "Revenue", numeric: true, tone: "sales", render: formatCurrency },
    { key: "schoolIncome", label: "School Income", numeric: true, tone: "commission", render: formatCurrency },
    { key: "incomeRate", label: "Income Rate", numeric: true, render: formatPercentage },
  ];

  if (loading) {
    return <section className="dashboard-page leasing-dashboard-page"><div className="dashboard-empty-state">Loading Leasing data…</div></section>;
  }

  if (loadError) {
    return <section className="dashboard-page leasing-dashboard-page"><div className="dashboard-empty-state">{loadError}</div></section>;
  }

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
