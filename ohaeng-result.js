import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const inputRaw=sessionStorage.getItem('jungwoljae_ohaeng_input');
if(!inputRaw){location.href='./ohaeng.html';throw new Error('missing input');}
const input=JSON.parse(inputRaw);
const root=document.querySelector('[data-ohaeng-result]');
const $=(s)=>root.querySelector(s);
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
let currentUser=null;
let reportData=null;
let saved=false;

const elementInfo={
  wood:{key:'목',hanja:'木',name:'목',keywords:'확장 · 시작 · 방향',base:'새로운 방향을 만들고 자라나게 하는 힘입니다.',strong:'새로운 일을 시작하고 방향을 잡는 과정에서 힘이 잘 붙는 편입니다. 다만 너무 앞서가면 시작에 비해 정리와 마무리가 늦어질 수 있습니다.',weak:'새로운 방향을 잡거나 먼저 움직이는 일에 에너지가 더 필요할 수 있습니다. 작은 시작을 분명하게 정하고 반복 가능한 방식으로 이어가는 것이 도움이 됩니다.'},
  fire:{key:'화',hanja:'火',name:'화',keywords:'표현 · 활동 · 확산',base:'안에 있는 것을 밖으로 드러내고 움직이게 하는 힘입니다.',strong:'표현과 실행, 사람들과 에너지를 주고받는 과정에서 힘이 올라오기 쉽습니다. 과해지면 속도가 빨라져 충분히 살피기 전에 반응할 수 있습니다.',weak:'감정이나 생각을 밖으로 표현하는 데 시간이 걸릴 수 있습니다. 중요한 순간에는 의식적으로 말과 행동의 타이밍을 만들어주는 편이 좋습니다.'},
  earth:{key:'토',hanja:'土',name:'토',keywords:'안정 · 조율 · 축적',base:'흩어진 것을 받아들이고 안정된 구조로 묶는 힘입니다.',strong:'중간을 잡고 상황을 안정시키며 반복 가능한 구조를 만드는 힘이 비교적 자연스럽습니다. 과해지면 익숙한 방식을 오래 붙잡거나 변화가 늦어질 수 있습니다.',weak:'유지와 관리, 반복적인 축적 과정에서 피로를 느끼기 쉽습니다. 시작보다 유지할 구조를 먼저 정해두는 것이 균형을 잡는 데 유리합니다.'},
  metal:{key:'금',hanja:'金',name:'금',keywords:'판단 · 정리 · 기준',base:'구분하고 판단하며 불필요한 것을 덜어내는 힘입니다.',strong:'기준을 세우고 판단하거나 복잡한 것을 정리하는 힘이 분명하게 나타날 수 있습니다. 과해지면 스스로와 타인에게 기준이 지나치게 엄격해질 수 있습니다.',weak:'선택지를 줄이고 선을 긋는 과정이 늦어질 수 있습니다. 결정을 내려야 할 때 무엇을 하지 않을지 함께 정하는 방식이 도움이 됩니다.'},
  water:{key:'수',hanja:'水',name:'수',keywords:'관찰 · 유연 · 저장',base:'흐름을 읽고 멈춰서 관찰하며 정보를 축적하는 힘입니다.',strong:'상황을 오래 관찰하고 여러 가능성을 비교하며 유연하게 움직이는 힘이 잘 쓰입니다. 과해지면 생각이 길어져 실행 시점을 놓칠 수 있습니다.',weak:'충분히 살핀 뒤 움직이기보다 먼저 실행하는 쪽이 편할 수 있습니다. 기록하고 한 번 더 검토하는 시간을 의도적으로 두는 것이 균형에 도움이 됩니다.'}
};

