import cateringData from "../data/catering-data.json";

const MONTH_ORDER = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export const cateringRecords = cateringData.records || [];
export const cateringMetadata = cateringData.metadata || {};

export const cateringAcademicYears = unique(
  cateringRecords.map((record) => record.academicYear)
).sort((a, b) => a.localeCompare(b));

export const cateringSchools = Object.entries(
  cateringMetadata.schools || {}
).map(([code, name]) => ({ code, name }));

export const cateringTerms = ["Term 1", "Term 2", "Term 3"];

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: cateringMetadata.currency || "AED",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: cateringMetadata.currency || "AED",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export function formatPercentage(value, digits = 1) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function filterCateringRecords({
  academicYear = "",
  school = "",
  term = "",
  scenario = "Actual",
} = {}) {
  return cateringRecords.filter((record) => {
    if (academicYear && record.academicYear !== academicYear) return false;
    if (school && record.school !== school) return false;
    if (term && record.term !== term) return false;
    if (scenario && record.scenario !== scenario) return false;
    return true;
  });
}

export function getMonthlyCateringData(records) {
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

    if (record.metric === "Sales") current.sales += Number(record.amount || 0);
    if (record.metric === "Commission") current.commission += Number(record.amount || 0);
    grouped.set(key, current);
  });

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0,
      label: new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "2-digit",
      }).format(new Date(`${item.month}T00:00:00`)),
      monthNumber: Number(item.month.slice(5, 7)),
      yearNumber: Number(item.month.slice(0, 4)),
    }))
    .sort((a, b) => {
      const ay = a.academicYear.localeCompare(b.academicYear);
      if (ay !== 0) return ay;
      return MONTH_ORDER.indexOf(a.monthNumber) - MONTH_ORDER.indexOf(b.monthNumber);
    });
}

export function getSchoolCateringData(records) {
  const grouped = new Map();

  records.forEach((record) => {
    const current = grouped.get(record.school) || {
      school: record.school,
      schoolName: record.schoolName,
      sales: 0,
      commission: 0,
    };

    if (record.metric === "Sales") current.sales += Number(record.amount || 0);
    if (record.metric === "Commission") current.commission += Number(record.amount || 0);
    grouped.set(record.school, current);
  });

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0,
    }))
    .sort((a, b) => b.sales - a.sales);
}

export function getTermCateringData(records) {
  const grouped = new Map();

  records.forEach((record) => {
    const current = grouped.get(record.term) || {
      term: record.term,
      termOrder: record.termOrder,
      sales: 0,
      commission: 0,
    };

    if (record.metric === "Sales") current.sales += Number(record.amount || 0);
    if (record.metric === "Commission") current.commission += Number(record.amount || 0);
    grouped.set(record.term, current);
  });

  return [...grouped.values()]
    .map((item) => ({
      ...item,
      commissionRate: item.sales ? (item.commission / item.sales) * 100 : 0,
    }))
    .sort((a, b) => a.termOrder - b.termOrder);
}

export function getCateringSummary(records) {
  let sales = 0;
  let commission = 0;

  records.forEach((record) => {
    if (record.metric === "Sales") sales += Number(record.amount || 0);
    if (record.metric === "Commission") commission += Number(record.amount || 0);
  });

  const months = unique(records.map((record) => record.month)).length;
  const schools = unique(records.map((record) => record.school)).length;

  return {
    sales,
    commission,
    commissionRate: sales ? (commission / sales) * 100 : 0,
    averageMonthlySales: months ? sales / months : 0,
    averageMonthlyCommission: months ? commission / months : 0,
    months,
    schools,
  };
}

export function getCateringAcademicYearComparison(records) {
  const grouped = new Map();

  records.forEach((record) => {
    const academicYear = record.academicYear;

    if (!academicYear) {
      return;
    }

    const current = grouped.get(academicYear) || {
      academicYear,
      sales: 0,
      commission: 0,
      months: new Set(),
      schools: new Set(),
    };

    const amount = Number(record.amount || 0);

    if (record.metric === "Sales") {
      current.sales += amount;
    }

    if (record.metric === "Commission") {
      current.commission += amount;
    }

    if (record.month) {
      current.months.add(record.month);
    }

    if (record.school) {
      current.schools.add(record.school);
    }

    grouped.set(academicYear, current);
  });

  return [...grouped.values()]
    .map((item) => ({
      academicYear: item.academicYear,
      sales: item.sales,
      commission: item.commission,
      commissionRate:
        item.sales > 0
          ? (item.commission / item.sales) * 100
          : 0,
      months: item.months.size,
      schools: item.schools.size,
    }))
    .sort((a, b) =>
      a.academicYear.localeCompare(b.academicYear)
    );
}
