import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const file=(location.pathname.split('/').pop()||'').toLowerCase();
const serviceByPage={
  'saju-result.html':{service:'saju',inputKey:'jungwoljae_saju_input'},
  'ohaeng-result.html':{service:'ohaeng',inputKey:'jungwoljae_ohaeng_input'},
  'fortune-result.html':{service:'fortune',inputKey:'jungwoljae_fortune_input'},
  'relationship-result.html':{service:'relationship',inputKey:'jungwoljae_relationship_input'},
  'compatibility-result.html':{service:'compatibility',inputKey:'jungwoljae_compatibility_input'},
  'work-money-result.html':{service:'work-money',inputKey:'jungwoljae_work_money_input'}
};
const config=serviceByPage[file];
if(config){
  const app=getApps().length?getApp():initializeApp(firebaseConfig);
  const auth=getAuth(app);
  const db=getFirestore(app);

  function token(){
    try{
      const raw=sessionStorage.getItem(config.inputKey);
      const input=raw?JSON.parse(raw):{};
      return String(input.createdAt||input.targetDate||raw||Date.now());
    }catch(e){return String(Date.now());}
  }

  onAuthStateChanged(auth,async user=>{
    if(!user)return;
    const marker=`jw_usage_${config.service}_${token()}`;
    try{if(sessionStorage.getItem(marker)==='1')return;}catch(e){}
    const ref=doc(db,'member_usage',user.uid);
    try{
      const snap=await getDoc(ref);
      if(snap.exists()){
        await updateDoc(ref,
          'total',increment(1),
          `services.${config.service}`,increment(1),
          'lastUsedAt',serverTimestamp()
        );
      }else{
        await setDoc(ref,{total:1,services:{[config.service]:1},lastUsedAt:serverTimestamp()});
      }
      try{sessionStorage.setItem(marker,'1');}catch(e){}
    }catch(error){
      console.warn('member usage tracking skipped',error?.code||error);
    }
  });
}
