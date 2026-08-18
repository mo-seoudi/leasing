export default function KpiCard({ label, value, detail, className = "" }) {
  return (
    <article className={`dashboard-kpi-card ${className}`.trim()}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </article>
  );
}
