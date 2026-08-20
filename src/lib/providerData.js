import { supabase } from "./supabase";

const SCHOOL_DISPLAY = {
  FRY: "Fry",
  ROSE: "Rose",
  RDXB: "Repton Dubai",
  RAB: "Repton Al Barsha",
};

function normaliseProviderName(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function createFallbackProvider(providerName) {
  const cleanName = String(providerName || "").trim();

  return {
    id: null,
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
      schools: [],
    },
  };
}

function mapContract(contract) {
  if (!contract) return null;

  const rentalFees =
    contract.rental_fees_description ||
    (contract.rental_fees_amount === null ||
    contract.rental_fees_amount === undefined
      ? null
      : Number(contract.rental_fees_amount));

  return {
    id: contract.id,
    status: contract.status || "Not Recorded",
    startDate: contract.start_date || "",
    expiryDate: contract.expiry_date || "",
    noticePeriod: contract.notice_period || "",
    commissionRate:
      contract.commission_rate === null ||
      contract.commission_rate === undefined
        ? null
        : Number(contract.commission_rate),
    rentalFees,
    revenueCollection: contract.revenue_collection || "",
    invoiceFrequency: contract.invoice_frequency || "",
    schools: (contract.provider_contract_schools || [])
      .map((item) => item.school?.code)
      .filter(Boolean)
      .map((code) => SCHOOL_DISPLAY[code] || code),
  };
}

function chooseCurrentContract(contracts = []) {
  if (!Array.isArray(contracts) || contracts.length === 0) {
    return null;
  }

  return [...contracts].sort((a, b) => {
    if (Boolean(a.is_active) !== Boolean(b.is_active)) {
      return a.is_active ? -1 : 1;
    }

    const aDate = a.expiry_date || a.start_date || "";
    const bDate = b.expiry_date || b.start_date || "";
    return String(bDate).localeCompare(String(aDate));
  })[0];
}

function mapProvider(row) {
  const contract = chooseCurrentContract(row.provider_contracts || []);

  return {
    id: row.id,
    name: row.name || "",
    contactPerson: row.contact_person || "",
    email: row.email || "",
    phone: row.phone || "",
    companyNumber: row.company_number || "",
    address: row.address || "",
    programmes: (row.programmes || [])
      .map((programme) => programme.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
    contract:
      mapContract(contract) ||
      createFallbackProvider(row.name).contract,
  };
}

let providerCache = [];
let providerLoadPromise = null;

export async function fetchProviders({ force = false } = {}) {
  if (!force && providerCache.length > 0) {
    return providerCache;
  }

  if (!force && providerLoadPromise) {
    return providerLoadPromise;
  }

  providerLoadPromise = (async () => {
    const { data, error } = await supabase
      .from("providers")
      .select(`
        id,
        name,
        contact_person,
        email,
        phone,
        company_number,
        address,
        programmes(id, name),
        provider_contracts(
          id,
          status,
          start_date,
          expiry_date,
          notice_period,
          commission_rate,
          rental_fees_amount,
          rental_fees_description,
          revenue_collection,
          invoice_frequency,
          is_active,
          provider_contract_schools(
            school:schools(id, code, name)
          )
        )
      `)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;

    providerCache = (data || []).map(mapProvider);
    return providerCache;
  })();

  try {
    return await providerLoadPromise;
  } finally {
    providerLoadPromise = null;
  }
}

export function getProviderByName(providerName, providers = providerCache) {
  const cleanName = String(providerName || "").trim();

  if (!cleanName) return null;

  const normalisedName = normaliseProviderName(cleanName);

  const provider = (providers || []).find(
    (item) => normaliseProviderName(item.name) === normalisedName
  );

  if (provider) return provider;

  return createFallbackProvider(cleanName);
}

export function getAllProviders() {
  return providerCache;
}

export function clearProviderCache() {
  providerCache = [];
  providerLoadPromise = null;
}

// Transitional preload: the current Programme Directory page still performs
// a synchronous provider lookup. Start loading the Supabase provider cache as
// soon as this module is imported so the modal can resolve real provider data
// while the page migration is completed on this branch.
fetchProviders().catch((error) => {
  console.error("Unable to preload providers from Supabase:", error);
});

export default providerCache;
