import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PerformanceComparison from "../../components/comparison/PerformanceComparison";
import { fetchUniformRecords, formatCurrency, getUniformAcademicYears, getUniformSchools } from "../../lib/uniformData";

const METRICS=[{key:"sales",label:"Sales",source:"Sales"},{key:"commission",label:"Commission",source:"Commission"}];

export default function UniformComparisonPage(){
 const {setHeaderControls}=useOutletContext();
 const [records,setRecords]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [school,setSchool]=useState(""); const [yearBasis,setYearBasis]=useState("finance");
 useEffect(()=>{let active=true;(async()=>{try{setLoading(true);const data=await fetchUniformRecords();if(active)setRecords(data)}catch(e){if(active)setError(e?.message||"Unable to load Uniform data.")}finally{if(active)setLoading(false)}})();return()=>{active=false}},[]);
 const schools=useMemo(()=>getUniformSchools(records),[records]);
 const basisRecords=useMemo(()=>records.map(record=>{if(yearBasis!=="backToSchool"||Number(String(record.month||"").slice(5,7))!==8)return record;const year=Number(String(record.month).slice(0,4));return {...record,academicYear:`AY${year}-${String((year+1)%100).padStart(2,"0")}`,term:"Term 1"}}),[records,yearBasis]);
 const years=useMemo(()=>getUniformAcademicYears(records,yearBasis),[records,yearBasis]);
 const filtered=useMemo(()=>basisRecords.filter(record=>(!school||record.school===school)&&record.scenario==="Actual"),[basisRecords,school]);
 useEffect(()=>{setHeaderControls(<div className="header-page-filters"><label className="header-filter-control wide"><span>School</span><select value={school} onChange={e=>setSchool(e.target.value)}><option value="">All Schools</option>{schools.map(item=><option key={item.code} value={item.code}>{item.name}</option>)}</select></label></div>);return()=>setHeaderControls(null)},[school,schools,setHeaderControls]);
 if(loading)return <div className="dashboard-loading-state">Loading Uniform data…</div>;
 if(error)return <div className="dashboard-error-state">{error}</div>;
 return <PerformanceComparison records={filtered} academicYears={years} metrics={METRICS} metricKey="metric" formatCurrency={formatCurrency} startMonth={yearBasis==="backToSchool"?8:9} allowYearBasis yearBasis={yearBasis} onYearBasisChange={setYearBasis}/>;
}
