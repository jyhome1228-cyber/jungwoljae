import { chromium } from 'playwright';

const BASE=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'ko-KR',timezoneId:'Asia/Seoul'});
const failures=[];
const passes=[];
const fail=(label,msg)=>{failures.push(`${label}: ${msg}`);console.error(`FAIL ${label}: ${msg}`);};
const pass=(label,msg='ok')=>{passes.push(`${label}: ${msg}`);console.log(`PASS ${label}: ${msg}`);};

const common={name:'편집QA',birthDate:'1996-12-28',birthTime:'',birthTimeUnknown:true,calendarType:'solar',isLeapMonth:false,gender:'male',city:'인천광역시'};
const fixtures=[
  {label:'ohaeng editorial',route:'/ohaeng-result.html',key:'jungwoljae_ohaeng_input',payload:{...common},root:'[data-ohaeng-result]',grid:'[data-life-grid]',minCues:4},
  {label:'relationship editorial',route:'/relationship-result.html',key:'jungwoljae_relationship_input',payload:{...common,relationshipStatus:'dating'},root:'[data-relationship-result]',grid:'[data-guide-grid]',minCues:3},
  {label:'work editorial',route:'/work-money-result.html',key:'jungwoljae_work_money_input',payload:{...common,focus:['career','money']},root:'[data-work-result]',grid:'[data-money-grid]',minCues:3},
  {label:'compatibility editorial',route:'/compatibility-report.html',key:'jungwoljae_compatibility_input',payload:{personA:{...common,name:'편집QA A'},personB:{...common,name:'편집QA B',birthDate:'1995-08-15',gender:'female',city:'서울특별시'},createdAt:Date.now()},root:'[data-compatibility-report]',grid:'[data-compare-grid]',minCues:2},
  {label:'fortune layout',route:'/fortune-result.html',key:'jungwoljae_fortune_input',payload:{...common,birthYear:1996,targetDate:'2026-09-12',mode:'today',createdAt:Date.now()},root:'[data-fortune-result]',grid:'[data-area-grid]',minCues:0}
];

async function seed(page,key,payload){
  await page.goto(`${BASE}/index.html`,{waitUntil:'domcontentloaded',timeout:20000});
  await page.evaluate(([k,p])=>sessionStorage.setItem(k,JSON.stringify(p)),[key,payload]);
}

async function loaderGone(page){
  await page.waitForFunction(()=>{
    const overlays=[...document.querySelectorAll('[data-saju-loading],.saju-loading-overlay')];
    const visible=overlays.some(el=>{const s=getComputedStyle(el);return !el.hidden&&s.display!=='none'&&s.visibility!=='hidden'&&el.classList.contains('is-visible');});
    return !visible&&!document.body.classList.contains('saju-loading-open')&&!document.documentElement.classList.contains('saju-loading-open');
  },{timeout:9000});
}

for(const fixture of fixtures){
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.message||e)));
  try{
    await seed(page,fixture.key,fixture.payload);
    const response=await page.goto(`${BASE}${fixture.route}`,{waitUntil:'domcontentloaded',timeout:20000});
    if(!response?.ok())throw new Error(`HTTP ${response?.status()||'no response'}`);
    await page.waitForSelector(fixture.root,{state:'visible',timeout:8000});
    await loaderGone(page);
    await page.waitForTimeout(1200);

    const audit=await page.evaluate(({rootSel,gridSel})=>{
      const root=document.querySelector(rootSel);
      const grid=document.querySelector(gridSel);
      const section=grid?.closest('section');
      const heading=section?.querySelector('h2');
      const gap=grid&&heading?Math.round(grid.getBoundingClientRect().top-heading.getBoundingClientRect().bottom):null;
      const cues=root?[...root.querySelectorAll('.result-action-cue')].length:0;
      const cards=root?[...root.querySelectorAll('article')]:[];
      const clipped=cards.filter(card=>{
        const s=getComputedStyle(card);
        const overflowHidden=['hidden','clip'].includes(s.overflowY)||['hidden','clip'].includes(s.overflow);
        return overflowHidden&&card.scrollHeight>card.clientHeight+3;
      }).map(card=>(card.querySelector('h3,strong')?.textContent||card.className||'card').trim().slice(0,80));
      const paragraphs=root?[...root.querySelectorAll('p')].filter(p=>!p.closest('details')):[];
      const visibleParagraphs=paragraphs.filter(p=>{const s=getComputedStyle(p);return s.display!=='none'&&s.visibility!=='hidden'&&(p.textContent||'').trim();});
      const vague=/도움이 됩니다|중요합니다|편이 좋습니다|의식적으로|상대적으로|유리합니다/;
      const vagueCount=visibleParagraphs.filter(p=>vague.test((p.textContent||'').trim())).length;
      const ellipsis=visibleParagraphs.filter(p=>/…\s*$/.test((p.textContent||'').trim())).map(p=>(p.textContent||'').trim().slice(-90));
      return {gap,cues,clipped,vagueCount,totalParagraphs:visibleParagraphs.length,ellipsis};
    },{rootSel:fixture.root,gridSel:fixture.grid});

    if(errors.some(e=>!/permission|firebase/i.test(e)))fail(fixture.label,`uncaught JS error: ${errors.join(' | ')}`);
    if(audit.gap!==null&&audit.gap<18)fail(fixture.label,`heading-to-content gap too tight (${audit.gap}px)`);
    if(audit.clipped.length)fail(fixture.label,`clipped card content: ${audit.clipped.join(' / ')}`);
    if(audit.ellipsis.length)fail(fixture.label,`visible paragraph ends with ellipsis: ${audit.ellipsis.join(' / ')}`);
    if(audit.totalParagraphs>=4&&audit.vagueCount/audit.totalParagraphs>.55)fail(fixture.label,`generic-advice density too high (${audit.vagueCount}/${audit.totalParagraphs})`);
    if(audit.cues<fixture.minCues)fail(fixture.label,`practical action cues missing (${audit.cues}/${fixture.minCues})`);

    if(!failures.some(x=>x.startsWith(`${fixture.label}:`)))pass(fixture.label,`gap ${audit.gap??'-'}px · cues ${audit.cues} · vague ${audit.vagueCount}/${audit.totalParagraphs} · no clipping`);
  }catch(error){
    fail(fixture.label,String(error?.message||error));
  }finally{await page.close();}
}

await browser.close();
console.log(`\nEditorial QA summary: ${passes.length} pass(es), ${failures.length} failure(s)`);
if(failures.length)process.exit(1);
