import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "./performanceComparison.css";
import "./fixedRevenueComparison.css";

const MONTH_NAMES=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MODES=[["yoy","Year on Year"],["tot","Term on Term"],["mom","Month on Month"],["ytm","Year to Month"]];
const TERMS=["Term 1","Term 2","Term 3"];
function monthNumber(record){const match=String(record.month||"").match(/^20\d{2}-(\d{1,2})/);return match?Number(match[1]):0}
function growth(current,previous){return Number(previous||0)?((Number(current||0)-Number(previous))/Number(previous))*100:null}
function formatGrowth(value){return value===null||!Number.isFinite(value)?"—":`${value>0?"+":""}${value.toFixed(0)}%`}
function growthClass(value){return value===null||!Number.isFinite(value)||value===0?"neutral":value>0?"positive":"negative"}
function orderedMonths(startMonth){return Array.from({length:12},(_,index)=>((startMonth-1+index)%12)+1)}

export default function FixedRevenueComparison({records=[],formatCurrency,formatCompactCurrency,revenueLabel="Revenue",startMonth=9}){
 const[mode,setMode]=useState("yoy"),[selectedTerm,setSelectedTerm]=useState("Term 1"),[selectedMonth,setSelectedMonth]=useState(()=>new Date().getMonth()+1);
 const years=useMemo(()=>[...new Set(records.map(row=>row.academicYear).filter(Boolean))].sort((a,b)=>a.localeCompare(b)),[records]);
 const monthOrder=useMemo(()=>orderedMonths(startMonth),[startMonth]);
 const rows=useMemo(()=>years.map((academicYear,index)=>{const currentYear=records.filter(row=>row.academicYear===academicYear),previousYear=records.filter(row=>row.academicYear===years[index-1]);let current=currentYear,previous=previousYear;if(mode==="tot"){current=currentYear.filter(row=>row.term===selectedTerm);previous=previousYear.filter(row=>row.term===selectedTerm)}else if(mode==="mom"){current=currentYear.filter(row=>monthNumber(row)===selectedMonth);previous=previousYear.filter(row=>monthNumber(row)===selectedMonth)}else if(mode==="ytm"){const end=monthOrder.indexOf(selectedMonth),allowed=end>=0?monthOrder.slice(0,end+1):monthOrder;current=currentYear.filter(row=>allowed.includes(monthNumber(row)));previous=previousYear.filter(row=>allowed.includes(monthNumber(row)))}const revenue=current.reduce((sum,row)=>sum+Number(row.revenue||0),0),previousRevenue=previous.reduce((sum,row)=>sum+Number(row.revenue||0),0);return{academicYear,revenue,growth:growth(revenue,previousRevenue)}}),[records,years,mode,selectedTerm,selectedMonth,monthOrder]);
 const description=mode==="tot"?`${selectedTerm} revenue across available academic years.`:mode==="mom"?`${MONTH_NAMES[selectedMonth-1]} revenue compared with the same month in each academic year.`:mode==="ytm"?`${MONTH_NAMES[startMonth-1]}–${MONTH_NAMES[selectedMonth-1]} cumulative revenue across available academic years.`:"Revenue performance across available academic years.";
 const chartTitle=mode==="yoy"?"Academic-Year Comparison":mode==="tot"?`${selectedTerm} Comparison`:mode==="mom"?`${MONTH_NAMES[selectedMonth-1]} Comparison`:"Year-to-Month Comparison";
 return <section className="fixed-revenue-comparison">
  <div className="comparison-mode-bar">{MODES.map(([key,label])=><button key={key} type="button" className={mode===key?"active":""} onClick={()=>setMode(key)}>{label}</button>)}</div>
  {(mode!=="yoy")&&<section className="comparison-control-card">{mode==="tot"?<label><span>Term</span><select value={selectedTerm} onChange={e=>setSelectedTerm(e.target.value)}>{TERMS.map(term=><option key={term}>{term}</option>)}</select></label>:<label><span>{mode==="ytm"?"Through Month":"Month"}</span><select value={selectedMonth} onChange={e=>setSelectedMonth(Number(e.target.value))}>{monthOrder.map(month=><option key={month} value={month}>{MONTH_NAMES[month-1]}</option>)}</select></label>}</section>}
  <div className="kitchen-rental-two-column-grid"><section className="comparison-summary-card kitchen-rental-comparison-table"><div className="comparison-card-heading"><div><h2>Revenue Comparison</h2><p>{description}</p></div><span className="comparison-year-count">{rows.length} academic years</span></div><div className="comparison-table-scroll"><table className="comparison-table"><thead><tr><th>Academic Year</th><th>{revenueLabel}</th><th>Revenue Growth</th></tr></thead><tbody>{rows.map(row=><tr key={row.academicYear}><th>{row.academicYear}</th><td className="comparison-primary-value">{formatCurrency(row.revenue)}</td><td><span className={`comparison-growth-value ${growthClass(row.growth)}`}>{formatGrowth(row.growth)}</span></td></tr>)}</tbody></table></div></section>
  <section className="comparison-chart-card kitchen-rental-comparison-chart"><div className="comparison-card-heading"><div><h2>{chartTitle}</h2><p>{description}</p></div></div><div className="comparison-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} margin={{top:18,right:20,left:10,bottom:8}} barCategoryGap="28%"><CartesianGrid stroke="#edf1f5" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="academicYear" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency}/><Tooltip formatter={value=>[formatCurrency(value),revenueLabel]}/><Bar dataKey="revenue" name={revenueLabel} fill="#2f80ed" radius={[8,8,2,2]} maxBarSize={58}/></BarChart></ResponsiveContainer></div></section></div>
 </section>
}
