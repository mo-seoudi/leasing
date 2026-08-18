import { useEffect, useMemo, useState } from "react";

function groupByAcademicYear(data) {
  const grouped = new Map();
  data.forEach((item) => {
    const key = item.academicYear || "Other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  });

  return [...grouped.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([academicYear, rows]) => ({ academicYear, rows }));
}

export default function MonthlyResultsTable({
  data = [],
  columns = [],
  totals = {},
  totalLabel = "Selected Total",
  emptyMessage = "No records match the selected filters.",
  resetKey = "",
}) {
  const [page, setPage] = useState(0);
  const pages = useMemo(() => groupByAcademicYear(data), [data]);
  const safePage = Math.min(page, Math.max(pages.length - 1, 0));
  const current = pages[safePage];

  useEffect(() => setPage(0), [resetKey]);

  return (
    <section className="dashboard-table-card">
      <div className="dashboard-card-heading">
        <div>
          <h2>Monthly Results</h2>
          <p>Detailed monthly performance for the selected reporting scope.</p>
        </div>
        <span className="dashboard-record-count">
          {current?.academicYear ? `${current.academicYear} · ` : ""}
          {current?.rows?.length || 0} months
        </span>
      </div>

      {!data.length ? (
        <div className="dashboard-empty-state">{emptyMessage}</div>
      ) : (
        <div className="dashboard-table-scroll">
          <table className="dashboard-results-table">
            <thead>
              <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
            </thead>
            <tbody>
              {(current?.rows || []).map((item) => (
                <tr key={item.key || `${item.academicYear}-${item.month}`}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={column.numeric ? "dashboard-numeric-cell" : ""}
                    >
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan={Math.max(columns.length - Object.keys(totals).length, 1)}>
                  {totalLabel}
                </th>
                {Object.entries(totals).map(([key, value]) => (
                  <th key={key} className="dashboard-numeric-cell">{value}</th>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {pages.length > 1 ? (
        <div className="dashboard-results-pagination">
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={safePage === 0}>‹</button>
          <div className="dashboard-pagination-pages">
            {pages.map((item, index) => (
              <button
                key={item.academicYear}
                type="button"
                className={safePage === index ? "active" : ""}
                onClick={() => setPage(index)}
                title={item.academicYear}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setPage((p) => Math.min(pages.length - 1, p + 1))} disabled={safePage === pages.length - 1}>›</button>
          <span>{current?.academicYear}</span>
        </div>
      ) : null}
    </section>
  );
}
