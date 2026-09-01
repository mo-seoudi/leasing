import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import DashboardCurrencyTooltip from "../../components/dashboard/DashboardCurrencyTooltip";
import KpiCard from "../../components/dashboard/KpiCard";
import MonthlyResultsTable from "../../components/dashboard/MonthlyResultsTable";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import "../../components/dashboard/dashboardComponents.css";
import "../../components/comparison/performanceComparison.css";

import { fetchKitchenRentalRecords } from "../../lib/kitchenRentalData";
import "./KitchenRentalPage.css";

const SUPPLIER_BY_YEAR = { "AY2025-26": "Ginza", "AY2026-27": "Ben's Farmhouse" };
const MONTH_ORDER = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(Number(value || 0));
}
function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
}
function formatPercentage(value) { return `${Number(value || 0).toFixed(1)}%`; }
function calculateGrowth(currentValue, previousValue) {
  if (currentValue === null || previousValue === null || previousValue === undefined) return null;
  const previous = Number(previousValue || 0);
  return previous ? ((Number(currentValue || 0) - previous) / previous) * 100 : null;
}
function formatGrowth(value) {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(0)}%`;
}
function growthClass(value) {
  if (value === null || !Number.isFinite(value) || value === 0) return "neutral";
  return value > 0 ? "positive" : "negative";
}
function currentAcademicYear() {
  const now = new Date();
  const start = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return `AY${start}-${String(start + 1).slice(-2)}`;
}
function reportingMonthCount(academicYear) {
  if (academicYear !== currentAcademicYear()) return 12;
  const month = new Date().getMonth();
  return month >= 8 ? month - 7 : month + 5;
}
function academicYearRange(startYear = 2022, endAcademicYear = currentAcademicYear()) {
  const match = String(endAcademicYear || "").match(/^AY(\d{4})-/);
  const endYear = match ? Number(match[1]) : startYear;
  return Array.from({ length: Math.max(endYear - startYear + 1, 1) }, (_, index) => {
    const year = startYear + index;
    return `AY${year}-${String(year + 1).slice(-2)}`;
  });
}
function combineRecords(items) {
  const monthMap = new Map();
  items.forEach((item) => item.months.forEach((row) => {
    const current = monthMap.get(row.month) || { ...row, revenue: 0 };
    current.revenue += Number(row.revenue || 0);
    monthMap.set(row.month, current);
  }));
  return {
    annualRent: items.reduce((sum, item) => sum + Number(item.annualRent || 0), 0),
    vatRate: items[0]?.vatRate || 0,
    months: [...monthMap.values()].sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month)),
  };
}

export default function KitchenRentalPage() {
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
        const data = await fetchKitchenRentalRecords();
        if (!active) return;
        setRecords(data);
        const nextYears = [...new Set(data.map((item) => item.academicYear))].sort((a, b) => b.localeCompare(a));
        setFilters((current) => ({ ...current, academicYear: current.academicYear || nextYears[0] || "" }));
      } catch (error) {
        console.error("Unable to load Kitchen Rental records from Supabase", error);
        if (active) setLoadError("Unable to load Kitchen Rental data from Supabase.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const years = useMemo(() => [...new Set(records.map((item) => item.academicYear))].sort((a, b) => b.localeCompare(a)), [records]);
  const schools = useMemo(() => {
    const map = new Map();
    records.forEach((item) => { if (item.schoolCode) map.set(item.schoolCode, item.school); });
    return [...map.entries()].map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [records]);
  const scopeRecords = useMemo(() => records.filter((item) => !filters.school || item.schoolCode === filters.school), [records, filters.school]);
  const selectedYearRecords = useMemo(() => scopeRecords.filter((item) => item.academicYear === filters.academicYear), [scopeRecords, filters.academicYear]);

  useEffect(() => {
    setHeaderControls(<div className="header-page-filters">
      <label className="header-filter-control"><span>Academic Year</span><select value={filters.academicYear} onChange={(event) => setFilters((current) => ({ ...current, academicYear: event.target.value }))}><option value="">All Years</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
      <label className="header-filter-control wide"><span>School</span><select value={filters.school} onChange={(event) => setFilters((current) => ({ ...current, school: event.target.value }))}><option value="">All Schools</option>{schools.map((school) => <option key={school.code} value={school.code}>{school.name}</option>)}</select></label>
    </div>);
    return () => setHeaderControls(null);
  }, [filters, years, schools, setHeaderControls]);

  if (loading) return <section className="kitchen-rental-page"><div className="dashboard-empty-state">Loading Kitchen Rental data…</div></section>;
  if (loadError) return <section className="kitchen-rental-page"><div className="dashboard-empty-state">{loadError}</div></section>;
  if (!scopeRecords.length) return <section className="kitchen-rental-page"><div className="dashboard-empty-state">No Kitchen Rental records match the selected filters.</div></section>;

  const selectedYears = filters.academicYear ? [filters.academicYear] : years;
  const reportingRecords = filters.academicYear ? selectedYearRecords : scopeRecords;
  const reportingAnnualRent = reportingRecords.reduce((sum, item) => sum + Number(item.annualRent || 0), 0);
  const latestYear = filters.academicYear || years[0] || "";
  const latestYearItems = scopeRecords.filter((item) => item.academicYear === latestYear);
  const latest = combineRecords(latestYearItems);
  const reportMonths = Math.min(reportingMonthCount(latestYear), 12);
  const recognisedRevenue = filters.academicYear
    ? latest.months.slice(0, reportMonths).reduce((sum, item) => sum + Number(item.revenue || 0), 0)
    : reportingAnnualRent;
  const monthlyContractValue = latest.annualRent / 12;
  const recognisedPercentage = latest.annualRent ? (recognisedRevenue / latest.annualRent) * 100 : 0;

  const monthlyData = selectedYears.flatMap((academicYear) => {
    const year = combineRecords(scopeRecords.filter((item) => item.academicYear === academicYear));
    const count = Math.min(reportingMonthCount(academicYear), 12);
    let cumulative = 0;
    return MONTH_ORDER.map((month, index) => {
      const row = year.months.find((item) => item.month === month);
      const revenue = index < count ? Number(row?.revenue || 0) : 0;
      cumulative += revenue;
      return { key: `${academicYear}-${month}`, academicYear, month, label: month, term: row?.term || (index < 4 ? "Term 1" : index < 7 ? "Term 2" : "Term 3"), revenue, cumulativeRevenue: cumulative };
    });
  });

  const actualHistoryData = [...new Set(scopeRecords.map((item) => item.academicYear))]
    .sort((a, b) => a.localeCompare(b))
    .map((academicYear) => ({
      academicYear,
      rentalRevenue: combineRecords(scopeRecords.filter((item) => item.academicYear === academicYear)).annualRent,
    }));
  const comparisonYears = academicYearRange(2022, years[0] || currentAcademicYear());
  const comparisonRows = comparisonYears.map((academicYear, index) => {
    const actual = actualHistoryData.find((item) => item.academicYear === academicYear);
    const previousYear = comparisonYears[index - 1];
    const previousActual = actualHistoryData.find((item) => item.academicYear === previousYear);
    const rentalRevenue = actual ? actual.rentalRevenue : null;
    return { academicYear, rentalRevenue, growth: calculateGrowth(rentalRevenue, previousActual ? previousActual.rentalRevenue : null) };
  });
  const currencyTooltip = <DashboardCurrencyTooltip formatValue={formatCurrency} />;
  const monthlyColumns = [
    { key: "academicYear", label: "Academic Year" }, { key: "label", label: "Month" }, { key: "term", label: "Term" },
    { key: "revenue", label: "Rental Revenue", numeric: true, tone: "sales", render: formatCurrency },
    { key: "cumulativeRevenue", label: "Cumulative Revenue", numeric: true, render: formatCurrency },
  ];
  const tableTotal = monthlyData.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
  const termsItem = latestYearItems[0];
  const supplier = SUPPLIER_BY_YEAR[latestYear] || "—";
  const vatAmount = latest.annualRent * (latest.vatRate / 100);

  return <section className="kitchen-rental-page">
    <section className="kitchen-rental-kpi-grid">
      <KpiCard label="Recognised Rental Revenue" value={formatCurrency(recognisedRevenue)} detail={filters.academicYear ? `${reportMonths} of 12 reporting months` : "Across selected academic years"} />
      <KpiCard label="Contracted Annual Rent" value={formatCurrency(latest.annualRent)} detail={`${latestYear || "Selected year"} · excluding VAT`} />
      <KpiCard label="Monthly Rental Revenue" value={formatCurrency(monthlyContractValue)} detail="Annual rent allocated across 12 months" />
      <KpiCard label="Revenue Recognised" value={formatPercentage(recognisedPercentage)} detail={`Of ${latestYear || "the selected"} contracted rent`} />
    </section>

    <section className="kitchen-rental-two-column-grid">
      <section className="comparison-summary-card kitchen-rental-comparison-table">
        <div className="comparison-card-heading"><div><h2>Year-on-Year Comparison</h2><p>Rental revenue and growth across academic years.</p></div><span className="comparison-year-count">{comparisonRows.length} academic years</span></div>
        <div className="comparison-table-scroll"><table className="comparison-table"><thead><tr><th>Academic Year</th><th>Rental Revenue</th><th>Revenue Growth</th></tr></thead><tbody>{comparisonRows.map((row) => <tr key={row.academicYear}><th>{row.academicYear}</th><td className="comparison-primary-value">{row.rentalRevenue === null ? "—" : formatCurrency(row.rentalRevenue)}</td><td><span className={`comparison-growth-value ${growthClass(row.growth)}`}>{formatGrowth(row.growth)}</span></td></tr>)}</tbody></table></div>
      </section>

      <section className="comparison-chart-card kitchen-rental-comparison-chart"><div className="comparison-card-heading"><div><h2>Academic-Year Comparison</h2><p>Rental revenue across all available academic years.</p></div></div><div className="comparison-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={actualHistoryData} margin={{ top: 18, right: 20, left: 10, bottom: 8 }} barCategoryGap="28%"><CartesianGrid stroke="#edf1f5" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="academicYear" axisLine={false} tickLine={false} tick={{ fill: "#667085", fontSize: 12, fontWeight: 500 }} dy={8}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "#98a2b3", fontSize: 11, fontWeight: 500 }} tickFormatter={formatCompactCurrency}/><Tooltip formatter={(value) => [formatCurrency(value), "Rental Revenue"]}/><Bar dataKey="rentalRevenue" name="Rental Revenue" fill="#2f80ed" radius={[8, 8, 2, 2]} maxBarSize={58}/></BarChart></ResponsiveContainer></div></section>
    </section>

    <MonthlyTrendChart data={monthlyData} metrics={[{ key: "revenue", label: "Monthly Revenue", tone: "secondary" }, { key: "cumulativeRevenue", label: "Cumulative Revenue", tone: "primary" }]} defaultMetric="Monthly Revenue" formatAxis={formatCompactCurrency} tooltipContent={currencyTooltip} className="kitchen-rental-wide-card" />

    <MonthlyResultsTable data={monthlyData} columns={monthlyColumns} totals={{ revenue: formatCurrency(tableTotal), cumulativeRevenue: formatCurrency(tableTotal) }} emptyMessage="No Kitchen Rental records match the selected filters." resetKey={`${filters.academicYear}|${filters.school}`} />

    {termsItem && <article className="kitchen-rental-terms-card">
      <div className="kitchen-rental-terms-heading"><div><span>Current arrangement</span><h2>Rental Terms</h2><p>Contract information for the selected school and academic year.</p></div><span className="kitchen-rental-status">{latestYear === years[0] ? "Current" : "Previous"}</span></div>
      <dl className="kitchen-rental-terms">
        <div><dt>Academic year</dt><dd>{latestYear}</dd></div><div><dt>Supplier</dt><dd>{supplier}</dd></div><div><dt>School</dt><dd>{termsItem.school}</dd></div><div><dt>Annual rent</dt><dd>{formatCurrency(latest.annualRent)}</dd></div><div><dt>Monthly allocation</dt><dd>{formatCurrency(monthlyContractValue)}</dd></div><div><dt>VAT</dt><dd>{latest.vatRate}% · {formatCurrency(vatAmount)}</dd></div><div><dt>Gross amount incl. VAT</dt><dd>{formatCurrency(latest.annualRent + vatAmount)}</dd></div><div><dt>Commercial context</dt><dd>Catering Services Agreement</dd></div>
      </dl>
    </article>}
  </section>;
}
