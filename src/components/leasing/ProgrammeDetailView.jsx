import { useMemo, useState } from "react";

import { formatCurrency } from "../../lib/dashboardData";
import "./ProgrammeDetailView.css";

const MONTHS = [
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
];

const MONTH_LABELS = {
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec",
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
};

const TERM_MONTHS = {
  "Term 1": [
    "September",
    "October",
    "November",
    "December",
  ],
  "Term 2": [
    "January",
    "February",
    "March",
  ],
  "Term 3": [
    "April",
    "May",
    "June",
    "July",
    "August",
  ],
};

const MEASURES = [
  {
    key: "sales",
    label: "Sales",
    type: "detail",
  },
  {
    key: "commission",
    label: "Commission",
    type: "detail",
  },
  {
    key: "rentalFees",
    label: "Rental Fees",
    type: "detail",
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    type: "main",
  },
  {
    key: "schoolIncome",
    label: "School Income",
    type: "main",
  },
];

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function formatDisplayValue(value) {
  const number = toNumber(value);

  return number === 0 ? "-" : formatCurrency(number);
}

function normaliseMonth(month) {
  if (!month) {
    return "";
  }

  const rawValue = String(month).trim();

  // Handles ISO dates such as "2025-09-01".
  const isoDateMatch = rawValue.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (isoDateMatch) {
    const monthNumber = Number(isoDateMatch[2]);

    const monthsByNumber = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December",
    };

    return monthsByNumber[monthNumber] || "";
  }

  // Handles other valid date strings.
  const parsedDate = new Date(rawValue);

  if (!Number.isNaN(parsedDate.getTime())) {
    return [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][parsedDate.getUTCMonth()];
  }

  // Handles month names and abbreviations.
  const value = rawValue.toLowerCase();

  const monthNames = {
    jan: "January",
    january: "January",
    feb: "February",
    february: "February",
    mar: "March",
    march: "March",
    apr: "April",
    april: "April",
    may: "May",
    jun: "June",
    june: "June",
    jul: "July",
    july: "July",
    aug: "August",
    august: "August",
    sep: "September",
    sept: "September",
    september: "September",
    oct: "October",
    october: "October",
    nov: "November",
    november: "November",
    dec: "December",
    december: "December",
  };

  return monthNames[value] || "";
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

function finishMeasures(measures) {
  return {
    ...measures,
    totalRevenue:
      measures.sales + measures.rentalFees,
    schoolIncome:
      measures.commission + measures.rentalFees,
  };
}

