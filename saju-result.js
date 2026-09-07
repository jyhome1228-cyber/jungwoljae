import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const raw=sessionStorage.getItem('jungwoljae_saju_input');
if(!raw){location.href='./saju.html';throw new Error('missing saju input');}
const input=JSON.parse(raw);
const root=document.querySelector('[data-saju-result]');
const $=s=>root.querySelector(s);
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
let currentUser=null,saved=false,data=null;

const stemInfo={
  갑:{element:'wood',polarity:'yang',hanja:'甲',title:'큰 나무처럼 방향을 세우는 갑목',text:'갑목은 시작과 성장, 방향을 세우는 힘으로 읽습니다. 스스로 기준을 만들고 앞으로 나아가려는 성향이 비교적 분명하게 드러날 수 있으며, 잘 쓰일 때는 추진력과 책임감으로 이어집니다. 반대로 방향을 너무 빨리 정하면 주변 상황을 충분히 살피지 못하거나 이미 세운 기준을 바꾸는 데 시간이 걸릴 수 있습니다.'},
  을:{element:'wood',polarity:'yin',hanja:'乙',title:'유연하게 길을 만드는 을목',text:'을목은 주변 환경을 읽고 유연하게 연결하는 힘으로 봅니다. 관계와 상황의 결을 세심하게 파악하는 편이며, 한 번에 밀어붙이기보다 가능한 길을 찾아가는 데 강점이 있습니다. 다만 선택지가 많아질수록 결정을 늦추거나 타인의 반응을 지나치게 의식할 수 있습니다.'},
  병:{element:'fire',polarity:'yang',hanja:'丙',title:'밖으로 밝히고 움직이는 병화',text:'병화는 표현과 확산, 밝게 드러내는 힘으로 읽습니다. 사람과 일 사이에서 에너지를 만들고 분위기를 움직이는 데 강점이 있으며, 실행이 빠른 편입니다. 다만 속도가 올라가면 세부를 놓치거나 감정과 판단이 동시에 앞서갈 수 있습니다.'},
  정:{element:'fire',polarity:'yin',hanja:'丁',title:'집중해서 밝히는 정화',text:'정화는 한곳을 깊게 비추고 정교하게 표현하는 힘으로 봅니다. 섬세한 관찰과 집중, 감정의 깊이가 장점으로 작용할 수 있습니다. 반대로 기준이 예민해질 때는 작은 변화에도 크게 반응하거나 생각을 오래 품을 수 있습니다.'},
  무:{element:'earth',polarity:'yang',hanja:'戊',title:'큰 땅처럼 중심을 잡는 무토',text:'무토는 안정과 수용, 중심을 잡는 힘으로 읽습니다. 여러 상황을 한곳에 모아 구조로 만드는 데 강점이 있고, 쉽게 흔들리지 않는 편입니다. 다만 변화가 필요한 시점에도 익숙한 방식을 오래 유지하거나 판단 속도가 늦어질 수 있습니다.'},
  기:{element:'earth',polarity:'yin',hanja:'己',title:'세밀하게 다듬고 기르는 기토',text:'기토는 작은 단위로 관리하고 돌보며 꾸준히 쌓아가는 힘으로 봅니다. 실무와 관리, 세심한 조율에서 강점이 드러나기 쉽습니다. 다만 책임을 오래 안고 가거나 주변 요구를 지나치게 흡수하면 피로가 누적될 수 있습니다.'},
  경:{element:'metal',polarity:'yang',hanja:'庚',title:'기준을 세우고 정리하는 경금',text:'경금은 판단과 결단, 필요 없는 것을 덜어내는 힘으로 읽습니다. 문제를 선명하게 보고 결론을 내리는 데 강점이 있으며, 책임이 분명한 상황에서 힘을 잘 씁니다. 반대로 기준이 강해질 때는 타협이 어렵거나 자신과 타인에게 지나치게 엄격해질 수 있습니다.'},
  신:{element:'metal',polarity:'yin',hanja:'辛',title:'정교하게 구분하는 신금',text:'신금은 정밀함과 구분, 완성도를 높이는 힘으로 봅니다. 세부 기준이 분명하고 품질을 다듬는 데 강점이 있습니다. 다만 완벽하게 정리되기 전에는 쉽게 움직이지 못하거나 작은 오류에 민감해질 수 있습니다.'},
  임:{element:'water',polarity:'yang',hanja:'壬',title:'큰 흐름을 읽고 움직이는 임수',text:'임수는 넓게 보고 흐름을 읽으며 새로운 가능성을 연결하는 힘으로 봅니다. 변화에 적응하고 여러 정보를 한꺼번에 다루는 데 강점이 있습니다. 다만 방향이 많아질수록 집중이 분산되거나 결정이 늦어질 수 있습니다.'},
  계:{element:'water',polarity:'yin',hanja:'癸',title:'세밀하게 관찰하고 축적하는 계수',text:'계수는 관찰과 기록, 작은 신호를 읽는 힘으로 봅니다. 섬세한 정보와 감정의 차이를 잘 감지하고 준비하는 데 강점이 있습니다. 다만 생각이 안쪽으로 길어지면 실행 시점을 놓치거나 불확실성을 오래 품을 수 있습니다.'}
};
const branchInfo={자:{element:'water',polarity:'yang'},축:{element:'earth',polarity:'yin'},인:{element:'wood',polarity:'yang'},묘:{element:'wood',polarity:'yin'},진:{element:'earth',polarity:'yang'},사:{element:'fire',polarity:'yin'},오:{element:'fire',polarity:'yang'},미:{element:'earth',polarity:'yin'},신:{element:'metal',polarity:'yang'},유:{element:'metal',polarity:'yin'},술:{element:'earth',polarity:'yang'},해:{element:'water',polarity:'yin'}};
const elementName={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};
const elementKeywords={wood:'성장·방향',fire:'표현·실행',earth:'안정·관리',metal:'판단·정리',water:'관찰·유연'};
const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
const focusLabels={personality:'나의 성향',future:'앞으로의 흐름',career:'일과 직업',money:'재물',love:'연애와 인연',people:'가족과 인간관계',change:'변화와 이동'};
const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));

