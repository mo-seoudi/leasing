import dashboardData from "../data/leasing-full-truth-data.json";

/* -------------------------
   Raw Records
-------------------------- */

export const records = dashboardData.records;

/* -------------------------
   Metadata
-------------------------- */

export const metadata = dashboardData.metadata;

/* -------------------------
   Filter Lists
-------------------------- */

function unique(values) {
  return [...new Set(values)].sort();
}

export const schools = unique(
  records.map((r) => r.school)
);

export const academicYears = unique(
  records.map((r) => r.academicYear)
);

export const programmeGroups = unique(
  records.map((r) => r.programGroup)
);

export const programmes = unique(
  records.map((r) => r.program)
);

export const incomeTypes = unique(
  records.map((r) => r.incomeType)
);

/* -------------------------
   Generic Filtering
-------------------------- */

export function filterRecords(filters = {}) {

  return records.filter((r) => {

    if (filters.school && r.school !== filters.school)
      return false;

    if (
      filters.academicYear &&
      r.academicYear !== filters.academicYear
    )
      return false;

    if (
      filters.programGroup &&
      r.programGroup !== filters.programGroup
    )
      return false;

    if (
      filters.program &&
      r.program !== filters.program
    )
      return false;

    return true;
  });

}

/* -------------------------
   KPI Calculation
-------------------------- */

export function calculateKPIs(filteredRecords) {

  let sales = 0;
  let commission = 0;
  let rentalFees = 0;

  filteredRecords.forEach((r) => {

    switch (r.incomeType) {

      case "Sales":
        sales += r.amount;
        break;

      case "Commission":
        commission += r.amount;
        break;

      case "Rental Fees":
        rentalFees += r.amount;
        break;

      default:
        break;

    }

  });

  return {

    sales,

    commission,

    rentalFees,

    totalRevenue: sales + rentalFees,

    schoolIncome: commission + rentalFees

  };

}
