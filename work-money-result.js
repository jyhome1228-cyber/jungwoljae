import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const raw=sessionStorage.getItem('jungwoljae_work_money_input');
if(!raw){location.href='./work-money.html';throw new Error('missing work money input');}
const input=JSON.parse(raw);
const root=document.querySelector('[data-work-result]');
const $=s=>root.querySelector(s);
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
let currentUser=null,saved=false,data=null;

const stemInfo={
  갑:{element:'wood',polarity:'yang',title:'방향을 세우고 키워가는 방식',work:'스스로 목표를 세우고 처음부터 구조를 만드는 일에서 힘을 쓰기 쉽습니다.'},
  을:{element:'wood',polarity:'yin',title:'연결하며 길을 만드는 방식',work:'환경과 사람을 읽고 가능한 경로를 조율하는 일에서 강점이 드러나기 쉽습니다.'},
  병:{element:'fire',polarity:'yang',title:'보여주고 움직이는 방식',work:'실행과 표현, 사람을 움직이는 상황에서 에너지가 올라오기 쉽습니다.'},
  정:{element:'fire',polarity:'yin',title:'집중해서 완성도를 높이는 방식',work:'한 영역을 깊게 파고 정교하게 다듬는 일에서 장점이 살아나기 쉽습니다.'},
  무:{element:'earth',polarity:'yang',title:'큰 구조를 안정시키는 방식',work:'여러 요소를 한곳에 모아 기준과 구조를 만드는 일에서 힘을 쓰기 쉽습니다.'},
  기:{element:'earth',polarity:'yin',title:'세밀하게 관리하고 쌓는 방식',work:'운영·관리·실무처럼 반복을 안정적으로 유지하는 일에서 강점이 드러납니다.'},
  경:{element:'metal',polarity:'yang',title:'기준을 세우고 정리하는 방식',work:'문제를 선명하게 보고 결론과 책임을 나누는 일에서 강점을 쓰기 쉽습니다.'},
  신:{element:'metal',polarity:'yin',title:'정밀하게 구분하고 다듬는 방식',work:'품질·기준·세부 완성도를 높이는 일에서 힘이 잘 붙는 편입니다.'},
  임:{element:'water',polarity:'yang',title:'큰 흐름을 읽고 연결하는 방식',work:'정보와 변화가 많은 환경에서 여러 가능성을 연결하는 데 강점이 있습니다.'},
  계:{element:'water',polarity:'yin',title:'관찰하고 축적한 뒤 움직이는 방식',work:'정보를 모으고 세밀하게 판단한 뒤 움직이는 일에서 안정감이 생기기 쉽습니다.'}
};
const branchInfo={자:{element:'water',polarity:'yang'},축:{element:'earth',polarity:'yin'},인:{element:'wood',polarity:'yang'},묘:{element:'wood',polarity:'yin'},진:{element:'earth',polarity:'yang'},사:{element:'fire',polarity:'yin'},오:{element:'fire',polarity:'yang'},미:{element:'earth',polarity:'yin'},신:{element:'metal',polarity:'yang'},유:{element:'metal',polarity:'yin'},술:{element:'earth',polarity:'yang'},해:{element:'water',polarity:'yin'}};
const elementName={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};
const elementWork={wood:'방향·성장',fire:'표현·실행',earth:'관리·유지',metal:'판단·정리',water:'관찰·정보'};
const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
const focusLabels={career:'직업 성향',organization:'조직과 독립',change:'이직과 변화',business:'사업과 창업',money:'재물 관리',growth:'수입과 축적'};
const statusLabels={employee:'직장인·조직 근무',jobseeker:'취업·이직 준비',business:'사업자·창업 준비',freelance:'프리랜서·독립 활동',student:'학생·진로 탐색'};
const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

function pillarString(v){return typeof v==='string'?v:(v?.korean||v?.name||'');}
function parseTime(){if(input.birthTimeUnknown||!input.birthTime)return {hour:12,minute:0,known:false};const [hour,minute]=input.birthTime.split(':').map(Number);return {hour,minute,known:true};}
function tenGod(dayStem,targetStem){
  const d=stemInfo[dayStem],t=stemInfo[targetStem];if(!d||!t)return '미상';const same=d.polarity===t.polarity;
  if(d.element===t.element)return same?'비견':'겁재';
  if(generates[d.element]===t.element)return same?'식신':'상관';
  if(controls[d.element]===t.element)return same?'편재':'정재';
  if(controls[t.element]===d.element)return same?'편관':'정관';
  if(generates[t.element]===d.element)return same?'편인':'정인';
  return '미상';
}
function group(g){if(['비견','겁재'].includes(g))return '비겁';if(['식신','상관'].includes(g))return '식상';if(['편재','정재'].includes(g))return '재성';if(['편관','정관'].includes(g))return '관성';if(['편인','정인'].includes(g))return '인성';return '기타';}
function yearPillar(y){const r=calculateFourPillars({year:y,month:7,day:1,hour:12,minute:0,isLunar:false});const o=typeof r?.toObject==='function'?r.toObject():r;return pillarString(o?.year);}

