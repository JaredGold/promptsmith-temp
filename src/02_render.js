// ---------- scene graph (backend-agnostic) ----------
// Part: {s:'box'|'sph'|'cyl'|'cone'|'img', x,y,z, w,h,d, r, c, e(unlit), n(name)}
function P(s,x,y,w,h,c,o){const p={s,x,y,z:0,w,h,d:Math.min(w,h),c,r:0};if(o)Object.assign(p,o);return p;}
function mk(parts,x,y,z,o){const n={parts,x:x||0,y:y||0,z:z||0,rot:0,face:1,s:1,sy:1,vis:true,flash:0,st:false,bw:1,p:{}};if(o)Object.assign(n,o);
  for(const p of parts){if(p.n)n.p[p.n]=p;n.bw=Math.max(n.bw,Math.abs(p.x)+p.w/2+.2);}parts.sort((a,b)=>a.z-b.z);return n;}
// pivot helper: hang part from pivot (px,py) at angle a, its centre len away
function pv(p,px,py,a,len){p.x=px+Math.sin(a)*len;p.y=py-Math.cos(a)*len;p.r=a;}

// Renderer facade. Depends only on the backend interface:
//   name, add(node), remove(node), setEnv(), resize(), render(ctx), dispose()
const R={mode:'canvas',note:'',backend:null,W:1,H:1,dpr:1,th:Math.tan(20*Math.PI/180),k:40,q:2,sortDirty:false,
  cam:{x:0,y:3,baseD:14,zoom:1,ox:0,oy:0,shake:0,gy:2.4,vh:10},
  nodes:[],envV:0,lights:[],
  ENV0:{sky:[0x8fd3ff,0xfff1c9],fog:0xcfe8ff,near:20,far:90,amb:.75,sun:.7,sunc:0xffffff,speck:0},env:null,
  init(){this.env=Object.assign({},this.ENV0);this.c3=$('#c3d');this.fxc=$('#fx');this.ctx=this.fxc.getContext('2d');let force=false;
    try{force=/canvas/.test(location.hash);}catch(e){}
    if(window.THREE&&!force){try{this.backend=new ThreeBackend(this.c3);}catch(e){this.note='Three.js loaded, but WebGL would not start ('+(e&&e.message||e)+')';}}
    else this.note=force?'Canvas mode was requested':(window.__threeErr?'Three.js could not be downloaded':'Three.js is not available here');
    if(!this.backend){this.backend=new CanvasBackend();this.c3.classList.add('hide');}
    this.mode=this.backend.name;
    addEventListener('resize',()=>this.resize());addEventListener('orientationchange',()=>setTimeout(()=>this.resize(),200));this.resize();},
  fallback(why){if(this.mode!=='three')return;const old=this.backend;this.backend=new CanvasBackend();this.mode='canvas';this.note=why;this.c3.classList.add('hide');
    for(const n of this.nodes){n._g=null;n._s=false;}this.envV++;this.sortDirty=true;try{old.dispose();}catch(e){}
    if(typeof toast==='function')toast('Switched to Canvas mode: '+why+'.');},
  resize(){const W=this.W=Math.max(200,innerWidth),H=this.H=Math.max(200,innerHeight),a=W/H;this.dpr=Math.min(window.devicePixelRatio||1,[.8,1.15,1.75][this.q]);
    this.fxc.width=Math.round(W*this.dpr);this.fxc.height=Math.round(H*this.dpr);
    const vh=a>=1?Math.max(9.6,15.5/a):12/a;this.cam.vh=vh;this.cam.baseD=vh/(2*this.th);this.cam.gy=vh*(a>=1?.25:.37);
    this.backend.resize();},
  setQ(q){if(q===this.q)return;this.q=q;FX.max=[50,100,170][q];this.resize();},
  add(n){this.nodes.push(n);this.sortDirty=true;this.backend.add(n);return n;},
  remove(n){if(!n)return;const i=this.nodes.indexOf(n);if(i>=0){this.nodes.splice(i,1);this.backend.remove(n);}},
  clear(){for(const n of this.nodes)this.backend.remove(n);this.nodes.length=0;},
  setEnv(e){this.env=Object.assign({},this.ENV0,e);this.envV++;this.backend.setEnv();},
  px(x){return this.W/2+(x-this.cam.x-this.cam.ox)*this.k;},
  py(y){return this.H/2-(y-this.cam.y-this.cam.oy)*this.k;},
  light(x,y,c,i,d){if(this.lights.length<10)this.lights.push({x,y,c,i,d:d||8});},
  render(drawFx){const c=this.cam,ctx=this.ctx,D=c.baseD/c.zoom;this.k=(this.H/2)/(D*this.th);
    if(c.shake>0){c.ox=rnd(-1,1)*c.shake;c.oy=rnd(-1,1)*c.shake;}else c.ox=c.oy=0;
    if(this.lights.length>4)this.lights.sort((a,b)=>b.i-a.i);
    ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    try{this.backend.render(ctx);}catch(e){if(this.mode!=='three')throw e;this.fallback('Three.js hit an error while drawing ('+(e&&e.message||e)+')');ctx.setTransform(this.dpr,0,0,this.dpr,0,0);this.backend.render(ctx);}
    ctx.setTransform(this.dpr,0,0,this.dpr,0,0);drawFx(ctx);this.lights.length=0;}
};

