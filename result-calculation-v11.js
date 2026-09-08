import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';

(()=>{
  const file=(location.pathname.split('/').pop()||'').toLowerCase();
  if(!['saju-result.html','ohaeng-result.html'].includes(file))return;
  const key=file==='saju-result.html'?'jungwoljae_saju_input':'jungwoljae_ohaeng_input';
  let input={};try{input=JSON.parse(sessionStorage.getItem(key)||'{}');}catch(e){}
  if(!input.birthDate)return;
  const root=document.querySelector('main');if(!root)return;
  const stem={갑:'wood',을:'wood',병:'fire',정:'fire',무:'earth',기:'earth',경:'metal',신:'metal',임:'water',계:'water'};
  const branch={인:'wood',묘:'wood',사:'fire',오:'fire',진:'earth',술:'earth',축:'earth',미:'earth',신:'metal',유:'metal',자:'water',해:'water'};
  const names={wood:'목',fire:'화',earth:'토',metal:'금',water:'수'};
  const keywords={wood:'성장·방향',fire:'표현·실행',earth:'안정·관리',metal:'판단·정리',water:'관찰·유연'};
  const hanja={wood:'木',fire:'火',earth:'土',metal:'金',water:'水'};
  const pillarString=v=>typeof v==='string'?v:(v?.korean||v?.name||'');
  function calculate(){
    const [year,month,day]=input.birthDate.split('-').map(Number);
    const known=!input.birthTimeUnknown&&Boolean(input.birthTime);const [hour,minute]=known?input.birthTime.split(':').map(Number):[12,0];
    const r=calculateFourPillars({year,month,day,hour,minute,isLunar:input.calendarType==='lunar',isLeapMonth:Boolean(input.isLeapMonth),gender:input.gender||undefined});
    const o=typeof r?.toObject==='function'?r.toObject():r;
    const pillars={year:pillarString(o?.year),month:pillarString(o?.month),day:pillarString(o?.day),hour:pillarString(o?.hour)};
    const score={wood:0,fire:0,earth:0,metal:0,water:0};
    const used=['year','month','day',...(known?['hour']:[])];
    used.forEach(k=>{const [s,b]=[...pillars[k]];if(stem[s])score[stem[s]]+=1;if(branch[b])score[branch[b]]+=1.1;});
    const mb=[...pillars.month][1];if(branch[mb])score[branch[mb]]+=.9;
    const total=Object.values(score).reduce((a,b)=>a+b,0)||1;
    const exact=Object.fromEntries(Object.entries(score).map(([k,v])=>[k,v/total*100]));
    const pct=Object.fromEntries(Object.entries(exact).map(([k,v])=>[k,Math.floor(v)]));
    let remainder=100-Object.values(pct).reduce((a,b)=>a+b,0);
    Object.keys(exact).sort((a,b)=>(exact[b]-Math.floor(exact[b]))-(exact[a]-Math.floor(exact[a]))).slice(0,remainder).forEach(k=>pct[k]++);
    const order=Object.keys(pct).sort((a,b)=>pct[b]-pct[a]);
    const vals=Object.values(exact),mean=20,variance=vals.reduce((a,v)=>a+(v-mean)**2,0)/vals.length,balance=Math.max(0,Math.round(100-Math.sqrt(variance)*3));
    return {pct,order,balance};
  }
  function apply(){
    let data;try{data=calculate();}catch(e){return;}
    if(file==='saju-result.html'){
      const el=root.querySelector('[data-elements]');
      if(el)el.innerHTML=data.order.map(k=>`<div class="element-row"><label>${names[k]} · ${keywords[k]}</label><div class="track"><div class="fill" style="width:${Math.min(100,data.pct[k]*3.2)}%"></div></div><b>${data.pct[k]}%</b></div>`).join('');
    }else{
      const chart=root.querySelector('[data-element-chart]');
      if(chart)chart.innerHTML=data.order.map(k=>`<div class="element-bar"><div class="label"><span class="hanja">${hanja[k]}</span>${names[k]}</div><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100,data.pct[k]*3.4)}%"></div></div><div class="score">${data.pct[k]}%</div></div>`).join('');
      root.querySelectorAll('[data-meta] span').forEach(span=>{if(/균형 지표/.test(span.textContent))span.textContent=`균형 지수 ${data.balance}/100`;});
    }
  }
  let observer,queued=false;const schedule=()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;observer?.disconnect();try{apply();}finally{observer?.observe(root,{subtree:true,childList:true,characterData:true});}},30);};
  observer=new MutationObserver(schedule);observer.observe(root,{subtree:true,childList:true,characterData:true});apply();[900,2200,4500].forEach(ms=>setTimeout(schedule,ms));
})();
