// ---------- small UI pieces ----------
const ROMAN=['I','II','III'];
function toast(msg){const t=$('#toast');while(t.children.length>1)t.firstChild.remove();const d=el('div',null,esc(msg));t.appendChild(d);setTimeout(()=>d.remove(),3000);}
function banner(title,sub){const o=$('#banner');if(o)o.remove();const b=el('div',null,esc(title)+(sub?'<small>'+esc(sub)+'</small>':''));b.id='banner';$('#wrap').appendChild(b);setTimeout(()=>b.remove(),2300);}
function hint(text,fn){const h=$('#hint');if(!text){h.classList.add('hide');h.onclick=null;return;}h.textContent=(fn?(IN.usedKb?'J: ':'Tap: '):'')+text;h.classList.remove('hide');h.onclick=fn?()=>{AU.sfx('ui');fn();}:null;}
function card(o){const c=el('div','card'+(o.wide?' wide':'')),h=el('div','ch');
  if(o.icon){const cv=el('canvas');cv.width=cv.height=88;cv.style.cssText='position:static;width:40px;height:40px;border-radius:12px;background:#201A4B;flex:none';icon(cv,o.icon[0],o.icon[1]);h.appendChild(cv);}
  h.appendChild(el('h2',null,esc(o.title)+(o.sub?'<small>'+esc(o.sub)+'</small>':'')));
  if(o.x){const x=el('button','x','✕');x.setAttribute('aria-label','Close');x.onclick=()=>{AU.sfx('back');o.x();};h.appendChild(x);}c.appendChild(h);
  const b=el('div','cb');if(typeof o.body==='string')b.innerHTML=o.body;else if(o.body)b.appendChild(o.body);c.appendChild(b);c.body=b;
  if(o.btns&&o.btns.length){const f=el('div','cf');for(const q of o.btns){const bt=el('button','btn '+(q.cls||''),esc(q.t));bt.onclick=()=>{AU.sfx('ui');q.f(bt);};bt.disabled=!!q.off;f.appendChild(bt);q.el=bt;}c.appendChild(f);c.foot=f;}return c;}
function face(cv,c,c2){const x=cv.getContext('2d');cv.width=cv.height=112;x.fillStyle=hex(c);x.beginPath();x.arc(56,124,56,0,6.3);x.fill();x.fillStyle='#F2C9A0';x.strokeStyle='#201A4B';x.lineWidth=5;x.beginPath();x.arc(56,58,30,0,6.3);x.fill();x.stroke();x.fillStyle=hex(c2);x.beginPath();x.moveTo(20,44);x.quadraticCurveTo(56,-14,92,44);x.quadraticCurveTo(56,30,20,44);x.fill();x.stroke();
  x.fillStyle='#201A4B';x.beginPath();x.ellipse(45,60,4,6.5,0,0,6.3);x.ellipse(67,60,4,6.5,0,0,6.3);x.fill();x.lineCap='round';x.beginPath();x.arc(56,66,11,.25*Math.PI,.75*Math.PI);x.stroke();}
const MENTOR={E:{name:'Ember',c:0xff8a3d,c2:0xffc53d},W:{name:'Quill',c:0xf7a8ff,c2:0x8a4fd6},A:{name:'Tally',c:0x5eead4,c2:0x1f6f8f},B:{name:'Rivet',c:0x7cff8a,c2:0x3a5a3a}};
function bubble(who,text){const m=MENTOR[who],d=el('div','mentor'),cv=el('canvas');face(cv,m.c,m.c2);d.appendChild(cv);d.appendChild(el('div',null,'<b>'+m.name+'</b><span class="lt">'+esc(text)+'</span>'));return d;}
function copyText(text){const done=ok=>toast(ok?'Copied':'Copy is blocked here. Select the text instead.');try{navigator.clipboard.writeText(text).then(()=>done(true),()=>done(false));}catch(e){done(false);}}
function abRow(id,right,sub){const A=ABILITY[id],r=el('button','row'),cv=el('canvas');cv.width=cv.height=88;icon(cv,A.shape,A.color);r.appendChild(cv);r.appendChild(el('div',null,'<b>'+esc(A.name)+'</b><span>'+esc(sub==null?A.blurb:sub)+'</span>'));if(right)r.appendChild(right);return r;}
const pips=n=>{const d=el('div','pips');for(let i=0;i<3;i++)d.appendChild(el('i',i<n?'on':''));return d;};