// ---------- Three.js backend ----------
// Characters (node.ol) get toon shading plus an ink outline (inverted hull); scenery stays soft Lambert.
function roundBoxGeo(r){const g=new THREE.BoxGeometry(1,1,1,5,5,5),p=g.attributes.position,nn=g.attributes.normal,v=new THREE.Vector3(),c=new THREE.Vector3(),i0=.5-r;
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);c.set(clamp(v.x,-i0,i0),clamp(v.y,-i0,i0),clamp(v.z,-i0,i0));v.sub(c);if(v.lengthSq()<1e-9)v.fromBufferAttribute(nn,i);v.normalize();nn.setXYZ(i,v.x,v.y,v.z);v.multiplyScalar(r).add(c);p.setXYZ(i,v.x,v.y,v.z);}return g;}
function capsuleGeo(){const pts=[];for(let i=0;i<=6;i++){const t=i/6*Math.PI/2;pts.push(new THREE.Vector2(.5*Math.sin(t)+.0001,-.25-.25*Math.cos(t)));}for(let i=0;i<=6;i++){const t=i/6*Math.PI/2;pts.push(new THREE.Vector2(.5*Math.cos(t)+.0001,.25+.25*Math.sin(t)));}return new THREE.LatheGeometry(pts,16);}
class ThreeBackend{
  constructor(cv){this.name='three';const r=this.r=new THREE.WebGLRenderer({canvas:cv,antialias:(window.devicePixelRatio||1)<=2,powerPreference:'high-performance'});
    this.scene=new THREE.Scene();this.cam=new THREE.PerspectiveCamera(40,1,1,240);
    this.amb=new THREE.AmbientLight(0xffffff,.7);this.sun=new THREE.DirectionalLight(0xffffff,.7);this.sun.position.set(-5,10,9);this.hemi=new THREE.HemisphereLight(0xffffff,0x8c87a6,.3);this.scene.add(this.amb);this.scene.add(this.sun);this.scene.add(this.hemi);
    this.pl=[];for(let i=0;i<4;i++){const l=new THREE.PointLight(0xffffff,0,9,1.5);l.position.set(0,-50,0);this.scene.add(l);this.pl.push(l);}
    this.geo={box:new THREE.BoxGeometry(1,1,1),rbox:roundBoxGeo(.2),sph:new THREE.SphereGeometry(.5,18,12),cyl:new THREE.CylinderGeometry(.5,.5,1,14),cone:new THREE.ConeGeometry(.5,1,14),cap:capsuleGeo(),img:new THREE.PlaneGeometry(1,1)};
    this.lo=Object.assign({},this.geo,{sph:new THREE.SphereGeometry(.5,12,8),cyl:new THREE.CylinderGeometry(.5,.5,1,10),cone:new THREE.ConeGeometry(.5,1,10),rbox:this.geo.box,cap:new THREE.CylinderGeometry(.5,.5,1,10)}); // scenery uses cheaper shapes
    this.grad=new THREE.DataTexture(new Uint8Array([105,180,255]),3,1,THREE.LuminanceFormat);this.grad.minFilter=this.grad.magFilter=THREE.NearestFilter;this.grad.needsUpdate=true;
    this.mats={};this.white=new THREE.MeshBasicMaterial({color:0xffffff});this.ink=new THREE.MeshBasicMaterial({color:0x201a4b,side:THREE.BackSide});
    this.shGeo=new THREE.CircleGeometry(.5,20);this.shMat=new THREE.MeshBasicMaterial({color:0x12102b,transparent:true,opacity:.26,depthWrite:false});
    this.sky=new THREE.Mesh(this.geo.img,new THREE.MeshBasicMaterial({color:0xffffff,fog:false,depthWrite:false}));this.sky.renderOrder=-1;this.sky.frustumCulled=false;this.scene.add(this.sky);
    // self-test: one toon mesh with an outline, one frame. Throws if WebGL is not usable.
    const t=new THREE.Mesh(this.geo.cap,this.mat(0xff0000,false,true)),t2=new THREE.Mesh(this.geo.rbox,this.ink);this.scene.add(t);this.scene.add(t2);this.cam.position.set(0,0,10);r.render(this.scene,this.cam);this.scene.remove(t);this.scene.remove(t2);
    const gl=r.getContext();if(!gl||(gl.isContextLost&&gl.isContextLost())){r.dispose();throw new Error('no WebGL context');}
    cv.addEventListener('webglcontextlost',e=>{e.preventDefault();R.fallback('the WebGL context was lost');});
    this.setEnv();}
  dispose(){if(this.r){this.r.dispose();this.r=null;}}
  mat(c,e,toon){const k=c+(e?'e':toon?'t':'');return this.mats[k]||(this.mats[k]=e?new THREE.MeshBasicMaterial({color:c}):toon?new THREE.MeshToonMaterial({color:c,gradientMap:this.grad}):new THREE.MeshLambertMaterial({color:c}));}
  imgMat(cv,op){const k=op?'_mo':'_m';if(!cv[k]){const t=cv._t||(cv._t=new THREE.CanvasTexture(cv));cv[k]=new THREE.MeshBasicMaterial(op?{map:t}:{map:t,transparent:true,depthWrite:false,side:THREE.DoubleSide});}return cv[k];}
  resize(){if(!this.r)return;this.ink.visible=R.q>0;this.r.setPixelRatio(R.dpr);this.r.setSize(R.W,R.H,false);this.cam.aspect=R.W/R.H;this.cam.updateProjectionMatrix();}
  setEnv(){const e=R.env;this.scene.fog=new THREE.Fog(e.fog,e.near,e.far);this.r.setClearColor(e.fog,1);this.amb.intensity=e.amb*.62;this.sun.intensity=e.sun*.62;this.sun.color.setHex(e.sunc);this.hemi.intensity=.2;this.hemi.color.setHex(mix(e.sky[0],0xffffff,.5));this.hemi.groundColor.setHex(e.fog);
    const m=this.sky.material;if(m.map)m.map.dispose();m.map=new THREE.CanvasTexture(skyCanvas(e));m.needsUpdate=true;}
  add(n){const g=new THREE.Group();n._g=g;n._s=false;
    for(const p of n.parts){const m=p.s==='img'?new THREE.Mesh(this.geo.img,this.imgMat(p.img,p.op)):new THREE.Mesh((n.ol?this.geo:this.lo)[p.s],this.mat(p.c,p.e,n.ol));p._m=m;p._mat=m.material;p._o=null;
      if(n.ol&&p.s!=='img'){const o=new THREE.Mesh(this.geo[p.s],this.ink);p._o=o;g.add(o);}g.add(m);}
    if(n.sh){n._sh=new THREE.Mesh(this.shGeo,this.shMat);n._sh.rotation.x=-Math.PI/2;this.scene.add(n._sh);}
    this.sync(n);this.scene.add(g);}
  remove(n){if(!n._g)return;this.scene.remove(n._g);if(n._sh){this.scene.remove(n._sh);n._sh=null;}n._g=null;for(const p of n.parts){p._m=null;p._o=null;}}
  sync(n){const g=n._g,f=n.face<0?-1:1;g.position.set(n.x,n.y,n.z);g.rotation.z=n.rot*f;g.scale.set(n.s*f,n.s*n.sy,n.s);g.visible=n.vis;
    if(n._sh){const gy=n.gy||0,k=n.sh*n.s/(1+Math.max(0,n.y-gy)*.35);n._sh.visible=n.vis;n._sh.position.set(n.x,gy+.03,n.z+.1);n._sh.scale.set(k*2,k*1.3,1);}
    if(!n.vis)return;const fl=n.flash>0,t=.075/n.s;
    for(const p of n.parts){const m=p._m,v=p.vis!==false;m.position.set(p.x,p.y,p.z);m.rotation.z=p.r;m.scale.set(p.w,p.h,p.d);m.visible=v;if(p.s!=='img')m.material=fl?this.white:p._mat;
      const o=p._o;if(o){o.visible=v;o.position.set(p.x,p.y,p.z);o.rotation.z=p.r;o.scale.set(p.w+t,p.h+t,p.d+t);}}}
  render(ctx){const c=R.cam,cx=c.x+c.ox,cy=c.y+c.oy,D=c.baseD/c.zoom;
    for(const n of R.nodes){if(n.st&&n._s)continue;if(!n._g)this.add(n);else this.sync(n);n._s=true;}
    const L=R.lights,nl=R.q===0?0:R.q===1?2:4;for(let i=0;i<4;i++){const l=this.pl[i],s=i<nl?L[i]:null;if(s){l.position.set(s.x,s.y,1.4);l.color.setHex(s.c);l.intensity=s.i;l.distance=s.d;}else l.intensity=0;}
    const sd=80,sh=2*(D+sd)*R.th*1.2;this.sky.position.set(cx,cy,-sd);this.sky.scale.set(sh*Math.max(1,R.W/R.H)*1.15,sh,1);
    this.cam.position.set(cx,cy,D);this.r.render(this.scene,this.cam);
    ctx.clearRect(0,0,R.W,R.H);}
}
function skyCanvas(e){const cv=document.createElement('canvas');cv.width=128;cv.height=256;const x=cv.getContext('2d'),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,hex(e.sky[0]));g.addColorStop(1,hex(e.sky[1]));x.fillStyle=g;x.fillRect(0,0,128,256);
  if(e.speck){for(let i=0;i<e.speck;i++){x.fillStyle=Math.random()<.5?'rgba(255,255,255,.10)':'rgba(0,0,0,.08)';x.fillRect(Math.random()*128,Math.random()*256,rnd(1,5),1.2);}}return cv;}
