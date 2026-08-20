import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AcademicYearTrendChart from "./AcademicYearTrendChart";
import "./performanceComparison.css";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_LOOKUP = {
  jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,
  jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12,
};
const MODES = [
  ["yoy", "Year on Year"],
  ["tot", "Term on Term"],
  ["mom", "Month on Month"],
  ["ytm", "Year to Month"],
];
const TERMS = ["Term 1", "Term 2", "Term 3"];

function calculateGrowth(currentValue, comparisonValue) {
  const current = Number(currentValue || 0);
  const comparison = Number(comparisonValue || 0);
  if (comparison === 0) return null;
  return ((current - comparison) / comparison) * 100;
}
function formatGrowth(value) {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(0)}%`;
}
function getGrowthClass(value) {
  if (value === null || !Number.isFinite(value) || value === 0) return "neutral";
  return value > 0 ? "positive" : "negative";
}
function getMonthNumberFromRecord(record) {
  const raw = String(record.month || "").trim();
  const dateMatch = raw.match(/^20\d{2}-(\d{1,2})/);
  if (dateMatch) return Number(dateMatch[1]);
  return MONTH_LOOKUP[raw.toLowerCase()] || 0;
}
function getOrderedMonths(startMonth) {
  return Array.from({ length: 12 }, (_, index) => ((startMonth - 1 + index) % 12) + 1);
}
function sumMetric(records, metricKey, metricValue) {
  return records.reduce((total, record) => record[metricKey] === metricValue ? total + Number(record.amount || 0) : total, 0);
}
function getYearRecords(records, academicYear) {
  return records.filter((record) => record.academicYear === academicYear);
}

export default function PerformanceComparison({
  records = [], academicYears = [], metrics = [], metricKey = "metric", formatCurrency,
  startMonth = 9, allowYearBasis = false, yearBasis = "finance", onYearBasisChange,
  extraControls = null, scopeLabel = "All Schools",
}) {
  const years = useMemo(() => [...academicYears].sort((a,b) => a.localeCompare(b)), [academicYears]);
  const monthOrder = useMemo(() => getOrderedMonths(startMonth), [startMonth]);
  const [mode, setMode] = useState("yoy");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth() + 1;
    return currentMonth === 1 ? 12 : currentMonth - 1;
  });
  const [selectedTerm, setSelectedTerm] = useState("Term 1");

  const rows = useMemo(() => years.map((academicYear, yearIndex) => {
    const yearRecords = getYearRecords(records, academicYear);
    const previousAcademicYear = years[yearIndex - 1] || "";
    const previousYearRecords = previousAcademicYear ? getYearRecords(records, previousAcademicYear) : [];
    let currentRecords = yearRecords;
    let baselineRecords = previousYearRecords;

    if (mode === "tot") {
      currentRecords = yearRecords.filter((record) => record.term === selectedTerm);
      baselineRecords = previousYearRecords.filter((record) => record.term === selectedTerm);
    }
    if (mode === "ytm") {
      const allowedMonths = monthOrder.slice(0, monthOrder.indexOf(selectedMonth) + 1);
      currentRecords = yearRecords.filter((record) => allowedMonths.includes(getMonthNumberFromRecord(record)));
      baselineRecords = previousYearRecords.filter((record) => allowedMonths.includes(getMonthNumberFromRecord(record)));
    }
    if (mode === "mom") {
      currentRecords = yearRecords.filter((record) => getMonthNumberFromRecord(record) === selectedMonth);
      baselineRecords = previousYearRecords.filter((record) => getMonthNumberFromRecord(record) === selectedMonth);
    }

    const values = {};
    metrics.forEach((metric) => {
      const currentValue = sumMetric(currentRecords, metricKey, metric.source);
      const baselineValue = sumMetric(baselineRecords, metricKey, metric.source);
      values[metric.key] = currentValue;
      values[`${metric.key}Growth`] = calculateGrowth(currentValue, baselineValue);
    });
    return { academicYear, ...values };
  }), [records, years, mode, selectedTerm, monthOrder, selectedMonth, metrics, metricKey]);

  const modeDescription = useMemo(() => {
    if (mode === "tot") return `${selectedTerm} performance across all available academic years.`;
    if (mode === "ytm") return `${MONTH_NAMES[startMonth - 1]}–${MONTH_NAMES[selectedMonth - 1]} performance across all available academic years.`;
    if (mode === "mom") return `${MONTH_NAMES[selectedMonth - 1]} performance across all available academic years, with growth versus the same month in the previous academic year.`;
    return "Performance across all available academic years.";
  }, [mode, selectedTerm, selectedMonth, startMonth]);

  const formatAxis = (value) => {
    const numeric = Number(value || 0);
    if (numeric >= 1000000) return `AED ${(numeric / 1000000).toFixed(numeric >= 10000000 ? 0 : 1)}M`;
    if (numeric >= 1000) return `AED ${(numeric / 1000).toFixed(0)}K`;
    return `AED ${numeric.toFixed(0)}`;
  };

  return <section className="performance-comparison">
    <div className="comparison-mode-bar">
      {MODES.map(([key,label]) => <button key={key} type="button" className={mode === key ? "active" : ""} onClick={() => setMode(key)}>{label}</button>)}
    </div>

    {((mode === "tot" || mode === "ytm" || mode === "mom") || allowYearBasis || extraControls) && <section className="comparison-control-card">
      {mode === "tot" && <label><span>Term</span><select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>{TERMS.map((term) => <option key={term}>{term}</option>)}</select></label>}
      {(mode === "ytm" || mode === "mom") && <label><span>{mode === "ytm" ? "Through Month" : "Month"}</span><select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>{monthOrder.map((month) => <option key={month} value={month}>{MONTH_NAMES[month - 1]}</option>)}</select></label>}
      {allowYearBasis && <div className="comparison-basis"><span>Year Basis</span><div><button type="button" className={yearBasis === "finance" ? "active" : ""} onClick={() => onYearBasisChange?.("finance")}>Sep–Aug</button><button type="button" className={yearBasis === "backToSchool" ? "active" : ""} onClick={() => onYearBasisChange?.("backToSchool")}>Aug–Jul</button></div></div>}
      {extraControls}
    </section>}

    <section className="comparison-summary-card">
      <div className="comparison-card-heading"><div><h2>{scopeLabel}</h2><p>{modeDescription}</p></div><span className="comparison-year-count">{rows.length} academic years</span></div>
      {!rows.length ? <div className="comparison-empty-state">No records are available for the selected filters.</div> : <div className="comparison-table-scroll"><table className="comparison-table"><thead><tr><th>Academic Year</th>
        {metrics.map((metric) => <><th key={`${metric.key}-value`}>{metric.label}</th><th key={`${metric.key}-growth`}>{metric.label} Growth</th></>)}
        {metrics.length === 2 && <th>{metrics[1].label === "Commission" ? "Commission Rate" : "Income Rate"}</th>}
      </tr></thead><tbody>{rows.map((row) => {
        const rate = metrics.length === 2 && row[metrics[0].key] ? (row[metrics[1].key] / row[metrics[0].key]) * 100 : 0;
        return <tr key={row.academicYear}><th>{row.academicYear}</th>
          {metrics.map((metric, metricIndex) => <><td key={`${metric.key}-value`} className={metricIndex === 0 ? "comparison-primary-value" : "comparison-secondary-value"}>{formatCurrency(row[metric.key])}</td><td key={`${metric.key}-growth`}><span className={`comparison-growth-value ${getGrowthClass(row[`${metric.key}Growth`])}`}>{formatGrowth(row[`${metric.key}Growth`])}</span></td></>)}
          {metrics.length === 2 && <td>{rate.toFixed(1)}%</td>}
        </tr>;
      })}</tbody></table></div>}
    </section>

    {rows.length > 0 && <section className="comparison-chart-card"><div className="comparison-card-heading"><div><h2>{mode === "yoy" ? "Academic-Year Comparison" : mode === "tot" ? `${selectedTerm} Comparison` : mode === "mom" ? `${MONTH_NAMES[selectedMonth - 1]} Comparison` : "Year-to-Month Comparison"}</h2><p>{modeDescription}</p></div></div><div className="comparison-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} margin={{top:18,right:20,left:10,bottom:8}} barGap={8} barCategoryGap="28%"><CartesianGrid stroke="#edf1f5" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="academicYear" axisLine={false} tickLine={false} tick={{fill:"#667085",fontSize:12,fontWeight:500}} dy={8}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#98a2b3",fontSize:11,fontWeight:500}}/><Tooltip formatter={(value,name) => [formatCurrency(value),name]}/><Legend iconType="circle" iconSize={8} wrapperStyle={{paddingTop:"12px",color:"#667085",fontSize:"11px",fontWeight:600}}/>
      {metrics.map((metric,index) => <Bar key={metric.key} dataKey={metric.key} name={metric.label} fill={index === 0 ? "#2f80ed" : "#f2994a"} radius={[8,8,2,2]} maxBarSize={58}/>)}</BarChart></ResponsiveContainer></div></section>}

    <AcademicYearTrendChart
      records={records}
      academicYears={years}
      metrics={metrics}
      metricKey={metricKey}
      startMonth={startMonth}
      formatAxis={formatAxis}
      formatCurrency={formatCurrency}
    />
  </section>;
}