function calculate(){
  const [year,month,day]=input.birthDate.split('-').map(Number),time=parseTime();
  const result=calculateFourPillars({year,month,day,hour:time.hour,minute:time.minute,isLunar:input.calendarType==='lunar',isLeapMonth:Boolean(input.isLeapMonth),gender:input.gender||undefined});
  const o=typeof result?.toObject==='function'?result.toObject():result;
  const pillars={year:pillarString(o?.year),month:pillarString(o?.month),day:pillarString(o?.day),hour:pillarString(o?.hour)};
  const dayStem=[...pillars.day][0],dayBranch=[...pillars.day][1],dm=stemInfo[dayStem];if(!dm)throw new Error('day master missing');
  const scores={wood:0,fire:0,earth:0,metal:0,water:0},groups={비겁:0,식상:0,재성:0,관성:0,인성:0};
  const used=['year','month','day',...(time.known?['hour']:[])];
  used.forEach(k=>{const chars=[...pillars[k]],s=stemInfo[chars[0]],b=branchInfo[chars[1]];if(s)scores[s.element]+=1;if(b)scores[b.element]+=1.1;const g=group(tenGod(dayStem,chars[0]));if(groups[g]!==undefined)groups[g]++;});
  if(pillars.month){const mb=branchInfo[[...pillars.month][1]];if(mb)scores[mb.element]+=0.9;}
  const total=Object.values(scores).reduce((a,b)=>a+b,0)||1,pct={};Object.keys(scores).forEach(k=>pct[k]=Math.round(scores[k]/total*100));pct.wood+=100-Object.values(pct).reduce((a,b)=>a+b,0);
  const order=Object.keys(pct).sort((a,b)=>pct[b]-pct[a]);
  const orgRaw=50+(groups.관성+groups.인성-groups.식상-groups.비겁)*10+(pct.earth+pct.metal-pct.wood-pct.fire)*.25;
  const orgIndex=clamp(Math.round(orgRaw),15,85);
  const wealthElement=controls[dm.element],wealthPct=pct[wealthElement]||0;
  const now=Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date()));
  const years=[now,now+1].map(y=>{const p=yearPillar(y),s=[...p][0],b=[...p][1];let relation='평이한 관계';if(pairHas(yukhap,dayBranch,b))relation='일지와 육합';else if(pairHas(chung,dayBranch,b))relation='일지와 충';else if(dayBranch===b)relation='일지와 같은 지지';return {year:y,pillar:p,god:tenGod(dayStem,s),relation};});
  return {pillars,timeKnown:time.known,dayStem,dayBranch,dm,pct,order,strongest:order[0],weakest:order.at(-1),groups,orgIndex,wealthElement,wealthPct,years};
}

