import { supabase } from "./supabase";

const FINANCE_MONTH_ORDER = [
  9, 10, 11, 12,
  1, 2, 3, 4,
  5, 6, 7, 8,
];

const BACK_TO_SCHOOL_MONTH_ORDER = [
  8, 9, 10, 11,
  12, 1, 2, 3,
  4, 5, 6, 7,
];

function unique(values) {
  return [
    ...new Set(
      values.filter(Boolean)
    ),
  ];
}

function getMonthNumber(month) {
  if (
    !month ||
    typeof month !== "string"
  ) {
    return 0;
  }

  return Number(
    month.slice(5, 7)
  );
}

function getCalendarYear(month) {
  if (
    !month ||
    typeof month !== "string"
  ) {
    return 0;
  }

  return Number(
    month.slice(0, 4)
  );
}

function getTermOrder(term) {
  if (term === "Term 1") return 1;
  if (term === "Term 2") return 2;
  if (term === "Term 3") return 3;

  return 0;
}

function getBackToSchoolAcademicYear(
  month
) {
  const calendarYear =
    getCalendarYear(month);

  if (!calendarYear) {
    return "";
  }

  return `AY${calendarYear}-${String(
    (calendarYear + 1) % 100
  ).padStart(2, "0")}`;
}

function applyUniformYearBasis(
  record,
  yearBasis = "finance"
) {
  if (
    yearBasis !== "backToSchool"
  ) {
    return record;
  }

  const monthNumber =
    getMonthNumber(record.month);

  if (monthNumber !== 8) {
    return record;
  }

  return {
    ...record,

    academicYear:
      getBackToSchoolAcademicYear(
        record.month
      ) ||
      record.academicYear,

    term: "Term 1",
    termOrder: 1,
  };
}

function getMonthOrder(
  yearBasis = "finance"
) {
  return yearBasis ===
    "backToSchool"
    ? BACK_TO_SCHOOL_MONTH_ORDER
    : FINANCE_MONTH_ORDER;
}

export const uniformTerms = [
  "Term 1",
  "Term 2",
  "Term 3",
];

export async function fetchUniformRecords() {
  const {
    data: stream,
    error: streamError,
  } = await supabase
    .from("revenue_streams")
    .select("id")
    .eq("code", "uniform")
    .single();

  if (streamError) {
    throw streamError;
  }

  const {
    data,
    error,
  } = await supabase
    .from("financial_records")
    .select(`
      id,
      academic_year,
      month,
      term,
      scenario,
      amount,
      is_deleted,

      school:schools(
        code,
        name
      ),

      metric:revenue_metrics(
        code,
        name
      )
    `)
    .eq(
      "revenue_stream_id",
      stream.id
    )
    .eq("is_deleted", false)
    .order("month", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data || []).map(
    (row) => ({
      id: row.id,

      school:
        row.school?.code || "",

      schoolName:
        row.school?.name ||
        row.school?.code ||
        "",

      revenueStream: "Uniform",

      metric:
        row.metric?.name ||
        row.metric?.code ||
        "",

      metricCode:
        row.metric?.code || "",

      scenario:
        row.scenario ||
        "Actual",

      month: row.month,

      academicYear:
        row.academic_year,

      term:
        row.term || "",

      termOrder:
        getTermOrder(row.term),

      amount:
        Number(row.amount || 0),
    })
  );
}

export function getUniformAcademicYears(
  records = [],
  yearBasis = "finance"
) {
  return unique(
    records.map(
      (record) =>
        applyUniformYearBasis(
          record,
          yearBasis
        ).academicYear
    )
  ).sort(
    (a, b) =>
      a.localeCompare(b)
  );
}

export function getUniformSchools(
  records = []
) {
  const schools = new Map();

  records.forEach((record) => {
    if (!record.school) {
      return;
    }

    if (
      !schools.has(record.school)
    ) {
      schools.set(
        record.school,
        {
          code:
            record.school,

          name:
            record.schoolName ||
            record.school,
        }
      );
    }
  });

  return [
    ...schools.values(),
  ].sort(
    (a, b) =>
      a.name.localeCompare(
        b.name
      )
  );
}

