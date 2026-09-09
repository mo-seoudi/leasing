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
          <section className="records-area-section">
            <div className="records-area-header">
              <div>
                <span>COMMERCIAL RECORDS</span>
                <h3>Monthly Reporting</h3>
                <p>Maintain monthly revenue, income, budget and forecast records across your commercial streams.</p>
              </div>
            </div>
            <DataEntryPage />
          </section>
        ) : (
          <section className="records-area-section cost-centres-workspace">
            <div className="records-area-header">
              <div>
                <span>OPERATIONAL COSTS</span>
                <h3>Cost Centres</h3>
                <p>Maintain operating costs and supporting expenditure records by business area.</p>
              </div>
            </div>

            <div className="cost-centre-toolbar">
              <span>Cost Centre</span>
              <div className="cost-centre-selector" role="tablist" aria-label="Cost centres">
                <button
                  type="button"
                  role="tab"
                  aria-selected={costCentre === "transport"}
                  className={costCentre === "transport" ? "active" : ""}
                  onClick={() => setCostCentre("transport")}
                >
                  Transport
                </button>
              </div>
            </div>

            {costCentre === "transport" && <TransportCostRecordsWorkspace />}
          </section>
        )}
      </main>
    </section>
  );
}
