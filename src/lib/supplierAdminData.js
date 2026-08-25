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
    name: payload.name.trim(),
    legal_name: payload.legalName?.trim() || null,
    company_number: payload.companyNumber?.trim() || null,
    vat_trn: payload.vatTrn?.trim() || null,
    address: payload.address?.trim() || null,
    contact_person: payload.contactPerson?.trim() || null,
    email: payload.email?.trim() || null,
    phone: payload.phone?.trim() || null,
    is_active: payload.isActive !== false,
  };
  const query = payload.id
    ? supabase.from("providers").update(values).eq("id", payload.id).select().single()
    : supabase.from("providers").insert(values).select().single();
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function saveSupplierContact(providerId, payload) {
  const values = {
    provider_id: providerId,
    contact_name: payload.contactName.trim(),
    role: payload.role?.trim() || null,
    email: payload.email?.trim() || null,
    phone: payload.phone?.trim() || null,
    is_primary: Boolean(payload.isPrimary),
    is_active: payload.isActive !== false,
  };
  if (values.is_primary) {
    const { error: clearError } = await supabase.from("supplier_contacts").update({ is_primary: false }).eq("provider_id", providerId);
    if (clearError) throw clearError;
  }
  const query = payload.id
    ? supabase.from("supplier_contacts").update(values).eq("id", payload.id).select().single()
    : supabase.from("supplier_contacts").insert(values).select().single();
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchContractRecords() {
  const { data, error } = await supabase
    .from("supplier_contract_register")
    .select("*")
    .order("expiry_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

export async function saveContract(payload) {
  const values = {
    provider_id: payload.providerId,
    revenue_stream_id: payload.revenueStreamId,
    status: payload.status || "Not Recorded",
    start_date: payload.startDate || null,
    expiry_date: payload.expiryDate || null,
    notice_period: payload.noticePeriod?.trim() || null,
    commission_rate: payload.commissionRate === "" || payload.commissionRate == null ? null : Number(payload.commissionRate) / 100,
    rental_fees_amount: payload.rentalFeesAmount === "" || payload.rentalFeesAmount == null ? null : Number(payload.rentalFeesAmount),
    rental_fees_description: payload.rentalFeesDescription?.trim() || null,
    revenue_collection: payload.revenueCollection?.trim() || null,
    invoice_frequency: payload.invoiceFrequency?.trim() || null,
    is_active: payload.isActive !== false,
  };
  const query = payload.id
    ? supabase.from("provider_contracts").update(values).eq("id", payload.id).select().single()
    : supabase.from("provider_contracts").insert(values).select().single();
  const { data, error } = await query;
  if (error) throw error;
  const contract = data;

  if (Array.isArray(payload.schoolIds)) {
    const { error: deleteError } = await supabase.from("provider_contract_schools").delete().eq("provider_contract_id", contract.id);
    if (deleteError) throw deleteError;
    if (payload.schoolIds.length) {
      const { error: schoolError } = await supabase.from("provider_contract_schools").insert(payload.schoolIds.map(schoolId => ({ provider_contract_id: contract.id, school_id: schoolId })));
      if (schoolError) throw schoolError;
    }
  }
  return contract;
}
