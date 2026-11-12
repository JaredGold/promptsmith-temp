// Pass 2: lesson data shape, real line counts for every lesson screen, a full lesson click-through, every ability used in combat.
const T=require('./lib');
(async()=>{let fail=0;const say=(ok,msg)=>{console.log((ok?'ok   ':'FAIL ')+msg);if(!ok)fail++;};
  // --- data shape + string budgets (in page, one load)
  let t=await T.open({size:'land',mode:'canvas',save:T.save({})}),p=t.page;
  const shape=await p.evaluate(()=>{const bad=[];let n=0;const chk=(id,r,k,s,max)=>{n++;if(typeof s!=='string'||!s.length&&k!=='f.pre'&&k!=='f.post')bad.push(id+r+' '+k+' empty');else if(s.length>max)bad.push(id+r+' '+k+' '+s.length+'>'+max+': '+s.slice(0,40));};
    for(const id of AB_ORDER){const L=LESSON[id];if(!L||L.length!==3){bad.push(id+' missing ranks');continue;}L.forEach((R,r)=>{const vs=Object.keys(R.w);if(!(vs.length===1&&vs[0]==='g')&&!(vs.join('')==='WAB'))bad.push(id+r+' variants '+vs);
      for(const v of vs){const w=R.w[v];if(w.length!==5||w[2].length!==3)bad.push(id+r+v+' watch shape');chk(id,r,'w0'+v,w[0],105);chk(id,r,'w1'+v,w[1],105);chk(id,r,'w2'+v,w[2].join(' '),105);chk(id,r,'w3'+v,w[3],105);chk(id,r,'w4'+v,w[4],105);}
      if(R.f.length!==7)bad.push(id+r+' fix shape');chk(id,r,'f.prompt',R.f[0]+R.f[1]+R.f[2],105);chk(id,r,'f.fixed',R.f[0]+R.f[3]+R.f[2],110);chk(id,r,'f.why',R.f[4],105);for(const i of[3,5,6])chk(id,r,'f.opt'+i,R.f[i],50);
      if(R.c.length!==7)bad.push(id+r+' write shape');chk(id,r,'c.goal',R.c[0],80);for(let i=1;i<6;i++)chk(id,r,'c.chip'+i,R.c[i],46);chk(id,r,'c.label',R.c[6],34);
      const ms=Array.isArray(R.m)?R.m:[R.m];if(Array.isArray(R.m)&&R.m.length!==4)bad.push(id+r+' quest lines');ms.forEach((m,i)=>chk(id,r,'m'+i,m,105));
      const sl=(R.t.match(/\[[^\]]+\]/g)||[]).length;if(sl<1||sl>5)bad.push(id+r+' slots '+sl);chk(id,r,'t',R.t,130);
      if(GRADER.fix(R,R.f[3]).grade!=='strong'||GRADER.fix(R,R.f[5]).grade==='strong')bad.push(id+r+' fix grader');
      if(GRADER.write(R,{picks:R.c.slice(1,4),text:''}).grade!=='strong'||GRADER.write(R,{picks:[R.c[1],R.c[2],R.c[4]],text:'abc'}).grade==='strong'||GRADER.write(R,{picks:[R.c[1],R.c[2]],text:'abc'}).grade!=='strong')bad.push(id+r+' write grader');});}
    return {bad,n,abilities:AB_ORDER.length};});
  say(shape.abilities===18,'18 abilities registered ('+shape.abilities+')');say(!shape.bad.length,shape.n+' lesson strings within budget');shape.bad.slice(0,30).forEach(b=>console.log('     '+b));await t.close();
  // --- real rendered line counts, both sizes
  for(const size of['land','port']){t=await T.open({size,mode:'canvas',save:T.save({})});p=t.page;await p.click('#bstart');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
    const res=await p.evaluate(()=>{const over=[];let screens=0,max=0,scroll=0;
      for(const id of AB_ORDER)for(let r=0;r<3;r++)for(const tr of(LESSON[id][r].w.g?['W']:['W','A','B'])){const S=UI.lessonScreens(id,r,tr);S.forEach((sc,i)=>{screens++;const c=card({wide:true,title:ABILITY[id].name+' '+ROMAN[r],sub:'x',icon:[ABILITY[id].shape,ABILITY[id].color],x(){},btns:[{t:'Back',cls:'alt',f(){}},{t:'Next',f(){}}]});sc.build(c.body,()=>{});UI.open(c);
        for(const e of c.querySelectorAll('.lt')){const cs=getComputedStyle(e),lh=parseFloat(cs.lineHeight),h=e.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom),lines=Math.round(h/lh);max=Math.max(max,lines);if(lines>3)over.push(id+(r+1)+tr+' screen'+i+' '+lines+' lines: '+e.textContent.slice(0,50));}
        if(c.body.scrollHeight>c.body.clientHeight+2){scroll++;}});}
      UI.close();return {over,screens,max,scroll};});
    say(!res.over.length,size+': '+res.screens+' lesson screens, longest text block '+res.max+' lines, '+res.scroll+' screens need scrolling');res.over.slice(0,40).forEach(b=>console.log('     '+b));
    say(!t.errs.length,size+': no console errors');t.errs.slice(0,5).forEach(e=>console.log('     '+e));await t.close();}
  // --- click through a whole lesson like a player (portrait, touch taps)
  t=await T.open({size:'port',mode:'three',save:T.save({})});p=t.page;await p.click('#bstart');await p.waitForTimeout(300);
  await p.evaluate(()=>UI.shrine('ask'));await t.shot('p2-shrine');await p.tap('#ui .row');
  for(let i=0;i<5;i++){if(i===2)await t.shot('p2-watch');await p.tap('#ui .cf .btn:last-child');}
  await t.shot('p2-fix');const good=await p.evaluate(()=>LESSON.clear[0].f[3]);await p.tap('#ui .chip:text-is("'+good+'")');await t.shot('p2-fixed');await p.tap('#ui .cf .btn:last-child');
  for(const g of await p.evaluate(()=>LESSON.clear[0].c.slice(1,4)))await p.tap('#ui .chip:text-is("'+g+'")');await t.shot('p2-write');await p.tap('#ui .cf .btn:last-child');await p.tap('#ui .cf .btn:last-child');
  const ins=await p.$$('#ui input.txt');for(const i of ins){await i.fill('a thank-you note');}await t.shot('p2-quest');await p.tap('#ui .cf .btn:last-child');await t.shot('p2-rankup');
  const st=await p.evaluate(()=>({r:rk('clear'),lo:SV.d.loadout,saved:JSON.parse(localStorage.getItem(SV.key)).ranks.clear}));say(st.r===1&&st.lo[0]==='clear'&&st.saved===1,'lesson click-through ranks up Clear Ask, equips it, saves it');
  await p.tap('#ui .cf .btn:last-child');await p.evaluate(()=>{UI.close();UI.codex();});await t.shot('p2-codex');await p.evaluate(()=>{UI.close();UI.loadout();});await t.shot('p2-loadout');
  say(!t.errs.length,'lesson flow: no console errors');t.errs.slice(0,5).forEach(e=>console.log('     '+e));await t.close();
  // --- every ability, every rank, in a fight (both renderers)
  for(const mode of['three','canvas'])for(const tr of['W','A','B']){const abs=['clear','context','examples','format','role','think','iterate','verify','critique'].concat({W:['audience','outline','edit'],A:['tags','quotes','unknown'],B:['agents','skills','connect']}[tr]);
    for(const rank of[1,3]){const ranks={};abs.forEach(a=>ranks[a]=rank);t=await T.open({size:'land',mode,save:T.save({ranks,track:tr,cleared:{1:1,2:1,3:1},runes:[{t:'hit5',a:'shock'},{t:'dodge',a:'bolts'}]})});p=t.page;await p.click('#bstart');
      const r=await p.evaluate((abs)=>{const used={};GAME.go(RunScene,'3');const act=abs.filter(a=>ABILITY[a].kind!=='passive');let out='';
        for(let g=0;g<act.length;g+=4){SV.d.loadout=[0,1,2,3].map(i=>act[g+i]||null);HUD.refresh();G.p.hp=G.p.mhp=9999;for(const k in G.p.cd)G.p.cd[k]=0;
          for(let s=0;s<14;s++){for(let i=0;i<4;i++){const id=SV.d.loadout[i];if(id&&!(G.p.cd[id]>0)){IN.press['a'+i]=1;used[id]=1;}}out=BOT.ff(1.2);if(out==='ui'&&G.run.state!=='boon')break;if(!G.w.ents.length&&G.run.state==='door')G.run.state='fight',G.run.wi=0,G.run.waves=[['creeper','flooder','yesman','mimic','wisp']];}}
        return {used:Object.keys(used).length,act:act.length,kills:G.run.kills,out};},abs);
      await p.waitForTimeout(200);say(!t.errs.length&&r.used===r.act,mode+' '+tr+' rank '+rank+': '+r.used+'/'+r.act+' active abilities fired, '+r.kills+' kills, no errors');t.errs.slice(0,4).forEach(e=>console.log('     '+e));if(mode==='three'&&rank===3){await p.evaluate(()=>{for(let i=0;i<4;i++)IN.press['a'+i]=1;});await p.waitForTimeout(400);await t.shot('p2-abilities-'+tr);}await t.close();}}
  await T.done();console.log(fail?'PASS2 FAIL '+fail:'PASS2 OK');process.exit(fail?1:0);})();
