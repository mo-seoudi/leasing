export function TableViewIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm1 4h5V6H5v2Zm7 0h7V6h-7v2ZM5 13h5v-3H5v3Zm7 0h7v-3h-7v3ZM5 18h5v-3H5v3Zm7 0h7v-3h-7v3Z"
      />
    </svg>
  );
}

export function BarChartViewIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M4 20h3V10H4v10Zm6 0h4V4h-4v16Zm7 0h3v-7h-3v7ZM2 21h20v1H2z"
      />
    </svg>
  );
}

export function PieChartViewIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M11 2.05A10 10 0 1 0 21.95 13H11V2.05ZM13 2v9h9A10 10 0 0 0 13 2Z"
      />
    </svg>
  );
}
