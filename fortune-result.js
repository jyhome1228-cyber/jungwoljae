const root=document.querySelector('[data-fortune-result]');
if(!root)throw new Error('fortune result root missing');

let input=null;
try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'null');}catch(e){}
if(!input?.birthDate||!input?.name){location.replace('./fortune.html');throw new Error('missing fortune input');}
if(Number(input.createdAt)&&Date.now()-Number(input.createdAt)>30*60*1000){
  try{sessionStorage.removeItem('jungwoljae_fortune_input');}catch(e){}
  location.replace(input.mode==='tomorrow'?'./tomorrow.html':'./fortune.html');
  throw new Error('stale fortune input');
}

const tomorrow=input.mode==='tomorrow';
const dayWord=tomorrow?'내일':'오늘';
const $=selector=>root.querySelector(selector);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

const stems={
  갑:{e:'wood',p:'yang'},을:{e:'wood',p:'yin'},병:{e:'fire',p:'yang'},정:{e:'fire',p:'yin'},
  무:{e:'earth',p:'yang'},기:{e:'earth',p:'yin'},경:{e:'metal',p:'yang'},신:{e:'metal',p:'yin'},
  임:{e:'water',p:'yang'},계:{e:'water',p:'yin'}
};
const branches={인:'wood',묘:'wood',사:'fire',오:'fire',진:'earth',술:'earth',축:'earth',미:'earth',신:'metal',유:'metal',자:'water',해:'water'};
const stemList=['갑','을','병','정','무','기','경','신','임','계'];
const branchList=['자','축','인','묘','진','사','오','미','신','유','술','해'];
const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
const eName={wood:'목(木)',fire:'화(火)',earth:'토(土)',metal:'금(金)',water:'수(水)'};
const eShort={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};

const balancePack={
  wood:{keyword:'새로운 시작과 확장',color:'청록 · 연두',object:'작은 노트 · 식물',time:'오전 7시–11시'},
  fire:{keyword:'표현과 실행',color:'코랄 · 버건디',object:'조명 · 펜',time:'오전 10시–오후 2시'},
  earth:{keyword:'정리와 안정',color:'베이지 · 브라운',object:'수첩 · 정리함',time:'오후 1시–5시'},
  metal:{keyword:'기준과 판단',color:'아이보리 · 실버',object:'금속 펜 · 키링',time:'오후 3시–7시'},
  water:{keyword:'관찰과 여백',color:'네이비 · 블루',object:'물병 · 이어폰',time:'저녁 7시–11시'}
};

const tenGodPack={
  비견:{title:'내 기준이 또렷해지는 흐름',action:'남의 속도보다 오늘 내 우선순위를 먼저 정해보세요.',money:'내가 잘 아는 범위 안에서 쓰고 결정하면 안정적입니다.',work:'주도권을 잡는 일에 힘이 붙지만 혼자 다 떠안지는 않는 편이 좋습니다.',love:'상대에게 맞추기보다 내가 원하는 관계의 기준을 먼저 정리해보세요.'},
  겁재:{title:'사람과 경쟁이 함께 들어오는 흐름',action:'함께 움직이되 역할과 책임 범위를 먼저 분명히 하세요.',money:'비교 때문에 생기는 소비나 대신 부담하는 지출은 줄이는 편이 좋습니다.',work:'협업하면 속도가 나지만 누가 무엇을 맡는지 먼저 정해야 편합니다.',love:'상대의 반응에 휩쓸리기보다 내 선과 기대치를 분명히 해보세요.'},
  식신:{title:'꾸준히 결과를 만들어내는 흐름',action:'작더라도 오늘 끝낸 결과물 하나를 남겨보세요.',money:'생활에 실제 도움이 되는 소비는 만족도가 높은 편입니다.',work:'작성·제작·정리처럼 눈에 보이는 결과를 만드는 일에 잘 맞습니다.',love:'거창한 말보다 편안한 대화와 작은 배려가 관계를 부드럽게 만듭니다.'},
  상관:{title:'표현과 수정이 활발해지는 흐름',action:'아이디어는 꺼내되 말의 강도만 한 번 조절하세요.',money:'새로운 선택에 눈이 가기 쉬우니 결제 전 목적을 한 번 확인하세요.',work:'제안·발표·개선에는 강하지만 지적이 날카롭게 들리지 않게 표현하면 좋습니다.',love:'하고 싶은 말이 많아질 수 있어 결론보다 상대의 반응을 먼저 들어보세요.'},
  편재:{title:'기회와 돈의 움직임이 커지는 흐름',action:'들어온 제안은 빠르게 보되 내가 감당할 범위는 분명히 정하세요.',money:'돈의 움직임이 커질 수 있어 금액보다 목적과 회수 가능성을 먼저 보세요.',work:'외부 연락·영업·협상처럼 움직임이 있는 일에 반응이 빠릅니다.',love:'새로운 만남이나 연락에는 열려 있되 속도를 너무 빨리 올리지는 마세요.'},
  정재:{title:'현실적인 성과와 정산에 좋은 흐름',action:'수입·지출·해야 할 일을 숫자와 일정으로 정리해보세요.',money:'예산, 정기비용, 실제 필요한 지출을 정리하면 체감이 좋아집니다.',work:'정해진 범위 안에서 결과를 정확히 마무리하는 힘이 좋습니다.',love:'말보다 약속과 생활 리듬이 실제로 맞는지를 보는 편이 좋습니다.'},
  편관:{title:'압박을 집중력으로 바꾸는 흐름',action:'급한 것과 중요한 것을 나눠 가장 중요한 한 가지부터 처리하세요.',money:'불안해서 서둘러 결정하는 소비는 한 번 더 확인하세요.',work:'마감·책임·승부가 있는 일에서 집중력이 올라가지만 무리하면 피로가 빨리 옵니다.',love:'감정이 예민해질 수 있어 즉답보다 한 번 정리한 뒤 말하는 편이 좋습니다.'},
  정관:{title:'책임과 기준을 지킬수록 좋은 흐름',action:'약속과 순서를 지키는 것이 오늘 가장 좋은 전략입니다.',money:'계획된 지출과 계약·정산처럼 기준이 있는 돈 흐름에 안정적입니다.',work:'보고·승인·공식 일정처럼 정확성과 신뢰가 필요한 일에 잘 맞습니다.',love:'관계를 선명하게 만들고 싶다면 애매한 표현보다 약속과 행동을 확인하세요.'},
  편인:{title:'새로운 관점과 정보가 들어오는 흐름',action:'익숙한 답만 보지 말고 다른 자료 하나를 더 비교해보세요.',money:'낯선 상품이나 방식은 바로 결제하기보다 정보를 먼저 확인하세요.',work:'기획·리서치·아이디어 탐색처럼 정답이 하나가 아닌 일에 강합니다.',love:'상대를 추측하기보다 궁금한 부분을 직접 물어보는 편이 정확합니다.'},
  정인:{title:'배우고 준비하는 힘이 받쳐주는 흐름',action:'모르는 부분을 채우고 준비한 뒤 움직이면 훨씬 안정적입니다.',money:'교육·도구·유지관리처럼 오래 쓰는 데 도움이 되는 지출은 괜찮습니다.',work:'자료 정리·학습·검토처럼 기반을 단단히 하는 일이 잘 맞습니다.',love:'서두르기보다 상대의 이야기를 충분히 듣고 이해하는 쪽이 좋습니다.'}
};

