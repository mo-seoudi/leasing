import { useEffect, useMemo, useRef, useState } from "react";
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
  uniformTerms,
  fetchUniformRecords,
  filterUniformRecords,
  formatCompactCurrency,
  formatCurrency,
  formatPercentage,
  getUniformAcademicYears,
  getUniformSchools,
  getUniformSummary,
  getMonthlyUniformData,
  getSchoolUniformData,
  getTermUniformData,
} from "../../lib/uniformData";

import "./UniformDashboardPage.css";

function KpiCard({ label, value, detail }) {
  return (
    <article className="uniform-kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="uniform-chart-tooltip">
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

export default function UniformDashboardPage() {
  const { setHeaderControls } = useOutletContext();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [yearBasis, setYearBasis] = useState("finance");
  const [filters, setFilters] = useState({
    academicYear: "",
    school: "",
    term: "",
  });
  const [trendMetric, setTrendMetric] = useState("Sales");
  const hasInitialisedAcademicYear = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchUniformRecords();
        if (active) setRecords(data);
      } catch (loadError) {
        console.error("Unable to load Uniform records", loadError);
        if (active) {
          setError(loadError?.message || "Unable to load Uniform data from Supabase.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRecords();
    return () => {
      active = false;
    };
  }, []);

  const uniformAcademicYears = useMemo(
    () => getUniformAcademicYears(records, yearBasis),
    [records, yearBasis]
  );

  const uniformSchools = useMemo(
    () => getUniformSchools(records),
    [records]
  );

  const latestAcademicYear =
    uniformAcademicYears[uniformAcademicYears.length - 1] || "";

  useEffect(() => {
    if (
      !hasInitialisedAcademicYear.current &&
      latestAcademicYear
    ) {
      setFilters((current) => ({
        ...current,
        academicYear: latestAcademicYear,
      }));

      hasInitialisedAcademicYear.current = true;
    }
  }, [latestAcademicYear]);

  useEffect(() => {
    if (
      filters.academicYear &&
      !uniformAcademicYears.includes(filters.academicYear)
    ) {
      setFilters((current) => ({
        ...current,
        academicYear: latestAcademicYear,
      }));
    }
  }, [yearBasis, uniformAcademicYears, latestAcademicYear, filters.academicYear]);

  const filteredRecords = useMemo(
    () =>
      filterUniformRecords(records, {
        ...filters,
        yearBasis,
      }),
    [records, filters, yearBasis]
  );

  const summary = useMemo(
    () => getUniformSummary(filteredRecords),
    [filteredRecords]
  );

  const monthlyData = useMemo(
    () => getMonthlyUniformData(filteredRecords, yearBasis),
    [filteredRecords, yearBasis]
  );

  const schoolData = useMemo(
    () => getSchoolUniformData(filteredRecords),
    [filteredRecords]
  );

  const termData = useMemo(
    () => getTermUniformData(filteredRecords),
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
            {uniformAcademicYears.map((year) => (
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
            {uniformSchools.map((school) => (
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
            {uniformTerms.map((term) => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </label>

        <div className="uniform-year-basis-control">
          <span>Uniform Year Basis</span>
          <div className="uniform-year-basis-toggle" aria-label="Academic year basis">
            <button
              type="button"
              className={yearBasis === "finance" ? "active" : ""}
              onClick={() => setYearBasis("finance")}
              title="Finance reporting: September to August"
            >
              Sep–Aug
            </button>
            <button
              type="button"
              className={yearBasis === "backToSchool" ? "active" : ""}
              onClick={() => setYearBasis("backToSchool")}
              title="Back-to-school view: August to July"
            >
              Aug–Jul
            </button>
          </div>
        </div>
      </div>
    );

    return () => setHeaderControls(null);
  }, [filters, yearBasis, uniformAcademicYears, uniformSchools, setHeaderControls]);

  if (loading) {
    return <section className="uniform-dashboard-page"><div className="uniform-empty-state">Loading Uniform data…</div></section>;
  }

  if (error) {
    return <section className="uniform-dashboard-page"><div className="uniform-empty-state">Unable to load Uniform data: {error}</div></section>;
  }

  return (
    <section className="uniform-dashboard-page">
      <section className="uniform-kpi-grid">
        <KpiCard label="Total Sales" value={formatCurrency(summary.sales)} detail={`${summary.months} reporting months`} />
        <KpiCard label="Total Commission" value={formatCurrency(summary.commission)} detail={`${summary.schools} schools included`} />
        <KpiCard label="Effective Commission Rate" value={formatPercentage(summary.commissionRate)} detail="Commission divided by uniform sales" />
        <KpiCard label="Average Monthly Sales" value={formatCurrency(summary.averageMonthlySales)} detail="Average across the selected period" />
      </section>

      <section className="uniform-two-column-grid">
        <section className="uniform-chart-card">
          <div className="uniform-card-heading"><div><h2>School Performance</h2><p>Sales and commission by school.</p></div></div>
          <div className="uniform-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schoolData} margin={{ top: 10, right: 10, left: 24, bottom: 5 }} barCategoryGap="22%" barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="school" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatCompactCurrency} tickLine={false} axisLine={false} width={84} />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="sales" name="Sales" fill="#1679a7" radius={[5, 5, 0, 0]} />
                <Bar dataKey="commission" name="Commission" fill="#d85f1b" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="uniform-chart-card">
          <div className="uniform-card-heading"><div><h2>Term Performance</h2><p>{yearBasis === "finance" ? "Finance basis: September to August, with July and August in Term 3." : "Back-to-school basis: August to July, with August included in Term 1."}</p></div></div>
          <div className="uniform-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={termData} margin={{ top: 10, right: 10, left: 24, bottom: 5 }} barCategoryGap="22%" barGap={6}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="term" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatCompactCurrency} tickLine={false} axisLine={false} width={84} />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="sales" name="Sales" fill="#1679a7" radius={[5, 5, 0, 0]} />
                <Bar dataKey="commission" name="Commission" fill="#d85f1b" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </section>

      <section className="uniform-chart-card uniform-wide-card">
        <div className="uniform-card-heading uniform-chart-heading">
          <div><h2>Monthly Trend</h2><p>{trendMetric} by month for the selected reporting scope.</p></div>
          <div className="uniform-metric-toggle" aria-label="Trend metric">
            {["Sales", "Commission"].map((metric) => (
              <button key={metric} type="button" className={trendMetric === metric ? "active" : ""} onClick={() => setTrendMetric(metric)}>{metric}</button>
            ))}
          </div>
        </div>
        <div className="uniform-line-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData} margin={{ top: 15, right: 20, left: 10, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={formatCompactCurrency} tickLine={false} axisLine={false} width={80} />
              <Tooltip content={<CurrencyTooltip />} />
              <Line type="monotone" dataKey={trendDataKey} name={trendMetric} stroke="currentColor" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} className={trendMetric === "Sales" ? "uniform-sales-line" : "uniform-commission-line"} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="uniform-table-card">
        <div className="uniform-card-heading">
          <div><h2>Monthly Results</h2><p>Detailed sales, commission and effective rate for each month — {yearBasis === "finance" ? "Finance basis (Sep–Aug)." : "Back-to-school basis (Aug–Jul)."}</p></div>
          <span className="uniform-record-count">{monthlyData.length} months</span>
        </div>
        {monthlyData.length === 0 ? (
          <div className="uniform-empty-state">No uniform records match the selected filters.</div>
        ) : (
          <div className="uniform-table-scroll">
            <table className="uniform-results-table">
              <thead><tr><th>Academic Year</th><th>Month</th><th>Term</th><th>Sales</th><th>Commission</th><th>Commission Rate</th></tr></thead>
              <tbody>
                {monthlyData.map((item) => (
                  <tr key={item.key}><td>{item.academicYear}</td><td>{item.label}</td><td>{item.term}</td><td className="uniform-sales-value">{formatCurrency(item.sales)}</td><td className="uniform-commission-value">{formatCurrency(item.commission)}</td><td>{formatPercentage(item.commissionRate)}</td></tr>
                ))}
              </tbody>
              <tfoot><tr><th colSpan="3">Selected Total</th><th>{formatCurrency(summary.sales)}</th><th>{formatCurrency(summary.commission)}</th><th>{formatPercentage(summary.commissionRate)}</th></tr></tfoot>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
