const raw=sessionStorage.getItem('jungwoljae_fortune_input');
const input=raw?JSON.parse(raw):null;
const root=document.querySelector('[data-fortune-result]');

function enhance(){
  if(!root||!input)return;

  const meta=root.querySelector('[data-meta]');
  if(meta&&!meta.querySelector('[data-birth-time-meta]')){
    const span=document.createElement('span');
    span.dataset.birthTimeMeta='true';
    span.textContent=input.birthTimeUnknown?'출생시간 모름':input.birthTime?`출생시간 ${input.birthTime}`:'출생시간 미입력';
    meta.insertBefore(span,meta.children[2]||null);
  }

  const extraByTitle={
    '일 · 학업':{
      진행:'오늘은 해야 할 일을 넓히기보다 우선순위를 한두 개로 좁히는 편이 성과를 내기 쉽습니다. 연락·문서·일정처럼 결과가 남는 일은 가능한 한 당일 안에 정리해두면 흐름이 끊기지 않습니다.',
      점검:'메일, 문서, 제출 일정처럼 작은 누락이 없는지 한 번 더 확인하세요. 새로운 일을 시작해야 한다면 범위를 작게 잡고, 오늘 안에 끝낼 수 있는 단위로 나누는 편이 부담을 줄여줍니다.',
      정리:'지금 하고 있는 일 가운데 완성도가 가장 높은 것부터 마무리해보세요. 애매하게 걸쳐 있는 일을 줄이면 집중력이 살아나고 다음 선택도 훨씬 분명해집니다.'
    },
    '재물 · 소비':{
      기준:'오늘은 돈을 더 쓰거나 아끼는 것 자체보다 지출의 이유가 분명한지가 중요합니다. 계획에 없던 결제는 바로 결정하기보다 한 번 보류하고, 정기적으로 나가는 비용이나 작은 반복 지출도 함께 점검해보세요.'
    },
    '사람 · 관계':{
      연결:'먼저 다가가는 행동은 좋지만 상대의 반응을 즉시 확인하려 하지는 않는 편이 좋습니다. 가볍게 대화를 열고 상대가 편하게 답할 수 있는 여지를 남기면 관계의 흐름이 더 자연스럽게 이어집니다.',
      조율:'말의 내용보다 말이 전달되는 방식에서 오해가 생길 수 있으니 단정적인 표현은 줄여보세요. 중요한 대화일수록 바로 결론을 내기보다 서로 이해한 내용이 같은지 확인하는 과정이 도움이 됩니다.',
      대화:'특별히 밀거나 피할 관계 흐름은 아니므로 필요한 말을 담백하게 전하는 것이 좋습니다. 상대의 표정이나 짧은 반응에 의미를 크게 붙이기보다 실제로 확인된 말과 행동을 기준으로 보세요.'
    },
    '생활 리듬':{
      리듬:'하루 초반에 힘을 너무 많이 쓰면 후반 집중력이 빨리 떨어질 수 있습니다. 해야 할 일 사이에 짧은 여백을 두고, 식사·수면·이동 시간을 무리하게 줄이지 않는 편이 하루 전체의 컨디션을 안정시키는 데 좋습니다.'
    }
  };

  root.querySelectorAll('.fortune-card').forEach(card=>{
    if(card.dataset.copyEnhanced==='true')return;
    const title=card.querySelector('h3')?.textContent.trim();
    const badge=card.querySelector('strong')?.textContent.trim();
    const paragraph=card.querySelector('p');
    const extra=extraByTitle[title]?.[badge];
    if(paragraph&&extra){
      paragraph.textContent=`${paragraph.textContent.trim()} ${extra}`;
      card.dataset.copyEnhanced='true';
    }
  });
}

requestAnimationFrame(()=>requestAnimationFrame(enhance));
setTimeout(enhance,250);
