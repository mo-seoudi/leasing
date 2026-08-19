import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PerformanceComparison from "../../components/comparison/PerformanceComparison";
import { cateringAcademicYears, cateringRecords, cateringSchools, formatCurrency } from "../../lib/cateringData";

const METRICS=[{key:"sales",label:"Sales",source:"Sales"},{key:"commission",label:"Commission",source:"Commission"}];

export default function CateringComparisonPage(){
 const {setHeaderControls}=useOutletContext();
 const [school,setSchool]=useState("");
 const records=useMemo(()=>cateringRecords.filter(record=>(!school||record.school===school)&&record.scenario==="Actual"),[school]);
 useEffect(()=>{setHeaderControls(<div className="header-page-filters"><label className="header-filter-control wide"><span>School</span><select value={school} onChange={e=>setSchool(e.target.value)}><option value="">All Schools</option>{cateringSchools.map(item=><option key={item.code} value={item.code}>{item.name}</option>)}</select></label></div>);return()=>setHeaderControls(null)},[school,setHeaderControls]);
 return <PerformanceComparison records={records} academicYears={cateringAcademicYears} metrics={METRICS} metricKey="metric" formatCurrency={formatCurrency} startMonth={9}/>;
}
