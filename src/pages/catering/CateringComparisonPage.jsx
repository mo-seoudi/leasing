import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

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

export default function CateringComparisonPage() {
  const { setHeaderControls } = useOutletContext();

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



  const selectedSchool =
    cateringSchools.find(
      (school) => school.code === filters.school
    )?.name || "All Schools";

  const selectedTerm = filters.term || "All Terms";

  useEffect(() => {
    setHeaderControls(
      <div className="header-page-filters">
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
  }, [
    filters,
    setHeaderControls,
  ]);

  return (
    <section className="catering-comparison-page">
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
                  top: 18,
                  right: 20,
                  left: 10,
                  bottom: 8,
                }}
                barGap={8}
                barCategoryGap="28%"
              >
                <CartesianGrid
                  stroke="#edf1f5"
                  strokeDasharray="3 5"
                  vertical={false}
                />

                <XAxis
                  dataKey="academicYear"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#667085",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                  dy={8}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#98a2b3",
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                  tickFormatter={formatCompactCurrency}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(15, 23, 42, 0.025)",
                  }}
                  contentStyle={{
                    border: "1px solid #e4e7ec",
                    borderRadius: "10px",
                    background: "#ffffff",
                    boxShadow:
                      "0 10px 26px rgba(16, 24, 40, 0.10)",
                    padding: "10px 12px",
                  }}
                  labelStyle={{
                    color: "#101828",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                  itemStyle={{
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                  formatter={(value, name) => [
                    formatCurrency(value),
                    name,
                  ]}
                />

                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    paddingTop: "12px",
                    color: "#667085",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                />

                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill="#2f80ed"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={58}
                />

                <Bar
                  dataKey="commission"
                  name="Commission"
                  fill="#f2994a"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={58}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </section>
  );
}