export function formatCurrency(
  value
) {
  return new Intl.NumberFormat(
    "en-AE",
    {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(value || 0)
  );
}

export function formatCompactCurrency(
  value
) {
  return new Intl.NumberFormat(
    "en-AE",
    {
      style: "currency",
      currency: "AED",
      notation: "compact",
      maximumFractionDigits: 1,
    }
  ).format(
    Number(value || 0)
  );
}

export function formatPercentage(
  value,
  digits = 1
) {
  if (
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return `${value.toFixed(
    digits
  )}%`;
}

export function filterUniformRecords(
  records = [],
  {
    academicYear = "",
    school = "",
    term = "",
    scenario = "Actual",
    yearBasis = "finance",
  } = {}
) {
  return records
    .map((record) =>
      applyUniformYearBasis(
        record,
        yearBasis
      )
    )
    .filter((record) => {
      if (
        academicYear &&
        record.academicYear !==
          academicYear
      ) {
        return false;
      }

      if (
        school &&
        record.school !== school
      ) {
        return false;
      }

      if (
        term &&
        record.term !== term
      ) {
        return false;
      }

      if (
        scenario &&
        record.scenario !==
          scenario
      ) {
        return false;
      }

      return true;
    });
}

export function getMonthlyUniformData(
  records,
  yearBasis = "finance"
) {
  const grouped =
    new Map();

  records.forEach(
    (record) => {
      const key =
        `${record.academicYear}|${record.month}`;

      const current =
        grouped.get(key) || {
          key,

          academicYear:
            record.academicYear,

          month:
            record.month,

          term:
            record.term,

          sales: 0,

          commission: 0,
        };

      if (
        record.metric ===
        "Sales"
      ) {
        current.sales +=
          Number(
            record.amount || 0
          );
      }

      if (
        record.metric ===
        "Commission"
      ) {
        current.commission +=
          Number(
            record.amount || 0
          );
      }

      grouped.set(
        key,
        current
      );
    }
  );

  const monthOrder =
    getMonthOrder(yearBasis);

  return [
    ...grouped.values(),
  ]
    .map((item) => ({
      ...item,

      commissionRate:
        item.sales
          ? (
              item.commission /
              item.sales
            ) * 100
          : 0,

      label:
        new Intl.DateTimeFormat(
          "en-GB",
          {
            month: "short",
            year: "2-digit",
          }
        ).format(
          new Date(
            `${item.month}T00:00:00`
          )
        ),

      monthNumber:
        getMonthNumber(
          item.month
        ),

      yearNumber:
        getCalendarYear(
          item.month
        ),
    }))
    .sort((a, b) => {
      const ay =
        a.academicYear.localeCompare(
          b.academicYear
        );

      if (ay !== 0) {
        return ay;
      }

      return (
        monthOrder.indexOf(
          a.monthNumber
        ) -
        monthOrder.indexOf(
          b.monthNumber
        )
      );
    });
}

export function getSchoolUniformData(
  records
) {
  const grouped =
    new Map();

  records.forEach(
    (record) => {
      const current =
        grouped.get(
          record.school
        ) || {
          school:
            record.school,

          schoolName:
            record.schoolName,

          sales: 0,

          commission: 0,
        };

      if (
        record.metric ===
        "Sales"
      ) {
        current.sales +=
          Number(
            record.amount || 0
          );
      }

      if (
        record.metric ===
        "Commission"
      ) {
        current.commission +=
          Number(
            record.amount || 0
          );
      }

      grouped.set(
        record.school,
        current
      );
    }
  );

  return [
    ...grouped.values(),
  ]
    .map((item) => ({
      ...item,

      commissionRate:
        item.sales
          ? (
              item.commission /
              item.sales
            ) * 100
          : 0,
    }))
    .sort(
      (a, b) =>
        b.sales - a.sales
    );
}

export function getTermUniformData(
  records
) {
  const grouped =
    new Map();

  records.forEach(
    (record) => {
      const current =
        grouped.get(
          record.term
        ) || {
          term:
            record.term,

          termOrder:
            record.termOrder,

          sales: 0,

          commission: 0,
        };

      if (
        record.metric ===
        "Sales"
      ) {
        current.sales +=
          Number(
            record.amount || 0
          );
      }

      if (
        record.metric ===
        "Commission"
      ) {
        current.commission +=
          Number(
            record.amount || 0
          );
      }

      grouped.set(
        record.term,
        current
      );
    }
  );

  return [
    ...grouped.values(),
  ]
    .map((item) => ({
      ...item,

      commissionRate:
        item.sales
          ? (
              item.commission /
              item.sales
            ) * 100
          : 0,
    }))
    .sort(
      (a, b) =>
        a.termOrder -
        b.termOrder
    );
}

export function getUniformSummary(
  records
) {
  let sales = 0;
  let commission = 0;

  records.forEach(
    (record) => {
      if (
        record.metric ===
        "Sales"
      ) {
        sales += Number(
          record.amount || 0
        );
      }

      if (
        record.metric ===
        "Commission"
      ) {
        commission += Number(
          record.amount || 0
        );
      }
    }
  );

  const months = unique(
    records.map(
      (record) =>
        record.month
    )
  ).length;

  const schools = unique(
    records.map(
      (record) =>
        record.school
    )
  ).length;

  return {
    sales,

    commission,

    commissionRate:
      sales
        ? (
            commission /
            sales
          ) * 100
        : 0,

    averageMonthlySales:
      months
        ? sales / months
        : 0,

    averageMonthlyCommission:
      months
        ? commission /
          months
        : 0,

    months,

    schools,
  };
}

export function getUniformAcademicYearComparison(
  records
) {
  const grouped =
    new Map();

  records.forEach(
    (record) => {
      const academicYear =
        record.academicYear;

      if (!academicYear) {
        return;
      }

      const current =
        grouped.get(
          academicYear
        ) || {
          academicYear,

          sales: 0,

          commission: 0,

          months:
            new Set(),

          schools:
            new Set(),
        };

      const amount =
        Number(
          record.amount || 0
        );

      if (
        record.metric ===
        "Sales"
      ) {
        current.sales +=
          amount;
      }

      if (
        record.metric ===
        "Commission"
      ) {
        current.commission +=
          amount;
      }

      if (record.month) {
        current.months.add(
          record.month
        );
      }

      if (record.school) {
        current.schools.add(
          record.school
        );
      }

      grouped.set(
        academicYear,
        current
      );
    }
  );

  return [
    ...grouped.values(),
  ]
    .map((item) => ({
      academicYear:
        item.academicYear,

      sales:
        item.sales,

      commission:
        item.commission,

      commissionRate:
        item.sales > 0
          ? (
              item.commission /
              item.sales
            ) * 100
          : 0,

      months:
        item.months.size,

      schools:
        item.schools.size,
    }))
    .sort(
      (a, b) =>
        a.academicYear.localeCompare(
          b.academicYear
        )
    );
}
