import { supabase } from "./supabase";

const MONTH_ORDER = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getMonthNumber(month) {
  if (!month || typeof month !== "string") return 0;
  return Number(month.slice(5, 7));
}

function getCalendarYear(month) {
  if (!month || typeof month !== "string") return 0;
  return Number(month.slice(0, 4));
}

function getTermOrder(term) {
  if (term === "Term 1") return 1;
  if (term === "Term 2") return 2;
  if (term === "Term 3") return 3;
  return 0;
}

export async function fetchPhotographyRecords() {
  const { data: stream, error: streamError } = await supabase
    .from("revenue_streams")
    .select("id")
    .eq("code", "photography")
    .maybeSingle();

  if (streamError) throw streamError;
  if (!stream?.id) return [];

  const { data, error } = await supabase
    .from("financial_records")
    .select(`
      id,
      academic_year,
      month,
      term,
      scenario,
      amount,
      school:schools(code, name),
      metric:revenue_metrics(code, name)
    `)
    .eq("revenue_stream_id", stream.id)
    .eq("is_deleted", false)
    .order("month", { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    school: row.school?.code || "",
    schoolName: row.school?.name || row.school?.code || "",
    revenueStream: "Photography",
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

export function getPhotographyAcademicYears(records = []) {
  return unique(records.map((record) => record.academicYear)).sort((a, b) => a.localeCompare(b));
}

export function getPhotographySchools(records = []) {
  const schools = new Map();
  records.forEach((record) => {
    if (!record.school) return;
    if (!schools.has(record.school)) {
      schools.set(record.school, { code: record.school, name: record.schoolName || record.school });
    }
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

export function filterPhotographyRecords(records = [], { academicYear = "", school = "", term = "", scenario = "Actual" } = {}) {
  return records.filter((record) => {
    if (academicYear && record.academicYear !== academicYear) return false;
    if (school && record.school !== school) return false;
    if (term && record.term !== term) return false;
    if (scenario && record.scenario !== scenario) return false;
    return true;
  });
}

export function getMonthlyPhotographyData(records = []) {
  const grouped = new Map();
  records.forEach((record) => {
    const key = `${record.academicYear}|${record.month}`;
    const current = grouped.get(key) || {
      key,
      academicYear: record.academicYear,
      month: record.month,
      term: record.term,
      sales: 0,
      commission: 0,
    };
    if (record.metric === "Sales") current.sales += Number(record.amount || 0);
    if (record.metric === "Commission") current.commission += Number(record.amount || 0);
    grouped.set(key, current);
  });

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0,
      label: new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" }).format(new Date(`${item.month}T00:00:00`)),
      monthNumber: getMonthNumber(item.month),
      yearNumber: getCalendarYear(item.month),
    }))
    .sort((a, b) => {
      const ay = a.academicYear.localeCompare(b.academicYear);
      if (ay !== 0) return ay;
      return MONTH_ORDER.indexOf(a.monthNumber) - MONTH_ORDER.indexOf(b.monthNumber);
    });
}

export function getSchoolPhotographyData(records = []) {
  const grouped = new Map();
  records.forEach((record) => {
    const current = grouped.get(record.school) || {
      school: record.school,
      schoolName: record.schoolName,
      sales: 0,
      commission: 0,
    };
    if (record.metric === "Sales") current.sales += Number(record.amount || 0);
    if (record.metric === "Commission") current.commission += Number(record.amount || 0);
    grouped.set(record.school, current);
  });
  return [...grouped.values()]
    .map((item) => ({ ...item, commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0 }))
    .sort((a, b) => b.sales - a.sales);
}

export function getTermPhotographyData(records = []) {
  const grouped = new Map();
  records.forEach((record) => {
    const current = grouped.get(record.term) || {
      term: record.term,
      termOrder: record.termOrder,
      sales: 0,
      commission: 0,
    };
    if (record.metric === "Sales") current.sales += Number(record.amount || 0);
    if (record.metric === "Commission") current.commission += Number(record.amount || 0);
    grouped.set(record.term, current);
  });
  return [...grouped.values()]
    .map((item) => ({ ...item, commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0 }))
    .sort((a, b) => a.termOrder - b.termOrder);
}

export function getPhotographySummary(records = []) {
  let sales = 0;
  let commission = 0;
  records.forEach((record) => {
    if (record.metric === "Sales") sales += Number(record.amount || 0);
    if (record.metric === "Commission") commission += Number(record.amount || 0);
  });
  const months = unique(records.map((record) => record.month)).length;
  const schools = unique(records.map((record) => record.school)).length;
  return {
    sales,
    commission,
    commissionRate: sales ? (commission / sales) * 100 : 0,
    averageMonthlySales: months ? sales / months : 0,
    averageMonthlyCommission: months ? commission / months : 0,
    months,
    schools,
  };
}
