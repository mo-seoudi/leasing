import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import DashboardCurrencyTooltip from "../../components/dashboard/DashboardCurrencyTooltip";
import KpiCard from "../../components/dashboard/KpiCard";
import MonthlyResultsTable from "../../components/dashboard/MonthlyResultsTable";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import PerformanceChart from "../../components/dashboard/PerformanceChart";
import "../../components/dashboard/dashboardComponents.css";

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

export default function KitchenRentalPage() {
  const { setHeaderControls } = useOutletContext();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const data = await fetchKitchenRentalRecords();
        if (!active) return;
        setRecords(data);
        setAcademicYear((current) => current || data[data.length - 1]?.academicYear || "");
      } catch (error) {
        console.error("Unable to load Kitchen Rental records from Supabase", error);
        if (active) setLoadError("Unable to load Kitchen Rental data from Supabase.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const years = useMemo(() => records.map((item) => item.academicYear), [records]);
  const selected = useMemo(() => records.find((item) => item.academicYear === academicYear) || records[records.length - 1], [records, academicYear]);

  useEffect(() => {
    setHeaderControls(<div className="header-page-filters"><label className="header-filter-control"><span>Academic Year</span><select value={academicYear} onChange={(event) => setAcademicYear(event.target.value)}>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label></div>);
    return () => setHeaderControls(null);
  }, [academicYear, years, setHeaderControls]);

  if (loading) return <section className="kitchen-rental-page"><div className="dashboard-empty-state">Loading Kitchen Rental data…</div></section>;
  if (loadError) return <section className="kitchen-rental-page"><div className="dashboard-empty-state">{loadError}</div></section>;
  if (!selected) return <section className="kitchen-rental-page"><div className="dashboard-empty-state">No Kitchen Rental records have been entered yet.</div></section>;

  const monthlyContractValue = selected.annualRent / 12;
  const reportMonths = Math.min(reportingMonthCount(selected.academicYear), 12);
  const recognisedRevenue = selected.months.slice(0, reportMonths).reduce((sum, item) => sum + item.revenue, 0);
  const recognisedPercentage = selected.annualRent ? (recognisedRevenue / selected.annualRent) * 100 : 0;
  const vatAmount = selected.annualRent * (selected.vatRate / 100);
  const supplier = SUPPLIER_BY_YEAR[selected.academicYear] || "—";

  let cumulative = 0;
  const monthlyData = MONTH_ORDER.map((month, index) => {
    const row = selected.months.find((item) => item.month === month);
    const revenue = index < reportMonths ? Number(row?.revenue || 0) : 0;
    cumulative += revenue;
    return { academicYear: selected.academicYear, label: month, term: row?.term || (index < 4 ? "Term 1" : index < 7 ? "Term 2" : "Term 3"), revenue, cumulativeRevenue: cumulative };
  });
  const termData = ["Term 1", "Term 2", "Term 3"].map((term) => ({ term, revenue: monthlyData.filter((item) => item.term === term).reduce((sum, item) => sum + item.revenue, 0) }));
  const historyData = records.map((item) => ({ academicYear: item.academicYear, revenue: item.annualRent }));
  const metrics = [{ key: "revenue", label: "Rental Revenue", tone: "primary" }];
  const currencyTooltip = <DashboardCurrencyTooltip formatValue={formatCurrency} />;
  const monthlyColumns = [
    { key: "academicYear", label: "Academic Year" },
    { key: "label", label: "Month" },
    { key: "term", label: "Term" },
    { key: "revenue", label: "Rental Revenue", numeric: true, tone: "sales", render: formatCurrency },
    { key: "cumulativeRevenue", label: "Cumulative Revenue", numeric: true, render: formatCurrency },
  ];

  return <section className="kitchen-rental-page">
    <section className="kitchen-rental-kpi-grid">
      <KpiCard label="Recognised Rental Revenue" value={formatCurrency(recognisedRevenue)} detail={`${reportMonths} of 12 reporting months`} />
      <KpiCard label="Contracted Annual Rent" value={formatCurrency(selected.annualRent)} detail="Annual value excluding VAT" />
      <KpiCard label="Monthly Rental Revenue" value={formatCurrency(monthlyContractValue)} detail="Annual rent allocated across 12 months" />
      <KpiCard label="Revenue Recognised" value={formatPercentage(recognisedPercentage)} detail="Of the annual contracted rent" />
    </section>

    <section className="kitchen-rental-two-column-grid">
      <PerformanceChart title="Term Performance" description="Recognised rental revenue across finance terms." data={termData} categoryKey="term" metrics={metrics} overviewLabel="Overview" formatAxis={formatCompactCurrency} formatValue={formatCurrency} tooltipContent={currencyTooltip} defaultMetric="Rental Revenue" />
      <PerformanceChart title="Annual Rental Comparison" description="Contracted annual kitchen rental revenue, excluding VAT." data={historyData} categoryKey="academicYear" metrics={metrics} overviewLabel="Overview" formatAxis={formatCompactCurrency} formatValue={formatCurrency} tooltipContent={currencyTooltip} defaultMetric="Rental Revenue" />
    </section>

    <MonthlyTrendChart data={monthlyData} metrics={[{ key: "cumulativeRevenue", label: "Cumulative Revenue", tone: "primary" }, { key: "revenue", label: "Monthly Revenue", tone: "secondary" }]} defaultMetric="Cumulative Revenue" formatAxis={formatCompactCurrency} tooltipContent={currencyTooltip} className="kitchen-rental-wide-card" />

    <MonthlyResultsTable data={monthlyData} columns={monthlyColumns} totals={{ revenue: formatCurrency(recognisedRevenue), cumulativeRevenue: formatCurrency(recognisedRevenue) }} emptyMessage="No Kitchen Rental records match the selected academic year." resetKey={selected.academicYear} />

    <article className="kitchen-rental-terms-card">
      <div className="kitchen-rental-terms-heading"><div><span>Current arrangement</span><h2>Rental Terms</h2><p>Contract information for the selected academic year.</p></div><span className="kitchen-rental-status">{selected.academicYear === years[years.length - 1] ? "Current" : "Previous"}</span></div>
      <dl className="kitchen-rental-terms">
        <div><dt>Academic year</dt><dd>{selected.academicYear}</dd></div><div><dt>Supplier</dt><dd>{supplier}</dd></div><div><dt>School</dt><dd>{selected.school}</dd></div><div><dt>Annual rent</dt><dd>{formatCurrency(selected.annualRent)}</dd></div><div><dt>Monthly allocation</dt><dd>{formatCurrency(monthlyContractValue)}</dd></div><div><dt>VAT</dt><dd>{selected.vatRate}% · {formatCurrency(vatAmount)}</dd></div><div><dt>Gross amount incl. VAT</dt><dd>{formatCurrency(selected.annualRent + vatAmount)}</dd></div><div><dt>Commercial context</dt><dd>Catering Services Agreement</dd></div>
      </dl>
    </article>
  </section>;
}
