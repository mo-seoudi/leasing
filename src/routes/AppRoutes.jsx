import { Navigate, Route, Routes } from "react-router-dom";

import LeasingLayout from "../layouts/LeasingLayout";
import ProgrammeSummaryPage from "../pages/leasing/ProgrammeSummaryPage";
import YearComparisonPage from "../pages/leasing/YearComparisonPage";
import ProgrammeComparisonPage from "../pages/leasing/ProgrammeComparisonPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/leasing/summary" replace />}
      />

      <Route path="/leasing" element={<LeasingLayout />}>
        <Route
          index
          element={<Navigate to="summary" replace />}
        />

        <Route
          path="summary"
          element={<ProgrammeSummaryPage />}
        />

        <Route
          path="year-comparison"
          element={<YearComparisonPage />}
        />

        <Route
          path="program-comparison"
          element={<ProgrammeComparisonPage />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/leasing/summary" replace />}
      />
    </Routes>
  );
}
