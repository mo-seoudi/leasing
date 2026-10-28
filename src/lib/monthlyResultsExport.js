import ExcelJS from "exceljs";

const MONTH_ORDER=[9,10,11,12,1,2,3,4,5,6,7,8];
const MONEY_FORMAT='#,##0.00;[Red](#,##0.00);–';
const safeName=value=>String(value||"All").replace(/[^a-z0-9_-]/gi,"_").slice(0,45);
const monthSort=(a,b)=>String(a.academicYear).localeCompare(String(b.academicYear))||MONTH_ORDER.indexOf(Number(a.month.slice(5,7)))-MONTH_ORDER.indexOf(Number(b.month.slice(5,7)));
const BORDER={top:{style:"thin",color:{argb:"FFD9E0E7"}},bottom:{style:"thin",color:{argb:"FFD9E0E7"}},left:{style:"thin",color:{argb:"FFD9E0E7"}},right:{style:"thin",color:{argb:"FFD9E0E7"}}};
const FILL=argb=>({type:"pattern",pattern:"solid",fgColor:{argb}});
const FONT={name:"Aptos",size:10,color:{argb:"FF344054"}};

/** Export source amounts as a formatted Excel financial report. */
export async function exportMonthlyResults({title,records=[],metrics=[],academicYear="",scenario="Actual",yearBasis=""}) {
  if(!records.length||!metrics.length)return;
  const schools=[...new Set(records.map(r=>r.schoolCode||r.school).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  if(!schools.length)return;
  const months=new Map(),values=new Map();
  records.forEach(record=>{
    const school=record.schoolCode||record.school,month=String(record.month||"").slice(0,7),ay=record.academicYear||"";
    if(!school||!/^\d{4}-\d{2}$/.test(month))return;
    const metric=metrics.find(m=>m.codes.includes(String(record.metricCode||record.incomeTypeCode||record.categoryCode||"").toLowerCase()));
    if(!metric)return;
    const rowKey=`${ay}|${month}`;
    months.set(rowKey,{academicYear:ay,month});
    const key=`${rowKey}|${school}|${metric.key}`;
    values.set(key,(values.get(key)||0)+Number(record.amount||0));
  });
  const ordered=[...months.values()].sort(monthSort);
  if(!ordered.length)return;
  // Only show right-hand consolidated totals when multiple schools are in scope.
  const includeSchoolTotals=schools.length>1;
  const width=1+schools.length*metrics.length+(includeSchoolTotals?metrics.length:0);
  const workbook=new ExcelJS.Workbook();
  workbook.creator="Commercial Operations Dashboard";
  workbook.created=new Date();
  const sheet=workbook.addWorksheet("Monthly Results",{views:[{state:"frozen",xSplit:1,ySplit:5,showGridLines:false}]});
  sheet.getColumn(1).width=18;
  for(let c=2;c<=width;c++)sheet.getColumn(c).width=19;
  sheet.mergeCells(1,1,1,width);
  sheet.getCell(1,1).value=`${title} | Monthly Results`;
  sheet.mergeCells(2,1,2,width);
  sheet.getCell(2,1).value=[academicYear||"All Academic Years",scenario,yearBasis].filter(Boolean).join("  •  ");
  sheet.getRow(1).height=30;sheet.getRow(2).height=24;sheet.getRow(3).height=12;
  sheet.getCell(4,1).value="Month";
  sheet.mergeCells(4,1,5,1);
  let col=2;
  for(const school of schools){
    const start=col;
    metrics.forEach(metric=>{sheet.getCell(5,col++).value=metric.label;});
    if(col-start>1)sheet.mergeCells(4,start,4,col-1);
    sheet.getCell(4,start).value=school;
  }
  if(includeSchoolTotals){
    const start=col;
    metrics.forEach(metric=>{sheet.getCell(5,col++).value=metric.label;});
    if(col-start>1)sheet.mergeCells(4,start,4,col-1);
    sheet.getCell(4,start).value="ALL SCHOOLS";
  }
  sheet.getRow(4).height=25;sheet.getRow(5).height=32;
  const columnTotals=Array(width+1).fill(0);
  ordered.forEach(({academicYear:ay,month},index)=>{
    const row=sheet.getRow(6+index);
    // Store month as an explicit display label to avoid locale-dependent dates.
    const [year,number]=month.split("-").map(Number);
    row.getCell(1).value=new Intl.DateTimeFormat("en-GB",{month:"short"}).format(new Date(year,number-1,1))+"-"+year;
    let c=2;
    for(const school of schools)for(const metric of metrics){
      const amount=values.get(`${ay}|${month}|${school}|${metric.key}`)||0;
      row.getCell(c).value=amount;columnTotals[c]+=amount;c++;
    }
    if(includeSchoolTotals)for(const metric of metrics){
      const amount=schools.reduce((sum,school)=>sum+(values.get(`${ay}|${month}|${school}|${metric.key}`)||0),0);
      row.getCell(c).value=amount;columnTotals[c]+=amount;c++;
    }
    row.height=22;
  });
  const lastRow=6+ordered.length;
  sheet.getCell(lastRow,1).value="TOTAL";
  for(let c=2;c<=width;c++)sheet.getCell(lastRow,c).value=columnTotals[c];
  sheet.getRow(lastRow).height=27;
  for(let r=1;r<=lastRow;r++)for(let c=1;c<=width;c++){
    const cell=sheet.getCell(r,c);
    cell.font={...FONT};
    cell.alignment={vertical:"middle",horizontal:c===1?"left":"right"};
    if(r>=4)cell.border=BORDER;
    if(r>=6&&c>1)cell.numFmt=MONEY_FORMAT;
    if(r===1){cell.fill=FILL("FF17324D");cell.font={...FONT,size:15,bold:true,color:{argb:"FFFFFFFF"}};cell.alignment={vertical:"middle",horizontal:"left"};}
    else if(r===2){cell.fill=FILL("FFEAF1F6");cell.font={...FONT,italic:true,color:{argb:"FF475467"}};cell.alignment={vertical:"middle",horizontal:"left"};}
    else if(r===4){cell.fill=FILL("FF244C68");cell.font={...FONT,bold:true,color:{argb:"FFFFFFFF"}};cell.alignment={vertical:"middle",horizontal:"center"};}
    else if(r===5){cell.fill=FILL("FFE8F0F5");cell.font={...FONT,bold:true,color:{argb:"FF344054"}};cell.alignment={vertical:"middle",horizontal:"center",wrapText:true};}
    else if(r===lastRow){cell.fill=FILL("FFE0E7EE");cell.font={...FONT,bold:true,color:{argb:"FF101828"}};}
    else if(r%2===1){cell.fill=FILL("FFF8FAFC");}
    if(includeSchoolTotals&&r>=6&&c>1+schools.length*metrics.length){
      cell.fill=FILL(r===lastRow?"FFD3DEE8":"FFEFF5F9");
      cell.font={...FONT,bold:true,color:{argb:"FF17324D"}};
    }
  }
  const buffer=await workbook.xlsx.writeBuffer();
  const url=URL.createObjectURL(new Blob([buffer],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
  const anchor=document.createElement("a");
  anchor.href=url;anchor.download=`${safeName(title)}_Monthly_Results_${safeName(academicYear)}.xlsx`;
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
