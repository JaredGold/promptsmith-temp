// ---------- ability registry ----------
// ABILITY[id] = {id,name,color,shape,kind:'active'|'toggle'|'passive',track,blurb,ranks:[I,II,III],
//   cd(rank), press(p,rank)->started?, hold(p,rank,dt), release(p,rank), update(p,rank,dt), draw(ctx,p,rank), label(p)}
// Abilities talk to the game only through C (combat interface), G.mod (boons) and FX/AU.
const ABILITY={},AB_ORDER=[];
function ability(a){ABILITY[a.id]=Object.assign({kind:'active',track:null,cd:()=>1,press(){return true;},hold(){},release(){},update(){},draw(){},label(){return '';}},a);AB_ORDER.push(a.id);}
const ast=(p,id)=>p.ab[id]||(p.ab[id]={});
const aim=(p,t,spread)=>{let a=p.face>0?0:Math.PI;if(t)a=Math.atan2(t.y+t.h/2-(p.y+.9),t.x-p.x);a+=spread||0;return [Math.cos(a),Math.sin(a)];};
const SHARED=['clear','context','examples','format','role','think','iterate','verify','critique'];
const TRACKS={W:{name:'Writer',mentor:'Quill',col:0xf7a8ff,abs:['audience','outline','edit']},A:{name:'Analyst',mentor:'Tally',col:0x5eead4,abs:['tags','quotes','unknown']},B:{name:'Builder',mentor:'Rivet',col:0x7cff8a,abs:['agents','skills','connect']}};

ability({id:'clear',name:'Clear Ask',color:0x4fd8ff,shape:'diamond',blurb:'A precise shot at the nearest foe.',ranks:['Aimed shot. Wisps take double.','The shot pierces.','Hits the weak point: big crits.'],cd:()=>1.3,
  press(p,r){const n=G.mod.b.clear3?3:1,t=C.nearest(p.x,p.y+.8,14),dmg=15+r*3;if(t)p.face=sgn(t.x-p.x)||p.face;
    for(let i=0;i<n;i++){const d=aim(p,t,n>1?(i-1)*.2:0);C.shot({x:p.x+d[0]*.6,y:p.y+.9+d[1]*.6,vx:d[0]*25,vy:d[1]*25,dmg,c:this.color,shape:'diamond',size:.34,pierce:r>=2?1:0,o:{ab:'clear',precise:true,crit:r>=3?1.7:0}});}
    AU.sfx('shot');p.swing=p.swingM=.14;C.attacked(p,dmg);return true;}});

ability({id:'context',name:'Context',color:0xffb02e,shape:'ring',blurb:'An aura that powers every attack.',ranks:['6s aura: attacks +50%.','Lasts longer. Your shots home in.','Foes inside the aura are slowed.'],cd:()=>12,
  press(p,r){const s=ast(p,'context');s.t=(r>=2?9:6)*(G.mod.b.ctxLong?2:1);AU.sfx('buff');FX.ring(p.x,p.y+.8,this.color,3.5,.5,.2);return true;},
  update(p,r,dt){const s=ast(p,'context');if(!(s.t>0))return;s.t-=dt;R.light(p.x,p.y+1,this.color,1.1,8);
    if(r>=3)for(const e of C.foes())if(!e.dead&&Math.abs(e.x-p.x)<3.5&&Math.abs(e.y-p.y)<4)e.slow=Math.max(e.slow,.2);},
  draw(ctx,p){const s=ast(p,'context');if(!(s.t>0))return;const a=Math.min(1,s.t),x=R.px(p.x),y=R.py(p.y+.8),k=R.k;ctx.globalCompositeOperation='lighter';FX.glow(ctx,p.x,p.y+.8,3.6,this.color,.22*a);
    ctx.strokeStyle='#FFB02E';ctx.globalAlpha=.7*a;ctx.lineWidth=3;ctx.setLineDash([k*.5,k*.35]);ctx.lineDashOffset=-G.t*40;ctx.beginPath();ctx.ellipse(x,y,3.5*k,1.1*k,0,0,6.283);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';},
  label(p){const s=ast(p,'context');return s.t>0?Math.ceil(s.t)+'s':'';}});
C.outMul.push((e,o,p)=>ast(p,'context').t>0?1.5:1);
C.onShot.push(s=>{if(s.team==='p'&&!s.home&&rk('context')>=2&&G.p&&ast(G.p,'context').t>0)s.home=7;});
C.onHit.push((e,d,o,p)=>{if(G.mod.b.ground&&ast(p,'context').t>0)C.heal(1,true);});

ability({id:'examples',name:'Examples',color:0xb388ff,shape:'tri',blurb:'Echoes copy your attacks.',ranks:['One echo for 5s.','Three echoes.','Five echoes that pick different foes.'],cd:()=>13,
  press(p){ast(p,'examples').t=5;AU.sfx('buff');FX.ring(p.x,p.y+.8,this.color,2,.4);return true;},
  update(p,r,dt){const s=ast(p,'examples');if(s.t>0)s.t-=dt;},
  draw(ctx,p,r){const s=ast(p,'examples');if(!(s.t>0))return;const n=[0,1,3,5][r];ctx.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const a=G.t*2.5+i*6.283/n;FX.sh(ctx,'tri',p.x+Math.cos(a)*1.1,p.y+1+Math.sin(a)*.5,.22,a,this.color,.8);}ctx.globalCompositeOperation='source-over';},
  label(p){const s=ast(p,'examples');return s.t>0?Math.ceil(s.t)+'s':'';}});
