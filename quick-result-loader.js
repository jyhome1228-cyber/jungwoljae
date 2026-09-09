import { showSajuLoading } from './saju-loading.js?v=20260909-2340';

const file=location.pathname.split('/').pop()||'';
const result=document.querySelector('[data-quick-result]');
if(result){
  const copy={
    'lucky-number.html':{
      eyebrow:'JUNGWOLJAE · LUCKY NUMBER',
      title:'오늘의 숫자 흐름을 정리하고 있습니다.',
      messages:['개인 명식과 오늘 일진을 함께 살펴보고 있습니다.','오늘의 흐름과 맞는 숫자 조합을 고르고 있습니다.','중심 숫자와 여섯 숫자를 마지막으로 확인하고 있습니다.']
    },
    'important-day.html':{
      eyebrow:'JUNGWOLJAE · IMPORTANT DAY',
      title:'중요한 날을 신중하게 고르고 있습니다.',
      messages:['선택하신 기간의 날짜 흐름을 살펴보고 있습니다.','개인 명식과 후보 날짜의 관계를 하나씩 비교하고 있습니다.','좋은 날의 순서와 이유를 정리하고 있습니다.']
    },
    'moving-day.html':{
      eyebrow:'JUNGWOLJAE · MOVING DAY',
      title:'이동과 정착에 맞는 날을 살펴보고 있습니다.',
      messages:['이사 예정 기간의 날짜 흐름을 확인하고 있습니다.','출생 명식과 이동에 맞는 기운을 비교하고 있습니다.','길일과 피하면 좋은 날을 함께 정리하고 있습니다.']
    }
  }[file];

  if(copy){
    let running=false;
    let allowReveal=false;
    const observer=new MutationObserver(async()=>{
      if(allowReveal){allowReveal=false;return;}
      if(result.hidden||running)return;
      running=true;
      result.hidden=true;
      try{
        await showSajuLoading({...copy,duration:3600});
      }catch(error){
        console.error('quick result loader failed',error);
      }
      allowReveal=true;
      result.hidden=false;
      running=false;
      setTimeout(()=>result.scrollIntoView({behavior:'smooth',block:'start'}),60);
    });
    observer.observe(result,{attributes:true,attributeFilter:['hidden']});
  }
}
