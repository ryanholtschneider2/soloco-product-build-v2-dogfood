from __future__ import annotations

import json
import os
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from email.message import Message
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

from app import Handler
from build_site import BUILD_MARKER, build_identity, build_site, validate_git_sha

ROOT = Path(__file__).parents[1]
TEST_SHA = "0123456789abcdef0123456789abcdef01234567"


class BuildSiteTest(unittest.TestCase):
    def test_identity_requires_exact_sha(self) -> None:
        self.assertEqual(
            build_identity(TEST_SHA),
            {"product_id": "proofbook", "git_sha": TEST_SHA},
        )
        for invalid in ("unknown", "abc123", "g" * 40, "0" * 39, "0" * 41):
            with self.subTest(invalid=invalid), self.assertRaises(ValueError):
                validate_git_sha(invalid)

    def test_static_build_contains_product_and_identity(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "site"
            identity_path = build_site(output, TEST_SHA.upper())

            self.assertTrue((output / "index.html").is_file())
            self.assertTrue((output / "assets" / "proofbook.js").is_file())
            self.assertTrue((output / "assets" / "proofbook-core.mjs").is_file())
            self.assertTrue((output / "assets" / "styles.css").is_file())
            self.assertTrue((output / BUILD_MARKER).is_file())
            self.assertEqual(
                json.loads(identity_path.read_text(encoding="utf-8")),
                {"product_id": "proofbook", "git_sha": TEST_SHA},
            )

    def test_static_build_can_replace_its_own_prior_output(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "site"
            build_site(output, TEST_SHA)
            stale_file = output / "stale.txt"
            stale_file.write_text("stale", encoding="utf-8")

            build_site(output, TEST_SHA)

            self.assertFalse(stale_file.exists())
            self.assertTrue((output / BUILD_MARKER).is_file())

    def test_static_build_refuses_to_delete_unowned_output(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            output = Path(temporary_directory) / "site"
            output.mkdir()
            protected_file = output / "keep.txt"
            protected_file.write_text("keep", encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "not created by this builder"):
                build_site(output, TEST_SHA)

            self.assertEqual(protected_file.read_text(encoding="utf-8"), "keep")


class ProductFixtureTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = "http://127.0.0.1:{0}".format(cls.server.server_port)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def fetch(self, path: str) -> tuple[bytes, Message]:
        with urllib.request.urlopen(self.base_url + path, timeout=2) as response:
            return response.read(), response.headers

    def test_server_exposes_product_assets_and_security_headers(self) -> None:
        for path, content_type in (
            ("/", "text/html"),
            ("/assets/proofbook.js", "text/javascript"),
            ("/assets/proofbook-core.mjs", "text/javascript"),
            ("/assets/styles.css", "text/css"),
        ):
            with self.subTest(path=path):
                body, headers = self.fetch(path)
                self.assertTrue(body)
                self.assertIn(content_type, headers["Content-Type"])
                self.assertEqual(headers["X-Content-Type-Options"], "nosniff")
                self.assertEqual(headers["Referrer-Policy"], "no-referrer")

    def test_runtime_identity_matches_configured_exact_sha(self) -> None:
        with patch.dict(os.environ, {"GIT_SHA": TEST_SHA}):
            body, headers = self.fetch("/.well-known/soloco-build.json")

        self.assertIn("application/json", headers["Content-Type"])
        self.assertEqual(
            json.loads(body),
            {"product_id": "proofbook", "git_sha": TEST_SHA},
        )

    def test_unknown_route_is_404(self) -> None:
        try:
            self.fetch("/not-a-product-route")
        except urllib.error.HTTPError as error:
            self.assertEqual(error.code, 404)
            error.close()
        else:
            self.fail("unknown route did not return 404")

    def test_booking_surface_has_accessible_state_contract(self) -> None:
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        script = "\n".join(
            (ROOT / "assets" / name).read_text(encoding="utf-8")
            for name in ("proofbook.js", "proofbook-core.mjs")
        )

        for required_markup in (
            'id="booking-form"',
            'name="service"',
            'id="customer-name"',
            'id="customer-email"',
            'id="status"',
            'id="confirmation"',
            'id="unavailable"',
        ):
            with self.subTest(markup=required_markup):
                self.assertIn(required_markup, html)

        for required_behavior in (
            "cryptoSource.getRandomValues",
            "storage.setItem",
            "storage.getItem",
            "localStorage.removeItem",
            "aria-busy",
            "requestAnimationFrame",
            "textContent",
        ):
            with self.subTest(behavior=required_behavior):
                self.assertIn(required_behavior, script)


if __name__ == "__main__":
    unittest.main()
