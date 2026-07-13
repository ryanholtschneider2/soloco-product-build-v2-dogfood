# Dogfood agent instructions

- Use `bd` for task tracking.
- Work in a sibling git worktree off `main`; never edit the primary checkout.
- Run `make format lint test` before pushing.
- Open ready pull requests against `main`; never merge them directly.
- The product is a proof-first booking confirmation page. Preserve `PRODUCT.md`, `STRATEGY.md`, and `DESIGN.md`.
