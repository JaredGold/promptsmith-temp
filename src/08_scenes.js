// ---------- scenes: {enter, update(dt), draw(ctx), exit} ; GAME owns the current one ----------
const GAME={go(scene,arg){if(G.scene&&G.scene.exit)G.scene.exit();IN.clear();G.scene=scene;G.stop=0;G.safe=false;G.zoomT=0;scene.enter(arg);HUD.refresh();}};
const sign=(text,x,y,z,fg,bg)=>R.add(mk([P('img',0,0,2.7,.68,0,{img:signTex(text,fg,bg)})],x,y,z==null?-1.2:z,{st:true}));

const HubScene={things:[],near:null,
  enter(){G.run=null;G.mod=newMod();R.clear();FX.clear();const w=G.w=newWorld(-30,31);buildScenery('hub',-30,31);AU.play('hub');this.things=[];this.near=null;
    R.add(mk(PROP.fountain()(),0,0,-3.6,{st:true}));for(const x of[-18,-6,6,18])R.add(mk(PROP.bunting()(),x,.6,-6.5,{st:true}));
    const add=(x,label,act,o)=>{const t=Object.assign({x,label,act},o);this.things.push(t);return t;};
    const shrine=(x,id,name,glyph,c)=>{const n=R.add(mk([P('box',0,.15,2.6,.3,0xf3eeff,{d:1.6}),P('cyl',-1,1.4,.34,2.2,0xf3eeff),P('cyl',1,1.4,.34,2.2,0xf3eeff),P('box',0,2.65,2.9,.34,c,{d:1.2}),P('sph',0,1.5,.9,.9,c,{e:1,n:'orb',z:-.2}),P('img',0,1.5,1,1,0,{img:glyphTex(glyph,0xffffff),n:'gl',z:.3})],x,0,-1.4));sign(name,x,3.5);add(x,name,()=>UI.shrine(id),{node:n,c});};
    shrine(-4,'ask','Shrine of Asking','diamond',0x4fd8ff);shrine(-9,'check','Shrine of Checking','check',0xc6f432);shrine(-15,'show','Shrine of Showing','tri',0xb388ff);
    R.add(mk([P('box',0,.5,1.6,1,0x7a4a21,{d:1}),P('box',0,1.15,1.1,.3,0x8c87a6,{d:.7}),P('box',.1,1.45,1.5,.3,0x6a6590,{d:.6}),P('sph',-.9,1.2,.3,.3,0xffc53d,{e:1})],-21,0,-1.4,{st:true}));sign('Loadout bench',-21,3,null);add(-21,'Loadout bench',()=>UI.loadout());
    R.add(mk([P('box',0,.6,.5,1.2,0x7a4a21),P('box',0,1.35,1.5,.2,0xa8622e,{r:.2,d:1}),P('box',0,1.5,1.2,.16,0xf3eeff,{r:.2,d:.8,e:1}),P('sph',0,2.3,.5,.5,0xffc53d,{e:1})],-26,0,-1.4,{st:true}));sign('Codex',-26,3.3,null);add(-26,'Codex',()=>UI.codex());
    const npc=(x,name,c,c2,hat,act)=>{const n=R.add(mk(MODEL.npc(c,c2,hat),x,0,-.9,{ol:true,sh:.5}));n.face=x>0?-1:1;sign(name,x,2.75,-.9,'#201A4B','#F3EEFF');add(x,'Talk to '+name,act,{npc:n});};
    npc(3,'Ember',0xff8a3d,0xffc53d,0,()=>UI.ember());
    R.add(mk([P('cyl',0,1.3,.2,2.6,0x7a4a21),P('box',.5,2.3,1.2,.34,0xf7a8ff,{d:.1}),P('box',-.5,1.85,1.2,.34,0x5eead4,{d:.1}),P('box',.5,1.4,1.2,.34,0x7cff8a,{d:.1})],9,0,-1.3,{st:true}));sign('Tracks',9,3.3);add(9,'Choose a track',()=>UI.tracks());
    npc(13,'Quill',0xf7a8ff,0x8a4fd6,2,()=>UI.mentor('W'));npc(16,'Tally',0x5eead4,0x1f6f8f,1,()=>UI.mentor('A'));npc(19,'Rivet',0x7cff8a,0x3a5a3a,3,()=>UI.mentor('B'));
    shrine(23,'track','Track shrine','rune',0xffc53d);
    this.gate=R.add(mk([P('box',-1.5,2,.7,4,0x3a3170,{d:1.4}),P('box',1.5,2,.7,4,0x3a3170,{d:1.4}),P('box',0,4.2,4,.7,0x3a3170,{d:1.4}),P('cone',0,5,1,1,0xffc53d,{e:1}),P('box',0,2,2.4,3.8,0x8c87a6,{d:.1,e:1,n:'glow',z:-.3})],28,0,-1.2));sign('Stage gate',28,5.9);add(28,'Stage gate',()=>UI.gate());
    spawnEnemy('dummy',6.5,0,{spawn:0});sign('Practice',6.5,3,-1.2,'#201A4B','#F3EEFF');
    G.p=PL.make(SV.d.hubx||0);camFollow(0,true);$('#roomtag').textContent='';$('#boss').classList.add('hide');
    if(!SV.d.tut.move){SV.d.tut.move=1;setTimeout(()=>toast(IN.usedKb?'A/D move, Space jump, J hit, K dodge':'Left thumb moves. Right buttons hit, jump, dodge.'),600);}},
  update(dt){const p=G.p;let best=null,bd=1.7;for(const t of this.things){const d=Math.abs(t.x-p.x);if(d<bd){bd=d;best=t;}}
    if(best!==this.near){this.near=best;hint(best?best.label:null,best?()=>{IN.reset();best.act();}:null);}
    if(best&&IN.press.atk){IN.press.atk=0;IN.held.atk=0;AU.sfx('ui');best.act();return;}
    p.noAtk=false;PL.update(p,dt);if(p.dead){p.dead=false;p.hp=p.mhp;}p.hp=Math.min(p.mhp,p.hp+dt*20);updWorld(dt);
    for(const t of this.things){if(t.node){t.node.p.gl.y=1.5+Math.sin(G.t*2+t.x)*.12;t.node.p.orb.y=t.node.p.gl.y;R.light(t.x,1.6,t.c,.5,5);}if(t.npc)t.npc.sy=1+Math.sin(G.t*3+t.x)*.02;}
    camFollow(dt);lightWorld();},
  draw(ctx){drawWorldFx(ctx);ctx.globalCompositeOperation='lighter';FX.glow(ctx,28,2,2.6,0xffc53d,.35+Math.sin(G.t*2)*.08);for(const t of this.things)if(t.node)FX.glow(ctx,t.x,1.5,1.3,t.c,.35);ctx.globalCompositeOperation='source-over';},
  exit(){SV.d.hubx=Math.round(G.p.x);hint(null);}
};

