import React from "react";
import "./SharedCarouselHeader.css";

// Adapt existing controlled page filters without changing their data or onChange handlers.
function collectSelects(node, output = []) {
  if (!React.isValidElement(node)) return output;
  if (node.type === "select") output.push(node);
  React.Children.forEach(node.props.children, child => collectSelects(child, output));
  return output;
}
function optionsFor(select) {
  return React.Children.toArray(select.props.children).filter(child => React.isValidElement(child) && child.type === "option").map(option => ({value: String(option.props.value ?? ""), label: String(option.props.children ?? "")}));
}
function Carousel({ label, select }) {
  const options = optionsFor(select);
  const current = options.findIndex(option => option.value === String(select.props.value ?? ""));
  const index = current < 0 ? 0 : current;
  const navigate = direction => {
    if (!options.length) return;
    const next = options[(index + direction + options.length) % options.length];
    select.props.onChange?.({target:{value:next.value}});
  };
  return <div className="comops-carousel" aria-label={label}>
    <span className="comops-carousel-label">{label}</span>
    <div className="comops-carousel-controls">
      <button type="button" onClick={() => navigate(-1)} aria-label={`Previous ${label}`} disabled={options.length < 2}>‹</button>
      <strong title={options[index]?.label}>{label === "School" ? (options[index]?.value || "All") : (options[index]?.label || "All")}</strong>
      <button type="button" onClick={() => navigate(1)} aria-label={`Next ${label}`} disabled={options.length < 2}>›</button>
    </div>
    <div className="comops-carousel-dots" aria-hidden="true">{options.length > 1 && options.length <= 12 && options.map((option,i)=><i key={option.value} className={i===index?"active":""}/>)}</div>
  </div>;
}
export default function SharedCarouselHeader({controls}) {
  const selects = collectSelects(controls);
  const year = selects.find(select => /year/i.test(String(select.props.id || "")) || optionsFor(select).some(option => /^(AY)?20\d\d[-/]\d\d/.test(option.label)));
  const school = selects.find(select => select !== year && optionsFor(select).some(option => /school|RDXB|RAB|HES|FRY|ROSE/i.test(option.label))) || selects.find(select => select !== year);
  if (!year && !school) return <div className="header-page-controls">{controls}</div>;
  const schoolValue = optionsFor(school).find(option=>option.value===String(school?.props.value ?? ""));
  const yearValue = optionsFor(year).find(option=>option.value===String(year?.props.value ?? ""));
  return <div className="comops-header-selection">
    <div className="comops-selected-heading"><strong>{schoolValue?.label || "All Schools"}</strong><span>{yearValue?.label || "All Academic Years"}</span></div>
    <div className="comops-carousel-pair">{school && <Carousel label="School" select={school}/ >}{year && <Carousel label="Academic Year" select={year}/>}</div>
  </div>;
}
