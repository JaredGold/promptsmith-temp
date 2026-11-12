// ---------- game state ----------
const GRAV=38,JUMP=13.6,MOVE=6.4;
const G={t:0,stop:0,slow:1,safe:false,scene:null,p:null,w:null,mod:null,run:null,zoomT:0,zoomV:1,focus:null,
  punch(z,t,fx,fy){this.zoomT=t;this.zoomV=z;this.focus=fx==null?null:{x:fx,y:fy};}};
// run modifiers: written by boons, read by abilities. b = per-ability flags.
const newMod=()=>({dmg:1,cd:1,dcd:1,spark:1,dbl:0,burn:0,hp:0,wind:0,b:{}});
const newWorld=(x0,x1)=>({x0,x1,plats:[],ents:[],shots:[],tele:[],zones:[],picks:[]});
const rk=id=>SV.d.ranks[id]||0;

// ---------- combat interface (abilities, enemies and bosses depend on this, not on each other) ----------
const C={outMul:[],onHit:[],onKill:[],onHurt:[],afterHurt:[],onDodge:[],onAttack:[],onShot:[],
  foes(){return G.w.ents;},
  nearest(x,y,maxd,f){let b=null,bd=maxd||1e9;for(const e of G.w.ents){if(e.dead||e.spawn>0||e.disg||(f&&!f(e)))continue;const d=Math.hypot(e.x-x,e.y+e.h/2-y);if(d<bd){bd=d;b=e;}}return b;},
  inBox(x0,x1,y0,y1){if(x0>x1){const t=x0;x0=x1;x1=t;}return G.w.ents.filter(e=>!e.dead&&!(e.spawn>0)&&e.x+e.w/2>x0&&e.x-e.w/2<x1&&e.y+e.h>y0&&e.y<y1);},
  inR(x,y,r){return G.w.ents.filter(e=>!e.dead&&!(e.spawn>0)&&Math.hypot(e.x-x,clamp(y,e.y,e.y+e.h)-y)<r+e.w/2);},
  box(x0,x1,y0,y1,dmg,o){const l=this.inBox(x0,x1,y0,y1);for(const e of l)this.hit(e,dmg,o);return l;},
  area(x,y,r,dmg,o){const l=this.inR(x,y,r);for(const e of l)this.hit(e,dmg,Object.assign({},o,{kx:o&&o.kr?sgn(e.x-x)*o.kr:o&&o.kx}));return l;},
  // o: {ab, precise, heavy, crit, kx, ky, c, noStop, fx(origin x)}
  hit(e,dmg,o){o=o||{};if(e.dead||e.inv>0||e.spawn>0)return 0;const p=G.p,m=G.mod;let d=dmg*m.dmg;
    for(const f of this.outMul)d*=f(e,o,p);
    if(e.mark>0)d*=1.25+(m.b.cited?.3:0);if(e.tag>0)d*=1.2;if(e.tune>0)d*=1.3;if(e.stag>0)d*=1.5;if(o.crit)d*=o.crit;
    if(e.def.resist){const r=e.def.resist(e,o,p);if(r<=0){AU.sfx('clank');FX.burst(e.x+e.face*.5,e.y+e.h*.6,0xcfd8ff,5,5);FX.num(e.x,e.y+e.h+.3,'Blocked','#CFD8FF',.8);return 0;}d*=r;}
    let big=o.crit||o.heavy;if(m.dbl&&Math.random()<m.dbl){d*=2;big=1;}
    d=Math.max(1,Math.round(d));const col=o.c==null?0xffffff:o.c;
    if(e.floor&&e.shield<=0){d=Math.min(d,e.hp-e.floor);if(d<=0)return 0;}
    if(e.shield>0){e.shield-=d;FX.num(e.x,e.y+e.h+.3,d,'#BFF6FF');FX.burst(e.x,e.y+e.h/2,0xbff6ff,6,6);AU.sfx('clank');if(e.shield<=0){e.shield=0;AU.sfx('shatter');FX.ring(e.x,e.y+e.h/2,0xbff6ff,4,.5,.3);R.cam.shake=.4;}return 0;}
    e.hp-=d;e.flash=.1;if(e.disg&&e.def.reveal)e.def.reveal(e);
    if(!e.anch&&!e.boss){e.kx=(o.kx||0)*(e.def.kb==null?1:e.def.kb);if(o.ky){if(e.fly)e.ky=o.ky;else if(e.y<=.01)e.vy=o.ky*(e.def.kb==null?1:e.def.kb);}}
    FX.num(e.x,e.y+e.h+.3,d,o.crit?'#FFC53D':hex(mix(col,0xffffff,.45)),big?1.45:1);
    FX.burst(e.x,e.y+e.h/2,col,o.heavy?14:7,o.heavy?9:6);
    AU.sfx(o.heavy?'heavy':'hit',rnd(.9,1.2));
    if(!o.noStop){G.stop=Math.max(G.stop,o.heavy?.12:.05);R.cam.shake=Math.max(R.cam.shake,o.heavy?.3:.1);}if(o.heavy)buzz(25);
    if(o.slowT)e.slow=Math.max(e.slow,o.slowT);if(o.tune)e.tune=5;
    for(const f of this.onHit)f(e,d,o,p);
    if(e.hp<=0)this.kill(e,o);
    return d;},
  kill(e,o){if(e.dead)return;e.dead=true;e.hp=0;const p=G.p;AU.sfx('kill');FX.burst(e.x,e.y+e.h/2,e.def.col||0xffffff,e.boss?60:18,e.boss?12:7,{life:1.4});FX.ring(e.x,e.y+e.h/2,e.def.col||0xffffff,e.boss?6:1.8,.4);
    if(e.def.die)e.def.die(e,o||{});
    if(G.run&&!e.decoy){G.run.kills++;const n=e.boss?0:rint(0,1)+(e.def.sparks||0);for(let i=0;i<n;i++)this.pick('spark',e.x,e.y+e.h/2);if(!e.boss&&Math.random()<.07)this.pick('orb',e.x,e.y+e.h/2);}
    for(const f of this.onKill)f(e,o||{},p);},
  // damage the player. src: enemy entity or enemy shot. Returns true if damage landed.
  hurt(dmg,src,kx){const p=G.p;if(p.dead||p.inv>0||G.safe)return false;
    for(const f of this.onHurt){const r=f(p,dmg,src);if(r===true)return false;if(typeof r==='number')dmg=r;}
    dmg=Math.max(1,Math.round(dmg));p.hp-=dmg;p.inv=.8;p.vx=(kx||0)*8;p.vy=Math.max(p.vy,5);p.ground=false;p.flash=.12;
    FX.num(p.x,p.y+p.h+.4,'-'+dmg,'#FF5D73',1.2);FX.burst(p.x,p.y+.8,0xff5d73,10,6);AU.sfx('hurt');R.cam.shake=Math.max(R.cam.shake,.35);G.stop=Math.max(G.stop,.08);buzz(45);
    for(const f of this.afterHurt)f(p,dmg,src);
    if(p.hp<=0){p.hp=0;p.dead=true;p.deadT=0;AU.sfx('die');G.punch(1.35,2,p.x,p.y+1);}
    return true;},
  heal(n,quiet){const p=G.p;if(p.dead)return;const b=p.hp;p.hp=Math.min(p.mhp,p.hp+n);if(!quiet&&p.hp>b){FX.num(p.x,p.y+p.h+.4,'+'+Math.round(p.hp-b),'#37E2B8');FX.burst(p.x,p.y+.8,0x37e2b8,8,4,{up:3,g:-2});AU.sfx('heal');}},
  shot(o){const s=Object.assign({x:0,y:0,vx:0,vy:0,r:.28,dmg:5,team:'p',c:0xffffff,shape:'dot',size:.26,life:1.6,t:0,g:0,pierce:0,home:0,delay:0,o:{}},o);if(s.pierce)s.hitSet=new Set();
    for(const f of this.onShot)f(s);G.w.shots.push(s);return s;},
  zone(z){z.t=0;G.w.zones.push(z);return z;},
  tele(t){t.t=0;G.w.tele.push(t);return t;},
  pick(kind,x,y){if(G.w.picks.length<60)G.w.picks.push({kind,x,y,vx:rnd(-3,3),vy:rnd(4,8),t:0});},
  attacked(p,dmg,fin){for(const f of this.onAttack)f(p,dmg,fin);}
};

