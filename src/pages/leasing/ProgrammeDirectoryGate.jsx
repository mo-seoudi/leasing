import { useEffect, useState } from "react";

import { hydrateDashboardData } from "../../lib/dashboardData";
import { fetchLeasingRecords } from "../../lib/leasingSupabaseData";
import { fetchProviders } from "../../lib/providerData";
import ProgrammeDirectoryPage from "./ProgrammeDirectoryPage";

export default function ProgrammeDirectoryGate() {
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDirectoryData() {
      try {
        const [records] = await Promise.all([
          fetchLeasingRecords(),
          fetchProviders(),
        ]);

        hydrateDashboardData(records);

        if (!cancelled) {
          setStatus("ready");
        }
      } catch (error) {
        console.error("Unable to load Programme Directory from Supabase:", error);

        if (!cancelled) {
          setErrorMessage(error?.message || "Unable to load Programme Directory data.");
          setStatus("error");
        }
      }
    }

    loadDirectoryData();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <section className="card">
        <h2>Programme Directory</h2>
        <p>Loading programme, financial, provider and contract data…</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="card">
        <h2>Programme Directory</h2>
        <p>Programme Directory data could not be loaded from Supabase.</p>
        <p>{errorMessage}</p>
      </section>
    );
  }

  return <ProgrammeDirectoryPage />;
}
