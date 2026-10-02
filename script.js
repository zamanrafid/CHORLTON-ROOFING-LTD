// Chorlton Roofing LTD — interactions v1.1
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header=$('header.site'), toTop=$('#toTop');
  const setHH=()=>document.documentElement.style.setProperty('--hh',(header?header.offsetHeight:64)+'px');
  setHH(); addEventListener('resize',setHH,{passive:true});
  let ticking=false;
  const onScroll=()=>{ if(ticking) return; ticking=true;
    requestAnimationFrame(()=>{ const y=scrollY;
      header&&header.classList.toggle('scrolled',y>10);
      toTop&&toTop.classList.toggle('show',y>600);
      ticking=false; setHH(); }); };
  addEventListener('scroll',onScroll,{passive:true}); onScroll();
  toTop&&toTop.addEventListener('click',()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'}));

  // Drawer
  const burger=$('#burger'), drawer=$('#drawer');
  if(burger&&drawer){
    const setOpen=o=>{ drawer.classList.toggle('open',o); document.body.classList.toggle('lock',o);
      burger.setAttribute('aria-expanded',o);
      if(o){ const f=$('button[data-close]',drawer); f&&setTimeout(()=>f.focus(),50); } else burger.focus({preventScroll:true}); };
    burger.addEventListener('click',()=>setOpen(true));
    drawer.addEventListener('click',e=>{ if(e.target.closest('[data-close]')) setOpen(false); });
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&drawer.classList.contains('open')) setOpen(false); });
    matchMedia('(min-width:1201px)').addEventListener('change',e=>{ if(e.matches) setOpen(false); });
  }

  // Scroll-spy
  const links=$$('.nav-links a, .drawer-panel a.dlink');
  const spy=new IntersectionObserver(es=>es.forEach(en=>{
    if(!en.isIntersecting) return;
    links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+en.target.id));
  }),{rootMargin:'-45% 0px -50% 0px'});
  ['home','about','services','residential','commercial','projects','reviews','contact'].forEach(id=>{ const s=document.getElementById(id); s&&spy.observe(s); });

  // Reveal
  const reveals=$$('.reveal,.reveal-l,.reveal-r');
  if(reduce){ reveals.forEach(e=>e.classList.add('in')); }
  else{
    const io=new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target);} }),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    reveals.forEach((el,i)=>{ el.style.transitionDelay=(i%3)*70+'ms'; io.observe(el); });
  }

  // Counters
  const fmt=(n,d)=>d?n.toFixed(1):Math.round(n).toLocaleString('en-GB');
  const cio=new IntersectionObserver(es=>es.forEach(en=>{
    if(!en.isIntersecting) return;
    const el=en.target; cio.unobserve(el);
    const target=parseFloat(el.dataset.count), suffix=el.dataset.suffix||'', dec=target%1!==0;
    if(reduce){ el.textContent=fmt(target,dec)+suffix; return; }
    const t0=performance.now(), dur=1600;
    const tick=t=>{ const p=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-p,4);
      el.textContent=fmt(target*e,dec)+suffix; if(p<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }),{threshold:.5});
  $$('[data-count]').forEach(c=>cio.observe(c));

  // Lightbox
  const lb=$('#lightbox'), lbImg=$('#lightboxImg'), figs=$$('[data-lightbox]'); let cur=0;
  if(lb&&lbImg){
    const show=i=>{ cur=(i+figs.length)%figs.length; const img=$('img',figs[cur]); lbImg.src=img.src.replace('w=800','w=1400'); lbImg.alt=img.alt; };
    const openLb=i=>{ show(i); lb.classList.add('open'); document.body.classList.add('lock'); $('.lb-close',lb).focus(); };
    const closeLb=()=>{ lb.classList.remove('open'); document.body.classList.remove('lock'); };
    figs.forEach((f,i)=>{ f.tabIndex=0; f.setAttribute('role','button'); f.setAttribute('aria-label','Zoom: '+($('img',f).alt||'project photo'));
      f.addEventListener('click',()=>openLb(i));
      f.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openLb(i);} }); });
    lb.addEventListener('click',e=>{ if(e.target!==lbImg) closeLb(); });
    addEventListener('keydown',e=>{ if(!lb.classList.contains('open')) return;
      if(e.key==='Escape') closeLb(); if(e.key==='ArrowRight') show(cur+1); if(e.key==='ArrowLeft') show(cur-1); });
    let sx=0;
    lb.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
    lb.addEventListener('touchend',e=>{ const d=e.changedTouches[0].clientX-sx; if(Math.abs(d)>50) show(cur+(d<0?1:-1)); });
  }

  // FAQ
  const faqSearch=$('#faqSearch');
  if(faqSearch){
    const box=$('.faq'), empty=document.createElement('p'); empty.className='faq-empty';
    empty.textContent='No match. Call 0161 555 0132 and we will answer it.'; box.appendChild(empty);
    faqSearch.addEventListener('input',()=>{ const q=faqSearch.value.trim().toLowerCase(); let n=0;
      $$('.faq details').forEach(d=>{ const ok=d.textContent.toLowerCase().includes(q); d.style.display=ok?'':'none'; if(ok) n++; });
      empty.style.display=n?'none':'block'; });
    $$('.faq details').forEach(d=>d.addEventListener('toggle',()=>{ if(d.open) $$('.faq details').forEach(o=>{ if(o!==d) o.open=false; }); }));
  }

  // Forms
  $$('form[data-quote]').forEach(form=>{
    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }
      const btn=$('button',form), label=btn.innerHTML, alert=$('.alert',form), data=Object.fromEntries(new FormData(form));
      btn.disabled=true; btn.textContent='Sending…';
      setTimeout(()=>{
        btn.disabled=false; btn.innerHTML=label;
        const wa='https://wa.me/447700900123?text='+encodeURIComponent('Hi Chorlton Roofing, quote request'+(data.service?' ('+data.service+')':'')+', postcode '+(data.postcode||'')+(data.name?', '+data.name:''));
        alert.innerHTML='Thanks! Your free quote request is in. We reply within 60 minutes (8am–6pm). <a href="'+wa+'" target="_blank" rel="noopener" style="text-decoration:underline">Send photos on WhatsApp</a>';
        alert.style.display='block'; form.reset();
        setTimeout(()=>{ alert.style.display='none'; },9000);
      },700);
    });
  });

  // Tap-to-use map (stops iframe trapping page scroll on touch)
  const map=$('.map'); map&&map.addEventListener('click',()=>map.classList.add('active')); // tap to use
  const y=$('#year'); if(y) y.textContent=new Date().getFullYear();
})();
