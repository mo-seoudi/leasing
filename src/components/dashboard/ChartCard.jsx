export default function ChartCard({
  title,
  description,
  action,
  children,
  className = "",
}) {
  return (
    <section className={`dashboard-chart-card ${className}`.trim()}>
      <div className="dashboard-card-heading">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action ? <div className="dashboard-card-action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
