import { Fragment } from "react";

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

export default function ProgrammeDirectoryTable({
  data = [],
  records = [],
  selectedProgramme = "",
  onProgrammeClick,
  onCloseProgramme,
}) {
  function handleProgrammeClick(programme) {
    if (typeof onProgrammeClick === "function") {
      onProgrammeClick(programme);
    }
  }

  return (
    <section className="directory-table-card">
      <div className="directory-table-heading">
        <div>
          <h2>Programme Directory</h2>

          <p>
            Revenue, school income and contribution to total
            leasing performance. Click a programme to open its
            detailed analysis.
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="directory-empty-state">
          No programme records are available for the selected
          filters.
        </div>
      ) : (
        <div className="directory-table-scroll">
          <table className="directory-comparison-table">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Provider</th>
                <th>Programme Group</th>
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
