import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';

(()=>{
  const root=document.querySelector('[data-fortune-result]');if(!root)return;
  let input={};try{input=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');}catch(e){}
  if(!input.birthDate)return;
  const $=(s,r=root)=>r.querySelector(s),esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const tomorrow=input.mode==='tomorrow',D=tomorrow?'내일':'오늘';
  const stem={갑:'wood',을:'wood',병:'fire',정:'fire',무:'earth',기:'earth',경:'metal',신:'metal',임:'water',계:'water'};
  const pillarString=v=>typeof v==='string'?v:(v?.korean||v?.name||'');
  const pack={
    wood:{do:['새로운 일의 첫 단계를 시작하기','미뤄둔 연락을 먼저 열기','움직여야 할 일의 날짜를 확정하기'],dont:['시작만 여러 개 만들어두기','방향 없이 일부터 늘리기','상대의 속도를 재촉하기'],morning:'가장 먼저 시작해야 할 일을 잡고 첫 행동을 만드세요.',afternoon:'사람과 연결하거나 다음 단계를 구체화하기 좋습니다.',evening:'새 일을 더 벌이기보다 오늘 시작한 것을 정리하세요.',guide:'첫걸음을 실제 행동으로 남기는 것이 핵심입니다.'},
    fire:{do:['제안·발표·공유를 밖으로 꺼내기','호감과 필요한 말을 분명히 표현하기','결과가 보이는 일을 먼저 처리하기'],dont:['감정이 오른 순간 말을 세게 하기','한꺼번에 약속을 늘리기','기분에 따라 큰돈을 쓰기'],morning:'준비한 내용을 정리하고 말할 핵심을 분명히 하세요.',afternoon:'표현과 실행의 힘이 가장 살아납니다. 중요한 말과 결과물을 꺼내세요.',evening:'과열된 마음을 가라앉히고 남은 일을 마무리하세요.',guide:'생각을 밖으로 보여줄수록 운의 흐름이 살아납니다.'},
    earth:{do:['진행 중인 일 하나를 끝내기','반복 지출과 일정 정리하기','약속과 관계의 리듬 맞추기'],dont:['갑자기 큰 변화를 여러 개 만들기','미뤄둔 일을 계속 쌓아두기','익숙하다는 이유로 불편함을 참기'],morning:'오늘 유지해야 할 일과 끝낼 일을 먼저 구분하세요.',afternoon:'관리·정리·조율의 힘이 살아나는 시간입니다.',evening:'생활 리듬을 안정시키고 내일 이어갈 일을 한 줄로 남기세요.',guide:'흩어진 것을 한곳에 모으고 안정시키는 것이 핵심입니다.'},
    metal:{do:['우선순위를 분명히 정하기','필요 없는 선택지를 줄이기','돈·약속·업무의 기준을 명확히 하기'],dont:['완벽한 답만 기다리기','작은 실수를 오래 붙잡기','상대를 내 기준으로만 판단하기'],morning:'해야 할 것과 하지 않을 것을 나누며 기준을 세우세요.',afternoon:'판단과 선택의 힘이 살아납니다. 중요한 결론을 정리하기 좋습니다.',evening:'남은 일을 잘라내고 완료 표시를 남기는 데 힘을 쓰세요.',guide:'애매함을 줄이고 기준을 분명히 하는 것이 핵심입니다.'},
    water:{do:['자료와 상황을 한 번 더 살피기','상대의 말과 행동 흐름을 함께 보기','돈과 일정의 흐름을 기록하기'],dont:['정보만 모으고 결정을 계속 미루기','한 번의 반응을 크게 해석하기','피곤한데 생각을 계속 붙잡기'],morning:'급히 결론 내리기보다 필요한 정보를 먼저 모으세요.',afternoon:'비교한 내용을 정리하고 선택지를 두세 개로 줄이세요.',evening:'관찰과 회복의 힘이 살아납니다. 생각을 정리하고 다음 답을 준비하세요.',guide:'한 번 더 살핀 뒤 움직이는 것이 핵심입니다.'}
  };
  const branchWords={자:'정보와 흐름',축:'축적과 점검',인:'시작과 이동',묘:'관계와 확장',진:'전환과 정리',사:'표현과 속도',오:'실행과 결정',미:'조율과 관리',신:'판단과 변화',유:'정리와 기준',술:'마무리와 책임',해:'관찰과 회복'};
  function seoulDate(offset=0){const ps=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),g=t=>ps.find(p=>p.type===t)?.value||'',d=new Date(`${g('year')}-${g('month')}-${g('day')}T12:00:00+09:00`);d.setDate(d.getDate()+offset);return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
  function dp(date,{time='12:00',lunar=false,leap=false,gender=''}={}){const [y,m,d]=date.split('-').map(Number),[h,mi]=String(time).split(':').map(Number),r=calculateFourPillars({year:y,month:m,day:d,hour:h,minute:mi,isLunar:lunar,isLeapMonth:leap,gender:gender||undefined}),o=typeof r?.toObject==='function'?r.toObject():r,p=pillarString(o?.day);return {p,s:[...p][0],b:[...p][1]};}
  function render(){
    const date=seoulDate(tomorrow?1:0),n=dp(input.birthDate,{time:input.birthTime||'12:00',lunar:input.calendarType==='lunar',leap:Boolean(input.isLeapMonth),gender:input.gender||''}),t=dp(date),k=stem[t.s]||'earth',x=pack[k],bw=branchWords[t.b]||'흐름 조절';
    const time=$('[data-time-grid]');if(time)time.innerHTML=`<article class="fortune-time-card"><span>AM · 오전</span><strong>준비와 방향</strong><p>${esc(x.morning)}</p></article><article class="fortune-time-card"><span>PM · 오후</span><strong>${esc(bw)}</strong><p>${esc(x.afternoon)}</p></article><article class="fortune-time-card"><span>NIGHT · 저녁</span><strong>정리와 마무리</strong><p>${esc(x.evening)}</p></article>`;
    const doList=$('[data-do-list]');if(doList)doList.innerHTML=x.do.map((v,i)=>`<li data-index="0${i+1}"><div><strong>${esc(v)}</strong><span>${esc(i===0?x.guide:`${D}의 ${bw} 흐름과 잘 맞는 행동입니다.`)}</span></div></li>`).join('');
    const dont=$('[data-dont-list]');if(dont)dont.innerHTML=x.dont.map((v,i)=>`<li data-index="0${i+1}"><div><strong>${esc(v)}</strong><span>${esc(`${D}의 기운이 한쪽으로 과해질 때 생기기 쉬운 흐름입니다.`)}</span></div></li>`).join('');
    const choice=$('.fortune-choice-section');if(choice){const h=choice.querySelector('h2');if(h)h.textContent=`${D}의 기운을 잘 쓰는 법`;const pos=choice.querySelector('.positive>span');if(pos)pos.textContent=`${D} 힘이 붙는 행동`;const neg=choice.querySelector('.caution>span');if(neg)neg.textContent=`${D} 피하는 게 좋은 행동`;}
    const total=$('[data-total-summary]');if(total)total.innerHTML=`<p><span class="fortune-summary-label">MY SAJU × ${tomorrow?'TOMORROW':'TODAY'}</span><strong>${input.name}님의 ${n.p} 일주와 ${D}의 ${t.p} 일주가 만납니다.</strong>${D}의 중심 오행은 ${t.s}의 ${k==='wood'?'목(木)':k==='fire'?'화(火)':k==='earth'?'토(土)':k==='metal'?'금(金)':'수(水)'}이고, 지지에서는 ${bw}의 흐름이 들어옵니다.</p><p><span class="fortune-summary-label">WORK · MONEY</span><strong>일과 재물</strong>${x.do[0]}. ${x.guide}</p><p><span class="fortune-summary-label">RELATIONSHIP · LIFE</span><strong>인연과 생활</strong>${x.do[1]}. ${x.evening}</p><p class="fortune-summary-closing"><span class="fortune-summary-label">${tomorrow?"TOMORROW'S":"TODAY'S"} GUIDE</span><strong>${x.guide}</strong><span class="fortune-summary-detail">${D}은 ${bw}의 흐름을 의식할수록 운을 더 잘 쓸 수 있습니다.</span></p>`;
    const final=$('[data-tip-final]');if(final)final.textContent=`${D}의 핵심은 ${bw}입니다. ${x.guide}`;
  }
  let observer,queued=false;const schedule=()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;observer?.disconnect();try{render();}finally{observer?.observe(root,{subtree:true,childList:true,characterData:true});}},35);};observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true});[0,900,2100,3800,6200].forEach(ms=>setTimeout(schedule,ms));
})();
