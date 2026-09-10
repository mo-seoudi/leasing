const MONTH_ORDER=[9,10,11,12,1,2,3,4,5,6,7,8];
const MONTH_LABELS={1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"};

export function unique(values){return[...new Set(values.filter(Boolean))]}
export function toNumber(value){const number=Number(value);return Number.isFinite(number)?number:0}
export function formatCurrency(value){return new Intl.NumberFormat("en-AE",{style:"currency",currency:"AED",maximumFractionDigits:0}).format(toNumber(value))}
export function formatCompactCurrency(value){return new Intl.NumberFormat("en-AE",{style:"currency",currency:"AED",notation:"compact",maximumFractionDigits:1}).format(toNumber(value))}
export function formatPercent(value){return Number.isFinite(value)?`${value>0?"+":""}${value.toFixed(1)}%`:"—"}
export function getMetricRole(record){const code=String(record.metricCode||"").toLowerCase();if(code==="sales"||code==="revenue")return"revenue";if(code==="commission")return"income";if(code==="rental_fees"||code==="rental-fees"||code==="rental fees"||code==="enrich_me_revenue")return"both";return"other"}
export function monthNumber(record){const match=String(record.month||"").match(/^\d{4}-(\d{2})/);return match?Number(match[1]):0}
export function monthLabel(value){return MONTH_LABELS[Number(value)]||""}
export function monthOptions(){return MONTH_ORDER.map(value=>({value,label:MONTH_LABELS[value]}))}
export function previousAcademicYear(value){const match=String(value||"").match(/^AY(\d{4})-(\d{2})$/);if(!match)return"";const start=Number(match[1])-1;return`AY${start}-${String(start+1).slice(-2)}`}
export function measureAmount(record,measure){const role=getMetricRole(record),amount=toNumber(record.amount);if(measure==="income")return role==="income"||role==="both"?amount:0;return role==="revenue"||role==="both"?amount:0}
export function variance(actual,comparison){return toNumber(actual)-toNumber(comparison)}
export function variancePercent(actual,comparison){return toNumber(comparison)?variance(actual,comparison)/toNumber(comparison)*100:null}
export function buildMonthlyReport(records,{academicYear,measure="revenue",comparisonScenario="Forecast"}={}){
 const previousYear=previousAcademicYear(academicYear);
 return MONTH_ORDER.map(month=>{
  const current=records.filter(row=>row.academicYear===academicYear&&monthNumber(row)===month);
  const prior=records.filter(row=>row.academicYear===previousYear&&monthNumber(row)===month&&row.scenario==="Actual");
  const actual=current.filter(row=>row.scenario==="Actual").reduce((sum,row)=>sum+measureAmount(row,measure),0);
  const comparison=current.filter(row=>row.scenario===comparisonScenario).reduce((sum,row)=>sum+measureAmount(row,measure),0);
  const priorYear=prior.reduce((sum,row)=>sum+measureAmount(row,measure),0);
  return{month,monthLabel:MONTH_LABELS[month],actual,comparison,variance:variance(actual,comparison),variancePercent:variancePercent(actual,comparison),priorYear,yoyPercent:variancePercent(actual,priorYear)};
 });
}
export function buildMonthlySchoolStreamBreakdown(records,{academicYear,month,school="",stream=""}={}){
 const grouped=new Map();
 records.filter(row=>row.academicYear===academicYear&&monthNumber(row)===Number(month)&&(!school||(row.schoolName||row.schoolCode)===school)&&(!stream||row.streamCode===stream)).forEach(row=>{
  const schoolName=row.schoolName||row.schoolCode||"Unknown School",streamName=row.streamName||row.streamCode||"Unknown Stream",key=`${schoolName}__${row.streamCode||streamName}`;
  if(!grouped.has(key))grouped.set(key,{school:schoolName,streamCode:row.streamCode||"",stream:streamName,actualRevenue:0,actualIncome:0,forecastRevenue:0,forecastIncome:0,budgetRevenue:0,budgetIncome:0});
  const item=grouped.get(key),role=getMetricRole(row),amount=toNumber(row.amount),scenario=String(row.scenario||"Actual").toLowerCase();
  const addRevenue=role==="revenue"||role==="both",addIncome=role==="income"||role==="both";
  if(scenario==="actual"){if(addRevenue)item.actualRevenue+=amount;if(addIncome)item.actualIncome+=amount}
  else if(scenario==="forecast"){if(addRevenue)item.forecastRevenue+=amount;if(addIncome)item.forecastIncome+=amount}
  else if(scenario==="budget"){if(addRevenue)item.budgetRevenue+=amount;if(addIncome)item.budgetIncome+=amount}
 });
 return[...grouped.values()].sort((a,b)=>a.school.localeCompare(b.school)||a.stream.localeCompare(b.stream)).map(item=>({...item,forecastRevenueVariance:variancePercent(item.actualRevenue,item.forecastRevenue),budgetRevenueVariance:variancePercent(item.actualRevenue,item.budgetRevenue),forecastIncomeVariance:variancePercent(item.actualIncome,item.forecastIncome),budgetIncomeVariance:variancePercent(item.actualIncome,item.budgetIncome)}));
}
export function summariseMonthly(rows){return rows.reduce((result,row)=>{result.actual+=row.actual;result.comparison+=row.comparison;result.priorYear+=row.priorYear;return result},{actual:0,comparison:0,priorYear:0})}
