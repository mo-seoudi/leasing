export default function DashboardFilters({
  filters,
  schools,
  academicYears,
  programmeGroups,
 programmes,
  onChange,
}) {
  return (
    <div className="card">


      <div className="filters-grid">

        <div className="filter">

          <label>School</label>

          <select
            value={filters.school}
            onChange={(e) =>
              onChange("school", e.target.value)
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

        <div className="filter">

          <label>Academic Year</label>

          <select
            value={filters.academicYear}
            onChange={(e) =>
              onChange("academicYear", e.target.value)
            }
          >
            <option value="">All Academic Years</option>

            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}

          </select>

        </div>

        <div className="filter">

          <label>Programme Group</label>

          <select
            value={filters.programGroup}
            onChange={(e) =>
              onChange("programGroup", e.target.value)
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

        <div className="filter">

          <label>Programme</label>

          <select
            value={filters.program}
            onChange={(e) =>
              onChange("program", e.target.value)
            }
          >
            <option value="">All Programmes</option>

            {programmes.map((programme) => (
              <option
                key={programme}
                value={programme}
              >
                {programme}
              </option>
            ))}

          </select>

        </div>

      </div>

    </div>
  );
}
