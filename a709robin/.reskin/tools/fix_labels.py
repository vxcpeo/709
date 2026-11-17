#!/usr/bin/env python3
"""Add accessible names to the two duration buttons inside a closed <details>."""
from __future__ import annotations

import re
from pathlib import Path

PATH = Path(r"E:\workspace\chuangye\ROBIN\709\website\src\views\Create.vue")
PATTERN = re.compile(
    r'(><button\n\s*type="button"\n\s*class="orb-btn orb-btn--rim"\n)(\s*)(@click="apply(?:Cliff|End)Delay")'
)


def main() -> int:
    text = PATH.read_text(encoding="utf-8")

    def repl(match: re.Match[str]) -> str:
        label = "Set cliff" if "Cliff" in match.group(3) else "Set end"
        indent = match.group(2)
        return f'{match.group(1)}{indent}aria-label="{label}"\n{indent}{match.group(3)}'

    updated, count = PATTERN.subn(repl, text)
    PATH.write_text(updated, encoding="utf-8")
    print("patched:", count)
    for line in updated.splitlines():
        if "aria-label=\"Set " in line:
            print(line.strip())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
