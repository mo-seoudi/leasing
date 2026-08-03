import { Navigate, Route, Routes } from "react-router-dom";

import PlatformLayout from "../layouts/PlatformLayout";
import ProgrammeDirectoryPage from "../pages/leasing/ProgrammeDirectoryPage";
import YearComparisonPage from "../pages/leasing/YearComparisonPage";
import CateringDashboardPage from "../pages/catering/CateringDashboardPage";
import CateringComparisonPage from "../pages/catering/CateringComparisonPage";
import UniformDashboardPage from "../pages/uniform/UniformDashboardPage";
import UniformComparisonPage from "../pages/uniform/UniformComparisonPage";
import DashboardPage from "../pages/dashboard/DashboardPage";


function SettingsPage() {
  return <h1>Settings</h1>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PlatformLayout />}>
        {/* Commercial Operations Dashboard is the default landing page */}
        <Route
          index
          element={<Navigate to="/dashboard" replace />}
        />

        <Route path="dashboard" element={<DashboardPage />} />

        <Route
          path="catering"
          element={<CateringDashboardPage />}
        />

        <Route
          path="catering/comparison"
          element={<CateringComparisonPage />}
        />

        <Route
          path="uniform"
          element={<UniformDashboardPage />}
        />

        <Route
          path="uniform/comparison"
          element={<UniformComparisonPage />}
        />

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
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}