// ---------- basic attack forms (Format adds more to this registry) ----------
const FORMS=[{name:'Swing',fire(p,dmg,fin){const r=fin?2.7:2.05,f=p.face;
  const l=C.box(p.x-f*.35,p.x+f*r,p.y-.3,p.y+2.3,dmg,{ab:'basic',heavy:fin,kx:f*(fin?11:4.5),ky:fin?6:1.5,c:0xffc53d});
  if(!l.length)AU.sfx('swing');C.zone({life:.16,x:p.x,y:p.y+.9,f,r,fin,draw:drawArc});}}];
function drawArc(ctx,z){const a=1-z.t/z.life,k=R.k,x=R.px(z.x+(G.p.x-z.x)),y=R.py(z.y);ctx.save();ctx.translate(x,y);ctx.scale(z.f,1);ctx.globalCompositeOperation='lighter';
  ctx.strokeStyle=z.c||'#FFC53D';ctx.globalAlpha=a*.9;ctx.lineCap='round';ctx.lineWidth=k*(z.fin?.5:.3)*a+2;ctx.beginPath();ctx.arc(0,0,z.r*k*.82,-1.25,-1.25+2.3*Math.min(1,z.t/z.life*1.6+.25));ctx.stroke();
  ctx.globalAlpha=a*.35;ctx.lineWidth=k*(z.fin?1:.7)*a;ctx.stroke();ctx.restore();}

