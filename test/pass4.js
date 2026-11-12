// Pass 4: tracks, track shrine, track variants in lessons, Codex, loadout and rune programming, no-storage mode.
const T=require('./lib');
(async()=>{let fail=0;const say=(ok,msg)=>{console.log((ok?'ok   ':'FAIL ')+msg);if(!ok)fail++;};
  for(const size of['port','land']){
    const t=await T.open({size,mode:size==='port'?'three':'canvas',save:T.save({sparks:200,ranks:{clear:1,context:1,iterate:1,verify:1},cleared:{1:1,2:1,3:1},loadout:['clear','context','verify',null]})}),p=t.page;await p.click('#bstart');await p.waitForTimeout(300);
    // before a track: gate and track shrine explain what to do
    await p.evaluate(()=>UI.gate());await p.waitForTimeout(250);await t.shot('p4-gate-'+size);let txt=await p.evaluate(()=>$('#ui').textContent);say(/Choose a track/.test(txt),size+': gate asks for a track before stages 4 and 5');
    await p.evaluate(()=>{UI.close();UI.shrine('ask');});let lock=await p.evaluate(()=>PROG.rankLock('clear',2));say(lock==='Choose a track first',size+': rank II is locked until a track is chosen');
    await p.evaluate(()=>{UI.close();UI.tracks();});await p.waitForTimeout(250);await t.shot('p4-tracks-'+size);await p.tap('#ui .row:nth-child(2)');await p.waitForTimeout(200);
    say(await p.evaluate(()=>SV.d.track)==='A',size+': tapping Analyst sets the track');
    await p.evaluate(()=>UI.shrine('track'));await p.waitForTimeout(250);await t.shot('p4-trackshrine-'+size);txt=await p.evaluate(()=>$('#ui').textContent);say(/XML Tags/.test(txt)&&/Quote First/.test(txt)&&/Clear stage 4/.test(txt),size+': track shrine lists Analyst abilities, third one locked');
    await p.evaluate(()=>{UI.close();UI.gate();});txt=await p.evaluate(()=>$('#ui').textContent);say(/Stale Archive/.test(txt)&&/The Deluge/.test(txt)&&!/Cliche Cliffs/.test(txt),size+': gate shows the Analyst stages only');
    // rank II lesson uses the Analyst variant and quest line, costs 30 sparks
    await p.evaluate(()=>{UI.close();UI.lesson('clear','ask');});txt=await p.evaluate(()=>$('#ui').textContent);say(txt.includes('Analyze this sales data.'),size+': Clear Ask II shows the Analyst example');
    for(let i=0;i<5;i++)await p.tap('#ui .cf .btn:last-child');await p.tap('#ui .chip:text-is("'+await p.evaluate(()=>LESSON.clear[1].f[3])+'")');await p.tap('#ui .cf .btn:last-child');
    // a wrong build first: the check must refuse it
    for(const g of await p.evaluate(()=>[LESSON.clear[1].c[1],LESSON.clear[1].c[4],LESSON.clear[1].c[5]]))await p.tap('#ui .chip:text-is("'+g+'")');await p.tap('#ui .cf .btn:last-child');
    say(await p.evaluate(()=>!!$('#ui .fb.no')),size+': a weak Write answer is refused with a hint');await t.shot('p4-write-refused-'+size);
    for(const g of await p.evaluate(()=>[LESSON.clear[1].c[4],LESSON.clear[1].c[5],LESSON.clear[1].c[2],LESSON.clear[1].c[3]]))await p.tap('#ui .chip:text-is("'+g+'")');await p.tap('#ui .cf .btn:last-child');await p.tap('#ui .cf .btn:last-child');
    txt=await p.evaluate(()=>$('#ui').textContent);say(txt.includes(await p.evaluate(()=>LESSON.clear[1].m[2]))&&/Tally/.test(txt),size+': quest comes from Tally with the Analyst task');await t.shot('p4-quest-'+size);
    for(const i of await p.$$('#ui input.txt'))await i.fill('monthly churn');await p.tap('#ui .cf .btn:nth-child(2)');await p.waitForTimeout(150);await p.tap('#ui .cf .btn:last-child');
    let s=await p.evaluate(()=>({r:rk('clear'),sp:SV.d.sparks}));say(s.r===2&&s.sp===170,size+': rank II learned, 30 sparks spent ('+s.sp+' left)');
    // codex
    await p.evaluate(()=>{UI.close();UI.codex();});await p.waitForTimeout(250);await t.shot('p4-codex-'+size);s=await p.evaluate(()=>({n:document.querySelectorAll('#ui .pr').length,t:$('#ui .pr').textContent}));say(s.n===4&&s.t===await p.evaluate(()=>LESSON.clear[1].t),size+': Codex holds 4 templates, Clear Ask upgraded to its rank II template');
    await p.tap('#ui .list .btn');await p.waitForTimeout(200);say(/Copied|Copy is blocked/.test(await p.evaluate(()=>$('#toast').textContent)),size+': Copy button answers with a toast');
    // switch track any time; builder rune programming
    await p.evaluate(()=>{UI.close();UI.setTrack('B');SV.d.ranks.skills=2;SV.d.ranks.agents=1;UI.loadout();});await p.waitForTimeout(250);await t.shot('p4-loadout-'+size);
    const before=await p.evaluate(()=>SV.d.runes[0].t);await p.tap('#ui .chips .chip:first-child');say(await p.evaluate(()=>SV.d.runes[0].t)!==before,size+': rune trigger changes on tap');
    await p.tap('#ui .slot:nth-child(4)');await p.tap('#ui .list .row:last-child');say(await p.evaluate(()=>SV.d.loadout[3])==='agents',size+': loadout slot assignment works');
    await p.evaluate(()=>{UI.close();UI.mentor('W');});await p.waitForTimeout(250);await t.shot('p4-mentor-'+size);await p.evaluate(()=>{UI.close();UI.ember();});await p.waitForTimeout(250);await t.shot('p4-ember-'+size);
    await p.evaluate(()=>{UI.close();UI.pause();});await p.waitForTimeout(250);await t.shot('p4-pause-'+size);
    say(!t.errs.length,size+': no console errors');t.errs.slice(0,5).forEach(e=>console.log('     '+e));await t.close();}
  // saving unavailable
  const t=await T.open({size:'land',mode:'three',noStorage:true}),p=t.page;const note=await p.evaluate(()=>$('#tnote').textContent);await p.click('#bstart');
  const s=await p.evaluate(()=>{PROG.learn('clear');SV.save();return {persist:SV.persistent,r:rk('clear')};});say(!s.persist&&s.r===1&&/unavailable/.test(note)&&!t.errs.length,'storage blocked: game runs, says so on the title ("'+note+'")');await t.close();
  await T.done();console.log(fail?'PASS4 FAIL '+fail:'PASS4 OK');process.exit(fail?1:0);})();
