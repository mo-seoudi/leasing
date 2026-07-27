import { useMemo, useState } from "react";

import DashboardFilters from "./components/DashboardFilters";
import KpiCard from "./components/KpiCard";
import MetricSelector from "./components/MetricSelector";
import MonthlyTrendChart from "./components/MonthlyTrendChart";
import ProgrammeBreakdownChart from "./components/ProgrammeBreakdownChart";
import ProgrammeTable from "./components/ProgrammeTable";
import AppRoutes from "./routes/AppRoutes";

import {
  academicYears,
  calculateKPIs,
  filterRecords,
  getAvailableProgrammes,
  getMonthlyTrend,
  getProgrammeBreakdown,
  getTopProgrammes,
  programmeGroups,
  schools,
} from "./lib/dashboardData";

const metricLabels = {
  schoolIncome: "School Income",
  totalRevenue: "Total Revenue",
  sales: "Sales",
  commission: "Commission",
  rentalFees: "Rental Fees",
};

export default function App() {
  return <AppRoutes />;
}
export default function App() {
  const [filters, setFilters] = useState({
    school: "",
    academicYear: "",
    programGroup: "",
    program: "",
  });

  const [selectedMetric, setSelectedMetric] =
    useState("schoolIncome");

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

  const monthlyData = useMemo(
    () => getMonthlyTrend(filteredData),
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
  }

  function clearFilters() {
    setFilters({
      school: "",
      academicYear: "",
      programGroup: "",
      program: "",
    });
  }

  const selectedMetricLabel =
    metricLabels[selectedMetric] ?? "School Income";

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Leasing Dashboard</h1>

          <p>
            Commercial performance across schools,
            academies, programmes, and academic years.
          </p>
        </div>
      </header>

      <main className="content">
        <section className="dashboard-toolbar">
          <MetricSelector
            value={selectedMetric}
            onChange={setSelectedMetric}
          />

          <button
            type="button"
            className="secondary-button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </section>

        <DashboardFilters
          filters={filters}
          schools={schools}
          academicYears={academicYears}
          programmeGroups={programmeGroups}
          programmes={availableProgrammes}
          onChange={handleFilterChange}
        />

        <section className="kpi-grid">
          <KpiCard
            title="School Income"
            value={kpis.schoolIncome}
            color="#0f4c81"
          />

          <KpiCard
            title="Total Revenue"
            value={kpis.totalRevenue}
            color="#2563eb"
          />

          <KpiCard
            title="Sales"
            value={kpis.sales}
            color="#7c3aed"
          />

          <KpiCard
            title="Commission"
            value={kpis.commission}
            color="#16a34a"
          />

          <KpiCard
            title="Rental Fees"
            value={kpis.rentalFees}
            color="#d97706"
          />
        </section>

        <MonthlyTrendChart
          title={`${selectedMetricLabel} by Month`}
          data={monthlyData}
          dataKey={selectedMetric}
        />

        <ProgrammeBreakdownChart
          title={`Top Programmes by ${selectedMetricLabel}`}
          data={topProgrammeData}
          dataKey={selectedMetric}
        />

        <ProgrammeTable
          title="Programme Details"
          data={programmeData}
        />
      </main>
    </div>
  );
}
