#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
APP_VERSION = "20260911-1750"
STYLE_VERSION = "20260911-1435"
COPY_VERSION = "20260911-1750"
RESULT_CLEANUP_VERSION = "20260911-1750"
app_pattern = re.compile(r'(<script\b[^>]*\bsrc=["\'])\./app\.js(?:\?v=[^"\']+)?(["\'][^>]*></script>)', re.I)
page_css_pattern = re.compile(r'(<link\b[^>]*\bhref=["\'])\./page\.css(?:\?v=[^"\']+)?(["\'][^>]*>)', re.I)
copy_script_pattern = re.compile(r'<script\b[^>]*\bsrc=["\']\./site-copy-cleanup-v1\.js(?:\?v=[^"\']+)?["\'][^>]*></script>', re.I)
dedup_script_pattern = re.compile(r'(<script\b[^>]*\bsrc=["\'])\./result-dedup-v1\.js(?:\?v=[^"\']+)?(["\'][^>]*></script>)', re.I)


def remove_free_words(text: str) -> str:
    text = text.replace('무료로', '')
    text = text.replace('무료', '')
    text = re.sub(r'(?<![A-Za-z0-9_])FREE(?![A-Za-z0-9_])\s*[·:\-]?\s*', '', text)
    return text


changed = []
for page in sorted(ROOT.glob('*.html')):
    text = page.read_text(encoding='utf-8')
    updated = app_pattern.sub(rf'\1./app.js?v={APP_VERSION}\2', text)
    updated = page_css_pattern.sub(rf'\1./page.css?v={STYLE_VERSION}\2', updated)
    updated = dedup_script_pattern.sub(rf'\1./result-dedup-v1.js?v={RESULT_CLEANUP_VERSION}\2', updated)
    updated = remove_free_words(updated)
    cleanup_script = f'<script src="./site-copy-cleanup-v1.js?v={COPY_VERSION}" defer></script>'
    updated = copy_script_pattern.sub('', updated)
    if '</body>' in updated.lower():
        updated = re.sub(r'</body>', cleanup_script + '</body>', updated, count=1, flags=re.I)
    if updated != text:
        page.write_text(updated, encoding='utf-8')
        changed.append(page.name)

for js in sorted(ROOT.glob('*.js')):
    if js.name == 'site-copy-cleanup-v1.js':
        continue
    text = js.read_text(encoding='utf-8')
    updated = remove_free_words(text)
    if updated != text:
        js.write_text(updated, encoding='utf-8')
        changed.append(js.name)

page_css = ROOT / 'page.css'
if page_css.exists():
    text = page_css.read_text(encoding='utf-8')
    updated = re.sub(r'@import\s+url\(["\']\.\/typography\.css(?:\?v=[^"\']+)?["\']\);', f'@import url("./typography.css?v={STYLE_VERSION}");', text, count=1)
    if updated != text:
        page_css.write_text(updated, encoding='utf-8')
        print(f'Normalized typography cache key in page.css to {STYLE_VERSION}.')

print(f'Normalized deploy assets and removed all free-service wording from {len(changed)} file(s).')
if changed:
    print('Files: ' + ', '.join(changed))
