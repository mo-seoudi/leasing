import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../auth/AuthProvider";
import LeasingProgrammeManager from "../../components/admin/LeasingProgrammeManager";
import { fetchDataEntryOptions } from "../../lib/financialData";
import DataEntryPage from "./DataEntryPage";
import "./RecordsWorkspacePage.css";

export default function RecordsWorkspacePage() {
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "editor";
  const [section, setSection] = useState("financial");
  const [programmeOptions, setProgrammeOptions] = useState({ programmes: [], providers: [] });
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);
  const [programmeError, setProgrammeError] = useState("");

  const loadProgrammeOptions = useCallback(async () => {
    try {
      setLoadingProgrammes(true);
      setProgrammeError("");
      const options = await fetchDataEntryOptions();
      setProgrammeOptions({
        programmes: options.programmes || [],
        providers: options.providers || [],
      });
    } catch (error) {
      setProgrammeError(error?.message || "Unable to load Leasing programme data.");
    } finally {
      setLoadingProgrammes(false);
    }
  }, []);

  useEffect(() => {
    if (section === "leasing-programmes" && programmeOptions.programmes.length === 0) {
      void loadProgrammeOptions();
    }
  }, [section, programmeOptions.programmes.length, loadProgrammeOptions]);

  return (
    <section className="records-workspace-page">
      <div className="records-workspace-tabs" role="tablist" aria-label="Records workspace">
        <button
          type="button"
          role="tab"
          aria-selected={section === "financial"}
          className={section === "financial" ? "active" : ""}
          onClick={() => setSection("financial")}
        >
          Financial Records
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={section === "leasing-programmes"}
          className={section === "leasing-programmes" ? "active" : ""}
          onClick={() => setSection("leasing-programmes")}
        >
          Leasing Programmes
        </button>
      </div>

      {section === "financial" ? (
        <DataEntryPage />
      ) : loadingProgrammes ? (
        <div className="records-workspace-loading">Loading Leasing programmes…</div>
      ) : programmeError ? (
        <div className="records-workspace-error">{programmeError}</div>
      ) : (
        <LeasingProgrammeManager
          programmes={programmeOptions.programmes}
          providers={programmeOptions.providers}
          canEdit={canEdit}
          onRefresh={loadProgrammeOptions}
        />
      )}
    </section>
  );
}
