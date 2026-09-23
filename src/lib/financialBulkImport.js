import * as XLSX from "xlsx";
import { supabase } from "./supabase";
import { getAcademicYearFromMonth, getFinanceTermFromMonth } from "./financialData";

export const BULK_IMPORT_COLUMNS=["School","Revenue Stream","Programme","Month","Scenario","Metric","Amount"];
const clean=v=>String(v??"").trim();
const key=v=>clean(v).toLowerCase();
const monthValue=v=>{if(v instanceof Date&&!Number.isNaN(v.valueOf()))return `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,"0")}`;const s=clean(v);if(/^\d{4}-\d{2}$/.test(s))return s;if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,7);return""};

export function downloadFinancialImportTemplate(){
 const rows=[BULK_IMPORT_COLUMNS,["RDXB","Catering","","2026-09","Actual","Sales",""]];
 const ws=XLSX.utils.aoa_to_sheet(rows);ws["!cols"]=[{wch:16},{wch:22},{wch:28},{wch:14},{wch:14},{wch:24},{wch:16}];
 const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Financial Records");
 XLSX.writeFile(wb,"financial-records-import-template.xlsx");
}

export async function readFinancialImportFile(file){
 const buffer=await file.arrayBuffer();const wb=XLSX.read(buffer,{type:"array",cellDates:true});const ws=wb.Sheets[wb.SheetNames[0]];
 if(!ws)throw new Error("The workbook does not contain a worksheet.");
 const rows=XLSX.utils.sheet_to_json(ws,{defval:"",raw:true});if(!rows.length)throw new Error("The import file does not contain any data rows.");
 return rows;
}

export function validateFinancialImportRows(rawRows,options){
 const schools=new Map(options.schools.flatMap(s=>[[key(s.code),s],[key(s.name),s],[key(s.short_name),s]].filter(([k])=>k)));
 const streams=new Map(options.revenueStreams.flatMap(s=>[[key(s.code),s],[key(s.name),s]]));
 const programmes=new Map(options.programmes.flatMap(p=>[[key(p.name),p]]));
 const metricsByStream=new Map();options.metrics.forEach(m=>{const sid=String(m.revenue_stream_id);if(!metricsByStream.has(sid))metricsByStream.set(sid,new Map());const map=metricsByStream.get(sid);map.set(key(m.code),m);map.set(key(m.name),m)});
 return rawRows.map((r,index)=>{
  const errors=[];const school=schools.get(key(r["School"]));const stream=streams.get(key(r["Revenue Stream"]));const month=monthValue(r["Month"]);const scenario=clean(r["Scenario"]||"Actual");const amount=Number(r["Amount"]);let programme=null,metric=null;
  if(!school)errors.push("School not recognised");if(!stream)errors.push("Revenue stream not recognised");if(!month)errors.push("Month must use YYYY-MM");if(!["Actual","Budget","Forecast"].includes(scenario))errors.push("Scenario must be Actual, Budget or Forecast");if(clean(r["Amount"])===""||!Number.isFinite(amount))errors.push("Amount must be a number");
  if(stream){metric=metricsByStream.get(String(stream.id))?.get(key(r["Metric"]));if(!metric)errors.push("Metric is not valid for this revenue stream");if(stream.code==="leasing"){programme=programmes.get(key(r["Programme"]));if(!programme)errors.push("Programme is required for Leasing")}}
  return{rowNumber:index+2,school,stream,programme,metric,month,scenario,amount,errors,status:errors.length?"invalid":"ready"};
 });
}

export async function checkFinancialImportConflicts(rows){
 const valid=rows.filter(r=>!r.errors.length);if(!valid.length)return rows;
 const months=[...new Set(valid.map(r=>`${r.month}-01`))];
 const {data,error}=await supabase.from("financial_records").select("id, school_id, revenue_stream_id, metric_id, programme_id, month, scenario, is_deleted").in("month",months).eq("is_deleted",false);
 if(error)throw error;
 const existing=new Set((data||[]).map(r=>[r.school_id,r.revenue_stream_id,r.metric_id,r.programme_id||"",String(r.month).slice(0,10),r.scenario].join("|")));
 return rows.map(r=>{if(r.errors.length)return r;const k=[r.school.id,r.stream.id,r.metric.id,r.programme?.id||"",`${r.month}-01`,r.scenario].join("|");return existing.has(k)?{...r,status:"existing"}:r});
}

async function userId(){const{data:{user},error}=await supabase.auth.getUser();if(error)throw error;if(!user?.id)throw new Error("You must be signed in to import financial records.");return user.id}
export async function importFinancialRows(rows,{overwriteExisting=false}={}){
 const uid=await userId();const candidates=rows.filter(r=>!r.errors.length&&(overwriteExisting||r.status!=="existing"));let inserted=0,updated=0,skipped=rows.filter(r=>r.status==="existing"&&!overwriteExisting).length;
 for(const r of candidates){const payload={school_id:r.school.id,revenue_stream_id:r.stream.id,metric_id:r.metric.id,programme_id:r.programme?.id||null,provider_id:null,academic_year:getAcademicYearFromMonth(r.month),month:`${r.month}-01`,term:getFinanceTermFromMonth(r.month),scenario:r.scenario,amount:r.amount,is_deleted:false,updated_by:uid};
  if(r.status==="existing"&&overwriteExisting){let q=supabase.from("financial_records").update(payload).eq("school_id",r.school.id).eq("revenue_stream_id",r.stream.id).eq("metric_id",r.metric.id).eq("month",`${r.month}-01`).eq("scenario",r.scenario).eq("is_deleted",false);q=r.programme?.id?q.eq("programme_id",r.programme.id):q.is("programme_id",null);const{error}=await q;if(error)throw error;updated++}else{const{error}=await supabase.from("financial_records").insert({...payload,created_by:uid,deleted_by:null,deleted_at:null});if(error)throw error;inserted++}
 }
 return{inserted,updated,skipped,invalid:rows.filter(r=>r.errors.length).length};
}
