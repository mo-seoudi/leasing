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
  const [vatRevision, setVatRevision] = useState(0);
  const [vatDisplayNotice, setVatDisplayNotice] = useState("");

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); }, [preferences]);

  function setVatDisplayBasis(vatDisplayBasis) {
    const next = vatDisplayBasis === VAT_BASES.INCLUSIVE ? VAT_BASES.INCLUSIVE : VAT_BASES.EXCLUSIVE;
    if (next === preferences.vatDisplayBasis) return;
    setPreferences((current) => ({ ...current, vatDisplayBasis: next }));
    setVatRevision((revision) => revision + 1);
    const label = next === VAT_BASES.INCLUSIVE ? "VAT Inclusive" : "VAT Exclusive";
    setVatDisplayNotice(`Dashboard recalculated — all monetary figures are now shown ${label}.`);
    window.setTimeout(() => setVatDisplayNotice(""), 4200);
  }

  const value = useMemo(() => ({ ...preferences, vatRevision, vatDisplayNotice, setVatDisplayBasis }), [preferences, vatRevision, vatDisplayNotice]);
  return <FinancialPreferencesContext.Provider value={value}>{children}</FinancialPreferencesContext.Provider>;
}

export function useFinancialPreferences() {
  const value = useContext(FinancialPreferencesContext);
  if (!value) throw new Error("useFinancialPreferences must be used inside FinancialPreferencesProvider.");
  return value;
}
