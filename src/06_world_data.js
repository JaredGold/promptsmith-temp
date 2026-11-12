// ---------- models (simple shapes only; front faces +x). Toy-like, original designs. ----------
const F=(o,x,y,s,z)=>P('img',x,y,s,s,0,{img:faceTex(o),z});
const eye=(x,y,d,s)=>P('box',x,y,.1*(s||1),.18*(s||1),0x201a4b,{z:.01,d});
const MODEL={
  player(){return [P('cap',-.14,.24,.22,.48,0x2b2466,{n:'legL',z:-.12}),P('cap',-.1,.8,.17,.42,0x3f6df0,{n:'armB',z:-.3}),P('sph',0,0,.19,.19,0xffd9b0,{n:'handB',z:-.31}),
    P('rbox',-.42,1,.36,.14,0xffc53d,{n:'scarf',z:-.06,d:.1}),P('cap',0,.78,.62,.74,0x3f6df0,{d:.5}),P('rbox',.03,.66,.52,.44,0xb8713a,{z:.03,d:.54}),P('rbox',0,.5,.66,.1,0x5a3420,{z:.04,d:.56}),P('cap',-.02,1.1,.7,.2,0xffc53d,{z:.05,d:.58}),
    P('cap',.14,.24,.22,.48,0x2b2466,{n:'legR',z:.12}),P('sph',-.08,1.6,.92,.74,0x5a3420,{z:-.08,d:.86}),P('sph',0,1.5,.84,.8,0xffd9b0),
    P('rbox',0,1.8,.82,.13,0x201a4b,{z:.02,d:.84}),P('sph',-.12,1.8,.26,.26,0x7ce8ff,{e:1,z:.37,d:.2}),P('sph',.2,1.8,.26,.26,0x7ce8ff,{e:1,z:.35,d:.2}),
    F({e:'oval',m:'smile',brow:1},.09,1.44,.6,.44),
    P('cap',.06,.8,.17,.42,0x3f6df0,{n:'armF',z:.46}),P('cap',0,0,.1,.66,0x7a4a21,{n:'hh',z:.47}),P('rbox',0,0,.5,.34,0xffc53d,{n:'hd',z:.49,d:.34,e:1}),P('rbox',0,0,.14,.38,0xff8a3d,{n:'hb',z:.5,d:.38,e:1}),P('sph',0,0,.2,.2,0xffd9b0,{n:'handF',z:.51})];},
  npc(c,c2,hat){const a=[P('cap',-.13,.2,.2,.4,0x2b2466,{z:-.1}),P('cap',.13,.2,.2,.4,0x2b2466,{z:.1}),P('cap',0,.82,.7,.9,c,{d:.56}),P('cap',0,1.14,.74,.2,c2,{z:.03,d:.6}),P('sph',0,1.52,.84,.8,0xf2c9a0),
      F({e:'oval',m:'smile'},.06,1.46,.6,.44),P('cap',.3,.84,.17,.44,c,{z:.4,r:.35}),P('sph',.4,.66,.2,.2,0xf2c9a0,{z:.42}),P('cap',-.32,.84,.17,.44,c,{z:-.3,r:-.2})];
    if(hat===1)a.push(P('cyl',0,1.86,1,.1,c2,{d:1}),P('cap',0,2.02,.56,.4,c2),P('rbox',0,1.93,.6,.1,0xffc53d,{z:.02,d:.6,e:1}));
    else if(hat===2)a.push(P('sph',-.06,1.9,.92,.4,c2,{d:.9}),P('sph',-.3,2.06,.16,.16,c2),P('cone',.34,2.14,.16,.6,0xffffff,{r:-.5,e:1,z:.2}));
    else if(hat===3)a.push(P('sph',0,1.84,.9,.56,0xffc53d,{d:.9}),P('rbox',.12,1.74,.94,.12,0xffc53d,{d:.96}),P('sph',.16,1.56,.3,.3,0x9df0ff,{e:1,z:.4,d:.2}));
    else a.push(P('cone',-.18,2.02,.4,.6,0xff5d2e,{r:.3,e:1}),P('cone',.02,2.1,.44,.74,0xff8a3d,{e:1}),P('cone',.22,2,.36,.56,0xffc53d,{r:-.3,e:1}));return a;},
  dummy(){return [P('cap',0,.5,.2,1,0x7a4a21),P('rbox',0,.08,.9,.16,0x5a3420,{d:.6}),P('rbox',0,1.1,.95,.8,0xe9d6a8,{d:.55}),P('sph',0,1.1,.5,.5,0xffffff,{z:.26,d:.1,e:1}),P('sph',0,1.1,.3,.3,0xff5d73,{z:.3,d:.1,e:1}),P('sph',0,1.85,.7,.66,0xe9d6a8),F({e:'x',m:'flat'},.04,1.82,.5,.36),P('rbox',0,2.16,.5,.1,0x7a4a21,{d:.4})];},
  wisp(){return [P('cone',-.52,.42,.46,.5,0x8c87a6,{r:1.57,z:-.1}),P('sph',-.32,.3,.5,.45,0x8c87a6,{z:-.2}),P('sph',0,.46,.95,.86,0xa9a3da),P('sph',.2,.76,.46,.4,0xcbc5f7,{z:-.1}),P('sph',-.2,.8,.36,.3,0xb9b3e8,{z:.1}),F({e:'sleepy',m:'wavy',lid:'#8C87A6'},.1,.44,.62,.46)];},
  moth(){return [P('rbox',-.12,.44,.52,.4,0xcdb891,{n:'wA',z:-.2,d:.05}),P('cap',0,.25,.5,.32,0x9a7f5a,{r:1.57}),P('cone',.16,.5,.05,.26,0x5a4a2a,{r:-.4}),F({e:'dot',m:'none',s:.9},.1,.25,.34,.2),P('rbox',-.12,.44,.52,.4,0xe9dab8,{n:'wB',z:.22,d:.05})];},
  creeper(){return [P('cap',-.25,.12,.24,.24,0x2f6b3d),P('cap',.25,.12,.24,.24,0x2f6b3d,{z:.1}),P('sph',-.34,.84,.5,.44,0x4f9e60,{z:-.1}),P('sph',0,.56,1.04,.9,0x6bbf7a),P('sph',.28,.9,.44,.4,0x86d695,{z:-.15}),P('cone',-.3,1.12,.2,.4,0x2f6b3d,{r:.5}),P('cone',.02,1.2,.2,.44,0x2f6b3d),P('cone',.34,1.12,.2,.4,0x2f6b3d,{r:-.5}),F({e:'angry',m:'frown',c:'#B3122F'},.1,.52,.66,.53)];},
  flooder(){return [P('rbox',0,.1,.8,.2,0x2c4f8f,{d:.7}),P('cap',0,.66,.7,1.1,0x4a9fe6,{d:.66}),P('sph',-.38,.7,.3,.3,0x2c4f8f,{z:.1}),P('rbox',0,.42,.74,.1,0xbfe9ff,{z:.02,d:.7,e:1}),P('cyl',.44,.82,.26,.44,0x7cc4ff,{n:'noz',r:1.57,d:.26}),P('cyl',.68,.82,.34,.1,0x2c4f8f,{r:1.57,d:.34}),P('sph',0,1.3,.5,.3,0x2c4f8f),F({e:'googly',m:'o'},.04,1.02,.56,.34)];},
  mimic(){return [P('cap',-.2,.1,.2,.2,0x1f8f74),P('cap',.2,.1,.2,.2,0x1f8f74,{z:.1}),P('sph',0,.5,.9,.8,0x37e2b8),P('cap',-.1,1.05,.07,.4,0x1f8f74,{r:.25}),P('sph',-.2,1.3,.26,.24,0xff7ab6,{e:1}),F({e:'angry',m:'teeth',c:'#B3122F'},.08,.46,.7,.46)];},
  yesman(){return [P('cap',-.15,.28,.22,.56,0x5a4a1c),P('cap',.15,.28,.22,.56,0x5a4a1c,{z:.1}),P('cap',0,.96,.74,.86,0xf2c14e,{d:.5}),P('rbox',.04,1.02,.16,.5,0xff5d73,{z:.03,d:.52}),P('sph',-.04,1.72,.78,.5,0x5a3420,{z:-.05,d:.76}),P('sph',0,1.6,.74,.7,0xffe0b8),F({e:'happy',m:'grin'},.06,1.56,.56,.39),
    P('rbox',.58,.86,.16,1.5,0xdfe6ff,{n:'sh',d:1.1,e:1,z:.1})];},
  stat(){return [P('rbox',0,.12,1.2,.24,0x4a5680,{d:.8}),P('rbox',-.34,.6,.28,.76,0x7d8fd6,{d:.4}),P('rbox',0,.86,.3,1.28,0x9db4ff,{d:.4}),P('rbox',.34,.5,.28,.56,0xbccaff,{d:.4}),P('cap',0,1.56,.2,.2,0x4a5680),P('sph',0,1.62,.4,.4,0xff3b5c,{e:1,n:'lens'}),F({e:'sleepy',m:'flat',lid:'#7D8FD6',s:.8},.02,.9,.4,.22)];},
  gremlin(){return [P('cap',-.22,.08,.22,.16,0x8a3d10),P('cap',.22,.08,.22,.16,0x8a3d10,{z:.1}),P('cone',-.24,.98,.22,.4,0xff8a3d,{r:.35}),P('cone',.22,.98,.22,.4,0xff8a3d,{r:-.35}),P('sph',0,.47,.94,.88,0xff8a3d),P('sph',.04,.34,.6,.5,0xffc98a,{z:.12,d:.7}),P('rbox',0,.47,1.08,.1,0xffe28a,{n:'loop',z:.02,d:1.02,e:1}),F({e:'wide',m:'grin'},.08,.5,.66,.48)];}
};
const toP=e=>sgn(G.p.x-e.x)||1;
let TIPS={};
function tip(id,msg){if(TIPS[id])return;TIPS[id]=1;toast(msg);}

