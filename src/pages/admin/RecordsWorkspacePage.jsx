import { useState } from "react";

import DataEntryPage from "./DataEntryPage";
import TransportCostRecordsWorkspace from "./TransportCostRecordsWorkspace";
import "./RecordsWorkspacePage.css";

const AREAS = [
  { key: "monthly-reporting", label: "Monthly Reporting" },
  { key: "cost-centres", label: "Cost Centres" },
];

export default function RecordsWorkspacePage() {
  const [area, setArea] = useState("monthly-reporting");
  const [costCentre, setCostCentre] = useState("transport");

  return (
    <section className="records-workspace-page">
      <header className="records-workspace-intro">
        <div>
          <span className="records-workspace-kicker">RECORDS</span>
          <h2>Data Management Workspace</h2>
          <p>Enter, review and maintain the source records used across the commercial operations platform.</p>
        </div>
      </header>

      <nav className="records-primary-tabs" aria-label="Records work areas">
        {AREAS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={area === item.key ? "active" : ""}
            onClick={() => setArea(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="records-workspace-main">
        {area === "monthly-reporting" ? (
          <DataEntryPage />
        ) : (
          <section className="cost-centres-workspace">
            <nav className="records-secondary-tabs" aria-label="Cost centres">
              <button
                type="button"
                className={costCentre === "transport" ? "active" : ""}
                onClick={() => setCostCentre("transport")}
              >
                Transport
              </button>
            </nav>

            {costCentre === "transport" && <TransportCostRecordsWorkspace />}
          </section>
        )}
      </main>
    </section>
  );
}
