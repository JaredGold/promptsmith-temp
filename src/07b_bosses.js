// ---------- bosses ----------
// BOSS[id]: stats, the patterns it mixes, and one quirk. PATTERN[name] = {start(b,s), update(b,s,dt) -> done}.
const leg2=(c)=>[P('cap',-.4,.3,.44,.6,c),P('cap',.4,.3,.44,.6,c,{z:.1})];
Object.assign(MODEL,{
  b_mumbler(){return [P('sph',-.9,1,1.3,1.2,0x8c87a6,{z:-.3}),P('sph',0,1.5,2.4,2.6,0xa9a3da),P('sph',.7,2.5,1.2,1.1,0xcbc5f7,{z:-.2}),P('sph',-.5,2.7,1,1,0xb9b3e8,{z:.2}),P('sph',1.2,1,.6,.5,0x8c87a6,{z:.5}),P('sph',-1.25,1.5,.5,.44,0x8c87a6,{z:.4}),F({e:'sleepy',m:'wavy',lid:'#8C87A6',s:1.05},.28,1.55,1.8,1.26)];},
  b_liar(){return [P('cap',-.3,.4,.32,.8,0x12403a),P('cap',.3,.4,.32,.8,0x12403a,{z:.1}),P('rbox',-.55,1.4,.6,1.9,0x12403a,{z:-.35,r:-.15,d:.2}),P('cap',0,1.5,1.3,1.6,0x1f8f74,{d:.84}),P('rbox',.1,2.16,.56,.22,0xff3b5c,{z:.03,d:.88,e:1}),P('sph',0,2.62,.96,.94,0xf3eeff),F({e:'happy',m:'grin'},.08,2.58,.78,.5),
    P('cyl',0,3.08,1.4,.12,0x201a4b,{d:1.4}),P('cyl',0,3.54,.84,.9,0x201a4b),P('cyl',0,3.24,.88,.16,0x37e2b8,{e:1}),P('cap',.8,1.75,.26,.9,0x1f8f74,{z:.45,r:1.25}),P('sph',1.25,1.9,.3,.3,0xf3eeff,{z:.46})];},
  b_hydra(){return leg2(0x2f6b3d).concat([P('sph',-.9,.8,1.4,1.2,0x3f8f50,{z:-.3}),P('sph',0,1.1,2.8,2,0x4f9e60),P('sph',.3,.8,1.6,1,0x86d695,{z:.3,d:1.8}),
    P('cap',-.9,2.1,.5,1.5,0x6bbf7a,{r:.7,n:'n3',vis:false}),P('sph',-1.5,2.75,.95,.8,0x86d695,{n:'h3',vis:false}),P('img',-1.45,2.75,.7,.7,0,{img:faceTex({e:'angry',m:'frown',c:'#B3122F'}),z:.42,n:'f3',vis:false}),
    P('cap',-.2,2.5,.5,1.8,0x6bbf7a,{r:.1,n:'n2',vis:false}),P('sph',-.3,3.5,.95,.8,0x86d695,{n:'h2',vis:false}),P('img',-.24,3.5,.7,.7,0,{img:faceTex({e:'angry',m:'frown',c:'#B3122F'}),z:.42,n:'f2',vis:false}),
    P('cap',.6,2.3,.55,1.7,0x6bbf7a,{r:-.5}),P('sph',1.2,3.1,1.1,.9,0x86d695),F({e:'angry',m:'teeth',c:'#B3122F'},1.27,3.08,.84,.47)]);},
  b_baron(){return leg2(0x7a6a4a).concat([P('cap',0,1.4,1.5,1.7,0xcdb891,{d:.95}),P('rbox',.05,1.6,.26,.9,0x9a8b6a,{z:.03,d:1}),P('sph',0,2.66,1.04,1.02,0xe6d5b0),F({e:'dot',m:'flat',brow:1},.08,2.62,.8,.54),P('sph',.36,2.72,.34,.34,0xffffff,{e:1,z:.5,d:.06}),
    P('rbox',.26,2.4,.56,.14,0x7a6a4a,{z:.52,d:.1}),P('cyl',0,3.26,1.2,.3,0x9a8b6a),P('cap',0,3.52,.74,.4,0x9a8b6a),P('cap',.95,1,.12,1.8,0x5a4a2a,{z:.5,r:.15})]);},
  b_rambler(){return [P('rbox',-1.2,.6,1.4,.12,0xf3eeff,{r:.3,z:-.2,d:.9}),P('rbox',-2.2,.25,1.2,.12,0xe4dbff,{r:.15,z:-.2,d:.9}),P('cyl',0,1.5,1.5,2.6,0xf3eeff),P('cyl',0,2.85,1.8,.25,0xf7a8ff),P('cyl',0,.2,1.8,.25,0xf7a8ff),
    P('box',.1,2.1,1.1,.08,0x8c87a6,{z:.01,d:1.55}),P('box',.1,1.75,1.1,.08,0x8c87a6,{z:.01,d:1.55}),P('box',0,1.4,.9,.08,0x8c87a6,{z:.01,d:1.55}),P('box',.1,1.05,1.1,.08,0x8c87a6,{z:.01,d:1.55}),P('sph',0,3.38,.86,.84,0xffd9b0),F({e:'googly',m:'o'},.08,3.34,.66,.45)];},
  b_picker(){return [P('rbox',0,.25,1.7,.5,0x7a1f2e,{d:1}),P('cap',0,1.6,.56,2.5,0xff3b5c),P('rbox',0,3,1.3,.9,0xff3b5c,{d:.84}),F({e:'wide',m:'smile'},.1,3,.74,.44),P('cap',.9,2.5,.24,1.6,0x7a1f2e,{r:1.27,z:.3}),P('cone',1.7,2.06,.44,.5,0x7a1f2e,{r:3.14,z:.3}),P('box',1.7,1.96,.06,.3,0x3f8f4f,{z:.3}),P('sph',1.7,1.66,.54,.54,0xff3b5c,{e:1,z:.3})];},
  b_flood(){return [P('sph',-1,.8,1.6,1.4,0x2c6fb0,{z:-.3}),P('sph',0,1.3,3,2.6,0x4a9fe6),P('sph',.9,2.5,1.6,1.4,0x7cc4ff,{z:-.1}),P('sph',1.5,2.9,.9,.7,0xffffff,{e:1}),P('sph',-.6,2.4,.7,.5,0xffffff,{e:1,z:.2}),F({e:'angry',m:'o',c:'#12406E'},.45,1.6,1.7,1.52)];},
  b_loop(){return [P('cap',-.5,.12,.5,.24,0x8a3d10),P('cap',.5,.12,.5,.24,0x8a3d10),P('sph',0,1.4,2.5,2.5,0xff8a3d,{d:.9}),P('sph',0,1.4,1.5,1.5,0xffc98a,{d:1,z:.01}),P('cone',1.05,2.3,.5,.6,0xffe28a,{r:-2.2,e:1,z:.03}),P('cone',-1.05,.5,.5,.6,0xffe28a,{r:.9,e:1,z:.03}),F({e:'wide',m:'teeth'},.08,1.4,1.3,.53)];},
  b_tangle(){return leg2(0x201a4b).concat([P('rbox',0,1.6,3,.3,0x3da5ff,{r:-.6,d:.3,e:1,z:-.3}),P('rbox',0,1.6,2.6,.25,0xc77dff,{r:1.2,d:.3,e:1,z:-.35}),P('sph',0,1.6,2.2,2.2,0x3a3170),F({e:'angry',m:'wavy',c:'#7C3DFF'},.15,1.62,1.5,1.12),P('rbox',0,1.6,3,.3,0xc77dff,{r:.5,d:.3,e:1,z:1.14}),P('rbox',0,1.6,.3,3,0x7cff8a,{r:.2,d:.3,e:1,z:1.16})]);}
});
const wob=(q,dt)=>{q.y+=Math.sin(q.t*9+q.dmg)*dt*3.5;};
function rainDrop(b,x,delay){const B=b.def.B;C.tele({kind:'circ',flat:true,x,y:.05,r:1.3,m:.85+(delay||0),fire(t){FX.burst(t.x,.2,B.col,10,7,{up:4});AU.sfx('hit',.6);R.cam.shake=Math.max(R.cam.shake,.12);const p=G.p;if(Math.abs(p.x-t.x)<1.6&&p.y<2.2)C.hurt(b.dmg,b,sgn(p.x-t.x));
  C.zone({life:.22,draw(ctx,z){const a=1-z.t/z.life;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a*.8;ctx.fillStyle=hex(B.col);ctx.fillRect(R.px(t.x-.5*a),0,R.k*a,R.py(0));ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}});
  if(B.puddle)C.zone({x:t.x,life:5,upd(z){if(Math.abs(G.p.x-z.x)<1.4&&G.p.y<.4)G.p.mud=.15;},draw(ctx,z){ctx.globalAlpha=.5*Math.min(1,z.life-z.t);ctx.fillStyle='#CDB891';ctx.beginPath();ctx.ellipse(R.px(z.x),R.py(0),1.4*R.k,.22*R.k,0,0,6.283);ctx.fill();ctx.globalAlpha=1;}});}});}
