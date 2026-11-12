// ---------- stages ----------
const STAGE={},STAGE_LIST=[];
[['1',1,'Murmur Meadow','meadow','s1',['wisp','wisp','creeper'],'mumbler',1,null],
 ['2',2,'Mirage Market','market','s2',['wisp','mimic','flooder','mimic'],'liar',2,null],
 ['3',3,'Sprawl Thicket','thicket','s3',['creeper','creeper','flooder','yesman','wisp'],'hydra',3,null],
 ['4W',4,'Cliche Cliffs','cliffs','s4W',['moth','moth','moth','yesman','flooder'],'baron',4,'W'],
 ['5W',5,'The Endless Draft','draft','s5W',['moth','moth','creeper','flooder','yesman'],'rambler',5,'W'],
 ['4A',4,'Stale Archive','archive','s4A',['stat','mimic','flooder','wisp'],'picker',4,'A'],
 ['5A',5,'The Deluge','deluge','s5A',['flooder','flooder','stat','mimic','creeper'],'flood',5,'A'],
 ['4B',4,'Loop Foundry','foundry','s4B',['gremlin','yesman','creeper','wisp'],'loop',4,'B'],
 ['5B',5,'Tangle Works','tangle','s5B',['gremlin','gremlin','flooder','mimic','yesman'],'tangle',5,'B']
].forEach(a=>{const s={id:a[0],n:a[1],name:a[2],theme:a[3],song:a[4],pool:a[5],boss:a[6],tier:a[7],track:a[8]};STAGE[s.id]=s;STAGE_LIST.push(s);});
// one looping track per area: track stages get their own variations
(S=>{S.s4W=Object.assign({},S.s1,{bpm:104,root:60,prog:[0,2,5,4],lt:'triangle',lv:.1});S.s5W=Object.assign({},S.s2,{bpm:126,root:64,prog:[0,5,3,6],lt:'triangle',lv:.09});
  S.s4A=Object.assign({},S.s2,{bpm:108,root:57,prog:[0,4,5,3],lt:'sine',lv:.13});S.s5A=Object.assign({},S.s3,{bpm:134,root:50,prog:[0,3,1,4]});
  S.s4B=Object.assign({},S.s3,{bpm:138,root:52,prog:[0,0,3,4],lt:'square',lv:.04});S.s5B=Object.assign({},S.s1,{bpm:142,root:54,prog:[0,6,5,4],lt:'sawtooth',lv:.04});})(AU.SONGS);

// ---------- progression rules (one place) ----------
const PROG={
  cleared:id=>!!SV.d.cleared[id],
  anyS4(){return ['4W','4A','4B'].some(this.cleared);},
  stageLock(S){if(!rk('clear'))return 'Learn Clear Ask first';if(S.n===1)return null;if(S.n<=3)return this.cleared(String(S.n-1))?null:'Clear stage '+(S.n-1);
    if(!this.cleared('3'))return 'Clear stage 3';if(S.n===4)return null;return this.cleared('4'+S.track)?null:'Clear stage 4';},
  abLock(id){const A=ABILITY[id],i=['clear','context','iterate','verify','format','examples','think','role','critique'].indexOf(id);
    if(i>=0)return i<3||this.cleared(String(Math.floor(i/3)))?null:'Clear stage '+Math.floor(i/3);
    if(!this.cleared('3'))return 'Clear stage 3';if(SV.d.track!==A.track)return 'Needs the '+TRACKS[A.track].name+' track';
    return TRACKS[A.track].abs.indexOf(id)<2||this.cleared('4'+A.track)?null:'Clear stage 4';},
  rankLock(id,next){const l=this.abLock(id);if(l)return l;if(next===2&&!SV.d.track)return 'Choose a track first';if(next===3&&!this.anyS4())return 'Clear a stage 4';return null;},
  cost:next=>[0,0,30,60][next],
  learn(id){const A=ABILITY[id],n=rk(id)+1;SV.d.sparks-=this.cost(n);SV.d.ranks[id]=n;if(A.kind!=='passive'&&!SV.d.loadout.includes(id)){const i=SV.d.loadout.indexOf(null);if(i>=0)SV.d.loadout[i]=id;}if(id==='format')while(FORMS.length<4)FORMS.push(FORM_EXTRA[FORMS.length-1]);SV.save();}
};

