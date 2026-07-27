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
  academicYears,
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

  return (
    <section className="year-comparison-page">
      <section className="comparison-filter-card">
        <div className="comparison-filter-heading">
          <div>
            <h2>Comparison Filters</h2>
            <p>
              Select one programme or a programme group to
              compare its performance across academic years.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="comparison-filter-grid">
          <div className="comparison-filter">
            <label htmlFor="year-school">School</label>

            <select
              id="year-school"
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
          </div>

          <div className="comparison-filter">
            <label htmlFor="year-programme-group">
              Programme Group
            </label>

            <select
              id="year-programme-group"
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
          </div>

          <div className="comparison-filter">
            <label htmlFor="year-programme">
              Programme
            </label>

            <select
              id="year-programme"
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
          </div>
        </div>
      </section>

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
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(value)
                  }
                />

                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(value),
                    name,
                  ]}
                />

                <Legend />

                <Bar
                  dataKey="totalRevenue"
                  name="Total Revenue"
                  fill="#38a3d1"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="schoolIncome"
                  name="School Income"
                  fill="#e97832"
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
