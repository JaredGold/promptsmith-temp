// ---------- main loop ----------
let lastTs=0;const PERF={n:0,sum:0,avg:16,worst:0,slow:0};
function frame(ts){requestAnimationFrame(frame);const real=(ts-lastTs)/1000||0,raw=Math.min(.1,real);lastTs=ts;let dt=Math.min(.034,raw);
  // watch the frame time and cut effects (particles, lights, outlines, resolution) before the game slows down
  if(UI.mode==='none'&&real<.3){PERF.sum+=real;PERF.n++;if(PERF.n>=50){PERF.avg=PERF.sum/PERF.n*1000;PERF.worst=Math.max(PERF.worst,PERF.avg);PERF.sum=PERF.n=0;if(PERF.avg>23&&R.q>0){R.setQ(R.q-1);PERF.drops=(PERF.drops||0)+1;}
      else if(PERF.avg>36&&R.q===0&&R.mode==='three'&&++PERF.slow>=2)R.fallback('the 3D renderer was too slow on this device');}}
  if(!G.scene)return;
  if(IN.press.pause){IN.press.pause=0;if(UI.mode==='none')UI.pause();}
  if(UI.mode==='slow')dt*=.07;else if(UI.mode!=='none')dt=0;
  if(G.stop>0&&dt>0){G.stop-=raw;dt=0;R.cam.shake=Math.max(0,R.cam.shake-raw);}
  if(dt>0){G.t+=dt;G.scene.update(dt);IN.clear();}else if(UI.mode!=='none'&&UI.mode!=='slow')IN.clear();
  R.render(ctx=>G.scene.draw(ctx));HUD.update();}
function boot(){SV.load();AU.muted=!!SV.d.muted;R.init();IN.init();FX.max=[50,100,170][R.q];G.mod=newMod();
  if(rk('format'))while(FORMS.length<4)FORMS.push(FORM_EXTRA[FORMS.length-1]);
  GAME.go(HubScene);UI.mode='title';$('#tnote').textContent=sysNote();
  $('#bstart').onclick=()=>{AU.init();AU.setMute(AU.muted);$('#title').classList.add('hide');$('#hud').classList.remove('hide');$('#touch').classList.remove('hide');UI.mode='none';AU.play('hub');HUD.refresh();
    if(R.mode!=='three')toast('Canvas mode: '+R.note+'.');
    if(!SV.d.tut.move){SV.d.tut.move=1;SV.save();setTimeout(()=>toast(IN.usedKb?'A/D move, Space jump, J hit, K dodge.':'Left thumb moves. Right buttons hit, jump and dodge.'),900);setTimeout(()=>toast('Talk to Ember, the mentor in orange.'),4200);}
    else if(innerHeight>innerWidth)setTimeout(()=>toast('Tip: turn your phone sideways for a wider view.'),900);};
  $('#bmute').onclick=()=>{AU.init();toggleMute();};$('#bpause').onclick=()=>UI.pause();
  addEventListener('pointerdown',()=>{if(UI.mode!=='title')AU.init();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(UI.mode==='none'&&G.run)UI.pause();if(AU.ctx)AU.ctx.suspend().catch(()=>{});}else if(AU.ctx)AU.ctx.resume().catch(()=>{});});
  addEventListener('error',e=>{try{toast('Something broke: '+(e.message||'unknown error'));}catch(_){}});
  requestAnimationFrame(frame);}
boot();