function pillarString(v){return typeof v==='string'?v:(v?.korean||v?.name||'');}
function parseTime(){if(input.birthTimeUnknown||!input.birthTime)return {hour:12,minute:0,known:false};const [hour,minute]=input.birthTime.split(':').map(Number);return {hour,minute,known:true};}
function calculate(){
  const [year,month,day]=input.birthDate.split('-').map(Number),time=parseTime();
  const r=calculateFourPillars({year,month,day,hour:time.hour,minute:time.minute,isLunar:input.calendarType==='lunar',isLeapMonth:Boolean(input.isLeapMonth),gender:input.gender||undefined});
  const o=typeof r?.toObject==='function'?r.toObject():r;
  const pillars={year:pillarString(o?.year),month:pillarString(o?.month),day:pillarString(o?.day),hour:pillarString(o?.hour)};
  const dayStem=[...pillars.day][0],dayBranch=[...pillars.day][1],dm=stemInfo[dayStem];
  if(!dm)throw new Error('day master missing');
  const scores={wood:0,fire:0,earth:0,metal:0,water:0};let yang=0,yin=0;
  const used=['year','month','day',...(time.known?['hour']:[])];
  used.forEach(k=>{const chars=[...pillars[k]];const s=stemInfo[chars[0]],b=branchInfo[chars[1]];if(s){scores[s.element]+=1;s.polarity==='yang'?yang++:yin++;}if(b){scores[b.element]+=1.1;b.polarity==='yang'?yang++:yin++;}});
  if(pillars.month){const mb=branchInfo[[...pillars.month][1]];if(mb)scores[mb.element]+=0.9;}
  const total=Object.values(scores).reduce((a,b)=>a+b,0)||1,pct={};Object.keys(scores).forEach(k=>pct[k]=Math.round(scores[k]/total*100));
  const diff=100-Object.values(pct).reduce((a,b)=>a+b,0);pct.wood+=diff;
  const order=Object.keys(pct).sort((a,b)=>pct[b]-pct[a]);
  const tenGods=used.map(k=>({pillar:k,stem:[...pillars[k]][0],god:tenGod(dayStem,[...pillars[k]][0])}));
  const years=yearFlows(dayStem,dayBranch);
  return {pillars,timeKnown:time.known,dayStem,dayBranch,dm,scores,pct,order,strongest:order[0],weakest:order.at(-1),yang,yin,tenGods,years};
}
function tenGod(dayStem,targetStem){
  const d=stemInfo[dayStem],t=stemInfo[targetStem];if(!d||!t)return '미상';
  const samePol=d.polarity===t.polarity;
  if(d.element===t.element)return samePol?'비견':'겁재';
  if(generates[d.element]===t.element)return samePol?'식신':'상관';
  if(controls[d.element]===t.element)return samePol?'편재':'정재';
  if(controls[t.element]===d.element)return samePol?'편관':'정관';
  if(generates[t.element]===d.element)return samePol?'편인':'정인';
  return '미상';
}
function godGroup(g){if(['비견','겁재'].includes(g))return '비겁';if(['식신','상관'].includes(g))return '식상';if(['편재','정재'].includes(g))return '재성';if(['편관','정관'].includes(g))return '관성';if(['편인','정인'].includes(g))return '인성';return '기타';}
function yearPillar(y){const r=calculateFourPillars({year:y,month:7,day:1,hour:12,minute:0,isLunar:false});const o=typeof r?.toObject==='function'?r.toObject():r;return pillarString(o?.year);}
function yearFlows(dayStem,dayBranch){
  const now=new Intl.DateTimeFormat('en',{timeZone:'Asia/Seoul',year:'numeric'}).format(new Date());const current=Number(now);
  return [current,current+1].map(y=>{const p=yearPillar(y),s=[...p][0],b=[...p][1],god=tenGod(dayStem,s);let relation='평이한 흐름';if(pairHas(yukhap,dayBranch,b))relation='일지와 육합';else if(pairHas(chung,dayBranch,b))relation='일지와 충';else if(dayBranch===b)relation='일지와 같은 지지';return {year:y,pillar:p,stem:s,branch:b,god,relation};});
}
function summary(d){return `${input.name}님의 사주는 ${d.dm.title}을 중심으로, ${elementName[d.strongest]}(${elementKeywords[d.strongest]})의 기운이 상대적으로 두드러지고 ${elementName[d.weakest]}(${elementKeywords[d.weakest]})의 역할은 의식적으로 보완할 부분으로 읽힙니다. 전체적으로는 타고난 중심과 익숙한 방식이 분명한 편이지만, 한 가지 강점을 계속 밀어붙이기보다 부족한 역할을 생활 구조 안에 넣을 때 균형이 좋아집니다.`;}
function balanceCopy(d){const yy=d.yang===d.yin?'음과 양의 비중이 비교적 비슷합니다.':d.yang>d.yin?'양의 비중이 조금 더 높아 외부로 움직이고 반응하는 힘이 먼저 드러날 수 있습니다.':'음의 비중이 조금 더 높아 관찰하고 안쪽에서 정리한 뒤 움직이는 편이 자연스러울 수 있습니다.';return `${yy} 오행에서는 ${elementName[d.strongest]}이 가장 크게 드러나며 ${elementName[d.weakest]}은 상대적으로 적습니다. 다만 오행의 많고 적음만으로 길흉을 정하지 않고, 일간과 다른 기운이 서로 어떤 역할을 주고받는지를 함께 봅니다.`;}
function tenGodCards(d){
  const groups={비겁:0,식상:0,재성:0,관성:0,인성:0};d.tenGods.forEach(x=>{const g=godGroup(x.god);if(groups[g]!=null)groups[g]++;});
  const copy={비겁:'나의 의지·독립성·경쟁과 협업을 다루는 방식',식상:'생각을 밖으로 표현하고 실행하며 결과를 만드는 방식',재성:'현실 감각·재물·관리와 교환을 다루는 방식',관성:'책임·규칙·조직과 압력을 받아들이는 방식',인성:'배움·정보·보호·생각을 축적하는 방식'};
  return {groups,cards:Object.keys(groups).map(g=>({g,count:groups[g],text:copy[g]}))};
}
function tenGodSummary(d,tg){const top=Object.keys(tg.groups).sort((a,b)=>tg.groups[b]-tg.groups[a])[0];return `보이는 천간의 관계에서는 ${top} 영역이 상대적으로 자주 드러납니다. 이는 ${tg.cards.find(x=>x.g===top).text}이 삶에서 반복적으로 중요한 주제가 되기 쉽다는 뜻으로 읽을 수 있습니다. 현재 리포트는 천간 중심의 1차 분석이므로 지장간 전체와 격국을 임의로 확정하지 않습니다.`;}
function lifeCards(d){
  const s=elementName[d.strongest],w=elementName[d.weakest];
  return [
    ['01','생각과 행동',`${d.dm.title}의 성향이 기본 중심을 잡습니다. 여기에 ${s} 기운이 강하게 작동해 익숙한 방식에서는 판단과 행동이 비교적 자연스럽게 이어질 수 있습니다. 다만 선택이 반복될수록 ${w}이 담당하는 역할을 일부러 넣어보는 것이 한쪽으로 치우치는 것을 줄입니다.`],
    ['02','일과 직업',`${elementKeywords[d.strongest]}의 힘이 업무에서 장점으로 쓰이기 쉽습니다. 처음부터 직업명을 정해주는 방식보다, 어떤 환경에서 힘이 오래 유지되는지를 보는 편이 맞습니다. 스스로 결정할 범위와 반복 가능한 구조가 함께 있을 때 강점이 더 안정적으로 유지됩니다.`],
    ['03','재물과 현실',`재물은 한 요소만으로 많고 적음을 단정하지 않습니다. 다만 현재 구조에서는 ${s}의 방식으로 기회를 잡거나 판단하기 쉽고, ${w}의 역할이 약해질 때 관리·기록·중단 기준 중 하나가 빠질 수 있습니다. 돈을 다룰 때는 감각보다 숫자와 규칙을 남기는 편이 안정적입니다.`],
    ['04','관계와 감정',`관계에서도 일간의 방식이 가장 먼저 드러납니다. 가까운 사람에게는 익숙한 반응을 반복하기 쉽기 때문에, 내 속도와 상대의 속도가 다를 수 있다는 점을 의식하는 것이 중요합니다. 관계의 좋고 나쁨보다 어떤 상황에서 긴장이 생기는지를 보는 것이 더 유용합니다.`]
  ];
}
function flowText(d,yf){const g=godGroup(yf.god);const rel=yf.relation==='일지와 육합'?'사람·환경과 연결이 자연스럽게 만들어질 수 있는 요소가 있습니다.':yf.relation==='일지와 충'?'기존 방식과 다른 요구가 들어오며 변화 압력이 커질 수 있습니다.':yf.relation==='일지와 같은 지지'?'익숙한 성향과 반복 패턴이 더 분명하게 드러날 수 있습니다.':'강한 합이나 충보다 내 선택 방식에 따라 체감이 달라질 가능성이 큽니다.';const theme={비겁:'내 선택과 독립성',식상:'표현과 실행',재성:'현실·재물·관리',관성:'책임과 조직',인성:'배움과 정리'}[g]||'생활의 균형';return `${yf.year}년 ${yf.pillar}의 천간은 일간과 ${yf.god} 관계로 읽혀 ${theme}가 비교적 눈에 띄는 주제가 될 수 있습니다. ${rel} 미래를 단정하기보다 이 주제가 들어왔을 때 어떤 방식으로 대응하는지 관찰하는 편이 좋습니다.`;}
function focusCopy(key,d){
  const s=elementName[d.strongest],w=elementName[d.weakest],dm=d.dm.title;
  const map={
    personality:[`성향의 중심은 ${dm}입니다. 익숙한 환경에서는 ${s} 기운의 방식이 빠르게 드러나고, 낯선 상황에서는 그 강점을 지키려는 경향이 생길 수 있습니다.`,`장점은 이미 잘 쓰는 힘을 선명하게 사용할 수 있다는 점입니다. 반대로 같은 방식이 반복되면 시야가 좁아질 수 있으므로 ${w}의 역할을 생활에 의도적으로 넣는 것이 중요합니다.`,`사주를 성격 유형처럼 고정해서 보기보다, 내가 어떤 상황에서 어떤 방식으로 반응하는지 확인하는 도구로 쓰는 것이 더 적합합니다.`],
    career:[`일에서는 ${elementKeywords[d.strongest]}의 역할이 자연스럽게 드러납니다. 역할과 책임이 애매한 환경보다 내가 해야 할 일이 분명하거나, 스스로 기준을 세울 수 있는 환경에서 강점이 더 잘 보일 수 있습니다.`,`조직형인지 독립형인지 하나로 단정하기보다 자율성과 구조의 균형을 보는 편이 맞습니다. 너무 자유로운 환경에서는 ${w}의 역할이 빠질 수 있고, 지나치게 통제된 환경에서는 일간의 장점이 답답하게 느껴질 수 있습니다.`,`커리어 선택에서는 직업명보다 ‘결정권의 범위, 반복 구조, 협업 밀도, 결과를 확인하는 방식’을 기준으로 비교해보는 것이 좋습니다.`],
    money:[`재물에서는 기회를 잡는 능력보다 돈을 다루는 반복 방식이 중요합니다. 현재 명식은 ${s}의 방식으로 판단이 빨라질 수 있고, ${w}의 역할이 약해질 때 관리 기준이 느슨해질 수 있습니다.`,`큰돈이 들어오는 시기를 단정하기보다 수입·지출·저축·투자 각각에 어떤 규칙을 두는지가 더 중요합니다. 특히 즉흥적인 판단과 장기 계획을 분리해서 보는 습관이 도움이 됩니다.`,`재물운을 결과 예언으로 보기보다 내가 돈을 어떤 방식으로 벌고 지키는지 이해하는 자료로 쓰는 편이 정월재의 해석 원칙에 맞습니다.`],
    love:[`연애에서는 일간의 표현 방식과 관계 속도가 핵심입니다. 가까워질수록 익숙한 ${s}의 방식이 먼저 나오기 때문에 상대가 다른 속도를 갖고 있으면 오해가 생길 수 있습니다.`,`잘 맞는 사람을 하나의 유형으로 단정하기보다, 내가 감정을 표현하는 속도와 상대가 반응하는 속도가 얼마나 조율되는지를 보는 것이 더 중요합니다.`,`관계가 편안하려면 나의 강한 방식만 밀어붙이기보다 ${w}이 담당하는 역할을 일부러 넣어주는 것이 도움이 됩니다.`],
    people:[`가족과 가까운 관계에서는 책임감과 익숙함이 동시에 작동하기 쉽습니다. 오래 본 사람일수록 설명 없이 알아주길 기대하거나 내 기준을 자연스럽게 적용할 수 있습니다.`,`관계에서 반복되는 부담을 줄이려면 역할을 나누고, 말하지 않아도 알 것이라는 전제를 줄이는 것이 중요합니다. ${w}의 역할을 의식하면 거리 조절과 감정 정리가 쉬워질 수 있습니다.`,`좋은 관계를 유지하는 핵심은 상대를 맞추는 것이 아니라 내가 반복하는 반응을 알아차리는 데 있습니다.`],
    change:[`변화와 이동에서는 새 환경 자체보다 내가 통제할 수 있는 범위를 얼마나 확보하는지가 중요합니다. ${s} 기운의 장점은 새로운 조건에서 빠르게 힘을 낼 수 있게 하지만, 준비 없이 움직이면 ${w}의 역할이 빠지기 쉽습니다.`,`이직·이사·새 프로젝트처럼 변화가 필요한 상황에서는 ‘무엇을 떠날지’보다 ‘다음 환경에서 유지할 기준이 무엇인지’를 먼저 정하는 편이 좋습니다.`,`변화가 맞다·아니다를 단정하기보다 준비 정도와 지속 가능한 구조를 기준으로 판단하는 것이 현재 명식에 더 안정적인 방식입니다.`],
    future:[`${d.years[0].year}년과 ${d.years[1].year}년은 서로 다른 천간·지지의 주제가 들어옵니다. 올해는 ${godGroup(d.years[0].god)}의 성격이, 다음 해에는 ${godGroup(d.years[1].god)}의 성격이 상대적으로 눈에 띌 수 있습니다.`,`현재 흐름을 미래 결과로 단정하지 않고, 각 시기에 어떤 주제가 반복해서 등장하는지를 보는 것이 중요합니다. 올해의 과제와 다음 해의 과제를 구분하면 선택을 한꺼번에 해결하려는 부담이 줄어듭니다.`,`특히 ${elementName[d.weakest]}의 역할을 생활 구조 안에 넣는 것이 두 해 모두 공통적인 균형 장치가 됩니다.`]
  };
  return map[key]||[];
}
function finalSummary(d){return [`${input.name}님의 사주는 ${d.dm.title}을 중심으로 움직입니다. 가장 강한 ${elementName[d.strongest]}의 기운은 삶에서 이미 자연스럽게 쓰이는 장점이지만, 강점이 반복될수록 같은 방식만 선택할 가능성도 함께 커집니다.`,`반대로 ${elementName[d.weakest]}의 기운은 부족하다는 이유만으로 채워야 하는 대상이 아니라, 필요한 상황에서 의식적으로 역할을 만들어줄 부분입니다. 일·재물·관계 모두에서 이 균형을 생활 습관과 선택 기준으로 연결하는 것이 중요합니다.`,`사주는 미래를 대신 결정하는 답이라기보다 내가 어떤 방식으로 움직이고 어떤 조건에서 균형을 잃는지 이해하기 위한 하나의 구조입니다. 정월재는 명식에서 확인되는 공통 기준을 바탕으로 각 영역의 해석이 서로 모순되지 않도록 정리합니다.`];}
function reportText(d){const tg=tenGodCards(d),lines=['정월재 종합 사주 리포트',`대상: ${input.name}`,`기준: ${input.birthDate} · ${input.calendarType==='lunar'?'음력':'양력'} · ${d.timeKnown?input.birthTime:'출생시간 모름'}`,'', '1. 종합 요약',summary(d),'','2. 사주팔자',`연주 ${d.pillars.year} / 월주 ${d.pillars.month} / 일주 ${d.pillars.day}${d.timeKnown?` / 시주 ${d.pillars.hour}`:''}`,'','3. 일간',d.dm.title,d.dm.text,'','4. 음양오행',balanceCopy(d),''];Object.keys(d.pct).forEach(k=>lines.push(`${elementName[k]} ${d.pct[k]}%`));lines.push('','5. 십성',tenGodSummary(d,tg),'','6. 생활 구조');lifeCards(d).forEach(x=>lines.push(`${x[1]}: ${x[2]}`));lines.push('','7. 연도 흐름');d.years.forEach(y=>lines.push(`${y.year}년: ${flowText(d,y)}`));if(input.focus?.length){lines.push('','8. 관심 영역 심화');input.focus.forEach(k=>{lines.push(focusLabels[k]);focusCopy(k,d).forEach(p=>lines.push(p));lines.push('');});}lines.push('정월재 총 요약',...finalSummary(d),'','※ 본 리포트는 전통 명리학 이론을 바탕으로 한 해석 콘텐츠이며 특정 미래 결과를 보장하지 않습니다.');return lines.join('\n');}
function render(d){
  $('[data-name]').textContent=input.name;$('[data-summary]').textContent=summary(d);$('[data-meta]').innerHTML=`<span>${input.birthDate}</span><span>${input.calendarType==='lunar'?'음력':'양력'}</span><span>${d.timeKnown?input.birthTime:'출생시간 미입력'}</span><span>일간 ${d.dm.hanja} ${d.dayStem}</span>`;
  const labels={year:'연주',month:'월주',day:'일주',hour:'시주'};$('[data-pillar-board]').innerHTML=Object.entries(d.pillars).filter(([k])=>d.timeKnown||k!=='hour').map(([k,v])=>`<article class="pillar-card"><span>${labels[k]}</span><strong>${v||'—'}</strong><em>${k==='day'?'나의 중심':'명식 구성'}</em></article>`).join('');$('[data-pillar-caption]').textContent=d.timeKnown?'출생시간까지 포함한 네 기둥을 기준으로 읽었습니다.':'출생시간이 없어 시주는 제외하고 연·월·일 세 기둥을 중심으로 읽었습니다.';
  $('[data-daymaster-symbol]').textContent=d.dm.hanja;$('[data-daymaster-title]').textContent=d.dm.title;$('[data-daymaster-text]').textContent=d.dm.text;
  $('[data-yinyang]').innerHTML=`<div class="yy-row"><span>陽 양</span><strong>${d.yang}</strong></div><div class="yy-row"><span>陰 음</span><strong>${d.yin}</strong></div>`;$('[data-elements]').innerHTML=d.order.map(k=>`<div class="element-row"><label>${elementName[k]} · ${elementKeywords[k]}</label><div class="track"><div class="fill" style="width:${Math.min(100,d.pct[k]*3.2)}%"></div></div><b>${d.pct[k]}%</b></div>`).join('');$('[data-balance-copy]').textContent=balanceCopy(d);
  const tg=tenGodCards(d);$('[data-ten-gods]').innerHTML=tg.cards.map(x=>`<article class="ten-god-card ${x.count?'active':''}"><span>${x.g}</span><strong>${x.count}회</strong><p>${x.text}</p></article>`).join('');$('[data-ten-god-summary]').textContent=tenGodSummary(d,tg);
  $('[data-life-grid]').innerHTML=lifeCards(d).map(([n,t,p])=>`<article class="life-card"><span>${n}</span><h3>${t}</h3><p>${p}</p></article>`).join('');$('[data-year-flow]').innerHTML=d.years.map(y=>`<article class="year-card"><span>${y.year} YEAR FLOW</span><h3>${y.pillar}</h3><strong>${y.god} · ${y.relation}</strong><p>${flowText(d,y)}</p></article>`).join('');
  if(input.focus?.length){const sec=$('[data-focus-section]');sec.hidden=false;$('[data-focus-reading]').innerHTML=input.focus.map((k,i)=>`<article class="focus-reading-card"><span>${String(i+1).padStart(2,'0')} · ${focusLabels[k]}</span><h3>${focusLabels[k]}</h3>${focusCopy(k,d).map(p=>`<p>${p}</p>`).join('')}</article>`).join('');}
  const sItems=[['01','나의 중심',d.dm.title],['02','강하게 쓰이는 힘',`${elementName[d.strongest]} · ${elementKeywords[d.strongest]}`],['03','균형이 필요한 힘',`${elementName[d.weakest]} · ${elementKeywords[d.weakest]}`],['04','현재 연도 주제',`${d.years[0].god} · ${d.years[0].relation}`],['05','해석의 기준','강점과 부담을 함께 보기']];$('[data-summary-grid]').innerHTML=sItems.map(([n,l,v])=>`<article class="summary-card"><span>${n} · ${l}</span><strong>${v}</strong></article>`).join('');$('[data-summary-prose]').innerHTML=finalSummary(d).map(p=>`<p>${p}</p>`).join('');
  $('[data-evidence]').innerHTML=`<p><strong>명식 산출</strong> · 절기·음양력 기준 만세력 계산으로 연주·월주·일주${d.timeKnown?'·시주':''}를 구성했습니다.</p><p><strong>일간</strong> · 일주의 천간 ${d.dayStem}을 해석의 중심으로 두었습니다.</p><p><strong>오행</strong> · 천간과 지지의 표면 오행에 월지의 계절 가중을 추가해 상대 강도를 계산했습니다.</p><p><strong>십성</strong> · 현재 버전은 보이는 천간과 일간의 생극·음양 관계를 중심으로 분류합니다. 지장간 전체나 격국·용신은 임의로 확정하지 않습니다.</p><p><strong>연도 흐름</strong> · 현재 연도와 다음 연도의 세운 천간·지지를 일간·일지와 비교한 참고 해석입니다.</p>`;
}
try{data=calculate();render(data);}catch(e){root.innerHTML='<div class="saju-container"><section class="saju-report"><h1 style="font-size:26px">종합 사주를 계산하지 못했습니다.</h1><p>입력한 날짜와 달력 기준을 다시 확인해주세요.</p><a class="saju-button primary" href="./saju.html">입력 다시 하기</a></section></div>';throw e;}

