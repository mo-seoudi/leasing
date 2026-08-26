import { supabase } from "./supabase";

const PAGE_SIZE = 1000;
const SCHOOL_DISPLAY = { FRY: "Fry", ROSE: "Rose" };
const METRIC_LABELS = {
  sales: "Sales",
  commission: "Commission",
  rental_fees: "Rental Fees",
};

let leasingStreamIdPromise = null;
let leasingSummaryCache = null;
let leasingSummaryPromise = null;
let leasingProgrammeSummaryCache = null;
let leasingProgrammeSummaryPromise = null;
let leasingRecordsCache = null;
let leasingRecordsPromise = null;

function getTermOrder(term) {
  if (term === "Term 1") return 1;
  if (term === "Term 2") return 2;
  if (term === "Term 3") return 3;
  return 0;
}

function mapLeasingRow(row) {
  const metricCode = row.metric?.code || "";

  return {
    id: row.id,
    school: SCHOOL_DISPLAY[row.school?.code] || row.school?.code || "",
    schoolCode: row.school?.code || "",
    schoolName: row.school?.name || row.school?.code || "",
    program: row.programme?.name || "",
    programGroup: row.programme?.category || "",
    providerId: row.programme?.provider_id ?? null,
    provider: row.programme?.provider?.name || row.programme?.provider_name || "",
    incomeType: METRIC_LABELS[metricCode] || row.metric?.name || metricCode,
    incomeTypeCode: metricCode,
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

function mapProgrammeSummaryRow(row) {
  const base = {
    school: SCHOOL_DISPLAY[row.school_code] || row.school_code || "",
    schoolCode: row.school_code || "",
    schoolName: row.school_name || row.school_code || "",
    program: row.programme_name || "",
    programGroup: row.programme_category || "",
    providerId: row.provider_id ?? null,
    provider: row.provider_name || "",
    academicYear: row.academic_year,
    term: "",
    termOrder: 0,
    month: "",
    scenario: "Actual",
    isProgrammeSummary: true,
  };

  return [
    {
      ...base,
      id: `summary-${row.academic_year}-${row.school_code}-${row.programme_id}-sales`,
      incomeType: "Sales",
      incomeTypeCode: "sales",
      amount: Number(row.sales || 0),
    },
    {
      ...base,
      id: `summary-${row.academic_year}-${row.school_code}-${row.programme_id}-commission`,
      incomeType: "Commission",
      incomeTypeCode: "commission",
      amount: Number(row.commission || 0),
    },
    {
      ...base,
      id: `summary-${row.academic_year}-${row.school_code}-${row.programme_id}-rental-fees`,
      incomeType: "Rental Fees",
      incomeTypeCode: "rental_fees",
      amount: Number(row.rental_fees || 0),
    },
  ];
}

async function getLeasingStreamId() {
  if (!leasingStreamIdPromise) {
    leasingStreamIdPromise = supabase
      .from("revenue_streams")
      .select("id")
      .eq("code", "leasing")
      .single()
      .then(({ data, error }) => {
        if (error) {
          leasingStreamIdPromise = null;
          throw error;
        }
        return data.id;
      });
  }

  return leasingStreamIdPromise;
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

export async function fetchLeasingDashboardSummary({ force = false } = {}) {
  if (!force && leasingSummaryCache) return leasingSummaryCache;
  if (!force && leasingSummaryPromise) return leasingSummaryPromise;

  leasingSummaryPromise = (async () => {
    const { data, error } = await supabase
      .from("leasing_dashboard_summary")
      .select(
        "academic_year, month, term, school_id, school_code, school_name, sales, commission, rental_fees, total_revenue, school_income"
      )
      .order("academic_year", { ascending: true })
      .order("month", { ascending: true })
      .order("school_code", { ascending: true });

    if (error) throw error;
    leasingSummaryCache = (data || []).flatMap(mapDashboardSummaryRow);
    return leasingSummaryCache;
  })();

  try {
    return await leasingSummaryPromise;
  } finally {
    leasingSummaryPromise = null;
  }
}

export async function fetchLeasingProgrammeSummary({ force = false } = {}) {
  if (!force && leasingProgrammeSummaryCache) return leasingProgrammeSummaryCache;
  if (!force && leasingProgrammeSummaryPromise) return leasingProgrammeSummaryPromise;

  leasingProgrammeSummaryPromise = (async () => {
    const { data, error } = await supabase
      .from("leasing_programme_summary")
      .select(
        "academic_year, school_id, school_code, school_name, programme_id, programme_name, programme_category, provider_name, sales, commission, rental_fees, total_revenue, school_income, provider_id"
      )
      .order("academic_year", { ascending: true })
      .order("programme_name", { ascending: true })
      .order("school_code", { ascending: true });

    if (error) throw error;
    leasingProgrammeSummaryCache = (data || []).flatMap(mapProgrammeSummaryRow);
    return leasingProgrammeSummaryCache;
  })();

  try {
    return await leasingProgrammeSummaryPromise;
  } finally {
    leasingProgrammeSummaryPromise = null;
  }
}

export async function fetchLeasingDashboardDimensions() {
  const records = await fetchLeasingDashboardSummary();
  const dimensions = getLeasingDimensions(records);
  const schoolMap = new Map();

  records.forEach((record) => {
    if (record.schoolCode) {
      schoolMap.set(record.school, {
        display: record.school,
        code: record.schoolCode,
      });
    }
  });

  return {
    academicYears: dimensions.academicYears,
    schools: [...schoolMap.values()].sort((a, b) => a.display.localeCompare(b.display)),
  };
}

export async function fetchLeasingDashboardRecords({
  academicYear = "",
  schoolCode = "",
} = {}) {
  const records = await fetchLeasingDashboardSummary();
  return records.filter(
    (record) =>
      (!academicYear || record.academicYear === academicYear) &&
      (!schoolCode || record.schoolCode === schoolCode)
  );
}

export async function fetchLeasingRecords({ force = false } = {}) {
  if (!force && leasingRecordsCache) return leasingRecordsCache;
  if (!force && leasingRecordsPromise) return leasingRecordsPromise;

  leasingRecordsPromise = (async () => {
    const streamId = await getLeasingStreamId();
    const rows = await fetchPagedRecords((from, to) =>
      supabase
        .from("financial_records")
        .select(
          "id, academic_year, month, term, scenario, amount, school:schools(code), metric:revenue_metrics(code), programme:programmes(name, category, provider_name, provider_id, provider:providers(name))"
        )
        .eq("revenue_stream_id", streamId)
        .eq("is_deleted", false)
        .order("id", { ascending: true })
        .range(from, to)
    );

    leasingRecordsCache = rows.map(mapLeasingRow);
    return leasingRecordsCache;
  })();

  try {
    return await leasingRecordsPromise;
  } finally {
    leasingRecordsPromise = null;
  }
}

export async function fetchLeasingDetailRecords({
  programme = "",
  programGroup = "",
} = {}) {
  const streamId = await getLeasingStreamId();
  let query = supabase
    .from("financial_records")
    .select(
      "id, academic_year, month, term, scenario, amount, school:schools(code), metric:revenue_metrics(code), programme:programmes!inner(name, category, provider_name, provider_id, provider:providers(name))"
    )
    .eq("revenue_stream_id", streamId)
    .eq("is_deleted", false)
    .order("id", { ascending: true });

  if (programme) query = query.eq("programme.name", programme);
  if (programGroup) query = query.eq("programme.category", programGroup);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapLeasingRow);
}

export function clearLeasingDataCache() {
  leasingSummaryCache = null;
  leasingSummaryPromise = null;
  leasingProgrammeSummaryCache = null;
  leasingProgrammeSummaryPromise = null;
  leasingRecordsCache = null;
  leasingRecordsPromise = null;
}

export function getLeasingDimensions(records = []) {
  const unique = (values) =>
    [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

  return {
    academicYears: unique(records.map((record) => record.academicYear)),
    schools: unique(records.map((record) => record.school)),
    programmeGroups: unique(records.map((record) => record.programGroup)),
    programmes: unique(records.map((record) => record.program)),
    incomeTypes: unique(records.map((record) => record.incomeType)),
  };
}

export function filterLeasingRecords(records = [], filters = {}) {
  return records.filter(
    (record) =>
      (!filters.school || record.school === filters.school) &&
      (!filters.academicYear || record.academicYear === filters.academicYear) &&
      (!filters.programGroup || record.programGroup === filters.programGroup) &&
      (!filters.program || record.program === filters.program) &&
      (!filters.term || record.term === filters.term)
  );
}

export function getAvailableLeasingProgrammes(records = [], selectedGroup = "") {
  const matching = selectedGroup
    ? records.filter((record) => record.programGroup === selectedGroup)
    : records;

  return [...new Set(matching.map((record) => record.program).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function createEmptyMeasures() {
  return {
    sales: 0,
    commission: 0,
    rentalFees: 0,
    totalRevenue: 0,
    schoolIncome: 0,
  };
}

function addRecordToMeasures(measures, record) {
  const amount = Number(record.amount || 0);
  if (record.incomeType === "Sales") measures.sales += amount;
  if (record.incomeType === "Commission") measures.commission += amount;
  if (record.incomeType === "Rental Fees") measures.rentalFees += amount;
}

function finishMeasures(measures) {
  return {
    ...measures,
    totalRevenue: measures.sales + measures.rentalFees,
    schoolIncome: measures.commission + measures.rentalFees,
  };
}

export function getLeasingProgrammeBreakdown(records = []) {
  const grouped = new Map();

  records.forEach((record) => {
    const programme = record.program || "Unspecified Programme";

    if (!grouped.has(programme)) {
      grouped.set(programme, {
        programme,
        programGroup: record.programGroup || "Unspecified Group",
        providerId: record.providerId ?? null,
        provider: record.provider || "",
        ...createEmptyMeasures(),
      });
    }

    addRecordToMeasures(grouped.get(programme), record);
  });

  return [...grouped.values()]
    .map(finishMeasures)
    .sort((a, b) => b.schoolIncome - a.schoolIncome);
}

export function formatLeasingCurrency(value) {
  const number = Number(value);
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(number) ? number : 0);
}