function addRecord(measures, record) {
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

function getTermFromMonth(month) {
  const normalisedMonth = normaliseMonth(month);

  return (
    Object.entries(TERM_MONTHS).find(
      ([, months]) =>
        months.includes(normalisedMonth)
    )?.[0] || "Unallocated"
  );
}

function getLatestAcademicYear(years) {
  if (years.length === 0) {
    return "";
  }

  return [...years].sort((a, b) =>
    String(a).localeCompare(String(b))
  )[years.length - 1];
}

export default function ProgrammeDetailView({
  programme,
  records = [],
  onClose,
}) {
  const programmeSourceRecords = useMemo(
    () =>
      records.filter(
        (record) => record.program === programme
      ),
    [records, programme]
  );

  const availableSchools = useMemo(
    () =>
      [
        ...new Set(
          programmeSourceRecords
            .map((record) => record.school)
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        String(a).localeCompare(String(b))
      ),
    [programmeSourceRecords]
  );

  const availableAcademicYears = useMemo(
    () =>
      [
        ...new Set(
          programmeSourceRecords
            .map((record) => record.academicYear)
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        String(a).localeCompare(String(b))
      ),
    [programmeSourceRecords]
  );

  const latestAcademicYear = useMemo(
    () =>
      getLatestAcademicYear(
        availableAcademicYears
      ),
    [availableAcademicYears]
  );

  const [viewMode, setViewMode] =
    useState("termly");

  const [detailFilters, setDetailFilters] =
    useState(() => ({
      school: "",
      academicYear: latestAcademicYear,
    }));

  const programmeRecords = useMemo(
    () =>
      programmeSourceRecords.filter((record) => {
        if (
          detailFilters.school &&
          record.school !== detailFilters.school
        ) {
          return false;
        }

        if (
          detailFilters.academicYear &&
          record.academicYear !==
            detailFilters.academicYear
        ) {
          return false;
        }

        return true;
      }),
    [
      programmeSourceRecords,
      detailFilters.school,
      detailFilters.academicYear,
    ]
  );

  const monthlyData = useMemo(() => {
    const grouped = Object.fromEntries(
      MONTHS.map((month) => [
        month,
        createEmptyMeasures(),
      ])
    );

    programmeRecords.forEach((record) => {
      const month = normaliseMonth(record.month);

      if (!month || !grouped[month]) {
        return;
      }

      addRecord(grouped[month], record);
    });

    return MONTHS.map((month) => ({
      period: month,
      label: MONTH_LABELS[month],
      ...finishMeasures(grouped[month]),
    }));
  }, [programmeRecords]);

  const termlyData = useMemo(() => {
    const grouped = {
      "Term 1": createEmptyMeasures(),
      "Term 2": createEmptyMeasures(),
      "Term 3": createEmptyMeasures(),
    };

    programmeRecords.forEach((record) => {
      const recordTerm =
        record.term && grouped[record.term]
          ? record.term
          : getTermFromMonth(record.month);

      if (!grouped[recordTerm]) {
        return;
      }

      addRecord(grouped[recordTerm], record);
    });

    return Object.entries(grouped).map(
      ([term, measures]) => ({
        period: term,
        label: term,
        ...finishMeasures(measures),
      })
    );
  }, [programmeRecords]);

  const displayedPeriods =
    viewMode === "monthly"
      ? monthlyData
      : termlyData;

  const totals = useMemo(() => {
    const measures = createEmptyMeasures();

    programmeRecords.forEach((record) => {
      addRecord(measures, record);
    });

    return finishMeasures(measures);
  }, [programmeRecords]);

  function handleDetailFilterChange(
    name,
    value
  ) {
    setDetailFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  return (
    <section className="programme-detail-panel">
      <header className="programme-detail-header">
        <div>
          <span className="programme-detail-eyebrow">
            Programme details
          </span>

          <h2>{programme}</h2>

          <p>
            Detailed income figures by school,
            academic year, month, or term.
          </p>
        </div>

        <button
          type="button"
          className="programme-detail-close"
          onClick={onClose}
        >
          Close details
        </button>
      </header>

      <div className="programme-detail-controls">
        <div className="programme-detail-filters">
          <div className="programme-detail-filter">
            <label htmlFor="detail-school">
              School
            </label>

            <select
              id="detail-school"
              value={detailFilters.school}
              onChange={(event) =>
                handleDetailFilterChange(
                  "school",
                  event.target.value
                )
              }
            >
              <option value="">All Schools</option>

              {availableSchools.map((school) => (
                <option
                  key={school}
                  value={school}
                >
                  {school}
                </option>
              ))}
            </select>
          </div>

          <div className="programme-detail-filter">
            <label htmlFor="detail-academic-year">
              Academic Year
            </label>

            <select
              id="detail-academic-year"
              value={detailFilters.academicYear}
              onChange={(event) =>
                handleDetailFilterChange(
                  "academicYear",
                  event.target.value
                )
              }
            >
              <option value="">
                All Academic Years
              </option>

              {availableAcademicYears.map(
                (academicYear) => (
                  <option
                    key={academicYear}
                    value={academicYear}
                  >
                    {academicYear}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="programme-detail-tabs">
          <button
            type="button"
            className={
              viewMode === "termly"
                ? "active"
                : ""
            }
            onClick={() =>
              setViewMode("termly")
            }
          >
            Termly
          </button>

          <button
            type="button"
            className={
              viewMode === "monthly"
                ? "active"
                : ""
            }
            onClick={() =>
              setViewMode("monthly")
            }
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="programme-detail-summary">
        <div className="main-summary">
          <span>Total Revenue</span>

          <strong>
            {formatDisplayValue(
              totals.totalRevenue
            )}
          </strong>

          <small>Sales + Rental Fees</small>
        </div>

        <div className="main-summary">
          <span>School Income</span>

          <strong>
            {formatDisplayValue(
              totals.schoolIncome
            )}
          </strong>

          <small>
            Commission + Rental Fees
          </small>
        </div>

        <div>
          <span>Sales</span>

          <strong>
            {formatDisplayValue(totals.sales)}
          </strong>
        </div>

        <div>
          <span>Commission</span>

          <strong>
            {formatDisplayValue(
              totals.commission
            )}
          </strong>
        </div>

        <div>
          <span>Rental Fees</span>

          <strong>
            {formatDisplayValue(
              totals.rentalFees
            )}
          </strong>
        </div>
      </div>

      <div className="programme-detail-table-scroll">
        <table className="programme-detail-table">
          <thead>
            <tr>
              <th>Measure</th>

              {displayedPeriods.map((period) => (
                <th key={period.period}>
                  {period.label}
                </th>
              ))}

              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {MEASURES.map((measure) => (
              <tr
                key={measure.key}
                className={
                  measure.type === "main"
                    ? "main-measure-row"
                    : ""
                }
              >
                <th>{measure.label}</th>

                {displayedPeriods.map(
                  (period) => (
                    <td
                      key={`${measure.key}-${period.period}`}
                    >
                      {formatDisplayValue(
                        period[measure.key]
                      )}
                    </td>
                  )
                )}

                <td className="detail-total-cell">
                  {formatDisplayValue(
                    totals[measure.key]
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
