from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from build_site import build_identity, resolve_git_sha

ROOT = Path(__file__).parent
STATIC_ROUTES = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/assets/proofbook.js": ("assets/proofbook.js", "text/javascript; charset=utf-8"),
    "/assets/proofbook-core.mjs": ("assets/proofbook-core.mjs", "text/javascript; charset=utf-8"),
    "/assets/styles.css": ("assets/styles.css", "text/css; charset=utf-8"),
}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        path = self.path.partition("?")[0]
        if path == "/.well-known/soloco-build.json":
            self._send_json(build_identity(resolve_git_sha()))
            return

        route = STATIC_ROUTES.get(path)
        if route is None:
            self.send_error(404)
            return

        relative_path, content_type = route
        self._send_bytes((ROOT / relative_path).read_bytes(), content_type)

    def _send_json(self, value: dict[str, str]) -> None:
        payload = json.dumps(value, separators=(",", ":")).encode()
        self._send_bytes(payload, "application/json; charset=utf-8")

    def _send_bytes(self, payload: bytes, content_type: str) -> None:
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        self.wfile.write(payload)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", int(os.environ.get("PORT", "43181"))), Handler)
    server.serve_forever()
