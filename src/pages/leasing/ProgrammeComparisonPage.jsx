import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  academicYears,
  filterRecords,
  formatCurrency,
  getProgrammeBreakdown,
  programmeGroups,
  schools,
} from "../../lib/dashboardData";

import "./ProgrammeComparisonPage.css";

const CHART_COLORS = [
  "#2563eb",
  "#f97316",
  "#16a34a",
  "#7c3aed",
  "#0891b2",
  "#eab308",
  "#dc2626",
  "#4f46e5",
  "#059669",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#0284c7",
  "#9333ea",
  "#0f766e",
  "#c2410c",
  "#475569",
  "#be123c",
];

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function formatPercentage(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0%";
  }

  if (number > 0 && number < 1) {
    return "<1%";
  }

  return `${number.toFixed(0)}%`;
}

function compactCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}

function PercentagePieChart({
  title,
  description,
  data,
  dataKey,
}) {
  const visibleData = data
    .filter((item) => toNumber(item[dataKey]) > 0)
    .slice(0, 12);

  return (
    <section className="programme-pie-card">
      <div className="programme-card-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {visibleData.length === 0 ? (
        <div className="programme-empty-state">
          No values are available for this chart.
        </div>
      ) : (
        <div className="programme-pie-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={visibleData}
                dataKey={dataKey}
                nameKey="programme"
                cx="50%"
                cy="47%"
                outerRadius={105}
                innerRadius={48}
                paddingAngle={1}
              >
                {visibleData.map((item, index) => (
                  <Cell
                    key={`${item.programme}-${dataKey}`}
                    fill={
                      CHART_COLORS[
                        index % CHART_COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name, tooltipItem) => [
                  formatPercentage(value),
                  tooltipItem?.payload?.programme || name,
                ]}
              />

              <Legend
                verticalAlign="bottom"
                wrapperStyle={{
                  fontSize: "11px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default function ProgrammeComparisonPage() {
  const defaultAcademicYear =
    academicYears[academicYears.length - 1] || "";

  const [filters, setFilters] = useState({
    academicYear: defaultAcademicYear,
    school: "",
    programGroup: "",
  });

  const filteredRecords = useMemo(
    () =>
      filterRecords({
        academicYear: filters.academicYear,
        school: filters.school,
        programGroup: filters.programGroup,
      }),
    [filters]
  );

  const programmeData = useMemo(() => {
    const breakdown =
      getProgrammeBreakdown(filteredRecords);

    const totalRevenue = breakdown.reduce(
      (total, item) =>
        total + toNumber(item.totalRevenue),
      0
    );

    const totalSchoolIncome = breakdown.reduce(
      (total, item) =>
        total + toNumber(item.schoolIncome),
      0
    );

    return breakdown
      .map((item) => ({
        ...item,

        revenueShare:
          totalRevenue > 0
            ? (toNumber(item.totalRevenue) /
                totalRevenue) *
              100
            : 0,

        incomeShare:
          totalSchoolIncome > 0
            ? (toNumber(item.schoolIncome) /
                totalSchoolIncome) *
              100
            : 0,
      }))
      .sort(
        (a, b) =>
          toNumber(b.totalRevenue) -
          toNumber(a.totalRevenue)
      );
  }, [filteredRecords]);

  const totals = useMemo(
    () =>
      programmeData.reduce(
        (result, item) => ({
          totalRevenue:
            result.totalRevenue +
            toNumber(item.totalRevenue),

          schoolIncome:
            result.schoolIncome +
            toNumber(item.schoolIncome),

          sales:
            result.sales + toNumber(item.sales),

          commission:
            result.commission +
            toNumber(item.commission),

          rentalFees:
            result.rentalFees +
            toNumber(item.rentalFees),
        }),
        {
          totalRevenue: 0,
          schoolIncome: 0,
          sales: 0,
          commission: 0,
          rentalFees: 0,
        }
      ),
    [programmeData]
  );

  const chartData = useMemo(
    () =>
      programmeData
        .filter(
          (item) =>
            toNumber(item.totalRevenue) > 0 ||
            toNumber(item.schoolIncome) > 0
        )
        .slice(0, 20),
    [programmeData]
  );

  function handleFilterChange(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      academicYear: defaultAcademicYear,
      school: "",
      programGroup: "",
    });
  }

  return (
    <section className="programme-comparison-page">
      <section className="programme-filter-card">
        <div className="programme-card-heading programme-filter-heading">
          <div>
            <h2>Comparison Filters</h2>

            <p>
              Compare programme revenue and school income
              within one academic year.
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

        <div className="programme-filter-grid">
          <div className="programme-filter">
            <label htmlFor="comparison-academic-year">
              Academic Year
            </label>

            <select
              id="comparison-academic-year"
              value={filters.academicYear}
              onChange={(event) =>
                handleFilterChange(
                  "academicYear",
                  event.target.value
                )
              }
            >
              {academicYears.map((academicYear) => (
                <option
                  key={academicYear}
                  value={academicYear}
                >
                  {academicYear}
                </option>
              ))}
            </select>
          </div>

          <div className="programme-filter">
            <label htmlFor="comparison-school">
              School
            </label>

            <select
              id="comparison-school"
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

          <div className="programme-filter">
            <label htmlFor="comparison-programme-group">
              Programme Group
            </label>

            <select
              id="comparison-programme-group"
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
        </div>
      </section>

      <section className="programme-summary-strip">
        <div>
          <span>Total Revenue</span>
          <strong>
            {formatCurrency(totals.totalRevenue)}
          </strong>
        </div>

        <div>
          <span>School Income</span>
          <strong>
            {formatCurrency(totals.schoolIncome)}
          </strong>
        </div>

        <div>
          <span>Programmes</span>
          <strong>{programmeData.length}</strong>
        </div>

        <div>
          <span>Selected Year</span>
          <strong>
            {filters.academicYear || "All Years"}
          </strong>
        </div>
      </section>

      <section className="programme-table-card">
        <div className="programme-card-heading">
          <h2>Programme Comparison</h2>

          <p>
            Revenue, school income and contribution to total
            leasing performance.
          </p>
        </div>

        {programmeData.length === 0 ? (
          <div className="programme-empty-state">
            No records are available for the selected
            filters.
          </div>
        ) : (
          <div className="programme-table-scroll">
            <table className="programme-comparison-table">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Programme Group</th>
                  <th>Total Revenue</th>
                  <th>School Income</th>
                  <th>% of Revenue</th>
                  <th>% of School Income</th>
                </tr>
              </thead>

              <tbody>
                {programmeData.map((item) => (
                  <tr key={item.programme}>
                    <th>{item.programme}</th>

                    <td>{item.programGroup}</td>

                    <td className="programme-revenue-value">
                      {formatCurrency(
                        item.totalRevenue
                      )}
                    </td>

                    <td className="programme-income-value">
                      {formatCurrency(
                        item.schoolIncome
                      )}
                    </td>

                    <td>
                      <div className="percentage-cell">
                        <span>
                          {formatPercentage(
                            item.revenueShare
                          )}
                        </span>

                        <div className="percentage-track">
                          <div
                            className="percentage-fill revenue-fill"
                            style={{
                              width: `${Math.min(
                                item.revenueShare,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="percentage-cell">
                        <span>
                          {formatPercentage(
                            item.incomeShare
                          )}
                        </span>

                        <div className="percentage-track">
                          <div
                            className="percentage-fill income-fill"
                            style={{
                              width: `${Math.min(
                                item.incomeShare,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}

                <tr className="programme-total-row">
                  <th>Leasing Total</th>

                  <td>
                    {filters.programGroup ||
                      "All Programme Groups"}
                  </td>

                  <td>
                    {formatCurrency(
                      totals.totalRevenue
                    )}
                  </td>

                  <td>
                    {formatCurrency(
                      totals.schoolIncome
                    )}
                  </td>

                  <td>100%</td>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {chartData.length > 0 && (
        <section className="programme-bar-card">
          <div className="programme-card-heading">
            <h2>Programme Revenue Comparison</h2>

            <p>
              Total Revenue and School Income for the
              selected academic year.
            </p>
          </div>

          <div className="programme-bar-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 15,
                  right: 20,
                  bottom: 80,
                  left: 20,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="programme"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={95}
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={compactCurrency}
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
                  fill="#1679a7"
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

      <div className="programme-pie-grid">
        <PercentagePieChart
          title="% of Total Leasing Revenue"
          description="Each programme’s share of total revenue."
          data={programmeData}
          dataKey="revenueShare"
        />

        <PercentagePieChart
          title="% of Total Leasing School Income"
          description="Each programme’s share of commission and rental fees."
          data={programmeData}
          dataKey="incomeShare"
        />
      </div>
    </section>
  );
}
