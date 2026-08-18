import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
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
    <article className="catering-kpi-card">
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
  const { setHeaderControls } = useOutletContext();
  const latestAcademicYear =
    cateringAcademicYears[cateringAcademicYears.length - 1] || "";

  const [filters, setFilters] = useState({
    academicYear: latestAcademicYear,
    school: "",
    term: "",
  });

  const [trendMetric, setTrendMetric] = useState("Sales");
  const [resultsPage, setResultsPage] = useState(0);

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

  const monthlyResultPages = useMemo(() => {
    const grouped = new Map();

    monthlyData.forEach((item) => {
      const key = item.academicYear || "Other";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    });

    return [...grouped.entries()]
      .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
      .map(([academicYear, rows]) => ({
        academicYear,
        rows,
      }));
  }, [monthlyData]);

  const safeResultsPage = Math.min(
    resultsPage,
    Math.max(monthlyResultPages.length - 1, 0)
  );

  const visibleMonthlyData =
    monthlyResultPages[safeResultsPage]?.rows || [];

  const visibleResultsYear =
    monthlyResultPages[safeResultsPage]?.academicYear || "";

  useEffect(() => {
    setResultsPage(0);
  }, [
    filters.academicYear,
    filters.school,
    filters.term,
  ]);

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

  const trendDataKey = trendMetric === "Sales" ? "sales" : "commission";

  useEffect(() => {
    setHeaderControls(
      <div className="header-page-filters">
        <label className="header-filter-control">
          <span>Academic Year</span>
          <select
            value={filters.academicYear}
            onChange={(event) =>
              handleFilterChange("academicYear", event.target.value)
            }
          >
            <option value="">All Years</option>
            {cateringAcademicYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>

        <label className="header-filter-control wide">
          <span>School</span>
          <select
            value={filters.school}
            onChange={(event) =>
              handleFilterChange("school", event.target.value)
            }
          >
            <option value="">All Schools</option>
            {cateringSchools.map((school) => (
              <option key={school.code} value={school.code}>
                {school.name}
              </option>
            ))}
          </select>
        </label>

        <label className="header-filter-control">
          <span>Term</span>
          <select
            value={filters.term}
            onChange={(event) =>
              handleFilterChange("term", event.target.value)
            }
          >
            <option value="">All Terms</option>
            {cateringTerms.map((term) => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="header-clear-button"
          onClick={clearFilters}
        >
          Clear
        </button>
      </div>
    );

    return () => setHeaderControls(null);
  }, [
    filters,
    setHeaderControls,
  ]);

  return (
    <section className="catering-dashboard-page">
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
              <BarChart
                  data={schoolData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 24,
                    bottom: 5,
                  }}
                  barCategoryGap="22%"
                  barGap={6}
                >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="school" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={formatCompactCurrency}
                  tickLine={false}
                  axisLine={false}
                  width={84}
                />
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
              <BarChart
                  data={termData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 24,
                    bottom: 5,
                  }}
                  barCategoryGap="22%"
                  barGap={6}
                >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="term" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={formatCompactCurrency}
                  tickLine={false}
                  axisLine={false}
                  width={84}
                />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="sales" name="Sales" fill="#1679a7" radius={[5, 5, 0, 0]} />
                <Bar dataKey="commission" name="Commission" fill="#d85f1b" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
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

      <section className="catering-table-card">
        <div className="catering-card-heading">
          <div>
            <h2>Monthly Results</h2>
            <p>Detailed sales, commission and effective rate for each month.</p>
          </div>
          <span className="catering-record-count">
            {visibleResultsYear ? `${visibleResultsYear} · ` : ""}
            {visibleMonthlyData.length} months
          </span>
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
                {visibleMonthlyData.map((item) => (
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

        {monthlyResultPages.length > 1 && (
          <div className="catering-results-pagination">
            <button
              type="button"
              className="catering-pagination-arrow"
              onClick={() =>
                setResultsPage((page) => Math.max(0, page - 1))
              }
              disabled={safeResultsPage === 0}
              aria-label="Previous academic year"
            >
              ‹
            </button>

            <div className="catering-pagination-pages">
              {monthlyResultPages.map((page, index) => (
                <button
                  key={page.academicYear}
                  type="button"
                  className={
                    safeResultsPage === index
                      ? "catering-pagination-page active"
                      : "catering-pagination-page"
                  }
                  onClick={() => setResultsPage(index)}
                  title={page.academicYear}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="catering-pagination-arrow"
              onClick={() =>
                setResultsPage((page) =>
                  Math.min(monthlyResultPages.length - 1, page + 1)
                )
              }
              disabled={safeResultsPage === monthlyResultPages.length - 1}
              aria-label="Next academic year"
            >
              ›
            </button>

            <span className="catering-pagination-label">
              {visibleResultsYear}
            </span>
          </div>
        )}
      </section>
    </section>
  );
}