C.onAttack.push((p,dmg)=>{const s=ast(p,'examples'),r=rk('examples');if(!(s.t>0)||!r)return;const n=[0,1,3,5][r],used=[];
  for(let i=0;i<n;i++){let t=r>=3?C.nearest(p.x,p.y+.8,12,e=>!used.includes(e)):null;if(!t)t=C.nearest(p.x,p.y+.8,12);if(t)used.push(t);const d=aim(p,t,(i-(n-1)/2)*.3);
    C.shot({x:p.x-p.face*.3,y:p.y+1.2,vx:d[0]*16,vy:d[1]*16,dmg:Math.max(2,dmg*.4),c:0xb388ff,shape:'tri',size:.28,home:r>=3?10:6,tgt:t,delay:.06+i*.07,life:1.1,o:{ab:'examples',noStop:true},
      onHit:G.mod.b.echoBoom?(q)=>{C.area(q.x,q.y,1.5,5,{ab:'examples',noStop:true,c:0xb388ff});FX.ring(q.x,q.y,0xb388ff,1.5,.3);}:null});}});

// Format reshapes the basic attack by adding forms to the FORMS registry.
const beam=(ctx,z)=>{const a=1-z.t/z.life;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.strokeStyle='#37E2B8';ctx.lineCap='round';ctx.lineWidth=R.k*.34*a+2;ctx.beginPath();ctx.moveTo(R.px(z.x),R.py(z.y));ctx.lineTo(R.px(z.x2),R.py(z.y));ctx.stroke();ctx.globalAlpha=a*.35;ctx.lineWidth=R.k*.9*a;ctx.stroke();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';};
const FORM_EXTRA=[{name:'Line',fire(p,dmg,fin){const L=(fin?7:5.6)*(G.mod.b.wide?1.3:1),f=p.face,l=C.box(p.x,p.x+f*L,p.y+.35,p.y+1.45,dmg*.9,{ab:'format',shaped:true,precise:true,heavy:fin,kx:f*(fin?9:3),c:0x37e2b8});if(!l.length)AU.sfx('swing');C.zone({life:.16,x:p.x+f*.4,x2:p.x+f*L,y:p.y+.9,draw:beam});}},
  {name:'Fan',fire(p,dmg,fin){const n=fin?5:3;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.28,f=p.face;C.shot({x:p.x+f*.5,y:p.y+.9,vx:Math.cos(a)*16*f,vy:Math.sin(a)*16,dmg:dmg*.5,c:0x37e2b8,shape:'bracket',size:.24,life:.3*(G.mod.b.wide?1.3:1),float:true,o:{ab:'format',shaped:true,heavy:fin&&i===2,noStop:i>0}});}AU.sfx('swing');}},
  {name:'Ring',fire(p,dmg,fin){const r=(fin?3.2:2.5)*(G.mod.b.wide?1.3:1),l=C.area(p.x,p.y+.8,r,dmg*.8,{ab:'format',shaped:true,heavy:fin,kr:fin?9:4,ky:3,c:0x37e2b8});if(!l.length)AU.sfx('swing');FX.ring(p.x,p.y+.8,0x37e2b8,r,.22,.2);}}];
