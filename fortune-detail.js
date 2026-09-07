import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const raw=sessionStorage.getItem('jungwoljae_fortune_input');
if(!raw) throw new Error('missing fortune input');
const input=JSON.parse(raw);
const root=document.querySelector('[data-fortune-result]');
if(!root) throw new Error('fortune result root missing');
const $=s=>root.querySelector(s);

const zodiacInfo={
  rat:{name:'쥐띠',branch:'자',hanja:'子'},ox:{name:'소띠',branch:'축',hanja:'丑'},tiger:{name:'호랑이띠',branch:'인',hanja:'寅'},rabbit:{name:'토끼띠',branch:'묘',hanja:'卯'},dragon:{name:'용띠',branch:'진',hanja:'辰'},snake:{name:'뱀띠',branch:'사',hanja:'巳'},horse:{name:'말띠',branch:'오',hanja:'午'},goat:{name:'양띠',branch:'미',hanja:'未'},monkey:{name:'원숭이띠',branch:'신',hanja:'申'},rooster:{name:'닭띠',branch:'유',hanja:'酉'},dog:{name:'개띠',branch:'술',hanja:'戌'},pig:{name:'돼지띠',branch:'해',hanja:'亥'}
};
const stems=['갑','을','병','정','무','기','경','신','임','계'];
const stemElement={갑:'wood',을:'wood',병:'fire',정:'fire',무:'earth',기:'earth',경:'metal',신:'metal',임:'water',계:'water'};
const elementKo={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};
const generate={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const control={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
const hae=[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']];
const pa=[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']];
const samhap=[['신','자','진'],['해','묘','미'],['인','오','술'],['사','유','축']];
const hyeongGroups=[['인','사','신'],['축','미','술']];
const mod=(n,m)=>((n%m)+m)%m;
const birthStem=year=>stems[mod(Number(year)-4,10)];
const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));
const isHyeong=(a,b)=>(a===b&&['진','오','유','해'].includes(a))||pairHas([['자','묘']],a,b)||hyeongGroups.some(g=>g.includes(a)&&g.includes(b));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

function pillarString(v){return typeof v==='string'?v:(v?.korean||v?.name||'');}
function dayPillar(){
  const [year,month,day]=input.targetDate.split('-').map(Number);
  const result=calculateFourPillars({year,month,day,hour:12,minute:0,isLunar:false});
  const obj=typeof result?.toObject==='function'?result.toObject():result;
  const value=pillarString(obj?.day);
  return {pillar:value,stem:[...value][0],branch:[...value][1]};
}
function branchRelation(my,today){
  if(pairHas(yukhap,my,today))return {key:'yukhap',label:'육합',delta:18};
  if(samhap.some(g=>g.includes(my)&&g.includes(today)))return {key:'samhap',label:'삼합 흐름',delta:12};
  if(pairHas(chung,my,today))return {key:'chung',label:'충',delta:-18};
  if(isHyeong(my,today))return {key:'hyeong',label:'형',delta:-12};
  if(pairHas(hae,my,today))return {key:'hae',label:'해',delta:-10};
  if(pairHas(pa,my,today))return {key:'pa',label:'파',delta:-7};
  if(my===today)return {key:'same',label:'같은 지지',delta:5};
  return {key:'neutral',label:'평이한 관계',delta:0};
}
function stemDelta(birth,today){
  const b=stemElement[birth],t=stemElement[today];
  if(b===t)return 5;
  if(generate[t]===b)return 8;
  if(generate[b]===t)return 3;
  if(control[t]===b)return -8;
  if(control[b]===t)return 2;
  return 0;
}
function calc(){
  const today=dayPillar();
  const zodiac=zodiacInfo[input.zodiac];
  const bStem=birthStem(input.birthYear);
  const br=branchRelation(zodiac.branch,today.branch);
  const score=clamp(52+br.delta+stemDelta(bStem,today.stem),22,82);
  return {today,zodiac,birthStem:bStem,branchRel:br,score};
}
const data=calc();
const positive=data.score>=59;
const caution=data.score<48;
const neutral=!positive&&!caution;

function story(){
  const first=positive
    ?`${input.name}님에게 오늘은 멈춰 있기보다 이미 준비해둔 일을 한 단계 앞으로 옮길 때 흐름을 잘 쓰기 쉬운 날입니다. 다만 운이 좋다는 이유로 일을 한꺼번에 늘리기보다, 우선순위가 분명한 한 가지를 실제 행동으로 연결하는 편이 좋습니다.`
    :caution
      ?`${input.name}님에게 오늘은 속도보다 확인이 더 중요한 날입니다. 일이 막힌다기보다 평소보다 작은 어긋남이나 누락이 눈에 띄기 쉬운 흐름이므로, 새로운 결론을 급히 내리기보다 이미 진행 중인 일의 조건과 순서를 다시 살펴보는 편이 안정적입니다.`
      :`${input.name}님에게 오늘은 강하게 밀거나 크게 멈추는 날이라기보다, 선택 방식에 따라 체감이 달라지는 날에 가깝습니다. 큰 변화보다는 이미 진행 중인 일을 정리하고, 필요한 대화와 판단을 차분하게 이어갈 때 흐름을 편하게 쓸 수 있습니다.`;
  const second=data.branchRel.delta>8
    ?`띠의 관계에서는 ${data.branchRel.label}이 잡혀 사람이나 상황과 연결되는 힘이 비교적 자연스럽습니다. 먼저 연락하거나 협업의 물꼬를 트는 일에는 도움이 될 수 있지만, 상대 역시 나와 같은 속도로 움직일 것이라고 기대하면 오히려 피로가 생길 수 있습니다.`
    :data.branchRel.delta<-8
      ?`띠의 관계에서는 ${data.branchRel.label}이 잡혀 내가 생각한 방향과 외부의 반응이 조금 다르게 느껴질 수 있습니다. 이런 날은 상대의 말, 일정 변화, 예상 밖 요청에 바로 반응하기보다 한 번 정리해서 답하는 것이 좋습니다.`
      :`띠의 관계는 과하게 밀거나 부딪히는 쪽이 아니어서, 오늘의 결과는 운 자체보다 내가 어떤 태도로 하루를 쓰는지에 더 좌우될 수 있습니다. 익숙한 방식대로 움직이되 중요한 선택에는 한 번의 확인 절차를 넣어보세요.`;
  const third=`출생연도의 천간 ${data.birthStem}과 오늘 일간 ${data.today.stem}의 관계까지 함께 보면, 오늘은 ‘무엇이 생길까’를 기다리는 것보다 내 쪽에서 어떤 기준을 세우고 행동할지를 정하는 편이 더 의미 있습니다. 정월재의 오늘 운세는 사건을 단정하기보다, 하루를 덜 흔들리게 쓰는 기준을 제안합니다.`;
  return [first,second,third];
}
function timeFlow(){
  if(positive)return [
    ['오전','시작과 정리','가장 중요한 일을 하루 초반에 먼저 꺼내보세요. 연락, 제안, 일정 확정처럼 미뤄둔 일을 실제 행동으로 옮기기 좋습니다.'],
    ['오후','연결과 실행','사람과의 소통이나 협업은 오후에 한 번 더 힘을 받을 수 있습니다. 다만 약속과 조건은 말로만 두지 말고 기록으로 남겨두세요.'],
    ['저녁','속도 조절','낮에 에너지를 많이 썼다면 저녁에는 새로운 일을 추가하기보다 오늘 진행한 일을 정리하는 편이 좋습니다. 내일의 첫 할 일 하나만 정해두세요.']
  ];
  if(caution)return [
    ['오전','점검과 준비','바로 결론을 내리기보다 일정, 숫자, 약속을 먼저 확인하세요. 오전의 작은 점검이 오후의 불필요한 수정 시간을 줄여줍니다.'],
    ['오후','반응보다 조율','예상과 다른 요청이나 대화가 들어와도 즉시 답을 확정하지 않아도 됩니다. 중요한 내용은 한 번 정리해서 전달하세요.'],
    ['저녁','정리와 회복','하루가 예상보다 복잡했다면 해결되지 않은 일을 억지로 끝내려 하지 마세요. 내일 이어갈 것과 오늘 끝낼 것을 분리하는 편이 좋습니다.']
  ];
  return [
    ['오전','우선순위 정하기','해야 할 일을 늘리기보다 가장 먼저 끝낼 한 가지를 정하세요. 시작이 분명하면 하루 전체가 훨씬 가볍습니다.'],
    ['오후','진행 중인 일 정리','새로운 일보다 이미 시작한 일을 한 단계 마무리하는 데 힘을 써보세요. 대화는 짧고 분명하게 하는 편이 좋습니다.'],
    ['저녁','다음 날 연결','오늘 있었던 일 중 반복해서 신경 쓰인 한 가지를 기록해보세요. 내일 결정할 것과 오늘 내려놓을 것을 나누면 좋습니다.']
  ];
}
function doDont(){
  if(positive)return {
    dos:['준비해둔 일 한 가지를 실제로 시작하기','미뤄둔 연락이나 제안을 가볍게 꺼내기','오늘 해야 할 일의 우선순위를 끝까지 유지하기'],
    donts:['좋은 흐름을 믿고 일을 한꺼번에 늘리기','상대도 나와 같은 속도라고 단정하기','기분이 좋다는 이유로 계획 밖 지출을 크게 늘리기']
  };
  if(caution)return {
    dos:['숫자·조건·약속을 한 번 더 확인하기','중요한 답변은 잠깐 시간을 두고 보내기','오늘 끝낼 일과 미룰 일을 명확히 나누기'],
    donts:['감정이 올라온 순간 바로 결론 내리기','일정이나 계약을 확인 없이 확정하기','피로한 상태에서 큰 소비나 중요한 결정을 밀어붙이기']
  };
  return {
    dos:['진행 중인 일 하나를 확실히 마무리하기','필요한 말은 짧고 분명하게 전달하기','하루 중간에 우선순위를 한 번 다시 확인하기'],
    donts:['특별한 이유 없이 계획을 계속 바꾸기','애매한 일을 오래 붙잡고 생각만 늘리기','작은 변수에 하루 전체의 의미를 크게 부여하기']
  };
}
function totalSummary(){
  const mode=positive?'움직임을 살려도 좋은 날':caution?'점검과 조율이 필요한 날':'균형과 정리가 중요한 날';
  const work=positive?'준비한 일은 실제 행동으로 옮기되 범위를 넓히지 않는 것이 좋습니다.':caution?'새로운 결론보다 조건과 순서를 다시 확인하는 편이 좋습니다.':'진행 중인 일을 한 단계 마무리하는 데 초점을 두세요.';
  const relation=data.branchRel.delta>8?'관계에서는 먼저 말을 건네는 쪽이 자연스럽지만 상대의 속도를 존중하세요.':data.branchRel.delta<-8?'관계에서는 즉각적인 반응보다 말의 의미를 한 번 더 확인하는 편이 좋습니다.':'관계는 크게 흔들리는 날이 아니므로 필요한 말을 담백하게 전하세요.';
  return [`오늘을 한 문장으로 정리하면 <strong>${mode}</strong>입니다.`,work,relation,`오늘의 운세는 좋고 나쁨을 단정하기보다 하루의 사용법을 보여주는 참고 기준입니다. 중요한 결정은 현실적인 정보와 조건을 함께 확인하고, 운세는 내 선택의 속도와 태도를 조율하는 데 활용해보세요.`];
}

const storyEl=$('[data-fortune-story]');
if(storyEl)storyEl.innerHTML=story().map(p=>`<p>${p}</p>`).join('');
const timeEl=$('[data-time-grid]');
if(timeEl)timeEl.innerHTML=timeFlow().map(([time,title,text])=>`<article class="fortune-time-card"><span>${time}</span><strong>${title}</strong><p>${text}</p></article>`).join('');
const dd=doDont();
const doEl=$('[data-do-list]'),dontEl=$('[data-dont-list]');
if(doEl)doEl.innerHTML=dd.dos.map(x=>`<li>${x}</li>`).join('');
if(dontEl)dontEl.innerHTML=dd.donts.map(x=>`<li>${x}</li>`).join('');
const totalEl=$('[data-total-summary]');
if(totalEl)totalEl.innerHTML=totalSummary().map(p=>`<p>${p}</p>`).join('');

function enhancedReportText(){
  const lines=[];
  lines.push('정월재 오늘의 운세',`대상: ${input.name}`,`출생연도: ${input.birthYear}년 · ${data.zodiac.name}`,`기준일: ${input.targetDate} · 오늘 일진 ${data.today.pillar}`,'');
  lines.push('오늘의 흐름');story().forEach(p=>lines.push(p));lines.push('');
  lines.push('분야별 오늘 운세');
  root.querySelectorAll('[data-area-grid] .fortune-card').forEach(card=>lines.push(`${card.querySelector('h3')?.textContent||''}: ${card.querySelector('p')?.textContent||''}`));
  lines.push('','시간대별 흐름');timeFlow().forEach(([time,title,text])=>lines.push(`${time} · ${title}: ${text}`));
  lines.push('','오늘 잘 맞는 행동');dd.dos.forEach(x=>lines.push(`- ${x}`));
  lines.push('','오늘 줄이면 좋은 행동');dd.donts.forEach(x=>lines.push(`- ${x}`));
  lines.push('','정월재가 드리는 오늘 하루의 팁');
  root.querySelectorAll('[data-tip-grid] .fortune-tip-card').forEach(card=>lines.push(`${card.querySelector('strong')?.textContent||''}: ${card.querySelector('p')?.textContent||''}`));
  lines.push('','오늘 하루 총 요약');totalSummary().forEach(p=>lines.push(p.replace(/<[^>]+>/g,'')));
  return lines.join('\n');
}

const copyBtn=$('[data-copy]');
copyBtn?.addEventListener('click',async event=>{
  event.preventDefault();
  event.stopImmediatePropagation();
  const status=$('[data-action-status]');
  try{await navigator.clipboard.writeText(enhancedReportText());if(status)status.textContent='확장된 오늘의 운세 보고서 텍스트를 복사했습니다.';}
  catch(e){if(status)status.textContent='복사하지 못했습니다. 브라우저 권한을 확인해주세요.';}
},true);

const saveBtn=$('[data-save]');
saveBtn?.addEventListener('click',async event=>{
  event.preventDefault();
  event.stopImmediatePropagation();
  const auth=getAuth(getApps().length?getApp():initializeApp(firebaseConfig));
  const user=auth.currentUser;
  const status=$('[data-action-status]');
  if(!user){location.href='./login.html?next=./fortune-result.html';return;}
  if(saveBtn.dataset.enhancedSaved==='true'){if(status)status.textContent='이미 마이페이지에 저장했습니다.';return;}
  saveBtn.disabled=true;saveBtn.textContent='저장 중…';
  try{
    const db=getFirestore(getApp());
    const ref=await addDoc(collection(db,'users',user.uid,'readings'),{
      type:'fortune',title:`${input.name}님의 오늘의 운세`,input,summary:totalSummary().map(x=>x.replace(/<[^>]+>/g,'')).join(' '),dailyStory:story(),timeFlow:timeFlow(),doList:dd.dos,dontList:dd.donts,reportText:enhancedReportText(),createdAt:serverTimestamp()
    });
    saveBtn.dataset.enhancedSaved='true';saveBtn.disabled=false;saveBtn.textContent='저장 완료';
    if(status)status.innerHTML=`정월록과 마이페이지에 저장했습니다. <a href="./archive.html?reading=${encodeURIComponent(ref.id)}">저장한 운세 보기</a>`;
  }catch(e){saveBtn.disabled=false;saveBtn.textContent='마이페이지에 저장';if(status)status.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';}
},true);
