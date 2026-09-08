(()=>{
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='work-money-result.html')return;
  const root=document.querySelector('[data-work-result]');
  if(!root)return;
  const text=n=>(n?.textContent||'').replace(/\s+/g,' ').trim();
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const groupProfiles={
    '비겁':{easy:'내 기준으로 주도하는 힘',headline:'남이 정한 답보다 내가 납득한 방식으로 움직일 때 성과가 잘 납니다.',copy:'자율성이 있고 내가 판단할 여지가 있는 일에서 힘이 붙는 편입니다. 반대로 책임은 큰데 결정권이 거의 없는 환경에서는 답답함이 빨리 쌓일 수 있습니다.'},
    '식상':{easy:'표현하고 결과물을 만드는 힘',headline:'생각을 밖으로 꺼내 실제 결과물로 만들 때 강점이 살아납니다.',copy:'말, 글, 디자인, 제안, 콘텐츠처럼 눈에 보이는 결과를 만드는 일이 잘 맞기 쉽습니다. 아이디어만 쌓아두기보다 직접 만들어 반응을 보는 환경에서 성장 속도가 빠른 편입니다.'},
    '재성':{easy:'돈과 현실 조건을 다루는 힘',headline:'시간·비용·효율을 따져 실제 성과로 연결하는 일에 강점이 있습니다.',copy:'매출, 예산, 거래, 운영처럼 결과가 숫자와 현실 조건으로 확인되는 일을 비교적 편하게 다룰 수 있습니다. 목표와 보상이 분명한 환경에서 집중력이 올라가기 쉽습니다.'},
    '관성':{easy:'책임과 조직 안에서 역할을 맡는 힘',headline:'역할과 기준이 분명한 조직에서 안정적으로 실력을 쌓기 좋습니다.',copy:'규칙, 책임, 절차가 어느 정도 정리된 환경에서 꾸준히 성과를 내기 쉬운 편입니다. 공공기관·행정·관리처럼 “무엇을 책임지는지”가 분명한 일과 잘 맞을 가능성이 있습니다.'},
    '인성':{easy:'배우고 분석해 전문성을 쌓는 힘',headline:'충분히 이해하고 준비한 뒤 전문성으로 승부하는 일에 잘 맞습니다.',copy:'연구, 교육, 분석, 기획처럼 정보를 깊게 이해하고 정리하는 일이 잘 맞기 쉽습니다. 단기간의 승부보다 시간이 갈수록 전문성이 쌓이는 직무에서 강점이 커지는 편입니다.'}
  };
  const groupAliases={
    '주도성 · 동료와 경쟁':'비겁','내 기준 · 독립성 · 경쟁':'비겁','내 기준과 주도권':'비겁',
    '표현 · 실행 · 결과물':'식상','표현과 실행':'식상',
    '돈 · 현실 · 자원 관리':'재성','돈 · 현실 감각 · 관리':'재성','현실과 돈의 기준':'재성',
    '책임 · 규칙 · 조직':'관성','책임 · 규칙 · 조직생활':'관성','책임과 안정':'관성',
    '배움 · 정보 · 전문성':'인성','배움 · 준비 · 정보':'인성','준비와 정보':'인성'
  };
  const elementAliases={
    '목':'wood','시작하고 키우는 힘':'wood','시작하고 방향을 잡는 힘':'wood',
    '화':'fire','표현하고 움직이는 힘':'fire','생각을 표현하고 움직이는 힘':'fire',
    '토':'earth','안정시키고 관리하는 힘':'earth','정리하고 꾸준히 유지하는 힘':'earth',
    '금':'metal','판단하고 정리하는 힘':'metal','기준을 세우고 판단하는 힘':'metal',
    '수':'water','살피고 연결하는 힘':'water','살피고 비교하고 연결하는 힘':'water'
  };
  const elementProfiles={
    wood:{easy:'새 일을 열고 방향을 잡는 역할',copy:'신규 프로젝트, 새로운 서비스, 변화가 필요한 상황처럼 “처음 길을 만드는 일”에서 힘이 잘 붙습니다.',weak:'시작할 날짜와 첫 목표를 작게라도 먼저 정하면 생각만 길어지는 것을 줄일 수 있습니다.'},
    fire:{easy:'사람에게 보여주고 움직이게 하는 역할',copy:'발표, 제안, 마케팅, 영업, 콘텐츠처럼 사람의 반응을 이끌어내는 일에서 장점이 살아납니다.',weak:'좋은 생각을 혼자만 알고 있지 말고 말·문서·결과물로 밖에 꺼내는 연습이 도움이 됩니다.'},
    earth:{easy:'운영을 안정시키고 꾸준히 굴리는 역할',copy:'일정, 예산, 운영, 관리처럼 반복되는 일을 안정적으로 유지하는 역할에서 강점이 생기기 쉽습니다.',weak:'시작할 때부터 일정·담당·마감 기준을 정해두면 뒤로 갈수록 일이 흐트러지는 것을 줄일 수 있습니다.'},
    metal:{easy:'기준을 세우고 판단·정리하는 역할',copy:'검토, 품질, 계약, 구매, 재무처럼 정확한 기준과 결론이 필요한 일에서 힘이 잘 붙습니다.',weak:'결정할 때 꼭 지킬 기준 3개와 포기 가능한 조건 1개를 미리 적어두면 선택이 쉬워집니다.'},
    water:{easy:'자료를 모으고 비교한 뒤 판단하는 역할',copy:'기획, 리서치, 전략, 상담처럼 정보를 모으고 여러 가능성을 비교한 뒤 결론을 내리는 일에서 강점이 나타나기 쉽습니다.',weak:'조사만 길어지지 않도록 알아볼 기간과 실제로 움직일 날짜를 함께 정하는 편이 좋습니다.'}
  };

  const careerPools={
    비겁:{
      water:[['서비스·사업 기획','서비스기획자, PM, 사업개발'],['전략·컨설팅','전략기획, 컨설턴트, 리서치 기반 자문'],['독립형 일','프리랜서, 1인사업, 작은 팀 리드'],['프로젝트 리딩','프로젝트 매니저, 신규사업 리드']],
      wood:[['신규사업·창업','신규사업기획, 스타트업, 창업'],['프로젝트 리딩','PM, 조직 리드, 사업개발'],['교육·성장','교육기획, 조직개발, 커뮤니티 운영'],['독립형 전문직','프리랜서, 개인 브랜드 사업']],
      fire:[['마케팅·브랜드','브랜드기획, 마케팅, 광고기획'],['영업·사업개발','B2B 영업, 파트너십, 사업개발'],['콘텐츠·프로듀싱','콘텐츠기획, 프로듀서, 행사기획'],['독립형 일','프리랜서, 크리에이터, 창업']],
      earth:[['운영·총괄','운영관리, 프로젝트 총괄, 서비스 운영'],['사업관리','공공·민간 사업관리, 조직운영'],['PM·관리','프로젝트 매니저, 오퍼레이션 매니저'],['독립형 운영','매장·공간·서비스 사업 운영']],
      metal:[['기준·의사결정','품질관리, 구매·조달, 심사·검토'],['프로젝트 리딩','PM, 운영책임자, 팀 리드'],['사업·협상','사업개발, B2B 영업, 계약관리'],['독립형 전문업','컨설팅, 전문 프리랜서']]
    },
    식상:{
      fire:[['디자인·콘텐츠','디자이너, 콘텐츠기획, 크리에이터'],['마케팅·광고','브랜드마케팅, 광고기획, SNS 운영'],['발표·교육','강사, 교육콘텐츠, 세일즈 프레젠테이션'],['프로듀싱','영상·행사·문화콘텐츠 프로듀서']],
      wood:[['기획·창작','브랜드기획, 콘텐츠기획, 서비스기획'],['디자인·제작','디자인, 편집, 제품·공간 기획'],['교육·출판','교육기획, 에디터, 출판기획'],['창작형 독립','프리랜서, 스튜디오, 크리에이터']],
      water:[['리서치 기반 기획','UX리서치, 서비스기획, 에디터'],['콘텐츠·글','작가, 에디터, 콘텐츠전략'],['상담·설명','상담, 교육, 고객경험 기획'],['분석형 창작','데이터 스토리텔링, 리서치 콘텐츠']],
      earth:[['실무형 제작','운영콘텐츠, 교육운영, 편집·제작'],['서비스 운영','CS기획, 커뮤니티 운영, 콘텐츠 운영'],['프로젝트 제작','프로젝트 코디네이터, 제작관리'],['전문 실무','편집·디자인·운영 실무']],
      metal:[['편집·품질','에디터, 편집디자인, 품질기획'],['UX·서비스','UX기획, 정보설계, 서비스기획'],['기획·문서','제안서, 보고서, 정책콘텐츠 기획'],['전문 제작','브랜딩, 디자인, 콘텐츠 전략']]
    },
    재성:{
      earth:[['재무·회계','재무, 회계, 세무 지원'],['운영·예산','예산관리, 사업관리, 운영관리'],['유통·MD','MD, 유통관리, 구매관리'],['자산·관리','자산관리, 부동산 운영, 시설운영']],
      metal:[['회계·재무','회계, 재무, 원가관리'],['구매·조달','구매, 조달, 계약관리'],['금융·심사','금융기관 심사, 여신·리스크 지원'],['영업관리','영업관리, 매출관리, B2B 운영']],
      water:[['금융·분석','재무분석, 데이터 기반 영업기획'],['유통·거래','무역, 유통, 사업개발'],['고객·영업','B2B 영업, 계정관리, 고객전략'],['사업기획','사업성 분석, 시장조사, 투자지원']],
      fire:[['영업·마케팅','영업, 마케팅, 브랜드 세일즈'],['사업개발','파트너십, 제휴, 신규매출 개발'],['유통·MD','상품기획, MD, 리테일 운영'],['성과형 역할','성과관리, 세일즈 운영']],
      wood:[['사업개발','신규사업, 시장개척, 파트너십'],['영업·유통','영업, 유통, 상품기획'],['창업·사업','소규모 사업, 브랜드 운영'],['성장기획','매출 성장, 채널 전략']]
    },
    관성:{
      earth:[['공공·행정','공무원, 공공기관 행정, 행정직'],['운영·관리','총무, 인사운영, 사업관리'],['교육·기관운영','학교·교육기관 행정, 교육운영'],['규정·관리','품질관리, 시설·안전 운영']],
      metal:[['공공·행정','공무원, 공공기관 사무·행정'],['법무·준법','법무지원, 컴플라이언스, 내부통제'],['품질·심사','품질관리, 심사, 감사 지원'],['금융기관','은행·보험 백오피스, 리스크관리']],
      water:[['정책·기획','정책기획, 공공기관 기획, 연구행정'],['조사·분석','통계·조사, 정책연구 지원'],['공공서비스','공공기관 고객·사업 운영'],['교육·행정','교육행정, 대학·연구기관 행정']],
      fire:[['교육·행정','교육행정, 교직·교육운영'],['조직 책임','프로젝트 책임자, 조직관리'],['공공 홍보','공공기관 홍보·대외협력'],['서비스 책임','고객서비스 운영, 현장 책임']],
      wood:[['공공 기획','정책사업기획, 공공 프로젝트'],['교육·조직','교육행정, 조직개발'],['기관 프로젝트','공공기관 사업관리'],['관리자 트랙','중간관리, 프로젝트 리드']]
    },
    인성:{
      water:[['연구·분석','연구원, 리서처, 데이터분석'],['정책·조사','정책연구, 조사분석, 연구행정'],['교육·상담','교육기획, 상담, 코칭'],['기획·편집','에디터, 콘텐츠전략, 서비스기획']],
      metal:[['연구·품질','연구개발, 품질기획, 분석'],['데이터·문서','데이터분석, 문서기획, 정보관리'],['법·정책','법무지원, 정책연구, 컴플라이언스'],['교육·전문직','교육, 자격 기반 전문직']],
      earth:[['교육·운영','교육운영, 학교행정, 연구행정'],['기록·아카이브','기록관리, 자료관리, 도서관·아카이브'],['실무연구','리서치 운영, 프로젝트 코디네이터'],['전문 지원','행정·품질문서·운영기획']],
      fire:[['교육·강의','강사, 교육기획, 학습콘텐츠'],['콘텐츠·설명','에디터, 콘텐츠기획, 홍보교육'],['상담·코칭','상담, 코칭, 고객교육'],['연구 커뮤니케이션','연구홍보, 지식콘텐츠']],
      wood:[['교육·연구','교육기획, 연구, 학습설계'],['기획·전략','서비스기획, 정책기획, 조직개발'],['출판·콘텐츠','편집기획, 출판, 지식콘텐츠'],['전문성 기반 독립','강의, 컨설팅, 전문 프리랜서']]
    }
  };

  function rawGroup(v){
    const t=String(v||'');
    if(groupProfiles[t])return t;
    return Object.entries(groupAliases).find(([k])=>t.includes(k))?.[1]||(['비겁','식상','재성','관성','인성'].find(k=>t.includes(k))||'비겁');
  }
  function rawElement(v){
    const t=String(v||'').trim();
    if(elementAliases[t])return elementAliases[t];
    return Object.entries(elementAliases).find(([k])=>t.includes(k))?.[1]||null;
  }

  function enhance(){
    if(root.dataset.careerEnhanced==='1')return true;
    const core=[...root.querySelectorAll('.work-core-card')];
    if(core.length<4||!text(core[1].querySelector('strong'))||!text(core[2].querySelector('strong')))return false;
    root.dataset.careerEnhanced='1';
    const name=text(root.querySelector('[data-name]'))||'회원';
    const group=rawGroup(text(core[1].querySelector('strong')));
    const strongEl=rawElement(text(core[2].querySelector('strong')))||'water';
    const weakEl=rawElement(text(core[3].querySelector('strong')))||'wood';
    const gp=groupProfiles[group],sp=elementProfiles[strongEl],wp=elementProfiles[weakEl];
    const jobs=careerPools[group]?.[strongEl]||careerPools[group]?.water||careerPools.인성.water;

    const summary=root.querySelector('[data-summary]');
    if(summary)summary.textContent=`${name}님은 ${gp.headline} 특히 ${sp.easy}에서 강점이 드러나기 쉽습니다. 직업 이름 하나를 운명처럼 정하기보다, 실제 하루 업무가 어떤 구조인지 보는 편이 더 정확합니다. 아래에는 현재 사주에서 보이는 강점을 기준으로 현실적인 직무 예시까지 함께 정리했습니다.`;

    const labels=['01 · 일의 기본 스타일','02 · 성과가 나는 방식','03 · 자연스럽게 잘하는 역할','04 · 조금 더 챙기면 좋은 역할'];
    const titles=[text(core[0].querySelector('strong'))||'꾸준히 관리하고 쌓는 방식',gp.easy,sp.easy,`‘${wp.easy}’을 조금 더 챙기면 좋아요`];
    const copies=[
      `${text(core[0].querySelector('p'))} 직업을 고를 때는 이름보다 실제로 매일 맡게 될 업무와 책임 범위가 이 방식과 맞는지를 먼저 보는 편이 좋습니다.`,
      `${gp.copy} 쉽게 말하면 “내가 어떤 방식으로 일할 때 덜 지치고 더 오래 잘하느냐”를 보여주는 부분입니다.`,
      `${sp.copy} 지금까지 해온 일에서도 비슷하게 자료를 정리하거나 사람을 조율하거나 기준을 세우는 역할에서 칭찬을 받았는지 떠올려보세요.`,
      `${wp.weak} 못한다는 뜻이 아니라, 바쁠 때 가장 먼저 빠지기 쉬운 과정에 가깝습니다. 작은 습관 하나로 보완하면 전체 업무 완성도가 훨씬 좋아질 수 있습니다.`
    ];
    core.forEach((card,i)=>{const span=card.querySelector('span'),strong=card.querySelector('strong'),p=card.querySelector('p');if(span)span.textContent=labels[i];if(strong)strong.textContent=titles[i];if(p)p.textContent=copies[i];card.querySelectorAll('.result-term-note,.friendly-term-note').forEach(n=>n.remove());});

    const firstSection=core[0].closest('.work-report');
    if(firstSection&&!root.querySelector('[data-career-fit]')){
      const section=document.createElement('section');
      section.className='work-report work-career-section';section.dataset.careerFit='true';
      section.innerHTML=`<p class="work-label">02 · CAREER MATCH</p><div class="work-career-heading"><div><h2>그래서 어떤 직업이 잘 맞기 쉬울까요?</h2><p>“사주에 이 직업이 적혀 있다”는 뜻은 아닙니다. 지금 계산된 업무 성향을 실제 직무에 번역하면 아래 분야부터 살펴볼 만하다는 뜻입니다.</p></div><span>직무 예시까지 현실적으로</span></div><div class="work-career-highlight"><small>${esc(name)}님에게 먼저 보이는 방향</small><strong>${esc(jobs[0][0])} 계열</strong><p>${esc(gp.headline)} ${esc(sp.copy)}</p></div><div class="work-career-grid">${jobs.map((j,i)=>`<article><span>추천 ${String(i+1).padStart(2,'0')}</span><h3>${esc(j[0])}</h3><strong>${esc(j[1])}</strong><p>${esc(i===0?'현재 강점을 가장 직접적으로 쓰기 쉬운 분야입니다. 실제 채용공고에서 하루 업무와 책임 범위를 확인해보세요.':i===1?'비슷한 강점을 다른 방식으로 쓸 수 있는 분야입니다. 경험이 있다면 연결하기 좋습니다.':i===2?'조직 안에서 전문성을 쌓거나 역할을 분명하게 가져가기 좋은 방향입니다.':'자율성과 책임을 함께 가져가고 싶을 때 검토해볼 수 있는 대안입니다.')}</p></article>`).join('')}</div><div class="work-career-check"><div><span>잘 맞기 쉬운 환경</span><strong>${esc(gp.easy)}을 실제로 쓸 수 있고, 맡은 역할과 결정 범위가 분명한 곳</strong></div><div><span>채용공고에서 확인할 것</span><strong>직무명보다 실제 업무 · 의사결정 권한 · 반복업무 비중 · 평가 기준</strong></div></div><p class="work-career-note">예를 들어 같은 ‘기획자’라도 자료만 정리하는 자리와 직접 의사결정까지 하는 자리는 전혀 다릅니다. 직업명보다 하루 업무가 나와 맞는지를 보는 것이 더 현실적인 기준입니다.</p>`;
      firstSection.insertAdjacentElement('afterend',section);
    }

    const split=root.querySelector('.work-split-section');
    if(split){
      const items=[...split.querySelectorAll('.work-insight')];
      if(items[0]){const l=items[0].querySelector('.work-label'),h=items[0].querySelector('h2');if(l)l.textContent='03 · 잘 풀릴 때';if(h)h.textContent='이런 환경에서는 능력이 더 잘 나옵니다.';}
      if(items[1]){const l=items[1].querySelector('.work-label'),h=items[1].querySelector('h2');if(l)l.textContent='04 · 지칠 때';if(h)h.textContent='반대로 이런 환경에서는 피로가 빨리 쌓입니다.';}
    }
    const renumber=[['04 · ORGANIZATION × INDEPENDENCE','05 · 조직과 독립'],['05 · MONEY STYLE','06 · 돈을 다루는 습관'],['06 · YEAR FLOW','07 · 올해와 다음 해'],['07 · FOCUS','08 · 더 깊게 본 부분'],['08 · PRACTICAL GUIDE','09 · 실제 생활 기준'],['09 · TOTAL SUMMARY','10 · 최종 정리']];
    [...root.querySelectorAll('.work-label')].forEach(n=>{const t=text(n);const r=renumber.find(([a])=>t===a);if(r)n.textContent=r[1];});
    return true;
  }

  let tries=0;const timer=setInterval(()=>{tries++;if(enhance()||tries>60)clearInterval(timer);},60);
  setTimeout(enhance,1200);setTimeout(enhance,2200);
})();