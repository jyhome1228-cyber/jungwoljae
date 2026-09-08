import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';

(()=>{
  const root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  let input={};
  try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  if(!input.targetDate)return;

  const tomorrow=input.mode==='tomorrow';
  const dayWord=tomorrow?'내일':'오늘';
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const pillarString=v=>typeof v==='string'?v:(v?.korean||v?.name||'');
  const stemElement={갑:'wood',을:'wood',병:'fire',정:'fire',무:'earth',기:'earth',경:'metal',신:'metal',임:'water',계:'water'};
  const elementPack={
    wood:{label:'목(木)',colors:'청록 · 연두',objects:'작은 노트 · 식물 · 나무 소재',direction:'동쪽',time:'오전 7시–11시',words:['시작','성장','첫걸음'],action:'새로운 일을 크게 벌리기보다 아주 작은 첫 행동 하나를 정해보세요.'},
    fire:{label:'화(火)',colors:'주황 · 자주',objects:'조명 · 펜 · 따뜻한 음료',direction:'남쪽',time:'오전 10시–오후 2시',words:['표현','실행','연결'],action:'생각을 오래 품기보다 짧게 말하거나 보여주는 행동이 잘 맞습니다.'},
    earth:{label:'토(土)',colors:'베이지 · 황토',objects:'파우치 · 수첩 · 정리함',direction:'중앙 · 가까운 곳',time:'오후 1시–5시',words:['안정','정리','유지'],action:'새 일을 더하기보다 이미 벌어진 일을 정리하고 마무리해보세요.'},
    metal:{label:'금(金)',colors:'아이보리 · 실버',objects:'금속 펜 · 키링 · 손목시계',direction:'서쪽',time:'오후 3시–7시',words:['판단','정돈','선택'],action:'선택지를 줄이고 “오늘 꼭 할 것”과 “안 해도 될 것”을 분리해보세요.'},
    water:{label:'수(水)',colors:'네이비 · 블루',objects:'물병 · 이어폰 · 메모 앱',direction:'북쪽',time:'저녁 7시–11시',words:['관찰','비교','여유'],action:'바로 결론 내리기보다 자료나 상대의 반응을 한 번 더 확인해보세요.'}
  };

  function getDay(){
    const [year,month,day]=input.targetDate.split('-').map(Number);
    const r=calculateFourPillars({year,month,day,hour:12,minute:0,isLunar:false});
    const o=typeof r?.toObject==='function'?r.toObject():r;
    const p=pillarString(o?.day);
    return {pillar:p,stem:[...p][0],branch:[...p][1]};
  }
  function hash(str){let h=2166136261;for(const ch of str){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function numbers(seed){
    const out=[];let x=seed||1;
    while(out.length<3){x^=x<<13;x^=x>>>17;x^=x<<5;const n=1+((x>>>0)%9);if(!out.includes(n))out.push(n);}
    return out.sort((a,b)=>a-b);
  }
  function toneWords(base){
    const headline=(root.querySelector('[data-headline]')?.textContent||'').trim();
    if(/점검|확인|서두르지|천천히/.test(headline))return ['확인','정리','보류'];
    if(/밀어|실행|움직|꺼내/.test(headline))return ['실행','연결','첫걸음'];
    return base.words;
  }
  function build(){
    let day;
    try{day=getDay();}catch(e){return;}
    const key=stemElement[day.stem]||'earth';
    const p=elementPack[key];
    const nums=numbers(hash(`${input.birthYear||''}|${input.targetDate}|${day.pillar}|${input.zodiac||''}`));
    const words=toneWords(p).join(' · ');
    const cards=[
      ['핵심 키워드',words,`${dayWord}의 흐름을 가장 짧게 기억하고 싶다면 이 세 단어만 챙겨도 충분합니다.`],
      ['도움이 되는 색',p.colors,`${p.label}의 성격을 생활 색상으로 가볍게 옮긴 조합입니다. 옷, 소품, 메모처럼 부담 없는 곳에 참고해보세요.`],
      ['참고 숫자',nums.join(' · '),`순서나 좌석처럼 작은 선택지가 여러 개일 때 재미로 참고할 수 있는 숫자입니다.`],
      ['가까이 두기 좋은 사물',p.objects,`${p.label}이 상징하는 생활 감각을 떠올리기 쉬운 사물들입니다. 특별한 물건을 새로 살 필요는 없습니다.`],
      ['참고 방향',p.direction,`이동이나 자리를 정할 때 가볍게 참고하는 상징 방향입니다. 실제 동선과 편의를 우선하세요.`],
      ['추천 시간대',p.time,`${p.label}의 성격을 시간대에 빗대어 정리한 참고 구간입니다. 중요한 일정이 이미 있다면 바꿀 필요는 없습니다.`]
    ];

    let section=root.querySelector('[data-fortune-lucky-section]');
    if(!section){
      section=document.createElement('section');
      section.className='fortune-report fortune-lucky-section';
      section.dataset.fortuneLuckySection='';
      const tip=root.querySelector('.fortune-tip-section');
      if(tip)tip.insertAdjacentElement('beforebegin',section);
      else root.querySelector('.fortune-total-section')?.insertAdjacentElement('beforebegin',section);
    }
    section.innerHTML=`<p class="fortune-label">07 · LUCKY KEYWORDS</p><h2>${dayWord}의 키워드와 작은 행운 포인트</h2><p class="fortune-lucky-lead">색·숫자·사물 같은 요소를 오행의 성격과 ${dayWord}의 일진에 맞춰 가볍게 풀었습니다. 실제 결과를 보장하는 의미보다 하루의 기분과 선택 기준을 잡는 참고용으로 봐주세요.</p><div class="fortune-lucky-grid">${cards.map(([l,t,c])=>`<article class="fortune-lucky-card"><small>${esc(l)}</small><strong>${esc(t)}</strong><p>${esc(c)}</p></article>`).join('')}</div><p class="fortune-lucky-note"><strong>${esc(dayWord)}의 한 가지 행동:</strong> ${esc(p.action)} · 색·사물·숫자는 명리 오행을 생활 상징으로 번역한 참고 키워드이며 행운이나 특정 결과를 보장하지 않습니다.</p>`;

    const keyLabel=[...root.querySelectorAll('.fortune-label')].find(el=>el.textContent.trim().startsWith('06'));
    if(keyLabel)keyLabel.textContent='06 · KEY POINTS';
    const tip=root.querySelector('.fortune-tip-section');
    if(tip){
      const label=tip.querySelector('.fortune-label');if(label)label.textContent=tomorrow?'08 · TOMORROW GUIDE':'08 · TODAY GUIDE';
      const h2=tip.querySelector('h2');if(h2)h2.textContent=`${dayWord} 실제로 이렇게 써보세요.`;
      const lead=tip.querySelector('.fortune-tip-lead');if(lead)lead.textContent=`메일, 지출, 연락, 일정처럼 ${dayWord} 실제로 마주칠 장면에 바로 적용할 수 있는 행동 기준입니다.`;
    }
    const total=root.querySelector('.fortune-total-section');
    if(total){const label=total.querySelector('.fortune-label');if(label)label.textContent='09 · TOTAL SUMMARY';}
  }

  [0,700,1700,2800,4800].forEach(ms=>setTimeout(build,ms));
})();
