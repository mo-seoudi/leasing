import { supabase } from "./supabase";

const SCHOOL_DISPLAY = {
  FRY: "Fry",
  ROSE: "Rose",
  RDXB: "Repton Dubai",
  RAB: "Repton Al Barsha",
};

const LEGACY_PROVIDER_ALIASES = {
  "Gulf Star / Evolve": "Evolve Academy (Budo Juku Sports Consultancy LLC)",
  "Chinese Language Institute": "Chinese Language Institute Middle East (CLIME)",
  "Alliance Francaise": "Alliance Française Abu Dhabi",
  "Badminton Academy": "Day Light Sports Academy L.L.C - O.P.",
  "Basketball Academy": "RnB Sports Managemen",
  "Peak Sports": "Peak Sports Academy – LLC",
  "Gulf Multi Sport": "Gulf Multi Sports",
  "Proactive Soccer School": "Proactive Soccer School LTD",
  "Champs Gymnastics": "Champs Gymnastics Academy",
  "Prototype Fitness": "Prototype Fitness Sports Academy",
  "Neptune Swimming Club": "Neptune Swimming Academy",
  "Global Sports RS": "Global Sports Recreation Services LLC",
};

function normaliseProviderName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
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

  const aliasTarget = LEGACY_PROVIDER_ALIASES[cleanName] || cleanName;
  const normalisedRequestedName = normaliseProviderName(aliasTarget);

  const provider = (providers || []).find(
    (item) =>
      normaliseProviderName(item.name) === normalisedRequestedName
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

fetchProviders().catch((error) => {
  console.error("Unable to preload providers from Supabase:", error);
});

export default providerCache;
