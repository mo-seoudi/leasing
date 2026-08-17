import { Fragment } from "react";

import { formatCurrency } from "../lib/dashboardData";
import ProgrammeDetailView from "./leasing/ProgrammeDetailView";

export default function ProgrammeTable({
  data = [],
  records = [],
  title = "Programme Details",
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
    <section className="card table-card">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>

          <p>
            Click a programme name to view its monthly or termly
            financial breakdown.
          </p>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="table-wrapper">
          <table className="programme-table">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Category</th>
                <th>Provider</th>
                <th className="number-cell">Sales</th>
                <th className="number-cell">Commission</th>
                <th className="number-cell">Rental Fees</th>
                <th className="number-cell">Total Revenue</th>
                <th className="number-cell">School Income</th>
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
                          ? "selected-programme-row"
                          : ""
                      }
                    >
                      <td className="programme-name">
                        <button
                          type="button"
                          className="programme-detail-link"
                          onClick={() =>
                            handleProgrammeClick(
                              item.programme
                            )
                          }
                          aria-expanded={isSelected}
                        >
                          <span className="programme-link-text">
                            {item.programme}
                          </span>

                          <span
                            className={
                              isSelected
                                ? "programme-row-arrow open"
                                : "programme-row-arrow"
                            }
                            aria-hidden="true"
                          >
                            ▶
                          </span>
                        </button>
                      </td>

                      <td>
                        {item.programGroup || "—"}
                      </td>

                      <td>
                        {item.provider || "—"}
                      </td>

                      <td className="number-cell">
                        {formatCurrency(item.sales)}
                      </td>

                      <td className="number-cell">
                        {formatCurrency(item.commission)}
                      </td>

                      <td className="number-cell">
                        {formatCurrency(item.rentalFees)}
                      </td>

                      <td className="number-cell">
                        {formatCurrency(item.totalRevenue)}
                      </td>

                      <td className="number-cell school-income-cell">
                        {formatCurrency(item.schoolIncome)}
                      </td>
                    </tr>

                    {isSelected && (
                      <tr className="programme-expanded-row">
                        <td colSpan={8}>
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
      ) : (
        <div className="empty-state">
          No programme data available for the selected filters.
        </div>
      )}
    </section>
  );
}
