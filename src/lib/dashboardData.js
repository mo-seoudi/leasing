import dashboardData from "../data/leasing-data.json";

/* ==========================
   Source Data
========================== */

export const records = Array.isArray(dashboardData.records)
  ? dashboardData.records
  : [];

export const metadata = dashboardData.metadata ?? {};

export const programCatalog =
  dashboardData.programCatalog ?? [];

/* ==========================
   General Helpers
========================== */

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b))
  );
}

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
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
  const amount = toNumber(record.amount);

  switch (record.incomeType) {
    case "Sales":
      measures.sales += amount;
      break;

    case "Commission":
      measures.commission += amount;
      break;

    case "Rental Fees":
      measures.rentalFees += amount;
      break;

    default:
      break;
  }
}

function finishMeasures(measures) {
  return {
    ...measures,

    totalRevenue:
      measures.sales + measures.rentalFees,

    schoolIncome:
      measures.commission + measures.rentalFees,
  };
}

/* ==========================
   Available Filter Values
========================== */

export const schools = unique(
  records.map((record) => record.school)
);

export const academicYears = unique(
  records.map((record) => record.academicYear)
);

export const programmeGroups = unique(
  records.map((record) => record.programGroup)
);

export const programmes = unique(
  records.map((record) => record.program)
);

export const incomeTypes = unique(
  records.map((record) => record.incomeType)
);

/* ==========================
   Filtering
========================== */

export function filterRecords(filters = {}) {
  return records.filter((record) => {
    if (
      filters.school &&
      record.school !== filters.school
    ) {
      return false;
    }

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

    if (
      filters.program &&
      record.program !== filters.program
    ) {
      return false;
    }

    if (
      filters.term &&
      record.term !== filters.term
    ) {
      return false;
    }

    return true;
  });
}

/* ==========================
   Dependent Filter Lists
========================== */

export function getAvailableProgrammes(
  selectedGroup = ""
) {
  const matchingRecords = selectedGroup
    ? records.filter(
        (record) =>
          record.programGroup === selectedGroup
      )
    : records;

  return unique(
    matchingRecords.map((record) => record.program)
  );
}

export function getAvailableTerms(
  selectedAcademicYear = ""
) {
  const matchingRecords = selectedAcademicYear
    ? records.filter(
        (record) =>
          record.academicYear ===
          selectedAcademicYear
      )
    : records;

  return unique(
    matchingRecords.map((record) => record.term)
  );
}

/* ==========================
   KPI Calculations
========================== */

export function calculateKPIs(
  filteredRecords = []
) {
  const measures = createEmptyMeasures();

  filteredRecords.forEach((record) => {
    addRecordToMeasures(measures, record);
  });

  return finishMeasures(measures);
}

/* ==========================
   Monthly Trend
========================== */

function getMonthKey(record) {
  if (record.termStart) {
    const date = new Date(record.termStart);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 7);
    }
  }

  return [
    record.academicYear,
    record.month,
  ]
    .filter(Boolean)
    .join("-");
}

function getMonthSortValue(record) {
  if (record.termStart) {
    const date = new Date(record.termStart);

    if (!Number.isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  const academicMonthOrder = {
    September: 1,
    Sep: 1,
    October: 2,
    Oct: 2,
    November: 3,
    Nov: 3,
    December: 4,
    Dec: 4,
    January: 5,
    Jan: 5,
    February: 6,
    Feb: 6,
    March: 7,
    Mar: 7,
    April: 8,
    Apr: 8,
    May: 9,
    June: 10,
    Jun: 10,
    July: 11,
    Jul: 11,
    August: 12,
    Aug: 12,
  };

  return (
    academicMonthOrder[record.month] ??
    record.termOrder ??
    999
  );
}

export function getMonthlyTrend(
  filteredRecords = []
) {
  const grouped = new Map();

  filteredRecords.forEach((record) => {
    const key = getMonthKey(record);

    if (!key) {
      return;
    }

    if (!grouped.has(key)) {
      grouped.set(key, {
        month: record.month || key,
        monthKey: key,
        sortValue: getMonthSortValue(record),
        ...createEmptyMeasures(),
      });
    }

    addRecordToMeasures(
      grouped.get(key),
      record
    );
  });

  return [...grouped.values()]
    .map((item) => finishMeasures(item))
    .sort((a, b) => {
      if (a.sortValue !== b.sortValue) {
        return a.sortValue - b.sortValue;
      }

      return a.monthKey.localeCompare(b.monthKey);
    });
}

/* ==========================
   Programme Breakdown
========================== */

export function getProgrammeBreakdown(
  filteredRecords = []
) {
  const grouped = new Map();

  filteredRecords.forEach((record) => {
    const programme =
      record.program || "Unspecified Programme";

    if (!grouped.has(programme)) {
      grouped.set(programme, {
        programme,
        programGroup:
          record.programGroup || "Unspecified Group",
        provider: record.provider || "",
        ...createEmptyMeasures(),
      });
    }

    addRecordToMeasures(
      grouped.get(programme),
      record
    );
  });

  return [...grouped.values()]
    .map((item) => finishMeasures(item))
    .sort(
      (a, b) =>
        b.schoolIncome - a.schoolIncome
    );
}

/* ==========================
   School Breakdown
========================== */

export function getSchoolBreakdown(
  filteredRecords = []
) {
  const grouped = new Map();

  filteredRecords.forEach((record) => {
    const school =
      record.school || "Unspecified School";

    if (!grouped.has(school)) {
      grouped.set(school, {
        school,
        ...createEmptyMeasures(),
      });
    }

    addRecordToMeasures(
      grouped.get(school),
      record
    );
  });

  return [...grouped.values()]
    .map((item) => finishMeasures(item))
    .sort(
      (a, b) =>
        b.schoolIncome - a.schoolIncome
    );
}

/* ==========================
   Programme Group Breakdown
========================== */

export function getProgrammeGroupBreakdown(
  filteredRecords = []
) {
  const grouped = new Map();

  filteredRecords.forEach((record) => {
    const group =
      record.programGroup || "Unspecified Group";

    if (!grouped.has(group)) {
      grouped.set(group, {
        programGroup: group,
        ...createEmptyMeasures(),
      });
    }

    addRecordToMeasures(
      grouped.get(group),
      record
    );
  });

  return [...grouped.values()]
    .map((item) => finishMeasures(item))
    .sort(
      (a, b) =>
        b.schoolIncome - a.schoolIncome
    );
}

/* ==========================
   Top Programmes
========================== */

export function getTopProgrammes(
  filteredRecords = [],
  limit = 10,
  measure = "schoolIncome"
) {
  const programmeData =
    getProgrammeBreakdown(filteredRecords);

  return programmeData
    .sort(
      (a, b) =>
        toNumber(b[measure]) -
        toNumber(a[measure])
    )
    .slice(0, limit);
}

/* ==========================
   Academic-Year Comparison
========================== */

export function getAcademicYearComparison(
  filteredRecords = []
) {
  const grouped = new Map();

  filteredRecords.forEach((record) => {
    const academicYear =
      record.academicYear ||
      "Unspecified Academic Year";

    if (!grouped.has(academicYear)) {
      grouped.set(academicYear, {
        academicYear,
        ...createEmptyMeasures(),
      });
    }

    addRecordToMeasures(
      grouped.get(academicYear),
      record
    );
  });

  return [...grouped.values()]
    .map((item) => finishMeasures(item))
    .sort((a, b) =>
      a.academicYear.localeCompare(
        b.academicYear
      )
    );
}

/* ==========================
   Currency Formatting
========================== */

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}
