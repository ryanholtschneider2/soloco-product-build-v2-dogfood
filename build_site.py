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
BUILD_MARKER = ".soloco-static-build"


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
    if output.is_symlink():
        raise ValueError("build output must not be a symbolic link")
    output = output.resolve()
    root = ROOT.resolve()
    if output == root or output == Path(output.anchor) or output in root.parents:
        raise ValueError("build output must not be the project root or one of its ancestors")
    if output.exists():
        marker = output / BUILD_MARKER
        if not output.is_dir() or not marker.is_file():
            raise ValueError("refusing to replace an output directory not created by this builder")
        shutil.rmtree(output)
    output.mkdir(parents=True)
    (output / BUILD_MARKER).write_text("ProofBook static build\n", encoding="utf-8")
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