const guidanceByElement={
  wood:{action:'새로운 방향 하나를 정하고 작은 시작을 실제 일정으로 옮기는 것',caution:'시작만 늘리기보다 무엇을 키울지 한 방향을 정하는 것'},
  fire:{action:'생각을 밖으로 표현하고 실행 시점을 분명하게 정하는 것',caution:'감정과 속도에 밀려 너무 빨리 결정하지 않는 것'},
  earth:{action:'유지할 수 있는 구조와 반복 루틴을 먼저 만드는 것',caution:'익숙함만 지키다가 변화 시점을 놓치지 않는 것'},
  metal:{action:'선택지를 줄이고 우선순위와 중단 기준을 명확하게 정하는 것',caution:'완벽한 기준을 만들 때까지 결정을 미루지 않는 것'},
  water:{action:'정보를 충분히 모으고 기록한 뒤 한 번 더 검토하는 것',caution:'생각을 너무 오래 끌지 않도록 실행 날짜를 정하는 것'}
};

const stemMap={갑:'wood',을:'wood',병:'fire',정:'fire',무:'earth',기:'earth',경:'metal',신:'metal',임:'water',계:'water'};
const branchMap={인:'wood',묘:'wood',사:'fire',오:'fire',진:'earth',술:'earth',축:'earth',미:'earth',신:'metal',유:'metal',자:'water',해:'water'};
const pillarLabels={year:'연주',month:'월주',day:'일주',hour:'시주'};

function parseTime(){
  if(input.birthTimeUnknown||!input.birthTime)return {hour:12,minute:0,known:false};
  const [hour,minute]=input.birthTime.split(':').map(Number);
  return {hour,minute,known:true};
}
function pillarObject(result){
  if(typeof result?.toObject==='function')return result.toObject();
  const pick=(v)=>typeof v==='string'?v:(v?.korean||v?.name||'');
  return {year:pick(result?.year),month:pick(result?.month),day:pick(result?.day),hour:pick(result?.hour)};
}
function addElement(score,key,weight){if(key)score[key]=(score[key]||0)+weight;}
function elementFromPillar(pillar,score,weightStem=1,weightBranch=1.1){
  if(!pillar)return;
  const chars=[...pillar];
  addElement(score,stemMap[chars[0]],weightStem);
  addElement(score,branchMap[chars[1]],weightBranch);
}
function round1(n){return Math.round(n*10)/10;}
function normalize(score){
  const total=Object.values(score).reduce((a,b)=>a+b,0)||1;
  const out={};
  Object.keys(elementInfo).forEach(k=>out[k]=round1((score[k]||0)/total*100));
  const diff=100-Object.values(out).reduce((a,b)=>a+b,0);
  out.wood=round1(out.wood+diff);
  return out;
}
function sortedKeys(pct){return Object.keys(pct).sort((a,b)=>pct[b]-pct[a]);}
function balanceIndex(pct){
  const vals=Object.values(pct),mean=20;
  const variance=vals.reduce((a,v)=>a+(v-mean)**2,0)/vals.length;
  return Math.max(0,Math.round(100-Math.sqrt(variance)*3));
}

function calc(){
  const [year,month,day]=input.birthDate.split('-').map(Number);
  const time=parseTime();
  const result=calculateFourPillars({year,month,day,hour:time.hour,minute:time.minute,isLunar:input.calendarType==='lunar',isLeapMonth:Boolean(input.isLeapMonth),gender:input.gender||undefined});
  const pillars=pillarObject(result);
  const score={wood:0,fire:0,earth:0,metal:0,water:0};
  elementFromPillar(pillars.year,score);
  elementFromPillar(pillars.month,score);
  elementFromPillar(pillars.day,score);
  if(time.known)elementFromPillar(pillars.hour,score);
  if(pillars.month){const branch=[...pillars.month][1];addElement(score,branchMap[branch],0.9);}
  const pct=normalize(score);
  const order=sortedKeys(pct);
  return {result,pillars,score,pct,order,strongest:order.slice(0,2),weakest:order.at(-1),balance:balanceIndex(pct),timeKnown:time.known};
}

