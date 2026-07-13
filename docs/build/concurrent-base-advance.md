# Canonical base advance

This checkpoint deliberately advances the canonical integration branch after
the Stage 2 child worktree was cut. Product Build supervision must reject the
child's original base as stale and require reconciliation before integration.
