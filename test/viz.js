// Visual + real-input checks: touch stick and buttons, portrait play, a live boss fight with a real challenge card, frame times.
const T=require('./lib');
(async()=>{let fail=0;const say=(ok,msg)=>{console.log((ok?'ok   ':'FAIL ')+msg);if(!ok)fail++;};
  for(const [size,mode] of [['land','three'],['port','canvas'],['port','three'],['land','canvas']]){const tag=size+'-'+mode;
    const t=await T.open({size,mode,save:T.save({sparks:40,ranks:{clear:2,context:1,iterate:2,verify:1,format:1,examples:1,think:1,critique:1},track:'W',cleared:{1:1,2:1},loadout:['clear','think','verify','context']})}),p=t.page;
    await p.tap('#bstart');await p.waitForTimeout(500);
    // real touch: drag the stick right, tap Jump, hold Hit
    const vp=p.viewportSize(),cdp=await p.context().newCDPSession(p),x0=await p.evaluate(()=>G.p.x);
    const tp=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
    const sx=vp.width*.18,sy=vp.height-90;await tp('touchStart',[{x:sx,y:sy,id:1}]);await tp('touchMove',[{x:sx+50,y:sy,id:1}]);await p.waitForTimeout(700);
    const jb=await (await p.$('#tb-jump')).boundingBox();await tp('touchStart',[{x:sx+50,y:sy,id:1},{x:jb.x+jb.width/2,y:jb.y+jb.height/2,id:2}]);await p.waitForTimeout(120);const vy=await p.evaluate(()=>G.p.y);await tp('touchEnd',[{x:sx+50,y:sy,id:1}]);await p.waitForTimeout(100);await tp('touchEnd',[]);
    const x1=await p.evaluate(()=>G.p.x);say(x1-x0>2&&vy>.2,tag+': touch stick moves the player ('+(x1-x0).toFixed(1)+' units) and Jump works while the stick is held');
    // walk up to the nearest thing and tap the hint
    await p.evaluate(()=>{G.p.x=-4;});await p.waitForTimeout(250);const hv=await p.evaluate(()=>$('#hint').textContent);await p.tap('#hint');await p.waitForTimeout(350);await t.shot('v-shrine-'+tag);
    say(/Shrine of Asking/.test(hv)&&await p.evaluate(()=>UI.mode==='pause'),tag+': hint "'+hv+'" opens the shrine on tap');await p.tap('#ui .x');
    // live fight with rendering: bot plays in real time
    await p.evaluate(()=>{GAME.go(RunScene,'3');G.p.mhp=G.p.hp=400;window.__iv=setInterval(()=>{if(UI.mode==='none')BOT.step(1/60);else if(UI.mode==='pause'&&G.run&&G.run.state==='boon'){const r=document.querySelector('#ui .row');if(r)r.click();}},16);PERF.n=0;PERF.sum=0;PERF.worst=0;});
    await p.waitForTimeout(3500);await t.shot('v-fight-'+tag);await p.waitForTimeout(2500);
    const perf=await p.evaluate(()=>({avg:(PERF.n?PERF.sum/PERF.n*1000:PERF.avg).toFixed(1),worst:PERF.worst.toFixed(1),q:R.q,dpr:R.dpr,nodes:R.nodes.length,ents:G.w.ents.length,fx:FX.ps.length}));
    // jump to the boss, fight for real until the first shield
    await p.evaluate(()=>{G.run.room=3;RunScene.next();});await p.waitForTimeout(2600);await t.shot('v-bossintro-'+tag);
    await p.evaluate(()=>{G.run.boss.hp=G.run.boss.floor+30;});await p.waitForFunction(()=>UI.mode==='slow',null,{timeout:30000}).catch(()=>{});await p.waitForTimeout(500);await t.shot('v-challenge-'+tag);
    const ch=await p.evaluate(()=>UI.cur&&UI.cur.ch.type);if(ch==='fix'){await p.tap('#ui .chip:text-is("'+await p.evaluate(()=>UI.cur.ch.L.f[3])+'")');}else if(ch==='write'){for(const g of await p.evaluate(()=>UI.cur.ch.L.c.slice(1,4)))await p.tap('#ui .chip:text-is("'+g+'")');}
    await p.waitForTimeout(600);await t.shot('v-answered-'+tag);await p.waitForTimeout(1500);await t.shot('v-stagger-'+tag);
    const st=await p.evaluate(()=>({stag:G.run.boss.stag>0,mode:UI.mode}));say(!!ch&&st.stag&&st.mode==='none',tag+': real '+ch+' challenge answered by tapping, boss staggered');
    clearInterval;await p.evaluate(()=>clearInterval(window.__iv));
    console.log('     perf '+tag+': '+JSON.stringify(perf));say(!t.errs.length,tag+': no console errors');t.errs.slice(0,5).forEach(e=>console.log('     '+e));await t.close();}
  await T.done();console.log(fail?'VIZ FAIL '+fail:'VIZ OK');process.exit(fail?1:0);})();
