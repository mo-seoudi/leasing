import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import leasingSource from "../../data/leasing-data.json";
import cateringSource from "../../data/catering-data.json";
import uniformSource from "../../data/uniform-data.json";
import providerSource from "../../data/provider-data.json";

import "./DashboardPage.css";

const STREAM_COLOURS = {
  Leasing: "#6d5dfc",
  Catering: "#159f8c",
  Uniform: "#e97832",
};

const SCHOOL_NAMES = {
  RDXB: "Repton Dubai",
  RAB: "Repton Al Barsha",
  FRY: "Repton Fry",
  ROSE: "Repton Rose",
  Fry: "Repton Fry",
  Rose: "Repton Rose",
};

const MONTH_ORDER = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}

function formatPercent(value) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(1)}%`;
}

function getLatestAcademicYear(years) {
  return [...years].sort((a, b) => b.localeCompare(a))[0] || "";
}

function getSchoolLabel(value) {
  return SCHOOL_NAMES[value] || value || "Unknown";
}

function getLeasingSummary(records) {
  let sales = 0;
  let commission = 0;
  let rentalFees = 0;

  records.forEach((record) => {
    const amount = toNumber(record.amount);

    if (record.incomeType === "Sales") {
      sales += amount;
    }

    if (record.incomeType === "Commission") {
      commission += amount;
    }

    if (record.incomeType === "Rental Fees") {
      rentalFees += amount;
    }
  });

  return {
    revenue: sales + rentalFees,
    income: commission + rentalFees,
  };
}

function getSalesCommissionSummary(records) {
  let sales = 0;
  let commission = 0;

  records.forEach((record) => {
    const amount = toNumber(record.amount);

    if (record.metric === "Sales") {
      sales += amount;
    }

    if (record.metric === "Commission") {
      commission += amount;
    }
  });

  return {
    revenue: sales,
    income: commission,
  };
}

function buildSchoolData({
  leasingRecords,
  cateringRecords,
  uniformRecords,
}) {
  const grouped = new Map();

  function getEntry(school) {
    const schoolName = getSchoolLabel(school);

    if (!grouped.has(schoolName)) {
      grouped.set(schoolName, {
        school: schoolName,
        revenue: 0,
        income: 0,
      });
    }

    return grouped.get(schoolName);
  }

  leasingRecords.forEach((record) => {
    const entry = getEntry(record.school);
    const amount = toNumber(record.amount);

    if (record.incomeType === "Sales") {
      entry.revenue += amount;
    }

    if (record.incomeType === "Commission") {
      entry.income += amount;
    }

    if (record.incomeType === "Rental Fees") {
      entry.revenue += amount;
      entry.income += amount;
    }
  });

  [...cateringRecords, ...uniformRecords].forEach((record) => {
    const entry = getEntry(record.schoolName || record.school);
    const amount = toNumber(record.amount);

    if (record.metric === "Sales") {
      entry.revenue += amount;
    }

    if (record.metric === "Commission") {
      entry.income += amount;
    }
  });

  return [...grouped.values()].sort((a, b) => b.revenue - a.revenue);
}

function buildMonthlyTrend({
  leasingRecords,
  cateringRecords,
  uniformRecords,
}) {
  const grouped = new Map();

  function getEntry(monthKey) {
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, {
        month: monthKey,
        revenue: 0,
        income: 0,
      });
    }

    return grouped.get(monthKey);
  }

  leasingRecords.forEach((record) => {
    const monthKey = record.termStart
      ? String(record.termStart).slice(0, 7)
      : "";

    if (!monthKey) {
      return;
    }

    const entry = getEntry(monthKey);
    const amount = toNumber(record.amount);

    if (record.incomeType === "Sales") {
      entry.revenue += amount;
    }

    if (record.incomeType === "Commission") {
      entry.income += amount;
    }

    if (record.incomeType === "Rental Fees") {
      entry.revenue += amount;
      entry.income += amount;
    }
  });

  [...cateringRecords, ...uniformRecords].forEach((record) => {
    const monthKey = String(record.month || "").slice(0, 7);

    if (!monthKey) {
      return;
    }

    const entry = getEntry(monthKey);
    const amount = toNumber(record.amount);

    if (record.metric === "Sales") {
      entry.revenue += amount;
    }

    if (record.metric === "Commission") {
      entry.income += amount;
    }
  });

  return [...grouped.values()]
    .map((item) => {
      const date = new Date(`${item.month}-01T00:00:00`);

      return {
        ...item,
        label: new Intl.DateTimeFormat("en-GB", {
          month: "short",
        }).format(date),
        monthNumber: date.getMonth() + 1,
      };
    })
    .sort(
      (a, b) =>
        MONTH_ORDER.indexOf(a.monthNumber) -
        MONTH_ORDER.indexOf(b.monthNumber),
    );
}

function getContractHealth() {
  const providers = Object.values(providerSource.providers || {});
  const today = new Date();
  const warningDate = new Date(today);
  warningDate.setDate(warningDate.getDate() + 90);

  let active = 0;
  let expiring = 0;
  let expired = 0;
  let notRecorded = 0;

  providers.forEach((provider) => {
    const contract = provider.contract || {};
    const storedStatus = String(contract.status || "").toLowerCase();
    const expiryDate = contract.expiryDate
      ? new Date(`${contract.expiryDate}T23:59:59`)
      : null;

    if (
      storedStatus.includes("cancel") ||
      storedStatus.includes("no active") ||
      storedStatus.includes("expired")
    ) {
      expired += 1;
      return;
    }

    if (!expiryDate || Number.isNaN(expiryDate.getTime())) {
      if (storedStatus === "active") {
        active += 1;
      } else {
        notRecorded += 1;
      }
      return;
    }

    if (expiryDate < today) {
      expired += 1;
    } else if (expiryDate <= warningDate) {
      expiring += 1;
    } else {
      active += 1;
    }
  });

  return {
    total: providers.length,
    active,
    expiring,
    expired,
    notRecorded,
  };
}

function StreamCard({
  title,
  description,
  revenue,
  income,
  contribution,
  path,
  colour,
}) {
  return (
    <Link
      to={path}
      className="dashboard-stream-card"
      style={{ "--stream-colour": colour }}
    >
      <div className="dashboard-stream-heading">
        <div>
          <span>{title}</span>
          <p>{description}</p>
        </div>

        <span className="dashboard-stream-arrow">→</span>
      </div>

      <strong>{formatCurrency(revenue)}</strong>

      <div className="dashboard-stream-meta">
        <span>School income</span>
        <b>{formatCurrency(income)}</b>
      </div>

      <div className="dashboard-stream-contribution">
        <span>{formatPercent(contribution)} of total revenue</span>
        <div>
          <i style={{ width: `${Math.min(contribution, 100)}%` }} />
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const leasingRecords = Array.isArray(leasingSource.records)
    ? leasingSource.records
    : [];

  const cateringRecords = Array.isArray(cateringSource.records)
    ? cateringSource.records
    : [];

  const uniformRecords = Array.isArray(uniformSource.records)
    ? uniformSource.records
    : [];

  const academicYears = useMemo(
    () =>
      unique([
        ...leasingRecords.map((record) => record.academicYear),
        ...cateringRecords.map((record) => record.academicYear),
        ...uniformRecords.map((record) => record.academicYear),
      ]).sort((a, b) => b.localeCompare(a)),
    [leasingRecords, cateringRecords, uniformRecords],
  );

  const [academicYear, setAcademicYear] = useState(() =>
    getLatestAcademicYear(academicYears),
  );

  const filteredLeasing = useMemo(
    () =>
      leasingRecords.filter(
        (record) => !academicYear || record.academicYear === academicYear,
      ),
    [academicYear, leasingRecords],
  );

  const filteredCatering = useMemo(
    () =>
      cateringRecords.filter(
        (record) =>
          (!academicYear || record.academicYear === academicYear) &&
          record.scenario === "Actual",
      ),
    [academicYear, cateringRecords],
  );

  const filteredUniform = useMemo(
    () =>
      uniformRecords.filter(
        (record) =>
          (!academicYear || record.academicYear === academicYear) &&
          record.scenario === "Actual",
      ),
    [academicYear, uniformRecords],
  );

  const streamData = useMemo(() => {
    const leasing = getLeasingSummary(filteredLeasing);
    const catering = getSalesCommissionSummary(filteredCatering);
    const uniform = getSalesCommissionSummary(filteredUniform);

    const result = [
      {
        name: "Leasing",
        description: "Programmes and facility income",
        path: "/leasing/programmes",
        ...leasing,
      },
      {
        name: "Catering",
        description: "Food-service sales and commission",
        path: "/catering",
        ...catering,
      },
      {
        name: "Uniform",
        description: "Uniform sales and commission",
        path: "/uniform",
        ...uniform,
      },
    ];

    const totalRevenue = result.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );

    return result.map((item) => ({
      ...item,
      contribution:
        totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
    }));
  }, [filteredLeasing, filteredCatering, filteredUniform]);

  const totalRevenue = streamData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );

  const totalIncome = streamData.reduce(
    (sum, item) => sum + item.income,
    0,
  );

  const schoolData = useMemo(
    () =>
      buildSchoolData({
        leasingRecords: filteredLeasing,
        cateringRecords: filteredCatering,
        uniformRecords: filteredUniform,
      }),
    [filteredLeasing, filteredCatering, filteredUniform],
  );

  const monthlyData = useMemo(
    () =>
      buildMonthlyTrend({
        leasingRecords: filteredLeasing,
        cateringRecords: filteredCatering,
        uniformRecords: filteredUniform,
      }),
    [filteredLeasing, filteredCatering, filteredUniform],
  );

  const contractHealth = useMemo(() => getContractHealth(), []);

  const schoolsCount = unique(
    schoolData.map((item) => item.school),
  ).length;

  return (
    <section className="commercial-dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">Executive Overview</span>
          <h1>Commercial Operations Dashboard</h1>
          <p>
            Consolidated performance across Leasing, Catering and Uniform.
          </p>
        </div>

        <div className="dashboard-period-filter">
          <label htmlFor="dashboard-academic-year">Academic Year</label>
          <select
            id="dashboard-academic-year"
            value={academicYear}
            onChange={(event) => setAcademicYear(event.target.value)}
          >
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="dashboard-kpi-grid">
        <article className="dashboard-kpi-card primary">
          <span>Commercial Revenue</span>
          <strong>{formatCurrency(totalRevenue)}</strong>
          <small>Combined revenue across active streams</small>
        </article>

        <article className="dashboard-kpi-card income">
          <span>School Income</span>
          <strong>{formatCurrency(totalIncome)}</strong>
          <small>Commission and leasing income</small>
        </article>

        <article className="dashboard-kpi-card">
          <span>Revenue Streams</span>
          <strong>{streamData.length}</strong>
          <small>Leasing, Catering and Uniform</small>
        </article>

        <article className="dashboard-kpi-card">
          <span>Schools Covered</span>
          <strong>{schoolsCount}</strong>
          <small>Schools represented in the selected period</small>
        </article>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Revenue Streams</h2>
            <p>Select a stream to open its detailed dashboard.</p>
          </div>
        </div>

        <div className="dashboard-stream-grid">
          {streamData.map((stream) => (
            <StreamCard
              key={stream.name}
              title={stream.name}
              description={stream.description}
              revenue={stream.revenue}
              income={stream.income}
              contribution={stream.contribution}
              path={stream.path}
              colour={STREAM_COLOURS[stream.name]}
            />
          ))}
        </div>
      </section>

      <section className="dashboard-chart-grid">
        <article className="dashboard-chart-card">
          <div className="dashboard-card-heading">
            <div>
              <h2>Revenue by Stream</h2>
              <p>Contribution of each revenue stream for {academicYear}.</p>
            </div>
          </div>

          <div className="dashboard-chart-container dashboard-pie-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={streamData}
                  dataKey="revenue"
                  nameKey="name"
                  innerRadius="56%"
                  outerRadius="82%"
                  paddingAngle={3}
                >
                  {streamData.map((item) => (
                    <Cell
                      key={item.name}
                      fill={STREAM_COLOURS[item.name]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-chart-card">
          <div className="dashboard-card-heading">
            <div>
              <h2>Performance by School</h2>
              <p>Commercial revenue and school income by school.</p>
            </div>
          </div>

          <div className="dashboard-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={schoolData}
                margin={{ top: 12, right: 12, left: 8, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="school"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={52}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={formatCompactCurrency}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar
                  dataKey="revenue"
                  name="Commercial Revenue"
                  fill="#38a3d1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="income"
                  name="School Income"
                  fill="#e97832"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="dashboard-chart-card dashboard-monthly-card">
        <div className="dashboard-card-heading">
          <div>
            <h2>Monthly Performance</h2>
            <p>Combined commercial revenue and school income from September to August.</p>
          </div>
        </div>

        <div className="dashboard-chart-container dashboard-line-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{ top: 12, right: 22, left: 10, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 10 }}
                tickFormatter={formatCompactCurrency}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Commercial Revenue"
                stroke="#38a3d1"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="income"
                name="School Income"
                stroke="#e97832"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="dashboard-info-card">
          <div className="dashboard-card-heading">
            <div>
              <h2>Contract Health</h2>
              <p>Current status of leasing provider records.</p>
            </div>

            <span className="dashboard-count-pill">
              {contractHealth.total} providers
            </span>
          </div>

          <div className="contract-health-grid">
            <div className="contract-health-item active">
              <span>Active</span>
              <strong>{contractHealth.active}</strong>
            </div>

            <div className="contract-health-item expiring">
              <span>Expiring Soon</span>
              <strong>{contractHealth.expiring}</strong>
            </div>

            <div className="contract-health-item expired">
              <span>Expired / Inactive</span>
              <strong>{contractHealth.expired}</strong>
            </div>

            <div className="contract-health-item unknown">
              <span>Not Recorded</span>
              <strong>{contractHealth.notRecorded}</strong>
            </div>
          </div>
        </article>

        <article className="dashboard-info-card">
          <div className="dashboard-card-heading">
            <div>
              <h2>Quick Access</h2>
              <p>Open the main operational views.</p>
            </div>
          </div>

          <div className="dashboard-quick-links">
            <Link to="/leasing/programmes">
              <span>Leasing</span>
              <b>Programme Directory</b>
              <i>→</i>
            </Link>

            <Link to="/catering">
              <span>Catering</span>
              <b>Dashboard</b>
              <i>→</i>
            </Link>

            <Link to="/uniform">
              <span>Uniform</span>
              <b>Dashboard</b>
              <i>→</i>
            </Link>
          </div>
        </article>
      </section>
    </section>
  );
}
