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

export async function fetchTransportRecords() {
  const { data: stream, error: streamError } = await supabase
    .from("revenue_streams")
    .select("id")
    .eq("code", "transport")
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

  return (data || []).map((row) => {
    const metricCode = String(row.metric?.code || "").toLowerCase();
    const metric = metricCode === "transport_fees"
      ? "Transport Fees"
      : row.metric?.name || row.metric?.code || "";

    return {
      id: row.id,
      school: row.school?.code || "",
      schoolName: row.school?.name || row.school?.code || "",
      revenueStream: "Transport",
      metric,
      metricCode,
      scenario: row.scenario || "Actual",
      month: row.month,
      academicYear: row.academic_year,
      term: row.term || "",
      termOrder: getTermOrder(row.term),
      amount: Number(row.amount || 0),
    };
  });
}

export function getTransportAcademicYears(records = []) {
  return unique(records.map((record) => record.academicYear)).sort((a, b) => a.localeCompare(b));
}

export function getTransportSchools(records = []) {
  const schools = new Map();
  records.forEach((record) => {
    if (record.school && !schools.has(record.school)) {
      schools.set(record.school, { code: record.school, name: record.schoolName || record.school });
    }
  });
  return [...schools.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export function formatPercentage(value, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function filterTransportRecords(
  records = [],
  { academicYear = "", school = "", term = "", scenario = "Actual" } = {}
) {
  return records.filter((record) => {
    if (academicYear && record.academicYear !== academicYear) return false;
    if (school && record.school !== school) return false;
    if (term && record.term !== term) return false;
    if (scenario && record.scenario !== scenario) return false;
    return true;
  });
}

function isTransportFees(record) {
  return record.metricCode === "transport_fees" || record.metric === "Transport Fees";
}

function isCommission(record) {
  return record.metricCode === "commission" || record.metric === "Commission";
}

export function getMonthlyTransportData(records = []) {
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
    if (isTransportFees(record)) current.sales += Number(record.amount || 0);
    if (isCommission(record)) current.commission += Number(record.amount || 0);
    grouped.set(key, current);
  });

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      transportFees: item.sales,
      commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0,
      label: new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" }).format(new Date(`${item.month}T00:00:00`)),
      monthNumber: Number(item.month.slice(5, 7)),
      yearNumber: Number(item.month.slice(0, 4)),
    }))
    .sort((a, b) => {
      const ay = a.academicYear.localeCompare(b.academicYear);
      return ay !== 0 ? ay : MONTH_ORDER.indexOf(a.monthNumber) - MONTH_ORDER.indexOf(b.monthNumber);
    });
}

export function getSchoolTransportData(records = []) {
  const grouped = new Map();
  records.forEach((record) => {
    const current = grouped.get(record.school) || {
      school: record.school,
      schoolName: record.schoolName,
      sales: 0,
      commission: 0,
    };
    if (isTransportFees(record)) current.sales += Number(record.amount || 0);
    if (isCommission(record)) current.commission += Number(record.amount || 0);
    grouped.set(record.school, current);
  });

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      transportFees: item.sales,
      commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0,
    }))
    .sort((a, b) => b.sales - a.sales);
}

export function getTermTransportData(records = []) {
  const grouped = new Map();
  records.forEach((record) => {
    const current = grouped.get(record.term) || {
      term: record.term,
      termOrder: record.termOrder,
      sales: 0,
      commission: 0,
    };
    if (isTransportFees(record)) current.sales += Number(record.amount || 0);
    if (isCommission(record)) current.commission += Number(record.amount || 0);
    grouped.set(record.term, current);
  });

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      transportFees: item.sales,
      commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0,
    }))
    .sort((a, b) => a.termOrder - b.termOrder);
}

export function getTransportSummary(records = []) {
  let transportFees = 0;
  let commission = 0;

  records.forEach((record) => {
    if (isTransportFees(record)) transportFees += Number(record.amount || 0);
    if (isCommission(record)) commission += Number(record.amount || 0);
  });

  const months = unique(records.map((record) => record.month)).length;
  const schools = unique(records.map((record) => record.school)).length;

  return {
    transportFees,
    sales: transportFees,
    commission,
    commissionRate: transportFees ? (commission / transportFees) * 100 : 0,
    averageMonthlyFees: months ? transportFees / months : 0,
    averageMonthlyCommission: months ? commission / months : 0,
    months,
    schools,
  };
}
