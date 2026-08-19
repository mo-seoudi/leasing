export default function MetricToggle({
  options = [],
  value,
  onChange,
  ariaLabel = "Metric",
}) {
  return (
    <div className="dashboard-metric-toggle" aria-label={ariaLabel}>
      {options.map((option) => {
        const optionValue =
          typeof option === "string" ? option : option.value;
        const optionLabel =
          typeof option === "string" ? option : option.label || option.value;
        const Icon =
          typeof option === "string" ? null : option.icon;

        return (
          <button
            key={optionValue}
            type="button"
            className={value === optionValue ? "active" : ""}
            onClick={() => onChange(optionValue)}
            aria-label={optionLabel}
            title={optionLabel}
          >
            {Icon ? <Icon aria-hidden="true" /> : optionLabel}
          </button>
        );
      })}
    </div>
  );
}
