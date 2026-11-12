// Pass 3: every stage end to end with the bot (4 rooms, boons, boss, shield challenges), strong/weak/timeout paths.
const T=require('./lib');
const ALL=['clear','context','examples','format','role','think','iterate','verify','critique'];
const TR={W:['audience','outline','edit'],A:['tags','quotes','unknown'],B:['agents','skills','connect']};
(async()=>{let fail=0;const say=(ok,msg)=>{console.log((ok?'ok   ':'FAIL ')+msg);if(!ok)fail++;};
  const stages=process.argv[2]?process.argv[2].split(','):['1','2','3','4W','5W','4A','5A','4B','5B'];
  for(const sid of stages){const tr=sid.length>1?sid[1]:null,n=+sid[0],mode=n%2?'three':'canvas';
    // a plausible build for that point in the game
    const ranks={};const have=n===1?['clear','context','iterate']:n===2?ALL.slice(0,3).concat(['verify','format','examples','iterate']):ALL.concat(tr?TR[tr].slice(0,n>4?3:2):[]);have.forEach(a=>ranks[a]=n>=5?3:n>=4?2:1);
    const act=have.filter(a=>!['iterate','skills'].includes(a)),pref=['clear','verify','think','critique','context','examples'].concat(tr?TR[tr]:[]).filter(a=>act.includes(a));
    const cleared={};for(let i=1;i<Math.min(n,4);i++)cleared[i]=1;if(n===5)cleared['4'+tr]=1;
    const t=await T.open({size:n%2?'land':'port',mode,save:T.save({ranks,track:tr,cleared,loadout:[pref[0]||null,pref[1]||null,pref[2]||null,pref[3]||null]})}),p=t.page;await p.click('#bstart');
    const answer=sid==='2'?'weak':sid==='3'?'timeout':'strong';
    const r=await p.evaluate(async({sid,answer})=>{const log={ch:[],grades:[]};GAME.go(RunScene,sid);G.p.mhp=G.p.hp=160; // the bot is a clumsy player; give it some slack
      BOT.skill=.75;let done=false;const origResolve=BossCtl.resolve.bind(BossCtl);BossCtl.resolve=(b,g)=>{log.grades.push(g);origResolve(b,g);};
      BOT.onChallenge=()=>{const c=UI.cur;if(!c||c.seen)return;c.seen=true;log.ch.push(c.ch.type);const chips=[...document.querySelectorAll('#ui .chip')];
        if(answer==='timeout'){c.fin('fail','');return;}
        if(c.ch.type==='fix'){const want=answer==='strong'?c.ch.L.f[3]:c.ch.L.f[5];chips.find(k=>k.textContent===want).click();}
        else if(c.ch.type==='write'){const want=answer==='strong'?c.ch.L.c.slice(1,4):[c.ch.L.c[1],c.ch.L.c[2],c.ch.L.c[4]];want.forEach(w=>chips.find(k=>k.textContent===w).click());}
        else{const order=answer==='strong'?c.ch.parts:[c.ch.parts[1],c.ch.parts[0],c.ch.parts[2],c.ch.parts[3]];order.forEach(w=>chips.find(k=>k.textContent.endsWith(w)).click());}};
      let out='',guard=0;const t0=performance.now();
      while(guard++<400){out=BOT.ff(5);if(out==='challenge'||UI.mode==='slow'){await new Promise(r=>setTimeout(r,2300));continue;}if(out==='dead'||G.run.state==='over')break;if(out==='ui'&&G.run.state!=='boon')break;}
      await new Promise(r=>setTimeout(r,300));
      return {out,state:G.run.state,won:G.run.won,room:G.run.room,bossTime:Math.round(G.run.t-(G.run.bossT||G.run.t)),time:Math.round(G.run.t),hp:Math.round(G.p.hp),kills:G.run.kills,sparks:G.run.sparks,boons:G.run.boons.length,ch:log.ch,grades:log.grades,boss:G.run.boss?Math.round(G.run.boss.hp)+'/'+G.run.boss.mhp:'-',card:(document.querySelector('#ui h2')||{}).textContent,wall:Math.round(performance.now()-t0)};},{sid,answer});
    await t.shot('p3-end-'+sid);
    const exp=answer==='strong'?'strong':answer==='weak'?'weak':'fail';
    say(r.won&&!t.errs.length&&r.grades.every(g=>g===exp)&&r.grades.length>=2,`stage ${sid} (${mode}, ${answer} answers): won=${r.won} room=${r.room} time=${r.time}s (boss ${r.bossTime}s) hp=${r.hp} kills=${r.kills} sparks=${r.sparks} boons=${r.boons} challenges=${r.ch.join('/')} grades=${r.grades.join('/')} boss=${r.boss} card="${r.card}" errors=${t.errs.length}`);
    t.errs.slice(0,5).forEach(e=>console.log('     '+e));
    if(r.won){await p.tap('#ui .cf .btn');await p.waitForTimeout(300);const s=await p.evaluate(()=>({scene:G.scene===HubScene,cleared:SV.d.cleared,sparks:SV.d.sparks}));say(s.scene&&s.cleared[sid]===1&&s.sparks>0,'  back in town, stage saved as cleared, sparks banked ('+s.sparks+')');}
    await t.close();}
  if(!process.argv[2]){// death, retry, and starting a run from the gate by tapping
    const t=await T.open({size:'land',mode:'three',save:T.save({ranks:{clear:1},loadout:['clear',null,null,null]})}),p=t.page;await p.click('#bstart');await p.evaluate(()=>UI.gate());await p.tap('#ui .row');await p.waitForTimeout(400);
    say(await p.evaluate(()=>G.scene===RunScene&&G.run.stage.id==='1'),'tapping stage 1 at the gate starts the run');
    await p.evaluate(()=>{G.run.sparks=7;G.p.inv=0;C.hurt(999,null,1);});await p.waitForFunction(()=>UI.mode==='pause',null,{timeout:20000});await t.shot('p3-death');
    let s=await p.evaluate(()=>({title:$('#ui h2').textContent,sp:SV.d.sparks}));say(/Static got you/.test(s.title)&&s.sp===7,'death shows the summary and keeps sparks ('+s.sp+')');
    await p.tap('#ui .cf .btn:last-child');await p.waitForTimeout(500);s=await p.evaluate(()=>({run:!!G.run,hp:G.p.hp,dead:G.p.dead,room:G.run&&G.run.room}));say(s.run&&s.hp===100&&!s.dead&&s.room===0,'Try again starts a fresh run');
    await p.evaluate(()=>UI.pause());await p.tap('#ui .row:nth-child(2)');await p.waitForTimeout(300);say(await p.evaluate(()=>G.scene===HubScene&&!G.run),'Leave the run returns to town');
    say(!t.errs.length,'death/retry/leave: no console errors');t.errs.slice(0,5).forEach(e=>console.log('     '+e));await t.close();}
  await T.done();console.log(fail?'PASS3 FAIL '+fail:'PASS3 OK');process.exit(fail?1:0);})();
