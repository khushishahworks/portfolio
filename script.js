// Loading screen: when the smile has finished turning into "Khushi", slide and shrink
// that signature onto its place in the intro headline, then hand over to the static copy.
(function(){
  var loader=document.querySelector('.t6y-loader');
  var sig=loader && loader.querySelector('.ld-sig');
  var ink=sig && sig.querySelector('.ld-ink');
  var slot=document.querySelector('.t6y-sigstatic');
  if(!ink || !slot || getComputedStyle(loader).display==='none') return;
  var finished=false;

  function done(){
    if(finished) return;
    finished=true;
    slot.classList.add('t6y-shown');
    loader.remove();
  }
  function morph(){
    var a=sig.getBoundingClientRect(), b=slot.getBoundingClientRect();
    if(!a.width || !b.width) return done();
    loader.classList.add('t6y-morph');
    sig.style.transform='translate('+(b.left-a.left)+'px,'+(b.top-a.top)+'px) scale('+(b.width/a.width)+')';
    sig.style.color=getComputedStyle(slot).color;  // the headline's gold, in either theme
    sig.addEventListener('transitionend',function(e){ if(e.propertyName==='transform') done(); });
    setTimeout(done,1300);
  }
  ink.addEventListener('animationend',function(){ setTimeout(morph,150); },{once:true});
})();

