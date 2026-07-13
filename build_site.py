from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
from pathlib import Path

PRODUCT_ID = "proofbook"
SHA_LENGTH = 40
ROOT = Path(__file__).parent


def validate_git_sha(value: str) -> str:
    normalized = value.strip().lower()
    if len(normalized) != SHA_LENGTH or any(character not in "0123456789abcdef" for character in normalized):
        raise ValueError("git SHA must be exactly 40 hexadecimal characters")
    return normalized


def resolve_git_sha() -> str:
    configured = os.environ.get("GIT_SHA")
    if configured is not None:
        return validate_git_sha(configured)

    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return validate_git_sha(result.stdout)


def build_identity(git_sha: str) -> dict[str, str]:
    return {"product_id": PRODUCT_ID, "git_sha": validate_git_sha(git_sha)}


def build_site(output: Path, git_sha: str) -> Path:
    if output.exists():
        shutil.rmtree(output)
    output.mkdir(parents=True)
    shutil.copy2(ROOT / "index.html", output / "index.html")
    shutil.copytree(ROOT / "assets", output / "assets")

    identity_path = output / ".well-known" / "soloco-build.json"
    identity_path.parent.mkdir()
    identity_path.write_text(
        json.dumps(build_identity(git_sha), indent=2) + "\n",
        encoding="utf-8",
    )
    return identity_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the ProofBook static site")
    parser.add_argument("--git-sha", default=None, help="exact 40-character source commit")
    parser.add_argument("--output", type=Path, default=ROOT / "_site")
    args = parser.parse_args()
    identity_path = build_site(args.output, args.git_sha or resolve_git_sha())
    print(identity_path)


if __name__ == "__main__":
    main()