const copyBtn=$('[data-copy]'),pdfBtn=$('[data-pdf]'),saveBtn=$('[data-save]'),actionStatus=$('[data-action-status]');copyBtn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(reportText(data));actionStatus.textContent='보고서용 텍스트를 복사했습니다.';}catch(e){actionStatus.textContent='복사하지 못했습니다. 브라우저 권한을 확인해주세요.';}});pdfBtn.addEventListener('click',()=>window.print());onAuthStateChanged(auth,user=>{currentUser=user;saveBtn.textContent=!user?'로그인 후 저장':saved?'저장 완료':'마이페이지에 저장';});saveBtn.addEventListener('click',async()=>{if(saved){actionStatus.innerHTML='이미 저장된 분석입니다. <a href="./mypage.html">마이페이지에서 보기</a>';return;}if(!currentUser){location.href='./login.html?next=./saju-result.html';return;}saveBtn.disabled=true;saveBtn.textContent='저장 중…';try{const ref=await addDoc(collection(db,'users',currentUser.uid,'readings'),{type:'saju',title:`${input.name}님의 종합 사주`,input,summary:summary(data),pillars:data.pillars,dayMaster:data.dayStem,elements:data.pct,focus:input.focus||[],reportText:reportText(data),createdAt:serverTimestamp()});saved=true;saveBtn.textContent='저장 완료';actionStatus.innerHTML=`정월록과 마이페이지에 저장했습니다. <a href="./archive.html?reading=${encodeURIComponent(ref.id)}">저장한 사주 보기</a>`;}catch(e){saveBtn.disabled=false;saveBtn.textContent='마이페이지에 저장';actionStatus.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';}});