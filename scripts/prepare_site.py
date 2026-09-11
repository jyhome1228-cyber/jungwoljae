#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
APP_VERSION = "20260911-1428"
STYLE_VERSION = "20260911-1435"
app_pattern = re.compile(r'(<script\b[^>]*\bsrc=["\'])\./app\.js(?:\?v=[^"\']+)?(["\'][^>]*></script>)', re.I)
page_css_pattern = re.compile(r'(<link\b[^>]*\bhref=["\'])\./page\.css(?:\?v=[^"\']+)?(["\'][^>]*>)', re.I)

changed = []
for page in sorted(ROOT.glob("*.html")):
    text = page.read_text(encoding="utf-8")
    updated = app_pattern.sub(rf'\1./app.js?v={APP_VERSION}\2', text)
    updated = page_css_pattern.sub(rf'\1./page.css?v={STYLE_VERSION}\2', updated)
    if updated != text:
        page.write_text(updated, encoding="utf-8")
        changed.append(page.name)

page_css = ROOT / "page.css"
if page_css.exists():
    text = page_css.read_text(encoding="utf-8")
    updated = re.sub(r'@import\s+url\(["\']\.\/typography\.css(?:\?v=[^"\']+)?["\']\);', f'@import url("./typography.css?v={STYLE_VERSION}");', text, count=1)
    if updated != text:
        page_css.write_text(updated, encoding="utf-8")
        print(f"Normalized typography cache key in page.css to {STYLE_VERSION}.")

print(f"Normalized deploy asset keys on {len(changed)} page(s).")
if changed:
    print("Pages: " + ", ".join(changed))
