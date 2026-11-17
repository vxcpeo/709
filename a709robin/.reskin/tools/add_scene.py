#!/usr/bin/env python3
"""Add the orbital scene wrapper and a decorative halo to every route view.

The wrapper changes DOM depth; the halo adds the constellation rings that
define the selected art direction. Both are presentation-only: no text, no
bindings, no handlers.
"""
from __future__ import annotations

from pathlib import Path

VIEWS = Path(r"E:\workspace\chuangye\ROBIN\709\website\src\views")
CSS = Path(r"E:\workspace\chuangye\ROBIN\709\website\src\styles\orbit.css")

HALO = """    <div class="orb-halo" aria-hidden="true">
      <svg viewBox="0 0 640 640" fill="none" focusable="false">
        <circle cx="320" cy="320" r="308" stroke="currentColor" stroke-dasharray="2 10" />
        <circle cx="320" cy="320" r="232" stroke="currentColor" stroke-dasharray="96 44" />
        <circle cx="320" cy="320" r="152" stroke="currentColor" />
        <circle cx="470" cy="168" r="7" fill="currentColor" stroke="none" />
        <circle cx="176" cy="438" r="5" fill="currentColor" stroke="none" />
      </svg>
    </div>
    <div class="orb-scene">"""

CSS_ADDITION = """
.orb-view,
.orb-frame {
  overflow: clip;
}

.orb-scene {
  position: relative;
}

.orb-halo {
  position: absolute;
  top: -34px;
  right: -6%;
  width: min(520px, 62vw);
  color: rgba(64, 179, 255, 0.17);
  pointer-events: none;
  z-index: 0;
}

.orb-halo svg {
  display: block;
  width: 100%;
  height: auto;
}

.orb-scene > * {
  position: relative;
  z-index: 1;
}
"""


def patch_view(path: Path) -> str:
    text = path.read_text(encoding="utf-8")
    markers = ['<div class="orb-frame orb-view">', '<div class="orb-frame">']
    opening = next((m for m in markers if m in text), None)
    if opening is None:
        return f"{path.name}: NO ROOT"
    if "orb-scene" in text:
        return f"{path.name}: already patched"
    text = text.replace(opening, opening + "\n" + HALO, 1)
    tail_marker = "      </div>\n    </template>"
    if tail_marker not in text:
        return f"{path.name}: TAIL NOT FOUND"
    text = text.replace(tail_marker, "      </div>\n    </div>\n    </template>", 1)
    path.write_text(text, encoding="utf-8")
    return f"{path.name}: patched"


def main() -> int:
    for name in ["Home.vue", "Locks.vue", "Create.vue", "LockDetail.vue", "Docs.vue", "Legal.vue"]:
        print(patch_view(VIEWS / name))
    css = CSS.read_text(encoding="utf-8")
    if ".orb-halo" not in css:
        css += CSS_ADDITION
        CSS.write_text(css, encoding="utf-8")
        print("css: halo added")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