// ---------- boons: {id, ab, name, desc, apply(mod)} ----------
const flag=k=>m=>{m.b[k]=1;};
const BOONS=[
  {id:'clear3',ab:'clear',name:'Few-Shot Volley',desc:'Clear Ask fires 3 shots.'},{id:'ctxLong',ab:'context',name:'Long Context',desc:'Context lasts twice as long.'},
  {id:'ground',ab:'context',name:'Grounded',desc:'In Context, each hit heals 1.'},{id:'echoBoom',ab:'examples',name:'Diverse Examples',desc:'Echoes explode on hit.'},
  {id:'wide',ab:'format',name:'Structured Output',desc:'Shaped attacks reach 30% further.'},{id:'stanceWave',ab:'role',name:'In Character',desc:'Stance switches send a shockwave.'},
  {id:'thinkFast',ab:'think',name:'Deep Thought',desc:'Think charges twice as fast.'},{id:'chainWave',ab:'iterate',name:'Prompt Chain',desc:'Finishers launch a wave.'},
  {id:'cited',ab:'verify',name:'Cited',desc:'Verified foes take 30% more.'},{id:'reflect3',ab:'critique',name:"Devil's Advocate",desc:'Turned-back hits deal triple.'},
  {id:'audWide',ab:'audience',name:'Wider Reach',desc:'The Audience wave is much bigger.'},{id:'outHard',ab:'outline',name:'Tight Outline',desc:'Pillars hit 50% harder.'},
  {id:'redPen',ab:'edit',name:'Red Pen',desc:'Each cut heals 5.'},{id:'tagLong',ab:'tags',name:'Nested Tags',desc:'The tag trap lasts twice as long.'},
  {id:'quoteMore',ab:'quotes',name:'Block Quotes',desc:'Pull 2 extra quote shards.'},{id:'calm',ab:'unknown',name:'Calm Mind',desc:'The dome heals you slowly.'},
  {id:'botFast',ab:'agents',name:'Parallel Work',desc:'Bots act twice as fast.'},{id:'runeFast',ab:'skills',name:'Auto-Trigger',desc:'Runes recharge twice as fast.'},
  {id:'connFast',ab:'connect',name:'Always Allow',desc:'Connectors recharge 40% faster.'},
  {id:'hp',name:'Thick Draft',desc:'+25 max health.',apply(m){m.hp+=25;G.p.mhp+=25;C.heal(25);}},{id:'spark',name:'Bright Idea',desc:'+50% sparks.',apply(m){m.spark=1.5;}},
  {id:'dcd',name:'Quick Edit',desc:'Dodge recharges faster.',apply(m){m.dcd=.6;}},{id:'burn',name:'Hot Take',desc:'Your dodge burns foes.',apply(m){m.burn=1;}},
  {id:'dbl',name:'Sharp Wording',desc:'15% chance to deal double.',apply(m){m.dbl=.15;}},{id:'wind',name:'Second Wind',desc:'Heal 10 at each new room.',apply(m){m.wind=10;}},
  {id:'cd',name:'Fast Typist',desc:'Cooldowns 25% shorter.',apply(m){m.cd=.75;}}];
for(const b of BOONS)if(!b.apply)b.apply=flag(b.id);
C.onDodge.push(p=>{if(!G.mod.burn)return;C.box(p.x,p.x+p.ddir*3.8,p.y-.2,p.y+2,10,{ab:'boon',c:0xff8a3d,noStop:true,kx:p.ddir*2});for(let i=0;i<8;i++)FX.burst(p.x+p.ddir*i*.45,p.y+.3,0xff8a3d,2,3,{up:3,g:-3,life:1.3});});
function boonChoices(){const taken=G.run.boons,pool=shuffle(BOONS.filter(b=>!taken.includes(b.id)&&(!b.ab||rk(b.ab)>0))),ab=pool.filter(b=>b.ab),gen=pool.filter(b=>!b.ab);
  const out=ab.slice(0,2).concat(gen.slice(0,1));for(const b of pool)if(out.length<3&&!out.includes(b))out.push(b);return shuffle(out.slice(0,3));}
