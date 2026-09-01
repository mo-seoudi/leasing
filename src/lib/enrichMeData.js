import { supabase } from "./supabase";

const STREAM_CODE = "enrich_me";
const MONTH_ORDER = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const MONTH_ALIASES = { sep:"Sep",september:"Sep",oct:"Oct",october:"Oct",nov:"Nov",november:"Nov",dec:"Dec",december:"Dec",jan:"Jan",january:"Jan",feb:"Feb",february:"Feb",mar:"Mar",march:"Mar",apr:"Apr",april:"Apr",may:"May",jun:"Jun",june:"Jun",jul:"Jul",july:"Jul",aug:"Aug",august:"Aug" };
const MONTH_NUMBER_TO_LABEL = {1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"};
function normalizeMonth(value){const raw=String(value||"").trim();const match=raw.match(/^20\d{2}-(\d{1,2})/);if(match)return MONTH_NUMBER_TO_LABEL[Number(match[1])]||"";const text=raw.toLowerCase();return MONTH_ALIASES[text]||MONTH_ALIASES[text.slice(0,3)]||raw.slice(0,3)}
function termForMonth(month){if(["Sep","Oct","Nov","Dec"].includes(month))return"Term 1";if(["Jan","Feb","Mar"].includes(month))return"Term 2";return"Term 3"}
export async function fetchEnrichMeRecords(){
 const {data,error}=await supabase.from("financial_records").select(`id,academic_year,month,scenario,amount,school:schools(code,name),stream:revenue_streams!inner(code,name),metric:revenue_metrics(code,name)`).eq("stream.code",STREAM_CODE).eq("scenario","Actual").eq("is_deleted",false).order("academic_year",{ascending:true});
 if(error)throw error;
 const years=new Map();
 (data||[]).forEach(row=>{const key=`${row.academic_year}|${row.school?.code||""}`;if(!years.has(key))years.set(key,{academicYear:row.academic_year||"",school:row.school?.name||row.school?.code||"",schoolCode:row.school?.code||"",annualRevenue:0,months:[]});const item=years.get(key);const metric=String(row.metric?.code||"").toLowerCase();if(metric!=="revenue"&&metric!=="enrich_me_revenue")return;const amount=Number(row.amount||0),month=normalizeMonth(row.month);item.annualRevenue+=amount;item.months.push({id:row.id,academicYear:row.academic_year||"",month,label:month,term:termForMonth(month),revenue:amount})});
 return [...years.values()].map(item=>({...item,months:item.months.sort((a,b)=>MONTH_ORDER.indexOf(a.month)-MONTH_ORDER.indexOf(b.month))})).sort((a,b)=>a.academicYear.localeCompare(b.academicYear)||a.schoolCode.localeCompare(b.schoolCode));
}
