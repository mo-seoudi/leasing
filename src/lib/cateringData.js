import { supabase } from "./supabase";

const MONTH_ORDER = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getTermOrder(term) {
  if (term === "Term 1") return 1;
  if (term === "Term 2") return 2;
  if (term === "Term 3") return 3;
  return 0;
}

function mapSummaryRow(row) {
  const base = {
    school: row.school_code || "",
    schoolName: row.school_name || row.school_code || "",
    revenueStream: "Catering",
    scenario: row.scenario || "Actual",
    month: row.month,
    academicYear: row.academic_year,
    term: row.term || "",
    termOrder: getTermOrder(row.term),
  };

  return [
    { ...base, id: `${row.academic_year}-${row.month}-${row.school_code || "all"}-${row.scenario || "Actual"}-sales`, metric: "Sales", metricCode: "sales", amount: Number(row.sales || 0) },
    { ...base, id: `${row.academic_year}-${row.month}-${row.school_code || "all"}-${row.scenario || "Actual"}-commission`, metric: "Commission", metricCode: "commission", amount: Number(row.commission || 0) },
  ];
}

async function fetchDetailedRecords() {
  const { data: stream, error: streamError } = await supabase.from("revenue_streams").select("id").eq("code", "catering").single();
  if (streamError) throw streamError;

  const { data, error } = await supabase
    .from("financial_records")
    .select(`id, academic_year, month, term, scenario, amount, school:schools(code, name), metric:revenue_metrics(code, name)`)
    .eq("revenue_stream_id", stream.id)
    .eq("is_deleted", false)
    .order("month", { ascending: true });
  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    school: row.school?.code || "",
    schoolName: row.school?.name || row.school?.code || "",
    revenueStream: "Catering",
    metric: row.metric?.name || row.metric?.code || "",
    metricCode: row.metric?.code || "",
    scenario: row.scenario || "Actual",
    month: row.month,
    academicYear: row.academic_year,
    term: row.term || "",
    termOrder: getTermOrder(row.term),
    amount: Number(row.amount || 0),
  }));
}

export async function fetchCateringRecords() {
  const { data, error } = await supabase
    .from("catering_dashboard_summary")
    .select(`academic_year, month, term, scenario, school_id, school_code, school_name, sales, commission`)
    .order("academic_year", { ascending: true })
    .order("month", { ascending: true })
    .order("school_code", { ascending: true });

  if (!error) return (data || []).flatMap(mapSummaryRow);

  if (error.code === "PGRST205" || String(error.message || "").includes("catering_dashboard_summary")) {
    console.warn("Catering summary view is unavailable; falling back to detailed financial records.");
    return fetchDetailedRecords();
  }
  throw error;
}

export const cateringTerms = ["Term 1", "Term 2", "Term 3"];

export function getCateringAcademicYears(records = []) {
  return unique(records.map((record) => record.academicYear)).sort((a, b) => a.localeCompare(b));
}

export function getCateringSchools(records = []) {
  const schools = new Map();
  records.forEach((record) => {
    if (record.school && !schools.has(record.school)) schools.set(record.school, { code: record.school, name: record.schoolName || record.school });
  });
  return [...schools.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(Number(value || 0));
}

export function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED", notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0));
}

export function formatPercentage(value, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function filterCateringRecords(records = [], { academicYear = "", school = "", term = "", scenario = "Actual" } = {}) {
  return records.filter((record) => {
    if (academicYear && record.academicYear !== academicYear) return false;
    if (school && record.school !== school) return false;
    if (term && record.term !== term) return false;
    if (scenario && record.scenario !== scenario) return false;
    return true;
  });
}

export function getMonthlyCateringData(records) {
  const grouped = new Map();
  records.forEach((record) => {
    const key = `${record.academicYear}|${record.month}`;
    const current = grouped.get(key) || { key, academicYear: record.academicYear, month: record.month, term: record.term, sales: 0, commission: 0 };
    if (record.metric === "Sales") current.sales += Number(record.amount || 0);
    if (record.metric === "Commission") current.commission += Number(record.amount || 0);
    grouped.set(key, current);
  });
  return [...grouped.values()].map((item) => ({
    ...item,
    commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0,
    label: new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" }).format(new Date(`${item.month}T00:00:00`)),
    monthNumber: Number(item.month.slice(5, 7)),
    yearNumber: Number(item.month.slice(0, 4)),
  })).sort((a, b) => {
    const ay = a.academicYear.localeCompare(b.academicYear);
    return ay !== 0 ? ay : MONTH_ORDER.indexOf(a.monthNumber) - MONTH_ORDER.indexOf(b.monthNumber);
  });
}

export function getSchoolCateringData(records) {
  const grouped = new Map();
  records.forEach((record) => {
    const current = grouped.get(record.school) || { school: record.school, schoolName: record.schoolName, sales: 0, commission: 0 };
    if (record.metric === "Sales") current.sales += Number(record.amount || 0);
    if (record.metric === "Commission") current.commission += Number(record.amount || 0);
    grouped.set(record.school, current);
  });
  return [...grouped.values()].map((item) => ({ ...item, commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0 })).sort((a, b) => b.sales - a.sales);
}

export function getTermCateringData(records) {
  const grouped = new Map();
  records.forEach((record) => {
    const current = grouped.get(record.term) || { term: record.term, termOrder: record.termOrder, sales: 0, commission: 0 };
    if (record.metric === "Sales") current.sales += Number(record.amount || 0);
    if (record.metric === "Commission") current.commission += Number(record.amount || 0);
    grouped.set(record.term, current);
  });
  return [...grouped.values()].map((item) => ({ ...item, commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0 })).sort((a, b) => a.termOrder - b.termOrder);
}

export function getCateringSummary(records) {
  let sales = 0, commission = 0;
  records.forEach((record) => {
    if (record.metric === "Sales") sales += Number(record.amount || 0);
    if (record.metric === "Commission") commission += Number(record.amount || 0);
  });
  const months = unique(records.map((record) => record.month)).length;
  const schools = unique(records.map((record) => record.school)).length;
  return { sales, commission, commissionRate: sales ? (commission / sales) * 100 : 0, averageMonthlySales: months ? sales / months : 0, averageMonthlyCommission: months ? commission / months : 0, months, schools };
}

export function getCateringAcademicYearComparison(records) {
  const grouped = new Map();
  records.forEach((record) => {
    if (!record.academicYear) return;
    const current = grouped.get(record.academicYear) || { academicYear: record.academicYear, sales: 0, commission: 0, months: new Set(), schools: new Set() };
    const amount = Number(record.amount || 0);
    if (record.metric === "Sales") current.sales += amount;
    if (record.metric === "Commission") current.commission += amount;
    if (record.month) current.months.add(record.month);
    if (record.school) current.schools.add(record.school);
    grouped.set(record.academicYear, current);
  });
  return [...grouped.values()].map((item) => ({ academicYear: item.academicYear, sales: item.sales, commission: item.commission, commissionRate: item.sales > 0 ? (item.commission / item.sales) * 100 : 0, months: item.months.size, schools: item.schools.size })).sort((a, b) => a.academicYear.localeCompare(b.academicYear));
}
