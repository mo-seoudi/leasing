import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../auth/AuthProvider";

import {
  archiveFinancialRecord,
  fetchDataEntryOptions,
  fetchFinancialRecords,
  getAcademicYearFromMonth,
  getFinanceTermFromMonth,
  restoreFinancialRecord,
  saveFinancialRecords,
  updateFinancialRecord,
} from "../../lib/financialData";

import "./DataEntryPage.css";

const SCENARIOS = ["Actual", "Budget", "Forecast"];
const PAGE_SIZE = 25;

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function formatMetricName(metric) {
  return metric?.name || metric?.code || "Metric";
}

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear + 3; year >= currentYear - 8; year -= 1) {
    years.push(String(year));
  }

  return years;
}

function combineMonthYear(year, month) {
  if (!year || !month) return "";
  return `${year}-${month}`;
}

function formatRecordMonth(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function buildPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) items.push("start-ellipsis");

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) items.push("end-ellipsis");
  items.push(totalPages);

  return items;
}

export default function DataEntryPage() {
  const { role } = useAuth();

  const [mode, setMode] = useState("new");
  const [options, setOptions] = useState({
    schools: [],
    revenueStreams: [],
    metrics: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    schoolId: "",
    revenueStreamId: "",
    reportingMonth: "",
    reportingYear: String(new Date().getFullYear()),
    scenario: "Actual",
  });

  const [metricValues, setMetricValues] = useState({});

  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");
  const [recordFilters, setRecordFilters] = useState({
    schoolId: "",
    revenueStreamId: "",
    metricId: "",
    academicYear: "",
    scenario: "",
    search: "",
    includeDeleted: false,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const [editingRecord, setEditingRecord] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [recordActionLoading, setRecordActionLoading] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const canEdit = role === "admin" || role === "editor";
  const canRestore = role === "admin";
  const yearOptions = useMemo(() => getYearOptions(), []);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchDataEntryOptions();

        if (active) {
          setOptions(data);
        }
      } catch (loadError) {
        console.error("Unable to load financial record options:", loadError);

        if (active) {
          setError(
            loadError?.message ||
              "Unable to load the financial records workspace."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const selectedSchool = useMemo(
    () =>
      options.schools.find(
        (school) => String(school.id) === String(form.schoolId)
      ),
    [options.schools, form.schoolId]
  );

  const selectedStream = useMemo(
    () =>
      options.revenueStreams.find(
        (stream) => String(stream.id) === String(form.revenueStreamId)
      ),
    [options.revenueStreams, form.revenueStreamId]
  );

  const streamMetrics = useMemo(
    () =>
      options.metrics.filter(
        (metric) =>
          String(metric.revenue_stream_id) ===
          String(form.revenueStreamId)
      ),
    [options.metrics, form.revenueStreamId]
  );

  const managementMetrics = useMemo(() => {
    if (!recordFilters.revenueStreamId) {
      return options.metrics;
    }

    return options.metrics.filter(
      (metric) =>
        String(metric.revenue_stream_id) ===
        String(recordFilters.revenueStreamId)
    );
  }, [options.metrics, recordFilters.revenueStreamId]);

  const combinedMonth = combineMonthYear(
    form.reportingYear,
    form.reportingMonth
  );
  const academicYear = getAcademicYearFromMonth(combinedMonth);
  const term = getFinanceTermFromMonth(combinedMonth);

  const availableAcademicYears = useMemo(() => {
    const values = new Set();

    records.forEach((record) => {
      if (record.academic_year) values.add(record.academic_year);
    });

    return [...values].sort((a, b) => b.localeCompare(a));
  }, [records]);

  const visibleRecords = useMemo(() => {
    const search = recordFilters.search.trim().toLowerCase();

    return records.filter((record) => {
      if (!recordFilters.includeDeleted && record.is_deleted) return false;

      if (
        recordFilters.schoolId &&
        String(record.school?.id) !== String(recordFilters.schoolId)
      ) {
        return false;
      }

      if (
        recordFilters.revenueStreamId &&
        String(record.revenue_stream?.id) !==
          String(recordFilters.revenueStreamId)
      ) {
        return false;
      }

      if (
        recordFilters.metricId &&
        String(record.metric?.id) !== String(recordFilters.metricId)
      ) {
        return false;
      }

      if (
        recordFilters.academicYear &&
        record.academic_year !== recordFilters.academicYear
      ) {
        return false;
      }

      if (
        recordFilters.scenario &&
        record.scenario !== recordFilters.scenario
      ) {
        return false;
      }

      if (search) {
        const haystack = [
          record.school?.name,
          record.school?.code,
          record.revenue_stream?.name,
          record.metric?.name,
          record.metric?.code,
          record.academic_year,
          record.term,
          record.scenario,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(search)) return false;
      }

      return true;
    });
  }, [records, recordFilters]);

  const totalPages = Math.max(1, Math.ceil(visibleRecords.length / PAGE_SIZE));

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return visibleRecords.slice(start, start + PAGE_SIZE);
  }, [visibleRecords, currentPage]);

  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const pageStart = visibleRecords.length
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, visibleRecords.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    recordFilters.schoolId,
    recordFilters.revenueStreamId,
    recordFilters.metricId,
    recordFilters.academicYear,
    recordFilters.scenario,
    recordFilters.search,
    recordFilters.includeDeleted,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function loadRecords() {
    try {
      setRecordsLoading(true);
      setRecordsError("");

      const data = await fetchFinancialRecords({
        includeDeleted: recordFilters.includeDeleted,
      });

      setRecords(data);
    } catch (loadError) {
      console.error("Unable to load financial records:", loadError);
      setRecordsError(
        loadError?.message || "Unable to load financial records."
      );
    } finally {
      setRecordsLoading(false);
    }
  }

  useEffect(() => {
    if (mode === "manage") {
      loadRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, recordFilters.includeDeleted]);

  function updateForm(name, value) {
    setSuccess("");
    setError("");

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === "revenueStreamId") {
      setMetricValues({});
    }
  }

  function updateRecordFilter(name, value) {
    setRecordFilters((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      if (name === "revenueStreamId") {
        next.metricId = "";
      }

      return next;
    });
  }

  function updateMetric(metricId, value) {
    setSuccess("");
    setError("");

    setMetricValues((current) => ({
      ...current,
      [metricId]: value,
    }));
  }

  function resetForm() {
    setForm({
      schoolId: "",
      revenueStreamId: "",
      reportingMonth: "",
      reportingYear: String(new Date().getFullYear()),
      scenario: "Actual",
    });
    setMetricValues({});
    setSuccess("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canEdit) {
      setError(
        "Your account does not have permission to modify financial records."
      );
      return;
    }

    if (
      !form.schoolId ||
      !form.revenueStreamId ||
      !form.reportingMonth ||
      !form.reportingYear
    ) {
      setError(
        "Select a school, revenue stream, reporting month and year."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await saveFinancialRecords({
        schoolId: form.schoolId,
        revenueStreamId: form.revenueStreamId,
        month: combinedMonth,
        scenario: form.scenario,
        metricValues,
      });

      setSuccess(
        `${result.savedCount} ${
          result.savedCount === 1 ? "record" : "records"
        } saved successfully.`
      );
    } catch (saveError) {
      console.error("Unable to save financial records:", saveError);
      setError(
        saveError?.message || "Unable to save the financial records."
      );
    } finally {
      setSaving(false);
    }
  }

  function openEdit(record) {
    setEditingRecord(record);
    setEditAmount(String(record.amount ?? ""));
  }

  async function saveEdit() {
    if (!editingRecord || !canEdit) return;

    try {
      setRecordActionLoading(true);
      setRecordsError("");

      await updateFinancialRecord(editingRecord.id, {
        amount: editAmount,
      });

      setEditingRecord(null);
      await loadRecords();
    } catch (actionError) {
      console.error("Unable to update financial record:", actionError);
      setRecordsError(
        actionError?.message || "Unable to update the financial record."
      );
    } finally {
      setRecordActionLoading(false);
    }
  }

  async function confirmArchive() {
    if (!deleteRecord || !canEdit) return;

    try {
      setRecordActionLoading(true);
      setRecordsError("");
      await archiveFinancialRecord(deleteRecord.id);
      setDeleteRecord(null);
      await loadRecords();
    } catch (actionError) {
      console.error("Unable to archive financial record:", actionError);
      setRecordsError(
        actionError?.message || "Unable to archive the financial record."
      );
    } finally {
      setRecordActionLoading(false);
    }
  }

  async function handleRestore(record) {
    if (!canRestore) return;

    try {
      setRecordActionLoading(true);
      setRecordsError("");
      await restoreFinancialRecord(record.id);
      await loadRecords();
    } catch (actionError) {
      console.error("Unable to restore financial record:", actionError);
      setRecordsError(
        actionError?.message || "Unable to restore the financial record."
      );
    } finally {
      setRecordActionLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="data-entry-page">
        <div className="data-entry-loading">
          Loading Financial Records…
        </div>
      </section>
    );
  }

  return (
    <section className="data-entry-page">
      <div className="data-entry-intro">
        <div>
          <span className="data-entry-eyebrow">FINANCIAL RECORDS</span>
          <h2>Commercial data workspace</h2>
          <p>
            Create, review and maintain monthly financial performance across
            schools and revenue streams.
          </p>
        </div>

        <div className="data-entry-status">
          <span className="status-dot" />
          Supabase connected
        </div>
      </div>

      <div
        className="records-mode-switch"
        role="tablist"
        aria-label="Financial records mode"
      >
        <button
          type="button"
          className={mode === "new" ? "active" : ""}
          onClick={() => setMode("new")}
        >
          <span className="mode-icon">＋</span>
          New Record
        </button>
        <button
          type="button"
          className={mode === "manage" ? "active" : ""}
          onClick={() => setMode("manage")}
        >
          <span className="mode-icon">≡</span>
          Manage Records
        </button>
      </div>

      {!canEdit && (
        <div className="data-entry-permission-banner">
          You currently have read-only access. An Admin or Editor role is
          required to modify financial records.
        </div>
      )}

      {mode === "new" ? (
        <form className="data-entry-workspace" onSubmit={handleSubmit}>
          <section className="data-entry-main-card">
            <div className="entry-card-header">
              <div>
                <span className="entry-step">RECORD DETAILS</span>
                <h3>Reporting context</h3>
                <p>Select where and when this financial activity belongs.</p>
              </div>
            </div>

            <div className="entry-fields-grid">
              <label className="entry-field">
                <span>School</span>
                <select
                  value={form.schoolId}
                  onChange={(event) =>
                    updateForm("schoolId", event.target.value)
                  }
                >
                  <option value="">Select school</option>
                  {options.schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="entry-field">
                <span>Revenue Stream</span>
                <select
                  value={form.revenueStreamId}
                  onChange={(event) =>
                    updateForm("revenueStreamId", event.target.value)
                  }
                >
                  <option value="">Select revenue stream</option>
                  {options.revenueStreams.map((stream) => (
                    <option key={stream.id} value={stream.id}>
                      {stream.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="reporting-period-group">
                <label className="entry-field">
                  <span>Month</span>
                  <select
                    value={form.reportingMonth}
                    onChange={(event) =>
                      updateForm("reportingMonth", event.target.value)
                    }
                  >
                    <option value="">Select month</option>
                    {MONTHS.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="entry-field">
                  <span>Year</span>
                  <select
                    value={form.reportingYear}
                    onChange={(event) =>
                      updateForm("reportingYear", event.target.value)
                    }
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="entry-field">
                <span>Scenario</span>
                <select
                  value={form.scenario}
                  onChange={(event) =>
                    updateForm("scenario", event.target.value)
                  }
                >
                  {SCENARIOS.map((scenario) => (
                    <option key={scenario} value={scenario}>
                      {scenario}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="period-preview">
              <div>
                <span>Academic Year</span>
                <strong>{academicYear || "—"}</strong>
              </div>
              <div className="period-divider" />
              <div>
                <span>Finance Term</span>
                <strong>{term || "—"}</strong>
              </div>
              <div className="period-divider" />
              <div>
                <span>Basis</span>
                <strong>Sep – Aug</strong>
              </div>
            </div>

            <div className="metrics-section">
              <div className="metrics-heading">
                <div>
                  <span className="entry-step">VALUES</span>
                  <h3>Financial metrics</h3>
                  <p>
                    Metrics are determined dynamically by the selected revenue
                    stream.
                  </p>
                </div>

                {selectedStream && (
                  <span className="selected-stream-pill">
                    {selectedStream.name}
                  </span>
                )}
              </div>

              {!form.revenueStreamId ? (
                <div className="metric-placeholder">
                  <div className="placeholder-icon">＋</div>
                  <strong>Select a revenue stream</strong>
                  <span>
                    Its available metrics will appear here automatically.
                  </span>
                </div>
              ) : streamMetrics.length === 0 ? (
                <div className="metric-placeholder">
                  <strong>No active metrics</strong>
                  <span>
                    This revenue stream does not currently have active metrics
                    configured.
                  </span>
                </div>
              ) : (
                <div className="metric-input-grid">
                  {streamMetrics.map((metric) => (
                    <label className="metric-entry-card" key={metric.id}>
                      <span>{formatMetricName(metric)}</span>
                      <div className="money-input">
                        <span>AED</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={metricValues[metric.id] ?? ""}
                          onChange={(event) =>
                            updateMetric(metric.id, event.target.value)
                          }
                        />
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="data-entry-review-card">
            <div className="review-header">
              <span className="entry-step">REVIEW</span>
              <h3>Record summary</h3>
              <p>Review the reporting context before saving.</p>
            </div>

            <div className="review-list">
              <div>
                <span>School</span>
                <strong>{selectedSchool?.name || "—"}</strong>
              </div>
              <div>
                <span>Revenue Stream</span>
                <strong>{selectedStream?.name || "—"}</strong>
              </div>
              <div>
                <span>Reporting Period</span>
                <strong>
                  {form.reportingMonth && form.reportingYear
                    ? `${
                        MONTHS.find(
                          (item) => item.value === form.reportingMonth
                        )?.label
                      } ${form.reportingYear}`
                    : "—"}
                </strong>
              </div>
              <div>
                <span>Academic Year</span>
                <strong>{academicYear || "—"}</strong>
              </div>
              <div>
                <span>Term</span>
                <strong>{term || "—"}</strong>
              </div>
              <div>
                <span>Scenario</span>
                <strong>{form.scenario}</strong>
              </div>
            </div>

            {error && <div className="entry-message error">{error}</div>}
            {success && (
              <div className="entry-message success">{success}</div>
            )}

            <div className="entry-actions">
              <button
                type="button"
                className="entry-reset-button"
                onClick={resetForm}
                disabled={saving}
              >
                Reset
              </button>
              <button
                type="submit"
                className="entry-save-button"
                disabled={saving || !canEdit}
              >
                {saving ? "Saving…" : "Save Records"}
              </button>
            </div>

            <p className="entry-save-note">
              Existing active records with the same school, month, scenario and
              metric are updated rather than duplicated.
            </p>
          </aside>
        </form>
      ) : (
        <section className="manage-records-card">
          <div className="manage-records-header">
            <div>
              <span className="entry-step">RECORD LIBRARY</span>
              <h3>Manage financial records</h3>
              <p>
                Search, filter and update individual financial records without
                changing their reporting period.
              </p>
            </div>

            <div className="record-count-badge">
              {visibleRecords.length} records
            </div>
          </div>

          <div className="record-filter-grid">
            <label className="entry-field search-field">
              <span>Search</span>
              <input
                type="search"
                placeholder="School, stream, metric…"
                value={recordFilters.search}
                onChange={(event) =>
                  updateRecordFilter("search", event.target.value)
                }
              />
            </label>

            <label className="entry-field">
              <span>School</span>
              <select
                value={recordFilters.schoolId}
                onChange={(event) =>
                  updateRecordFilter("schoolId", event.target.value)
                }
              >
                <option value="">All Schools</option>
                {options.schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="entry-field">
              <span>Revenue Stream</span>
              <select
                value={recordFilters.revenueStreamId}
                onChange={(event) =>
                  updateRecordFilter("revenueStreamId", event.target.value)
                }
              >
                <option value="">All Streams</option>
                {options.revenueStreams.map((stream) => (
                  <option key={stream.id} value={stream.id}>
                    {stream.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="entry-field">
              <span>Metric</span>
              <select
                value={recordFilters.metricId}
                onChange={(event) =>
                  updateRecordFilter("metricId", event.target.value)
                }
              >
                <option value="">All Metrics</option>
                {managementMetrics.map((metric) => (
                  <option key={metric.id} value={metric.id}>
                    {metric.name || metric.code}
                  </option>
                ))}
              </select>
            </label>

            <label className="entry-field">
              <span>Academic Year</span>
              <select
                value={recordFilters.academicYear}
                onChange={(event) =>
                  updateRecordFilter("academicYear", event.target.value)
                }
              >
                <option value="">All Years</option>
                {availableAcademicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label className="entry-field">
              <span>Scenario</span>
              <select
                value={recordFilters.scenario}
                onChange={(event) =>
                  updateRecordFilter("scenario", event.target.value)
                }
              >
                <option value="">All Scenarios</option>
                {SCENARIOS.map((scenario) => (
                  <option key={scenario} value={scenario}>
                    {scenario}
                  </option>
                ))}
              </select>
            </label>

            <label className="archive-toggle">
              <input
                type="checkbox"
                checked={recordFilters.includeDeleted}
                onChange={(event) =>
                  updateRecordFilter("includeDeleted", event.target.checked)
                }
              />
              <span>Show archived</span>
            </label>
          </div>

          {recordsError && (
            <div className="entry-message error manage-message">
              {recordsError}
            </div>
          )}

          {recordsLoading ? (
            <div className="records-loading">Loading records…</div>
          ) : visibleRecords.length === 0 ? (
            <div className="records-empty">
              <strong>No records found</strong>
              <span>Try changing the filters or search terms.</span>
            </div>
          ) : (
            <>
              <div className="records-table-wrap">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>School</th>
                      <th>Revenue Stream</th>
                      <th>Metric</th>
                      <th>Scenario</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((record) => (
                      <tr
                        key={record.id}
                        className={record.is_deleted ? "archived-row" : ""}
                      >
                        <td>
                          <strong>{formatRecordMonth(record.month)}</strong>
                          <span>{record.academic_year}</span>
                        </td>
                        <td>
                          <strong>{record.school?.name || "—"}</strong>
                          <span>{record.school?.code || ""}</span>
                        </td>
                        <td>{record.revenue_stream?.name || "—"}</td>
                        <td>
                          {record.metric?.name || record.metric?.code || "—"}
                        </td>
                        <td>
                          <span
                            className={`scenario-pill ${String(
                              record.scenario || ""
                            ).toLowerCase()}`}
                          >
                            {record.scenario || "—"}
                          </span>
                        </td>
                        <td className="record-amount">
                          {formatMoney(record.amount)}
                        </td>
                        <td>
                          <span
                            className={`record-status ${
                              record.is_deleted ? "archived" : "active"
                            }`}
                          >
                            {record.is_deleted ? "Archived" : "Active"}
                          </span>
                        </td>
                        <td className="record-actions-cell">
                          {record.is_deleted ? (
                            canRestore && (
                              <button
                                type="button"
                                className="record-action restore"
                                onClick={() => handleRestore(record)}
                                disabled={recordActionLoading}
                              >
                                Restore
                              </button>
                            )
                          ) : (
                            <div className="record-actions">
                              <button
                                type="button"
                                className="record-action"
                                onClick={() => openEdit(record)}
                                disabled={!canEdit || recordActionLoading}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="record-action danger"
                                onClick={() => setDeleteRecord(record)}
                                disabled={!canEdit || recordActionLoading}
                              >
                                Archive
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="records-pagination">
                <div className="pagination-summary">
                  Showing <strong>{pageStart}–{pageEnd}</strong> of{" "}
                  <strong>{visibleRecords.length}</strong> records
                </div>

                <div className="pagination-controls" aria-label="Record pages">
                  <button
                    type="button"
                    className="pagination-arrow"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>

                  {paginationItems.map((item) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        type="button"
                        className={`pagination-page ${
                          currentPage === item ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(item)}
                        aria-current={currentPage === item ? "page" : undefined}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={item} className="pagination-ellipsis">
                        …
                      </span>
                    )
                  )}

                  <button
                    type="button"
                    className="pagination-arrow"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {editingRecord && (
        <div className="record-modal-backdrop" role="presentation">
          <div
            className="record-modal edit-record-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-record-title"
          >
            <div className="record-modal-header">
              <div>
                <span className="entry-step">EDIT RECORD</span>
                <h3 id="edit-record-title">
                  {editingRecord.metric?.name || "Financial record"}
                </h3>
                <p>
                  Change the amount for this existing record. Its reporting
                  period and classification remain fixed.
                </p>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setEditingRecord(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="edit-record-context">
              <div>
                <span>School</span>
                <strong>{editingRecord.school?.name || "—"}</strong>
              </div>
              <div>
                <span>Revenue Stream</span>
                <strong>{editingRecord.revenue_stream?.name || "—"}</strong>
              </div>
              <div>
                <span>Metric</span>
                <strong>
                  {editingRecord.metric?.name || editingRecord.metric?.code ||
                    "—"}
                </strong>
              </div>
              <div>
                <span>Period</span>
                <strong>{formatRecordMonth(editingRecord.month)}</strong>
              </div>
              <div>
                <span>Academic Year</span>
                <strong>{editingRecord.academic_year || "—"}</strong>
              </div>
              <div>
                <span>Scenario</span>
                <strong>{editingRecord.scenario || "—"}</strong>
              </div>
            </div>

            <label className="entry-field edit-amount-field">
              <span>Amount</span>
              <div className="money-input">
                <span>AED</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editAmount}
                  onChange={(event) => setEditAmount(event.target.value)}
                  autoFocus
                />
              </div>
            </label>

            <div className="record-modal-actions">
              <button
                type="button"
                className="entry-reset-button"
                onClick={() => setEditingRecord(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="entry-save-button"
                onClick={saveEdit}
                disabled={recordActionLoading || editAmount === ""}
              >
                {recordActionLoading ? "Saving…" : "Save Amount"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteRecord && (
        <div className="record-modal-backdrop" role="presentation">
          <div
            className="record-modal delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-record-title"
          >
            <div className="delete-icon">!</div>
            <h3 id="archive-record-title">Archive financial record?</h3>
            <p>
              This record will disappear from normal dashboards but remain in
              the audit history and can be restored later.
            </p>

            <div className="delete-record-summary">
              <strong>{deleteRecord.school?.name}</strong>
              <span>
                {deleteRecord.revenue_stream?.name} · {deleteRecord.metric?.name}
              </span>
              <span>
                {formatRecordMonth(deleteRecord.month)} · {deleteRecord.scenario}
              </span>
              <b>{formatMoney(deleteRecord.amount)}</b>
            </div>

            <div className="record-modal-actions">
              <button
                type="button"
                className="entry-reset-button"
                onClick={() => setDeleteRecord(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="archive-confirm-button"
                onClick={confirmArchive}
                disabled={recordActionLoading}
              >
                {recordActionLoading ? "Archiving…" : "Archive Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
