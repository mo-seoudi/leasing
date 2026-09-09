import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../auth/AuthProvider";
import LeasingProgrammeManager from "../../components/admin/LeasingProgrammeManager";
import { fetchDataEntryOptions } from "../../lib/financialData";
import DataEntryPage from "./DataEntryPage";
import TransportCostRecordsWorkspace from "./TransportCostRecordsWorkspace";
import "./RecordsWorkspacePage.css";

const SECTIONS=[
  {key:"financial",label:"Financial Records",description:"Revenue, income and commercial financial records"},
  {key:"transport-costs",label:"Transport Costs",description:"Monthly transport cost register"},
  {key:"leasing-programmes",label:"Leasing Programmes",description:"Programme master data and providers"},
];

export default function RecordsWorkspacePage() {
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "editor";
  const [section, setSection] = useState("financial");
  const [programmeOptions, setProgrammeOptions] = useState({ programmes: [], providers: [] });
  const [loadingProgrammes, setLoadingProgrammes] = useState(false);
  const [programmeError, setProgrammeError] = useState("");

  const loadProgrammeOptions = useCallback(async () => {
    try {setLoadingProgrammes(true);setProgrammeError("");const options=await fetchDataEntryOptions();setProgrammeOptions({programmes:options.programmes||[],providers:options.providers||[]});}
    catch(error){setProgrammeError(error?.message||"Unable to load Leasing programme data.");}
    finally{setLoadingProgrammes(false);}
  }, []);

  useEffect(()=>{if(section==="leasing-programmes"&&programmeOptions.programmes.length===0)void loadProgrammeOptions();},[section,programmeOptions.programmes.length,loadProgrammeOptions]);

  return <section className="records-workspace-page">
    <header className="records-workspace-intro">
      <div><span className="records-workspace-kicker">DATA MANAGEMENT</span><h2>Records Workspace</h2><p>Maintain the operational and financial records that power your commercial dashboards.</p></div>
    </header>

    <div className="records-workspace-tabs" role="tablist" aria-label="Records workspace">
      {SECTIONS.map(item=><button key={item.key} type="button" role="tab" aria-selected={section===item.key} className={section===item.key?"active":""} onClick={()=>setSection(item.key)}><span>{item.label}</span><small>{item.description}</small></button>)}
    </div>

    <div className="records-workspace-content">
      {section==="financial"?<DataEntryPage/>:section==="transport-costs"?<TransportCostRecordsWorkspace/>:loadingProgrammes?<div className="records-workspace-loading">Loading Leasing programmes…</div>:programmeError?<div className="records-workspace-error">{programmeError}</div>:<LeasingProgrammeManager programmes={programmeOptions.programmes} providers={programmeOptions.providers} canEdit={canEdit} onRefresh={loadProgrammeOptions}/>} 
    </div>
  </section>;
}
