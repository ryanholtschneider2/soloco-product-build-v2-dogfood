# ProofBook Stage 2 outcome design

## Decision

Build the smallest honest outcome that fits the approved fixture and its live
GitHub Pages lifecycle: a customer explicitly selects the one seeded service,
enters minimal details, and receives a random confirmation reference persisted
in the same browser. Generate the deployed build-identity JSON from the exact
workflow commit. Keep the current Python-standard-library and static web stack.

This approach is preferred over a remote booking API because R1 is an isolated
Product Build v2 proof, not a scheduling business, and no backend host,
credentials, inventory system, or fulfillment lane is approved. A purely
ephemeral hard-coded confirmation was also rejected because it would not meet
the durable-reference promise.

## Experience and data flow

The root surface has one editorial hierarchy: proposition, seeded service
selection, customer details, and one primary action. Submission validates the
form, enters an accessible busy state, creates a Web Crypto reference, stores a
versioned record in `localStorage`, reads it back, and only then renders the
confirmation proof moment. Reload restores a valid record. Corrupt data is
discarded safely. Storage failure preserves input and shows a retryable error
without claiming success.

The build workflow writes `/.well-known/soloco-build.json` with `product_id` and
the full commit SHA, deploys it beside the product, and verifies the live value.
No customer data is transmitted or loaded from third parties.

## Error and edge behavior

The contract includes initial, invalid, submitting, storage-error, unavailable,
confirmed, and revisit states. Duplicate activation is mechanically prevented.
The unavailable state is driven by an empty seeded catalog so it can be tested
without inventing a network dependency. A customer can explicitly clear the
fixture record and begin again.

## Verification design

Implementation must pass the repo gate and real browser checks. Exact-SHA proof
then covers the full journey, reload, malformed storage, storage failure,
keyboard/focus/announcements, 390x844 and 1440x900 rendering, security/privacy,
performance, and post-deploy smoke. The evidence index is invalid whenever its
SHA differs from the canonical integration SHA.

The item-level contract and evidence obligations live in
`docs/build/product-contract.md` and `docs/build/readiness-matrix.json`.
