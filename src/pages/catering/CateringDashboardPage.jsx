import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import DashboardCurrencyTooltip from "../../components/dashboard/DashboardCurrencyTooltip";
import KpiCard from "../../components/dashboard/KpiCard";
import MonthlyResultsTable from "../../components/dashboard/MonthlyResultsTable";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import PerformanceChart from "../../components/dashboard/PerformanceChart";
import "../../components/dashboard/dashboardComponents.css";

import {
  fetchCateringRecords,
  filterCateringRecords,
  formatCompactCurrency,
  formatCurrency,
  formatPercentage,
  getCateringAcademicYears,
  getCateringSchools,
  getCateringSummary,
  getMonthlyCateringData,
  getSchoolCateringData,
  getTermCateringData,
} from "../../lib/cateringData";

import "./CateringDashboardPage.css";

export default function CateringDashboardPage() {
  const { setHeaderControls } = useOutletContext();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filters, setFilters] = useState({ academicYear: "", school: "" });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const nextRecords = await fetchCateringRecords();
        if (!active) return;
        setRecords(nextRecords);
        const years = getCateringAcademicYears(nextRecords);
        const latest = years[years.length - 1] || "";
        setFilters((current) => ({ ...current, academicYear: current.academicYear || latest }));
      } catch (error) {
        if (!active) return;
        console.error("Unable to load Catering records from Supabase", error);
        setLoadError("Unable to load Catering data.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const academicYears = useMemo(() => getCateringAcademicYears(records), [records]);
  const schools = useMemo(() => getCateringSchools(records), [records]);
  const filteredRecords = useMemo(() => filterCateringRecords(records, filters), [records, filters]);
  const summary = useMemo(() => getCateringSummary(filteredRecords), [filteredRecords]);
  const monthlyData = useMemo(() => getMonthlyCateringData(filteredRecords), [filteredRecords]);
  const schoolData = useMemo(() => getSchoolCateringData(filteredRecords), [filteredRecords]);
  const termData = useMemo(() => getTermCateringData(filteredRecords), [filteredRecords]);
  const tableResetKey = `${filters.academicYear}|${filters.school}`;

  function handleFilterChange(name, value) { setFilters((current) => ({ ...current, [name]: value })); }

  useEffect(() => {
    setHeaderControls(<div className="header-page-filters">
      <label className="header-filter-control"><span>Academic Year</span><select value={filters.academicYear} onChange={(e) => handleFilterChange("academicYear", e.target.value)}><option value="">All Years</option>{academicYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
      <label className="header-filter-control wide"><span>School</span><select value={filters.school} onChange={(e) => handleFilterChange("school", e.target.value)}><option value="">All Schools</option>{schools.map((school) => <option key={school.code} value={school.code}>{school.name}</option>)}</select></label>
    </div>);
    return () => setHeaderControls(null);
  }, [filters, academicYears, schools, setHeaderControls]);

  if (loading) return <section className="dashboard-page catering-dashboard-page"><div className="dashboard-loading-state">Loading Catering data…</div></section>;
  if (loadError) return <section className="dashboard-page catering-dashboard-page"><div className="dashboard-error-state">{loadError}</div></section>;

  const currencyTooltip = <DashboardCurrencyTooltip formatValue={formatCurrency} />;
  const monthlyColumns = [
    { key: "academicYear", label: "Academic Year" }, { key: "label", label: "Month" }, { key: "term", label: "Term" },
    { key: "sales", label: "Sales", numeric: true, tone: "sales", render: formatCurrency },
    { key: "commission", label: "Commission", numeric: true, tone: "commission", render: formatCurrency },
    { key: "commissionRate", label: "Commission Rate", numeric: true, render: formatPercentage },
  ];

  return <section className="dashboard-page catering-dashboard-page">
    <section className="dashboard-kpi-grid">
      <KpiCard label="Total Sales" value={formatCurrency(summary.sales)} detail={`${summary.months} reporting months`} />
      <KpiCard label="Total Commission" value={formatCurrency(summary.commission)} detail={`${summary.schools} schools included`} />
      <KpiCard label="Effective Commission Rate" value={formatPercentage(summary.commissionRate)} detail="Commission divided by catering sales" />
      <KpiCard label="Average Monthly Sales" value={formatCurrency(summary.averageMonthlySales)} detail="Average across the selected period" />
    </section>
    <section className="dashboard-two-column-grid">
      <PerformanceChart title="School Performance" description="Sales and commission by school." data={schoolData} categoryKey="school" formatAxis={formatCompactCurrency} formatValue={formatCurrency} tooltipContent={currencyTooltip} />
      <PerformanceChart title="Term Performance" description="Performance across finance terms." data={termData} categoryKey="term" formatAxis={formatCompactCurrency} formatValue={formatCurrency} tooltipContent={currencyTooltip} defaultMetric="Sales" defaultView="Pie" />
    </section>
    <MonthlyTrendChart data={monthlyData} formatAxis={formatCompactCurrency} tooltipContent={currencyTooltip} className="dashboard-wide-card" />
    <MonthlyResultsTable data={monthlyData} columns={monthlyColumns} totals={{ sales: formatCurrency(summary.sales), commission: formatCurrency(summary.commission), commissionRate: formatPercentage(summary.commissionRate) }} emptyMessage="No catering records match the selected filters." resetKey={tableResetKey} />
  </section>;
}
