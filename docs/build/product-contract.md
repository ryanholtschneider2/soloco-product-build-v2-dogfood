# ProofBook Stage 2 product contract

Status: defined  
Contract version: 1  
Base commit: `db177b063bf36e1137f0c79de0dc211dee14ddce`  
Parent epic: `pbv2-uuv`

## Product boundary

ProofBook proves one small, honest customer outcome: a visitor explicitly
selects the seeded consultation, supplies the minimum booking details, confirms
it, and receives a reference that survives a reload in the same browser. The
deployed surface must identify its exact source commit. The experience remains
the warm editorial utility specified by `DESIGN.md`.

This contract resolves “durable” as durable in the customer's current browser,
not as a remote reservation system. That boundary preserves the approved static
HTML/CSS/JavaScript plus Python-standard-library fixture and the GitHub Pages
lifecycle already present at the base commit. The confirmation must never imply
payment, inventory locking, calendar synchronization, or operator fulfillment.

## Stakeholders and jobs

| Stakeholder | Job to be done | Success signal |
| --- | --- | --- |
| Customer | Confirm the seeded consultation without an account or setup ceremony. | A clear confirmation and durable `PB-` reference appear after one short form. |
| CEO / Head of Product | Know that one integrated commit produces the promised outcome. | Canonical SHA, live preview, evidence, and exceptions agree. |
| Product reviewer | Judge the real rendered experience against product and design truth. | Functional, visual, accessibility, security, performance, and product-eval evidence is indexed. |
| Release verifier | Correlate the live product with source and rerun the critical journey. | Runtime identity equals the deployed commit and post-deploy smoke passes. |

## Roles and permissions

- **Customer:** anonymous; may create and revisit only the booking record stored
  in that browser. No account, payment, privileged view, or remote lookup exists.
- **Verifier:** has no product privilege. It reads the public build identity and
  drives the same customer surface with seeded data.
- **Operator:** no Stage 2 UI. Operational review happens through evidence and
  deployment logs, not through a hidden admin route.

## Critical journey

1. The customer opens `/` and sees the ProofBook proposition and seeded service
   selector before any form submission.
2. They explicitly select “Seeded consultation — tomorrow at 10:00 AM — 30
   minutes,” enter a name and valid email address, and activate the primary
   action.
3. Invalid or incomplete fields receive inline, programmatically associated
   guidance; focus moves to the first invalid field.
4. During persistence, the action is disabled and exposes an accessible busy
   state. The application generates a cryptographically random `PB-` reference,
   writes the normalized record to `localStorage`, and reads it back before
   declaring success.
5. The confirmation becomes the dominant proof moment, announces itself, takes
   focus, and includes the service, schedule, customer name, and reference.
6. Reloading `/` in the same browser restores the confirmation. The customer can
   clear it and start a new fixture booking through an explicit secondary action.
7. A verifier requests `/.well-known/soloco-build.json`; `product_id` is
   `proofbook` and `git_sha` equals the deployed canonical SHA.

## Route and state inventory

### `/`

| State | Observable behavior |
| --- | --- |
| Initial / empty selection | No service is selected; concise guidance and disabled submit prevent accidental confirmation. |
| Ready | Seeded service and valid customer details enable the one primary action. |
| Invalid | Inline errors are associated with controls and summarized through focus; entered values remain. |
| Submitting | Duplicate activation is prevented and busy status is announced. |
| Storage error | No confirmation is claimed; a plain-language retry path preserves entered values. |
| Unavailable | If the seeded service catalog is empty, the form is replaced by a calm unavailable state with no dead action. |
| Confirmed | Reference and booking details are visually dominant and keyboard reachable. |
| Revisit | A valid stored record restores the confirmed state; corrupt or incompatible data is discarded safely. |

### `/.well-known/soloco-build.json`

Returns JSON with schema `{ "product_id": "proofbook", "git_sha": "<40 hex>" }`.
The deployed artifact is generated from the workflow commit. A missing,
placeholder, malformed, or mismatched SHA fails build or smoke proof.

### Unknown routes

The Python fixture returns 404. Static hosting behavior is recorded in smoke
evidence and must not masquerade as a valid product route.

## Data and operations

The browser record contains a schema version, reference, service ID and display
fields, customer name, normalized email, and UTC creation timestamp. It is
written under a product-versioned key. Reference generation uses Web Crypto;
rendering uses safe DOM text APIs. The app sends no customer data over the
network and loads no analytics or third-party scripts.

There is no remote source of truth, inventory contention, fulfillment queue, or
support console. Clearing site data clears the fixture booking. This limitation
must be visible in reviewer/launch materials; it is not presented as a
production scheduling service.

## Integrations and fulfillment/GTM touchpoints

- GitHub Actions runs repository gates, builds the static identity artifact,
  deploys GitHub Pages, and executes post-deploy smoke.
- GitHub Pages is the preview/release surface for this dogfood outcome.
- GTM may claim only a proof-first booking confirmation demo tied to an exact
  source SHA. It may not claim payments, calendar sync, multi-device retrieval,
  inventory reservation, email delivery, or production booking operations.
- The CEO digest is the handoff surface for exact SHA, preview, evidence,
  exceptions, and the final launch decision.

## Nonfunctional requirements

- **Accessibility:** WCAG 2.2 AA target; complete keyboard path; visible focus;
  associated labels/errors; announced busy/error/confirmation status; contrast
  checked; no critical automated accessibility violations.
- **Responsive visual quality:** no clipping or horizontal overflow at 390x844
  and desktop 1440x900; confirmation remains the visual proof moment; rendered
  output follows `DESIGN.md` tokens and prohibitions.
- **Security/privacy:** no external PII transmission; safe text rendering;
  restrictive document CSP where GitHub Pages permits; no mixed content or
  third-party runtime dependency; malformed storage cannot execute markup or
  break the journey.
- **Performance:** no external runtime assets; transferred product payload under
  100 KiB; Lighthouse performance at least 90; LCP at most 2.5 s and CLS at most
  0.1 on the declared mobile proof run.
- **Reliability:** repeated activation creates at most one record per submission;
  storage failure cannot display a false confirmation; refresh restores a valid
  record; smoke retries only transport startup, not assertion failures.
- **Traceability:** every evidence artifact identifies the full 40-character
  canonical SHA; stale evidence is invalid.

## Explicit exclusions

Accounts/authentication, payments, remote databases, inventory locking,
calendars, cancellation/rescheduling, notifications, multi-device retrieval,
operator/admin UI, analytics, localization, and production support workflows
are excluded from R1. Adding any of them requires an approved scope decision.

## Acceptance evidence

Launch readiness requires current exact-SHA evidence for:

1. Repository gate: `make format lint test` and CI.
2. Functional browser paths: initial, invalid, confirm, duplicate prevention,
   storage error, unavailable, revisit, clear-and-rebook, and identity response.
3. Screenshots at 390x844 and 1440x900 for ready and confirmed states.
4. Automated accessibility plus manual keyboard/focus/announcement notes.
5. Security/privacy inspection and malformed-storage test.
6. Performance report against the declared budget.
7. Post-deploy root, confirmation, and exact-SHA identity smoke.
8. Product evaluation: a reviewer can identify the offered service, primary
   action, and durable proof without explanation; no excluded capability is
   implied.

The stable item-level mapping is `docs/build/readiness-matrix.json`.
