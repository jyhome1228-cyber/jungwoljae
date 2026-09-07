import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const form=document.querySelector('[data-guide-form]');
if(!form)throw new Error('guide form missing');
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app),db=getFirestore(app);

const config={
  work:{label:'일',desc:'이직 · 퇴사 · 진로 · 사업',situations:[['change','이직을 고민 중','지금 회사를 옮길지 계속 다닐지 고민돼요.'],['quit','퇴사를 고민 중','그만두고 싶지만 이후가 걱정돼요.'],['career','진로나 직무가 고민','어떤 일을 계속 가져가야 할지 모르겠어요.'],['stuck','일이 잘 풀리지 않음','노력은 하는데 성과가 답답하게 느껴져요.'],['business','사업·독립을 고민 중','회사 밖에서 내 일을 해볼지 고민돼요.']],blockers:[['money','수입과 연봉'],['stability','안정성'],['growth','성장 가능성'],['people','사람·조직문화'],['confidence','내가 잘할 수 있을지'],['timing','지금이 맞는 시기인지'],['regret','나중에 후회할까 봐'],['energy','체력과 번아웃']]},
  money:{label:'돈',desc:'저축 · 큰 지출 · 사업자금 · 투자',situations:[['saving','돈이 잘 모이지 않음','벌어도 남는 돈이 적어 답답해요.'],['expense','큰 지출을 앞둠','차·집·장비·교육처럼 큰돈을 써도 될지 고민돼요.'],['income','수입을 늘리고 싶음','지금보다 수입 구조를 키우고 싶어요.'],['business','사업 자금이 고민','돈을 더 넣을지, 규모를 줄일지 고민돼요.'],['investment','투자를 고민 중','투자 결정을 해도 될지 망설여져요.']],blockers:[['loss','손실 가능성'],['cashflow','현금 흐름'],['impulse','충동적인 결정'],['comparison','남들과 비교'],['timing','시기와 타이밍'],['uncertainty','정보가 부족한 느낌'],['saving','저축과 비상금'],['return','실제 수익성']]},
  love:{label:'연애',desc:'새 인연 · 썸 · 연애 · 이별',situations:[['new','새로운 인연을 만나고 싶음','새 사람을 만나고 싶은데 어떻게 움직여야 할지 모르겠어요.'],['crush','좋아하는 사람이 있음','마음을 표현할지 더 지켜볼지 고민돼요.'],['some','썸이 애매하게 이어짐','상대 마음이 있는지 없는지 헷갈려요.'],['dating','연애 중 갈등이 있음','좋아하지만 반복되는 문제가 있어요.'],['breakup','헤어질지 고민 중','계속 만날지 정리할지 고민돼요.'],['reunion','재회를 고민 중','다시 연락하거나 만나도 될지 고민돼요.']],blockers:[['contact','연락 빈도와 답장'],['trust','신뢰와 약속'],['expression','마음 표현'],['distance','거리감과 혼자만의 시간'],['future','미래를 함께 볼 수 있을지'],['conflict','반복되는 갈등'],['unclear','애매한 태도'],['regret','헤어지고 후회할까 봐']]},
  people:{label:'사람',desc:'가족 · 친구 · 직장동료 · 관계 정리',situations:[['coworker','직장 사람 때문에 힘듦','업무보다 사람 관계에서 에너지가 많이 빠져요.'],['friend','친구 관계가 고민','계속 이어갈 관계인지 거리 둘 관계인지 모르겠어요.'],['family','가족과 갈등이 있음','가까운 사이여서 더 힘든 부분이 있어요.'],['boundary','선을 어디까지 그어야 할지 고민','싫다고 말하거나 거리를 두는 게 어려워요.'],['cutoff','관계를 정리할지 고민','계속 참을지 끊어낼지 고민돼요.']],blockers:[['guilt','미안함과 죄책감'],['conflict','갈등이 커질까 봐'],['boundary','내 경계가 약해지는 느낌'],['communication','말이 잘 통하지 않음'],['respect','존중받지 못하는 느낌'],['dependence','서로 너무 의존함'],['work','일 때문에 끊기 어려움'],['lonely','관계를 끊으면 외로울까 봐']]},
  change:{label:'변화',desc:'이사 · 이동 · 유학 · 새로운 시작',situations:[['move','이사를 고민 중','지금 환경을 바꾸는 게 맞는지 고민돼요.'],['study','유학·공부를 고민 중','시간과 돈을 들여 새로운 공부를 시작할지 고민돼요.'],['restart','새로운 시작을 앞둠','익숙한 것을 내려놓고 새로 시작해도 될지 고민돼요.'],['relocate','지역·환경 이동을 고민','다른 도시나 환경으로 옮겨도 될지 고민돼요.'],['pause','잠시 쉬어갈지 고민','계속 달릴지 잠시 멈출지 모르겠어요.']],blockers:[['money','비용'],['stability','생활 안정'],['family','가족·주변 사람'],['career','일과 커리어'],['adapt','새 환경 적응'],['timing','타이밍'],['regret','후회'],['energy','체력과 마음의 여유']]},
  mind:{label:'마음',desc:'불안 · 무기력 · 결정 피로 · 방향 상실',situations:[['anxiety','계속 불안함','별일이 없어도 마음이 계속 조급하거나 불안해요.'],['low','의욕이 떨어짐','해야 할 건 아는데 시작하기가 어렵고 지쳐요.'],['overthink','생각이 너무 많음','결정을 내리기보다 계속 생각만 길어져요.'],['lost','방향을 잃은 느낌','뭘 해야 할지 모르겠고 목표가 흐려졌어요.'],['pressure','잘해야 한다는 압박이 큼','실수하거나 뒤처질까 봐 마음이 편하지 않아요.']],blockers:[['perfect','완벽하게 해야 한다는 생각'],['future','미래에 대한 불안'],['comparison','남들과 비교'],['energy','체력 부족'],['rest','쉬면 뒤처질 것 같은 마음'],['decision','결정 피로'],['confidence','자신감 저하'],['routine','생활 리듬이 무너짐']]},
  choice:{label:'선택',desc:'둘 중 하나 · 결정 · 우선순위',situations:[['two','두 선택지 사이에서 고민','둘 다 장단점이 있어 결정을 못 내리고 있어요.'],['yesno','할지 말지 고민','시작할지 아예 하지 말아야 할지 모르겠어요.'],['priority','무엇부터 해야 할지 고민','해야 할 일이 많아 우선순위를 못 정하겠어요.'],['wait','지금 움직일지 기다릴지 고민','조금 더 기다려야 할지 바로 움직여야 할지 고민돼요.']],blockers:[['information','정보가 부족함'],['regret','잘못 골라 후회할까 봐'],['money','돈과 비용'],['people','주변 사람의 의견'],['timing','시기'],['stability','안정성'],['growth','장기적인 성장'],['emotion','감정이 판단을 흔듦']]}
};

