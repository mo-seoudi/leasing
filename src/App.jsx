import dashboardData from "./data/leasing-full-truth-data.json";

export default function App() {
  const totalRecords = dashboardData.records.length;

  return (
    <div className="app">

      <header className="header">
        <h1>Leasing Dashboard</h1>

        <p>
          Commercial dashboard for academy and programme performance
        </p>
      </header>

      <main className="content">

        <section className="card">

          <h2>Data Source</h2>

          <p>
            <strong>Records Loaded:</strong> {totalRecords}
          </p>

          <p>
            <strong>Academic Years:</strong>{" "}
            {dashboardData.metadata.sourceRowCount > 0
              ? "Available"
              : "None"}
          </p>

        </section>

      </main>

    </div>
  );
}
