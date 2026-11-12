'use strict';
// ---------- utils ----------
const $=(s,p)=>(p||document).querySelector(s);
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rnd=(a,b)=>a+Math.random()*(b-a),rint=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)],sgn=v=>v<0?-1:1;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const hex=c=>'#'+(c|0).toString(16).padStart(6,'0');
const mix=(a,b,t)=>{const r=lerp(a>>16&255,b>>16&255,t),g=lerp(a>>8&255,b>>8&255,t),bl=lerp(a&255,b&255,t);return (r<<16)|(g<<8)|bl|0;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dist=(a,b)=>Math.hypot(a.x-b.x,(a.y+a.h/2)-(b.y+b.h/2));

// ---------- save ----------
// Storage interface: get(key) -> string|null, set(key,string). Two interchangeable stores.
class LocalStore{get(k){return localStorage.getItem(k);}set(k,v){localStorage.setItem(k,v);}
  static usable(){try{localStorage.setItem('__ps_t','1');localStorage.removeItem('__ps_t');return true;}catch(e){return false;}}}
class MemoryStore{constructor(){this.m={};}get(k){return k in this.m?this.m[k]:null;}set(k,v){this.m[k]=v;}}
const SV={key:'promptsmith_lumen_v1',store:null,persistent:false,d:null,
  fresh(){return {v:1,sparks:0,cleared:{},ranks:{},track:null,loadout:[null,null,null,null],runes:[{t:'dodge',a:'shock'},{t:'kill',a:'bolts'}],tut:{},muted:false,runs:0};},
  load(){this.persistent=LocalStore.usable();this.store=this.persistent?new LocalStore():new MemoryStore();this.d=this.fresh();
    try{const s=this.store.get(this.key);if(s){const o=JSON.parse(s);if(o&&o.v===1)Object.assign(this.d,o);}}catch(e){}},
  save(){try{this.store.set(this.key,JSON.stringify(this.d));}catch(e){this.store=new MemoryStore();this.persistent=false;}},
  reset(){this.d=this.fresh();this.save();}
};

// ---------- audio (all synthesised) ----------
const AU={ctx:null,out:null,mg:null,sg:null,muted:false,song:null,step:0,next:0,nb:null,
  init(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return;}
    try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();
      this.out=this.ctx.createGain();this.out.gain.value=this.muted?0:.9;
      const cmp=this.ctx.createDynamicsCompressor();this.out.connect(cmp);cmp.connect(this.ctx.destination);
      this.mg=this.ctx.createGain();this.mg.gain.value=.34;this.mg.connect(this.out);
      this.sg=this.ctx.createGain();this.sg.gain.value=.8;this.sg.connect(this.out);
      const n=this.ctx.sampleRate*.5,b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;this.nb=b;
      setInterval(()=>this.tick(),30);
    }catch(e){this.ctx=null;}},
  setMute(m){this.muted=m;if(this.out)this.out.gain.value=m?0:.9;},
  tone(f,d,type,v,f2,dl,dest){const c=this.ctx;if(!c||this.muted||!isFinite(f)||!(d>0))return;const t=c.currentTime+(dl||0),o=c.createOscillator(),g=c.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.15,t+.008);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(dest||this.sg);o.start(t);o.stop(t+d+.02);},
  noise(d,v,fc,dl,q,dest){const c=this.ctx;if(!c||this.muted)return;const t=c.currentTime+(dl||0),s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=this.nb;f.type=q?'bandpass':'lowpass';f.frequency.value=fc||2000;if(q)f.Q.value=q;
    g.gain.setValueAtTime(v||.2,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);s.connect(f);f.connect(g);g.connect(dest||this.sg);s.start(t);s.stop(t+d+.02);},
  sfx(n,p){const T=(f,d,ty,v,f2,dl)=>this.tone(f,d,ty,v,f2,dl),N=(d,v,fc,dl,q)=>this.noise(d,v,fc,dl,q);p=p||1;
    switch(n){
      case 'swing':N(.09,.12,2600,0,2);break;
      case 'hit':N(.07,.28,1400);T(190*p,.07,'square',.12,90);break;
      case 'heavy':N(.22,.4,700);T(110,.25,'sawtooth',.2,40);break;
      case 'kill':T(520,.09,'triangle',.16,900);T(780,.12,'triangle',.12,1300,.05);N(.12,.15,3000);break;
      case 'jump':T(300,.1,'sine',.12,560);break;
      case 'dodge':N(.14,.14,1800,0,1);T(700,.1,'sine',.05,300);break;
      case 'hurt':T(180,.2,'sawtooth',.2,70);N(.15,.25,900);break;
      case 'shot':T(880*p,.09,'triangle',.12,440*p);break;
      case 'eshot':T(300,.12,'square',.06,180);break;
      case 'buff':T(440,.12,'sine',.12,660);T(660,.18,'sine',.1,990,.08);break;
      case 'pulse':T(990,.25,'sine',.12,330);N(.2,.08,5000,0,3);break;
      case 'parry':T(1400,.12,'square',.1,2100);N(.08,.2,6000);break;
      case 'clank':T(900,.05,'square',.08,700);N(.05,.15,5000,0,4);break;
      case 'charge':T(200+p*160,.12,'sawtooth',.07,260+p*160);break;
      case 'pick':T(1200,.06,'sine',.08,1700);break;
      case 'heal':T(520,.1,'sine',.12,780);T(780,.2,'sine',.1,1040,.09);break;
      case 'ui':T(660,.05,'triangle',.08,880);break;
      case 'back':T(500,.05,'triangle',.07,380);break;
      case 'good':[523,659,784,1047].forEach((f,i)=>T(f,.16,'triangle',.13,0,i*.07));break;
      case 'bad':T(220,.18,'square',.1,160);T(165,.25,'square',.1,120,.14);break;
      case 'rank':[392,523,659,784,1047,1319].forEach((f,i)=>T(f,.22,'triangle',.14,0,i*.08));N(.5,.08,6000,.4,2);break;
      case 'roar':T(90,.6,'sawtooth',.28,45);N(.6,.3,500);break;
      case 'shield':T(300,.4,'sine',.15,1200);N(.3,.1,4000,0,3);break;
      case 'shatter':N(.5,.4,5000,0,1);[1568,1319,1047,784].forEach((f,i)=>T(f,.2,'triangle',.12,0,i*.04));break;
      case 'tele':T(1200,.08,'square',.05);break;
      case 'door':T(330,.3,'triangle',.12,660);break;
      case 'spawn':T(160,.2,'sine',.1,320);break;
      case 'portal':T(220,.35,'sine',.14,880);N(.3,.08,3000,0,4);break;
      case 'die':[440,370,311,247,185].forEach((f,i)=>T(f,.3,'triangle',.15,0,i*.14));break;
      case 'win':[523,523,659,784,659,784,1047].forEach((f,i)=>T(f,.25,'triangle',.15,0,i*.12));break;
    }},
  SONGS:{
    hub:{bpm:92,root:60,sc:[0,2,4,7,9],prog:[0,3,2,4],lead:'0.2.4.2.3...2.4.5.4.2...0.2.4.7.5...4.2.4.2.0.......2.4.5.4.2...',bass:'0...0..0....0...',hat:'..x...x...x...x.',lt:'triangle',lv:.11,bv:.16},
    s1:{bpm:112,root:57,sc:[0,2,3,5,7,8,10],prog:[0,5,3,4],lead:'0...4.3.2...0...3...5.4.3...2...4...7.5.4...3...2.3.4.2.0.......',bass:'0.0...0.0.0...0.',hat:'x.x.x.x.x.x.x.xx',lt:'square',lv:.05,bv:.2},
    s2:{bpm:120,root:62,sc:[0,2,3,5,7,9,10],prog:[0,3,6,4],lead:'7.5.4.5.7...4...5.4.2.4.5...2...4.2.0.2.4...7...5.4.2.0.2.......',bass:'0..0..0.0..0..0.',hat:'x...x.x.x...x.xx',lt:'square',lv:.05,bv:.2},
    s3:{bpm:128,root:55,sc:[0,1,3,5,7,8,10],prog:[0,1,5,4],lead:'0.0.3.0.5.0.3.1.0.0.3.0.7.5.3.1.4.4.7.4.8.7.5.4.3.1.0.1.3.1.0...',bass:'0.0.0.0.0.0.0.00',hat:'x.xxx.xxx.xxx.xx',lt:'sawtooth',lv:.04,bv:.2},
    boss:{bpm:150,root:52,sc:[0,2,3,5,7,8,11],prog:[0,0,5,4],lead:'7...7.5.4...4.5.7...9.7.5...4...7...7.5.4...2.4.5.4.2.0.2.......',bass:'0.000.000.000.00',hat:'x.x.x.xxx.x.x.xx',lt:'sawtooth',lv:.05,bv:.22}
  },
  play(n){if(this.song!==n){this.song=n;this.step=0;if(this.ctx)this.next=this.ctx.currentTime+.1;}},
  nt(s,deg){const L=s.sc.length;return 440*Math.pow(2,(s.root+s.sc[((deg%L)+L)%L]+12*Math.floor(deg/L)-69)/12);},
  tick(){const c=this.ctx,s=this.SONGS[this.song];if(!c||!s||this.muted||c.state!=='running'){if(c)this.next=c.currentTime+.1;return;}
    const sd=60/s.bpm/4;if(this.next<c.currentTime)this.next=c.currentTime+.02;
    while(this.next<c.currentTime+.12){const st=this.step,bar=Math.floor(st/16)%4,i=st%16,dl=this.next-c.currentTime,ch=s.prog[bar];
      const lc=s.lead[st%64]||'.';if(lc!=='.')this.tone(this.nt(s,+lc+ch+5),sd*2.2,s.lt,s.lv,0,dl,this.mg);
      if(s.bass[i]!=='.')this.tone(this.nt(s,ch-5),sd*1.6,'triangle',s.bv,0,dl,this.mg);
      if(s.hat[i]!=='.')this.noise(.03,.05,7000,dl,3,this.mg);
      if(i===0){this.tone(this.nt(s,ch),sd*14,'sine',.05,0,dl,this.mg);this.tone(this.nt(s,ch+2),sd*14,'sine',.04,0,dl,this.mg);}
      if(this.song!=='hub'&&(i===0||i===8))this.tone(120,.12,'sine',.25,40,dl,this.mg);
      if(this.song!=='hub'&&(i===4||i===12))this.noise(.09,.1,1800,dl,0,this.mg);
      this.step++;this.next+=sd;}}
};
const buzz=ms=>{try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}};

