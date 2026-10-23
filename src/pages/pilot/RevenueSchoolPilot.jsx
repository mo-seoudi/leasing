import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCommercialOverviewRecords } from "../../lib/commercialOverviewData";
import { fetchDataEntryOptions } from "../../lib/financialData";
import "./RevenueSchoolPilot.css";

const money = value => new Intl.NumberFormat("en-AE",{maximumFractionDigits:0}).format(value || 0);
const monthLabels=["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];
const isRevenue = code => ["sales","revenue","rental_fees","rental-fees","enrich_me_revenue"].includes(String(code).toLowerCase());
const isCommission = code => ["commission","commission_income","commission_fees"].includes(String(code).toLowerCase());
export default function RevenueSchoolPilot(){
 const [data,setData]=useState({schools:[],streams:[],records:[]});
 const [school,setSchool]=useState(""),[stream,setStream]=useState("transport"),[year,setYear]=useState(""),[students,setStudents]=useState("");
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let alive=true;Promise.all([fetchDataEntryOptions(),fetchCommercialOverviewRecords()]).then(([options,records])=>{if(!alive)return;setData({schools:options.schools,streams:options.revenueStreams,records});setSchool(options.schools.find(s=>s.code==="RDXB")?.code||options.schools[0]?.code||"");setStream(options.revenueStreams.find(s=>s.code==="transport")?.code||options.revenueStreams[0]?.code||"");setYear([...new Set(records.map(r=>r.academicYear).filter(Boolean))].sort().reverse()[0]||"")}).catch(e=>alive&&setError(e.message||"Unable to load records")).finally(()=>alive&&setLoading(false));return()=>{alive=false}},[]);
 const years=useMemo(()=>[...new Set(data.records.map(r=>r.academicYear).filter(Boolean))].sort().reverse(),[data.records]);
 const selected=useMemo(()=>data.records.filter(r=>r.schoolCode===school&&r.streamCode===stream&&r.academicYear===year&&r.scenario==="Actual"),[data.records,school,stream,year]);
 const startYear=Number(year.match(/\d{4}/)?.[0])||new Date().getFullYear();
 const months=useMemo(()=>monthLabels.map((label,index)=>{const month=index<4?index+9:index-3;const y=index<4?startYear:startYear+1;const key=y+"-"+String(month).padStart(2,"0");const records=selected.filter(r=>String(r.month).slice(0,7)===key);return {label,key,revenue:records.filter(r=>isRevenue(r.metricCode)).reduce((a,r)=>a+r.amount,0),commission:records.filter(r=>isCommission(r.metricCode)).reduce((a,r)=>a+r.amount,0)}}),[selected,startYear]);
 const totals=months.reduce((a,r)=>({revenue:a.revenue+r.revenue,commission:a.commission+r.commission}),{revenue:0,commission:0});
 const count=students===""?null:Number(students);
 const avg=(n)=>count>0?money(n/count):"—";
 const selectedSchool=data.schools.find(s=>s.code===school)?.name||"School";
 const selectedStream=data.streams.find(s=>s.code===stream)?.name||"Revenue stream";
 const revenueFound=selected.some(r=>isRevenue(r.metricCode)),commissionFound=selected.some(r=>isCommission(r.metricCode));
 return <div className="rsp">
  <div className="rsp-top"><div><span className="rsp-kicker">V2 COMPONENT LAB / 01</span><h1>School revenue performance</h1><p>One school. One revenue stream. A complete academic-year view.</p></div><Link to="/v2-pilot">← Pilot workspace</Link></div>
  <section className="rsp-filters"><div className="rsp-filter-heading"><span>VIEW CONTROLS</span><strong>Choose your reporting context</strong></div><div className="rsp-filter-grid"><label>School<select value={school} onChange={e=>{setSchool(e.target.value);setStudents("")}}>{data.schools.map(s=><option value={s.code} key={s.id}>{s.name}</option>)}</select></label><label>Revenue stream<select value={stream} onChange={e=>setStream(e.target.value)}>{data.streams.map(s=><option value={s.code} key={s.id}>{s.name}</option>)}</select></label><label>Academic year<select value={year} onChange={e=>setYear(e.target.value)}>{years.map(y=><option key={y} value={y}>{y}</option>)}</select></label></div><div className="rsp-active"><span>ACTUALS</span><strong>{selectedSchool}</strong><span>›</span><strong>{selectedStream}</strong><span>›</span><strong>{year}</strong></div></section>
  {loading&&<p>Loading Supabase reporting data…</p>}{error&&<p role="alert">{error}</p>}
  {!loading&&!error&&<><section className="rsp-metrics"><article><span>Annual revenue</span><strong>AED {money(totals.revenue)}</strong><small>Sum of September–August</small></article><article><span>Annual commission</span><strong>AED {money(totals.commission)}</strong><small>Sum of September–August</small></article><article className="rsp-students"><span>Students using this service</span><input type="number" min="0" step="1" placeholder="Enter count" value={students} onChange={e=>setStudents(e.target.value)} aria-label="Students using this service"/><small>Trial input only · not saved</small></article><article><span>Revenue / student</span><strong>{count>0?"AED "+avg(totals.revenue):"—"}</strong><small>Annual revenue ÷ students</small></article><article><span>Commission / student</span><strong>{count>0?"AED "+avg(totals.commission):"—"}</strong><small>Annual commission ÷ students</small></article></section>
  <section className="rsp-table-panel"><div className="rsp-table-heading"><div><span className="rsp-kicker">ACADEMIC YEAR REPORT</span><h2>Monthly financial breakdown</h2><p>{selectedSchool} · {selectedStream} · {year} · Actual</p></div><span className="rsp-unit">Amounts in AED</span></div><div className="rsp-scroll"><table><thead><tr><th>Reporting month</th><th>Revenue</th><th>Commission</th><th>Students</th><th>Revenue / student</th><th>Commission / student</th></tr></thead><tbody>{months.map(m=><tr key={m.key}><td><strong>{m.label}</strong> <small>{m.key.slice(0,4)}</small></td><td>{money(m.revenue)}</td><td>{money(m.commission)}</td><td className="rsp-muted">—</td><td className="rsp-muted">—</td><td className="rsp-muted">—</td></tr>)}</tbody><tfoot><tr><td>Academic year total</td><td>{money(totals.revenue)}</td><td>{money(totals.commission)}</td><td>{count===null?"—":money(count)}</td><td>{avg(totals.revenue)}</td><td>{avg(totals.commission)}</td></tr></tfoot></table></div><div className="rsp-footnote">Monthly student counts are not yet available in this prototype. The annual student figure is entered above and is used only for annual per-student calculations; it is not multiplied across months.</div></section>
  {(!revenueFound||!commissionFound)&&<p className="rsp-caution">Some financial metrics are not present for this selection: {!revenueFound?"revenue ":""}{!commissionFound?"commission":""}. Zeros in the table may indicate missing records rather than confirmed zero activity.</p>}
  </>}
 </div>;
}
