import { Fragment } from "react";

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

import { formatCurrency } from "../lib/dashboardData";
import ProgrammeDetailView from "./leasing/ProgrammeDetailView";

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function formatPercentage(value) {
  const number = toNumber(value);

  if (number === 0) {
    return "0%";
  }

  if (number > 0 && number < 1) {
    return "<1%";
  }

  return `${number.toFixed(0)}%`;
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}

function TableIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M3 9h18" />
      <path d="M3 14h18" />
      <path d="M9 4v16" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  );
}

export default function ProgrammeDirectoryTable({
  data = [],
  records = [],
  selectedProgramme = "",
  onProgrammeClick,
  onCloseProgramme,
  viewMode = "table",
  onViewModeChange,
}) {
  function handleProgrammeClick(programme) {
    if (typeof onProgrammeClick === "function") {
      onProgrammeClick(programme);
    }
  }

  function handleViewModeChange(mode) {
    if (typeof onViewModeChange === "function") {
      onViewModeChange(mode);
    }
  }

  return (
    <section className="directory-table-card">
      <div className="directory-table-heading">
        <div>
          <h2>Programme Directory</h2>

          <p>
            Revenue, school income and contribution to total
            leasing performance. Expand a programme in Table
            view to open its detailed analysis.
          </p>
        </div>

        <div
          className="directory-view-toggle"
          role="group"
          aria-label="Programme directory view"
        >
          <button
            type="button"
            className={
              viewMode === "table" ? "active" : ""
            }
            onClick={() =>
              handleViewModeChange("table")
            }
            aria-pressed={viewMode === "table"}
            title="Table view"
          >
            <TableIcon />
            <span>Table</span>
          </button>

          <button
            type="button"
            className={
              viewMode === "chart" ? "active" : ""
            }
            onClick={() =>
              handleViewModeChange("chart")
            }
            aria-pressed={viewMode === "chart"}
            title="Chart view"
          >
            <ChartIcon />
            <span>Chart</span>
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="directory-empty-state">
          No programme records are available for the
          selected filters.
        </div>
      ) : viewMode === "chart" ? (
        <div className="directory-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.slice(0, 20)}
              margin={{
                top: 15,
                right: 20,
                bottom: 85,
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
                height={100}
                tick={{ fontSize: 10 }}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={formatCompactNumber}
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
      ) : (
        <div className="directory-table-scroll">
          <table className="directory-comparison-table">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Provider</th>
                <th>Category</th>
                <th>Total Revenue</th>
                <th>School Income</th>
                <th>% of Revenue</th>
                <th>% of School Income</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => {
                const isSelected =
                  selectedProgramme === item.programme;

                return (
                  <Fragment key={item.programme}>
                    <tr
                      className={
                        isSelected
                          ? "directory-selected-row"
                          : ""
                      }
                    >
                      <th>
                        <button
                          type="button"
                          className="directory-programme-button"
                          onClick={() =>
                            handleProgrammeClick(
                              item.programme
                            )
                          }
                          aria-expanded={isSelected}
                        >
                          <span>{item.programme}</span>

                          <span
                            className={
                              isSelected
                                ? "directory-row-arrow open"
                                : "directory-row-arrow"
                            }
                          >
                            ▶
                          </span>
                        </button>
                      </th>

                      <td>{item.provider || "—"}</td>

                      <td>
                        {item.programGroup || "—"}
                      </td>

                      <td className="directory-revenue-value">
                        {formatCurrency(
                          item.totalRevenue
                        )}
                      </td>

                      <td className="directory-income-value">
                        {formatCurrency(
                          item.schoolIncome
                        )}
                      </td>

                      <td>
                        <div className="directory-percentage-cell">
                          <span>
                            {formatPercentage(
                              item.revenueShare
                            )}
                          </span>

                          <div className="directory-percentage-track">
                            <div
                              className="directory-percentage-fill directory-revenue-fill"
                              style={{
                                width: `${Math.min(
                                  toNumber(
                                    item.revenueShare
                                  ),
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="directory-percentage-cell">
                          <span>
                            {formatPercentage(
                              item.incomeShare
                            )}
                          </span>

                          <div className="directory-percentage-track">
                            <div
                              className="directory-percentage-fill directory-income-fill"
                              style={{
                                width: `${Math.min(
                                  toNumber(
                                    item.incomeShare
                                  ),
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>

                    {isSelected && (
                      <tr className="directory-expanded-row">
                        <td colSpan={7}>
                          <ProgrammeDetailView
                            programme={item.programme}
                            records={records}
                            onClose={onCloseProgramme}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
