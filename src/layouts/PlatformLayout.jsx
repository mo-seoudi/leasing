import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { MdPhotoCamera, MdRestaurant, MdSportsTennis } from "react-icons/md";
import { FaBusSimple, FaShirt } from "react-icons/fa6";
import { useAuth } from "../auth/AuthProvider";
import "./PlatformLayout.css";
import "./SidebarCompact.css";

const LAPTOP_BREAKPOINT = 1450;
const SIDEBAR_STORAGE_KEY = "commercial-operations-sidebar-collapsed";
const leasingLinks = [{ label:"Leasing Dashboard", path:"/leasing" },{ label:"Programme Directory", path:"/leasing/programmes" },{ label:"Performance Comparison", path:"/leasing/year-comparison" },{ label:"Enrich ME", path:"/leasing/enrich-me" }];
const cateringLinks = [{ label:"Catering Dashboard", path:"/catering" },{ label:"Performance Comparison", path:"/catering/comparison" },{ label:"Kitchen Rental", path:"/catering/kitchen-rental" }];
const uniformLinks = [{ label:"Uniform Dashboard", path:"/uniform" },{ label:"Performance Comparison", path:"/uniform/comparison" }];
const photographyLinks = [{ label:"Photography Dashboard", path:"/photography" },{ label:"Performance Comparison", path:"/photography/comparison" }];
const transportLinks = [{ label:"Transport Dashboard", path:"/transport" },{ label:"Performance Comparison", path:"/transport/comparison" },{ label:"Cost Centre", path:"/transport/cost-centre" }];
const recordLinks = [{ label:"Financial Records", path:"/financial-records" },{ label:"Suppliers & Contracts", path:"/supplier-records" }];

