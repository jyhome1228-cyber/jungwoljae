import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const supported=new Set(['saju.html','ohaeng.html','fortune.html','relationship.html','work-money.html','guide.html']);
if(!supported.has(file)){
  // 이 모듈은 반복 입력이 있는 개인 분석 폼에서만 동작합니다.
}else{
  const form=document.querySelector('[data-saju-form],[data-ohaeng-form],[data-fortune-form],[data-relationship-form],[data-work-money-form],[data-guide-form],.work-money-form');
  if(form){
    const LOCAL_KEY='jungwoljae_basic_profile_v1';
    const app=getApps().length?getApp():initializeApp(firebaseConfig);
    const auth=getAuth(app),db=getFirestore(app);
    let currentUser=null;

    const bySuffix=(suffix)=>form.querySelector(`[id$="${suffix}"]`);
    const controls={
      name:form.querySelector('input[name="name"]')||bySuffix('-name'),
      year:form.querySelector('[name="birthYear"]')||bySuffix('-year'),
      month:form.querySelector('[name="birthMonth"]')||bySuffix('-month'),
      day:form.querySelector('[name="birthDay"]')||bySuffix('-day'),
      meridiem:form.querySelector('[name="birthMeridiem"]')||bySuffix('-meridiem'),
      hour:form.querySelector('[name="birthHour"]')||bySuffix('-hour'),
      minute:form.querySelector('[name="birthMinute"]')||bySuffix('-minute'),
      timeUnknown:form.querySelector('[name="birthTimeUnknown"]')||bySuffix('-time-unknown'),
      calendar:form.querySelector('[name="calendarType"]')||bySuffix('-calendar'),
      gender:form.querySelector('[name="gender"]')||bySuffix('-gender'),
      leap:form.querySelector('[name="isLeapMonth"]')||bySuffix('-leap'),
      city:form.querySelector('[name="city"]')||bySuffix('-city')
    };

    const profileAnchor=file==='guide.html'
      ? form.querySelector('[data-step="profile"] .guide-step-head')
      : form.querySelector('.form-page-title');

    if(profileAnchor && controls.name && controls.year && !form.querySelector('[data-basic-profile-tools]')){
      const panel=document.createElement('section');
      panel.className='basic-profile-tools';
      panel.dataset.basicProfileTools='';
      panel.setAttribute('aria-label','사주 기본정보 저장 및 불러오기');
      panel.innerHTML=`
        <div class="basic-profile-tools__head">
          <div class="basic-profile-tools__copy">
            <span class="basic-profile-tools__eyebrow">BASIC PROFILE</span>
            <strong class="basic-profile-tools__title">한 번 입력한 기본정보를 계속 사용할 수 있어요.</strong>
            <p class="basic-profile-tools__desc">이름·생년월일·출생시간·성별·출생지역을 저장해 사주, 오행, 인연, 일·재물, 정월도감에서 다시 불러옵니다.</p>
          </div>
          <div class="basic-profile-tools__actions">
            <button class="basic-profile-tools__button" type="button" data-profile-load>저장정보 불러오기</button>
            <button class="basic-profile-tools__button primary" type="button" data-profile-save>현재 정보 저장</button>
          </div>
        </div>
        <p class="basic-profile-tools__status" role="status" aria-live="polite" data-profile-tool-status>로그인 여부를 확인하고 있습니다.</p>`;
      profileAnchor.insertAdjacentElement('afterend',panel);

      const status=panel.querySelector('[data-profile-tool-status]');
      const loadButton=panel.querySelector('[data-profile-load]');
      const saveButton=panel.querySelector('[data-profile-save]');

      const emit=(el,type='change')=>{
        if(!el)return;
        el.dispatchEvent(new Event(type,{bubbles:true}));
      };
      const setValue=(el,value)=>{
        if(!el || value===undefined || value===null || value==='')return;
        const string=String(value);
        if(el.tagName==='SELECT' && ![...el.options].some(o=>o.value===string))return;
        el.value=string;
        emit(el,'input');emit(el,'change');
      };
      const setChecked=(el,value)=>{
        if(!el)return;
        el.checked=Boolean(value);
        emit(el,'change');
      };
      const toBirthTime=()=>{
        if(controls.timeUnknown?.checked)return '';
        if(!controls.hour?.value || !controls.minute?.value)return '';
        let h=Number(controls.hour.value);
        if(controls.meridiem?.value){
          h=h%12;
          if(controls.meridiem.value==='pm')h+=12;
        }
        return `${String(h).padStart(2,'0')}:${String(controls.minute.value).padStart(2,'0')}`;
      };
      const readProfile=()=>{
        const birthDate=(controls.year?.value&&controls.month?.value&&controls.day?.value)
          ? `${controls.year.value}-${String(controls.month.value).padStart(2,'0')}-${String(controls.day.value).padStart(2,'0')}`:'';
        return {
          name:(controls.name?.value||'').trim(),
          birthDate,
          birthTime:toBirthTime(),
          birthTimeUnknown:Boolean(controls.timeUnknown?.checked),
          calendarType:controls.calendar?.value||'solar',
          gender:controls.gender?.value||'',
          city:(controls.city?.value||'').trim(),
          isLeapMonth:Boolean(controls.leap?.checked)
        };
      };
      const applyProfile=(p={})=>{
        if(p.name)setValue(controls.name,p.name);
        if(p.birthDate){
          const [y,m,d]=String(p.birthDate).split('-');
          setValue(controls.year,y);
          setValue(controls.month,m);
          setValue(controls.day,d);
        }
        if(controls.timeUnknown)setChecked(controls.timeUnknown,Boolean(p.birthTimeUnknown));
        if(!p.birthTimeUnknown && p.birthTime && controls.hour){
          const [rawH,rawM]=String(p.birthTime).split(':').map(Number);
          if(controls.meridiem){
            setValue(controls.meridiem,rawH>=12?'pm':'am');
            setValue(controls.hour,String((rawH%12)||12).padStart(2,'0'));
          }else setValue(controls.hour,String(rawH).padStart(2,'0'));
          if(controls.minute){
            const rounded=Math.round((rawM||0)/10)*10%60;
            setValue(controls.minute,String(rounded).padStart(2,'0'));
          }
        }
        if(p.calendarType)setValue(controls.calendar,p.calendarType);
        if(p.gender)setValue(controls.gender,p.gender);
        if(p.city)setValue(controls.city,p.city);
        if(controls.leap)setChecked(controls.leap,Boolean(p.isLeapMonth));
      };
      const localRead=()=>{
        try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||'null');}catch(e){return null;}
      };
      const localWrite=(profile)=>localStorage.setItem(LOCAL_KEY,JSON.stringify({...profile,savedAt:Date.now()}));
      const setStatus=(message,state='')=>{
        status.textContent=message;
        if(state)status.dataset.state=state;else delete status.dataset.state;
      };

      onAuthStateChanged(auth,(user)=>{
        currentUser=user||null;
        setStatus(user
          ? '회원정보와 연결됩니다. 저장하면 다른 기기에서도 다시 불러올 수 있습니다.'
          : '비회원은 이 브라우저에만 저장됩니다. 로그인하면 계정에 연결해 사용할 수 있습니다.');
      });

      loadButton.addEventListener('click',async()=>{
        loadButton.disabled=true;
        setStatus('저장된 기본정보를 불러오고 있습니다.');
        try{
          let profile=null;
          if(currentUser){
            const snap=await getDoc(doc(db,'users',currentUser.uid));
            if(snap.exists())profile=snap.data();
          }
          profile=profile||localRead();
          if(!profile){setStatus('아직 저장된 기본정보가 없습니다. 현재 정보를 입력한 뒤 저장해주세요.','error');return;}
          applyProfile(profile);
          setStatus(currentUser?'회원 기본정보를 불러왔습니다.':'이 브라우저에 저장된 기본정보를 불러왔습니다.','ok');
        }catch(e){
          setStatus('기본정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.','error');
        }finally{loadButton.disabled=false;}
      });

      saveButton.addEventListener('click',async()=>{
        const profile=readProfile();
        if(!profile.name || !profile.birthDate){
          setStatus('이름과 태어난 날짜를 먼저 입력해주세요.','error');
          return;
        }
        saveButton.disabled=true;
        setStatus('현재 기본정보를 저장하고 있습니다.');
        try{
          localWrite(profile);
          if(currentUser){
            await setDoc(doc(db,'users',currentUser.uid),{...profile,updatedAt:serverTimestamp()},{merge:true});
            setStatus('기본정보를 계정에 저장했습니다. 다음 분석부터 바로 불러올 수 있습니다.','ok');
          }else{
            setStatus('이 브라우저에 기본정보를 저장했습니다. 다음 분석에서 다시 불러올 수 있습니다.','ok');
          }
        }catch(e){
          setStatus('기본정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.','error');
        }finally{saveButton.disabled=false;}
      });
    }
  }
}