const domainGrid=form.querySelector('[data-domain-grid]');
const situationGrid=form.querySelector('[data-situation-grid]');
const blockerGrid=form.querySelector('[data-blocker-grid]');
const blockerCount=form.querySelector('[data-blocker-count]');
const preview=form.querySelector('[data-guide-preview]');
const previewText=form.querySelector('[data-guide-preview-text]');
const stepSituation=form.querySelector('[data-step="situation"]');
const stepBlockers=form.querySelector('[data-step="blockers"]');
const stepProfile=form.querySelector('[data-step="profile"]');
const submitArea=form.querySelector('[data-guide-submit]');
const status=form.querySelector('[data-guide-status]');
const profileState=form.querySelector('[data-profile-state]');

let selectedDomain='',selectedSituation='',selectedBlockers=[];

function domainCards(){
  domainGrid.innerHTML=Object.entries(config).map(([key,c])=>`<label class="guide-choice"><input type="radio" name="guideDomain" value="${key}"><span><strong>${c.label}</strong><em>${c.desc}</em></span></label>`).join('');
}
function situationCards(domain){
  const c=config[domain];
  situationGrid.innerHTML=c.situations.map(([key,label,desc])=>`<label class="guide-choice"><input type="radio" name="guideSituation" value="${key}"><span><strong>${label}</strong><em>${desc}</em></span></label>`).join('');
}
function blockerCards(domain){
  const c=config[domain];
  blockerGrid.innerHTML=c.blockers.map(([key,label])=>`<label class="guide-keyword"><input type="checkbox" name="guideBlocker" value="${key}"><span>${label}</span></label>`).join('');
  selectedBlockers=[];blockerCount.textContent='0';preview.hidden=true;
}
function labelFor(list,key){return list.find(x=>x[0]===key)?.[1]||key;}
function updatePreview(){
  if(!selectedDomain||!selectedSituation||!selectedBlockers.length){preview.hidden=true;return;}
  const c=config[selectedDomain];
  const situation=labelFor(c.situations,selectedSituation);
  const blockers=selectedBlockers.map(k=>labelFor(c.blockers,k)).join(' · ');
  previewText.textContent=`${c.label} 고민 중에서도 ‘${situation}’에 가깝고, 특히 ${blockers}이(가) 결정에 영향을 주고 있습니다.`;
  preview.hidden=false;
}

