/* 정월재 오늘·내일 운세 에디토리얼 결과 화면 v2
   기존 명리 계산, 저장/복사/PDF 데이터는 변경하지 않고 결과의 읽기 경험만 개선합니다. */
(function(){
  'use strict';
  var root=document.querySelector('[data-fortune-result]');
  if(!root)return;
  var panel=root.querySelector('[data-daily-simple]');
  if(!panel)return;
  var completed=false;
  var categories=[
    {key:'money',name:'재물운',eng:'MONEY',mark:'財',hint:'돈과 지출의 흐름'},
    {key:'love',name:'애정운',eng:'RELATIONSHIP',mark:'緣',hint:'마음과 관계의 흐름'},
    {key:'work',name:'직장·사업운',eng:'WORK',mark:'業',hint:'일과 성과의 흐름'},
    {key:'study',name:'학업·성취운',eng:'STUDY',mark:'學',hint:'배움과 목표의 흐름'},
    {key:'health',name:'건강운',eng:'WELLNESS',mark:'養',hint:'몸과 생활의 균형'}
  ];
  function text(node){return String(node&&node.textContent||'').replace(/\s+/g,' ').trim();}
  function node(tag,cls,value){
    var el=document.createElement(tag);
    if(cls)el.className=cls;
    if(value!==undefined)el.textContent=String(value);
    return el;
  }
  function add(parent,tag,cls,value){
    var el=node(tag,cls,value);
    parent.appendChild(el);
    return el;
  }
  function firstSentence(copy){
    var source=String(copy||'').trim();
    var match=source.match(/^(.+?[.!?。！？])(?:\s+|$)/);
    if(match)return [match[1],source.slice(match[0].length).trim()];
    return [source,''];
  }
  function fromList(selector){
    return Array.from(root.querySelectorAll(selector+' li')).slice(0,2).map(function(li){
      return {title:text(li.querySelector('strong')),copy:text(li.querySelector('span'))};
    }).filter(function(item){return item.title;});
  }
  function makeSection(kicker,title,sub){
    var sec=node('section','jw-reading-section');
    var h=add(sec,'div','jw-section-heading');
    add(h,'p','jw-section-kicker',kicker);
    add(h,'h2','jw-section-title',title);
    if(sub)add(h,'p','jw-section-description',sub);
    return sec;
  }
  function ready(){
    if(completed||root.dataset.finalState!=='ready'||panel.hidden)return;
    var originals=Array.from(root.querySelectorAll('[data-area-grid] .fortune-card'));
    if(originals.length<5)return;
    var isTomorrow=false;
    try{
      var saved=JSON.parse(sessionStorage.getItem('jungwoljae_fortune_input')||'{}');
      isTomorrow=saved.mode==='tomorrow';
    }catch(error){}
    var day=isTomorrow?'내일':'오늘';
    var title=day+'의 운세';
    var fullName=text(root.querySelector('.fortune-hero [data-name]'));
    var date=text(panel.querySelector('[data-simple-date]'));
    var headline=text(panel.querySelector('[data-simple-headline]'));
    var oneLine=text(panel.querySelector('[data-simple-summary]'));
    var mission=text(panel.querySelector('[data-simple-mission]'));
    var overview=Array.from(root.querySelectorAll('[data-total-summary] > p')).map(text).filter(Boolean);
    // 내일의 운세에서는 계산 단계에서 생성한 실제 사전 준비 안내를 추가합니다.
    var prepParagraph=Array.from(root.querySelectorAll('[data-fortune-story] > p')).find(function(p){
      return text(p.querySelector('strong'))==='오늘 미리 준비할 것';
    });
    var tomorrowPrep=prepParagraph ? text(prepParagraph).replace(/^오늘 미리 준비할 것\s*/,'') : '';
    var dayparts=Array.from(root.querySelectorAll('[data-time-grid] .fortune-time-card')).slice(0,3).map(function(card){
      return {period:text(card.querySelector('span')),title:text(card.querySelector('strong')),copy:text(card.querySelector('p'))};
    });
    var helpful=fromList('[data-do-list]');
    var caution=fromList('[data-dont-list]');
    var lucky=Array.from(panel.querySelectorAll('[data-simple-lucky] .daily-lucky-item')).map(function(el){
      return {name:text(el.querySelector('span')),value:text(el.querySelector('strong'))};
    }).filter(function(item){return ['숫자','방향','컬러','아이템'].includes(item.name);});

    var page=node('div','jw-editorial');
    var hero=add(page,'header','jw-reading-hero');
    add(hero,'p','jw-hero-kicker','正月齋 · '+(isTomorrow?'TOMORROW':'TODAY')+' FORTUNE');
    add(hero,'h1','jw-hero-title',title);
    add(hero,'p','jw-hero-date',date);
    add(hero,'p','jw-hero-subtitle',(fullName?fullName+'님, ':'')+day+'의 흐름을 쉽고 구체적으로 풀어드립니다.');
    var seal=add(hero,'span','jw-brand-seal','正月齋');
    seal.setAttribute('aria-hidden','true');

    var links=add(page,'nav','jw-fortune-contents');
    links.setAttribute('aria-label','운세 영역으로 이동');
    var overviewLink=add(links,'a','jw-category-link jw-category-total');
    overviewLink.href='#jw-overall';
    add(overviewLink,'span','jw-category-symbol','全');
    add(overviewLink,'strong','','총운');
    categories.forEach(function(item){
      var link=add(links,'a','jw-category-link');
      link.href='#jw-'+item.key;
      add(link,'span','jw-category-symbol',item.mark);
      add(link,'strong','',item.name.replace('·사업','').replace('·성취',''));
    });

    var overall=add(page,'section','jw-overall');
    overall.id='jw-overall';
    var top=add(overall,'div','jw-overall-labels');
    add(top,'span','jw-overall-tag',day+'의 총운');
    add(top,'span','jw-overall-date',date);
    add(overall,'h2','jw-overall-headline',headline||'하루의 흐름을 살펴보세요.');
    var story=add(overall,'div','jw-overall-story');
    if(overview.length){
      overview.slice(0,3).forEach(function(copy){add(story,'p','',copy);});
    }else{
      add(story,'p','',oneLine||'서두르지 않고 하루의 흐름을 확인해보세요.');
    }
    if(oneLine){
      var note=add(overall,'div','jw-overall-takeaway');
      add(note,'span','jw-takeaway-label',day+'의 한마디');
      add(note,'p','',oneLine);
    }

    var areas=makeSection('FORTUNE BY AREA',day+'의 다섯 가지 운세','관심 있는 항목을 골라 읽어보세요. 한 줄 요약뿐 아니라 구체적인 풀이도 함께 담았습니다.');
    areas.classList.add('jw-area-section');
    var articles=add(areas,'div','jw-area-articles');
    categories.forEach(function(item,i){
      var raw=text(originals[i].querySelector('p'));
      var parts=firstSentence(raw);
      var card=add(articles,'article','jw-area-article');
      card.id='jw-'+item.key;
      var side=add(card,'div','jw-area-side');
      add(side,'span','jw-area-seal',item.mark);
      add(side,'p','jw-area-overline',item.eng);
      add(side,'h3','jw-area-name',item.name);
      add(side,'p','jw-area-hint',item.hint);
      var body=add(card,'div','jw-area-body');
      add(body,'strong','jw-area-lead',parts[0]||raw);
      if(parts[1])add(body,'p','jw-area-copy',parts[1]);
      if(!parts[1]&&raw&&parts[0]!==raw)add(body,'p','jw-area-copy',raw);
    });
    page.appendChild(areas);

    if(isTomorrow&&tomorrowPrep){
      var preparation=makeSection('PREPARE FOR TOMORROW','오늘 미리 준비할 것','내일의 운세를 보고 지금부터 준비할 수 있는 내용을 담았습니다.');
      preparation.classList.add('jw-tomorrow-preparation');
      var prepBox=add(preparation,'div','jw-preparation-copy');
      add(prepBox,'p','',tomorrowPrep);
      page.appendChild(preparation);
    }

    var points=makeSection('GOOD & CAREFUL',day+' 기억할 두 가지',day+' 해보면 좋은 행동과 한 번 더 살피면 좋은 행동입니다.');
    var pointGrid=add(points,'div','jw-point-grid');
    function pointCard(cls,kicker,list,alternative){
      var card=add(pointGrid,'article','jw-point-card '+cls);
      add(card,'span','jw-point-kicker',kicker);
      if(list.length){
        list.forEach(function(item){
          var itemBox=add(card,'div','jw-point-detail');
          add(itemBox,'strong','',item.title);
          if(item.copy)add(itemBox,'p','',item.copy);
        });
      }else{
        add(card,'p','',alternative);
      }
    }
    pointCard('is-helpful','추천하는 행동',helpful,'하나의 일에 집중하고 가벼운 정리부터 시작해보세요.');
    pointCard('is-caution','주의할 행동',caution,'중요한 선택은 한 번 더 확인한 뒤 결정해보세요.');
    page.appendChild(points);

    if(dayparts.length){
      var rhythm=makeSection('DAILY RHYTHM',day+'의 시간대별 흐름','오전부터 저녁까지 어떻게 움직이면 좋은지 살펴보세요.');
      var rhythmList=add(rhythm,'div','jw-rhythm-list');
      dayparts.forEach(function(item,i){
        var card=add(rhythmList,'article','jw-rhythm-item');
        add(card,'span','jw-rhythm-index','0'+(i+1));
        var copy=add(card,'div','jw-rhythm-copy');
        add(copy,'span','jw-rhythm-period',item.period);
        add(copy,'h3','',item.title);
        add(copy,'p','',item.copy);
      });
      page.appendChild(rhythm);
    }

    if(lucky.length){
      var small=makeSection('SMALL FORTUNE',day+'의 행운 힌트','운세를 가볍게 즐기기 위한 상징적인 참고 정보입니다.');
      var grid=add(small,'div','jw-lucky-tiles');
      lucky.forEach(function(item){
        var tile=add(grid,'div','jw-lucky-tile');
        add(tile,'span','',item.name);
        add(tile,'strong','',item.value);
      });
      page.appendChild(small);
    }

    var ending=add(page,'section','jw-ending');
    add(ending,'p','jw-section-kicker','正月齋 · A NOTE FOR YOU');
    add(ending,'h2','',day+'을 위한 작은 실천');
    add(ending,'p','jw-ending-message',mission||'중요한 일 하나를 정해 실천해보세요.');
    add(ending,'p','jw-ending-footnote','정월재의 운세는 전통 명리를 바탕으로 한 참고 해석입니다. 실제 결과를 단정하거나 보장하지 않습니다.');

    panel.replaceChildren(page);
    panel.classList.add('jw-editorial-ready');
    root.classList.add('is-editorial');
    completed=true;
  }
  window.addEventListener('jw:fortune-rendered',ready);
  window.addEventListener('jw:result-ready',ready);
  if(root.dataset.finalState==='ready')ready();
})();
