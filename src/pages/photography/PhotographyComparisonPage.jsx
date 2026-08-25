import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PerformanceComparison from "../../components/comparison/PerformanceComparison";
import {
  fetchPhotographyRecords,
  formatCurrency,
  getPhotographyAcademicYears,
  getPhotographySchools,
} from "../../lib/photographyData";

const METRICS = [
  { key: "sales", label: "Sales", source: "Sales" },
  { key: "commission", label: "Commission", source: "Commission" },
];

export default function PhotographyComparisonPage() {
  const { setHeaderControls } = useOutletContext();
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [school, setSchool] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchPhotographyRecords();
        if (active) setAllRecords(data);
      } catch (loadError) {
        if (active) setError(loadError?.message || "Unable to load Photography data.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const schools = useMemo(() => getPhotographySchools(allRecords), [allRecords]);
  const academicYears = useMemo(() => getPhotographyAcademicYears(allRecords), [allRecords]);
  const records = useMemo(
    () => allRecords.filter((record) => (!school || record.school === school) && record.scenario === "Actual"),
    [allRecords, school]
  );

  useEffect(() => {
    setHeaderControls(
      <div className="header-page-filters">
        <label className="header-filter-control wide">
          <span>School</span>
          <select value={school} onChange={(event) => setSchool(event.target.value)}>
            <option value="">All Schools</option>
            {schools.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
        </label>
      </div>
    );
    return () => setHeaderControls(null);
  }, [school, schools, setHeaderControls]);

  if (loading) return <div className="dashboard-loading-state">Loading Photography data…</div>;
  if (error) return <div className="dashboard-error-state">{error}</div>;

  return (
    <PerformanceComparison
      records={records}
      academicYears={academicYears}
      metrics={METRICS}
      metricKey="metric"
      formatCurrency={formatCurrency}
      startMonth={9}
    />
  );
}
