import { supabase } from "./supabase";
import { getAcademicYearFromMonth, getFinanceTermFromMonth } from "./financialData";

const MONTH_ORDER = [9,10,11,12,1,2,3,4,5,6,7,8];
const unique = (values) => [...new Set(values.filter(Boolean))];

async function getCurrentUserId(){
  const { data:{ user }, error } = await supabase.auth.getUser();
  if(error) throw error;
  if(!user?.id) throw new Error("You must be signed in to modify transport costs.");
  return user.id;
}

export async function fetchTransportCostOptions(){
  const [schoolsResult,categoriesResult] = await Promise.all([
    supabase.from("schools").select("id, code, name, short_name").eq("is_active",true).order("name"),
    supabase.from("transport_cost_categories").select("id, code, name, cost_group, display_order").eq("is_active",true).order("display_order"),
  ]);
  if(schoolsResult.error) throw schoolsResult.error;
  if(categoriesResult.error) throw categoriesResult.error;
  return { schools:schoolsResult.data||[], categories:categoriesResult.data||[] };
}

export async function fetchTransportCostRecords(){
  const { data, error } = await supabase
    .from("transport_cost_records")
    .select(`id, academic_year, month, scenario, amount, notes, source_type, school:schools(id, code, name), category:transport_cost_categories(id, code, name, cost_group, display_order)`)
    .eq("is_deleted",false)
    .order("month",{ascending:true});
  if(error) throw error;
  return (data||[]).map(row=>({
    id:row.id,
    schoolId:row.school?.id,
    school:row.school?.code||"",
    schoolName:row.school?.name||row.school?.code||"",
    academicYear:row.academic_year,
    month:row.month,
    scenario:row.scenario||"Actual",
    amount:Number(row.amount||0),
    notes:row.notes||"",
    sourceType:row.source_type||"monthly_total",
    categoryId:row.category?.id,
    categoryCode:row.category?.code||"",
    categoryName:row.category?.name||"",
    costGroup:row.category?.cost_group||"other",
    displayOrder:Number(row.category?.display_order||0),
  }));
}

export async function saveTransportMonthlyCosts({ schoolId, month, scenario="Actual", values={}, notes="" }){
  const userId = await getCurrentUserId();
  const academicYear = getAcademicYearFromMonth(month);
  if(!schoolId||!month) throw new Error("Select a school and reporting month.");
  const entries = Object.entries(values).filter(([,value])=>value!==""&&value!==null&&value!==undefined);
  if(!entries.length) throw new Error("Enter an amount for at least one cost category.");

  let savedCount=0;
  for(const [categoryId,value] of entries){
    const amount=Number(value);
    if(!Number.isFinite(amount)) continue;
    const { data:existing, error:lookupError } = await supabase
      .from("transport_cost_records")
      .select("id")
      .eq("school_id",Number(schoolId))
      .eq("category_id",Number(categoryId))
      .eq("month",`${month}-01`)
      .eq("scenario",scenario)
      .eq("is_deleted",false)
      .maybeSingle();
    if(lookupError) throw lookupError;
    if(existing?.id){
      const { error } = await supabase.from("transport_cost_records").update({
        amount,
        academic_year:academicYear,
        notes:notes||null,
        source_type:"monthly_total",
        updated_by:userId,
        updated_at:new Date().toISOString(),
      }).eq("id",existing.id);
      if(error) throw error;
    } else {
      const { error } = await supabase.from("transport_cost_records").insert({
        school_id:Number(schoolId),
        category_id:Number(categoryId),
        academic_year:academicYear,
        month:`${month}-01`,
        scenario,
        amount,
        notes:notes||null,
        source_type:"monthly_total",
        created_by:userId,
        updated_by:userId,
      });
      if(error) throw error;
    }
    savedCount+=1;
  }
  return { savedCount, academicYear, term:getFinanceTermFromMonth(month) };
}

export function getTransportCostAcademicYears(records=[]){return unique(records.map(r=>r.academicYear)).sort((a,b)=>a.localeCompare(b))}
export function getTransportCostSchools(records=[]){const m=new Map();records.forEach(r=>{if(r.school&&!m.has(r.school))m.set(r.school,{code:r.school,name:r.schoolName||r.school})});return[...m.values()].sort((a,b)=>a.name.localeCompare(b.name))}
export function filterTransportCostRecords(records=[],{academicYear="",school="",scenario="Actual"}={}){return records.filter(r=>(!academicYear||r.academicYear===academicYear)&&(!school||r.school===school)&&(!scenario||r.scenario===scenario))}

function bucket(){return{tripCosts:0,contractualCosts:0,otherCharges:0,offsets:0,grossCost:0,netCost:0}}
function addCost(target,r){const amount=Number(r.amount||0);if(r.costGroup==="trips")target.tripCosts+=amount;else if(r.costGroup==="contractual")target.contractualCosts+=amount;else if(r.costGroup==="offset")target.offsets+=amount;else target.otherCharges+=amount;target.grossCost=target.tripCosts+target.contractualCosts+target.otherCharges;target.netCost=target.grossCost-target.offsets;return target}

export function getTransportCostSummary(records=[]){const total=bucket();records.forEach(r=>addCost(total,r));return{...total,months:unique(records.map(r=>r.month)).length,schools:unique(records.map(r=>r.school)).length}}

export function getMonthlyTransportCostData(records=[]){
  const grouped=new Map();
  records.forEach(r=>{const key=`${r.academicYear}|${r.month}`;const current=grouped.get(key)||{key,academicYear:r.academicYear,month:r.month,term:getFinanceTermFromMonth(String(r.month).slice(0,7)),...bucket()};addCost(current,r);grouped.set(key,current)});
  return [...grouped.values()].map(item=>({...item,label:new Intl.DateTimeFormat("en-GB",{month:"short",year:"2-digit"}).format(new Date(`${item.month}T00:00:00`)),monthNumber:Number(String(item.month).slice(5,7))})).sort((a,b)=>{const ay=a.academicYear.localeCompare(b.academicYear);return ay!==0?ay:MONTH_ORDER.indexOf(a.monthNumber)-MONTH_ORDER.indexOf(b.monthNumber)});
}

export function getSchoolTransportCostData(records=[]){
  const grouped=new Map();
  records.forEach(r=>{const current=grouped.get(r.school)||{school:r.school,schoolName:r.schoolName,...bucket()};addCost(current,r);grouped.set(r.school,current)});
  return [...grouped.values()].sort((a,b)=>b.netCost-a.netCost);
}

export function getCategoryTransportCostData(records=[]){
  const grouped=new Map();
  records.forEach(r=>{const current=grouped.get(r.categoryCode)||{category:r.categoryName,categoryCode:r.categoryCode,costGroup:r.costGroup,displayOrder:r.displayOrder,amount:0};current.amount+=Number(r.amount||0);grouped.set(r.categoryCode,current)});
  return [...grouped.values()].sort((a,b)=>a.displayOrder-b.displayOrder);
}

export function formatCurrency(value){return new Intl.NumberFormat("en-AE",{style:"currency",currency:"AED",maximumFractionDigits:0}).format(Number(value||0))}
export function formatCompactCurrency(value){return new Intl.NumberFormat("en-AE",{style:"currency",currency:"AED",notation:"compact",maximumFractionDigits:1}).format(Number(value||0))}
