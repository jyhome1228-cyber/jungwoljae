import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const raw=sessionStorage.getItem('jungwoljae_relationship_input');
if(!raw){location.href='./relationship.html';throw new Error('missing relationship input');}
const input=JSON.parse(raw);
const root=document.querySelector('[data-relationship-result]');
const $=s=>root.querySelector(s);
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);const db=getFirestore(app);
let currentUser=null,saved=false,resultData=null;

const stemElement={갑:'wood',을:'wood',병:'fire',정:'fire',무:'earth',기:'earth',경:'metal',신:'metal',임:'water',계:'water'};
const branchElement={인:'wood',묘:'wood',사:'fire',오:'fire',진:'earth',술:'earth',축:'earth',미:'earth',신:'metal',유:'metal',자:'water',해:'water'};
const stemYinYang={갑:'yang',을:'yin',병:'yang',정:'yin',무:'yang',기:'yin',경:'yang',신:'yin',임:'yang',계:'yin'};
const elementInfo={
  wood:{name:'목',hanja:'木',label:'확장과 시작',emotion:'마음을 움직이면 비교적 빠르게 방향을 정하고 관계를 앞으로 밀어가는 편입니다.',distance:'관계가 답답하게 고정되기보다 함께 자라고 변화하는 느낌이 있을 때 편안함을 느끼기 쉽습니다.',conflict:'갈등이 길어지면 해결책을 빨리 찾으려 하거나 다음 단계로 넘어가려는 마음이 먼저 생길 수 있습니다.'},
  fire:{name:'화',hanja:'火',label:'표현과 온기',emotion:'호감과 감정을 비교적 분명하게 드러내고, 관계 안의 반응과 온도에 민감한 편입니다.',distance:'애정 표현과 반응이 오가는 관계에서 안정감을 느끼며, 지나치게 무표정하거나 닫힌 분위기에서는 답답함이 커질 수 있습니다.',conflict:'감정이 올라온 순간 바로 말하거나 반응하기 쉬워, 한 박자 쉬고 말의 강도를 조절하면 관계가 훨씬 부드러워집니다.'},
  earth:{name:'토',hanja:'土',label:'안정과 지속',emotion:'마음을 쉽게 바꾸기보다 시간을 두고 확인하며, 한 번 관계를 정하면 오래 유지하려는 편입니다.',distance:'말보다 꾸준한 행동과 예측 가능한 태도에서 신뢰를 느끼기 쉽습니다. 관계가 자주 흔들리면 피로가 커질 수 있습니다.',conflict:'불편함을 바로 드러내지 않고 견디다가 한 번에 말하는 경향이 생길 수 있어 작은 불편도 중간중간 정리하는 편이 좋습니다.'},
  metal:{name:'금',hanja:'金',label:'기준과 경계',emotion:'관계를 시작할 때 상대와 나의 기준을 분명하게 보는 편이며, 존중과 약속을 중요하게 여길 수 있습니다.',distance:'각자의 영역과 선을 인정해주는 관계에서 편안함을 느끼기 쉽고, 지나친 간섭이나 애매한 약속에는 피로를 느낄 수 있습니다.',conflict:'문제가 생기면 무엇이 맞고 틀렸는지 정리하려는 마음이 앞설 수 있습니다. 해결보다 감정 확인이 먼저 필요한 순간도 있습니다.'},
  water:{name:'수',hanja:'水',label:'관찰과 유연',emotion:'마음을 드러내기 전에 상대와 상황을 오래 살피며, 관계의 미묘한 변화와 분위기를 잘 읽는 편입니다.',distance:'속도를 강요하지 않고 자연스럽게 가까워지는 관계에서 편안함을 느끼며, 충분히 생각할 여백이 필요합니다.',conflict:'갈등이 생기면 일단 거리를 두고 생각하려 할 수 있습니다. 침묵이 너무 길어지면 상대가 다른 의미로 받아들일 수 있어 설명이 필요합니다.'}
};
const statusInfo={
  single:{title:'새로운 인연을 기다리는 지금',boxes:[['마음을 여는 기준','처음부터 강한 확신을 찾기보다, 대화의 속도와 약속을 지키는 태도가 나와 맞는지를 천천히 보는 편이 좋습니다.'],['만남에서 볼 것','끌림 자체보다 내가 편안하게 말하고 행동할 수 있는지, 관계가 일상 안에 자연스럽게 들어오는지를 살펴보세요.']]},
  dating:{title:'연애 중인 지금',boxes:[['관계 유지의 핵심','잘 맞는 부분을 더 확인하려 하기보다 서로 다른 속도와 표현 방식을 조율하는 일이 관계를 오래 가게 합니다.'],['가까워질수록 필요한 것','익숙함 때문에 설명을 줄이지 말고, 기대하는 것과 부담이 되는 것을 짧게라도 말로 확인하는 편이 좋습니다.']]},
  complicated:{title:'썸이나 관계 고민이 있는 지금',boxes:[['애매함을 다루는 법','상대의 반응을 계속 해석하기보다 내가 원하는 관계의 기준과 기다릴 수 있는 범위를 먼저 정하는 편이 좋습니다.'],['확인해야 할 것','호감의 크기보다 말과 행동이 반복해서 일치하는지, 관계를 한쪽만 끌고 가고 있지는 않은지를 살펴보세요.']]},
  breakup:{title:'이별 후의 지금',boxes:[['회복의 기준','관계의 결과를 다시 뒤집는 것보다 그 관계에서 내가 반복한 방식과 참았던 부분을 먼저 정리하는 것이 다음 인연에 더 도움이 됩니다.'],['다음 관계를 위해','이전과 반대되는 사람을 찾기보다 내가 편안하게 유지할 수 있는 관계의 조건을 구체적으로 정리해보세요.']]}
};
const relationPairs={yukhap:[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']],chung:[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']],hae:[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']],pa:[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']]};
const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));
function pillarString(v){return typeof v==='string'?v:(v?.korean||v?.name||'');}
function parseTime(){if(input.birthTimeUnknown||!input.birthTime)return {hour:12,minute:0,known:false};const [hour,minute]=input.birthTime.split(':').map(Number);return {hour,minute,known:true};}
function pillarsObject(r){if(typeof r?.toObject==='function')return r.toObject();return {year:pillarString(r?.year),month:pillarString(r?.month),day:pillarString(r?.day),hour:pillarString(r?.hour)};}
function add(score,key,w){if(key)score[key]=(score[key]||0)+w;}
function addPillar(score,pillar,stemW=1,branchW=1.1){const chars=[...pillarString(pillar)];add(score,stemElement[chars[0]],stemW);add(score,branchElement[chars[1]],branchW);}
function normalize(score){const total=Object.values(score).reduce((a,b)=>a+b,0)||1,out={};Object.keys(score).forEach(k=>out[k]=Math.round((score[k]/total)*100));return out;}
function currentYearRelation(dayBranch){const now=new Date().getFullYear();const r=calculateFourPillars({year:now,month:7,day:1,hour:12,minute:0,isLunar:false});const obj=typeof r?.toObject==='function'?r.toObject():r;const yp=pillarString(obj?.year),yb=[...yp][1],ys=[...yp][0];let label='평이한 흐름',tone='관계가 크게 밀리거나 부딪히는 해라기보다 내가 어떤 기준으로 관계를 선택하는지가 더 중요합니다.';if(pairHas(relationPairs.yukhap,dayBranch,yb)){label='합의 흐름';tone='관계가 연결되거나 기존 관계의 접점을 다시 찾기 쉬운 흐름이 들어옵니다. 다만 연결 자체보다 지속 가능한 방식인지가 중요합니다.';}else if(pairHas(relationPairs.chung,dayBranch,yb)){label='충의 흐름';tone='관계에서 속도 차이와 변화 욕구가 커질 수 있습니다. 억지로 유지하거나 급히 끊기보다 무엇이 달라졌는지 확인하는 것이 좋습니다.';}else if(pairHas(relationPairs.hae,dayBranch,yb)||pairHas(relationPairs.pa,dayBranch,yb)){label='조율의 흐름';tone='말과 의도의 차이, 작은 어긋남이 신경 쓰일 수 있어 관계의 기대와 약속을 다시 확인하는 편이 좋습니다.';}return {year:now,yearPillar:yp,yearStem:ys,yearBranch:yb,label,tone};}
function calc(){
  const [year,month,day]=input.birthDate.split('-').map(Number),time=parseTime();
  const r=calculateFourPillars({year,month,day,hour:time.hour,minute:time.minute,isLunar:input.calendarType==='lunar',isLeapMonth:Boolean(input.isLeapMonth),gender:input.gender||undefined});
  const pillars=pillarsObject(r),dayP=pillarString(pillars.day),dayStem=[...dayP][0],dayBranch=[...dayP][1],dayElement=stemElement[dayStem],palaceElement=branchElement[dayBranch];
  const score={wood:0,fire:0,earth:0,metal:0,water:0};addPillar(score,pillars.year);addPillar(score,pillars.month);addPillar(score,pillars.day);if(time.known)addPillar(score,pillars.hour);if(pillars.month)add(score,branchElement[[...pillarString(pillars.month)][1]],.8);
  const elements=normalize(score),order=Object.keys(elements).sort((a,b)=>elements[b]-elements[a]),strongest=order[0],weakest=order.at(-1),yy=stemYinYang[dayStem]||'yang',yearFlow=currentYearRelation(dayBranch);
  return {pillars,dayStem,dayBranch,dayElement,palaceElement,elements,order,strongest,weakest,yinYang:yy,timeKnown:time.known,yearFlow};
}
function summary(d){const main=elementInfo[d.dayElement],strong=elementInfo[d.strongest],weak=elementInfo[d.weakest];return `${input.name}님은 관계의 중심에서 ${main.name}(${main.hanja})의 방식인 ‘${main.label}’이 먼저 드러나는 편입니다. 전체 명식에서는 ${strong.name}의 작용이 상대적으로 강하고 ${weak.name}의 역할은 의식적으로 보완할 부분으로 읽힙니다. 연애의 좋고 나쁨보다 감정을 표현하고 거리를 조절하는 방식에서 이런 차이가 반복될 수 있습니다.`;}
function emotionText(d){const e=elementInfo[d.dayElement],s=elementInfo[d.strongest];return `<p>${e.emotion}</p><p>전체적으로 ${s.name}(${s.hanja})의 기운도 강하게 작동해 ${s.label}의 방식이 관계 안에서 자연스럽게 반복될 수 있습니다. 감정 표현은 빠르거나 느리다는 평가보다, 상대가 내 속도를 이해할 수 있게 설명하는 것이 중요합니다.</p>`;}
function distanceText(d){const p=elementInfo[d.palaceElement],w=elementInfo[d.weakest];return `<p>일지의 기운은 ${p.name}(${p.hanja})로 읽히며, 가까운 관계에서는 ${p.distance}</p><p>반대로 ${w.name}의 역할이 상대적으로 약할 때는 관계가 깊어질수록 ‘${w.label}’의 기능이 부족해질 수 있습니다. 내가 불편해지는 지점을 너무 늦게 말하지 않는 것이 관계의 균형에 도움이 됩니다.</p>`;}
function coreCards(d){const e=elementInfo[d.dayElement],p=elementInfo[d.palaceElement],s=elementInfo[d.strongest],w=elementInfo[d.weakest];return [['01','사랑의 중심',`${e.hanja} ${e.name}`,`${e.label}의 방식이 관계에서 먼저 드러납니다.`],['02','가까운 관계',`${p.hanja} ${p.name}`,`친밀감이 깊어질수록 ${p.label}의 역할을 중요하게 느낄 수 있습니다.`],['03','자연스러운 힘',s.name,`${s.label}을 이미 익숙하게 사용합니다.`],['04','균형이 필요한 힘',w.name,`${w.label}을 의식적으로 넣으면 관계가 한쪽으로 치우치는 것을 줄일 수 있습니다.`]];}
function conditions(d){const e=elementInfo[d.dayElement],p=elementInfo[d.palaceElement],w=elementInfo[d.weakest];return [['01','대화의 온도','설명할 수 있는 관계',`내 마음을 추측하게 하기보다 서로의 속도와 기대를 짧게라도 말로 확인할 수 있는 관계가 좋습니다.`],['02','편안한 거리',`${p.label}을 존중하는 관계`,p.distance],['03','관계를 오래 가게 하는 것',`${w.label}의 보완`,`내가 익숙하지 않은 ${w.name}의 역할을 상대에게 전부 맡기기보다 스스로 조금씩 만들어갈 때 관계 의존도가 줄어듭니다.`]];}
function patternText(d){const e=elementInfo[d.dayElement],p=elementInfo[d.palaceElement],s=elementInfo[d.strongest],w=elementInfo[d.weakest];return `<p>${e.conflict}</p><p>특히 ${s.name}의 방식이 강하게 반복되면 관계에서도 익숙한 반응을 더 자주 선택할 수 있습니다. 이때 상대가 나와 다르게 반응하면 ‘마음이 다르다’고 해석하기보다 표현 방식이 다른지 먼저 살펴보는 것이 좋습니다.</p><p>가까운 관계에서는 ${p.name}의 필요가 커지지만, 상대적으로 약한 ${w.name}의 역할이 빠지면 관계가 한쪽으로 기울 수 있습니다. 갈등을 줄이는 핵심은 상대를 바꾸는 것보다 내가 반복하는 속도·표현·거리 조절 방식을 한 번 의식하는 데 있습니다.</p>`;}
function guideCards(d){const e=elementInfo[d.dayElement],w=elementInfo[d.weakest];return [['01','마음을 표현할 때','추측보다 설명',`${e.label}의 장점을 살리되 상대가 알아서 이해할 것이라고 기대하지 말고 필요한 감정은 한 문장으로라도 직접 표현해보세요.`],['02','갈등이 생겼을 때','결론보다 확인',`${e.conflict} 감정의 강도보다 실제로 무엇이 불편했는지 한 가지씩 분리해서 말하는 편이 좋습니다.`],['03','관계를 선택할 때','끌림과 지속을 분리',`강한 끌림이 있다고 해서 오래 편한 관계라는 뜻은 아닙니다. 약속을 지키는 방식, 대화 후의 피로도, 일상 속 속도가 맞는지를 함께 보세요.`],['04','나를 지키는 기준',`${w.label}을 보완`,`${w.name}의 역할이 약할 때는 관계 안에서 상대에게 그 기능을 기대하기 쉽습니다. 내가 먼저 작은 기준과 루틴을 만들면 관계가 훨씬 덜 흔들립니다.`]];}
function yearText(d){return `<p>${d.yearFlow.year}년은 정월재 기준으로 ${d.yearFlow.label}으로 읽힙니다. ${d.yearFlow.tone}</p><p>이 흐름을 ‘누군가를 반드시 만난다’거나 ‘관계가 끝난다’는 식으로 보지는 않습니다. 새로운 만남이 있다면 어떤 사람인지보다 내가 어떤 속도로 관계를 열고 있는지를, 현재 관계가 있다면 익숙함 속에서 설명을 줄이고 있지는 않은지를 살펴보는 해로 활용하는 편이 좋습니다.</p>`;}
function detailedStatusSections(d){
  const e=elementInfo[d.dayElement],p=elementInfo[d.palaceElement],s=elementInfo[d.strongest],w=elementInfo[d.weakest];
  const status=input.relationshipStatus||'single';
  if(status==='dating')return [
    ['현재 관계의 흐름',`현재 관계는 감정의 크기를 다시 확인하기보다 서로 다른 생활 리듬과 표현 방식을 맞춰야 하는 시기입니다. ${input.name}님은 ${e.label}의 방식으로 사랑을 표현하고, 가까워질수록 ${p.label}을 중요하게 느낍니다. 상대가 같은 방식으로 표현하지 않는다고 해서 마음이 약해진 것은 아닙니다. 최근 서운함이 있었다면 사랑의 부족보다 표현 속도의 차이에서 생긴 가능성이 높습니다.`],
    ['상대와 가까워지는 방법',`함께 보내는 시간의 양보다 약속을 지키고 대화를 끝까지 이어가는 태도가 관계를 안정시킵니다. 익숙함 때문에 설명을 줄이면 상대는 ${input.name}님의 기대를 정확히 알기 어렵습니다. 바라는 점과 부담스러운 점을 한 번에 쏟아내지 말고 한 가지씩 분명하게 말하세요. 솔직한 대화가 이루어지면 관계는 이전보다 현실적이고 단단한 단계로 넘어갈 수 있습니다.`],
    ['앞으로의 발전 가능성',`${d.yearFlow.label}이 들어오는 만큼 관계의 방향을 정하는 대화가 생길 가능성이 높습니다. 장기적인 계획, 서로의 일, 생활 방식처럼 현실적인 주제를 피하지 않을수록 관계가 깊어집니다. 두 사람이 함께 지킬 수 있는 작은 약속을 만들면 관계의 안정감이 커집니다. 반대로 미래에 대한 대화를 계속 미루면 익숙하지만 확신이 없는 관계로 정체될 수 있습니다.`],
    ['주의해야 할 점',`${s.name}의 방식이 강해지면 자신의 표현이 상대에게도 당연히 전달되었다고 생각하기 쉽습니다. 상대의 한 번의 반응만으로 마음을 시험하거나 과거의 갈등을 다시 끌어오는 행동은 피해야 합니다. 특히 답장이 늦거나 일정이 바뀌었을 때 혼자 의미를 만들어내면 작은 문제가 커질 수 있습니다. 확인되지 않은 감정보다 실제 행동과 반복되는 태도를 기준으로 보세요.`],
    ['정월재의 관계 조언',`이 관계를 오래 이어가기 위해 필요한 것은 더 강한 애정 표현보다 정확한 설명입니다. ${w.label}의 힘을 보완해 서로에게 필요한 거리와 시간을 인정해 주세요. 사랑받고 있는지를 계속 확인하기보다 두 사람이 함께 편안한 방식을 만드는 데 집중할 때 관계가 안정됩니다.`]
  ];
  if(status==='complicated')return [
    ['현재 관계의 흐름',`서로에게 호감은 있지만 관계의 속도와 기대가 완전히 맞지 않는 시기입니다. 상대의 말보다 행동이 더디게 느껴질 수 있고, 연락의 빈도에 따라 마음이 흔들릴 수 있습니다. 지금은 호감의 크기보다 이 관계를 실제로 이어가려는 행동이 반복되는지를 봐야 합니다. 애매함이 길어질수록 ${input.name}님만 관계를 끌고 가고 있지는 않은지 확인해야 합니다.`],
    ['상대의 태도에서 볼 것',`상대가 먼저 시간을 만들고 약속을 지키는지, 불편한 대화에서도 관계를 회피하지 않는지가 중요합니다. 좋은 말이나 순간적인 친절만으로 관계의 방향을 판단하지 마세요. 연락이 꾸준하고 다음 만남이 구체적으로 이어진다면 발전 가능성이 있습니다. 반대로 필요할 때만 찾아오거나 관계에 대한 질문을 계속 피한다면 기다림의 기준을 정해야 합니다.`],
    ['관계가 발전하는 방식',`이번 인연은 강하게 밀어붙이는 것보다 자연스러운 만남을 반복하면서 신뢰를 확인할 때 발전합니다. 감정을 모두 숨길 필요는 없지만 당장 관계의 이름을 정해달라고 압박하면 상대가 한발 물러날 수 있습니다. 편안한 대화 속에서 자신의 마음과 원하는 관계를 짧고 분명하게 전하세요. 상대가 행동으로 답한다면 관계는 생각보다 빠르게 선명해질 수 있습니다.`],
    ['주의해야 할 점',`답장 시간과 말투 하나하나에 의미를 붙이면 실제 관계보다 불안이 더 커집니다. 상대를 시험하기 위해 일부러 연락을 끊거나 질투를 유도하는 행동도 좋지 않습니다. ${s.label}의 성향이 강해질수록 자신의 해석을 확신하기 쉬우니 사실과 추측을 구분하세요. 기다릴 수 있는 기간과 받아들일 수 없는 태도를 미리 정해두는 것이 필요합니다.`],
    ['정월재의 관계 조언',`좋은 인연은 오래 기다리게 만드는 사람이 아니라 관계의 방향을 함께 만들어가는 사람입니다. ${w.label}을 보완해 자신의 기준을 분명히 세우고, 상대의 말보다 반복되는 행동을 보세요. 마음이 있다는 이유만으로 애매함을 무기한 견디지는 않아도 됩니다.`]
  ];
  if(status==='breakup')return [
    ['현재 마음의 흐름',`이별의 결과보다 관계 안에서 하지 못했던 말과 남아 있는 감정이 더 크게 느껴지는 시기입니다. 상대를 다시 만나고 싶은 마음과 같은 문제를 반복할까 두려운 마음이 함께 움직일 수 있습니다. 지금은 그리움만으로 관계를 판단하지 말고 헤어진 원인이 실제로 달라질 수 있는지 살펴봐야 합니다. 외로움과 재회의 가능성을 같은 것으로 받아들이지 않는 것이 중요합니다.`],
    ['재회 가능성을 볼 기준',`상대가 다시 연락하더라도 미안함이나 그리움만 표현하는지, 이전 문제를 해결하기 위한 구체적인 행동을 보이는지를 확인하세요. 연락 한 번이나 감정적인 대화만으로 관계가 회복되었다고 보기는 어렵습니다. 두 사람이 갈등의 원인을 인정하고 달라진 방식을 실제로 보여줄 때 재회를 생각할 수 있습니다. 같은 조건으로 다시 시작하면 같은 이유로 관계가 흔들릴 가능성이 높습니다.`],
    ['다음 인연의 특징',`다음 인연은 이전 사람과 정반대의 유형보다 ${input.name}님의 속도를 존중하고 약속을 안정적으로 지키는 사람에게서 들어옵니다. 처음부터 강렬한 끌림이 생기지 않더라도 대화가 편하고 행동이 일관된 사람을 살펴보세요. 일이나 공부, 지인의 연결처럼 반복적으로 만나는 환경에서 새로운 관계가 시작될 가능성이 있습니다.`],
    ['주의해야 할 점',`이전 관계의 기준으로 새로운 사람을 비교하거나 상처받지 않기 위해 지나치게 거리를 두면 좋은 인연도 지나칠 수 있습니다. 반대로 외로움을 빨리 채우기 위해 준비되지 않은 관계를 시작하는 것도 피해야 합니다. ${s.label}의 익숙한 반응을 반복하기보다 불편함을 초기에 설명하는 연습이 필요합니다.`],
    ['정월재의 관계 조언',`회복은 상대를 완전히 잊는 것이 아니라 같은 상황에서 다른 선택을 할 수 있게 되는 과정입니다. ${w.label}을 보완해 내가 편안하게 유지할 수 있는 관계의 조건을 구체적으로 정리하세요. 다음 인연에서는 참다가 한꺼번에 정리하기보다 작은 불편을 그때그때 말하는 것이 중요합니다.`]
  ];
  return [
    ['지금의 인연 흐름',`현재는 낯선 사람에게서 강한 확신을 얻기보다 이미 알고 지내던 사람과의 관계가 조금씩 달라지는 시기입니다. 처음부터 강하게 끌리는 만남보다 여러 번 대화를 나누면서 상대의 장점이 보이기 시작합니다. 주변에 편하게 연락을 주고받는 사람이 있다면 단순한 지인으로만 생각하지 말고, 상대가 보여주는 관심과 행동을 세심하게 살펴보세요. 관계를 빨리 확정하기보다 자연스럽게 시간을 보내는 편이 유리합니다.`],
    ['들어오는 사람의 특징',`들어오는 인연은 말이 화려한 사람보다 자신의 일을 꾸준히 하고 약속을 잘 지키는 사람일 가능성이 높습니다. 첫인상은 차분하거나 무뚝뚝하게 느껴질 수 있지만 가까워질수록 배려가 행동으로 드러납니다. 감정 표현은 빠르지 않더라도 한 번 마음을 열면 관계를 가볍게 대하지 않습니다. ${p.label}을 존중하며 ${input.name}님의 생활 리듬을 무리하게 바꾸려 하지 않는 사람이 잘 맞습니다.`],
    ['만남이 이어지는 장소와 계기',`새로운 인연은 일, 공부, 프로젝트, 모임처럼 반복적으로 참여하는 환경에서 들어올 가능성이 높습니다. 한 번 만나고 끝나는 자리보다 여러 번 얼굴을 마주치며 신뢰가 쌓이는 관계가 유리합니다. 함께 의견을 나누거나 일을 해결하는 과정에서 서로의 책임감에 호감을 느끼게 될 수 있습니다. 지인의 소개를 받더라도 처음부터 연애를 전제로 압박하기보다 공통 관심사로 대화를 시작하는 것이 좋습니다.`],
    ['관계가 발전하는 방식',`이번 인연은 빠르게 뜨거워지기보다 연락과 만남이 일정하게 이어지면서 깊어지는 관계입니다. 상대의 마음은 화려한 말보다 연락의 지속성, 약속을 지키는 태도, 다음 만남을 구체적으로 잡는 행동에서 확인하게 됩니다. 먼저 가벼운 안부를 묻거나 자연스럽게 약속을 제안하면 좋은 반응을 얻을 수 있습니다. 서로의 일과 생활을 존중하면 짧은 만남보다 장기적인 관계로 발전할 가능성이 높습니다.`],
    ['주의해야 할 점',`호감이 생기면 작은 행동에도 의미를 부여하고 관계의 방향을 빨리 확인하고 싶어질 수 있습니다. 답장이 늦거나 표현이 기대에 미치지 못한다고 해서 상대의 마음을 부정적으로 단정하지 마세요. 상대를 시험하기 위해 일부러 연락을 늦추거나 질투를 유도하는 행동도 피해야 합니다. 이번 인연은 복잡한 밀고 당기기보다 솔직하고 안정적인 태도에 더 강하게 반응합니다.`],
    ['정월재의 인연 조언',`이번 인연에서 중요한 것은 강렬한 첫인상이 아니라 반복되는 태도의 안정감입니다. 처음부터 완벽하게 마음에 드는 사람을 찾기보다 대화를 나눌수록 신뢰가 생기는 사람에게 시간을 주세요. ${w.label}을 의식하고 자신의 마음을 한 문장으로라도 표현할 때 상대도 경계를 풀고 가까워집니다.`]
  ];
}
function totalSummary(d){const e=elementInfo[d.dayElement],p=elementInfo[d.palaceElement],s=elementInfo[d.strongest],w=elementInfo[d.weakest];return `<p>${input.name}님의 관계 구조는 ${e.name}의 ‘${e.label}’을 중심으로 움직입니다. 마음을 주고받는 과정에서는 나만의 분명한 리듬이 있고, 가까워질수록 ${p.name}의 ‘${p.label}’이 중요한 기준으로 작동합니다.</p><p>이미 잘 쓰이는 ${s.name}의 힘은 관계의 장점이지만, 같은 방식이 반복되면 상대와의 속도 차이가 커질 수 있습니다. 반대로 ${w.name}의 ‘${w.label}’은 관계를 안정시키기 위해 의식적으로 넣어볼 요소입니다. 좋은 인연은 내 부족한 부분을 대신 채워주는 사람이 아니라 서로 다른 방식을 설명하고 조율할 수 있는 관계에 가깝습니다.</p><p>정월재는 연애 결과를 단정하기보다, 내가 어떤 관계에서 편안해지고 어떤 상황에서 반복해서 지치는지를 이해하는 데 초점을 둡니다. 그 패턴을 알면 새로운 인연에서도 현재 관계에서도 선택의 기준이 조금 더 분명해질 수 있습니다.</p>`;}
function evidence(d){return `<p><strong>기본 명식</strong> ${Object.entries(d.pillars).map(([k,v])=>`${k} ${pillarString(v)}`).join(' · ')}</p><p><strong>일간</strong> ${d.dayStem}의 오행 ${elementInfo[d.dayElement].name}을 감정 표현과 관계 중심 성향의 주요 기준으로 사용했습니다.</p><p><strong>일지</strong> ${d.dayBranch}의 오행 ${elementInfo[d.palaceElement].name}을 가까운 관계와 친밀감의 반응을 읽는 보조 기준으로 사용했습니다.</p><p><strong>오행 구조</strong> 명식의 목·화·토·금·수 상대 분포에서 강한 기운과 약한 기운을 관계 패턴 해석에 함께 반영했습니다.</p><p><strong>올해 흐름</strong> 현재 연도의 지지와 일지의 합·충·해·파 여부를 관계 리듬의 참고 요소로 사용했습니다.</p><p><strong>해석 범위</strong> 특정 상대의 마음이나 미래 사건을 단정하지 않으며, 전통 명리학을 바탕으로 관계 방식과 선택 기준을 정리한 콘텐츠입니다.</p>`;}
function reportText(d){const lines=['정월재 연애와 인연 리포트',`대상: ${input.name}`,`생년월일: ${input.birthDate}`,`관계 상태: ${statusInfo[input.relationshipStatus]?.title||input.relationshipStatus}`,'',summary(d),'','관계의 중심'];coreCards(d).forEach(x=>lines.push(`${x[1]}: ${x[2]} — ${x[3]}`));lines.push('','마음을 표현하는 방식',emotionText(d).replace(/<[^>]+>/g,' '),'','가까워질수록 필요한 거리',distanceText(d).replace(/<[^>]+>/g,' '),'','반복되는 관계 패턴',patternText(d).replace(/<[^>]+>/g,' '),'','현재 상태에 맞춘 인연 풀이');detailedStatusSections(d).forEach(([title,copy])=>lines.push('',title,copy));lines.push('','올해의 인연 흐름',yearText(d).replace(/<[^>]+>/g,' '),'','정월재 관계 총평',totalSummary(d).replace(/<[^>]+>/g,' '),'','※ 본 리포트는 전통 명리학을 바탕으로 한 해석 콘텐츠이며 특정 관계의 결과를 보장하지 않습니다.');return lines.join('\n');}
function render(d){
  $('[data-name]').textContent=input.name;$('[data-summary]').textContent=summary(d);$('[data-meta]').innerHTML=`<span>${input.birthDate}</span><span>${input.birthTimeUnknown?'출생시간 모름':(input.birthTime||'출생시간 미입력')}</span><span>${input.calendarType==='lunar'?'음력':'양력'}</span><span>${statusInfo[input.relationshipStatus]?.title||'관계 흐름'}</span>`;
  $('[data-core-grid]').innerHTML=coreCards(d).map(([n,l,v,p])=>`<article class="relationship-core-card"><span>${n} · ${l}</span><strong>${v}</strong><p>${p}</p></article>`).join('');
  $('[data-emotion-text]').innerHTML=emotionText(d);$('[data-distance-text]').innerHTML=distanceText(d);$('[data-condition-grid]').innerHTML=conditions(d).map(([n,l,v,p])=>`<article class="relationship-condition-card"><span>${n} · ${l}</span><strong>${v}</strong><p>${p}</p></article>`).join('');$('[data-pattern-text]').innerHTML=patternText(d);
  const st=statusInfo[input.relationshipStatus]||statusInfo.single;$('[data-status-title]').textContent=st.title;$('[data-status-result]').innerHTML=detailedStatusSections(d).map(([t,p])=>`<article class="relationship-status-box"><strong>${t}</strong><p>${p}</p></article>`).join('');$('[data-year-text]').innerHTML=yearText(d);$('[data-guide-grid]').innerHTML=guideCards(d).map(([n,t,v,p])=>`<article class="relationship-guide-card"><span>${n}</span><h3>${t} · ${v}</h3><p>${p}</p></article>`).join('');$('[data-total-summary]').innerHTML=totalSummary(d);$('[data-evidence]').innerHTML=evidence(d);
}
try{resultData=calc();render(resultData);}catch(error){root.innerHTML=`<div class="relationship-result-container"><section class="relationship-report"><p class="relationship-label">CALCULATION ERROR</p><h1 style="font-size:26px;margin:0 0 12px">연애와 인연 분석을 완료하지 못했습니다.</h1><p style="color:#756b67;line-height:1.7">입력 정보를 다시 확인해주세요.</p><a href="./relationship.html" class="relationship-button primary" style="display:inline-flex;align-items:center;text-decoration:none;margin-top:16px">입력 다시 하기</a></section></div>`;throw error;}

