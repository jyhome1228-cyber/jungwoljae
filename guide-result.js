import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const raw=sessionStorage.getItem('jungwoljae_guide_input');
if(!raw){location.href='./guide.html';throw new Error('missing guide input');}
const input=JSON.parse(raw);
const root=document.querySelector('[data-guide-result]');
const $=s=>root.querySelector(s);
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
let currentUser=null,saved=false,reportData=null;

const stems={
  갑:{element:'wood',polarity:'yang'},을:{element:'wood',polarity:'yin'},병:{element:'fire',polarity:'yang'},정:{element:'fire',polarity:'yin'},무:{element:'earth',polarity:'yang'},기:{element:'earth',polarity:'yin'},경:{element:'metal',polarity:'yang'},신:{element:'metal',polarity:'yin'},임:{element:'water',polarity:'yang'},계:{element:'water',polarity:'yin'}
};
const branches={자:'water',축:'earth',인:'wood',묘:'wood',진:'earth',사:'fire',오:'fire',미:'earth',신:'metal',유:'metal',술:'earth',해:'water'};
const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
const elementEasy={
  wood:{label:'시작하고 키우는 힘',desc:'새로운 일을 시작하고 방향을 정하는 힘이 비교적 자연스럽습니다.',risk:'시작은 빠른데 마무리나 반복 관리가 뒤로 밀릴 수 있습니다.',action:'할 일을 크게 잡기보다 시작일과 마감일을 같이 정해두는 방식이 잘 맞습니다.'},
  fire:{label:'표현하고 움직이는 힘',desc:'생각을 밖으로 보여주고 사람과 상황을 움직이는 힘이 비교적 자연스럽습니다.',risk:'감정이나 분위기에 따라 결정 속도가 너무 빨라질 수 있습니다.',action:'큰 결정은 바로 확정하기보다 하루 정도 두고 다시 보는 편이 좋습니다.'},
  earth:{label:'안정시키고 관리하는 힘',desc:'흩어진 일을 정리하고 꾸준히 유지하는 힘이 비교적 자연스럽습니다.',risk:'익숙한 방식을 오래 붙잡아 변화 시점을 늦출 수 있습니다.',action:'변화를 고민할 때는 막연한 불안보다 유지 비용과 바뀌는 조건을 숫자로 비교해보세요.'},
  metal:{label:'판단하고 정리하는 힘',desc:'무엇이 필요한지 구분하고 기준을 세우는 힘이 비교적 자연스럽습니다.',risk:'기준이 높아져 완벽한 답이 나올 때까지 결정을 미룰 수 있습니다.',action:'필수 조건 3개와 포기할 조건 2개를 미리 적어두면 판단이 훨씬 쉬워집니다.'},
  water:{label:'살피고 연결하는 힘',desc:'정보와 분위기를 먼저 살피고 여러 가능성을 비교하는 힘이 비교적 자연스럽습니다.',risk:'생각과 비교가 길어지면 실제 행동 시점을 놓칠 수 있습니다.',action:'조사할 기간을 먼저 정하고 그 날짜가 지나면 작은 행동 하나를 반드시 시작하는 편이 좋습니다.'}
};
const groupEasy={
  비겁:{label:'내 기준과 주도권',desc:'남의 기준보다 내가 납득해야 움직이는 편입니다. 스스로 결정할 여지가 있을 때 힘이 잘 붙습니다.'},
  식상:{label:'표현과 실행',desc:'생각을 결과물로 꺼내고 직접 해보면서 답을 찾는 편입니다. 머릿속 고민만 길어질 때보다 작은 실행이 도움이 됩니다.'},
  재성:{label:'현실과 돈의 기준',desc:'시간, 돈, 효율처럼 실제 조건을 따져보는 편입니다. 판단할 때 감정보다 숫자를 적어보면 도움이 됩니다.'},
  관성:{label:'책임과 안정',desc:'역할과 책임이 분명해야 마음이 놓이는 편입니다. 불확실성이 큰 선택에서는 안전장치를 먼저 찾는 경향이 있습니다.'},
  인성:{label:'준비와 정보',desc:'충분히 이해하고 준비한 뒤 움직이는 편입니다. 정보가 많아질수록 오히려 결정이 늦어질 수 있어 조사 종료 시점을 정하는 것이 중요합니다.'}
};
const yearEasy={
  비견:'내가 직접 결정하고 주도할 일이 늘어나는 시기',겁재:'사람과 경쟁, 역할 분배를 신경 써야 하는 시기',식신:'결과물을 꾸준히 만들고 보여주는 시기',상관:'기존 방식을 바꾸거나 새로운 방법을 시도하기 쉬운 시기',편재:'새로운 거래나 기회를 넓게 살피는 시기',정재:'수입·지출과 현실 조건을 안정적으로 정리하는 시기',편관:'압박과 책임이 커질 수 있어 우선순위가 중요한 시기',정관:'역할과 기준을 분명히 할수록 안정되는 시기',편인:'새로운 정보와 아이디어가 많아지는 시기',정인:'공부·준비·전문성을 쌓기 좋은 시기'
};

