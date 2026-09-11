import { useSearchParams } from "react-router-dom";

import DataEntryPage from "./DataEntryPage";
import TransportCostRecordsWorkspace from "./TransportCostRecordsWorkspace";
import "./RecordsWorkspacePage.css";

const AREAS = [
  { key: "monthly-reporting", label: "Monthly Reporting" },
  { key: "cost-centres", label: "Cost Centres" },
];

export default function RecordsWorkspacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedArea = searchParams.get("area");
  const area = requestedArea === "cost-centres" ? "cost-centres" : "monthly-reporting";
  const costCentre = searchParams.get("costCentre") || "transport";
  const stream = searchParams.get("stream") || "";
  const view = searchParams.get("view") || "";

  function setArea(nextArea) {
    const next = new URLSearchParams(searchParams);
    next.set("area", nextArea);
    next.delete("stream");
    next.delete("view");
    if (nextArea === "cost-centres") next.set("costCentre", "transport");
    else next.delete("costCentre");
    setSearchParams(next);
  }

  function setCostCentre(nextCostCentre) {
    const next = new URLSearchParams(searchParams);
    next.set("area", "cost-centres");
    next.set("costCentre", nextCostCentre);
    setSearchParams(next);
  }

  return (
    <section className="records-workspace-page">
      <nav className="records-primary-tabs" aria-label="Data management areas">
        {AREAS.map((item) => (
          <button key={item.key} type="button" className={area === item.key ? "active" : ""} onClick={() => setArea(item.key)}>
            {item.label}
          </button>
        ))}
      </nav>

      <main className="records-workspace-main">
        {area === "monthly-reporting" ? (
          <DataEntryPage initialStreamCode={stream} initialView={view} />
        ) : (
          <section className="cost-centres-workspace">
            <div className="cost-centre-control">
              <label htmlFor="records-cost-centre">Cost Centre</label>
              <select id="records-cost-centre" value={costCentre} onChange={(event) => setCostCentre(event.target.value)}>
                <option value="transport">Transport</option>
              </select>
            </div>
            {costCentre === "transport" && <TransportCostRecordsWorkspace initialView={view} />}
          </section>
        )}
      </main>
    </section>
  );
}