// ---------- input ----------
const IN={mx:0,my:0,held:{},press:{},rel:{},kb:{l:0,r:0,u:0,d:0},sid:null,sx:0,sy:0,usedKb:false,
  KEYS:{KeyA:'l',ArrowLeft:'l',KeyD:'r',ArrowRight:'r',KeyS:'d',ArrowDown:'d',KeyW:'jump',ArrowUp:'jump',Space:'jump',KeyJ:'atk',KeyZ:'atk',Enter:'atk',KeyE:'atk',KeyK:'dodge',KeyX:'dodge',ShiftLeft:'dodge',ShiftRight:'dodge',KeyU:'a0',KeyI:'a1',KeyO:'a2',KeyP:'a3',Digit1:'a0',Digit2:'a1',Digit3:'a2',Digit4:'a3',Escape:'pause'},
  down(k){if(!this.held[k])this.press[k]=1;this.held[k]=1;},
  up(k){if(this.held[k])this.rel[k]=1;this.held[k]=0;},
  clear(){this.press={};this.rel={};},
  reset(){this.held={};this.press={};this.rel={};this.kb={l:0,r:0,u:0,d:0};this.mx=0;this.my=0;this.sid=null;$('#stick').classList.remove('live');const k=$('#stick i');k.style.transform='';},
  init(){
    const typing=e=>e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA');
    addEventListener('keydown',e=>{if(typing(e))return;const k=this.KEYS[e.code];if(!k)return;e.preventDefault();if(!this.usedKb){this.usedKb=true;document.body.classList.add('kb');}
      if(k==='l'||k==='r'||k==='d'){this.kb[k]=1;this.kmx();}else if(!e.repeat)this.down(k);});
    addEventListener('keyup',e=>{const k=this.KEYS[e.code];if(!k)return;if(k==='l'||k==='r'||k==='d'){this.kb[k]=0;this.kmx();}else this.up(k);});
    addEventListener('blur',()=>this.reset());
    const z=$('#stickzone'),st=$('#stick'),kn=$('#stick i');
    const mv=e=>{let dx=e.clientX-this.sx,dy=e.clientY-this.sy;const m=Math.hypot(dx,dy),R=46;if(m>R){dx*=R/m;dy*=R/m;}kn.style.transform=`translate(${dx}px,${dy}px)`;this.mx=Math.abs(dx)<9?0:clamp(dx/34,-1,1);this.my=dy>26?1:dy<-26?-1:0;};
    z.addEventListener('pointerdown',e=>{if(this.sid!==null)return;this.sid=e.pointerId;this.sx=e.clientX;this.sy=e.clientY;try{z.setPointerCapture(e.pointerId);}catch(_){}
      st.classList.add('live');st.style.left=e.clientX+'px';st.style.top=(e.clientY-z.getBoundingClientRect().top)+'px';mv(e);e.preventDefault();});
    z.addEventListener('pointermove',e=>{if(e.pointerId===this.sid)mv(e);});
    const end=e=>{if(e.pointerId!==this.sid)return;this.sid=null;this.mx=0;this.my=0;kn.style.transform='';st.classList.remove('live');st.style.left='';st.style.top='';};
    z.addEventListener('pointerup',end);z.addEventListener('pointercancel',end);
    document.querySelectorAll('.tb').forEach(b=>{const k=b.dataset.k;
      b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch(_){}b.classList.add('on');this.down(k);});
      const up=e=>{b.classList.remove('on');this.up(k);};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);
      b.addEventListener('contextmenu',e=>e.preventDefault());});
    addEventListener('contextmenu',e=>{if(!typing(e))e.preventDefault();});
  },
  kmx(){this.mx=(this.kb.r?1:0)-(this.kb.l?1:0);this.my=this.kb.d?1:0;}
};