function buildSummary(data){
  const [a,b]=data.strongest,w=data.weakest;
  return `${input.name}님의 명식에서는 ${elementInfo[a].name}(${elementInfo[a].hanja})와 ${elementInfo[b].name}(${elementInfo[b].hanja})의 흐름이 상대적으로 두드러집니다. 반면 ${elementInfo[w].name}(${elementInfo[w].hanja})의 작용은 다른 기운에 비해 의식적으로 보완해 볼 부분으로 읽힙니다. 이 값은 좋고 나쁨의 점수가 아니라, 다섯 기운이 서로 어느 정도의 비중과 연결을 갖는지 보기 위한 상대 지표입니다.`;
}
function buildStrong(data){return `<p>${elementInfo[data.strongest[0]].strong}</p><p>${elementInfo[data.strongest[1]].strong}</p>`;}
function buildWeak(data){
  const w=elementInfo[data.weakest];
  return `<p>${w.weak}</p><p>부족한 기운을 단순히 채워야 한다는 뜻은 아닙니다. ${w.name}의 역할이 필요한 상황에서 어떤 방식으로 균형을 만들지 살펴보는 것이 더 중요합니다.</p>`;
}
function buildFlow(data){
  const a=elementInfo[data.strongest[0]],w=elementInfo[data.weakest];
  return `${a.name}(${a.hanja})의 작용이 비교적 자연스럽게 시작되는 반면 ${w.name}(${w.hanja})의 역할로 넘어가는 구간에서는 힘의 차이가 나타납니다. 따라서 이미 잘 쓰이는 힘을 더 키우기보다, 그 힘이 다음 단계로 이어질 수 있도록 정리·관찰·유지의 구조를 만들어주는 편이 전체 흐름을 안정시키는 데 도움이 됩니다.`;
}
function lifeCards(data){
  const s=elementInfo[data.strongest[0]],w=elementInfo[data.weakest];
  return [
    ['01','생각과 행동',`${s.name}의 기운이 강하게 작동해 ${s.keywords.split(' · ').join('과 ')} 쪽에서 움직임이 빠를 수 있습니다. 중요한 선택에서는 ${w.name}의 역할인 ${w.keywords.split(' · ')[0]}을 한 번 더 의식하면 균형이 좋아집니다.`],
    ['02','사람과 관계',`관계에서도 잘 쓰이는 ${s.name}의 방식이 먼저 드러납니다. 상대와 속도가 다를 때는 내가 익숙한 반응을 반복하기보다 ${w.name}의 관점으로 한 번 더 상황을 살펴보는 것이 도움이 됩니다.`],
    ['03','일과 선택',`새로운 일을 시작하거나 판단할 때 강한 기운의 장점이 분명하게 작동합니다. 다만 성과를 오래 유지하려면 상대적으로 약한 ${w.name}의 역할을 업무 구조 안에 의도적으로 넣어두는 편이 좋습니다.`],
    ['04','돈과 생활',`재물의 많고 적음을 오행 하나로 단정할 수는 없습니다. 다만 생활 습관에서는 ${s.name}의 방식이 자연스럽고 ${w.name}의 역할이 약해질 수 있으므로, 지출·저축·계획을 감각보다 기록과 기준으로 남기는 것이 유리합니다.`]
  ];
}

