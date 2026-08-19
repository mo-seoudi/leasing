import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import DashboardCurrencyTooltip from "../../components/dashboard/DashboardCurrencyTooltip";
import KpiCard from "../../components/dashboard/KpiCard";
import MonthlyResultsTable from "../../components/dashboard/MonthlyResultsTable";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import PerformanceChart from "../../components/dashboard/PerformanceChart";
import "../../components/dashboard/dashboardComponents.css";

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

export default function CateringDashboardPage() {
  const { setHeaderControls } = useOutletContext();
  const latestAcademicYear =
    cateringAcademicYears[cateringAcademicYears.length - 1] || "";

  const [filters, setFilters] = useState({
    academicYear: latestAcademicYear,
    school: "",
    term: "",
  });

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

  const tableResetKey = `${filters.academicYear}|${filters.school}|${filters.term}`;

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

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
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </label>
      </div>
    );

    return () => setHeaderControls(null);
  }, [filters, setHeaderControls]);

  const currencyTooltip = (
    <DashboardCurrencyTooltip formatValue={formatCurrency} />
  );

  const monthlyColumns = [
    { key: "academicYear", label: "Academic Year" },
    { key: "label", label: "Month" },
    { key: "term", label: "Term" },
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

  return (
    <section className="catering-dashboard-page">
      <section className="catering-kpi-grid">
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
          detail="Commission divided by catering sales"
        />
        <KpiCard
          label="Average Monthly Sales"
          value={formatCurrency(summary.averageMonthlySales)}
          detail="Average across the selected period"
        />
      </section>

      <section className="catering-two-column-grid">
        <PerformanceChart
          title="School Performance"
          description="Sales and commission by school."
          data={schoolData}
          categoryKey="school"
          formatAxis={formatCompactCurrency}
          formatValue={formatCurrency}
          tooltipContent={currencyTooltip}
        />

        <PerformanceChart
          title="Term Performance"
          description="Financial reporting terms, including July and August in Term 3."
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
        className="catering-wide-card"
      />

      <MonthlyResultsTable
        data={monthlyData}
        columns={monthlyColumns}
        totals={{
          sales: formatCurrency(summary.sales),
          commission: formatCurrency(summary.commission),
          commissionRate: formatPercentage(summary.commissionRate),
        }}
        emptyMessage="No catering records match the selected filters."
        resetKey={tableResetKey}
      />
    </section>
  );
}