const domainRules={
  work:{core:'지금은 “그만둘까 말까”보다 어떤 조건이면 움직일지를 먼저 정하는 것이 중요합니다.',checks:[['현재와 새 선택의 조건','연봉, 실제 업무시간, 맡을 역할, 성장 가능성을 같은 표에 놓고 비교해보세요.'],['힘든 이유의 재발 가능성','지금 힘든 이유가 회사 때문인지, 업무 방식 때문인지, 내 반복 습관 때문인지 구분해야 같은 문제가 반복되는 것을 줄일 수 있습니다.'],['1년 뒤 남는 것','직함보다 1년 뒤 이 선택에서 남을 경험, 포트폴리오, 수입 구조가 무엇인지 적어보세요.'],['감당 가능한 위험','최악의 경우 몇 달을 버틸 수 있는지 생활비와 고정비를 기준으로 계산해보세요.']],actions:[['비교표 만들기','현재 선택과 새 선택을 수입·시간·역할·성장 4가지로 비교하세요.'],['결정 시한 정하기','계속 고민만 하지 않도록 “언제까지 알아보고 결정할지” 날짜를 정하세요.'],['작게 시험하기','퇴사나 독립을 바로 결정하기 전에 사이드 프로젝트, 면접, 외부 제안으로 가능성을 먼저 확인하세요.']],warning:['힘든 감정이 큰 날 바로 퇴사 결정을 확정하는 것은 피하는 편이 좋습니다.','반대로 완벽한 회사나 완벽한 확신이 생길 때까지 기다리면 이동 시점을 놓칠 수 있습니다.']},
  money:{core:'지금은 운보다 숫자가 먼저입니다. 돈 문제는 “얼마나 벌까”보다 얼마나 남기고 감당할 수 있는지부터 보는 편이 맞습니다.',checks:[['매달 남는 돈','최근 3개월 수입과 고정비, 반복 지출을 적어 실제로 매달 얼마가 남는지 확인하세요.'],['최악의 손실','큰 지출이나 투자는 기대 수익보다 먼저 잃어도 생활이 흔들리지 않는 금액인지 확인해야 합니다.'],['회수 기간','사업·장비·교육비처럼 큰돈을 쓸 때는 몇 개월 안에 회수해야 하는지 기준을 정하세요.'],['결정 이유','필요해서 쓰는 돈인지, 불안·비교·조급함 때문에 쓰는 돈인지 구분해보세요.']],actions:[['3개월 기록 보기','카드·계좌 내역을 3개월만 묶어서 반복 지출부터 확인하세요.'],['상한선 정하기','투자나 큰 지출은 결정 전에 최대 사용 금액과 최대 손실 금액을 먼저 정하세요.'],['하루 유예하기','계획에 없던 큰 결제는 최소 하루 뒤 다시 보도록 규칙을 만드세요.']],warning:['“이번에 놓치면 끝”이라는 조급함은 돈 문제에서 가장 위험한 신호 중 하나입니다.','수익 가능성만 보고 고정비와 현금 보유 기간을 빼먹지 마세요.']},
  love:{core:'상대의 마음을 계속 추측하기보다 말과 행동이 반복해서 일치하는지를 보는 것이 답에 가깝습니다.',checks:[['연락보다 일관성','답장이 빠른지보다 약속을 지키고 다음 만남을 실제로 만드는지를 보세요.'],['내가 편안한가','설렘의 크기보다 이 사람 앞에서 눈치를 덜 보고 내 의견을 말할 수 있는지가 중요합니다.'],['갈등 뒤의 태도','싸우지 않는 관계보다 갈등 뒤에 설명하고 조정하려는 태도가 있는지를 보세요.'],['관계의 방향','애매한 관계가 오래 간다면 상대의 마음을 맞히기보다 내가 원하는 관계 형태와 기다릴 기간을 정하세요.']],actions:[['한 가지 직접 묻기','추측만 길어지는 부분이 있다면 가장 중요한 질문 하나만 직접 확인해보세요.'],['반복 행동 보기','한 번의 말보다 최근 몇 주 동안 연락·약속·배려가 꾸준했는지 보세요.'],['내 기준 적기','연락, 약속, 돈, 혼자만의 시간 중 내가 꼭 필요한 기준 3개를 정하세요.']],warning:['답장 한 번이나 말 한마디만으로 관계 전체를 단정하지 마세요.','상대의 사정만 이해하다가 내 불편함을 계속 미루는 것도 좋은 관계를 만드는 방식은 아닙니다.']},
  people:{core:'관계를 유지할지 끊을지보다, 먼저 어디까지 허용할지 경계를 정하는 것이 중요합니다.',checks:[['반복되는 불편함','한 번의 실수인지 같은 문제가 반복되는지 구분해보세요.'],['내가 계속 양보하는가','연락, 시간, 돈, 업무 중 늘 한쪽만 맞추고 있지 않은지 확인하세요.'],['말했을 때 반응','불편함을 설명했을 때 상대가 조정하려는지, 오히려 무시하거나 공격하는지를 보세요.'],['관계의 실제 필요','정 때문에 유지하는지, 업무나 가족처럼 현실적 연결이 있어 유지하는지 구분하면 거리 조절이 쉬워집니다.']],actions:[['작은 선부터 말하기','바로 관계를 끊기보다 이번 주에 불편한 한 가지부터 분명하게 말해보세요.'],['빈도 줄이기','완전한 단절이 부담스럽다면 연락과 만남 빈도를 먼저 줄여보세요.'],['기록 남기기','직장 관계라면 감정 대신 일정·업무·요청 내용을 문자나 메일로 남겨두는 것이 좋습니다.']],warning:['미안하다는 이유만으로 계속 내 경계를 내어주지 마세요.','한 번 화가 난 순간 모든 관계를 끊는 결정을 바로 내리는 것도 피하는 편이 좋습니다.']},
  change:{core:'변화 자체가 맞는지보다, 바꾸려는 이유와 감당해야 할 비용이 분명한지를 먼저 확인하세요.',checks:[['벗어나고 싶은 이유','지금 환경이 싫어서 떠나는지, 새 환경에서 얻고 싶은 것이 분명해서 움직이는지 구분해보세요.'],['현실 비용','이사·유학·이동에 드는 돈뿐 아니라 적응 기간과 수입 공백까지 계산하세요.'],['돌아올 선택지','완전히 끊기보다 다시 돌아올 수 있는 안전장치가 있는지 확인하면 결정 부담이 줄어듭니다.'],['6개월 뒤 모습','새 환경에서 6개월 뒤 어떤 생활을 하고 싶은지 구체적으로 적어보세요.']],actions:[['비용표 만들기','초기비용·월 고정비·수입 공백 기간을 숫자로 정리하세요.'],['시험 이동하기','가능하다면 단기 체류, 수업, 프로젝트처럼 작게 먼저 경험해보세요.'],['바꾸는 이유 한 줄로 쓰기','“무엇이 싫어서”가 아니라 “무엇을 얻기 위해” 움직이는지 한 문장으로 정리하세요.']],warning:['현재가 답답하다는 이유만으로 새 환경이 자동으로 좋아지는 것은 아닙니다.','준비만 계속하다가 실제로 경험해보는 시점을 놓치지 마세요.']},
  mind:{core:'지금은 인생의 답을 한 번에 찾기보다 생활 리듬과 결정 피로부터 줄이는 것이 먼저입니다.',checks:[['수면과 체력','생각의 문제가 아니라 잠과 체력이 무너져 판단력이 떨어진 상태인지 먼저 확인하세요.'],['해야 할 일의 양','모든 문제를 동시에 해결하려고 하면서 스스로를 압박하고 있지 않은지 보세요.'],['비교의 기준','내 속도보다 다른 사람의 성과를 기준으로 나를 평가하고 있지 않은지 확인하세요.'],['도움이 필요한 정도','불안이나 무기력이 일상 기능을 오래 방해한다면 사주 해석보다 전문가의 도움을 함께 고려하는 것이 좋습니다.']],actions:[['오늘 한 가지만 정하기','오늘 끝낼 일 하나만 정하고 나머지는 미뤄도 된다고 허용해보세요.'],['생활 리듬 복구','일주일 동안 수면·식사·산책 시간을 먼저 고정해보세요.'],['결정 수 줄이기','반복되는 작은 선택은 미리 규칙을 정해 생각할 일을 줄이세요.']],warning:['컨디션이 가장 나쁜 날 인생 전체를 평가하지 마세요.','쉬는 시간을 실패나 뒤처짐으로 해석하면 회복이 더 늦어질 수 있습니다.']},
  choice:{core:'완벽한 선택을 찾기보다 내가 중요하게 보는 기준을 먼저 정하면 답이 훨씬 선명해집니다.',checks:[['필수 조건 3개','절대 포기하기 어려운 조건 3개를 먼저 정하세요.'],['감수 가능한 단점','각 선택의 단점을 없애려 하지 말고 내가 감당할 수 있는 단점인지 보세요.'],['되돌릴 수 있는가','틀려도 다시 바꿀 수 있는 선택인지, 한 번 결정하면 되돌리기 어려운 선택인지 구분하세요.'],['1년 뒤 기준','지금 감정보다 1년 뒤 어떤 선택을 더 납득할 수 있을지 생각해보세요.']],actions:[['기준에 점수 매기기','중요한 기준 3개에 각 선택을 5점 만점으로 매겨보세요.'],['마감일 정하기','추가 정보가 실제 판단을 바꿀 가능성이 낮다면 결정 날짜를 정하세요.'],['작게 선택하기','가능하다면 전체를 걸기 전에 작은 계약, 체험, 단기 실행으로 먼저 확인하세요.']],warning:['모든 조건이 좋은 선택은 거의 없습니다. 단점을 없애려다 결정을 끝없이 미루지 마세요.','주변 사람의 확신이 내 기준을 대신하게 두지 마세요.']}
};