domainCards();
domainGrid.addEventListener('change',e=>{
  const input=e.target.closest('input[name="guideDomain"]');if(!input)return;
  selectedDomain=input.value;selectedSituation='';selectedBlockers=[];
  situationCards(selectedDomain);blockerCards(selectedDomain);
  stepSituation.hidden=false;stepBlockers.hidden=true;stepProfile.hidden=true;submitArea.hidden=true;status.textContent='';
  setTimeout(()=>stepSituation.scrollIntoView({behavior:'smooth',block:'center'}),80);
});
situationGrid.addEventListener('change',e=>{
  const input=e.target.closest('input[name="guideSituation"]');if(!input)return;
  selectedSituation=input.value;blockerCards(selectedDomain);
  stepBlockers.hidden=false;stepProfile.hidden=true;submitArea.hidden=true;
  setTimeout(()=>stepBlockers.scrollIntoView({behavior:'smooth',block:'center'}),80);
});
blockerGrid.addEventListener('change',e=>{
  const input=e.target.closest('input[name="guideBlocker"]');if(!input)return;
  const checked=[...blockerGrid.querySelectorAll('input:checked')];
  if(checked.length>2){input.checked=false;status.textContent='걸리는 이유는 최대 2개까지 선택할 수 있습니다.';return;}
  status.textContent='';selectedBlockers=checked.map(x=>x.value);blockerCount.textContent=String(selectedBlockers.length);updatePreview();
  if(selectedBlockers.length){stepProfile.hidden=false;submitArea.hidden=false;}
});

const year=form.querySelector('#guide-year'),month=form.querySelector('#guide-month'),day=form.querySelector('#guide-day');
const meridiem=form.querySelector('#guide-meridiem'),hour=form.querySelector('#guide-hour'),minute=form.querySelector('#guide-minute');
const timeUnknown=form.querySelector('#guide-time-unknown'),calendar=form.querySelector('#guide-calendar'),lunarExtra=form.querySelector('[data-lunar-extra]');
const currentYear=new Date().getFullYear();
for(let y=currentYear;y>=1930;y--)year.insertAdjacentHTML('beforeend',`<option value="${y}">${y}년</option>`);
for(let m=1;m<=12;m++)month.insertAdjacentHTML('beforeend',`<option value="${String(m).padStart(2,'0')}">${m}월</option>`);
for(let h=1;h<=12;h++)hour.insertAdjacentHTML('beforeend',`<option value="${String(h).padStart(2,'0')}">${h}시</option>`);
for(let m=0;m<60;m+=10)minute.insertAdjacentHTML('beforeend',`<option value="${String(m).padStart(2,'0')}">${String(m).padStart(2,'0')}분</option>`);
function fillDays(){const prev=day.value;day.innerHTML='<option value="">일</option>';const y=Number(year.value)||2000,m=Number(month.value)||1,max=new Date(y,m,0).getDate();for(let d=1;d<=max;d++)day.insertAdjacentHTML('beforeend',`<option value="${String(d).padStart(2,'0')}">${d}일</option>`);if([...day.options].some(o=>o.value===prev))day.value=prev;}
fillDays();year.addEventListener('change',fillDays);month.addEventListener('change',fillDays);
function syncTime(){const disabled=timeUnknown.checked;[meridiem,hour,minute].forEach(el=>{el.disabled=disabled;if(disabled)el.value='';});}
function syncCalendar(){lunarExtra.hidden=calendar.value!=='lunar';}
timeUnknown.addEventListener('change',syncTime);calendar.addEventListener('change',syncCalendar);syncTime();syncCalendar();