ability({id:'format',name:'Format',color:0x37e2b8,shape:'bracket',kind:'toggle',blurb:'Reshape your hammer swing.',ranks:['Swing, Line or Fan.','Adds Ring.','Shaped hits tag foes: +20% damage.'],cd:()=>.25,
  press(p,r){while(FORMS.length<4)FORMS.push(FORM_EXTRA[FORMS.length-1]);p.form=(p.form+1)%(r>=2?4:3);AU.sfx('ui');FX.num(p.x,p.y+2.3,FORMS[p.form].name,'#37E2B8',.9);return true;},
  label(p){return (FORMS[p.form]||FORMS[0]).name;}});
C.onHit.push((e,d,o)=>{if(o.shaped&&rk('format')>=3)e.tag=Math.max(e.tag,4);});

const STANCE=['Striker','Guardian','Scout'],STANCE_C=[0xff5d73,0x4fd8ff,0xc6f432];
ability({id:'role',name:'Role',color:0xff7ab6,shape:'chev',kind:'toggle',blurb:'Switch stance to fit the job.',ranks:['Striker +25% damage, or Guardian -45% harm.','Adds Scout: fast, quick dodge.','Each switch fires a burst.'],cd:()=>.8,
  press(p,r){p.stance=((p.stance||0)+1)%(r>=2?3:2);AU.sfx('buff');FX.num(p.x,p.y+2.3,STANCE[p.stance],hex(STANCE_C[p.stance]),.9);FX.ring(p.x,p.y+.8,STANCE_C[p.stance],1.6,.3);
    if(r>=3||G.mod.b.stanceWave){const big=G.mod.b.stanceWave;C.area(p.x,p.y+.8,big?3.6:2.6,big?20:12,{ab:'role',kr:8,ky:4,c:this.color});FX.ring(p.x,p.y+.8,this.color,big?3.6:2.6,.35,.25);}return true;},
  update(p){const s=p.stance||0;if(s===2){p.spd=1.3;p.dcdMul=.5;}},
  draw(ctx,p){FX.sh(ctx,'chev',p.x,p.y+2.45,.14,0,STANCE_C[p.stance||0],.9);},
  label(p){return STANCE[p.stance||0];}});
C.outMul.push((e,o,p)=>rk('role')&&(p.stance||0)===0?1.25:1);
C.onHurt.push((p,dmg)=>rk('role')&&p.stance===1?dmg*.55:undefined);

ability({id:'think',name:'Think Step by Step',color:0x7c9bff,shape:'hex',blurb:'Hold to charge, release a heavy hit.',ranks:['Charge 3 steps. You stand still.','Move while you charge.','A 4th "check" step that crits.'],cd:()=>3,
  press(p){const s=ast(p,'think');s.on=true;s.c=0;s.step=0;p.charging=true;return false;},
  hold(p,r,dt){const s=ast(p,'think');if(!s.on)return;const max=r>=3?4:3;s.c=Math.min(max,s.c+dt/(.42/(G.mod.b.thinkFast?2:1)));const stp=Math.floor(s.c);
    if(stp>s.step){s.step=stp;AU.sfx('charge',stp);FX.ring(p.x,p.y+.8,this.color,.8+stp*.3,.3);}if(r<2)p.root=.06;else p.spd*=.7;R.light(p.x,p.y+1.5,this.color,.4+s.c*.3,7);},
  release(p,r){const s=ast(p,'think');if(!s.on)return;s.on=false;p.charging=false;const stp=Math.floor(s.c);if(stp<1){p.cd.think=.3;return;}
    const dmg=[0,14,30,52,56][stp],x=p.x+p.face*1.5,rad=1.8+stp*.4;p.swing=p.swingM=.26;
    C.area(x,p.y+.5,rad,dmg,{ab:'think',heavy:true,crit:stp>=4?1.8:0,kr:11,ky:7,c:this.color});FX.ring(x,p.y+.3,this.color,rad,.4,.3);FX.burst(x,p.y+.2,this.color,16,9,{up:4});AU.sfx('heavy');R.cam.shake=Math.max(R.cam.shake,.2+stp*.08);G.punch(1.1,.25);
    C.attacked(p,dmg*.5,true);p.cd.think=this.cd(r)*G.mod.cd;},
  update(p){const s=ast(p,'think');if(s.on&&!IN.held['a'+SV.d.loadout.indexOf('think')])this.release(p,rk('think'));},
  draw(ctx,p,r){const s=ast(p,'think');if(!s.on)return;const max=r>=3?4:3;ctx.globalCompositeOperation='lighter';for(let i=0;i<max;i++){const on=i<s.step,x=p.x+(i-(max-1)/2)*.5;FX.sh(ctx,'hex',x,p.y+2.5,on?.2:.12,0,i===3?0xffc53d:this.color,on?1:.35);}
    FX.glow(ctx,p.x,p.y+1,.6+s.c*.5,this.color,.5);ctx.globalCompositeOperation='source-over';}});

