// Sound ON (earlier passes ran muted, which hid a crash). Plays every song and every effect and watches for errors.
const T=require('./lib');
(async()=>{const t=await T.open({size:'port',mode:'canvas',save:T.save({muted:false,ranks:{clear:1},loadout:['clear',null,null,null]})}),p=t.page;await p.tap('#bstart');await p.waitForTimeout(600);
  const st=await p.evaluate(()=>({state:AU.ctx&&AU.ctx.state,muted:AU.muted,song:AU.song}));
  const names=await p.evaluate(()=>Object.keys(AU.SONGS));for(const n of names){await p.evaluate(n=>{AU.play(n);AU.step=0;},n);await p.waitForTimeout(350);await p.evaluate(()=>{AU.step=48;});await p.waitForTimeout(350);}
  // every step of every song, synchronously
  const bad=await p.evaluate(()=>{const bad=[];for(const n in AU.SONGS){const s=AU.SONGS[n];for(let st=0;st<64;st++){const lc=s.lead[st%64]||'.',ch=s.prog[Math.floor(st/16)%4];if(lc!=='.'&&!isFinite(AU.nt(s,+lc+ch+5)))bad.push(n+'@'+st);if(!isFinite(AU.nt(s,ch-5)))bad.push(n+' bass@'+st);}}
    for(const k of['swing','hit','heavy','kill','jump','dodge','hurt','shot','eshot','buff','pulse','parry','clank','charge','pick','heal','ui','back','good','bad','rank','roar','shield','shatter','tele','door','spawn','portal','die','win'])for(const pp of[undefined,.6,1,2,3])AU.sfx(k,pp);return bad;});
  await p.evaluate(()=>{GAME.go(RunScene,'1');window.__iv=setInterval(()=>{if(UI.mode==='none')BOT.step(1/60);},16);});await p.waitForTimeout(4000);
  const ok=st.state==='running'&&!st.muted&&!bad.length&&!t.errs.length;console.log((ok?'ok   ':'FAIL ')+'sound on: context '+st.state+', '+names.length+' songs, all effects, a live fight: '+t.errs.length+' errors, '+bad.length+' bad notes');t.errs.slice(0,5).forEach(e=>console.log('     '+e));bad.slice(0,5).forEach(e=>console.log('     '+e));
  await t.close();await T.done();process.exit(ok?0:1);})();
