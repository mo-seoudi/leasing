import { supabase } from "./supabase";

export async function fetchDataEntryOptions() {
  const [schoolsResult, streamsResult, metricsResult, programmesResult] = await Promise.all([
    supabase.from("schools").select("id, code, name, short_name").eq("is_active", true).order("name"),
    supabase.from("revenue_streams").select("id, code, name").eq("is_active", true).order("name"),
    supabase.from("revenue_metrics").select("id, revenue_stream_id, code, name, display_order").eq("is_active", true).order("display_order"),
    supabase.from("programmes").select("id, name, category, provider_name").order("name"),
  ]);

  if (schoolsResult.error) throw schoolsResult.error;
  if (streamsResult.error) throw streamsResult.error;
  if (metricsResult.error) throw metricsResult.error;
  if (programmesResult.error) throw programmesResult.error;

  return {
    schools: schoolsResult.data || [],
    revenueStreams: streamsResult.data || [],
    metrics: metricsResult.data || [],
    programmes: programmesResult.data || [],
  };
}

async function getCurrentUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user?.id) throw new Error("You must be signed in to modify financial records.");
  return user.id;
}

export function getAcademicYearFromMonth(month) {
  if (!month) return "";
  const [yearString, monthString] = month.split("-");
  const year = Number(yearString);
  const monthNumber = Number(monthString);
  if (!year || !monthNumber) return "";
  const startYear = monthNumber >= 9 ? year : year - 1;
  return `AY${startYear}-${String(startYear + 1).slice(-2)}`;
}

export function getFinanceTermFromMonth(month) {
  if (!month) return "";
  const monthNumber = Number(month.split("-")[1]);
  if ([9, 10, 11, 12].includes(monthNumber)) return "Term 1";
  if ([1, 2, 3].includes(monthNumber)) return "Term 2";
  if ([4, 5, 6, 7, 8].includes(monthNumber)) return "Term 3";
  return "";
}

export async function saveFinancialRecords({ schoolId, revenueStreamId, programmeId = "", month, scenario, metricValues }) {
  const userId = await getCurrentUserId();
  const academicYear = getAcademicYearFromMonth(month);
  const term = getFinanceTermFromMonth(month);

  const { data: stream, error: streamError } = await supabase
    .from("revenue_streams")
    .select("code")
    .eq("id", Number(revenueStreamId))
    .single();
  if (streamError) throw streamError;

  const isLeasing = stream?.code === "leasing";
  if (isLeasing && !programmeId) {
    throw new Error("Select a programme for Leasing financial records.");
  }

  const resolvedProgrammeId = isLeasing ? Number(programmeId) : null;
  const rows = Object.entries(metricValues)
    .filter(([, value]) => value !== "")
    .map(([metricId, value]) => ({
      school_id: Number(schoolId),
      revenue_stream_id: Number(revenueStreamId),
      metric_id: Number(metricId),
      academic_year: academicYear,
      month: `${month}-01`,
      term,
      scenario,
      amount: Number(value),
      programme_id: resolvedProgrammeId,
      provider_id: null,
    }));

  if (!rows.length) throw new Error("Enter an amount for at least one metric.");

  for (const row of rows) {
    let lookup = supabase
      .from("financial_records")
      .select("id")
      .eq("school_id", row.school_id)
      .eq("revenue_stream_id", row.revenue_stream_id)
      .eq("metric_id", row.metric_id)
      .eq("academic_year", row.academic_year)
      .eq("month", row.month)
      .eq("scenario", row.scenario)
      .eq("is_deleted", false);

    lookup = row.programme_id ? lookup.eq("programme_id", row.programme_id) : lookup.is("programme_id", null);
    const { data: existing, error: lookupError } = await lookup.maybeSingle();
    if (lookupError) throw lookupError;

    if (existing?.id) {
      const { error } = await supabase
        .from("financial_records")
        .update({ amount: row.amount, term: row.term, programme_id: row.programme_id, provider_id: null, updated_by: userId })
        .eq("id", existing.id)
        .eq("is_deleted", false);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("financial_records").insert({
        ...row,
        is_deleted: false,
        created_by: userId,
        updated_by: userId,
        deleted_by: null,
        deleted_at: null,
      });
      if (error) throw error;
    }
  }

  return { academicYear, term, savedCount: rows.length };
}

export async function fetchFinancialRecords({ schoolId = "", revenueStreamId = "", academicYear = "", month = "", scenario = "", includeDeleted = false } = {}) {
  let query = supabase
    .from("financial_records")
    .select(`
      id, academic_year, month, term, scenario, amount, programme_id, provider_id,
      created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, is_deleted,
      school:schools(id, code, name, short_name),
      revenue_stream:revenue_streams(id, code, name),
      metric:revenue_metrics(id, code, name),
      programme:programmes(id, name, category, provider_name)
    `)
    .order("month", { ascending: false });

  if (!includeDeleted) query = query.eq("is_deleted", false);
  if (schoolId) query = query.eq("school_id", Number(schoolId));
  if (revenueStreamId) query = query.eq("revenue_stream_id", Number(revenueStreamId));
  if (academicYear) query = query.eq("academic_year", academicYear);
  if (month) query = query.eq("month", `${month}-01`);
  if (scenario) query = query.eq("scenario", scenario);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateFinancialRecord(recordId, { amount, scenario, month, programmeId }) {
  const userId = await getCurrentUserId();
  const changes = { updated_by: userId };
  if (amount !== undefined && amount !== "") changes.amount = Number(amount);
  if (scenario) changes.scenario = scenario;
  if (month) {
    changes.month = `${month}-01`;
    changes.academic_year = getAcademicYearFromMonth(month);
    changes.term = getFinanceTermFromMonth(month);
  }
  if (programmeId !== undefined) {
    changes.programme_id = programmeId ? Number(programmeId) : null;
    changes.provider_id = null;
  }

  const { data, error } = await supabase
    .from("financial_records")
    .update(changes)
    .eq("id", recordId)
    .eq("is_deleted", false)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function archiveFinancialRecord(recordId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("financial_records")
    .update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: userId, updated_by: userId })
    .eq("id", recordId)
    .eq("is_deleted", false)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function restoreFinancialRecord(recordId) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("financial_records")
    .update({ is_deleted: false, deleted_at: null, deleted_by: null, updated_by: userId })
    .eq("id", recordId)
    .eq("is_deleted", true)
    .select()
    .single();
  if (error) throw error;
  return data;
}
