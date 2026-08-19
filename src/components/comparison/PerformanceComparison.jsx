import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./performanceComparison.css";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MODES = [
  ["yoy", "Year on Year"],
  ["ytm", "Year to Month"],
  ["mom", "Month on Month"],
  ["tot", "Term on Term"],
];

function growth(current, comparison) {
  if (!comparison) return null;
  return ((current - comparison) / comparison) * 100;
}
function growthText(value) {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}
function monthNumber(value) {
  return Number(String(value || "").slice(5, 7));
}
function calendarYear(value) {
  return Number(String(value || "").slice(0, 4));
}
function ayStart(ay) {
  const match = String(ay || "").match(/(20\d{2})/);
  return match ? Number(match[1]) : 0;
}
function monthKeyForAY(ay, month, startMonth) {
  const start = ayStart(ay);
  if (!start || !month) return "";
  const year = month >= startMonth ? start : start + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}
function orderedMonths(startMonth) {
  return Array.from({ length: 12 }, (_, index) => ((startMonth - 1 + index) % 12) + 1);
}
function previousAY(ay, years) {
  const index = years.indexOf(ay);
  return index > 0 ? years[index - 1] : "";
}
function nextAY(ay, years) {
  const index = years.indexOf(ay);
  return index >= 0 && index < years.length - 1 ? years[index + 1] : "";
}
function sum(records, metricKey, metricValue) {
  return records.reduce((total, record) => total + (record[metricKey] === metricValue ? Number(record.amount || 0) : 0), 0);
}

