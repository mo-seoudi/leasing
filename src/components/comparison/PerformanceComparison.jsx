import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "./performanceComparison.css";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
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
function getMonthNumber(value) { return Number(String(value || "").slice(5, 7)); }
function getAcademicYearStartYear(academicYear) {
  const match = String(academicYear || "").match(/(20\d{2})/);
  return match ? Number(match[1]) : 0;
}
function getMonthKeyForAcademicYear(academicYear, monthNumber, startMonth) {
  const startYear = getAcademicYearStartYear(academicYear);
  if (!startYear || !monthNumber) return "";
  const calendarYear = monthNumber >= startMonth ? startYear : startYear + 1;
  return `${calendarYear}-${String(monthNumber).padStart(2, "0")}`;
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
  const [selectedMonth, setSelectedMonth] = useState(3);

  const rows = useMemo(() => years.map((academicYear, yearIndex) => {
    const yearRecords = getYearRecords(records, academicYear);
    const previousAcademicYear = years[yearIndex - 1] || "";
    const previousYearRecords = previousAcademicYear ? getYearRecords(records, previousAcademicYear) : [];
    let currentRecords = yearRecords;
    let baselineRecords = previousYearRecords;

    if (mode === "ytm") {
      const allowedMonths = monthOrder.slice(0, monthOrder.indexOf(selectedMonth) + 1);
      currentRecords = yearRecords.filter((record) => allowedMonths.includes(getMonthNumber(record.month)));
      baselineRecords = previousYearRecords.filter((record) => allowedMonths.includes(getMonthNumber(record.month)));
    }

    if (mode === "mom") {
      const selectedMonthKey = getMonthKeyForAcademicYear(academicYear, selectedMonth, startMonth);
      const selectedDate = selectedMonthKey ? new Date(`${selectedMonthKey}-01T00:00:00Z`) : null;
      const previousDate = selectedDate ? new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth() - 1, 1)) : null;
      const previousMonthKey = previousDate ? `${previousDate.getUTCFullYear()}-${String(previousDate.getUTCMonth() + 1).padStart(2, "0")}` : "";
      currentRecords = yearRecords.filter((record) => String(record.month || "").startsWith(selectedMonthKey));
      baselineRecords = yearRecords.filter((record) => String(record.month || "").startsWith(previousMonthKey));
    }

    const values = {};
    metrics.forEach((metric) => {
      if (mode === "tot") {
        TERMS.forEach((term) => {
          values[`${metric.key}${term.replace(" ", "")}`] = sumMetric(
            yearRecords.filter((record) => record.term === term), metricKey, metric.source
          );
        });
        const current = values[`${metric.key}Term3`];
        const comparison = previousYearRecords.length
          ? sumMetric(previousYearRecords.filter((record) => record.term === "Term 3"), metricKey, metric.source)
          : 0;
        values[metric.key] = current;
        values[`${metric.key}Growth`] = calculateGrowth(current, comparison);
      } else {
        const currentValue = sumMetric(currentRecords, metricKey, metric.source);
        const baselineValue = sumMetric(baselineRecords, metricKey, metric.source);
        values[metric.key] = currentValue;
        values[`${metric.key}Growth`] = calculateGrowth(currentValue, baselineValue);
      }
    });
    return { academicYear, ...values };
  }), [records, years, mode, monthOrder, selectedMonth, metrics, metricKey, startMonth]);

  const modeDescription = useMemo(() => {
    if (mode === "tot") return "Term performance across all available academic years.";
    if (mode === "ytm") return `${MONTH_NAMES[startMonth - 1]}–${MONTH_NAMES[selectedMonth - 1]} performance across all available academic years.`;
    if (mode === "mom") {
      const selectedIndex = monthOrder.indexOf(selectedMonth);
      const previousMonth = monthOrder[selectedIndex > 0 ? selectedIndex - 1 : monthOrder.length - 1];
      return `${MONTH_NAMES[selectedMonth - 1]} performance with growth versus ${MONTH_NAMES[previousMonth - 1]} in each academic year.`;
    }
    return "Performance across all available academic years.";
  }, [mode, monthOrder, selectedMonth, startMonth]);

  const tableMetrics = mode === "tot"
    ? metrics.flatMap((metric) => TERMS.map((term) => ({ key: `${metric.key}${term.replace(" ", "")}`, label: `${metric.label} · ${term}`, metric })))
    : metrics;

  return <section className="performance-comparison">
    <div className="comparison-mode-bar">
      {MODES.map(([key,label]) => <button key={key} type="button" className={mode === key ? "active" : ""} onClick={() => setMode(key)}>{label}</button>)}
    </div>

    {((mode === "ytm" || mode === "mom") || allowYearBasis || extraControls) && <section className="comparison-control-card">
      {(mode === "ytm" || mode === "mom") && <label><span>{mode === "ytm" ? "Through Month" : "Month"}</span><select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>{monthOrder.map((month) => <option key={month} value={month}>{MONTH_NAMES[month - 1]}</option>)}</select></label>}
      {allowYearBasis && <div className="comparison-basis"><span>Year Basis</span><div><button type="button" className={yearBasis === "finance" ? "active" : ""} onClick={() => onYearBasisChange?.("finance")}>Sep–Aug</button><button type="button" className={yearBasis === "backToSchool" ? "active" : ""} onClick={() => onYearBasisChange?.("backToSchool")}>Aug–Jul</button></div></div>}
      {extraControls}
    </section>}

    <section className="comparison-summary-card">
      <div className="comparison-card-heading"><div><h2>{scopeLabel}</h2><p>{modeDescription}</p></div><span className="comparison-year-count">{rows.length} academic years</span></div>
      {!rows.length ? <div className="comparison-empty-state">No records are available for the selected filters.</div> : <div className="comparison-table-scroll"><table className="comparison-table"><thead><tr><th>Academic Year</th>
        {mode === "tot" ? tableMetrics.map((item) => <th key={item.key}>{item.label}</th>) : metrics.map((metric) => <><th key={`${metric.key}-value`}>{metric.label}</th><th key={`${metric.key}-growth`}>{metric.label} Growth</th></>)}
        {mode !== "tot" && metrics.length === 2 && <th>{metrics[1].label === "Commission" ? "Commission Rate" : "Income Rate"}</th>}
      </tr></thead><tbody>{rows.map((row) => {
        const rate = metrics.length === 2 && row[metrics[0].key] ? (row[metrics[1].key] / row[metrics[0].key]) * 100 : 0;
        return <tr key={row.academicYear}><th>{row.academicYear}</th>
          {mode === "tot" ? tableMetrics.map((item) => <td key={item.key} className={item.metric.key === metrics[0]?.key ? "comparison-primary-value" : "comparison-secondary-value"}>{formatCurrency(row[item.key])}</td>) : metrics.map((metric, metricIndex) => <><td key={`${metric.key}-value`} className={metricIndex === 0 ? "comparison-primary-value" : "comparison-secondary-value"}>{formatCurrency(row[metric.key])}</td><td key={`${metric.key}-growth`}><span className={`comparison-growth-value ${getGrowthClass(row[`${metric.key}Growth`])}`}>{formatGrowth(row[`${metric.key}Growth`])}</span></td></>)}
          {mode !== "tot" && metrics.length === 2 && <td>{rate.toFixed(1)}%</td>}
        </tr>;
      })}</tbody></table></div>}
    </section>

    {rows.length > 0 && <section className="comparison-chart-card"><div className="comparison-card-heading"><div><h2>{mode === "yoy" ? "Academic-Year Comparison" : mode === "tot" ? "Term-on-Term Comparison" : mode === "mom" ? "Month Comparison" : "Year-to-Month Comparison"}</h2><p>{modeDescription}</p></div></div><div className="comparison-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} margin={{top:18,right:20,left:10,bottom:8}} barGap={8} barCategoryGap="28%"><CartesianGrid stroke="#edf1f5" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="academicYear" axisLine={false} tickLine={false} tick={{fill:"#667085",fontSize:12,fontWeight:500}} dy={8}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#98a2b3",fontSize:11,fontWeight:500}}/><Tooltip formatter={(value,name) => [formatCurrency(value),name]}/><Legend iconType="circle" iconSize={8} wrapperStyle={{paddingTop:"12px",color:"#667085",fontSize:"11px",fontWeight:600}}/>
      {mode === "tot" ? tableMetrics.map((item, index) => <Bar key={item.key} dataKey={item.key} name={item.label} fill={index % 6 < 3 ? ["#2f80ed","#56a0f5","#9bc7fb"][index % 3] : ["#f2994a","#f6b56f","#f9d3aa"][index % 3]} radius={[6,6,2,2]} maxBarSize={36}/>) : metrics.map((metric,index) => <Bar key={metric.key} dataKey={metric.key} name={metric.label} fill={index === 0 ? "#2f80ed" : "#f2994a"} radius={[8,8,2,2]} maxBarSize={58}/>)}</BarChart></ResponsiveContainer></div></section>}
  </section>;
}