// ---------- HUD ----------
const HUD={
  refresh(){const L=SV.d.loadout;for(let i=0;i<4;i++){const b=$('#tb-a'+i),id=L[i],A=id&&rk(id)?ABILITY[id]:null;b.classList.toggle('empty',!A);icon($('canvas',b),A?A.shape:null,A?A.color:0);if(!A){$('em',b).style.height='0';$('s',b).textContent='';}}
    $('#bmute').textContent=AU.muted?'×':'♪';$('#bmute').style.opacity=AU.muted?.6:1;},
  update(){const p=G.p;if(!p)return;const hp=Math.ceil(p.hp);if(hp!==this.hp||p.mhp!==this.mhp){this.hp=hp;this.mhp=p.mhp;$('#hp i').style.width=(100*p.hp/p.mhp)+'%';$('#hp b').textContent=hp+' / '+p.mhp;}
    const sp=G.run?'✦ '+G.run.sparks:'✦ '+SV.d.sparks;if(sp!==this.sp){this.sp=sp;$('#sparks').textContent=sp;}
    const L=SV.d.loadout;for(let i=0;i<4;i++){const id=L[i],r=id&&rk(id);if(!r)continue;const A=ABILITY[id],b=$('#tb-a'+i),cd=p.cd[id]>0?p.cd[id]/Math.max(.01,A.cd(r)*G.mod.cd):0,k=Math.round(clamp(cd,0,1)*20),lb=A.label(p);
      if(b._k!==k){b._k=k;$('em',b).style.height=(k*5)+'%';}if(b._l!==lb){b._l=lb;$('s',b).textContent=lb;}}
    const bo=G.run&&G.run.boss;if(bo&&!bo.dead){const f=Math.round(1000*bo.hp/bo.mhp),s=Math.round(100*bo.shield/Math.max(1,bo.shieldM||1));if(f!==this.bf){this.bf=f;$('#boss i').style.width=(f/10)+'%';}if(s!==this.bs){this.bs=s;$('#boss u').style.width=s+'%';}}}
};

