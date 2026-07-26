import { formatCurrency } from "../lib/dashboardData";

export default function ProgrammeTable({
  data = [],
  title = "Programme Details",
}) {
  return (
    <section className="card table-card">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>

          <p>
            Detailed financial performance by programme.
          </p>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="table-wrapper">
          <table className="programme-table">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Group</th>
                <th>Provider</th>
                <th className="number-cell">Sales</th>
                <th className="number-cell">Commission</th>
                <th className="number-cell">Rental Fees</th>
                <th className="number-cell">Total Revenue</th>
                <th className="number-cell">School Income</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr key={item.programme}>
                  <td className="programme-name">
                    {item.programme}
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
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          No programme data is available for the selected filters.
        </div>
      )}
    </section>
  );
}
