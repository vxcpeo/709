#!/usr/bin/env python3
"""Repair the scene wrapper closing tag for views patched by add_scene.py."""
from __future__ import annotations

import re
from pathlib import Path

VIEWS = Path(r"E:\workspace\chuangye\ROBIN\709\website\src\views")


def balance(text: str) -> int:
    template = text[text.index("<template>") :]
    opens = len(re.findall(r"<div\b", template))
    closes = len(re.findall(r"</div\s*>", template))
    return opens - closes


def main() -> int:
    for name in ["Home.vue", "Locks.vue", "Create.vue", "LockDetail.vue", "Docs.vue", "Legal.vue"]:
        path = VIEWS / name
        text = path.read_text(encoding="utf-8")
        before = balance(text)
        if before == 0:
            print(f"{name}: balanced")
            continue
        if before < 0:
            print(f"{name}: unexpected extra close ({before})")
            continue
        for _ in range(before):
            # Insert the closing tag of the scene wrapper before the last root close.
            matches = list(re.finditer(r"\n(\s*)</div>(\s*)</template>", text))
            if not matches:
                print(f"{name}: closing pattern not found")
                break
            m = matches[-1]
            indent = m.group(1)
            text = text[: m.start()] + f"\n{indent}</div>" + text[m.start() :]
        path.write_text(text, encoding="utf-8")
        print(f"{name}: inserted {before}, balance now {balance(text)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
