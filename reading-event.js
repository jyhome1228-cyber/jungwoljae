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
  'work-money-result.html':{key:'work-money',label:'일과 재물',storage:'jungwoljae_work_money_input'},
  'guide-result.html':{key:'guide',label:'정월도감',storage:'jungwoljae_guide_input'}
};
const service=serviceMap[file];
if(service){
  let input=null;
  try{input=JSON.parse(sessionStorage.getItem(service.storage)||'null');}catch(e){}
  if(input){
    const app=getApps().length?getApp():initializeApp(firebaseConfig);
    const auth=getAuth(app),db=getFirestore(app);
    const clean=v=>String(v??'').trim().slice(0,120);
    const bool=v=>Boolean(v);
    const normalized={
      service:service.key,
      serviceLabel:service.label,
      name:clean(input.name||input.profileName),
      birthDate:clean(input.birthDate),
      birthTime:clean(input.birthTime),
      birthTimeUnknown:bool(input.birthTimeUnknown),
      calendarType:clean(input.calendarType||'solar'),
      gender:clean(input.gender),
      city:clean(input.city),
      focus:Array.isArray(input.focus)?input.focus.map(clean).slice(0,4):[],
      domain:clean(input.domain||input.guideDomain||input.category),
      situation:clean(input.situation||input.guideSituation),
      blockers:Array.isArray(input.blockers||input.guideBlockers)?(input.blockers||input.guideBlockers).map(clean).slice(0,4):[],
      partnerName:clean(input.partnerName),
      partnerBirthDate:clean(input.partnerBirthDate),
      uid:null,
      createdAt:serverTimestamp()
    };
    const signature=JSON.stringify({service:service.key,name:normalized.name,birthDate:normalized.birthDate,birthTime:normalized.birthTime,domain:normalized.domain,situation:normalized.situation,focus:normalized.focus,partnerBirthDate:normalized.partnerBirthDate});
    let hash=0;for(let i=0;i<signature.length;i++)hash=((hash<<5)-hash+signature.charCodeAt(i))|0;
    const sessionKey=`jungwoljae_reading_event_${service.key}_${Math.abs(hash)}`;
    let already=false;try{already=sessionStorage.getItem(sessionKey)==='1';}catch(e){}
    if(!already){
      onAuthStateChanged(auth,async user=>{
        normalized.uid=user?.uid||null;
        try{
          await addDoc(collection(db,'reading_events'),normalized);
          try{sessionStorage.setItem(sessionKey,'1');}catch(e){}
        }catch(error){console.warn('[Jungwoljae reading event]',error);}
      });
    }
  }
}