// ---------- screens ----------
const SHRINES={ask:{name:'Shrine of Asking',abs:['clear','context','format']},show:{name:'Shrine of Showing',abs:['examples','role','think']},check:{name:'Shrine of Checking',abs:['iterate','verify','critique']},track:{name:'Track shrine',abs:[]}};
const UI={mode:'title',el:$('#ui'),
  open(c,mode,cls){this.el.innerHTML='';this.el.className=cls||'';this.el.appendChild(c);this.mode=mode||'pause';IN.reset();return c;},
  close(){this.el.className='hide';this.el.innerHTML='';this.mode='none';IN.reset();HUD.refresh();},
  say(who,text,btns,title){this.open(card({title:title||MENTOR[who].name,body:bubble(who,text),x:()=>this.close(),btns:btns||[{t:'OK',f:()=>this.close()}]}));},
  ember(){const d=SV.d,c=PROG.cleared;let t;
    if(!rk('clear'))t='Welcome, apprentice. Start at the Shrine of Asking, just west of here. Learn Clear Ask.';
    else if(!c('1'))t='The Stage gate is far to the east. Wisps are vague: a Clear Ask cuts right through them.';
    else if(!c('2'))t='New lessons opened at the shrines. Learn Verify before the Market: Mimics shrug off blind hits.';
    else if(!c('3'))t='More lessons are open. In the Thicket, finish Creepers with a heavy or precise hit, or they split.';
    else if(!d.track)t='You cleared the shared stages. Pick a track at the signpost: Writer, Analyst or Builder.';
    else if(!PROG.anyS4())t='Rank II lessons cost 30 sparks. Your track shrine and two new stages are open in the east.';
    else t='Rank III is open at every shrine. Each mastered rank adds a prompt to your Codex. Go use them.';
    this.say('E',t);},
  mentor(tr){const T=TRACKS[tr],open=PROG.cleared('3'),cur=SV.d.track===tr;
    const lines={W:'Writers shape words for a reader. I teach Audience, Outline and Edit.',A:'Analysts ground every claim. I teach XML Tags, Quote First and saying "I don\'t know".',B:'Builders wire Claude to tools. I teach Sub-agents, Skills and Connectors.'};
    this.say(tr,!open?'Clear stage 3, then come and see me. '+lines[tr]:lines[tr],open&&!cur?[{t:'Not now',cls:'alt',f:()=>this.close()},{t:'Choose '+T.name,f:()=>this.setTrack(tr)}]:null);},
  setTrack(tr){SV.d.track=tr;SV.save();AU.sfx('rank');this.close();banner(TRACKS[tr].name+' track','Switch any time at the signpost');},
  tracks(){if(!PROG.cleared('3'))return this.say('E','Tracks open after stage 3. Then you pick Writer, Analyst or Builder, and can switch any time.',null,'Tracks');
    const l=el('div','list');for(const k in TRACKS){const T=TRACKS[k],r=el('button','row'),cv=el('canvas');cv.width=cv.height=88;icon(cv,ABILITY[T.abs[0]].shape,T.col);r.appendChild(cv);
      r.appendChild(el('div',null,'<b>'+T.name+(SV.d.track===k?' (current)':'')+'</b><span>'+T.abs.map(a=>ABILITY[a].name).join(', ')+'</span>'));r.onclick=()=>this.setTrack(k);l.appendChild(r);}
    this.open(card({title:'Choose a track',sub:'It changes stages 4 and 5, examples and quests.',body:l,x:()=>this.close()}));},
  shrine(sid){const S=SHRINES[sid],abs=sid==='track'?(SV.d.track?TRACKS[SV.d.track].abs:[]):S.abs;
    if(!abs.length)return this.say('E','This shrine wakes when you choose a track. Clear stage 3, then visit the signpost.',null,S.name);
    const l=el('div','list');for(const id of abs){const r=rk(id),lock=PROG.rankLock(id,r+1),cost=PROG.cost(r+1),right=el('div');right.style.cssText='display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex:none';right.appendChild(pips(r));
      if(r<3&&!lock&&cost)right.appendChild(el('span','cost','✦ '+cost));
      const row=abRow(id,right,r>=3?'Mastered':lock?lock:r?'Next: '+ABILITY[id].ranks[r]:ABILITY[id].blurb);if(lock&&r<3)row.classList.add('lock');
      row.onclick=()=>{if(r>=3)return toast('Mastered. Its prompt is in your Codex.');if(lock)return toast(lock+'.');if(SV.d.sparks<cost)return toast('Needs '+cost+' sparks. You have '+SV.d.sparks+'.');AU.sfx('ui');this.lesson(id,sid);};l.appendChild(row);}
    this.open(card({title:S.name,sub:'✦ '+SV.d.sparks+' sparks',body:l,x:()=>this.close()}));},

  // ----- lesson: Watch, Fix, Write, Quest. Each screen is a small builder; graders live in GRADER. -----
  lessonScreens(id,ri,tr){const L=LESSON[id][ri],w=L.w[tr||'W']||L.w.g||L.w.W,S=[],f=L.f,c=L.c,who=ABILITY[id].track||tr||'E';
    const one=(tag,cls,pc,html)=>({s:0,build(b){b.innerHTML='<span class="tag '+cls+'">'+tag+'</span><div class="'+pc+' lt">'+html+'</div>';}});
    S.push(one('Weak ask','weak','pr weak',esc(w[0])));S.push(one('Claude answers','','pr out',esc(w[1])));
    S.push(one('Strong ask','strong','pr strong',w[2].map((t,i)=>'<span class="blk b'+i+'">'+esc(t)+'</span>').join(' ')));S.push(one('Claude answers','','pr out',esc(w[3])));
    S.push({s:0,build(b){b.innerHTML='<p class="big lt">'+esc(w[4])+'</p>';}});
    S.push({s:1,gate:true,build(b,ok){b.innerHTML='<div class="pr lt">'+esc(f[0])+'<span class="hole">'+esc(f[1])+'</span>'+esc(f[2])+'</div><div class="chips"></div><div class="fbx"></div>';const ch=$('.chips',b),fb=$('.fbx',b);
      for(const o of shuffle([f[3],f[5],f[6]])){const k=el('button','chip',esc(o));k.onclick=()=>{const g=GRADER.fix(L,o);if(g.grade==='strong'){AU.sfx('good');const h=$('.hole',b);h.textContent=o;h.classList.add('ok');ch.remove();fb.innerHTML='<div class="fb ok lt">'+esc(f[4])+'</div>';ok();}else{AU.sfx('bad');k.classList.add('bad');k.disabled=true;fb.innerHTML='<div class="fb no">Not that one. Try another.</div>';}};ch.appendChild(k);}}});
    S.push({s:2,gate:true,checkLabel:'Check',build(b,ok){b.innerHTML='<p class="lt">'+esc(c[0])+'</p><div class="chips"></div><input class="txt" maxlength="60" placeholder="'+esc(c[6])+' (your own words)" aria-label="'+esc(c[6])+'"><div class="fbx"></div>';const ch=$('.chips',b),fb=$('.fbx',b),inp=$('input',b);let done=false;
      for(const o of shuffle(c.slice(1,6))){const k=el('button','chip',esc(o));k.onclick=()=>{if(done)return;if(!k.classList.contains('sel')&&ch.querySelectorAll('.sel').length>=3)return toast('Three blocks at most.');k.classList.toggle('sel');k.classList.remove('bad');AU.sfx('pick');};ch.appendChild(k);}
      this.check=()=>{const sel=[...ch.querySelectorAll('.sel')],g=GRADER.write(L,{picks:sel.map(k=>k.textContent),text:inp.value});
        if(g.grade==='strong'){done=true;AU.sfx('good');for(const k of[...ch.children])if(k.classList.contains('sel'))k.classList.add('good');else k.remove();fb.innerHTML='<div class="fb ok">'+esc(g.notes)+'</div>';ok();}
        else{AU.sfx('bad');sel.forEach(k=>{if(c.indexOf(k.textContent)>3)k.classList.add('bad');});fb.innerHTML='<div class="fb no">'+esc(g.notes)+'</div>';}};}});
    const task=Array.isArray(L.m)?L.m[tr?' WAB'.indexOf(tr):0]:L.m,slots=(L.t.match(/\[[^\]]+\]/g)||[]);
    S.push({s:3,gate:true,build(b,ok){b.appendChild(bubble(who,task));const ins=[],g=el('div','grid2');b.appendChild(g);this.fill=()=>{let i=0;return L.t.replace(/\[[^\]]+\]/g,m=>ins[i++].value.trim()||m);};
      slots.forEach(sl=>{const i=el('input','txt');i.maxLength=80;i.placeholder=sl.slice(1,-1);i.setAttribute('aria-label',sl.slice(1,-1));i.oninput=()=>{if(GRADER.quest(L,ins.map(x=>x.value)).grade==='strong')ok();};ins.push(i);g.appendChild(i);});},
      extra(){return {t:'Copy',cls:'alt',f:()=>copyText(this.fill())};}});
    return S;},
  lesson(id,sid){const A=ABILITY[id],ri=rk(id),S=this.lessonScreens(id,ri,SV.d.track),names=['Watch','Fix','Write','Quest'];let i=0;
    const show=()=>{const sc=S[i],last=i===S.length-1,fin=last?'Finish':'Next';let passed=!sc.gate;
      const btns=[{t:'Back',cls:'alt',off:i===0,f:()=>{i--;show();}}];if(sc.extra)btns.push(sc.extra());
      btns.push({t:sc.gate&&sc.checkLabel?sc.checkLabel:fin,cls:sc.checkLabel?'mint':'',off:sc.gate&&!sc.checkLabel,f:()=>{if(!passed&&sc.check)return sc.check();if(last)return this.rankUp(id,sid);i++;show();}});
      const c=card({wide:true,title:A.name+' '+ROMAN[ri],sub:(sc.s+1)+' of 4: '+names[sc.s],icon:[A.shape,A.color],x:()=>this.shrine(sid),btns}),nb=btns[btns.length-1].el;
      sc.build(c.body,()=>{passed=true;nb.disabled=false;nb.textContent=fin;nb.classList.remove('mint');});this.open(c);};show();},
  rankUp(id,sid){const A=ABILITY[id];PROG.learn(id);const r=rk(id);AU.sfx('rank');buzz(60);
    this.open(card({title:A.name+' '+ROMAN[r-1],sub:'Rank up',icon:[A.shape,A.color],body:'<p class="big">'+esc(A.ranks[r-1])+'</p><p>Its prompt template is now in your Codex.'+(A.kind==='passive'?' It is always on.':SV.d.loadout.includes(id)?' It is on your ability buttons.':' Equip it at the Loadout bench.')+'</p>',btns:[{t:'Done',f:()=>this.shrine(sid)}]}));},

  codex(){const l=el('div','list'),ids=AB_ORDER.filter(rk);
    if(!ids.length)l.innerHTML='<p class="big">Empty for now. Finish a lesson at any shrine and its prompt template lands here.</p>';
    for(const id of ids){const A=ABILITY[id],r=rk(id),t=LESSON[id][r-1].t,d=el('div');d.style.cssText='border:3px solid var(--ink);border-radius:14px;padding:8px;background:#fff';
      d.innerHTML='<b style="font-size:16px">'+esc(A.name)+' '+ROMAN[r-1]+'</b><div class="pr" style="margin:6px 0;font-size:15px">'+esc(t)+'</div>';const b=el('button','btn alt','Copy');b.style.cssText='min-height:42px;width:100%';b.onclick=()=>copyText(t);d.appendChild(b);l.appendChild(d);}
    this.open(card({title:'Codex',sub:'Prompts to use with the real Claude. Fill the [slots].',body:l,x:()=>this.close(),wide:true}));},

  loadout(){let sel=-1;const body=el('div');const draw=()=>{body.innerHTML='';const L=SV.d.loadout,sl=el('div','slots');
      for(let i=0;i<4;i++){const b=el('button','slot'+(i===sel?' pickme':'')),cv=el('canvas');cv.width=cv.height=96;const A=L[i]&&ABILITY[L[i]];icon(cv,A?A.shape:null,A?A.color:0);b.appendChild(cv);b.setAttribute('aria-label','Slot '+(i+1));b.onclick=()=>{sel=sel===i?-1:i;AU.sfx('ui');draw();};sl.appendChild(b);}
      body.appendChild(sl);const l=el('div','list'),ids=AB_ORDER.filter(id=>rk(id)&&ABILITY[id].kind!=='passive');
      if(!ids.length)l.innerHTML='<p>No abilities yet. Learn one at a shrine.</p>';
      for(const id of ids){const at=L.indexOf(id),row=abRow(id,el('span','cost',at>=0?'Slot '+(at+1):'Off'));row.onclick=()=>{AU.sfx('pick');if(at>=0&&sel<0){L[at]=null;}else{let to=sel>=0?sel:L.indexOf(null);if(to<0)return toast('Tap a slot first.');if(at>=0)L[at]=L[to];L[to]=id;sel=-1;}SV.save();draw();};l.appendChild(row);}
      body.appendChild(l);const sr=rk('skills');
      if(sr){const T=sr>=2?Object.keys(RUNE_T):['dodge','kill'],AC=sr>=2?Object.keys(RUNE_A):['shock','bolts'];body.appendChild(el('p',null,'<b>Skill rune'+(sr>=3?'s':'')+'</b>: tap to change.')).style.margin='12px 0 6px';
        for(let i=0;i<(sr>=3?2:1);i++){const ru=SV.d.runes[i],d=el('div','chips');d.style.marginTop='0';d.style.marginBottom='8px';const a=el('button','chip','When '+RUNE_T[ru.t]),b=el('button','chip','do: '+RUNE_A[ru.a].name);
          a.onclick=()=>{ru.t=T[(T.indexOf(ru.t)+1)%T.length];SV.save();AU.sfx('pick');draw();};b.onclick=()=>{ru.a=AC[(AC.indexOf(ru.a)+1)%AC.length];SV.save();AU.sfx('pick');draw();};d.appendChild(a);d.appendChild(b);body.appendChild(d);}}};
    draw();this.open(card({title:'Loadout bench',sub:'Tap a slot, then an ability.',body,x:()=>this.close()}));},

  gate(){const l=el('div','list'),tr=SV.d.track;
    for(const S of STAGE_LIST){if(S.track&&S.track!==tr)continue;const lock=PROG.stageLock(S),r=el('button','row'+(lock?' lock':'')),n=el('span','cost',PROG.cleared(S.id)?'Cleared':lock?'Locked':'Open');
      r.appendChild(el('div',null,'<b>'+S.n+'. '+esc(S.name)+'</b><span>'+(lock?lock:'Boss: '+BOSS[S.boss].name)+'</span>'));r.appendChild(n);r.onclick=()=>{if(lock)return toast(lock+'.');this.close();GAME.go(RunScene,S.id);};l.appendChild(r);}
    if(!tr)l.appendChild(el('div','row lock','<div><b>4 and 5</b><span>'+(PROG.cleared('3')?'Choose a track at the signpost':'Clear stage 3, then choose a track')+'</span></div>'));
    this.open(card({title:'Stage gate',sub:'Four rooms, then a boss.',body:l,x:()=>this.close()}));},

  boons(cb){const l=el('div','list'),ch=boonChoices();if(!ch.length)return cb();
    for(const b of ch){const A=b.ab&&ABILITY[b.ab],r=el('button','row'),cv=el('canvas');cv.width=cv.height=88;icon(cv,A?A.shape:'heart',A?A.color:0xffc53d);r.appendChild(cv);r.appendChild(el('div',null,'<b>'+esc(b.name)+'</b><span>'+esc(b.desc)+'</span>'));
      r.onclick=()=>{AU.sfx('good');G.run.boons.push(b.id);b.apply(G.mod);const i=el('i');i.style.background=hex(A?A.color:0xffc53d);$('#boonrow').appendChild(i);this.close();cb();};l.appendChild(r);}
    this.open(card({title:'Pick a boon',sub:'Lasts until this run ends.',body:l}),'pause','soft');},

  pause(){if(this.mode!=='none')return;const run=!!G.run,b=el('div','list');let armed=false;
    const row=(t,s,f)=>{const r=el('button','row','<div><b>'+t+'</b><span>'+s+'</span></div>');r.onclick=()=>f(r);b.appendChild(r);return r;};
    row('Sound: '+(AU.muted?'off':'on'),'Music and effects',()=>{toggleMute();this.close();this.pause();});
    if(run)row('Leave the run','Keep the sparks you found',()=>{RunScene.finish(false);this.close();GAME.go(HubScene);});
    else row('Erase progress','Start over from nothing',r=>{if(!armed){armed=true;$('b',r).textContent='Tap again to erase everything';return;}SV.reset();TIPS={};this.close();GAME.go(HubScene);toast('Progress erased.');});
    b.appendChild(el('p',null,'<small>'+esc(sysNote())+'</small>'));
    this.open(card({title:'Paused',body:b,x:()=>this.close(),btns:[{t:'Resume',f:()=>this.close()}]}));},

  summary(win){const run=G.run,S=run.stage,res=RunScene.finish(win),mins=Math.floor(run.t/60),secs=String(Math.floor(run.t%60)).padStart(2,'0');let extra='';
    if(win&&res.first){if(S.n<3)extra='New lessons are open at the shrines.';else if(S.n===3)extra='Tracks are open. Visit the signpost in town.';else if(S.n===4)extra='Rank III lessons and stage 5 are open.';else extra='You cleared the '+TRACKS[S.track].name+' track. Try another at the signpost.';}
    AU.play('hub');AU.sfx(win?'win':'bad');
    this.open(card({title:win?'Stage clear':'The Static got you',sub:S.name,body:'<p class="big">✦ '+(run.sparks+res.bonus)+' sparks'+(res.bonus?' (with +'+res.bonus+' bonus)':'')+'</p><p>'+run.kills+' foes cleared in '+mins+':'+secs+'. '+(win?esc(extra):'You keep your sparks. Spend them at a shrine.')+'</p>',
      btns:win?[{t:'Back to town',f:()=>{this.close();GAME.go(HubScene);}}]:[{t:'Town',cls:'alt',f:()=>{this.close();GAME.go(HubScene);}},{t:'Try again',f:()=>{this.close();GAME.go(RunScene,S.id);}}]}));}
};
function toggleMute(){AU.setMute(!AU.muted);SV.d.muted=AU.muted;SV.save();HUD.refresh();}
function sysNote(){return (R.mode==='three'?'3D renderer: Three.js.':'Canvas mode: '+R.note+'.')+' '+(SV.persistent?'Progress saves in this browser.':'Saving is unavailable here: progress lasts until you close the page.');}