function rrect(ctx,x,y,w,h,r){r=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}

// ---------- Canvas 2D fallback backend (same scene, perspective parallax, same ink outlines) ----------
class CanvasBackend{
  constructor(){this.name='canvas';this.sky=null;this.skyV=-1;}
  add(){}remove(){}setEnv(){}resize(){}dispose(){}
  render(ctx){const W=R.W,H=R.H,c=R.cam,cx=c.x+c.ox,cy=c.y+c.oy,D=c.baseD/c.zoom,e=R.env,dp=R.dpr;
    if(this.skyV!==R.envV){this.sky=skyCanvas(e);this.skyV=R.envV;}
    ctx.drawImage(this.sky,0,0,W,H);
    if(R.sortDirty){R.nodes.sort((a,b)=>a.z-b.z);R.sortDirty=false;}
    const D0=c.baseD,fr=1/Math.max(1,e.far-e.near);ctx.lineJoin='round';
    for(const n of R.nodes){if(!n.vis)continue;const dz=D-n.z;if(dz<1)continue;const kz=(H/2)/(dz*R.th),sx=W/2+(n.x-cx)*kz,ext=(n.bw*n.s+1)*kz;if(sx<-ext||sx>W+ext)continue;
      const sy=H/2-(n.y-cy)*kz,ks=kz*n.s*dp,ol=n.ol;
      if(n.sh){const gy=n.gy||0,k=n.sh*n.s*kz/(1+Math.max(0,n.y-gy)*.35);ctx.setTransform(dp,0,0,dp,0,0);ctx.fillStyle='rgba(18,16,43,.24)';ctx.beginPath();ctx.ellipse(sx,H/2-(gy-cy)*kz,k,k*.24,0,0,6.2832);ctx.fill();}
      if(n._ev!==R.envV){n._ev=R.envV;for(const p of n.parts){if(p.s==='img')continue;const f=clamp((D0-(n.z+p.z)-e.near)*fr,0,1)*(p.e?.45:.92);p._cs=hex(f>0.01?mix(p.c,e.fog,f):p.c);}}
      ctx.setTransform(ks*(n.face<0?-1:1),0,0,-ks*n.sy,sx*dp,sy*dp);if(n.rot)ctx.rotate(n.rot);
      const fl=n.flash>0;if(ol){ctx.strokeStyle='#201A4B';ctx.lineWidth=.085/n.s;}
      for(const p of n.parts){if(p.vis===false)continue;const w=p.w,h=p.h,s=p.s;let x=p.x,y=p.y;
        if(p.r){ctx.save();ctx.translate(x,y);ctx.rotate(p.r);x=0;y=0;}
        if(s==='img'){ctx.save();ctx.translate(x,y);ctx.scale(1,-1);ctx.drawImage(p.img,-w/2,-h/2,w,h);ctx.restore();}
        else{ctx.fillStyle=fl?'#fff':p._cs;
          if(s==='sph'){ctx.beginPath();ctx.ellipse(x,y,w/2,h/2,0,0,6.2832);}
          else if(s==='cone'){ctx.beginPath();ctx.moveTo(x-w/2,y-h/2);ctx.lineTo(x+w/2,y-h/2);ctx.lineTo(x,y+h/2);ctx.closePath();}
          else if(s==='cap')rrect(ctx,x-w/2,y-h/2,w,h,Math.min(w,h)/2);
          else if(s==='rbox')rrect(ctx,x-w/2,y-h/2,w,h,Math.min(w,h)*.24);
          else{ctx.beginPath();ctx.rect(x-w/2,y-h/2,w,h);}
          if(ol)ctx.stroke();ctx.fill();
          if(ol&&!fl&&!p.e&&R.q>0){ctx.fillStyle='rgba(255,255,255,.17)';ctx.beginPath();ctx.ellipse(x-w*.1,y+h*.2,w*.3,h*.22,0,0,6.2832);ctx.fill();}}
        if(p.r)ctx.restore();}
    }}
}