function questionInsight(data){
  const q=(input.question||'').trim();
  const sKey=data.strongest[0],wKey=data.weakest;
  const s=elementInfo[sKey],w=elementInfo[wKey],guide=guidanceByElement[wKey];
  const isWork=/일|회사|직장|사업|창업|퇴사|이직|업무|취업|시험|합격/.test(q);
  const isRelation=/연애|관계|사람|인연|결혼|재회|헤어|남자|여자|친구/.test(q);
  const isMoney=/돈|재물|투자|수입|지출|매출|부자|재산/.test(q);
  const isFuture=/미래|앞으로|향후|장래|운명|인생|어떻게 될|어떻게될/.test(q);
  let domain=isWork?'일과 선택':isRelation?'관계':isMoney?'재물과 생활':isFuture?'앞으로의 흐름':'현재 고민';
  let direct='';

  if(isWork && /퇴사|이직|옮기|그만/.test(q)){
    direct=`오행 기준으로는 ‘준비 없이 바로 움직이기’보다 ${guide.action}을 먼저 만든 뒤 이동하는 쪽에 더 무게가 실립니다. 지금 질문이 퇴사나 이직이라면, 결론부터 내리기보다 다음 선택의 조건을 구체화한 뒤 움직이는 편이 더 안정적입니다.`;
  }else if(isWork && /사업|창업/.test(q)){
    direct=`바로 크게 벌이기보다 작게 시작해 검증할 수 있는 구조를 먼저 만드는 쪽이 더 맞습니다. ${guide.action}을 기준으로 준비가 실제 행동으로 이어질 때 오행의 균형이 좋아집니다.`;
  }else if(isRelation && /재회|헤어/.test(q)){
    direct=`관계를 되돌리거나 끝내는 결론을 서두르기보다 ${guide.action}을 먼저 해보는 쪽이 더 맞습니다. 상대의 반응보다 내가 반복하는 관계 방식이 달라질 수 있는지를 먼저 확인해보는 것이 좋습니다.`;
  }else if(isRelation){
    direct=`관계에서는 상대를 맞추려 하기보다 ${guide.action}을 통해 내 기준과 속도를 먼저 분명히 하는 쪽이 더 안정적입니다. 현재 오행 구조에서는 관계의 결과보다 관계를 다루는 방식이 중요하게 읽힙니다.`;
  }else if(isMoney && /투자|재산|돈|재물/.test(q)){
    direct=`한 번에 크게 움직이는 선택보다 ${guide.action}을 먼저 적용하는 쪽이 더 안정적입니다. 재물 문제에서는 감각보다 기록과 기준을 남긴 뒤 결정하는 방식에 더 무게가 실립니다.`;
  }else if(isFuture){
    direct=`${input.name}님의 오행 구조만 놓고 보면, 앞으로는 ${s.name}의 강점을 그대로 쓰면서 ${w.name}의 역할을 의식적으로 키우는 방향이 더 좋습니다. 특히 ${guide.action}을 생활에 넣을수록 앞으로의 선택이 한쪽으로 치우치지 않고 더 안정적으로 이어질 가능성이 큽니다.`;
  }else{
    direct=`지금 고민에서는 ${guide.action}을 먼저 해본 뒤 결정하는 쪽이 더 안정적입니다. 현재 오행 구조에서는 익숙한 ${s.name}의 방식만 밀어붙이기보다 ${w.name}의 역할을 의식적으로 넣는 것이 핵심입니다.`;
  }

  const detail=`${domain}의 관점에서 보면, ${input.name}님은 ${s.name}의 방식인 ‘${s.keywords}’을 먼저 사용하는 편으로 읽힙니다. 이 힘은 현재 고민을 처리하는 데 분명한 장점이 있지만, 반복해서 같은 방식만 쓰면 판단이 한쪽으로 기울 수 있습니다. 그래서 상대적으로 약한 ${w.name}의 역할인 ‘${w.keywords}’을 의도적으로 보완하는 것이 중요합니다. 구체적으로는 ${guide.action}, 그리고 ${guide.caution}이 현재 명식의 균형과 가장 잘 맞는 선택 방식입니다.`;
  return {domain,direct,detail};
}

