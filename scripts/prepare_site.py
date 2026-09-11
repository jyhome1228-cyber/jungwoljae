#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
APP_VERSION = "20260911-1906"
STYLE_VERSION = "20260911-1906"
COPY_VERSION = "20260911-1906"
RESULT_CLEANUP_VERSION = "20260911-1906"
RESULT_LOADER_VERSION = "20260911-1906"
FORM_VERSION = "20260911-1906"
CONSENT_VERSION = "20260911-1906"

app_pattern = re.compile(r'(<script\b[^>]*\bsrc=["\'])\./app\.js(?:\?v=[^"\']+)?(["\'][^>]*></script>)', re.I)
page_css_pattern = re.compile(r'(<link\b[^>]*\bhref=["\'])\./page\.css(?:\?v=[^"\']+)?(["\'][^>]*>)', re.I)
copy_script_pattern = re.compile(r'<script\b[^>]*\bsrc=["\']\./site-copy-cleanup-v1\.js(?:\?v=[^"\']+)?["\'][^>]*></script>', re.I)
consent_script_pattern = re.compile(r'<script\b[^>]*\bsrc=["\']\./consent-guard\.js(?:\?v=[^"\']+)?["\'][^>]*></script>', re.I)
fortune_form_pattern = re.compile(r'(<script\b[^>]*\bsrc=["\'])\./fortune-form\.js(?:\?v=[^"\']+)?(["\'][^>]*></script>)', re.I)
dedup_script_pattern = re.compile(r'(<script\b[^>]*\bsrc=["\'])\./result-dedup-v1\.js(?:\?v=[^"\']+)?(["\'][^>]*></script>)', re.I)
result_guard_pattern = re.compile(r'<script\b[^>]*\bsrc=["\']\./result-loader-guard\.js(?:\?v=[^"\']+)?["\'][^>]*></script>', re.I)
result_safety_pattern = re.compile(r'<link\b[^>]*\bhref=["\']\./result-loading-safety\.css(?:\?v=[^"\']+)?["\'][^>]*>', re.I)


def remove_free_words(text: str) -> str:
    text = text.replace('무료로', '')
    text = text.replace('무료', '')
    text = re.sub(r'(?<![A-Za-z0-9_])FREE(?![A-Za-z0-9_])\s*[·:\-]?\s*', '', text)
    return text


def is_result_page(page: Path) -> bool:
    return page.name.endswith('-result.html') or page.name == 'compatibility-report.html'


changed = []
for page in sorted(ROOT.glob('*.html')):
    text = page.read_text(encoding='utf-8')
    updated = app_pattern.sub(rf'\1./app.js?v={APP_VERSION}\2', text)
    updated = page_css_pattern.sub(rf'\1./page.css?v={STYLE_VERSION}\2', updated)
    updated = fortune_form_pattern.sub(rf'\1./fortune-form.js?v={FORM_VERSION}\2', updated)
    updated = dedup_script_pattern.sub(rf'\1./result-dedup-v1.js?v={RESULT_CLEANUP_VERSION}\2', updated)
    updated = remove_free_words(updated)

    cleanup_script = f'<script src="./site-copy-cleanup-v1.js?v={COPY_VERSION}" defer></script>'
    consent_script = f'<script src="./consent-guard.js?v={CONSENT_VERSION}" defer></script>'
    updated = copy_script_pattern.sub('', updated)
    updated = consent_script_pattern.sub('', updated)

    if is_result_page(page):
        safety_link = f'<link rel="stylesheet" href="./result-loading-safety.css?v={RESULT_LOADER_VERSION}" />'
        updated = result_safety_pattern.sub('', updated)
        updated = re.sub(r'</head>', safety_link + '\n</head>', updated, count=1, flags=re.I)

        guard_script = f'<script src="./result-loader-guard.js?v={RESULT_LOADER_VERSION}" defer></script>'
        updated = result_guard_pattern.sub('', updated)
        app_match = re.search(r'<script\b[^>]*\bsrc=["\']\./app\.js[^>]*></script>', updated, flags=re.I)
        if app_match:
            updated = updated[:app_match.start()] + guard_script + '\n  ' + updated[app_match.start():]
        else:
            updated = re.sub(r'</body>', guard_script + '</body>', updated, count=1, flags=re.I)

    if '</body>' in updated.lower():
        updated = re.sub(r'</body>', consent_script + cleanup_script + '</body>', updated, count=1, flags=re.I)

    if updated != text:
        page.write_text(updated, encoding='utf-8')
        changed.append(page.name)

for js in sorted(ROOT.glob('*.js')):
    if js.name in {'site-copy-cleanup-v1.js','consent-guard.js'}:
        continue
    text = js.read_text(encoding='utf-8')
    updated = remove_free_words(text)
    if js.name == 'app.js':
        updated = re.sub(r'\.\/saju-loading\.js\?v=[0-9\-]+', f'./saju-loading.js?v={RESULT_LOADER_VERSION}', updated)
        updated = re.sub(r'\.\/welcome-popup\.js\?v=[0-9\-]+', f'./welcome-popup.js?v={RESULT_LOADER_VERSION}', updated)
        updated = updated.replace(
            "if(resultMain){resultMain.style.visibility='hidden';document.body.classList.add('reading-result-pending');}",
            "if(resultMain){resultMain.style.visibility='';document.body.classList.remove('reading-result-pending');}"
        )
    if updated != text:
        js.write_text(updated, encoding='utf-8')
        changed.append(js.name)

# Remove CSS rules that could keep a result page hidden forever if a module stalls.
css_repairs = {
    'saju-loading.css': [
        ('body.reading-result-pending main{visibility:hidden!important}', 'body.reading-result-pending main{visibility:visible!important}')
    ],
    'fortune-final-v12.css': [
        ('.fortune-result-main[data-final-state="loading"]{visibility:hidden}', '.fortune-result-main[data-final-state="loading"]{visibility:visible}')
    ],
}
for css_name, replacements in css_repairs.items():
    css_path = ROOT / css_name
    if not css_path.exists():
        continue
    text = css_path.read_text(encoding='utf-8')
    updated = text
    for old, new in replacements:
        updated = updated.replace(old, new)
    if updated != text:
        css_path.write_text(updated, encoding='utf-8')
        changed.append(css_name)

page_css = ROOT / 'page.css'
if page_css.exists():
    text = page_css.read_text(encoding='utf-8')
    updated = re.sub(r'@import\s+url\(["\']\.\/typography\.css(?:\?v=[^"\']+)?["\']\);', f'@import url("./typography.css?v={STYLE_VERSION}");', text, count=1)
    if updated != text:
        page_css.write_text(updated, encoding='utf-8')
        print(f'Normalized typography cache key in page.css to {STYLE_VERSION}.')

print(f'Normalized deploy assets, form navigation, consent guidance and result-loader safety in {len(changed)} file(s).')
if changed:
    print('Files: ' + ', '.join(changed))