function pillarString(v){return typeof v==='string'?v:(v?.korean||v?.name||'');}
function parseTime(){if(input.birthTimeUnknown||!input.birthTime)return {hour:12,minute:0,known:false};const [hour,minute]=input.birthTime.split(':').map(Number);return {hour,minute,known:true};}
function tenGod(dayStem,targetStem){const d=stems[dayStem],t=stems[targetStem];if(!d||!t)return '미상';const same=d.polarity===t.polarity;if(d.element===t.element)return same?'비견':'겁재';if(generates[d.element]===t.element)return same?'식신':'상관';if(controls[d.element]===t.element)return same?'편재':'정재';if(controls[t.element]===d.element)return same?'편관':'정관';if(generates[t.element]===d.element)return same?'편인':'정인';return '미상';}
function group(g){if(['비견','겁재'].includes(g))return '비겁';if(['식신','상관'].includes(g))return '식상';if(['편재','정재'].includes(g))return '재성';if(['편관','정관'].includes(g))return '관성';if(['편인','정인'].includes(g))return '인성';return '인성';}
function calculate(){
  const [year,month,day]=input.birthDate.split('-').map(Number),time=parseTime();
  const result=calculateFourPillars({year,month,day,hour:time.hour,minute:time.minute,isLunar:input.calendarType==='lunar',isLeapMonth:Boolean(input.isLeapMonth),gender:input.gender||undefined});
  const o=typeof result?.toObject==='function'?result.toObject():result;
  const pillars={year:pillarString(o?.year),month:pillarString(o?.month),day:pillarString(o?.day),hour:pillarString(o?.hour)};
  const dayStem=[...pillars.day][0];
  const scores={wood:0,fire:0,earth:0,metal:0,water:0},groups={비겁:0,식상:0,재성:0,관성:0,인성:0};
  const used=['year','month','day',...(time.known?['hour']:[])];
  used.forEach(k=>{const [s,b]=[...pillars[k]];if(stems[s])scores[stems[s].element]+=1;if(branches[b])scores[branches[b]]+=1.1;const g=group(tenGod(dayStem,s));groups[g]=(groups[g]||0)+1;});
  if(pillars.month){const b=[...pillars.month][1];if(branches[b])scores[branches[b]]+=.9;}
  const strongest=Object.keys(scores).sort((a,b)=>scores[b]-scores[a])[0];
  const weakest=Object.keys(scores).sort((a,b)=>scores[a]-scores[b])[0];
  const dominantGroup=Object.entries(groups).sort((a,b)=>b[1]-a[1])[0]?.[0]||'인성';
  const now=new Date().getFullYear();const yr=calculateFourPillars({year:now,month:7,day:1,hour:12,minute:0,isLunar:false});const yo=typeof yr?.toObject==='function'?yr.toObject():yr;const yp=pillarString(yo?.year),yearGod=tenGod(dayStem,[...yp][0]);
  return {pillars,timeKnown:time.known,dayStem,strongest,weakest,dominantGroup,year:now,yearPillar:yp,yearGod};
}
function blockerSentence(){const labels=input.blockerLabels||[];if(!labels.length)return '무엇이 가장 걸리는지 먼저 정리하는 단계가 필요합니다.';if(labels.length===1)return `특히 ‘${labels[0]}’이 가장 큰 걸림돌로 보입니다.`;return `특히 ‘${labels[0]}’과 ‘${labels[1]}’을 동시에 만족시키려는 점이 결정을 어렵게 만들고 있습니다.`;}
function problemCopy(){return `<span>${input.domainLabel} · ${input.situationLabel}</span><strong>${input.situationLabel}</strong><p>${blockerSentence()} 그래서 정월도감은 결과를 맞히기보다, 이 두 조건을 실제 생활에서 어떻게 확인하고 결정할지를 중심으로 정리합니다.</p>`;}
function personalCards(d){const e=elementEasy[d.strongest],w=elementEasy[d.weakest],g=groupEasy[d.dominantGroup];return [
  ['01','자연스럽게 쓰는 방식',e.label,`${e.desc} ${e.action}`],
  ['02','결정할 때 자주 나타나는 모습',g.label,g.desc],
  ['03','지금 시기의 과제',yearEasy[d.yearGod]||'현실 조건을 다시 정리하는 시기',`${d.year}년은 ${yearEasy[d.yearGod]||'익숙한 방식만 반복하기보다 기준을 다시 세우는 시기'}로 참고할 수 있습니다. 중요한 결정일수록 조급하게 결론내기보다 실제 조건을 확인하세요.`]
];}
function reasonCopy(d){const e=elementEasy[d.strongest],w=elementEasy[d.weakest];return [
  `${input.name}님은 ${e.label}을 비교적 자연스럽게 쓰는 편입니다. ${e.risk} 그래서 지금처럼 중요한 고민에서는 장점이 오히려 결정 속도를 늦추거나 한쪽으로 치우치게 만들 수 있습니다.`,
  `${blockerSentence()} 이 두 가지를 모두 완벽하게 해결한 뒤 움직이려 하면 답이 더 멀어질 수 있습니다. 먼저 “반드시 필요한 조건”과 “어느 정도 감수할 수 있는 조건”을 나누는 편이 현실적입니다.`,
  `반대로 ${w.label}은 의식적으로 챙기면 좋은 부분입니다. ${w.action} 사주 용어 자체보다 이런 생활 습관으로 바꿔 적용하는 것이 정월도감의 목적입니다.`
];}
function answerCopy(rule,d){const e=elementEasy[d.strongest];return {headline:rule.core,paras:[`${input.name}님에게 필요한 것은 더 많은 예측보다 판단 기준을 줄이는 일에 가깝습니다. 지금 선택한 고민에서 가장 걸리는 것은 ${(input.blockerLabels||[]).join('과 ')}입니다. 이 조건을 실제 숫자나 행동으로 확인할 수 있게 바꾸면 생각이 훨씬 단순해집니다.`,`${e.label}이 강점으로 보이므로 그 힘은 그대로 쓰되, ${e.risk} 이 점만 조심하면 됩니다. 오늘 바로 결론을 내리지 않아도 괜찮지만, 아무 행동 없이 생각만 이어가는 것은 피하세요.`, `정월재의 제안은 “결정을 대신 맡기기”가 아니라 “내가 납득할 기준을 만드는 것”입니다. 위의 현실 확인 항목 중 가장 중요한 두 가지를 먼저 확인하고, 그 결과가 기준을 충족하면 움직이고 충족하지 않으면 보류하는 방식으로 정리해보세요.`]};}
function buildReport(d,rule){const checks=rule.checks.map((x,i)=>`${i+1}. ${x[0]}\n${x[1]}`).join('\n\n');const actions=rule.actions.map((x,i)=>`${i+1}. ${x[0]}\n${x[1]}`).join('\n\n');const ans=answerCopy(rule,d);return `정월도감 · ${input.domainLabel}\n${input.name}님의 고민: ${input.situationLabel}\n걸리는 점: ${(input.blockerLabels||[]).join(', ')}\n\n[지금 고민의 핵심]\n${rule.core}\n\n[현실에서 확인할 것]\n${checks}\n\n[지금 해볼 일]\n${actions}\n\n[조심할 판단]\n${rule.warning.join('\n')}\n\n[정월재의 답]\n${ans.headline}\n${ans.paras.join('\n\n')}\n\n※ 정월도감은 전통 명리를 참고해 선택의 기준을 정리하는 콘텐츠이며 중요한 법률·의료·투자 결정은 관련 전문가와 실제 조건을 함께 확인하세요.`;}
function render(d){
  const rule=domainRules[input.domain]||domainRules.choice;const ans=answerCopy(rule,d);
  $('[data-name]').textContent=input.name;$('[data-lead]').textContent=`‘${input.situationLabel}’ 고민을 사주의 판단 습관과 현재 선택 조건을 함께 놓고 정리했습니다.`;
  $('[data-meta]').innerHTML=`<span>${input.domainLabel}</span><span>${input.situationLabel}</span>${(input.blockerLabels||[]).map(x=>`<span>${x}</span>`).join('')}`;
  $('[data-problem]').innerHTML=problemCopy();
  $('[data-personal-grid]').innerHTML=personalCards(d).map(([n,l,t,p])=>`<article class="guide-personal-card"><span>${n} · ${l}</span><strong>${t}</strong><p>${p}</p></article>`).join('');
  $('[data-reason]').innerHTML=reasonCopy(d).map(p=>`<p>${p}</p>`).join('');
  $('[data-check-grid]').innerHTML=rule.checks.map((x,i)=>`<article class="guide-check-card"><span>${String(i+1).padStart(2,'0')}</span><strong>${x[0]}</strong><p>${x[1]}</p></article>`).join('');
  $('[data-action-grid]').innerHTML=rule.actions.map((x,i)=>`<article class="guide-action-card"><span>${i+1}</span><strong>${x[0]}</strong><p>${x[1]}</p></article>`).join('');
  $('[data-warning]').innerHTML=rule.warning.map(p=>`<p>${p}</p>`).join('');
  $('[data-answer]').innerHTML=`<strong>${ans.headline}</strong>${ans.paras.map(p=>`<p>${p}</p>`).join('')}`;
  $('[data-evidence]').innerHTML=`<p><strong>고민 맥락</strong> · 사용자가 선택한 ${input.domainLabel} / ${input.situationLabel} / ${(input.blockerLabels||[]).join('·')} 정보를 먼저 기준으로 잡았습니다.</p><p><strong>사주 기본 구조</strong> · 일간과 오행의 상대 강도, 보이는 천간의 십성 관계를 참고했습니다. 화면에서는 어려운 명리 용어 대신 생활 언어를 우선 사용합니다.</p><p><strong>현재 시기</strong> · ${d.year}년의 연간 천간을 일간과 비교해 현재의 참고 주제를 더했습니다. 미래 사건을 확정하거나 특정 결과를 보장하지 않습니다.</p>`;
  reportData={d,rule,reportText:buildReport(d,rule),answer:ans};
}