// ---------- FX overlay: particles, glow, numbers, technique shapes ----------
const FX={ps:[],nums:[],rings:[],max:170,gts:{},
  burst(x,y,c,n,sp,o){o=o||{};if(R.q===0)n=Math.ceil(n/2);for(let i=0;i<n;i++){if(this.ps.length>=this.max)this.ps.shift();const a=o.dir!=null?o.dir+rnd(-1,1)*(o.spread||.6):rnd(0,6.283),v=rnd(.3,1)*(sp||5);
    this.ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v+(o.up||0),l:0,m:rnd(.25,.6)*(o.life||1),s:rnd(.05,.12)*(o.size||1),c:hex(c),g:o.g==null?9:o.g});}},
  num(x,y,t,c,big){if(this.nums.length>30)this.nums.shift();this.nums.push({x:x+rnd(-.3,.3),y,t,c:c||'#fff',l:0,big:big||1});},
  ring(x,y,c,r,life,w){this.rings.push({x,y,c:hex(c),r,l:0,m:life||.35,w:w||.12});},
  clear(){this.ps.length=0;this.nums.length=0;this.rings.length=0;},
  update(dt){for(let i=this.ps.length-1;i>=0;i--){const p=this.ps[i];p.l+=dt;if(p.l>=p.m){this.ps.splice(i,1);continue;}p.vy-=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
    for(let i=this.nums.length-1;i>=0;i--){const n=this.nums[i];n.l+=dt;n.y+=dt*(1.8-n.l*1.5);if(n.l>.8)this.nums.splice(i,1);}
    for(let i=this.rings.length-1;i>=0;i--){const r=this.rings[i];r.l+=dt;if(r.l>=r.m)this.rings.splice(i,1);}},
  gt(c){let t=this.gts[c];if(!t){t=document.createElement('canvas');t.width=t.height=64;const x=t.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32),r=c>>16&255,gg=c>>8&255,b=c&255;
    g.addColorStop(0,`rgba(${r},${gg},${b},.9)`);g.addColorStop(.35,`rgba(${r},${gg},${b},.35)`);g.addColorStop(1,`rgba(${r},${gg},${b},0)`);x.fillStyle=g;x.fillRect(0,0,64,64);this.gts[c]=t;}return t;},
  glow(ctx,x,y,r,c,a){const rp=r*R.k;ctx.globalAlpha=a==null?1:a;ctx.drawImage(this.gt(c),R.px(x)-rp,R.py(y)-rp,rp*2,rp*2);ctx.globalAlpha=1;},
  sh(ctx,kind,x,y,size,rot,c,a){ctx.save();ctx.translate(R.px(x),R.py(y));if(rot)ctx.rotate(-rot);ctx.globalAlpha=a==null?1:a;const h=typeof c==='number'?hex(c):c;ctx.fillStyle=h;ctx.strokeStyle=h;shape(ctx,kind,size*R.k);ctx.restore();},
  drawParts(ctx){ctx.globalCompositeOperation='lighter';const k=R.k;for(const p of this.ps){const a=1-p.l/p.m,s=p.s*k*(.5+a);ctx.globalAlpha=a;ctx.fillStyle=p.c;ctx.fillRect(R.px(p.x)-s/2,R.py(p.y)-s/2,s,s);}
    for(const r of this.rings){const t=r.l/r.m;ctx.globalAlpha=1-t;ctx.strokeStyle=r.c;ctx.lineWidth=r.w*k*(1-t*.6);ctx.beginPath();ctx.arc(R.px(r.x),R.py(r.y),Math.max(1,r.r*k*(.2+.8*Math.sqrt(t))),0,6.283);ctx.stroke();}
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';},
  drawNums(ctx){ctx.textAlign='center';ctx.lineJoin='round';for(const n of this.nums){const a=n.l<.55?1:1-(n.l-.55)/.25,sc=n.l<.08?1.6-n.l*7:1,fs=Math.round(clamp(R.k*.5,15,27)*n.big*sc);ctx.globalAlpha=Math.max(0,a);ctx.font='700 '+fs+'px Fredoka,system-ui,sans-serif';
      const x=R.px(n.x),y=R.py(n.y);ctx.lineWidth=Math.max(4,fs*.28);ctx.strokeStyle='#201A4B';ctx.strokeText(n.t,x,y);ctx.fillStyle=n.c;ctx.fillText(n.t,x,y);ctx.globalAlpha*=.35;ctx.fillStyle='#fff';ctx.save();ctx.beginPath();ctx.rect(x-fs*3,y-fs,fs*6,fs*.48);ctx.clip();ctx.fillText(n.t,x,y);ctx.restore();}ctx.globalAlpha=1;}
};
// technique shapes, drawn centred at origin with radius s (screen y-down)
function shape(x,k,s){x.lineWidth=Math.max(1.5,s*.24);x.lineCap='round';x.lineJoin='round';x.beginPath();
  switch(k){
    case 'diamond':x.moveTo(s*1.2,0);x.lineTo(0,s*.5);x.lineTo(-s*1.2,0);x.lineTo(0,-s*.5);x.closePath();x.fill();break;
    case 'ring':x.arc(0,0,s*.85,0,6.283);x.stroke();x.beginPath();x.arc(0,0,s*.3,0,6.283);x.fill();break;
    case 'tri':x.moveTo(s,0);x.lineTo(-s*.2,s*.7);x.lineTo(-s*.2,-s*.7);x.closePath();x.fill();x.globalAlpha*=.5;x.beginPath();x.moveTo(0,0);x.lineTo(-s,s*.6);x.lineTo(-s,-s*.6);x.closePath();x.fill();break;
    case 'bracket':x.moveTo(-s*.35,-s);x.lineTo(-s*.8,-s);x.lineTo(-s*.8,s);x.lineTo(-s*.35,s);x.moveTo(s*.35,-s);x.lineTo(s*.8,-s);x.lineTo(s*.8,s);x.lineTo(s*.35,s);x.stroke();break;
    case 'chev':x.moveTo(-s*.8,-s*.7);x.lineTo(0,-s*.1);x.lineTo(s*.8,-s*.7);x.moveTo(-s*.8,s*.1);x.lineTo(0,s*.7);x.lineTo(s*.8,s*.1);x.stroke();break;
    case 'hex':for(let i=0;i<6;i++){const a=i*1.0472;x[i?'lineTo':'moveTo'](Math.cos(a)*s,Math.sin(a)*s);}x.closePath();x.fill();break;
    case 'arc':x.arc(0,0,s*.75,.6,5.2);x.stroke();x.beginPath();x.moveTo(s*.75,-s*.9);x.lineTo(s*.2,-s*.75);x.lineTo(s*.6,-s*.25);x.closePath();x.fill();break;
    case 'check':x.moveTo(-s*.8,0);x.lineTo(-s*.2,s*.6);x.lineTo(s*.85,-s*.65);x.stroke();break;
    case 'x':x.moveTo(-s*.7,-s*.7);x.lineTo(s*.7,s*.7);x.moveTo(s*.7,-s*.7);x.lineTo(-s*.7,s*.7);x.stroke();break;
    case 'wave':x.moveTo(-s,0);x.bezierCurveTo(-s*.5,-s*1.1,-s*.1,-s*1.1,0,0);x.bezierCurveTo(s*.1,s*1.1,s*.5,s*1.1,s,0);x.stroke();break;
    case 'bars':x.fillRect(-s*.9,-s*.75,s*1.8,s*.34);x.fillRect(-s*.9,-s*.17,s*1.3,s*.34);x.fillRect(-s*.9,s*.41,s*.8,s*.34);break;
    case 'slash':x.moveTo(-s*.8,s*.8);x.lineTo(s*.8,-s*.8);x.stroke();x.beginPath();x.arc(-s*.55,-s*.5,s*.18,0,6.283);x.fill();break;
    case 'tag':x.moveTo(-s*.25,-s*.75);x.lineTo(-s*.95,0);x.lineTo(-s*.25,s*.75);x.moveTo(s*.25,-s*.75);x.lineTo(s*.95,0);x.lineTo(s*.25,s*.75);x.stroke();break;
    case 'quote':for(const o of[-.5,.5]){x.beginPath();x.arc(o*s,-s*.15,s*.34,0,6.283);x.fill();x.beginPath();x.moveTo(o*s+s*.34,-s*.15);x.lineTo(o*s-s*.2,s*.8);x.lineTo(o*s-s*.05,-s*.1);x.closePath();x.fill();}break;
    case 'q':x.arc(0,-s*.35,s*.5,3.4,7.6);x.lineTo(0,s*.25);x.stroke();x.beginPath();x.arc(0,s*.75,s*.16,0,6.283);x.fill();break;
    case 'bot':x.fillRect(-s*.7,-s*.4,s*1.4,s*1.1);x.fillRect(-s*.08,-s*.95,s*.16,s*.5);x.beginPath();x.arc(0,-s*.95,s*.18,0,6.283);x.fill();x.fillStyle='#201A4B';x.fillRect(-s*.42,-s*.1,s*.26,s*.26);x.fillRect(s*.16,-s*.1,s*.26,s*.26);break;
    case 'rune':for(let i=0;i<6;i++){const a=i*1.0472+.5236;x[i?'lineTo':'moveTo'](Math.cos(a)*s,Math.sin(a)*s);}x.closePath();x.stroke();x.beginPath();x.moveTo(s*.2,-s*.55);x.lineTo(-s*.25,0);x.lineTo(s*.25,0);x.lineTo(-s*.2,s*.55);x.stroke();break;
    case 'portal':x.ellipse(0,0,s*.6,s*.95,0,0,6.283);x.stroke();x.beginPath();x.arc(0,0,s*.22,0,6.283);x.fill();break;
    case 'heart':x.moveTo(0,s*.8);x.bezierCurveTo(-s*1.4,-s*.2,-s*.5,-s*1.1,0,-s*.3);x.bezierCurveTo(s*.5,-s*1.1,s*1.4,-s*.2,0,s*.8);x.fill();break;
    default:x.arc(0,0,s*.7,0,6.283);x.fill();
  }}
