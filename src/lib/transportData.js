import { supabase } from "./supabase";

const MONTH_ORDER = [9,10,11,12,1,2,3,4,5,6,7,8];
const unique = (values) => [...new Set(values.filter(Boolean))];
function getTermOrder(term){if(term==="Term 1")return 1;if(term==="Term 2")return 2;if(term==="Term 3")return 3;return 0}

export async function fetchTransportRecords(){
 const {data:stream,error:streamError}=await supabase.from("revenue_streams").select("id").eq("code","transport").maybeSingle();
 if(streamError)throw streamError;if(!stream?.id)return[];
 const {data,error}=await supabase.from("financial_records").select(`id, academic_year, month, term, scenario, amount, school:schools(code, name), metric:revenue_metrics(code, name)`).eq("revenue_stream_id",stream.id).eq("is_deleted",false).order("month",{ascending:true});
 if(error)throw error;
 return(data||[]).map(row=>{const metricCode=String(row.metric?.code||"").toLowerCase();return{id:row.id,school:row.school?.code||"",schoolName:row.school?.name||row.school?.code||"",revenueStream:"Transport",metric:metricCode==="sales"||metricCode==="transport_fees"?"Transport Fees":row.metric?.name||row.metric?.code||"",metricCode,scenario:row.scenario||"Actual",month:row.month,academicYear:row.academic_year,term:row.term||"",termOrder:getTermOrder(row.term),amount:Number(row.amount||0)}});
}
export function getTransportAcademicYears(records=[]){return unique(records.map(r=>r.academicYear)).sort((a,b)=>a.localeCompare(b))}
export function getTransportSchools(records=[]){const schools=new Map();records.forEach(r=>{if(r.school&&!schools.has(r.school))schools.set(r.school,{code:r.school,name:r.schoolName||r.school})});return[...schools.values()].sort((a,b)=>a.name.localeCompare(b.name))}
export function formatCurrency(value){return new Intl.NumberFormat("en-AE",{style:"currency",currency:"AED",maximumFractionDigits:0}).format(Number(value||0))}
export function formatCompactCurrency(value){return new Intl.NumberFormat("en-AE",{style:"currency",currency:"AED",notation:"compact",maximumFractionDigits:1}).format(Number(value||0))}
export function formatPercentage(value,digits=1){return Number.isFinite(value)?`${value.toFixed(digits)}%`:"—"}
export function filterTransportRecords(records=[],{academicYear="",school="",term="",scenario="Actual"}={}){return records.filter(r=>(!academicYear||r.academicYear===academicYear)&&(!school||r.school===school)&&(!term||r.term===term)&&(!scenario||r.scenario===scenario))}
function isFees(r){return r.metricCode==="sales"||r.metricCode==="transport_fees"||r.metric==="Transport Fees"}
function isCommission(r){return r.metricCode==="commission"||r.metric==="Commission"}
function add(grouped,key,base,r){const current=grouped.get(key)||base;if(isFees(r))current.sales+=Number(r.amount||0);if(isCommission(r))current.commission+=Number(r.amount||0);grouped.set(key,current)}
export function getMonthlyTransportData(records=[]){const grouped=new Map();records.forEach(r=>{const key=`${r.academicYear}|${r.month}`;add(grouped,key,{key,academicYear:r.academicYear,month:r.month,term:r.term,sales:0,commission:0},r)});return[...grouped.values()].map(item=>({...item,transportFees:item.sales,commissionRate:item.sales?(item.commission/item.sales)*100:0,label:new Intl.DateTimeFormat("en-GB",{month:"short",year:"2-digit"}).format(new Date(`${item.month}T00:00:00`)),monthNumber:Number(item.month.slice(5,7)),yearNumber:Number(item.month.slice(0,4))})).sort((a,b)=>{const ay=a.academicYear.localeCompare(b.academicYear);return ay!==0?ay:MONTH_ORDER.indexOf(a.monthNumber)-MONTH_ORDER.indexOf(b.monthNumber)})}
export function getSchoolTransportData(records=[]){const grouped=new Map();records.forEach(r=>add(grouped,r.school,{school:r.school,schoolName:r.schoolName,sales:0,commission:0},r));return[...grouped.values()].map(item=>({...item,transportFees:item.sales,commissionRate:item.sales?(item.commission/item.sales)*100:0})).sort((a,b)=>b.sales-a.sales)}
export function getTermTransportData(records=[]){const grouped=new Map();records.forEach(r=>add(grouped,r.term,{term:r.term,termOrder:r.termOrder,sales:0,commission:0},r));return[...grouped.values()].map(item=>({...item,transportFees:item.sales,commissionRate:item.sales?(item.commission/item.sales)*100:0})).sort((a,b)=>a.termOrder-b.termOrder)}
export function getTransportSummary(records=[]){let transportFees=0,commission=0;records.forEach(r=>{if(isFees(r))transportFees+=Number(r.amount||0);if(isCommission(r))commission+=Number(r.amount||0)});const months=unique(records.map(r=>r.month)).length,schools=unique(records.map(r=>r.school)).length;return{transportFees,sales:transportFees,commission,commissionRate:transportFees?(commission/transportFees)*100:0,averageMonthlyFees:months?transportFees/months:0,averageMonthlyCommission:months?commission/months:0,months,schools}}
