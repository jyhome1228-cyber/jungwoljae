import { chromium } from 'playwright';

const BASE = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: 'ko-KR',
  timezoneId: 'Asia/Seoul'
});

const failures = [];
const passes = [];

function fail(label, message) {
  failures.push(`${label}: ${message}`);
  console.error(`FAIL ${label}: ${message}`);
}
function pass(label, message = 'ok') {
  passes.push(`${label}: ${message}`);
  console.log(`PASS ${label}: ${message}`);
}

async function newPage(label) {
  const page = await context.newPage();
  const pageErrors = [];
  const localRequestFailures = [];
  page.on('pageerror', error => pageErrors.push(String(error?.message || error)));
  page.on('requestfailed', request => {
    if (request.url().startsWith(BASE)) {
      localRequestFailures.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || 'failed'}`);
    }
  });
  return { page, pageErrors, localRequestFailures, label };
}

async function assertHealthy(runtime, { allowErrors = [] } = {}) {
  const { page, pageErrors, localRequestFailures, label } = runtime;
  await page.waitForTimeout(350);
  const unexpectedErrors = pageErrors.filter(message => !allowErrors.some(pattern => pattern.test(message)));
  if (unexpectedErrors.length) fail(label, `uncaught JS error: ${unexpectedErrors.join(' | ')}`);
  if (localRequestFailures.length) fail(label, `local asset/request failure: ${localRequestFailures.join(' | ')}`);
  const state = await page.evaluate(() => ({
    bodyText: (document.body?.innerText || '').trim().length,
    bodyLoading: document.body?.classList.contains('saju-loading-open') || false,
    htmlLoading: document.documentElement.classList.contains('saju-loading-open'),
    mainHidden: (() => {
      const main = document.querySelector('main');
      if (!main) return false;
      const style = getComputedStyle(main);
      return style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0;
    })()
  }));
  if (!state.bodyText) fail(label, 'body rendered with no visible text');
  if (state.mainHidden) fail(label, 'main content is hidden');
}

async function goto(runtime, route) {
  const response = await runtime.page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  if (!response || !response.ok()) fail(runtime.label, `HTTP ${response?.status() || 'no response'} for ${route}`);
  await runtime.page.waitForTimeout(650);
}

async function setValue(page, selector, value) {
  await page.waitForSelector(selector, { state: 'attached', timeout: 8000 });
  await page.$eval(selector, (el, next) => {
    el.value = next;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function setChecked(page, selector, checked = true) {
  await page.waitForSelector(selector, { state: 'attached', timeout: 8000 });
  await page.$eval(selector, (el, next) => {
    el.checked = next;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}

async function requestSubmit(page, formSelector) {
  await page.$eval(formSelector, form => form.requestSubmit());
}

async function waitForUrl(page, suffix, timeout = 9000) {
  await page.waitForURL(url => url.pathname.endsWith(suffix), { timeout });
}

async function waitForLoaderGone(page, timeout = 8500) {
  await page.waitForFunction(() => {
    const overlays = [...document.querySelectorAll('[data-saju-loading], .saju-loading-overlay')];
    const visible = overlays.some(el => {
      const style = getComputedStyle(el);
      return !el.hidden && style.display !== 'none' && style.visibility !== 'hidden' && style.pointerEvents !== 'none' && el.classList.contains('is-visible');
    });
    return !visible && !document.body.classList.contains('saju-loading-open') && !document.documentElement.classList.contains('saju-loading-open');
  }, { timeout });
}

async function backUsable(page, formSelector) {
  await page.goBack({ waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForSelector(formSelector, { state: 'attached', timeout: 8000 });
  await page.waitForTimeout(250);
  const state = await page.$eval(`${formSelector} button[type="submit"]`, button => ({ disabled: button.disabled, busy: button.getAttribute('aria-busy') }));
  return !state.disabled && state.busy !== 'true';
}

async function smokePages() {
  const routes = [
    '/', '/index.html', '/ohaeng.html', '/fortune.html', '/tomorrow.html', '/relationship.html', '/compatibility.html', '/work-money.html', '/guide.html', '/talisman.html', '/archive.html', '/reviews.html', '/about.html', '/login.html', '/signup.html', '/mypage.html', '/admin.html', '/lucky-number.html', '/important-day.html', '/moving-day.html'
  ];
  for (const route of routes) {
    const runtime = await newPage(`smoke ${route}`);
    try {
      await goto(runtime, route);
      await assertHealthy(runtime, { allowErrors: [/permission/i, /firebase/i] });
      pass(runtime.label);
    } catch (error) {
      fail(runtime.label, String(error?.message || error));
    } finally {
      await runtime.page.close();
    }
  }
}

async function flowFortune(route, modeLabel) {
  const runtime = await newPage(`${modeLabel} flow`);
  const { page } = runtime;
  try {
    await goto(runtime, route);
    const prefix = route.includes('tomorrow') ? 'quick' : 'fortune';
    const formSelector = route.includes('tomorrow') ? '[data-quick-form]' : '[data-fortune-form]';
    await setValue(page, `#${prefix}-name`, 'QA테스트');
    await setValue(page, `#${prefix}-birth-date`, '1996-12-28');
    await setChecked(page, `#${prefix}-time-unknown`, true);
    if (await page.$(`#${prefix}-gender`)) await setValue(page, `#${prefix}-gender`, 'male');
    if (await page.$(`#${prefix}-city`)) await setValue(page, `#${prefix}-city`, '인천광역시');
    await setChecked(page, `${formSelector} input[name="consent"]`, true);
    const nav = waitForUrl(page, 'fortune-result.html');
    await requestSubmit(page, formSelector);
    await nav;
    await page.waitForLoadState('domcontentloaded');
    await waitForLoaderGone(page);
    await page.waitForSelector('[data-fortune-result]', { state: 'visible', timeout: 8000 });
    const headline = (await page.locator('[data-headline]').textContent())?.trim() || '';
    if (!headline || /읽는 중|준비|로딩/.test(headline)) fail(runtime.label, `result headline not finalized: ${headline}`);
    await assertHealthy(runtime, { allowErrors: [/permission/i, /firebase/i] });
    if (!(await backUsable(page, formSelector))) fail(runtime.label, 'submit button stayed disabled after back navigation');
    pass(runtime.label, 'result rendered, loader released, back navigation usable');
  } catch (error) {
    fail(runtime.label, String(error?.message || error));
  } finally {
    await page.close();
  }
}

async function flowOhaeng() {
  const runtime = await newPage('ohaeng flow');
  const { page } = runtime;
  try {
    await goto(runtime, '/ohaeng.html');
    await setValue(page, '#ohaeng-name', 'QA테스트');
    await setValue(page, '#ohaeng-year', '1996');
    await setValue(page, '#ohaeng-month', '12');
    await setValue(page, '#ohaeng-day', '28');
    await setChecked(page, '#ohaeng-time-unknown', true);
    await setValue(page, '#ohaeng-gender', 'male');
    await setValue(page, '#ohaeng-city', '인천광역시');
    await setChecked(page, '[data-ohaeng-form] input[name="consent"]', true);
    const nav = waitForUrl(page, 'ohaeng-result.html');
    await requestSubmit(page, '[data-ohaeng-form]');
    await nav;
    await waitForLoaderGone(page);
    await page.waitForSelector('[data-ohaeng-result]', { state: 'visible', timeout: 8000 });
    const name = (await page.locator('[data-name]').textContent())?.trim();
    if (name !== 'QA테스트') fail(runtime.label, `result did not use submitted profile (${name})`);
    await assertHealthy(runtime, { allowErrors: [/permission/i, /firebase/i] });
    if (!(await backUsable(page, '[data-ohaeng-form]'))) fail(runtime.label, 'submit button stayed disabled after back navigation');
    pass(runtime.label, 'result rendered, loader released, back navigation usable');
  } catch (error) {
    fail(runtime.label, String(error?.message || error));
  } finally { await page.close(); }
}

async function flowRelationship() {
  const runtime = await newPage('relationship flow');
  const { page } = runtime;
  try {
    await goto(runtime, '/relationship.html');
    await setValue(page, '#relationship-name', 'QA테스트');
    await setValue(page, '#relationship-year', '1996');
    await setValue(page, '#relationship-month', '12');
    await setValue(page, '#relationship-day', '28');
    await setChecked(page, '#relationship-time-unknown', true);
    await setValue(page, '#relationship-gender', 'male');
    await setValue(page, '#relationship-city', '인천광역시');
    await setChecked(page, '[data-relationship-form] input[name="consent"]', true);
    const nav = waitForUrl(page, 'relationship-result.html');
    await requestSubmit(page, '[data-relationship-form]');
    await nav;
    await waitForLoaderGone(page);
    await page.waitForSelector('[data-relationship-result]', { state: 'visible', timeout: 8000 });
    await assertHealthy(runtime, { allowErrors: [/permission/i, /firebase/i] });
    if (!(await backUsable(page, '[data-relationship-form]'))) fail(runtime.label, 'submit button stayed disabled after back navigation');
    pass(runtime.label, 'result rendered, loader released, back navigation usable');
  } catch (error) {
    fail(runtime.label, String(error?.message || error));
  } finally { await page.close(); }
}

async function flowCompatibility() {
  const runtime = await newPage('compatibility flow');
  const { page } = runtime;
  try {
    await goto(runtime, '/compatibility.html');
    await setValue(page, '#profile-name', 'QA나');
    await setValue(page, '#birth-year', '1996');
    await setValue(page, '#birth-month', '12');
    await setValue(page, '#birth-day', '28');
    await setValue(page, '#birth-gender', 'male');
    await setValue(page, '#birth-city', '인천광역시');
    await setValue(page, '#partner-name', 'QA상대');
    await setValue(page, '#partner-birth-year', '1995');
    await setValue(page, '#partner-birth-month', '08');
    await setValue(page, '#partner-birth-day', '15');
    await setValue(page, '#partner-birth-gender', 'female');
    await setValue(page, '#partner-birth-city', '서울특별시');
    // Deliberately leave both birth times empty: they are optional and must not block submission.
    await setChecked(page, '[data-compatibility-form] input[name="consent"]', true);
    const nav = waitForUrl(page, 'compatibility-report.html');
    await requestSubmit(page, '[data-compatibility-form]');
    await nav;
    await waitForLoaderGone(page);
    await page.waitForSelector('[data-compatibility-report]', { state: 'visible', timeout: 8000 });
    const score = (await page.locator('[data-overall-score]').textContent())?.trim() || '';
    if (!/^\d+$/.test(score)) fail(runtime.label, `compatibility score not rendered (${score})`);
    await assertHealthy(runtime, { allowErrors: [/permission/i, /firebase/i] });
    if (!(await backUsable(page, '[data-compatibility-form]'))) fail(runtime.label, 'submit button stayed disabled after back navigation');
    pass(runtime.label, 'optional time accepted, result rendered, loader released, back navigation usable');
  } catch (error) {
    fail(runtime.label, String(error?.message || error));
  } finally { await page.close(); }
}

async function flowWorkMoney() {
  const runtime = await newPage('work-money flow');
  const { page } = runtime;
  try {
    await goto(runtime, '/work-money.html');
    await setValue(page, '#work-name', 'QA테스트');
    await setValue(page, '#work-year', '1996');
    await setValue(page, '#work-month', '12');
    await setValue(page, '#work-day', '28');
    await setChecked(page, '#work-time-unknown', true);
    await setValue(page, '#work-gender', 'male');
    await setValue(page, '#work-city', '인천광역시');
    await setChecked(page, '[data-work-form] input[name="consent"]', true);
    const nav = waitForUrl(page, 'work-money-result.html');
    await requestSubmit(page, '[data-work-form]');
    await nav;
    await waitForLoaderGone(page);
    await page.waitForSelector('[data-work-result]', { state: 'visible', timeout: 8000 });
    await assertHealthy(runtime, { allowErrors: [/permission/i, /firebase/i] });
    if (!(await backUsable(page, '[data-work-form]'))) fail(runtime.label, 'submit button stayed disabled after back navigation');
    pass(runtime.label, 'result rendered, loader released, back navigation usable');
  } catch (error) {
    fail(runtime.label, String(error?.message || error));
  } finally { await page.close(); }
}

async function flowGuide() {
  const runtime = await newPage('guide flow');
  const { page } = runtime;
  try {
    await goto(runtime, '/guide.html');
    await page.waitForSelector('input[name="guideDomain"][value="work"]', { timeout: 8000 });
    await setChecked(page, 'input[name="guideDomain"][value="work"]', true);
    await page.waitForSelector('input[name="guideSituation"][value="change"]', { timeout: 4000 });
    await setChecked(page, 'input[name="guideSituation"][value="change"]', true);
    await page.waitForSelector('input[name="guideBlocker"][value="money"]', { timeout: 4000 });
    await setChecked(page, 'input[name="guideBlocker"][value="money"]', true);
    await setValue(page, '#guide-name', 'QA테스트');
    await setValue(page, '#guide-year', '1996');
    await setValue(page, '#guide-month', '12');
    await setValue(page, '#guide-day', '28');
    await setChecked(page, '#guide-time-unknown', true);
    await setValue(page, '#guide-gender', 'male');
    await setValue(page, '#guide-city', '인천광역시');
    await setChecked(page, '[data-guide-form] input[name="consent"]', true);
    const nav = waitForUrl(page, 'guide-result.html');
    await requestSubmit(page, '[data-guide-form]');
    await nav;
    await waitForLoaderGone(page);
    await page.waitForSelector('[data-guide-result]', { state: 'visible', timeout: 8000 });
    await assertHealthy(runtime, { allowErrors: [/permission/i, /firebase/i] });
    if (!(await backUsable(page, '[data-guide-form]'))) fail(runtime.label, 'submit button stayed disabled after back navigation');
    pass(runtime.label, 'multi-step flow submitted, result rendered, loader released, back navigation usable');
  } catch (error) {
    fail(runtime.label, String(error?.message || error));
  } finally { await page.close(); }
}

await smokePages();
await flowFortune('/fortune.html', 'today fortune');
await flowFortune('/tomorrow.html', 'tomorrow fortune');
await flowOhaeng();
await flowRelationship();
await flowCompatibility();
await flowWorkMoney();
await flowGuide();

await browser.close();

console.log(`\nRuntime QA summary: ${passes.length} pass(es), ${failures.length} failure(s)`);
if (failures.length) {
  console.error('\nFailures:');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}