function DashboardIcon(){return <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>}
function ReportIcon(){return <svg viewBox="0 0 24 24"><path d="M6 3.5h9l3 3V20.5H6z"/><path d="M15 3.5v3h3"/><path d="M9 16v-3M12 16v-5M15 16V9"/></svg>}
function SupplierIcon(){return <svg viewBox="0 0 24 24"><path d="M4 7.5h16v12H4z"/><path d="M8 7.5V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8v1.7"/><path d="M4 12h16M10 12v2h4v-2"/></svg>}
function DataEntryIcon(){return <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>}
function SettingsIcon(){return <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 15c1 1 1 2 0 3l-1 1c-1 1-2 1-3 0l-1 1c0 1-1 1-2 1h-1c-1 0-2-1-2-2l-1-1c-1 1-2 1-3 0l-1-1c-1-1-1-2 0-3l-1-1c-1 0-1-1-1-2v-1c0-1 1-2 2-2l1-1c-1-1-1-2 0-3l1-1c1-1 2-1 3 0l1-1c0-1 1-1 2-1h1c1 0 2 1 2 2l1 1c1-1 2-1 3 0l1 1c1 1 1 2 0 3l1 1c1 0 1 1 1 2v1c0 1-1 2-2 2Z"/></svg>}
function MenuIcon(){return <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>}
function CloseIcon(){return <svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>}
function CollapseIcon({collapsed}){return <svg viewBox="0 0 24 24"><path d={collapsed?"m9 6 6 6-6 6":"m15 6-6 6 6 6"}/></svg>}
function ChevronIcon({open}){return <svg viewBox="0 0 24 24" className={open?"chevron open":"chevron"}><path d="m9 18 6-6-6-6"/></svg>}

function getPageDetails(p){
 const pages={
  "/dashboard":{section:"",title:"Commercial Overview"},"/reporting":{section:"",title:"Reporting Centre"},"/suppliers":{section:"Workspace",title:"Supplier & Contract Register"},
  "/leasing":{section:"Leasing",title:"Leasing Dashboard"},"/leasing/programmes":{section:"Leasing",title:"Programme Directory"},"/leasing/year-comparison":{section:"Leasing",title:"Performance Comparison"},"/leasing/enrich-me":{section:"Leasing",title:"Enrich ME"},
  "/catering":{section:"Catering",title:"Catering Dashboard"},"/catering/comparison":{section:"Catering",title:"Performance Comparison"},"/catering/kitchen-rental":{section:"Catering",title:"Kitchen Rental"},
  "/uniform":{section:"Uniform",title:"Uniform Dashboard"},"/uniform/comparison":{section:"Uniform",title:"Performance Comparison"},
  "/photography":{section:"Photography",title:"Photography Dashboard"},"/photography/comparison":{section:"Photography",title:"Performance Comparison"},
  "/transport":{section:"Transport",title:"Transport Dashboard"},"/transport/comparison":{section:"Transport",title:"Performance Comparison"},"/transport/cost-centre":{section:"Transport",title:"Cost Centre"},
  "/financial-records":{section:"Administration",title:"Data Management"},"/data-entry":{section:"Administration",title:"Data Management"},"/supplier-records":{section:"Administration",title:"Supplier & Contract Records"},"/settings":{section:"Administration",title:"Settings"}
 };
 return pages[p]||{section:"Commercial Operations",title:"Platform"};
}
function getInitialCollapsedState(){if(typeof window==="undefined")return false;const v=window.localStorage.getItem(SIDEBAR_STORAGE_KEY);if(v!==null)return v==="true";return window.innerWidth<=LAPTOP_BREAKPOINT&&window.innerWidth>900}
function getInitials(n=""){return n.split(" ").filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join("")||"U"}
function formatRole(r){return r?r.charAt(0).toUpperCase()+r.slice(1):"User"}

export default function PlatformLayout(){
 const {user,profile,role}=useAuth();
 const [headerControls,setHeaderControls]=useState(null);
 const location=useLocation();
 const userName=profile?.full_name||user?.user_metadata?.full_name||user?.email?.split("@")[0]||"User";
 const active={leasing:location.pathname==="/leasing"||location.pathname.startsWith("/leasing/"),catering:location.pathname.startsWith("/catering"),uniform:location.pathname.startsWith("/uniform"),photography:location.pathname.startsWith("/photography"),transport:location.pathname.startsWith("/transport"),records:["/financial-records","/supplier-records","/data-entry"].includes(location.pathname)};
 const [open,setOpen]=useState({leasing:active.leasing,catering:active.catering,uniform:active.uniform,photography:active.photography,transport:active.transport,records:active.records});
 const [mobileOpen,setMobileOpen]=useState(false);
 const [sidebarCollapsed,setSidebarCollapsed]=useState(getInitialCollapsedState);
 const pageDetails=getPageDetails(location.pathname);
 useEffect(()=>{setOpen({leasing:active.leasing,catering:active.catering,uniform:active.uniform,photography:active.photography,transport:active.transport,records:active.records});setMobileOpen(false)},[location.pathname]);
 useEffect(()=>window.localStorage.setItem(SIDEBAR_STORAGE_KEY,String(sidebarCollapsed)),[sidebarCollapsed]);
 const toggle=()=>setSidebarCollapsed(c=>!c);
 const openOnly=section=>{setOpen(current=>Object.fromEntries(Object.keys(current).map(key=>[key,key===section?!current[key]:false])));if(sidebarCollapsed)setSidebarCollapsed(false)};
 const subMenu=links=><div className="navigation-submenu">{links.map(link=><NavLink key={link.path} to={link.path} end={["/leasing","/catering","/uniform","/photography","/transport"].includes(link.path)} className={({isActive})=>`submenu-link ${isActive?"active":""}`}><span className="submenu-dot"/><span>{link.label}</span></NavLink>)}</div>;
 const parent=(key,label,Icon,links)=><>{<button className={`navigation-link navigation-parent ${active[key]?"module-active":""}`} onClick={()=>openOnly(key)}><span className="navigation-link-content"><span className="navigation-icon"><Icon className="stream-react-icon"/></span><span className="navigation-text">{label}</span></span><ChevronIcon open={open[key]}/></button>}{!sidebarCollapsed&&open[key]&&subMenu(links)}</>;
 return <div className={`platform-layout ${sidebarCollapsed?"sidebar-collapsed":""}`}>
  {mobileOpen&&<button className="sidebar-overlay" onClick={()=>setMobileOpen(false)}/>}
  <aside className={`platform-sidebar ${mobileOpen?"mobile-open":""}`}>
   <div className="sidebar-brand"><div className="brand-mark">CO</div><div className="brand-copy"><strong>ComOps</strong><span>Commercial workspace</span></div><button className="sidebar-collapse-button" onClick={toggle}><CollapseIcon collapsed={sidebarCollapsed}/></button><button className="mobile-close-button" onClick={()=>setMobileOpen(false)}><CloseIcon/></button></div>
   <nav className="sidebar-navigation">
    <div className="navigation-group"><span className="navigation-label">Workspace</span><NavLink to="/dashboard" className={({isActive})=>`navigation-link ${isActive?"active":""}`}><span className="navigation-icon"><DashboardIcon/></span><span className="navigation-text">Commercial Overview</span></NavLink><NavLink to="/reporting" className={({isActive})=>`navigation-link ${isActive?"active":""}`}><span className="navigation-icon"><ReportIcon/></span><span className="navigation-text">Reporting Centre</span></NavLink><NavLink to="/suppliers" className={({isActive})=>`navigation-link ${isActive?"active":""}`}><span className="navigation-icon"><SupplierIcon/></span><span className="navigation-text">Supplier Directory</span></NavLink></div>
    <div className="navigation-group"><span className="navigation-label">Revenue Streams</span>{parent("leasing","Leasing",MdSportsTennis,leasingLinks)}{parent("catering","Catering",MdRestaurant,cateringLinks)}{parent("uniform","Uniform",FaShirt,uniformLinks)}{parent("photography","Photography",MdPhotoCamera,photographyLinks)}{parent("transport","Transport",FaBusSimple,transportLinks)}</div>
    <div className="navigation-group navigation-group-bottom"><span className="navigation-label">Administration</span><button className={`navigation-link navigation-parent ${active.records?"module-active":""}`} onClick={()=>openOnly("records")}><span className="navigation-link-content"><span className="navigation-icon"><DataEntryIcon/></span><span className="navigation-text">Data Management</span></span><ChevronIcon open={open.records}/></button>{!sidebarCollapsed&&open.records&&subMenu(recordLinks)}<NavLink to="/settings" className={({isActive})=>`navigation-link ${isActive?"active":""}`}><span className="navigation-icon"><SettingsIcon/></span><span className="navigation-text">Settings</span></NavLink></div>
   </nav>
   <div className="sidebar-footer"><div className="user-avatar">{getInitials(userName)}</div><div className="user-details"><strong>{userName}</strong><span>{formatRole(role)}</span></div></div>
  </aside>
  <div className="platform-main"><header className="platform-header"><div className="header-left"><button className="mobile-menu-button" onClick={()=>setMobileOpen(true)}><MenuIcon/></button><button className="header-sidebar-toggle" onClick={toggle}><CollapseIcon collapsed={sidebarCollapsed}/></button><div>{pageDetails.section&&<div className="breadcrumb"><span>Commercial Operations</span><span className="breadcrumb-divider">/</span><span>{pageDetails.section}</span></div>}<h1 style={pageDetails.section?{marginTop:"3px"}:undefined}>{pageDetails.title}</h1></div></div><div className={`header-actions ${headerControls?"has-page-controls":""}`}>{headerControls&&<div className="header-page-controls">{headerControls}</div>}</div></header><main className="platform-content"><Outlet context={{setHeaderControls}}/></main></div>
 </div>;
}
