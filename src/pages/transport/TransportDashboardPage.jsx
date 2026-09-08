import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import DashboardCurrencyTooltip from "../../components/dashboard/DashboardCurrencyTooltip";
import KpiCard from "../../components/dashboard/KpiCard";
import MonthlyResultsTable from "../../components/dashboard/MonthlyResultsTable";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import PerformanceChart from "../../components/dashboard/PerformanceChart";
import "../../components/dashboard/dashboardComponents.css";
import "../catering/CateringDashboardPage.css";

import {
  fetchTransportRecords,
  filterTransportRecords,
  formatCompactCurrency,
  formatCurrency,
  formatPercentage,
  getMonthlyTransportData,
  getSchoolTransportData,
  getTermTransportData,
  getTransportAcademicYears,
  getTransportSchools,
  getTransportSummary,
} from "../../lib/transportData";

export default function TransportDashboardPage() {
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
        const nextRecords = await fetchTransportRecords();
        if (!active) return;
        setRecords(nextRecords);
        const years = getTransportAcademicYears(nextRecords);
        const latest = years[years.length - 1] || "";
        setFilters((current) => ({ ...current, academicYear: current.academicYear || latest }));
      } catch (error) {
        if (!active) return;
        console.error("Unable to load Transport records from Supabase", error);
        setLoadError("Unable to load Transport data.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const academicYears = useMemo(() => getTransportAcademicYears(records), [records]);
  const schools = useMemo(() => getTransportSchools(records), [records]);
  const filteredRecords = useMemo(() => filterTransportRecords(records, filters), [records, filters]);
  const summary = useMemo(() => getTransportSummary(filteredRecords), [filteredRecords]);
  const monthlyData = useMemo(() => getMonthlyTransportData(filteredRecords), [filteredRecords]);
  const schoolData = useMemo(() => getSchoolTransportData(filteredRecords), [filteredRecords]);
  const termData = useMemo(() => getTermTransportData(filteredRecords), [filteredRecords]);
  const tableResetKey = `${filters.academicYear}|${filters.school}`;

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  useEffect(() => {
    setHeaderControls(<div className="header-page-filters">
      <label className="header-filter-control"><span>Academic Year</span><select value={filters.academicYear} onChange={(e) => handleFilterChange("academicYear", e.target.value)}><option value="">All Years</option>{academicYears.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
      <label className="header-filter-control wide"><span>School</span><select value={filters.school} onChange={(e) => handleFilterChange("school", e.target.value)}><option value="">All Schools</option>{schools.map((school) => <option key={school.code} value={school.code}>{school.name}</option>)}</select></label>
    </div>);
    return () => setHeaderControls(null);
  }, [filters, academicYears, schools, setHeaderControls]);

  if (loading) return <section className="dashboard-page"><div className="dashboard-loading-state">Loading Transport data…</div></section>;
  if (loadError) return <section className="dashboard-page"><div className="dashboard-error-state">{loadError}</div></section>;

  const currencyTooltip = <DashboardCurrencyTooltip formatValue={formatCurrency} />;
  const monthlyColumns = [
    { key: "academicYear", label: "Academic Year" },
    { key: "label", label: "Month" },
    { key: "term", label: "Term" },
    { key: "sales", label: "Transport Fees", numeric: true, tone: "sales", render: formatCurrency },
    { key: "commission", label: "Commission", numeric: true, tone: "commission", render: formatCurrency },
    { key: "commissionRate", label: "Commission Rate", numeric: true, render: formatPercentage },
  ];

  return <section className="dashboard-page">
    <section className="dashboard-kpi-grid">
      <KpiCard label="Total Transport Fees" value={formatCurrency(summary.transportFees)} detail={`${summary.months} reporting months`} />
      <KpiCard label="Total Commission" value={formatCurrency(summary.commission)} detail={`${summary.schools} schools included`} />
      <KpiCard label="Effective Commission Rate" value={formatPercentage(summary.commissionRate)} detail="Commission divided by transport fees" />
      <KpiCard label="Average Monthly Fees" value={formatCurrency(summary.averageMonthlyFees)} detail="Average across the selected period" />
    </section>
    <section className="dashboard-two-column-grid">
      <PerformanceChart title="School Performance" description="Transport fees and commission by school." data={schoolData} categoryKey="school" formatAxis={formatCompactCurrency} formatValue={formatCurrency} tooltipContent={currencyTooltip} />
      <PerformanceChart title="Term Performance" description="Performance across finance terms." data={termData} categoryKey="term" formatAxis={formatCompactCurrency} formatValue={formatCurrency} tooltipContent={currencyTooltip} defaultMetric="Sales" defaultView="Pie" />
    </section>
    <MonthlyTrendChart data={monthlyData} formatAxis={formatCompactCurrency} tooltipContent={currencyTooltip} className="dashboard-wide-card" />
    <MonthlyResultsTable data={monthlyData} columns={monthlyColumns} totals={{ sales: formatCurrency(summary.transportFees), commission: formatCurrency(summary.commission), commissionRate: formatPercentage(summary.commissionRate) }} emptyMessage="No Transport records match the selected filters." resetKey={tableResetKey} />
  </section>;
}
