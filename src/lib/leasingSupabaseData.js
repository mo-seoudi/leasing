import { supabase } from "./supabase";

const PAGE_SIZE = 1000;

const SCHOOL_DISPLAY = {
  FRY: "Fry",
  ROSE: "Rose",
};

function getTermOrder(term) {
  if (term === "Term 1") return 1;
  if (term === "Term 2") return 2;
  if (term === "Term 3") return 3;
  return 0;
}

function mapLeasingRow(row) {
  return {
    id: row.id,
    school: SCHOOL_DISPLAY[row.school?.code] || row.school?.code || "",
    schoolCode: row.school?.code || "",
    schoolName: row.school?.name || row.school?.code || "",
    program: row.programme?.name || "",
    programGroup: row.programme?.category || "",
    provider: row.programme?.provider_name || row.provider?.name || "",
    incomeType: row.metric?.name || row.metric?.code || "",
    incomeTypeCode: row.metric?.code || "",
    month: row.month,
    academicYear: row.academic_year,
    term: row.term || "",
    termOrder: getTermOrder(row.term),
    amount: Number(row.amount || 0),
    scenario: row.scenario || "Actual",
  };
}

function mapDashboardSummaryRow(row) {
  const base = {
    school: SCHOOL_DISPLAY[row.school_code] || row.school_code || "",
    schoolCode: row.school_code || "",
    schoolName: row.school_name || row.school_code || "",
    month: row.month,
    academicYear: row.academic_year,
    term: row.term || "",
    termOrder: getTermOrder(row.term),
    scenario: "Actual",
  };

  return [
    {
      ...base,
      id: `${row.academic_year}-${row.month}-${row.school_code}-sales`,
      incomeType: "Sales",
      incomeTypeCode: "sales",
      amount: Number(row.sales || 0),
    },
    {
      ...base,
      id: `${row.academic_year}-${row.month}-${row.school_code}-commission`,
      incomeType: "Commission",
      incomeTypeCode: "commission",
      amount: Number(row.commission || 0),
    },
    {
      ...base,
      id: `${row.academic_year}-${row.month}-${row.school_code}-rental-fees`,
      incomeType: "Rental Fees",
      incomeTypeCode: "rental_fees",
      amount: Number(row.rental_fees || 0),
    },
  ];
}

async function getLeasingStreamId() {
  const { data: stream, error } = await supabase
    .from("revenue_streams")
    .select("id")
    .eq("code", "leasing")
    .single();

  if (error) throw error;
  return stream.id;
}

async function fetchPagedRecords(buildQuery) {
  const rows = [];
  let from = 0;

  while (true) {
    const { data, error } = await buildQuery(from, from + PAGE_SIZE - 1);
    if (error) throw error;

    const batch = data || [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}

export async function fetchLeasingDashboardSummary() {
  const { data, error } = await supabase
    .from("leasing_dashboard_summary")
    .select(`
      academic_year,
      month,
      term,
      school_id,
      school_code,
      school_name,
      sales,
      commission,
      rental_fees,
      total_revenue,
      school_income
    `)
    .order("academic_year", { ascending: true })
    .order("month", { ascending: true })
    .order("school_code", { ascending: true });

  if (error) throw error;

  return (data || []).flatMap(mapDashboardSummaryRow);
}

export async function fetchLeasingDashboardDimensions() {
  const records = await fetchLeasingDashboardSummary();
  const dimensions = getLeasingDimensions(records);

  const schoolMap = new Map();
  records.forEach((record) => {
    if (!record.schoolCode) return;
    schoolMap.set(record.school, {
      display: record.school,
      code: record.schoolCode,
    });
  });

  return {
    academicYears: dimensions.academicYears,
    schools: [...schoolMap.values()].sort((a, b) =>
      a.display.localeCompare(b.display)
    ),
  };
}

export async function fetchLeasingDashboardRecords({
  academicYear = "",
  schoolCode = "",
} = {}) {
  const records = await fetchLeasingDashboardSummary();

  return records.filter((record) => {
    if (academicYear && record.academicYear !== academicYear) return false;
    if (schoolCode && record.schoolCode !== schoolCode) return false;
    return true;
  });
}

export async function fetchLeasingRecords() {
  const streamId = await getLeasingStreamId();

  const rows = await fetchPagedRecords((from, to) =>
    supabase
      .from("financial_records")
      .select(`
        id,
        academic_year,
        month,
        term,
        scenario,
        amount,
        school:schools(code, name),
        metric:revenue_metrics(code, name),
        programme:programmes(id, name, category, provider_name),
        provider:providers(id, name)
      `)
      .eq("revenue_stream_id", streamId)
      .eq("is_deleted", false)
      .order("id", { ascending: true })
      .range(from, to)
  );

  return rows.map(mapLeasingRow);
}

export function getLeasingDimensions(records = []) {
  const unique = (values) =>
    [...new Set(values.filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b))
    );

  return {
    academicYears: unique(records.map((record) => record.academicYear)),
    schools: unique(records.map((record) => record.school)),
    programmeGroups: unique(records.map((record) => record.programGroup)),
    programmes: unique(records.map((record) => record.program)),
    incomeTypes: unique(records.map((record) => record.incomeType)),
  };
}

export function filterLeasingRecords(records = [], filters = {}) {
  return records.filter((record) => {
    if (filters.school && record.school !== filters.school) return false;
    if (filters.academicYear && record.academicYear !== filters.academicYear) return false;
    if (filters.programGroup && record.programGroup !== filters.programGroup) return false;
    if (filters.program && record.program !== filters.program) return false;
    if (filters.term && record.term !== filters.term) return false;
    return true;
  });
}

export function getAvailableLeasingProgrammes(records = [], selectedGroup = "") {
  const matching = selectedGroup
    ? records.filter((record) => record.programGroup === selectedGroup)
    : records;

  return [...new Set(matching.map((record) => record.program).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}
