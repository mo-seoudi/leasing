import * as XLSX from "xlsx";

const MONEY_FORMAT = '#,##0.00;[Red](#,##0.00);–';
const MONTH_ORDER = [9,10,11,12,1,2,3,4,5,6,7,8];
const safeName = value => String(value || "All").replace(/[^a-z0-9_-]/gi, "_").slice(0,45);
const monthDate = value => { const match=String(value||"").match(/^(\d{4})-(\d{2})/); return match ? new Date(Number(match[1]),Number(match[2])-1,1) : null; };
const monthSort = (a,b) => { const ay=String(a.academicYear).localeCompare(String(b.academicYear));if(ay)return ay;return MONTH_ORDER.indexOf(Number(a.month.slice(5,7)))-MONTH_ORDER.indexOf(Number(b.month.slice(5,7))); };

/**
 * Download a school-by-school financial matrix. Only the filtered records supplied
 * by the dashboard are included. Metric amounts come from source records, not
 * formatted table cells or estimated commission rates.
 */
export function exportMonthlyResults({title,records=[],metrics=[],academicYear="",scenario="Actual",yearBasis=""}) {
  if(!records.length || !metrics.length) return;
  const schools=[...new Set(records.map(r=>r.schoolCode||r.school).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  if(!schools.length) return;
  const months=new Map();
  const values=new Map();
  records.forEach(record=>{
    const school=record.schoolCode||record.school;
    const month=String(record.month||"").slice(0,7);
    const ay=record.academicYear||"";
    if(!school||!/^\d{4}-\d{2}$/.test(month))return;
    const rowKey=`${ay}|${month}`;
    months.set(rowKey,{academicYear:ay,month});
    const metric=metrics.find(m=>m.codes.includes(String(record.metricCode||record.incomeTypeCode||record.categoryCode||"").toLowerCase()));
    if(!metric)return;
    const key=`${rowKey}|${school}|${metric.key}`;
    values.set(key,(values.get(key)||0)+Number(record.amount||0));
  });
  const ordered=[...months.values()].sort(monthSort);
  if(!ordered.length)return;
  const matrix=[[],[],[]];
  const width=1+schools.length*metrics.length+metrics.length;
  matrix[0][0]=title+" — Monthly Results";
  matrix[1][0]=[academicYear||"All Academic Years",scenario,yearBasis].filter(Boolean).join(" | ");
  matrix[2][0]="Month";
  const merges=[{s:{r:0,c:0},e:{r:0,c:width-1}},{s:{r:1,c:0},e:{r:1,c:width-1}}];
  const headerRow=["Month"];
  const subheaderRow=[""];
  schools.forEach(school=>{
    headerRow.push(school,...Array(metrics.length-1).fill(""));
    metrics.forEach(m=>subheaderRow.push(m.label));
    const start=1+schools.indexOf(school)*metrics.length;
    if(metrics.length>1)merges.push({s:{r:3,c:start},e:{r:3,c:start+metrics.length-1}});
  });
  headerRow.push("TOTAL",...Array(metrics.length-1).fill(""));
  metrics.forEach(m=>subheaderRow.push(m.label));
  if(metrics.length>1)merges.push({s:{r:3,c:width-metrics.length},e:{r:3,c:width-1}});
  matrix.push(headerRow,subheaderRow);
  const totals=new Array(width).fill(0);
  ordered.forEach(({academicYear:ay,month})=>{
    const date=monthDate(month),row=[date];
    metrics.forEach(()=>{});
    schools.forEach(school=>metrics.forEach(m=>{
      const amount=values.get(`${ay}|${month}|${school}|${m.key}`)||0;
      row.push(amount);
      totals[row.length-1]+=amount;
    }));
    metrics.forEach((m,i)=>{
      const sum=schools.reduce((acc,school)=>acc+(values.get(`${ay}|${month}|${school}|${m.key}`)||0),0);
      row.push(sum);totals[row.length-1]+=sum;
    });
    matrix.push(row);
  });
  matrix.push(["TOTAL",...totals.slice(1)]);
  const sheet=XLSX.utils.aoa_to_sheet(matrix);
  sheet["!merges"]=merges;
  sheet["!cols"]=[{wch:17},...Array.from({length:width-1},()=>({wch:17}))];
  sheet["!freeze"]={xSplit:1,ySplit:5};
  sheet["!autofilter"]={ref:`A5:${XLSX.utils.encode_col(width-1)}${matrix.length}`};
  for(let r=5;r<matrix.length-1;r++){
    const cell=sheet[`A${r+1}`];if(cell&&cell.t==="d")cell.z="mmm yyyy";
    for(let c=1;c<width;c++){const x=sheet[XLSX.utils.encode_cell({r,c})];if(x&&x.t==="n")x.z=MONEY_FORMAT;}
  }
  for(let c=1;c<width;c++){const x=sheet[XLSX.utils.encode_cell({r:matrix.length-1,c})];if(x)x.z=MONEY_FORMAT;}
  const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,sheet,"Monthly Results");
  XLSX.writeFile(book,`${safeName(title)}_Monthly_Results_${safeName(academicYear)}.xlsx`);
}
