import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const file=(location.pathname.split('/').pop()||'').toLowerCase();
const serviceMap={
  'saju-result.html':{key:'saju',label:'종합 사주',storage:'jungwoljae_saju_input'},
  'ohaeng-result.html':{key:'ohaeng',label:'오행 분석',storage:'jungwoljae_ohaeng_input'},
  'fortune-result.html':{key:'fortune',label:'오늘의 운세',storage:'jungwoljae_fortune_input'},
  'relationship-result.html':{key:'relationship',label:'연애와 인연',storage:'jungwoljae_relationship_input'},
  'compatibility-result.html':{key:'compatibility',label:'궁합',storage:'jungwoljae_compatibility_input'},
  'compatibility-report.html':{key:'compatibility',label:'궁합',storage:'jungwoljae_compatibility_input'},
  'work-money-result.html':{key:'work-money',label:'일과 재물',storage:'jungwoljae_work_money_input'},
  'guide-result.html':{key:'guide',label:'정월도감',storage:'jungwoljae_guide_input'}
};

const config=serviceMap[file];
if(config){
  let input=null;
  try{input=JSON.parse(sessionStorage.getItem(config.storage)||'null');}catch(e){}

  if(input){
    const primary=input.personA||input;
    const partner=input.personB||null;
    const isTomorrow=file==='fortune-result.html'&&input.mode==='tomorrow';
    const serviceKey=config.key;
    const serviceVariant=isTomorrow?'tomorrow':serviceKey;
    const serviceLabel=isTomorrow?'내일의 운세':config.label;

    const app=getApps().length?getApp():initializeApp(firebaseConfig);
    const auth=getAuth(app);
    const db=getFirestore(app);
    const clean=v=>String(v??'').trim().slice(0,120);
    const bool=v=>Boolean(v);

    const baseEvent={
      service:serviceKey,
      serviceLabel,
      name:clean(primary.name||primary.profileName),
      birthDate:clean(primary.birthDate),
      birthTime:clean(primary.birthTime),
      birthTimeUnknown:bool(primary.birthTimeUnknown),
      calendarType:clean(primary.calendarType||'solar'),
      gender:clean(primary.gender),
      city:clean(primary.city),
      focus:Array.isArray(input.focus)?input.focus.map(clean).slice(0,4):[],
      domain:clean(input.domain||input.guideDomain||input.category),
      situation:clean(input.situation||input.guideSituation),
      blockers:Array.isArray(input.blockers||input.guideBlockers)?(input.blockers||input.guideBlockers).map(clean).slice(0,4):[],
      partnerName:clean(partner?.name||input.partnerName),
      partnerBirthDate:clean(partner?.birthDate||input.partnerBirthDate)
    };

    const signature=JSON.stringify({
      service:serviceVariant,
      name:baseEvent.name,
      birthDate:baseEvent.birthDate,
      birthTime:baseEvent.birthTime,
      domain:baseEvent.domain,
      situation:baseEvent.situation,
      focus:baseEvent.focus,
      partnerName:baseEvent.partnerName,
      partnerBirthDate:baseEvent.partnerBirthDate
    });
    let hash=0;
    for(let i=0;i<signature.length;i++)hash=((hash<<5)-hash+signature.charCodeAt(i))|0;
    const sessionKey=`jungwoljae_reading_event_${serviceVariant}_${Math.abs(hash)}`;

    let already=false;
    try{already=sessionStorage.getItem(sessionKey)==='1';}catch(e){}

    if(!already){
      let writing=false;
      const writeEvent=async user=>{
        if(writing)return;
        writing=true;
        const normalized={...baseEvent,uid:user?.uid||null,createdAt:serverTimestamp()};
        try{
          await addDoc(collection(db,'reading_events'),normalized);
          try{sessionStorage.setItem(sessionKey,'1');}catch(e){}
        }catch(error){
          writing=false;
          console.warn('[Jungwoljae reading event]',error?.code||error?.message||error);
        }
      };

      // Do not block anonymous usage logging on Firebase Auth initialization.
      // Most reading traffic is anonymous, and waiting indefinitely for auth can
      // make a valid result view disappear from reading_events.
      const currentUser=auth.currentUser;
      if(currentUser){
        writeEvent(currentUser);
      }else{
        const fallback=setTimeout(()=>writeEvent(null),700);
        let stop=()=>{};
        try{
          stop=onAuthStateChanged(auth,user=>{
            clearTimeout(fallback);
            try{stop();}catch(e){}
            writeEvent(user||null);
          },error=>{
            clearTimeout(fallback);
            try{stop();}catch(e){}
            console.warn('[Jungwoljae reading event auth]',error?.code||error?.message||error);
            writeEvent(null);
          });
        }catch(error){
          clearTimeout(fallback);
          console.warn('[Jungwoljae reading event auth init]',error?.code||error?.message||error);
          writeEvent(null);
        }
      }
    }
  }else{
    console.warn('[Jungwoljae reading event] 결과 입력값을 찾지 못해 분석 기록을 저장하지 않았습니다.',config.storage);
  }
}
