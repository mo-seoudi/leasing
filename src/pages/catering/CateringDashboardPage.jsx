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

import {
  cateringAcademicYears,
  cateringSchools,
  cateringTerms,
  filterCateringRecords,
  formatCompactCurrency,
  formatCurrency,
  formatPercentage,
  getCateringSummary,
  getMonthlyCateringData,
  getSchoolCateringData,
  getTermCateringData,
} from "../../lib/cateringData";

import "./CateringDashboardPage.css";

function KpiCard({ label, value, detail, tone = "default" }) {
  return (
    <article className={`catering-kpi-card catering-kpi-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="catering-chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <div key={item.dataKey}>
          <span>{item.name}</span>
          <b>{formatCurrency(item.value)}</b>
        </div>
      ))}
    </div>
  );
}

export default function CateringDashboardPage() {
  const latestAcademicYear =
    cateringAcademicYears[cateringAcademicYears.length - 1] || "";

  const [filters, setFilters] = useState({
    academicYear: latestAcademicYear,
    school: "",
    term: "",
  });

  const [trendMetric, setTrendMetric] = useState("Sales");

  const filteredRecords = useMemo(
    () => filterCateringRecords(filters),
    [filters]
  );

  const summary = useMemo(
    () => getCateringSummary(filteredRecords),
    [filteredRecords]
  );

  const monthlyData = useMemo(
    () => getMonthlyCateringData(filteredRecords),
    [filteredRecords]
  );

  const schoolData = useMemo(
    () => getSchoolCateringData(filteredRecords),
    [filteredRecords]
  );

  const termData = useMemo(
    () => getTermCateringData(filteredRecords),
    [filteredRecords]
  );

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setFilters({
      academicYear: latestAcademicYear,
      school: "",
      term: "",
    });
  }

  const selectedSchool = cateringSchools.find(
    (school) => school.code === filters.school
  );

  const scopeLabel = [
    filters.academicYear || "All Academic Years",
    selectedSchool?.name || "All Schools",
    filters.term || "All Terms",
  ].join(" · ");

  const trendDataKey = trendMetric === "Sales" ? "sales" : "commission";

  return (
    <section className="catering-dashboard-page">
      <section className="catering-intro-card">
        <div>
          <span className="catering-eyebrow">Revenue Stream</span>
          <h2>Catering Performance</h2>
          <p>
            Monthly sales and commission performance across the four Repton schools.
          </p>
        </div>

        <div className="catering-scope-pill">{scopeLabel}</div>
      </section>

      <section className="catering-filter-card">
        <div className="catering-card-heading">
          <div>
            <h2>Dashboard Filters</h2>
            <p>Filter the catering results by academic year, school and term.</p>
          </div>

          <button type="button" className="catering-secondary-button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        <div className="catering-filter-grid">
          <label>
            <span>Academic Year</span>
            <select
              value={filters.academicYear}
              onChange={(event) => handleFilterChange("academicYear", event.target.value)}
            >
              <option value="">All Academic Years</option>
              {cateringAcademicYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>

          <label>
            <span>School</span>
            <select
              value={filters.school}
              onChange={(event) => handleFilterChange("school", event.target.value)}
            >
              <option value="">All Schools</option>
              {cateringSchools.map((school) => (
                <option key={school.code} value={school.code}>
                  {school.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Term</span>
            <select
              value={filters.term}
              onChange={(event) => handleFilterChange("term", event.target.value)}
            >
              <option value="">All Terms</option>
              {cateringTerms.map((term) => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="catering-kpi-grid">
        <KpiCard
          label="Total Sales"
          value={formatCurrency(summary.sales)}
          detail={`${summary.months} reporting months`}
          tone="sales"
        />
        <KpiCard
          label="Total Commission"
          value={formatCurrency(summary.commission)}
          detail={`${summary.schools} schools included`}
          tone="commission"
        />
        <KpiCard
          label="Effective Commission Rate"
          value={formatPercentage(summary.commissionRate)}
          detail="Commission divided by catering sales"
          tone="rate"
        />
        <KpiCard
          label="Average Monthly Sales"
          value={formatCurrency(summary.averageMonthlySales)}
          detail="Average across the selected period"
        />
      </section>

      <section className="catering-chart-card catering-wide-card">
        <div className="catering-card-heading catering-chart-heading">
          <div>
            <h2>Monthly Trend</h2>
            <p>{trendMetric} by month for the selected reporting scope.</p>
          </div>

          <div className="catering-metric-toggle" aria-label="Trend metric">
            {["Sales", "Commission"].map((metric) => (
              <button
                key={metric}
                type="button"
                className={trendMetric === metric ? "active" : ""}
                onClick={() => setTrendMetric(metric)}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        <div className="catering-line-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 15, right: 20, left: 10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={formatCompactCurrency} tickLine={false} axisLine={false} width={80} />
              <Tooltip content={<CurrencyTooltip />} />
              <Line
                type="monotone"
                dataKey={trendDataKey}
                name={trendMetric}
                stroke="currentColor"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                className={trendMetric === "Sales" ? "catering-sales-line" : "catering-commission-line"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="catering-two-column-grid">
        <section className="catering-chart-card">
          <div className="catering-card-heading">
            <div>
              <h2>School Performance</h2>
              <p>Sales and commission by school.</p>
            </div>
          </div>

          <div className="catering-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="school" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatCompactCurrency} tickLine={false} axisLine={false} width={72} />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="sales" name="Sales" fill="#1679a7" radius={[5, 5, 0, 0]} />
                <Bar dataKey="commission" name="Commission" fill="#d85f1b" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="catering-chart-card">
          <div className="catering-card-heading">
            <div>
              <h2>Term Performance</h2>
              <p>Financial reporting terms, including July and August in Term 3.</p>
            </div>
          </div>

          <div className="catering-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={termData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="term" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatCompactCurrency} tickLine={false} axisLine={false} width={72} />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="sales" name="Sales" fill="#1679a7" radius={[5, 5, 0, 0]} />
                <Bar dataKey="commission" name="Commission" fill="#d85f1b" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </section>

      <section className="catering-table-card">
        <div className="catering-card-heading">
          <div>
            <h2>Monthly Results</h2>
            <p>Detailed sales, commission and effective rate for each month.</p>
          </div>
          <span className="catering-record-count">{monthlyData.length} months</span>
        </div>

        {monthlyData.length === 0 ? (
          <div className="catering-empty-state">No catering records match the selected filters.</div>
        ) : (
          <div className="catering-table-scroll">
            <table className="catering-results-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Month</th>
                  <th>Term</th>
                  <th>Sales</th>
                  <th>Commission</th>
                  <th>Commission Rate</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item) => (
                  <tr key={item.key}>
                    <td>{item.academicYear}</td>
                    <td>{item.label}</td>
                    <td>{item.term}</td>
                    <td className="catering-sales-value">{formatCurrency(item.sales)}</td>
                    <td className="catering-commission-value">{formatCurrency(item.commission)}</td>
                    <td>{formatPercentage(item.commissionRate)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="3">Selected Total</th>
                  <th>{formatCurrency(summary.sales)}</th>
                  <th>{formatCurrency(summary.commission)}</th>
                  <th>{formatPercentage(summary.commissionRate)}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
