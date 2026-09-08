import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import DashboardCurrencyTooltip from "../../components/dashboard/DashboardCurrencyTooltip";
import KpiCard from "../../components/dashboard/KpiCard";
import MonthlyResultsTable from "../../components/dashboard/MonthlyResultsTable";
import MonthlyTrendChart from "../../components/dashboard/MonthlyTrendChart";
import PerformanceChart from "../../components/dashboard/PerformanceChart";
import "../../components/dashboard/dashboardComponents.css";
import "../catering/CateringDashboardPage.css";
import "./TransportCostCentrePage.css";

import {
  fetchTransportCostOptions,
  fetchTransportCostRecords,
  filterTransportCostRecords,
  formatCompactCurrency,
  formatCurrency,
  getMonthlyTransportCostData,
  getSchoolTransportCostData,
  getTransportCostAcademicYears,
  getTransportCostSchools,
  getTransportCostSummary,
  saveTransportMonthlyCosts,
} from "../../lib/transportCostData";

const GROUP_LABELS={trips:"Trip Costs",contractual:"Contractual Costs",other:"Other Charges",offset:"Subsidies / Credits"};
const GROUP_ORDER=["trips","contractual","other","offset"];

export default function TransportCostCentrePage(){
 const {setHeaderControls}=useOutletContext();
 const [records,setRecords]=useState([]),[options,setOptions]=useState({schools:[],categories:[]});
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 const [filters,setFilters]=useState({academicYear:"",school:"",scenario:"Actual"});
 const [entryOpen,setEntryOpen]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState("");
 const [form,setForm]=useState({schoolId:"",month:"",scenario:"Actual",notes:"",values:{}});

 async function load(){const [nextRecords,nextOptions]=await Promise.all([fetchTransportCostRecords(),fetchTransportCostOptions()]);setRecords(nextRecords);setOptions(nextOptions);const years=getTransportCostAcademicYears(nextRecords);setFilters(c=>({...c,academicYear:c.academicYear||years[years.length-1]||""}))}
 useEffect(()=>{let active=true;(async()=>{try{setLoading(true);setError("");await load()}catch(e){if(active)setError(e?.message||"Unable to load Transport Cost Centre.")}finally{if(active)setLoading(false)}})();return()=>{active=false}},[]);
 const years=useMemo(()=>getTransportCostAcademicYears(records),[records]);
 const schools=useMemo(()=>getTransportCostSchools(records),[records]);
 const filtered=useMemo(()=>filterTransportCostRecords(records,filters),[records,filters]);
 const summary=useMemo(()=>getTransportCostSummary(filtered),[filtered]);
 const monthly=useMemo(()=>getMonthlyTransportCostData(filtered),[filtered]);
 const schoolData=useMemo(()=>getSchoolTransportCostData(filtered),[filtered]);
 const tooltip=<DashboardCurrencyTooltip formatValue={formatCurrency}/>;

 useEffect(()=>{setHeaderControls(<div className="header-page-filters"><label className="header-filter-control"><span>Academic Year</span><select value={filters.academicYear} onChange={e=>setFilters(c=>({...c,academicYear:e.target.value}))}><option value="">All Years</option>{years.map(y=><option key={y}>{y}</option>)}</select></label><label className="header-filter-control wide"><span>School</span><select value={filters.school} onChange={e=>setFilters(c=>({...c,school:e.target.value}))}><option value="">All Schools</option>{schools.map(s=><option key={s.code} value={s.code}>{s.name}</option>)}</select></label><label className="header-filter-control"><span>Scenario</span><select value={filters.scenario} onChange={e=>setFilters(c=>({...c,scenario:e.target.value}))}>{["Actual","Budget","Forecast"].map(x=><option key={x}>{x}</option>)}</select></label></div>);return()=>setHeaderControls(null)},[filters,years,schools,setHeaderControls]);

 const categoriesByGroup=useMemo(()=>GROUP_ORDER.map(group=>({group,categories:options.categories.filter(c=>c.cost_group===group)})).filter(x=>x.categories.length),[options.categories]);
 async function save(e){e.preventDefault();try{setSaving(true);setMessage("");await saveTransportMonthlyCosts(form);await load();setMessage("Monthly transport costs saved.");setForm(c=>({...c,values:{},notes:""}));}catch(err){setMessage(err?.message||"Unable to save costs.")}finally{setSaving(false)}}

 if(loading)return <section className="dashboard-page"><div className="dashboard-loading-state">Loading Transport Cost Centre…</div></section>;
 if(error)return <section className="dashboard-page"><div className="dashboard-error-state">{error}</div></section>;
 const columns=[{key:"academicYear",label:"Academic Year"},{key:"label",label:"Month"},{key:"term",label:"Term"},{key:"tripCosts",label:"Trip Costs",numeric:true,render:formatCurrency},{key:"contractualCosts",label:"Contractual Costs",numeric:true,render:formatCurrency},{key:"otherCharges",label:"Other Charges",numeric:true,render:formatCurrency},{key:"offsets",label:"Subsidies / Credits",numeric:true,render:formatCurrency},{key:"netCost",label:"Net Cost",numeric:true,render:formatCurrency}];
 return <section className="dashboard-page">
  <div className="transport-cost-actions"><button type="button" className="transport-cost-primary" onClick={()=>setEntryOpen(v=>!v)}>{entryOpen?"Close Entry":"Add Monthly Costs"}</button></div>
  {entryOpen&&<form className="transport-cost-entry" onSubmit={save}><div className="transport-cost-entry-heading"><div><h2>Monthly Cost Entry</h2><p>Enter the monthly totals available for each school and category.</p></div></div><div className="transport-cost-entry-meta"><label><span>School</span><select required value={form.schoolId} onChange={e=>setForm(c=>({...c,schoolId:e.target.value}))}><option value="">Select school</option>{options.schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label><span>Month</span><input required type="month" value={form.month} onChange={e=>setForm(c=>({...c,month:e.target.value}))}/></label><label><span>Scenario</span><select value={form.scenario} onChange={e=>setForm(c=>({...c,scenario:e.target.value}))}>{["Actual","Budget","Forecast"].map(x=><option key={x}>{x}</option>)}</select></label></div><div className="transport-cost-category-grid">{categoriesByGroup.map(section=><fieldset key={section.group}><legend>{GROUP_LABELS[section.group]}</legend>{section.categories.map(cat=><label key={cat.id}><span>{cat.name}</span><div className="transport-cost-amount"><span>AED</span><input type="number" step="0.01" value={form.values[cat.id]??""} onChange={e=>setForm(c=>({...c,values:{...c.values,[cat.id]:e.target.value}}))} placeholder="0.00"/></div></label>)}</fieldset>)}</div><label className="transport-cost-notes"><span>Notes</span><input value={form.notes} onChange={e=>setForm(c=>({...c,notes:e.target.value}))} placeholder="Optional note for this monthly entry"/></label><div className="transport-cost-entry-footer">{message&&<span>{message}</span>}<button disabled={saving} className="transport-cost-primary">{saving?"Saving…":"Save Monthly Costs"}</button></div></form>}
  <section className="dashboard-kpi-grid"><KpiCard label="Net Transport Cost" value={formatCurrency(summary.netCost)} detail={`${summary.schools} schools · ${summary.months} months`}/><KpiCard label="Trip Costs" value={formatCurrency(summary.tripCosts)} detail="Day, sports, boarding and other trips"/><KpiCard label="Contractual Costs" value={formatCurrency(summary.contractualCosts)} detail="Contract and utilisation charges"/><KpiCard label="Other Charges" value={formatCurrency(summary.otherCharges)} detail={`Before ${formatCurrency(summary.offsets)} subsidies / credits`}/></section>
  <section className="dashboard-two-column-grid"><PerformanceChart title="Cost by School" description="Transport cost composition by school." data={schoolData} categoryKey="school" metrics={[{key:"tripCosts",label:"Trip Costs",tone:"primary"},{key:"contractualCosts",label:"Contractual Costs",tone:"secondary"},{key:"otherCharges",label:"Other Charges",tone:"tertiary"}]} formatAxis={formatCompactCurrency} formatValue={formatCurrency} tooltipContent={tooltip}/><PerformanceChart title="School Net Cost" description="Net transport cost after subsidies and credits." data={schoolData} categoryKey="school" metrics={[{key:"netCost",label:"Net Cost",tone:"primary"}]} defaultMetric="Net Cost" formatAxis={formatCompactCurrency} formatValue={formatCurrency} tooltipContent={tooltip}/></section>
  <MonthlyTrendChart data={monthly} metrics={[{key:"netCost",label:"Net Cost",tone:"primary"},{key:"tripCosts",label:"Trip Costs",tone:"secondary"},{key:"contractualCosts",label:"Contractual Costs",tone:"tertiary"}]} defaultMetric="Net Cost" formatAxis={formatCompactCurrency} tooltipContent={tooltip} className="dashboard-wide-card"/>
  <MonthlyResultsTable data={monthly} columns={columns} totals={{tripCosts:formatCurrency(summary.tripCosts),contractualCosts:formatCurrency(summary.contractualCosts),otherCharges:formatCurrency(summary.otherCharges),offsets:formatCurrency(summary.offsets),netCost:formatCurrency(summary.netCost)}} emptyMessage="No Transport cost records match the selected filters." resetKey={`${filters.academicYear}|${filters.school}|${filters.scenario}`}/>
 </section>;
}
