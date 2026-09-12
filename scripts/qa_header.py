#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []

CANONICAL_NAV = [
    ("./ohaeng.html", "오행"),
    ("./fortune.html", "오늘의 운세"),
    ("./tomorrow.html", "내일의 운세"),
    ("./relationship.html", "인연"),
    ("./compatibility.html", "궁합"),
    ("./work-money.html", "일·재물"),
    ("./guide.html", "정월도감"),
    ("./talisman.html", "정월부적"),
    ("./lucky-number.html", "행운의 숫자"),
    ("./important-day.html", "중요한 날"),
    ("./moving-day.html", "이사 택일"),
    ("./archive.html", "정월록"),
    ("./reviews.html", "후기"),
    ("./about.html", "소개"),
]

app = (ROOT / "app.js").read_text(encoding="utf-8")
shell = (ROOT / "service-shell.js").read_text(encoding="utf-8")

# The ordinary app runtime and the lightweight stable-service runtime must expose
# exactly the same user-facing primary navigation set.
for href, label in CANONICAL_NAV:
    for filename, source in (("app.js", app), ("service-shell.js", shell)):
        if href not in source or label not in source:
            errors.append(f"{filename}: missing canonical nav item {label} ({href})")

# Stable fortune pages intentionally avoid app.js, but they still need the same
# shared header, auth affordances and mobile menu behavior as the rest of the site.
for page_name in ("fortune.html", "tomorrow.html", "fortune-result.html"):
    page = ROOT / page_name
    text = page.read_text(encoding="utf-8")
    if 'class="site-header' not in text:
        errors.append(f"{page_name}: missing site-header")
    if "service-shell.js" not in text:
        errors.append(f"{page_name}: missing service-shell.js")
    if re.search(r'<script[^>]+src=["\']\./app\.js', text, re.I):
        errors.append(f"{page_name}: stable page must not load app.js")

for token, description in (
    (".auth-login-link", "desktop login control"),
    (".auth-logout-button", "desktop logout control"),
    ("header-cta", "member CTA"),
    ("mobile-auth-item", "mobile auth controls"),
    ("signOut", "logout action"),
    ("aria-current", "active menu state"),
):
    if token not in shell:
        errors.append(f"service-shell.js: missing {description} ({token})")

# Every public service linked from the canonical navigation must exist.
for href, label in CANONICAL_NAV:
    target = ROOT / href.removeprefix("./")
    if not target.exists():
        errors.append(f"navigation target missing: {label} -> {href}")

print(f"Header QA checked {len(CANONICAL_NAV)} canonical navigation items and 3 stable fortune pages")
for item in errors:
    print(f"ERROR: {item}")
print(f"Header QA summary: {len(errors)} error(s)")
sys.exit(1 if errors else 0)
