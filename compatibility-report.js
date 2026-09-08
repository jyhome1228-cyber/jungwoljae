import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const raw=sessionStorage.getItem('jungwoljae_compatibility_input');
if(!raw){location.href='./compatibility.html';throw new Error('missing compatibility input');}
const input=JSON.parse(raw);
const root=document.querySelector('[data-compatibility-report]');
const $=selector=>root.querySelector(selector);
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);const db=getFirestore(app);
let currentUser=null,saved=false,resultData=null;

const stemElement={갑:'wood',을:'wood',병:'fire',정:'fire',무:'earth',기:'earth',경:'metal',신:'metal',임:'water',계:'water'};
const branchElement={인:'wood',묘:'wood',사:'fire',오:'fire',진:'earth',술:'earth',축:'earth',미:'earth',신:'metal',유:'metal',자:'water',해:'water'};
const stemYinYang={갑:'yang',을:'yin',병:'yang',정:'yin',무:'yang',기:'yin',경:'yang',신:'yin',임:'yang',계:'yin'};
const elementInfo={
  wood:{name:'목',plain:'시작과 확장',style:'관계가 멈춰 있기보다 함께 움직이고 변하는 느낌을 중요하게 보는 편입니다.'},
  fire:{name:'화',plain:'표현과 반응',style:'마음을 주고받는 표현과 상대의 반응이 분명할 때 관계가 편해지는 편입니다.'},
  earth:{name:'토',plain:'안정과 지속',style:'말보다 꾸준함과 예측 가능한 태도에서 신뢰를 느끼는 편입니다.'},
  metal:{name:'금',plain:'기준과 경계',style:'약속과 존중, 각자의 기준이 분명한 관계에서 편안함을 느끼는 편입니다.'},
  water:{name:'수',plain:'관찰과 유연',style:'서두르기보다 충분히 살피고 자연스럽게 가까워지는 관계를 선호하는 편입니다.'}
};
const relationPairs={
  yukhap:[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']],
  chung:[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']],
  hae:[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']],
  pa:[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']]
};
const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
const genderLabel={male:'남성',female:'여성'};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const pairHas=(arr,a,b)=>arr.some(pair=>pair.includes(a)&&pair.includes(b));
const pillarString=value=>typeof value==='string'?value:(value?.korean||value?.name||'');

function pillarsObject(result){
  if(typeof result?.toObject==='function')return result.toObject();
  return {year:pillarString(result?.year),month:pillarString(result?.month),day:pillarString(result?.day),hour:pillarString(result?.hour)};
}
function add(score,key,weight){if(key)score[key]=(score[key]||0)+weight;}
function addPillar(score,pillar,stemWeight=1,branchWeight=1.1){
  const chars=[...pillarString(pillar)];
  add(score,stemElement[chars[0]],stemWeight);add(score,branchElement[chars[1]],branchWeight);
}
function normalize(score){
  const total=Object.values(score).reduce((a,b)=>a+b,0)||1;const out={};
  Object.keys(score).forEach(key=>out[key]=Math.round(score[key]/total*100));
  return out;
}
function parseTime(person){
  if(!person.birthTime)return {hour:12,minute:0,known:false};
  const [hour,minute]=person.birthTime.split(':').map(Number);return {hour,minute,known:true};
}
function calcPerson(person){
  const [year,month,day]=person.birthDate.split('-').map(Number);const time=parseTime(person);
  const result=calculateFourPillars({year,month,day,hour:time.hour,minute:time.minute,isLunar:person.calendarType==='lunar',isLeapMonth:Boolean(person.isLeapMonth),gender:person.gender||undefined});
  const pillars=pillarsObject(result);const dayP=pillarString(pillars.day);const dayStem=[...dayP][0];const dayBranch=[...dayP][1];
  const score={wood:0,fire:0,earth:0,metal:0,water:0};
  addPillar(score,pillars.year);addPillar(score,pillars.month);addPillar(score,pillars.day);if(time.known)addPillar(score,pillars.hour);
  if(pillars.month)add(score,branchElement[[...pillarString(pillars.month)][1]],.8);
  const elements=normalize(score);const order=Object.keys(elements).sort((a,b)=>elements[b]-elements[a]);
  return {person,pillars,dayStem,dayBranch,dayElement:stemElement[dayStem],dayBranchElement:branchElement[dayBranch],yinYang:stemYinYang[dayStem]||'yang',elements,strongest:order[0],weakest:order.at(-1),timeKnown:time.known};
}
function branchRelation(a,b){
  if(pairHas(relationPairs.yukhap,a,b))return {type:'yukhap',score:91,label:'자연스럽게 접점이 생기기 쉬움',bonus:10,copy:'서로 다른 부분이 있어도 관계의 접점을 다시 찾는 힘이 비교적 좋은 편입니다.'};
  if(pairHas(relationPairs.chung,a,b))return {type:'chung',score:56,label:'속도와 방식 차이가 크게 느껴질 수 있음',bonus:-9,copy:'끌림과 긴장이 함께 생길 수 있어, 중요한 결정일수록 감정이 올라온 순간 바로 결론 내리지 않는 편이 좋습니다.'};
  if(pairHas(relationPairs.hae,a,b))return {type:'hae',score:63,label:'말의 의도와 받아들이는 방식이 엇갈릴 수 있음',bonus:-5,copy:'상대가 알아서 이해할 것이라고 넘기기보다 기대와 서운함을 짧게라도 말로 확인하는 것이 중요합니다.'};
  if(pairHas(relationPairs.pa,a,b))return {type:'pa',score:65,label:'작은 생활 습관에서 어긋남이 누적될 수 있음',bonus:-4,copy:'큰 갈등보다 반복되는 작은 불편을 제때 정리하는 것이 관계 유지에 더 중요합니다.'};
  return {type:'neutral',score:75,label:'강한 합이나 충보다 조율 방식이 중요함',bonus:1,copy:'특정한 한 요소가 관계를 결정하기보다 두 사람이 실제로 대화하고 약속을 지키는 방식이 더 크게 작동합니다.'};
}
function elementRelation(a,b){
  if(a===b)return {score:79,label:'비슷한 방식',bonus:4,copy:`두 사람 모두 ${elementInfo[a].plain}을 중요하게 보는 편이라 서로의 기본 반응을 이해하기 쉽습니다. 다만 같은 약점도 함께 반복될 수 있습니다.`};
  if(generates[a]===b||generates[b]===a)return {score:87,label:'이어지는 방식',bonus:8,copy:'한 사람의 자연스러운 방식이 다른 사람의 다음 행동을 밀어주는 구조라 서로 힘을 보태기 쉽습니다.'};
  if(controls[a]===b||controls[b]===a)return {score:62,label:'기준이 부딪힐 수 있는 방식',bonus:-5,copy:'좋고 나쁨보다 우선순위가 다르게 느껴질 수 있습니다. 한쪽의 기준을 정답으로 만들지 않는 것이 중요합니다.'};
  return {score:73,label:'서로 다른 방식',bonus:1,copy:'기본 반응은 다르지만 차이를 설명하고 역할을 나누면 오히려 관계의 폭이 넓어질 수 있습니다.'};
}
function distributionSimilarity(a,b){const diff=Object.keys(a).reduce((sum,key)=>sum+Math.abs(a[key]-b[key]),0);return clamp(Math.round(100-diff/2),0,100);}
function complementScore(a,b){
  const aFill=Math.max(0,b.elements[a.weakest]-a.elements[a.weakest]);
  const bFill=Math.max(0,a.elements[b.weakest]-b.elements[b.weakest]);
  return clamp(Math.round(58+(aFill+bFill)*1.35),45,94);
}
function metricLabel(score){if(score>=85)return '매우 편한 편';if(score>=75)return '잘 맞는 편';if(score>=65)return '조율하면 좋은 편';return '차이를 자주 확인해야 함';}
function overallTitle(score){if(score>=85)return '기본 호흡이 좋은 궁합입니다.';if(score>=75)return '잘 맞는 부분이 분명한 궁합입니다.';if(score>=65)return '차이를 이해하면 안정되는 궁합입니다.';return '끌림보다 조율 방식이 더 중요한 궁합입니다.';}
function calculate(){
  const a=calcPerson(input.personA),b=calcPerson(input.personB);const similarity=distributionSimilarity(a.elements,b.elements);const branch=branchRelation(a.dayBranch,b.dayBranch);const element=elementRelation(a.dayElement,b.dayElement);const complement=complementScore(a,b);const yinYang=a.yinYang!==b.yinYang?84:74;
  const emotion=clamp(Math.round(element.score*.58+yinYang*.42),48,94);
  const communication=clamp(Math.round(similarity*.38+element.score*.27+branch.score*.35),45,94);
  const lifestyle=clamp(Math.round(similarity*.56+branch.score*.44),45,94);
  const recovery=clamp(Math.round(branch.score*.42+element.score*.28+complement*.30),45,94);
  const overall=clamp(Math.round((emotion+communication+lifestyle+recovery)/4+branch.bonus*.22+element.bonus*.18),45,95);
  return {a,b,similarity,branch,element,complement,yinYang,metrics:{emotion,communication,lifestyle,recovery},overall};
}
function personCard(d,label){
  const main=elementInfo[d.dayElement],strong=elementInfo[d.strongest],weak=elementInfo[d.weakest];
  return `<article class="compatibility-person-card"><span>${label}</span><h3>${d.person.name}님 · ${main.name}의 ‘${main.plain}’</h3><p>${main.style} 전체적으로는 ${strong.name}의 작용이 상대적으로 강하고, ${weak.name}의 역할은 의식적으로 보완하면 관계가 더 편해질 수 있습니다.</p><div class="compatibility-person-meta"><span>${genderLabel[d.person.gender]||'성별 미입력'}</span><span>${d.person.city}</span><span>${d.person.calendarType==='lunar'?'음력':'양력'} ${d.person.birthDate}</span><span>${d.person.birthTime||'출생시간 모름'}</span></div></article>`;
}
function compareCards(d){
  const strong=`${d.element.copy} 오행 전체 분포의 유사도는 ${d.similarity}점으로, 두 사람이 세상을 받아들이는 기본 리듬이 ${d.similarity>=78?'비교적 비슷한 편':'완전히 같지는 않은 편'}입니다.`;
  const friction=`${d.branch.copy} 특히 가까운 관계에서는 ‘누가 맞는가’보다 서로 어떤 속도로 반응하는지를 먼저 확인하는 것이 좋습니다.`;
  return `<article class="compatibility-compare-card"><strong>잘 맞는 지점 · ${d.element.label}</strong><p>${strong}</p></article><article class="compatibility-compare-card"><strong>조율이 필요한 지점 · ${d.branch.label}</strong><p>${friction}</p></article>`;
}
function advice(d){
  const communication=d.metrics.communication>=75?'중요한 얘기를 길게 미루기보다 핵심을 짧게 확인하면 두 사람의 장점이 잘 살아납니다.':'한쪽은 설명했다고 생각하고 다른 쪽은 아직 듣지 못했다고 느낄 수 있습니다. 중요한 약속은 말로 한 번 더 확인하는 편이 좋습니다.';
  const emotion=d.metrics.emotion>=75?'감정 표현의 기본 호흡은 비교적 잘 맞습니다. 다만 익숙해질수록 표현을 생략하지 않는 것이 좋습니다.':'좋아하는 마음의 크기보다 표현 속도와 방식이 다르게 보일 수 있습니다. 반응이 느리다고 마음이 없는 것으로 단정하지 않는 것이 중요합니다.';
  const lifestyle=d.metrics.lifestyle>=75?'일상 리듬을 맞추는 데 큰 무리가 적은 편입니다. 함께하는 시간과 각자 시간을 미리 정하면 더 안정적입니다.':'생활 방식과 연락 빈도처럼 작은 차이가 누적될 수 있습니다. 자주 부딪히는 항목은 감정 문제가 아니라 운영 방식으로 정해두는 편이 좋습니다.';
  const recovery=d.metrics.recovery>=75?'갈등 뒤 다시 접점을 찾는 힘이 있는 편입니다. 사과보다 다음에 어떻게 할지를 같이 정하면 회복이 빠릅니다.':'갈등이 생기면 한 번의 대화로 끝내려 하기보다 시간을 두고 다시 확인하는 과정이 필요합니다. 결론을 서두르지 않는 것이 좋습니다.';
  return [['대화할 때',communication],['감정을 표현할 때',emotion],['일상을 맞출 때',lifestyle],['싸운 뒤 풀 때',recovery]].map(([title,copy])=>`<article><strong>${title}</strong><p>${copy}</p></article>`).join('');
}
function totalSummary(d){
  const a=elementInfo[d.a.dayElement],b=elementInfo[d.b.dayElement];
  const first=d.overall>=80?'두 사람은 서로의 기본 반응을 이해하기 비교적 쉬운 편입니다.':d.overall>=68?'두 사람은 잘 맞는 부분과 다른 부분이 함께 뚜렷한 편입니다.':'두 사람은 관계의 자동 호흡보다 의식적인 설명과 조율이 더 중요한 편입니다.';
  return `<p>${first} ${d.a.person.name}님은 ${a.plain}을, ${d.b.person.name}님은 ${b.plain}을 관계에서 중요한 기준으로 쓰는 경향이 있습니다.</p><p>궁합에서 가장 중요한 것은 ${d.metrics.communication>=d.metrics.lifestyle?'대화의 방식':'생활 리듬을 맞추는 방식'}입니다. 점수 자체보다 네 항목 가운데 낮게 나온 부분을 실제 관계에서 어떻게 보완하느냐가 더 중요합니다.</p><p>정월재의 궁합은 두 사람의 미래를 단정하지 않습니다. 사주와 오행에서 보이는 차이를 실제 관계의 대화·표현·생활·갈등 기준으로 바꿔, 두 사람이 오래 편해지기 위해 무엇을 확인하면 좋은지 정리하는 참고 자료입니다.</p>`;
}
function pillarLine(d){return Object.entries(d.pillars).map(([key,value])=>`${({year:'년주',month:'월주',day:'일주',hour:'시주'})[key]||key} ${pillarString(value)||'-'}`).join(' · ');}
function reportText(d){
  const lines=['정월재 궁합 리포트',`${d.a.person.name} × ${d.b.person.name}`,`관계 균형 점수: ${d.overall}/100`,'',`감정 호흡 ${d.metrics.emotion} · 대화 방식 ${d.metrics.communication} · 생활 리듬 ${d.metrics.lifestyle} · 갈등 회복 ${d.metrics.recovery}`,'',`잘 맞는 지점: ${d.element.label} — ${d.element.copy}`,`조율이 필요한 지점: ${d.branch.label} — ${d.branch.copy}`,'',totalSummary(d).replace(/<[^>]+>/g,' '),'','※ 점수는 관계의 좋고 나쁨을 확정하는 값이 아니라 명식 비교를 이해하기 쉽게 정리한 참고 지표입니다.'];
  return lines.join('\n');
}
function render(d){
  $('[data-person-a]').textContent=d.a.person.name;$('[data-person-b]').textContent=d.b.person.name;$('[data-overall-score]').textContent=d.overall;
  $('[data-summary]').textContent=`${d.a.person.name}님과 ${d.b.person.name}님의 사주·오행을 같은 기준으로 비교해 감정, 대화, 생활, 갈등 회복의 네 영역으로 정리했습니다.`;
  $('[data-meta]').innerHTML=`<span>${d.a.person.name} · ${d.a.person.city}</span><span>${d.b.person.name} · ${d.b.person.city}</span><span>${d.branch.label}</span>`;
  $('[data-score-title]').textContent=overallTitle(d.overall);
  $('[data-score-copy]').textContent=`네 항목의 평균과 일지 관계, 일간 오행의 연결 방식을 함께 반영한 참고 점수입니다. 가장 높은 항목은 ${Object.entries(d.metrics).sort((x,y)=>y[1]-x[1])[0][0]==='emotion'?'감정 호흡':Object.entries(d.metrics).sort((x,y)=>y[1]-x[1])[0][0]==='communication'?'대화 방식':Object.entries(d.metrics).sort((x,y)=>y[1]-x[1])[0][0]==='lifestyle'?'생활 리듬':'갈등 회복'}입니다.`;
  const metricNames={emotion:['감정 호흡','마음을 표현하고 받아들이는 방식'],communication:['대화 방식','설명과 반응의 속도'],lifestyle:['생활 리듬','연락·약속·일상의 템포'],recovery:['갈등 회복','부딪힌 뒤 다시 접점을 찾는 힘']};
  $('[data-metric-grid]').innerHTML=Object.entries(d.metrics).map(([key,score])=>`<article class="compatibility-metric"><span>${metricNames[key][0]}</span><strong>${score}</strong><p>${metricLabel(score)} · ${metricNames[key][1]}</p></article>`).join('');
  $('[data-person-grid]').innerHTML=personCard(d.a,'MY STYLE')+personCard(d.b,'PARTNER STYLE');
  $('[data-compare-grid]').innerHTML=compareCards(d);$('[data-advice]').innerHTML=advice(d);$('[data-total-summary]').innerHTML=totalSummary(d);
  $('[data-pillars]').innerHTML=`<div class="compatibility-pillar-box"><strong>${d.a.person.name}님의 기본 명식</strong><p>${pillarLine(d.a)}</p></div><div class="compatibility-pillar-box"><strong>${d.b.person.name}님의 기본 명식</strong><p>${pillarLine(d.b)}</p></div>`;
  $('[data-evidence]').innerHTML=`<p><strong>일간 오행</strong> 두 사람의 일간 오행 관계를 감정 표현과 기본 반응의 연결 방식에 반영했습니다.</p><p><strong>일지 관계</strong> 두 사람의 일지 사이 합·충·해·파 여부를 가까운 관계에서의 접점과 긴장 요소로 참고했습니다.</p><p><strong>오행 분포</strong> 목·화·토·금·수의 상대 분포를 각각 계산해 기본 리듬의 유사도와 서로 보완하는 정도를 비교했습니다.</p><p><strong>성별·지역</strong> 입력한 성별은 명식 계산에 전달하며, 태어난 지역은 결과의 대상 정보와 해석 맥락에 함께 기록합니다.</p><p><strong>해석 범위</strong> 이 결과는 특정 관계의 성공·이별·결혼 여부를 예언하지 않으며, 전통 명리학을 바탕으로 두 사람의 관계 방식을 비교한 콘텐츠입니다.</p>`;
}

try{resultData=calculate();render(resultData);}catch(error){
  root.innerHTML=`<div class="relationship-result-container"><section class="relationship-report"><p class="relationship-label">CALCULATION ERROR</p><h1 style="font-size:26px;margin:0 0 12px">궁합 분석을 완료하지 못했습니다.</h1><p style="color:#756b67;line-height:1.7">입력 정보를 다시 확인해주세요.</p><a href="./compatibility.html" class="relationship-button primary" style="display:inline-flex;align-items:center;text-decoration:none;margin-top:16px">입력 다시 하기</a></section></div>`;
  throw error;
}

const copyBtn=$('[data-copy]'),pdfBtn=$('[data-pdf]'),saveBtn=$('[data-save]'),actionStatus=$('[data-action-status]');
copyBtn?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(reportText(resultData));actionStatus.textContent='보고서용 텍스트를 복사했습니다.';}catch(e){actionStatus.textContent='복사하지 못했습니다. 브라우저 권한을 확인해주세요.';}});
pdfBtn?.addEventListener('click',()=>window.print());
onAuthStateChanged(auth,user=>{currentUser=user;if(saveBtn)saveBtn.textContent=!user?'로그인 후 저장':saved?'저장 완료':'마이페이지에 저장';});
saveBtn?.addEventListener('click',async()=>{
  if(saved){actionStatus.innerHTML='이미 저장된 분석입니다. <a href="./mypage.html">마이페이지에서 보기</a>';return;}
  if(!currentUser){location.href='./login.html?next=./compatibility-report.html';return;}
  saveBtn.disabled=true;saveBtn.textContent='저장 중…';
  try{
    const data={type:'compatibility',title:`${input.personA.name}님 × ${input.personB.name}님 궁합`,input,summary:`관계 균형 점수 ${resultData.overall}점 · ${overallTitle(resultData.overall)}`,overallScore:resultData.overall,metrics:resultData.metrics,reportText:reportText(resultData),createdAt:serverTimestamp()};
    const ref=await addDoc(collection(db,'users',currentUser.uid,'readings'),data);saved=true;saveBtn.textContent='저장 완료';actionStatus.innerHTML=`정월록과 마이페이지에 저장했습니다. <a href="./archive.html?reading=${encodeURIComponent(ref.id)}">저장한 분석 보기</a>`;
  }catch(e){saveBtn.disabled=false;saveBtn.textContent='마이페이지에 저장';actionStatus.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';}
});

requestAnimationFrame(()=>{document.querySelectorAll('.desktop-nav a[href="./compatibility.html"],.mobile-menu a[href="./compatibility.html"]').forEach(link=>link.setAttribute('aria-current','page'));});