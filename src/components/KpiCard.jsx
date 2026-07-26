function formatCurrency(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function KpiCard({
  title,
  value,
  color = "var(--primary)",
}) {
  return (
    <div
      className="kpi-card"
      style={{
        borderTop: `5px solid ${color}`,
      }}
    >
      <div className="kpi-title">
        {title}
      </div>

      <div className="kpi-value">
        {formatCurrency(value)}
      </div>
    </div>
  );
}
