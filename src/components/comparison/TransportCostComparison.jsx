import { useMemo,useState } from "react";
import { Bar,BarChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis } from "recharts";
import { getFinanceTermFromMonth } from "../../lib/financialData";
import "./performanceComparison.css";
import "./fixedRevenueComparison.css";

const MONTH_NAMES=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MODES=[["yoy","Year on Year"],["tot","Term on Term"],["mom","Month on Month"],["ytm","Year to Month"]];
const TERMS=["Term 1","Term 2","Term 3"];
const COST_TYPES=[["total","Total Cost"],["trips","Trip Costs"],["contractual","Contractual Costs"]];
function monthNumber(record){const match=String(record.month||"").match(/^20\d{2}-(\d{1,2})/);return match?Number(match[1]):0}
function growth(current,previous){return Number(previous||0)?((Number(current||0)-Number(previous))/Number(previous))*100:null}
function formatGrowth(value){return value===null||!Number.isFinite(value)?"—":`${value>0?"+":""}${value.toFixed(0)}%`}
function growthClass(value){return value===null||!Number.isFinite(value)||value===0?"neutral":value>0?"negative":"positive"}
function orderedMonths(startMonth){return Array.from({length:12},(_,index)=>((startMonth-1+index)%12)+1)}
function isContractual(row){return row.costGroup==="contractual"}
function costAmount(row,type){const amount=Number(row.amount||0);if(type==="trips")return row.costGroup==="trips"?amount:0;if(type==="contractual")return isContractual(row)?amount:0;if(row.costGroup==="offset")return-amount;return amount}

export default function TransportCostComparison({records=[],formatCurrency,formatCompactCurrency,startMonth=9}){
 const[mode,setMode]=useState("yoy"),[costType,setCostType]=useState("total"),[selectedTerm,setSelectedTerm]=useState("Term 1"),[selectedMonth,setSelectedMonth]=useState(startMonth);
 const years=useMemo(()=>[...new Set(records.map(row=>row.academicYear).filter(Boolean))].sort((a,b)=>a.localeCompare(b)),[records]);
 const monthOrder=useMemo(()=>orderedMonths(startMonth),[startMonth]);
 const costLabel=COST_TYPES.find(([key])=>key===costType)?.[1]||"Total Cost";
 const rows=useMemo(()=>years.map((academicYear,index)=>{const currentYear=records.filter(row=>row.academicYear===academicYear),previousYear=records.filter(row=>row.academicYear===years[index-1]);let current=currentYear,previous=previousYear;if(mode==="tot"){current=currentYear.filter(row=>getFinanceTermFromMonth(String(row.month).slice(0,7))===selectedTerm);previous=previousYear.filter(row=>getFinanceTermFromMonth(String(row.month).slice(0,7))===selectedTerm)}else if(mode==="mom"){current=currentYear.filter(row=>monthNumber(row)===selectedMonth);previous=previousYear.filter(row=>monthNumber(row)===selectedMonth)}else if(mode==="ytm"){const end=monthOrder.indexOf(selectedMonth),allowed=end>=0?monthOrder.slice(0,end+1):monthOrder;current=currentYear.filter(row=>allowed.includes(monthNumber(row)));previous=previousYear.filter(row=>allowed.includes(monthNumber(row)))}const cost=current.reduce((sum,row)=>sum+costAmount(row,costType),0),previousCost=previous.reduce((sum,row)=>sum+costAmount(row,costType),0);return{academicYear,cost,growth:growth(cost,previousCost)}}),[records,years,mode,costType,selectedTerm,selectedMonth,monthOrder]);
 const description=mode==="tot"?`${selectedTerm} ${costLabel.toLowerCase()} across available academic years.`:mode==="mom"?`${MONTH_NAMES[selectedMonth-1]} ${costLabel.toLowerCase()} compared with the same month in each academic year.`:mode==="ytm"?`${MONTH_NAMES[startMonth-1]}–${MONTH_NAMES[selectedMonth-1]} cumulative ${costLabel.toLowerCase()} across available academic years.`:`${costLabel} across available academic years.`;
 const chartTitle=mode==="yoy"?"Academic-Year Comparison":mode==="tot"?`${selectedTerm} Comparison`:mode==="mom"?`${MONTH_NAMES[selectedMonth-1]} Comparison`:"Year-to-Month Comparison";
 return <section className="fixed-revenue-comparison transport-cost-comparison">
  <div className="comparison-mode-bar">{MODES.map(([key,label])=><button key={key} type="button" className={mode===key?"active":""} onClick={()=>setMode(key)}>{label}</button>)}</div>
  <section className="comparison-control-card transport-comparison-controls"><label><span>Cost Type</span><select value={costType} onChange={e=>setCostType(e.target.value)}>{COST_TYPES.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>{mode==="tot"?<label><span>Term</span><select value={selectedTerm} onChange={e=>setSelectedTerm(e.target.value)}>{TERMS.map(term=><option key={term}>{term}</option>)}</select></label>:mode!=="yoy"?<label><span>{mode==="ytm"?"Through Month":"Month"}</span><select value={selectedMonth} onChange={e=>setSelectedMonth(Number(e.target.value))}>{monthOrder.map(month=><option key={month} value={month}>{MONTH_NAMES[month-1]}</option>)}</select></label>:null}</section>
  <div className="kitchen-rental-two-column-grid"><section className="comparison-summary-card kitchen-rental-comparison-table"><div className="comparison-card-heading"><div><h2>Cost Comparison</h2><p>{description}</p></div><span className="comparison-year-count">{rows.length} academic years</span></div><div className="comparison-table-scroll"><table className="comparison-table"><thead><tr><th>Academic Year</th><th>{costLabel}</th><th>Cost Change</th></tr></thead><tbody>{rows.map(row=><tr key={row.academicYear}><th>{row.academicYear}</th><td className="comparison-primary-value">{formatCurrency(row.cost)}</td><td><span className={`comparison-growth-value ${growthClass(row.growth)}`}>{formatGrowth(row.growth)}</span></td></tr>)}</tbody></table></div></section>
  <section className="comparison-chart-card kitchen-rental-comparison-chart"><div className="comparison-card-heading"><div><h2>{chartTitle}</h2><p>{description}</p></div></div><div className="comparison-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} margin={{top:18,right:20,left:42,bottom:8}} barCategoryGap="28%"><CartesianGrid stroke="#edf1f5" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="academicYear" axisLine={false} tickLine={false}/><YAxis width={72} tickMargin={8} axisLine={false} tickLine={false} tickFormatter={formatCompactCurrency}/><Tooltip formatter={value=>[formatCurrency(value),costLabel]}/><Bar dataKey="cost" name={costLabel} fill="#2f80ed" radius={[8,8,2,2]} maxBarSize={58}/></BarChart></ResponsiveContainer></div></section></div>
 </section>
}
