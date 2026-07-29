import { Navigate, Route, Routes } from "react-router-dom";

import PlatformLayout from "../layouts/PlatformLayout";
import ProgrammeDirectoryPage from "../pages/leasing/ProgrammeDirectoryPage";
import YearComparisonPage from "../pages/leasing/YearComparisonPage";

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
        {/* Programme Directory is the default landing page */}
        <Route
          index
          element={<Navigate to="/leasing/programmes" replace />}
        />

        <Route path="dashboard" element={<DashboardPage />} />

        <Route
          path="leasing/programmes"
          element={<ProgrammeDirectoryPage />}
        />

        <Route
          path="leasing/year-comparison"
          element={<YearComparisonPage />}
        />

        {/* Redirect retired pages to Programme Directory */}
        <Route
          path="leasing/summary"
          element={<Navigate to="/leasing/programmes" replace />}
        />

        <Route
          path="leasing/program-comparison"
          element={<Navigate to="/leasing/programmes" replace />}
        />

        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/leasing/programmes" replace />}
      />
    </Routes>
  );
}
