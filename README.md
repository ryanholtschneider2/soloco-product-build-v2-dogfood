# ProofBook

ProofBook is the smallest honest customer outcome used to dogfood SoloCo
Product Build v2. A visitor selects the seeded consultation, adds a name and
email address, and receives a random confirmation reference that survives a
reload in the same browser.

The fixture intentionally has no account, payment, remote inventory, calendar,
notification, or operator surface. The browser record is the proof; clearing
site data clears it.

## Run and verify

See [DEVELOPMENT.md](DEVELOPMENT.md) for local commands. The repository gate is:

```bash
make format lint test
```

The deployed build exposes `/.well-known/soloco-build.json` with the product ID
and exact 40-character source commit used to produce the Pages artifact.