// ---------- enemy definitions (failure modes) ----------
const ENEMY={
  dummy:{name:'Practice dummy',hp:9999,dmg:0,w:.9,h:1.9,col:0xe9d6a8,anch:1,ai:'still'},
  wisp:{name:'Vague Wisp',hp:20,dmg:9,w:.9,h:.9,fly:1,col:0xa59fd6,cost:1,resist:(e,o)=>o.ab==='clear'?2:o.precise?1:.6},
  moth:{name:'Cliche Moth',hp:9,dmg:6,w:.6,h:.5,fly:1,col:0xd9c7a3,cost:.5,anim(e){const a=Math.sin(G.t*30)*.7;e.node.p.wA.r=a;e.node.p.wB.r=-a;}},
  creeper:{name:'Scope Creeper',ownSy:1,hp:34,dmg:10,w:1,h:1,col:0x6bbf7a,cost:1.5,kb:.7,sparks:1,
    die(e,o){if(e.gen)return;if(o.precise||o.heavy){FX.num(e.x,e.y+e.h+.6,'Scoped!','#FFC53D',1);return;}tip('creep','Creepers split. Finish them with a precise or heavy hit.');
      for(const i of[-1,1])spawnEnemy('creeper',clamp(e.x+i*.7,G.w.x0+1,G.w.x1-1),0,{gen:1,sz:.65,w:.65,h:.65,hp:Math.round(e.mhp*.3),spawn:.3,kx:i*6});}},
  flooder:{name:'Context Flooder',hp:28,dmg:6,w:.8,h:1.4,col:0x4a9fe6,cost:1.5,sparks:1},
  mimic:{name:'Hallucination Mimic',hp:30,dmg:12,w:.8,h:.8,col:0x37e2b8,cost:1.5,sparks:1,
    resist(e,o){if(!e.verified&&!e.disg)tip('mimic','Mimics shrug off hits until you Verify them.');return e.verified?1:.35;},
    reveal(e){if(!e.disg)return;e.disg=false;e.s.m='wait';e.s.t=.55;FX.burst(e.x,e.y+.5,0x37e2b8,12,6);AU.sfx('spawn');FX.num(e.x,e.y+1.4,'Mimic!','#37E2B8',.9);},
    onVerify(e){this.reveal(e);e.stun=Math.max(e.stun,1.5);}},
  yesman:{name:'Yes-Man',hp:44,dmg:11,w:.9,h:1.5,col:0xf2c14e,cost:2,kb:.4,sparks:2,
    resist(e,o,p){const fx=o.fx==null?p.x:o.fx;if(sgn(fx-e.x)===e.face&&!o.heavy&&o.ab!=='critique'&&e.stun<=0){tip('yes','Yes-Men block the front. Hit from behind, or hit heavy.');return 0;}return 1;},
    draw(ctx,e){const b=e.s.beam;if(b&&b.t>0){ctx.globalAlpha=b.t*3;ctx.strokeStyle='#37E2B8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(R.px(e.x),R.py(e.y+1.5));ctx.lineTo(R.px(b.x),R.py(b.y));ctx.stroke();ctx.globalAlpha=1;}}},
  stat:{name:'Stale Stat',hp:40,dmg:10,w:1,h:1.6,col:0x9db4ff,cost:2,anch:1,sparks:2,
    draw(ctx,e){const s=e.s;if(s.m!=='aim')return;ctx.strokeStyle='#FF3B5C';ctx.globalAlpha=.75;ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(R.px(e.x),R.py(e.y+1.5));const dx=s.tx-e.x,dy=s.ty-e.y-1.5;ctx.lineTo(R.px(e.x+dx*3),R.py(e.y+1.5+dy*3));ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;}},
  gremlin:{name:'Loop Gremlin',hp:38,dmg:12,w:.9,h:.9,col:0xff8a3d,cost:2,kb:.5,sparks:2,anim(e){e.node.p.loop.r=e.s.m==='run'?G.t*20:0;}}
};

// ---------- enemy behaviour strategies: AI[name] = {init(e), update(e,dt)} ----------
function flyerAI(o){return {init(e){e.s={m:'drift',t:rnd(.6,2),ph:rnd(0,6),side:pick([-1,1])};e.y=e.y||rnd(2,3.5);},
  update(e,dt){const p=G.p,s=e.s;s.t-=dt;s.ph+=dt*o.wob;
    if(s.m==='drift'){const tx=p.x+s.side*o.dist+Math.sin(s.ph*.7)*1.2,ty=p.y+o.alt+Math.sin(s.ph)*.6;e.vx=clamp(tx-e.x,-1,1)*o.spd;e.vy=clamp(ty-e.y,-1,1)*o.spd*.8;e.face=toP(e);
      if(s.t<=0&&Math.abs(p.x-e.x)<8){s.m='wind';s.t=o.wind;AU.sfx('tele');}}
    else if(s.m==='wind'){e.tell=1;e.vx=-e.face*1.4;e.vy=1;if(s.t<=0){const dx=p.x-e.x,dy=p.y+.6-e.y,d=Math.hypot(dx,dy)||1;s.dx=dx/d;s.dy=dy/d;s.m='lunge';s.t=o.len;}}
    else{e.vx=s.dx*o.lunge;e.vy=s.dy*o.lunge;e.hot=true;if(s.t<=0){s.m='drift';s.t=rnd(o.gap,o.gap*1.8);s.side=-s.side;}}}};}
const AI={
  still:{init(){},update(e){e.vx=0;if(e.hp<e.mhp-400)e.hp=e.mhp;}},
  wisp:flyerAI({spd:2.6,dist:3.4,alt:2.3,wob:3,wind:.6,len:.5,lunge:12,gap:1.5}),
  moth:flyerAI({spd:4.4,dist:2.4,alt:2.8,wob:6,wind:.42,len:.4,lunge:13,gap:1}),
  creeper:{init(e){e.s={t:rnd(.5,1.5),g:0,m:'walk'};e.gen=e.gen||0;},
    update(e,dt){const p=G.p,s=e.s;e.hot=true;s.g+=dt;s.t-=dt;
      if(s.g>3.5&&e.sz<1.7&&!e.gen){s.g=0;e.sz+=.24;e.w=e.def.w*e.sz;e.h=e.def.h*e.sz;e.mhp+=10;e.hp+=10;e.dmg+=1.5;FX.ring(e.x,e.y+e.h/2,0x6bbf7a,1.4*e.sz,.4);FX.num(e.x,e.y+e.h+.3,'Grows','#6BBF7A',.8);}
      if(s.m==='walk'){e.face=toP(e);e.vx=e.face*1.7;e.node.sy=1;if(Math.abs(p.x-e.x)<2.8&&s.t<=0&&e.ground){s.m='wind';s.t=.45;}}
      else if(s.m==='wind'){e.vx=0;e.tell=1;e.node.sy=.8;if(s.t<=0){s.m='hop';e.vy=9;s.vx=clamp((p.x-e.x)*1.6,-7,7);e.node.sy=1.2;s.t=.2;}}
      else{e.vx=s.vx;if(e.ground&&s.t<=0){s.m='walk';s.t=rnd(1,1.8);FX.burst(e.x,0,0x6bbf7a,5,4,{up:2});}}}},
  flooder:{init(e){e.s={t:rnd(1,2.2),m:'move',n:0};},
    update(e,dt){const p=G.p,s=e.s,ad=Math.abs(p.x-e.x);s.t-=dt;e.face=toP(e);
      if(s.m==='move'){e.vx=ad<5?-e.face*2:ad>8?e.face*1.8:0;if(s.t<=0&&ad<13){s.m='wind';s.t=.55;AU.sfx('tele');}}
      else if(s.m==='wind'){e.vx=0;e.tell=1;if(s.t<=0){s.m='fire';s.n=6;s.t=0;}}
      else{e.vx=0;if(s.t<=0){s.t=.13;s.n--;eShot(e,p.x+rnd(-1.2,1.2),p.y+.8+rnd(-.6,1),7.5,{shape:'bars',size:.2,spin:6});if(s.n<=0){s.m='move';s.t=rnd(2,3);}}}}},
  mimic:{init(e){e.disg=true;e.spawn=0;e.s={t:rnd(9,13),m:'hide'};},
    update(e,dt){const p=G.p,s=e.s;s.t-=dt;
      if(s.m==='hide'){e.vx=0;if(s.t<=0||(Math.abs(p.x-e.x)<1&&Math.abs(p.y-e.y)<1.4)||G.w.ents.every(o=>o.disg||o.dead))e.def.reveal(e);return;}
      e.face=toP(e);
      if(s.m==='wait'){e.vx=0;if(s.t<.3)e.tell=1;if(s.t<=0&&e.ground){s.m='hop';e.vy=9.5;s.vx=clamp((p.x-e.x)*1.5,-8,8);s.t=.15;}}
      else{e.vx=s.vx;e.hot=true;if(e.ground&&s.t<=0){s.m='wait';s.t=rnd(.7,1.2);}}}},
  yesman:{init(e){e.s={t:1,m:'walk',h:rnd(2,4),turn:0,beam:null};},
    update(e,dt){const p=G.p,s=e.s,dir=toP(e);s.t-=dt;s.h-=dt;if(s.beam)s.beam.t-=dt;
      if(dir!==e.face){s.turn+=dt;if(s.turn>.7){e.face=dir;s.turn=0;}}else s.turn=0;
      if(s.h<=0){s.h=4;let b=null;for(const o of G.w.ents)if(o!==e&&!o.dead&&!o.boss&&!o.disg&&o.hp<o.mhp&&Math.abs(o.x-e.x)<7&&(!b||o.hp/o.mhp<b.hp/b.mhp))b=o;
        if(b){b.hp=Math.min(b.mhp,b.hp+10);FX.num(b.x,b.y+b.h+.3,'+10','#37E2B8',.8);FX.burst(b.x,b.y+b.h/2,0x37e2b8,6,3,{up:3,g:-2});s.beam={x:b.x,y:b.y+b.h/2,t:.35};AU.sfx('heal');FX.num(e.x,e.y+e.h+.4,'Great idea!','#F2C14E',.8);}}
      if(s.m==='walk'){e.vx=e.face*1.5;if(Math.abs(p.x-e.x)<2&&dir===e.face&&s.t<=0){s.m='wind';s.t=.5;}}
      else if(s.m==='wind'){e.vx=-e.face*.6;e.tell=1;if(s.t<=0){s.m='bash';s.t=.28;}}
      else{e.vx=e.face*9;e.hot=true;if(s.t<=0){s.m='walk';s.t=1.4;}}}},
  stat:{init(e){e.s={t:rnd(1,2),m:'idle'};},
    update(e,dt){const p=G.p,s=e.s;s.t-=dt;e.vx=0;
      if(s.m==='idle'){e.face=toP(e);if(s.t<=0){s.m='aim';s.t=.7;s.tx=p.x;s.ty=p.y+.8;AU.sfx('tele');}}
      else{e.tell=1;if(s.t<=0){C.shot({team:'e',x:e.x,y:e.y+1.5,vx:(s.tx-e.x)/Math.hypot(s.tx-e.x,s.ty-e.y-1.5)*15,vy:(s.ty-e.y-1.5)/Math.hypot(s.tx-e.x,s.ty-e.y-1.5)*15,dmg:e.dmg,c:0x9db4ff,shape:'bars',size:.3,r:.3,life:3,src:e});AU.sfx('eshot');s.m='idle';s.t=1.5;}}}},
  gremlin:{init(e){e.s={t:rnd(.6,1.2),m:'idle',v:7,d:1};},
    update(e,dt){const s=e.s;s.t-=dt;
      if(s.m==='idle'){e.vx=0;e.face=toP(e);if(s.t<=0){s.m='wind';s.t=.5;AU.sfx('tele');}}
      else if(s.m==='wind'){e.tell=1;e.vx=-e.face;if(s.t<=0){s.m='run';s.d=e.face;s.t=2.4;e.wall=0;}}
      else{e.vx=s.d*s.v;e.hot=true;if(e.wall===s.d||s.t<=0){if(e.wall){e.stun=1.6;FX.burst(e.x,e.y+.5,0xff8a3d,10,6);AU.sfx('clank');R.cam.shake=Math.max(R.cam.shake,.15);FX.num(e.x,e.y+1.3,'Dizzy','#FF8A3D',.8);}s.m='idle';s.t=.5;s.v=Math.min(15,s.v+2.5);}}}}
};

// ---------- scenery: props are part lists, themes say what goes where ----------
const PROP={
  tree:(a,b)=>()=>[P('cyl',0,.9,.36,1.8,0x7a4a21),P('sph',0,2.5,2.2,2,a),P('sph',-.7,2,1.4,1.3,b,{z:.3}),P('sph',.7,2.1,1.3,1.2,b,{z:-.3})],
  pine:(a,b)=>()=>[P('cyl',0,.5,.3,1,0x6b4423),P('cone',0,1.8,1.9,2,a),P('cone',0,3,1.4,1.7,b)],
  hill:a=>()=>[P('sph',0,0,9,5,a,{d:6})],
  peak:(a,b)=>()=>[P('cone',0,3.5,7,7,a,{d:5}),P('cone',0,6,2.2,2,b,{d:1.6})],
  rock:a=>()=>[P('sph',0,.35,1.3,.9,a),P('sph',.6,.22,.7,.5,a,{z:.3})],
  bush:(a,b)=>()=>[P('sph',0,.4,1.3,.9,a),P('sph',.55,.3,.8,.6,b,{z:.2})],
  tuft:a=>()=>[P('cone',-.15,.25,.14,.5,a,{r:.2}),P('cone',0,.32,.14,.64,a),P('cone',.16,.24,.14,.48,a,{r:-.25})],
  flower:(a,b)=>()=>[P('cyl',0,.25,.05,.5,0x3f8f4f),P('sph',0,.55,.28,.28,a,{e:1}),P('sph',0,.55,.12,.12,b,{z:.1,e:1})],
  house:(a,b)=>()=>[P('box',0,1.3,3,2.6,a,{d:2.4}),P('cone',0,3.3,3.9,1.6,b,{d:3.2}),P('box',-.6,.7,.7,1.4,0x7a4a21,{z:1.22,d:.06}),P('box',.7,1.6,.7,.7,0xfff1a8,{z:1.22,d:.06,e:1}),P('box',.9,3.6,.4,1,a,{d:.4})],
  tower:(a,b)=>()=>[P('cyl',0,2.5,2,5,a),P('cone',0,5.9,2.6,1.9,b),P('box',0,3.4,.5,.8,0xfff1a8,{z:.95,d:.2,e:1})],
  lamp:()=>()=>[P('cyl',0,1.2,.1,2.4,0x201a4b),P('box',0,2.4,.5,.08,0x201a4b),P('sph',0,2.6,.42,.42,0xffe28a,{e:1})],
  stall:(a,b)=>()=>[P('box',0,.5,2.4,1,0xa8622e,{d:1.2}),P('cyl',-1.1,1.4,.1,1.8,0x7a4a21),P('cyl',1.1,1.4,.1,1.8,0x7a4a21),P('box',0,2.3,2.8,.3,a,{d:1.6,r:.06}),P('box',0,2.05,2.8,.2,b,{d:1.6,r:.06}),P('sph',-.5,1.15,.34,.34,0xff8a3d,{z:.3}),P('sph',.3,1.15,.34,.34,0x37e2b8,{z:.3})],
  lantern:a=>()=>[P('cyl',0,2.9,.03,1.4,0x201a4b),P('sph',0,2.1,.5,.6,a,{e:1})],
  crystal:(a,b)=>()=>[P('cone',0,.9,.7,1.8,a,{e:1}),P('cone',.4,.5,.4,1,b,{r:-.35,e:1}),P('cone',-.35,.4,.35,.8,b,{r:.3,e:1})],
  pillar:a=>()=>[P('box',0,.15,1.1,.3,a,{d:1.1}),P('cyl',0,1.8,.7,3,a),P('box',0,3.45,1.1,.3,a,{d:1.1})],
  shelf:(a)=>()=>[P('box',0,2,2.6,4,a,{d:.8}),P('box',-.6,3.2,.9,.6,0xff5d73,{z:.41,d:.05}),P('box',.5,3.2,.8,.6,0x4fd8ff,{z:.41,d:.05}),P('box',-.3,2.2,1.4,.6,0xffc53d,{z:.41,d:.05}),P('box',.4,1.2,1.2,.6,0xb388ff,{z:.41,d:.05}),P('box',-.7,1.2,.6,.6,0x37e2b8,{z:.41,d:.05})],
  pages:()=>()=>[P('box',0,.2,1.4,.4,0xf3eeff,{d:1}),P('box',.1,.55,1.3,.3,0xe4dbff,{d:1,r:.08}),P('box',-.1,.85,1.2,.3,0xffffff,{d:1,r:-.06})],
  quillp:a=>()=>[P('cyl',0,1.5,.12,3,0xf3eeff,{r:.25}),P('box',-.5,2.6,.8,1.6,a,{r:.25,d:.05})],
  pipe:(a,b)=>()=>[P('cyl',0,1.6,.6,3.2,a),P('cyl',0,3.3,.9,.3,b),P('cyl',1.2,2,.5,2.4,a,{r:1.57}),P('sph',2.4,2,.6,.6,0xff8a3d,{e:1})],
  gear:(a)=>()=>[P('cyl',0,1.6,2.6,.5,a,{r:1.57,d:2.6}),P('box',0,1.6,3.2,.5,a,{d:.5}),P('box',0,1.6,.5,3.2,a,{d:.5}),P('box',0,1.6,3.2,.5,a,{d:.5,r:.785}),P('box',0,1.6,.5,3.2,a,{d:.5,r:.785}),P('sph',0,1.6,.7,.7,0x201a4b,{z:.3})],
  wire:(a)=>()=>[P('cyl',0,2.5,.14,5,0x3a3170),P('box',1.5,4.4,3.2,.08,a,{r:-.2,e:1}),P('box',-1.5,3.8,3.2,.08,a,{r:.25,e:1}),P('sph',0,5,.4,.4,a,{e:1})],
  cloud:()=>()=>[P('sph',0,0,6,2,0xffffff,{e:1}),P('sph',2.4,.5,3.6,1.8,0xffffff,{e:1}),P('sph',-2.6,.3,3.4,1.5,0xffffff,{e:1})],
  drip:(a)=>()=>[P('box',0,3,.12,6,a,{e:1}),P('sph',0,.2,1.4,.3,a,{e:1})],
  wave:(a,b)=>()=>[P('sph',0,0,8,3,a,{d:3}),P('sph',3,.4,4,2.4,b,{d:2})],
  cliff:(a,b)=>()=>[P('box',0,3,5,6,a,{d:4}),P('box',1.6,5,3,3.4,b,{d:3}),P('box',-1.8,1.6,2.4,3.2,b,{d:3,z:1})],
  fountain:()=>()=>[P('cyl',0,.3,3.4,.6,0xcfc6f0),P('cyl',0,.62,3,.1,0x7cd8ff,{e:1}),P('cyl',0,1.2,.5,1.4,0xcfc6f0),P('sph',0,2.1,.9,.9,0xffc53d,{e:1})],
  bunting:()=>()=>{const a=[P('box',0,4.2,9,.05,0x201a4b)],c=[0xff5d73,0xffc53d,0x37e2b8,0x4fd8ff,0xb388ff];for(let i=0;i<8;i++)a.push(P('cone',-3.9+i*1.1,3.95,.45,.5,c[i%5],{r:3.14,e:1}));return a;}
};
const THEME={
  hub:{env:{sky:[0x6fc3ff,0xffe9bf],fog:0xdff1ff,near:26,far:110,amb:.85,sun:.75},top:0x8fd97a,front:0xb9824e,
    layers:[[-48,16,1.6,[PROP.cloud()],9],[-34,13,1.5,[PROP.hill(0x9fe08a),PROP.hill(0x86d47a)]],[-17,6,1.3,[PROP.tree(0x5fc46b,0x7fdc84),PROP.tree(0xffb3c7,0xffd0dc),PROP.tower(0xf3eeff,0xff5d73)]],
      [-9,7.5,1,[PROP.house(0xfff1dc,0xff8a3d),PROP.house(0xf3eeff,0x4fd8ff),PROP.house(0xffe9bf,0xb388ff),PROP.house(0xe4dbff,0xff5d73)]],[-4.5,5,1,[PROP.lamp(),PROP.bush(0x5fc46b,0x7fdc84),PROP.flower(0xff5d73,0xffc53d),PROP.flower(0xffc53d,0xff8a3d)]],[3.6,7,1,[PROP.tuft(0x4c9a4c),PROP.flower(0xf7a8ff,0xffffff)]]]},
  meadow:{env:{sky:[0x8a84c9,0xf2c9d8],fog:0xc9c4e8,near:14,far:70,amb:.7,sun:.6,speck:60},top:0x7fbf86,front:0x9a7b5c,plat:0x9a8c6a,
    layers:[[-34,12,1.5,[PROP.hill(0x9a9bd0),PROP.hill(0x8387c4)]],[-16,5.5,1.3,[PROP.tree(0x6aa98a,0x86c4a0),PROP.pine(0x5a9a82,0x74b89a)]],[-5,4,1,[PROP.bush(0x6aa98a,0x86c4a0),PROP.rock(0x9a96b8),PROP.flower(0xc9c3f5,0xffffff)]],[3.6,6,1,[PROP.tuft(0x3f7f5a)]]]},
  market:{env:{sky:[0x3a2a6b,0xff9e7a],fog:0x8a5f8f,near:14,far:70,amb:.6,sun:.5,sunc:0xffc9a0,speck:40},top:0xc79a6b,front:0xa9744e,plat:0xa8622e,
    layers:[[-34,12,1.5,[PROP.peak(0x5a4a8f,0x8a7ac0),PROP.tower(0x6a5a9f,0xff8a3d)]],[-15,6,1.3,[PROP.house(0x9a7ab0,0xff8a3d),PROP.tower(0x8a6aa8,0xffc53d)]],[-5,4.5,1,[PROP.stall(0xff5d73,0xffffff),PROP.stall(0x37e2b8,0xffffff),PROP.lantern(0xffc53d),PROP.lantern(0xff8a3d)]],[3.8,8,1,[PROP.lantern(0xff5d73)]]]},
  thicket:{env:{sky:[0x12332e,0x5fae8a],fog:0x2f6b5a,near:10,far:55,amb:.55,sun:.45,sunc:0xbfffd0,speck:50},top:0x3f7f4f,front:0x5a4632,plat:0x5a7a3a,
    layers:[[-30,8,1.8,[PROP.pine(0x1f4f44,0x2a6354),PROP.tree(0x1f4f44,0x2a6354)]],[-14,4,1.5,[PROP.tree(0x2f6b4f,0x3f8f60),PROP.pine(0x2f6b4f,0x3f8f60)]],[-5,3,1.1,[PROP.bush(0x3f8f60,0x5fae7a),PROP.tree(0x3f8f60,0x5fae7a),PROP.crystal(0x6bff9a,0xc6f432)]],[3.6,5,1,[PROP.tuft(0x1f4f34),PROP.tuft(0x2a5a3a)]]]},
  cliffs:{env:{sky:[0xc9b8a0,0xf2e6d0],fog:0xe0d4bf,near:12,far:65,amb:.8,sun:.6,sunc:0xfff0d8,speck:30},top:0xcbb894,front:0xa8906a,plat:0xb8a680,
    layers:[[-34,10,1.6,[PROP.cliff(0xbfae8f,0xcdbd9f)]],[-15,6,1.3,[PROP.cliff(0xb0a080,0xc4b494),PROP.pillar(0xd9ccb0)]],[-5,4.5,1,[PROP.rock(0xbfae8f),PROP.quillp(0xd9c7a3),PROP.pages()]],[3.6,7,1,[PROP.rock(0x8f7f60)]]]},
  draft:{env:{sky:[0x2b2466,0xe4dbff],fog:0xb9aee8,near:12,far:65,amb:.75,sun:.55,speck:80},top:0xf3eeff,front:0xcfc4f2,plat:0xffffff,
    layers:[[-32,9,2.4,[PROP.pages(),PROP.quillp(0xf7a8ff)]],[-15,5,1.8,[PROP.quillp(0xff5d73),PROP.pillar(0xe4dbff),PROP.pages()]],[-5,4,1,[PROP.pages(),PROP.quillp(0x2ec4b6),PROP.lantern(0xf7a8ff)]],[3.6,7,1,[PROP.pages()]]]},
  archive:{env:{sky:[0x1c2a4a,0x6a86b8],fog:0x4a6290,near:12,far:60,amb:.6,sun:.45,sunc:0xcfe0ff,speck:50},top:0x5a6a8f,front:0x33405f,plat:0x7d8fd6,
    layers:[[-30,6,2.2,[PROP.shelf(0x2c3a5f)]],[-14,4.6,1.5,[PROP.shelf(0x3a4a6f),PROP.pillar(0x6a7aa8)]],[-5,4.5,1,[PROP.shelf(0x4a5680),PROP.lamp(),PROP.pages()]],[3.8,8,1,[PROP.pages()]]]},
  deluge:{env:{sky:[0x0f2a4a,0x3f8fbf],fog:0x2a6a9a,near:9,far:50,amb:.55,sun:.4,sunc:0xbfe9ff,speck:120},top:0x3a7fae,front:0x24597f,plat:0x5eead4,
    layers:[[-30,9,1.6,[PROP.wave(0x2a6a9a,0x3f8fbf)]],[-14,3.2,1.6,[PROP.drip(0x7cd8ff),PROP.pillar(0x3f6f9f)]],[-5,3.5,1,[PROP.drip(0xbfe9ff),PROP.rock(0x3f6f9f),PROP.crystal(0x5eead4,0x9db4ff)]],[3.8,6,1,[PROP.drip(0x7cd8ff)]]]},
  foundry:{env:{sky:[0x1a0f1f,0xbf4a2a],fog:0x5a2a2a,near:10,far:55,amb:.5,sun:.45,sunc:0xffb080,speck:60},top:0x5a4a4a,front:0x3f2e2e,plat:0x8a6a5a,
    layers:[[-30,9,2,[PROP.gear(0x4a3030),PROP.pipe(0x4a3030,0x6a4040)]],[-14,6,1.4,[PROP.pipe(0x6a4a4a,0x8a5a4a),PROP.gear(0x7a5a4a)]],[-5,4.5,1,[PROP.pipe(0x8a6a5a,0xa87a5a),PROP.crystal(0xff8a3d,0xffc53d),PROP.rock(0x5a4a4a)]],[3.8,8,1,[PROP.rock(0x2a1a1a)]]]},
  tangle:{env:{sky:[0x0f1030,0x3d2a8f],fog:0x2a2466,near:10,far:55,amb:.55,sun:.4,sunc:0xc7b0ff,speck:70},top:0x3a3170,front:0x241d55,plat:0x7c5cff,
    layers:[[-30,7,2,[PROP.wire(0x3da5ff),PROP.wire(0xc77dff)]],[-14,5,1.5,[PROP.wire(0x7cff8a),PROP.pillar(0x3a3170),PROP.wire(0x3da5ff)]],[-5,4.5,1,[PROP.wire(0xc77dff),PROP.crystal(0x3da5ff,0x7cff8a),PROP.rock(0x3a3170)]],[3.8,8,1,[PROP.rock(0x12102b)]]]}
};
function buildScenery(th,x0,x1,plats){const T=THEME[th],cx=(x0+x1)/2,ww=Math.ceil((x1-x0+90)/12)*12;R.setEnv(T.env);
  // floor: three depth bands for the top surface, then a tiled earth face just in front of the play line
  R.add(mk([P('box',0,-15,ww*1.6,30,mix(T.top,0x000000,.06),{d:.2})],cx,0,-9,{st:true}));R.add(mk([P('box',0,-15,ww*1.3,30,T.top,{d:.2})],cx,0,-4.4,{st:true}));R.add(mk([P('box',0,-15,ww*1.1,30,mix(T.top,0xffffff,.1),{d:.2})],cx,0,-1.3,{st:true}));
  const tiles=[P('box',0,-17.9,ww,30,T.front,{d:.2,e:1})];for(let x=-ww/2;x<ww/2;x+=6)tiles.push(P('img',x+3,-1.5,6.03,3,0,{img:tileTex(T.top,T.front),op:1,z:.05}));R.add(mk(tiles,cx,0,.75,{st:true}));
  for(const L of T.layers){const z=L[0],m=(z<-20?40:z<-10?24:10);for(let x=x0-m;x<x1+m;x+=L[1]*rnd(.65,1.35)){if(z>0&&Math.random()<.35)continue;R.add(mk(pick(L[3])(),x,L[4]?L[4]+rnd(-2,3):z>0?-.55:0,z+rnd(-1,1)*(z>0?.3:1),{s:L[2]*rnd(.8,1.25)*(z>0?.8:1),st:true}));}}
  for(const q of plats||[]){const w=q.x1-q.x0;R.add(mk([P('rbox',0,-.2,w+.1,.4,T.top,{d:1.7}),P('img',0,-.5,w+.3,1.1,0,{img:platTex(T.top,T.front),z:.87})],(q.x0+q.x1)/2,q.y,0,{st:true}));}
  // walls of Static at the arena ends
  for(const x of[x0-1.4,x1+1.4])R.add(mk([P('box',0,5,2.4,10,mix(T.env.fog,0x201a4b,.45),{d:6}),P('box',0,5,2.6,10,mix(T.env.fog,0x201a4b,.6),{d:.2,z:3.2})],x,0,0,{st:true}));
}