function evidence(data){
  const visible=data.timeKnown?'연·월·일·시 네 기둥의 여덟 글자':'출생시간 미입력으로 연·월·일 세 기둥만';
  const pillars=Object.entries(data.pillars).filter(([k])=>data.timeKnown||k!=='hour').map(([k,v])=>`<span class="pillar-chip">${pillarLabels[k]} ${v||'—'}</span>`).join('');
  return `<div class="pillar-row">${pillars}</div><div class="evidence-grid"><div class="evidence-item"><strong>명식 산출</strong><p>한국 만세력 계산 라이브러리의 절기·음양력 기준으로 연주·월주·일주${data.timeKnown?'·시주':''}를 계산했습니다.</p></div><div class="evidence-item"><strong>오행 원본</strong><p>${visible}의 천간·지지를 목·화·토·금·수로 분류했습니다.</p></div><div class="evidence-item"><strong>계절 가중</strong><p>월지의 오행에 추가 가중을 적용해 계절의 영향이 단순 개수보다 조금 더 반영되도록 했습니다.</p></div><div class="evidence-item"><strong>해석 범위</strong><p>현재 오행 리포트는 보이는 오행의 상대 강도와 관계를 중심으로 한 1차 분석입니다. 용신·격국 등 학파별 판단은 임의로 추가하지 않습니다.</p></div></div>`;
}

function reportText(data){
  const lines=['정월재 오행 분석 리포트',`대상: ${input.name}`,`기준: ${input.birthDate} · ${input.calendarType==='lunar'?'음력':'양력'} · ${data.timeKnown?input.birthTime:'출생시간 모름'}`,''];
  lines.push('1. 오행 요약',buildSummary(data),'');
  lines.push('2. 오행 상대 강도');
  data.order.forEach(k=>lines.push(`${elementInfo[k].name}(${elementInfo[k].hanja}) ${data.pct[k]}%`));
  lines.push('','3. 자연스럽게 드러나는 힘',elementInfo[data.strongest[0]].strong,elementInfo[data.strongest[1]].strong,'');
  lines.push('4. 의식적으로 균형을 잡을 부분',elementInfo[data.weakest].weak,'');
  lines.push('5. 오행의 흐름',buildFlow(data),'','6. 생활 해석');
  lifeCards(data).forEach(x=>lines.push(`${x[1]}: ${x[2]}`));
  lines.push('');
  if(input.question){
    const qi=questionInsight(data);
    lines.push('7. 남겨주신 질문',input.question,'정월재의 답',qi.direct,'왜 이렇게 읽었나요',qi.detail,'');
  }
  lines.push('핵심 정리',`잘 쓰이는 힘: ${elementInfo[data.strongest[0]].name} · ${elementInfo[data.strongest[1]].name}`,`균형이 필요한 힘: ${elementInfo[data.weakest].name}`,`오행 균형 지표: ${data.balance}/100`,'','※ 본 리포트는 전통 명리학 이론을 바탕으로 한 해석 콘텐츠이며 미래의 특정 결과를 보장하지 않습니다.');
  return lines.join('\n');
}

function render(data){
  $('[data-name]').textContent=input.name;
  $('[data-summary]').textContent=buildSummary(data);
  $('[data-meta]').innerHTML=`<span>${input.birthDate}</span><span>${input.calendarType==='lunar'?'음력':'양력'}</span><span>${data.timeKnown?input.birthTime:'출생시간 미입력'}</span><span>균형 지표 ${data.balance}/100</span>`;
  $('[data-element-chart]').innerHTML=data.order.map(k=>`<div class="element-bar"><div class="label"><span class="hanja">${elementInfo[k].hanja}</span>${elementInfo[k].name}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,data.pct[k]*3.4)}%"></div></div><div class="score">${data.pct[k]}%</div></div>`).join('');
  $('[data-element-cards]').innerHTML=Object.keys(elementInfo).map(k=>`<article class="element-card"><strong>${elementInfo[k].hanja} ${elementInfo[k].name} · ${elementInfo[k].keywords}</strong><p>${elementInfo[k].base}</p></article>`).join('');
  $('[data-strong-text]').innerHTML=buildStrong(data);
  $('[data-weak-text]').innerHTML=buildWeak(data);
  $('[data-flow-text]').textContent=buildFlow(data);
  $('[data-life-grid]').innerHTML=lifeCards(data).map(([n,t,p])=>`<article class="life-card"><span>${n}</span><h3>${t}</h3><p>${p}</p></article>`).join('');
  if(input.question){
    const sec=$('[data-question-section]'),qi=questionInsight(data);
    sec.hidden=false;
    $('[data-question]').textContent=input.question;
    $('[data-question-direct]').textContent=qi.direct;
    $('[data-question-answer]').textContent=qi.detail;
  }
  const keyItems=[
    ['01','잘 쓰이고 있는 힘',`${elementInfo[data.strongest[0]].name} · ${elementInfo[data.strongest[1]].name}`,'이미 자연스럽게 쓰이는 힘은 장점이지만 과해질 때의 부담도 함께 살펴봅니다.'],
    ['02','균형이 필요한 힘',elementInfo[data.weakest].name,`${elementInfo[data.weakest].keywords}의 역할을 생활 속 구조로 보완해보세요.`],
    ['03','전체 균형',`${data.balance}/100`,'점수가 높고 낮음의 길흉이 아니라 다섯 기운의 편차를 보기 위한 참고 지표입니다.']
  ];
  $('[data-key-grid]').innerHTML=keyItems.map(([n,l,v,p])=>`<article class="key-card"><span>${n} · ${l}</span><strong>${v}</strong><p>${p}</p></article>`).join('');
  $('[data-evidence]').innerHTML=evidence(data);
}

