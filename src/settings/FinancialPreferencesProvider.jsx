import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { VAT_BASES } from "../lib/vat";

const STORAGE_KEY = "comops.financialPreferences";
const FinancialPreferencesContext = createContext(null);

function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { vatDisplayBasis: saved.vatDisplayBasis === VAT_BASES.INCLUSIVE ? VAT_BASES.INCLUSIVE : VAT_BASES.EXCLUSIVE };
  } catch {
    return { vatDisplayBasis: VAT_BASES.EXCLUSIVE };
  }
}

export function FinancialPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(loadPreferences);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); }, [preferences]);
  const value = useMemo(() => ({
    ...preferences,
    setVatDisplayBasis: (vatDisplayBasis) => setPreferences((current) => ({ ...current, vatDisplayBasis })),
  }), [preferences]);
  return <FinancialPreferencesContext.Provider value={value}>{children}</FinancialPreferencesContext.Provider>;
}

export function useFinancialPreferences() {
  const value = useContext(FinancialPreferencesContext);
  if (!value) throw new Error("useFinancialPreferences must be used inside FinancialPreferencesProvider.");
  return value;
}
