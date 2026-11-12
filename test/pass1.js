// Pass 1: boot, hub, a combat room. Both renderers, both orientations.
const T=require('./lib');
(async()=>{let fail=0;
  for(const [size,mode] of [['land','three'],['port','three'],['land','canvas'],['port','nothree']]){
    const t=await T.open({size,mode,save:T.save({ranks:{clear:1},loadout:['clear',null,null,null]})}),p=t.page,tag=size+'-'+mode;
    const info=await p.evaluate(()=>({mode:R.mode,note:R.note,three:!!window.THREE,nodes:R.nodes.length,persist:SV.persistent}));
    await t.shot('p1-title-'+tag);
    await p.click('#bstart');await p.waitForTimeout(700);await t.shot('p1-hub-'+tag);
    // walk in the hub for real, with the keyboard
    await p.keyboard.down('KeyD');await p.waitForTimeout(600);await p.keyboard.up('KeyD');await p.keyboard.press('Space');await p.keyboard.press('KeyJ');await p.waitForTimeout(300);
    const hubx=await p.evaluate(()=>G.p.x);
    // touch: stick + Hit button
    await t.shot('p1-talk-'+tag);await p.evaluate(()=>{UI.close();GAME.go(RunScene,'1');});await p.waitForTimeout(1500);
    const res=await p.evaluate(()=>{const r=BOT.ff(120,()=>G.run.room>=1);return {r,room:G.run.room,hp:G.p.hp,t:G.run.t,kills:G.run.kills,sparks:G.run.sparks,state:G.run.state};});
    // real-time: let the bot play ~4s with rendering on, measure frame time
    await p.evaluate(()=>{window.__iv=setInterval(()=>{if(UI.mode==='none')BOT.step(1/60);},16);PERF.n=0;PERF.sum=0;});
    await p.waitForTimeout(2500);await t.shot('p1-fight-'+tag);await p.waitForTimeout(1500);
    const perf=await p.evaluate(()=>{clearInterval(window.__iv);return {avg:PERF.n?PERF.sum/PERF.n*1000:PERF.avg,q:R.q,ents:G.w.ents.length,mode:R.mode};});
    console.log(tag,JSON.stringify(info),'hubx',hubx.toFixed(1),JSON.stringify(res),'perf',JSON.stringify(perf),'errors:',t.errs.length);
    for(const e of t.errs.slice(0,6))console.log('   ERR',e);
    if(t.errs.length||res.room<1)fail++;await t.close();}
  await T.done();console.log(fail?'PASS1 FAIL '+fail:'PASS1 OK');process.exit(fail?1:0);})();
