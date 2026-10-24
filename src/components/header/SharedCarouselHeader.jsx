import React, { Children, isValidElement, cloneElement } from "react";
import "./SharedCarouselHeader.css";

const schoolNames = {RDXB:"Repton Dubai",RAB:"Repton Al Barsha",FRY:"Repton Abu Dhabi – Fry",ROSE:"Repton Foundation – Rose",HES:"Horizon English School",HIS:"Horizon International School",RGS:"Royal Grammar School Guildford Dubai",RPS:"Ranches Primary School",AAESS:"Al Ain English Speaking School"};

function carouselForSelect(select,label) {
 const options=Children.toArray(select.props.children).filter(isValidElement).filter(option=>option.type==="option").map(option=>({value:String(option.props.value??""),label:String(option.props.children??"")}));
 const current=String(select.props.value??"");
 const index=options.findIndex(option=>option.value===current);
 const selected=options[Math.max(index,0)];
 const move=direction=>{if(!options.length)return;const next=options[(Math.max(index,0)+direction+options.length)%options.length];select.props.onChange?.({target:{value:next.value}})};
 const isYear=/academic|year/i.test(label);
 const display=isYear?(selected?.label||"—").replace(/^AY\s*/i,"AY"):(selected?.value||"All");
 return <div className="shared-carousel-control" key={label} aria-label={label}><span className="shared-carousel-label">{label}</span><div className="shared-carousel-navigation"><button type="button" aria-label={`Previous ${label}`} onClick={()=>move(-1)} disabled={!options.length}>‹</button><span title={selected?.label}>{display}</span><button type="button" aria-label={`Next ${label}`} onClick={()=>move(1)} disabled={!options.length}>›</button></div><div className="shared-carousel-dots" aria-hidden="true">{options.slice(0,9).map((option,i)=><i key={option.value} className={i===index?"active":""}/>)}</div></div>;
}
function extract(node,out=[]) {
 Children.forEach(node,child=>{
  if(!isValidElement(child))return;
  if(child.type==="select")out.push(child);
  else if(child.props?.children)extract(child.props.children,out);
 });
 return out;
}
export default function SharedCarouselHeader({controls}) {
 const selects=extract(controls);
 const school=selects.find(s=>/school/i.test(String(s.props.id||"")));
 const year=selects.find(s=>/year|academic/i.test(String(s.props.id||"")));
 if((!school&&!year)||selects.some(s=>s!==school&&s!==year))return <div className="header-page-controls">{controls}</div>;
 const schoolOptions=school?Children.toArray(school.props.children).filter(isValidElement):[];
 const currentSchool=schoolOptions.find(o=>String(o.props.value??"")===String(school.props.value??""));
 const schoolValue=String(currentSchool?.props.children??"All Schools");
 const centerSchool=schoolNames[schoolValue]||schoolValue;
 const yearValue=year?String(year.props.value??""):"";
 return <div className="shared-carousel-header"><div className="shared-carousel-selection"><strong>{centerSchool}</strong><span>{yearValue?yearValue.replace(/^AY\s*/i,"AY"):""}</span></div><div className="shared-carousel-pair">{school&&carouselForSelect(school,"School")}{year&&carouselForSelect(year,"Academic Year")}</div></div>;
}
