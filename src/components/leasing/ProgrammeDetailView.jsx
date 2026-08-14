import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { formatCurrency } from "../../lib/dashboardData";
import "./ProgrammeDetailView.css";

const MONTHS = [
  "September", "October", "November", "December",
  "January", "February", "March", "April",
  "May", "June", "July", "August",
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
  "Term 1": ["September", "October", "November", "December"],
  "Term 2": ["January", "February", "March"],
  "Term 3": ["April", "May", "June", "July", "August"],
};

const MEASURES = [
  { key: "sales", label: "Sales" },
  { key: "commission", label: "Commission" },
  { key: "rentalFees", label: "Rental Fees" },
  { key: "totalRevenue", label: "Total Revenue", emphasis: true },
  { key: "schoolIncome", label: "School Income", emphasis: true },
];

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatDisplayValue(value) {
  const number = toNumber(value);
  return number === 0 ? "—" : formatCurrency(number);
}

function formatPeriodValue(value, viewMode) {
  const number = toNumber(value);

  if (number === 0) {
    return "—";
  }

  if (viewMode === "monthly") {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(number);
  }

  return formatCurrency(number);
}

function normaliseMonth(month) {
  if (!month) return "";

  const rawValue = String(month).trim();
  const isoDateMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoDateMatch) {
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

    return monthsByNumber[Number(isoDateMatch[2])] || "";
  }

  const parsedDate = new Date(rawValue);

  if (!Number.isNaN(parsedDate.getTime())) {
    return [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December",
    ][parsedDate.getUTCMonth()];
  }

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
    totalRevenue: measures.sales + measures.rentalFees,
    schoolIncome: measures.commission + measures.rentalFees,
  };
}

function addRecord(measures, record) {
  const amount = toNumber(record.amount);

  if (record.incomeType === "Sales") {
    measures.sales += amount;
  } else if (record.incomeType === "Commission") {
    measures.commission += amount;
  } else if (record.incomeType === "Rental Fees") {
    measures.rentalFees += amount;
  }
}

function getTermFromMonth(month) {
  const normalisedMonth = normaliseMonth(month);

  return (
    Object.entries(TERM_MONTHS).find(([, months]) =>
      months.includes(normalisedMonth)
    )?.[0] || "Unallocated"
  );
}