const PATTERN={
  slam:{start(b,s){s.t=s.m=.85;s.x=clamp(G.p.x,G.w.x0+2,G.w.x1-2);s.x0=b.x;AU.sfx('tele');C.tele({kind:'rect',x0:s.x-2.4,x1:s.x+2.4,y0:0,y1:1.6,m:.85,fire(){}});},
    update(b,s,dt){s.t-=dt;b.vx=0;b.vy=0;b.tell=1;const k=clamp(1-s.t/s.m,0,1);b.x=lerp(s.x0,s.x,k);b.y=Math.sin(k*Math.PI)*4.5;
      if(s.t<=0){b.y=0;hitTele({kind:'rect',x0:s.x-2.4,x1:s.x+2.4,y0:0,y1:1.6},b.dmg*1.3,b);FX.ring(b.x,.2,b.def.col,3.2,.4,.3);FX.burst(b.x,.2,b.def.col,18,10,{up:4});AU.sfx('heavy');R.cam.shake=.5;buzz(35);return true;}}},
  volley:{start(b,s){const B=b.def.B;s.n=B.vol+(b.s.heads||0);s.t=.6;s.b=2+(b.s.ramble||0);AU.sfx('tele');},
    update(b,s,dt){s.t-=dt;b.vx=0;b.face=toP(b);b.tell=1;
      if(s.t<=0){const p=G.p,n=s.n,B=b.def.B,a0=Math.atan2(p.y+.8-(b.y+b.h*.6),p.x-b.x);for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*.22,sp=B.cherry?14:9.5;C.shot({team:'e',x:b.x+b.face*b.w*.3,y:b.y+b.h*.6,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dmg:b.dmg*(B.cherry?1.3:.8),c:B.col,shape:'dot',size:B.cherry?.5:.3,r:B.cherry?.5:.32,life:4,src:b,upd:B.wob?wob:null});}
        AU.sfx('eshot');s.b--;s.t=.55;if(s.b<=0)return true;}}},
  rain:{start(b,s){s.n=5+G.run.tier;s.t=.2;AU.sfx('tele');},
    update(b,s,dt){s.t-=dt;b.vx=0;if(s.t<=0){s.t=.28;s.n--;const p=G.p;rainDrop(b,clamp(s.n%2?p.x+p.vx*.5:p.x+rnd(-6,6),G.w.x0+1,G.w.x1-1));if(s.n<=0)return true;}}},
  charge:{start(b,s){s.t=.75;s.d=toP(b);b.face=s.d;s.ph=0;AU.sfx('tele');C.tele({kind:'rect',wide:true,x0:s.d>0?b.x:G.w.x0,x1:s.d>0?G.w.x1:b.x,y0:0,y1:b.h*.8,m:.75,fire(){}});},
    update(b,s,dt){s.t-=dt;if(s.ph===0){b.vx=-s.d*1.5;b.tell=1;if(s.t<=0){s.ph=1;s.t=2;AU.sfx('roar');b.wall=0;}}
      else{b.vx=s.d*19;b.hot=true;if(Math.random()<.5)FX.burst(b.x,b.y+.3,b.def.col,1,3,{up:2});if(b.wall===s.d||s.t<=0){b.vx=0;R.cam.shake=.4;AU.sfx('heavy');b.stun=.9;FX.burst(b.x+s.d,b.y+1,b.def.col,14,8);return true;}}}},
  summon:{start(b,s){s.t=.7;AU.sfx('roar');},
    update(b,s,dt){s.t-=dt;b.vx=0;b.tell=1;if(s.t<=0){const k=b.def.B.adds||'wisp',n=Math.min(2+(b.s.heads?1:0),4-G.w.ents.filter(e=>!e.boss&&!e.dead).length);for(let i=0;i<n;i++)spawnEnemy(k,clamp(b.x+rnd(-6,6),G.w.x0+1,G.w.x1-1),ENEMY[k].fly?3:0);return true;}}},
  wave:{start(b,s){s.t=.6;s.n=b.def.B.waves||1;s.i=0;AU.sfx('tele');C.tele({kind:'rect',low:true,wide:true,x0:G.w.x0,x1:G.w.x1,y0:0,y1:.7,m:.6,fire(){}});},
    update(b,s,dt){s.t-=dt;b.vx=0;b.tell=1;if(s.t<=0){const hi=b.def.B.hiwave&&s.i%2===1,y=hi?2.5:.45;for(const d of[-1,1])C.shot({team:'e',x:b.x+d,y,vx:d*9.5,vy:0,dmg:b.dmg,c:b.def.col,shape:'wave',size:.55,r:.5,life:4,float:true,low:!hi,src:b});
        AU.sfx('heavy');R.cam.shake=Math.max(R.cam.shake,.2);s.i++;s.n--;s.t=.9;if(s.n<=0)return true;AU.sfx('tele');}}}
};
const BOSS={
  mumbler:{name:'The Mumbler',line:'It asks for "something, sort of".',hp:830,dmg:11,w:2,h:2.8,col:0xa59fd6,pats:['slam','volley','summon'],adds:'wisp',vol:3,wob:1,keep:5,spd:1.6,gap:1.7,
    order:{parts:['Write a packing list','for a 3-day hike in October','as a checklist grouped by bag.','Keep it under 20 items.'],why:'What, about what, in what shape, and how much.'}},
  liar:{name:'The Confident Liar',line:'Every word sounds sure. Half are made up.',hp:870,dmg:12,w:1.8,h:3,col:0x37e2b8,pats:['volley','charge','summon'],adds:'mimic',vol:4,keep:6,spd:2,gap:1.6,
    after(b){if(Math.random()<.45&&G.w.ents.filter(e=>e.decoy).length<2){FX.burst(b.x,1.5,0x37e2b8,16,8);const ox=b.x;b.x=clamp(G.p.x+(G.p.x>G.w.x0+15?-9:9),G.w.x0+2,G.w.x1-2);for(const x of[ox,clamp(G.p.x+rnd(-5,5),G.w.x0+2,G.w.x1-2)])spawnEnemy('decoy',x,0,{decoy:true,spawn:.2});tip('decoy','Which one is real? Verify clears the fakes.');}},
    order:{parts:['<report>...the full report...</report>','First, quote the lines about refunds.','Then answer using only those quotes.','If the report doesn\'t say, tell me so.'],why:'Source first, quotes next, answer last, with a way out.'}},
  hydra:{name:'Scope Creep Hydra',line:'One small request. Then another. Then another.',hp:910,dmg:12,w:2.6,h:3.2,col:0x6bbf7a,pats:['slam','wave','summon','volley'],adds:'creeper',vol:3,keep:5,spd:1.4,gap:1.6,
    onPhase(b){b.s.heads=(b.s.heads||0)+1;const P=b.node.p;if(b.s.heads===1){P.n2.vis=P.h2.vis=P.f2.vis=true;}else{P.n3.vis=P.h3.vis=P.f3.vis=true;}FX.num(b.x,b.y+4.2,'Another head!','#6BBF7A',1.2);},
    order:{parts:['1) Outline the guide in 5 lines.','2) Wait for my OK.','3) Draft section 1 only.','4) Stop and show me.'],why:'Small approved steps keep the scope from creeping.'}},
  baron:{name:'The Beige Baron',line:'In today\'s fast-paced world...',hp:910,dmg:13,w:2,h:3,col:0xcdb891,pats:['wave','rain','summon'],adds:'moth',vol:3,puddle:1,keep:6,spd:1.6,gap:1.5,
    order:{parts:['Here are 2 things I wrote.','Name my voice in 3 traits.','Then write the post in that voice.','Cut any phrase everyone else uses.'],why:'Samples, then the named voice, then the draft, then the cut.'}},
  rambler:{name:'The Rambler',line:'It never gets to the point.',hp:950,dmg:13,w:2,h:3.2,col:0xf7a8ff,pats:['volley','wave','charge'],vol:3,keep:6,spd:1.8,gap:1.4,final:1,
    after(b){b.s.ramble=Math.min(3,(b.s.ramble||0)+1);},onPhase(b){b.s.ramble=0;},
    order:{parts:['Draft the article.','Review it against my 3 goals.','Cut it by a third.','List what you removed.'],why:'Draft, review, cut, and show what went.'}},
  picker:{name:'The Cherry Picker',line:'It only shows the data it likes.',hp:910,dmg:13,w:1.8,h:3,col:0xff3b5c,pats:['volley','rain','slam'],vol:1,cherry:1,keep:7,spd:1.8,gap:1.4,
    quirk(b){if(b.s.hp0==null)b.s.hp0=b.hp;if(b.s.hp0-b.hp>b.mhp*.12&&b.s.m==='idle'){b.s.hp0=b.hp;FX.burst(b.x,1.5,0xff3b5c,16,8);b.x=b.x<(G.w.x0+G.w.x1)/2?G.w.x1-3:G.w.x0+3;FX.burst(b.x,1.5,0xff3b5c,16,8);AU.sfx('portal');FX.num(b.x,4,'Picks a new spot','#FF3B5C',1);}},
    order:{parts:['<documents>...all four studies...</documents>','Quote the findings on both sides.','Say where the studies disagree.','Then give your overall read.'],why:'All the sources, both sides quoted, then the verdict.'}},
  flood:{name:'Context Flood',line:'Everything, all at once, in no order.',hp:950,dmg:13,w:2.6,h:3.2,col:0x4a9fe6,pats:['rain','wave','summon'],adds:'flooder',vol:3,keep:6,spd:1.3,gap:1.5,final:1,
    quirk(b,dt){b.s.dz=(b.s.dz||2)-dt;if(b.s.dz<=0){b.s.dz=1.5;rainDrop(b,clamp(G.p.x+rnd(-5,5),G.w.x0+1,G.w.x1-1),.2);}},
    order:{parts:['<documents>...the long files...</documents>','I\'m the finance lead.','Pull the quotes about Q3 costs.','Question: where did we overspend?'],why:'Long material on top, then who you are, quotes, and the question last.'}},
  loop:{name:'The Infinite Loop',line:'Try. Fail. Try the same thing again.',hp:910,dmg:13,w:2.2,h:2.6,col:0xff8a3d,pats:['charge','slam','volley'],vol:3,keep:5,spd:2.2,gap:1.5,
    after(b){if(!b.s.rep){b.s.rep=1;b.s.q.push(b.s.last);b.s.t=.5;FX.num(b.x,3.6,'Again!','#FF8A3D',1);}else b.s.rep=0;},
    order:{parts:['Run the tests.','If one fails, read the error and fix it.','Run the tests again.','Stop after 3 tries and report.'],why:'Give every loop a check and a way out.'}},
  tangle:{name:'The Tangle',line:'Every tool wired to every other tool.',hp:950,dmg:14,w:2.4,h:3.2,col:0xc77dff,pats:['summon','rain','wave','volley'],adds:'gremlin',vol:4,hiwave:1,waves:2,keep:6,spd:1.5,gap:1.4,final:1,
    order:{parts:['Use the Drive connector to find the spec.','Give each module its own sub-agent.','Each returns: status, risks, next step.','Ask me before changing any file.'],why:'Fetch, split the work, fix the return shape, keep approval for actions.'}}
};
for(const k in BOSS){const B=BOSS[k];ENEMY['b_'+k]={name:B.name,hp:B.hp,dmg:B.dmg,w:B.w,h:B.h,boss:1,col:B.col,ai:'boss',B};}
ENEMY.decoy={name:'Decoy',hp:1,dmg:0,w:1.8,h:3,col:0x37e2b8,ai:'decoy',model:'b_liar',B:BOSS.liar};
AI.decoy={init(e){e.s={t:7};},update(e,dt){e.vx=0;e.face=toP(e);e.s.t-=dt;if(e.s.t<=0)C.kill(e,{});}};
AI.boss={init(e){e.s={m:'idle',t:1.8,q:[],pat:null,ps:null,last:null};},
  update(e,dt){const s=e.s,p=G.p,B=e.def.B;s.t-=dt;if(B.quirk)B.quirk(e,dt);
    if(s.m==='idle'){e.face=toP(e);const ad=Math.abs(p.x-e.x);e.vx=ad>B.keep+1?e.face*B.spd:ad<B.keep-2?-e.face*B.spd*.6:0;
      if(s.t<=0){if(!s.q.length)s.q=shuffle(B.pats);s.last=s.q.pop();s.pat=PATTERN[s.last];s.ps={};s.m='pat';s.pat.start(e,s.ps);}}
    else if(s.pat.update(e,s.ps,dt)){s.m='idle';s.t=B.gap*(e.hp<e.mhp*.4?.75:1);if(B.after)B.after(e);}}};

