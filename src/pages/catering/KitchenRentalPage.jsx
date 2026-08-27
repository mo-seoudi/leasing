import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "./KitchenRentalPage.css";

const rentalHistory = [
  { period: "Previous", supplier: "Ginza", school: "Repton Dubai", schoolCode: "RDXB", annualRent: 500000, vatRate: 5, status: "Previous" },
  { period: "Current", supplier: "Ben's Farmhouse", school: "Repton Dubai", schoolCode: "RDXB", annualRent: 400000, vatRate: 5, status: "Current" },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
}

export default function KitchenRentalPage() {
  const { setHeaderControls } = useOutletContext();
  const current = rentalHistory.find((item) => item.status === "Current");
  const previous = rentalHistory.find((item) => item.status === "Previous");
  const change = previous?.annualRent ? ((current.annualRent - previous.annualRent) / previous.annualRent) * 100 : 0;
  const vatAmount = current.annualRent * (current.vatRate / 100);

  useEffect(() => {
    setHeaderControls(null);
    return () => setHeaderControls(null);
  }, [setHeaderControls]);

  return (
    <section className="kitchen-rental-page">
      <section className="kitchen-rental-kpis">
        <article className="kitchen-rental-kpi primary">
          <span>Annual Rental Income</span>
          <strong>{formatCurrency(current.annualRent)}</strong>
          <small>+ {current.vatRate}% VAT ({formatCurrency(vatAmount)})</small>
        </article>
        <article className="kitchen-rental-kpi">
          <span>Current Supplier</span>
          <strong>{current.supplier}</strong>
          <small>Current catering services agreement</small>
        </article>
        <article className="kitchen-rental-kpi">
          <span>School</span>
          <strong>{current.school}</strong>
          <small>{current.schoolCode}</small>
        </article>
        <article className="kitchen-rental-kpi">
          <span>Rental Change</span>
          <strong className={change < 0 ? "negative" : "positive"}>{change.toFixed(1)}%</strong>
          <small>vs {formatCurrency(previous.annualRent)} previous rent</small>
        </article>
      </section>

      <section className="kitchen-rental-main-grid">
        <article className="kitchen-rental-panel performance-panel">
          <div className="kitchen-rental-heading">
            <div><span>Performance</span><h2>Annual Rental Comparison</h2><p>Contracted annual kitchen rental income, excluding VAT.</p></div>
            <span className="kitchen-rental-pill">{current.schoolCode}</span>
          </div>
          <div className="kitchen-rental-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentalHistory} margin={{ top: 16, right: 20, left: 10, bottom: 8 }}>
                <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="supplier" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={formatCompactCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => `${label} — ${current.schoolCode}`} />
                <Bar dataKey="annualRent" name="Annual Rent" fill="#159f8c" radius={[7, 7, 0, 0]} maxBarSize={90} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="kitchen-rental-panel current-terms-panel">
          <div className="kitchen-rental-heading compact"><div><span>Current arrangement</span><h2>Rental Terms</h2></div><span className="kitchen-rental-status">Current</span></div>
          <dl className="kitchen-rental-terms">
            <div><dt>Supplier</dt><dd>{current.supplier}</dd></div>
            <div><dt>School</dt><dd>{current.school}</dd></div>
            <div><dt>Annual rent</dt><dd>{formatCurrency(current.annualRent)}</dd></div>
            <div><dt>VAT</dt><dd>{current.vatRate}% · {formatCurrency(vatAmount)}</dd></div>
            <div><dt>Gross amount incl. VAT</dt><dd>{formatCurrency(current.annualRent + vatAmount)}</dd></div>
            <div><dt>Commercial context</dt><dd>Catering Services Agreement</dd></div>
          </dl>
          <p className="kitchen-rental-note">Kitchen Rental is reported as an independent revenue stream while remaining operationally linked to the Catering contract.</p>
        </article>
      </section>

      <article className="kitchen-rental-panel history-panel">
        <div className="kitchen-rental-heading"><div><span>History</span><h2>Rental History</h2><p>Annual contracted rental values for the Repton Dubai kitchen.</p></div></div>
        <div className="kitchen-rental-table-wrap">
          <table className="kitchen-rental-table">
            <thead><tr><th>Arrangement</th><th>School</th><th>Supplier</th><th className="numeric">Annual Rent</th><th className="numeric">VAT</th><th className="numeric">Gross incl. VAT</th></tr></thead>
            <tbody>{rentalHistory.map((item) => { const vat = item.annualRent * item.vatRate / 100; return <tr key={item.supplier}><td><span className={`history-status ${item.status.toLowerCase()}`}>{item.status}</span></td><td>{item.school}</td><td><strong>{item.supplier}</strong></td><td className="numeric">{formatCurrency(item.annualRent)}</td><td className="numeric">{item.vatRate}%</td><td className="numeric">{formatCurrency(item.annualRent + vat)}</td></tr>; })}</tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
