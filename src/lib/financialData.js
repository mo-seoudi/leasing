import { supabase } from "./supabase";

const FINANCIAL_RECORDS_PAGE_SIZE = 1000;

function friendlyFinancialError(error, fallback = "Unable to save the financial records.") {
  const message = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "");
  if (code === "23505" || message.includes("duplicate key") || message.includes("unique constraint") || message.includes("financial_records_unique_entry_idx")) {
    const friendly = new Error("This reporting period already contains financial data. Open the existing record from Find Records to review or edit it.");
    friendly.code = "FINANCIAL_PERIOD_EXISTS";
    return friendly;
  }
  if (code === "23503" || message.includes("foreign key")) return new Error("One of the selected items is no longer available. Refresh the page and try again.");
  if (code === "42501" || message.includes("row-level security") || message.includes("permission denied")) return new Error("You do not have permission to make this change.");
  if (message.includes("network") || message.includes("fetch")) return new Error("The record could not be saved because the connection was interrupted. Please try again.");
  return new Error(fallback);
}

export async function fetchDataEntryOptions() {
  const [schoolsResult, streamsResult, metricsResult, programmesResult, providersResult] = await Promise.all([
    supabase.from("schools").select("id, code, name, short_name").eq("is_active", true).order("name"),
    supabase.from("revenue_streams").select("id, code, name").eq("is_active", true).order("name"),
    supabase.from("revenue_metrics").select("id, revenue_stream_id, code, name, display_order").eq("is_active", true).order("display_order"),
    supabase.from("programmes").select("id, name, category, provider_name").order("name"),
    supabase.from("providers").select("id, name").order("name"),
  ]);
  if (schoolsResult.error) throw schoolsResult.error;
  if (streamsResult.error) throw streamsResult.error;
  if (metricsResult.error) throw metricsResult.error;
  if (programmesResult.error) throw programmesResult.error;
  if (providersResult.error) throw providersResult.error;
  return { schools: schoolsResult.data || [], revenueStreams: streamsResult.data || [], metrics: metricsResult.data || [], programmes: programmesResult.data || [], providers: providersResult.data || [] };
}

export async function fetchRevenueContractTarget({schoolId,revenueStreamId,programmeId="",academicYear}) {
  if(!schoolId||!revenueStreamId||!academicYear)return null;
  let query=supabase.from("revenue_contract_targets").select("id, academic_year, contracted_amount, allocation_method, notes, programme_id").eq("school_id",Number(schoolId)).eq("revenue_stream_id",Number(revenueStreamId)).eq("academic_year",academicYear).eq("is_active",true);
  query=programmeId?query.eq("programme_id",Number(programmeId)):query.is("programme_id",null);
  const {data,error}=await query.maybeSingle();
  if(error)throw error;
  return data||null;
}

async function getCurrentUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user?.id) throw new Error("You must be signed in to modify financial records.");
  return user.id;
}

export async function fetchFinancialRecordAcademicYears() {
  const years = new Set(); let from = 0;
  while (true) {
    const { data, error } = await supabase.from("financial_records").select("academic_year").order("academic_year", { ascending: false }).range(from, from + FINANCIAL_RECORDS_PAGE_SIZE - 1);
    if (error) throw error;
    const batch = data || []; if (!batch.length) break;
    batch.forEach(row => { if (row.academic_year) years.add(row.academic_year); }); from += batch.length;
  }
  return [...years].sort((a,b)=>String(b).localeCompare(String(a)));
}

export async function fetchProgrammes() {
  const { data, error } = await supabase.from("programmes").select("id, name, category, provider_name").order("category").order("name");
  if (error) throw error; return data || [];
}