// ---------- boss shield challenges ----------
// challenge UI builders (kept apart from the graders)
const CHALLENGE_UI={
  fix(ch,b,done){const f=ch.L.f;b.innerHTML='<div class="pr lt">'+esc(f[0])+'<span class="hole">'+esc(f[1])+'</span>'+esc(f[2])+'</div><div class="chips"></div>';for(const o of shuffle([f[3],f[5],f[6]])){const k=el('button','chip',esc(o));k.onclick=()=>{const g=GRADER.fix(ch.L,o);k.classList.add(g.grade==='strong'?'good':'bad');done(g.grade,f[4]);};$('.chips',b).appendChild(k);}},
  write(ch,b,done){const c=ch.L.c;b.innerHTML='<p class="lt">'+esc(c[0])+' Pick 3 blocks.</p><div class="chips"></div>';const box=$('.chips',b);for(const o of shuffle(c.slice(1,6))){const k=el('button','chip',esc(o));k.onclick=()=>{k.classList.toggle('sel');AU.sfx('pick');const sel=[...box.querySelectorAll('.sel')];if(sel.length<3)return;const g=GRADER.write(ch.L,{picks:sel.map(x=>x.textContent),text:''});sel.forEach(x=>x.classList.add(c.indexOf(x.textContent)>3?'bad':'good'));done(g.grade,g.notes);};box.appendChild(k);}},
  order(ch,b,done){b.innerHTML='<p class="lt">Tap the pieces in the order that makes a strong prompt.</p><div class="chips"></div>';const box=$('.chips',b),ans=[];ch.parts.map((t,i)=>({t,i})).sort(()=>Math.random()-.5).forEach(o=>{const k=el('button','chip',esc(o.t));k.onclick=()=>{if(k.classList.contains('sel'))return;k.classList.add('sel');ans.push(o.i);k.textContent=ans.length+'. '+o.t;AU.sfx('pick');if(ans.length===ch.parts.length){const g=GRADER.order(ch,ans);done(g.grade,g.notes);}};box.appendChild(k);});}
};
UI.challenge=function(ch,cb){const A=ch.id&&ABILITY[ch.id],T=26;let left=T,over=false;const body=el('div');body.innerHTML='<div class="timer"><i></i></div><div class="chb"></div>';
  const c=card({wide:true,title:'Break the shield',sub:A?A.name+': '+(ch.type==='fix'?'fix the weak part':'build the ask'):'Put the prompt in order',icon:A?[A.shape,A.color]:['bars',0xbff6ff],body});
  const fin=(g,note)=>{if(over)return;over=true;clearInterval(iv);AU.sfx(g==='strong'?'good':'bad');for(const k of c.querySelectorAll('.chip'))k.disabled=true;const fb=el('div','fb '+(g==='strong'?'ok':'no'),(g==='strong'?'Strong. ':g==='weak'?'Weak. ':'Too slow. ')+esc(note||''));$('.chb',body).appendChild(fb);fb.scrollIntoView({block:'nearest'});setTimeout(()=>{UI.close();cb(g);},g==='strong'?1300:2100);};
  const iv=setInterval(()=>{if(UI.mode!=='slow'){clearInterval(iv);return;}left-=.1;$('.timer i',body).style.width=Math.max(0,100*left/T)+'%';if(left<=0)fin('fail','');},100);
  CHALLENGE_UI[ch.type](ch,$('.chb',body),fin);UI.open(c,'slow','soft');UI.cur={ch,fin};};