ability({id:'iterate',name:'Iterate',color:0xff8a3d,shape:'arc',kind:'passive',blurb:'Chain hammer hits into a finisher.',ranks:['3-hit chain with a heavy finisher.','4-hit chain.','5-hit chain.'],
  draw(ctx,p,r){if(p.combo<1)return;const max=r+2;for(let i=0;i<max;i++)FX.sh(ctx,'dot',p.x+(i-(max-1)/2)*.28,p.y+2.15,i<p.combo?.09:.05,0,this.color,i<p.combo?1:.4);}});
C.onAttack.push((p,dmg,fin)=>{if(fin&&G.mod.b.chainWave&&rk('iterate'))C.shot({x:p.x+p.face,y:p.y+.7,vx:p.face*15,vy:0,dmg:dmg*.6,c:0xff8a3d,shape:'arc',size:.6,r:.7,pierce:1,life:.7,float:true,o:{ab:'iterate',heavy:true}});});

ability({id:'verify',name:'Verify',color:0xc6f432,shape:'check',blurb:'A pulse that unmasks and marks foes.',ranks:['Unmasks Mimics. Marked foes take +25%.','Also stuns.','Also wipes enemy shots.'],cd:()=>7,
  press(p,r){const rad=5.5;AU.sfx('pulse');FX.ring(p.x,p.y+.8,this.color,rad,.5,.22);
    for(const e of C.foes().slice()){if(e.dead||Math.hypot(e.x-p.x,e.y-p.y)>rad)continue;if(e.decoy){C.kill(e,{});continue;}e.mark=8;e.verified=true;if(e.def.onVerify)e.def.onVerify(e);if(r>=2&&!e.boss)e.stun=Math.max(e.stun,1.2);FX.burst(e.x,e.y+e.h/2,this.color,6,4);}
    if(r>=3)for(const s of G.w.shots)if(s.team==='e'&&Math.hypot(s.x-p.x,s.y-p.y)<rad){s.t=s.life+1;FX.burst(s.x,s.y,this.color,4,3);}return true;}});

ability({id:'critique',name:'Critique',color:0xff5d73,shape:'x',blurb:'A parry that turns hits back.',ranks:['Short window: reflect shots and blows.','Longer window, double damage back.','A good parry resets your cooldowns.'],cd:()=>4,
  press(p,r){ast(p,'critique').t=r>=2?.55:.36;AU.sfx('swing');return true;},
  update(p,r,dt){const s=ast(p,'critique');if(s.t>0)s.t-=dt;},
  draw(ctx,p){const s=ast(p,'critique');if(!(s.t>0))return;ctx.globalCompositeOperation='lighter';FX.glow(ctx,p.x+p.face*.5,p.y+.9,1.3,this.color,.6);FX.sh(ctx,'x',p.x+p.face*.6,p.y+.9,.5,G.t*3,this.color,.9);ctx.globalCompositeOperation='source-over';}});
C.onHurt.unshift((p,dmg,src)=>{const s=ast(p,'critique'),r=rk('critique');if(!(s.t>0)||!r)return;const mult=(r>=2?2:1)*(G.mod.b.reflect3?3:1);
  AU.sfx('parry');FX.ring(p.x,p.y+.9,0xff5d73,1.8,.3,.25);G.stop=Math.max(G.stop,.1);R.cam.shake=Math.max(R.cam.shake,.3);buzz(30);p.inv=Math.max(p.inv,.45);FX.num(p.x,p.y+2.3,'Turned back!','#FF5D73',1);
  if(src&&src.team==='e'){src.team='p';src.vx*=-1.4;src.vy*=-1;src.dmg=Math.max(8,src.dmg*1.5)*mult;src.c=0xff5d73;src.t=0;src.home=8;src.o={ab:'critique',heavy:true};src.tgt=src.src&&!src.src.dead?src.src:null;}
  else if(src&&src.def){C.hit(src,14*mult,{ab:'critique',heavy:true,kx:sgn(src.x-p.x)*10,ky:5,c:0xff5d73});if(!src.boss)src.stun=Math.max(src.stun,1.2);}
  if(r>=3)for(const k in p.cd)if(k!=='critique')p.cd[k]=0;G.punch(1.1,.25);return true;});