const fallbackPack={
  wood:{headline:'작은 시작 하나를 만드는 날',work:'새 일을 크게 벌리기보다 첫 단계가 분명한 일 하나를 시작해보세요.',money:'새 지출은 무엇을 시작하기 위한 돈인지 목적을 분명히 하면 좋습니다.',love:'먼저 말을 걸거나 다음 만남의 계기를 만드는 흐름이 좋습니다.',life:'움직임을 늘리되 시작한 일을 이어갈 체력은 남겨두세요.'},
  fire:{headline:'생각을 밖으로 꺼낼수록 좋은 날',work:'제안·발표·공유처럼 결과가 보이는 일을 실제로 꺼내면 흐름이 살아납니다.',money:'필요한 소비는 빠르게 결정하되 기분에 따라 범위를 넓히지는 마세요.',love:'호감이나 필요한 말은 돌려 말하기보다 짧고 분명하게 표현하는 편이 좋습니다.',life:'초반 속도가 붙는 만큼 저녁에는 과열되지 않게 마무리하세요.'},
  earth:{headline:'정리하고 안정시키는 힘이 좋은 날',work:'진행 중인 업무 하나를 마무리하고 다음 순서를 정리해보세요.',money:'정기 지출과 반복 비용을 정리하면 재물 흐름이 안정됩니다.',love:'말보다 약속과 생활 리듬이 실제로 맞는지를 보는 편이 좋습니다.',life:'식사·휴식·이동의 리듬을 일정하게 유지하면 좋습니다.'},
  metal:{headline:'선택지를 줄이고 기준을 세우는 날',work:'해야 할 일과 하지 않을 일을 나누고 우선순위를 분명히 하세요.',money:'가격보다 유지비와 실제 쓰임까지 함께 보며 결정하는 흐름이 좋습니다.',love:'상대의 말보다 행동의 일관성과 약속을 지키는지를 기준으로 보세요.',life:'미뤄둔 정리나 완료 표시 하나를 남기면 체감이 좋아집니다.'},
  water:{headline:'한 번 더 살피면 답이 보이는 날',work:'자료를 비교하고 빠진 정보를 채운 뒤 결정하면 정확도가 올라갑니다.',money:'결제 전 최근 지출 흐름을 한 번 확인하면 돈의 흐름이 선명해집니다.',love:'한 번의 답장보다 최근 며칠의 연락 흐름과 행동을 함께 보세요.',life:'일정 사이에 여백을 두고 생각을 정리할 시간을 남겨두세요.'}
};