// ---------- player ----------
const PL={
  make(x){const p={x,y:0,vx:0,vy:0,w:.7,h:1.5,face:1,mhp:100+G.mod.hp,ground:true,jumps:0,plat:null,drop:0,coyote:0,dodge:0,ddir:1,dcd:0,inv:0,atkCd:0,swing:0,swingM:.2,combo:0,comboT:0,root:0,dead:false,deadT:0,flash:0,
      cd:{},ab:{},form:0,spd:1,dcdMul:1,runT:0,charging:false,noAtk:false,node:R.add(mk(MODEL.player(),x,0,0,{ol:true,sh:.5}))};p.hp=p.mhp;return p;},
  slots(){return SV.d.loadout;},
  update(p,dt){const w=G.w,m=G.mod;
    p.inv=Math.max(0,p.inv-dt);p.dcd-=dt;p.atkCd-=dt;p.comboT-=dt;if(p.comboT<=0)p.combo=0;p.root-=dt;p.drop-=dt;p.swing-=dt;
    for(const k in p.cd)if(p.cd[k]>0)p.cd[k]-=dt;
    if(p.dead){p.deadT+=dt;p.vy-=GRAV*dt;p.y=Math.max(0,p.y+p.vy*dt);p.vx*=.9;p.x=clamp(p.x+p.vx*dt,w.x0+.5,w.x1-.5);this.anim(p,dt);return;}
    p.spd=1;p.dcdMul=1;
    for(const id of AB_ORDER){const r=rk(id);if(r)ABILITY[id].update(p,r,dt);}
    let mx=IN.mx;
    if(IN.press.dodge&&p.dcd<=0&&p.dodge<=0){p.dodge=.22;p.ddir=Math.abs(mx)>.2?sgn(mx):p.face;p.face=p.ddir;p.inv=Math.max(p.inv,.32);p.dcd=.65*m.dcd*p.dcdMul;AU.sfx('dodge');
      FX.burst(p.x,p.y+.7,0xd9c8ff,8,4,{dir:p.ddir>0?3.14:0,spread:.5,g:0});for(const f of C.onDodge)f(p);}
    if(p.dodge>0){p.dodge-=dt;p.vx=p.ddir*17;p.vy=0;if(Math.random()<.6)FX.burst(p.x,p.y+rnd(.2,1.2),0xd9c8ff,1,1,{g:0});}
    else{if(p.root>0)mx=0;const acc=p.ground?75:48,tv=mx*MOVE*p.spd*(p.mud>0?.55:1);p.vx+=clamp(tv-p.vx,-acc*dt,acc*dt);p.mud-=dt;
      if(mx&&p.swing<=0)p.face=sgn(mx);
      if(IN.press.jump&&p.root<=0){
        if(p.ground&&p.plat&&IN.my>0){p.drop=.25;p.ground=false;p.plat=null;}
        else if(p.ground||p.coyote>0){p.vy=JUMP;p.ground=false;p.plat=null;p.coyote=0;AU.sfx('jump');FX.burst(p.x,p.y,0xffffff,5,3,{up:1});p.node.sy=1.25;}
        else if(p.jumps<1){p.jumps++;p.vy=JUMP*.92;AU.sfx('jump',1.3);FX.ring(p.x,p.y,0xbfe9ff,.9,.25,.08);p.node.sy=1.25;}}
      if(IN.rel.jump&&p.vy>5)p.vy=5;
      p.vy-=GRAV*dt;}
    const py=p.y;p.x=clamp(p.x+p.vx*dt,w.x0+.5,w.x1-.5);p.y+=p.vy*dt;let g=false,pl=null;
    if(p.y<=0){p.y=0;g=true;}
    else if(p.vy<=0&&p.drop<=0)for(const q of w.plats){if(p.x>q.x0-.2&&p.x<q.x1+.2&&py>=q.y-.001&&p.y<=q.y){p.y=q.y;g=true;pl=q;break;}}
    if(g){if(!p.ground&&p.vy<-9){p.node.sy=.72;FX.burst(p.x,p.y,0xffffff,4,3,{up:1});}p.vy=0;p.jumps=0;p.coyote=.09;}else p.coyote-=dt;
    p.ground=g;p.plat=pl;
    if(!p.noAtk){
      if(IN.held.atk&&p.atkCd<=0&&p.dodge<=0&&!p.charging)this.attack(p);
      const L=this.slots();for(let i=0;i<4;i++){const id=L[i],r=id&&rk(id);if(!r)continue;const A=ABILITY[id],k='a'+i;
        if(IN.press[k]){if(p.cd[id]>0)AU.sfx('back');else if(A.press(p,r))p.cd[id]=A.cd(r)*m.cd;}
        if(IN.held[k])A.hold(p,r,dt);
        if(IN.rel[k])A.release(p,r);}}
    this.anim(p,dt);},
  attack(p){const ir=rk('iterate'),max=ir?ir+2:2;p.combo=p.comboT>0?p.combo+1:1;if(p.combo>max)p.combo=1;const fin=ir>0&&p.combo===max;
    p.comboT=.8;p.atkCd=fin?.44:.25;p.swing=p.swingM=fin?.26:.18;
    const dmg=(8+p.combo*1.3)*(fin?2.2:1);(FORMS[p.form]||FORMS[0]).fire(p,dmg,fin);C.attacked(p,dmg,fin);
    if(fin){p.combo=0;p.comboT=0;G.punch(1.06,.18);}else if(p.ground)p.vx+=p.face*2;},
  anim(p,dt){const n=p.node,P=n.p,run=Math.min(1,Math.abs(p.vx)/MOVE);p.runT+=dt*(5+run*11);
    n.x=p.x;n.y=p.y;n.face=p.face;n.sy=lerp(n.sy,1,Math.min(1,dt*12));p.flash=Math.max(0,p.flash-dt);n.flash=p.flash;
    n.vis=!(p.inv>0&&p.dodge<=0&&!p.dead&&p.flash<=0&&Math.floor(G.t*22)%2);
    n.rot=p.dead?lerp(n.rot,-1.45,Math.min(1,dt*6)):p.dodge>0?-.55:lerp(n.rot,-p.vx*p.face*.012,Math.min(1,dt*10));if(p.dodge>0)n.sy=.7;
    const sw=p.ground?Math.sin(p.runT)*.85*run:.5;pv(P.legL,-.13,.5,sw,.25);pv(P.legR,.13,.5,p.ground?-sw:-.35,.25);
    let a=.55+sw*.4;if(p.swing>0){const t=1-p.swing/p.swingM;a=lerp(3.6,.5,t*t*(3-2*t));}else if(p.charging)a=3.3+Math.sin(G.t*30)*.05;
    pv(P.armF,.06,1.02,a,.2);const hx=.06+Math.sin(a)*.42,hy=1.02-Math.cos(a)*.42,ha=a+.75;P.handF.x=hx;P.handF.y=hy;pv(P.hh,hx,hy,ha,.3);pv(P.hd,hx,hy,ha,.68);pv(P.hb,hx,hy,ha,.68);
    const ab=-sw*.8-.1;pv(P.armB,-.08,1.02,ab,.2);P.handB.x=-.08+Math.sin(ab)*.42;P.handB.y=1.02-Math.cos(ab)*.42;P.scarf.r=clamp(-p.vx*p.face*.05,-.5,.5)+Math.sin(p.runT*.7)*.12;P.scarf.y=1+Math.sin(p.runT*.7)*.03;
    let gy=0;if(p.y>.5)for(const q of G.w.plats)if(p.x>q.x0&&p.x<q.x1&&p.y>=q.y-.01)gy=Math.max(gy,q.y);n.gy=gy;}
};

