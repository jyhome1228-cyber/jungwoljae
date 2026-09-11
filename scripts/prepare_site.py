#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
APP_VERSION = "20260911-1428"
pattern = re.compile(r'(<script\b[^>]*\bsrc=["\'])\./app\.js(?:\?v=[^"\']+)?(["\'][^>]*></script>)', re.I)

changed = []
for page in sorted(ROOT.glob("*.html")):
    text = page.read_text(encoding="utf-8")
    updated, count = pattern.subn(rf'\1./app.js?v={APP_VERSION}\2', text)
    if count and updated != text:
        page.write_text(updated, encoding="utf-8")
        changed.append(page.name)

print(f"Normalized app.js cache key on {len(changed)} page(s).")
if changed:
    print("Pages: " + ", ".join(changed))