// ---------- boss fight controller: shields at set health, prompt challenges ----------
const BossCtl={st:'',t:0,used:[],
  start(run){const S=run.stage,B=BOSS[S.boss],b=run.boss=spawnEnemy('b_'+S.boss,G.w.x1-7,0,{spawn:1});b.s.thr=B.final?[.75,.5,.25]:[.66,.33];b.s.ti=0;b.floor=Math.ceil(b.mhp*b.s.thr[0]);b.shieldM=1;
    G.run.bossT=G.run.t;$('#boss').classList.remove('hide');$('#boss span').textContent=B.name;HUD.bf=HUD.bs=-1;AU.sfx('roar');banner(B.name,B.line);G.punch(1.3,1.6,b.x,1.6);R.cam.shake=.3;this.st='fight';this.used=[];},
  update(dt){const run=G.run,b=run.boss;
    if(this.st==='fight'){
      if(b.dead){this.st='won';this.t=2.4;G.safe=true;for(const e of G.w.ents.slice())if(!e.dead)C.kill(e,{heavy:true});G.w.shots.length=0;G.w.tele.length=0;banner('Static cleared',run.stage.name);G.punch(1.35,2.2,b.x,1.6);AU.sfx('win');buzz(120);AU.play(null);}
      else if(b.floor&&b.hp<=b.floor&&b.shield<=0)this.shieldUp(b);}
    else if(this.st==='won'){this.t-=dt;if(Math.random()<.3)FX.burst(b.x+rnd(-2,2),rnd(.5,3),pick([0xffc53d,0x37e2b8,0x4fd8ff,0xff5d73]),6,6);if(this.t<=0&&run.state!=='over'){run.state='over';run.won=true;UI.summary(true);}}},
  shieldUp(b){this.st='shield';b.inv=999;b.stun=999;b.vx=0;G.safe=true;G.w.shots=G.w.shots.filter(s=>s.team!=='e');G.w.tele.length=0;AU.sfx('shield');FX.ring(b.x,b.y+b.h/2,0xbff6ff,3,.5,.3);G.punch(1.2,1.2,b.x,1.6);
    const ch=this.pick(b);UI.challenge(ch,g=>this.resolve(b,g));},
  resolve(b,g){const B=b.def.B;this.st='fight';b.inv=0;b.stun=0;G.safe=false;G.p.inv=1;b.s.ti++;const thr=b.s.thr[b.s.ti];b.floor=thr?Math.ceil(b.mhp*thr):0;
    if(g==='strong'){b.stag=5;AU.sfx('shatter');FX.ring(b.x,b.y+b.h/2,0xbff6ff,5,.6,.35);FX.burst(b.x,b.y+b.h/2,0xbff6ff,40,12);R.cam.shake=.5;buzz(80);banner('Shield shattered','Staggered: hit it now');G.punch(1.25,.8,b.x,1.6);}
    else{b.shieldM=b.shield=Math.round(b.mhp*(g==='weak'?.1:.18));toast(g==='weak'?'A weak answer. The shield only chipped: break through it.':'No answer. The shield holds: break through it.');AU.sfx('bad');}
    if(B.onPhase)B.onPhase(b);b.s.m='idle';b.s.t=g==='strong'?.5:1;},
  // challenges come from the Fix and Write items of techniques the player knows, plus one authored order puzzle per boss
  pick(b){const B=b.def.B,pool=[];for(const id of AB_ORDER){const r=rk(id);if(!r)continue;const L=LESSON[id][r-1];pool.push({type:'fix',id,L,key:id+'f'},{type:'write',id,L,key:id+'w'});}
    const last=b.s.ti===b.s.thr.length-1,fresh=pool.filter(c=>!this.used.includes(c.key));let ch=last||!fresh.length?{type:'order',key:'order',parts:B.order.parts,why:B.order.why}:pick(fresh);this.used.push(ch.key);return ch;},
  draw(){}
};
