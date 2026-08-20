import { useEffect, useState } from "react";

import { fetchProviders } from "../../lib/providerData";
import ProgrammeDirectoryPage from "./ProgrammeDirectoryPage";

export default function ProgrammeDirectoryGate() {
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProviders() {
      try {
        await fetchProviders({ force: true });

        if (!cancelled) {
          setStatus("ready");
        }
      } catch (error) {
        console.error("Unable to load Programme Directory providers:", error);

        if (!cancelled) {
          setErrorMessage(error?.message || "Unable to load provider data.");
          setStatus("error");
        }
      }
    }

    loadProviders();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <section className="card">
        <h2>Programme Directory</h2>
        <p>Loading provider and contract data…</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="card">
        <h2>Programme Directory</h2>
        <p>Provider data could not be loaded from Supabase.</p>
        <p>{errorMessage}</p>
      </section>
    );
  }

  return <ProgrammeDirectoryPage />;
}
