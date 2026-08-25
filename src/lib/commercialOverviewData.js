import { supabase } from "./supabase";

const PAGE_SIZE = 1000;

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

export async function fetchCommercialOverviewRecords() {
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
        stream:revenue_streams(code, name),
        metric:revenue_metrics(code, name)
      `)
      .eq("is_deleted", false)
      .range(from, to)
  );

  return rows.map((row) => ({
    id: row.id,
    academicYear: row.academic_year || "",
    month: row.month || "",
    term: row.term || "",
    scenario: row.scenario || "Actual",
    amount: Number(row.amount || 0),
    schoolCode: row.school?.code || "",
    schoolName: row.school?.name || row.school?.code || "",
    streamCode: row.stream?.code || "",
    streamName: row.stream?.name || row.stream?.code || "",
    metricCode: row.metric?.code || "",
    metricName: row.metric?.name || row.metric?.code || "",
  }));
}
