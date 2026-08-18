import { supabase } from "./supabase";

export async function fetchDataEntryOptions() {
  const [
    schoolsResult,
    streamsResult,
    metricsResult,
  ] = await Promise.all([
    supabase
      .from("schools")
      .select("id, code, name, short_name")
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("revenue_streams")
      .select("id, code, name")
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("revenue_metrics")
      .select(
        "id, revenue_stream_id, code, name, display_order"
      )
      .eq("is_active", true)
      .order("display_order"),
  ]);

  if (schoolsResult.error) {
    throw schoolsResult.error;
  }

  if (streamsResult.error) {
    throw streamsResult.error;
  }

  if (metricsResult.error) {
    throw metricsResult.error;
  }

  return {
    schools: schoolsResult.data || [],
    revenueStreams: streamsResult.data || [],
    metrics: metricsResult.data || [],
  };
}

export function getAcademicYearFromMonth(month) {
  if (!month) return "";

  const [yearString, monthString] = month.split("-");

  const year = Number(yearString);
  const monthNumber = Number(monthString);

  if (!year || !monthNumber) return "";

  const startYear =
    monthNumber >= 9 ? year : year - 1;

  const endYear = startYear + 1;

  return `AY${startYear}-${String(endYear).slice(-2)}`;
}

export function getFinanceTermFromMonth(month) {
  if (!month) return "";

  const monthNumber = Number(month.split("-")[1]);

  if ([9, 10, 11, 12].includes(monthNumber)) {
    return "Term 1";
  }

  if ([1, 2, 3].includes(monthNumber)) {
    return "Term 2";
  }

  if ([4, 5, 6, 7, 8].includes(monthNumber)) {
    return "Term 3";
  }

  return "";
}

export async function saveFinancialRecords({
  schoolId,
  revenueStreamId,
  month,
  scenario,
  metricValues,
}) {
  const academicYear =
    getAcademicYearFromMonth(month);

  const term =
    getFinanceTermFromMonth(month);

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

      programme_id: null,
      provider_id: null,
    }));

  if (!rows.length) {
    throw new Error(
      "Enter an amount for at least one metric."
    );
  }

  /*
   * Check for existing non-programme/non-provider records.
   *
   * This lets the form behave like an editor:
   * existing records are updated; new records are inserted.
   */
  for (const row of rows) {
    const { data: existing, error: lookupError } =
      await supabase
        .from("financial_records")
        .select("id")
        .eq("school_id", row.school_id)
        .eq(
          "revenue_stream_id",
          row.revenue_stream_id
        )
        .eq("metric_id", row.metric_id)
        .eq(
          "academic_year",
          row.academic_year
        )
        .eq("month", row.month)
        .eq("scenario", row.scenario)
        .is("programme_id", null)
        .is("provider_id", null)
        .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existing?.id) {
      const { error } = await supabase
        .from("financial_records")
        .update({
          amount: row.amount,
          term: row.term,
        })
        .eq("id", existing.id);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase
        .from("financial_records")
        .insert(row);

      if (error) {
        throw error;
      }
    }
  }

  return {
    academicYear,
    term,
    savedCount: rows.length,
  };
}
