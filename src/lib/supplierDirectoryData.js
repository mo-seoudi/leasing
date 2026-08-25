import { supabase } from "./supabase";

function mapContract(row) {
  return {
    contractId: row.contract_id,
    providerId: row.provider_id,
    supplierName: row.supplier_name || "",
    contactPerson: row.contact_person || "",
    email: row.email || "",
    phone: row.phone || "",
    companyNumber: row.company_number || "",
    address: row.address || "",
    revenueStreamId: row.revenue_stream_id,
    revenueStreamCode: row.revenue_stream_code || "",
    revenueStreamName: row.revenue_stream_name || "Not assigned",
    status: row.status || "Not Recorded",
    startDate: row.start_date || "",
    expiryDate: row.expiry_date || "",
    noticePeriod: row.notice_period || "",
    commissionRate: row.commission_rate == null ? null : Number(row.commission_rate),
    rentalFeesAmount: row.rental_fees_amount == null ? null : Number(row.rental_fees_amount),
    rentalFeesDescription: row.rental_fees_description || "",
    revenueCollection: row.revenue_collection || "",
    invoiceFrequency: row.invoice_frequency || "",
    isActive: Boolean(row.is_active),
    schools: Array.isArray(row.schools) ? row.schools : [],
  };
}

export async function fetchSupplierContracts() {
  const { data, error } = await supabase
    .from("supplier_contract_register")
    .select("*")
    .order("revenue_stream_name", { ascending: true })
    .order("supplier_name", { ascending: true });

  if (error) throw error;
  return (data || []).map(mapContract);
}

export async function fetchSupplierDirectoryFilters() {
  const [{ data: streams, error: streamError }, { data: schools, error: schoolError }] = await Promise.all([
    supabase.from("revenue_streams").select("id, code, name").eq("is_active", true).order("name"),
    supabase.from("schools").select("id, code, name").eq("is_active", true).order("name"),
  ]);
  if (streamError) throw streamError;
  if (schoolError) throw schoolError;
  return { streams: streams || [], schools: schools || [] };
}
