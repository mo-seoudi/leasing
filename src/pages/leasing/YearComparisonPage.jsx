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
  filterRecords,
  formatCurrency,
  getAcademicYearComparison,
  getAvailableProgrammes,
  programmeGroups,
  schools,
} from "../../lib/dashboardData";

import "./YearComparisonPage.css";

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
    <span className={`growth-value ${className}`}>
      {formatGrowth(value)}
    </span>
  );
}

export default function YearComparisonPage() {
  const { setHeaderControls } = useOutletContext();

  const [filters, setFilters] = useState({
    school: "",
    programGroup: "",
    program: "",
  });

  const availableProgrammes = useMemo(
    () => getAvailableProgrammes(filters.programGroup),
    [filters.programGroup]
  );

  const filteredRecords = useMemo(
    () =>
      filterRecords({
        school: filters.school,
        programGroup: filters.programGroup,
        program: filters.program,
      }),
    [filters]
  );

  const yearData = useMemo(() => {
    const comparison =
      getAcademicYearComparison(filteredRecords);

    return comparison.map((item, index) => {
      const previous = comparison[index - 1];

      return {
        ...item,
        revenueGrowth: previous
          ? calculateGrowth(
              item.totalRevenue,
              previous.totalRevenue
            )
          : null,
        schoolIncomeGrowth: previous
          ? calculateGrowth(
              item.schoolIncome,
              previous.schoolIncome
            )
          : null,
      };
    });
  }, [filteredRecords]);

  function handleFilterChange(name, value) {
    setFilters((current) => {
      const updated = {
        ...current,
        [name]: value,
      };

      if (name === "programGroup") {
        updated.program = "";
      }

      return updated;
    });
  }

  function clearFilters() {
    setFilters({
      school: "",
      programGroup: "",
      program: "",
    });
  }

  const selectedProgrammeLabel =
    filters.program || "All Programmes";

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

            {schools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </label>

        <label className="header-filter-control wide">
          <span>Programme Group</span>

          <select
            value={filters.programGroup}
            onChange={(event) =>
              handleFilterChange(
                "programGroup",
                event.target.value
              )
            }
          >
            <option value="">All Groups</option>

            {programmeGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </label>

        <label className="header-filter-control wide">
          <span>Programme</span>

          <select
            value={filters.program}
            onChange={(event) =>
              handleFilterChange(
                "program",
                event.target.value
              )
            }
          >
            <option value="">All Programmes</option>

            {availableProgrammes.map((programme) => (
              <option
                key={programme}
                value={programme}
              >
                {programme}
              </option>
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
    availableProgrammes,
    setHeaderControls,
  ]);

  return (
    <section className="year-comparison-page">
      <section className="year-summary-card">
        <div className="year-card-heading">
          <div>
            <h2>{selectedProgrammeLabel}</h2>
            <p>
              Total Revenue and School Income by academic
              year.
            </p>
          </div>

          <span className="year-count">
            {yearData.length} academic years
          </span>
        </div>

        {yearData.length === 0 ? (
          <div className="empty-state">
            No records are available for the selected filters.
          </div>
        ) : (
          <div className="year-table-scroll">
            <table className="year-comparison-table">
              <thead>
                <tr>
                  <th>Academic Year</th>
                  <th>Total Revenue</th>
                  <th>Revenue Growth</th>
                  <th>School Income</th>
                  <th>Income Growth</th>
                </tr>
              </thead>

              <tbody>
                {yearData.map((item) => (
                  <tr key={item.academicYear}>
                    <th>{item.academicYear}</th>

                    <td className="revenue-cell">
                      {formatCurrency(item.totalRevenue)}
                    </td>

                    <td>
                      <GrowthValue
                        value={item.revenueGrowth}
                      />
                    </td>

                    <td className="income-cell">
                      {formatCurrency(item.schoolIncome)}
                    </td>

                    <td>
                      <GrowthValue
                        value={item.schoolIncomeGrowth}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {yearData.length > 0 && (
        <section className="year-chart-card">
          <div className="year-card-heading">
            <div>
              <h2>Academic-Year Comparison</h2>
              <p>
                Revenue and income comparison for{" "}
                {selectedProgrammeLabel}.
              </p>
            </div>
          </div>

          <div className="year-chart-container">
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
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(value)
                  }
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
                  dataKey="totalRevenue"
                  name="Total Revenue"
                  fill="#2f80ed"
                  radius={[8, 8, 2, 2]}
                  maxBarSize={58}
                />

                <Bar
                  dataKey="schoolIncome"
                  name="School Income"
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
