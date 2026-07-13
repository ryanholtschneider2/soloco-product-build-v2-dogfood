export const STORAGE_KEY = "proofbook.booking.v1";
export const RECORD_VERSION = 1;

export function createReference(cryptoSource = globalThis.crypto) {
  const bytes = new Uint8Array(6);
  cryptoSource.getRandomValues(bytes);
  const suffix = Array.from(bytes, (value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `PB-${suffix}`;
}

export function createBooking(details, options = {}) {
  const now = options.now || (() => new Date());
  return {
    version: RECORD_VERSION,
    reference: createReference(options.cryptoSource),
    serviceId: details.service.id,
    serviceName: details.service.name,
    schedule: details.service.schedule,
    duration: details.service.duration,
    customerName: details.name.trim(),
    email: details.email.trim().toLowerCase(),
    createdAt: now().toISOString(),
  };
}

export function isValidRecord(record, catalog) {
  if (!record || typeof record !== "object") {
    return false;
  }
  const service = catalog.find((item) => item.id === record.serviceId);
  return record.version === RECORD_VERSION
    && /^PB-[0-9A-F]{12}$/.test(record.reference)
    && Boolean(service)
    && record.serviceName === service.name
    && record.schedule === service.schedule
    && record.duration === service.duration
    && typeof record.customerName === "string"
    && record.customerName.trim().length >= 2
    && record.customerName.length <= 80
    && typeof record.email === "string"
    && record.email.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)
    && typeof record.createdAt === "string"
    && !Number.isNaN(Date.parse(record.createdAt));
}

export function saveBooking(storage, record, catalog) {
  storage.setItem(STORAGE_KEY, JSON.stringify(record));
  const savedRecord = JSON.parse(storage.getItem(STORAGE_KEY));
  if (!isValidRecord(savedRecord, catalog) || savedRecord.reference !== record.reference) {
    throw new Error("Stored confirmation could not be verified");
  }
  return savedRecord;
}

export function readBooking(storage, catalog) {
  const serialized = storage.getItem(STORAGE_KEY);
  if (!serialized) {
    return { state: "empty", record: null };
  }

  try {
    const record = JSON.parse(serialized);
    if (!isValidRecord(record, catalog)) {
      throw new Error("Invalid saved booking");
    }
    return { state: "valid", record };
  } catch (_error) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (_storageError) {
      // The invalid record remains isolated because it is never returned.
    }
    return { state: "invalid", record: null };
  }
}