// Intro photo: tilt the layered scene toward the mouse; sway gently when the mouse
// is still or on touch screens. Only runs while the intro is on screen.
(function(){
  var scene=document.getElementById('pscene');
  if(!scene || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var intro=document.querySelector('.t6y-intro');
  var tx=0, ty=0, x=0, y=0, lastMove=-1e9, visible=true;
  window.addEventListener('pointermove',function(e){
    if(e.pointerType!=='mouse') return;
    tx=e.clientX/innerWidth-.5; ty=e.clientY/innerHeight-.5; lastMove=performance.now();
  });
  new IntersectionObserver(function(entries){ visible=entries[0].isIntersecting; }).observe(intro);
  (function tick(t){
    if(visible){
      var idle=t-lastMove>3000;
      var gx=idle?Math.sin(t*.0006)*.3:tx, gy=idle?Math.cos(t*.0005)*.2:ty;
      x+=(gx-x)*.08; y+=(gy-y)*.08;
      scene.style.transform='rotateY('+(x*28).toFixed(2)+'deg) rotateX('+(-y*22).toFixed(2)+'deg)';
    }
    requestAnimationFrame(tick);
  })(0);
})();

// Custom cursor: the dot sits on the mouse, the ring trails behind it.
// Over links the ring turns into a butter highlight; over [data-cursor] it becomes
// a dark circle showing that label ("View", "Say hi", "Hi!").
(function(){
  if(!matchMedia('(pointer: fine)').matches) return;
  var root=document.querySelector('.t6y');
  var ring=document.querySelector('.t6y-cring'), dot=document.querySelector('.t6y-cdot');
  if(!ring || !dot) return;
  var label=ring.querySelector('span');
  var follow=matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.2;
  var mx=-100, my=-100, rx=-100, ry=-100;

  window.addEventListener('pointermove',function(e){
    if(e.pointerType!=='mouse') return;
    mx=e.clientX; my=e.clientY;
    dot.style.transform='translate('+mx+'px,'+my+'px)';
    root.classList.add('t6y-cursor-on');
  });
  document.addEventListener('pointerleave',function(){ root.classList.remove('t6y-cursor-on'); });
  window.addEventListener('pointerdown',function(){ root.classList.add('t6y-cursor-down'); });
  window.addEventListener('pointerup',function(){ root.classList.remove('t6y-cursor-down'); });

  document.addEventListener('pointerover',function(e){
    if(e.target.closest('[data-cursor-plain]')){
      root.classList.remove('t6y-cursor-label','t6y-cursor-link');
      return;
    }
    var labelled=e.target.closest('[data-cursor]');
    var link=!labelled && e.target.closest('a,button');
    root.classList.toggle('t6y-cursor-label',!!labelled);
    root.classList.toggle('t6y-cursor-link',!!link);
    if(labelled) label.textContent=labelled.getAttribute('data-cursor');
  });

  // "Start a project" leans toward the mouse when it's close
  var pill=document.querySelector('.t6y-pill');
  if(pill && follow<1){
    window.addEventListener('pointermove',function(e){
      var r=pill.getBoundingClientRect(), dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
      pill.style.translate=Math.hypot(dx,dy)<r.width ? (dx*.18).toFixed(1)+'px '+(dy*.3).toFixed(1)+'px' : '';
    });
  }

  (function tick(){
    rx+=(mx-rx)*follow; ry+=(my-ry)*follow;
    ring.style.transform='translate('+rx.toFixed(1)+'px,'+ry.toFixed(1)+'px)';
    requestAnimationFrame(tick);
  })();
})();

// Dark mode: the smiley in the top bar falls asleep (eyes close, z's float up),
// the page dims and stars twinkle for a moment. The choice is remembered.
(function(){
  var btn=document.getElementById('themeToggle');
  if(!btn) return;
  var html=document.documentElement, stars=document.querySelector('.t6y-stars');
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timers=[];

  function label(){
    var dark=html.getAttribute('data-theme')==='dark';
    btn.setAttribute('aria-pressed',dark?'true':'false');
    btn.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
  }
  function twinkle(){
    if(!stars) return;
    var s='';
    for(var i=0;i<46;i++) s+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;top:'+(Math.random()*100).toFixed(1)+'%;animation-delay:'+(Math.random()*1.4).toFixed(2)+'s"></i>';
    stars.innerHTML=s;
    stars.classList.add('t6y-on');
    timers.push(setTimeout(function(){ stars.classList.remove('t6y-on'); },2200));
    timers.push(setTimeout(function(){ stars.innerHTML=''; },2900));
  }

  btn.addEventListener('click',function(){
    var dark=html.getAttribute('data-theme')!=='dark';
    timers.forEach(clearTimeout); timers=[];
    btn.classList.remove('t6y-sleeping','t6y-waking'); void btn.offsetWidth;
    if(!RM){
      html.classList.add('t6y-theming');
      timers.push(setTimeout(function(){ html.classList.remove('t6y-theming'); },1000));
      btn.classList.add(dark?'t6y-sleeping':'t6y-waking');
      if(dark) twinkle(); else if(stars){ stars.classList.remove('t6y-on'); }
    }
    html.setAttribute('data-theme',dark?'dark':'light');
    try{ localStorage.setItem('theme',dark?'dark':'light'); }catch(e){}
    label();
  });
  label();
})();

// Start the hero's entrance (headline rise, Venn diagram) once it scrolls into view.
// Each time the section leaves the screen completely, the Venn diagram is rewound,
// so it draws itself again on every visit.
(function(){
  var hero=document.getElementById('hero');
  if(!('IntersectionObserver' in window)){ hero.classList.add('t6y-play'); return; }
  var venn=hero.querySelector('.t6y-venn');
  // Watch the pinned 100vh box (not the tall header) and start as soon as it's 15% on screen,
  // so the Venn diagram is drawing while the section slides in.
  new IntersectionObserver(function(entries){
    var r=entries[0].intersectionRatio;
    if(r>=0.15) hero.classList.add('t6y-play');
    else if(r===0 && hero.classList.contains('t6y-play')){
      hero.classList.remove('t6y-play');
      if(venn && venn.getAnimations) venn.getAnimations({subtree:true}).forEach(function(a){
        if(a.timeline===document.timeline) a.currentTime=0;
      });
    }
  },{threshold:[0,0.15]}).observe(hero.querySelector('.t6y-herostick') || hero);
})();

// Story: the photo in the top bar opens a three-frame story, like an Instagram story.
// Frames move on by themselves; tap the right half to skip ahead, the left half to go back.
// The last frame stays, with the sun risen and the "Message me" link on it.
(function(){
  var btn=document.getElementById('storyBtn'), view=document.getElementById('storyView');
  if(!btn || !view) return;
  var root=document.querySelector('.t6y'), card=view.querySelector('.t6y-sv-card');
  var bars=view.querySelectorAll('.t6y-sv-bars i'), lines=view.querySelectorAll('.t6y-sv-lines p');
  var close=view.querySelector('.t6y-sv-close'), cta=view.querySelector('.t6y-sv-cta');
  var last=lines.length-1, idx=0, timer;

  function show(i){
    idx=i; clearTimeout(timer);
    card.setAttribute('data-frame',i);
    for(var j=0;j<bars.length;j++){
      bars[j].classList.remove('t6y-now'); void bars[j].offsetWidth;
      bars[j].classList.toggle('t6y-done',j<i);
      if(j===i) bars[j].classList.add('t6y-now');
      lines[j].classList.toggle('t6y-now',j===i);
    }
    if(i<last) timer=setTimeout(function(){ show(i+1); },2600);
  }
  function open(){
    view.hidden=false; root.classList.add('t6y-storyopen');
    document.documentElement.style.overflow='hidden';
    document.addEventListener('keydown',key);
    show(0); close.focus();
  }
  function shut(){
    clearTimeout(timer); view.hidden=true; root.classList.remove('t6y-storyopen');
    document.documentElement.style.overflow='';
    document.removeEventListener('keydown',key);
    btn.classList.add('t6y-seen'); btn.focus();
  }
  function key(e){
    if(e.key==='Escape') shut();
    else if(e.key==='ArrowRight' && idx<last) show(idx+1);
    else if(e.key==='ArrowLeft' && idx>0) show(idx-1);
    else if(e.key==='Tab' && idx===last){  // keep focus between the close button and the link
      e.preventDefault(); (document.activeElement===close ? cta : close).focus();
    }
    else if(e.key==='Tab'){ e.preventDefault(); close.focus(); }
  }

  btn.addEventListener('click',open);
  close.addEventListener('click',shut);
  view.addEventListener('click',function(e){
    if(e.target===view) return shut();
    if(e.target.closest('a,button')) return;
    var r=card.getBoundingClientRect(), n=e.clientX>r.left+r.width/2 ? idx+1 : idx-1;
    if(n>=0 && n<=last) show(n);
  });
})();

// Availability in the footer always shows the current month.
(function(){
  var el=document.getElementById('availMonth');
  if(el) el.textContent=new Date().toLocaleString('en-IN',{month:'long'});
})();

// Mobile menu: the hamburger opens the links in a panel under the top bar.
// Closes on a link tap, a tap elsewhere, or Esc.
(function(){
  var btn=document.getElementById('menuBtn'), nav=btn && btn.closest('.t6y-nav');
  if(!nav) return;
  function set(open){
    nav.classList.toggle('t6y-menuopen',open);
    btn.setAttribute('aria-expanded',open?'true':'false');
    btn.setAttribute('aria-label',open?'Close menu':'Open menu');
  }
  btn.addEventListener('click',function(){ set(!nav.classList.contains('t6y-menuopen')); });
  nav.querySelectorAll('.t6y-navlinks a').forEach(function(a){ a.addEventListener('click',function(){ set(false); }); });
  document.addEventListener('click',function(e){ if(!nav.contains(e.target)) set(false); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') set(false); });
})();