export async function createProgramme({ name, category, providerName = "" }) {
  await getCurrentUserId(); const cleanName=String(name||"").trim(),cleanCategory=String(category||"").trim(),cleanProviderName=String(providerName||"").trim();
  if(!cleanName)throw new Error("Enter a programme name."); if(!cleanCategory)throw new Error("Select or enter a programme category.");
  const {data:existing,error:existingError}=await supabase.from("programmes").select("id").ilike("name",cleanName).maybeSingle(); if(existingError)throw existingError; if(existing?.id)throw new Error("A programme with this name already exists.");
  const {data,error}=await supabase.from("programmes").insert({name:cleanName,category:cleanCategory,provider_name:cleanProviderName||null}).select("id, name, category, provider_name").single(); if(error)throw error; return data;
}

export async function updateProgramme(programmeId,{name,category,providerName=""}) {
  await getCurrentUserId(); const cleanName=String(name||"").trim(),cleanCategory=String(category||"").trim(),cleanProviderName=String(providerName||"").trim();
  if(!cleanName)throw new Error("Enter a programme name."); if(!cleanCategory)throw new Error("Select or enter a programme category.");
  const {data,error}=await supabase.from("programmes").update({name:cleanName,category:cleanCategory,provider_name:cleanProviderName||null}).eq("id",Number(programmeId)).select("id, name, category, provider_name").single(); if(error)throw error; return data;
}

export function getAcademicYearFromMonth(month){if(!month)return"";const[y,m]=month.split("-").map(Number);if(!y||!m)return"";const s=m>=9?y:y-1;return`AY${s}-${String(s+1).slice(-2)}`;}
export function getFinanceTermFromMonth(month){if(!month)return"";const m=Number(month.split("-")[1]);if([9,10,11,12].includes(m))return"Term 1";if([1,2,3].includes(m))return"Term 2";if([4,5,6,7,8].includes(m))return"Term 3";return"";}

function periodQuery({schoolId,revenueStreamId,programmeId="",month,scenario="Actual"}) {
  let query=supabase.from("financial_records").select(`id, amount, month, academic_year, term, scenario, created_at, updated_at, metric:revenue_metrics(id, code, name)`).eq("school_id",Number(schoolId)).eq("revenue_stream_id",Number(revenueStreamId)).eq("month",`${month}-01`).eq("scenario",scenario).eq("is_deleted",false);
  query=programmeId?query.eq("programme_id",Number(programmeId)):query.is("programme_id",null);
  return query.order("metric_id");
}

export async function fetchExistingFinancialPeriod({schoolId,revenueStreamId,programmeId="",month,scenario="Actual"}) {
  if(!schoolId||!revenueStreamId||!month)return[];
  const {data,error}=await periodQuery({schoolId,revenueStreamId,programmeId,month,scenario}); if(error)throw error; return data||[];
}

export async function saveFinancialRecords({schoolId,revenueStreamId,programmeId="",month,scenario,metricValues}) {
  const userId=await getCurrentUserId(),academicYear=getAcademicYearFromMonth(month),term=getFinanceTermFromMonth(month);
  const {data:stream,error:streamError}=await supabase.from("revenue_streams").select("code").eq("id",Number(revenueStreamId)).single(); if(streamError)throw friendlyFinancialError(streamError);
  const isLeasing=stream?.code==="leasing"; if(isLeasing&&!programmeId)throw new Error("Select a programme for Leasing financial records."); const resolvedProgrammeId=isLeasing?Number(programmeId):null;
  const rows=Object.entries(metricValues).filter(([,v])=>v!=="").map(([metricId,value])=>({school_id:Number(schoolId),revenue_stream_id:Number(revenueStreamId),metric_id:Number(metricId),academic_year:academicYear,month:`${month}-01`,term,scenario,amount:Number(value),programme_id:resolvedProgrammeId,provider_id:null}));
  if(!rows.length)throw new Error("Enter an amount for at least one metric.");
  const existing=await fetchExistingFinancialPeriod({schoolId,revenueStreamId,programmeId:resolvedProgrammeId||"",month,scenario});
  if(existing.length){const err=new Error("This reporting period already contains financial data. Open the existing record from Find Records to review or edit it.");err.code="FINANCIAL_PERIOD_EXISTS";err.existingRecords=existing;throw err;}
  const {error}=await supabase.from("financial_records").insert(rows.map(row=>({...row,is_deleted:false,created_by:userId,updated_by:userId,deleted_by:null,deleted_at:null}))); if(error)throw friendlyFinancialError(error);
  return{academicYear,term,savedCount:rows.length};
}