try{
  reportData=calc();
  render(reportData);
}catch(error){
  root.innerHTML=`<div class="result-container"><section class="report-section"><p class="section-label">CALCULATION ERROR</p><h1 style="font-size:26px;margin:0 0 12px">오행 계산을 완료하지 못했습니다.</h1><p style="color:#756b67;line-height:1.7">입력한 날짜가 지원 범위를 벗어났거나 음력 정보가 올바르지 않을 수 있습니다. 입력 정보를 다시 확인해주세요.</p><a href="./ohaeng.html" class="result-button primary" style="display:inline-flex;align-items:center;text-decoration:none;margin-top:16px">입력 다시 하기</a></section></div>`;
  throw error;
}

const copyBtn=$('[data-copy]');
const pdfBtn=$('[data-pdf]');
const saveBtn=$('[data-save]');
const actionStatus=$('[data-action-status]');

copyBtn.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(reportText(reportData));actionStatus.textContent='보고서용 텍스트를 복사했습니다.';}
  catch(e){actionStatus.textContent='복사하지 못했습니다. 브라우저 권한을 확인해주세요.';}
});
pdfBtn.addEventListener('click',()=>window.print());

onAuthStateChanged(auth,user=>{
  currentUser=user;
  saveBtn.textContent=!user?'로그인 후 저장':saved?'저장 완료':'마이페이지에 저장';
});

saveBtn.addEventListener('click',async()=>{
  if(saved){actionStatus.innerHTML='이미 저장된 분석입니다. <a href="./mypage.html">마이페이지에서 보기</a>';return;}
  if(!currentUser){location.href='./login.html?next=./ohaeng-result.html';return;}
  saveBtn.disabled=true;
  saveBtn.textContent='저장 중…';
  try{
    const qi=input.question?questionInsight(reportData):null;
    const data={
      type:'ohaeng',
      title:`${input.name}님의 오행 분석`,
      input,
      summary:buildSummary(reportData),
      pillars:reportData.pillars,
      elements:reportData.pct,
      strongest:reportData.strongest.map(k=>elementInfo[k].name),
      weakest:elementInfo[reportData.weakest].name,
      balanceIndex:reportData.balance,
      question:input.question||'',
      questionDirect:qi?.direct||'',
      questionDetail:qi?.detail||'',
      reportText:reportText(reportData),
      createdAt:serverTimestamp()
    };
    const ref=await addDoc(collection(db,'users',currentUser.uid,'readings'),data);
    saved=true;
    saveBtn.textContent='저장 완료';
    actionStatus.innerHTML=`정월록과 마이페이지에 저장했습니다. <a href="./archive.html?reading=${encodeURIComponent(ref.id)}">저장한 분석 보기</a>`;
  }catch(e){
    saveBtn.disabled=false;
    saveBtn.textContent='마이페이지에 저장';
    actionStatus.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';
  }
});
