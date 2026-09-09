import { useEffect, useMemo, useState } from "react";
import {
  fetchTransportCostOptions,
  fetchTransportCostRecords,
  formatCurrency,
  getTransportCostAcademicYears,
  saveTransportMonthlyCosts,
} from "../../lib/transportCostData";
import "./TransportCostRecordsWorkspace.css";

const GROUP_LABELS={trips:"Trip Costs",contractual:"Contractual Costs",other:"Other Charges",offset:"Subsidies / Credits"};
const GROUP_ORDER=["trips","contractual","other","offset"];
const SCENARIOS=["Actual","Budget","Forecast"];

function monthLabel(value){return value?new Intl.DateTimeFormat("en-GB",{month:"short",year:"numeric"}).format(new Date(`${String(value).slice(0,10)}T00:00:00`)):"—"}

export default function TransportCostRecordsWorkspace(){
  const [mode,setMode]=useState("entry");
  const [records,setRecords]=useState([]);
  const [options,setOptions]=useState({schools:[],categories:[]});
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [form,setForm]=useState({schoolId:"",month:"",scenario:"Actual",notes:"",values:{}});
  const [filters,setFilters]=useState({schoolId:"",academicYear:"",scenario:"Actual"});

  async function load(){
    const [nextRecords,nextOptions]=await Promise.all([fetchTransportCostRecords(),fetchTransportCostOptions()]);
    setRecords(nextRecords);setOptions(nextOptions);
  }

  useEffect(()=>{let active=true;(async()=>{try{setLoading(true);setError("");await load()}catch(e){if(active)setError(e?.message||"Unable to load Transport cost records.")}finally{if(active)setLoading(false)}})();return()=>{active=false}},[]);

  const categoriesByGroup=useMemo(()=>GROUP_ORDER.map(group=>({group,categories:options.categories.filter(c=>c.cost_group===group)})).filter(x=>x.categories.length),[options.categories]);
  const academicYears=useMemo(()=>getTransportCostAcademicYears(records),[records]);

  const registerRows=useMemo(()=>{
    const grouped=new Map();
    records.filter(r=>(!filters.schoolId||String(r.schoolId)===String(filters.schoolId))&&(!filters.academicYear||r.academicYear===filters.academicYear)&&(!filters.scenario||r.scenario===filters.scenario)).forEach(r=>{
      const key=`${r.schoolId}|${r.month}|${r.scenario}`;
      const current=grouped.get(key)||{key,school:r.schoolName,schoolCode:r.school,month:r.month,academicYear:r.academicYear,scenario:r.scenario,tripCosts:0,contractualCosts:0,otherCharges:0,offsets:0,total:0};
      const amount=Number(r.amount||0);
      if(r.costGroup==="trips")current.tripCosts+=amount;else if(r.costGroup==="contractual")current.contractualCosts+=amount;else if(r.costGroup==="offset")current.offsets+=amount;else current.otherCharges+=amount;
      current.total=current.tripCosts+current.contractualCosts+current.otherCharges-current.offsets;
      grouped.set(key,current);
    });
    return [...grouped.values()].sort((a,b)=>String(b.month).localeCompare(String(a.month))||a.school.localeCompare(b.school));
  },[records,filters]);

  async function save(e){
    e.preventDefault();
    try{
      setSaving(true);setMessage("");
      await saveTransportMonthlyCosts(form);
      await load();
      setMessage("Monthly transport costs saved successfully.");
      setForm(c=>({...c,values:{},notes:""}));
    }catch(err){setMessage(err?.message||"Unable to save monthly costs.")}finally{setSaving(false)}
  }

  if(loading)return <div className="records-workspace-loading">Loading Transport cost records…</div>;
  if(error)return <div className="records-workspace-error">{error}</div>;

  return <section className="transport-records-workspace">
    <div className="records-subnav" role="tablist" aria-label="Transport cost records">
      <button className={mode==="entry"?"active":""} onClick={()=>setMode("entry")}>Monthly Entry</button>
      <button className={mode==="register"?"active":""} onClick={()=>setMode("register")}>Register</button>
    </div>

    {mode==="entry"?<form className="transport-register-entry" onSubmit={save}>
      <div className="transport-register-heading"><div><span className="records-section-eyebrow">TRANSPORT COSTS</span><h2>Monthly Cost Entry</h2><p>Maintain the monthly cost register by school and reporting period.</p></div><div className="transport-entry-period-summary"><span>Reporting basis</span><strong>Monthly totals</strong></div></div>
      <div className="transport-register-meta">
        <label><span>School</span><select required value={form.schoolId} onChange={e=>setForm(c=>({...c,schoolId:e.target.value}))}><option value="">Select school</option>{options.schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label><span>Month</span><input required type="month" value={form.month} onChange={e=>setForm(c=>({...c,month:e.target.value}))}/></label>
        <label><span>Scenario</span><select value={form.scenario} onChange={e=>setForm(c=>({...c,scenario:e.target.value}))}>{SCENARIOS.map(x=><option key={x}>{x}</option>)}</select></label>
      </div>
      <div className="transport-register-category-grid">
        {categoriesByGroup.map(section=><fieldset key={section.group}><legend>{GROUP_LABELS[section.group]}</legend>{section.categories.map(cat=><label key={cat.id}><span>{cat.name}</span><div className="transport-register-amount"><span>AED</span><input type="number" step="0.01" value={form.values[cat.id]??""} onChange={e=>setForm(c=>({...c,values:{...c.values,[cat.id]:e.target.value}}))} placeholder="0.00"/></div></label>)}</fieldset>)}
      </div>
      <label className="transport-register-notes"><span>Notes</span><input value={form.notes} onChange={e=>setForm(c=>({...c,notes:e.target.value}))} placeholder="Optional note for this monthly entry"/></label>
      <div className="transport-register-footer">{message&&<span>{message}</span>}<button disabled={saving}>{saving?"Saving…":"Save Monthly Costs"}</button></div>
    </form>:
    <section className="transport-register-card">
      <div className="transport-register-card-header"><div><span className="records-section-eyebrow">REGISTER</span><h2>Transport Cost Records</h2><p>Review the monthly cost register across schools and reporting periods.</p></div><span className="transport-register-count">{registerRows.length} monthly records</span></div>
      <div className="transport-register-filters">
        <label><span>School</span><select value={filters.schoolId} onChange={e=>setFilters(c=>({...c,schoolId:e.target.value}))}><option value="">All Schools</option>{options.schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label><span>Academic Year</span><select value={filters.academicYear} onChange={e=>setFilters(c=>({...c,academicYear:e.target.value}))}><option value="">All Years</option>{academicYears.map(y=><option key={y}>{y}</option>)}</select></label>
        <label><span>Scenario</span><select value={filters.scenario} onChange={e=>setFilters(c=>({...c,scenario:e.target.value}))}>{SCENARIOS.map(x=><option key={x}>{x}</option>)}</select></label>
      </div>
      <div className="transport-register-table-wrap"><table className="transport-register-table"><thead><tr><th>Month</th><th>School</th><th>Academic Year</th><th>Trip Costs</th><th>Contractual</th><th>Other</th><th>Offsets</th><th>Net Cost</th></tr></thead><tbody>{registerRows.length?registerRows.map(row=><tr key={row.key}><td><strong>{monthLabel(row.month)}</strong><span>{row.scenario}</span></td><td>{row.school}</td><td>{row.academicYear}</td><td className="num">{formatCurrency(row.tripCosts)}</td><td className="num">{formatCurrency(row.contractualCosts)}</td><td className="num">{formatCurrency(row.otherCharges)}</td><td className="num">{formatCurrency(row.offsets)}</td><td className="num total">{formatCurrency(row.total)}</td></tr>):<tr><td colSpan="8" className="transport-register-empty">No Transport cost records match the selected filters.</td></tr>}</tbody></table></div>
    </section>}
  </section>;
}
