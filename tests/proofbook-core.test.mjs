import assert from "node:assert/strict";
import test from "node:test";

import {
  createBooking,
  createReference,
  isValidRecord,
  readBooking,
  saveBooking,
  STORAGE_KEY,
} from "../assets/proofbook-core.mjs";

const catalog = [
  {
    id: "seeded-consultation",
    name: "Seeded consultation",
    schedule: "Tomorrow at 10:00 AM",
    duration: "30 minutes",
  },
];

const deterministicCrypto = {
  getRandomValues(bytes) {
    bytes.set([0, 17, 34, 51, 68, 255]);
    return bytes;
  },
};

const details = {
  service: catalog[0],
  name: "  Ada Lovelace  ",
  email: "  ADA@EXAMPLE.COM  ",
};

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test("reference uses six cryptographically supplied bytes", () => {
  assert.equal(createReference(deterministicCrypto), "PB-0011223344FF");
});

test("booking normalizes customer details and records UTC creation", () => {
  const record = createBooking(details, {
    cryptoSource: deterministicCrypto,
    now: () => new Date("2026-07-13T14:00:00.000Z"),
  });

  assert.equal(record.customerName, "Ada Lovelace");
  assert.equal(record.email, "ada@example.com");
  assert.equal(record.createdAt, "2026-07-13T14:00:00.000Z");
  assert.equal(record.reference, "PB-0011223344FF");
  assert.equal(isValidRecord(record, catalog), true);
});

test("saved booking must round-trip before success", () => {
  const storage = memoryStorage();
  const record = createBooking(details, { cryptoSource: deterministicCrypto });

  assert.deepEqual(saveBooking(storage, record, catalog), record);
  assert.deepEqual(readBooking(storage, catalog), { state: "valid", record });
});

test("failed write or mismatched read never returns confirmation", () => {
  const record = createBooking(details, { cryptoSource: deterministicCrypto });
  const throwingStorage = {
    setItem() {
      throw new Error("quota unavailable");
    },
  };
  assert.throws(() => saveBooking(throwingStorage, record, catalog), /quota unavailable/);

  const mismatchedStorage = {
    setItem() {},
    getItem() {
      return JSON.stringify({ ...record, reference: "PB-FFFFFFFFFFFF" });
    },
  };
  assert.throws(() => saveBooking(mismatchedStorage, record, catalog), /could not be verified/);
});

test("malformed and incompatible records are discarded safely", () => {
  for (const invalid of [
    "not-json",
    JSON.stringify({}),
    JSON.stringify({
      ...createBooking(details, { cryptoSource: deterministicCrypto }),
      serviceId: "removed-service",
    }),
    JSON.stringify({
      ...createBooking(details, { cryptoSource: deterministicCrypto }),
      customerName: "<img src=x onerror=alert(1)>",
      reference: "<script>alert(1)</script>",
    }),
  ]) {
    const storage = memoryStorage();
    storage.setItem(STORAGE_KEY, invalid);
    assert.deepEqual(readBooking(storage, catalog), { state: "invalid", record: null });
    assert.equal(storage.getItem(STORAGE_KEY), null);
  }
});

test("empty storage has no booking and read failures propagate", () => {
  assert.deepEqual(readBooking(memoryStorage(), catalog), { state: "empty", record: null });
  assert.throws(
    () => readBooking({ getItem() { throw new Error("denied"); } }, catalog),
    /denied/,
  );
});
