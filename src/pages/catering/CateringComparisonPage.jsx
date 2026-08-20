import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PerformanceComparison from "../../components/comparison/PerformanceComparison";
import { fetchCateringRecords, formatCurrency, getCateringAcademicYears, getCateringSchools } from "../../lib/cateringData";

const METRICS=[{key:"sales",label:"Sales",source:"Sales"},{key:"commission",label:"Commission",source:"Commission"}];

export default function CateringComparisonPage(){
 const {setHeaderControls}=useOutletContext();
 const [allRecords,setAllRecords]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(""); const [school,setSchool]=useState("");
 useEffect(()=>{let active=true;(async()=>{try{setLoading(true);setError("");const data=await fetchCateringRecords();if(active)setAllRecords(data)}catch(e){if(active)setError(e?.message||"Unable to load Catering data.")}finally{if(active)setLoading(false)}})();return()=>{active=false}},[]);
 const schools=useMemo(()=>getCateringSchools(allRecords),[allRecords]);
 const academicYears=useMemo(()=>getCateringAcademicYears(allRecords),[allRecords]);
 const records=useMemo(()=>allRecords.filter(record=>(!school||record.school===school)&&record.scenario==="Actual"),[allRecords,school]);
 useEffect(()=>{setHeaderControls(<div className="header-page-filters"><label className="header-filter-control wide"><span>School</span><select value={school} onChange={e=>setSchool(e.target.value)}><option value="">All Schools</option>{schools.map(item=><option key={item.code} value={item.code}>{item.name}</option>)}</select></label></div>);return()=>setHeaderControls(null)},[school,schools,setHeaderControls]);
 if(loading)return <div className="dashboard-loading-state">Loading Catering data…</div>;
 if(error)return <div className="dashboard-error-state">{error}</div>;
 return <PerformanceComparison records={records} academicYears={academicYears} metrics={METRICS} metricKey="metric" formatCurrency={formatCurrency} startMonth={9}/>;
}
