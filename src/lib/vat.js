export const VAT_BASES = Object.freeze({
  INCLUSIVE: "inclusive",
  EXCLUSIVE: "exclusive",
  NO_VAT: "no_vat",
});

export const DEFAULT_VAT_RATE = 5;
export const DEFAULT_DISPLAY_VAT_BASIS = VAT_BASES.EXCLUSIVE;
export const VAT_DISPLAY_STORAGE_KEY = "commercial-dashboard-vat-display-basis";

export function normalizeVatBasis(value) {
  return Object.values(VAT_BASES).includes(value) ? value : null;
}

export function amountExcludingVat(amount, vatBasis, vatRate = DEFAULT_VAT_RATE) {
  const value = Number(amount || 0);
  const basis = normalizeVatBasis(vatBasis);
  const rate = Number(vatRate ?? DEFAULT_VAT_RATE);
  if (basis === VAT_BASES.INCLUSIVE && rate > 0) return value / (1 + rate / 100);
  return value;
}

export function amountIncludingVat(amount, vatBasis, vatRate = DEFAULT_VAT_RATE) {
  const value = Number(amount || 0);
  const basis = normalizeVatBasis(vatBasis);
  const rate = Number(vatRate ?? DEFAULT_VAT_RATE);
  if (basis === VAT_BASES.EXCLUSIVE && rate > 0) return value * (1 + rate / 100);
  return value;
}

export function amountForVatDisplay(amount, sourceBasis, vatRate, displayBasis = DEFAULT_DISPLAY_VAT_BASIS) {
  if (displayBasis === VAT_BASES.INCLUSIVE) return amountIncludingVat(amount, sourceBasis, vatRate);
  return amountExcludingVat(amount, sourceBasis, vatRate);
}

export function readVatDisplayBasis() {
  if (typeof window === "undefined") return DEFAULT_DISPLAY_VAT_BASIS;
  return normalizeVatBasis(window.localStorage.getItem(VAT_DISPLAY_STORAGE_KEY)) || DEFAULT_DISPLAY_VAT_BASIS;
}

export function writeVatDisplayBasis(basis) {
  const normalized = normalizeVatBasis(basis);
  if (!normalized || normalized === VAT_BASES.NO_VAT) return;
  window.localStorage.setItem(VAT_DISPLAY_STORAGE_KEY, normalized);
  window.dispatchEvent(new CustomEvent("vat-display-basis-change", { detail: normalized }));
}
