import { useMemo, useState } from "react";

import ProgrammeDirectoryTable from "../../components/ProgrammeDirectoryTable";

import {
  academicYears,
  filterRecords,
  formatCurrency,
  getProgrammeBreakdown,
  programmeGroups,
  schools,
} from "../../lib/dashboardData";

import "./ProgrammeComparisonPage.css";
import "./ProgrammeDirectoryPage.css";

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

export default function ProgrammeDirectoryPage() {
  const latestAcademicYear =
    academicYears[academicYears.length - 1] || "";

  const [filters, setFilters] = useState({
    academicYear: latestAcademicYear,
    school: "",
    programGroup: "",
    searchText: "",
  });

  const [
    selectedProgrammeDetail,
    setSelectedProgrammeDetail,
  ] = useState("");

  const [viewMode, setViewMode] = useState("table");

  const allRecords = useMemo(
    () => filterRecords({}),
    []
  );

  const filteredRecords = useMemo(
    () =>
      filterRecords({
        academicYear: filters.academicYear,
        school: filters.school,
        programGroup: filters.programGroup,
      }),
    [
      filters.academicYear,
      filters.school,
      filters.programGroup,
    ]
  );

  const programmeData = useMemo(() => {
    const breakdown =
      getProgrammeBreakdown(filteredRecords);

    const searchValue = filters.searchText
      .trim()
      .toLowerCase();

    const visibleProgrammes = breakdown.filter(
      (item) => {
        if (!searchValue) {
          return true;
        }

        const programmeName = String(
          item.programme || ""
        ).toLowerCase();

        const providerName = String(
          item.provider || ""
        ).toLowerCase();

        return (
          programmeName.includes(searchValue) ||
          providerName.includes(searchValue)
        );
      }
    );

    const totalRevenue = visibleProgrammes.reduce(
      (total, item) =>
        total + toNumber(item.totalRevenue),
      0
    );

    const totalSchoolIncome = visibleProgrammes.reduce(
      (total, item) =>
        total + toNumber(item.schoolIncome),
      0
    );

    return visibleProgrammes
      .map((item) => ({
        ...item,

        revenueShare:
          totalRevenue > 0
            ? (toNumber(item.totalRevenue) /
                totalRevenue) *
              100
            : 0,

        incomeShare:
          totalSchoolIncome > 0
            ? (toNumber(item.schoolIncome) /
                totalSchoolIncome) *
              100
            : 0,
      }))
      .sort(
        (a, b) =>
          toNumber(b.totalRevenue) -
          toNumber(a.totalRevenue)
      );
  }, [filteredRecords, filters.searchText]);

  const totals = useMemo(
    () =>
      programmeData.reduce(
        (result, item) => ({
          totalRevenue:
            result.totalRevenue +
            toNumber(item.totalRevenue),

          schoolIncome:
            result.schoolIncome +
            toNumber(item.schoolIncome),
        }),
        {
          totalRevenue: 0,
          schoolIncome: 0,
        }
      ),
    [programmeData]
  );

  function handleFilterChange(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    setSelectedProgrammeDetail("");
  }

  function handleProgrammeClick(programme) {
    setSelectedProgrammeDetail((current) =>
      current === programme ? "" : programme
    );
  }

  function handleViewModeChange(mode) {
    setViewMode(mode);

    if (mode === "chart") {
      setSelectedProgrammeDetail("");
    }
  }

  function clearFilters() {
    setFilters({
      academicYear: latestAcademicYear,
      school: "",
      programGroup: "",
      searchText: "",
    });

    setSelectedProgrammeDetail("");
    setViewMode("table");
  }

  const selectedPeriodLabel =
    filters.academicYear || "All Time";

  return (
    <section className="programme-comparison-page programme-directory-page">
      <section className="programme-filter-card">
        <div className="programme-card-heading programme-filter-heading">
          <div>
            <h2>Directory Filters</h2>

            <p>
              Compare programmes and expand any row to view
              detailed monthly or termly figures.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="programme-filter-grid directory-comparison-filter-grid">
          <div className="programme-filter">
            <label htmlFor="directory-academic-year">
              Academic Year
            </label>

            <select
              id="directory-academic-year"
              value={filters.academicYear}
              onChange={(event) =>
                handleFilterChange(
                  "academicYear",
                  event.target.value
                )
              }
            >
              <option value="">All Time</option>

              {academicYears.map((academicYear) => (
                <option
                  key={academicYear}
                  value={academicYear}
                >
                  {academicYear}
                </option>
              ))}
            </select>
          </div>

          <div className="programme-filter">
            <label htmlFor="directory-school">
              School
            </label>

            <select
              id="directory-school"
              value={filters.school}
              onChange={(event) =>
                handleFilterChange(
                  "school",
                  event.target.value
                )
              }
            >
              <option value="">All Schools</option>

              {schools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          <div className="programme-filter">
            <label htmlFor="directory-programme-group">
              Programme Group
            </label>

            <select
              id="directory-programme-group"
              value={filters.programGroup}
              onChange={(event) =>
                handleFilterChange(
                  "programGroup",
                  event.target.value
                )
              }
            >
              <option value="">All Groups</option>

              {programmeGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="programme-filter directory-search-filter">
            <label htmlFor="directory-search">
              Search
            </label>

            <input
              id="directory-search"
              type="search"
              value={filters.searchText}
              placeholder="Programme or provider"
              onChange={(event) =>
                handleFilterChange(
                  "searchText",
                  event.target.value
                )
              }
            />
          </div>
        </div>
      </section>

      <section className="programme-summary-strip">
        <div>
          <span>Total Revenue</span>

          <strong>
            {formatCurrency(totals.totalRevenue)}
          </strong>
        </div>

        <div>
          <span>School Income</span>

          <strong>
            {formatCurrency(totals.schoolIncome)}
          </strong>
        </div>

        <div>
          <span>Programmes</span>

          <strong>{programmeData.length}</strong>
        </div>

        <div>
          <span>Selected Period</span>

          <strong>{selectedPeriodLabel}</strong>
        </div>
      </section>

      <ProgrammeDirectoryTable
        data={programmeData}
        records={allRecords}
        selectedProgramme={selectedProgrammeDetail}
        onProgrammeClick={handleProgrammeClick}
        onCloseProgramme={() =>
          setSelectedProgrammeDetail("")
        }
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
    </section>
  );
}
