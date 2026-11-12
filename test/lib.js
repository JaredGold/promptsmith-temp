// Test helpers: headless Chrome via Playwright, Three.js r128 served from vendor/ in place of the CDN.
const path=require('path'),fs=require('fs');
// Playwright: a local install if there is one, else the path used in the first build environment.
let chromium;try{chromium=require('playwright').chromium;}catch(e){chromium=require('/opt/npm-tools/node_modules/playwright').chromium;}
const CHROME=process.env.CHROME_PATH||(fs.existsSync('/usr/bin/google-chrome')?'/usr/bin/google-chrome':undefined);
const ROOT=path.resolve(__dirname,'..');
const SIZES={land:{width:780,height:360},port:{width:390,height:780}};
let browser=null;
async function open(o){o=Object.assign({size:'land',mode:'three',save:null},o);
  if(!browser)browser=await chromium.launch({executablePath:CHROME,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required','--mute-audio']});
  const ctx=await browser.newContext({viewport:SIZES[o.size],deviceScaleFactor:2,hasTouch:true,isMobile:true});const page=await ctx.newPage();
  const errs=[];page.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|ERR_BLOCKED|Failed to load resource/.test(m.text()))errs.push(m.text());});page.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' '+(e.stack||'').split('\n').slice(0,3).join(' | ')));
  await page.route('**/three.min.js',r=>o.mode==='nothree'?r.abort():r.fulfill({path:path.join(ROOT,'vendor/three.min.js'),contentType:'application/javascript'}));
  const FD=path.join(ROOT,'vendor/fonts')+'/',ff=(fam,file,w)=>`@font-face{font-family:'${fam}';font-weight:${w};src:url(https://fonts.gstatic.com/l/${file}) format('woff2')}`;
  await page.route(/fonts\.googleapis\.com/,r=>r.fulfill({contentType:'text/css',body:[400,500,600,700].map(w=>ff('Fredoka','fredoka-latin-'+w+'-normal.woff2',w)).join('')+[400,700].map(w=>ff('Courier Prime','courier-prime-latin-'+w+'-normal.woff2',w)).join('')}));
  await page.route(/fonts\.gstatic\.com\/l\//,r=>r.fulfill({path:FD+r.request().url().split('/l/')[1],contentType:'font/woff2',headers:{'access-control-allow-origin':'*'}}));
  if(o.save)await page.addInitScript(s=>{try{localStorage.setItem('promptsmith_lumen_v1',JSON.stringify(s));}catch(e){}},o.save);
  if(o.noStorage)await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('denied');}});});
  await page.goto('file://'+path.join(ROOT,'dist/index.html')+(o.mode==='canvas'?'#canvas':''));
  await page.waitForTimeout(400);await page.evaluate(BOT_SRC);
  return {page,errs,ctx,async shot(name){fs.mkdirSync(path.join(ROOT,'test/out'),{recursive:true});await page.screenshot({path:path.join(ROOT,'test/out',name+'.png')});},async close(){await ctx.close();}};}
async function done(){if(browser)await browser.close();browser=null;}
const save=(o)=>Object.assign({v:1,sparks:0,cleared:{},ranks:{},track:null,loadout:[null,null,null,null],runes:[{t:'dodge',a:'shock'},{t:'kill',a:'bolts'}],tut:{move:1},muted:true,runs:0},o);
// In-page bot + fast-forward (runs game logic without waiting for real time).
const BOT_SRC=`window.BOT={skill:1,hold:{},log:[],
 step(dt){const p=G.p;if(!p||p.dead)return;IN.mx=0;IN.my=0;IN.held.atk=0;
  if(G.run&&G.run.state==='door'){IN.mx=1;return;}
  const e=C.nearest(p.x,p.y+.8,60)||G.w.ents.find(q=>!q.dead);if(!e)return;
  const dx=e.x-p.x,ad=Math.abs(dx),dy=e.y-p.y;let threat=0;
  for(const s of G.w.shots)if(s.team==='e'&&Math.abs(s.x+s.vx*.12-p.x)<1.2&&Math.abs(s.y+s.vy*.12-p.y-.8)<1.4)threat=s.vx>0?-1:1;
  for(const q of G.w.ents)if(q.hot&&Math.abs(q.x-p.x)<2&&Math.abs(q.y-p.y)<1.8)threat=sgn(p.x-q.x)*-1;
  let low=false;for(const s of G.w.shots)if(s.team==='e'&&s.low&&Math.abs(s.x-p.x)<2.4&&sgn(s.vx)===sgn(p.x-s.x))low=true;
  if(low){if(p.ground)IN.press.jump=1;else if(p.vy<2&&p.jumps<1&&p.y<1.4)IN.press.jump=1;threat=0;}
  let tele=null;for(const t of G.w.tele)if(!t.ally&&!t.wide&&t.m-t.t<.45){const x0=t.kind==='circ'?t.x-t.r:t.x0,x1=t.kind==='circ'?t.x+t.r:t.x1;if(p.x>x0-.6&&p.x<x1+.6)tele=[x0,x1,t];}
  if(Math.random()<this.skill){
   if(tele){{IN.mx=(p.x-tele[0]<tele[1]-p.x)?-1:1;if(p.x<G.w.x0+2)IN.mx=1;if(p.x>G.w.x1-2)IN.mx=-1;if(p.dcd<=0)IN.press.dodge=1;return;}}
   else if(threat&&p.dcd<=0&&p.dodge<=0){const ci=SV.d.loadout.indexOf('critique');if(ci>=0&&!(p.cd.critique>0)){IN.press['a'+ci]=1;}else{IN.mx=threat;IN.press.dodge=1;return;}}
  }
  const reach=p.form===1?4.5:p.form===2?3.5:1.6;
  if(ad>reach)IN.mx=sgn(dx);else{if(sgn(dx)!==p.face&&ad>.2)IN.mx=sgn(dx)*.3;IN.held.atk=1;}
  if(dy>1.7&&ad<3&&p.vy<=0&&(p.ground||p.jumps<1))IN.press.jump=1;
  const L=SV.d.loadout;for(let i=0;i<4;i++){const id=L[i];if(!id||!rk(id))continue;const k='a'+i;
   if(id==='think'){if(this.hold[k]>0){this.hold[k]-=dt;IN.held[k]=1;if(this.hold[k]<=0){IN.held[k]=0;IN.rel[k]=1;}}else if(!(p.cd.think>0)&&ad<3.5){IN.press[k]=1;IN.held[k]=1;this.hold[k]=1.5;}continue;}
   if(id==='critique'||id==='format'||id==='role')continue;
   if(!(p.cd[id]>0)&&ad<8&&Math.random()<.2)IN.press[k]=1;}},
 // advance n seconds of game time; clicks through boon cards. Returns a status string.
 ff(sec,until){const dt=1/60;for(let t=0;t<sec;t+=dt){
   if(UI.mode==='pause'){const r=document.querySelector('#ui .row');if(G.run&&G.run.state==='boon'&&r){r.click();}else return 'ui';}
   if(UI.mode==='slow'){if(window.BOT.onChallenge)window.BOT.onChallenge();else return 'challenge';}
   this.step(dt);G.stop=0;G.t+=dt;G.scene.update(dt);IN.clear();
   if(until&&until())return 'until';if(G.p&&G.p.dead&&G.p.deadT>1.8)return 'dead';}return 'time';}};`;
module.exports={open,done,save,SIZES,ROOT};
