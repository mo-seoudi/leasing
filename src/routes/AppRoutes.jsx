import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoute";
import PlatformLayout from "../layouts/PlatformLayout";

import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import LeasingDashboardPage from "../pages/leasing/LeasingDashboardPage";
import ProgrammeDirectoryGate from "../pages/leasing/ProgrammeDirectoryGate";
import YearComparisonPage from "../pages/leasing/YearComparisonPage";
import CateringDashboardPage from "../pages/catering/CateringDashboardPage";
import CateringComparisonPage from "../pages/catering/CateringComparisonPage";
import UniformDashboardPage from "../pages/uniform/UniformDashboardPage";
import UniformComparisonPage from "../pages/uniform/UniformComparisonPage";
import DataEntryPage from "../pages/admin/DataEntryPage";
import SettingsPage from "../pages/settings/SettingsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><PlatformLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="catering" element={<CateringDashboardPage />} />
        <Route path="catering/comparison" element={<CateringComparisonPage />} />
        <Route path="uniform" element={<UniformDashboardPage />} />
        <Route path="uniform/comparison" element={<UniformComparisonPage />} />
        <Route path="leasing" element={<LeasingDashboardPage />} />
        <Route path="leasing/programmes" element={<ProgrammeDirectoryGate />} />
        <Route path="leasing/year-comparison" element={<YearComparisonPage />} />
        <Route path="leasing/summary" element={<Navigate to="/leasing" replace />} />
        <Route path="leasing/program-comparison" element={<Navigate to="/leasing/programmes" replace />} />
        <Route path="financial-records" element={<DataEntryPage />} />
        <Route path="data-entry" element={<Navigate to="/financial-records" replace />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
