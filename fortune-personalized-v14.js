import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';

(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  let input={};try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  if(!input.birthDate)return;
  const $=(s,r=root)=>r.querySelector(s);
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const tomorrow=input.mode==='tomorrow',dayWord=tomorrow?'내일':'오늘';

  const stems={
    갑:{e:'wood',p:'yang'},을:{e:'wood',p:'yin'},병:{e:'fire',p:'yang'},정:{e:'fire',p:'yin'},무:{e:'earth',p:'yang'},기:{e:'earth',p:'yin'},경:{e:'metal',p:'yang'},신:{e:'metal',p:'yin'},임:{e:'water',p:'yang'},계:{e:'water',p:'yin'}
  };
  const branches={인:'wood',묘:'wood',사:'fire',오:'fire',진:'earth',술:'earth',축:'earth',미:'earth',신:'metal',유:'metal',자:'water',해:'water'};
  const generates={wood:'fire',fire:'earth',earth:'metal',metal:'water',water:'wood'};
  const controls={wood:'earth',earth:'water',water:'fire',fire:'metal',metal:'wood'};
  const eName={wood:'목(木)',fire:'화(火)',earth:'토(土)',metal:'금(金)',water:'수(水)'};
  const eShort={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};
  const balancePack={
    wood:{keyword:'시작 · 성장',color:'청록 · 연두',object:'작은 노트 · 식물',direction:'동쪽',time:'오전 7시–11시'},
    fire:{keyword:'표현 · 실행',color:'주황 · 자주',object:'조명 · 펜',direction:'남쪽',time:'오전 10시–오후 2시'},
    earth:{keyword:'정리 · 안정',color:'베이지 · 황토',object:'수첩 · 정리함',direction:'익숙한 자리',time:'오후 1시–5시'},
    metal:{keyword:'판단 · 기준',color:'아이보리 · 실버',object:'금속 펜 · 키링',direction:'서쪽',time:'오후 3시–7시'},
    water:{keyword:'관찰 · 여백',color:'네이비 · 블루',object:'물병 · 이어폰',direction:'북쪽',time:'저녁 7시–11시'}
  };
  const tenGodPack={
    비견:{title:'내가 직접 기준을 세우는 힘',action:'남의 속도보다 내 우선순위를 먼저 정하세요.',money:'내가 잘 아는 범위 안에서 쓰고 결정하면 안정적입니다.',work:'주도권을 잡는 일에 힘이 붙지만 혼자 다 떠안지는 마세요.'},
    겁재:{title:'사람과 경쟁이 함께 들어오는 힘',action:'협업하되 역할과 선을 분명히 하세요.',money:'충동적인 비교 소비나 대신 부담하는 지출은 줄이는 편이 좋습니다.',work:'함께 움직일수록 빨라지지만 책임 범위를 먼저 정해야 편합니다.'},
    식신:{title:'꾸준히 결과를 만들어내는 힘',action:'작더라도 완성된 결과물 하나를 남겨보세요.',money:'생활에 실제 도움이 되는 소비는 만족도가 높은 편입니다.',work:'생산·작성·정리처럼 눈에 보이는 결과를 만드는 일에 잘 맞습니다.'},
    상관:{title:'표현과 수정의 힘이 강해지는 흐름',action:'좋은 아이디어는 꺼내되 말의 강도는 한 번 조절하세요.',money:'새로운 선택에 눈이 가기 쉬우니 결제 전 목적을 한 번 확인하세요.',work:'제안·발표·개선에는 강하지만 지적이 날카롭게 들리지 않게 조절하면 좋습니다.'},
    편재:{title:'기회와 돈의 흐름이 빠르게 움직이는 날',action:'들어온 기회는 빠르게 보되 범위는 분명히 정하세요.',money:'돈의 움직임이 커질 수 있어 큰 금액보다 목적과 회수 가능성을 먼저 보세요.',work:'외부 연락·영업·협상처럼 움직임이 있는 일에 반응이 빠릅니다.'},
    정재:{title:'현실적인 성과와 돈을 정리하기 좋은 날',action:'수입·지출·해야 할 일을 숫자와 일정으로 정리하세요.',money:'예산, 정기비용, 실제 필요한 지출을 정리하면 체감이 좋아집니다.',work:'정해진 범위 안에서 결과를 정확히 마무리하는 힘이 좋습니다.'},
    편관:{title:'압박을 힘으로 바꾸는 날',action:'급한 것과 중요한 것을 나눠 먼저 하나만 처리하세요.',money:'불안해서 서둘러 결정하는 소비는 한 번 더 확인하세요.',work:'마감·책임·승부가 있는 일에서 집중력이 올라가지만 무리하면 피로가 빠르게 옵니다.'},
    정관:{title:'책임과 기준을 지킬수록 유리한 날',action:'약속과 순서를 지키는 것이 가장 좋은 전략입니다.',money:'계획된 지출과 계약·정산처럼 기준이 있는 돈 흐름에 안정적입니다.',work:'보고·승인·공식 일정처럼 정확성과 신뢰가 필요한 일에 잘 맞습니다.'},
    편인:{title:'새로운 관점과 정보가 들어오는 날',action:'익숙한 답보다 다른 자료 하나를 더 비교해보세요.',money:'낯선 상품이나 방식은 바로 결제하기보다 정보를 먼저 확인하세요.',work:'기획·리서치·아이디어 탐색처럼 정답이 하나가 아닌 일에 강합니다.'},
    정인:{title:'배우고 준비하는 힘이 받쳐주는 날',action:'모르는 부분을 채우고 준비한 뒤 움직이면 안정적입니다.',money:'교육·도구·유지관리처럼 오래 쓰는 데 도움이 되는 지출은 괜찮습니다.',work:'자료 정리·학습·검토처럼 기반을 단단히 하는 일이 잘 맞습니다.'}
  };
  const yukhap=[['자','축'],['인','해'],['묘','술'],['진','유'],['사','신'],['오','미']];
  const chung=[['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];
  const hae=[['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']];
  const pa=[['자','유'],['축','진'],['인','해'],['묘','오'],['사','신'],['미','술']];
  const samhap=[['신','자','진'],['해','묘','미'],['인','오','술'],['사','유','축']];
  const hyeongGroups=[['인','사','신'],['축','미','술']];
  const pairHas=(arr,a,b)=>arr.some(p=>p.includes(a)&&p.includes(b));
  const isHyeong=(a,b)=>(a===b&&['진','오','유','해'].includes(a))||pairHas([['자','묘']],a,b)||hyeongGroups.some(g=>g.includes(a)&&g.includes(b));
  const pillarString=v=>typeof v==='string'?v:(v?.korean||v?.name||'');

  function seoulDate(offset=0){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    const d=new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00+09:00`);d.setDate(d.getDate()+offset);
    return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  }
  function calc(dateString,{time='12:00',lunar=false,leap=false,gender=''}={}){
    const [year,month,day]=dateString.split('-').map(Number),[hour,minute]=String(time||'12:00').split(':').map(Number);
    const r=calculateFourPillars({year,month,day,hour:Number.isFinite(hour)?hour:12,minute:Number.isFinite(minute)?minute:0,isLunar:lunar,isLeapMonth:leap,gender:gender||undefined});
    const o=typeof r?.toObject==='function'?r.toObject():r;
    return {year:pillarString(o?.year),month:pillarString(o?.month),day:pillarString(o?.day),hour:pillarString(o?.hour)};
  }
  const parts=p=>({pillar:p,stem:[...p][0],branch:[...p][1]});
  function branchRel(a,b){
    if(!a||!b)return {label:'평이',score:0,copy:'큰 충돌보다 내 선택이 더 중요한 흐름입니다.'};
    if(pairHas(yukhap,a,b))return {label:'육합',score:3,copy:'자연스럽게 맞물리는 접점이 생기기 쉬운 흐름입니다.'};
    if(samhap.some(g=>g.includes(a)&&g.includes(b)))return {label:'삼합',score:2,copy:'사람과 정보의 연결을 활용할수록 흐름이 좋아집니다.'};
    if(pairHas(chung,a,b))return {label:'충',score:-3,copy:'변수와 방향 전환이 생길 수 있어 유연하게 조정하는 것이 중요합니다.'};
    if(isHyeong(a,b))return {label:'형',score:-2,copy:'반복되던 불편을 다른 방식으로 끊어내기 좋은 흐름입니다.'};
    if(pairHas(hae,a,b))return {label:'해',score:-2,copy:'말과 태도의 작은 차이를 세심하게 볼 필요가 있습니다.'};
    if(pairHas(pa,a,b))return {label:'파',score:-1,copy:'작은 어긋남이나 미뤄둔 일을 정리하면 체감이 좋아집니다.'};
    if(a===b)return {label:'동일',score:1,copy:'평소 내 성향이 더 강하게 드러나는 흐름입니다.'};
    return {label:'평이',score:0,copy:'외부 변수보다 내가 정한 순서가 하루를 좌우합니다.'};
  }
  function tenGod(dayStem,targetStem){
    const A=stems[dayStem],B=stems[targetStem];if(!A||!B)return '비견';
    const samePolarity=A.p===B.p;
    if(A.e===B.e)return samePolarity?'비견':'겁재';
    if(generates[A.e]===B.e)return samePolarity?'식신':'상관';
    if(controls[A.e]===B.e)return samePolarity?'편재':'정재';
    if(controls[B.e]===A.e)return samePolarity?'편관':'정관';
    if(generates[B.e]===A.e)return samePolarity?'편인':'정인';
    return '비견';
  }
  function elementBalance(pillars,knownTime){
    const score={wood:0,fire:0,earth:0,metal:0,water:0};
    const used=['year','month','day',...(knownTime?['hour']:[])];
    used.forEach(k=>{const p=pillars[k]||'';const [s,b]=[...p];if(stems[s])score[stems[s].e]+=1;if(branches[b])score[branches[b]]+=1.1;});
    const monthBranch=[...(pillars.month||'')][1];if(branches[monthBranch])score[branches[monthBranch]]+=.9;
    const dayStem=[...(pillars.day||'')][0];if(stems[dayStem])score[stems[dayStem].e]+=.35;
    const total=Object.values(score).reduce((a,b)=>a+b,0)||1;
    const pct=Object.fromEntries(Object.entries(score).map(([k,v])=>[k,Math.round(v/total*100)]));
    const order=Object.keys(score).sort((a,b)=>score[b]-score[a]);
    return {score,pct,dominant:order[0],weak:order[order.length-1]};
  }
  function impactOf(balance,targetEl,dayMasterEl){
    const pct=balance.pct[targetEl]||0;
    if(pct>=30)return {type:'over',title:`이미 강한 ${eShort[targetEl]} 기운이 더해지는 날`,copy:'속도나 감정이 과해지지 않도록 범위를 줄이고 마감선을 분명히 잡는 편이 좋습니다.'};
    if(pct<=12||balance.weak===targetEl)return {type:'fill',title:`부족했던 ${eShort[targetEl]} 기운이 보완되는 날`,copy:'평소 덜 쓰던 방식이 자연스럽게 보완되기 때문에 새로운 행동을 시도하기 좋습니다.'};
    if(generates[targetEl]===dayMasterEl)return {type:'support',title:'날짜의 기운이 나를 받쳐주는 날',copy:'준비·회복·정보 정리에 힘이 붙어 급하게 밀기보다 기반을 다지면 안정적입니다.'};
    if(generates[dayMasterEl]===targetEl)return {type:'output',title:'내 기운을 밖으로 꺼내기 좋은 날',copy:'말·결과물·제안처럼 눈에 보이는 형태로 표현할수록 흐름을 잘 쓸 수 있습니다.'};
    if(controls[targetEl]===dayMasterEl)return {type:'pressure',title:'책임과 압박이 함께 들어오는 날',copy:'해야 할 일이 또렷해지는 대신 부담도 커질 수 있어 우선순위를 줄이는 것이 중요합니다.'};
    if(controls[dayMasterEl]===targetEl)return {type:'result',title:'성과와 현실적인 결과를 만들기 좋은 날',copy:'돈·일정·성과처럼 실제 결과가 남는 일을 분명하게 처리하는 편이 좋습니다.'};
    return {type:'steady',title:'내 흐름을 크게 흔들지 않는 날',copy:'무리하게 바꾸기보다 이미 정한 계획을 조금 더 정확하게 실행하는 편이 좋습니다.'};
  }
  function hash(str){let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function luckyNumbers(seed){const out=[];let x=seed||1;while(out.length<3){x^=x<<13;x^=x>>>17;x^=x<<5;const n=(x>>>0)%9+1;if(!out.includes(n))out.push(n);}return out;}
  function relationSentence(label,area){
    if(label==='육합'||label==='삼합')return area==='love'?'대화를 먼저 열거나 약속을 잡기 좋은 편입니다.':'연락·협업·정보 연결을 활용하면 일이 자연스럽게 이어질 수 있습니다.';
    if(['충','형','해','파'].includes(label))return area==='love'?'한 번의 말보다 실제 행동을 같이 보고, 궁금한 부분은 직접 확인하는 편이 좋습니다.':'예상과 다른 변수가 생길 수 있어 처음 계획을 고집하기보다 순서를 조정하는 편이 좋습니다.';
    return area==='love'?'상대의 속도보다 관계 전체의 흐름이 편한지를 보는 편이 좋습니다.':'외부 상황보다 내가 먼저 정한 기준과 순서가 더 중요합니다.';
  }

  function build(){
    const expected=seoulDate(tomorrow?1:0),knownTime=!input.birthTimeUnknown&&Boolean(input.birthTime);
    const natal=calc(input.birthDate,{time:input.birthTime||'12:00',lunar:input.calendarType==='lunar',leap:Boolean(input.isLeapMonth),gender:input.gender||''});
    const target=parts(calc(expected).day),y=parts(natal.year),m=parts(natal.month),d=parts(natal.day),h=knownTime?parts(natal.hour):null;
    const balance=elementBalance(natal,knownTime),targetEl=stems[target.stem]?.e||'earth',dayMasterEl=stems[d.stem]?.e||'earth';
    const dayRel=branchRel(d.branch,target.branch),monthRel=branchRel(m.branch,target.branch),yearRel=branchRel(y.branch,target.branch),hourRel=h?branchRel(h.branch,target.branch):null;
    const god=tenGod(d.stem,target.stem),godPack=tenGodPack[god],impact=impactOf(balance,targetEl,dayMasterEl),supportEl=balance.weak;
    const score=50+dayRel.score*4+monthRel.score*2+(hourRel?.score||0)+(impact.type==='fill'?8:impact.type==='support'?6:impact.type==='over'?-6:0);
    return {expected,natal,target,y,m,d,h,balance,targetEl,dayMasterEl,dayRel,monthRel,yearRel,hourRel,god,godPack,impact,supportEl,score:Math.max(25,Math.min(90,score))};
  }

  function render(v){
    const name=input.name||'회원',dateLabel=new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(`${v.expected}T12:00:00+09:00`));
    const headline=`${dayWord}은 ${v.impact.title}입니다.`;
    const summary=`${name}님의 ${v.natal.year}·${v.natal.month}·${v.natal.day}${v.h?`·${v.natal.hour}`:''} 명식과 ${dayWord} 일진 ${v.target.pillar}을 함께 보면, ${v.god}의 성격과 ${v.dayRel.label} 관계가 중심에 들어옵니다. ${v.impact.copy}`;
    const hero=$('[data-summary]');if(hero)hero.textContent=summary;
    const meta=$('[data-meta]');if(meta)meta.innerHTML=`<span>${v.expected}</span><span>${dateLabel}</span><span>연주 ${v.natal.year}</span><span>월주 ${v.natal.month}</span><span>일주 ${v.natal.day}</span>${v.h?`<span>시주 ${v.natal.hour}</span>`:'<span>시주 미반영</span>'}<span>${dayWord} ${v.target.pillar}</span>`;
    const head=$('[data-headline]');if(head)head.textContent=headline;
    const note=$('[data-signal-note]');if(note)note.textContent=`${v.godPack.title}. ${v.dayRel.copy}`;

    const relation=$('.fortune-relation');if(relation)relation.innerHTML=`<p class="fortune-label">01 · ${tomorrow?'TOMORROW':'TODAY'} × FULL SAJU</p><h2>내 사주 전체와 ${dayWord} 일진이 어떻게 만날까?</h2><div class="relation-pills"><span>일간 ${v.d.stem}</span><span>${v.god}</span><span>일지 ${v.dayRel.label}</span><span>월지 ${v.monthRel.label}</span>${v.h?`<span>시지 ${v.hourRel.label}</span>`:''}</div><p>${esc(`일간 ${v.d.stem}과 ${dayWord} 천간 ${v.target.stem}은 ${v.god} 관계로 읽힙니다. 일지에서는 ${v.dayRel.label}, 월지에서는 ${v.monthRel.label}${v.h?`, 시지에서는 ${v.hourRel.label}`:''}이 잡힙니다. ${v.impact.copy}`)}</p>`;

    const story=$('[data-fortune-story]');if(story)story.innerHTML=`<p><strong>${dayWord}의 전체 흐름</strong> ${v.impact.title}. 원국에서 가장 강한 기운은 ${eName[v.balance.dominant]} ${v.balance.pct[v.balance.dominant]}%이고, 상대적으로 부족한 기운은 ${eName[v.balance.weak]} ${v.balance.pct[v.balance.weak]}%입니다. ${dayWord}의 ${eName[v.targetEl]}이 들어오면서 평소 균형과 다른 반응이 생길 수 있습니다.</p><p><strong>실제로는</strong> ${v.godPack.action} ${v.monthRel.copy} ${v.h?`출생시간까지 보면 실행 쪽에서는 ${v.hourRel.copy}`:'출생시간이 없어 시주는 제외하고 연·월·일주 중심으로 읽었습니다.'}</p>`;

    const area=$('[data-area-grid]');if(area){
      const money=`${v.godPack.money} ${v.impact.type==='over'?'오늘 기분이나 분위기에 따라 범위가 커지는지만 확인하세요.':v.impact.type==='fill'?'평소 망설이던 필요한 지출이나 정산을 정리하기 좋습니다.':'큰 선택보다 실제 필요와 예산을 먼저 맞춰보세요.'}`;
      const love=`일지 ${v.d.branch}와 ${dayWord} 지지 ${v.target.branch}는 ${v.dayRel.label} 관계입니다. ${relationSentence(v.dayRel.label,'love')}`;
      const work=`월지 ${v.m.branch}와 ${dayWord} 지지 ${v.target.branch}는 ${v.monthRel.label} 관계입니다. ${v.godPack.work} ${relationSentence(v.monthRel.label,'work')}`;
      const life=`원국에서 ${eShort[v.balance.dominant]}가 강하고 ${eShort[v.balance.weak]}가 상대적으로 약합니다. ${v.impact.copy} ${v.h?`시지 관계가 ${v.hourRel.label}라 저녁에는 ${relationSentence(v.hourRel.label,'work')}`:'저녁에는 일정에 여백을 남겨 체력을 정리하는 편이 좋습니다.'}`;
      area.innerHTML=[['01','재물운','돈은 오늘 들어오는 십신과 원국의 균형을 함께 봅니다.',money,'재물'],['02','연애운','관계는 내 일지와 날짜 지지의 관계를 중심으로 봅니다.',love,'인연'],['03','일·학업운','일은 월주와 날짜의 관계를 더 크게 반영합니다.',work,'일'],['04','생활운','생활은 내 오행 균형에 날짜의 기운이 무엇을 더하는지 봅니다.',life,'생활']].map(([n,t,h,p,b])=>`<article class="fortune-card"><span>${n}</span><h3>${t}</h3><p><strong>${h}</strong>${esc(p)}</p><strong>${b}</strong></article>`).join('');
    }

    const time=$('[data-time-grid]');if(time){
      const morning=v.godPack.action;
      const afternoon=relationSentence(v.monthRel.label,'work');
      const evening=v.h?relationSentence(v.hourRel.label,'work'):`${eShort[v.balance.weak]} 기운을 보완하는 휴식이나 정리 시간을 남겨보세요.`;
      time.innerHTML=[['01 · 오전','가장 먼저 할 일',morning],['02 · 오후','일과 사람의 흐름',afternoon],['03 · 저녁','마무리 기준',evening]].map(([n,t,p])=>`<article class="fortune-time-card"><span>${n}</span><strong>${t}</strong><p>${esc(p)}</p></article>`).join('');
      const sec=time.closest('.fortune-report');if(sec)sec.querySelector('.fortune-section-lead').textContent=`일간의 ${v.god} 성격, 월지 관계, ${v.h?'시지 관계':'오행 균형'}를 나눠 시간대 행동으로 풀었습니다.`;
    }

    const positives=[
      [v.godPack.action,`${v.god}의 성격을 가장 실용적으로 쓰는 행동입니다.`],
      [v.monthRel.label==='육합'||v.monthRel.label==='삼합'?'사람과 정보를 먼저 연결하기':'해야 할 일의 순서를 먼저 정하기',v.monthRel.copy],
      [`${eShort[v.supportEl]} 기운을 보완하는 작은 행동 하나 넣기`,`원국에서 상대적으로 약한 ${eName[v.supportEl]}을 생활 속에서 보완하는 방식입니다.`]
    ];
    const cautions=[
      [v.impact.type==='over'?`${eShort[v.targetEl]} 기운을 너무 밀어붙이기`:'한 번의 반응으로 결론 내리기',v.impact.type==='over'?'이미 강한 기운이 더해져 과속이나 과한 표현으로 이어질 수 있습니다.':'당일 관계는 한 장면보다 반복되는 흐름을 같이 보는 편이 좋습니다.'],
      [['충','형','해','파'].includes(v.dayRel.label)?'상대의 말을 추측으로 채우기':'일정을 빈칸 없이 채우기',v.dayRel.copy],
      ['돈·일·관계를 한 번에 해결하려 하기','개인 명식에서 강한 기운이 몰릴수록 한 번에 여러 문제를 잡으면 피로가 빨리 올라갑니다. 가장 중요한 한 가지부터 처리하세요.']
    ];
    const renderList=(sel,items)=>{const ul=$(sel);if(ul)ul.innerHTML=items.map(([t,p],i)=>`<li data-index="${String(i+1).padStart(2,'0')}"><div><strong>${esc(t)}</strong><span>${esc(p)}</span></div></li>`).join('');};
    renderList('[data-do-list]',positives);renderList('[data-dont-list]',cautions);

    const key=$('[data-key-grid]');if(key)key.innerHTML=`<article class="fortune-key-card is-action"><span>01 · 가장 먼저</span><strong>${esc(v.godPack.action)}</strong><p>${esc(v.godPack.title)}이 중심에 들어오는 날입니다.</p><small>일간 ${v.d.stem} × ${dayWord} 천간 ${v.target.stem} · ${v.god}</small></article><article class="fortune-key-card is-action"><span>02 · 일과 관계</span><strong>${esc(v.monthRel.label==='육합'||v.monthRel.label==='삼합'?'연결을 활용하세요.':'내 순서를 먼저 정하세요.')}</strong><p>${esc(v.monthRel.copy)}</p><small>월지 ${v.m.branch} × ${dayWord} 지지 ${v.target.branch} · ${v.monthRel.label}</small></article><article class="fortune-key-card is-action"><span>03 · 균형</span><strong>${eShort[v.supportEl]} 기운을 조금 보완하세요.</strong><p>내 원국에서 가장 약한 기운은 ${eName[v.supportEl]} ${v.balance.pct[v.supportEl]}%입니다.</p><small>오행 분포 · 강 ${eShort[v.balance.dominant]} / 약 ${eShort[v.balance.weak]}</small></article>`;

    const lucky=$('.fortune-lucky-section');if(lucky){
      const bp=balancePack[v.supportEl],nums=luckyNumbers(hash(`${input.birthDate}|${input.birthTime||''}|${v.natal.year}|${v.natal.month}|${v.natal.day}|${v.natal.hour}|${v.expected}`));
      lucky.innerHTML=`<p class="fortune-label">07 · PERSONAL BALANCE</p><h2>${dayWord}의 개인 균형 포인트</h2><p class="fortune-lucky-lead">날짜 자체의 오행이 아니라, 내 명식에서 상대적으로 부족한 ${eName[v.supportEl]}을 기준으로 생활 포인트를 잡았습니다.</p><div class="fortune-lucky-grid"><article class="fortune-lucky-card"><small>보완 키워드</small><strong>${bp.keyword}</strong><p>내 명식에서 상대적으로 약한 기운을 생활 언어로 풀었습니다.</p></article><article class="fortune-lucky-card"><small>도움이 되는 색</small><strong>${bp.color}</strong><p>${eName[v.supportEl]}의 성향을 색으로 옮긴 조합입니다.</p></article><article class="fortune-lucky-card"><small>개인 숫자</small><strong>${nums.join(' · ')}</strong><p>생년월일·출생시간·전체 명식·${dayWord} 날짜를 함께 넣어 고정 생성한 숫자입니다.</p></article><article class="fortune-lucky-card"><small>가까이 두기 좋은 사물</small><strong>${bp.object}</strong><p>${eName[v.supportEl]}의 성향을 생활 오브젝트로 풀었습니다.</p></article><article class="fortune-lucky-card"><small>방향 포인트</small><strong>${bp.direction}</strong><p>부족한 기운을 생활 속 상징으로 보완하는 방향입니다.</p></article><article class="fortune-lucky-card"><small>집중 시간대</small><strong>${bp.time}</strong><p>중요한 일 하나를 배치할 때 참고하기 좋은 시간대입니다.</p></article></div>`;
    }

    const total=$('[data-total-summary]');if(total)total.innerHTML=`<p><span class="fortune-summary-label">OVERALL</span><strong>${esc(headline)}</strong>${esc(`${v.godPack.title}. ${v.impact.copy}`)}</p><p><span class="fortune-summary-label">WORK · RELATION</span><strong>일은 ${v.monthRel.label}, 관계는 ${v.dayRel.label}의 영향을 받습니다.</strong>${esc(`${v.monthRel.copy} ${v.dayRel.copy}`)}</p><p><span class="fortune-summary-label">BALANCE</span><strong>강한 기운은 ${eName[v.balance.dominant]}, 부족한 기운은 ${eName[v.balance.weak]}입니다.</strong>${esc(`${dayWord}의 ${eName[v.targetEl]}이 들어오며 ${v.impact.title}.`)}</p>`;

    const evidence=$('[data-evidence]');if(evidence)evidence.innerHTML=`<article class="fortune-evidence-item"><strong>四柱 · 개인 명식</strong><p>연주 ${v.natal.year}, 월주 ${v.natal.month}, 일주 ${v.natal.day}${v.h?`, 시주 ${v.natal.hour}`:'이며 출생시간이 없어 시주는 제외'}했습니다.</p></article><article class="fortune-evidence-item"><strong>五行 · 오행 분포</strong><p>${Object.keys(v.balance.pct).map(k=>`${eShort[k]} ${v.balance.pct[k]}%`).join(' · ')}로 계산했습니다. 월지에는 계절 가중치를 더했습니다.</p></article><article class="fortune-evidence-item"><strong>十神 · 당일 십신</strong><p>내 일간 ${v.d.stem}과 ${dayWord} 천간 ${v.target.stem}의 관계를 ${v.god}으로 읽었습니다.</p></article><article class="fortune-evidence-item"><strong>日支 · 관계</strong><p>내 일지 ${v.d.branch}와 ${dayWord} 지지 ${v.target.branch}는 ${v.dayRel.label} 관계입니다.</p></article><article class="fortune-evidence-item"><strong>月支 · 일·사회</strong><p>내 월지 ${v.m.branch}와 ${dayWord} 지지 ${v.target.branch}는 ${v.monthRel.label} 관계로, 일과 사회적 흐름에 더 크게 반영했습니다.</p></article>${v.h?`<article class="fortune-evidence-item"><strong>時支 · 실행·후반</strong><p>내 시지 ${v.h.branch}와 ${dayWord} 지지 ${v.target.branch}는 ${v.hourRel.label} 관계로 저녁과 실행 흐름에 반영했습니다.</p></article>`:''}<article class="fortune-evidence-item"><strong>年支 · 외부 환경</strong><p>연지 ${v.y.branch}와 ${dayWord} 지지 ${v.target.branch}의 ${v.yearRel.label} 관계는 보조 변수로 사용했습니다.</p></article><article class="fortune-evidence-item"><strong>개인화 원칙</strong><p>이름은 표시용이며 계산에는 사용하지 않습니다. 생년월일·출생시간·달력 기준·윤달 여부와 ${dayWord} 일진을 계산 변수로 사용합니다.</p></article>`;

    const keySec=key?.closest('.fortune-report');if(keySec){const h2=keySec.querySelector('h2');if(h2)h2.textContent=`${dayWord}, 개인 명식 기준으로 이것만 기억하세요.`;}
    const luckySec=$('.fortune-lucky-section');if(luckySec)luckySec.querySelector('.fortune-label').textContent='07 · PERSONAL BALANCE';
    root.dataset.personalizedVersion='14';
  }

  let value=null;
  try{value=build();}catch(e){console.error('fortune personalization failed',e);return;}
  const apply=()=>{try{render(value);}catch(e){console.error('fortune personalized render failed',e);}};
  const wait=()=>{
    if(root.dataset.finalState==='ready'){setTimeout(apply,90);[650,1500].forEach(ms=>setTimeout(apply,ms));return;}
    const observer=new MutationObserver(()=>{if(root.dataset.finalState==='ready'){observer.disconnect();setTimeout(apply,90);[650,1500].forEach(ms=>setTimeout(apply,ms));}});
    observer.observe(root,{attributes:true,attributeFilter:['data-final-state']});
  };
  wait();
})();