const RunScene={
  enter(stageId){const S=STAGE[stageId];G.mod=newMod();G.run={stage:S,tier:S.tier,room:-1,rooms:4,sparks:0,kills:0,boons:[],t:0,state:'',st:0,waves:[],wi:0,boss:null,won:false};G.p=null;AU.play(S.song);SV.d.runs++;this.next();
    banner(S.name,'Stage '+S.n);},
  next(){const run=G.run;run.room++;this.build(run.room>=run.rooms);},
  build(boss){const run=G.run,S=run.stage,old=G.p;R.clear();FX.clear();const wd=boss?30:rint(26,34),w=G.w=newWorld(0,wd);
    if(!boss){const np=rint(0,2);for(let i=0;i<np;i++){const cx=wd*(i+1)/(np+1)+rnd(-2,2),hw=rnd(1.8,2.8);w.plats.push({x0:cx-hw,x1:cx+hw,y:2.1});}}
    buildScenery(S.theme,0,wd,w.plats);
    this.door=R.add(mk([P('box',-1,1.6,.4,3.2,0x201a4b,{d:1}),P('box',1,1.6,.4,3.2,0x201a4b,{d:1}),P('box',0,3.4,2.6,.5,0x201a4b,{d:1}),P('box',0,1.6,1.7,3.1,0xffc53d,{d:.1,e:1,n:'glow',vis:false})],wd-1.6,0,-.8));
    if(old){G.p=old;R.add(old.node);old.x=2;old.y=0;old.vx=old.vy=0;old.face=1;if(G.mod.wind)C.heal(G.mod.wind);}else G.p=PL.make(2);
    run.state='intro';run.st=.9;run.wi=0;run.boss=null;run.doorOpen=false;
    if(boss){run.waves=[];AU.play('boss');$('#roomtag').textContent='';}
    else{const nw=run.room<2?3:4,pool=S.pool;run.waves=[];for(let i=0;i<nw;i++){let b=2.4+run.tier*.5+run.room*.55+i*.45;const wv=[];while(b>0&&wv.length<7){const k=pick(pool);b-=ENEMY[k].cost;wv.push(k);}run.waves.push(wv);}
      $('#roomtag').textContent='Room '+(run.room+1)+' of '+run.rooms;}
    camFollow(0,true);G.fade=1;},
  spawnWave(wv){const p=G.p,w=G.w;for(const k of wv){let x=0;for(let i=0;i<8;i++){x=rnd(w.x0+2,w.x1-3);if(Math.abs(x-p.x)>5)break;}spawnEnemy(k,x,ENEMY[k].fly?rnd(2.4,3.6):0);}},
  update(dt){const run=G.run,p=G.p,w=G.w;run.t+=dt;run.st-=dt;G.fade=Math.max(0,G.fade-dt*3);
    PL.update(p,dt);updWorld(dt);
    const boss=run.room>=run.rooms;
    if(run.state==='intro'&&run.st<=0){if(boss){run.state='boss';BossCtl.start(run);}else run.state='fight';}
    else if(run.state==='fight'){if(!w.ents.length){if(run.wi<run.waves.length){this.spawnWave(run.waves[run.wi++]);}else{run.state='clear';run.st=.7;AU.sfx('good');banner('Room clear');G.punch(1.08,.5);}}}
    else if(run.state==='clear'&&run.st<=0){run.state='boon';UI.boons(()=>{run.state='door';run.doorOpen=true;this.door.p.glow.vis=true;AU.sfx('door');hint('Go right to the door');});}
    else if(run.state==='door'){R.light(w.x1-1.6,1.6,0xffc53d,1,7);if(p.x>w.x1-2.3){hint(null);this.next();return;}}
    else if(run.state==='boss')BossCtl.update(dt);
    if(p.dead&&p.deadT>1.7&&run.state!=='over'){run.state='over';UI.summary(false);}
    camFollow(dt);lightWorld();},
  draw(ctx){drawWorldFx(ctx);if(G.run.doorOpen){ctx.globalCompositeOperation='lighter';FX.glow(ctx,G.w.x1-1.6,1.6,2.4,0xffc53d,.5+Math.sin(G.t*4)*.1);ctx.globalCompositeOperation='source-over';}
    if(G.run.state==='boss')BossCtl.draw(ctx);
    if(G.fade>0){ctx.globalAlpha=G.fade;ctx.fillStyle='#12102B';ctx.fillRect(0,0,R.W,R.H);ctx.globalAlpha=1;}},
  // called by UI when a run ends
  finish(win){const run=G.run,S=run.stage;let bonus=0,first=false;if(win){first=!SV.d.cleared[S.id];bonus=20+(first?40:0);SV.d.cleared[S.id]=1;}SV.d.sparks+=run.sparks+bonus;SV.save();return {bonus,first};},
  exit(){hint(null);$('#roomtag').textContent='';$('#boss').classList.add('hide');G.run=null;}
};
