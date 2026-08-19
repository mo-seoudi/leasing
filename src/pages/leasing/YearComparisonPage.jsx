import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PerformanceComparison from "../../components/comparison/PerformanceComparison";
import { academicYears, formatCurrency, getAvailableProgrammes, programmeGroups, records, schools } from "../../lib/dashboardData";

const METRICS=[{key:"revenue",label:"Revenue",source:"Revenue"},{key:"schoolIncome",label:"School Income",source:"School Income"}];

export default function YearComparisonPage(){
 const {setHeaderControls}=useOutletContext();
 const [filters,setFilters]=useState({school:"",programGroup:"",program:""});
 const programmes=useMemo(()=>getAvailableProgrammes(filters.programGroup),[filters.programGroup]);
 const baseRecords=useMemo(()=>records.filter(record=>(!filters.school||record.school===filters.school)&&(!filters.programGroup||record.programGroup===filters.programGroup)&&(!filters.program||record.program===filters.program)),[filters]);
 const comparisonRecords=useMemo(()=>baseRecords.flatMap(record=>{const amount=Number(record.amount||0);if(record.incomeType==="Sales")return [{...record,comparisonMetric:"Revenue",amount}];if(record.incomeType==="Commission")return [{...record,comparisonMetric:"School Income",amount}];if(record.incomeType==="Rental Fees")return [{...record,comparisonMetric:"Revenue",amount},{...record,comparisonMetric:"School Income",amount}];return []}),[baseRecords]);
 function change(name,value){setFilters(current=>({...current,[name]:value,...(name==="programGroup"?{program:""}:{})}))}
 useEffect(()=>{setHeaderControls(<div className="header-page-filters"><label className="header-filter-control wide"><span>School</span><select value={filters.school} onChange={e=>change("school",e.target.value)}><option value="">All Schools</option>{schools.map(item=><option key={item}>{item}</option>)}</select></label><label className="header-filter-control wide"><span>Category</span><select value={filters.programGroup} onChange={e=>change("programGroup",e.target.value)}><option value="">All Leasing</option>{programmeGroups.map(item=><option key={item}>{item}</option>)}</select></label><label className="header-filter-control wide"><span>Programme</span><select value={filters.program} onChange={e=>change("program",e.target.value)}><option value="">All Programmes</option>{programmes.map(item=><option key={item}>{item}</option>)}</select></label></div>);return()=>setHeaderControls(null)},[filters,programmes,setHeaderControls]);
 return <PerformanceComparison records={comparisonRecords} academicYears={academicYears} metrics={METRICS} metricKey="comparisonMetric" formatCurrency={formatCurrency} startMonth={9}/>;
}