function fillProfile(p){
  if(p.name)form.elements.name.value=p.name;
  if(p.birthDate){const [y,m,d]=p.birthDate.split('-');year.value=y;month.value=m;fillDays();day.value=d;}
  if(p.birthTimeUnknown){timeUnknown.checked=true;syncTime();}
  else if(p.birthTime){const [hh,mm]=p.birthTime.split(':').map(Number);meridiem.value=hh>=12?'pm':'am';hour.value=String((hh%12)||12).padStart(2,'0');minute.value=String(Math.round(mm/10)*10%60).padStart(2,'0');}
  if(p.calendarType){calendar.value=p.calendarType;syncCalendar();}
  if(p.gender)form.querySelector('#guide-gender').value=p.gender;
  if(p.city)form.querySelector('#guide-city').value=p.city;
}
onAuthStateChanged(auth,async user=>{
  if(!user){profileState.textContent='비회원은 기본 정보를 직접 입력해주세요.';return;}
  try{const snap=await getDoc(doc(db,'users',user.uid));if(snap.exists()){fillProfile(snap.data());profileState.textContent='저장된 회원정보를 불러왔습니다.';profileState.dataset.state='ok';}else profileState.textContent='회원정보가 없어 직접 입력해주세요.';}
  catch(e){profileState.textContent='회원정보를 불러오지 못했습니다. 직접 입력해도 이용할 수 있습니다.';}
});

form.addEventListener('submit',e=>{
  e.preventDefault();status.textContent='';
  if(!selectedDomain||!selectedSituation||!selectedBlockers.length){status.textContent='고민 선택 단계를 모두 완료해주세요.';return;}
  const name=form.elements.name.value.trim();
  const birthDate=year.value&&month.value&&day.value?`${year.value}-${month.value}-${day.value}`:'';
  let birthTime='';
  if(!timeUnknown.checked&&meridiem.value&&hour.value&&minute.value){let h=Number(hour.value)%12;if(meridiem.value==='pm')h+=12;birthTime=`${String(h).padStart(2,'0')}:${minute.value}`;}
  if(!name){status.textContent='이름 또는 닉네임을 입력해주세요.';return;}
  if(!birthDate){status.textContent='태어난 연·월·일을 모두 선택해주세요.';return;}
  if(!timeUnknown.checked&&(meridiem.value||hour.value||minute.value)&&!birthTime){status.textContent='시간을 입력하려면 오전/오후·시·분을 모두 선택해주세요.';return;}
  if(!form.elements.consent.checked){status.textContent='분석을 위한 정보 사용에 동의해주세요.';return;}
  const c=config[selectedDomain];
  const payload={name,birthDate,birthTime,birthTimeUnknown:timeUnknown.checked,calendarType:calendar.value,isLeapMonth:Boolean(form.querySelector('#guide-leap')?.checked),gender:form.querySelector('#guide-gender').value,city:form.querySelector('#guide-city').value.trim(),domain:selectedDomain,domainLabel:c.label,situation:selectedSituation,situationLabel:labelFor(c.situations,selectedSituation),blockers:selectedBlockers,blockerLabels:selectedBlockers.map(k=>labelFor(c.blockers,k)),createdAt:Date.now()};
  sessionStorage.setItem('jungwoljae_guide_input',JSON.stringify(payload));
  location.href='./guide-result.html';
});
