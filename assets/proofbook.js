import {
  createBooking,
  readBooking,
  saveBooking,
  STORAGE_KEY,
} from "./proofbook-core.mjs";

(() => {
  "use strict";

  const defaultCatalog = [
    {
      id: "seeded-consultation",
      name: "Seeded consultation",
      schedule: "Tomorrow at 10:00 AM",
      duration: "30 minutes",
    },
  ];
  const catalog = Array.isArray(window.PROOFBOOK_CATALOG)
    ? window.PROOFBOOK_CATALOG
    : defaultCatalog;

  const elements = {
    form: document.querySelector("#booking-form"),
    serviceFieldset: document.querySelector("#service-fieldset"),
    serviceOptions: document.querySelector("#service-options"),
    serviceError: document.querySelector("#service-error"),
    name: document.querySelector("#customer-name"),
    nameError: document.querySelector("#name-error"),
    email: document.querySelector("#customer-email"),
    emailError: document.querySelector("#email-error"),
    submit: document.querySelector("#confirm"),
    status: document.querySelector("#status"),
    unavailable: document.querySelector("#unavailable"),
    confirmation: document.querySelector("#confirmation"),
    confirmationReference: document.querySelector("#confirmation-reference"),
    confirmationService: document.querySelector("#confirmation-service"),
    confirmationSchedule: document.querySelector("#confirmation-schedule"),
    confirmationName: document.querySelector("#confirmation-name"),
    confirmationStatus: document.querySelector("#confirmation-status"),
    revisitNote: document.querySelector("#revisit-note"),
    clear: document.querySelector("#clear-booking"),
  };

  let isSubmitting = false;

  const setStatus = (message, assertive = false) => {
    elements.status.textContent = message;
    elements.status.setAttribute("aria-live", assertive ? "assertive" : "polite");
  };

  const setFieldError = (input, output, message) => {
    output.textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const selectedService = () => {
    const selected = elements.form.querySelector('input[name="service"]:checked');
    if (!selected) {
      return null;
    }
    return catalog.find((service) => service.id === selected.value) || null;
  };

  const updateSubmit = () => {
    elements.submit.disabled = isSubmitting || !selectedService();
  };

  const validate = () => {
    const service = selectedService();
    const name = elements.name.value.trim();
    const email = elements.email.value.trim();
    const nameMessage = name.length >= 2 ? "" : "Enter your name using at least two characters.";
    const emailMessage = email && elements.email.validity.valid
      ? ""
      : "Enter a valid email address.";

    elements.serviceError.textContent = service ? "" : "Choose the seeded consultation.";
    elements.serviceFieldset.setAttribute("aria-invalid", service ? "false" : "true");
    setFieldError(elements.name, elements.nameError, nameMessage);
    setFieldError(elements.email, elements.emailError, emailMessage);

    const firstInvalid = !service
      ? elements.form.querySelector('input[name="service"]')
      : nameMessage
        ? elements.name
        : emailMessage
          ? elements.email
          : null;
    if (firstInvalid) {
      setStatus("Check the highlighted booking details.", true);
      firstInvalid.focus();
      return null;
    }

    setStatus("");
    return { service, name, email: email.toLowerCase() };
  };

  const showConfirmation = (record, isRevisit) => {
    elements.confirmationReference.textContent = record.reference;
    elements.confirmationService.textContent = `${record.serviceName} · ${record.duration}`;
    elements.confirmationSchedule.textContent = record.schedule;
    elements.confirmationName.textContent = record.customerName;
    elements.revisitNote.hidden = !isRevisit;
    elements.form.hidden = true;
    elements.unavailable.hidden = true;
    elements.confirmation.hidden = false;
    elements.confirmation.focus();
  };

  const setBusy = (busy) => {
    isSubmitting = busy;
    elements.form.setAttribute("aria-busy", busy ? "true" : "false");
    elements.submit.querySelector("span").textContent = busy ? "Saving proof…" : "Confirm booking";
    updateSubmit();
  };

  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

  const submitBooking = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const details = validate();
    if (!details) {
      return;
    }

    setBusy(true);
    setStatus("Saving your confirmation in this browser.");
    await nextFrame();

    try {
      const record = createBooking(details);
      const savedRecord = saveBooking(localStorage, record, catalog);
      setStatus("");
      showConfirmation(savedRecord, false);
    } catch (_error) {
      setStatus("We couldn’t save your proof in this browser. Your details are still here; please try again.", true);
      elements.status.focus();
    } finally {
      setBusy(false);
    }
  };

  const restoreBooking = () => {
    try {
      const result = readBooking(localStorage, catalog);
      if (result.state === "valid") {
        showConfirmation(result.record, true);
      } else if (result.state === "invalid") {
        setStatus("An unreadable saved booking was cleared. You can make a new one.", true);
      }
    } catch (_error) {
      setStatus("Browser storage is unavailable. You can enter details, but confirmation may not be saved.", true);
    }
  };

  const clearBooking = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      elements.form.reset();
      elements.confirmation.hidden = true;
      elements.form.hidden = false;
      elements.confirmationStatus.textContent = "";
      setStatus("");
      setFieldError(elements.name, elements.nameError, "");
      setFieldError(elements.email, elements.emailError, "");
      elements.serviceError.textContent = "";
      updateSubmit();
      elements.form.querySelector('input[name="service"]').focus();
    } catch (_error) {
      elements.confirmationStatus.textContent = "We couldn’t clear this browser record. Please try again.";
      elements.clear.focus();
    }
  };

  const showUnavailable = () => {
    elements.form.hidden = true;
    elements.confirmation.hidden = true;
    elements.unavailable.hidden = false;
    elements.unavailable.focus();
  };

  elements.form.addEventListener("submit", submitBooking);
  elements.form.addEventListener("change", updateSubmit);
  elements.name.addEventListener("blur", () => {
    const message = elements.name.value.trim().length >= 2
      ? ""
      : "Enter your name using at least two characters.";
    setFieldError(elements.name, elements.nameError, message);
  });
  elements.email.addEventListener("blur", () => {
    const message = elements.email.value.trim() && elements.email.validity.valid
      ? ""
      : "Enter a valid email address.";
    setFieldError(elements.email, elements.emailError, message);
  });
  elements.clear.addEventListener("click", clearBooking);

  if (catalog.length === 0) {
    showUnavailable();
  } else {
    restoreBooking();
    updateSubmit();
  }
})();