const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
const hae=[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']];
const pa=[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']];
const samhap=[['신','자','진'],['해','묘','미'],['인','오','술'],['사','유','축']];
const hyeongGroups=[['인','사','신'],['축','미','술']];

const pairHas=(arr,a,b)=>arr.some(pair=>pair.includes(a)&&pair.includes(b));
const isHyeong=(a,b)=>(a===b&&['진','오','유','해'].includes(a))||pairHas([['자','묘']],a,b)||hyeongGroups.some(group=>group.includes(a)&&group.includes(b));
const pillarString=value=>typeof value==='string'?value:(value?.korean||value?.name||'');
const parts=pillar=>({pillar:pillar||'',stem:[...(pillar||'')][0]||'',branch:[...(pillar||'')][1]||''});

function seoulDate(offset=0){
  const dtf=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'});
  const fields=dtf.formatToParts(new Date());
  const get=type=>fields.find(part=>part.type===type)?.value||'';
  const date=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00+09:00`);
  date.setDate(date.getDate()+offset);
  return dtf.format(date);
}

function jdn(y,m,d){
  const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
}
function localSolarDayPillar(dateString){
  const [y,m,d]=String(dateString).split('-').map(Number);
  const index=((jdn(y,m,d)+49)%60+60)%60;
  const pillar=stemList[index%10]+branchList[index%12];
  return {pillar,stem:pillar[0],branch:pillar[1],fallback:true};
}

let calculatorPromise=null;
function getCalculator(){
  if(calculatorPromise)return calculatorPromise;
  const sources=Promise.any([
    import('https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm'),
    import('https://esm.sh/manseryeok@2.0.0')
  ]).catch(()=>null);
  const timeout=new Promise(resolve=>setTimeout(()=>resolve(null),2600));
  calculatorPromise=Promise.race([sources,timeout]);
  return calculatorPromise;
}

async function calculatePillars(dateString,{time='12:00',lunar=false,leap=false,gender=''}={}){
  const module=await getCalculator();
  if(module?.calculateFourPillars){
    const [year,month,day]=String(dateString).split('-').map(Number);
    const [hour,minute]=String(time||'12:00').split(':').map(Number);
    const result=module.calculateFourPillars({
      year,month,day,
      hour:Number.isFinite(hour)?hour:12,
      minute:Number.isFinite(minute)?minute:0,
      isLunar:lunar,isLeapMonth:leap,gender:gender||undefined
    });
    const object=typeof result?.toObject==='function'?result.toObject():result;
    const full={
      year:pillarString(object?.year),
      month:pillarString(object?.month),
      day:pillarString(object?.day),
      hour:pillarString(object?.hour)
    };
    if(full.day&&[...full.day].length>=2)return {...full,fallback:false,full:Boolean(full.year&&full.month)};
  }
  if(lunar)throw new Error('lunar-calculator-unavailable');
  const dayOnly=localSolarDayPillar(dateString);
  return {year:'',month:'',day:dayOnly.pillar,hour:'',fallback:true,full:false};
}

function branchRel(a,b){
  if(!a||!b)return {label:'평이',score:0,copy:'큰 충돌보다 내 선택과 순서가 더 중요한 흐름입니다.'};
  if(pairHas(yukhap,a,b))return {label:'육합',score:3,copy:'사람과 일이 자연스럽게 맞물리는 접점이 생기기 쉬운 흐름입니다.'};
  if(samhap.some(group=>group.includes(a)&&group.includes(b)))return {label:'삼합',score:2,copy:'사람과 정보의 연결을 활용할수록 흐름이 부드럽게 이어집니다.'};
  if(pairHas(chung,a,b))return {label:'충',score:-3,copy:'예상과 다른 변수나 방향 전환이 생길 수 있어 유연하게 조정하는 것이 중요합니다.'};
  if(isHyeong(a,b))return {label:'형',score:-2,copy:'반복되던 불편이나 익숙한 문제를 다른 방식으로 끊어내기 좋은 흐름입니다.'};
  if(pairHas(hae,a,b))return {label:'해',score:-2,copy:'말과 태도의 작은 차이가 크게 느껴질 수 있어 직접 확인하는 편이 좋습니다.'};
  if(pairHas(pa,a,b))return {label:'파',score:-1,copy:'작은 어긋남이나 미뤄둔 일을 정리하면 하루가 훨씬 가벼워집니다.'};
  if(a===b)return {label:'동일',score:1,copy:'평소 내 성향과 습관이 평소보다 더 강하게 드러나는 흐름입니다.'};
  return {label:'평이',score:0,copy:'외부 상황보다 내가 먼저 정한 기준과 순서가 하루를 좌우합니다.'};
}
function relationPlain(label){
  if(label==='육합'||label==='삼합')return '연결이 잘 되는 편';
  if(label==='충')return '변화가 큰 편';
  if(label==='형')return '반복 문제를 정리할 때';
  if(label==='해')return '말과 감정을 세심히 볼 때';
  if(label==='파')return '작은 어긋남을 정리할 때';
  if(label==='동일')return '내 성향이 강하게 드러날 때';
  return '내 선택이 중요한 편';
}
function relationSentence(label,area){
  if(label==='육합'||label==='삼합')return area==='love'
    ?'대화를 먼저 열거나 약속을 잡기 좋은 편입니다.'
    :'연락·협업·정보 연결을 활용하면 일이 자연스럽게 이어질 수 있습니다.';
  if(['충','형','해','파'].includes(label))return area==='love'
    ?'한 번의 말보다 실제 행동을 같이 보고, 궁금한 부분은 직접 확인하는 편이 좋습니다.'
    :'예상과 다른 변수가 생길 수 있어 처음 계획을 고집하기보다 순서를 조정하는 편이 좋습니다.';
  return area==='love'
    ?'상대의 속도보다 관계 전체의 흐름이 편한지를 보는 편이 좋습니다.'
    :'외부 상황보다 내가 먼저 정한 기준과 순서가 더 중요합니다.';
}

function tenGod(dayStem,targetStem){
  const A=stems[dayStem],B=stems[targetStem];
  if(!A||!B)return '비견';
  const same=A.p===B.p;
  if(A.e===B.e)return same?'비견':'겁재';
  if(generates[A.e]===B.e)return same?'식신':'상관';
  if(controls[A.e]===B.e)return same?'편재':'정재';
  if(controls[B.e]===A.e)return same?'편관':'정관';
  if(generates[B.e]===A.e)return same?'편인':'정인';
  return '비견';
}

function elementBalance(pillars,knownTime){
  const score={wood:0,fire:0,earth:0,metal:0,water:0};
  const used=['year','month','day',...(knownTime?['hour']:[])];
  used.forEach(key=>{
    const p=pillars[key]||'';
    const [s,b]=[...p];
    if(stems[s])score[stems[s].e]+=1;
    if(branches[b])score[branches[b]]+=1.1;
  });
  const monthBranch=[...(pillars.month||'')][1];
  if(branches[monthBranch])score[branches[monthBranch]]+=.9;
  const dayStem=[...(pillars.day||'')][0];
  if(stems[dayStem])score[stems[dayStem].e]+=.35;
  const total=Object.values(score).reduce((a,b)=>a+b,0)||1;
  const pct=Object.fromEntries(Object.entries(score).map(([k,v])=>[k,Math.round(v/total*100)]));
  const order=Object.keys(score).sort((a,b)=>score[b]-score[a]);
  return {score,pct,dominant:order[0],weak:order[order.length-1]};
}

function impactOf(balance,targetEl,dayMasterEl){
  const pct=balance.pct[targetEl]||0;
  if(pct>=30)return {type:'over',title:'익숙한 방식이 강하게 작동하는 날',copy:'잘하던 방식에 힘이 실리는 대신 속도나 표현이 과해질 수 있어 범위를 조금 줄이면 좋습니다.'};
  if(pct<=12||balance.weak===targetEl)return {type:'fill',title:'평소 덜 쓰던 힘을 보완하기 좋은 날',copy:'평소 부족했던 방식이 자연스럽게 보완되어 새로운 행동을 시도하기 좋습니다.'};
  if(generates[targetEl]===dayMasterEl)return {type:'support',title:'준비와 회복이 성과로 이어지는 날',copy:'급하게 밀기보다 자료를 채우고 기반을 정리한 뒤 움직이면 안정적입니다.'};
  if(generates[dayMasterEl]===targetEl)return {type:'output',title:'생각을 결과로 꺼내기 좋은 날',copy:'말·제안·결과물처럼 눈에 보이는 형태로 표현할수록 흐름을 잘 쓸 수 있습니다.'};
  if(controls[targetEl]===dayMasterEl)return {type:'pressure',title:'책임과 압박을 정리할수록 좋은 날',copy:'해야 할 일이 또렷해지는 대신 부담도 커질 수 있어 우선순위를 줄이는 것이 중요합니다.'};
  if(controls[dayMasterEl]===targetEl)return {type:'result',title:'현실적인 결과를 만들기 좋은 날',copy:'돈·일정·성과처럼 실제 결과가 남는 일을 분명하게 처리하는 편이 좋습니다.'};
  return {type:'steady',title:'정한 계획을 차분히 밀어가기 좋은 날',copy:'무리하게 바꾸기보다 이미 정한 계획을 조금 더 정확하게 실행하는 편이 좋습니다.'};
}

function hash(str){let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function luckyNumbers(seed){
  const out=[];let x=seed||1;
  while(out.length<3){x^=x<<13;x^=x>>>17;x^=x<<5;const n=(x>>>0)%9+1;if(!out.includes(n))out.push(n);}
  return out;
}
function listItem(title,body,index){return `<li data-index="${String(index).padStart(2,'0')}"><div><strong>${esc(title)}</strong><span>${esc(body)}</span></div></li>`;}

async function build(){
  const expected=seoulDate(tomorrow?1:0);
  const knownTime=!input.birthTimeUnknown&&Boolean(input.birthTime);
  const [natal,targetFull]=await Promise.all([
    calculatePillars(input.birthDate,{time:input.birthTime||'12:00',lunar:input.calendarType==='lunar',leap:Boolean(input.isLeapMonth),gender:input.gender||''}),
    calculatePillars(expected,{time:'12:00'})
  ]);
  const target=parts(targetFull.day),d=parts(natal.day);
  const targetEl=stems[target.stem]?.e||'earth';
  const dayMasterEl=stems[d.stem]?.e||'earth';

  if(natal.full&&natal.year&&natal.month){
    const y=parts(natal.year),m=parts(natal.month),h=knownTime&&natal.hour?parts(natal.hour):null;
    const balance=elementBalance(natal,Boolean(h));
    const dayRel=branchRel(d.branch,target.branch),monthRel=branchRel(m.branch,target.branch),yearRel=branchRel(y.branch,target.branch),hourRel=h?branchRel(h.branch,target.branch):null;
    const god=tenGod(d.stem,target.stem),godPack=tenGodPack[god];
    const impact=impactOf(balance,targetEl,dayMasterEl);
    const supportEl=balance.weak;
    const score=50+dayRel.score*4+monthRel.score*2+(hourRel?.score||0)+(impact.type==='fill'?8:impact.type==='support'?6:impact.type==='over'?-6:0);
    return {expected,natal,target,y,m,d,h,balance,targetEl,dayMasterEl,dayRel,monthRel,yearRel,hourRel,god,godPack,impact,supportEl,score:Math.max(25,Math.min(90,score)),full:true,fallback:Boolean(natal.fallback||targetFull.fallback)};
  }

  const dayRel=branchRel(d.branch,target.branch);
  const pack=fallbackPack[targetEl];
  const stemA=stems[d.stem],stemB=stems[target.stem];
  let stemText='오늘 날짜의 흐름이 내 선택을 크게 방해하지 않는 편입니다.';
  if(stemA&&stemB){
    if(generates[stemB.e]===stemA.e)stemText='오늘 날짜의 흐름이 내 준비와 회복을 받쳐주는 편입니다.';
    else if(generates[stemA.e]===stemB.e)stemText='내가 가진 힘을 밖으로 표현할수록 좋은 편입니다.';
    else if(controls[stemB.e]===stemA.e)stemText='해야 할 일과 책임이 또렷해질 수 있어 우선순위를 줄이는 편이 좋습니다.';
    else if(controls[stemA.e]===stemB.e)stemText='현실적인 결과와 정산을 만들기에 좋은 편입니다.';
  }
  return {expected,natal,target,d,dayRel,targetEl,pack,stemText,score:Math.max(30,Math.min(84,54+dayRel.score*5)),full:false,fallback:true};
}

function renderFull(v){
  const name=input.name||'회원';
  const dateLabel=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(`${v.expected}T12:00:00+09:00`));
  const heroTitle=root.querySelector('.fortune-hero h1');
  if(heroTitle)heroTitle.innerHTML=`<span data-name>${esc(name)}</span>님,<br />${dayWord}의 흐름을 정리했습니다.`;

  $('[data-summary]').textContent=`${name}님의 연·월·일${v.h?'·시':''} 흐름과 ${dayWord} 날짜를 함께 보았습니다. ${v.godPack.title}이 두드러지고, ${v.impact.copy}`;
  $('[data-meta]').innerHTML=`<span>${v.expected}</span><span>${dateLabel}</span><span>내 일주 ${v.natal.day}</span><span>${dayWord} 일진 ${v.target.pillar}</span>${v.h?'<span>출생시간 반영</span>':'<span>출생시간 미반영</span>'}`;

  $('[data-headline]').textContent=`${dayWord}은 ${v.impact.title}입니다.`;
  $('[data-signal-note]').textContent=`${v.godPack.title}. ${v.dayRel.copy}`;

  const relation=$('.fortune-relation');
  if(relation)relation.innerHTML=`
    <p class="fortune-label">01 · PERSONAL FLOW</p>
    <h2>내 성향과 ${dayWord}의 흐름이 어떻게 만날까요?</h2>
    <div class="relation-pills">
      <span>행동 · ${esc(v.godPack.title.replace(' 흐름',''))}</span>
      <span>관계 · ${esc(relationPlain(v.dayRel.label))}</span>
      <span>일 · ${esc(relationPlain(v.monthRel.label))}</span>
      ${v.h?`<span>저녁 · ${esc(relationPlain(v.hourRel.label))}</span>`:''}
    </div>
    <p>${esc(`${v.godPack.action} 관계에서는 ${v.dayRel.copy} 일에서는 ${v.monthRel.copy}`)}</p>`;

  $('[data-fortune-story]').innerHTML=`
    <p><strong>${dayWord}의 전체 흐름</strong> ${esc(v.impact.title)}. 평소에는 ‘${esc(balancePack[v.balance.dominant].keyword)}’ 쪽의 힘을 많이 쓰는 편이고, ‘${esc(balancePack[v.supportEl].keyword)}’ 쪽은 상대적으로 덜 쓰는 편입니다. ${esc(v.impact.copy)}</p>
    <p><strong>실제로는</strong> ${esc(v.godPack.action)} ${esc(v.monthRel.copy)} ${v.h?esc(`하루 후반에는 ${v.hourRel.copy}`):'출생시간이 없어 저녁 흐름은 연·월·일주와 전체 균형을 기준으로 정리했습니다.'}</p>`;

  const money=`${v.godPack.money} ${v.impact.type==='over'?'기분이나 분위기에 따라 금액 범위가 커지는지만 확인하세요.':v.impact.type==='fill'?'미뤄둔 정산이나 꼭 필요한 지출을 정리하기 좋습니다.':'큰 선택보다 실제 필요와 예산을 먼저 맞춰보세요.'}`;
  const love=`${v.godPack.love} ${relationSentence(v.dayRel.label,'love')}`;
  const work=`${v.godPack.work} ${relationSentence(v.monthRel.label,'work')}`;
  const life=`평소 강한 ‘${balancePack[v.balance.dominant].keyword}’은 장점으로 쓰고, 상대적으로 약한 ‘${balancePack[v.supportEl].keyword}’을 조금 보완해보세요. ${v.impact.copy}`;

  $('[data-area-grid]').innerHTML=[
    ['01','재물운','돈의 흐름은 오늘의 행동 성향과 내 균형을 함께 봅니다.',money,'재물'],
    ['02','연애운','관계는 내 기본 반응과 오늘의 관계 변화를 중심으로 봅니다.',love,'인연'],
    ['03','일·학업운','일은 평소 사회적 리듬과 오늘의 변화를 더 크게 반영합니다.',work,'일'],
    ['04','생활운','생활은 평소 강한 방식과 부족한 방식을 함께 조절합니다.',life,'생활']
  ].map(([n,title,lead,copy,badge])=>`<article class="fortune-card"><span>${n}</span><h3>${title}</h3><p><strong>${esc(lead)}</strong>${esc(copy)}</p><strong>${badge}</strong></article>`).join('');

  const morning=`${v.godPack.action} 오전에는 하루의 기준을 잡는 일이 가장 중요합니다.`;
  const afternoon=`${relationSentence(v.monthRel.label,'work')} 사람과 일이 몰리면 가장 중요한 한 가지를 중심에 두세요.`;
  const evening=v.h
    ?`${relationSentence(v.hourRel.label,'work')} 하루를 끝낼 때는 새 일을 벌이기보다 오늘 처리한 것을 정리해보세요.`
    :`‘${balancePack[v.supportEl].keyword}’을 보완하는 휴식이나 정리 시간을 남겨보세요.`;

  $('[data-time-grid]').innerHTML=[
    ['01 · 오전','가장 먼저 할 일',morning],
    ['02 · 오후','일과 사람의 흐름',afternoon],
    ['03 · 저녁','마무리 기준',evening]
  ].map(([n,title,copy])=>`<article class="fortune-time-card"><span>${n}</span><strong>${title}</strong><p>${esc(copy)}</p></article>`).join('');
  const timeLead=$('[data-time-grid]')?.closest('.fortune-report')?.querySelector('.fortune-section-lead');
  if(timeLead)timeLead.textContent='내 행동 성향, 일의 흐름, 하루 후반의 균형을 나눠 실제 행동으로 정리했습니다.';

  const positives=[
    [v.godPack.action,`${v.godPack.title}을 가장 실용적으로 쓰는 행동입니다.`],
    [v.monthRel.label==='육합'||v.monthRel.label==='삼합'?'사람과 정보를 먼저 연결하기':'해야 할 일의 순서를 먼저 정하기',v.monthRel.copy],
    [`‘${balancePack[v.supportEl].keyword}’을 위한 작은 행동 하나 넣기`,'평소 상대적으로 덜 쓰는 방식을 생활 속에서 조금 보완하는 방법입니다.']
  ];
  const cautions=[
    [v.impact.type==='over'?'잘하던 방식을 너무 밀어붙이기':'한 번의 반응으로 결론 내리기',v.impact.type==='over'?'익숙한 힘이 강해져 과속이나 과한 표현으로 이어질 수 있습니다.':'한 장면보다 하루 전체의 흐름을 같이 보는 편이 좋습니다.'],
    [['충','형','해','파'].includes(v.dayRel.label)?'상대의 말을 추측으로 채우기':'일정을 빈칸 없이 채우기',v.dayRel.copy],
    ['돈·일·관계를 한 번에 해결하려 하기','여러 문제를 동시에 잡으면 중요한 기준이 흐려질 수 있습니다. 가장 중요한 한 가지부터 처리하세요.']
  ];
  $('[data-do-list]').innerHTML=positives.map((item,i)=>listItem(item[0],item[1],i+1)).join('');
  $('[data-dont-list]').innerHTML=cautions.map((item,i)=>listItem(item[0],item[1],i+1)).join('');

  $('[data-key-grid]').innerHTML=`
    <article class="fortune-key-card is-action"><span>01 · 가장 먼저</span><strong>${esc(v.godPack.action)}</strong><p>${esc(v.godPack.title)}이 중심에 들어오는 날입니다.</p><small>개인 성향 × ${dayWord}의 흐름</small></article>
    <article class="fortune-key-card is-action"><span>02 · 일과 관계</span><strong>${esc(v.monthRel.label==='육합'||v.monthRel.label==='삼합'?'연결을 활용하세요.':'내 순서를 먼저 정하세요.')}</strong><p>${esc(v.monthRel.copy)}</p><small>일의 흐름 · ${esc(relationPlain(v.monthRel.label))}</small></article>
    <article class="fortune-key-card is-action"><span>03 · 균형</span><strong>${esc(balancePack[v.supportEl].keyword)}을 조금 보완하세요.</strong><p>평소 상대적으로 덜 쓰는 방식을 의식적으로 조금 넣으면 하루가 안정됩니다.</p><small>개인 오행 균형을 생활 언어로 변환</small></article>`;

  const bp=balancePack[v.supportEl];
  const nums=luckyNumbers(hash(`${input.birthDate}|${input.birthTime||''}|${v.natal.year}|${v.natal.month}|${v.natal.day}|${v.natal.hour}|${v.expected}`));
  const lucky=$('.fortune-lucky-section');
  if(lucky)lucky.innerHTML=`
    <p class="fortune-label">07 · PERSONAL BALANCE</p>
    <h2>${dayWord}의 개인 균형 포인트</h2>
    <p class="fortune-lucky-lead">평소 상대적으로 덜 쓰는 성향을 생활 속에서 가볍게 보완하는 참고 포인트입니다.</p>
    <div class="fortune-lucky-grid">
      <article class="fortune-lucky-card"><small>보완 키워드</small><strong>${esc(bp.keyword)}</strong><p>오늘 일부러 조금 더 써보면 좋은 행동 방향입니다.</p></article>
      <article class="fortune-lucky-card"><small>도움이 되는 색</small><strong>${esc(bp.color)}</strong><p>작은 소품이나 화면 배경처럼 가볍게 참고하세요.</p></article>
      <article class="fortune-lucky-card"><small>개인 숫자</small><strong>${nums.join(' · ')}</strong><p>생년월일·출생시간·${dayWord} 날짜를 함께 넣어 고정 생성합니다.</p></article>
      <article class="fortune-lucky-card"><small>가까이 두기 좋은 사물</small><strong>${esc(bp.object)}</strong><p>보완 키워드를 생활 속 행동으로 떠올리기 위한 상징입니다.</p></article>
      <article class="fortune-lucky-card"><small>집중 시간대</small><strong>${esc(bp.time)}</strong><p>중요한 일 하나를 배치할 때 참고하기 좋은 시간대입니다.</p></article>
      <article class="fortune-lucky-card"><small>오늘의 균형</small><strong>강점은 살리고, 부족한 쪽은 조금만 보완</strong><p>잘하는 것을 억지로 줄이기보다 부족한 행동 하나를 더하는 방식이 좋습니다.</p></article>
    </div>`;

  $('[data-tip-grid]').innerHTML=`
    <article class="fortune-tip-card"><span>01</span><h3>일</h3><p>${esc(v.godPack.work)} ${esc(relationSentence(v.monthRel.label,'work'))}</p></article>
    <article class="fortune-tip-card"><span>02</span><h3>인연</h3><p>${esc(v.godPack.love)} ${esc(relationSentence(v.dayRel.label,'love'))}</p></article>
    <article class="fortune-tip-card"><span>03</span><h3>재물</h3><p>${esc(v.godPack.money)}</p></article>`;
  $('[data-tip-final]').textContent=`${v.impact.title}. ${v.godPack.action}`;

  $('[data-total-summary]').innerHTML=`
    <p><span class="fortune-summary-label">OVERALL</span><strong>${esc(`${dayWord}은 ${v.impact.title}입니다.`)}</strong>${esc(`${v.godPack.title}. ${v.impact.copy}`)}</p>
    <p><span class="fortune-summary-label">WORK · RELATION</span><strong>일은 ${esc(relationPlain(v.monthRel.label))}, 관계는 ${esc(relationPlain(v.dayRel.label))}입니다.</strong>${esc(`${v.monthRel.copy} ${v.dayRel.copy}`)}</p>
    <p><span class="fortune-summary-label">BALANCE</span><strong>${esc(balancePack[v.balance.dominant].keyword)}은 강점으로, ${esc(balancePack[v.supportEl].keyword)}은 보완 포인트로 보세요.</strong>${esc('오늘은 잘하는 방식을 억지로 줄이기보다 부족한 행동 하나를 더하는 편이 좋습니다.')}</p>`;

  $('[data-evidence]').innerHTML=`
    <article class="fortune-evidence-item"><strong>四柱 · 개인 명식</strong><p>연주 ${v.natal.year}, 월주 ${v.natal.month}, 일주 ${v.natal.day}${v.h?`, 시주 ${v.natal.hour}`:'이며 출생시간이 없어 시주는 제외'}했습니다.</p></article>
    <article class="fortune-evidence-item"><strong>五行 · 오행 분포</strong><p>${Object.keys(v.balance.pct).map(k=>`${eShort[k]} ${v.balance.pct[k]}%`).join(' · ')}로 계산하고 월지에 계절 가중치를 더했습니다.</p></article>
    <article class="fortune-evidence-item"><strong>十神 · 당일 성향</strong><p>내 일간 ${v.d.stem}과 ${dayWord} 천간 ${v.target.stem}의 관계를 ${v.god}으로 읽고 쉬운 행동 언어로 변환했습니다.</p></article>
    <article class="fortune-evidence-item"><strong>日支 · 관계</strong><p>내 일지 ${v.d.branch}와 ${dayWord} 지지 ${v.target.branch}는 ${v.dayRel.label} 관계입니다.</p></article>
    <article class="fortune-evidence-item"><strong>月支 · 일·사회</strong><p>내 월지 ${v.m.branch}와 ${dayWord} 지지 ${v.target.branch}는 ${v.monthRel.label} 관계로, 일과 사회적 흐름에 더 크게 반영했습니다.</p></article>
    ${v.h?`<article class="fortune-evidence-item"><strong>時支 · 실행·후반</strong><p>내 시지 ${v.h.branch}와 ${dayWord} 지지 ${v.target.branch}는 ${v.hourRel.label} 관계로 저녁과 실행 흐름에 반영했습니다.</p></article>`:''}
    <article class="fortune-evidence-item"><strong>年支 · 외부 환경</strong><p>연지 ${v.y.branch}와 ${dayWord} 지지 ${v.target.branch}의 ${v.yearRel.label} 관계는 보조 변수로 사용했습니다.</p></article>
    <article class="fortune-evidence-item"><strong>개인화 원칙</strong><p>이름은 표시용이며 계산에는 사용하지 않습니다. 생년월일·출생시간·달력 기준·윤달 여부와 ${dayWord} 일진을 계산 변수로 사용합니다.</p></article>`;

  root.dataset.personalized='full';
}

function renderFallback(v){
  const name=input.name||'회원';
  const dateLabel=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(`${v.expected}T12:00:00+09:00`));
  const heroTitle=root.querySelector('.fortune-hero h1');
  if(heroTitle)heroTitle.innerHTML=`<span data-name>${esc(name)}</span>님,<br />${dayWord}의 흐름을 정리했습니다.`;
  $('[data-summary]').textContent=`${name}님의 일주와 ${dayWord} 날짜 흐름을 우선 계산했습니다. ${v.pack.headline}. ${v.dayRel.copy}`;
  $('[data-meta]').innerHTML=`<span>${v.expected}</span><span>${dateLabel}</span><span>내 일주 ${v.natal.day}</span><span>${dayWord} 일진 ${v.target.pillar}</span>`;
  $('[data-headline]').textContent=`${dayWord}은 ${v.pack.headline}입니다.`;
  $('[data-signal-note]').textContent=`${v.dayRel.copy} ${v.stemText}`;
  $('[data-relation-pills]').innerHTML=`<span>내 일주 ${v.natal.day}</span><span>${relationPlain(v.dayRel.label)}</span><span>${dayWord} ${v.target.pillar}</span>`;
  $('[data-relation-text]').textContent=`관계에서는 ${v.dayRel.copy} ${v.stemText}`;
  $('[data-fortune-story]').innerHTML=`<p><strong>${dayWord}의 전체 흐름</strong> ${esc(v.pack.headline)}. ${esc(v.dayRel.copy)}</p><p><strong>실제로는</strong> ${esc(v.pack.work)} ${esc(v.stemText)}</p>`;
  $('[data-area-grid]').innerHTML=[
    ['01','재물운',v.pack.money,'재물'],['02','연애운',v.pack.love,'인연'],['03','일·학업운',v.pack.work,'일'],['04','생활운',v.pack.life,'생활']
  ].map(([n,title,copy,badge])=>`<article class="fortune-card"><span>${n}</span><h3>${title}</h3><p>${esc(copy)}</p><strong>${badge}</strong></article>`).join('');
  $('[data-time-grid]').innerHTML=`
    <article class="fortune-time-card"><span>01 · 오전</span><strong>중요한 일부터 시작하세요.</strong><p>${esc(v.pack.work)}</p></article>
    <article class="fortune-time-card"><span>02 · 오후</span><strong>사람과 일의 반응을 함께 보세요.</strong><p>${esc(v.dayRel.copy)}</p></article>
    <article class="fortune-time-card"><span>03 · 저녁</span><strong>하루를 정리하고 여백을 남기세요.</strong><p>${esc(v.pack.life)}</p></article>`;
  $('[data-do-list]').innerHTML=listItem('가장 중요한 일 하나 먼저 끝내기',v.pack.work,1)+listItem('필요한 말은 짧고 분명하게 하기',v.pack.love,2)+listItem('결정 전 목적과 예산 확인하기',v.pack.money,3);
  $('[data-dont-list]').innerHTML=listItem('한꺼번에 너무 많은 일을 벌이기','오늘의 중심이 흐려질 수 있습니다.',1)+listItem('한 번의 반응만 보고 결론 내리기','관계와 일 모두 전체 흐름을 같이 보세요.',2)+listItem('기분에 따라 지출 범위 넓히기','결제 전 목적과 예산을 한 번 확인하세요.',3);
  $('[data-key-grid]').innerHTML=`
    <article class="fortune-key-card is-action"><span>01 · 가장 먼저</span><strong>${esc(v.pack.work)}</strong><p>오늘의 첫 행동을 분명하게 만들어보세요.</p></article>
    <article class="fortune-key-card is-action"><span>02 · 사람과 대화</span><strong>${esc(v.pack.love)}</strong><p>${esc(v.dayRel.copy)}</p></article>
    <article class="fortune-key-card is-action"><span>03 · 마무리</span><strong>${esc(v.pack.life)}</strong><p>오늘 시작한 것 하나에 완료 표시를 남겨보세요.</p></article>`;
  const lucky=$('.fortune-lucky-section');
  if(lucky)lucky.innerHTML=`<p class="fortune-label">07 · PERSONAL BALANCE</p><h2>${dayWord}의 균형 포인트</h2><p class="fortune-lucky-lead">현재 네트워크 연결 상태로 인해 전체 명식 대신 일주 중심으로 계산했습니다.</p><div class="fortune-lucky-note">페이지를 새로고침하면 전체 명식 계산이 다시 시도됩니다. 현재 결과도 오늘의 기본 흐름을 보는 데에는 사용할 수 있습니다.</div>`;
  $('[data-tip-grid]').innerHTML=`<article class="fortune-tip-card"><span>01</span><h3>일</h3><p>${esc(v.pack.work)}</p></article><article class="fortune-tip-card"><span>02</span><h3>인연</h3><p>${esc(v.pack.love)}</p></article><article class="fortune-tip-card"><span>03</span><h3>재물</h3><p>${esc(v.pack.money)}</p></article>`;
  $('[data-tip-final]').textContent=`${v.pack.headline}. ${v.dayRel.copy}`;
  $('[data-total-summary]').innerHTML=`<p><span class="fortune-summary-label">OVERALL</span><strong>${esc(`${dayWord}은 ${v.pack.headline}입니다.`)}</strong>${esc(v.dayRel.copy)}</p><p><span class="fortune-summary-label">ACTION</span><strong>${esc(v.pack.work)}</strong>${esc(v.stemText)}</p>`;
  $('[data-evidence]').innerHTML=`<article class="fortune-evidence-item"><strong>일주 중심 계산</strong><p>내 일주 ${v.natal.day}와 ${dayWord} 일진 ${v.target.pillar}의 관계를 우선 반영했습니다.</p></article><article class="fortune-evidence-item"><strong>계산 상태</strong><p>전체 사주 계산 모듈 연결이 지연되어 연주·월주·시주 개인화는 이번 결과에서 제외했습니다.</p></article>`;
  root.dataset.personalized='fallback';
}

function reportText(v){
  const cards=[...root.querySelectorAll('[data-area-grid] .fortune-card')].map(card=>`${card.querySelector('h3')?.textContent||''}: ${card.querySelector('p')?.innerText||''}`);
  const key=[...root.querySelectorAll('[data-key-grid] .fortune-key-card')].map(card=>`- ${card.querySelector('strong')?.textContent||''}`);
  return [
    `정월재 ${dayWord}의 운세`,
    `${input.name} · 일주 ${v.natal.day}`,
    `${dayWord} ${v.expected} · 일진 ${v.target.pillar}`,
    '',
    $('[data-headline]')?.textContent||'',
    $('[data-signal-note]')?.textContent||'',
    '',
    ...cards,
    '',
    '핵심 행동',
    ...key
  ].join('\n');
}
async function copyText(text){
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return;}
  const area=document.createElement('textarea');
  area.value=text;area.style.position='fixed';area.style.opacity='0';
  document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();
}
async function setupActions(v){
  const copyBtn=$('[data-copy]'),pdfBtn=$('[data-pdf]'),saveBtn=$('[data-save]'),actionStatus=$('[data-action-status]');
  copyBtn?.addEventListener('click',async()=>{
    try{await copyText(reportText(v));if(actionStatus)actionStatus.textContent='운세 내용을 복사했습니다.';}
    catch(e){if(actionStatus)actionStatus.textContent='복사하지 못했습니다.';}
  });
  pdfBtn?.addEventListener('click',()=>window.print());
  saveBtn?.addEventListener('click',async()=>{
    if(!saveBtn)return;
    saveBtn.disabled=true;
    if(actionStatus)actionStatus.textContent='저장 상태를 확인하고 있습니다.';
    try{
      const [{firebaseConfig},appMod,authMod,dbMod]=await Promise.all([
        import('./firebase-config.js?v=20260907-1645'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
      ]);
      const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(firebaseConfig);
      const auth=authMod.getAuth(app),user=auth.currentUser;
      if(!user){location.href='./login.html?next=./fortune-result.html';return;}
      const db=dbMod.getFirestore(app);
      await dbMod.addDoc(dbMod.collection(db,'users',user.uid,'readings'),{
        type:tomorrow?'tomorrow':'fortune',
        mode:input.mode||'today',
        title:`${input.name}님의 ${dayWord}의 운세`,
        input,
        summary:$('[data-headline]')?.textContent||'',
        targetDate:v.expected,
        natalDayPillar:v.natal.day,
        targetDayPillar:v.target.pillar,
        relation:v.dayRel.label,
        score:v.score,
        personalized:v.full?'full-pillars':'day-pillar-fallback',
        reportText:reportText(v),
        createdAt:dbMod.serverTimestamp()
      });
      saveBtn.textContent='저장 완료';
      if(actionStatus)actionStatus.textContent='정월록과 마이페이지에 저장했습니다.';
    }catch(e){
      saveBtn.disabled=false;
      if(actionStatus)actionStatus.textContent='저장하지 못했습니다. 잠시 후 다시 시도해주세요.';
    }
  });
}

try{
  const value=await build();
  if(value.full)renderFull(value);else renderFallback(value);
  root.dataset.finalState='ready';
  window.__jwFortuneResultReady=true;
  setupActions(value);
  window.dispatchEvent(new CustomEvent('jw:fortune-rendered'));
  window.dispatchEvent(new CustomEvent('jw:result-ready'));
}catch(error){
  console.error('fortune result failed',error);
  root.dataset.finalState='ready';
  const container=root.querySelector('.fortune-result-container');
  if(container)container.innerHTML=`<section class="fortune-report"><p class="fortune-label">FORTUNE</p><h1>운세 계산 연결이 지연되고 있습니다.</h1><p class="fortune-lead">${input.calendarType==='lunar'?'음력 날짜 계산 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.':'입력 정보를 다시 확인한 뒤 운세를 다시 확인해주세요.'}</p><a class="fortune-button primary" href="${tomorrow?'./tomorrow.html':'./fortune.html'}">다시 입력하기</a></section>`;
  window.dispatchEvent(new CustomEvent('jw:fortune-rendered'));
  window.dispatchEvent(new CustomEvent('jw:result-ready'));
}
