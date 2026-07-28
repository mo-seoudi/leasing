import { useMemo, useState } from "react";

import ProgrammeTable from "../../components/ProgrammeTable";

import {
  filterRecords,
  getProgrammeBreakdown,
} from "../../lib/dashboardData";

import "./ProgrammeSummaryPage.css";
import "./ProgrammeDirectoryPage.css";

export default function ProgrammeDirectoryPage() {
  const [
    selectedProgrammeDetail,
    setSelectedProgrammeDetail,
  ] = useState("");

  const [searchText, setSearchText] = useState("");
  const [selectedGroup, setSelectedGroup] =
    useState("");

  /*
   * The directory initially uses all records.
   * The School and Academic Year selections remain independent
   * inside each expanded programme detail panel.
   */
  const allRecords = useMemo(
    () => filterRecords({}),
    []
  );

  const allProgrammeData = useMemo(
    () => getProgrammeBreakdown(allRecords),
    [allRecords]
  );

  const programmeGroups = useMemo(
    () =>
      [
        ...new Set(
          allProgrammeData
            .map((item) => item.programGroup)
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        String(a).localeCompare(String(b))
      ),
    [allProgrammeData]
  );

  const displayedProgrammeData = useMemo(() => {
    const normalisedSearch = searchText
      .trim()
      .toLowerCase();

    return allProgrammeData.filter((item) => {
      const matchesGroup =
        !selectedGroup ||
        item.programGroup === selectedGroup;

      const matchesSearch =
        !normalisedSearch ||
        String(item.programme || "")
          .toLowerCase()
          .includes(normalisedSearch) ||
        String(item.provider || "")
          .toLowerCase()
          .includes(normalisedSearch);

      return matchesGroup && matchesSearch;
    });
  }, [
    allProgrammeData,
    searchText,
    selectedGroup,
  ]);

  function handleProgrammeClick(programme) {
    setSelectedProgrammeDetail((current) =>
      current === programme ? "" : programme
    );
  }

  function clearDirectoryFilters() {
    setSearchText("");
    setSelectedGroup("");
    setSelectedProgrammeDetail("");
  }

  return (
    <section className="programme-summary-page programme-directory-page">
      <section className="directory-filter-card">
        <div className="directory-filter-heading">
          <div>
            <h2>Programmes & Academies</h2>

            <p>
              Browse all leasing programmes and open any
              programme to view its detailed monthly or
              termly figures.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={clearDirectoryFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className="directory-filter-grid">
          <div className="directory-filter">
            <label htmlFor="directory-search">
              Search
            </label>

            <input
              id="directory-search"
              type="search"
              value={searchText}
              placeholder="Search programme or provider"
              onChange={(event) => {
                setSearchText(event.target.value);
                setSelectedProgrammeDetail("");
              }}
            />
          </div>

          <div className="directory-filter">
            <label htmlFor="directory-group">
              Programme Group
            </label>

            <select
              id="directory-group"
              value={selectedGroup}
              onChange={(event) => {
                setSelectedGroup(event.target.value);
                setSelectedProgrammeDetail("");
              }}
            >
              <option value="">All Groups</option>

              {programmeGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          <div className="directory-result-count">
            <span>Programmes</span>

            <strong>
              {displayedProgrammeData.length}
            </strong>
          </div>
        </div>
      </section>

      <ProgrammeTable
        title="Programme Directory"
        data={displayedProgrammeData}
        records={allRecords}
        selectedProgramme={selectedProgrammeDetail}
        onProgrammeClick={handleProgrammeClick}
        onCloseProgramme={() =>
          setSelectedProgrammeDetail("")
        }
      />
    </section>
  );
}
