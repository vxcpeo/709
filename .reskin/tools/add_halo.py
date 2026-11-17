#!/usr/bin/env python3
"""Insert the orbital halo + scene wrapper into route views, safely.

Uses the last root-level `</div>` before `</template>` as the insertion point so
nested `<template v-else>` blocks are untouched.
"""
from __future__ import annotations

from pathlib import Path

VIEWS = Path(r"E:\workspace\chuangye\ROBIN\709\website\src\views")

HALO = """    <div class="orb-halo" aria-hidden="true">
      <svg viewBox="0 0 640 640" fill="none" focusable="false">
        <circle cx="320" cy="320" r="308" stroke="currentColor" stroke-dasharray="2 10" />
        <circle cx="320" cy="320" r="232" stroke="currentColor" stroke-dasharray="96 44" />
        <circle cx="320" cy="320" r="152" stroke="currentColor" />
        <circle cx="470" cy="168" r="7" fill="currentColor" stroke="none" />
        <circle cx="176" cy="438" r="5" fill="currentColor" stroke="none" />
      </svg>
    </div>"""


def patch(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    if "orb-halo" in text:
        return f"{path.name}: already has halo"
    roots = ['<div class="orb-frame orb-view">', '<div class="orb-frame">']
    opening = next((m for m in roots if m in text), None)
    if opening is None:
        return f"{path.name}: no root"
    insert = opening + "\n" + HALO + '\n    <div class="orb-scene">'
    text = text.replace(opening, insert, 1)
    close_tpl = text.rfind("</template>")
    root_close = text.rfind("</div>", 0, close_tpl)
    if root_close < 0:
        return f"{path.name}: no closing div"
    indent = "    "
    text = text[:root_close] + "</div>\n" + indent + text[root_close:]
    path.write_text(text, encoding="utf-8")
    return f"{path.name}: patched"


def main() -> int:
    for name in ["Home.vue", "Locks.vue", "Create.vue", "Docs.vue", "Legal.vue"]:
        print(patch(VIEWS / name))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
