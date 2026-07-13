from __future__ import annotations

import unittest
from pathlib import Path


class ProductFixtureTest(unittest.TestCase):
    def test_booking_surface_has_interaction_and_confirmation(self) -> None:
        html = (Path(__file__).parents[1] / "index.html").read_text(encoding="utf-8")
        self.assertIn('id="confirm"', html)
        self.assertIn("Booking confirmed.", html)
        self.assertIn("addEventListener", html)

    def test_runtime_has_exact_sha_identity_endpoint(self) -> None:
        source = (Path(__file__).parents[1] / "app.py").read_text(encoding="utf-8")
        self.assertIn("/.well-known/soloco-build.json", source)
        self.assertIn('os.environ.get("GIT_SHA"', source)


if __name__ == "__main__":
    unittest.main()
