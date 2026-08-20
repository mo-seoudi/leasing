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

function getTermOrder(term) {
  if (term === "Term 1") return 1;
  if (term === "Term 2") return 2;
  if (term === "Term 3") return 3;
  return 99;
}

const MONTH_NUMBERS = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function getAcademicYearStartYear(academicYear) {
  const match = String(academicYear || "").match(/(20\d{2})/);
  return match ? Number(match[1]) : 0;
}

function resolveMonthInfo(record) {
  const rawMonth = String(record.month || "").trim();
  const dateMatch = rawMonth.match(/^(20\d{2})-(0?[1-9]|1[0-2])(?:-\d{1,2})?$/);

  if (dateMatch) {
    const year = Number(dateMatch[1]);
    const monthNumber = Number(dateMatch[2]);
    const date = new Date(Date.UTC(year, monthNumber - 1, 1));

    return {
      key: `${year}-${String(monthNumber).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }).format(date),
      sortValue: year * 100 + monthNumber,
    };
  }

  const monthNumber = MONTH_NUMBERS[rawMonth.toLowerCase()];
  const startYear = getAcademicYearStartYear(record.academicYear);

  if (monthNumber && startYear) {
    const calendarYear = monthNumber >= 9 ? startYear : startYear + 1;
    const date = new Date(Date.UTC(calendarYear, monthNumber - 1, 1));

    return {
      key: `${calendarYear}-${String(monthNumber).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      }).format(date),
      sortValue: calendarYear * 100 + monthNumber,
    };
  }

  if (record.termStart) {
    const date = new Date(record.termStart);

    if (!Number.isNaN(date.getTime())) {
      const year = date.getUTCFullYear();
      const monthNumber = date.getUTCMonth() + 1;

      return {
        key: `${year}-${String(monthNumber).padStart(2, "0")}`,
        label: new Intl.DateTimeFormat("en-GB", {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        }).format(date),
        sortValue: year * 100 + monthNumber,
      };
    }
  }

  return null;
}

function groupedBreakdown(filteredRecords, keyGetter, keyName) {
  const grouped = new Map();

  filteredRecords.forEach((record) => {
    const key = keyGetter(record);

    if (!grouped.has(key)) {
      grouped.set(key, {
        [keyName]: key,
        ...createEmptyMeasures(),
      });
    }

    addRecordToMeasures(grouped.get(key), record);
  });

  return [...grouped.values()]
    .map((item) => finishMeasures(item))
    .sort((a, b) => b.schoolIncome - a.schoolIncome);
}

export function calculateKPIs(filteredRecords = []) {
  const measures = createEmptyMeasures();
  filteredRecords.forEach((record) => addRecordToMeasures(measures, record));
  return finishMeasures(measures);
}

export function getMonthlyTrend(filteredRecords = []) {
  const grouped = new Map();

  filteredRecords.forEach((record) => {
    const monthInfo = resolveMonthInfo(record);
    if (!monthInfo) return;

    const key = `${record.academicYear || ""}|${monthInfo.key}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        academicYear: record.academicYear || "",
        month: monthInfo.key,
        label: monthInfo.label,
        term: record.term || "",
        monthKey: monthInfo.key,
        sortValue: monthInfo.sortValue,
        ...createEmptyMeasures(),
      });
    }

    addRecordToMeasures(grouped.get(key), record);
  });

  return [...grouped.values()]
    .map((item) => finishMeasures(item))
    .map((item) => ({
      ...item,
      incomeRate: item.totalRevenue
        ? (item.schoolIncome / item.totalRevenue) * 100
        : 0,
    }))
    .sort((a, b) => {
      if (a.sortValue !== b.sortValue) return a.sortValue - b.sortValue;
      return a.monthKey.localeCompare(b.monthKey);
    });
}

export function getSchoolBreakdown(filteredRecords = []) {
  return groupedBreakdown(
    filteredRecords,
    (record) => record.school || "Unspecified School",
    "school"
  );
}

export function getTermBreakdown(filteredRecords = []) {
  return groupedBreakdown(
    filteredRecords,
    (record) => record.term || "Unspecified Term",
    "term"
  ).sort((a, b) => getTermOrder(a.term) - getTermOrder(b.term));
}

export function getProgrammeGroupBreakdown(filteredRecords = []) {
  return groupedBreakdown(
    filteredRecords,
    (record) => record.programGroup || "Unspecified Group",
    "programGroup"
  );
}

export function getProgrammeBreakdown(filteredRecords = []) {
  const grouped = new Map();

  filteredRecords.forEach((record) => {
    const programme = record.program || "Unspecified Programme";

    if (!grouped.has(programme)) {
      grouped.set(programme, {
        programme,
        programGroup: record.programGroup || "Unspecified Group",
        provider: record.provider || "",
        ...createEmptyMeasures(),
      });
    }

    addRecordToMeasures(grouped.get(programme), record);
  });

  return [...grouped.values()]
    .map((item) => finishMeasures(item))
    .sort((a, b) => b.schoolIncome - a.schoolIncome);
}

export function getTopProgrammes(filteredRecords = [], limit = 10, measure = "schoolIncome") {
  return getProgrammeBreakdown(filteredRecords)
    .sort((a, b) => toNumber(b[measure]) - toNumber(a[measure]))
    .slice(0, limit);
}

export function getAcademicYearComparison(filteredRecords = []) {
  return groupedBreakdown(
    filteredRecords,
    (record) => record.academicYear || "Unspecified Academic Year",
    "academicYear"
  ).sort((a, b) => a.academicYear.localeCompare(b.academicYear));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}

export function formatPercentage(value, digits = 1) {
  return Number.isFinite(value) ? `${value.toFixed(digits)}%` : "—";
}