// ---------- enemies ----------
function spawnEnemy(kind,x,y,o){const def=ENEMY[kind],tier=G.run?G.run.tier:1,hs=1+.22*(tier-1),ds=1+.12*(tier-1);
  const e={kind,def,x,y:y||0,vx:0,vy:0,kx:0,ky:0,w:def.w,h:def.h,hp:Math.round(def.hp*hs),dmg:def.dmg*ds,face:-1,fly:!!def.fly,boss:!!def.boss,anch:!!def.anch,sz:1,spawn:.6,stun:0,slow:0,mark:0,tag:0,tune:0,stag:0,share:0,inv:0,flash:0,tell:0,hot:false,dead:false,shield:0,ground:false,wall:0,s:{},ai:AI[def.ai||kind]};
  if(o)Object.assign(e,o);e.mhp=e.hp;e.node=R.add(mk(MODEL[def.model||kind](e),x,e.y,0,{ol:true,sh:def.w*.55}));e.node.s=.01;e.ai.init(e);G.w.ents.push(e);AU.sfx('spawn');FX.ring(x,e.y+e.h/2,def.col||0xffffff,1.2,.5);return e;}
function updEnemy(e,dt){const n=e.node,p=G.p,w=G.w;e.flash=Math.max(0,e.flash-dt);e.mark-=dt;e.tag-=dt;e.tune-=dt;e.slow-=dt;e.inv-=dt;e.share-=dt;e.tell=0;e.hot=false;
  if(e.spawn>0){e.spawn-=dt;n.s=e.sz*clamp(1-e.spawn/.6,.01,1);n.x=e.x;n.y=e.y;return;}
  const edt=dt*(e.slow>0?.5:1);
  if(e.stag>0){e.stag-=dt;e.stun=Math.max(e.stun,.05);}
  if(e.stun>0){e.stun-=dt;e.vx=0;if(e.fly)e.vy=0;}else e.ai.update(e,edt);
  if(!e.fly)e.vy-=GRAV*edt;
  e.x+=(e.vx+e.kx)*edt;e.y+=(e.vy+(e.fly?e.ky:0))*edt;const f=Math.max(0,1-7*dt);e.kx*=f;e.ky*=f;
  e.wall=0;const hw=e.w/2;if(e.x<w.x0+hw){e.x=w.x0+hw;e.wall=-1;}else if(e.x>w.x1-hw){e.x=w.x1-hw;e.wall=1;}
  const fl=e.fly?.25:0;if(e.y<=fl){e.y=fl;if(e.vy<0)e.vy=0;e.ground=true;}else e.ground=false;if(e.y>9)e.y=9;
  if(e.hot&&e.stun<=0&&!p.dead&&Math.abs(p.x-e.x)<hw+p.w/2-.05&&p.y<e.y+e.h&&p.y+p.h>e.y)C.hurt(e.dmg,e,sgn(p.x-e.x));
  n.x=e.x;n.y=e.y+(e.fly?Math.sin(G.t*4+e.mhp)*.1:0);n.face=e.face;n.flash=e.flash;n.s=e.sz;n.vis=!e.disg;n.rot=e.stun>0&&!e.boss?Math.sin(G.t*18)*.12:0;if(!e.def.ownSy)n.sy=1+Math.sin(G.t*(e.fly?5:7)+e.mhp)*(e.boss?.02:.045);
  if(e.def.anim)e.def.anim(e,dt);}
