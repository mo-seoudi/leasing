export default function DashboardCurrencyTooltip({
  active,
  payload,
  label,
  formatValue,
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="dashboard-chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <div key={item.dataKey}>
          <span>{item.name}</span>
          <b>{formatValue ? formatValue(item.value) : item.value}</b>
        </div>
      ))}
    </div>
  );
}
