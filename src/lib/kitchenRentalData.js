import { supabase } from "./supabase";

const STREAM_CODE = "kitchen_rental";
const MONTH_ORDER = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const MONTH_ALIASES = { sep:"Sep",september:"Sep",oct:"Oct",october:"Oct",nov:"Nov",november:"Nov",dec:"Dec",december:"Dec",jan:"Jan",january:"Jan",feb:"Feb",february:"Feb",mar:"Mar",march:"Mar",apr:"Apr",april:"Apr",may:"May",jun:"Jun",june:"Jun",jul:"Jul",july:"Jul",aug:"Aug",august:"Aug" };
const MONTH_NUMBER_TO_LABEL = {1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"};

function normalizeMonth(value){const raw=String(value||"").trim();const match=raw.match(/^20\d{2}-(\d{1,2})/);if(match)return MONTH_NUMBER_TO_LABEL[Number(match[1])]||"";const text=raw.toLowerCase();return MONTH_ALIASES[text]||MONTH_ALIASES[text.slice(0,3)]||raw.slice(0,3)}
function termForMonth(month){if(["Sep","Oct","Nov","Dec"].includes(month))return"Term 1";if(["Jan","Feb","Mar"].includes(month))return"Term 2";return"Term 3"}
function academicYearDates(academicYear){const match=String(academicYear||"").match(/^AY(\d{4})-/);if(!match)return null;const startYear=Number(match[1]);return{start:`${startYear}-09-01`,end:`${startYear+1}-08-31`}}
function contractApplies(term,academicYear){const dates=academicYearDates(academicYear);if(!dates)return false;return(!term.start_date||term.start_date<=dates.end)&&(!term.expiry_date||term.expiry_date>=dates.start)}
function applicableContracts(terms,schoolCode,academicYear){return terms.filter(term=>term.school_code===schoolCode&&contractApplies(term,academicYear)).map(term=>({contractId:term.contract_id,supplierName:term.supplier_name||"—",startDate:term.start_date||"",expiryDate:term.expiry_date||"",annualAmount:Number(term.fixed_amount||0),commercialModel:term.commercial_model||""}))}

export async function fetchKitchenRentalRecords(){
 const [{data,error},{data:contractTerms,error:contractError}]=await Promise.all([
  supabase.from("financial_records").select(`id,academic_year,month,scenario,amount,school:schools(code,name),stream:revenue_streams!inner(code,name),metric:revenue_metrics(code,name)`).eq("stream.code",STREAM_CODE).eq("scenario","Actual").eq("is_deleted",false).order("academic_year",{ascending:true}),
  supabase.from("supplier_contract_school_terms").select("contract_id, supplier_name, revenue_stream_code, start_date, expiry_date, school_code, school_name, fixed_amount, commercial_model").eq("revenue_stream_code",STREAM_CODE)
 ]);
 if(error)throw error;if(contractError)throw contractError;
 const terms=contractTerms||[],years=new Map();
 (data||[]).forEach(row=>{
  const schoolCode=row.school?.code||"",key=`${row.academic_year}|${schoolCode}`;
  if(!years.has(key))years.set(key,{academicYear:row.academic_year||"",school:row.school?.name||schoolCode,schoolCode,contracts:applicableContracts(terms,schoolCode,row.academic_year),vatRate:0,months:[]});
  const item=years.get(key),metric=String(row.metric?.code||"").toLowerCase(),amount=Number(row.amount||0);
  if(metric==="rental_fees"){const month=normalizeMonth(row.month);item.months.push({id:row.id,academicYear:row.academic_year||"",month,label:month,term:termForMonth(month),revenue:amount})}
  if(metric==="vat_rate")item.vatRate=amount;
 });
 return [...years.values()].map(item=>({...item,months:item.months.sort((a,b)=>MONTH_ORDER.indexOf(a.month)-MONTH_ORDER.indexOf(b.month))})).sort((a,b)=>a.academicYear.localeCompare(b.academicYear)||a.schoolCode.localeCompare(b.schoolCode));
}
