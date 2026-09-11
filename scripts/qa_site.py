#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "node_modules"}
errors: list[str] = []
warnings: list[str] = []


def rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def is_external(value: str) -> bool:
    v = value.strip().lower()
    return (
        not v
        or v.startswith(("http://", "https://", "//", "mailto:", "tel:", "data:", "javascript:"))
        or "{" in v
        or "}" in v
    )


def local_target(base: Path, value: str) -> Path | None:
    if is_external(value) or value.startswith("#"):
        return None
    path = urlsplit(value).path
    if not path:
        return None
    target = ROOT / path.lstrip("/") if path.startswith("/") else base.parent / path
    if path.endswith("/"):
        target = target / "index.html"
    return target.resolve()


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.refs: list[tuple[str, str, dict[str, str]]] = []
        self.title_parts: list[str] = []
        self.in_title = False
        self.has_viewport = False
        self.images: list[dict[str, str]] = []
        self.blank_links: list[dict[str, str]] = []
        self.anchors: list[str] = []
        self.jsonld: list[str] = []
        self.buttons: list[tuple[dict[str, str], bool]] = []
        self.forms: list[dict[str, str]] = []
        self.scripts: list[dict[str, str]] = []
        self._form_depth = 0
        self._jsonld = False
        self._jsonld_buf: list[str] = []

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = {k: (v or "") for k, v in attrs_list}
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag == "title":
            self.in_title = True
        if tag == "meta" and attrs.get("name", "").lower() == "viewport":
            self.has_viewport = True
        if tag == "img":
            self.images.append(attrs)
        if tag == "a":
            href = attrs.get("href", "")
            if href.startswith("#") and len(href) > 1:
                self.anchors.append(href[1:])
            if attrs.get("target") == "_blank":
                self.blank_links.append(attrs)
        if tag == "script":
            self.scripts.append(attrs)
            if attrs.get("type") == "application/ld+json":
                self._jsonld = True
                self._jsonld_buf = []
        if tag == "form":
            self.forms.append(attrs)
            self._form_depth += 1
        if tag == "button":
            self.buttons.append((attrs, self._form_depth > 0))
        for attr in ("href", "src"):
            if attrs.get(attr):
                self.refs.append((tag, attrs[attr], attrs))

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
        if tag == "form" and self._form_depth:
            self._form_depth -= 1
        if tag == "script" and self._jsonld:
            self._jsonld = False
            value = "".join(self._jsonld_buf).strip()
            if value:
                self.jsonld.append(value)
            self._jsonld_buf = []

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if self._jsonld:
            self._jsonld_buf.append(data)


prepare_site = ROOT / "scripts" / "prepare_site.py"
expected_app_version = None
if prepare_site.exists():
    match = re.search(r'^APP_VERSION\s*=\s*["\']([^"\']+)', prepare_site.read_text(encoding="utf-8"), re.M)
    if match:
        expected_app_version = match.group(1)

js_files = sorted(
    p for p in ROOT.rglob("*.js")
    if not any(part in SKIP_DIRS for part in p.parts)
)
js_by_name = {p.name: p.read_text(encoding="utf-8") for p in js_files}
app_dynamic_scripts = [
    "auth.js", "qa-hardening.js", "basic-profile.js", "quick-profile.js",
    "birth-input-unified.js", "birth-time-unified.js", "gender-unified.js"
]

html_files = sorted(
    p for p in ROOT.rglob("*.html")
    if not any(part in SKIP_DIRS for part in p.parts)
)