function icon(cv,kind,c,bg){const x=cv.getContext('2d'),w=cv.width;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,w,w);if(bg){x.fillStyle=bg;x.fillRect(0,0,w,w);}if(!kind)return;x.save();x.translate(w/2,w/2);const h=hex(c);x.fillStyle=h;x.strokeStyle=h;x.shadowColor=h;x.shadowBlur=w*.14;shape(x,kind,w*.27);x.restore();}
// code-drawn textures for in-world signs and glyphs
function signTex(text,fg,bg){const cv=document.createElement('canvas');cv.width=256;cv.height=64;const x=cv.getContext('2d');x.fillStyle=bg||'#201A4B';x.beginPath();x.moveTo(12,2);x.lineTo(244,2);x.quadraticCurveTo(254,2,254,12);x.lineTo(254,52);x.quadraticCurveTo(254,62,244,62);x.lineTo(12,62);x.quadraticCurveTo(2,62,2,52);x.lineTo(2,12);x.quadraticCurveTo(2,2,12,2);x.fill();
  x.fillStyle=fg||'#FFC53D';x.font='700 30px Fredoka,system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(text,128,34,236);return cv;}
function glyphTex(kind,c){const cv=document.createElement('canvas');cv.width=cv.height=96;icon(cv,kind,c);return cv;}

// ---------- code-drawn textures: cartoon faces and terrain tiles ----------
const TEX={};
function faceTex(o){const key='f'+JSON.stringify(o);if(TEX[key])return TEX[key];const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d'),ink='#201A4B';x.lineCap='round';x.lineJoin='round';
  const ex=[44,90],ey=o.ey||54,es=o.s||1;
  for(let i=0;i<2;i++){const cx=ex[i],r=11*es,d=i?1:-1;x.strokeStyle=ink;x.fillStyle=ink;
    if(o.e==='oval'){x.beginPath();x.ellipse(cx,ey,r*.6,r,0,0,6.3);x.fill();}
    else if(o.e==='dot'){x.beginPath();x.arc(cx,ey,r*.55,0,6.3);x.fill();}
    else if(o.e==='happy'){x.lineWidth=6;x.beginPath();x.arc(cx,ey+4,r*.85,Math.PI*1.12,Math.PI*1.88);x.stroke();}
    else if(o.e==='x'){x.lineWidth=6;x.beginPath();x.moveTo(cx-8,ey-8);x.lineTo(cx+8,ey+8);x.moveTo(cx+8,ey-8);x.lineTo(cx-8,ey+8);x.stroke();}
    else{x.fillStyle='#fff';x.lineWidth=4.5;x.beginPath();x.arc(cx,ey,r*1.3,0,6.3);x.fill();x.stroke();x.fillStyle=o.c||ink;x.beginPath();x.arc(cx+4,ey+(o.e==='sleepy'?4:1),r*(o.e==='wide'?.38:.6),0,6.3);x.fill();
      if(o.e==='sleepy'){x.fillStyle=o.lid||'#8C87A6';x.beginPath();x.arc(cx,ey,r*1.3,Math.PI,0);x.closePath();x.fill();x.stroke();}
      if(o.e==='angry'){x.lineWidth=8;x.beginPath();x.moveTo(cx+d*17,ey-r*1.9);x.lineTo(cx-d*13,ey-r*.95);x.stroke();}}
    if(o.brow){x.lineWidth=5;x.beginPath();x.moveTo(cx-9,ey-r*1.75+(i?0:2));x.lineTo(cx+9,ey-r*1.75+(i?2:0));x.stroke();}}
  const mx=67,my=o.my||94;x.strokeStyle=ink;x.fillStyle=ink;x.lineWidth=5.5;x.beginPath();
  if(o.m==='smile'){x.arc(mx,my-10,15,.25*Math.PI,.75*Math.PI);x.stroke();}
  else if(o.m==='frown'){x.arc(mx,my+12,15,1.25*Math.PI,1.75*Math.PI);x.stroke();}
  else if(o.m==='flat'){x.moveTo(mx-12,my);x.lineTo(mx+12,my);x.stroke();}
  else if(o.m==='o'){x.ellipse(mx,my,8,10,0,0,6.3);x.fill();}
  else if(o.m==='wavy'){x.moveTo(mx-20,my);x.bezierCurveTo(mx-12,my-10,mx-6,my+10,mx,my);x.bezierCurveTo(mx+6,my-10,mx+12,my+10,mx+20,my);x.stroke();}
  else if(o.m==='grin'){x.moveTo(mx-22,my-6);x.quadraticCurveTo(mx,my+26,mx+22,my-6);x.closePath();x.fillStyle='#fff';x.fill();x.stroke();}
  else if(o.m==='teeth'){rrect(x,mx-30,my-12,60,26,10);x.fill();x.fillStyle='#fff';for(let i=0;i<5;i++){x.beginPath();x.moveTo(mx-26+i*11,my-11);x.lineTo(mx-15+i*11,my-11);x.lineTo(mx-20.5+i*11,my+2);x.fill();}}
  return TEX[key]=cv;}
function lcg(seed){let s=seed>>>0||1;return ()=>(s=(s*1664525+1013904223)>>>0)/4294967296;}
function dirtBlots(x,dirt,w,y0,y1,rand,n){for(let i=0;i<n;i++){const bx=rand()*w,by=y0+rand()*(y1-y0),rx=7+rand()*11,ry=4+rand()*5;x.fillStyle=hex(mix(dirt,i%3?0x000000:0xffffff,i%3?.16:.14));for(const o of[-w,0,w]){x.beginPath();x.ellipse(bx+o,by,rx,ry,0,0,6.3);x.fill();}}}
function grassLip(x,top,w,y,cap){x.fillStyle=hex(top);if(cap){rrect(x,0,0,w,y+8,14);x.fill();}else x.fillRect(0,0,w,y);for(let i=0;i<w/32;i++){x.beginPath();x.arc(i*32+16,y,16,0,Math.PI);x.fill();}
  x.strokeStyle=hex(mix(top,0x000000,.32));x.lineWidth=3.5;x.beginPath();for(let i=0;i<w/32;i++){x.moveTo(i*32+32,y);x.arc(i*32+16,y,16,0,Math.PI);}x.stroke();
  x.fillStyle=hex(mix(top,0xffffff,.35));if(cap){rrect(x,6,3,w-12,7,4);x.fill();}else x.fillRect(0,0,w,7);}
// seamless strip for the ground's front face: grass lip over speckled earth
function tileTex(top,dirt){const key='t'+top+'_'+dirt;if(TEX[key])return TEX[key];const cv=document.createElement('canvas');cv.width=256;cv.height=128;const x=cv.getContext('2d');x.fillStyle=hex(dirt);x.fillRect(0,0,256,128);dirtBlots(x,dirt,256,48,116,lcg(top+dirt),14);
  const g=x.createLinearGradient(0,90,0,128);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,hex(dirt));x.fillStyle=g;x.fillRect(0,90,256,38);grassLip(x,top,256,26,false);return TEX[key]=cv;}
// one floating ledge, front view
function platTex(top,dirt){const key='p'+top+'_'+dirt;if(TEX[key])return TEX[key];const cv=document.createElement('canvas');cv.width=256;cv.height=96;const x=cv.getContext('2d');rrect(x,5,8,246,82,30);x.fillStyle=hex(dirt);x.fill();x.save();x.clip();dirtBlots(x,dirt,256,40,84,lcg(top*3+dirt),8);x.restore();
  x.strokeStyle=hex(mix(dirt,0x000000,.45));x.lineWidth=5;rrect(x,5,8,246,82,30);x.stroke();grassLip(x,top,256,24,true);x.strokeStyle=hex(mix(top,0x000000,.4));x.lineWidth=4;rrect(x,2,2,252,30,14);return TEX[key]=cv;}