try{render(calculate());}catch(e){root.innerHTML='<div class="guide-result-container"><section class="guide-report"><h1>정월도감 결과를 만들지 못했습니다.</h1><p>입력한 생년월일과 달력 기준을 다시 확인해주세요.</p><a class="guide-button primary" href="./guide.html">다시 선택하기</a></section></div>';throw e;}

onAuthStateChanged(auth,user=>{currentUser=user||null;});
$('[data-copy]')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(reportData.reportText);$('[data-action-status]').textContent='정월도감 해답을 복사했습니다.';}catch(e){$('[data-action-status]').textContent='복사하지 못했습니다.';}});
$('[data-pdf]')?.addEventListener('click',()=>window.print());
$('[data-save]')?.addEventListener('click',async()=>{
  const status=$('[data-action-status]');if(saved){status.textContent='이미 정월록에 저장한 고민입니다.';return;}if(!currentUser){status.innerHTML='정월록 저장은 로그인이 필요합니다. <a href="./login.html">로그인하기</a>';return;}
  try{await addDoc(collection(db,'users',currentUser.uid,'readings'),{type:'guide',title:`정월도감 · ${input.domainLabel}`,summary:`${input.situationLabel} · ${(input.blockerLabels||[]).join(' · ')}`,domain:input.domain,domainLabel:input.domainLabel,situation:input.situation,situationLabel:input.situationLabel,blockers:input.blockers||[],blockerLabels:input.blockerLabels||[],reportText:reportData.reportText,createdAt:serverTimestamp()});saved=true;status.textContent='정월록과 마이페이지에 저장했습니다.';}catch(e){status.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';}
});