function dominantGroup(d){return Object.entries(d.groups).sort((a,b)=>b[1]-a[1])[0]?.[0]||'비겁';}
function summary(d){return `${input.name}님의 일과 재물 구조는 ${d.dm.title}을 중심으로, ${elementName[d.strongest]}(${elementWork[d.strongest]})의 기운이 상대적으로 두드러집니다. 일에서는 ${dominantGroup(d)}의 작동 방식이 눈에 띄고, 재물은 단순히 많고 적음을 예측하기보다 ${elementName[d.wealthElement]}의 역할과 전체 명식의 균형을 함께 보는 편이 맞습니다. 잘 쓰이는 방식만 반복하기보다 부족한 역할을 업무와 생활의 구조로 보완할 때 장기적인 안정감이 좋아집니다.`;}
function coreCards(d){
  const g=dominantGroup(d),s=elementName[d.strongest],w=elementName[d.weakest];
  const groupText={비겁:'내 기준과 주도권이 분명한 편이라 스스로 결정할 여지가 있을 때 힘이 잘 붙습니다.',식상:'아이디어를 밖으로 꺼내고 결과물을 만드는 과정에서 에너지가 살아나기 쉽습니다.',재성:'현실적인 결과와 자원 배분을 의식하며 일의 효율과 보상을 함께 보는 편입니다.',관성:'역할과 책임, 기준이 분명할수록 집중력이 안정적으로 유지되기 쉽습니다.',인성:'정보를 이해하고 준비한 뒤 움직일 때 안정감이 생기며 전문성을 쌓는 방식과 잘 맞습니다.'};
  return [
    ['01','일의 중심',d.dm.title,d.dm.work],
    ['02','성과를 내는 방식',g,groupText[g]],
    ['03','강하게 쓰이는 기운',s,`${elementWork[d.strongest]}의 역할이 자연스럽게 드러납니다. 이 힘을 주된 업무 역할에 배치하면 효율이 올라가기 쉽습니다.`],
    ['04','보완하면 좋은 기운',w,`${elementWork[d.weakest]}의 역할은 의식적으로 구조화하는 편이 좋습니다. 잘 못한다는 뜻보다 놓치기 쉬운 과정에 가깝습니다.`]
  ];
}
function strengthText(d){
  const g=dominantGroup(d);
  return `<p>${d.dm.work} 특히 ${elementName[d.strongest]}의 ${elementWork[d.strongest]} 역할을 쓸 수 있는 상황에서는 속도와 집중력이 붙기 쉽습니다.</p><p>${g}의 성향이 함께 보여, 일을 선택할 때 직함보다 실제로 어떤 책임과 권한을 갖는지 보는 편이 중요합니다. 잘 맞는 환경에서는 강점을 반복해 쓸 수 있지만, 모든 일을 혼자 감당하는 방식으로 확장하면 오히려 피로가 빨리 쌓일 수 있습니다.</p>`;
}
function pressureText(d){
  return `<p>${elementName[d.weakest]}의 ${elementWork[d.weakest]} 역할이 필요한 상황에서는 평소보다 의식적인 노력이 더 들어갈 수 있습니다. 익숙한 강점으로 문제를 해결하려다가 같은 방식이 반복되면 업무 부담이 한쪽으로 쏠릴 수 있습니다.</p><p>특히 역할이 모호하거나 우선순위가 계속 바뀌는 환경에서는 피로가 커질 수 있으므로, 무엇을 책임지고 무엇을 내려놓을지 기준을 명확하게 만드는 것이 중요합니다.</p>`;
}
function organizationText(d){
  if(d.orgIndex>=65)return '조직의 기준과 역할이 분명한 환경에서 안정적으로 힘을 쓰는 편에 가깝습니다. 다만 규칙이 있다는 사실보다 내가 맡은 책임과 권한의 범위가 명확한지가 중요합니다. 경험이 쌓이면 전문 책임자나 작은 단위의 리더처럼 자율성과 기준을 동시에 갖는 위치가 잘 맞을 수 있습니다.';
  if(d.orgIndex<=35)return '자율성과 주도권이 큰 환경에서 힘이 살아나는 편에 가깝습니다. 독립·프리랜스·사업 자체가 무조건 맞는다는 뜻은 아니며, 스스로 기준과 일정, 수입 구조를 관리할 수 있을 때 장점이 유지됩니다. 자유만 크고 운영 구조가 없으면 오히려 에너지가 분산될 수 있습니다.';
  return '조직과 독립 중 한쪽만이 정답이라기보다, 기본 틀은 있으면서 실행 방법에는 자율성이 있는 환경이 잘 맞는 편입니다. 역할의 기준은 분명하되 지나친 통제는 적고, 결과로 책임을 확인하는 구조에서 장점을 쓰기 쉽습니다.';
}
function situationHeading(){
  return ({employee:'직장운과 이직운',jobseeker:'취업운과 이직운',business:'사업운과 거래운',freelance:'일운과 계약운',student:'학업·진로운과 취업운'})[input.workStatus]||'직업운과 사업운';
}
function situationText(d){
  const strong=elementWork[d.strongest],weak=elementWork[d.weakest];
  const map={
    employee:[
      `일의 흐름은 혼자 앞서가기보다 주변 사람과 뜻을 맞출 때 한결 수월하게 풀리는 편입니다. 지금까지 성실하게 맡아온 일이 있다면 윗사람이나 동료가 그 과정을 알아주고, 미뤄졌던 평가나 역할의 변화가 뒤따를 수 있습니다. 특히 ${strong}에 관계된 업무에서는 자신의 장점이 분명하게 드러나므로 눈앞의 결과가 더디다고 조급해하지 말고 하던 일을 차분히 마무리하는 것이 좋습니다. 다만 부탁을 모두 받아주다 보면 책임만 늘어날 수 있으니 자신의 몫과 남의 몫은 분명히 나누어야 합니다.`,
      `이직이나 부서 이동을 생각하고 있다면 감정이 상한 순간에 결론을 내리기보다 조건을 충분히 살펴보는 편이 좋습니다. 겉으로 좋아 보이는 자리라도 ${weak}에 해당하는 부담이 반복되면 오래 버티기 어려울 수 있습니다. 지금 있는 곳에서 인정받을 여지가 남아 있다면 먼저 대화와 조정을 시도해보고, 옮겨야 한다면 급여뿐 아니라 맡게 될 일과 사람의 분위기까지 확인하세요. 서두르지 않고 순서를 지키면 더 나은 자리를 만날 가능성이 있습니다.`
    ],
    jobseeker:[
      `취업과 이직의 문은 한 번에 크게 열리기보다 사람의 소개나 전에 맺어둔 인연을 통해 서서히 열리는 흐름입니다. 여러 곳에 급하게 지원하기보다 ${strong}을 보여줄 수 있는 자리부터 골라 움직이면 좋은 소식을 들을 가능성이 높습니다. 서류에서는 막연한 장점보다 실제로 해낸 일을 분명하게 적고, 면접에서는 지나치게 자신을 낮추지 않는 것이 좋습니다. 미처 갖추지 못한 조건 때문에 망설이다가 때를 놓칠 수 있으니 준비가 어느 정도 되었다면 먼저 문을 두드려보세요.`,
      `기다리던 연락이 조금 늦어지더라도 이것을 곧바로 실패로 받아들일 필요는 없습니다. 처음 생각했던 곳보다 뒤에 알게 된 자리에서 더 편안한 인연이 생길 수 있고, 가까운 사람이 건네는 정보가 실제 기회로 이어질 수도 있습니다. 다만 조건을 자세히 확인하지 않고 조급하게 결정하면 들어간 뒤 다시 고민할 수 있으니 계약 형태와 수습 기간, 실제 맡을 일을 꼼꼼하게 살피는 것이 좋습니다.`
    ],
    business:[
      `사업의 흐름은 새로운 일을 크게 벌이기보다 이미 시작한 일과 기존 거래처를 단단히 다질 때 좋아집니다. 그동안 쌓아온 신뢰가 소개와 재계약으로 이어질 수 있고, ${strong}을 살린 상품이나 서비스에서 반응을 얻기 쉽습니다. 혼자 모든 일을 끌어안기보다 믿을 만한 사람에게 역할을 나누면 막혀 있던 일이 풀릴 수 있습니다. 다만 말로만 정한 약속은 뒤에 오해가 생길 수 있으니 금액과 일정, 책임 범위는 반드시 문서로 남기세요.`,
      `새로운 제안이 들어오더라도 규모만 보고 마음이 앞서면 실속이 줄어들 수 있습니다. 특히 ${weak} 부분이 충분히 준비되지 않은 상태에서 인력이나 고정비를 늘리면 매출이 있어도 부담이 커질 수 있습니다. 처음에는 작게 시작해 반응을 확인하고, 거래처의 지급 능력과 입금 날짜를 살핀 뒤 범위를 넓히는 것이 좋습니다. 욕심을 조금만 늦추면 오히려 오래 이어지는 거래를 만들 수 있습니다.`
    ],
    freelance:[
      `혼자 움직이는 일에서는 실력 못지않게 사람을 통해 기회가 들어오는 흐름이 강합니다. 예전에 함께 일했던 사람이나 소개로 새 의뢰가 이어질 수 있고, ${strong}을 분명하게 보여줄수록 자신에게 맞는 일을 골라 받을 수 있습니다. 여러 일을 한꺼번에 잡기보다 잘할 수 있는 분야를 앞세우면 평판도 좋아집니다. 작은 부탁이라고 가볍게 시작했다가 일이 커질 수 있으니 작업 범위와 수정 횟수는 처음부터 정확히 정하세요.`,
      `당장은 일이 몰렸다가 뜸해지는 차이가 있을 수 있으나 흐름 자체가 막힌 것은 아닙니다. 한 번 맺은 거래처와 신뢰를 잘 지키면 단발성 일이 꾸준한 수입으로 바뀔 수 있습니다. 무리하게 값을 낮춰 일을 따내기보다 들이는 시간과 책임에 맞는 대가를 받는 것이 중요하며, 입금일과 계약 조건을 확실히 해두면 불필요한 마음고생을 줄일 수 있습니다.`
    ],
    student:[
      `진로는 한 가지 답을 억지로 정하기보다 직접 부딪혀보면서 찾는 편이 좋은 때입니다. ${strong}을 활용하는 공부나 활동에서는 집중력이 살아나고, 선생님이나 선배의 도움으로 생각하지 못했던 길을 알게 될 수 있습니다. 성적이나 자격증 하나만으로 자신을 판단하지 말고 실제로 완성한 과제와 경험을 차곡차곡 남겨두세요. 작은 성취가 쌓이면 취업이나 진학을 결정할 때 자신감이 되어줄 것입니다.`,
      `공부와 취업 사이에서 마음이 흔들릴 수 있지만 주변과 비교해 서둘러 결론을 내릴 필요는 없습니다. 더 배워야 할 것이 분명하다면 기간을 정해 집중하고, 일을 시작하고 싶다면 완벽한 준비를 기다리기보다 경험을 얻을 수 있는 자리부터 살펴보는 것이 좋습니다. 다만 생활비를 벌기 위한 일이 공부의 흐름까지 끊지 않도록 시간과 조건을 잘 나누어야 합니다.`
    ]
  };
  return map[input.workStatus]||[
    `${input.name}님의 강점은 ${strong} 역할에서 잘 드러납니다. 현재 상황에서 이 강점을 실제 성과로 연결할 수 있는 업무와 책임을 먼저 확인하세요.`,
    `${weak} 과정은 의지만으로 버티기보다 시스템과 협업으로 보완하는 편이 좋습니다. 일과 돈의 선택은 실제 조건과 숫자를 함께 비교해야 합니다.`
  ];
}
function moneyNarrative(d){
  const active=d.groups.식상+d.groups.비겁>=2;
  const steady=d.groups.인성+d.groups.관성>=2;
  const first=d.wealthPct>=24
    ? `돈의 흐름은 노력한 만큼 결과가 돌아오고, 막혀 있던 정산이나 미뤄진 대가가 들어올 가능성이 있는 편입니다. 한 번의 큰 횡재보다는 본업과 익숙한 거래에서 이익이 생기기 쉬우며, 사람을 통해 새로운 일거리나 부수입의 기회가 이어질 수도 있습니다. 수입이 들어왔을 때 자신을 위해 적당히 쓰는 것은 괜찮지만, 기분에 따라 지출의 폭까지 커지지 않도록 중심을 잡는 것이 좋습니다.`
    : `재물은 크게 들어왔다가 한꺼번에 불어나는 모습보다는 작은 수입이 여러 차례 이어지며 서서히 채워지는 흐름입니다. 당장 눈에 띄는 이익이 적더라도 꾸준히 해온 일에서 대가가 돌아오고, 뜻밖의 환급이나 미뤄졌던 돈이 들어와 부족한 곳을 메울 수 있습니다. 돈 때문에 조급해지면 조건이 좋지 않은 제안까지 붙잡기 쉬우니 익숙하고 확실한 수입부터 지키는 것이 좋습니다.`;
  const second=active
    ? `새로운 투자나 구매에 마음이 쉽게 움직일 수 있으므로 큰돈이 오가는 일은 한 번 더 확인하세요. 남의 말만 믿고 서두르거나 수익이 날 것이라는 기대만으로 범위를 키우면 들어온 돈이 오래 머물지 못할 수 있습니다. 반대로 감당할 수 있는 범위 안에서 계획을 세우고 계약과 비용을 꼼꼼히 살핀다면 필요한 곳에 쓴 돈이 다시 기회로 돌아올 수 있습니다.`
    : steady
      ? `돈을 모으는 힘은 비교적 안정적이지만 지나치게 지키는 데만 마음을 쓰면 꼭 필요한 기회까지 놓칠 수 있습니다. 생활비와 저축, 일에 필요한 비용을 미리 나누어두고 남은 범위 안에서 움직이면 마음이 한결 편해집니다. 가까운 사람과 금전 거래를 할 때는 정에 이끌려 애매하게 넘기지 말고 갚는 날짜와 금액을 분명히 해두는 것이 좋습니다.`
      : `수입보다 지출의 순서가 더 중요한 때입니다. 들어올 돈을 미리 계산해 쓰거나 작은 결제가 겹치면 생각보다 많은 돈이 빠져나갈 수 있으니, 먼저 남길 돈을 떼어두고 사용할 몫을 정하세요. 특히 지인과의 돈거래나 충동적인 투자만 피한다면 큰 손실 없이 무난하게 재물을 지켜갈 수 있습니다.`;
  return [first,second];
}
function moneyCards(d){
  const wealth=d.wealthPct;
  return [
    ['01','돈을 버는 방식',wealth>=24?'재성의 역할이 비교적 눈에 띄어 일의 결과를 수입과 현실적인 보상으로 연결하려는 감각이 살아날 수 있습니다. 다만 단기 수익만 좇기보다 반복 가능한 수입 구조를 만드는 편이 안정적입니다.':'재성의 비중이 상대적으로 크지 않아 돈 자체보다 일의 의미·완성도·관계 같은 다른 기준이 먼저 작동할 수 있습니다. 수입 조건을 명시적으로 확인하는 습관이 도움이 됩니다.'],
    ['02','지출과 소비',d.strongest==='fire'||d.strongest==='wood'?'필요하다고 느끼면 빠르게 쓰는 쪽으로 기울 수 있으므로 큰 지출은 하루 정도 간격을 두고 다시 보는 것이 좋습니다.':'기준을 세운 뒤 쓰는 편에 가깝지만, 지나치게 아끼거나 관리만 하다 필요한 투자 시점을 놓치지 않도록 구분이 필요합니다.'],
    ['03','축적과 관리',d.groups.인성+d.groups.관성>=2?'기록과 규칙을 만들어두면 돈을 관리하고 축적하는 과정이 비교적 안정적으로 이어질 수 있습니다. 자동화된 저축·예산·정기 점검 같은 구조가 잘 맞습니다.':'돈을 모으는 의지보다 관리 구조가 중요합니다. 수입이 생길 때 먼저 남길 몫을 정하고, 소비 후 남은 돈을 저축하는 방식보다 순서를 반대로 두는 편이 좋습니다.'],
    ['04','위험을 다루는 태도',d.groups.식상+d.groups.비겁>=2?'새로운 기회에 빠르게 반응하는 장점이 있지만 낙관이 커질 때 위험을 작게 볼 수 있습니다. 투자나 큰 금액 결정은 운세가 아니라 손실 가능성·현금흐름·객관적 정보로 검토해야 합니다.':'위험을 신중하게 보는 편이라 큰 실수는 줄일 수 있지만, 지나친 확인 때문에 결정이 늦어질 수 있습니다. 감당 가능한 손실 범위와 판단 기한을 미리 정해두는 방식이 도움이 됩니다.']
  ];
}
function yearText(d,y){
  const godText={비견:'내 기준과 주도권이 강해지는 해라 스스로 방향을 잡는 일이 중요해질 수 있습니다.',겁재:'사람·경쟁·분배 이슈가 커질 수 있어 협업과 비용 분담의 기준을 분명히 하는 편이 좋습니다.',식신:'결과물을 만들고 꾸준히 생산하는 흐름을 쓰기 좋은 편입니다.',상관:'새 방식과 변화 욕구가 커질 수 있어 기존 구조를 개선하는 데 힘을 쓸 수 있습니다.',정재:'안정적인 수입·관리·축적을 현실적으로 점검하기 좋은 흐름입니다.',편재:'기회와 외부 활동이 늘 수 있으나 범위를 넓힐수록 관리 기준이 필요합니다.',정관:'책임과 역할이 분명해지기 쉬워 직장·직책·평가의 기준을 의식하게 될 수 있습니다.',편관:'압박과 경쟁이 커질 수 있으나 기준을 세우면 성장의 자극으로 쓸 수 있습니다.',정인:'배움·자격·준비·전문성을 쌓는 데 무게가 실릴 수 있습니다.',편인:'새로운 관점과 탐색이 늘 수 있어 방향을 넓히되 실행 기준을 함께 두는 것이 좋습니다.'};
  const rel=y.relation==='일지와 충'?' 일지와 충이 있어 변화나 일정 조정이 평소보다 크게 체감될 수 있으니, 무리한 확정보다 여지를 두는 편이 좋습니다.':y.relation==='일지와 육합'?' 일지와 육합이 있어 사람이나 환경과 연결되는 흐름을 활용하기 좋을 수 있습니다.':' 큰 충돌을 단정할 관계는 아니므로 실제 선택과 준비의 질이 더 중요합니다.';
  return `${y.year}년 ${y.pillar}은 ${y.god}의 해로 읽힙니다. ${godText[y.god]||'역할의 변화를 차분히 살펴보는 편이 좋습니다.'}${rel}`;
}
function focusText(d,key){
  const map={
    career:[`직업 성향에서는 ${d.dm.title}이 기본 중심입니다. 직업명을 하나로 고르기보다 ${elementWork[d.strongest]}을 실제 업무에서 얼마나 쓸 수 있는지를 보는 편이 더 정확합니다.`,`반대로 ${elementWork[d.weakest]} 과정이 반복해서 필요한 직무라면 능력 부족보다 피로 누적의 문제로 나타날 수 있습니다. 역할 설계와 협업으로 보완하는 것이 중요합니다.`],
    organization:[organizationText(d),'조직을 고를 때는 회사 규모보다 의사결정 구조, 책임 범위, 자율성의 정도를 확인하는 편이 좋습니다. 독립을 택하더라도 운영·영업·정산 같은 반복 구조를 감당할 수 있는지를 함께 봐야 합니다.'],
    change:[`변화에서는 익숙한 강점을 버리는 것보다 새로운 환경에서 그 강점을 어떻게 다시 쓸 수 있는지가 중요합니다. ${elementName[d.strongest]}의 역할을 유지하면서 ${elementName[d.weakest]}의 역할을 보완할 수 있는 이동이 더 안정적입니다.`,'이직이나 이동을 운세 하나로 결정하기보다 역할·보상·성장·생활리듬을 항목별로 비교하고, 바뀐 환경에서 감당해야 할 비용까지 함께 보는 것이 좋습니다.'],
    business:[`사업·창업은 독립 성향 하나로 판단할 수 없습니다. 현재 명식에서는 주도권뿐 아니라 ${elementWork[d.weakest]}의 운영 역할을 얼마나 구조화할 수 있는지가 중요합니다.`,'아이디어와 실행이 강해도 현금흐름·계약·정산·반복 운영이 약하면 부담이 커질 수 있습니다. 처음부터 크게 벌이기보다 작게 검증하고 숫자로 확인하는 방식이 더 안전합니다.'],
    money:[moneyCards(d)[1][2],moneyCards(d)[2][2]],
    growth:[moneyCards(d)[0][2],'수입을 키우는 문제는 한 번의 큰 기회보다 반복 가능한 수입원, 고정비 관리, 현금흐름을 함께 보는 편이 중요합니다. 운세는 참고로만 두고 실제 숫자와 위험 범위를 기준으로 판단하세요.']
  };
  return map[key]||[];
}
function guides(d){return [
  ['01','일의 기준',`직업명보다 ${elementWork[d.strongest]}을 반복해서 쓸 수 있는 역할인지 먼저 보세요.`],
  ['02','피로 관리',`${elementWork[d.weakest]}이 계속 요구될 때는 혼자 버티기보다 시스템·도구·협업으로 보완하세요.`],
  ['03','돈의 기준','수입과 지출은 감각보다 숫자로 남기고, 큰 결정은 손실 가능성과 현금흐름을 먼저 확인하세요.'],
  ['04','변화의 기준','이직·사업·투자는 운세로 결정하지 말고 역할·보상·위험·생활 조건을 실제 정보와 함께 비교하세요.']
];}
function totalSummary(d){
  const people=d.orgIndex>=50?'윗사람이나 경험 많은 사람의 말을 귀담아들으면 막혀 있던 일의 실마리를 찾기 쉽습니다.':'내 뜻을 분명히 하되 주변 사람의 도움을 적절히 받아들이면 혼자 애쓰는 것보다 일이 빠르게 풀릴 수 있습니다.';
  return [`일과 재물은 서로 따로 움직이기보다 일이 안정될수록 돈의 흐름도 함께 나아지는 모습입니다. 지금은 무리하게 판을 키우기보다 이미 가진 경험과 인연을 잘 활용하는 것이 유리합니다. ${people} 작은 약속을 성실하게 지키는 태도가 다음 기회와 좋은 평판으로 이어질 수 있습니다.`,`눈앞의 이익만 보고 성급하게 움직이면 애써 들어온 재물이 쉽게 빠져나갈 수 있으니, 중요한 결정일수록 하루쯤 여유를 두고 조건을 다시 살펴보세요. 욕심을 조금 덜고 자신이 감당할 수 있는 범위 안에서 움직인다면 일에서는 인정받을 일이 생기고 재물에서도 부족한 곳이 차츰 채워질 것입니다.`];
}
function evidence(d){return `<p><strong>명식</strong> ${d.pillars.year} · ${d.pillars.month} · ${d.pillars.day}${d.timeKnown?` · ${d.pillars.hour}`:''}을 기준으로 일간과 오행을 계산했습니다.</p><p><strong>십성</strong> 보이는 천간을 일간과 비교해 비겁·식상·재성·관성·인성의 역할을 참고했습니다.</p><p><strong>조직/독립 지표</strong> 관성·인성과 식상·비겁의 상대 작동, 오행의 분포를 조합한 내부 참고 지표이며 절대 점수가 아닙니다.</p><p><strong>재물 해석</strong> 일간이 극하는 오행을 재성의 역할로 보고 전체 오행 안에서의 상대 비중을 참고했습니다. 투자 수익이나 실제 자산 규모를 예측하는 지표가 아닙니다.</p>`;}
function reportText(d){
  return ['정월재 일과 재물운',`대상: ${input.name}`,`기준: ${input.birthDate} · ${input.calendarType==='lunar'?'음력':'양력'} · ${d.timeKnown?input.birthTime:'출생시간 모름'}`,'',situationHeading(),...situationText(d),'','재물운',...moneyNarrative(d),'','총평',...totalSummary(d),'','※ 본 내용은 전통 명리학을 바탕으로 한 참고용 해석입니다.'].join('\n');
}
function render(d){
  $('[data-name]').textContent=input.name;$('[data-summary]').textContent='현재 상황을 기준으로 일의 흐름과 재물이 들어오고 나가는 때를 함께 살펴봅니다.';
  $('[data-meta]').innerHTML=`<span>${input.birthDate}</span><span>${input.calendarType==='lunar'?'음력':'양력'}</span><span>${d.timeKnown?`출생시간 ${input.birthTime}`:'출생시간 모름'}</span><span>일간 ${d.dayStem}</span><span>${statusLabels[input.workStatus]||'전체 분석'}</span>`;
  $('[data-core-grid]').innerHTML=coreCards(d).map(([n,l,v,p])=>`<article class="work-core-card"><span>${n} · ${l}</span><strong>${v}</strong><p>${p}</p></article>`).join('');
  $('[data-strength-text]').innerHTML=strengthText(d);$('[data-pressure-text]').innerHTML=pressureText(d);
  $('[data-organization-axis]').innerHTML=`<div class="axis-labels"><span>독립·자율</span><span>조직·기준</span></div><div class="axis-track"><div class="axis-fill" style="width:${d.orgIndex}%"></div><i class="axis-marker" style="left:${d.orgIndex}%"></i></div>`;$('[data-organization-text]').textContent=organizationText(d);
  $('[data-situation-heading]').textContent=situationHeading();
  $('[data-situation-text]').innerHTML=situationText(d).map(p=>`<p>${p}</p>`).join('');
  $('[data-money-narrative]').innerHTML=moneyNarrative(d).map(p=>`<p>${p}</p>`).join('');
  $('[data-money-grid]').innerHTML=moneyCards(d).map(([n,t,p])=>`<article class="money-card"><span>${n}</span><h3>${t}</h3><p>${p}</p></article>`).join('');
  $('[data-year-grid]').innerHTML=d.years.map(y=>`<article class="year-card"><small>${y.year} · ${y.god}</small><strong>${y.pillar}</strong><p>${yearText(d,y)}</p></article>`).join('');
  if(input.focus?.length){$('[data-focus-grid]').innerHTML=input.focus.map((k,i)=>`<article class="focus-result-card"><span>${String(i+1).padStart(2,'0')} · ${focusLabels[k]}</span><h3>${focusLabels[k]}</h3>${focusText(d,k).map(p=>`<p>${p}</p>`).join('')}</article>`).join('');}
  $('[data-guide-grid]').innerHTML=guides(d).map(([n,t,p])=>`<article class="work-guide-card"><span>${n}</span><strong>${t}</strong><p>${p}</p></article>`).join('');
  $('[data-total-summary]').innerHTML=totalSummary(d).map(p=>`<p>${p}</p>`).join('');$('[data-evidence]').innerHTML=evidence(d);
}

