import { useState } from "react";

import DataEntryPage from "./DataEntryPage";
import TransportCostRecordsWorkspace from "./TransportCostRecordsWorkspace";
import "./RecordsWorkspacePage.css";

const AREAS = [
  {
    key: "monthly-reporting",
    label: "Monthly Reporting",
    eyebrow: "COMMERCIAL RECORDS",
    description: "Maintain the recurring monthly figures that feed your revenue and performance dashboards.",
    meta: "Revenue · Income · Forecast · Budget",
  },
  {
    key: "cost-centres",
    label: "Cost Centres",
    eyebrow: "OPERATIONAL COSTS",
    description: "Maintain operating costs, supplier charges and supporting expenditure registers by business area.",
    meta: "Transport now · More streams later",
  },
];

export default function RecordsWorkspacePage() {
  const [area, setArea] = useState("monthly-reporting");
  const [costCentre, setCostCentre] = useState("transport");

  const activeArea = AREAS.find((item) => item.key === area) || AREAS[0];

  return (
    <section className="records-workspace-page">
      <header className="records-workspace-intro">
        <div>
          <span className="records-workspace-kicker">RECORDS</span>
          <h2>Data Management Workspace</h2>
          <p>Enter, review and maintain the source records used across the commercial operations platform.</p>
        </div>
      </header>

      <div className="records-workspace-shell">
        <aside className="records-workspace-nav" aria-label="Records areas">
          <div className="records-nav-heading">WORK AREAS</div>
          {AREAS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={area === item.key ? "active" : ""}
              onClick={() => setArea(item.key)}
            >
              <span className="records-nav-label">{item.label}</span>
              <span className="records-nav-description">{item.description}</span>
            </button>
          ))}

          <div className="records-nav-note">
            <strong>Workspace principle</strong>
            <span>Records are transactional data. Master data and configuration stay within their operational modules.</span>
          </div>
        </aside>

        <main className="records-workspace-main">
          <div className="records-area-header">
            <div>
              <span>{activeArea.eyebrow}</span>
              <h3>{activeArea.label}</h3>
              <p>{activeArea.description}</p>
            </div>
            <div className="records-area-meta">{activeArea.meta}</div>
          </div>

          {area === "monthly-reporting" ? (
            <DataEntryPage />
          ) : (
            <section className="cost-centres-workspace">
              <div className="cost-centre-selector-row">
                <div>
                  <span className="records-subheading">COST CENTRE</span>
                  <h4>Select business area</h4>
                </div>
                <div className="cost-centre-selector" role="tablist" aria-label="Cost centres">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={costCentre === "transport"}
                    className={costCentre === "transport" ? "active" : ""}
                    onClick={() => setCostCentre("transport")}
                  >
                    <strong>Transport</strong>
                    <small>Trips, contractual costs and supplier charges</small>
                  </button>
                  <button type="button" disabled>
                    <strong>More cost centres</strong>
                    <small>Catering, Uniform, Facilities and others can be added here</small>
                  </button>
                </div>
              </div>

              {costCentre === "transport" && <TransportCostRecordsWorkspace />}
            </section>
          )}
        </main>
      </div>
    </section>
  );
}
