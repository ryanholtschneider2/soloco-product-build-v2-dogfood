const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function setItem(key, value) {
  if (key === "proofbook.booking.v1") {
    throw new DOMException("Injected release-proof write failure", "QuotaExceededError");
  }
  return originalSetItem.call(this, key, value);
};