try{data=calculate();render(data);}catch(error){root.innerHTML=`<div class="work-result-container"><section class="work-report"><p class="work-label">CALCULATION ERROR</p><h1 style="font-size:26px;margin:0 0 12px">일과 재물 분석을 완료하지 못했습니다.</h1><p style="color:#756b67;line-height:1.7">입력 정보를 다시 확인해주세요.</p><a href="./work-money.html" class="work-button primary" style="display:inline-flex;align-items:center;text-decoration:none;margin-top:16px">입력 다시 하기</a></section></div>`;throw error;}

const copyBtn=$('[data-copy]'),pdfBtn=$('[data-pdf]'),saveBtn=$('[data-save]'),actionStatus=$('[data-action-status]');
copyBtn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(reportText(data));actionStatus.textContent='보고서용 텍스트를 복사했습니다.';}catch(e){actionStatus.textContent='복사하지 못했습니다. 브라우저 권한을 확인해주세요.';}});pdfBtn.addEventListener('click',()=>window.print());
onAuthStateChanged(auth,user=>{currentUser=user;saveBtn.textContent=!user?'로그인 후 저장':saved?'저장 완료':'마이페이지에 저장';});
saveBtn.addEventListener('click',async()=>{
  if(saved){actionStatus.innerHTML='이미 저장된 분석입니다. <a href="./mypage.html">마이페이지에서 보기</a>';return;}
  if(!currentUser){location.href='./login.html?next=./work-money-result.html';return;}
  saveBtn.disabled=true;saveBtn.textContent='저장 중…';
  try{const ref=await addDoc(collection(db,'users',currentUser.uid,'readings'),{type:'work-money',title:`${input.name}님의 일과 재물 분석`,input,summary:summary(data),dayMaster:data.dayStem,organizationIndex:data.orgIndex,wealthElement:elementName[data.wealthElement],wealthPct:data.wealthPct,focus:input.focus||[],reportText:reportText(data),createdAt:serverTimestamp()});saved=true;saveBtn.textContent='저장 완료';actionStatus.innerHTML=`정월록과 마이페이지에 저장했습니다. <a href="./archive.html?reading=${encodeURIComponent(ref.id)}">저장한 분석 보기</a>`;}catch(e){saveBtn.disabled=false;saveBtn.textContent='마이페이지에 저장';actionStatus.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';}
});