function getLatestAcademicYear(years) {
  if (years.length === 0) return "";

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
    () => records.filter((record) => record.program === programme),
    [records, programme]
  );

  const availableSchools = useMemo(
    () =>
      [...new Set(
        programmeSourceRecords
          .map((record) => record.school)
          .filter(Boolean)
      )].sort((a, b) => String(a).localeCompare(String(b))),
    [programmeSourceRecords]
  );

  const availableAcademicYears = useMemo(
    () =>
      [...new Set(
        programmeSourceRecords
          .map((record) => record.academicYear)
          .filter(Boolean)
      )].sort((a, b) => String(a).localeCompare(String(b))),
    [programmeSourceRecords]
  );

  const latestAcademicYear = useMemo(
    () => getLatestAcademicYear(availableAcademicYears),
    [availableAcademicYears]
  );

  const [viewMode, setViewMode] = useState("termly");
  const [mobilePeriod, setMobilePeriod] = useState("");
  const [detailFilters, setDetailFilters] = useState(() => ({
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
          record.academicYear !== detailFilters.academicYear
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
      MONTHS.map((month) => [month, createEmptyMeasures()])
    );

    programmeRecords.forEach((record) => {
      const month = normaliseMonth(record.month);

      if (month && grouped[month]) {
        addRecord(grouped[month], record);
      }
    });

    return MONTHS.map((month) => ({
      period: month,
      label: MONTH_LABELS[month],
      mobileLabel: month,
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
      const term =
        record.term && grouped[record.term]
          ? record.term
          : getTermFromMonth(record.month);

      if (grouped[term]) {
        addRecord(grouped[term], record);
      }
    });

    return Object.entries(grouped).map(([period, measures]) => ({
      period,
      label: period,
      mobileLabel: period,
      ...finishMeasures(measures),
    }));
  }, [programmeRecords]);

  const displayedPeriods =
    viewMode === "monthly" ? monthlyData : termlyData;

  const totals = useMemo(() => {
    const measures = createEmptyMeasures();

    programmeRecords.forEach((record) => {
      addRecord(measures, record);
    });

    return finishMeasures(measures);
  }, [programmeRecords]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () =>
      window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (displayedPeriods.length === 0) {
      setMobilePeriod("");
      return;
    }

    if (
      !displayedPeriods.some(
        (period) => period.period === mobilePeriod
      )
    ) {
      setMobilePeriod(displayedPeriods[0].period);
    }
  }, [displayedPeriods, mobilePeriod]);

  const selectedMobilePeriod =
    displayedPeriods.find(
      (period) => period.period === mobilePeriod
    ) || displayedPeriods[0];

  function handleDetailFilterChange(name, value) {
    setDetailFilters((current) => ({
      ...current,
      [name]: value,
    }));
  }

  const matrixGridTemplate =
    viewMode === "monthly"
      ? "110px repeat(12, 60px) 100px"
      : "118px repeat(3, minmax(92px, 1fr)) 104px";

  return (
    <section className="programme-detail-option2">
      <header className="programme-detail-option2-header">
        <div>
          <span className="programme-detail-option2-kicker">
            Programme details
          </span>
          <h2>{programme}</h2>
        </div>

        <button
          type="button"
          className="programme-detail-option2-close"
          onClick={onClose}
          aria-label="Close programme details"
          title="Close"
        >
          ×
        </button>
      </header>

      <div className="programme-detail-option2-toolbar">
        <div className="programme-detail-option2-filters">
          <label>
            <span>School</span>
            <select
              value={detailFilters.school}
              onChange={(event) =>
                handleDetailFilterChange("school", event.target.value)
              }
            >
              <option value="">All Schools</option>
              {availableSchools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Academic Year</span>
            <select
              value={detailFilters.academicYear}
              onChange={(event) =>
                handleDetailFilterChange(
                  "academicYear",
                  event.target.value
                )
              }
            >
              <option value="">All Academic Years</option>
              {availableAcademicYears.map((academicYear) => (
                <option
                  key={academicYear}
                  value={academicYear}
                >
                  {academicYear}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="programme-detail-option2-switch">
          <button
            type="button"
            className={viewMode === "termly" ? "active" : ""}
            onClick={() => setViewMode("termly")}
          >
            Termly
          </button>

          <button
            type="button"
            className={viewMode === "monthly" ? "active" : ""}
            onClick={() => setViewMode("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="programme-detail-option2-metrics">
        <div className="headline">
          <span>Total Revenue</span>
          <strong>{formatDisplayValue(totals.totalRevenue)}</strong>
        </div>

        <div className="headline">
          <span>School Income</span>
          <strong>{formatDisplayValue(totals.schoolIncome)}</strong>
        </div>

        <div>
          <span>Sales</span>
          <strong>{formatDisplayValue(totals.sales)}</strong>
        </div>

        <div>
          <span>Commission</span>
          <strong>{formatDisplayValue(totals.commission)}</strong>
        </div>

        <div>
          <span>Rental Fees</span>
          <strong>{formatDisplayValue(totals.rentalFees)}</strong>
        </div>
      </div>

      <div
        className={
          viewMode === "monthly"
            ? "programme-detail-option2-matrix-wrap monthly"
            : "programme-detail-option2-matrix-wrap termly"
        }
      >
        <div
          className="programme-detail-option2-matrix"
          style={{
            gridTemplateColumns: matrixGridTemplate,
          }}
        >
          <div className="programme-detail-option2-matrix-header label">
            Measure
          </div>

          {displayedPeriods.map((period) => (
            <div
              key={`header-${period.period}`}
              className="programme-detail-option2-matrix-header"
            >
              {period.label}
            </div>
          ))}

          <div className="programme-detail-option2-matrix-header total-header">
            Total
          </div>

          {MEASURES.flatMap((measure) => {
            const rowClass = measure.emphasis
              ? " emphasis"
              : "";

            return [
              <div
                key={`label-${measure.key}`}
                className={`programme-detail-option2-matrix-label${rowClass}`}
              >
                {measure.label}
              </div>,

              ...displayedPeriods.map((period) => (
                <div
                  key={`${measure.key}-${period.period}`}
                  className={`programme-detail-option2-matrix-value${rowClass}`}
                >
                  {formatPeriodValue(
                    period[measure.key],
                    viewMode
                  )}
                </div>
              )),

              <div
                key={`total-${measure.key}`}
                className={`programme-detail-option2-matrix-value total${rowClass}`}
              >
                {formatDisplayValue(
                  totals[measure.key]
                )}
              </div>,
            ];
          })}
        </div>
      </div>

      <div className="programme-detail-option2-mobile">
        <div className="programme-detail-option2-period-tabs">
          {displayedPeriods.map((period) => (
            <button
              key={period.period}
              type="button"
              className={
                selectedMobilePeriod?.period === period.period
                  ? "active"
                  : ""
              }
              onClick={() => setMobilePeriod(period.period)}
            >
              {viewMode === "monthly"
                ? period.label
                : period.period.replace("Term ", "T")}
            </button>
          ))}
        </div>

        {selectedMobilePeriod && (
          <div className="programme-detail-option2-mobile-card">
            <div className="programme-detail-option2-mobile-title">
              <span>
                {viewMode === "monthly"
                  ? "Month"
                  : "Reporting period"}
              </span>
              <strong>{selectedMobilePeriod.mobileLabel}</strong>
            </div>

            {MEASURES.map((measure) => (
              <div
                key={`${selectedMobilePeriod.period}-${measure.key}`}
                className={
                  measure.emphasis
                    ? "programme-detail-option2-mobile-row emphasis"
                    : "programme-detail-option2-mobile-row"
                }
              >
                <span>{measure.label}</span>
                <strong>
                  {formatPeriodValue(
                    selectedMobilePeriod[measure.key],
                    viewMode
                  )}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
