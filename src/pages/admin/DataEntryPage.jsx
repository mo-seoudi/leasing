import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../auth/AuthProvider";

import {
  fetchDataEntryOptions,
  getAcademicYearFromMonth,
  getFinanceTermFromMonth,
  saveFinancialRecords,
} from "../../lib/financialData";

import "./DataEntryPage.css";

const SCENARIOS = [
  "Actual",
  "Budget",
  "Forecast",
];

function formatMetricName(metric) {
  return metric?.name || metric?.code || "Metric";
}

export default function DataEntryPage() {
  const { role } = useAuth();

  const [options, setOptions] = useState({
    schools: [],
    revenueStreams: [],
    metrics: [],
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    schoolId: "",
    revenueStreamId: "",
    month: "",
    scenario: "Actual",
  });

  const [metricValues, setMetricValues] =
    useState({});

  const canEdit =
    role === "admin" ||
    role === "editor";

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        setLoading(true);
        setError("");

        const data =
          await fetchDataEntryOptions();

        if (active) {
          setOptions(data);
        }
      } catch (loadError) {
        console.error(
          "Unable to load data-entry options:",
          loadError
        );

        if (active) {
          setError(
            loadError?.message ||
              "Unable to load the data-entry setup."
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
        (school) =>
          String(school.id) ===
          String(form.schoolId)
      ),
    [options.schools, form.schoolId]
  );

  const selectedStream = useMemo(
    () =>
      options.revenueStreams.find(
        (stream) =>
          String(stream.id) ===
          String(form.revenueStreamId)
      ),
    [
      options.revenueStreams,
      form.revenueStreamId,
    ]
  );

  const streamMetrics = useMemo(
    () =>
      options.metrics.filter(
        (metric) =>
          String(metric.revenue_stream_id) ===
          String(form.revenueStreamId)
      ),
    [
      options.metrics,
      form.revenueStreamId,
    ]
  );

  const academicYear =
    getAcademicYearFromMonth(form.month);

  const term =
    getFinanceTermFromMonth(form.month);

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
      month: "",
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
        "Your account does not have permission to enter financial data."
      );
      return;
    }

    if (
      !form.schoolId ||
      !form.revenueStreamId ||
      !form.month
    ) {
      setError(
        "Select a school, revenue stream and reporting month."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result =
        await saveFinancialRecords({
          schoolId: form.schoolId,
          revenueStreamId:
            form.revenueStreamId,
          month: form.month,
          scenario: form.scenario,
          metricValues,
        });

      setSuccess(
        `${result.savedCount} ${
          result.savedCount === 1
            ? "record"
            : "records"
        } saved successfully.`
      );
    } catch (saveError) {
      console.error(
        "Unable to save financial data:",
        saveError
      );

      setError(
        saveError?.message ||
          "Unable to save the financial records."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="data-entry-page">
        <div className="data-entry-loading">
          Loading data-entry workspace…
        </div>
      </section>
    );
  }

  return (
    <section className="data-entry-page">
      <div className="data-entry-intro">
        <div>
          <span className="data-entry-eyebrow">
            FINANCIAL DATA
          </span>

          <h2>
            Add monthly performance
          </h2>

          <p>
            Enter financial results across
            schools and revenue streams.
            Reporting periods and finance terms
            are calculated automatically.
          </p>
        </div>

        <div className="data-entry-status">
          <span className="status-dot" />
          Supabase connected
        </div>
      </div>

      {!canEdit && (
        <div className="data-entry-permission-banner">
          You currently have read-only access.
          An Admin or Editor role is required to
          save financial records.
        </div>
      )}

      <form
        className="data-entry-workspace"
        onSubmit={handleSubmit}
      >
        <section className="data-entry-main-card">
          <div className="entry-card-header">
            <div>
              <span className="entry-step">
                ENTRY DETAILS
              </span>

              <h3>
                Reporting context
              </h3>

              <p>
                Select where and when this
                financial activity belongs.
              </p>
            </div>
          </div>

          <div className="entry-fields-grid">
            <label className="entry-field">
              <span>School</span>

              <select
                value={form.schoolId}
                onChange={(event) =>
                  updateForm(
                    "schoolId",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select school
                </option>

                {options.schools.map(
                  (school) => (
                    <option
                      key={school.id}
                      value={school.id}
                    >
                      {school.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="entry-field">
              <span>Revenue Stream</span>

              <select
                value={
                  form.revenueStreamId
                }
                onChange={(event) =>
                  updateForm(
                    "revenueStreamId",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select revenue stream
                </option>

                {options.revenueStreams.map(
                  (stream) => (
                    <option
                      key={stream.id}
                      value={stream.id}
                    >
                      {stream.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="entry-field">
              <span>Reporting Month</span>

              <input
                type="month"
                value={form.month}
                onChange={(event) =>
                  updateForm(
                    "month",
                    event.target.value
                  )
                }
              />
            </label>

            <label className="entry-field">
              <span>Scenario</span>

              <select
                value={form.scenario}
                onChange={(event) =>
                  updateForm(
                    "scenario",
                    event.target.value
                  )
                }
              >
                {SCENARIOS.map(
                  (scenario) => (
                    <option
                      key={scenario}
                      value={scenario}
                    >
                      {scenario}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>

          <div className="period-preview">
            <div>
              <span>Academic Year</span>
              <strong>
                {academicYear || "—"}
              </strong>
            </div>

            <div className="period-divider" />

            <div>
              <span>Finance Term</span>
              <strong>
                {term || "—"}
              </strong>
            </div>

            <div className="period-divider" />

            <div>
              <span>Basis</span>
              <strong>
                Sep – Aug
              </strong>
            </div>
          </div>

          <div className="metrics-section">
            <div className="metrics-heading">
              <div>
                <span className="entry-step">
                  VALUES
                </span>

                <h3>
                  Financial metrics
                </h3>

                <p>
                  Metrics are determined by the
                  selected revenue stream.
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
                <div className="placeholder-icon">
                  +
                </div>

                <strong>
                  Select a revenue stream
                </strong>

                <span>
                  Its available metrics will
                  appear here automatically.
                </span>
              </div>
            ) : streamMetrics.length === 0 ? (
              <div className="metric-placeholder">
                <strong>
                  No active metrics
                </strong>

                <span>
                  This revenue stream does not
                  currently have any active
                  metrics configured.
                </span>
              </div>
            ) : (
              <div className="metric-input-grid">
                {streamMetrics.map(
                  (metric) => (
                    <label
                      className="metric-entry-card"
                      key={metric.id}
                    >
                      <span>
                        {formatMetricName(metric)}
                      </span>

                      <div className="money-input">
                        <span>AED</span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={
                            metricValues[
                              metric.id
                            ] ?? ""
                          }
                          onChange={(event) =>
                            updateMetric(
                              metric.id,
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </label>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        <aside className="data-entry-review-card">
          <div className="review-header">
            <span className="entry-step">
              REVIEW
            </span>

            <h3>Entry summary</h3>

            <p>
              Review the reporting context
              before saving.
            </p>
          </div>

          <div className="review-list">
            <div>
              <span>School</span>
              <strong>
                {selectedSchool?.name || "—"}
              </strong>
            </div>

            <div>
              <span>Revenue Stream</span>
              <strong>
                {selectedStream?.name || "—"}
              </strong>
            </div>

            <div>
              <span>Academic Year</span>
              <strong>
                {academicYear || "—"}
              </strong>
            </div>

            <div>
              <span>Term</span>
              <strong>
                {term || "—"}
              </strong>
            </div>

            <div>
              <span>Scenario</span>
              <strong>
                {form.scenario}
              </strong>
            </div>
          </div>

          {error && (
            <div className="entry-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="entry-message success">
              {success}
            </div>
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
              disabled={
                saving || !canEdit
              }
            >
              {saving
                ? "Saving…"
                : "Save Records"}
            </button>
          </div>

          <p className="entry-save-note">
            Existing records for the same
            school, month, scenario and metric
            will be updated rather than
            duplicated.
          </p>
        </aside>
      </form>
    </section>
  );
}