for page in html_files:
    text = page.read_text(encoding="utf-8")
    parser = PageParser()
    try:
        parser.feed(text)
    except Exception as exc:
        errors.append(f"{rel(page)}: HTML parse error: {exc}")
        continue

    if not "".join(parser.title_parts).strip():
        errors.append(f"{rel(page)}: missing <title>")
    if not parser.has_viewport:
        errors.append(f"{rel(page)}: missing viewport meta")

    for value, count in Counter(parser.ids).items():
        if count > 1:
            errors.append(f"{rel(page)}: duplicate id #{value}")

    id_set = set(parser.ids)
    for anchor in parser.anchors:
        if anchor not in id_set:
            warnings.append(f"{rel(page)}: in-page link #{anchor} has no matching id")

    for attrs in parser.images:
        if "alt" not in attrs:
            warnings.append(f"{rel(page)}: image missing alt attribute ({attrs.get('src','')})")

    for attrs in parser.blank_links:
        rel_tokens = set(attrs.get("rel", "").split())
        if not {"noopener", "noreferrer"} & rel_tokens:
            warnings.append(f"{rel(page)}: target=_blank link should include rel=noopener")

    for raw in parser.jsonld:
        try:
            json.loads(raw)
        except Exception as exc:
            errors.append(f"{rel(page)}: invalid JSON-LD: {exc}")

    for tag, value, attrs in parser.refs:
        target = local_target(page, value)
        if target is None:
            continue
        if tag == "a" and urlsplit(value).path == "":
            continue
        if not target.exists():
            errors.append(f"{rel(page)}: missing local {tag} target {value}")

    app_matches = list(re.finditer(r'<script[^>]+src=["\']\./app\.js(?:\?v=([^"\']+))?', text, re.I))
    if app_matches and "./page.css" not in text:
        errors.append(f"{rel(page)}: app.js page must load page.css")
    if expected_app_version:
        for match in app_matches:
            version = match.group(1) or "unversioned"
            if version != expected_app_version:
                warnings.append(f"{rel(page)}: app.js cache key is {version}; expected {expected_app_version}")

    script_names: list[str] = []
    for script in parser.scripts:
        src = script.get("src", "")
        if src.startswith("./"):
            script_names.append(urlsplit(src).path.split("/")[-1])

    action_text = "\n".join(
        js_by_name.get(name, "")
        for name in script_names
        if name not in {"consent-guard.js", "site-copy-cleanup-v1.js"}
    )
    if "app.js" in script_names:
        action_text += "\n" + "\n".join(js_by_name.get(name, "") for name in app_dynamic_scripts)
    for match in re.finditer(r'<script(?![^>]*\bsrc=)(?![^>]*application/ld\+json)[^>]*>(.*?)</script>', text, re.I | re.S):
        action_text += "\n" + match.group(1)

    for attrs, inside_form in parser.buttons:
        button_type = (attrs.get("type") or "submit").lower()
        if button_type == "submit":
            if not inside_form:
                errors.append(f"{rel(page)}: submit button is outside a form")
            if not re.search(r"addEventListener\(\s*['\"]submit['\"]", action_text) and "onsubmit" not in action_text:
                errors.append(f"{rel(page)}: submit button has no page action handler")
        elif button_type == "button" and not attrs.get("onclick"):
            hooks = [key for key in attrs if key.startswith("data-")]
            if attrs.get("id"):
                hooks.append("#" + attrs["id"])
            if not hooks:
                warnings.append(f"{rel(page)}: type=button has no action hook")
                continue
            wired = False
            for hook in hooks:
                if hook.startswith("#"):
                    ident = re.escape(hook[1:])
                    if re.search(rf"getElementById\(\s*['\"]{ident}['\"]\s*\)|querySelector\(\s*['\"]#{ident}['\"]", action_text):
                        wired = True
                        break
                elif hook in action_text:
                    wired = True
                    break
            if not wired:
                errors.append(f"{rel(page)}: button action hook not referenced by page scripts ({', '.join(hooks)})")

    if parser.forms:
        submit_count = len(re.findall(r'<button\b[^>]*\btype=["\']submit["\']', text, re.I))
        if submit_count < len(parser.forms):
            warnings.append(f"{rel(page)}: {len(parser.forms)} form(s) but only {submit_count} explicit submit button(s)")

    if re.search(r'<input\b[^>]*\bname=["\']consent["\']', text, re.I) and "consent-guard.js" not in script_names:
        errors.append(f"{rel(page)}: consent form missing consent-guard.js")

    is_result_page = page.name.endswith("-result.html") or page.name == "compatibility-report.html"
    if is_result_page:
        if "result-loader-guard.js" not in script_names:
            errors.append(f"{rel(page)}: result page missing result-loader-guard.js")
        if "result-loading-safety.css" not in text:
            errors.append(f"{rel(page)}: result page missing result-loading-safety.css")

css_ref = re.compile(r'(?:@import\s+(?:url\()?\s*["\']([^"\']+)|url\(\s*["\']?([^\)"\']+))', re.I)
for css in sorted(ROOT.rglob("*.css")):
    if any(part in SKIP_DIRS for part in css.parts):
        continue
    text = css.read_text(encoding="utf-8")
    if text.count("{") != text.count("}"):
        errors.append(f"{rel(css)}: unbalanced CSS braces")
    for match in css_ref.finditer(text):
        value = (match.group(1) or match.group(2) or "").strip()
        if value.startswith("data:") or is_external(value):
            continue
        target = local_target(css, value)
        if target is not None and not target.exists():
            errors.append(f"{rel(css)}: missing local CSS asset {value}")

js_import = re.compile(r'(?:from\s+|import\()\s*["\'](\.[^"\']+)["\']')
for js in js_files:
    text = js.read_text(encoding="utf-8")
    for value in js_import.findall(text):
        target = local_target(js, value)
        if target is not None and not target.exists():
            errors.append(f"{rel(js)}: missing local JS module {value}")

node = shutil.which("node")
if node:
    for js in js_files:
        result = subprocess.run([node, "--check", str(js)], capture_output=True, text=True)
        if result.returncode != 0:
            detail = (result.stderr or result.stdout).strip().splitlines()
            short = detail[-1] if detail else "syntax check failed"
            errors.append(f"{rel(js)}: JavaScript syntax error: {short}")
else:
    warnings.append("node executable not found; JavaScript syntax checks skipped")

sitemap = ROOT / "sitemap.xml"
if sitemap.exists():
    try:
        tree = ET.parse(sitemap)
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        for loc in tree.findall(".//sm:loc", ns):
            url = (loc.text or "").strip()
            path = urlsplit(url).path
            target = ROOT / ("index.html" if path in ("", "/") else path.lstrip("/"))
            if not target.exists():
                errors.append(f"sitemap.xml: target does not exist: {url}")
    except Exception as exc:
        errors.append(f"sitemap.xml: parse error: {exc}")

print(f"QA checked {len(html_files)} HTML pages, {len(js_files)} JavaScript files, and interactive controls")
for item in warnings:
    print(f"WARN: {item}")
for item in errors:
    print(f"ERROR: {item}")
print(f"QA summary: {len(errors)} error(s), {len(warnings)} warning(s)")
sys.exit(1 if errors else 0)