export default function PerformanceComparison({
  records = [],
  academicYears = [],
  metrics = [],
  metricKey = "metric",
  formatCurrency,
  startMonth = 9,
  allowYearBasis = false,
  yearBasis = "finance",
  onYearBasisChange,
  extraControls = null,
}) {
  const years = [...academicYears].sort((a, b) => a.localeCompare(b));
  const latestYear = years[years.length - 1] || "";
  const [mode, setMode] = useState("yoy");
  const [selectedYear, setSelectedYear] = useState(latestYear);
  const [direction, setDirection] = useState("previous");
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedTerm, setSelectedTerm] = useState("Term 2");
  const [comparisonTerm, setComparisonTerm] = useState("Term 1");
  const [comparisonTermYear, setComparisonTermYear] = useState(latestYear);

  const comparisonYear = direction === "next" ? nextAY(selectedYear, years) : previousAY(selectedYear, years);
  const monthOrder = orderedMonths(startMonth);

  const result = useMemo(() => {
    const byYear = (year) => records.filter((record) => record.academicYear === year);
    let currentRecords = [];
    let comparisonRecords = [];
    let currentLabel = selectedYear;
    let comparisonLabel = comparisonYear || "No comparison period";

    if (mode === "yoy") {
      currentRecords = byYear(selectedYear);
      comparisonRecords = byYear(comparisonYear);
    }

    if (mode === "ytm") {
      const allowed = monthOrder.slice(0, monthOrder.indexOf(selectedMonth) + 1);
      currentRecords = byYear(selectedYear).filter((record) => allowed.includes(monthNumber(record.month)));
      comparisonRecords = byYear(comparisonYear).filter((record) => allowed.includes(monthNumber(record.month)));
      currentLabel = `${MONTH_NAMES[startMonth - 1]}–${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
      comparisonLabel = comparisonYear ? `${MONTH_NAMES[startMonth - 1]}–${MONTH_NAMES[selectedMonth - 1]} ${comparisonYear}` : "No comparison period";
    }

    if (mode === "mom") {
      const currentKey = monthKeyForAY(selectedYear, selectedMonth, startMonth);
      const currentDate = new Date(`${currentKey}-01T00:00:00`);
      const previousDate = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() - 1, 1));
      const previousKey = `${previousDate.getUTCFullYear()}-${String(previousDate.getUTCMonth() + 1).padStart(2, "0")}`;
      currentRecords = records.filter((record) => String(record.month || "").startsWith(currentKey));
      comparisonRecords = records.filter((record) => String(record.month || "").startsWith(previousKey));
      currentLabel = `${MONTH_NAMES[selectedMonth - 1]} ${currentDate.getUTCFullYear()}`;
      comparisonLabel = `${MONTH_NAMES[previousDate.getUTCMonth()]} ${previousDate.getUTCFullYear()}`;
    }

    if (mode === "tot") {
      currentRecords = byYear(selectedYear).filter((record) => record.term === selectedTerm);
      comparisonRecords = byYear(comparisonTermYear).filter((record) => record.term === comparisonTerm);
      currentLabel = `${selectedTerm} · ${selectedYear}`;
      comparisonLabel = `${comparisonTerm} · ${comparisonTermYear}`;
    }

    const values = metrics.map((metric) => {
      const current = sum(currentRecords, metricKey, metric.source);
      const comparison = sum(comparisonRecords, metricKey, metric.source);
      return { ...metric, current, comparison, growth: growth(current, comparison) };
    });

    return { currentLabel, comparisonLabel, values };
  }, [records, metrics, metricKey, mode, selectedYear, comparisonYear, selectedMonth, selectedTerm, comparisonTerm, comparisonTermYear, monthOrder, startMonth]);

  const progression = useMemo(() => {
    if (mode !== "ytm" || !comparisonYear) return [];
    const allowed = monthOrder.slice(0, monthOrder.indexOf(selectedMonth) + 1);
    return allowed.map((month) => {
      const currentKey = monthKeyForAY(selectedYear, month, startMonth);
      const comparisonKey = monthKeyForAY(comparisonYear, month, startMonth);
      const currentRecords = records.filter((record) => String(record.month || "").startsWith(currentKey));
      const comparisonRecords = records.filter((record) => String(record.month || "").startsWith(comparisonKey));
      const row = { month: MONTH_NAMES[month - 1] };
      metrics.forEach((metric) => {
        row[`${metric.key}Current`] = sum(currentRecords, metricKey, metric.source);
        row[`${metric.key}Comparison`] = sum(comparisonRecords, metricKey, metric.source);
      });
      return row;
    });
  }, [mode, comparisonYear, monthOrder, selectedMonth, selectedYear, startMonth, records, metrics, metricKey]);

  return (
    <section className="performance-comparison">
      <div className="comparison-mode-bar">
        {MODES.map(([key, label]) => <button key={key} type="button" className={mode === key ? "active" : ""} onClick={() => setMode(key)}>{label}</button>)}
      </div>

      <section className="comparison-control-card">
        <label><span>Academic Year</span><select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>{years.map((year) => <option key={year}>{year}</option>)}</select></label>
        {(mode === "yoy" || mode === "ytm") && <label><span>Compare With</span><select value={direction} onChange={(e) => setDirection(e.target.value)}><option value="previous">Previous Year</option><option value="next">Next Year</option></select></label>}
        {(mode === "ytm" || mode === "mom") && <label><span>{mode === "ytm" ? "Through Month" : "Month"}</span><select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>{monthOrder.map((month) => <option key={month} value={month}>{MONTH_NAMES[month - 1]}</option>)}</select></label>}
        {mode === "tot" && <><label><span>Term</span><select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}><option>Term 1</option><option>Term 2</option><option>Term 3</option></select></label><label><span>Compare Year</span><select value={comparisonTermYear} onChange={(e) => setComparisonTermYear(e.target.value)}>{years.map((year) => <option key={year}>{year}</option>)}</select></label><label><span>Compare Term</span><select value={comparisonTerm} onChange={(e) => setComparisonTerm(e.target.value)}><option>Term 1</option><option>Term 2</option><option>Term 3</option></select></label></>}
        {allowYearBasis && <div className="comparison-basis"><span>Year Basis</span><div><button type="button" className={yearBasis === "finance" ? "active" : ""} onClick={() => onYearBasisChange?.("finance")}>Sep–Aug</button><button type="button" className={yearBasis === "backToSchool" ? "active" : ""} onClick={() => onYearBasisChange?.("backToSchool")}>Aug–Jul</button></div></div>}
        {extraControls}
      </section>

      <div className="comparison-period-heading"><strong>{result.currentLabel}</strong><span>vs</span><strong>{result.comparisonLabel}</strong></div>

      <section className="comparison-kpi-grid">
        {result.values.map((item) => <article key={item.key} className="comparison-kpi"><span>{item.label}</span><strong>{formatCurrency(item.current)}</strong><small>vs {formatCurrency(item.comparison)}</small><b className={item.growth > 0 ? "positive" : item.growth < 0 ? "negative" : "neutral"}>{growthText(item.growth)}</b></article>)}
      </section>

      <section className="comparison-chart-card">
        <div className="comparison-card-heading"><div><h2>Period Comparison</h2><p>{result.currentLabel} compared with {result.comparisonLabel}.</p></div></div>
        <div className="comparison-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={result.values}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#edf1f5"/><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize:10}}/><YAxis axisLine={false} tickLine={false} tick={{fontSize:10}}/><Tooltip formatter={(value) => formatCurrency(value)}/><Legend/><Bar dataKey="current" name={result.currentLabel} fill="#2f80ed" radius={[7,7,2,2]}/><Bar dataKey="comparison" name={result.comparisonLabel} fill="#f2994a" radius={[7,7,2,2]}/></BarChart></ResponsiveContainer></div>
      </section>

      {mode === "ytm" && progression.length > 0 && <section className="comparison-chart-card"><div className="comparison-card-heading"><div><h2>Monthly Progression</h2><p>Month-by-month movement within the selected year-to-month period.</p></div></div><div className="comparison-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={progression}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#edf1f5"/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false} tick={{fontSize:10}}/><Tooltip formatter={(value) => formatCurrency(value)}/><Legend/>{metrics.map((metric, index) => <Line key={metric.key} type="monotone" dataKey={`${metric.key}Current`} name={`${metric.label} · ${selectedYear}`} stroke={index === 0 ? "#2f80ed" : "#f2994a"} strokeWidth={2.2} dot={false}/>)}</LineChart></ResponsiveContainer></div></section>}
    </section>
  );
}
