(()=>{
  const clean=value=>String(value||'')
    .replace(/무료로\s*/g,'')
    .replace(/무료\s*/g,'')
    .replace(/\bFREE\b\s*[·:\-]?\s*/gi,'')
    .replace(/[ \t]{2,}/g,' ')
    .replace(/^\s+|\s+$/g,'');

  function cleanNode(node){
    if(!node)return;
    if(node.nodeType===Node.TEXT_NODE){
      const parent=node.parentElement;
      if(!parent||/^(SCRIPT|STYLE|NOSCRIPT|CODE|PRE)$/i.test(parent.tagName))return;
      const next=clean(node.nodeValue);
      if(next!==node.nodeValue)node.nodeValue=next;
      return;
    }
    if(node.nodeType!==Node.ELEMENT_NODE&&node.nodeType!==Node.DOCUMENT_NODE&&node.nodeType!==Node.DOCUMENT_FRAGMENT_NODE)return;
    const root=node.nodeType===Node.ELEMENT_NODE?node:document.documentElement;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const targets=[];
    while(walker.nextNode())targets.push(walker.currentNode);
    targets.forEach(cleanNode);
  }

  function cleanAttrs(root=document){
    root.querySelectorAll?.('[aria-label],[title],[placeholder]').forEach(el=>{
      ['aria-label','title','placeholder'].forEach(attr=>{
        if(!el.hasAttribute(attr))return;
        const value=el.getAttribute(attr);
        const next=clean(value);
        if(next!==value)el.setAttribute(attr,next);
      });
    });
    root.querySelectorAll?.('meta[content]').forEach(meta=>{
      const value=meta.getAttribute('content');
      const next=clean(value);
      if(next!==value)meta.setAttribute('content',next);
    });
    const title=clean(document.title);
    if(title!==document.title)document.title=title;
  }

  function apply(root=document){
    cleanNode(root);
    cleanAttrs(root.nodeType===Node.DOCUMENT_NODE?document:root);
  }

  apply();
  const observer=new MutationObserver(records=>{
    records.forEach(record=>{
      record.addedNodes.forEach(node=>apply(node));
      if(record.type==='characterData')cleanNode(record.target);
    });
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  [250,700,1500,3000,6000].forEach(ms=>setTimeout(()=>apply(),ms));
})();