function buildFinancialRecordsQuery({includeDeleted,schoolId,revenueStreamId,academicYear,month,scenario,metricIds,programmeId,programmeIds}) {
  let query=supabase.from("financial_records").select(`id, academic_year, month, term, scenario, amount, programme_id, provider_id, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, is_deleted, school:schools(id, code, name, short_name), revenue_stream:revenue_streams(id, code, name), metric:revenue_metrics(id, code, name), programme:programmes(id, name, category, provider_name)`,{count:"exact"}).order("month",{ascending:false}).order("id",{ascending:false});
  if(!includeDeleted)query=query.eq("is_deleted",false);if(schoolId)query=query.eq("school_id",Number(schoolId));if(revenueStreamId)query=query.eq("revenue_stream_id",Number(revenueStreamId));if(academicYear)query=query.eq("academic_year",academicYear);if(month)query=query.eq("month",`${month}-01`);if(scenario)query=query.eq("scenario",scenario);if(metricIds?.length)query=query.in("metric_id",metricIds.map(Number));if(programmeId)query=query.eq("programme_id",Number(programmeId));else if(programmeIds?.length)query=query.in("programme_id",programmeIds.map(Number));return query;
}

export async function fetchFinancialRecords({schoolId="",revenueStreamId="",academicYear="",month="",scenario="",metricIds=[],programmeId="",programmeIds=[],includeDeleted=false,page=1,pageSize=25,fetchAll=false}={}) {
  const filters={schoolId,revenueStreamId,academicYear,month,scenario,metricIds,programmeId,programmeIds,includeDeleted};
  if(!fetchAll){const from=Math.max(0,(page-1)*pageSize);const{data,error,count}=await buildFinancialRecordsQuery(filters).range(from,from+pageSize-1);if(error)throw error;return{records:data||[],totalCount:count||0};}
  const rows=[];let from=0,totalCount=0;while(true){const{data,error,count}=await buildFinancialRecordsQuery(filters).range(from,from+FINANCIAL_RECORDS_PAGE_SIZE-1);if(error)throw error;const batch=data||[];if(count!==null&&count!==undefined)totalCount=count;if(!batch.length)break;rows.push(...batch);from+=batch.length;}return{records:rows,totalCount};
}

export async function updateFinancialRecord(recordId,{amount,scenario,month,programmeId}){const userId=await getCurrentUserId(),changes={updated_by:userId};if(amount!==undefined&&amount!=="")changes.amount=Number(amount);if(scenario)changes.scenario=scenario;if(month){changes.month=`${month}-01`;changes.academic_year=getAcademicYearFromMonth(month);changes.term=getFinanceTermFromMonth(month);}if(programmeId!==undefined){changes.programme_id=programmeId?Number(programmeId):null;changes.provider_id=null;}const{data,error}=await supabase.from("financial_records").update(changes).eq("id",recordId).eq("is_deleted",false).select().single();if(error)throw friendlyFinancialError(error,"Unable to update this financial record. Please try again.");return data;}
export async function archiveFinancialRecord(recordId){const userId=await getCurrentUserId();const{data,error}=await supabase.from("financial_records").update({is_deleted:true,deleted_at:new Date().toISOString(),deleted_by:userId,updated_by:userId}).eq("id",recordId).eq("is_deleted",false).select().single();if(error)throw friendlyFinancialError(error,"Unable to archive this financial record. Please try again.");return data;}
export async function restoreFinancialRecord(recordId){const userId=await getCurrentUserId();const{data,error}=await supabase.from("financial_records").update({is_deleted:false,deleted_at:null,deleted_by:null,updated_by:userId}).eq("id",recordId).eq("is_deleted",true).select().single();if(error)throw friendlyFinancialError(error,"Unable to restore this financial record. Please try again.");return data;}