const copyBtn=$('[data-copy]'),pdfBtn=$('[data-pdf]'),saveBtn=$('[data-save]'),actionStatus=$('[data-action-status]');
copyBtn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(reportText(resultData));actionStatus.textContent='보고서용 텍스트를 복사했습니다.';}catch(e){actionStatus.textContent='복사하지 못했습니다. 브라우저 권한을 확인해주세요.';}});pdfBtn.addEventListener('click',()=>window.print());
onAuthStateChanged(auth,user=>{currentUser=user;saveBtn.textContent=!user?'로그인 후 저장':saved?'저장 완료':'마이페이지에 저장';});
saveBtn.addEventListener('click',async()=>{if(saved){actionStatus.innerHTML='이미 저장된 분석입니다. <a href="./mypage.html">마이페이지에서 보기</a>';return;}if(!currentUser){location.href='./login.html?next=./relationship-result.html';return;}saveBtn.disabled=true;saveBtn.textContent='저장 중…';try{const data={type:'relationship',title:`${input.name}님의 연애와 인연`,input,summary:summary(resultData),dayStem:resultData.dayStem,dayBranch:resultData.dayBranch,strongest:elementInfo[resultData.strongest].name,weakest:elementInfo[resultData.weakest].name,relationshipStatus:input.relationshipStatus,yearFlow:resultData.yearFlow,reportText:reportText(resultData),createdAt:serverTimestamp()};const ref=await addDoc(collection(db,'users',currentUser.uid,'readings'),data);saved=true;saveBtn.textContent='저장 완료';actionStatus.innerHTML=`정월록과 마이페이지에 저장했습니다. <a href="./archive.html?reading=${encodeURIComponent(ref.id)}">저장한 분석 보기</a>`;}catch(e){saveBtn.disabled=false;saveBtn.textContent='마이페이지에 저장';actionStatus.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';}});
