import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useOutletContext } from "react-router-dom";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ProgrammeDetailView from "../../components/leasing/ProgrammeDetailView";

import {
  getProviderByName,
} from "../../lib/providerData";

import {
  academicYears,
  filterRecords,
  formatCurrency,
  getAvailableProgrammes,
  getProgrammeBreakdown,
  programmeGroups,
  schools,
} from "../../lib/dashboardData";

import "./ProgrammeDirectoryPage.css";

const PIE_COLORS = [
  "#2563eb",
  "#f97316",
  "#16a34a",
  "#7c3aed",
  "#0891b2",
  "#eab308",
  "#dc2626",
  "#4f46e5",
  "#059669",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#0284c7",
  "#9333ea",
  "#0f766e",
  "#c2410c",
  "#475569",
  "#be123c",
];

const AGGREGATE_TABS = [
  {
    key: "sports-academies",
    label: "Sports Academies",
    programGroup: "Sports Academies",
  },
  {
    key: "other-programs",
    label: "Other Programs",
    programGroup: "Other Programs",
  },
  {
    key: "all-groups",
    label: "All Leasing",
    programGroup: "",
  },
];

function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function formatPercentage(value) {
  const number = toNumber(value);

  if (number === 0) {
    return "0%";
  }

  if (number > 0 && number < 1) {
    return "<1%";
  }

  return `${number.toFixed(0)}%`;
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}


function formatProviderDate(value) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatCommissionRate(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not recorded";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(number);
}

function formatProviderAmount(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not recorded";
  }

  if (typeof value === "string") {
    return value;
  }

  return formatCurrency(value);
}

function getProviderStatus(provider) {
  const storedStatus =
    provider?.contract?.status;

  if (
    storedStatus &&
    storedStatus !== "Active" &&
    storedStatus !== "Expired"
  ) {
    return {
      key: "unknown",
      label: storedStatus,
      message:
        provider?.contract?.expiryDate
          ? `Contract date: ${formatProviderDate(
              provider.contract.expiryDate
            )}`
          : "No current expiry date is recorded.",
    };
  }

  const expiryDate =
    provider?.contract?.expiryDate;

  if (!expiryDate) {
    return {
      key: "unknown",
      label:
        storedStatus || "Not Recorded",
      message:
        "Contract expiry date is not recorded.",
    };
  }

  const expiry = new Date(
    `${expiryDate}T23:59:59`
  );

  if (Number.isNaN(expiry.getTime())) {
    return {
      key: "unknown",
      label: "Not Recorded",
      message:
        "Contract expiry date is not valid.",
    };
  }

  const formattedDate =
    formatProviderDate(expiryDate);

  if (expiry < new Date()) {
    return {
      key: "expired",
      label: "Expired",
      message: `Expired on ${formattedDate}`,
    };
  }

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  const daysRemaining = Math.ceil(
    (expiry.getTime() -
      new Date().getTime()) /
      millisecondsPerDay
  );

  if (daysRemaining <= 60) {
    return {
      key: "expiring",
      label: "Expiring Soon",
      message: `Expires on ${formattedDate}`,
    };
  }

  return {
    key: "active",
    label: "Active",
    message: `Expires on ${formattedDate}`,
  };
}