// ----- Writer -----
ability({id:'audience',name:'Audience',color:0xf7a8ff,shape:'wave',track:'W',blurb:'A wave tuned to its listeners.',ranks:['Piercing wave that slows.','The wave comes back.','Tuned foes take +30%.'],cd:()=>5,
  press(p,r){const big=G.mod.b.audWide?1.6:1;C.shot({x:p.x+p.face*.6,y:p.y+.9,vx:p.face*13,vy:0,dmg:12+r*2,c:this.color,shape:'wave',size:.7*big,r:.8*big,pierce:1,life:r>=2?1.1:.9,float:true,o:{ab:'audience',slowT:3,tune:r>=3},
    upd:r>=2?(s)=>{if(!s.back&&s.t>.5){s.back=1;s.vx*=-1;s.hitSet.clear();}}:null});AU.sfx('shot',.6);p.swing=p.swingM=.14;return true;}});
ability({id:'outline',name:'Outline',color:0x2ec4b6,shape:'bars',track:'W',blurb:'Mark the spots, then pillars erupt in order.',ranks:['3 pillars in a row.','4 pillars that seek foes.','A huge final pillar.'],cd:()=>6,
  press(p,r){const n=r>=2?4:3,xs=[],c=this.color;if(r>=2){const l=C.foes().filter(e=>!e.dead&&!e.disg&&Math.abs(e.x-p.x)<11).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));for(const e of l)if(xs.length<n)xs.push(e.x);}
    for(let i=xs.length;i<n;i++)xs.push(p.x+p.face*(1.7+i*1.8));
    xs.forEach((x,i)=>{const big=r>=3&&i===n-1,w=big?1.2:.65,h=big?5:3.4;C.tele({kind:'rect',ally:true,c,x0:x-w,x1:x+w,y0:0,y1:h,m:.4+i*.22,fire(){C.box(x-w,x+w,0,h,(16+r*2)*(big?2.5:1)*(G.mod.b.outHard?1.5:1),{ab:'outline',heavy:big,ky:9,c});AU.sfx(big?'heavy':'hit',.7);FX.burst(x,.2,c,big?18:8,9,{dir:1.57,spread:.3});C.zone({life:.25,draw(ctx,z){const a=1-z.t/z.life;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;ctx.fillStyle=hex(c);ctx.fillRect(R.px(x-w*a),R.py(h),w*2*a*R.k,h*R.k);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}});}});});
    AU.sfx('tele');return true;}});
ability({id:'edit',name:'Edit',color:0xff3b5c,shape:'slash',track:'W',blurb:'A cut that finishes weak foes.',ranks:['Cuts foes below 20% health.','Below 25%.','Below 30%.'],cd:()=>4,
  press(p,r){const thr=[0,.2,.25,.3][r],f=p.face,l=C.inBox(p.x-f*.3,p.x+f*3.2,p.y-.3,p.y+2.4);p.vx=f*12;p.swing=p.swingM=.16;AU.sfx('swing');C.zone({life:.18,x:p.x,y:p.y+.9,f,r:3.2,fin:true,c:'#FF3B5C',draw:drawArc});
    for(const e of l){if(!e.boss&&!e.anch&&e.hp/e.mhp<=thr&&e.inv<=0){FX.num(e.x,e.y+e.h+.7,'Cut!','#FF3B5C',1.3);if(G.mod.b.redPen)C.heal(5);e.hp=0;C.kill(e,{heavy:true,ab:'edit'});G.stop=.1;}
      else C.hit(e,(14+r*2)*(1+(1-e.hp/e.mhp)*(e.boss?.8:1.2)),{ab:'edit',precise:true,kx:f*5,c:this.color});}return true;}});
// ----- Analyst -----
ability({id:'tags',name:'XML Tags',color:0x5eead4,shape:'tag',track:'A',blurb:'A bracket trap that pulls foes together.',ranks:['Pull and tag: tagged foes take +20%.','A wider trap.','Tagged foes share damage.'],cd:()=>8,
  press(p,r){const c=this.color,rad=r>=2?4.5:3;AU.sfx('portal');C.zone({x:clamp(p.x+p.face*3,G.w.x0+1,G.w.x1-1),y:1,r:rad,life:2.5*(G.mod.b.tagLong?2:1),
    upd(z){for(const e of C.foes()){if(e.dead||e.disg)continue;const dx=z.x-e.x;if(Math.abs(dx)<z.r&&Math.abs(e.y-z.y)<4.5){e.tag=5;if(r>=3)e.share=5;if(!e.boss&&!e.anch)e.kx=clamp(dx,-1,1)*5;}}},
    draw(ctx,z){const a=Math.min(1,(z.life-z.t)*2),g=z.r*(1-.5*Math.min(1,z.t/.6));ctx.globalCompositeOperation='lighter';for(const s of[-1,1])FX.sh(ctx,'tag',z.x+s*g*.5,z.y+.4,1.1,0,c,a*.8);FX.glow(ctx,z.x,z.y,z.r*.8,c,.18*a);ctx.globalCompositeOperation='source-over';}});return true;}});
