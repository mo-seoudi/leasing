import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  cateringSchools,
  cateringTerms,
  filterCateringRecords,
  formatCompactCurrency,
  formatCurrency,
  formatPercentage,
  getCateringAcademicYearComparison,
} from "../../lib/cateringData";

import "./CateringComparisonPage.css";

function calculateGrowth(currentValue, previousValue) {
  const current = Number(currentValue || 0);
  const previous = Number(previousValue || 0);

  if (previous === 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatGrowth(value) {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(0)}%`;
}

function GrowthValue({ value }) {
  const className =
    value === null
      ? "neutral"
      : value > 0
        ? "positive"
        : value < 0
          ? "negative"
          : "neutral";

  return (
    <span className={`catering-growth-value ${className}`}>
      {formatGrowth(value)}
    </span>
  );
}

function ComparisonTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="catering-comparison-tooltip">
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

export default function CateringComparisonPage() {
  const [filters, setFilters] = useState({
    school: "",
    term: "",
  });

  const filteredRecords = useMemo(
    () =>
      filterCateringRecords({
        school: filters.school,
        term: filters.term,
        scenario: "Actual",
      }),
    [filters.school, filters.term]
  );

  const yearData = useMemo(() => {
    const comparison =
      getCateringAcademicYearComparison(
        filteredRecords
      );

    return comparison.map((item, index) => {
      const previous = comparison[index - 1];

      return {
        ...item,
        salesGrowth: previous
          ? calculateGrowth(
              item.sales,
              previous.sales
            )
          : null,
        commissionGrowth: previous
          ? calculateGrowth(
              item.commission,
              previous.commission
            )
          : null,
      };
    });
  }, [filteredRecords]);

  function handleFilterChange(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      school: "",
      term: "",
    });
  }

  const selectedSchool =
    cateringSchools.find(
      (school) => school.code === filters.school
    )?.name || "All Schools";

  const selectedTerm = filters.term || "All Terms";

  return (
    <section className="catering-comparison-page">
      <section className="catering-comparison-filter-card">
        <div className="catering-comparison-filter-heading">
          <div>
            <h2>Comparison Filters</h2>

            <p>
              Compare Catering sales and commission across
              academic years by school and reporting term.
            </p>
          </div>

          <button
            type="button"
            className="catering-comparison-secondary-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="catering-comparison-filter-grid">
          <label>
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

              {cateringSchools.map((school) => (
                <option
                  key={school.code}
                  value={school.code}
                >
                  {school.name}
                </option>
              ))}
            </select>
          </label>

          <label>
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

              {cateringTerms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="catering-comparison-summary-card">
        <div className="catering-comparison-card-heading">
          <div>
            <h2>{selectedSchool}</h2>

            <p>
              Catering performance for {selectedTerm} across
              all available academic years.
            </p>
          </div>

          <span className="catering-comparison-year-count">
            {yearData.length} academic years
          </span>
        </div>

        {yearData.length === 0 ? (
          <div className="catering-comparison-empty-state">
            No Catering records are available for the selected
            filters.
          </div>
        ) : (
          <div className="catering-comparison-table-scroll">
            <table className="catering-comparison-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Sales</th>
                  <th>Sales Growth</th>
                  <th>Commission</th>
                  <th>Commission Growth</th>
                  <th>Commission Rate</th>
                </tr>
              </thead>

              <tbody>
                {yearData.map((item) => (
                  <tr key={item.academicYear}>
                    <th>{item.academicYear}</th>

                    <td className="catering-comparison-sales-cell">
                      {formatCurrency(item.sales)}
                    </td>

                    <td>
                      <GrowthValue
                        value={item.salesGrowth}
                      />
                    </td>

                    <td className="catering-comparison-commission-cell">
                      {formatCurrency(item.commission)}
                    </td>

                    <td>
                      <GrowthValue
                        value={item.commissionGrowth}
                      />
                    </td>

                    <td>
                      {formatPercentage(
                        item.commissionRate
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {yearData.length > 0 && (
        <section className="catering-comparison-chart-card">
          <div className="catering-comparison-card-heading">
            <div>
              <h2>Academic-Year Comparison</h2>

              <p>
                Sales and commission comparison for {selectedSchool}
                {filters.term ? ` — ${filters.term}` : ""}.
              </p>
            </div>
          </div>

          <div className="catering-comparison-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearData}
                margin={{
                  top: 15,
                  right: 20,
                  left: 15,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="academicYear"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatCompactCurrency}
                />

                <Tooltip
                  content={<ComparisonTooltip />}
                />

                <Legend />

                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill="#1679a7"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="commission"
                  name="Commission"
                  fill="#d85f1b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </section>
  );
}