function ProviderDetailModal({
  provider,
  onClose,
}) {
  if (!provider) {
    return null;
  }

  const contract =
    provider.contract || {};

  const status =
    getProviderStatus(provider);

  const schools =
    Array.isArray(contract.schools) &&
    contract.schools.length > 0
      ? contract.schools.join(", ")
      : "Not recorded";

  const programmes =
    Array.isArray(provider.programmes) &&
    provider.programmes.length > 0
      ? provider.programmes.join(", ")
      : "Not recorded";

  return (
    <div
      className="provider-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        className="provider-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="provider-modal-title"
      >
        <div className="provider-modal-header">
          <div>
            <span className="provider-modal-eyebrow">
              Provider Details
            </span>

            <h2 id="provider-modal-title">
              {provider.name}
            </h2>

            <p>
              Contact and contract information
              for this provider.
            </p>
          </div>

          <button
            type="button"
            className="provider-modal-close"
            onClick={onClose}
            aria-label="Close provider details"
          >
            ×
          </button>
        </div>

        <div className="provider-contract-status-row">
          <span
            className={`provider-status-badge provider-status-${status.key}`}
          >
            {status.label}
          </span>

          <strong>{status.message}</strong>
        </div>

        <div className="provider-detail-grid">
          <section className="provider-detail-section">
            <h3>Provider Details</h3>

            <dl className="provider-detail-list">
              <div>
                <dt>Contact Person</dt>
                <dd>
                  {provider.contactPerson ||
                    "Not recorded"}
                </dd>
              </div>

              <div>
                <dt>Email</dt>
                <dd>
                  {provider.email ? (
                    <a
                      href={`mailto:${provider.email}`}
                    >
                      {provider.email}
                    </a>
                  ) : (
                    "Not recorded"
                  )}
                </dd>
              </div>

              <div>
                <dt>Phone</dt>
                <dd>
                  {provider.phone ? (
                    <a
                      href={`tel:${provider.phone}`}
                    >
                      {provider.phone}
                    </a>
                  ) : (
                    "Not recorded"
                  )}
                </dd>
              </div>

              <div>
                <dt>Company Number</dt>
                <dd>
                  {provider.companyNumber ||
                    "Not recorded"}
                </dd>
              </div>

              <div>
                <dt>Address</dt>
                <dd>
                  {provider.address ||
                    "Not recorded"}
                </dd>
              </div>

              <div>
                <dt>Programmes</dt>
                <dd>{programmes}</dd>
              </div>
            </dl>
          </section>

          <section className="provider-detail-section">
            <h3>Contract Details</h3>

            <dl className="provider-detail-list">
              <div>
                <dt>Schools</dt>
                <dd>{schools}</dd>
              </div>

              <div>
                <dt>Start Date</dt>
                <dd>
                  {formatProviderDate(
                    contract.startDate
                  )}
                </dd>
              </div>

              <div>
                <dt>Expiry Date</dt>
                <dd>
                  {formatProviderDate(
                    contract.expiryDate
                  )}
                </dd>
              </div>

              <div>
                <dt>Notice Period</dt>
                <dd>
                  {contract.noticePeriod ||
                    "Not recorded"}
                </dd>
              </div>

              <div>
                <dt>Commission</dt>
                <dd>
                  {formatCommissionRate(
                    contract.commissionRate
                  )}
                </dd>
              </div>

              <div>
                <dt>Rental Fees</dt>
                <dd>
                  {formatProviderAmount(
                    contract.rentalFees
                  )}
                </dd>
              </div>

              <div>
                <dt>Revenue Collected By</dt>
                <dd>
                  {contract.revenueCollection ||
                    "Not recorded"}
                </dd>
              </div>

              <div>
                <dt>Invoice Frequency</dt>
                <dd>
                  {contract.invoiceFrequency ||
                    "Not recorded"}
                </dd>
              </div>


            </dl>
          </section>
        </div>
      </section>
    </div>
  );
}

function TableIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />

      <path d="M3 9h18" />
      <path d="M3 14h18" />
      <path d="M9 4v16" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  );
}

function PieIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9h-9V3Z" />

      <path d="M15 3.5A8.5 8.5 0 0 1 20.5 9H15V3.5Z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 6v5h-5" />
      <path d="M19 11a7 7 0 1 0 1 5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function DirectoryPieCard({
  title,
  description,
  data,
  dataKey,
}) {
  const chartData = data.filter(
    (item) => toNumber(item[dataKey]) > 0
  );

  const chartTotal = chartData.reduce(
    (total, item) => total + toNumber(item[dataKey]),
    0
  );

  return (
    <section className="directory-pie-card">
      <div className="directory-pie-heading">
        <h3>{title}</h3>

        <p>{description}</p>
      </div>

      {chartData.length === 0 ? (
        <div className="directory-empty-state">
          No values are available for this chart.
        </div>
      ) : (
        <div className="directory-pie-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey={dataKey}
                nameKey="programme"
                cx="50%"
                cy="43%"
                innerRadius={52}
                outerRadius={108}
                paddingAngle={1}
              >
                {chartData.map((item, index) => (
                  <Cell
                    key={`${item.programme}-${dataKey}`}
                    fill={
                      PIE_COLORS[
                        index % PIE_COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => {
                  const percentage = chartTotal > 0
                    ? (toNumber(value) / chartTotal) * 100
                    : 0;

                  return (
                    <span>
                      {formatCurrency(value)}
                      <br />
                      <strong>{formatPercentage(percentage)}</strong>
                    </span>
                  );
                }}
              />

              <Legend
                verticalAlign="bottom"
                wrapperStyle={{
                  fontSize: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

export default function ProgrammeDirectoryPage() {
  const { setHeaderControls } = useOutletContext();
  const latestAcademicYear =
    academicYears[academicYears.length - 1] || "";

  const [filters, setFilters] = useState({
    academicYear: latestAcademicYear,
    school: "",
    programGroup: "",
    program: "",
    searchText: "",
  });

  const [
    selectedProgrammeDetail,
    setSelectedProgrammeDetail,
  ] = useState("");

  const selectedProgrammeRowRef = useRef(null);

  const [
    selectedAggregateDetail,
    setSelectedAggregateDetail,
  ] = useState("");

  const [viewMode, setViewMode] = useState("table");

  const [
    selectedProviderName,
    setSelectedProviderName,
  ] = useState("");

  const selectedProvider = useMemo(
    () =>
      getProviderByName(
        selectedProviderName
      ),
    [selectedProviderName]
  );

  useEffect(() => {
    if (!selectedProviderName) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setSelectedProviderName("");
      }
    }

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedProviderName]);


  const availableProgrammes = useMemo(
    () =>
      getAvailableProgrammes(
        filters.programGroup
      ),
    [filters.programGroup]
  );

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
        program: filters.program,
      }),
    [
      filters.academicYear,
      filters.school,
      filters.programGroup,
      filters.program,
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

  const aggregateTabs = useMemo(
    () =>
      AGGREGATE_TABS.map((tab) => {
        const sourceRecords = tab.programGroup
          ? allRecords.filter(
              (record) =>
                record.programGroup ===
                tab.programGroup
            )
          : allRecords;

        const detailRecords = sourceRecords.map(
          (record) => ({
            ...record,
            program: tab.label,
          })
        );

        return {
          ...tab,
          detailRecords,
          disabled: detailRecords.length === 0,
        };
      }),
    [allRecords]
  );

  const selectedAggregate = useMemo(
    () =>
      aggregateTabs.find(
        (tab) =>
          tab.key === selectedAggregateDetail
      ) || null,
    [aggregateTabs, selectedAggregateDetail]
  );

  useEffect(() => {
    if (!selectedProgrammeDetail) {
      return undefined;
    }

    if (window.innerWidth > 720) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const row = selectedProgrammeRowRef.current;

      if (!row) {
        return;
      }

      const platformHeader =
        document.querySelector(".platform-header");

      const headerBottom =
        platformHeader?.getBoundingClientRect().bottom || 0;

      const rowTop =
        row.getBoundingClientRect().top;

      const offset = 8;

      window.scrollBy({
        top: rowTop - headerBottom - offset,
        behavior: "smooth",
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [selectedProgrammeDetail]);

  function handleFilterChange(name, value) {
    setFilters((current) => {
      const updatedFilters = {
        ...current,
        [name]: value,
      };

      if (name === "programGroup") {
        updatedFilters.program = "";
      }

      return updatedFilters;
    });

    setSelectedProgrammeDetail("");
    setSelectedAggregateDetail("");
  }

  function handleProgrammeClick(programme) {
    setSelectedAggregateDetail("");

    setSelectedProgrammeDetail((current) =>
      current === programme ? "" : programme
    );
  }

  function handleAggregateClick(aggregateKey) {
    setSelectedProgrammeDetail("");

    setSelectedAggregateDetail((current) =>
      current === aggregateKey
        ? ""
        : aggregateKey
    );
  }

  function handleViewModeChange(mode) {
    setViewMode(mode);

    if (mode !== "table") {
      setSelectedProgrammeDetail("");
    }
  }

  function clearFilters() {
    setFilters({
      academicYear: latestAcademicYear,
      school: "",
      programGroup: "",
      program: "",
      searchText: "",
    });

    setSelectedProgrammeDetail("");
    setSelectedAggregateDetail("");
    setSelectedProviderName("");
    setViewMode("table");
  }

  useEffect(() => {
    setHeaderControls(
      <div className="header-page-filters">
        <label className="header-filter-control">
          <span>Academic Year</span>
          <select
            value={filters.academicYear}
            onChange={(event) =>
              handleFilterChange("academicYear", event.target.value)
            }
          >
            <option value="">All Time</option>
            {academicYears.map((academicYear) => (
              <option key={academicYear} value={academicYear}>
                {academicYear}
              </option>
            ))}
          </select>
        </label>

        <label className="header-filter-control wide">
          <span>School</span>
          <select
            value={filters.school}
            onChange={(event) =>
              handleFilterChange("school", event.target.value)
            }
          >
            <option value="">All Schools</option>
            {schools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </label>

        <label className="header-filter-control">
          <span>Category</span>
          <select
            value={filters.programGroup}
            onChange={(event) =>
              handleFilterChange("programGroup", event.target.value)
            }
          >
            <option value="">All Leasing</option>
            {programmeGroups.map((group) => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </label>

        <label className="header-filter-control wide">
          <span>Programme</span>
          <select
            value={filters.program}
            onChange={(event) =>
              handleFilterChange("program", event.target.value)
            }
          >
            <option value="">All Programmes</option>
            {availableProgrammes.map((programme) => (
              <option key={programme} value={programme}>
                {programme}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="header-reset-icon-button"
          onClick={clearFilters}
          aria-label="Reset filters"
          title="Reset filters"
        >
          <RefreshIcon />
        </button>
      </div>
    );

    return () => setHeaderControls(null);
  }, [
    filters,
    availableProgrammes,
    setHeaderControls,
  ]);

  const selectedPeriodLabel =
    filters.academicYear || "All Time";

  return (
    <section className="programme-comparison-page programme-directory-page">
      <section className="programme-summary-strip">
        <div>
          <span>Total Revenue</span>

          <strong>
            {formatCurrency(
              totals.totalRevenue
            )}
          </strong>
        </div>

        <div>
          <span>School Income</span>

          <strong>
            {formatCurrency(
              totals.schoolIncome
            )}
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

      <section className="directory-table-card">
        <div className="directory-table-heading">
          <div className="directory-header-controls">
            <div
              className="directory-aggregate-tabs"
              role="group"
              aria-label="Programme group details"
            >
              {aggregateTabs.map((tab) => {
                const isSelected =
                  selectedAggregateDetail === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={
                      isSelected ? "active" : ""
                    }
                    disabled={tab.disabled}
                    onClick={() =>
                      handleAggregateClick(tab.key)
                    }
                    aria-expanded={isSelected}
                  >
                    <span
                      className={`directory-aggregate-arrow ${
                        isSelected ? "open" : ""
                      }`}
                    >
                      ▶
                    </span>

                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="directory-list-actions">
              <label className="directory-list-search">
                <span className="directory-list-search-icon">
                  <SearchIcon />
                </span>

                <input
                  type="search"
                  value={filters.searchText}
                  placeholder="Search programme or provider"
                  aria-label="Search programme or provider"
                  onChange={(event) =>
                    handleFilterChange(
                      "searchText",
                      event.target.value
                    )
                  }
                />
              </label>

              <div
                className="directory-view-toggle"
                role="group"
                aria-label="Programme directory view"
              >
              <button
                type="button"
                className={
                  viewMode === "table"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleViewModeChange("table")
                }
                aria-pressed={
                  viewMode === "table"
                }
                title="Table view"
              >
                <TableIcon />

                <span>Table</span>
              </button>

              <button
                type="button"
                className={
                  viewMode === "chart"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleViewModeChange("chart")
                }
                aria-pressed={
                  viewMode === "chart"
                }
                title="Chart view"
              >
                <ChartIcon />

                <span>Chart</span>
              </button>

              <button
                type="button"
                className={
                  viewMode === "pie"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  handleViewModeChange("pie")
                }
                aria-pressed={viewMode === "pie"}
                title="Pie view"
              >
                <PieIcon />

                <span>Pie</span>
              </button>
              </div>
            </div>
          </div>
        </div>

        {selectedAggregate && (
          <div className="directory-aggregate-detail">
            <ProgrammeDetailView
              key={selectedAggregate.key}
              programme={selectedAggregate.label}
              records={
                selectedAggregate.detailRecords
              }
              onClose={() =>
                setSelectedAggregateDetail("")
              }
            />
          </div>
        )}

        {programmeData.length === 0 ? (
          <div className="directory-empty-state">
            No programme records are available for the
            selected filters.
          </div>
        ) : viewMode === "chart" ? (
          <div className="directory-chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={programmeData.slice(0, 20)}
                margin={{
                  top: 15,
                  right: 20,
                  bottom: 85,
                  left: 20,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="programme"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={100}
                  tick={{ fontSize: 10 }}
                />

                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={
                    formatCompactNumber
                  }
                />

                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(value),
                    name,
                  ]}
                />

                <Legend />

                <Bar
                  dataKey="totalRevenue"
                  name="Total Revenue"
                  fill="#1679a7"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="schoolIncome"
                  name="School Income"
                  fill="#e97832"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : viewMode === "pie" ? (
          <div className="directory-pie-grid">
            <DirectoryPieCard
              title="% of Total Leasing Revenue"
              description="Each programme’s share of total revenue under the selected directory filters."
              data={programmeData}
              dataKey="totalRevenue"
            />

            <DirectoryPieCard
              title="% of Total Leasing School Income"
              description="Each programme’s share of school income under the selected directory filters."
              data={programmeData}
              dataKey="schoolIncome"
            />
          </div>
        ) : (
          <div className="directory-table-scroll">
            <table className="directory-comparison-table">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Provider</th>
                  <th>Category</th>
                  <th>Total Revenue</th>
                  <th>School Income</th>
                  <th>% of Revenue</th>
                  <th>% of School Income</th>
                </tr>
              </thead>

              <tbody>
                {programmeData.map((item) => {
                  const isSelected =
                    selectedProgrammeDetail ===
                    item.programme;

                  return (
                    <Fragment key={item.programme}>
                      <tr
                        ref={
                          isSelected
                            ? selectedProgrammeRowRef
                            : null
                        }
                        className={
                          isSelected
                            ? "directory-selected-row"
                            : ""
                        }
                      >
                        <th>
                          <button
                            type="button"
                            className="directory-programme-button"
                            onClick={() =>
                              handleProgrammeClick(
                                item.programme
                              )
                            }
                            aria-expanded={
                              isSelected
                            }
                          >
                            <span className="directory-programme-text">
                              {item.programme}
                            </span>

                            <span
                              className={
                                isSelected
                                  ? "directory-row-arrow open"
                                  : "directory-row-arrow"
                              }
                            >
                              ▶
                            </span>
                          </button>
                        </th>

                        <td>
                          {item.provider ? (
                            <button
                              type="button"
                              className="directory-provider-button"
                              onClick={() =>
                                setSelectedProviderName(
                                  item.provider
                                )
                              }
                              aria-label={`View provider details for ${item.provider}`}
                            >
                              {item.provider}
                            </button>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td>
                          {item.programGroup || "—"}
                        </td>

                        <td className="directory-revenue-value">
                          {formatCurrency(
                            item.totalRevenue
                          )}
                        </td>

                        <td className="directory-income-value">
                          {formatCurrency(
                            item.schoolIncome
                          )}
                        </td>

                        <td>
                          <div className="directory-percentage-cell">
                            <span>
                              {formatPercentage(
                                item.revenueShare
                              )}
                            </span>

                            <div className="directory-percentage-track">
                              <div
                                className="directory-percentage-fill directory-revenue-fill"
                                style={{
                                  width: `${Math.min(
                                    toNumber(
                                      item.revenueShare
                                    ),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="directory-percentage-cell">
                            <span>
                              {formatPercentage(
                                item.incomeShare
                              )}
                            </span>

                            <div className="directory-percentage-track">
                              <div
                                className="directory-percentage-fill directory-income-fill"
                                style={{
                                  width: `${Math.min(
                                    toNumber(
                                      item.incomeShare
                                    ),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>

                      {isSelected && (
                        <tr className="programme-expanded-row directory-expanded-row">
                          <td colSpan={7}>
                            <ProgrammeDetailView
                              programme={
                                item.programme
                              }
                              records={allRecords}
                              onClose={() =>
                                setSelectedProgrammeDetail(
                                  ""
                                )
                              }
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ProviderDetailModal
        provider={selectedProvider}
        onClose={() =>
          setSelectedProviderName("")
        }
      />
    </section>
  );
}
