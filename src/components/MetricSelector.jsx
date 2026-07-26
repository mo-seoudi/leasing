const metrics = [
  {
    key: "schoolIncome",
    label: "School Income",
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
  },
  {
    key: "sales",
    label: "Sales",
  },
  {
    key: "commission",
    label: "Commission",
  },
  {
    key: "rentalFees",
    label: "Rental Fees",
  },
];

export default function MetricSelector({
  value,
  onChange,
}) {
  return (
    <div className="metric-selector">

      <label htmlFor="metric-selector">
        Display Metric
      </label>

      <select
        id="metric-selector"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        {metrics.map((metric) => (
          <option
            key={metric.key}
            value={metric.key}
          >
            {metric.label}
          </option>
        ))}
      </select>

    </div>
  );
}