C.onHit.push((e,d,o)=>{if(e.share>0&&!o.shared&&rk('tags')>=3)for(const q of C.foes())if(q!==e&&!q.dead&&q.share>0)C.hit(q,Math.max(1,d*.4),{shared:true,noStop:true,c:0x5eead4,ab:'tags'});});
ability({id:'quotes',name:'Quote First',color:0xffe28a,shape:'quote',track:'A',blurb:'Pull quotes from a foe, then fire them.',ranks:['A strike pulls 2 quote shards.','3 shards.','4 shards.'],cd:()=>5,
  press(p,r){const f=p.face,l=C.box(p.x-f*.3,p.x+f*2.4,p.y-.3,p.y+2.3,10,{ab:'quotes',precise:true,kx:f*3,c:this.color});p.swing=p.swingM=.16;
    if(!l.length){AU.sfx('swing');p.cd.quotes=.8;return false;}ast(p,'quotes').n=[0,2,3,4][r]+(G.mod.b.quoteMore?2:0);AU.sfx('pick');return true;},
  draw(ctx,p){const n=ast(p,'quotes').n||0;ctx.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const a=G.t*3+i*6.283/n;FX.sh(ctx,'quote',p.x+Math.cos(a)*.9,p.y+1+Math.sin(a)*.6,.16,0,this.color,.95);}ctx.globalCompositeOperation='source-over';},
  label(p){const n=ast(p,'quotes').n;return n?n+' held':'';}});
C.onAttack.push(p=>{const s=ast(p,'quotes');if(!s.n)return;for(let i=0;i<s.n;i++){const d=aim(p,null,(i-(s.n-1)/2)*.4+(p.face>0?.5:-.5));C.shot({x:p.x,y:p.y+1.2,vx:d[0]*15,vy:d[1]*15,dmg:12,c:0xffe28a,shape:'quote',size:.2,home:9,life:1.4,delay:i*.05,o:{ab:'quotes',precise:true,noStop:true}});}s.n=0;AU.sfx('shot',1.4);});
ability({id:'unknown',name:'Say "I Don\'t Know"',color:0x9db4ff,shape:'q',track:'A',blurb:'A calm dome where wild shots dissolve.',ranks:['Enemy shots dissolve inside.','Unmasks Mimics inside.','Your hits from inside: +25%.'],cd:()=>10,
  press(p,r){const c=this.color;AU.sfx('shield');G.w.dome=C.zone({x:p.x,y:0,r:3.5,life:5,
    upd(z,dt){for(const s of G.w.shots)if(s.team==='e'&&Math.hypot(s.x-z.x,s.y-z.y)<z.r){s.t=s.life+1;FX.burst(s.x,s.y,c,4,3);}
      if(r>=2)for(const e of C.foes())if(e.disg&&Math.abs(e.x-z.x)<z.r&&e.def.onVerify){e.verified=true;e.mark=8;e.def.onVerify(e);}
      if(G.mod.b.calm&&Math.abs(G.p.x-z.x)<z.r){z.h=(z.h||0)+dt*2;if(z.h>=1){z.h=0;C.heal(1,true);}}},
    draw(ctx,z){const a=Math.min(1,(z.life-z.t)*2),x=R.px(z.x),y=R.py(0),k=R.k;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.16*a;ctx.fillStyle=hex(c);ctx.beginPath();ctx.arc(x,y,z.r*k,Math.PI,0);ctx.fill();ctx.globalAlpha=.8*a;ctx.strokeStyle=hex(c);ctx.lineWidth=3;ctx.stroke();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}});return true;}});
