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

export async function fetchLeasingRecords() {
  const { data: stream, error: streamError } = await supabase
    .from("revenue_streams")
    .select("id")
    .eq("code", "leasing")
    .single();

  if (streamError) {
    throw streamError;
  }

  const rows = [];
  let from = 0;

  while (true) {
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
        metric:revenue_metrics(code, name),
        programme:programmes(id, name, category, provider_name),
        provider:providers(id, name)
      `)
      .eq("revenue_stream_id", stream.id)
      .eq("is_deleted", false)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    const batch = data || [];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows.map((row) => ({
    id: row.id,
    school:
      SCHOOL_DISPLAY[row.school?.code] ||
      row.school?.code ||
      "",
    schoolCode: row.school?.code || "",
    schoolName: row.school?.name || row.school?.code || "",
    program: row.programme?.name || "",
    programGroup: row.programme?.category || "",
    provider:
      row.programme?.provider_name ||
      row.provider?.name ||
      "",
    incomeType: row.metric?.name || row.metric?.code || "",
    incomeTypeCode: row.metric?.code || "",
    month: row.month,
    academicYear: row.academic_year,
    term: row.term || "",
    termOrder: getTermOrder(row.term),
    amount: Number(row.amount || 0),
    scenario: row.scenario || "Actual",
  }));
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
    if (
      filters.academicYear &&
      record.academicYear !== filters.academicYear
    ) {
      return false;
    }
    if (
      filters.programGroup &&
      record.programGroup !== filters.programGroup
    ) {
      return false;
    }
    if (filters.program && record.program !== filters.program) return false;
    if (filters.term && record.term !== filters.term) return false;
    return true;
  });
}

export function getAvailableLeasingProgrammes(
  records = [],
  selectedGroup = ""
) {
  const matching = selectedGroup
    ? records.filter((record) => record.programGroup === selectedGroup)
    : records;

  return [...new Set(matching.map((record) => record.program).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}
