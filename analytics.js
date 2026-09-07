import { firebaseConfig } from './firebase-config.js?v=20260907-1645';
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc, runTransaction, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const excluded=new Set(['admin.html','firebase-debug.html']);
if(!excluded.has(file)){
  const app=getApps().length?getApp():initializeApp(firebaseConfig);
  const db=getFirestore(app);

  const pageLabels={
    'index.html':'메인','saju.html':'종합 사주','saju-result.html':'종합 사주 결과',
    'ohaeng.html':'오행 분석','ohaeng-result.html':'오행 분석 결과',
    'fortune.html':'오늘의 운세','fortune-result.html':'오늘의 운세 결과',
    'relationship.html':'연애와 인연','relationship-result.html':'연애와 인연 결과',
    'compatibility.html':'궁합','compatibility-result.html':'궁합 결과',
    'work-money.html':'일과 재물','work-money-result.html':'일과 재물 결과',
    'archive.html':'정월록','reviews.html':'후기','about.html':'소개',
    'login.html':'로그인','signup.html':'회원등록','mypage.html':'마이페이지','privacy.html':'개인정보처리방침'
  };

  function seoulDateKey(){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=t=>parts.find(p=>p.type===t)?.value||'';
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  function randomId(){
    if(globalThis.crypto?.randomUUID)return crypto.randomUUID().replaceAll('-','');
    return `v${Date.now().toString(36)}${Math.random().toString(36).slice(2,14)}`;
  }
  function visitorId(){
    try{let id=localStorage.getItem('jungwoljae_visitor_id');if(!id){id=randomId();localStorage.setItem('jungwoljae_visitor_id',id);}return id;}
    catch(e){return randomId();}
  }
  async function bumpCounter(ref,extra={}){
    await runTransaction(db,async tx=>{
      const snap=await tx.get(ref);
      const current=snap.exists()?Number(snap.data().pageViews||0):0;
      tx.set(ref,{...extra,pageViews:current+1,updatedAt:serverTimestamp()},{merge:true});
    });
  }
  async function recordVisit(){
    const dateKey=seoulDateKey(),id=visitorId(),path=`/${file}`;
    const pageId=file.replace(/\.html$/,'').replace(/[^a-z0-9_-]/g,'-')||'index';
    const label=pageLabels[file]||file.replace('.html','');
    const dailyRef=doc(db,'analytics_daily',dateKey);
    const pageRef=doc(db,'analytics_daily',dateKey,'pages',pageId);
    const visitorRef=doc(db,'analytics_daily',dateKey,'visitors',id);

    const tasks=[
      bumpCounter(dailyRef),
      bumpCounter(pageRef,{path,label}),
      (async()=>{const existing=await getDoc(visitorRef);if(!existing.exists())await setDoc(visitorRef,{visitorId:id,createdAt:serverTimestamp()});})()
    ];
    const results=await Promise.allSettled(tasks);
    const failed=results.filter(x=>x.status==='rejected');
    if(failed.length)console.warn('[Jungwoljae analytics] 일부 집계 실패',failed.map(x=>x.reason?.code||x.reason?.message));
  }

  let recorded=false;
  const runOnce=()=>{if(recorded)return;recorded=true;recordVisit().catch(error=>console.warn('[Jungwoljae analytics]',error?.code||error?.message));};
  if(document.visibilityState==='visible')runOnce();
  else document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')runOnce();},{once:true});
}

import('./member-usage.js?v=20260907-01').catch(()=>{});
