# Development

ProofBook keeps its runtime deliberately small: Python's standard library serves
plain HTML, CSS, and JavaScript. No install or package synchronization is
required.

## Local server

From the repository root:

```bash
GIT_SHA="$(git rev-parse HEAD)" python3 app.py
```

Open `http://127.0.0.1:43181/`. The same SHA is available from:

```bash
curl http://127.0.0.1:43181/.well-known/soloco-build.json
```

If `GIT_SHA` is omitted, the server resolves the current repository `HEAD`.
An explicitly supplied value must be exactly 40 hexadecimal characters.

## Static Pages artifact

GitHub Actions builds the deployable directory with the workflow commit:

```bash
python3 build_site.py --git-sha "$(git rev-parse HEAD)" --output _site
```

This copies the product assets and writes
`_site/.well-known/soloco-build.json`. The builder removes an existing output
directory first so stale files cannot be included accidentally.

## Browser-state checks

The booking is stored under `proofbook.booking.v1` in `localStorage`. For manual
edge-state verification, browser developer tools can:

- delete the key to start from the initial state;
- replace it with malformed JSON and reload to verify safe recovery;
- block or override browser storage to verify that no false confirmation is
  shown; and
- define `window.PROOFBOOK_CATALOG = []` before the application script runs to
  exercise the unavailable state.

Always run `make format lint test` before pushing. Visual review targets are
390x844 and 1440x900.
