import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const raw=sessionStorage.getItem('jungwoljae_fortune_input');
if(!raw){location.href='./fortune.html';throw new Error('missing fortune input');}
const input=JSON.parse(raw);
const root=document.querySelector('[data-fortune-result]');
const $=s=>root.querySelector(s);
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);const db=getFirestore(app);
let currentUser=null;let saved=false;let resultData=null;

const zodiacInfo={
  rat:{name:'쥐띠',branch:'자',hanja:'子'},ox:{name:'소띠',branch:'축',hanja:'丑'},tiger:{name:'호랑이띠',branch:'인',hanja:'寅'},rabbit:{name:'토끼띠',branch:'묘',hanja:'卯'},dragon:{name:'용띠',branch:'진',hanja:'辰'},snake:{name:'뱀띠',branch:'사',hanja:'巳'},horse:{name:'말띠',branch:'오',hanja:'午'},goat:{name:'양띠',branch:'미',hanja:'未'},monkey:{name:'원숭이띠',branch:'신',hanja:'申'},rooster:{name:'닭띠',branch:'유',hanja:'酉'},dog:{name:'개띠',branch:'술',hanja:'戌'},pig:{name:'돼지띠',branch:'해',hanja:'亥'}
};
const stems=['갑','을','병','정','무','기','경','신','임','계'];
const stemElement={갑:'wood',을:'wood',병:'fire',정:'fire',무:'earth',기:'earth',경:'metal',신:'metal',임:'water',계:'water'};
const elementKo={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};
const generate={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const control={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
const mod=(n,m)=>((n%m)+m)%m;
const birthStem=year=>stems[mod(Number(year)-4,10)];

const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
const hae=[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']];
const pa=[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']];
const samhap=[['신','자','진'],['해','묘','미'],['인','오','술'],['사','유','축']];
const hyeongGroups=[['인','사','신'],['축','미','술']];
const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));
const isHyeong=(a,b)=>a===b&&['진','오','유','해'].includes(a)||pairHas([['자','묘']],a,b)||hyeongGroups.some(g=>g.includes(a)&&g.includes(b));

function pillarString(v){if(typeof v==='string')return v;return v?.korean||v?.name||'';}
function calcToday(){
  const [y,m,d]=input.targetDate.split('-').map(Number);
  const r=calculateFourPillars({year:y,month:m,day:d,hour:12,minute:0,isLunar:false});
  const obj=typeof r?.toObject==='function'?r.toObject():r;
  const day=pillarString(obj?.day);
  if(!day||[...day].length<2)throw new Error('day pillar missing');
  return {dayPillar:day,dayStem:[...day][0],dayBranch:[...day][1]};
}
function branchRelation(my,today){
  if(pairHas(yukhap,my,today))return {key:'yukhap',label:'육합',delta:18,tone:'서로 맞물리는 흐름'};
  if(samhap.some(g=>g.includes(my)&&g.includes(today)))return {key:'samhap',label:'삼합 흐름',delta:12,tone:'연결이 자연스러운 흐름'};
  if(pairHas(chung,my,today))return {key:'chung',label:'충',delta:-18,tone:'속도와 방향이 부딪히기 쉬운 흐름'};
  if(isHyeong(my,today))return {key:'hyeong',label:'형',delta:-12,tone:'긴장과 반복을 점검할 흐름'};
  if(pairHas(hae,my,today))return {key:'hae',label:'해',delta:-10,tone:'말과 의도를 한 번 더 확인할 흐름'};
  if(pairHas(pa,my,today))return {key:'pa',label:'파',delta:-7,tone:'작은 어긋남을 정리할 흐름'};
  if(my===today)return {key:'same',label:'같은 지지',delta:5,tone:'익숙한 성향이 강해지는 흐름'};
  return {key:'neutral',label:'평이한 관계',delta:0,tone:'무리 없이 조율할 수 있는 흐름'};
}
function stemRelation(birth,today){
  const b=stemElement[birth],t=stemElement[today];
  if(b===t)return {label:`${elementKo[b]} 기운 동조`,delta:5,text:'내가 익숙하게 쓰는 방식과 오늘의 기운이 비슷해 평소 스타일이 잘 드러날 수 있습니다.'};
  if(generate[t]===b)return {label:`오늘이 ${elementKo[b]}을 돕는 흐름`,delta:8,text:'오늘의 기운이 내 연도 기운을 받쳐주는 쪽이라 준비해둔 일을 차분히 꺼내기 좋습니다.'};
  if(generate[b]===t)return {label:`내 기운이 오늘로 이어짐`,delta:3,text:'내가 가진 에너지를 밖으로 써야 하는 날입니다. 움직임은 생기지만 과하게 벌이지 않는 편이 좋습니다.'};
  if(control[t]===b)return {label:`오늘의 압력이 들어오는 흐름`,delta:-8,text:'오늘의 기운이 내 방식에 제동을 걸 수 있어, 빠른 결론보다 조건과 순서를 확인하는 편이 안정적입니다.'};
  if(control[b]===t)return {label:`내가 오늘을 제어하는 흐름`,delta:2,text:'내가 기준을 세우고 정리해야 하는 상황이 생기기 쉽습니다. 책임을 너무 많이 떠안지 않는 것이 중요합니다.'};
  return {label:'오행 관계 보통',delta:0,text:'특정 오행 관계가 강하게 밀거나 막는 날은 아닙니다.'};
}
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function headline(score){if(score>=70)return '오늘은 한 걸음 밀어도 좋은 날입니다.';if(score>=59)return '준비한 일은 조심스럽게 꺼내도 좋습니다.';if(score>=48)return '속도보다 균형을 잡으면 편한 날입니다.';if(score>=38)return '오늘은 결론보다 점검에 무게를 두세요.';return '큰 결론은 서두르지 않는 편이 좋습니다.';}
function signalNote(score){if(score>=59)return '좋은 흐름을 과하게 확대하지 말고, 이미 준비한 일을 실제 행동으로 옮기는 데 쓰는 편이 좋습니다.';if(score>=48)return '좋고 나쁨이 강하게 갈리는 날보다, 내 선택 방식에 따라 체감이 달라지는 날에 가깝습니다.';return '문제가 생긴다는 뜻은 아닙니다. 다만 오늘은 반응보다 확인, 확정보다 조율에 힘을 쓰는 편이 안정적입니다.';}
function calc(){
  const today=calcToday();const z=zodiacInfo[input.zodiac];const bStem=birthStem(input.birthYear);const br=branchRelation(z.branch,today.dayBranch);const sr=stemRelation(bStem,today.dayStem);const score=clamp(52+br.delta+sr.delta,22,82);
  return {today,z,birthStem:bStem,branchRel:br,stemRel:sr,score};
}
function relationText(d){return `${input.birthYear}년 ${d.z.name}의 지지 ${d.z.hanja}(${d.z.branch})와 오늘 일진의 지지 ${d.today.dayBranch} 사이에는 ‘${d.branchRel.label}’ 관계가 잡힙니다. ${d.branchRel.tone}으로 읽을 수 있고, 출생연도의 ${d.birthStem} 기운과 오늘의 ${d.today.dayStem} 기운은 ‘${d.stemRel.label}’ 관계입니다. ${d.stemRel.text}`;}
function areaCards(d){
  const push=d.score>=59, caution=d.score<48;
  return [
    ['01','일 · 학업',push?'미뤄둔 연락이나 이미 준비한 제안을 실제로 꺼내기 좋습니다. 새 일을 크게 벌이기보다 정리된 한 가지를 끝까지 가져가세요.':caution?'새로운 결론을 급히 만들기보다 누락된 조건과 순서를 확인하는 쪽이 낫습니다.':'큰 변화보다 진행 중인 일을 한 단계 정리하는 데 좋은 날입니다.',push?'진행':'점검'],
    ['02','재물 · 소비',caution?'운세만으로 투자나 큰 금액 결정을 판단하지 마세요. 오늘은 지출 기준과 숫자를 다시 확인하는 용도로 쓰는 편이 좋습니다.':'충동적인 선택보다 이미 계획한 범위 안에서 쓰고 정리하는 흐름이 안정적입니다. 투자 판단은 별도의 객관적 정보와 위험 검토를 기준으로 하세요.','기준'],
    ['03','사람 · 관계',d.branchRel.delta>8?'먼저 말을 건네거나 관계를 부드럽게 연결하기 좋은 편입니다. 다만 상대의 속도까지 내 흐름과 같다고 가정하지는 마세요.':d.branchRel.delta<-8?'감정적으로 결론을 내리기보다 상대의 말과 내 해석을 분리해서 보는 편이 좋습니다. 중요한 대화는 한 박자 늦춰도 괜찮습니다.':'관계를 확정짓기보다 필요한 말을 담백하게 전달하면 무리가 적습니다.',d.branchRel.delta>8?'연결':d.branchRel.delta<-8?'조율':'대화'],
    ['04','생활 리듬',push?'활동량을 조금 높여도 괜찮지만, 하루 후반까지 에너지를 남기는 편이 좋습니다.':'일정을 촘촘하게 채우기보다 중간에 생각을 정리할 여백을 두는 편이 좋습니다.','리듬']
  ];
}
function directQuestion(d){
  const q=(input.question||'').trim();const good=d.score>=59;const careful=d.score<48;
  if(/투자|주식|코인|매수|매도/.test(q))return '투자 여부는 오늘의 운세로 결정하지 않는 것이 맞습니다. 오늘은 숫자와 손실 가능성을 점검하는 날로만 활용하세요.';
  if(/계약|협상|제안|미팅|회의/.test(q))return good?'오늘 이야기를 꺼내는 쪽에 조금 더 무게가 있습니다. 다만 최종 확정 전 조건은 한 번 더 확인하세요.':careful?'오늘은 바로 확정하기보다 조건을 정리하고 다음 약속을 잡는 쪽이 더 낫습니다.':'진행해도 괜찮지만, 합의보다 조건 확인을 먼저 두는 편이 좋습니다.';
  if(/면접|발표|시험|지원/.test(q))return good?'준비한 것을 보여주는 쪽에 무게가 있습니다. 새로운 전략보다 이미 준비한 내용을 분명하게 전달하세요.':careful?'결과를 예측하기보다 실수 가능성을 줄이는 준비에 집중하는 편이 좋습니다.':'무리하게 분위기를 바꾸기보다 준비한 방식대로 차분하게 진행하세요.';
  if(/연락|고백|재회|연애|만나/.test(q))return d.branchRel.delta>8?'가볍게 대화를 시작하는 쪽에 무게가 있습니다. 상대의 답을 서두르게 하지는 마세요.':d.branchRel.delta<-8?'오늘은 관계를 단정짓기보다 감정을 정리한 뒤 말하는 편이 더 낫습니다.':'연락 자체는 괜찮지만 관계의 결론까지 한 번에 내리려 하지는 않는 편이 좋습니다.';
  if(/퇴사|이직|그만|옮길/.test(q))return good?'변화를 검토하는 힘은 올라오지만 오늘 바로 결론내기보다 다음 선택의 조건을 구체화하는 쪽이 좋습니다.': '오늘은 퇴사·이직 결론보다 현재 조건과 다음 선택의 기준을 적어보는 데 더 적합합니다.';
  if(/돈|구매|살까|지출/.test(q))return careful?'오늘은 큰 지출을 바로 확정하기보다 필요성과 가격을 한 번 더 비교하는 편이 낫습니다.':'계획한 범위라면 진행할 수 있지만 충동적인 추가 지출은 줄이는 편이 좋습니다.';
  if(/미래|앞으로|운명/.test(q))return '오늘 하루만 놓고 보면 미래를 단정하기보다, 지금 준비한 것을 어떻게 실행하고 조율하는지가 더 중요한 날입니다.';
  return good?'오늘은 생각만 이어가기보다 준비된 한 가지를 실제 행동으로 옮기는 쪽에 조금 더 무게가 있습니다.':careful?'오늘은 결론을 밀어붙이기보다 한 번 더 확인하고 조율하는 쪽이 더 안정적입니다.':'오늘은 크게 밀거나 멈추기보다, 진행 중인 일을 한 단계 정리하는 선택이 가장 무난합니다.';
}
function questionDetail(d){return `${d.z.name}와 오늘의 ${d.today.dayPillar} 일진 관계는 ${d.branchRel.label}, 출생연도 천간과 오늘 천간 관계는 ${d.stemRel.label}로 읽힙니다. 그래서 질문에 대한 답도 ‘무조건 된다/안 된다’보다 오늘 어느 행동 방식에 무게를 둘지로 정리했습니다. ${relationText(d)}`;}
function keyItems(d){return [
  ['01','오늘의 방향',d.score>=59?'준비한 것을 실제 행동으로':'점검과 조율을 먼저',d.score>=59?'새로운 일을 많이 만들기보다 이미 준비한 한 가지를 움직여보세요.':'반응하기 전에 조건과 순서를 한 번 더 확인하세요.'],
  ['02','관계 포인트',d.branchRel.label,d.branchRel.tone+'입니다. 상대의 속도를 확인하면서 말의 강도를 조절하세요.'],
  ['03','오늘의 기준',`${d.birthStem} × ${d.today.dayStem}`,d.stemRel.text]
];}
function reportText(d){
  const lines=[`정월재 오늘의 운세`,`대상: ${input.name}`,`날짜: ${input.targetDate}`,`기준: ${input.birthYear}년 · ${d.z.name}`,`오늘 일진: ${d.today.dayPillar}`,'',`오늘의 한줄 결론`,headline(d.score),signalNote(d.score),'',`오늘의 일진과 나의 띠`,relationText(d),'',`생활 영역`];
  areaCards(d).forEach(a=>lines.push(`${a[1]}: ${a[2]}`));
  if(input.question)lines.push('',`남겨주신 질문`,input.question,`정월재의 답: ${directQuestion(d)}`,questionDetail(d));
  lines.push('',`오늘 기억할 세 가지`);keyItems(d).forEach(k=>lines.push(`${k[1]}: ${k[2]} — ${k[3]}`));
  lines.push('','※ 오늘의 운세는 띠·출생연도와 당일 일진의 관계를 바탕으로 한 전통 명리 해석 콘텐츠이며 미래 결과를 보장하지 않습니다.');return lines.join('\n');
}
function render(d){
  $('[data-name]').textContent=input.name;$('[data-summary]').textContent=`${input.name}님의 ${d.z.name}와 ${input.targetDate}의 일진을 겹쳐 오늘 어떤 방식으로 움직일 때 흐름이 안정되는지 살펴봅니다.`;
  $('[data-meta]').innerHTML=`<span>${input.targetDate}</span><span>${input.birthYear}년</span><span>${d.z.name}</span><span>오늘 일진 ${d.today.dayPillar}</span>`;
  $('[data-headline]').textContent=headline(d.score);$('[data-signal-note]').textContent=signalNote(d.score);
  $('[data-relation-pills]').innerHTML=`<span>${d.z.hanja} ${d.z.name}</span><span>오늘 ${d.today.dayPillar}</span><span>${d.branchRel.label}</span><span>${d.stemRel.label}</span>`;$('[data-relation-text]').textContent=relationText(d);
  $('[data-area-grid]').innerHTML=areaCards(d).map(([n,t,p,b])=>`<article class="fortune-card"><span>${n}</span><h3>${t}</h3><p>${p}</p><strong>${b}</strong></article>`).join('');
  if(input.question){const sec=$('[data-question-section]');sec.hidden=false;$('[data-question]').textContent=input.question;$('[data-question-direct]').textContent=directQuestion(d);$('[data-question-detail]').textContent=questionDetail(d);}
  $('[data-key-grid]').innerHTML=keyItems(d).map(([n,t,v,p])=>`<article class="fortune-key"><span>${n} · ${t}</span><strong>${v}</strong><p>${p}</p></article>`).join('');
  $('[data-evidence]').innerHTML=`<p><strong>오늘 일진:</strong> ${d.today.dayPillar} — 양력 ${input.targetDate} 정오 기준으로 일주의 천간·지지를 계산했습니다.</p><p><strong>띠:</strong> ${d.z.hanja} ${d.z.name} — 사용자가 선택한 띠의 지지를 기준으로 오늘 지지와 육합·삼합·충·형·파·해 관계를 비교했습니다.</p><p><strong>출생연도:</strong> ${input.birthYear}년 ${d.birthStem} — 출생연도의 천간 오행과 오늘 일간의 오행 관계를 보조 기준으로 사용했습니다.</p><p><strong>범위:</strong> 오늘의 운세는 띠·출생연도 중심의 간단 일진 분석이며, 개인의 전체 사주팔자나 대운을 대신하지 않습니다.</p>`;
}

try{resultData=calc();render(resultData);}catch(e){root.innerHTML='<div class="fortune-result-container"><section class="fortune-report"><h1 style="font-size:26px">오늘의 운세를 계산하지 못했습니다.</h1><p>입력 정보를 다시 확인해주세요.</p><a href="./fortune.html">다시 입력하기</a></section></div>';throw e;}

const copyBtn=$('[data-copy]'),pdfBtn=$('[data-pdf]'),saveBtn=$('[data-save]'),actionStatus=$('[data-action-status]');
copyBtn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(reportText(resultData));actionStatus.textContent='보고서용 텍스트를 복사했습니다.';}catch(e){actionStatus.textContent='복사하지 못했습니다.';}});
pdfBtn.addEventListener('click',()=>window.print());
onAuthStateChanged(auth,user=>{currentUser=user;saveBtn.textContent=user?(saved?'저장 완료':'마이페이지에 저장'):'로그인 후 저장';});
saveBtn.addEventListener('click',async()=>{
  if(saved){actionStatus.textContent='이미 저장했습니다.';return;}
  if(!currentUser){location.href='./login.html?next=./fortune-result.html';return;}
  saveBtn.disabled=true;saveBtn.textContent='저장 중…';
  try{
    await addDoc(collection(db,'users',currentUser.uid,'readings'),{type:'fortune',title:`${input.name}님의 오늘의 운세`,targetDate:input.targetDate,birthYear:input.birthYear,zodiac:resultData.z.name,dayPillar:resultData.today.dayPillar,relation:resultData.branchRel.label,headline:headline(resultData.score),summary:relationText(resultData),question:input.question||'',questionDirect:input.question?directQuestion(resultData):'',questionDetail:input.question?questionDetail(resultData):'',reportText:reportText(resultData),createdAt:serverTimestamp()});
    saved=true;saveBtn.textContent='저장 완료';actionStatus.textContent='정월록과 마이페이지 분석 이력에 저장했습니다.';
  }catch(e){saveBtn.disabled=false;saveBtn.textContent='마이페이지에 저장';actionStatus.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';}
});