C.outMul.push((e,o,p)=>{const z=G.w.dome;return z&&z.t<z.life&&rk('unknown')>=3&&Math.abs(p.x-z.x)<z.r?1.25:1;});
// ----- Builder -----
const BOT_JOBS=[{job:'Strike',c:0xff5d73},{job:'Guard',c:0x4fd8ff},{job:'Fetch',c:0xffc53d}];
ability({id:'agents',name:'Sub-agents',color:0x7cff8a,shape:'bot',track:'B',blurb:'Helpers, each with one clear job.',ranks:['A Strike bot for 14s.','Adds a Guard bot that blocks shots.','Adds a Fetch bot that brings pickups.'],cd:()=>20,
  press(p,r){const c=this.color,fast=G.mod.b.botFast?.5:1;AU.sfx('portal');const bots=BOT_JOBS.slice(0,r).map((b,i)=>({j:b.job,c:b.c,x:p.x,y:p.y+2,t:rnd(0,1),i}));
    C.zone({life:14,bots,upd(z,dt){const p=G.p;for(const b of z.bots){const a=G.t*1.5+b.i*2.1,tx=p.x-p.face*(.9+b.i*.5)+Math.cos(a)*.3,ty=p.y+2.1+Math.sin(a)*.25+b.i*.3;b.x=lerp(b.x,tx,Math.min(1,dt*6));b.y=lerp(b.y,ty,Math.min(1,dt*6));b.t-=dt;
        if(b.j==='Strike'&&b.t<=0){const t=C.nearest(b.x,b.y,10);if(t){b.t=1.1*fast;const dx=t.x-b.x,dy=t.y+t.h/2-b.y,d=Math.hypot(dx,dy)||1;C.shot({x:b.x,y:b.y,vx:dx/d*18,vy:dy/d*18,dmg:6+r,c:b.c,size:.18,o:{ab:'agents',noStop:true}});AU.sfx('shot',1.6);}}
        if(b.j==='Guard'&&b.t<=0)for(const s of G.w.shots)if(s.team==='e'&&Math.hypot(s.x-p.x,s.y-p.y-.8)<1.9){s.t=s.life+1;b.t=2.2*fast;FX.burst(s.x,s.y,b.c,8,5);FX.ring(s.x,s.y,b.c,.8,.25);AU.sfx('clank');b.x=s.x;b.y=s.y;break;}
        if(b.j==='Fetch'){G.w.magnet=true;if(b.t<=0){b.t=7*fast;C.pick('orb',b.x,b.y);}}}},
      end(){G.w.magnet=false;},
      draw(ctx,z){const a=Math.min(1,(z.life-z.t)*2);ctx.textAlign='center';ctx.font='700 '+Math.round(clamp(R.k*.26,9,13))+'px Fredoka,sans-serif';for(const b of z.bots){ctx.globalCompositeOperation='lighter';FX.glow(ctx,b.x,b.y,.6,b.c,.6*a);FX.sh(ctx,'bot',b.x,b.y,.24,0,b.c,a);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=a;ctx.fillStyle='#fff';ctx.strokeStyle='#201A4B';ctx.lineWidth=3;ctx.strokeText(b.j,R.px(b.x),R.py(b.y+.42));ctx.fillText(b.j,R.px(b.x),R.py(b.y+.42));ctx.globalAlpha=1;}}});return true;}});
// Skills: a programmable rune. Triggers and actions are open registries.
const RUNE_T={dodge:'I dodge',kill:'a foe falls',hurt:'I get hurt',hit5:'my 5th hit lands'},RUNE_A={
  shock:{name:'Shock ring',run(p){C.area(p.x,p.y+.8,2.8,12,{ab:'skills',kr:6,c:0xc77dff,noStop:true});FX.ring(p.x,p.y+.8,0xc77dff,2.8,.3,.2);}},
  bolts:{name:'3 bolts',run(p){for(let i=0;i<3;i++){const a=1.57+(i-1)*.7;C.shot({x:p.x,y:p.y+1.2,vx:Math.cos(a)*12,vy:Math.sin(a)*12,dmg:7,c:0xc77dff,shape:'rune',size:.2,home:10,life:1.5,o:{ab:'skills',noStop:true}});}}},
  heal:{name:'Heal 4',run(){C.heal(4);}},
  shield:{name:'Shield',run(p){p.barrier=1;FX.ring(p.x,p.y+.8,0xbff6ff,1.2,.3);}}};
