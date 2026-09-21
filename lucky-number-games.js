(()=>{
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='lucky-number.html')return;

  const link=document.createElement('link');
  link.rel='stylesheet';link.href='./lucky-number-games.css?v=20260921-1535';
  document.head.appendChild(link);

  const result=document.querySelector('[data-quick-result]');
  const host=result?.parentElement;
  if(!host||host.querySelector('[data-number-playground]'))return;

  const formHead=document.querySelector('.quick-form-head');
  if(formHead&&!formHead.querySelector('[data-lucky-result-guide]')){
    const guide=document.createElement('p');
    guide.className='lucky-result-guide';guide.dataset.luckyResultGuide='';
    guide.textContent='오늘의 번호를 확인하면 결과에서 오늘의 행운 번호 6개와 중심 숫자를 함께 볼 수 있습니다.';
    formHead.appendChild(guide);
  }

  const section=document.createElement('section');
  section.className='number-playground';section.dataset.numberPlayground='';
  section.setAttribute('aria-labelledby','number-playground-title');
  section.innerHTML=`
    <div class="number-playground-head">
      <div><span>NUMBER PLAYGROUND</span><h2 id="number-playground-title">1부터 45까지, 숫자를 재미있게 뽑아보세요.</h2></div>
      <p>오늘의 추천 조합은 하루 동안 고정되며, 무작위 추첨은 빠칭코에서만 할 수 있습니다.</p>
    </div>
    <div class="number-game-grid">
      <article class="number-game-card">
        <div class="number-game-title"><div><small>DAILY LOTTO PICK</small><h3>오늘의 로또 번호 추천</h3></div><span class="number-fixed-badge">오늘 고정</span></div>
        <p class="number-game-desc">오늘 날짜를 기준으로 정해진 다섯 조합입니다. 같은 날에는 추천 번호가 바뀌지 않습니다.</p>
        <div class="lotto-sets" data-lotto-sets aria-live="polite"></div>
      </article>
      <article class="number-game-card">
        <div class="number-game-title"><div><small>PACHINKO 1–45</small><h3>빠칭코 숫자 뽑기</h3></div><button class="number-action secondary" type="button" data-pachinko-reset>처음부터</button></div>
        <p class="number-game-desc">버튼을 누를 때마다 아직 나오지 않은 숫자 하나가 추첨됩니다.</p>
        <div class="pachinko-machine"><div class="pachinko-display" data-pachinko-display aria-live="polite"><span>?</span></div><button class="pachinko-draw" type="button" data-pachinko-draw>숫자 뽑기</button></div>
        <div class="pachinko-history"><strong>나온 숫자 <span data-pachinko-count>0</span>/45</strong><div class="pachinko-history-balls" data-pachinko-history><p>아직 뽑은 숫자가 없습니다.</p></div></div>
      </article>
    </div>
    <p class="number-playground-note">추천 번호와 추첨 결과는 오락용 무작위 숫자이며 당첨이나 금전적 결과를 보장하지 않습니다.</p>`;
  host.appendChild(section);

  const lottoSets=section.querySelector('[data-lotto-sets]');
  const display=section.querySelector('[data-pachinko-display]');
  const drawButton=section.querySelector('[data-pachinko-draw]');
  const history=section.querySelector('[data-pachinko-history]');
  const count=section.querySelector('[data-pachinko-count]');
  let pool=[],drawn=[],timer=null;

  function randomIndex(max){
    if(globalThis.crypto?.getRandomValues){const value=new Uint32Array(1);globalThis.crypto.getRandomValues(value);return value[0]%max;}
    return Math.floor(Math.random()*max);
  }
  function hashSeed(value){let hash=2166136261;for(const char of value){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;}
  function seededRandom(seed){let value=seed||1;return ()=>{value^=value<<13;value^=value>>>17;value^=value<<5;return (value>>>0)/4294967296;};}
  function pick(count=6,random=Math.random){
    const numbers=Array.from({length:45},(_,index)=>index+1),selected=[];
    while(selected.length<count)selected.push(numbers.splice(Math.floor(random()*numbers.length),1)[0]);
    return selected.sort((a,b)=>a-b);
  }
  const range=value=>`range-${Math.ceil(value/10)}`;
  const ball=(value,className='lotto-ball')=>`<span class="${className} ${range(value)}">${value}</span>`;
  function renderLotto(){
    const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    lottoSets.innerHTML=Array.from({length:5},(_,index)=>{const random=seededRandom(hashSeed(`${date}|jungwoljae|lotto|${index}`));return `<div class="lotto-row"><strong>${index+1}</strong><div class="lotto-balls">${pick(6,random).map(value=>ball(value)).join('')}</div></div>`;}).join('');
  }
  function renderHistory(){
    count.textContent=String(drawn.length);
    history.innerHTML=drawn.length?drawn.map(value=>ball(value,'history-ball')).join(''):'<p>아직 뽑은 숫자가 없습니다.</p>';
  }
  function reset(){
    if(timer){clearInterval(timer);timer=null;}
    pool=Array.from({length:45},(_,index)=>index+1);drawn=[];
    display.classList.remove('is-spinning');display.querySelector('span').textContent='?';
    drawButton.disabled=false;drawButton.textContent='숫자 뽑기';renderHistory();
  }
  function draw(){
    if(!pool.length||drawButton.disabled)return;
    drawButton.disabled=true;display.classList.add('is-spinning');
    const valueNode=display.querySelector('span');
    timer=setInterval(()=>{valueNode.textContent=String(1+randomIndex(45));},70);
    setTimeout(()=>{
      clearInterval(timer);timer=null;
      const value=pool.splice(randomIndex(pool.length),1)[0];drawn.push(value);
      valueNode.textContent=String(value);display.classList.remove('is-spinning');renderHistory();
      drawButton.disabled=!pool.length;drawButton.textContent=pool.length?'다음 숫자 뽑기':'45개 모두 추첨 완료';
    },850);
  }

  section.querySelector('[data-pachinko-reset]').addEventListener('click',reset);
  drawButton.addEventListener('click',draw);
  renderLotto();reset();
})();