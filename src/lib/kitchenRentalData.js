import { supabase } from "./supabase";

const STREAM_CODE = "kitchen_rental";

export async function fetchKitchenRentalRecords() {
  const { data, error } = await supabase
    .from("financial_records")
    .select(`
      id,
      academic_year,
      month,
      scenario,
      amount,
      school:schools(code, name),
      stream:revenue_streams!inner(code, name),
      metric:revenue_metrics(code, name)
    `)
    .eq("stream.code", STREAM_CODE)
    .eq("scenario", "Actual")
    .eq("is_deleted", false)
    .order("academic_year", { ascending: true });

  if (error) throw error;

  const years = new Map();
  (data || []).forEach((row) => {
    const key = `${row.academic_year}|${row.school?.code || ""}`;
    if (!years.has(key)) {
      years.set(key, {
        academicYear: row.academic_year || "",
        school: row.school?.name || row.school?.code || "",
        schoolCode: row.school?.code || "",
        annualRent: 0,
        vatRate: 0,
      });
    }
    const item = years.get(key);
    const metricCode = String(row.metric?.code || "").toLowerCase();
    if (metricCode === "rental_fees") item.annualRent = Number(row.amount || 0);
    if (metricCode === "vat_rate") item.vatRate = Number(row.amount || 0);
  });

  return [...years.values()].sort((a, b) => a.academicYear.localeCompare(b.academicYear));
}