function runeFire(ev){const r=rk('skills'),p=G.p;if(!r||!p||p.dead)return;const s=ast(p,'skills');s.cd=s.cd||[0,0];for(let i=0;i<(r>=3?2:1);i++){const ru=SV.d.runes[i];if(!ru||ru.t!==ev||s.cd[i]>0)continue;s.cd[i]=2.5*(G.mod.b.runeFast?.5:1);s.fl=.5;RUNE_A[ru.a].run(p);AU.sfx('pulse',1.4);}}
ability({id:'skills',name:'Skills',color:0xc77dff,shape:'rune',track:'B',kind:'passive',blurb:'A rune you program: when X, do Y.',ranks:['1 rune. 2 triggers, 2 actions.','All triggers and actions.','2 runes.'],
  update(p,r,dt){const s=ast(p,'skills');if(s.cd){s.cd[0]-=dt;s.cd[1]-=dt;}if(s.fl>0)s.fl-=dt;},
  draw(ctx,p){const s=ast(p,'skills');ctx.globalCompositeOperation='lighter';FX.sh(ctx,'rune',p.x-p.face*.55,p.y+1.75,s.fl>0?.26:.15,G.t,this.color,s.fl>0?1:.55);ctx.globalCompositeOperation='source-over';}});
C.onDodge.push(()=>runeFire('dodge'));C.onKill.push(()=>runeFire('kill'));C.afterHurt.push(()=>runeFire('hurt'));
C.onHit.push((e,d,o,p)=>{if(o.ab==='skills'||o.shared||!rk('skills'))return;const s=ast(p,'skills');s.h=(s.h||0)+1;if(s.h>=5){s.h=0;runeFire('hit5');}});
C.onHurt.push(p=>{if(p.barrier){p.barrier=0;p.inv=.4;AU.sfx('clank');FX.ring(p.x,p.y+.8,0xbff6ff,1.6,.3);FX.num(p.x,p.y+2.3,'Shielded','#BFF6FF',.9);return true;}});
// Connectors: a portal that pulls an outside tool into the arena. Tools are a registry.
const TOOLS=[
  {name:'Turret',run(x){C.zone({x,y:1.2,life:8,ft:0,upd(z,dt){z.ft-=dt;if(z.ft<=0){const t=C.nearest(z.x,z.y,11);if(t){z.ft=.45;const dx=t.x-z.x,dy=t.y+t.h/2-z.y,d=Math.hypot(dx,dy)||1;C.shot({x:z.x,y:z.y,vx:dx/d*20,vy:dy/d*20,dmg:5,c:0x3da5ff,size:.16,o:{ab:'connect',noStop:true}});AU.sfx('shot',1.8);}}},
    draw(ctx,z){const a=Math.min(1,(z.life-z.t)*2);ctx.globalCompositeOperation='lighter';FX.glow(ctx,z.x,z.y,.9,0x3da5ff,.5*a);FX.sh(ctx,'portal',z.x,z.y,.5,0,0x3da5ff,a*.6);FX.sh(ctx,'bot',z.x,z.y,.3,0,0xbfe9ff,a);ctx.globalCompositeOperation='source-over';}});}},
  {name:'Supply crate',run(x){C.pick('orb',x,2);C.pick('orb',x+.3,2.4);}},
  {name:'Anvil',run(x){const t=C.nearest(x,1,12),ax=t?t.x:x;C.tele({kind:'rect',ally:true,c:0x3da5ff,x0:ax-1.6,x1:ax+1.6,y0:0,y1:6,m:.5,fire(){C.area(ax,.8,2.3,60,{ab:'connect',heavy:true,kr:8,ky:8,c:0x3da5ff});FX.ring(ax,.3,0x3da5ff,2.6,.4,.3);FX.burst(ax,.3,0xbfe9ff,20,10,{up:5});AU.sfx('heavy');R.cam.shake=.45;}});}}];
ability({id:'connect',name:'Connectors',color:0x3da5ff,shape:'portal',track:'B',blurb:'A portal that pulls in an outside tool.',ranks:['Pulls in a turret.','Alternates turret and supply crate.','Adds a falling anvil.'],cd:()=>11*(G.mod.b.connFast?.6:1),
  press(p,r){const s=ast(p,'connect'),x=clamp(p.x+p.face*2,G.w.x0+1,G.w.x1-1);s.i=((s.i==null?-1:s.i)+1)%r;const tool=TOOLS[s.i];AU.sfx('portal');FX.ring(x,1.2,this.color,1.4,.4,.2);FX.num(x,2.6,tool.name,'#3DA5FF',.9);tool.run(x);return true;},
  label(p){const s=ast(p,'connect'),r=rk('connect');return TOOLS[((s.i==null?-1:s.i)+1)%r].name.split(' ')[0];}});
