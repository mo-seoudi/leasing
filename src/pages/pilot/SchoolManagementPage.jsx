import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { supabase } from "../../lib/supabase";
import "./SchoolManagementPage.css";

const clean = v => String(v || "").trim();
export default function SchoolManagementPage(){
 const {role}=useAuth();
 const canManage=role==="admin";
 const [schools,setSchools]=useState([]),[streams,setStreams]=useState([]),[selected,setSelected]=useState([]),[name,setName]=useState(""),[code,setCode]=useState(""),[shortName,setShortName]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState("");
 async function refresh(){
  const [a,b]=await Promise.all([supabase.from("schools").select("id,code,name,short_name,is_active").order("name"),supabase.from("revenue_streams").select("id,code,name").eq("is_active",true).order("name")]);
  if(a.error)throw a.error;if(b.error)throw b.error;setSchools(a.data||[]);setStreams(b.data||[]);
 }
 useEffect(()=>{refresh().catch(e=>setError(e.message))},[]);
 const duplicate=schools.some(s=>s.code?.toLowerCase()===clean(code).toLowerCase()||s.name?.toLowerCase()===clean(name).toLowerCase());
 async function submit(e){
  e.preventDefault();setError("");setSuccess("");
  if(!canManage)return setError("Only administrators can add schools.");
  if(!clean(name)||!clean(code))return setError("School name and code are required.");
  if(!/^[A-Z0-9_-]{2,12}$/.test(clean(code).toUpperCase()))return setError("Use 2–12 letters, numbers, underscores or hyphens for the school code.");
  if(duplicate)return setError("A school with this name or code already exists.");
  setBusy(true);
  try{
   const {data,error:insertError}=await supabase.from("schools").insert({name:clean(name),code:clean(code).toUpperCase(),short_name:clean(shortName)||clean(name),is_active:true}).select("id,code,name").single();
   if(insertError)throw insertError;
   setSuccess(data.name+" added to the shared school directory. Revenue streams selected below are setup preferences for the pilot; they are not yet stored as school-stream assignments.");
   setName("");setCode("");setShortName("");setSelected([]);await refresh();
  }catch(e){setError(e.code==="23505"?"This school name or code already exists.":e.message||"Unable to add school. Check database permissions.");}finally{setBusy(false)}
 }
 return <section className="school-admin"><header><div><div className="v2-eyebrow">V2.0 / PORTFOLIO SETUP</div><h1>School management</h1><p>Manage your school portfolio from one place. New schools become available to reporting and financial entry through the shared Supabase directory.</p></div><Link to="/v2-pilot">← Back to pilot</Link></header>
 <div className="school-admin-grid"><form onSubmit={submit} className="school-admin-card"><div className="school-admin-heading"><span>01 / SCHOOL DETAILS</span><h2>Add a school</h2><p>Enter the official name and a short unique identifier.</p></div><label>School name <b>*</b><input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Horizon English School" disabled={!canManage||busy}/></label><label>School code <b>*</b><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="e.g. HES" maxLength={12} disabled={!canManage||busy}/></label><label>Display name <small>(optional)</small><input value={shortName} onChange={e=>setShortName(e.target.value)} placeholder="Short name used in lists" disabled={!canManage||busy}/></label>
 <div className="school-admin-heading"><span>02 / REVENUE STREAMS</span><h2>Planned streams</h2><p>Select streams you expect this school to use. These selections are for setup review only until school-stream configuration is introduced.</p></div><div className="school-admin-streams">{streams.map(s=><label key={s.id}><input type="checkbox" checked={selected.includes(s.code)} onChange={e=>setSelected(v=>e.target.checked?[...v,s.code]:v.filter(x=>x!==s.code))}/>{s.name}</label>)}</div>
 {error&&<p className="school-admin-error" role="alert">{error}</p>}{success&&<p className="school-admin-success" role="status">{success}</p>}
 <div className="school-admin-footer"><small>{canManage?"This action creates a live school record in the shared database.":"Administrator access is required to add a school."}</small><button disabled={!canManage||busy||duplicate||!clean(name)||!clean(code)} type="submit">{busy?"Adding…":"Add School →"}</button></div></form>
 <aside className="school-admin-card"><div className="school-admin-heading"><span>PORTFOLIO DIRECTORY</span><h2>Schools ({schools.length})</h2><p>Existing active and inactive schools are shown here to prevent duplicates.</p></div><div className="school-admin-list">{schools.map(s=><div key={s.id}><span className="school-admin-code">{s.code}</span><div><strong>{s.name}</strong><small>{s.short_name||s.code}</small></div><em className={s.is_active?"active":""}>{s.is_active?"Active":"Inactive"}</em></div>)}</div><p className="school-admin-footnote">Adding a school does not create financial records, budgets, invoices or contracts. Those can be entered separately.</p></aside></div></section>
}