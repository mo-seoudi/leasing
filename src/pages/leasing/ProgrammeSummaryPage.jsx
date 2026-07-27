import { useMemo, useState } from "react";

import DashboardFilters from "../../components/DashboardFilters";
import KpiCard from "../../components/KpiCard";
import ProgrammeBreakdownChart from "../../components/ProgrammeBreakdownChart";
import ProgrammeTable from "../../components/ProgrammeTable";
import ProgrammeDetailView from "../../components/leasing/ProgrammeDetailView";

import "./ProgrammeSummaryPage.css";

import {
  academicYears,
  calculateKPIs,
  filterRecords,
  getAvailableProgrammes,
  getProgrammeBreakdown,
  getTopProgrammes,
  programmeGroups,
  schools,
} from "../../lib/dashboardData";

const metricLabels = {
  totalRevenue: "Total Revenue",
  schoolIncome: "School Income",
  sales: "Sales",
  commission: "Commission",
  rentalFees: "Rental Fees",
};

const metricCards = [
  {
    key: "totalRevenue",
    title: "Total Revenue",
    color: "#2563eb",
    type: "primary",
    description: "Sales + Rental Fees",
  },
  {
    key: "schoolIncome",
    title: "School Income",
    color: "#0f4c81",
    type: "primary",
    description: "Commission + Rental Fees",
  },
  {
    key: "sales",
    title: "Sales",
    color: "#7c3aed",
    type: "secondary",
  },
  {
    key: "commission",
    title: "Commission",
    color: "#16a34a",
    type: "secondary",
  },
  {
    key: "rentalFees",
    title: "Rental Fees",
    color: "#d97706",
    type: "secondary",
  },
];

export default function ProgrammeSummaryPage() {
  const [filters, setFilters] = useState({
    school: "",
    academicYear: "",
    programGroup: "",
    program: "",
  });

  const [selectedMetric, setSelectedMetric] =
    useState("totalRevenue");

  const [
    selectedProgrammeDetail,
    setSelectedProgrammeDetail,
  ] = useState("");

  const availableProgrammes = useMemo(
    () => getAvailableProgrammes(filters.programGroup),
    [filters.programGroup]
  );

  const filteredData = useMemo(
    () => filterRecords(filters),
    [filters]
  );

  const kpis = useMemo(
    () => calculateKPIs(filteredData),
    [filteredData]
  );

  const programmeData = useMemo(
    () => getProgrammeBreakdown(filteredData),
    [filteredData]
  );

  const topProgrammeData = useMemo(
    () =>
      getTopProgrammes(
        filteredData,
        10,
        selectedMetric
      ),
    [filteredData, selectedMetric]
  );

  function handleFilterChange(name, value) {
    setFilters((currentFilters) => {
      const updatedFilters = {
        ...currentFilters,
        [name]: value,
      };

      if (name === "programGroup") {
        updatedFilters.program = "";
      }

      return updatedFilters;
    });

    // Close any open programme details when filters change.
    setSelectedProgrammeDetail("");
  }

  function handleProgrammeDetailClick(programme) {
    setSelectedProgrammeDetail((current) =>
      current === programme ? "" : programme
    );
  }

  function clearFilters() {
    setFilters({
      school: "",
      academicYear: "",
      programGroup: "",
      program: "",
    });

    setSelectedProgrammeDetail("");
  }

  const selectedMetricLabel =
    metricLabels[selectedMetric] ?? "Total Revenue";

  const primaryCards = metricCards.filter(
    (card) => card.type === "primary"
  );

  const secondaryCards = metricCards.filter(
    (card) => card.type === "secondary"
  );

  return (
    <section className="programme-summary-page">
      <div className="filters-section-heading">
        <h2>Filters</h2>

        <button
          type="button"
          className="secondary-button"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
      </div>

      <DashboardFilters
        filters={filters}
        schools={schools}
        academicYears={academicYears}
        programmeGroups={programmeGroups}
        programmes={availableProgrammes}
        onChange={handleFilterChange}
      />

      <section className="metric-card-section">
        <div className="metric-section-heading">
          <div>
            <h2>Financial Summary</h2>

            <p>
              Select a financial measure to update the
              programme analysis below.
            </p>
          </div>

          <span className="selected-metric-label">
            Displaying: {selectedMetricLabel}
          </span>
        </div>

        <div className="primary-kpi-grid">
          {primaryCards.map((card) => (
            <button
              key={card.key}
              type="button"
              className={`metric-card-button primary-metric-card ${
                selectedMetric === card.key
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedMetric(card.key)
              }
              aria-pressed={
                selectedMetric === card.key
              }
            >
              <KpiCard
                title={card.title}
                value={kpis[card.key]}
                color={card.color}
              />

              <span className="metric-card-description">
                {card.description}
              </span>
            </button>
          ))}
        </div>

        <div className="secondary-kpi-grid">
          {secondaryCards.map((card) => (
            <button
              key={card.key}
              type="button"
              className={`metric-card-button secondary-metric-card ${
                selectedMetric === card.key
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedMetric(card.key)
              }
              aria-pressed={
                selectedMetric === card.key
              }
            >
              <KpiCard
                title={card.title}
                value={kpis[card.key]}
                color={card.color}
              />
            </button>
          ))}
        </div>
      </section>

      <ProgrammeBreakdownChart
        title={`Top Programmes by ${selectedMetricLabel}`}
        data={topProgrammeData}
        dataKey={selectedMetric}
      />

      <ProgrammeTable
        title="Programme Details"
        data={programmeData}
        selectedProgramme={selectedProgrammeDetail}
        onProgrammeClick={
          handleProgrammeDetailClick
        }
      />

      {selectedProgrammeDetail && (
        <ProgrammeDetailView
          programme={selectedProgrammeDetail}
          records={filteredData}
          onClose={() =>
            setSelectedProgrammeDetail("")
          }
        />
      )}
    </section>
  );
}
