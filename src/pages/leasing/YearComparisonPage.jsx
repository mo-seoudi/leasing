import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
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

function formatCompactCurrency(value) {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) {
    return "AED 0";
  }

  return `AED ${new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number)}`;
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

function ModernChartTooltip({
  active,
  payload,
  label,
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const revenue = payload.find(
    (item) => item.dataKey === "totalRevenue"
  );

  const income = payload.find(
    (item) => item.dataKey === "schoolIncome"
  );

  return (
    <div className="modern-chart-tooltip">
      <div className="modern-chart-tooltip-year">
        {label}
      </div>

      <div className="modern-chart-tooltip-row">
        <span className="modern-chart-tooltip-dot revenue" />

        <span>Total Revenue</span>

        <strong>
          {formatCurrency(revenue?.value || 0)}
        </strong>
      </div>

      <div className="modern-chart-tooltip-row">
        <span className="modern-chart-tooltip-dot income" />

        <span>School Income</span>

        <strong>
          {formatCurrency(income?.value || 0)}
        </strong>
      </div>
    </div>
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
        <section className="year-chart-card modern-year-chart-card">
          <div className="modern-year-chart-heading">
            <div>
              <span className="modern-chart-kicker">
                Performance trend
              </span>

              <h2>Academic-Year Comparison</h2>

              <p>
                Revenue and school income performance for{" "}
                {selectedProgrammeLabel}.
              </p>
            </div>

            <div className="modern-chart-legend">
              <div>
                <span className="legend-swatch revenue" />
                <span>Total Revenue</span>
              </div>

              <div>
                <span className="legend-line income" />
                <span>School Income</span>
              </div>
            </div>
          </div>

          <div className="modern-chart-summary">
            <div>
              <span>Latest Revenue</span>
              <strong>
                {formatCompactCurrency(
                  yearData[yearData.length - 1]
                    ?.totalRevenue
                )}
              </strong>
            </div>

            <div>
              <span>Latest School Income</span>
              <strong>
                {formatCompactCurrency(
                  yearData[yearData.length - 1]
                    ?.schoolIncome
                )}
              </strong>
            </div>

            <div>
              <span>Revenue YoY</span>
              <strong>
                {formatGrowth(
                  yearData[yearData.length - 1]
                    ?.revenueGrowth ?? null
                )}
              </strong>
            </div>
          </div>

          <div className="year-chart-container modern-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={yearData}
                margin={{
                  top: 24,
                  right: 30,
                  left: 6,
                  bottom: 4,
                }}
                barCategoryGap="34%"
              >
                <CartesianGrid
                  stroke="#eef0f3"
                  strokeDasharray="2 6"
                  vertical={false}
                />

                <XAxis
                  dataKey="academicYear"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#737373",
                    fontSize: 11,
                  }}
                  dy={8}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={58}
                  tick={{
                    fill: "#a3a3a3",
                    fontSize: 10,
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
                    radius: 10,
                  }}
                  content={<ModernChartTooltip />}
                />

                <Bar
                  dataKey="totalRevenue"
                  name="Total Revenue"
                  fill="#18181b"
                  maxBarSize={72}
                  radius={[9, 9, 3, 3]}
                />

                <Line
                  type="monotone"
                  dataKey="schoolIncome"
                  name="School Income"
                  stroke="#7c3aed"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#ffffff",
                    stroke: "#7c3aed",
                    strokeWidth: 2.5,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "#7c3aed",
                    stroke: "#ffffff",
                    strokeWidth: 3,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </section>
  );
}
