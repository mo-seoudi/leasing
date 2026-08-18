export default function MetricToggle({
  options = [],
  value,
  onChange,
  ariaLabel = "Metric",
}) {
  return (
    <div className="dashboard-metric-toggle" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={value === option ? "active" : ""}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
