(()=>{
  'use strict';

  const site='https://jungwoljae.com';
  const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const homeImage='https://nineworksdatabase.planus253.workers.dev/cdn/test/20260907-061515-3-30b351f3.webp';

  const pages={
    'index.html':{
      title:'무료 사주·오늘의 운세·궁합·오행 분석 | 정월재',
      description:'정월재에서 무료 사주 기반 오행 분석, 오늘의 운세, 내일의 운세, 사주 궁합, 연애운·인연운, 재물운·직업운, 택일과 이사 길일을 쉽고 차분하게 확인하세요.',
      keywords:'무료 사주,무료 사주풀이,사주팔자,무료 운세,오늘의 운세,내일의 운세,무료 궁합,사주 궁합,오행 분석,연애운,인연운,재물운,직업운,무료 택일,이사 택일,정월재',
      url:'/',image:homeImage,name:'정월재 무료 사주·운세'
    },
    'ohaeng.html':{
      title:'무료 오행 분석 | 내 사주 오행·목화토금수 보기 | 정월재',
      description:'생년월일을 바탕으로 목·화·토·금·수 오행의 분포와 강약을 무료로 확인하세요. 내 사주 오행의 특징과 부족한 오행을 생활 언어로 쉽게 정리합니다.',
      keywords:'무료 오행 분석,오행 분석,사주 오행,내 오행,오행 테스트,목화토금수,오행 부족,오행 강약,음양오행,무료 사주,정월재',
      url:'/ohaeng.html',name:'무료 오행 분석'
    },
    'fortune.html':{
      title:'오늘의 운세 무료 | 오늘 재물운·연애운·일운 | 정월재',
      description:'생년월일과 오늘 날짜를 함께 비교해 오늘의 운세를 무료로 확인하세요. 오늘 재물운, 연애운, 일운과 생활 흐름을 한눈에 정리합니다.',
      keywords:'오늘의 운세,오늘 운세 무료,무료 오늘의 운세,오늘 재물운,오늘 연애운,오늘 일운,오늘 사주,무료 운세,정월재',
      url:'/fortune.html',name:'오늘의 운세 무료'
    },
    'tomorrow.html':{
      title:'내일의 운세 무료 | 내일 재물운·연애운·일운 | 정월재',
      description:'생년월일과 내일 날짜를 함께 비교해 내일의 운세를 무료로 확인하세요. 내일 재물운, 연애운, 일운과 미리 준비할 흐름을 쉽게 정리합니다.',
      keywords:'내일의 운세,내일 운세 무료,무료 내일의 운세,내일 재물운,내일 연애운,내일 일운,내일 사주,무료 운세,정월재',
      url:'/tomorrow.html',name:'내일의 운세 무료'
    },
    'relationship.html':{
      title:'연애운 무료 | 인연운·연애 사주 보기 | 정월재',
      description:'생년월일과 사주를 바탕으로 무료 연애운과 인연운을 확인하세요. 연애 패턴, 감정 표현, 새로운 인연과 현재 관계의 흐름을 쉽게 풀어봅니다.',
      keywords:'무료 연애운,연애운,무료 인연운,인연운,연애 사주,사주 연애운,솔로 연애운,새로운 인연,무료 운세,정월재',
      url:'/relationship.html',name:'무료 연애운·인연운'
    },
    'compatibility.html':{
      title:'무료 사주 궁합 | 연애·커플 궁합 보기 | 정월재',
      description:'두 사람의 생년월일과 사주 흐름을 비교해 무료 사주 궁합을 확인하세요. 연애 궁합, 커플 궁합, 성향과 갈등 방식, 서로 보완되는 지점을 정리합니다.',
      keywords:'무료 궁합,무료 사주 궁합,사주 궁합,연애 궁합,커플 궁합,궁합 보기,생년월일 궁합,남녀 궁합,무료 운세,정월재',
      url:'/compatibility.html',name:'무료 사주 궁합'
    },
    'work-money.html':{
      title:'재물운·직업운 무료 | 사업운·이직운 사주 | 정월재',
      description:'사주를 바탕으로 재물운과 직업운을 무료로 확인하세요. 돈을 다루는 습관, 일하는 방식, 사업운과 이직운까지 현실적인 기준으로 정리합니다.',
      keywords:'무료 재물운,재물운,금전운,무료 직업운,직업운,사업운,이직운,취업운,사주 재물운,사주 직업운,정월재',
      url:'/work-money.html',name:'무료 재물운·직업운'
    },
    'guide.html':{
      title:'무료 사주 고민 풀이·선택 가이드 | 정월도감',
      description:'연애, 일, 돈, 관계처럼 지금 고민하는 주제를 고르면 사주 흐름을 바탕으로 현실적인 선택 기준을 정리해드립니다. 정월재의 무료 고민 풀이 정월도감입니다.',
      keywords:'무료 사주 상담,사주 고민,사주 고민 풀이,연애 고민,직장 고민,선택 운세,사주 조언,정월도감,정월재',
      url:'/guide.html',name:'정월도감'
    },
    'talisman.html':{
      title:'무료 부적 만들기 | 소원·행운 부적 | 정월재',
      description:'바라는 마음과 목적에 맞춰 정월재의 무료 디지털 부적을 만들어보세요. 소원, 행운, 재물, 관계의 마음을 하나의 상징으로 남길 수 있습니다.',
      keywords:'무료 부적,부적 만들기,행운 부적,소원 부적,재물 부적,연애 부적,디지털 부적,정월부적,정월재',
      url:'/talisman.html',name:'정월부적'
    },
    'lucky-number.html':{
      title:'오늘의 행운 숫자 무료 | 사주 행운번호 | 정월재',
      description:'생년월일과 오늘의 흐름을 바탕으로 오늘의 행운 숫자를 무료로 확인하세요. 가볍게 참고할 수 있는 여섯 개의 숫자를 정리합니다.',
      keywords:'오늘의 행운 숫자,행운 숫자,행운번호,오늘 행운번호,사주 행운번호,무료 행운 숫자,럭키넘버,정월재',
      url:'/lucky-number.html',name:'오늘의 행운 숫자'
    },
    'important-day.html':{
      title:'무료 택일 | 계약·면접·개업 좋은 날 보기 | 정월재',
      description:'계약, 면접, 개업, 시작처럼 중요한 일을 앞두고 있다면 가능한 일정 안에서 참고하기 좋은 날짜를 무료로 확인하세요.',
      keywords:'무료 택일,택일,좋은 날,길일,계약 좋은 날,면접 좋은 날,개업 좋은 날,시작 좋은 날,사주 택일,정월재',
      url:'/important-day.html',name:'무료 택일·좋은 날'
    },
    'moving-day.html':{
      title:'이사 택일 무료 | 이사 길일·좋은 날짜 보기 | 정월재',
      description:'이사 가능한 기간과 생년월일을 바탕으로 이사 택일과 길일을 무료로 확인하세요. 현실적인 일정 안에서 참고할 이사 후보일을 정리합니다.',
      keywords:'이사 택일,무료 이사 택일,이사 길일,이사 좋은 날,이사 날짜,손없는날,사주 이사,이사 운세,정월재',
      url:'/moving-day.html',name:'무료 이사 택일'
    },
    'reviews.html':{
      title:'정월재 후기 | 무료 사주·운세 이용 후기',
      description:'정월재의 오행 분석, 오늘의 운세, 사주 궁합, 연애운, 재물운과 택일 서비스를 이용한 실제 후기와 경험을 확인하세요.',
      keywords:'정월재 후기,사주 후기,무료 사주 후기,운세 후기,궁합 후기,오행 분석 후기,정월재',
      url:'/reviews.html',name:'정월재 후기'
    },
    'about.html':{
      title:'정월재 소개 | 무료 사주·운세를 쉽게 읽는 곳',
      description:'정월재는 사주와 오행의 흐름을 어렵지 않은 생활 언어로 풀어 오늘의 운세, 궁합, 연애운, 재물운과 택일을 제공하는 무료 운세 서비스입니다.',
      keywords:'정월재,정월재 사주,무료 사주 사이트,무료 운세 사이트,사주 서비스,오늘의 운세,사주 궁합,오행 분석',
      url:'/about.html',name:'정월재 소개'
    }
  };

  const privateOrResult=/^(admin|login|signup|mypage|archive|firebase-debug|privacy|.*-result|compatibility-report|saju-result)\.html$/;

  function ensureMeta(selector,attrs){
    let node=document.head.querySelector(selector);
    if(!node){node=document.createElement('meta');document.head.appendChild(node);}
    Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,value));
    return node;
  }

  function setNamed(name,content){ensureMeta(`meta[name="${name}"]`,{name,content});}
  function setProperty(property,content){ensureMeta(`meta[property="${property}"]`,{property,content});}
  function setCanonical(url){
    let link=document.head.querySelector('link[rel="canonical"]');
    if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link);}
    link.href=url;
  }

  if(privateOrResult.test(file)){
    setNamed('robots','noindex, nofollow, noarchive');
    return;
  }

  const config=pages[file];
  if(!config)return;

  const absolute=`${site}${config.url}`;
  document.title=config.title;
  setNamed('description',config.description);
  setNamed('keywords',config.keywords);
  setNamed('robots','index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  setCanonical(absolute);

  setProperty('og:type','website');
  setProperty('og:locale','ko_KR');
  setProperty('og:site_name','정월재');
  setProperty('og:title',config.title);
  setProperty('og:description',config.description);
  setProperty('og:url',absolute);
  if(config.image)setProperty('og:image',config.image);

  setNamed('twitter:card','summary_large_image');
  setNamed('twitter:title',config.title);
  setNamed('twitter:description',config.description);
  if(config.image)setNamed('twitter:image',config.image);

  let alternate=document.head.querySelector('link[rel="alternate"][hreflang="ko-KR"]');
  if(!alternate){alternate=document.createElement('link');alternate.rel='alternate';alternate.hreflang='ko-KR';document.head.appendChild(alternate);}
  alternate.href=absolute;

  const old=document.getElementById('jungwoljae-seo-jsonld');
  if(old)old.remove();
  const jsonld=document.createElement('script');
  jsonld.id='jungwoljae-seo-jsonld';
  jsonld.type='application/ld+json';
  const graph=[{
    '@type':'WebPage',
    '@id':`${absolute}#webpage`,
    url:absolute,
    name:config.name||config.title,
    description:config.description,
    inLanguage:'ko-KR',
    isPartOf:{'@id':`${site}/#website`}
  }];
  if(file!=='index.html'){
    graph.push({
      '@type':'BreadcrumbList',
      itemListElement:[
        {'@type':'ListItem',position:1,name:'정월재',item:`${site}/`},
        {'@type':'ListItem',position:2,name:config.name||config.title,item:absolute}
      ]
    });
  }else{
    graph.push({
      '@type':'WebSite',
      '@id':`${site}/#website`,
      url:`${site}/`,
      name:'정월재',
      alternateName:['正月齋','JEONGWOLJAE','정월재 사주'],
      description:config.description,
      inLanguage:'ko-KR'
    });
  }
  jsonld.textContent=JSON.stringify({'@context':'https://schema.org','@graph':graph});
  document.head.appendChild(jsonld);
})();
