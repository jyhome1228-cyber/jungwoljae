import { calculateFourPillars } from 'https://cdn.jsdelivr.net/npm/manseryeok@2.0.0/+esm';
import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const form=document.querySelector('[data-fortune-form]');
if(!form) throw new Error('fortune form missing');
const app=getApps().length?getApp():initializeApp(firebaseConfig);
const auth=getAuth(app);const db=getFirestore(app);
const status=form.querySelector('[data-fortune-status]');
const profileState=form.querySelector('[data-profile-state]');
const memberName=document.querySelector('[data-member-name]');
const yearSelect=form.querySelector('#fortune-year');
const nameInput=form.querySelector('#fortune-name');
const question=form.querySelector('#fortune-question');

const zodiacOrder=['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig'];
const branchToZodiac={자:'rat',축:'ox',인:'tiger',묘:'rabbit',진:'dragon',사:'snake',오:'horse',미:'goat',신:'monkey',유:'rooster',술:'dog',해:'pig'};
const zodiacKo={rat:'쥐띠',ox:'소띠',tiger:'호랑이띠',rabbit:'토끼띠',dragon:'용띠',snake:'뱀띠',horse:'말띠',goat:'양띠',monkey:'원숭이띠',rooster:'닭띠',dog:'개띠',pig:'돼지띠'};
const mod=(n,m)=>((n%m)+m)%m;
const zodiacFromYear=(year)=>zodiacOrder[mod(Number(year)-4,12)];

function seoulToday(){
  const parts=new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',weekday:'long'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value||'';
  return {year:Number(get('year')),month:Number(get('month')),day:Number(get('day')),label:`${get('year')}.${get('month')}.${get('day')} ${get('weekday')}`};
}
document.querySelector('[data-today-label]').textContent=seoulToday().label;

const currentYear=seoulToday().year;
for(let y=currentYear;y>=1930;y--) yearSelect.insertAdjacentHTML('beforeend',`<option value="${y}">${y}년</option>`);

function selectZodiac(key){
  const radio=form.querySelector(`input[name="zodiac"][value="${key}"]`);
  if(radio)radio.checked=true;
}
yearSelect.addEventListener('change',()=>{if(yearSelect.value)selectZodiac(zodiacFromYear(yearSelect.value));});

function pillarString(v){
  if(typeof v==='string')return v;
  return v?.korean||v?.name||'';
}
function exactZodiacFromProfile(profile){
  try{
    const [y,m,d]=String(profile.birthDate||'').split('-').map(Number);
    if(!y||!m||!d)return zodiacFromYear(y);
    const result=calculateFourPillars({year:y,month:m,day:d,hour:12,minute:0,isLunar:profile.calendarType==='lunar',gender:profile.gender||undefined});
    const obj=typeof result?.toObject==='function'?result.toObject():result;
    const yearPillar=pillarString(obj?.year);
    return branchToZodiac[[...yearPillar][1]]||zodiacFromYear(y);
  }catch(e){return zodiacFromYear(String(profile.birthDate||'').slice(0,4));}
}

onAuthStateChanged(auth,async user=>{
  if(!user){profileState.textContent='비회원은 출생연도와 띠를 직접 선택해주세요.';return;}
  try{
    const snap=await getDoc(doc(db,'users',user.uid));
    if(!snap.exists()){profileState.textContent='저장된 사주 기본 정보가 없어 직접 선택해주세요.';return;}
    const p=snap.data();
    const year=String(p.birthDate||'').slice(0,4);
    if(p.name){nameInput.value=p.name;memberName.textContent=`${p.name}님`;}
    if(year){yearSelect.value=year;selectZodiac(exactZodiacFromProfile(p));}
    profileState.dataset.state='ok';
    profileState.textContent=`회원정보에서 ${year||'출생연도'} · ${zodiacKo[form.elements.zodiac?.value]||'띠'}를 불러왔습니다. 실제 띠가 다르면 직접 바꿔주세요.`;
  }catch(e){profileState.textContent='회원정보를 불러오지 못했습니다. 직접 입력해주세요.';}
});

form.addEventListener('submit',(event)=>{
  event.preventDefault();
  status.textContent='';
  const name=nameInput.value.trim();
  const birthYear=yearSelect.value;
  const zodiac=form.querySelector('input[name="zodiac"]:checked')?.value||'';
  const consent=form.elements.consent.checked;
  if(!name){status.textContent='이름 또는 닉네임을 입력해주세요.';nameInput.focus();return;}
  if(!birthYear){status.textContent='출생연도를 선택해주세요.';yearSelect.focus();return;}
  if(!zodiac){status.textContent='나의 띠를 선택해주세요.';return;}
  if(!consent){status.textContent='분석을 위한 정보 사용에 동의해주세요.';return;}
  const today=seoulToday();
  const payload={name,birthYear:Number(birthYear),zodiac,question:question.value.trim(),targetDate:`${today.year}-${String(today.month).padStart(2,'0')}-${String(today.day).padStart(2,'0')}`,createdAt:Date.now()};
  sessionStorage.setItem('jungwoljae_fortune_input',JSON.stringify(payload));
  location.href='./fortune-result.html';
});
