import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";

import DashboardCurrencyTooltip from "../../components/dashboard/DashboardCurrencyTooltip";
import KpiCard from "../../components/dashboard/KpiCard";
import MonthlyResultsTable from "../../components/dashboard/MonthlyResultsTable";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import PerformanceChart from "../../components/dashboard/PerformanceChart";
import "../../components/dashboard/dashboardComponents.css";

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

  const hasInitialisedAcademicYear = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadRecords() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchUniformRecords();

        if (active) {
          setRecords(data);
        }
      } catch (loadError) {
        console.error("Unable to load Uniform records", loadError);

        if (active) {
          setError(
            loadError?.message ||
              "Unable to load Uniform data from Supabase."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
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
  }, [
    yearBasis,
    uniformAcademicYears,
    latestAcademicYear,
    filters.academicYear,
  ]);

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

  const tableResetKey = `${filters.academicYear}|${filters.school}|${filters.term}|${yearBasis}`;

  function handleFilterChange(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleYearBasisChange(nextBasis) {
    setYearBasis(nextBasis);
  }

  useEffect(() => {
    setHeaderControls(
      <div className="header-page-filters">
        <label className="header-filter-control">
          <span>Academic Year</span>
          <select
            value={filters.academicYear}
            onChange={(event) =>
              handleFilterChange(
                "academicYear",
                event.target.value
              )
            }
          >
            <option value="">All Years</option>
            {uniformAcademicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <label className="header-filter-control wide">
          <span>School</span>
          <select
            value={filters.school}
            onChange={(event) =>
              handleFilterChange(
                "school",
                event.target.value
              )
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
              handleFilterChange(
                "term",
                event.target.value
              )
            }
          >
            <option value="">All Terms</option>
            {uniformTerms.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </label>

        <div className="uniform-year-basis-control">
          <span>Uniform Year Basis</span>

          <div
            className="uniform-year-basis-toggle"
            aria-label="Academic year basis"
          >
            <button
              type="button"
              className={
                yearBasis === "finance" ? "active" : ""
              }
              onClick={() =>
                handleYearBasisChange("finance")
              }
              title="Finance reporting: September to August"
            >
              Sep–Aug
            </button>

            <button
              type="button"
              className={
                yearBasis === "backToSchool"
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleYearBasisChange("backToSchool")
              }
              title="Back-to-school view: August to July"
            >
              Aug–Jul
            </button>
          </div>
        </div>
      </div>
    );

    return () => setHeaderControls(null);
  }, [
    filters,
    yearBasis,
    uniformAcademicYears,
    uniformSchools,
    setHeaderControls,
  ]);

  if (loading) {
    return (
      <section className="dashboard-page uniform-dashboard-page">
        <div className="dashboard-loading-state">
          Loading Uniform data…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-page uniform-dashboard-page">
        <div className="dashboard-error-state">
          Unable to load Uniform data: {error}
        </div>
      </section>
    );
  }

  const currencyTooltip = (
    <DashboardCurrencyTooltip formatValue={formatCurrency} />
  );

  const monthlyColumns = [
    {
      key: "academicYear",
      label: "Academic Year",
    },
    {
      key: "label",
      label: "Month",
    },
    {
      key: "term",
      label: "Term",
    },
    {
      key: "sales",
      label: "Sales",
      numeric: true,
      tone: "sales",
      render: (value) => formatCurrency(value),
    },
    {
      key: "commission",
      label: "Commission",
      numeric: true,
      tone: "commission",
      render: (value) => formatCurrency(value),
    },
    {
      key: "commissionRate",
      label: "Commission Rate",
      numeric: true,
      render: (value) => formatPercentage(value),
    },
  ];

  const termDescription =
    yearBasis === "finance"
      ? "Finance basis: September to August, with July and August in Term 3."
      : "Back-to-school basis: August to July, with August included in Term 1.";

  const monthlyResultsDescription =
    yearBasis === "finance"
      ? "Finance basis (Sep–Aug)."
      : "Back-to-school basis (Aug–Jul).";

  return (
    <section className="dashboard-page uniform-dashboard-page">
      <section className="dashboard-kpi-grid">
        <KpiCard
          label="Total Sales"
          value={formatCurrency(summary.sales)}
          detail={`${summary.months} reporting months`}
        />

        <KpiCard
          label="Total Commission"
          value={formatCurrency(summary.commission)}
          detail={`${summary.schools} schools included`}
        />

        <KpiCard
          label="Effective Commission Rate"
          value={formatPercentage(summary.commissionRate)}
          detail="Commission divided by uniform sales"
        />

        <KpiCard
          label="Average Monthly Sales"
          value={formatCurrency(summary.averageMonthlySales)}
          detail="Average across the selected period"
        />
      </section>

      <section className="dashboard-two-column-grid">
        <PerformanceChart
          title="School Performance"
          description="Sales and commission by school."
          data={schoolData}
          categoryKey="school"
          formatAxis={formatCompactCurrency}
          formatValue={formatCurrency}
          tooltipContent={currencyTooltip}
          defaultMetric="Overview"
          defaultView="Bar"
        />

        <PerformanceChart
          title="Term Performance"
          description={termDescription}
          data={termData}
          categoryKey="term"
          formatAxis={formatCompactCurrency}
          formatValue={formatCurrency}
          tooltipContent={currencyTooltip}
          defaultMetric="Sales"
          defaultView="Pie"
        />
      </section>

      <MonthlyTrendChart
        data={monthlyData}
        formatAxis={formatCompactCurrency}
        tooltipContent={currencyTooltip}
        className="dashboard-wide-card"
      />

      <MonthlyResultsTable
        data={monthlyData}
        columns={monthlyColumns}
        totals={{
          sales: formatCurrency(summary.sales),
          commission: formatCurrency(summary.commission),
          commissionRate: formatPercentage(
            summary.commissionRate
          ),
        }}
        emptyMessage="No uniform records match the selected filters."
        resetKey={tableResetKey}
      />

      <p className="uniform-results-basis-note" hidden>
        {monthlyResultsDescription}
      </p>
    </section>
  );
}
