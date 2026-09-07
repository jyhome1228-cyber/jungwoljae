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
const auth=getAuth(app);
const db=getFirestore(app);
let currentUser=null;
let saved=false;
let resultData=null;

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
const isHyeong=(a,b)=>(a===b&&['진','오','유','해'].includes(a))||pairHas([['자','묘']],a,b)||hyeongGroups.some(g=>g.includes(a)&&g.includes(b));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

function pillarString(v){return typeof v==='string'?v:(v?.korean||v?.name||'');}
function calcToday(){
  const [year,month,day]=input.targetDate.split('-').map(Number);
  const result=calculateFourPillars({year,month,day,hour:12,minute:0,isLunar:false});
  const obj=typeof result?.toObject==='function'?result.toObject():result;
  const dayPillar=pillarString(obj?.day);
  if(!dayPillar||[...dayPillar].length<2)throw new Error('day pillar missing');
  return {dayPillar,dayStem:[...dayPillar][0],dayBranch:[...dayPillar][1]};
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
  if(generate[b]===t)return {label:'내 기운이 오늘로 이어짐',delta:3,text:'내가 가진 에너지를 밖으로 써야 하는 날입니다. 움직임은 생기지만 과하게 벌이지 않는 편이 좋습니다.'};
  if(control[t]===b)return {label:'오늘의 압력이 들어오는 흐름',delta:-8,text:'오늘의 기운이 내 방식에 제동을 걸 수 있어 빠른 결론보다 조건과 순서를 확인하는 편이 안정적입니다.'};
  if(control[b]===t)return {label:'내가 오늘을 제어하는 흐름',delta:2,text:'내가 기준을 세우고 정리해야 하는 상황이 생기기 쉽습니다. 책임을 너무 많이 떠안지 않는 것이 중요합니다.'};
  return {label:'오행 관계 보통',delta:0,text:'특정 오행 관계가 강하게 밀거나 막는 날은 아닙니다.'};
}
function headline(score){
  if(score>=70)return '오늘은 한 걸음 밀어도 좋은 날입니다.';
  if(score>=59)return '준비한 일은 조심스럽게 꺼내도 좋습니다.';
  if(score>=48)return '속도보다 균형을 잡으면 편한 날입니다.';
  if(score>=38)return '오늘은 결론보다 점검에 무게를 두세요.';
  return '큰 결론은 서두르지 않는 편이 좋습니다.';
}
function signalNote(score){
  if(score>=59)return '좋은 흐름을 과하게 확대하지 말고 이미 준비한 일을 실제 행동으로 옮기는 데 쓰는 편이 좋습니다.';
  if(score>=48)return '좋고 나쁨이 강하게 갈리는 날보다 내 선택 방식에 따라 체감이 달라지는 날에 가깝습니다.';
  return '문제가 생긴다는 뜻은 아닙니다. 오늘은 반응보다 확인, 확정보다 조율에 힘을 쓰는 편이 안정적입니다.';
}
function calc(){
  const today=calcToday();
  const z=zodiacInfo[input.zodiac];
  const bStem=birthStem(input.birthYear);
  const br=branchRelation(z.branch,today.dayBranch);
  const sr=stemRelation(bStem,today.dayStem);
  const score=clamp(52+br.delta+sr.delta,22,82);
  return {today,z,birthStem:bStem,branchRel:br,stemRel:sr,score};
}
function relationText(d){
  return `${input.birthYear}년 ${d.z.name}의 지지 ${d.z.hanja}(${d.z.branch})와 오늘 일진의 지지 ${d.today.dayBranch} 사이에는 ‘${d.branchRel.label}’ 관계가 잡힙니다. ${d.branchRel.tone}으로 읽을 수 있고, 출생연도의 ${d.birthStem} 기운과 오늘의 ${d.today.dayStem} 기운은 ‘${d.stemRel.label}’ 관계입니다. ${d.stemRel.text}`;
}
function areaCards(d){
  const push=d.score>=59,caution=d.score<48;
  return [
    ['01','일 · 학업',push?'미뤄둔 연락이나 이미 준비한 제안을 실제로 꺼내기 좋습니다. 새 일을 크게 벌이기보다 정리된 한 가지를 끝까지 가져가세요.':caution?'새로운 결론을 급히 만들기보다 누락된 조건과 순서를 확인하는 쪽이 낫습니다.':'큰 변화보다 진행 중인 일을 한 단계 정리하는 데 좋은 날입니다.',push?'진행':caution?'점검':'정리'],
    ['02','재물 · 소비',caution?'큰 금액 판단보다 지출 기준과 숫자를 다시 확인하는 데 힘을 쓰세요.':'충동적인 선택보다 이미 계획한 범위 안에서 쓰고 정리하는 흐름이 안정적입니다.','기준'],
    ['03','사람 · 관계',d.branchRel.delta>8?'먼저 말을 건네거나 관계를 부드럽게 연결하기 좋은 편입니다. 다만 상대의 속도까지 내 흐름과 같다고 가정하지는 마세요.':d.branchRel.delta<-8?'감정적으로 결론을 내리기보다 상대의 말과 내 해석을 분리해서 보는 편이 좋습니다. 중요한 대화는 한 박자 늦춰도 괜찮습니다.':'관계를 확정짓기보다 필요한 말을 담백하게 전달하면 무리가 적습니다.',d.branchRel.delta>8?'연결':d.branchRel.delta<-8?'조율':'대화'],
    ['04','생활 리듬',push?'활동량을 조금 높여도 괜찮지만 하루 후반까지 에너지를 남기는 편이 좋습니다.':'일정을 촘촘하게 채우기보다 중간에 생각을 정리할 여백을 두는 편이 좋습니다.','리듬']
  ];
}
function keyPoints(d){
  const mode=d.score>=59?'움직임':d.score<48?'점검':'균형';
  return [
    ['01','오늘의 중심',mode,headline(d.score)],
    ['02','띠의 관계',d.branchRel.label,d.branchRel.tone],
    ['03','오늘의 기준',d.score>=59?'준비한 것을 실행':d.score<48?'조건을 다시 확인':'진행 중인 일을 정리',signalNote(d.score)]
  ];
}
function dailyTips(d){
  const good=d.score>=59;
  const careful=d.score<48;
  const relationship=d.branchRel.delta>8
    ?'미뤄둔 연락이 있다면 먼저 가볍게 말을 건네보세요. 상대의 답을 재촉하지 않는 것이 포인트입니다.'
    :d.branchRel.delta<-8
      ?'중요한 대화는 바로 결론 내리지 말고 상대의 말과 내 해석을 한 번 분리해서 보세요.'
      :'필요한 말은 짧고 분명하게 전하되 관계의 의미를 과하게 해석하지 않는 편이 좋습니다.';
  return [
    ['01','먼저 할 일',good?'오전이나 하루 초반에 가장 중요한 한 가지를 먼저 끝내세요. 준비한 일은 오늘 실제 행동으로 옮기는 편이 좋습니다.':careful?'새 일을 시작하기 전에 오늘 해야 할 일의 순서를 다시 적어보세요. 빠른 실행보다 누락을 줄이는 것이 우선입니다.':'해야 할 일을 늘리기보다 이미 진행 중인 일 하나를 정리해서 마무리하세요.'],
    ['02','사람과 대화',relationship],
    ['03','돈과 생활',careful?'즉흥적인 결제나 큰 금액 결정은 하루 미뤄도 좋습니다. 숫자와 조건을 기록으로 다시 확인하세요.':'오늘 쓸 돈과 미뤄도 되는 지출을 나눠두세요. 감각보다 정해둔 범위 안에서 움직이는 편이 편합니다.']
  ];
}
function finalTip(d){
  if(d.score>=70)return '오늘은 준비한 것을 실제로 꺼내는 날로 써보세요. 단, 한 번에 여러 일을 벌이기보다 가장 중요한 한 가지에 힘을 모으는 편이 좋습니다.';
  if(d.score>=59)return '조심스럽게 움직여도 괜찮은 날입니다. 미뤄둔 한 가지를 실행하고, 하루 끝에는 내일 이어갈 일을 짧게 기록해두세요.';
  if(d.score>=48)return '오늘은 속도를 높이기보다 리듬을 정리하는 편이 좋습니다. 중요한 일 하나를 마무리하고 나머지는 순서를 정해두세요.';
  return '오늘은 크게 바꾸기보다 점검하고 정리하는 날로 쓰세요. 중요한 답변과 결제, 약속은 한 번 더 확인한 뒤 결정하는 편이 좋습니다.';
}
function evidence(d){
  return `<p><strong>오늘 일진</strong> ${d.today.dayPillar}의 일진을 기준으로 오늘 지지와 사용자의 띠 지지를 비교했습니다.</p><p><strong>띠 관계</strong> 육합·삼합·충·형·파·해와 동일 지지 여부를 오늘 흐름의 주요 관계로 사용했습니다.</p><p><strong>출생연도</strong> ${input.birthYear}년의 천간 ${d.birthStem}과 오늘 일간 ${d.today.dayStem}의 오행 관계를 보조 기준으로 함께 반영했습니다.</p><p><strong>해석 범위</strong> 오늘의 운세는 하루의 선택 방식과 생활 리듬을 위한 참고 해석이며 특정 사건의 발생이나 결과를 보장하지 않습니다.</p>`;
}
function reportText(d){
  const lines=['정월재 오늘의 운세',`대상: ${input.name}`,`기준일: ${input.targetDate}`,`출생연도/띠: ${input.birthYear}년 · ${d.z.name}`,'',`오늘의 한줄 결론: ${headline(d.score)}`,signalNote(d.score),'','오늘 일진과 나의 띠',relationText(d),'','영역별 흐름'];
  areaCards(d).forEach(x=>lines.push(`${x[1]}: ${x[2]}`));
  lines.push('','오늘 기억할 세 가지');keyPoints(d).forEach(x=>lines.push(`${x[1]}: ${x[2]} — ${x[3]}`));
  lines.push('','정월재가 드리는 오늘 하루의 팁');dailyTips(d).forEach(x=>lines.push(`${x[1]}: ${x[2]}`));
  lines.push('',`오늘의 마무리: ${finalTip(d)}`,'','※ 본 내용은 전통 명리학을 바탕으로 한 해석 콘텐츠이며 미래의 특정 결과를 보장하지 않습니다.');
  return lines.join('\n');
}
function render(d){
  $('[data-name]').textContent=input.name;
  $('[data-summary]').textContent=`${input.name}님은 ${d.z.name}이며 오늘 일진 ${d.today.dayPillar}과의 관계는 ‘${d.branchRel.label}’로 읽힙니다. 오늘은 길흉을 단정하기보다 ${headline(d.score).replace('오늘은 ','').replace('오늘 ','')}라는 방향으로 하루를 쓰는 편이 좋습니다.`;
  $('[data-meta]').innerHTML=`<span>${input.targetDate}</span><span>${input.birthYear}년</span><span>${d.z.hanja} ${d.z.name}</span><span>오늘 일진 ${d.today.dayPillar}</span>`;
  $('[data-headline]').textContent=headline(d.score);
  $('[data-signal-note]').textContent=signalNote(d.score);
  $('[data-relation-pills]').innerHTML=`<span>${d.z.hanja} ${d.z.name}</span><span>${d.branchRel.label}</span><span>${d.birthStem} × ${d.today.dayStem}</span>`;
  $('[data-relation-text]').textContent=relationText(d);
  $('[data-area-grid]').innerHTML=areaCards(d).map(([n,t,p,b])=>`<article class="fortune-card"><span>${n}</span><h3>${t}</h3><p>${p}</p><strong>${b}</strong></article>`).join('');
  $('[data-key-grid]').innerHTML=keyPoints(d).map(([n,l,v,p])=>`<article class="fortune-key"><span>${n} · ${l}</span><strong>${v}</strong><p>${p}</p></article>`).join('');
  $('[data-tip-grid]').innerHTML=dailyTips(d).map(([n,t,p])=>`<article class="fortune-tip-card"><span>${n}</span><h3>${t}</h3><p>${p}</p></article>`).join('');
  $('[data-tip-final]').textContent=finalTip(d);
  $('[data-evidence]').innerHTML=evidence(d);
}

