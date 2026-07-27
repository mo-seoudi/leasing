export default function ProgrammeSummaryPage() {
  return (
    <section
      style={{
        width: "100%",
        minWidth: 0,
      }}
    >
      <header
        style={{
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 700,
            color: "#1f2937",
          }}
        >
          Programme Summary
        </h1>

        <p
          style={{
            margin: "8px 0 0",
            color: "#667085",
            fontSize: "14px",
          }}
        >
          Monthly and annual leasing figures by programme and academic year.
        </p>
      </header>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
        }}
      >
        <h2
          style={{
            margin: "0 0 8px",
            fontSize: "18px",
            color: "#1f2937",
          }}
        >
          Programme Summary Table
        </h2>

        <p
          style={{
            margin: 0,
            color: "#667085",
          }}
        >
          The JSON-driven programme summary table will be added here.
        </p>
      </div>
    </section>
  );
}