// aimed enemy shot helper
function eShot(e,tx,ty,sp,o){const x=e.x+e.face*e.w*.3,y=e.y+e.h*.6,dx=tx-x,dy=ty-y,d=Math.hypot(dx,dy)||1;AU.sfx('eshot');
  return C.shot(Object.assign({team:'e',x,y,vx:dx/d*sp,vy:dy/d*sp,dmg:e.dmg,c:e.def.col||0xff5d73,shape:'dot',size:.26,life:3.2,src:e},o));}

// ---------- world update shared by hub and runs ----------
function updWorld(dt){const w=G.w,p=G.p;
  for(const e of w.ents)if(!e.dead)updEnemy(e,dt);
  for(let i=w.ents.length-1;i>=0;i--)if(w.ents[i].dead){R.remove(w.ents[i].node);w.ents.splice(i,1);}
  // shots
  for(let i=w.shots.length-1;i>=0;i--){const s=w.shots[i];if(s.delay>0){s.delay-=dt;if(s.delay>0)continue;s.x+=p.x-(s.px==null?p.x:s.px);}
    s.t+=dt;let dead=s.t>s.life;
    if(s.home&&s.team==='p'){const t=s.tgt&&!s.tgt.dead?s.tgt:C.nearest(s.x,s.y,9);if(t){const sp=Math.hypot(s.vx,s.vy),dx=t.x-s.x,dy=t.y+t.h/2-s.y,d=Math.hypot(dx,dy)||1,k=Math.min(1,s.home*dt);s.vx=lerp(s.vx,dx/d*sp,k);s.vy=lerp(s.vy,dy/d*sp,k);}}
    s.vy-=s.g*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.upd)s.upd(s,dt);
    if(s.y<-.2&&!s.float){dead=true;if(s.onEnd)s.onEnd(s);FX.burst(s.x,0,s.c,4,3,{up:2});}
    if(s.x<w.x0-3||s.x>w.x1+3||s.y>14)dead=true;
    if(!dead&&s.team==='p'){for(const e of w.ents){if(e.dead||e.spawn>0||(s.hitSet&&s.hitSet.has(e)))continue;
        if(Math.abs(e.x-s.x)<e.w/2+s.r&&s.y>e.y-s.r&&s.y<e.y+e.h+s.r){C.hit(e,s.dmg,Object.assign({kx:sgn(s.vx)*3,c:s.c,fx:s.x-s.vx},s.o));if(s.onHit)s.onHit(s,e);if(s.pierce)s.hitSet.add(e);else{dead=true;break;}}}}
    else if(!dead&&!p.dead&&Math.abs(p.x-s.x)<p.w/2+s.r&&s.y>p.y-s.r&&s.y<p.y+p.h+s.r){if(C.hurt(s.dmg,s,sgn(s.vx)))dead=true;}
    if(dead)w.shots.splice(i,1);}
  // telegraphs
  for(let i=w.tele.length-1;i>=0;i--){const t=w.tele[i];t.t+=dt;if(t.t>=t.m){w.tele.splice(i,1);t.fire(t);}}
  // zones
  for(let i=w.zones.length-1;i>=0;i--){const z=w.zones[i];z.t+=dt;if(z.upd)z.upd(z,dt);if(z.t>=z.life){if(z.end)z.end(z);w.zones.splice(i,1);}}
  // pickups
  for(let i=w.picks.length-1;i>=0;i--){const k=w.picks[i];k.t+=dt;const dx=p.x-k.x,dy=p.y+.8-k.y,d=Math.hypot(dx,dy);
    if(!p.dead&&k.t>.35&&(d<3.2||w.magnet)){const sp=14;k.vx=dx/d*sp;k.vy=dy/d*sp;}else{k.vy-=22*dt;k.vx*=.97;}
    k.x=clamp(k.x+k.vx*dt,w.x0+.3,w.x1-.3);k.y+=k.vy*dt;if(k.y<.3){k.y=.3;k.vy=Math.abs(k.vy)*.4;}
    if(!p.dead&&k.t>.35&&d<.7){w.picks.splice(i,1);if(k.kind==='spark'){const n=G.mod.spark>1&&Math.random()<G.mod.spark-1?2:1;if(G.run)G.run.sparks+=n;AU.sfx('pick',rnd(.9,1.3));FX.burst(k.x,k.y,0xffc53d,3,3);}else C.heal(15);}}
  FX.update(dt);
}
function hitTele(t,dmg,src){const p=G.p;if(t.kind==='circ'){if(Math.hypot(p.x-t.x,p.y+.7-t.y)<t.r+.3)C.hurt(dmg,src,sgn(p.x-t.x));}else if(p.x+p.w/2>t.x0&&p.x-p.w/2<t.x1&&p.y<t.y1&&p.y+p.h>t.y0)C.hurt(dmg,src,sgn(p.x-(t.x0+t.x1)/2));}
function camFollow(dt,snap){const p=G.p,w=G.w,c=R.cam,hw=R.W/2/R.k;let tx=p.x+p.face*1.1;const lo=w.x0+hw-.5,hi=w.x1-hw+.5;tx=lo>hi?(w.x0+w.x1)/2:clamp(tx,lo,hi);
  let ty=c.vh/2-c.gy+Math.max(0,p.y-2.6)*.5;G.zoomT-=dt;let tz=1;
  if(G.zoomT>0){tz=G.zoomV;if(G.focus){tx=lerp(tx,G.focus.x,.7);ty=lerp(ty,G.focus.y+c.vh/2/tz-c.gy/tz-1,.6);}}
  const k=snap?1:Math.min(1,dt*5.5);c.x=lerp(c.x,tx,k);c.y=lerp(c.y,ty,k);c.zoom=lerp(c.zoom,tz,snap?1:Math.min(1,dt*7));c.shake=Math.max(0,c.shake-dt*1.7);if(R.q===0)c.shake*=.5;}