try{resultData=calc();render(resultData);}catch(error){
  root.innerHTML=`<div class="fortune-result-container"><section class="fortune-report"><p class="fortune-label">CALCULATION ERROR</p><h1 style="font-size:26px;margin:0 0 12px">오늘의 운세를 계산하지 못했습니다.</h1><p style="color:#756b67;line-height:1.7">입력 정보를 다시 확인해주세요.</p><a href="./fortune.html" class="fortune-button primary" style="display:inline-flex;align-items:center;text-decoration:none;margin-top:16px">입력 다시 하기</a></section></div>`;
  throw error;
}

const copyBtn=$('[data-copy]');
const pdfBtn=$('[data-pdf]');
const saveBtn=$('[data-save]');
const actionStatus=$('[data-action-status]');
copyBtn.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(reportText(resultData));actionStatus.textContent='보고서용 텍스트를 복사했습니다.';}
  catch(e){actionStatus.textContent='복사하지 못했습니다. 브라우저 권한을 확인해주세요.';}
});
pdfBtn.addEventListener('click',()=>window.print());

onAuthStateChanged(auth,user=>{
  currentUser=user;
  saveBtn.textContent=!user?'로그인 후 저장':saved?'저장 완료':'마이페이지에 저장';
});
saveBtn.addEventListener('click',async()=>{
  if(saved){actionStatus.innerHTML='이미 저장된 오늘의 운세입니다. <a href="./mypage.html">마이페이지에서 보기</a>';return;}
  if(!currentUser){location.href='./login.html?next=./fortune-result.html';return;}
  saveBtn.disabled=true;
  saveBtn.textContent='저장 중…';
  try{
    const data={
      type:'fortune',
      title:`${input.name}님의 오늘의 운세`,
      input,
      summary:headline(resultData.score),
      targetDate:input.targetDate,
      zodiac:resultData.z.name,
      dayPillar:resultData.today.dayPillar,
      branchRelation:resultData.branchRel.label,
      score:resultData.score,
      tips:dailyTips(resultData).map(x=>({title:x[1],text:x[2]})),
      finalTip:finalTip(resultData),
      reportText:reportText(resultData),
      createdAt:serverTimestamp()
    };
    const ref=await addDoc(collection(db,'users',currentUser.uid,'readings'),data);
    saved=true;
    saveBtn.textContent='저장 완료';
    actionStatus.innerHTML=`정월록과 마이페이지에 저장했습니다. <a href="./archive.html?reading=${encodeURIComponent(ref.id)}">저장한 운세 보기</a>`;
  }catch(e){
    saveBtn.disabled=false;
    saveBtn.textContent='마이페이지에 저장';
    actionStatus.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';
  }
});
