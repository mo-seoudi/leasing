import { AuthProvider } from "./auth/AuthProvider";
import AppRoutes from "./routes/AppRoutes";
import { FinancialPreferencesProvider } from "./settings/FinancialPreferencesProvider";

export default function App() {
  return (
    <AuthProvider>
      <FinancialPreferencesProvider>
        <AppRoutes />
      </FinancialPreferencesProvider>
    </AuthProvider>
  );
}