// ---------- overlay drawing ----------
function drawWorldFx(ctx){const w=G.w,p=G.p,k=R.k;
  for(const t of w.tele){const a=t.t/t.m,col=t.ally?hex(t.c):'#FF3B5C';ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineWidth=2;
    if(t.kind==='circ'){const x=R.px(t.x),y=R.py(t.y),r=t.r*k;ctx.globalAlpha=.16;ctx.beginPath();ctx.ellipse(x,y,r,r*(t.flat?.3:1),0,0,6.283);ctx.fill();ctx.globalAlpha=.4;ctx.beginPath();ctx.ellipse(x,y,r*a,r*a*(t.flat?.3:1),0,0,6.283);ctx.fill();ctx.globalAlpha=.9;ctx.beginPath();ctx.ellipse(x,y,r,r*(t.flat?.3:1),0,0,6.283);ctx.stroke();}
    else{const x=R.px(t.x0),y=R.py(t.y1),ww=(t.x1-t.x0)*k,hh=(t.y1-t.y0)*k;ctx.globalAlpha=.14;ctx.fillRect(x,y,ww,hh);ctx.globalAlpha=.38;ctx.fillRect(x,y+hh*(1-a),ww,hh*a);ctx.globalAlpha=.9;ctx.strokeRect(x,y,ww,hh);}
    ctx.globalAlpha=1;}
  for(const z of w.zones)if(z.draw)z.draw(ctx,z);
  for(const id of AB_ORDER){const r=rk(id);if(r)ABILITY[id].draw(ctx,p,r);}
  ctx.globalCompositeOperation='lighter';
  for(const q of w.picks){if(q.kind==='spark'){FX.glow(ctx,q.x,q.y,.45,0xffc53d,.8);FX.sh(ctx,'diamond',q.x,q.y,.13,G.t*5+q.x,0xfff2b0);}else{FX.glow(ctx,q.x,q.y,.7,0x37e2b8,.8);FX.sh(ctx,'heart',q.x,q.y+Math.sin(G.t*5)*.05,.28,0,0x9dffe2);}}
  for(const e of w.ents)if(e.disg){FX.glow(ctx,e.x,e.y+.45,.7,0x37e2b8,.8);FX.sh(ctx,'heart',e.x,e.y+.45+Math.sin(G.t*7)*.05,.28,0,0x9dffe2);}
  for(const s of w.shots){if(s.delay>0)continue;if(R.q>0)FX.glow(ctx,s.x,s.y,s.size*2.6,s.c,.7);FX.sh(ctx,s.shape,s.x,s.y,s.size,s.spin?G.t*s.spin:Math.atan2(s.vy,s.vx),s.team==='e'?mix(s.c,0xffffff,.25):mix(s.c,0xffffff,.5));}
  ctx.globalCompositeOperation='source-over';
  for(const e of w.ents){if(e.dead||e.spawn>0||e.disg)continue;const x=R.px(e.x),top=R.py(e.y+e.h*e.sz)-8;
    if(!e.boss&&e.hp<e.mhp){const bw=Math.max(26,e.w*k*.9);ctx.fillStyle='#201A4B';ctx.fillRect(x-bw/2-1,top-5,bw+2,6);ctx.fillStyle=e.mark>0?'#C6F432':'#FF5D73';ctx.fillRect(x-bw/2,top-4,bw*clamp(e.hp/e.mhp,0,1),4);}
    if(e.tell>0){ctx.font='700 '+Math.round(k*.7)+'px Fredoka,sans-serif';ctx.textAlign='center';ctx.fillStyle='#FF3B5C';ctx.strokeStyle='#201A4B';ctx.lineWidth=4;ctx.strokeText('!',x,top-10);ctx.fillText('!',x,top-10);}
    if(e.mark>0)FX.sh(ctx,'check',e.x+.45*e.sz,e.y+e.h*e.sz+.35,.16,0,0xc6f432);
    if(e.tag>0)FX.sh(ctx,'tag',e.x-.45*e.sz,e.y+e.h*e.sz+.35,.16,0,0x5eead4);
    if(e.stun>0&&!e.boss){for(let i=0;i<3;i++)FX.sh(ctx,'dot',e.x+Math.cos(G.t*6+i*2.1)*.45,e.y+e.h*e.sz+.25+Math.sin(G.t*6+i*2.1)*.1,.08,0,0xffe28a);}
    if(e.shield>0||e.inv>1){ctx.globalCompositeOperation='lighter';FX.glow(ctx,e.x,e.y+e.h/2,e.h*.95,0x6fdbf2,.55+Math.sin(G.t*6)*.1);ctx.strokeStyle='#BFF6FF';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,R.py(e.y+e.h/2),e.h*.72*k,0,6.283);ctx.stroke();ctx.globalCompositeOperation='source-over';}
    if(e.def.draw)e.def.draw(ctx,e);}
  FX.drawParts(ctx);FX.drawNums(ctx);
}
function lightWorld(){const w=G.w,p=G.p;let n=0;for(const s of w.shots){if(n++>2)break;if(!(s.delay>0))R.light(s.x,s.y,s.c,.9,6);}
  if(p.swing>0)R.light(p.x+p.face,p.y+1,0xffc53d,.8,6);}
