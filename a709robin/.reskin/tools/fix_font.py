#!/usr/bin/env python3
"""Use the self-hosted Manrope face for body copy (legal copy claims it)."""
from __future__ import annotations

from pathlib import Path

CSS = Path(r"E:\workspace\chuangye\ROBIN\709\website\src\styles\orbit.css")

FACE = """@font-face {
  font-family: "Manrope";
  src: url("/fonts/Manrope-Variable.ttf") format("truetype");
  font-weight: 200 800;
  font-display: swap;
}

"""

OLD_BODY = '--orb-body: "Segoe UI", "Helvetica Neue", Arial, sans-serif;'
NEW_BODY = '--orb-body: "Manrope", "Segoe UI", "Helvetica Neue", Arial, sans-serif;'


def main() -> int:
    text = CSS.read_text(encoding="utf-8")
    if "@font-face" not in text:
        text = FACE + text
    if OLD_BODY not in text:
        print("body token already replaced")
    else:
        text = text.replace(OLD_BODY, NEW_BODY)
        print("body token updated")
    CSS.write_text(text, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
