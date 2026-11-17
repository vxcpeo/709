#!/usr/bin/env python3
"""Small presentation fixes after the first verification pass."""
from __future__ import annotations

import re
from pathlib import Path

SRC = Path(r"E:\workspace\chuangye\ROBIN\709\website\src")


def fix_css() -> None:
    css = SRC / "styles/orbit.css"
    text = css.read_text(encoding="utf-8")
    text = text.replace(
        ".orb-sr {\n  position: absolute;",
        ".visually-hidden,\n.orb-sr {\n  position: absolute;",
    )
    text = text.replace(
        "  .orb-nav__note {\n    flex-direction: column;\n    align-items: flex-start;\n    gap: 10px;\n  }",
        "  .orb-nav__note {\n    display: flex;\n    flex-direction: column;\n    align-items: flex-start;\n    gap: 10px;\n  }\n\n  .orb-nav__extras {\n    flex-direction: column;\n    align-items: flex-start;\n  }",
    )
    css.write_text(text, encoding="utf-8")
    print("css:", ".visually-hidden" in text, "drawer-note:", "display: flex;\n    flex-direction: column;" in text)


def fix_locks() -> None:
    path = SRC / "views/Locks.vue"
    text = path.read_text(encoding="utf-8")
    count = text.count('class="orb-sr"')
    path.write_text(text.replace('class="orb-sr"', 'class="visually-hidden"'), encoding="utf-8")
    print("locks sr-only replaced:", count)


def fix_create() -> None:
    path = SRC / "views/Create.vue"
    text = path.read_text(encoding="utf-8")
    cliff_old = (
        '              <button\n'
        '                type="button"\n'
        '                class="orb-btn orb-btn--rim"\n'
        '                @click="applyCliffDelay"\n'
        '              >'
    )
    cliff_new = cliff_old.replace(
        '                class="orb-btn orb-btn--rim"',
        '                class="orb-btn orb-btn--rim"\n                aria-label="Set cliff"',
    )
    if cliff_old in text:
        text = text.replace(cliff_old, cliff_new)
        print("cliff label added")
    else:
        print("cliff pattern missing")
    # The end button shares the same shape with a different handler.
    end_pattern = re.compile(
        r'(<button\n\s+type="button"\n\s+class="orb-btn orb-btn--rim"\n)(\s+)(@click="applyEndDelay")'
    )
    text, n = end_pattern.subn(r'\1                aria-label="Set end"\n\2\3', text)
    print("end label added:", n)
    path.write_text(text, encoding="utf-8")


def fix_brand_palette() -> None:
    path = SRC / "config/brand.js"
    text = path.read_text(encoding="utf-8")
    new_palette = """  palette: {
    ink: "#03040a",
    accent: "#40b3ff",
    accentStrong: "#a78bfa",
    muted: "#a3a1b6",
    line: "#262536",
    canvas: "#000000",
    surface: "#12121e",
    soft: "#191927",
    signal: "#f2c94c",
  },"""
    text = re.sub(r"  palette: \{[^}]*\},", new_palette, text, count=1)
    path.write_text(text, encoding="utf-8")
    print("brand palette updated")


if __name__ == "__main__":
    fix_css()
    fix_locks()
    fix_create()
    fix_brand_palette()
