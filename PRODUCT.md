# Product

ProofBook is a tiny but real proof-first booking product used to dogfood SoloCo Product Build v2. A customer chooses the seeded service, confirms the booking, and receives a durable confirmation reference without setup ceremony.

The critical journey is `/`: select the seeded service, confirm, and see the confirmation reference. The runtime identity endpoint is `/.well-known/soloco-build.json` and must report this product plus the exact deployed git SHA.
