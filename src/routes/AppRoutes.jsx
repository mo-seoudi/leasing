import { Navigate, Route, Routes } from "react-router-dom";

import PlatformLayout from "../layouts/PlatformLayout";
import ProgrammeSummaryPage from "../pages/leasing/ProgrammeSummaryPage";
import YearComparisonPage from "../pages/leasing/YearComparisonPage";
import ProgrammeComparisonPage from "../pages/leasing/ProgrammeComparisonPage";
import ProgrammeDirectoryPage from "../pages/leasing/ProgrammeDirectoryPage";

function DashboardPage() {
  return <h1>Commercial Operations Dashboard</h1>;
}

function SettingsPage() {
  return <h1>Settings</h1>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PlatformLayout />}>
        <Route
          index
          element={<Navigate to="/leasing/summary" replace />}
        />

        <Route path="dashboard" element={<DashboardPage />} />

        <Route
          path="leasing/summary"
          element={<ProgrammeSummaryPage />}
        />

        <Route
          path="leasing/year-comparison"
          element={<YearComparisonPage />}
        />

        <Route
          path="leasing/program-comparison"
          element={<ProgrammeComparisonPage />}
        />

        <Route
          path="leasing/programmes"
          element={<ProgrammeDirectoryPage />}
        />

        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/leasing/summary" replace />}
      />
    </Routes>
  );
}
