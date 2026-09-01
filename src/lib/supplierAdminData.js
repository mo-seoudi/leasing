import { supabase } from "./supabase";

export async function fetchSupplierAdminOptions() {
  const [{ data: schools, error: schoolsError }, { data: streams, error: streamsError }] = await Promise.all([
    supabase.from("schools").select("id, code, name").order("name"),
    supabase.from("revenue_streams").select("id, code, name").eq("is_active", true).order("name"),
  ]);
  if (schoolsError) throw schoolsError;
  if (streamsError) throw streamsError;
  return { schools: schools || [], revenueStreams: streams || [] };
}

export async function fetchSupplierRecords() {
  const { data, error } = await supabase
    .from("providers")
    .select(`
      id, name, legal_name, company_number, vat_trn, address,
      contact_person, email, phone, is_active,
      contacts:supplier_contacts(id, contact_name, role, email, phone, is_primary, is_active)
    `)
    .order("name");
  if (error) throw error;
  return data || [];
}

export async function saveSupplier(payload) {
  const values = {
    name: payload.name.trim(), legal_name: payload.legalName?.trim() || null,
    company_number: payload.companyNumber?.trim() || null, vat_trn: payload.vatTrn?.trim() || null,
    address: payload.address?.trim() || null, contact_person: payload.contactPerson?.trim() || null,
    email: payload.email?.trim() || null, phone: payload.phone?.trim() || null,
    is_active: payload.isActive !== false,
  };
  const query = payload.id ? supabase.from("providers").update(values).eq("id", payload.id).select().single() : supabase.from("providers").insert(values).select().single();
  const { data, error } = await query; if (error) throw error; return data;
}

export async function saveSupplierContact(providerId, payload) {
  const values = { provider_id: providerId, contact_name: payload.contactName.trim(), role: payload.role?.trim() || null, email: payload.email?.trim() || null, phone: payload.phone?.trim() || null, is_primary: Boolean(payload.isPrimary), is_active: payload.isActive !== false };
  const query = payload.id ? supabase.from("supplier_contacts").update(values).eq("id", payload.id).select().single() : supabase.from("supplier_contacts").insert(values).select().single();
  const { data, error } = await query; if (error) throw error; return data;
}

export async function saveSupplierProfile(supplierPayload, contacts = []) {
  const primary = contacts.find(contact => contact.isPrimary && contact.isActive !== false) || contacts.find(contact => contact.isActive !== false) || null;
  const supplier = await saveSupplier({ ...supplierPayload, contactPerson: primary?.contactName || supplierPayload.contactPerson || "", email: supplierPayload.email || primary?.email || "", phone: supplierPayload.phone || primary?.phone || "" });
  const providerId = supplier.id;
  const existingIds = new Set(contacts.filter(contact => contact.id).map(contact => String(contact.id)));
  const { data: existing, error: existingError } = await supabase.from("supplier_contacts").select("id").eq("provider_id", providerId); if (existingError) throw existingError;
  for (const contact of contacts) { if (contact.contactName?.trim()) await saveSupplierContact(providerId, contact); }
  const removedIds = (existing || []).map(row => row.id).filter(id => !existingIds.has(String(id)));
  if (removedIds.length) { const { error } = await supabase.from("supplier_contacts").update({ is_active: false, is_primary: false }).in("id", removedIds); if (error) throw error; }
  return supplier;
}

export async function fetchContractRecords() {
  const { data, error } = await supabase.from("supplier_contract_register").select("*").order("revenue_stream_name", { ascending: true, nullsFirst: false }).order("supplier_name", { ascending: true }).order("expiry_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  const contracts = data || [];
  if (!contracts.length) return contracts;
  const ids = contracts.map(row => row.contract_id);
  const { data: terms, error: termsError } = await supabase.from("supplier_contract_school_terms").select("*").in("contract_id", ids);
  if (termsError) throw termsError;
  const byContract = new Map();
  (terms || []).forEach(row => { const list = byContract.get(String(row.contract_id)) || []; list.push(row); byContract.set(String(row.contract_id), list); });
  return contracts.map(row => ({ ...row, school_terms: byContract.get(String(row.contract_id)) || [] }));
}

function nullableNumber(value, divisor = 1) { return value === "" || value == null ? null : Number(value) / divisor; }

export async function saveContract(payload) {
  const normalizedStatus = payload.status || "Not Recorded";
  const inactiveStatuses = new Set(["Expired", "Inactive", "Terminated", "Cancelled"]);
  const values = {
    provider_id: payload.providerId, revenue_stream_id: payload.revenueStreamId, status: normalizedStatus,
    start_date: payload.startDate || null, expiry_date: payload.expiryDate || null,
    notice_period: payload.noticePeriod?.trim() || null,
    commission_rate: null, rental_fees_amount: null, rental_fees_description: payload.generalTerms?.trim() || null,
    revenue_collection: null, invoice_frequency: null, is_active: !inactiveStatuses.has(normalizedStatus),
  };
  const query = payload.id ? supabase.from("provider_contracts").update(values).eq("id", payload.id).select().single() : supabase.from("provider_contracts").insert(values).select().single();
  const { data, error } = await query; if (error) throw error;
  const contract = data;
  if (Array.isArray(payload.schoolTerms)) {
    const { error: deleteError } = await supabase.from("provider_contract_schools").delete().eq("provider_contract_id", contract.id); if (deleteError) throw deleteError;
    const rows = payload.schoolTerms.filter(term => term.schoolId).map(term => ({
      provider_contract_id: contract.id, school_id: term.schoolId,
      commercial_model: term.commercialModel || "terms_only",
      fixed_amount: nullableNumber(term.fixedAmount), commission_rate: nullableNumber(term.commissionRate, 100),
      revenue_collection: term.revenueCollection?.trim() || null, invoice_frequency: term.invoiceFrequency?.trim() || null,
      commercial_terms: term.commercialTerms?.trim() || null,
    }));
    if (rows.length) { const { error: schoolError } = await supabase.from("provider_contract_schools").insert(rows); if (schoolError) throw schoolError; }
  }
  return contract;
}
