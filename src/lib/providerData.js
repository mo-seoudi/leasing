import providerSource from "../data/provider-data.json";

const providers =
  providerSource?.providers || {};

function normaliseProviderName(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

/*
 * Main lookup uses the provider key stored in
 * leasing-data.json.
 */
export function getProviderByName(providerName) {
  const cleanName = String(
    providerName || ""
  ).trim();

  if (!cleanName) {
    return null;
  }

  if (providers[cleanName]) {
    return providers[cleanName];
  }

  /*
   * Fallback lookup in case of minor differences in
   * spaces or capitalisation.
   */
  const normalisedName =
    normaliseProviderName(cleanName);

  const matchingKey = Object.keys(
    providers
  ).find(
    (key) =>
      normaliseProviderName(key) ===
      normalisedName
  );

  if (matchingKey) {
    return providers[matchingKey];
  }

  /*
   * Return a usable fallback record so clicking a provider
   * never crashes the page.
   */
  return {
    name: cleanName,
    contactPerson: "",
    email: "",
    phone: "",
    companyNumber: "",
    address: "",
    programmes: [],
    contract: {
      status: "Not Recorded",
      startDate: "",
      expiryDate: "",
      noticePeriod: "",
      commissionRate: null,
      rentalFees: null,
      revenueCollection: "",
      invoiceFrequency: "",
      deposit: null,
      schools: [],
    },
  };
}

export function getAllProviders() {
  return Object.values(providers);
}

export default providers;
