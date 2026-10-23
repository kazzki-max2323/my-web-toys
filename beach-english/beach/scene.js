/* 星降るポーカー（v222）の 浜辺シーンと 音を、そのまま 切り出したもの。
   ポーカー本体に 聞いていた 値は beach/host.js が 答える。ここは 手で 書きかえない。 */
const $=id=>document.getElementById(id);
const GH=()=>((S.gameMin||0)/60)%24,DKOF=h=>h<4.8?1:h<7?1-(h-4.8)/2.2:h<17.6?0:h<20.2?(h-17.6)/2.6:1,DK=()=>DKOF(GH());
const PHASES=[[5,'dawn','🌅','夜明け'],[7,'morning','🌤️','朝'],[11,'noon','☀️','昼'],[15,'evening','⛅','夕方'],[18,'sunset','🌇','夕暮れ'],[20,'night','🌙','夜']];
function phaseOf(h){let r=PHASES[5];for(const p of PHASES)if(h>=p[0])r=p;return r}
function clockStr(){const m=Math.floor(S.gameMin||0);return String(m/60|0).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
let ac=null,master=null,NB=null,sfxBus=null,waveBus=null,musOut=null;
function A(){if(!ac){ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.9;
  const comp=ac.createDynamicsCompressor();master.connect(comp).connect(ac.destination);sfxBus=ac.createGain();waveBus=ac.createGain();musOut=ac.createGain();[sfxBus,waveBus,musOut].forEach(g=>g.connect(master));const V=S.vol||{};sfxBus.gain.value=V.se??1;waveBus.gain.value=(V.wave??1)*1.15*1.5;musOut.gain.value=V.mus??1;
  NB=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  if(ac.state==='suspended')ac.resume();return ac}
const on=()=>S.sound&&!skipping;
const pick=a=>a[Math.random()*a.length|0],rnd=(a,b)=>a+Math.random()*(b-a);
function tone(f,d=.08,type='square',v=.05,delay=0,f2){if(!on())return;try{A();const t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(sfxBus);o.start(t);o.stop(t+d+.02)}catch(e){}}
function noise(d=.1,{v=.08,type='bandpass',f=2000,q=1,delay=0,f2,attack=.004}={}){if(!on())return;try{A();const t=ac.currentTime+delay,s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=NB;s.playbackRate.value=rnd(.9,1.1);fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);fl.Q.value=q;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl).connect(g).connect(sfxBus);s.start(t,Math.random());s.stop(t+d+.02)}catch(e){}}
function bell(f,v=.05,delay=0,d=.9){tone(f,d,'sine',v,delay);tone(f*2.76,d*.5,'sine',v*.35,delay);tone(f*5.4,d*.25,'sine',v*.15,delay)}
const SCALES=[[523,659,784,1047,1319],[587,740,880,1175,1480],[494,622,740,988,1245],[440,554,659,880,1109]];
const sfx={
 deal:()=>{noise(.09,{v:.09,f:rnd(2500,4000),q:.7,f2:rnd(900,1400)});noise(.02,{v:.05,type:'highpass',f:5000,delay:.07})},
 flip:()=>{noise(.035,{v:.08,f:rnd(3000,5000),q:2});tone(rnd(1800,2400),.03,'triangle',.02)},
 hold:()=>{const b=pick([880,988,1047,1175]);bell(b,.035);bell(b*pick([1.25,1.5,1.335]),.03,.06,.5)},
 tick:()=>noise(.02,{v:.05,type:'highpass',f:3500}),
 coin:()=>{const f=pick([1976,2093,2349,2637]);tone(f,.09,'square',.018);tone(f*1.5,.12,'sine',.03,.03);noise(.03,{v:.03,type:'highpass',f:6000})},
 win:()=>{const s=pick(SCALES),pat=pick([[0,1,2,3],[0,2,1,3],[2,1,2,3],[0,1,2,4,3]]);pat.forEach((n,i)=>{tone(s[n],.13,pick(['square','triangle']),.045,i*.085);tone(s[n]/2,.13,'triangle',.03,i*.085)});bell(s[3]*2,.03,pat.length*.085)},
 riser:(d,lv)=>{if(!on())return;try{A();const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(70*Math.pow(2,1.5+lv*.3),t+d);f.type='lowpass';f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(2400,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.025+lv*.006,t+d*.9);g.gain.exponentialRampToValueAtTime(.0001,t+d+.08);o.connect(f).connect(g).connect(sfxBus);o.start(t);o.stop(t+d+.1)}catch(e){}noise(d,{v:.02+lv*.005,f:800,f2:6000,q:1.5,attack:d*.8})},
 dblGo:()=>{[523,659,784,1047].forEach((f,i)=>{tone(f,.12,'square',.035,i*.06);tone(f*2,.1,'sine',.02,i*.06)});noise(.35,{v:.04,f:900,f2:4500,q:1.4,delay:.05})},
 pickCard:()=>{noise(.05,{v:.12,f:2800,q:1.2});tone(220,.09,'triangle',.08,0,160);bell(1568,.035,.06,.6);bell(2093,.025,.12,.5)},
 hsBoom:lv=>{noise(2.2,{v:.16,type:'lowpass',f:110,attack:.01});tone(55,1.8,'sine',.25,0,32);tone(110,1.2,'sawtooth',.03,0,70);if(lv>=3)[0,.25,.5].forEach(d=>tone(880*(1+d),.6,'triangle',.03,.4+d))},
 vclick:()=>{noise(.03,{v:.14,f:3200,q:3});tone(1400,.03,'square',.03)},
 vopen:()=>{noise(.8,{v:.05,type:'lowpass',f:500,f2:2400,attack:.05});[523,659,784,1047].forEach((f,i)=>bell(f*2,.04,.5+i*.08,1))},
 shatter:()=>{noise(.6,{v:.18,type:'highpass',f:2500,attack:.003});noise(1.2,{v:.12,type:'lowpass',f:160,attack:.01});for(let i=0;i<10;i++)tone(rnd(2000,5000),.05,'triangle',.02,.05+Math.random()*.6)},
 rumble:d=>{noise(d,{v:.12,type:'lowpass',f:90,attack:.3})},
 clap:v=>{if(!on())return;const dur=2.2+v*2.2,n=Math.round(40+v*120);
   for(let k=0;k<n;k++){const tt=Math.pow(Math.random(),.8)*dur,env=Math.sin(Math.min(1,tt/dur)*Math.PI)*.8+.2;noise(.04,{v:(.045+v*.05)*env*(.6+Math.random()*.4),f:rnd(900,2600),q:1.1,delay:tt,attack:.0015})}
   if(v>.3)for(let k=0;k<1+Math.round(v*2);k++){const d=.3+Math.random()*1.2;tone(rnd(1700,2100),.35,'sine',.03,d,rnd(2500,3000))}
   if(v>.5)noise(dur*.8,{v:.02+v*.015,type:'bandpass',f:700,q:.7,delay:.2,attack:.4})},
 fanfare:lv=>{const base=[523,587,659,784][Math.min(3,lv)];[0,4,7,12,16,19,24].slice(0,4+lv).forEach((n,i)=>{const f=base*Math.pow(2,n/12);tone(f,.18,'square',.05,i*.09);tone(f*1.5,.14,'triangle',.03,i*.09)});const end=.09*(4+lv);[0,4,7,12].forEach(n=>{tone(base*Math.pow(2,n/12),1.4,'triangle',.05,end);tone(base*Math.pow(2,n/12)*2,1.2,'sine',.025,end)});for(let k=0;k<lv*3;k++)bell(1568+Math.random()*1200,.03,end+.2+k*.12,.6)},
 big:()=>{const s=pick(SCALES);[0,1,2,3,2,3,4].forEach((n,i)=>{tone(s[n],.16,'square',.05,i*.1);tone(s[n]*.75,.16,'triangle',.035,i*.1)});[0,2,4].forEach(n=>tone(s[n],.9,'triangle',.04,.75));
   for(let i=0;i<6;i++)bell(s[4]*2*rnd(.9,1.1),.025,.8+i*.08,.6);noise(.6,{v:.04,type:'highpass',f:7000,delay:.75,attack:.05})},
 lose:()=>{const p=pick([[392,330,262],[440,370,294,220],[349,330,311,294],[523,392,262]]);p.forEach((f,i)=>tone(f,.2,'triangle',.06,i*.14,f*.97));tone(p[p.length-1]/2,.5,'sine',.06,p.length*.14)},
 flipBig:()=>{noise(.08,{v:.1,f:3500,q:1.5});tone(1200,.08,'square',.04);bell(1568,.04,.04)},
 chance:()=>{[1320,1568,1760].forEach((f,i)=>bell(f,.035,i*.07,.5))},
 drum:p=>{noise(.07,{v:.07+p*.06,f:rnd(1500,2200),q:.8});if(Math.random()<.3)tone(rnd(90,120),.08,'sine',.08)},
 heart:()=>{tone(62,.16,'sine',.22,0,48);tone(55,.14,'sine',.17,.18,42)},
 tease:()=>{noise(.5,{v:.03,f:400,f2:3000,q:3});tone(240,.4,'sawtooth',.015,0,320)},
 slowflip:()=>{noise(.12,{v:.08,f:2500,q:1});bell(1175,.04,.05)},
 tie:()=>{tone(523,.15,'triangle',.05);tone(523,.2,'triangle',.04,.18)},
 save:()=>{[784,988,1175,1568].forEach((f,i)=>bell(f,.035,i*.06,.7));noise(.5,{v:.025,type:'highpass',f:6000,attack:.1})},
 pop:()=>{const f=rnd(500,900);tone(f,.07,'sine',.035,0,f*2.2);noise(.02,{v:.015,type:'highpass',f:4000})},
 chime:()=>{const s=pick(SCALES);[0,2,4,3].forEach((n,i)=>bell(s[n]*2,.03,i*.12,1))},
 wave:()=>{noise(1.2,{v:.06,type:'lowpass',f:300,f2:1200,attack:.5})},
 reroll:()=>{noise(.4,{v:.06,f:600,f2:3000,q:2});tone(400,.3,'triangle',.03,0,900)},
 peek:()=>{[1568,1760,2093,2349,2637].forEach((f,i)=>bell(f,.022,i*.04,.4))},
 shield:()=>{[523,659,784].forEach(f=>tone(f,.6,'sine',.03));bell(1568,.035,.1)},
 snd:()=>bell(880,.04),
 whoosh:()=>{noise(.9,{v:.07,f:500,f2:5000,q:2})},drone:d=>{tone(55,d,'sawtooth',.018,0,52);tone(82,d,'sine',.04,0,78)},cut:lv=>{const f=[523,587,659,784,1047][lv];[0,.07,.14].forEach((dt,i)=>tone(f*(1+i*.25),.18,'square',.04,dt));if(lv>=3)[0,.1,.2,.3].forEach((dt,i)=>bell(f*2*(1+i*.12),.04,dt+.25,1))},
 creak:()=>{tone(rnd(180,240),.5,'sawtooth',.012,0,rnd(260,320));noise(.4,{v:.02,f:1200,q:4})},
 beep:f=>{tone(f,.14,'square',.04);tone(f*2,.1,'sine',.02)},
 spin:()=>{for(let i=0;i<14;i++)noise(.05,{v:.05,f:2500+i*120,q:2,delay:i*.11+i*i*.006})},
 boom:big=>{noise(big?1.2:.8,{v:big?.12:.08,type:'lowpass',f:big?160:220,attack:.01});noise(.5,{v:.03,type:'highpass',f:3000,delay:.05})},
 thunder:()=>{noise(1.6,{v:.14,type:'lowpass',f:220,attack:.02});noise(.25,{v:.08,type:'highpass',f:2000})}};
let amb=null;
function oneWave(t,dur,pk,peak,fizz,lpMax,thump){const pan=ac.createStereoPanner?ac.createStereoPanner():null;if(pan){pan.pan.setValueAtTime(rnd(-.6,.1),t);pan.pan.linearRampToValueAtTime(rnd(-.1,.6),t+dur)}const out=pan||waveBus;if(pan)pan.connect(waveBus);
  const b=ac.createBufferSource();b.buffer=(window.PNB||NB);b.loop=true;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.Q.value=.3;lp.frequency.setValueAtTime(200,t);lp.frequency.linearRampToValueAtTime(lpMax,t+dur*pk);lp.frequency.exponentialRampToValueAtTime(240,t+dur);
  const g=ac.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+dur*pk);g.gain.exponentialRampToValueAtTime(.0001,t+dur);b.connect(lp).connect(g).connect(out);b.start(t,rnd(0,1.5));b.stop(t+dur+.1);
  const h=ac.createBufferSource();h.buffer=NB;h.loop=true;const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=rnd(2200,3800);bp.Q.value=.5;const hg=ac.createGain();
  hg.gain.setValueAtTime(.0001,t);hg.gain.setValueAtTime(.0001,t+dur*(pk-.05));hg.gain.exponentialRampToValueAtTime(fizz,t+dur*(pk+.12));hg.gain.exponentialRampToValueAtTime(.0001,t+dur*.97);h.connect(bp).connect(hg).connect(out);h.start(t,rnd(0,1.5));h.stop(t+dur+.1);
  if(thump){const tb=ac.createBufferSource();tb.buffer=NB;const tl=ac.createBiquadFilter();tl.type='lowpass';tl.frequency.value=140;const tg=ac.createGain();const tt=t+dur*pk;tg.gain.setValueAtTime(.0001,tt-.05);tg.gain.exponentialRampToValueAtTime(thump,tt+.04);tg.gain.exponentialRampToValueAtTime(.0001,tt+1.1);tb.connect(tl).connect(tg).connect(out);tb.start(tt-.05,rnd(0,1));tb.stop(tt+1.2)}}
function surf(){if(!amb)return;let next=rnd(5200,8800);if(S.waves&&!document.hidden){try{const t=ac.currentTime+.05,r=Math.random();
  if(r<.66){oneWave(t,rnd(5.5,8),rnd(.3,.42),rnd(.07,.1),rnd(.014,.024),rnd(800,1250))}
  else if(r<.84){oneWave(t,rnd(3,4.5),rnd(.35,.45),rnd(.04,.06),rnd(.008,.014),rnd(600,900));next=rnd(3500,5500)}
  else if(r<.88){const d=rnd(8,10.5);oneWave(t,d,rnd(.36,.44),rnd(.085,.1),rnd(.018,.026),rnd(1100,1400),rnd(.012,.022));next=rnd(8500,11000)}
  else if(r<.96){oneWave(t,rnd(5,7),rnd(.3,.4),rnd(.065,.09),rnd(.014,.022),rnd(800,1200));oneWave(t+rnd(1.3,2.2),rnd(4.5,6.5),rnd(.32,.42),rnd(.05,.08),rnd(.012,.02),rnd(700,1100));next=rnd(7000,9500)}
  else{for(let n=0;n<3;n++)oneWave(t+n*rnd(1.1,1.6),rnd(2.2,3),.4,rnd(.03,.045),rnd(.006,.011),rnd(500,800));next=rnd(5500,7500)}}catch(e){}}
  setTimeout(surf,next)}
function ambient(){try{A()}catch(e){return}
  if(!amb){const s=ac.createBufferSource();s.buffer=NB;s.loop=true;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=320;const g=ac.createGain();g.gain.value=0;
    const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=.07;lg.gain.value=.008;lfo.connect(lg).connect(g.gain);s.connect(lp).connect(g).connect(waveBus);s.start();lfo.start();amb={g};
    setTimeout(surf,600)}
  amb.g.gain.setTargetAtTime(S.waves?.02:0,ac.currentTime,.8)}
document.addEventListener('pointerdown',()=>ambient(),{once:true});
const MUS={on:false,track:null,next:0,step:0,timer:null,bus:null,endAt:0,fading:false,id:null,startAt:0};
const mf=m=>440*Math.pow(2,(m-69)/12);
function mBus(){A();if(!MUS.bus){MUS.bus=ac.createGain();MUS.bus.gain.value=.0001;MUS.bus.connect(musOut)}return MUS.bus}
function nz(t,d,v,type,f,q=1){const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=NB;fl.type=type;fl.frequency.value=f;fl.Q.value=q;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl).connect(g).connect(MUS.bus);s.start(t,Math.random());s.stop(t+d+.02)}
function osc(type,f,t,d,v,dest,f2){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d*.6);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(dest||MUS.bus);o.start(t);o.stop(t+d+.03);return o}
const I={
 pluck(m,t,v=.07,d=.7,cut=2600){m=fitN(m);const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(cut,t);f.frequency.exponentialRampToValueAtTime(320,t+d);f.connect(MUS.bus);osc('triangle',mf(m),t,d,v,f);osc('sine',mf(m)*2.003,t,d*.6,v*.35,f)},
 bell(m,t,v=.05,d=1.4){m=fitN(m);osc('sine',mf(m),t,d,v);osc('sine',mf(m)*2.76,t,d*.5,v*.28);osc('sine',mf(m)*5.4,t,d*.25,v*.1)},
 ep(m,t,v=.045,d=1.5){m=fitN(m);osc('sine',mf(m),t,d,v);osc('triangle',mf(m)*2,t,d*.4,v*.18);osc('sine',mf(m)*1.002,t,d,v*.4)},
 bass(m,t,d=.45,v=.13){m=fitN(m);const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=650;f.connect(MUS.bus);osc('triangle',mf(m),t,d,v,f);osc('sine',mf(m),t,d,v*.6,f)},
 sq(m,t,d=.16,v=.035){m=fitN(m);const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=3200;f.connect(MUS.bus);osc('square',mf(m),t,d,v,f)},
 kick(t,v=.22){osc('sine',140,t,.32,v,null,42)},
 snare(t,v=.06){nz(t,.16,v,'bandpass',1900,.8);osc('triangle',190,t,.07,v*.6)},
 hat(t,v=.022,d=.045){nz(t,d,v,'highpass',7500)},
 ride(t,v=.02){nz(t,.25,v,'bandpass',6500,2.5)},
 shaker(t,v=.016){nz(t,.07,v,'bandpass',5200,1.2)},
 pad(m,t,d=2,v=.02){m=fitN(m);const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=1400;f.connect(MUS.bus);[-.06,.06].forEach(dt=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sawtooth';o.frequency.value=mf(m);o.detune.value=dt*100;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+d*.35);g.gain.setValueAtTime(v,t+d*.7);g.gain.linearRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(f);o.start(t);o.stop(t+d+.05)})},
 saw(m,t,d=.2,v=.025,cut=2400){m=fitN(m);const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(cut,t);f.frequency.exponentialRampToValueAtTime(400,t+d);f.connect(MUS.bus);osc('sawtooth',mf(m),t,d,v,f);osc('sawtooth',mf(m)*1.006,t,d,v*.7,f)},
 flute(m,t,d=.5,v=.035){m=fitN(m);const o=ac.createOscillator(),g=ac.createGain(),lf=ac.createOscillator(),lg=ac.createGain();o.type='sine';o.frequency.value=mf(m);lf.frequency.value=5.5;lg.gain.value=mf(m)*.006;lf.connect(lg);lg.connect(o.frequency);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.05);g.gain.setValueAtTime(v,t+d*.7);g.gain.linearRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(MUS.bus);o.start(t);lf.start(t);o.stop(t+d+.05);lf.stop(t+d+.05);nz(t,.06,.006,'bandpass',mf(m)*2,2)},
 crackle(t){}
};
const PENTA=[0,2,4,7,9],MAJ=[0,2,4,5,7,9,11];
function chordSet(tr,st){if(!tr.chords)return null;const b=st>>4,c=tr.chords[b%tr.chords.length],set=new Set(c.map(n=>((n%12)+12)%12));if(tr.roots)set.add(((tr.roots[b%tr.roots.length]%12)+12)%12);return set}
function fitN(m){const ch=MUS.ch;if(!ch||m==null)return m;const p=((m%12)+12)%12;if(ch.has(p))return m;let clash=false;for(const q of ch){const d=(p-q+12)%12;if(d===1||d===11||d===6){clash=true;break}}if(!clash)return m;
  for(let o=1;o<7;o++){if(ch.has(((p-o)%12+12)%12))return m-o;if(ch.has((p+o)%12))return m+o}return m}
function motif(len,base,scale,range=7){let idx=Math.floor(range/2),out=[];for(let i=0;i<len;i++){idx=Math.max(0,Math.min(range,idx+[-2,-1,-1,0,1,1,2][Math.random()*7|0]));out.push(Math.random()<.18?null:base+Math.floor(idx/scale.length)*12+scale[idx%scale.length])}return out}
const TRACKS={
 musicbox:{name:'オルゴール「星のゆりかご」',bpm:84,init(){this.mel=motif(16,72,PENTA,9)},chords:[[60,64,67],[57,60,64],[53,57,60],[55,59,62]],
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4];if(s%2===0)I.bell(c[(s/2)%3]+12+((s/2)%4===3?12:0),t,.026,1.2);if(s%4===0){const m=this.mel[((b%2)*8+s/4*2)%16];if(m)I.bell(m,t,.05,1.8)}if(b%8===7&&s===0)this.mel=motif(16,72,PENTA,9)}},
 guitar:{name:'ギター「波と焚き火」',bpm:76,chords:[[48,55,64],[43,50,59],[45,52,60],[40,47,55],[41,48,57],[48,55,64],[41,48,57],[43,50,59]],
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%8];if(s%2===0){const p=[0,1,2,1,2,1,2,1][s/2],n=[c[0],c[1],c[2]+12,c[1]+12,c[2]+12,c[1]+12,c[2],c[1]][s/2];I.pluck(n,t,.06,1.1,2200)}if(s===0)I.bass(c[0]-12,t,1.6,.09);if(s===8&&Math.random()<.4)I.bell(c[2]+24,t,.018,1.4)}},
 uke:{name:'ウクレレ「サンセット・ボッサ」',bpm:100,chords:[[65,69,72,76],[64,67,71,74],[62,65,69,72],[67,71,74,77]],roots:[41,40,38,43],
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if([0,3,6,8,11,14].includes(s))c.forEach((n,i)=>I.pluck(n,t+i*.012,.035,.5,3600));if(s===0||s===6)I.bass(s?r+7:r,t,.5,.11);if(s===10)I.bass(r,t,.3,.08);I.shaker(t,s%4===0?.02:.01);if(s===4&&b%2===1&&Math.random()<.5)I.bell(c[3]+12,t,.02,1)}},
 lofi:{name:'ローファイ「真夜中のビーチ」',bpm:72,swing:.32,chords:[[62,65,69,72,76],[55,59,64,65],[60,64,67,71,74],[57,61,64,67,70]],roots:[38,43,36,45],
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];I.crackle(t);if(s===0)c.forEach(n=>I.ep(n,t,.026,2.4));if(s===10)c.slice(-3).forEach(n=>I.ep(n,t,.02,1.2));
   if(s===0||s===7||s===10)I.kick(t,.18);if(s===4||s===12)I.snare(t,.035);if(s%2===0)I.hat(t,s%4===0?.014:.009);if(s===0)I.bass(r,t,1.2,.12);if(s===10)I.bass(r+12,t,.4,.07);
   if((s===6||s===14)&&Math.random()<.3)I.ep(c[Math.random()*c.length|0]+12,t,.022,1)}},
 jazz:{name:'ジャズ「カジノ・ナイト」',bpm:120,swing:.38,roots:[38,43,36,45],chords:[[65,69,72,76],[65,69,71,76],[64,67,71,74],[61,64,67,70]],
  init(){this.mel=null},
  play(st,t){const b=st>>4,s=st%16,r=this.roots[b%4],nr=this.roots[(b+1)%4],c=this.chords[b%4];
   if(s%4===0){const q=s/4,n=q===0?r:q===1?r+[3,4][Math.random()*2|0]:q===2?r+7:nr+(Math.random()<.5?1:-1);I.bass(n,t,.42,.13)}
   if([0,4,6,8,12,14].includes(s))I.ride(t,s%4===0?.022:.014);if(s===4||s===12)I.hat(t,.012,.03);
   if((s===6||s===14||(s===10&&Math.random()<.4))&&Math.random()<.7)c.forEach(n=>I.ep(n-12,t,.018,.6));
   if(s===0&&(b%4===0))this.mel=motif(8,74,[0,2,3,5,7,9,10],10);if(this.mel&&s%2===0&&Math.random()<.75){const m=this.mel[(s/2+b*3)%8];if(m)I.bell(m,t,.03,.7)}}},
 piano:{name:'ピアノ「モーニング・ブリーズ」',bpm:78,chords:[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,65]],roots:[48,45,41,43],init(){this.mel=motif(16,76,MAJ,9)},
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if(s===0)I.bass(r,t,2.2,.07);if(s%2===0){const n=[c[0],c[2],c[1]+12,c[2],c[3],c[2],c[1]+12,c[2]][s/2];I.ep(n,t,.022,1.4)}
   if(s%4===0){const m=this.mel[(s/4+(b%4)*4)%16];if(m)I.ep(m,t,.04,2)}if(b%8===7&&s===0)this.mel=motif(16,76,MAJ,9)}},
 steel:{name:'スチールパン「真昼のトロピカル」',bpm:112,chords:[[60,64,67],[65,69,72],[67,71,74],[60,64,67]],roots:[36,41,43,36],init(){this.mA=motif(8,72,MAJ,9);this.mB=motif(8,74,MAJ,9)},
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if([0,3,6,10,12].includes(s))I.bass(s%6===0?r:r+7,t,.3,.11);I.shaker(t,s%2?.01:.018);if(s===4||s===12)I.snare(t,.025);
   if([2,6,10,14].includes(s))c.forEach(n=>I.pluck(n,t,.018,.25,3000));if(s%2===0){const mel=b%4<2?this.mA:this.mB,m=mel[(s/2)%8];if(m){I.bell(m,t,.035,.5);I.bell(m+12,t+.004,.01,.3)}}if(b%8===7&&s===0){this.mA=motif(8,72,MAJ,9);this.mB=motif(8,74,MAJ,9)}}},
 orch:{name:'オーケストラ「星降る交響曲」',bpm:70,chords:[[60,64,67,72],[57,60,64,69],[53,57,60,65],[55,59,62,67],[52,55,60,64],[57,60,64,69],[50,53,57,62],[55,59,62,65]],roots:[36,33,29,31,28,33,26,31],init(){this.mel=motif(16,76,MAJ,10)},
  play(st,t,spb){const b=st>>4,s=st%16,c=this.chords[b%8],r=this.roots[b%8],bar=spb*16;if(s===0){c.forEach(n=>I.pad(n,t,bar*1.02,.012));I.bass(r,t,bar*.9,.1);I.kick(t,.08)}
   if(s%2===0)I.bell(c[(s/2)%4]+12,t,.012,.9);if(s%4===0){const m=this.mel[(s/4+(b%4)*4)%16];if(m){I.ep(m,t,.035,2.2);I.bell(m+12,t,.015,1.6)}}if(b%8===7&&s===12)I.snare(t,.03);if(b%16===15&&s===0)this.mel=motif(16,76,MAJ,10)}},
 harp:{name:'ハープ「月光のアルペジオ」',bpm:66,chords:[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4],seq=[0,1,2,3,4,5,6,7,8,7,6,5,4,3,2,1][s],n=c[seq%3]+12*Math.floor(seq/3);I.pluck(n,t,.032,1.8,3200);if(s===0){I.bass(c[0]-12,t,2.4,.07);I.bell(c[2]+24,t,.02,2.4)}if(s===8&&Math.random()<.5)I.bell(c[1]+24,t,.016,2)}},
 reggae:{name:'レゲエ「ヤシの木の下で」',bpm:76,chords:[[62,65,69],[60,64,67],[65,69,72],[60,64,67]],roots:[38,36,41,36],init(){this.mel=motif(8,74,PENTA,8)},
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if(s%4===2)c.forEach((n,i)=>I.pluck(n,t+i*.006,.03,.13,3800));if(s===8){I.kick(t,.2);I.snare(t,.03)}if(s%2===0)I.hat(t,.008);
   const bp={0:0,3:7,6:12,10:5,12:7,14:3};if(bp[s]!==undefined)I.bass(r+bp[s],t,.3,.13);if(b%2===1&&s%4===0){const m=this.mel[(s/4+b)%8];if(m)I.ep(m,t,.03,.9)}if(b%8===7&&s===0)this.mel=motif(8,74,PENTA,8)}},
 hawaii:{name:'スラックキー「アロハ・モーニング」',bpm:88,chords:[[55,59,62],[60,64,67],[62,66,69],[55,59,62]],roots:[43,48,50,43],init(){this.mel=motif(16,74,PENTA,9)},
  play(st,t,spb){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if(s%4===0)I.pluck(r,t,.06,.7,1400);if(s%4===2)I.pluck(r+7,t,.045,.5,1400);if(s%4===1||s%4===3)I.pluck(c[(s>>1)%3]+12,t,.02,.4,3000);
   if(s%2===0){const m=this.mel[(s/2+b*8)%16];if(m){if(Math.random()<.2){I.pluck(m-2,t,.03,.15,3400);I.pluck(m,t+spb*.5,.045,.9,3400)}else I.pluck(m,t,.045,.9,3400)}}if(b%4===3&&s===0)this.mel=motif(16,74,PENTA,9)}},
 celtic:{name:'ケルト「風の丘」',bpm:112,chords:[[62,66,69],[60,64,67],[62,66,69],[57,61,64]],roots:[38,36,38,33],init(){this.mel=motif(16,74,[0,2,4,5,7,9,10],10)},
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if(s===0){I.pad(50,t,60/112*4*1.02,.009);I.pad(57,t,60/112*4*1.02,.007)}if([0,6,8,14].includes(s))I.kick(t,s%8===0?.14:.08);if(s%4===2)I.hat(t,.008);
   if(s%2===0){const m=this.mel[(s/2+(b%2)*8)%16];if(m)I.flute(m,t,.24,.03)}if(s===0||s===8)c.forEach(n=>I.pluck(n-12,t,.02,.4,2400));if(b%8===7&&s===0)this.mel=motif(16,74,[0,2,4,5,7,9,10],10)}},
 samba:{name:'サンバ「カーニバル」',bpm:104,chords:[[60,64,67,71],[62,65,69,72],[57,60,64,67],[55,59,62,65]],roots:[36,38,33,31],init(){this.mel=motif(8,74,MAJ,10)},
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if(s===4||s===12)osc('sine',70,t,.35,.2,null,48);if(s===0||s===8)osc('sine',90,t,.2,.08,null,60);
   I.shaker(t,s%2?.012:.02);if([0,3,6,10,12].includes(s))I.hat(t,.02,.03);if([0,3,6,8,11,14].includes(s))c.forEach(n=>I.pluck(n,t,.016,.18,3800));if([0,6,8,14].includes(s))I.bass(s<8?r:r+7,t,.25,.12);
   if(s%2===0&&Math.random()<.8){const m=this.mel[(s/2)%8];if(m)I.bell(m,t,.035,.4)}if(b%4===3&&s===0)this.mel=motif(8,74,MAJ,10)}},
 koto:{name:'和風「波の調べ」',bpm:72,init(){this.mel=motif(16,62,[0,3,5,7,10],9)},
  play(st,t,spb){const b=st>>4,s=st%16;if(s===0)I.pluck(38,t,.06,2.4,900);if(s===8)I.pluck(45,t,.04,1.6,900);
   if(s%2===0&&Math.random()<.75){const m=this.mel[(s/2+b*8)%16];if(m){if(Math.random()<.15){for(let n=0;n<4;n++)I.pluck(m,t+n*spb*.25,.025,.3,4200)}else I.pluck(m,t,.05,1.2,4200)}}
   if(s===0&&b%2===1){const m=this.mel[b%16];if(m)I.flute(m-12,t,60/72*3,.022)}if(b%4===3&&s===0)this.mel=motif(16,62,[0,3,5,7,10],9)}},
 synth:{name:'シンセウェイブ「夜の海岸線」',bpm:96,chords:[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],roots:[45,41,36,43],init(){this.mel=motif(8,69,[0,2,3,5,7,8,10],9)},
  play(st,t,spb){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if(s===0)c.forEach(n=>I.pad(n,t,spb*16*1.02,.008));if(s%2===0)I.bass(r-12+(s%4===2?12:0),t,.16,.1);
   I.sq(c[s%3]+12+(s%6>2?12:0),t,.1,.013);if(s%4===0)I.kick(t,.2);if(s===4||s===12){I.snare(t,.06);nz(t,.35,.02,'bandpass',1200,.6)}if(s%2===1)I.hat(t,.01);
   if(b%2===1&&s%4===0){const m=this.mel[(s/4+b*2)%8];if(m)I.saw(m+12,t,.45,.02,3000)}if(b%8===7&&s===0)this.mel=motif(8,69,[0,2,3,5,7,8,10],9)}},
 lofi2:{name:'ローファイ「雨上がりの防波堤」',bpm:70,swing:.3,chords:[[60,64,67,71,74],[57,60,64,67],[62,65,69,72],[55,59,62,65,69]],roots:[36,33,38,31],init(){this.mel=motif(8,76,[0,2,4,7,9,11],9)},
  play(st,t,spb){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if(s===0)c.forEach((n,i)=>I.ep(n,t+i*.03,.022,2.6));if(s===8&&b%2)c.slice(1).forEach(n=>I.ep(n,t,.016,1.4));
   if(s===0||s===10)I.kick(t,.16);if(s===4||s===12){I.snare(t,.026);I.hat(t,.008,.08)}if(s%2===0)I.hat(t,s%4?.006:.01);if(s===0)I.bass(r,t,1.4,.11);if(s===7)I.bass(r+7,t,.4,.07);if(s===11)I.bass(r+5,t,.4,.07);
   if(b%2===1&&s%4===2){const m=this.mel[(s>>2)+(b%4)*2%8];if(m)I.bell(m,t,.022,1.2)}if(b%8===7&&s===0)this.mel=motif(8,76,[0,2,4,7,9,11],9)}},
 lofi3:{name:'ローファイ「夕凪カフェ」',bpm:78,swing:.34,chords:[[65,69,72,76],[64,67,71,74],[62,65,69,72],[60,64,67,71]],roots:[41,40,38,36],init(){this.mel=motif(16,72,PENTA,9)},
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if(s===0||s===6)c.forEach(n=>I.pluck(n,t,.018,1.2,2200));if(s===0)I.ep(c[3]+12,t,.012,2);
   if([0,7,9].includes(s))I.kick(t,.15);if(s===4||s===12)I.snare(t,.022);if(s%2===0)I.shaker(t,.008);if(s===0)I.bass(r,t,1,.11);if(s===8)I.bass(r+12,t,.5,.06);if(s===14)I.bass(r+7,t,.3,.06);
   if(s%2===0&&Math.random()<.55){const m=this.mel[(s/2+b*8)%16];if(m)I.flute(m,t,.5,.018)}if(b%8===7&&s===0)this.mel=motif(16,72,PENTA,9)}},
 lofi4:{name:'ローファイ「星屑ノート」',bpm:66,swing:.28,chords:[[57,60,64,67,71],[53,57,60,64],[50,53,57,60,64],[52,56,59,62]],roots:[33,29,26,28],init(){this.mel=motif(8,79,[0,3,5,7,10],8)},
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if(s===0)c.forEach(n=>I.pad(n,t,60/66*4*1.02,.006));if(s%4===0)I.ep(c[(s/4)%c.length]+12,t,.016,1.6);
   if(s===0||s===11)I.kick(t,.14);if(s===8)I.snare(t,.022);if(s%2===1)I.hat(t,.005);if(s===0)I.bass(r+12,t,2,.1);
   if(s%4===2&&Math.random()<.6){const m=this.mel[(s>>2)+(b%2)*4];if(m)I.bell(m,t,.02,2)}if(b%8===7&&s===0)this.mel=motif(8,79,[0,3,5,7,10],8)}},
 lofi5:{name:'ローファイ「朝焼けベッドルーム」',bpm:74,swing:.3,chords:[[62,66,69,73],[59,62,66,69],[55,59,62,66],[57,61,64,67]],roots:[38,35,31,33],init(){this.mel=motif(16,74,[0,2,4,7,9],9)},
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4],r=this.roots[b%4];if(s===0)c.forEach((n,i)=>I.pluck(n,t+i*.04,.02,1.6,1800));if(s===8)c.forEach((n,i)=>I.pluck(n,t+i*.04,.014,1.2,1800));
   if(s===0||s===8||s===10)I.kick(t,.15);if(s===4||s===12)I.snare(t,.024);if(s%2===0)I.hat(t,.007);if(s===0)I.bass(r,t,.9,.11);if(s===6)I.bass(r+7,t,.4,.07);if(s===10)I.bass(r+5,t,.4,.07);
   if(s%2===0&&Math.random()<.5){const m=this.mel[(s/2+b*8)%16];if(m)I.ep(m,t,.024,1)}if(b%8===7&&s===0)this.mel=motif(16,74,[0,2,4,7,9],9)}},
 fest:{name:'チップチューン「浜辺フェス」',bpm:132,chords:[[60,64,67],[57,60,64],[53,57,60],[55,59,62]],init(){this.mA=motif(8,72,MAJ,10);this.mB=motif(8,74,MAJ,10)},
  play(st,t){const b=st>>4,s=st%16,c=this.chords[b%4];if(s%4===0)I.kick(t,.2);if(s===4||s===12)I.snare(t,.05);if(s%2===0)I.hat(t,.015);
   I.sq(c[0]-12+(s%4===2?12:0),t,.12,.022);if(s%2===0){const mel=(b%4<2?this.mA:this.mB),m=mel[(s/2+(b%2)*4)%8];if(m)I.sq(m,t,.2,.03)}
   I.pluck(c[s%3]+12,t,.012,.15,4000);if(b%16===15&&s===0){this.mA=motif(8,72,MAJ,10);this.mB=motif(8,74,MAJ,10)}}}
};
function startMusic(id,sec){stopMusic(true);try{A();mBus()}catch(e){return}const tr=TRACKS[id];tr.init&&tr.init();MUS.track=tr;MUS.id=id;MUS.step=0;MUS.next=ac.currentTime+.2;MUS.startAt=ac.currentTime;MUS.endAt=ac.currentTime+sec;MUS.fading=false;
  MUS.bus.gain.cancelScheduledValues(ac.currentTime);MUS.bus.gain.setValueAtTime(.0001,ac.currentTime);MUS.bus.gain.exponentialRampToValueAtTime(.85,ac.currentTime+1.5);
  MUS.timer=setInterval(musSched,25);MUS.on=true;$('nowplay').hidden=false;musChip()}
function musSched(){const tr=MUS.track,spb=60/tr.bpm/4,now=ac.currentTime;
  if(!MUS.fading&&now>MUS.endAt-4){MUS.fading=true;MUS.bus.gain.setTargetAtTime(.0001,now,1.2)}
  if(now>MUS.endAt){stopMusic();return}
  while(MUS.next<now+.2){let t=MUS.next;const s=MUS.step%16;if(tr.swing&&s%4===2)t+=tr.swing*spb;MUS.ch=chordSet(tr,MUS.step);try{tr.play(MUS.step,t,spb)}catch(e){}MUS.next+=spb;MUS.step++}}
function stopMusic(silent){if(MUS.timer)clearInterval(MUS.timer);MUS.timer=null;if(MUS.on&&MUS.bus){MUS.bus.gain.cancelScheduledValues(ac.currentTime);MUS.bus.gain.setTargetAtTime(.0001,ac.currentTime,.3)}
  const was=MUS.on;MUS.on=false;$('nowplay').hidden=true;if(was&&!silent)say('musicEnd',{delay:200})}
setInterval(()=>{if(MUS.on){musChip();if(Math.random()<.04&&S.phase!=='busy')say('musicMid',{origin:'beach',delay:0});try{SCENE.notes()}catch(e){}}},1000);
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const SP=.55;
const FX=(()=>{const cv=$('fx'),x=cv.getContext('2d');let P=[],on=false,W,H;
  function rs(){W=innerWidth;H=innerHeight;const d=Math.max(.8,Math.min(1.5,devicePixelRatio||1,Math.sqrt(1.3e6/Math.max(1,W*H))));cv.width=W*d;cv.height=H*d;x.setTransform(d,0,0,d,0,0)}
  rs();addEventListener('resize',rs);
  const CONF=['#f2c14e','#e2475a','#55e0b4','#7aa2ff','#ffffff','#c18cff'];
  function add(p){if(RM||skipping)return;P.push(Object.assign({vx:0,vy:0,g:.25,drag:.99,rot:Math.random()*6,vr:(Math.random()-.5)*.3,life:90,max:90,size:6,delay:0,color:'#f2c14e'},p));if(!on){on=true;requestAnimationFrame(loop)}}
  function star(cx,cy,r){x.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.35:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill()}
  function draw(p){const a=Math.min(1,p.life/25);x.globalAlpha=a;
    if(p.type==='coin'){const sx=Math.abs(Math.cos(p.rot));x.save();x.translate(p.x,p.y);x.scale(Math.max(.12,sx),1);
      const g=x.createRadialGradient(-p.size*.3,-p.size*.3,1,0,0,p.size);g.addColorStop(0,'#fff6c9');g.addColorStop(.5,'#f2c14e');g.addColorStop(1,'#a8791f');
      x.fillStyle=g;x.beginPath();x.arc(0,0,p.size,0,7);x.fill();x.strokeStyle='#7a5512';x.lineWidth=1.2;x.stroke();x.restore()}
    else if(p.type==='confetti'){x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.scale(1,Math.cos(p.rot*2));x.fillStyle=p.color;x.fillRect(-p.size,-p.size*.4,p.size*2,p.size*.8);x.restore()}
    else if(p.type==='spark'){x.globalCompositeOperation='lighter';x.fillStyle=p.color;star(p.x,p.y,p.size*(.6+.4*a));x.globalCompositeOperation='source-over'}
    else if(p.type==='shard'){x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.fillStyle=p.color;x.beginPath();x.moveTo(0,-p.size);x.lineTo(p.size*.8,p.size*.6);x.lineTo(-p.size*.7,p.size*.4);x.fill();x.restore()}
    else if(p.type==='meteor'){p.trail.push([p.x,p.y]);if(p.trail.length>26)p.trail.shift();
      x.globalCompositeOperation='lighter';for(let i=0;i<p.trail.length;i++){const t=i/p.trail.length;x.globalAlpha=t*.8;x.fillStyle='#ffe9a8';x.beginPath();x.arc(p.trail[i][0],p.trail[i][1],1+t*5,0,7);x.fill()}
      x.globalAlpha=1;x.fillStyle='#fff';star(p.x,p.y,13);x.globalCompositeOperation='source-over';
      if(Math.random()<.6)add({type:'spark',x:p.x,y:p.y,vx:(Math.random()-.5)*2,vy:Math.random()*2,g:.05,life:35,size:4,color:'#ffe9a8'})}}
  function loop(){x.clearRect(0,0,W,H);P=P.filter(p=>p.life>0);
    for(const p of P){if(p.delay>0){p.delay-=SP;continue}
      if(p.type==='fly'){p.t+=p.step*SP;const t=Math.min(1,p.t),u=1-t;p.x=u*u*p.sx+2*u*t*p.cx+t*t*p.tx;p.y=u*u*p.sy+2*u*t*p.cy+t*t*p.ty;p.rot+=.25*SP;
        x.globalAlpha=1;draw(Object.assign({},p,{type:'coin',life:99}));if(t>=1){p.life=0;p.done&&p.done()}continue}
      p.life-=SP;p.vy+=p.g*SP;const dr=Math.pow(p.drag,SP);p.vx*=dr;p.vy*=dr;p.x+=p.vx*SP;p.y+=p.vy*SP;p.rot+=p.vr*SP;draw(p)}
    x.globalAlpha=1;if(P.length)requestAnimationFrame(loop);else{on=false;x.clearRect(0,0,W,H)}}
  const R=(a,b)=>a+Math.random()*(b-a);
  return{
    burst(cx,cy,n,type,o={}){for(let i=0;i<n;i++){const a=R(0,Math.PI*2),v=R(.3,1)*(o.speed||7);
      add({type,x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(o.up||2),g:o.g??.22,drag:o.drag??.98,life:R(40,80)|0,size:o.size?R(o.size*.6,o.size):R(4,7),
        color:o.colors?o.colors[i%o.colors.length]:CONF[i%CONF.length],vr:R(-.35,.35)})}},
    rain(type,n,o={}){for(let i=0;i<n;i++)add({type,x:R(0,W),y:R(-60,-10),vx:R(-1,1),vy:R(2,5),g:o.g??.12,drag:.995,life:R(110,170)|0,delay:R(0,o.spread||60)|0,
      size:type==='coin'?R(7,12):R(4,7),color:CONF[i%CONF.length],vr:R(-.25,.25)})},
    firework(cx,cy){const c=CONF[Math.random()*CONF.length|0];for(let i=0;i<46;i++){const a=i/46*Math.PI*2,v=R(4,6.5);
      add({type:'spark',x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:.07,drag:.96,life:R(45,70)|0,size:R(3,5),color:c})}},
    fly(sx,sy,tx,ty,n,onEach){let left=n;return new Promise(res=>{if(RM||!n||skipping){res();return}for(let i=0;i<n;i++)add({type:'fly',sx:sx+R(-30,30),sy:sy+R(-10,10),tx,ty,cx:(sx+tx)/2+R(-120,120),cy:Math.min(sy,ty)-R(60,160),t:0,step:R(.016,.024),life:999,size:R(7,10),delay:i*3,
      done:()=>{onEach&&onEach();if(--left===0)res()}})})},
    ring(cx,cy,color){for(let i=0;i<24;i++){const a=i/24*Math.PI*2;add({type:'spark',x:cx,y:cy,vx:Math.cos(a)*5,vy:Math.sin(a)*5,g:0,drag:.95,life:50,size:4,color})}},
    meteor(){if(typeof DK==='function'&&DK()<=.6)return;add({type:'meteor',x:R(-40,W*.2),y:R(H*.05,H*.3),vx:R(11,15),vy:R(4,6),g:0,drag:1,life:80,trail:[]})},
    clear(){for(const p of P)if(p.type==='fly'&&p.life>0){p.life=0;p.done&&p.done()}P=[];x.clearRect(0,0,W,H)},
    W:()=>W,H:()=>H};
})();
function applyVol(){try{if(!ac)return;const t=ac.currentTime;sfxBus.gain.setTargetAtTime(S.vol.se,t,.05);waveBus.gain.setTargetAtTime(S.vol.wave*1.15*1.5,t,.05);musOut.gain.setTargetAtTime(S.vol.mus,t,.05)}catch(e){}}
setTimeout(()=>{try{SCENE.setFire(!S.fireOff)}catch(e){}},0);
function R0(a,b){return a+Math.random()*(b-a)}
const WX={code:null,temp:null,max:null,min:null,at:0,said:0};
var SEASONS={
 halloween:{nm:'ハロウィン',ic:'🎃',test:(m,d)=>m===10},
 xmas:{nm:'クリスマス',ic:'🎄',test:(m,d)=>m===12&&d<=25},
 newyear:{nm:'お正月',ic:'🎍',test:(m,d)=>(m===12&&d>=30)||(m===1&&d<=10)},
 valentine:{nm:'バレンタイン',ic:'💝',test:(m,d)=>m===2&&d<=14},
 hanami:{nm:'お花見',ic:'🌸',test:(m,d)=>(m===3&&d>=20)||(m===4&&d<=20)},
 tanabata:{nm:'七夕',ic:'🎋',test:(m,d)=>m===7&&d<=7},
 summer:{nm:'夏祭り',ic:'🏮',test:(m,d)=>(m===7&&d>=15)||m===8},
 tsukimi:{nm:'お月見',ic:'🎑',test:(m,d)=>m===9&&d>=10}};
function curSeason(){if(window.SEASON_TEST)return window.SEASON_TEST;const n=new Date(),m=n.getMonth()+1,d=n.getDate();for(const k in SEASONS)if(SEASONS[k].test(m,d))return k;return null}
let rainSnd=null;
function rainKind(){const c=window.WX_TEST!=null?window.WX_TEST:WX.code;if(c==null)return 0;if(c>=95)return 3;if((c>=63&&c<=67)||(c>=81&&c<=82))return 2;if((c>=51&&c<=62)||c===80)return 1;return 0}
function rainSound(){try{const kd=rainKind();if(!ac||!NB||!waveBus){return}const want=kd&&S.sound&&!document.hidden?[0,.004,.006,.008][kd]:0;
  if(!rainSnd&&want){const s=ac.createBufferSource(),hp=ac.createBiquadFilter(),lp=ac.createBiquadFilter(),g=ac.createGain();s.buffer=NB;s.loop=true;hp.type='highpass';hp.frequency.value=900;lp.type='lowpass';lp.frequency.value=3200;g.gain.value=0;s.connect(hp);hp.connect(lp);lp.connect(g);g.connect(waveBus);s.start();rainSnd={s,g}}
  if(rainSnd){rainSnd.g.gain.setTargetAtTime(want,ac.currentTime,1.5);if(!want){const r=rainSnd;rainSnd=null;setTimeout(()=>{try{r.s.stop()}catch(e){}},6000)}}}catch(e){}}
setInterval(rainSound,4000);
function moonPhase(){if(window.MOON_TEST!=null)return window.MOON_TEST;const syn=29.530588853,ref=Date.UTC(2000,0,6,18,14);return(((Date.now()-ref)/86400000)%syn+syn)%syn/syn}
function moonIllum(){return(1-Math.cos(moonPhase()*Math.PI*2))/2}
function moonFull(){const a=moonPhase()*29.53;return a>=13.6&&a<16}
let ambNext=0;
function ambVoice(){try{if(!ac||!waveBus||!S.sound||document.hidden||DK()<.6)return;const now=performance.now();if(now<ambNext)return;const m=new Date().getMonth()+1,rain=typeof rainKind==='function'?rainKind():0,t0=ac.currentTime+.05;
  const out=ac.createGain();out.gain.value=rain?.3:1;out.connect(waveBus);setTimeout(()=>{try{out.disconnect()}catch(e){}},6000);
  const env=(g,t,a,d,v)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)};
  const osc=(type,f,t,dur,v,pan=0)=>{const o=ac.createOscillator(),g=ac.createGain(),p=ac.createStereoPanner?ac.createStereoPanner():null;o.type=type;o.frequency.value=f;env(g,t,.01,dur,v);o.connect(g);if(p){p.pan.value=pan;g.connect(p);p.connect(out)}else g.connect(out);o.start(t);o.stop(t+dur+.1);return o};
  if(m>=9&&m<=11){const r=Math.random(),pan=Math.random()*1.6-.8;
    if(r<.45){for(let i=0;i<3+(Math.random()*3|0);i++){const o=osc('sine',4300+Math.random()*80,t0+i*.42,.32,.012,pan);const lfo=ac.createOscillator(),lg=ac.createGain();lfo.frequency.value=48;lg.gain.value=180;lfo.connect(lg);lg.connect(o.frequency);lfo.start(t0+i*.42);lfo.stop(t0+i*.42+.4)}ambNext=now+R0(900,2600)}
    else if(r<.75){[0,.14,.28,.62].forEach((d,i)=>osc('sine',i===3?3300:3600,t0+d,.09,.01,pan));ambNext=now+R0(1500,3800)}
    else{for(let i=0;i<6;i++)osc('triangle',3900,t0+i*.07,.035,.008,pan);ambNext=now+R0(700,2000)}}
  else if(m>=6&&m<=8){const pan=Math.random()*1.6-.8,n=2+(Math.random()*4|0);for(let i=0;i<n;i++){const o=osc('sawtooth',260+Math.random()*40,t0+i*.22,.08,.012,pan);const f=ac.createBiquadFilter();}ambNext=now+R0(1200,3500)}
  else if(m===12||m<=2){if(Math.random()<.25){const o=osc('sine',92,t0,2.6,.03,-.5);o.frequency.linearRampToValueAtTime(88,t0+2.6);ambNext=now+R0(16000,30000)}else{try{noise(2.4,{v:.02,type:'bandpass',f:500,f2:900,q:.5,attack:1})}catch(e){}ambNext=now+R0(5000,11000)}}
  else{if(Math.random()<.5){osc('sine',420,t0,.35,.014,.4);osc('sine',380,t0+.5,.55,.012,.4)}ambNext=now+R0(5000,12000)}}catch(e){}}
setInterval(()=>ambVoice(),300);
const SEKKI=[[1,5,'小寒'],[1,20,'大寒'],[2,4,'立春'],[2,19,'雨水'],[3,5,'啓蟄'],[3,20,'春分'],[4,4,'清明'],[4,20,'穀雨'],[5,5,'立夏'],[5,21,'小満'],[6,5,'芒種'],[6,21,'夏至'],[7,7,'小暑'],[7,22,'大暑'],[8,7,'立秋'],[8,23,'処暑'],[9,7,'白露'],[9,23,'秋分'],[10,8,'寒露'],[10,23,'霜降'],[11,7,'立冬'],[11,22,'小雪'],[12,7,'大雪'],[12,21,'冬至']];
function sekkiNow(){const d=window.SEKKI_TEST?new Date(window.SEKKI_TEST):new Date(),m=d.getMonth()+1,dd=d.getDate();let cur=SEKKI[SEKKI.length-1];for(const s of SEKKI){if(m>s[0]||(m===s[0]&&dd>=s[1]))cur=s}return{n:cur[2],today:cur[0]===m&&cur[1]===dd}}
(()=>{const mk=(base,key,name,bpm,tr)=>{const b=TRACKS[base];if(!b)return;const o=Object.create(b);o.name=name;o.bpm=bpm;if(b.chords)o.chords=b.chords.map(c=>c.map(n=>n+tr));if(b.roots)o.roots=b.roots.map(n=>n+tr);TRACKS[key]=o};
 mk('musicbox','musicbox_w','オルゴール「月夜のワルツ」',66,-3);mk('guitar','guitar_y','ギター「夕凪のうた」',64,2);mk('lofi','lofi_cafe','ローファイ「雨の日の喫茶店」',64,-2);mk('jazz','jazz_mid','ジャズ「ミッドナイト・ビーチ」',104,-3);
 mk('hawaii','hawaii_s','スラックキー「サンセット・レイ」',78,-2);mk('koto','koto_moon','和風「月見の宴」',64,2);mk('piano','piano_hi','ピアノ「ひだまりの午後」',70,5)})();
function resVisit(force){const L=residents(),met=S.resMet||{};const R=force||(()=>{const w=L.map(x=>(met[x.id]?2:1)*(x.rare?.35:1));let q=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<L.length;i++){if((q-=w[i])<0)return L[i]}return L[0]})();window.RES_CUR=R;try{SCENE.amb('gen_res')}catch(e){return}
  const n=(met[R.id]||0)+1;met[R.id]=n;S.resMet=met;save();MUMS['res_'+R.id]=R.lines.map(l=>`${R.name}「${l} ${R.suf}」`).concat([`${R.name}「また 来た ${R.suf}」`]);
  if(n===1)setTimeout(()=>{treToast(`🆕 はじめての 住人<small>${resTitle(R)}の「${R.name}」が 遊びに 来た</small>`);say('resNew',{delay:1200,ctx:{item:R.name}})},1800);else setTimeout(()=>{say('res_'+R.id,{n:2,origin:'beach',delay:0,gap:1500})},2600);
  }
{const _rd=runDeco;runDeco=function(n){const f=DECO_INFO[n];if(f&&f[1]==='dk_gen'){window.GEN_DK=n}return _rd.apply(this,arguments)}}
function chConst(col){const d=SCENE.dbg();let el=document.createElement('div');el.className='chConst c-'+col;const pts=[[.12,.3],[.22,.18],[.33,.24],[.42,.12],[.5,.22],[.46,.36],[.36,.4]].map(([a,b])=>[a+Math.random()*.03,b+Math.random()*.03]),ox=Math.random()*.4;
  const W2=d.WW,H2=(d.WH||300)*.42;el.style.left=(d.WL+W2*ox)+'px';el.style.top=(d.WT+8)+'px';el.style.width=W2*.55+'px';el.style.height=H2+'px';
  el.innerHTML=`<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${pts.map(([a,b])=>`${a*180},${b*220}`).join(' ')}" fill="none" stroke="currentColor" stroke-width=".4" stroke-dasharray="2 1.5" opacity=".55"/></svg>${pts.map(([a,b],i)=>`<i style="left:${a*180}%;top:${b*220}%;animation-delay:${i*.25}s"></i>`).join('')}`;
  document.body.appendChild(el);setTimeout(()=>{el.classList.add('bye');setTimeout(()=>el.remove(),1600)},col==='rainbow'?16000:11000)}
function chOmen(col){try{const say2=(k,d)=>say(k,{delay:d||600});
  if(col==='white'){if(Math.random()<.5)say2('chOmenW')}
  else if(col==='blue'){SCENE.fireFxNow('blue');say2('chOmenFire',1200)}
  else if(col==='green'){SCENE.fireFxNow('blue');setTimeout(()=>chConst('green'),1500);say2(Math.random()<.5?'chOmenFire':'chOmenStar',1400)}
  else if(col==='red'){chConst('red');setTimeout(()=>SCENE.fireFxNow('blue'),2500);say2('chOmenStar',1000)}
  else if(col==='gold'){chConst('gold');try{SCENE.visit('fox')}catch(e){}say2('chOmenFox',2600)}
  else if(col==='rainbow'){chConst('rainbow');SCENE.fireFxNow('blue');try{SCENE.visit('crane')}catch(e){}say2('chOmenCrane',2600)}}catch(e){}}
function chCloud(){const d=SCENE.dbg(),el=document.createElement('div');el.className='chCloud';el.style.top=(d.WT+(d.hz-d.WT)*R0(.15,.45))+'px';el.style.left=(d.WL+d.WW*R0(.05,.3))+'px';el.innerHTML='<i></i>';document.body.appendChild(el);setTimeout(()=>{el.classList.add('bye');setTimeout(()=>el.remove(),2000)},18000)}
{const _om=chOmen;chOmen=function(col){if(DK()>=.5)return _om(col);try{const say2=(k,d)=>say(k,{delay:d||600});
  if(col==='white'){if(Math.random()<.5)say2('chOmenW')}
  else if(col==='blue'){window._seaOmen=performance.now()+20000;say2('chOmenSea',1500)}
  else if(col==='green'){chCloud();say2('chOmenCloud',2500)}
  else if(col==='red'){window._seaOmen=performance.now()+20000;try{SCENE.play('dolphins')}catch(e){}say2('chOmenDolphin',2600)}
  else if(col==='gold'){chCloud();try{SCENE.visit('whaleshark')}catch(e){}say2('chOmenShark',2600)}
  else if(col==='rainbow'){try{SCENE.play('rainbow')}catch(e){}window._seaOmen=performance.now()+25000;setTimeout(()=>{try{SCENE.visit('crane')}catch(e){}},3000);say2('chOmenCrane',3500)}}catch(e){}}}
['pointerdown','keydown','wheel'].forEach(ev=>addEventListener(ev,()=>{window._lastInput=performance.now()},{passive:true,capture:true}));
window._lastInput=performance.now();
(()=>{let on=false;try{on=localStorage.getItem('hoshiEco')==='1'}catch(e){}window._eco=on;const c=$('ecoMode');if(c){c.checked=on;c.onchange=()=>{window._eco=c.checked;try{localStorage.setItem('hoshiEco',c.checked?'1':'0')}catch(e){}try{dispatchEvent(new Event('resize'))}catch(e){}}}})();
function tapFx(x,y,html,cls,ms){const d=document.createElement('div');d.className='tapFx '+(cls||'');d.style.left=x+'px';d.style.top=y+'px';d.innerHTML=html||'';document.body.appendChild(d);setTimeout(()=>d.remove(),ms||1400);return d}
function tsnd(f){if(!S.sound)return;try{f()}catch(e){}}
const bg=(t,x,y)=>!t.closest||!t.closest('button,.card,.win,#msg,.bar,.foot,header,input,.chip,#volSheet,#bubbles .bubble,#toast,#getPop,#fukuOpen,#zkPop,#bagPop,#chestPop,#wishPop,#jpPop,#resetDlg,#synFx,#meteor,#status,#tprop,#coinTags,#pop,a,label,select,#diaryPop,.shellBtn');
{const _tf=tapFx;tapFx=function(x,y,html,cls,ms){const d=_tf(x,y,html,cls,ms);if(cls==='shell'){d.classList.add('shellBtn');d.style.pointerEvents='auto';d.style.animation='tfShell 3s ease-out forwards';setTimeout(()=>d.remove(),3000);
   d.addEventListener('pointerdown',ev=>{ev.stopImmediatePropagation();ev.preventDefault();d.remove();tapFx(x,y-20,'👂','pop',1500);tsnd(()=>{noise(2.8,{v:.05,type:'bandpass',f:500,f2:1200,q:.5,attack:.8});[523,659,784,659].forEach((f,i)=>tone(f,.8,'sine',.008,1+i*.5))});say('shellEar',{delay:400})},true)}return d}}
{let last=0;const SPEC=['🐱','🐶','🦀','🐧','🦝','🐰','🦭','🐢','🦊','🐦','🐻','🦦'];
 function specRow(n){let row=$('specRow');if(!row){row=document.createElement('div');row.id='specRow';document.body.appendChild(row)}try{const d=SCENE.dbg();row.style.top=(d.shore-scrollY+18*d.k)+'px'}catch(e){}
   while(row.children.length<Math.min(12,n)){const s=document.createElement('span');s.textContent=SPEC[row.children.length%SPEC.length];s.style.left=(8+((row.children.length*37)%84))+'%';row.appendChild(s)}while(row.children.length>Math.min(12,n))row.lastChild.remove();row.classList.toggle('on',n>0)}
 setInterval(()=>{const st=S.streak||0;if(st===last)return;const up=st>last;last=st;document.body.classList.remove('stk2','stk3','stk5');
   if(st>=2)document.body.classList.add('stk2');if(st>=3)document.body.classList.add('stk3');if(st>=5)document.body.classList.add('stk5');
   if(up){if(st>=2)window._seaOmen=performance.now()+60000;if(st>=3){try{SCENE.show('bigfire',20)}catch(e){}}if(st>=4){try{SCENE.show(DK()>.6?'fireworks':'balloons',14)}catch(e){}}
     specRow(Math.max(0,(st-1)*2));const row=$('specRow');if(row){row.classList.remove('cheer');void row.offsetWidth;row.classList.add('cheer')}if(st>=2)tsnd(()=>{try{sfx.clap(Math.min(1,.2+st*.12))}catch(e){}});try{window.specUp&&specUp(st)}catch(e){}}
   else{window._seaOmen=0;window.specEnd?specEnd(specRow):specRow(0)}},300)}
{let nx=Date.now()+20000;setInterval(()=>{try{if(document.hidden||SCENE.dark()<.6||Date.now()<nx)return;nx=Date.now()+20000+Math.random()*40000;if(!S.sound||!ac)return;const r=Math.random();
  if(r<.25){tone(98,1.6,'sine',.03);tone(131,1.6,'sine',.015);setTimeout(()=>{tone(98,1.1,'sine',.025)},1900);if(Math.random()<.3)say('ntHorn',{delay:800})}
  else if(r<.5){[[420,.35,0],[380,.5,.45]].forEach(([f,d,dl])=>tone(f,d,'sine',.02,dl));setTimeout(()=>{[[420,.3,0],[380,.45,.4]].forEach(([f,d,dl])=>tone(f,d,'sine',.015,dl))},1500);if(Math.random()<.3)say('ntOwl',{delay:1000})}
  else{for(let i=0;i<6;i++)noise(.04+Math.random()*.05,{v:.03,type:'highpass',f:2000+Math.random()*2000});}}catch(e){}},3000)}
{let last=-1;setInterval(()=>{try{if(!ac||!waveBus||document.body.classList.contains('afterglow')||document.body.classList.contains('airCalm')||document.body.classList.contains('airStill'))return;const h=SCENE.dbg().gh,deep=(h>=23||h<4)?1:0;if(deep===last)return;last=deep;waveBus.gain.setTargetAtTime((S.vol?S.vol.wave:1)*1.15*1.5*(deep?.65:1),ac.currentTime,2)}catch(e){}},4000)}
setInterval(()=>{try{if(document.hidden||SCENE.dark()<.6)return;const sh=SCENE.showing();if(sh.some(n=>/^nt_/.test(n)))return;if(Math.random()<.1){const n=pick(['nt_couple','nt_blanket','nt_kid']);SCENE.show(n,70);if(Math.random()<.6)say(n,{delay:3000})}}catch(e){}},45000);
window.crabDone=(n,col)=>{const L=[`${n}カニ、1着〜！`,`${n}の 子 速っ！`,`ゴール！ 勝ったんは ${n}カニ`,`${n}カニ 優勝や！`,`写真判定… ${n}の 勝ち！`];MUMS.crabWin=L;say('crabWin',{n:2,delay:200,gap:1000});tsnd(()=>{[784,988,1175,1568].forEach((f,k)=>tone(f,.15,'triangle',.02,k*.08))});
  setTimeout(()=>{try{sfx.clap(.4)}catch(e){}},300)};
addEventListener('pointerdown',e=>{const s=window._sasa;if(!s||Date.now()-s.t>500||!bg(e.target))return;const py=e.clientY+scrollY;if(Math.abs(e.clientX-s.x)>34||Math.abs(py-s.y)>60)return;e.stopImmediatePropagation();
  tapFx(e.clientX,e.clientY-12,'🎋','pop',1000);tsnd(()=>{tone(1319,.3,'sine',.02);tone(1760,.4,'sine',.015,.12)});say('tanzaku',{delay:100})},true);
const CLOUDM={cream:['あの雲 ソフトクリームやん','雲が アイスに 見える','食べたくなってきた'],whale:['クジラの 雲！','空にも クジラ','雲が 泳いでる'],heart:['ハートの 雲！','空が 恋してる','ええこと ありそう'],rabbit:['うさぎの 雲','ぴょんって してる','耳 長っ'],fish:['魚の 雲','今晩 お刺身かな','空の 魚'],cat:['ねこの 雲！','にゃーん って 顔','しっぽ ある']};
setInterval(()=>{try{if(document.hidden||SCENE.dark()>.35||SCENE.showing().includes('cloudshape'))return;if(Math.random()<.06){const kd=pick(Object.keys(CLOUDM));window._cloudK=kd;SCENE.show('cloudshape',50);MUMS.cloudM=CLOUDM[kd];setTimeout(()=>say('cloudM',{delay:0}),6000);try{diaryNote('ev','cloud')}catch(e){}}}catch(e){}},60000);
{const _av=applyVol;applyVol=function(){_av.apply(this,arguments);try{if(ac&&master){window._mBase??=master.gain.value;master.gain.setTargetAtTime(window._mBase*(document.body.classList.contains('sleepy')?.6:1),ac.currentTime,.4)}}catch(e){}}}
window.senkoDrop=()=>{say('senkoDrop',{delay:300});tsnd(()=>tone(220,.25,'sine',.02))};
addEventListener('pointerdown',e=>{const S5=window._senko;if(!S5||Date.now()-S5.t>400||S5.p>.93||!bg(e.target))return;const py=e.clientY+scrollY;if(Math.hypot(e.clientX-S5.x,py-S5.y)>50)return;e.stopImmediatePropagation();
  window._senkoBoost=performance.now();tapFx(e.clientX,e.clientY-16,'✨','pop',900);tsnd(()=>{for(let i=0;i<12;i++)tone(2500+Math.random()*2500,.02,'square',.008,Math.random()*.8)});if(Math.random()<.5)say('senkoTap',{delay:150})},true);
{let lastDay=-1;setInterval(()=>{try{const d=SCENE.dbg(),day=Math.floor((S.gameMin||0)/1440)+(S.gameDay||0);const h=d.gh;if(h<17.8||h>17.97)return;const key=Math.floor(Date.now()/3600000);if(lastDay===key)return;lastDay=key;
  if(Math.random()<.4){SCENE.show('gflash',2.6);tsnd(()=>{tone(1568,.6,'sine',.02);tone(2093,.8,'sine',.015,.15)});setTimeout(()=>{evToast('💚 グリーンフラッシュ！ 夕日が 一瞬 緑に…');say('gflash',{n:2,delay:200,gap:900})},600);diaryNote('ev','gflash')}}catch(e){}},1000)}
{let st=0;setInterval(()=>{const t=window._tide;if(t==null)return;const n=t<-.4?-1:t>.6?1:0;if(n!==st&&n!==0&&Math.random()<.7){say(n<0?'tideLow':'tideHigh',{delay:0})}if(n!==0)st=n},4000)}
addEventListener('pointerdown',e=>{const P=window._tidePts;if(!P||!P.length||!bg(e.target))return;const py=e.clientY+scrollY;const hit=P.find(([x,y,w])=>Math.abs(e.clientX-x)<w*1.2&&Math.abs(py-y)<w*.8);if(!hit)return;e.stopImmediatePropagation();
  tapFx(e.clientX,e.clientY-10,['🦀','🐟','🐚','⭐'][Math.random()*4|0],'pop',1100);tsnd(()=>{tone(1047,.1,'sine',.02);tone(1397,.14,'sine',.02,.08)});if(Math.random()<.6)say('tidePool',{delay:150})},true);
{let shown=0;setInterval(()=>{try{const m=new Date().getMonth()+1;if(!(m===12||m<=2)||document.hidden)return;if(Date.now()-shown<40*60000)return;if(Math.random()<.04){shown=Date.now();SCENE.show('snowday',180);evToast('❄️ 浜辺に 雪が 降ってきた…');say('snowDay',{n:2,delay:1500,gap:1400});diaryNote('ev','snowday')}}catch(e){}},60000)}
addEventListener('pointerdown',e=>{if(performance.now()-(window._snowOn||0)>500||!bg(e.target))return;let d;try{d=SCENE.dbg()}catch(err){return}const py=e.clientY+scrollY;if(py<d.shore+12*d.k)return;return;const cv=null;const g=null,k=d.k;
  g.save();g.fillStyle='rgba(120,135,170,.5)';for(const [dx,dy,r] of [[-5,4,-.15],[5,-4,.15]]){g.save();g.translate(e.clientX+dx*k,py+dy*k);g.rotate(r);g.beginPath();g.ellipse(0,0,3*k,6*k,0,0,7);g.fill();g.restore()}g.restore();tsnd(()=>noise(.18,{v:.03,type:'lowpass',f:900}))},true);
let ducked=false;
setInterval(()=>{if(!document.hidden&&S.phase!=='busy')FX.meteor()},300000);
const SCENE=(()=>{
  const cv=$('stars'),x=cv.getContext('2d');
  let glints=[],foam=[],wet=[],W,H,k,hz,shore,desk=false,DPR,WL=0,WT=0,WW=0,WH=0,bg,twk=[],clouds=[],embers=[],flames=[],smoke=[],booms=[],t=0,last=0,shown=-1,moonX,moonY,moonR;
  const ITEMS=[
    {c:250, n:'ランタン',        d:[.05,.93],m:[.15,.99]},
    {c:400, n:'ロッキングチェア',d:[.85,.91],m:[.21,.86]},
    {c:900, n:'ヤシの木',        d:[.95,.93],m:[.95,1.01]},
    {c:1300,n:'テント',          d:[.86,.79],m:[.07,.8]},
    {c:2000,n:'ライトのガーランド',d:[0,0],m:[0,0]},
    {c:3000,n:'ヨット',          d:[.78,.465],m:[.34,.462]},
    {c:15000,n:'ハンモック',d:[0,0],m:[0,0]},
    {c:20000,n:'サーフボード',d:[0,0],m:[.54,.9]},
    {c:30000,n:'ビーチパラソル',d:[0,0],m:[.1,.74]},
    {c:150000,n:'気球',d:[0,0],m:[.7,.24]},
    {c:200000,n:'豪華クルーザー',d:[0,0],m:[.74,.442]},
    {c:300000,n:'星の門',d:[0,0],m:[.72,.71]},
  ];
  ITEMS.forEach(it=>it.a=0);
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R=(a,b)=>a+Math.random()*(b-a),G=()=>(Math.random()+Math.random()+Math.random()-1.5)/1.5;
  function glow(cx,cy,r,col,c2='rgba(0,0,0,0)'){const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,col);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2)}
  /* static layer: sky, milky way, stars, moon, far hills, textured sand */
  let starsCv,moonCv,sandCv,dark=1,lightX=0,lightY=0,sunX=0,sunY=0,sunUp=0,moonUp=0,PAL=null;
  function mk(){const c=document.createElement('canvas');c.width=W*DPR;c.height=H*DPR;const b=c.getContext('2d');b.setTransform(DPR,0,0,DPR,0,0);return[c,b]}
  function build(){let g,b;
    [starsCv,b]=mk();
    // milky way: soft glow + dense dust of tiny stars + dark lanes
    const ax=W*.05,ay=hz*.05,bx=W*.95,by=hz*.95,len=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/len,ny=(bx-ax)/len,wd=Math.min(W,H)*.09;
    b.globalCompositeOperation='lighter';
    for(let n=0;n<70;n++){const tt=Math.random(),o=G()*wd,px=ax+(bx-ax)*tt+nx*o,py=ay+(by-ay)*tt+ny*o,r=R(30,110)*k;if(py>hz)continue;
      const gg=b.createRadialGradient(px,py,0,px,py,r);gg.addColorStop(0,Math.random()<.5?'rgba(150,165,255,.05)':'rgba(255,215,190,.045)');gg.addColorStop(1,'rgba(0,0,0,0)');b.fillStyle=gg;b.fillRect(px-r,py-r,r*2,r*2)}
    for(let n=0;n<Math.round(W*hz/90);n++){const tt=Math.random(),o=G()*wd*.9,px=ax+(bx-ax)*tt+nx*o,py=ay+(by-ay)*tt+ny*o;if(py>hz-4)continue;
      b.fillStyle=`rgba(${R(200,255)|0},${R(200,240)|0},255,${R(.15,.7)})`;b.fillRect(px,py,R(.4,1.1),R(.4,1.1))}
    b.globalCompositeOperation='source-over';
    for(let n=0;n<18;n++){const tt=Math.random(),o=G()*wd*.3,px=ax+(bx-ax)*tt+nx*o,py=ay+(by-ay)*tt+ny*o,r=R(15,45)*k;if(py>hz)continue;
      const gg=b.createRadialGradient(px,py,0,px,py,r);gg.addColorStop(0,'rgba(2,4,15,.35)');gg.addColorStop(1,'rgba(2,4,15,0)');b.fillStyle=gg;b.fillRect(px-r,py-r,r*2,r*2)}
    for(let n=0;n<Math.round(W*hz/1500);n++){const c=['#ffffff','#cfe0ff','#ffe9c8','#ffd2b0'][Math.random()*4|0];b.fillStyle=c;b.globalAlpha=R(.3,.9);b.beginPath();b.arc(R(0,W),R(0,hz*.97),R(.3,1.1),0,7);b.fill()}
    b.globalAlpha=1;
    moonR=16*k;{const S2=Math.ceil(moonR*2+4);moonCv=document.createElement('canvas');moonCv.width=S2*DPR;moonCv.height=S2*DPR;const m=moonCv.getContext('2d');m.setTransform(DPR,0,0,DPR,0,0);const c=S2/2;
      m.save();m.beginPath();m.arc(c,c,moonR,0,7);m.clip();g=m.createRadialGradient(c-moonR*.3,c-moonR*.3,0,c,c,moonR);g.addColorStop(0,'#fffdf4');g.addColorStop(.75,'#e9e4d6');g.addColorStop(1,'#bdb6a6');m.fillStyle=g;m.fillRect(0,0,S2,S2);
      [[-.35,-.15,.38],[.1,-.35,.25],[.25,.2,.3],[-.15,.35,.2],[.45,-.05,.15]].forEach(([a,cc,r])=>{const gg=m.createRadialGradient(c+a*moonR,c+cc*moonR,0,c+a*moonR,c+cc*moonR,r*moonR);gg.addColorStop(0,'rgba(120,115,110,.45)');gg.addColorStop(1,'rgba(120,115,110,0)');m.fillStyle=gg;m.fillRect(0,0,S2,S2)});
      for(let n=0;n<14;n++){m.strokeStyle='rgba(110,105,100,.25)';m.lineWidth=.6;m.beginPath();m.arc(c+G()*moonR,c+G()*moonR,R(.6,2.2)*k,0,7);m.stroke()}m.restore()}
    [sandCv,b]=mk();const top=shore-20*k;
    const grains=Math.round(W*(H-top)/7);for(let n=0;n<grains;n++){const py=R(top,H),l=(py-top)/(H-top);b.fillStyle=Math.random()<.5?`rgba(255,235,210,${.04+l*.06})`:`rgba(0,0,0,${.08+l*.06})`;b.fillRect(R(0,W),py,1,1)}
    b.lineWidth=1;for(let n=0;n<26;n++){const py=R(shore+30*k,H),px=R(-50,W),w=R(60,180)*k;b.strokeStyle=`rgba(255,230,200,${R(.03,.06)})`;b.beginPath();b.moveTo(px,py);b.bezierCurveTo(px+w*.3,py-4*k,px+w*.7,py+4*k,px+w,py);b.stroke()}
    for(let n=0;n<Math.round(W/12);n++){const px=R(0,W),py=R(shore+25*k,H),r=R(1.2,3.4)*k;b.fillStyle='rgba(20,15,22,.55)';b.beginPath();b.ellipse(px,py,r,r*.65,0,0,7);b.fill();b.fillStyle='rgba(255,220,190,.12)';b.beginPath();b.ellipse(px-r*.2,py-r*.25,r*.5,r*.25,0,0,7);b.fill()}
    for(let n=0;n<Math.round(W/90);n++){const px=R(0,W),py=R(shore+30*k,H),r=R(3,5)*k;b.fillStyle='rgba(230,215,200,.35)';b.beginPath();b.moveTo(px,py);b.arc(px,py,r,Math.PI*1.1,Math.PI*1.9);b.closePath();b.fill()}
    let fx=WL+WW*.32,fy=H;for(let n=0;n<14;n++){fy-=18*k;fx+=Math.sin(n*.5)*4*k+3*k;if(fy<shore+20*k)break;const side=n%2?1:-1;b.fillStyle='rgba(0,0,0,.18)';b.beginPath();b.ellipse(fx+side*5*k,fy,2.6*k,4.5*k,.2,0,7);b.fill()}

  }
  /* ---------- time of day: palettes by game hour ---------- */
  const KF=[[0,{top:'#060c26',mid:'#16245a',hz:'#46548e',seaT:'#2c4282',seaB:'#14255a',sandT:'#5e566e',sandB:'#8a7468',head:'#0c1434',cloud:'160,170,215',cA:.14}],
   [4.5,{top:'#08102e',mid:'#1c2460',hz:'#4c4c86',seaT:'#2e3a78',seaB:'#16224e',sandT:'#5e5468',sandB:'#887064',head:'#10163a',cloud:'150,150,200',cA:.12}],
   [5.7,{top:'#2a3a7a',mid:'#6a5a9a',hz:'#ff9a78',seaT:'#6a6a9a',seaB:'#26305e',sandT:'#7a6070',sandB:'#a07e6a',head:'#2a2448',cloud:'255,170,170',cA:.35}],
   [7,{top:'#3f78c8',mid:'#7db0e6',hz:'#ffe2b8',seaT:'#5a9ad0',seaB:'#1f5a94',sandT:'#d6bf98',sandB:'#c8a87e',head:'#4a6088',cloud:'255,245,240',cA:.55}],
   [10,{top:'#2e78d4',mid:'#62a8ec',hz:'#bfe2ff',seaT:'#3a9ad6',seaB:'#14609e',sandT:'#ecd8aa',sandB:'#dcbc8a',head:'#5a7ea6',cloud:'255,255,255',cA:.7}],
   [14,{top:'#2a74d0',mid:'#5ea6ea',hz:'#c4e4ff',seaT:'#3496d2',seaB:'#145c98',sandT:'#eedaac',sandB:'#dcbc88',head:'#5c80a8',cloud:'255,255,255',cA:.7}],
   [16.5,{top:'#3470c0',mid:'#7aa6d8',hz:'#ffd6a0',seaT:'#4a88c0',seaB:'#1e5288',sandT:'#e0c294',sandB:'#c8a274',head:'#506488',cloud:'255,235,210',cA:.6}],
   [18,{top:'#2e3478',mid:'#a0567a',hz:'#ff8a4a',seaT:'#b66a5a',seaB:'#3a3062',sandT:'#b07a62',sandB:'#8e6250',head:'#2e2240',cloud:'255,150,120',cA:.55}],
   [19.2,{top:'#161a50',mid:'#3e3270',hz:'#a04e72',seaT:'#3e3c7a',seaB:'#1a2452',sandT:'#6a5466',sandB:'#7e665e',head:'#181434',cloud:'200,140,170',cA:.3}],
   [20.5,{top:'#060c26',mid:'#16245a',hz:'#46548e',seaT:'#2c4282',seaB:'#14255a',sandT:'#5e566e',sandB:'#8a7468',head:'#0c1434',cloud:'160,170,215',cA:.14}],
   [24,{top:'#060c26',mid:'#16245a',hz:'#46548e',seaT:'#2c4282',seaB:'#14255a',sandT:'#5e566e',sandB:'#8a7468',head:'#0c1434',cloud:'160,170,215',cA:.14}]];
  const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),mixc=(a,b,f)=>{const A=hx(a),B=hx(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*f).toString(16).padStart(2,'0')).join('')};
  function palette(h){let i=0;while(i<KF.length-2&&h>=KF[i+1][0])i++;const[a,A]=KF[i],[b,B]=KF[i+1],f=Math.max(0,Math.min(1,(h-a)/(b-a))),o={};
    for(const key in A){if(key==='cloud'){const ca=A.cloud.split(',').map(Number),cb=B.cloud.split(',').map(Number);o.cloud=ca.map((v,n)=>Math.round(v+(cb[n]-v)*f)).join(',')}else if(key==='cA')o.cA=A.cA+(B.cA-A.cA)*f;else o[key]=mixc(A[key],B[key],f)}return o}
  const darkOf=h=>h<4.8?1:h<7?1-(h-4.8)/2.2:h<17.6?0:h<20.2?(h-17.6)/2.6:1;
  const gameHour=()=>((S.gameMin||0)/60)%24;
  let ISL=null;
  function islBuild(){const P={},n1=(v,a,b,c)=>Math.sin(v*a)*.5+Math.sin(v*b+1.3)*.3+Math.sin(v*c+2.1)*.2;
    // far mountain range, fading into haze
    P.far=[[W*.26,hz]];for(let px=W*.26;px<=W+6;px+=5){const q=(px-W*.26)/(W*.74),h=(10+n1(q,6.1,13.7,29)*7+Math.sin(q*Math.PI)*12)*k*Math.min(1,q*5);P.far.push([px,hz-h])}P.far.push([W+6,hz]);
    // volcanic island: concave cone, small crater, ridges
    const vc=W*.53,vh=Math.min(64*k,hz*.32),vw=Math.min(W*.21,vh*2.6);P.vc=[vc,vh,vw];P.vol=[[vc-vw,hz]];
    for(let t=-1;t<=1.0001;t+=.02){const a=Math.abs(t),h=vh*Math.pow(1-a,1.7)*(1-.06*Math.exp(-Math.pow(t/.05,2)))+vh*.3*Math.exp(-Math.pow((t-.42)/.16,2))+vh*.12*Math.exp(-Math.pow((t+.6)/.12,2))+n1(t,17,41,73)*1.6*k*(1-a);P.vol.push([vc+t*vw,hz-h])}P.vol.push([vc+vw,hz]);
    P.ridges=[-.55,-.28,.18,.46].map(t0=>{const pts=[];for(let u=0;u<=1;u+=.1){const t=t0*(.15+u*.85)+Math.sin(u*9+t0*7)*.02;pts.push([vc+t*vw,hz-vh*Math.pow(1-Math.abs(t0*(.15+u*.85)),1.7)*(1-u*.98)])}return pts});
    // small islet with palms + sea arch
    P.islet=[W*.9,W*.055,7*k];P.arch=[W*.76,10*k,8*k];
    // near headland on the left: cliff + tree canopy
    P.head=[[0,hz]];P.can=[];for(let px=0;px<=W*.37;px+=4){const q=px/(W*.37),h=(62*(1-q)*(1-q*.35)+8+n1(q,9,23,57)*5)*k*(q>.92?(1-q)/.08:1);P.head.push([px,hz-h]);if(px%12===0&&q<.9)P.can.push([px+R(-3,3),hz-h+R(-2,1)*k,(3.5+Math.random()*5)*k])}P.head.push([W*.37,hz]);
    // village lights at the cliff foot and on the island shore
    P.lights=[];for(let n=0;n<9;n++)P.lights.push([W*(.05+Math.random()*.25),hz-R(1,10)*k,R(0,6)]);for(let n=0;n<6;n++)P.lights.push([vc+R(-.8,.8)*vw,hz-R(.5,3)*k,R(0,6)]);
    ISL=P}
  const poly=pts=>{x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(let n=1;n<pts.length;n++)x.lineTo(pts[n][0],pts[n][1]);x.closePath();x.fill()};
  function headlands(col){if(!ISL)islBuild();const P=ISL,hzc=PAL.hz,day=1-dark;
    x.fillStyle=mixc(col,hzc,.62);poly(P.far);
    // volcano with a soft vertical tone and sunlit rim
    {const[vc,vh,vw]=P.vc,g=x.createLinearGradient(0,hz-vh,0,hz);g.addColorStop(0,mixc(col,hzc,.28+.1*day));g.addColorStop(1,mixc(col,hzc,.5));x.fillStyle=g;poly(P.vol);
     x.strokeStyle=`rgba(0,0,0,${.12+.1*dark})`;x.lineWidth=1.2*k;for(const r of P.ridges){x.beginPath();x.moveTo(r[0][0],r[0][1]);for(const q of r)x.lineTo(q[0],q[1]);x.stroke()}
     if(day>.2){const side=sunX<vc?-1:1;x.save();x.beginPath();x.moveTo(P.vol[0][0],P.vol[0][1]);for(const q of P.vol)x.lineTo(q[0],q[1]);x.closePath();x.clip();const lg=x.createLinearGradient(vc+side*vw,0,vc,0);lg.addColorStop(0,`rgba(255,240,210,${.18*day})`);lg.addColorStop(1,'rgba(255,240,210,0)');x.fillStyle=lg;x.fillRect(vc-vw,hz-vh,vw*2,vh);x.restore()}
     // a lazy plume from the crater
     x.save();for(let n=0;n<6;n++){const q=((t*.04+n/6)%1),px=vc+Math.sin(q*3+n)*6*k+q*24*k,py=hz-vh-q*36*k,r=(4+q*14)*k;x.fillStyle=`rgba(${PAL.cloud},${.16*(1-q)*(.5+.5*day)})`;x.beginPath();x.arc(px,py,r,0,7);x.fill()}x.restore()}
    // sea arch rock
    {const[ax,ah,aw]=P.arch;x.fillStyle=mixc(col,hzc,.25);x.beginPath();x.moveTo(ax-aw,hz);x.lineTo(ax-aw*.85,hz-ah*.8);x.quadraticCurveTo(ax-aw*.6,hz-ah*1.15,ax,hz-ah);x.quadraticCurveTo(ax+aw*.7,hz-ah*1.05,ax+aw*.8,hz-ah*.55);x.lineTo(ax+aw*.9,hz);x.lineTo(ax+aw*.35,hz);x.quadraticCurveTo(ax,hz-ah*.6,ax-aw*.35,hz);x.closePath();x.fill()}
    // islet with palms
    {const[ix,iw,ih]=P.islet,c2=mixc(col,hzc,.18);x.fillStyle=c2;x.beginPath();x.ellipse(ix,hz,iw,ih,0,Math.PI,0);x.fill();x.strokeStyle=c2;x.lineCap='round';
     [[-.35,1,-.12],[.1,1.25,.1],[.45,.85,.2]].forEach(([o,hgt,lean],n)=>{const bx=ix+o*iw,by=hz-ih*.7,tx=bx+lean*20*k,ty=by-hgt*22*k;x.lineWidth=1.6*k;x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo(bx+lean*4*k,(by+ty)/2,tx,ty);x.stroke();
       x.lineWidth=1.3*k;const sw=Math.sin(t*1.2+n)*.08;for(let f=0;f<6;f++){const an=-Math.PI*(.05+f*.18)+sw,len=(9+(f%2)*2)*k;x.beginPath();x.moveTo(tx,ty);x.quadraticCurveTo(tx+Math.cos(an)*len*.6,ty+Math.sin(an)*len*.6-2*k,tx+Math.cos(an)*len,ty+Math.sin(an)*len*.4+4*k);x.stroke()}})}
    // near headland with canopy
    x.fillStyle=col;poly(P.head);for(const[cx,cy,r]of P.can){x.beginPath();x.arc(cx,cy+r*.3,r,0,7);x.fill()}
    if(day>.3){x.fillStyle=`rgba(255,240,210,${.06*day})`;for(const[cx,cy,r]of P.can){x.beginPath();x.arc(cx-r*.3,cy,r*.6,0,7);x.fill()}}
    // night lights
    if(dark>.35){x.save();x.globalCompositeOperation='lighter';for(const[lx,ly,ph]of P.lights){const a=(dark-.35)/.65*(.65+.35*Math.sin(t*1.7+ph));glow(lx,ly,5*k,`rgba(255,200,120,${.5*a})`);x.fillStyle=`rgba(255,226,170,${a})`;x.fillRect(lx-.7,ly-.7,1.6,1.6)}x.restore()}}
  /* v174 町づくり：島の お店（さりげなく 遠景に） */
  function townDraw(){const lv=(S.town&&S.town.lv)||0,stars=(S.town&&S.town.stars)||[];if(!lv&&!stars.length)return;if(!ISL)islBuild();const P=ISL,[vc,vh,vw]=P.vc,s=k,day=1-dark,hzc=PAL.hz;
    const wall=mixc(mixc('#f2e8d6',hzc,.42),mixc(PAL.head,hzc,.22),Math.min(1,dark*1.15)),wall2=mixc(wall,'#000000',.12),roof=c=>mixc(mixc(c,hzc,.5),mixc(PAL.head,hzc,.18),Math.min(1,dark*1.15));
    const R=(px,py,w,h,c)=>{x.fillStyle=c;x.fillRect(px,py,w,h)};const lit=dark>.3?Math.min(1,(dark-.3)/.5):0;
    const win=(px,py,w,h,ph)=>{if(lit>0){const a=lit*(.75+.25*Math.sin(t*1.3+ph));x.fillStyle=`rgba(255,214,140,${a})`;x.fillRect(px,py,w,h)}else{x.fillStyle=`rgba(40,55,80,${.28*day})`;x.fillRect(px,py,w,h)}};
    const halo=(px,py,r,a)=>{if(lit>0){x.save();x.globalCompositeOperation='lighter';glow(px,py,r,`rgba(255,200,120,${a*lit})`);x.restore()}};
    const headY=px=>{let best=hz,bd=1e9;for(const[qx,qy]of P.head){const d=Math.abs(qx-px);if(d<bd){bd=d;best=qy}}return best};
    x.save();
    // 1 カフェ：岬の ふもと
    if(lv>=1){const cx=W*.318,by=hz;R(cx-5*s,by-4.6*s,10*s,4.6*s,wall);x.fillStyle=roof('#e8785a');x.beginPath();x.moveTo(cx-6.2*s,by-4.2*s);x.lineTo(cx-5*s,by-6.4*s);x.lineTo(cx+5*s,by-6.4*s);x.lineTo(cx+6.2*s,by-4.2*s);x.fill();
      if(day>.3){x.fillStyle=`rgba(255,255,255,${.22*day})`;for(let i=0;i<4;i++)x.fillRect(cx-4.6*s+i*2.6*s,by-6.2*s,1.1*s,1.9*s)}
      win(cx-3.6*s,by-3.2*s,1.6*s,1.8*s,0);win(cx-.8*s,by-3.2*s,1.6*s,1.8*s,1);win(cx+2*s,by-3.2*s,1.6*s,1.8*s,2);
      x.strokeStyle=roof('#7a5a3a');x.lineWidth=.6*s;x.beginPath();x.moveTo(cx+8*s,by);x.lineTo(cx+8*s,by-4.4*s);x.stroke();x.fillStyle=roof('#3ec0b8');x.beginPath();x.arc(cx+8*s,by-4.2*s,2.4*s,Math.PI,0);x.fill();
      if(lit>0){for(let i=0;i<7;i++){const q=i/6,lx=cx-6*s+q*14*s,ly=by-7*s+Math.sin(q*Math.PI)*-1.2*s+q*2.4*s;x.fillStyle=`rgba(255,${200+i*6},150,${lit*(.55+.45*Math.sin(t*2+i))})`;x.fillRect(lx-.4,ly-.4,1.1,1.1)}halo(cx,by-3*s,9*s,.22)}}
    // 2 宝石店：火山島の 西の 浜
    if(lv>=2){const jx=vc-vw*.62,by=hz;R(jx-3.6*s,by-5.4*s,7.2*s,5.4*s,wall);x.fillStyle=roof('#8a6ad8');x.beginPath();x.arc(jx,by-5.4*s,2.7*s,Math.PI,0);x.fill();x.strokeStyle=roof('#8a6ad8');x.lineWidth=.5*s;x.beginPath();x.moveTo(jx,by-8.1*s);x.lineTo(jx,by-10*s);x.stroke();
      win(jx-2.6*s,by-3.8*s,1.5*s,2.4*s,3);win(jx+1.1*s,by-3.8*s,1.5*s,2.4*s,4);
      {const tw=Math.max(0,Math.sin(t*.9))**12;if(tw>.02){const a=(.35+.65*lit)*tw,gx=jx,gy=by-10.2*s,r=(2+3*tw)*s;x.save();x.globalCompositeOperation='lighter';x.strokeStyle=`rgba(200,230,255,${a})`;x.lineWidth=.6;x.beginPath();x.moveTo(gx-r,gy);x.lineTo(gx+r,gy);x.moveTo(gx,gy-r);x.lineTo(gx,gy+r);x.stroke();x.restore()}}
      halo(jx,by-4*s,7*s,.18)}
    // 3 マリーナ：火山島の 東の 入り江
    if(lv>=3){const mx=vc+vw*.6,by=hz;R(mx-4.5*s,by-3.8*s,9*s,3.8*s,wall);x.fillStyle=roof('#4a7ab8');x.beginPath();x.moveTo(mx-5.2*s,by-3.6*s);x.lineTo(mx,by-6.2*s);x.lineTo(mx+5.2*s,by-3.6*s);x.fill();win(mx-1.2*s,by-2.6*s,2.4*s,2.6*s,5);
      [[7,8,1],[10.5,6.5,0],[13.5,9,1]].forEach(([o,hh,sail],n)=>{const bx=mx+o*s,bob=Math.sin(t*1.1+n)*.3*s;x.fillStyle=wall2;x.beginPath();x.ellipse(bx,by-.5*s+bob,2.2*s,.7*s,0,0,Math.PI);x.fill();x.strokeStyle=roof('#555');x.lineWidth=.45*s;x.beginPath();x.moveTo(bx,by-.6*s+bob);x.lineTo(bx,by-hh*s+bob);x.stroke();
        if(sail){x.fillStyle=mixc(mixc('#ffffff',hzc,.4),mixc(PAL.head,hzc,.3),Math.min(1,dark*1.1));x.beginPath();x.moveTo(bx+.3*s,by-hh*s+bob);x.lineTo(bx+.3*s,by-1.5*s+bob);x.lineTo(bx+3*s,by-1.5*s+bob);x.fill()}
        if(lit>0){x.fillStyle=n===1?`rgba(255,90,90,${lit*(.5+.5*Math.sin(t*2.4+n))})`:`rgba(255,255,230,${lit*.8})`;x.fillRect(bx-.5,by-hh*s+bob-.6,1.2,1.2)}});halo(mx,by-2*s,8*s,.2)}
    // 4 ホテル：火山島の ふもと
    if(lv>=4){const hx=vc-vw*.27,by=hz,T=[[16,4.6],[12,4],[8,3.6]];let y=by;T.forEach(([w,h],ti)=>{R(hx-w/2*s,y-h*s,w*s,h*s,ti%2?wall:mixc(wall,'#ffffff',.06*day));R(hx-w/2*s-.4*s,y-h*s-.5*s,(w+.8)*s,.5*s,wall2);
        const cols=Math.floor(w/2);for(let c=0;c<cols;c++)for(let r=0;r<2;r++){const ph=(ti*7+c*3+r*5)%11;const on=lit<=0||((ph*.37+Math.floor(t*.05+ph))%3)>.6;if(on)win(hx-w/2*s+(c*2+.6)*s,y-h*s+(r*1.9+.7)*s,1*s,1*s,ph)}y-=h*s+.5*s});
      x.strokeStyle=roof('#7a5a3a');x.lineWidth=.6*s;x.beginPath();x.moveTo(hx+9.5*s,by);x.quadraticCurveTo(hx+10*s,by-4*s,hx+11*s,by-7*s);x.stroke();x.fillStyle=roof('#3a8a5a');for(let f=0;f<5;f++){const an=-Math.PI*(.1+f*.2);x.beginPath();x.ellipse(hx+11*s+Math.cos(an)*2*s,by-7*s+Math.sin(an)*1*s+1*s,2*s,.6*s,an,0,7);x.fill()}
      halo(hx,by-6*s,14*s,.22)}
    // 5 天文台：岬の てっぺん
    if(lv>=5){const ox=W*.1,oy=headY(ox)+1.2*s;R(ox-2.6*s,oy-3*s,5.2*s,3*s,wall);x.fillStyle=mixc(wall,'#ffffff',.15*day);x.beginPath();x.arc(ox,oy-3*s,3*s,Math.PI,0);x.fill();
      x.strokeStyle=lit>0?`rgba(255,220,150,${.5+.4*lit})`:wall2;x.lineWidth=.7*s;x.beginPath();x.moveTo(ox+.6*s,oy-5.8*s);x.lineTo(ox+1.6*s,oy-3.6*s);x.stroke();
      if(lit>.3){x.save();x.globalCompositeOperation='lighter';const an=-1.2+Math.sin(t*.07)*.25,L=hz*.9,g=x.createLinearGradient(ox,oy-5*s,ox+Math.cos(an)*L,oy-5*s+Math.sin(an)*L);g.addColorStop(0,`rgba(200,220,255,${.06*lit})`);g.addColorStop(1,'rgba(200,220,255,0)');x.fillStyle=g;x.beginPath();x.moveTo(ox+.8*s,oy-5*s);x.lineTo(ox+Math.cos(an-.025)*L,oy-5*s+Math.sin(an-.025)*L);x.lineTo(ox+Math.cos(an+.025)*L,oy-5*s+Math.sin(an+.025)*L);x.closePath();x.fill();x.restore()}
      halo(ox,oy-3*s,6*s,.15)}
    // 6 星降る 宮殿：沖の 小島
    if(lv>=6){const[ix,iw,ih]=P.islet,px=ix-iw*.12,by=hz-ih*.8,gold=mixc(mixc('#ffd24a',hzc,.3),mixc('#8a6a2a',hzc,.3),Math.min(1,dark*.8));
      R(px-4*s,by-3.6*s,8*s,3.6*s,wall);R(px-1.1*s,by-7.6*s,2.2*s,4*s,wall);[[-3.6,3],[3.6,3]].forEach(([o,h])=>{R(px+o*s-.7*s,by-(3.6+h)*s,1.4*s,h*s,wall);x.fillStyle=gold;x.beginPath();x.moveTo(px+o*s-1*s,by-(3.6+h)*s);x.lineTo(px+o*s,by-(3.6+h+2)*s);x.lineTo(px+o*s+1*s,by-(3.6+h)*s);x.fill()});
      x.fillStyle=gold;x.beginPath();x.moveTo(px-1.5*s,by-7.6*s);x.quadraticCurveTo(px-1.6*s,by-9.6*s,px,by-11.2*s);x.quadraticCurveTo(px+1.6*s,by-9.6*s,px+1.5*s,by-7.6*s);x.fill();x.fillRect(px-.2*s,by-13*s,.4*s,2*s);
      win(px-2.8*s,by-2.6*s,1.1*s,1.6*s,6);win(px-.55*s,by-2.6*s,1.1*s,1.6*s,7);win(px+1.7*s,by-2.6*s,1.1*s,1.6*s,8);win(px-.45*s,by-6.4*s,.9*s,1.5*s,9);
      {const tw=.5+.5*Math.sin(t*1.6);x.save();x.globalCompositeOperation='lighter';glow(px,by-13.2*s,(2+tw*2)*s,`rgba(255,230,140,${(.25+.5*lit)*(.6+.4*tw)})`);x.restore()}halo(px,by-5*s,12*s,.26)}
    // 名前を つけた 星
    if(stars.length&&dark>.3){const a=Math.min(1,(dark-.3)/.5);x.textAlign='center';x.font=`${Math.round(8*k)}px "M PLUS Rounded 1c",sans-serif`;
      stars.forEach((st,i)=>{const fr=v=>{const q=Math.sin(v)*43758.5453;return q-Math.floor(q)},sx=W*(.1+.8*fr(st.s*.013+i*7.1)),sy=hz*(.1+.42*fr(st.s*.029+i*3.7)),tw=.7+.3*Math.sin(t*2.2+i*1.7),r=1.5*k*tw;
        x.save();x.globalCompositeOperation='lighter';glow(sx,sy,6*k,`rgba(255,240,200,${.35*a*tw})`);x.strokeStyle=`rgba(255,250,235,${.8*a*tw})`;x.lineWidth=.6;x.beginPath();x.moveTo(sx-r*3,sy);x.lineTo(sx+r*3,sy);x.moveTo(sx,sy-r*3);x.lineTo(sx,sy+r*3);x.stroke();x.fillStyle=`rgba(255,255,245,${a})`;x.beginPath();x.arc(sx,sy,r*.7,0,7);x.fill();x.restore();
        x.fillStyle=`rgba(255,240,210,${.5*a})`;x.fillText(st.n,sx,sy+9*k)})}
    x.restore()}
  /* v190 月面カジノ：背景を 月面に */
  let MOONST=null;
  function moonScene(){if(!(S.moonOn))return;const s=k;
    if(!MOONST||MOONST.w!==W){MOONST={w:W,st:[]};for(let i=0;i<220;i++)MOONST.st.push([Math.random()*W,Math.random()*hz*1.05,Math.random()*1.4+.3,Math.random()*6.28])}
    let g=x.createLinearGradient(0,0,0,hz);g.addColorStop(0,'#02030a');g.addColorStop(.7,'#070a1c');g.addColorStop(1,'#0c1028');x.fillStyle=g;x.fillRect(0,0,W,hz+2);
    for(const[a,b,r,ph]of MOONST.st){const tw=.55+.45*Math.sin(t*1.3+ph);x.fillStyle=`rgba(255,255,255,${.35+.6*tw*(r/1.7)})`;x.fillRect(a,b,r,r)}
    // 地球
    {const ex=W*.74,ey=hz*.36,er=Math.min(W*.16,hz*.24);x.save();glow(ex,ey,er*1.9,'rgba(90,150,255,.18)');
     const eg=x.createRadialGradient(ex-er*.35,ey-er*.35,er*.1,ex,ey,er);eg.addColorStop(0,'#7ec8ff');eg.addColorStop(.6,'#2a6ad8');eg.addColorStop(1,'#0a2a6a');x.fillStyle=eg;x.beginPath();x.arc(ex,ey,er,0,7);x.fill();
     x.beginPath();x.arc(ex,ey,er,0,7);x.clip();x.fillStyle='rgba(80,170,90,.85)';const rot=(t*.01)%1;
     [[-.3,.1,.32,.22],[.25,-.2,.22,.3],[.55,.35,.18,.14],[-.6,-.35,.2,.12],[.05,.5,.26,.12]].forEach(([dx,dy,rw,rh],i)=>{let cx=ex+((dx+rot*2+1)%2-1)*er*1.1;x.beginPath();x.ellipse(cx,ey+dy*er,rw*er,rh*er,i,0,7);x.fill()});
     x.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<5;i++){const yy=ey+(-.7+i*.35)*er,o=((t*.02+i*.3)%2-1)*er;x.beginPath();x.ellipse(ex+o,yy,er*.5,er*.05,0,0,7);x.fill()}
     const sh=x.createLinearGradient(ex-er,ey,ex+er,ey);sh.addColorStop(0,'rgba(0,0,10,0)');sh.addColorStop(.55,'rgba(0,0,10,.1)');sh.addColorStop(1,'rgba(0,0,10,.75)');x.fillStyle=sh;x.fillRect(ex-er,ey-er,er*2,er*2);x.restore()}
    // 月面
    g=x.createLinearGradient(0,hz,0,H);g.addColorStop(0,'#5a5c66');g.addColorStop(.25,'#7a7c86');g.addColorStop(1,'#9a9ca6');x.fillStyle=g;x.fillRect(0,hz,W,H-hz);
    x.fillStyle='#4a4c56';x.beginPath();x.moveTo(0,hz);for(let px=0;px<=W;px+=8){x.lineTo(px,hz-(Math.sin(px*.013)*6+Math.sin(px*.041+1)*3+8)*s*(px<W*.4?1.4:.7))}x.lineTo(W,hz);x.closePath();x.fill();
    if(!MOONST.cr){MOONST.cr=[];for(let i=0;i<26;i++){const yy=hz+Math.pow(Math.random(),1.3)*(H-hz);const r=(4+Math.random()*26)*(.4+(yy-hz)/(H-hz))*s;MOONST.cr.push([Math.random()*W,yy,r])}}
    for(const[a,b,r]of MOONST.cr){x.fillStyle='rgba(40,42,50,.45)';x.beginPath();x.ellipse(a,b,r,r*.35,0,0,7);x.fill();x.fillStyle='rgba(200,202,214,.35)';x.beginPath();x.ellipse(a+r*.15,b+r*.08,r*.82,r*.26,0,0,Math.PI);x.fill()}
    // 地球の 照り返し
    x.fillStyle='rgba(120,170,255,.05)';x.fillRect(0,hz,W,H-hz);
    // 小さな 旗と ドーム
    {const fx2=W*.12,fy=hz+14*s;x.strokeStyle='#ccc';x.lineWidth=1.2*s;x.beginPath();x.moveTo(fx2,fy);x.lineTo(fx2,fy-26*s);x.stroke();x.fillStyle='#ffd23f';x.fillRect(fx2,fy-26*s,14*s,9*s);x.fillStyle='#ff5c8a';x.font=`${8*s}px sans-serif`;x.fillText('★',fx2+3*s,fy-18.5*s)}
    {const dx=W*.86,dy=hz+10*s;x.fillStyle='rgba(220,230,255,.85)';x.beginPath();x.arc(dx,dy,16*s,Math.PI,0);x.fill();x.fillStyle='rgba(255,220,140,.9)';x.fillRect(dx-3*s,dy-7*s,6*s,7*s);glow(dx,dy-6*s,18*s,'rgba(255,220,140,.25)')}
  }
  const docH=()=>{const w=document.querySelector('.wrap');return Math.max(innerHeight,w?Math.ceil(w.getBoundingClientRect().bottom+scrollY):0)};
  function rs(){W=innerWidth;H=docH();DPR=Math.min(1.5,devicePixelRatio||1);DPR=Math.max(.8,Math.min(DPR,Math.sqrt((window._eco?.7e6:1.3e6)/Math.max(1,W*H))));cv.style.width=W+'px';cv.style.height=H+'px';cv.width=W*DPR;cv.height=H*DPR;x.setTransform(DPR,0,0,DPR,0,0);
    const r=$('window').getBoundingClientRect();WL=r.left;WT=r.top+scrollY;WW=r.width||W;WH=Math.max(r.height,120);
    k=Math.max(.5,Math.min(1.05,WH/270));hz=WT+WH*.42;shore=WT+WH*.62;ISL=null;
    build();
    twk=Array.from({length:30},()=>({x:R(0,W),y:R(0,hz*.9),r:R(.8,1.4),p:R(0,6),v:R(.15,.35)}));
    glints=Array.from({length:140},()=>{const f=Math.pow(Math.random(),.9);return{f,g:G(),l:R(.3,1),p:R(0,6),v:R(.25,.6)}});
    foam=Array.from({length:40},()=>({px:R(0,W),o:R(-2,5),w:R(1,3),p:R(0,6)}));
    wet=Array.from({length:14},()=>({g:G(),o:R(2,20),w:R(2,7),p:R(0,6)}));
    clouds=Array.from({length:7},(_,n)=>{const st=n>=5,d=R(.35,1);return{x:R(-.1,1)*W,y:st?hz*R(.78,.92):hz*(.18+.55*(1-d)+R(-.05,.05)),w:(st?R(220,380):R(70,150)*(.6+d*.6))*k,h:(st?R(6,10):R(24,42)*(.6+d*.5))*k,v:R(.015,.04)*(st?.6:(.5+d)),st,seed:Math.random()*1e4|0,d}})}
  const pos=it=>[WL+it.m[0]*WW,WT+it.m[1]*WH];
  const fireP=()=>[WL+WW*.4,Math.min(WT+WH*.94,WT+WH-22*k-10)];
  let LT=1;const LITS=new Set(['ランタン','テント','キャンピングカー','たいまつ','ライトのガーランド']);
  const flick=(s=1)=>.85+.15*Math.sin(t*9*s)*Math.sin(t*5.3*s+1);
  const waveY=px=>shore+Math.sin(t*.35)*9*k+Math.sin(px*.008+t*.6)*5*k+Math.sin(px*.023-t*.9)*2.5*k;
  function cloudCount(h){if(window.CLOUD_TEST!=null)return window.CLOUD_TEST;const d=new Date(),seed=((d.getFullYear()*372+d.getMonth()*31+d.getDate())*2654435761>>>0)%100;
    const base=seed<15?0:seed<45?1.5:seed<82?3:4.6;if(base===0)return 0;const mod=Math.sin((h/24)*Math.PI*2*1.5+seed)*1.3;return Math.max(0,Math.min(5,Math.round(base+mod)))}
  const DPR0=1.5;
  function cloudSprite(c,col){const cw=Math.ceil(c.w*1.3*DPR0),ch=Math.ceil(Math.max(c.h*2.4,20)*DPR0),cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const g=cv.getContext('2d');g.scale(DPR0,DPR0);
    let sd=c.seed;const rnd=()=>{sd=(sd*9301+49297)%233280;return sd/233280};const W0=cw/DPR0,H0=ch/DPR0,base=H0*.62;const[r,gg,b]=col.split(',').map(Number);const sh=`${Math.round(r*.72)},${Math.round(gg*.74)},${Math.round(b*.84)}`;
    if(c.st){for(let i=0;i<14;i++){const px=W0*(.08+.84*rnd()),py=base+(rnd()-.5)*H0*.25,rw=W0*(.12+.2*rnd()),rh=H0*(.08+.1*rnd());const rg=g.createRadialGradient(px,py,0,px,py,rw);rg.addColorStop(0,`rgba(${col},.55)`);rg.addColorStop(1,`rgba(${col},0)`);g.fillStyle=rg;g.save();g.translate(px,py);g.scale(1,rh/rw);g.translate(-px,-py);g.beginPath();g.arc(px,py,rw,0,7);g.fill();g.restore()}return cv}
    const n=12+(rnd()*7|0),puffs=[];for(let i=0;i<n;i++){const u=.1+.8*(i/(n-1))+(rnd()-.5)*.05,mid=Math.pow(1-Math.abs(u-.5)*2,.8),rr=c.h*(.2+.36*mid+rnd()*.16);puffs.push([W0*u,base-rr*.5-mid*c.h*.3*rnd(),rr])}
    const tops=4+(rnd()*5|0);for(let i=0;i<tops;i++){const u=.22+.56*rnd(),mid=1-Math.abs(u-.5)*2,rr=c.h*(.22+.3*rnd()*(.5+mid));puffs.push([W0*u,base-c.h*(.45+.45*mid)-rr*.2,rr])}
    for(let i=0;i<5;i++){const u=.3+.4*rnd();puffs.push([W0*u,base-c.h*(.95+.2*rnd()),c.h*(.12+.12*rnd())])}
    g.save();g.filter='blur(1.2px)';for(const[px,py,rr]of puffs){const rg=g.createRadialGradient(px-rr*.25,py-rr*.35,rr*.1,px,py,rr);rg.addColorStop(0,`rgba(${col},1)`);rg.addColorStop(.75,`rgba(${col},.92)`);rg.addColorStop(1,`rgba(${col},0)`);g.fillStyle=rg;g.beginPath();g.arc(px,py,rr,0,7);g.fill()}
    g.fillStyle=`rgba(${col},.85)`;g.beginPath();g.ellipse(W0*.5,base-c.h*.05,W0*.32,c.h*.18,0,0,7);g.fill();g.restore();
    g.globalCompositeOperation='source-atop';const sg=g.createLinearGradient(0,base-c.h*.9,0,base+c.h*.25);sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(.55,`rgba(${sh},.0)`);sg.addColorStop(1,`rgba(${sh},.75)`);g.fillStyle=sg;g.fillRect(0,0,W0,H0);
    const hl=g.createLinearGradient(0,base-c.h*1.2,0,base-c.h*.3);hl.addColorStop(0,'rgba(255,255,255,.35)');hl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=hl;g.fillRect(0,0,W0,H0);
    g.globalCompositeOperation='destination-out';const fg=g.createLinearGradient(0,base,0,H0);fg.addColorStop(0,'rgba(0,0,0,0)');fg.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=fg;g.fillRect(0,base,W0,H0-base);return cv}
  function sky(){const h=gameHour();PAL=palette(h);dark=darkOf(h);
    let g=x.createLinearGradient(0,0,0,hz);g.addColorStop(0,PAL.top);g.addColorStop(.55,PAL.mid);g.addColorStop(1,PAL.hz);x.fillStyle=g;x.fillRect(0,0,W,hz+2);
    if(dark>.02){x.globalAlpha=dark;x.drawImage(starsCv,0,0,W,H);for(const s of twk){x.globalAlpha=dark*(.55+.35*Math.sin(t*s.v+s.p));x.fillStyle='#fff';x.beginPath();x.arc(s.x,s.y,s.r,0,7);x.fill()}x.globalAlpha=1}
    // sun: rises at 6, sets at 18
    const ps=(h-6)/12;sunUp=Math.sin(Math.max(0,Math.min(1,ps))*Math.PI);sunX=WL+WW*(.08+.84*ps);sunY=hz-Math.sin(ps*Math.PI)*hz*.82+(ps<0||ps>1?40*k:0);
    if(ps>-.06&&ps<1.06){const low=1-Math.min(1,sunUp*2.2),sr=17*k;x.save();x.globalCompositeOperation='lighter';
      glow(sunX,sunY,sr*14,`rgba(255,${200-low*80|0},${150-low*90|0},${.22+.15*low})`);glow(sunX,sunY,sr*4,`rgba(255,${240-low*60|0},${200-low*120|0},.45)`);x.restore();
      x.fillStyle=low>.4?mixc('#fff4c8','#ff9a50',Math.min(1,(low-.4)/.6)):'#fffbe8';x.beginPath();x.arc(sunX,sunY,sr,0,7);x.fill()}
    // moon: rises at 18, sets at 6
    const pm=((h-18+24)%24)/12;moonUp=pm<=1?Math.sin(pm*Math.PI):0;const mX=WL+WW*(.1+.8*pm),mY=hz-Math.sin(Math.min(1,pm)*Math.PI)*hz*.78+(pm>1?60*k:0);
    if(pm<1.04&&dark>.05){x.save();x.globalAlpha=Math.min(1,dark*1.3);g=x.createRadialGradient(mX,mY,0,mX,mY,moonR*9);g.addColorStop(0,'rgba(255,245,220,.28)');g.addColorStop(.25,'rgba(200,210,255,.08)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;{const ga=x.globalAlpha;x.globalAlpha=ga*(.12+.88*moonIllum());x.fillRect(mX-moonR*9,mY-moonR*9,moonR*18,moonR*18);x.globalAlpha=ga}
      x.drawImage(moonPh(),mX-moonCv.width/DPR/2,mY-moonCv.height/DPR/2,moonCv.width/DPR,moonCv.height/DPR);x.restore()}
    // light source for reflections: the moon at night, the sun by day
    if(dark>.5){lightX=mX;lightY=mY}else{lightX=sunX;lightY=sunY}moonX=lightX;moonY=Math.max(20,lightY);
    {const ck=PAL.cloud+'|'+Math.round(h*4);const cn=cloudCount(h);clouds.forEach((c,i)=>{const want=(c.st?(i-5)<Math.round(cn*.3):i<Math.min(5,cn))?1:0;c.vis=(c.vis??want)+(want-(c.vis??want))*.004});for(const c of clouds){if(c.vis<.01){c.x+=c.v;if(c.x-c.w*.6>W)c.x=-c.w*.6;continue}c.x+=c.v;if(c.x-c.w*.6>W){c.x=-c.w*.6;c.seed=Math.random()*1e4|0;c.spr=null}
      if(!c.spr||c.key!==ck){c.spr=cloudSprite(c,PAL.cloud);c.key=ck}const near=Math.max(0,1-Math.abs(c.x-lightX)/(W*.5));
      x.save();x.globalAlpha=Math.min(1,PAL.cA*(1.15+near*.35)*(c.st?.8:1.25))*c.vis;x.drawImage(c.spr,c.x-c.spr.width/2/DPR0,c.y-c.spr.height*.62/DPR0,c.spr.width/DPR0,c.spr.height/DPR0);x.restore()}}
    headlands(PAL.head);try{townDraw()}catch(e){}
    const top=shore-20*k;g=x.createLinearGradient(0,top,0,H);g.addColorStop(0,PAL.sandT);g.addColorStop(1,PAL.sandB);x.fillStyle=g;x.fillRect(0,top,W,H-top);x.drawImage(sandCv,0,0,W,H)}
  function sea(){const SH=shore-hz,day=Math.max(0,1-dark*1.6)*Math.min(1,(typeof sunUp==='number'?sunUp:1)*1.8);
    x.beginPath();x.moveTo(0,hz);x.lineTo(W,hz);for(let px=W;px>=-10;px-=10)x.lineTo(px,waveY(px));x.closePath();
    {const g=x.createLinearGradient(0,hz,0,shore+15*k);g.addColorStop(0,mixc(PAL.seaT,PAL.hz,.45));g.addColorStop(.12,mixc(PAL.seaT,PAL.hz,.12));g.addColorStop(.45,PAL.seaT);g.addColorStop(.8,mixc(PAL.seaT,PAL.seaB,.55));g.addColorStop(1,PAL.seaB);x.fillStyle=g;x.fill()}
    x.save();x.clip();
    // deep colour bands far out, shallow emerald near the beach
    {const g=x.createLinearGradient(0,hz,0,shore);g.addColorStop(0,'rgba(10,30,70,0)');g.addColorStop(.35,`rgba(8,30,80,${.12+.05*day})`);g.addColorStop(.62,'rgba(8,30,80,0)');x.fillStyle=g;x.fillRect(0,hz,W,SH)}
    {const sh=SH*.5,tq=x.createLinearGradient(0,shore-sh,0,shore+6*k);tq.addColorStop(0,'rgba(60,200,200,0)');tq.addColorStop(.5,`rgba(60,200,195,${.16*day+.02})`);tq.addColorStop(.85,`rgba(110,230,210,${.36*day+.04})`);tq.addColorStop(1,`rgba(180,245,225,${.5*day+.05})`);x.fillStyle=tq;x.fillRect(0,shore-sh,W,sh+20*k)}
    // sky reflected near the horizon + a soft haze line
    {const rg=x.createLinearGradient(0,hz,0,hz+SH*.4);rg.addColorStop(0,PAL.hz+'66');rg.addColorStop(1,PAL.hz+'00');x.fillStyle=rg;x.fillRect(0,hz,W,SH*.4);x.fillStyle=`rgba(255,255,255,${.16*day+.05})`;x.fillRect(0,hz,W,.9*k)}
    // soft rolling swells: shaded troughs + lit crests (no hard bands)
    for(let n=0;n<8;n++){const f=(n+.5)/8,y=hz+SH*Math.pow(f,1.7),amp=(.6+f*4)*k,fr=.008+f*.006,sp=t*(.35+f*.5)+n*1.7,th=(2+f*9)*k;
      x.beginPath();for(let px=0;px<=W+16;px+=16)x.lineTo(px,y+Math.sin(px*fr+sp)*amp);for(let px=W+16;px>=0;px-=16)x.lineTo(px,y+th+Math.sin(px*fr+sp)*amp);x.closePath();
      const sg=x.createLinearGradient(0,y-amp,0,y+th+amp);sg.addColorStop(0,`rgba(0,15,45,${.1+f*.05})`);sg.addColorStop(1,'rgba(0,15,45,0)');x.fillStyle=sg;x.fill();
      x.strokeStyle=`rgba(255,255,255,${(.035+f*.06)*(.5+day*.6)})`;x.lineWidth=(.5+f*1.1)*k;x.beginPath();for(let px=0;px<=W+16;px+=16)x.lineTo(px,y-1*k+Math.sin(px*fr+sp)*amp);x.stroke()}
    // fine ripple texture in perspective
    {if(!window._seaTex){const c=document.createElement('canvas');c.width=512;c.height=128;const g2=c.getContext('2d');g2.lineCap='round';
       for(let i=0;i<520;i++){const xx=Math.random()*512,yy=4+Math.random()*120,l=14+Math.random()*46,a=Math.random()*1.6+.8;for(const dx of [0,-512,512]){
         g2.strokeStyle=`rgba(0,25,55,${.06+Math.random()*.07})`;g2.lineWidth=1.6+Math.random()*1.4;g2.beginPath();g2.moveTo(xx+dx,yy+1.4);g2.bezierCurveTo(xx+dx+l*.3,yy+1.4-a,xx+dx+l*.7,yy+1.4-a,xx+dx+l,yy+1.4);g2.stroke();
         g2.strokeStyle=`rgba(255,255,255,${.05+Math.random()*.08})`;g2.lineWidth=.8+Math.random()*.7;g2.beginPath();g2.moveTo(xx+dx+l*.1,yy);g2.bezierCurveTo(xx+dx+l*.35,yy-a,xx+dx+l*.65,yy-a,xx+dx+l*.9,yy);g2.stroke()}}window._seaTex=c}
     const T=window._seaTex,bands=12;for(let i=0;i<bands;i++){const f0=i/bands,f1=(i+1)/bands,y0=hz+SH*f0*f0,y1=hz+SH*f1*f1,sc=.25+f1*2.2,tw=512*sc,off=(t*(2+f1*9)+i*57)%tw;x.globalAlpha=(.18+f1*.32)*(dark>.5?.55:1);for(let xx=-off;xx<W;xx+=tw)x.drawImage(T,0,(i*37)%96,512,32,xx,y0,tw+1,y1-y0+1)}x.globalAlpha=1}
    // light path (sun / moon): soft banded glow, bloom on the horizon, shimmering glints
    x.globalCompositeOperation='lighter';
    const GL=dark>.5?'255,236,190':(sunUp<.35?'255,170,100':'255,255,245'),GA=dark>.5?moonUp*.9+.1:Math.max(.25,sunUp);
    {const bx=moonX,br=60*k,bg2=x.createRadialGradient(bx,hz,0,bx,hz,br);bg2.addColorStop(0,`rgba(${GL},${.35*GA})`);bg2.addColorStop(1,`rgba(${GL},0)`);x.save();x.translate(bx,hz);x.scale(1,.25);x.translate(-bx,-hz);x.fillStyle=bg2;x.fillRect(bx-br,hz-br,br*2,br*2);x.restore()}
    for(let i=0;i<12;i++){const f0=i/12,f1=(i+1)/12,y0=hz+SH*f0,y1=hz+SH*f1,hw=(4+f1*100)*k,hg=x.createLinearGradient(moonX-hw,0,moonX+hw,0);hg.addColorStop(0,`rgba(${GL},0)`);hg.addColorStop(.5,`rgba(${GL},${(.17-.11*f0)*GA})`);hg.addColorStop(1,`rgba(${GL},0)`);x.fillStyle=hg;x.fillRect(moonX-hw,y0,hw*2,y1-y0+.5)}
    for(const q of glints){const y=hz+SH*q.f,spread=6*k+q.f*q.f*95*k,px=moonX+q.g*spread+Math.sin(t*.3+q.p)*3*k,l=(1.5+q.f*12*q.l)*k,tw=.5+.5*Math.sin(t*q.v*1.6+q.p);
      x.globalAlpha=(.15+.3*tw)*(1-q.f*.35)*GA;x.fillStyle=`rgb(${GL})`;x.fillRect(px-l/2,y,l,Math.max(.6,q.f*1.4*k));if(tw>.93&&q.f>.25){x.globalAlpha=(tw-.93)/.07*.8*GA;glow(px,y,l*.7,`rgba(${GL},.6)`)}}
    x.globalAlpha=1;
    // twinkling sun sparkles scattered over the water (and golden ones as an omen)
    {const om=window._seaOmen&&performance.now()<window._seaOmen?1:0;if(day>.15||om){if(!window._seaSp)window._seaSp=Array.from({length:110},()=>({u:Math.random(),f:.08+Math.random()*.92,p:Math.random()*7,v:.8+Math.random()*2.2}));
      for(const q of window._seaSp){const w2=Math.max(0,Math.sin(t*q.v+q.p)),th=om?.55:.9;if(w2<th)continue;const y=hz+SH*q.f*q.f,xx=W*((q.u+t*.003*q.v)%1),r=(.5+q.f*1.3)*k*(om?1.6:1),al=(w2-th)/(1-th)*(om?1:day*.8);
        glow(xx,y,r*3,om?`rgba(255,220,120,${al*.6})`:`rgba(255,255,255,${al*.45})`);x.globalAlpha=al;x.fillStyle=om?'#fff2b0':'#ffffff';x.fillRect(xx-r*1.6,y-.35,r*3.2,.7)}x.globalAlpha=1}}
    x.globalCompositeOperation='source-over';x.restore();
    // incoming wave: a translucent rolling crest with a soft shadow in front
    {const wy=px=>waveY(px)-(12+Math.sin(t*.7)*4)*k+Math.sin(px*.015-t)*2*k;
      x.beginPath();for(let px=0;px<=W+10;px+=10)x.lineTo(px,wy(px));for(let px=W+10;px>=0;px-=10)x.lineTo(px,wy(px)+5*k);x.closePath();const cg=x.createLinearGradient(0,shore-20*k,0,shore);cg.addColorStop(0,`rgba(160,235,230,${.12+.12*day})`);cg.addColorStop(1,'rgba(160,235,230,0)');x.fillStyle=cg;x.fill();
      x.strokeStyle=`rgba(240,250,255,${.25+.1*day})`;x.lineWidth=1.3*k;x.beginPath();for(let px=0;px<=W+10;px+=10)x.lineTo(px,wy(px));x.stroke()}
    // swash: a thin sheet of water sliding up the sand, then wet sand behind it
    {const sw=(Math.sin(t*.35)*.5+.5)*10*k,ed=px=>waveY(px)+sw*(.6+.4*Math.sin(px*.02+t*.3));
      const wg=x.createLinearGradient(0,shore,0,shore+30*k);{const wc=dark>.5?'12,14,34':'110,85,60';wg.addColorStop(0,`rgba(${wc},${.3+.25*dark})`);wg.addColorStop(1,`rgba(${wc},0)`)}x.fillStyle=wg;x.beginPath();for(let px=0;px<=W+10;px+=10)x.lineTo(px,waveY(px));x.lineTo(W,shore+32*k);x.lineTo(0,shore+32*k);x.fill();
      x.beginPath();for(let px=0;px<=W+10;px+=8)x.lineTo(px,waveY(px)-1);for(let px=W+10;px>=0;px-=8)x.lineTo(px,ed(px));x.closePath();x.fillStyle=`rgba(${dark>.5?'120,150,210':'150,225,225'},${.22+.1*day})`;x.fill();
      x.strokeStyle=`rgba(250,252,255,${.22+.1*day})`;x.lineWidth=.9*k;x.beginPath();for(let px=0;px<=W+10;px+=8)x.lineTo(px,ed(px)+Math.sin(px*.21+t*.8)*.6*k);x.stroke();for(let i=0;i<W/7;i++){const px=i*7,h=Math.sin(i*12.9898+Math.floor(t*.5+i*.01)*78.233)*43758.5453%1;if(Math.abs(h)<.45)continue;const fl=.5+.5*Math.sin(t*1.3+i);x.fillStyle=`rgba(255,255,255,${(.18+.25*Math.abs(h))*fl*(.6+.4*day)})`;x.beginPath();x.ellipse(px,ed(px)-Math.abs(h)*2*k,(1+Math.abs(h)*2.2)*k,.7*k,0,0,7);x.fill()}}
    x.globalCompositeOperation='lighter';for(const q of wet){const px=moonX+q.g*40*k,y=waveY(px)+q.o*k+6*k;x.globalAlpha=.12+.08*Math.sin(t*.4+q.p);x.fillStyle='#ffe9b8';x.fillRect(px,y,q.w*k,.8)}x.globalAlpha=1;x.globalCompositeOperation='source-over';
    x.strokeStyle='rgba(240,245,255,.55)';x.lineWidth=1.8*k;x.beginPath();for(let px=0;px<=W+10;px+=8)x.lineTo(px,waveY(px)+Math.sin(px*.21+t*.8)*.6*k);x.stroke();
    for(const q of foam){x.fillStyle=`rgba(240,245,255,${.2+.12*Math.sin(t*.5+q.p)})`;x.beginPath();x.ellipse(q.px,waveY(q.px)+q.o*k,q.w*k,.8*k,0,0,7);x.fill()}}
  let fireLv=1,fireT=1;
  function fire(){fireLv+=(fireT-fireLv)*.025;if(Math.abs(fireT-fireLv)<.002)fireLv=fireT;const k0=k;k=k*.72*(shows.some(s=>s.name==='bigfire')?1.7:1);const[fx,fy]=fireP(),f=flick();
    x.globalCompositeOperation='lighter';{const FG=.3+.7*dark;if(fireLv>.01){const FPg=(window.FIREPAL||{}).g||['255,115,35','255,165,70'];glow(fx,fy-12*k,320*k*f,`rgba(${FPg[0]},${.3*FG*fireLv})`);glow(fx,fy-24*k,120*k*f,`rgba(${FPg[1]},${.3*FG*fireLv})`)}}x.globalCompositeOperation='source-over';
    // stones lit from inside
    for(let n=0;n<10;n++){const a=n/10*Math.PI*2,sx=fx+Math.cos(a)*32*k,sy=fy+Math.sin(a)*9*k+2*k;x.fillStyle='#2b2228';x.beginPath();x.ellipse(sx,sy,9*k,6.5*k,0,0,7);x.fill();
      x.fillStyle=`rgba(255,140,70,${(.25+.15*f)*fireLv})`;x.beginPath();x.ellipse(sx-Math.cos(a)*2*k,sy-2.5*k,6*k,2.4*k,0,0,7);x.fill()}
    // logs with glowing cracks
    [[-.5,0],[.5,0],[0,1]].forEach(([r,o])=>{x.save();x.translate(fx,fy-5*k-o*3*k);x.rotate(r+(o?Math.PI/2*.08:0));x.fillStyle='#24160f';x.beginPath();x.roundRect(-30*k,-5*k,60*k,10*k,5*k);x.fill();
      x.fillStyle=`rgba(255,${90+60*f|0},30,${(.55+.3*f)*Math.max(fireLv,fireT?0:.0)})`;for(let q=-2;q<=2;q++)x.fillRect(q*9*k-2*k,-1*k,4*k,1.6*k);x.restore()});
    if(!still){for(let n=0;n<Math.round(6*fireLv);n++)flames.push({x:fx+G()*12*k,y:fy-6*k,vx:G()*.25,vy:-R(1.4,2.8)*k,l:1,d:R(.02,.04),s:R(9,16)*k});
      if(Math.random()<(fireT?.14*fireLv:(fireLv>.03?.5:.03)))smoke.push({x:fx+G()*8*k,y:fy-55*k,vx:R(.1,.35),vy:-R(.4,.8)*k,l:1,s:R(8,14)*k});
      if(Math.random()<.4*fireLv)embers.push({x:fx+G()*14*k,y:fy-20*k,vx:G()*.6,vy:-R(1,2.6)*k,l:1})}
    smoke=smoke.filter(p=>p.l>0);for(const p of smoke){p.x+=p.vx+Math.sin(t+p.y*.02)*.2;p.y+=p.vy;p.s+=.25*k;p.l-=.009;const g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s);g.addColorStop(0,`rgba(140,134,150,${p.l*.07})`);g.addColorStop(1,'rgba(140,134,150,0)');x.fillStyle=g;x.fillRect(p.x-p.s,p.y-p.s,p.s*2,p.s*2)}
    x.globalCompositeOperation='lighter';
    flames=flames.filter(p=>p.l>0);for(const p of flames){p.x+=p.vx+Math.sin(t*7+p.y*.06)*.35+(fx-p.x)*.012;p.y+=p.vy;p.vy*=.995;p.l-=p.d;p.s*=.975;
      const FP=(window.FIREPAL&&window.FIREPAL.f)||['255,214,120','255,165,50','240,95,22','170,38,10'];const c=p.l>.8?FP[0]:p.l>.55?FP[1]:p.l>.3?FP[2]:FP[3];const g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s);g.addColorStop(0,`rgba(${c},${p.l*.34})`);g.addColorStop(1,`rgba(${c},0)`);x.fillStyle=g;x.fillRect(p.x-p.s,p.y-p.s,p.s*2,p.s*2)}
    glow(fx,fy-8*k,22*k,`rgba(${((window.FIREPAL||{}).c)||'255,200,110'},.35)`);
    embers=embers.filter(e=>e.l>0);for(const e of embers){e.x+=e.vx+Math.sin(t*3+e.y*.05)*.3;e.y+=e.vy;e.vy*=.995;e.l-=.01;x.globalAlpha=e.l;x.fillStyle=((window.FIREPAL||{}).e)||'#ffb347';x.fillRect(e.x,e.y,1.6*k,1.6*k)}
    x.globalAlpha=1;x.globalCompositeOperation='source-over';k=k0}
  /* ---------- beach items: painted with shading and firelight ---------- */
  const lit=px=>{const[fx]=fireP();return fx>=px?1:-1};
  function shadowE(cx,cy,rx,ry,a=.42){x.save();x.translate(cx,cy);x.scale(1,ry/rx);const g=x.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,rx,0,7);x.fill();x.restore()}
  function pool(cx,cy,r,col){x.save();x.globalCompositeOperation='lighter';x.translate(cx,cy);x.scale(1,.3);glow(0,0,r,col);x.restore()}
  function hgrad(x0,x1,stops){const g=x.createLinearGradient(x0,0,x1,0);stops.forEach(([o,c])=>g.addColorStop(o,c));return g}
  function vgrad(y0,y1,stops){const g=x.createLinearGradient(0,y0,0,y1);stops.forEach(([o,c])=>g.addColorStop(o,c));return g}
  const DRAW={
    'ながれぎの ベンチ'(px,py){const s=k*1.1,L=lit(px);shadowE(px+4*s,py+1*s,62*s,8*s);
      x.save();x.translate(px,py-9*s);x.rotate(-.035);
      // a slightly bent, tapering log (thicker at the right end)
      const top=u=>-(lerp(7.5,9.5,u))*s-Math.sin(u*Math.PI)*1.6*s,bot=u=>lerp(7.5,9.5,u)*s-Math.sin(u*Math.PI)*1.6*s,X=u=>lerp(-54,48,u)*s;
      x.beginPath();x.moveTo(X(0),top(0));for(let u=0;u<=1.001;u+=.05)x.lineTo(X(u),top(u)+Math.sin(u*31)*.35*s);for(let u=1;u>=-.001;u-=.05)x.lineTo(X(u),bot(u));
      x.quadraticCurveTo(X(0)-5*s,0,X(0),top(0));x.closePath();
      x.fillStyle=vgrad(-10*s,10*s,[[0,'#a88262'],[.3,'#7a5a3f'],[.7,'#5a412d'],[1,'#22160f']]);x.fill();
      x.save();x.clip();
      x.fillStyle=hgrad(-54*s,48*s,L>0?[[0,'rgba(255,140,60,0)'],[1,'rgba(255,140,60,.28)']]:[[0,'rgba(255,140,60,.28)'],[1,'rgba(255,140,60,0)']]);x.fillRect(-60*s,-12*s,116*s,24*s);
      // weathered, sun‑bleached patch on top
      x.fillStyle='rgba(225,205,175,.22)';x.beginPath();x.ellipse(-8*s,-6.5*s,30*s,2.4*s,0,0,7);x.fill();
      // bark grain that follows the bend
      x.lineWidth=.8;for(let i=0;i<8;i++){const f=-.8+i*.22;x.strokeStyle=i<2?'rgba(255,225,190,.2)':'rgba(25,15,8,.38)';x.beginPath();for(let u=0;u<=1.001;u+=.04){const yy=lerp(top(u),bot(u),(f+1)/2)+Math.sin(u*7+i*1.3)*.5*s;u?x.lineTo(X(u),yy):x.moveTo(X(u),yy)}x.stroke()}
      // a long crack
      x.strokeStyle='rgba(20,12,6,.65)';x.lineWidth=1;x.beginPath();x.moveTo(-30*s,-2*s);x.lineTo(-18*s,-1*s);x.lineTo(-10*s,-2.2*s);x.lineTo(2*s,-1.4*s);x.stroke();
      x.restore();
      x.strokeStyle='rgba(255,220,180,.2)';x.lineWidth=1;x.beginPath();for(let u=.02;u<=.95;u+=.04){const yy=top(u)+1.4*s;u>.03?x.lineTo(X(u),yy):x.moveTo(X(u),yy)}x.stroke();
      // knots
      [[-26,-1,4],[16,2,3.2]].forEach(([a,b,r])=>{x.fillStyle='#2e1e14';x.beginPath();x.ellipse(a*s,b*s,r*s,r*.7*s,0,0,7);x.fill();x.strokeStyle='rgba(160,120,80,.55)';x.lineWidth=.8;x.beginPath();x.ellipse(a*s,b*s,r*.6*s,r*.4*s,0,0,7);x.stroke();x.beginPath();x.ellipse(a*s,b*s,r*1.5*s,r*1.05*s,0,0,7);x.strokeStyle='rgba(30,18,10,.35)';x.stroke()});
      // two broken branch stubs
      [[-18,-.9,12,5],[24,-1.25,8,4]].forEach(([bx,ang,len,w])=>{x.save();x.translate(bx*s,(top((bx+54)/102)/s+1)*s);x.rotate(ang);x.fillStyle='#6e5038';x.beginPath();x.moveTo(-w/2*s,0);x.lineTo(-w*.35*s,-len*s);x.lineTo(w*.35*s,-len*s);x.lineTo(w/2*s,0);x.fill();
        x.fillStyle='#b58a5f';x.beginPath();x.ellipse(0,-len*s,w*.36*s,w*.18*s,0,0,7);x.fill();x.fillStyle='rgba(255,225,190,.25)';x.fillRect(-w*.4*s,-len*s,w*.15*s,len*s);x.restore()});
      // sawn end with rings and a split
      x.fillStyle=vgrad(-10*s,10*s,[[0,'#d8ad7c'],[1,'#8a6440']]);x.beginPath();x.ellipse(48*s,0,6*s,9.6*s,0,0,7);x.fill();
      x.strokeStyle='rgba(110,75,45,.8)';x.lineWidth=.7;for(let r=1;r<6;r++){x.beginPath();x.ellipse(48.4*s,.3*s,r*1.1*s,r*1.8*s,0,0,7);x.stroke()}
      x.strokeStyle='rgba(60,38,20,.9)';x.lineWidth=1;x.beginPath();x.moveTo(48*s,0);x.lineTo(51*s,-5*s);x.lineTo(52.5*s,-8.5*s);x.stroke();
      // ragged left end
      x.fillStyle='#4a3424';x.beginPath();x.moveTo(-54*s,-7*s);x.lineTo(-58*s,-3*s);x.lineTo(-55*s,-1*s);x.lineTo(-59*s,3*s);x.lineTo(-54*s,7*s);x.fill();
      x.restore();
      // sand drifted against it + a shell
      x.fillStyle=dark>.5?'rgba(70,64,84,.5)':'rgba(214,190,145,.55)';x.beginPath();x.ellipse(px-6*s,py+.5*s,50*s,3.2*s,0,Math.PI,0);x.fill();
      x.fillStyle=sil('#f3e2d0');x.beginPath();x.moveTo(px-40*s,py+2*s);x.quadraticCurveTo(px-42*s,py-3*s,px-37.5*s,py-3.3*s);x.quadraticCurveTo(px-33.5*s,py-3*s,px-35*s,py+2*s);x.closePath();x.fill();
      x.strokeStyle='rgba(180,140,110,.7)';x.lineWidth=.5*s;for(let r=-2;r<=2;r++){x.beginPath();x.moveTo(px-37.5*s,py+2*s);x.lineTo(px+(-37.5+r*1.2)*s,py-2.8*s);x.stroke()}},
    'ランタン'(px,py){const s=k*1.2,f=flick(1.3);pool(px,py,80*s*f,'rgba(255,170,70,.45)');shadowE(px+3*s,py+1*s,14*s,3*s,.5);
      x.save();x.globalCompositeOperation='lighter';glow(px,py-17*s,60*s*f,'rgba(255,170,80,.35)');x.restore();
      x.fillStyle=vgrad(py-6*s,py,[[0,'#4a3f38'],[1,'#1a1512']]);x.beginPath();x.moveTo(px-11*s,py);x.lineTo(px+11*s,py);x.lineTo(px+9*s,py-6*s);x.lineTo(px-9*s,py-6*s);x.closePath();x.fill();
      const g=x.createRadialGradient(px,py-15*s,1,px,py-16*s,10*s);g.addColorStop(0,'rgba(255,245,200,1)');g.addColorStop(.45,`rgba(255,${190+40*f|0},100,.95)`);g.addColorStop(1,'rgba(150,80,30,.75)');x.fillStyle=g;
      x.beginPath();x.moveTo(px-6*s,py-6*s);x.bezierCurveTo(px-10*s,py-12*s,px-10*s,py-22*s,px-5*s,py-27*s);x.lineTo(px+5*s,py-27*s);x.bezierCurveTo(px+10*s,py-22*s,px+10*s,py-12*s,px+6*s,py-6*s);x.closePath();x.fill();if(LT<1){x.save();x.globalAlpha*=1-LT;x.fillStyle='#b9c3c6';x.fill();x.restore()}
      x.save();x.globalAlpha*=LT;x.fillStyle='#fff8e0';x.beginPath();x.moveTo(px,py-21*s*f);x.quadraticCurveTo(px+2.5*s,py-14*s,px,py-11*s);x.quadraticCurveTo(px-2.5*s,py-14*s,px,py-21*s*f);x.fill();x.restore();
      x.strokeStyle='#241d19';x.lineWidth=1.3*s;[-7,-2.5,2.5,7].forEach(o=>{x.beginPath();x.moveTo(px+o*s*.85,py-6*s);x.quadraticCurveTo(px+o*s*1.25,py-16*s,px+o*s*.7,py-27*s);x.stroke()});
      x.fillStyle=vgrad(py-34*s,py-26*s,[[0,'#5a4d44'],[1,'#1e1915']]);x.beginPath();x.ellipse(px,py-27*s,8*s,2.4*s,0,0,7);x.fill();x.beginPath();x.moveTo(px-7*s,py-27*s);x.quadraticCurveTo(px,py-36*s,px+7*s,py-27*s);x.fill();
      x.strokeStyle='#2e2621';x.lineWidth=1.2*s;x.beginPath();x.arc(px,py-35*s,6*s,Math.PI*1.05,Math.PI*1.95);x.stroke();
      x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1*s;x.beginPath();x.moveTo(px-6*s,py-10*s);x.quadraticCurveTo(px-8*s,py-17*s,px-4.5*s,py-24*s);x.stroke()},
    'ロッキングチェア'(px,py){const s=k*1.2,a=Math.sin(t*1.1)*.065,Lt=lit(px);shadowE(px+2*s,py+1*s,40*s,5*s,.45);
      x.save();x.translate(px+a*58*s,py);x.rotate(a);x.lineCap='round';x.lineJoin='round';
      const C=dark=>dark?['#24140a','#4a2e18','#6a4426']:['#3a2210','#7a4a22','#b77b42'];
      // tapered, turned wooden member with a highlight and optional beads
      const mem=(ax,ay,bx,by,w0,w1,dk,beads=[])=>{ax*=s;ay*=s;bx*=s;by*=s;const dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,a0=w0*s/2,a1=w1*s/2,c=C(dk);
        x.fillStyle=c[1];x.beginPath();x.moveTo(ax+nx*a0,ay+ny*a0);x.lineTo(bx+nx*a1,by+ny*a1);x.lineTo(bx-nx*a1,by-ny*a1);x.lineTo(ax-nx*a0,ay-ny*a0);x.closePath();x.fill();
        x.strokeStyle=c[0];x.lineWidth=.7*s;x.stroke();
        x.strokeStyle=c[2];x.lineWidth=Math.max(.6,w1*.28)*s;x.beginPath();x.moveTo(ax+nx*a0*.35,ay+ny*a0*.35);x.lineTo(bx+nx*a1*.35,by+ny*a1*.35);x.stroke();
        for(const f of beads){const cx=ax+dx*f,cy=ay+dy*f,w=lerp(a0,a1,f)*1.55;x.fillStyle=c[1];x.beginPath();x.ellipse(cx,cy,w,w*.55,Math.atan2(dy,dx)+Math.PI/2,0,7);x.fill();x.strokeStyle=c[0];x.lineWidth=.6*s;x.stroke();x.fillStyle=c[2];x.beginPath();x.ellipse(cx+nx*w*.3,cy+ny*w*.3,w*.4,w*.2,Math.atan2(dy,dx)+Math.PI/2,0,7);x.fill()}};
      const rocker=(dx,dy,dk)=>{const c=C(dk);const P=()=>{x.beginPath();x.moveTo((-38+dx)*s,(-9+dy)*s);x.quadraticCurveTo((-2+dx)*s,(5.5+dy)*s,(36+dx)*s,(-8+dy)*s)};
        P();x.strokeStyle=c[0];x.lineWidth=5.4*s;x.stroke();P();x.strokeStyle=c[1];x.lineWidth=4*s;x.stroke();
        x.strokeStyle=c[2];x.lineWidth=1.1*s;x.beginPath();x.moveTo((-37+dx)*s,(-10.4+dy)*s);x.quadraticCurveTo((-2+dx)*s,(3.8+dy)*s,(35+dx)*s,(-9.4+dy)*s);x.stroke();
        // scrolled tips
        [[-38,-9],[36,-8]].forEach(([ex,ey])=>{x.fillStyle=c[1];x.beginPath();x.arc((ex+dx)*s,(ey+dy)*s,2.6*s,0,7);x.fill();x.strokeStyle=c[0];x.lineWidth=.7*s;x.stroke()})};
      // ---- far side ----
      rocker(7,-5,true);
      mem(-9,-7,-6,-31,3,2.6,true,[.45]);mem(23,-7,23,-31,3,2.6,true,[.45]);
      mem(-6,-31,-17,-86,3.2,2.4,true,[.3,.62]);x.fillStyle=C(true)[1];x.beginPath();x.arc(-17.3*s,-88*s,2.2*s,0,7);x.fill();
      mem(-12,-53,27,-47,3.2,3.6,true);mem(25,-47,24,-31,2.4,2.2,true,[.5]);
      // back spindles (seen through) + crest rail
      for(let i=0;i<5;i++){const f=i/4;mem(lerp(-14,-8,f),-33,lerp(-25,-18,f),-79,1.9,1.5,i%2===1,[.5])}
      x.fillStyle=C(false)[1];x.beginPath();x.moveTo(-28*s,-78*s);x.quadraticCurveTo(-23*s,-86*s,-16*s,-82*s);x.lineTo(-16.5*s,-78*s);x.quadraticCurveTo(-22*s,-81*s,-27*s,-74*s);x.closePath();x.fill();x.strokeStyle=C(false)[0];x.lineWidth=.7*s;x.stroke();
      x.strokeStyle=C(false)[2];x.lineWidth=.9*s;x.beginPath();x.moveTo(-27*s,-77.5*s);x.quadraticCurveTo(-23*s,-84*s,-17*s,-81*s);x.stroke();
      // ---- woven cane seat ----
      x.save();x.beginPath();x.moveTo(-16*s,-30*s);x.lineTo(21*s,-29*s);x.lineTo(28*s,-33.5*s);x.lineTo(-9*s,-35*s);x.closePath();x.fillStyle='#c9a46a';x.fill();x.clip();
      x.strokeStyle='rgba(110,75,35,.55)';x.lineWidth=.6*s;for(let i=-20;i<40;i+=2.4){x.beginPath();x.moveTo(i*s,-28*s);x.lineTo((i+7)*s,-36*s);x.stroke();x.beginPath();x.moveTo(i*s,-36*s);x.lineTo((i+7)*s,-28*s);x.stroke()}
      x.fillStyle='rgba(255,240,200,.18)';x.fillRect(-16*s,-35*s,44*s,2*s);x.restore();
      mem(-16,-30,21,-29,2.6,2.6,false);
      // seat cushion with ties
      x.fillStyle=vgrad(-40*s,-31*s,[[0,'#4f7f8a'],[1,'#2c4f58']]);x.beginPath();x.moveTo(-12*s,-32*s);x.quadraticCurveTo(6*s,-35*s,24*s,-32.5*s);x.quadraticCurveTo(26*s,-36*s,22*s,-38.5*s);x.quadraticCurveTo(4*s,-41*s,-8*s,-39*s);x.quadraticCurveTo(-14*s,-37*s,-12*s,-32*s);x.fill();
      x.strokeStyle='rgba(220,240,240,.35)';x.lineWidth=.7*s;x.setLineDash([1.6*s,1.4*s]);x.beginPath();x.moveTo(-9*s,-37.5*s);x.quadraticCurveTo(5*s,-39.5*s,21*s,-37*s);x.stroke();x.setLineDash([]);
      x.fillStyle='rgba(255,255,255,.12)';x.beginPath();x.ellipse(5*s,-38*s,11*s,1.4*s,-.05,0,7);x.fill();
      x.strokeStyle='#e8dcc4';x.lineWidth=.8*s;x.beginPath();x.moveTo(-10*s,-35*s);x.lineTo(-13*s,-31*s);x.moveTo(-10*s,-35*s);x.lineTo(-11*s,-30.5*s);x.stroke();
      // ---- near side ----
      rocker(0,0,false);
      mem(-16,-4,-14,-30,3.6,3,false,[.4]);mem(17,-3,16,-29,3.6,3,false,[.4]);
      mem(-14,-30,-25,-83,3.8,2.8,false,[.28,.6]);{const c=C(false);x.fillStyle=c[1];x.beginPath();x.arc(-25.4*s,-85.5*s,2.6*s,0,7);x.fill();x.strokeStyle=c[0];x.lineWidth=.7*s;x.stroke();x.fillStyle=c[2];x.beginPath();x.arc(-26.2*s,-86.4*s,.9*s,0,7);x.fill()}
      mem(18,-43,17,-29,2.8,2.6,false,[.5]);
      // curved armrest with scrolled hand grip
      {const c=C(false);x.beginPath();x.moveTo(-20*s,-50*s);x.quadraticCurveTo(0,-48.5*s,21*s,-43*s);x.strokeStyle=c[0];x.lineWidth=4.8*s;x.stroke();x.beginPath();x.moveTo(-20*s,-50*s);x.quadraticCurveTo(0,-48.5*s,21*s,-43*s);x.strokeStyle=c[1];x.lineWidth=3.6*s;x.stroke();
       x.strokeStyle=c[2];x.lineWidth=1*s;x.beginPath();x.moveTo(-19*s,-51.2*s);x.quadraticCurveTo(0,-49.8*s,21*s,-44.4*s);x.stroke();x.fillStyle=c[1];x.beginPath();x.ellipse(22.5*s,-43.2*s,3*s,2.4*s,.3,0,7);x.fill();x.strokeStyle=c[0];x.lineWidth=.7*s;x.stroke()}
      // knitted throw folded over the armrest
      x.save();x.beginPath();x.moveTo(-4*s,-50.5*s);x.quadraticCurveTo(3*s,-50*s,9*s,-48.5*s);x.lineTo(10.5*s,-36*s);x.quadraticCurveTo(7*s,-33*s,4*s,-35*s);x.quadraticCurveTo(-1*s,-33.5*s,-3*s,-36*s);x.closePath();
      x.fillStyle='#efe3cf';x.fill();x.clip();x.strokeStyle='rgba(170,60,60,.75)';x.lineWidth=1.2*s;for(let i=0;i<3;i++){x.beginPath();x.moveTo(-6*s,(-46+i*4)*s);x.lineTo(12*s,(-45+i*4)*s);x.stroke()}
      x.strokeStyle='rgba(150,130,100,.45)';x.lineWidth=.5*s;for(let i=-4;i<12;i+=1.6){x.beginPath();x.moveTo(i*s,-51*s);x.lineTo((i+.6)*s,-33*s);x.stroke()}x.fillStyle=vgrad(-50*s,-33*s,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.28)']]);x.fillRect(-6*s,-52*s,20*s,20*s);x.restore();
      x.fillStyle='#e8dcc4';for(let i=0;i<5;i++)x.fillRect((-2.5+i*2.6)*s,(-35.5+i*.2+(i%2)*.8)*s,.7*s,2.6*s);
      // warm light from the fire on the side that faces it
      x.save();x.globalCompositeOperation='source-atop';x.restore();
      x.restore();
      x.save();x.globalCompositeOperation='lighter';x.globalAlpha=.5*(LT||0);glow(px+(Lt>0?-14:14)*s,py-40*s,46*s,'rgba(255,140,60,.12)');x.restore()},
    'ギター'(px,py){const s=k*.82,L=lit(px);shadowE(px-38*s,py-10*s,58*s,9*s,.35);x.save();x.translate(px+6*s,py-6*s);x.scale(1,.8);x.rotate(-1.18);
      const outline=()=>{x.beginPath();x.moveTo(0,0);x.bezierCurveTo(11*s,0,17*s,-4*s,17*s,-13*s);x.bezierCurveTo(17*s,-20*s,10.5*s,-22*s,10.5*s,-27*s);x.bezierCurveTo(10.5*s,-31*s,13.5*s,-34*s,13*s,-39*s);x.bezierCurveTo(12.5*s,-45*s,6*s,-47*s,0,-47*s);
        x.bezierCurveTo(-6*s,-47*s,-12.5*s,-45*s,-13*s,-39*s);x.bezierCurveTo(-13.5*s,-34*s,-10.5*s,-31*s,-10.5*s,-27*s);x.bezierCurveTo(-10.5*s,-22*s,-17*s,-20*s,-17*s,-13*s);x.bezierCurveTo(-17*s,-4*s,-11*s,0,0,0);x.closePath()};
      // sides
      x.save();x.translate(-L*1.8*s,1.6*s);outline();x.fillStyle='#4a230d';x.fill();x.restore();
      // sunburst spruce top
      outline();const g=x.createRadialGradient(0,-20*s,2*s,0,-22*s,24*s);g.addColorStop(0,'#fbe2b0');g.addColorStop(.45,'#ebb76c');g.addColorStop(.8,'#a75a22');g.addColorStop(1,'#3d1a08');x.fillStyle=g;x.fill();
      x.save();outline();x.clip();x.strokeStyle='rgba(120,70,30,.12)';x.lineWidth=.5;for(let n=-16;n<=16;n+=2.2){x.beginPath();x.moveTo(n*s,0);x.lineTo(n*s*.98,-47*s);x.stroke()}x.restore();
      outline();x.lineWidth=1.3*s;x.strokeStyle='#f4e8cf';x.stroke();outline();x.lineWidth=.6;x.strokeStyle='#2a1307';x.stroke();
      // pickguard, soundhole, rosette
      x.fillStyle='rgba(60,22,10,.85)';x.beginPath();x.ellipse(6.5*s,-26*s,4.2*s,6.5*s,.35,0,7);x.fill();
      x.fillStyle='#0d0703';x.beginPath();x.arc(0,-31*s,4.8*s,0,7);x.fill();
      x.strokeStyle='#2f1a0c';x.lineWidth=1.4*s;x.beginPath();x.arc(0,-31*s,6.6*s,0,7);x.stroke();x.strokeStyle='#efdcb4';x.lineWidth=.7*s;x.beginPath();x.arc(0,-31*s,6.6*s,0,7);x.stroke();
      x.strokeStyle='#5ab0a0';x.setLineDash([1.2*s,1*s]);x.lineWidth=.8*s;x.beginPath();x.arc(0,-31*s,7.8*s,0,7);x.stroke();x.setLineDash([]);
      // bridge with saddle and pins
      x.fillStyle='#24120a';x.beginPath();x.moveTo(-8*s,-10*s);x.quadraticCurveTo(-9*s,-12.6*s,-6*s,-12.6*s);x.lineTo(6*s,-12.6*s);x.quadraticCurveTo(9*s,-12.6*s,8*s,-10*s);x.closePath();x.fill();
      x.strokeStyle='#f3eedf';x.lineWidth=.6*s;x.beginPath();x.moveTo(-4*s,-12*s);x.lineTo(4*s,-12.3*s);x.stroke();x.fillStyle='#efe6d2';for(let n=0;n<6;n++){x.beginPath();x.arc((-3.4+n*1.36)*s,-10.9*s,.42*s,0,7);x.fill()}
      // neck, fretboard, frets, inlays
      x.fillStyle='#6b3c1a';x.fillRect(-2.9*s,-95*s,5.8*s,49*s);x.fillStyle='#1a0f09';x.fillRect(-2.4*s,-95*s,4.8*s,49*s);
      x.strokeStyle='#d8d2c2';x.lineWidth=.45*s;let fy=-95*s;for(let n=1;n<=12;n++){fy+=(49*s)*(1/18)*Math.pow(.95,n-1)*1.4;if(fy>-47*s)break;x.beginPath();x.moveTo(-2.4*s,fy);x.lineTo(2.4*s,fy);x.stroke()}
      x.fillStyle='#e9e2d0';for(const fy2 of [-83,-76,-70,-60]){x.beginPath();x.arc(0,fy2*s,.6*s,0,7);x.fill()}
      x.fillStyle='#efe6d2';x.fillRect(-2.6*s,-95.6*s,5.2*s,1*s);
      // headstock and tuners
      x.fillStyle='#2b170c';x.beginPath();x.moveTo(-2.8*s,-95.5*s);x.lineTo(-4.4*s,-110*s);x.quadraticCurveTo(0,-113*s,4.4*s,-110*s);x.lineTo(2.8*s,-95.5*s);x.closePath();x.fill();
      x.fillStyle='#d9dbe2';for(let n=0;n<3;n++){const yy=-99.5*s-n*3.8*s;x.beginPath();x.arc(-3.6*s,yy,.8*s,0,7);x.arc(3.6*s,yy,.8*s,0,7);x.fill();x.fillRect(-6.6*s,yy-.8*s,2.2*s,1.6*s);x.fillRect(4.4*s,yy-.8*s,2.2*s,1.6*s)}
      // strings
      x.lineWidth=.35*s;for(let n=0;n<6;n++){x.strokeStyle=`rgba(${n<3?'230,200,150':'240,240,235'},.7)`;x.beginPath();x.moveTo((-3.4+n*1.36)*s,-11*s);x.lineTo((-1.8+n*.72)*s,-95.5*s);x.stroke()}
      // firelight on the side facing the fire + gloss
      x.save();outline();x.clip();const fg=x.createLinearGradient(L*17*s,0,-L*4*s,0);fg.addColorStop(0,'rgba(255,170,80,.45)');fg.addColorStop(1,'rgba(255,170,80,0)');x.fillStyle=fg;x.fillRect(-18*s,-48*s,36*s,48*s);
      x.fillStyle='rgba(255,255,255,.14)';x.beginPath();x.ellipse(-L*6*s,-38*s,2.2*s,6*s,-.2,0,7);x.fill();x.restore();
      x.restore()},
    'ヤシの木'(px,py){const s=k*1.05,top=[px-48*s,py-265*s],sw=Math.sin(t*.6)*.05,c1=[px+14*s,py-140*s];shadowE(px-10*s,py+2*s,40*s,6*s,.35);
      {const pts=[];for(let i=0;i<=30;i++){const tt=i/30,u=1-tt,qx=u*u*px+2*u*tt*c1[0]+tt*tt*top[0],qy=u*u*py+2*u*tt*c1[1]+tt*tt*top[1],dx=2*u*(c1[0]-px)+2*tt*(top[0]-c1[0]),dy=2*u*(c1[1]-py)+2*tt*(top[1]-c1[1]),l=Math.hypot(dx,dy);pts.push([qx,qy,-dy/l,dx/l,(9-tt*4.5)*s])}
        x.beginPath();pts.forEach(([a,b,nx,ny,w],n)=>n?x.lineTo(a+nx*w,b+ny*w):x.moveTo(a+nx*w,b+ny*w));for(let n=pts.length-1;n>=0;n--){const[a,b,nx,ny,w]=pts[n];x.lineTo(a-nx*w,b-ny*w)}x.closePath();
        x.fillStyle=hgrad(px-20*s,px+20*s,[[0,'#2c1f17'],[.45,'#6e5240'],[.7,'#4a3628'],[1,'#22170f']]);x.fill();
        x.lineWidth=1;for(let n=1;n<pts.length;n++){const[a,b,nx,ny,w]=pts[n];x.strokeStyle='rgba(18,10,6,.55)';x.beginPath();x.moveTo(a+nx*w,b+ny*w);x.quadraticCurveTo(a-ny*3*s,b+nx*3*s+2*s,a-nx*w,b-ny*w);x.stroke();
          x.strokeStyle='rgba(200,160,120,.12)';x.beginPath();x.moveTo(a+nx*w*.8,b+ny*w*.8-1.2*s);x.lineTo(a-nx*w*.2,b-ny*w*.2-1.2*s);x.stroke()}}
      x.fillStyle='rgba(255,140,60,.18)';x.beginPath();x.ellipse(px+4*s,py-60*s,6*s,60*s,.05,0,7);x.fill();
      const frond=(a,L,col,droop)=>{const aa=a+sw,ex=top[0]+Math.cos(aa)*L,ey=top[1]+Math.sin(aa)*L+droop,cx=top[0]+Math.cos(aa)*L*.55,cy=top[1]+Math.sin(aa)*L*.55-22*s;
        x.strokeStyle=col;x.lineWidth=2*s;x.beginPath();x.moveTo(top[0],top[1]);x.quadraticCurveTo(cx,cy,ex,ey);x.stroke();
        x.lineWidth=1.6*s;for(let i=2;i<18;i++){const tt=i/18,u=1-tt,qx=u*u*top[0]+2*u*tt*cx+tt*tt*ex,qy=u*u*top[1]+2*u*tt*cy+tt*tt*ey,ang=Math.atan2(2*u*(cy-top[1])+2*tt*(ey-cy),2*u*(cx-top[0])+2*tt*(ex-cx)),ll=(16-Math.abs(tt-.45)*20)*s;
          for(const sd of[-1,1]){const la=ang+sd*1.1+.35;x.beginPath();x.moveTo(qx,qy);x.lineTo(qx+Math.cos(la)*ll,qy+Math.sin(la)*ll+4*s);x.stroke()}}};
      [[-2.9,95,'#163024',30],[-.25,95,'#163024',30],[-2.45,110,'#1d3c2d',40],[-.7,110,'#1d3c2d',40],[-1.95,90,'#24473a',22],[-1.2,92,'#24473a',22],[-1.58,70,'#2c5444',-6]].forEach(([a,L,c,d])=>frond(a,L*s,c,d*s));
      [[-6,8],[6,10],[0,14],[-3,4]].forEach(([a,b])=>{const g=x.createRadialGradient(top[0]+(a-2)*s,top[1]+(b-2)*s,1,top[0]+a*s,top[1]+b*s,6*s);g.addColorStop(0,'#8a6440');g.addColorStop(1,'#2a1a10');x.fillStyle=g;x.beginPath();x.arc(top[0]+a*s,top[1]+b*s,5.5*s,0,7);x.fill()});
      DRAW._palm=[top[0],top[1]+12*s];DRAW._palmB=[px,py];window._palmB=[px-WL,py-WT,WW,WH]},
    'テント'(px,py){const s=k*1.05,f=flick(.7);const P=(a,b)=>[px+a*s,py+b*s];
      shadowE(px+10*s,py+2*s,70*s,9*s,.45);pool(px-6*s,py+6*s,70*s*f,'rgba(255,170,70,.35)');
      const A=P(-6,-60),B=P(32,-52),FL=P(-42,0),FR=P(28,0),BR=P(66,-6);
      x.fillStyle=vgrad(py-55*s,py,[[0,'#8f4a26'],[1,'#5a2a14']]);x.beginPath();x.moveTo(...A);x.lineTo(...B);x.lineTo(...BR);x.lineTo(...FR);x.closePath();x.fill();
      x.strokeStyle='rgba(30,12,5,.35)';x.lineWidth=1;for(let i=1;i<4;i++){const a=P(-6+i*9.5,-60+i*2),b=P(28+i*9.5,-i*1.5);x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke()}
      x.fillStyle=vgrad(py-60*s,py,[[0,'#d98242'],[1,'#a24e23']]);x.beginPath();x.moveTo(...FL);x.lineTo(...A);x.lineTo(...FR);x.closePath();x.fill();
      x.fillStyle=hgrad(px-42*s,px+28*s,[[0,'rgba(255,170,90,.25)'],[1,'rgba(0,0,0,.15)']]);x.fill();
      const dg=x.createRadialGradient(px-6*s,py-10*s,2*s,px-6*s,py-14*s,36*s);dg.addColorStop(0,`rgba(255,${225+20*f|0},150,1)`);dg.addColorStop(1,'rgba(220,120,50,.95)');x.fillStyle=dg;
      x.beginPath();x.moveTo(px-22*s,py);x.lineTo(px-6*s,py-44*s);x.lineTo(px+10*s,py);x.closePath();x.fill();if(LT<1){x.save();x.globalAlpha*=1-LT;x.fillStyle='#7a3a1c';x.fill();x.restore()}
      x.fillStyle='rgba(60,20,8,.55)';x.beginPath();x.ellipse(px-1*s,py-6*s,7*s,4*s,0,0,7);x.fill();
      x.fillStyle='#b5592a';x.beginPath();x.moveTo(px-6*s,py-44*s);x.quadraticCurveTo(px-20*s,py-20*s,px-26*s,py);x.lineTo(px-20*s,py);x.quadraticCurveTo(px-14*s,py-22*s,px-6*s,py-44*s);x.fill();
      x.beginPath();x.moveTo(px-6*s,py-44*s);x.quadraticCurveTo(px+8*s,py-20*s,px+14*s,py);x.lineTo(px+8*s,py);x.quadraticCurveTo(px+2*s,py-22*s,px-6*s,py-44*s);x.fill();
      x.strokeStyle='rgba(255,230,190,.35)';x.lineWidth=1;x.beginPath();x.moveTo(...A);x.lineTo(...B);x.stroke();
      x.strokeStyle='rgba(220,220,230,.35)';x.lineWidth=.7;x.beginPath();x.moveTo(...A);x.lineTo(...P(-64,4));x.moveTo(...B);x.lineTo(...P(86,-2));x.stroke();
      x.fillStyle='#ccc';x.fillRect(...P(-65,1),1.5*s,4*s);x.fillRect(...P(85,-5),1.5*s,4*s);
      x.save();x.globalCompositeOperation='lighter';glow(px-6*s,py-16*s,40*s*f,'rgba(255,170,70,.25)');x.restore()},
    'ライトのガーランド'(){const a=DRAW._palm||[WL+WW*.9,WT+WH*.62],b=[WL+WW*.5,WT+WH*.8],s=k;
      x.fillStyle=hgrad(b[0]-2*s,b[0]+2*s,[[0,'#3a2a1e'],[.5,'#7a5a3e'],[1,'#2a1d14']]);x.fillRect(b[0]-2*s,b[1],4*s,62*s);shadowE(b[0]+2*s,b[1]+62*s,8*s,2*s);
      const cx=(a[0]+b[0])/2,cy=Math.max(a[1],b[1])+40*k;x.strokeStyle='rgba(30,25,25,.9)';x.lineWidth=1.1;x.beginPath();x.moveTo(a[0],a[1]);x.quadraticCurveTo(cx,cy,b[0],b[1]);x.stroke();
      const C=[['255,92,138'],['255,210,63'],['85,224,180'],['122,162,255'],['255,154,60']];
      for(let i=1;i<14;i++){const tt=i/14,u=1-tt,qx=u*u*a[0]+2*u*tt*cx+tt*tt*b[0],qy=u*u*a[1]+2*u*tt*cy+tt*tt*b[1],c=C[i%5][0],on=.75+.25*Math.sin(t*.8+i*1.3);
        x.fillStyle='#1a1616';x.fillRect(qx-1*s,qy,2*s,2*s);
        x.save();x.globalCompositeOperation='lighter';x.globalAlpha*=on;glow(qx,qy+5*s,14*s,`rgba(${c},.55)`);x.restore();
        const g=x.createRadialGradient(qx-.6*s,qy+4*s,.3,qx,qy+5*s,3.4*s);g.addColorStop(0,'#fffbe8');g.addColorStop(.5,`rgba(${c},1)`);g.addColorStop(1,`rgba(${c},.6)`);x.fillStyle=g;x.beginPath();x.ellipse(qx,qy+5*s,2.4*s,3.4*s,0,0,7);x.fill()}},
    'ヨット'(px,py){px+=Math.sin(t*.12)*25*k;py+=Math.sin(t*1.3)*.8*k;const s=k*.55,r=Math.sin(t*1.1)*.03;
      x.save();x.globalCompositeOperation='lighter';for(let i=0;i<8;i++){x.fillStyle=`rgba(230,230,255,${.08-i*.008})`;x.fillRect(px-26*s+Math.sin(t*2+i)*2*s,py+9*s+i*3*s,52*s-i*4*s,1.2*s)}
      x.fillStyle='rgba(255,210,140,.18)';for(let i=0;i<6;i++)x.fillRect(px-6*s+Math.sin(t*2.5+i)*2*s,py+9*s+i*3.5*s,8*s,1.2*s);x.restore();
      x.save();x.translate(px,py);x.rotate(r);
      x.fillStyle=vgrad(-4*s,8*s,[[0,'#e8e4dc'],[.6,'#9a97a6'],[1,'#3f3d4a']]);x.beginPath();x.moveTo(-34*s,-3*s);x.lineTo(36*s,-3*s);x.quadraticCurveTo(30*s,8*s,18*s,9*s);x.lineTo(-24*s,9*s);x.quadraticCurveTo(-32*s,6*s,-34*s,-3*s);x.fill();
      x.fillStyle='#1f2b4f';x.fillRect(-30*s,2*s,62*s,1.6*s);
      x.fillStyle=vgrad(-10*s,-3*s,[[0,'#d8d4cc'],[1,'#8c8a96']]);x.beginPath();x.roundRect(-14*s,-10*s,24*s,7*s,2*s);x.fill();
      x.fillStyle='rgba(255,200,120,.95)';[-10,-4,2].forEach(o=>x.fillRect(o*s,-8*s,3.6*s,2.4*s));
      x.strokeStyle='#cfcbd6';x.lineWidth=1.2*s;x.beginPath();x.moveTo(0,-10*s);x.lineTo(0,-74*s);x.stroke();x.lineWidth=1*s;x.beginPath();x.moveTo(0,-14*s);x.lineTo(-26*s,-12*s);x.stroke();
      x.fillStyle=hgrad(-26*s,0,[[0,'#8e8ba2'],[1,'#f1eee8']]);x.beginPath();x.moveTo(-1*s,-72*s);x.quadraticCurveTo(-14*s,-40*s,-25*s,-13*s);x.lineTo(-1*s,-14*s);x.closePath();x.fill();
      x.fillStyle=hgrad(1*s,30*s,[[0,'#f5f2ec'],[1,'#a19eb3']]);x.beginPath();x.moveTo(1*s,-70*s);x.quadraticCurveTo(18*s,-40*s,33*s,-4*s);x.lineTo(1*s,-12*s);x.closePath();x.fill();
      x.strokeStyle='rgba(60,60,80,.35)';x.lineWidth=.6;for(let i=1;i<4;i++){x.beginPath();x.moveTo(-1*s,-14*s-i*14*s);x.lineTo(-24*s+i*5*s,-13*s-i*2*s);x.stroke()}
      x.save();x.globalCompositeOperation='lighter';glow(0,-76*s,9*s,'rgba(255,255,255,.95)');x.restore();x.restore()},
    'とうだい'(px){const s=k*1.05,py=hz+3*k;
      x.fillStyle=vgrad(py-14*s,py+4*s,[[0,'#2a2740'],[1,'#0c0b18']]);x.beginPath();x.moveTo(px-46*s,py+2*s);x.quadraticCurveTo(px-30*s,py-14*s,px-8*s,py-12*s);x.quadraticCurveTo(px+16*s,py-16*s,px+34*s,py-4*s);x.lineTo(px+44*s,py+2*s);x.closePath();x.fill();
      const tw=(y)=>lerp(10,7,(py-8*s-y)/(84*s))*s;x.save();x.beginPath();x.moveTo(px-10*s,py-8*s);x.lineTo(px-7*s,py-92*s);x.lineTo(px+7*s,py-92*s);x.lineTo(px+10*s,py-8*s);x.closePath();x.clip();
      x.fillStyle=hgrad(px-10*s,px+10*s,[[0,'#7d7890'],[.35,'#f4f0ea'],[1,'#5d5870']]);x.fillRect(px-11*s,py-93*s,22*s,86*s);
      x.fillStyle=hgrad(px-10*s,px+10*s,[[0,'#6b1c26'],[.35,'#d84a54'],[1,'#4e1219']]);[[18,14],[48,14],[76,10]].forEach(([h,hh])=>x.fillRect(px-11*s,py-8*s-h*s-hh*s,22*s,hh*s));
      x.fillStyle='rgba(255,220,150,.9)';x.fillRect(px-1.4*s,py-40*s,2.8*s,4*s);x.fillRect(px-1.2*s,py-66*s,2.4*s,3.6*s);x.restore();
      x.fillStyle='#16141f';x.fillRect(px-11*s,py-94*s,22*s,2.4*s);x.strokeStyle='#16141f';x.lineWidth=.8;for(let i=-10;i<=10;i+=4){x.beginPath();x.moveTo(px+i*s,py-94*s);x.lineTo(px+i*s,py-98*s);x.stroke()}x.fillRect(px-11*s,py-98.5*s,22*s,1*s);
      const ang=Math.PI+Math.sin(t*.35)*.95,Lb=440*k,by=py-104*s;x.save();x.globalCompositeOperation='lighter';
      const bg=x.createLinearGradient(px,by,px+Math.cos(ang)*Lb,by+Math.sin(ang)*Lb*.1);bg.addColorStop(0,`rgba(255,240,190,${.38*dark+.04})`);bg.addColorStop(1,'rgba(255,240,190,0)');x.fillStyle=bg;
      x.beginPath();x.moveTo(px,by);x.lineTo(px+Math.cos(ang-.09)*Lb,by+Math.sin(ang-.09)*Lb*.12);x.lineTo(px+Math.cos(ang+.09)*Lb,by+Math.sin(ang+.09)*Lb*.12);x.closePath();x.fill();
      glow(px,by,26*s,'rgba(255,240,190,.7)');x.restore();
      x.fillStyle='rgba(255,246,210,.95)';x.fillRect(px-6*s,py-109*s,12*s,10*s);x.strokeStyle='#16141f';x.lineWidth=.8;x.strokeRect(px-6*s,py-109*s,12*s,10*s);x.beginPath();x.moveTo(px,py-109*s);x.lineTo(px,py-99*s);x.stroke();
      x.fillStyle=vgrad(py-118*s,py-109*s,[[0,'#8a2a32'],[1,'#3a0f14']]);x.beginPath();x.moveTo(px-8*s,py-109*s);x.quadraticCurveTo(px,py-122*s,px+8*s,py-109*s);x.fill();x.fillRect(px-.6*s,py-124*s,1.2*s,5*s)},
    'たからばこ'(px,py){const s=k*1.2,f=flick(.5);shadowE(px+3*s,py+1*s,38*s,5*s,.5);pool(px,py-4*s,60*s*f,'rgba(255,200,80,.4)');
      x.save();x.globalCompositeOperation='lighter';glow(px,py-30*s,55*s*f,'rgba(255,210,90,.35)');x.restore();
      x.fillStyle=vgrad(py-28*s,py,[[0,'#8a5328'],[1,'#3b200d']]);x.fillRect(px-28*s,py-26*s,56*s,26*s);
      x.strokeStyle='rgba(30,14,4,.6)';x.lineWidth=1;for(let i=1;i<3;i++){x.beginPath();x.moveTo(px-28*s,py-26*s+i*8.6*s);x.lineTo(px+28*s,py-26*s+i*8.6*s);x.stroke()}
      const band=(xx)=>{x.fillStyle=hgrad(px+xx-2.5*s,px+xx+2.5*s,[[0,'#8a6a22'],[.5,'#f6d36a'],[1,'#7a5a18']]);x.fillRect(px+xx-2.5*s,py-26*s,5*s,26*s)};band(-20*s);band(20*s);
      x.fillStyle=vgrad(py-27*s,py-24*s,[[0,'#f6d36a'],[1,'#8a6a22']]);x.fillRect(px-29*s,py-27*s,58*s,3*s);
      x.fillStyle='#e8c25a';x.beginPath();x.roundRect(px-4*s,py-22*s,8*s,9*s,1.5*s);x.fill();x.fillStyle='#2a1606';x.beginPath();x.arc(px,py-18.5*s,1.4*s,0,7);x.fill();x.fillRect(px-.6*s,py-18*s,1.2*s,3*s);
      x.fillStyle='#fff3c0';[-24,-16,16,24].forEach(o=>{for(let r=0;r<3;r++){x.beginPath();x.arc(px+o*s*.0+ (o<0?-20:20)*s+(o<0?-1:1)*0,py-22*s+r*8*s,.8*s,0,7);x.fill()}});
      x.fillStyle=vgrad(py-60*s,py-26*s,[[0,'#6e3f1c'],[1,'#3b200d']]);x.beginPath();x.moveTo(px-28*s,py-27*s);x.lineTo(px-25*s,py-56*s);x.quadraticCurveTo(px+2*s,py-64*s,px+30*s,py-56*s);x.lineTo(px+28*s,py-27*s);x.closePath();x.fill();
      x.fillStyle='rgba(255,200,90,.35)';x.beginPath();x.moveTo(px-24*s,py-28*s);x.lineTo(px-22*s,py-50*s);x.quadraticCurveTo(px+2*s,py-57*s,px+26*s,py-50*s);x.lineTo(px+25*s,py-28*s);x.closePath();x.fill();
      band.call(null,0);
      const coin=(cx,cy,r)=>{const g=x.createRadialGradient(cx-r*.3,cy-r*.4,.2,cx,cy,r);g.addColorStop(0,'#fff6c4');g.addColorStop(.5,'#f2c14e');g.addColorStop(1,'#8a6416');x.fillStyle=g;x.beginPath();x.ellipse(cx,cy,r,r*.55,0,0,7);x.fill()};
      for(let r=0;r<3;r++)for(let i=0;i<8-r*2;i++)coin(px-20*s+r*6*s+i*6*s,py-27*s-r*3.2*s-Math.sin(i*1.3)*1*s,3.4*s);
      coin(px+24*s,py-1*s,3*s);coin(px+30*s,py,2.6*s);
      [['#e2475a',-8,-36],['#55a0ff',6,-35],['#55e0b4',14,-31]].forEach(([c,a,b])=>{x.fillStyle=c;x.beginPath();x.moveTo(px+a*s,py+b*s-3*s);x.lineTo(px+a*s+2.5*s,py+b*s);x.lineTo(px+a*s,py+b*s+2.5*s);x.lineTo(px+a*s-2.5*s,py+b*s);x.fill();x.fillStyle='rgba(255,255,255,.7)';x.fillRect(px+a*s-.8*s,py+b*s-1.6*s,1.2*s,1.2*s)});
      const sp=.5+.5*Math.sin(t*1.2);x.save();x.globalCompositeOperation='lighter';x.globalAlpha*=sp;glow(px-6*s,py-34*s,7*s,'rgba(255,255,230,.9)');x.restore()},
    'ハンモック'(px,py){const s=k,A=[WL+WW*.6,WT+WH*.7],B=[WL+WW*.9,WT+WH*.67],sway=Math.sin(t*.9)*3*s;
      x.fillStyle=hgrad(A[0]-2*s,A[0]+2*s,[[0,'#3a2a1e'],[.5,'#86643f'],[1,'#2a1d14']]);x.fillRect(A[0]-2.2*s,A[1]-4*s,4.4*s,WT+WH*.97-A[1]);shadowE(A[0]+2*s,WT+WH*.97,8*s,2*s);
      const mx=(A[0]+B[0])/2+sway,my=Math.max(A[1],B[1])+26*s;shadowE(mx,WT+WH*.97,(B[0]-A[0])*.4,4*s,.3);
      x.strokeStyle='rgba(230,220,200,.7)';x.lineWidth=1;for(let i=0;i<4;i++){x.beginPath();x.moveTo(A[0],A[1]);x.lineTo(A[0]+14*s,A[1]+4*s+i*2*s);x.stroke();x.beginPath();x.moveTo(B[0],B[1]);x.lineTo(B[0]-14*s,B[1]+4*s+i*2*s);x.stroke()}
      const a1=[A[0]+14*s,A[1]+5*s],b1=[B[0]-14*s,B[1]+5*s];x.beginPath();x.moveTo(...a1);x.quadraticCurveTo(mx,my,...b1);x.quadraticCurveTo(mx,my+12*s,...a1);x.closePath();
      x.save();x.clip();const cols=['#e2575a','#f2c14e','#3e8fc4','#f3ead9'];for(let i=0;i<30;i++){x.fillStyle=cols[i%4];x.fillRect(a1[0]+i*5*s,A[1]-10*s,5*s,60*s)}
      x.fillStyle=vgrad(A[1],my+12*s,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.45)']]);x.fillRect(a1[0],A[1]-10*s,b1[0]-a1[0],80*s);x.restore();
      x.strokeStyle='rgba(255,240,220,.6)';x.lineWidth=1.2*s;x.beginPath();x.moveTo(...a1);x.quadraticCurveTo(mx,my,...b1);x.stroke()},
    'サーフボード'(px,py){const s=k*1.1;shadowE(px+8*s,py+1*s,14*s,3*s);x.save();x.translate(px,py);x.rotate(.12);
      const g=hgrad(-7*s,7*s,[[0,'#2f8fc9'],[.45,'#9be0ff'],[1,'#1f6c99']]);x.fillStyle=g;x.beginPath();x.moveTo(0,-62*s);x.bezierCurveTo(9*s,-50*s,8*s,-6*s,0,2*s);x.bezierCurveTo(-8*s,-6*s,-9*s,-50*s,0,-62*s);x.fill();
      x.fillStyle='#ff7a3c';x.beginPath();x.moveTo(-6*s,-30*s);x.lineTo(6*s,-36*s);x.lineTo(6*s,-31*s);x.lineTo(-6*s,-25*s);x.fill();x.fillStyle='#ffd23f';x.beginPath();x.moveTo(-6*s,-24*s);x.lineTo(6*s,-30*s);x.lineTo(6*s,-28*s);x.lineTo(-6*s,-22*s);x.fill();
      x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.8;x.beginPath();x.moveTo(0,-60*s);x.lineTo(0,0);x.stroke();x.fillStyle='rgba(60,40,30,.5)';x.fillRect(-7*s,-3*s,14*s,6*s);x.restore()},
    'バーベキューグリル'(px,py){const s=k*1.15,f=flick(1.6);shadowE(px+2*s,py+1*s,22*s,4*s);
      x.strokeStyle='#2a2626';x.lineWidth=2*s;x.beginPath();x.moveTo(px-12*s,py);x.lineTo(px-6*s,py-16*s);x.moveTo(px+12*s,py);x.lineTo(px+6*s,py-16*s);x.moveTo(px,py);x.lineTo(px,py-16*s);x.stroke();
      x.fillStyle=vgrad(py-28*s,py-14*s,[[0,'#4a4646'],[1,'#141212']]);x.beginPath();x.moveTo(px-17*s,py-26*s);x.quadraticCurveTo(px,py-6*s,px+17*s,py-26*s);x.closePath();x.fill();
      x.save();x.globalCompositeOperation='lighter';glow(px,py-27*s,20*s*f,'rgba(255,110,40,.6)');x.restore();
      x.fillStyle=`rgba(255,${80+60*f|0},30,.95)`;for(let i=-3;i<=3;i++){x.beginPath();x.arc(px+i*4*s,py-26*s+Math.abs(i)*.4*s,2*s,0,7);x.fill()}
      x.strokeStyle='#9a9a9a';x.lineWidth=.8;for(let i=-4;i<=4;i++){x.beginPath();x.moveTo(px+i*4*s,py-29*s);x.lineTo(px+i*4*s+.5,py-26*s);x.stroke()}x.beginPath();x.moveTo(px-17*s,py-28*s);x.lineTo(px+17*s,py-28*s);x.stroke();
      [['#9c4a2a',-8],['#b0573a',0],['#c76a3a',8]].forEach(([c,o])=>{x.fillStyle=c;x.beginPath();x.roundRect(px+o*s-3*s,py-31*s,6*s,3*s,1.5*s);x.fill()});
      x.fillStyle='#e6e1d6';x.fillRect(px+3*s,py-31.5*s,1.2*s,4*s);
      for(let i=0;i<3;i++){const tt=((t*.4+i/3)%1),sy=py-34*s-tt*40*s,r=(4+tt*10)*s;x.fillStyle=`rgba(180,170,175,${(1-tt)*.18})`;x.beginPath();x.arc(px+Math.sin(t+i*2)*4*s+tt*8*s,sy,r,0,7);x.fill()}},
    'ビーチパラソル'(px,py){const s=k*1.1;shadowE(px+4*s,py+1*s,30*s,5*s,.3);
      x.strokeStyle='#d8d2c6';x.lineWidth=2*s;x.beginPath();x.moveTo(px,py);x.lineTo(px-6*s,py-70*s);x.stroke();
      x.save();x.translate(px-6*s,py-70*s);x.rotate(-.12);const cols=['#e8463e','#f6efe2'];
      for(let i=0;i<8;i++){const a0=Math.PI+i*Math.PI/8,a1=a0+Math.PI/8;x.fillStyle=cols[i%2];x.beginPath();x.moveTo(0,-4*s);x.lineTo(Math.cos(a0)*42*s,Math.sin(a0)*-16*s+10*s);x.quadraticCurveTo(Math.cos((a0+a1)/2)*44*s,10*s+Math.sin((a0+a1)/2)*-16*s+4*s,Math.cos(a1)*42*s,Math.sin(a1)*-16*s+10*s);x.closePath();x.fill()}
      x.fillStyle=vgrad(-6*s,14*s,[[0,'rgba(255,255,255,.12)'],[1,'rgba(0,0,0,.35)']]);x.beginPath();x.moveTo(-43*s,10*s);x.quadraticCurveTo(0,-14*s,43*s,10*s);x.lineTo(0,-6*s);x.closePath();x.fill();
      x.fillStyle='#d8d2c6';x.beginPath();x.arc(0,-5*s,2*s,0,7);x.fill();x.restore()},
    '木の看板'(px,py){const s=k*1.05;shadowE(px+3*s,py+1*s,16*s,3*s);
      x.fillStyle='#4a3220';x.fillRect(px-1.8*s,py-34*s,3.6*s,34*s);
      x.save();x.translate(px,py-36*s);x.rotate(-.05);x.fillStyle=vgrad(-10*s,10*s,[[0,'#a8784a'],[1,'#6a4528']]);x.beginPath();x.moveTo(-30*s,-9*s);x.lineTo(24*s,-9*s);x.lineTo(32*s,0);x.lineTo(24*s,9*s);x.lineTo(-30*s,9*s);x.closePath();x.fill();
      x.strokeStyle='rgba(40,20,8,.4)';x.lineWidth=.8;x.beginPath();x.moveTo(-28*s,-3*s);x.lineTo(28*s,-3*s);x.moveTo(-28*s,3*s);x.lineTo(28*s,3*s);x.stroke();
      x.fillStyle='#fff3dc';x.font=`${Math.round(9*s)}px DotGothic16, monospace`;x.textAlign='center';x.textBaseline='middle';x.fillText('ほしふる浜',-1*s,.5*s);x.textAlign='start';x.restore()},
    'キャンピングカー'(px,py){const s=k*.95,f=flick(.6);shadowE(px+4*s,py+1*s,48*s,5*s,.45);
      x.fillStyle=vgrad(py-46*s,py-6*s,[[0,'#e9e2d2'],[.55,'#c9c0ad'],[.56,'#4fa3a5'],[1,'#2f6f72']]);x.beginPath();x.roundRect(px-46*s,py-46*s,86*s,40*s,10*s);x.fill();
      x.fillStyle='#3a3434';x.beginPath();x.moveTo(px+40*s,py-40*s);x.quadraticCurveTo(px+50*s,py-38*s,px+50*s,py-20*s);x.lineTo(px+50*s,py-8*s);x.lineTo(px+40*s,py-8*s);x.closePath();x.fill();
      x.fillStyle='rgba(160,200,230,.5)';x.beginPath();x.moveTo(px+41*s,py-38*s);x.quadraticCurveTo(px+48*s,py-36*s,px+48*s,py-24*s);x.lineTo(px+41*s,py-24*s);x.closePath();x.fill();
      [[-38,-38],[-20,-38],[-2,-38]].forEach(([a,b])=>{const g=x.createRadialGradient(px+(a+7)*s,py+(b+6)*s,1,px+(a+7)*s,py+(b+6)*s,10*s);g.addColorStop(0,`rgba(255,${220+20*f|0},150,1)`);g.addColorStop(1,'rgba(230,140,60,.9)');x.fillStyle=g;x.beginPath();x.roundRect(px+a*s,py+b*s,14*s,12*s,2*s);if(LT<1){x.fill();x.save();x.globalAlpha*=1-LT;x.fillStyle='#8fb3c9';}x.fill();if(LT<1)x.restore()});
      x.fillStyle='#2f6f72';x.fillRect(px+18*s,py-38*s,12*s,28*s);x.fillStyle=LT>.5?'rgba(255,220,150,.9)':'rgba(150,185,205,.9)';x.fillRect(px+20*s,py-36*s,8*s,9*s);
      [[-30],[28]].forEach(([o])=>{x.fillStyle='#151313';x.beginPath();x.arc(px+o*s,py-6*s,7*s,0,7);x.fill();x.fillStyle='#bdb6a8';x.beginPath();x.arc(px+o*s,py-6*s,3*s,0,7);x.fill()});
      x.save();x.globalCompositeOperation='lighter';glow(px-10*s,py-30*s,50*s*f,'rgba(255,170,80,.18)');x.restore()},
    'たいまつ'(px,py){const s=k*1.1;[[-38,0],[38,0]].forEach(([o])=>{const tx=px+o*s,f=flick(1.2+o*.01);shadowE(tx+2*s,py+1*s,6*s,2*s);
        x.fillStyle=hgrad(tx-2*s,tx+2*s,[[0,'#3a2716'],[.5,'#9a7246'],[1,'#2a1c10']]);x.fillRect(tx-2*s,py-48*s,4*s,48*s);
        x.fillStyle='#5a3e22';x.beginPath();x.moveTo(tx-5*s,py-48*s);x.lineTo(tx+5*s,py-48*s);x.lineTo(tx+3*s,py-56*s);x.lineTo(tx-3*s,py-56*s);x.closePath();x.fill();
        x.save();x.globalAlpha*=LT;x.globalCompositeOperation='lighter';glow(tx,py-62*s,40*s*f,'rgba(255,140,40,.35)');
        for(let j=0;j<3;j++){const h=(14+5*Math.sin(t*9+j*2+o))*s,w=(4-j)*s;const g=x.createLinearGradient(0,py-56*s,0,py-56*s-h);g.addColorStop(0,'rgba(255,100,20,.9)');g.addColorStop(.5,'rgba(255,190,60,.8)');g.addColorStop(1,'rgba(255,240,180,0)');x.fillStyle=g;
          x.beginPath();x.moveTo(tx-w,py-56*s);x.quadraticCurveTo(tx-w*.6,py-56*s-h*.6,tx+Math.sin(t*7+j)*2*s,py-56*s-h);x.quadraticCurveTo(tx+w*.6,py-56*s-h*.6,tx+w,py-56*s);x.fill()}
        x.restore()})},
    'さんばし'(px){const s=k,sx=px,sy=shore+4*k,ex=px+20*k,ey=hz+(shore-hz)*.35;
      for(let i=0;i<=8;i++){const tt=i/8,cx=lerp(sx,ex,tt),cy=lerp(sy,ey,tt),w=lerp(16,5,tt)*s;x.fillStyle='#1c140e';x.fillRect(cx-w-1*s,cy,1.6*s*(1-tt*.5),lerp(14,5,tt)*s);x.fillRect(cx+w,cy,1.6*s*(1-tt*.5),lerp(14,5,tt)*s)}
      x.fillStyle=vgrad(ey,sy,[[0,'#3a2a1e'],[1,'#6e5038']]);x.beginPath();x.moveTo(sx-16*s,sy);x.lineTo(sx+16*s,sy);x.lineTo(ex+5*s,ey);x.lineTo(ex-5*s,ey);x.closePath();x.fill();
      x.strokeStyle='rgba(20,12,8,.5)';x.lineWidth=.8;for(let i=1;i<14;i++){const tt=Math.pow(i/14,.8);x.beginPath();x.moveTo(lerp(sx-16*s,ex-5*s,tt),lerp(sy,ey,tt));x.lineTo(lerp(sx+16*s,ex+5*s,tt),lerp(sy,ey,tt));x.stroke()}
      x.fillStyle='#14100c';x.fillRect(ex-1*s,ey-22*s,2*s,22*s);x.save();x.globalCompositeOperation='lighter';glow(ex,ey-23*s,22*s*flick(.4),'rgba(255,200,120,.5)');glow(ex,ey-23*s,3*s,'rgba(255,245,210,1)');
      for(let i=0;i<6;i++){x.fillStyle=`rgba(255,200,120,${.14-i*.02})`;x.fillRect(ex-4*s+Math.sin(t*2+i)*2*s,ey+4*s+i*3*s,8*s,1.2*s)}x.restore()},
    '気球'(px,py){const s=k*.5,bx=px+Math.sin(t*.3)*6*k,by=py+Math.sin(t*.5)*3*k,f=flick(2);
      const g=x.createRadialGradient(bx-8*s,by-10*s,2*s,bx,by,30*s);g.addColorStop(0,'#ffb36b');g.addColorStop(.6,'#d94b5a');g.addColorStop(1,'#5a1f3a');x.fillStyle=g;
      x.beginPath();x.moveTo(bx,by+26*s);x.bezierCurveTo(bx-30*s,by+4*s,bx-28*s,by-30*s,bx,by-30*s);x.bezierCurveTo(bx+28*s,by-30*s,bx+30*s,by+4*s,bx,by+26*s);x.fill();
      x.strokeStyle='rgba(255,230,180,.35)';x.lineWidth=1;[-14,0,14].forEach(o=>{x.beginPath();x.moveTo(bx,by-30*s);x.quadraticCurveTo(bx+o*1.6*s,by,bx+o*.3*s,by+24*s);x.stroke()});
      x.strokeStyle='#2a1d14';x.lineWidth=.8;x.beginPath();x.moveTo(bx-5*s,by+25*s);x.lineTo(bx-4*s,by+34*s);x.moveTo(bx+5*s,by+25*s);x.lineTo(bx+4*s,by+34*s);x.stroke();
      x.fillStyle='#6b4628';x.fillRect(bx-5*s,by+34*s,10*s,7*s);
      x.save();x.globalCompositeOperation='lighter';glow(bx,by+24*s,16*s*f,'rgba(255,170,60,.55)');glow(bx,by+8*s,26*s*f,'rgba(255,140,60,.18)');x.restore()},
    '豪華クルーザー'(px,py){const s=k*.42,bx=px+Math.sin(t*.08)*14*k,by=py;
      x.save();x.globalCompositeOperation='lighter';for(let i=0;i<8;i++){x.fillStyle=`rgba(255,220,160,${.14-i*.015})`;x.fillRect(bx-40*s+Math.sin(t*2+i)*3*s,by+7*s+i*3*s,80*s,1.2*s)}x.restore();
      x.fillStyle=vgrad(by-6*s,by+6*s,[[0,'#f4f0ea'],[1,'#8a8798']]);x.beginPath();x.moveTo(-60*s+bx,by-4*s);x.lineTo(60*s+bx,by-6*s);x.quadraticCurveTo(54*s+bx,by+6*s,40*s+bx,by+6*s);x.lineTo(-52*s+bx,by+6*s);x.closePath();x.fill();
      x.fillStyle='#e4e0d8';x.beginPath();x.roundRect(bx-40*s,by-15*s,70*s,10*s,3*s);x.fill();x.beginPath();x.roundRect(bx-26*s,by-23*s,40*s,8*s,3*s);x.fill();
      x.fillStyle='rgba(255,210,130,.95)';for(let i=0;i<10;i++)x.fillRect(bx-37*s+i*6.5*s,by-12*s,4*s,3*s);for(let i=0;i<5;i++)x.fillRect(bx-23*s+i*7*s,by-21*s,4*s,3*s);
      x.strokeStyle='#d9d4cc';x.lineWidth=1;x.beginPath();x.moveTo(bx-4*s,by-23*s);x.lineTo(bx-4*s,by-36*s);x.stroke();
      const C=['255,92,138','255,210,63','85,224,180','122,162,255'];x.save();x.globalCompositeOperation='lighter';
      for(let i=0;i<9;i++){const lx=lerp(bx-58*s,bx-4*s,i/8),ly=lerp(by-5*s,by-36*s,i/8)+Math.sin(i/8*Math.PI)*3*s;glow(lx,ly,3.5*s,`rgba(${C[i%4]},${.6+.4*Math.sin(t*1.5+i)})`)}
      for(let i=0;i<9;i++){const lx=lerp(bx-4*s,bx+58*s,i/8),ly=lerp(by-36*s,by-6*s,i/8)+Math.sin(i/8*Math.PI)*3*s;glow(lx,ly,3.5*s,`rgba(${C[(i+2)%4]},${.6+.4*Math.sin(t*1.5+i+2)})`)}x.restore()},
    '星の門'(px,py){const s=k*1.1,R1=34*s;shadowE(px,py+1*s,40*s,4*s,.3);
      x.save();x.globalCompositeOperation='lighter';glow(px,py-R1,R1*1.6,'rgba(150,170,255,.18)');
      for(let i=0;i<=22;i++){const a=Math.PI+i/22*Math.PI,sx=px+Math.cos(a)*R1,sy=py-R1*.2+Math.sin(a)*R1*1.25,tw=.6+.4*Math.sin(t*1.2+i*.9);
        glow(sx,sy,7*s*tw,'rgba(200,215,255,.7)');x.fillStyle=`rgba(255,250,230,${tw})`;x.beginPath();for(let q=0;q<8;q++){const aa=q*Math.PI/4,rr=q%2?1*s:3.2*s*tw;x.lineTo(sx+Math.cos(aa)*rr,sy+Math.sin(aa)*rr)}x.fill()}
      for(let i=0;i<14;i++){const tt=((t*.15+i/14)%1),sx=px+Math.sin(i*7.3)*R1*.7,sy=py-tt*R1*2.2;x.fillStyle=`rgba(200,220,255,${(1-tt)*.7})`;x.fillRect(sx,sy,1.4*s,1.4*s)}
      const g=x.createLinearGradient(0,py-R1*1.5,0,py);g.addColorStop(0,'rgba(130,150,255,0)');g.addColorStop(1,'rgba(160,180,255,.22)');x.fillStyle=g;x.beginPath();x.ellipse(px,py-R1*.6,R1*.75,R1*1.05,0,0,7);x.fill();x.restore()},
    'うちあげ はなび'(){if(!still&&Math.random()<.004&&booms.filter(b=>b.shell).length===0){const bx=WL+WW*(.1+Math.random()*.8),c=['255,92,138','255,210,63','85,224,180','122,162,255','255,154,60'][Math.random()*5|0];
        booms.push({shell:1,x:bx,y:hz,vy:-2.6*k,ty:hz*(.25+Math.random()*.35),c,l:1})}
      x.save();x.globalCompositeOperation='lighter';
      for(const b of booms){if(b.shell){b.y+=b.vy;x.fillStyle='rgba(255,230,180,.9)';x.fillRect(b.x,b.y,1.6*k,4*k);if(b.y<=b.ty){b.l=0;for(let i=0;i<56;i++){const a=i/56*Math.PI*2+Math.random()*.1,v=R(1.4,2.2)*k;booms.push({x:b.x,y:b.y,px:b.x,py:b.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,c:b.c})}glow(b.x,b.y,40*k,`rgba(${b.c},.5)`)}continue}
        b.px=b.x;b.py=b.y;b.x+=b.vx;b.y+=b.vy;b.vy+=.022*k;b.vx*=.985;b.vy*=.985;b.l-=.011;x.strokeStyle=`rgba(${b.c},${b.l})`;x.lineWidth=1.4*k;x.beginPath();x.moveTo(b.px,b.py);x.lineTo(b.x,b.y);x.stroke();
        if(b.l<.3&&Math.random()<.3){x.fillStyle=`rgba(255,250,230,${b.l*2})`;x.fillRect(b.x,b.y,1.2*k,1.2*k)}}
      booms=booms.filter(b=>b.l>0);x.restore()}
  };
  /* ---------- random background events (one every 5 minutes) ---------- */
  const lerp=(a,b,p)=>a+(b-a)*p,ease=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const seaY=f=>hz+(shore-hz)*f;
  const fade=(p,a=.08,b=.08)=>clamp(Math.min(p/a,(1-p)/b));
  function fishShape(L,col){x.fillStyle=col;x.beginPath();x.ellipse(0,0,L*.5,L*.2,0,0,7);x.fill();x.beginPath();x.moveTo(-L*.42,0);x.lineTo(-L*.75,-L*.22);x.lineTo(-L*.75,L*.22);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(L*.3,-L*.04,L*.05,0,7);x.fill()}
  function splash(st,px,py,n,sp=1){for(let i=0;i<n;i++)st.parts.push({x:px,y:py,vx:G()*1.4*k*sp,vy:-R(1,3)*k*sp,l:1});st.rip.push({x:px,y:py,r:2*k,l:1})}
  function parts(st){for(const q of st.parts){q.x+=q.vx;q.y+=q.vy;q.vy+=.12*k;q.l-=.03;if(q.l>0){x.globalAlpha=q.l;x.fillStyle='#e6f2ff';x.fillRect(q.x,q.y,1.6*k,1.6*k)}}
    st.parts=st.parts.filter(q=>q.l>0);x.globalAlpha=1;
    for(const r of st.rip){r.r+=.5*k;r.l-=.012;if(r.l>0){x.strokeStyle=`rgba(210,225,255,${r.l*.4})`;x.lineWidth=1;x.beginPath();x.ellipse(r.x,r.y,r.r,r.r*.18,0,0,7);x.stroke()}}st.rip=st.rip.filter(r=>r.l>0)}
  const EV={
  ufo:{msg:'UFOが あらわれた！',dur:15,layer:'front',draw(p,st,et){
    const hx=WL+WW*.56,hy=hz-48*k,by=seaY(.55);let ux,uy,tilt;
    if(p<.22){const q=ease(p/.22);ux=lerp(W+90,hx,q);uy=lerp(WT+WH*.04,hy,q)+Math.sin(q*8)*6*k*(1-q);tilt=-.18*(1-q)}
    else if(p<.76){ux=hx+Math.sin(et*1.3)*5*k;uy=hy+Math.sin(et*2.1)*4*k;tilt=Math.sin(et*1.7)*.04}
    else{const q=(p-.76)/.24,e=q*q*q;ux=lerp(hx,-160,e)+Math.sin(q*9)*14*k*(1-q);uy=lerp(hy,WT-60,e);tilt=.3*q}
    if(p>.3&&p<.7){const a=clamp(Math.min((p-.3)/.04,(.7-p)/.04));x.globalCompositeOperation='lighter';
      const g=x.createLinearGradient(0,uy,0,by);g.addColorStop(0,`rgba(140,255,225,${.5*a})`);g.addColorStop(1,`rgba(140,255,225,${.06*a})`);x.fillStyle=g;
      x.beginPath();x.moveTo(ux-9*k,uy+6*k);x.lineTo(ux+9*k,uy+6*k);x.lineTo(ux+42*k,by);x.lineTo(ux-42*k,by);x.fill();
      for(let i=0;i<3;i++){const rr=((et*.8+i/3)%1);x.strokeStyle=`rgba(170,255,235,${(1-rr)*.5*a})`;x.lineWidth=1.2;x.beginPath();x.ellipse(ux,by,(10+rr*40)*k,(2+rr*6)*k,0,0,7);x.stroke()}
      x.globalCompositeOperation='source-over';
      if(p>.38&&p<.64){const q=(p-.38)/.26;x.save();x.translate(ux+Math.sin(q*18)*3*k,lerp(by,uy+10*k,ease(q)));x.rotate(Math.sin(q*22)*.5);x.globalAlpha=1-q*.3;fishShape(16*k*(1-q*.3),'#8fc3d6');x.restore();x.globalAlpha=1}}
    x.globalCompositeOperation='lighter';glow(ux,uy+4*k,70*k,'rgba(120,255,215,.16)');x.globalCompositeOperation='source-over';
    x.save();x.translate(ux,uy);x.rotate(tilt);
    let g=x.createRadialGradient(-5*k,-14*k,1,0,-8*k,15*k);g.addColorStop(0,'rgba(230,255,255,.95)');g.addColorStop(1,'rgba(70,190,205,.6)');x.fillStyle=g;x.beginPath();x.ellipse(0,-5*k,13*k,12*k,0,Math.PI,0);x.fill();
    g=x.createLinearGradient(0,-9*k,0,9*k);g.addColorStop(0,'#eef2f8');g.addColorStop(.45,'#a3abc0');g.addColorStop(1,'#454b5e');x.fillStyle=g;x.beginPath();x.ellipse(0,0,36*k,9*k,0,0,7);x.fill();
    x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=1;x.beginPath();x.ellipse(0,-1*k,35*k,7*k,0,Math.PI*1.05,Math.PI*1.95);x.stroke();
    x.fillStyle='#343a4b';x.beginPath();x.ellipse(0,4*k,17*k,4.5*k,0,0,Math.PI);x.fill();
    x.globalCompositeOperation='lighter';
    for(let i=0;i<9;i++){const a=(i/9)*Math.PI+((et*2)%(Math.PI/9));const lx=Math.cos(a)*30*k,ly=Math.sin(a)*4.5*k+1*k;const c=['255,90,90','255,220,90','90,255,180'][(i+Math.floor(et*4))%3];
      const gg=x.createRadialGradient(lx,ly,0,lx,ly,5*k);gg.addColorStop(0,`rgba(${c},1)`);gg.addColorStop(1,`rgba(${c},0)`);x.fillStyle=gg;x.fillRect(lx-5*k,ly-5*k,10*k,10*k)}
    const ug=x.createRadialGradient(0,6*k,0,0,6*k,12*k);ug.addColorStop(0,'rgba(170,255,230,.9)');ug.addColorStop(1,'rgba(170,255,230,0)');x.fillStyle=ug;x.fillRect(-12*k,-6*k,24*k,24*k);
    x.globalCompositeOperation='source-over';x.restore()}},
  ship:{msg:'かもつせんが とおりすぎていく…',dur:75,layer:'sea',draw(p,st,et){
    const sx=lerp(-170*k,W+170*k,p),sy=hz+3*k,a=fade(p,.04,.04);x.globalAlpha=a;x.save();x.translate(sx,sy);const s=.8*k;
    x.fillStyle='#0a0d1b';x.beginPath();x.moveTo(-110*s,-4*s);x.lineTo(118*s,-4*s);x.lineTo(104*s,6*s);x.lineTo(-104*s,6*s);x.closePath();x.fill();
    const C=['#4d2a2c','#24414f','#4f4426','#383a40','#2c4a35'];for(let r=0;r<2;r++)for(let c=0;c<12;c++){x.fillStyle=C[(c*3+r*2)%5];x.fillRect(-72*s+c*14*s,-11*s-r*7*s,13*s,6.5*s)}
    x.fillStyle='#14182a';x.fillRect(-104*s,-26*s,22*s,22*s);x.fillRect(-98*s,-34*s,4*s,8*s);
    x.fillStyle='rgba(255,214,130,.95)';for(let r=0;r<3;r++)for(let c=0;c<4;c++)if((r*7+c*3)%5)x.fillRect(-101*s+c*5*s,-23*s+r*6*s,3*s,2.4*s);
    x.globalCompositeOperation='lighter';
    if(Math.sin(et*3)>.3)glow(110*s,-18*s,6*k,'rgba(255,70,60,.95)');glow(-96*s,-36*s,5*k,'rgba(255,255,255,.9)');x.fillStyle='rgba(30,30,40,1)';
    x.fillStyle='rgba(255,214,140,.12)';for(let c=0;c<5;c++)x.fillRect(-102*s+c*5*s+Math.sin(et*2+c)*1.5,8*s,2,(10+c%3*5)*s);
    x.globalCompositeOperation='source-over';x.restore();x.globalAlpha=1}},
  plane:{msg:'よぞらを ひこうきが とんでいく',dur:32,layer:'sky',draw(p,st,et){
    const px=lerp(W+60,-60,p),py=WT+WH*.13+p*14*k,s=k*.9;x.globalAlpha=fade(p,.05,.05);
    const cg=x.createLinearGradient(px,py,px+170*k,py-12*k);cg.addColorStop(0,'rgba(200,210,240,.22)');cg.addColorStop(1,'rgba(200,210,240,0)');x.strokeStyle=cg;x.lineWidth=2*k;x.beginPath();x.moveTo(px+8*s,py);x.lineTo(px+170*k,py-14*k);x.stroke();
    x.fillStyle='#262a40';x.beginPath();x.ellipse(px,py,10*s,1.6*s,0,0,7);x.fill();x.beginPath();x.moveTo(px-1*s,py);x.lineTo(px+4*s,py+6*s);x.lineTo(px+6*s,py+6*s);x.lineTo(px+3*s,py);x.fill();x.beginPath();x.moveTo(px+7*s,py);x.lineTo(px+10*s,py-4*s);x.lineTo(px+11*s,py-4*s);x.lineTo(px+10*s,py);x.fill();
    x.globalCompositeOperation='lighter';glow(px+5*s,py+6*s,5*k,'rgba(255,60,60,1)');glow(px+2*s,py-2*s,5*k,'rgba(60,255,120,.9)');
    if((et%1.2)<.08||((et%1.2)>.2&&(et%1.2)<.28))glow(px+10*s,py-3*s,10*k,'rgba(255,255,255,1)');if(Math.sin(et*6)>.6)glow(px,py+1.5*s,4*k,'rgba(255,90,60,.9)');
    x.globalCompositeOperation='source-over';x.globalAlpha=1}},
  dolphins:{msg:'イルカの むれが あらわれた！',dur:11,layer:'sea',draw(p,st,et){
    st.parts??=[];st.rip??=[];st.s??=[0,0,0,0,0,0];
    for(let i=0;i<3;i++){const q=(p-.06-i*.13)/.42;const x0=WL+WW*(.1+i*.17)+(i%2)*10*k,yb=seaY(.5+i*.08),len=90*k*(.8+i*.1),hgt=40*k*(.8+i*.1),sz=k*(.85+i*.12);
      if(q>0&&!st.s[i*2]){st.s[i*2]=1;splash(st,x0,yb,10)}if(q>1&&!st.s[i*2+1]){st.s[i*2+1]=1;splash(st,x0+len,yb,14)}
      if(q<=0||q>=1)continue;const px=x0+q*len,py=yb-Math.sin(q*Math.PI)*hgt,ang=Math.atan2(-Math.cos(q*Math.PI)*hgt*Math.PI,len);
      x.save();x.beginPath();x.rect(0,0,W,yb);x.clip();x.translate(px,py);x.rotate(ang);x.scale(sz,sz);
      const g=x.createLinearGradient(0,-7,0,7);g.addColorStop(0,'#3d4c66');g.addColorStop(.6,'#6d7d96');g.addColorStop(1,'#b9c4d4');x.fillStyle=g;
      x.beginPath();x.moveTo(26,0);x.quadraticCurveTo(22,-6,8,-7);x.quadraticCurveTo(-10,-8,-22,-2);x.lineTo(-30,-7);x.lineTo(-27,0);x.lineTo(-30,7);x.lineTo(-22,2);x.quadraticCurveTo(-6,7,10,6);x.quadraticCurveTo(22,5,26,1);x.lineTo(32,1.5);x.lineTo(32,-.5);x.closePath();x.fill();
      x.fillStyle='#34425a';x.beginPath();x.moveTo(0,-7);x.quadraticCurveTo(-3,-15,-8,-16);x.quadraticCurveTo(-6,-10,-7,-6.5);x.fill();x.beginPath();x.moveTo(8,4);x.lineTo(2,10);x.lineTo(4,4);x.fill();
      x.fillStyle='#0b0f1a';x.beginPath();x.arc(20,-2,1,0,7);x.fill();x.strokeStyle='rgba(255,240,210,.35)';x.lineWidth=.8;x.beginPath();x.moveTo(20,-6);x.quadraticCurveTo(0,-9,-18,-4);x.stroke();
      x.restore();if(Math.random()<.4)st.parts.push({x:px-Math.cos(ang)*22*sz,y:py-Math.sin(ang)*22*sz,vx:0,vy:0,l:.5})}
    parts(st)}},
  dog:{msg:'いぬが あそびに きた！',dur:24,layer:'beach',draw(p,st,et){
    const[fx,fy]=fireP(),gy=WT+WH*.985,sitX=fx-62*k;let dx,mode,dir=1;
    if(p<.3){dx=lerp(-50*k,sitX,ease(p/.3));mode=p<.27?'run':'sit'}else if(p<.74){dx=sitX;mode='sit'}else{dx=lerp(sitX,W+60*k,Math.pow((p-.74)/.26,1.3));mode='run'}
    const s=k*.95,ph=et*13;x.globalAlpha=fade(p,.02,.02);
    x.fillStyle='rgba(0,0,0,.35)';x.beginPath();x.ellipse(dx,gy+1*k,22*s,4*s,0,0,7);x.fill();
    x.save();x.translate(dx,gy);x.scale(dir,1);
    const body='#8b5a34',dark='#5a3820',lit='#c4874f';
    if(mode==='run'){const b=Math.sin(ph)*2*s;
      x.strokeStyle=dark;x.lineWidth=3.2*s;x.lineCap='round';
      [[-12,Math.sin(ph)],[-9,Math.sin(ph+1)],[10,Math.sin(ph+Math.PI)],[13,Math.sin(ph+Math.PI+1)]].forEach(([lx,a])=>{x.beginPath();x.moveTo(lx*s,-12*s+b);x.lineTo(lx*s+a*7*s,-1*s);x.stroke()});
      x.fillStyle=body;x.beginPath();x.ellipse(0,-15*s+b,17*s,7*s,-.05,0,7);x.fill();x.fillStyle=lit;x.beginPath();x.ellipse(2*s,-18*s+b,12*s,3*s,0,0,7);x.fill();
      x.strokeStyle=body;x.lineWidth=3*s;x.beginPath();x.moveTo(-16*s,-17*s+b);x.quadraticCurveTo(-24*s,-22*s+b+Math.sin(ph*1.3)*3*s,-26*s,-26*s+b);x.stroke();
      x.fillStyle=body;x.beginPath();x.ellipse(18*s,-23*s+b,7*s,6*s,0,0,7);x.fill();x.beginPath();x.ellipse(25*s,-21*s+b,5*s,3.2*s,0,0,7);x.fill();
      x.fillStyle=dark;x.beginPath();x.ellipse(15*s,-24*s+b,3*s,6*s,.5+Math.sin(ph)*.3,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(29*s,-22*s+b,1.5*s,0,7);x.fill();x.beginPath();x.arc(20*s,-25*s+b,1*s,0,7);x.fill()}
    else{const w=Math.sin(et*14)*.7;
      x.strokeStyle=body;x.lineWidth=3*s;x.lineCap='round';x.beginPath();x.moveTo(-12*s,-5*s);x.quadraticCurveTo(-22*s,-4*s+w*4*s,-24*s+w*4*s,-10*s);x.stroke();
      x.fillStyle=body;x.beginPath();x.ellipse(-6*s,-8*s,10*s,8*s,0,0,7);x.fill();x.beginPath();x.ellipse(2*s,-17*s,8*s,12*s,-.35,0,7);x.fill();
      x.fillStyle=lit;x.beginPath();x.ellipse(6*s,-17*s,4*s,8*s,-.35,0,7);x.fill();
      x.strokeStyle=dark;x.lineWidth=3*s;x.beginPath();x.moveTo(6*s,-12*s);x.lineTo(7*s,-1*s);x.moveTo(10*s,-12*s);x.lineTo(11*s,-1*s);x.stroke();
      const hb=Math.sin(et*2)*1*s;x.fillStyle=body;x.beginPath();x.ellipse(9*s,-30*s+hb,7*s,6.5*s,0,0,7);x.fill();x.beginPath();x.ellipse(15*s,-28*s+hb,5*s,3.4*s,0,0,7);x.fill();
      x.fillStyle=dark;x.beginPath();x.ellipse(5*s,-30*s+hb,3*s,6.5*s,.3,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(19.5*s,-29*s+hb,1.6*s,0,7);x.fill();x.beginPath();x.arc(11*s,-32*s+hb,1.1*s,0,7);x.fill();
      x.fillStyle='rgba(255,255,255,.8)';x.beginPath();x.arc(11.4*s,-32.4*s+hb,.4*s,0,7);x.fill();
      if(p>.4&&p<.5||p>.6&&p<.66){x.restore();x.save();x.font=`${Math.round(12*k)}px DotGothic16, monospace`;x.fillStyle='#fff3dc';x.fillText('ワン！',dx+14*k,gy-44*k);}}
    x.restore();x.globalAlpha=1}},
  whale:{msg:'とおくで クジラが しおを ふいた！',dur:18,layer:'sea',draw(p,st,et){
    st.parts??=[];st.rip??=[];const wx=WL+WW*.64,wy=seaY(.25),s=k*1.05;
    if(p>.05&&p<.32){for(let i=0;i<3;i++)st.parts.push({x:wx+G()*2*s,y:wy-2*s,vx:G()*.5*s,vy:-R(2.2,3.4)*s,l:1})}
    if(p>.22&&p<.55){const q=(p-.22)/.33,hh=Math.sin(q*Math.PI)*9*s;x.save();x.beginPath();x.rect(0,0,W,wy);x.clip();x.fillStyle='#2a3352';x.beginPath();x.ellipse(wx+lerp(-10,20,q)*s,wy+2*s,34*s,hh+2*s,0,Math.PI,0);x.fill();
      x.fillStyle='rgba(200,215,255,.2)';x.beginPath();x.ellipse(wx+lerp(-10,20,q)*s,wy-hh+2*s,22*s,1.2*s,0,0,7);x.fill();x.restore();if(Math.random()<.2)st.rip.push({x:wx+R(-20,20)*s,y:wy,r:4*s,l:.8})}
    if(p>.55&&p<.86){const q=(p-.55)/.31,ty=wy-Math.sin(q*Math.PI)*30*s,tx=wx+30*s;x.save();x.beginPath();x.rect(0,0,W,wy);x.clip();x.translate(tx,ty);x.rotate((q-.5)*.5);x.fillStyle='#2a3352';
      x.fillRect(-3*s,0,6*s,40*s);x.beginPath();x.moveTo(0,2*s);x.quadraticCurveTo(-10*s,-4*s,-24*s,-2*s);x.quadraticCurveTo(-14*s,4*s,0,8*s);x.quadraticCurveTo(14*s,4*s,24*s,-2*s);x.quadraticCurveTo(10*s,-4*s,0,2*s);x.fill();x.restore();
      if(Math.random()<.5)st.parts.push({x:tx+R(-20,20)*s,y:ty,vx:0,vy:.5,l:.7});if(q>.85&&!st.sp){st.sp=1;splash(st,tx,wy,14,.8)}}
    parts(st)}},
  meteors:{msg:'りゅうせいぐんだ！ ねがいごとを…',dur:14,layer:'sky',draw(p,st,et){
    st.m??=[];if(p<.85&&Math.random()<.09)st.m.push({x:R(WL-40,W),y:R(0,hz*.55),vx:-R(5,8)*k,vy:R(2.5,4)*k,l:1});
    x.globalCompositeOperation='lighter';for(const m of st.m){m.x+=m.vx;m.y+=m.vy;m.l-=.03;const g=x.createLinearGradient(m.x,m.y,m.x-m.vx*9,m.y-m.vy*9);g.addColorStop(0,`rgba(255,255,240,${m.l})`);g.addColorStop(1,'rgba(180,200,255,0)');
      x.strokeStyle=g;x.lineWidth=1.6*k;x.beginPath();x.moveTo(m.x,m.y);x.lineTo(m.x-m.vx*9,m.y-m.vy*9);x.stroke()}st.m=st.m.filter(m=>m.l>0);x.globalCompositeOperation='source-over'}},
  turtle:{msg:'ウミガメが うみへ かえっていく',dur:40,layer:'beach',draw(p,st,et){
    st.tr??=[];const pr=ease(clamp(p/.9)),sx=WL+WW*.6,y0=WT+WH*1.0,y1=shore+6*k,tx=sx+Math.sin(pr*3)*10*k,ty=lerp(y0,y1,pr),sc=lerp(1,.55,pr)*k,ph=et*3;
    if(!st.last||Math.hypot(tx-st.last[0],ty-st.last[1])>4*k){st.tr.push([tx,ty,sc]);st.last=[tx,ty]}
    x.fillStyle='rgba(20,14,20,.35)';for(const[a,b,c]of st.tr){x.fillRect(a-9*c,b+2*c,2*c,1.5*c);x.fillRect(a+7*c,b+2*c,2*c,1.5*c)}
    x.globalAlpha=clamp((1-p)/.12)*clamp(p/.04);x.save();x.translate(tx,ty);x.scale(sc,sc);
    x.fillStyle='#3c4636';[[-13,-2,Math.sin(ph)],[13,-2,-Math.sin(ph)],[-10,7,-Math.sin(ph)],[10,7,Math.sin(ph)]].forEach(([a,b,w])=>{x.save();x.translate(a,b);x.rotate(w*.5+(a<0?-.6:.6));x.beginPath();x.ellipse(a<0?-4:4,0,7,2.6,0,0,7);x.fill();x.restore()});
    x.fillStyle='#4a5338';x.beginPath();x.ellipse(0,-11,4,4.5,0,0,7);x.fill();
    const g=x.createRadialGradient(-3,-4,1,0,0,13);g.addColorStop(0,'#6b6a45');g.addColorStop(1,'#323626');x.fillStyle=g;x.beginPath();x.ellipse(0,0,12,10,0,0,7);x.fill();
    x.strokeStyle='rgba(20,22,14,.6)';x.lineWidth=.8;x.beginPath();x.moveTo(-5,-6);x.lineTo(5,-6);x.lineTo(7,1);x.lineTo(0,6);x.lineTo(-7,1);x.closePath();x.moveTo(-5,-6);x.lineTo(-10,-3);x.moveTo(5,-6);x.lineTo(10,-3);x.moveTo(7,1);x.lineTo(11,4);x.moveTo(-7,1);x.lineTo(-11,4);x.stroke();
    x.fillStyle='rgba(255,170,90,.18)';x.beginPath();x.ellipse(-4,-3,6,3,-.4,0,7);x.fill();x.restore();x.globalAlpha=1}},
  crab:{msg:'カニが よこぎっていく',dur:18,layer:'beach',draw(p,st,et){
    const q=p*7,pr=(Math.floor(q)+ease(clamp((q%1)*1.5)))/7,moving=(q%1)<.66,cx=lerp(WL-30*k,WL+WW+30*k,pr),cy=WT+WH*.86,s=k*1.6;x.globalAlpha=fade(p,.02,.02);
    x.fillStyle='rgba(0,0,0,.3)';x.beginPath();x.ellipse(cx,cy+1*s,12*s,2.5*s,0,0,7);x.fill();
    x.save();x.translate(cx,cy);x.strokeStyle='#8f2f1c';x.lineWidth=1.6*s;x.lineCap='round';
    for(let i=0;i<3;i++)for(const sd of[-1,1]){const w=moving?Math.sin(et*20+i*2+(sd>0?1:0))*2*s:0;x.beginPath();x.moveTo(sd*6*s,-5*s+i*1.5*s);x.lineTo(sd*11*s,-6*s+i*2*s+w);x.lineTo(sd*13*s,-1*s+i*.5*s);x.stroke()}
    const g=x.createRadialGradient(-2*s,-9*s,1,0,-6*s,10*s);g.addColorStop(0,'#ea7a4a');g.addColorStop(1,'#a5381f');x.fillStyle=g;x.beginPath();x.ellipse(0,-6*s,9*s,5.5*s,0,0,7);x.fill();
    x.strokeStyle='#a5381f';x.lineWidth=1.2*s;x.beginPath();x.moveTo(-2.5*s,-10*s);x.lineTo(-3*s,-14*s);x.moveTo(2.5*s,-10*s);x.lineTo(3*s,-14*s);x.stroke();x.fillStyle='#111';x.beginPath();x.arc(-3*s,-14.5*s,1.2*s,0,7);x.arc(3*s,-14.5*s,1.2*s,0,7);x.fill();
    const o=(Math.sin(et*5)*.5+.5)*.5;for(const sd of[-1,1]){x.fillStyle='#c4502e';x.save();x.translate(sd*10*s,-12*s);x.beginPath();x.ellipse(0,0,3.6*s,2.6*s,0,0,7);x.fill();x.rotate(sd*o);x.beginPath();x.ellipse(sd*2*s,-2*s,2.6*s,1.2*s,sd*-.6,0,7);x.fill();x.restore()}
    x.restore();x.globalAlpha=1}},
  lanterns:{msg:'スカイランタンが のぼっていく',dur:32,layer:'sky',draw(p,st,et){
    st.L??=Array.from({length:12},(_,i)=>({x:WL+WW*R(.1,.9),d:R(0,.35),sw:R(0,6),sp:R(.55,.75)}));
    x.globalCompositeOperation='lighter';
    for(const l of st.L){const q=(p-l.d)/l.sp;if(q<=0||q>=1)continue;const ly=lerp(shore+10*k,WT-30*k,ease(q)*.9+q*.1),lx=l.x+Math.sin(et*.6+l.sw)*10*k+q*20*k,sz=lerp(1.1,.4,q)*k,a=clamp(q/.08)*clamp((1-q)/.2),f=.85+.15*Math.sin(et*7+l.sw);
      x.globalAlpha=a;glow(lx,ly,34*sz*f,'rgba(255,120,40,.6)');const g=x.createLinearGradient(0,ly-9*sz,0,ly+8*sz);g.addColorStop(0,'rgba(200,80,30,.75)');g.addColorStop(1,'rgba(255,190,90,.95)');x.fillStyle=g;
      x.beginPath();x.moveTo(lx-6*sz,ly-9*sz);x.lineTo(lx+6*sz,ly-9*sz);x.lineTo(lx+4.5*sz,ly+8*sz);x.lineTo(lx-4.5*sz,ly+8*sz);x.closePath();x.fill();glow(lx,ly+6*sz,4*sz,'rgba(255,255,220,1)')}
    x.globalAlpha=1;x.globalCompositeOperation='source-over'}},
  birds:{msg:'鳥の むれが 空を よこぎる',dur:16,layer:'sky',draw(p,st,et){
    const cx=lerp(-80*k,W+80*k,p),cy=moonY+lerp(18,-10,p)*k;x.globalAlpha=fade(p,.04,.04);x.strokeStyle=dark>.5?'#05060f':'#f6f6f2';x.lineCap='round';
    [[0,0],[-12,6],[-24,12],[-36,18],[-12,-6],[-24,-12],[-36,-17]].forEach(([dx,dy],i)=>{const bx=cx+dx*k,by=cy+dy*k+Math.sin(et*2+i)*1.5*k,f=Math.sin(et*8+i*.9),w=6*k;
      x.lineWidth=1.6*k;x.beginPath();x.moveTo(bx-w,by-f*3*k);x.quadraticCurveTo(bx-w*.5,by-2.5*k-f*2*k,bx,by);x.quadraticCurveTo(bx+w*.5,by-2.5*k-f*2*k,bx+w,by-f*3*k);x.stroke()});x.globalAlpha=1}},
  biolum:{msg:'うみが あおく ひかりだした…',dur:24,layer:'sea',draw(p,st,et){
    st.sp??=Array.from({length:60},()=>({px:R(0,W),f:R(.55,1),ph:R(0,6),o:R(-4,10)}));const a=fade(p,.15,.25);x.globalCompositeOperation='lighter';
    for(const[w,al]of[[10,.08],[5,.16],[2,.4]]){x.strokeStyle=`rgba(80,220,255,${al*a})`;x.lineWidth=w*k;x.beginPath();for(let px=0;px<=W+10;px+=10)x.lineTo(px,waveY(px));x.stroke()}
    x.strokeStyle=`rgba(80,200,255,${.12*a})`;x.lineWidth=3*k;x.beginPath();for(let px=0;px<=W+10;px+=10)x.lineTo(px,waveY(px)-(10+Math.sin(t*.7)*4)*k+Math.sin(px*.015-t)*2*k);x.stroke();
    for(const q of st.sp){const yy=waveY(q.px)+q.o*k-(1-q.f)*30*k;x.globalAlpha=a*(.3+.3*Math.sin(et*.8+q.ph));glow(q.px,yy,5*k,'rgba(110,235,255,.9)')}
    x.globalAlpha=1;x.globalCompositeOperation='source-over'}},
  fishing:{msg:'りょうせんの あかりが ゆれている',dur:48,layer:'sea',draw(p,st,et){
    const bx=lerp(W+60*k,-60*k,p),by=seaY(.45)+Math.sin(et*1.4)*1.5*k,s=k*.9,r=Math.sin(et*1.1)*.05;x.globalAlpha=fade(p,.05,.05);
    x.globalCompositeOperation='lighter';for(let i=0;i<10;i++){x.fillStyle=`rgba(255,200,110,${.12-i*.01})`;x.fillRect(bx-8*s+Math.sin(et*2+i)*3*s,by+4*s+i*3*s,(14-i)*s,1.4*s)}x.globalCompositeOperation='source-over';
    x.save();x.translate(bx,by);x.rotate(r);x.fillStyle='#1c140f';x.beginPath();x.moveTo(-22*s,-4*s);x.lineTo(22*s,-4*s);x.lineTo(16*s,3*s);x.lineTo(-17*s,3*s);x.closePath();x.fill();
    x.fillStyle='#0d0b10';x.beginPath();x.arc(4*s,-11*s,2.6*s,0,7);x.fill();x.fillRect(2*s,-9*s,4.5*s,6*s);x.strokeStyle='#0d0b10';x.lineWidth=1;x.beginPath();x.moveTo(6*s,-8*s);x.lineTo(24*s,-22*s);x.stroke();
    x.strokeStyle='rgba(220,220,240,.3)';x.beginPath();x.moveTo(24*s,-22*s);x.quadraticCurveTo(30*s,-8*s,30*s,4*s);x.stroke();
    x.strokeStyle='#0d0b10';x.beginPath();x.moveTo(-16*s,-4*s);x.lineTo(-16*s,-18*s);x.lineTo(-11*s,-18*s);x.stroke();
    x.globalCompositeOperation='lighter';glow(-11*s,-14*s,22*s*(.9+.1*Math.sin(et*6)),'rgba(255,190,90,.5)');glow(-11*s,-14*s,3*s,'rgba(255,240,200,1)');x.globalCompositeOperation='source-over';x.restore();x.globalAlpha=1}},
  bottle:{msg:'ボトルメールが ながれついた！',dur:24,layer:'beach',draw(p,st,et){
    const bx0=WL+WW*.56,s=k;let bx,by,ang,inWater=true;
    if(p<.62){const q=p/.62;bx=bx0+Math.sin(q*4)*8*k;by=lerp(seaY(.25),waveY(bx0)-2*k,ease(q))+Math.sin(et*2.2)*2*k;ang=Math.sin(et*1.6)*.5+.3}
    else{inWater=false;const q=clamp((p-.62)/.08);bx=bx0+8*k*q;by=lerp(waveY(bx0)-2*k,shore+14*k,ease(q));ang=lerp(.3,1.35,q)}
    x.globalAlpha=clamp((1-p)/.1)*clamp(p/.05);x.save();x.translate(bx,by);x.rotate(ang);x.scale(s,s);
    if(inWater){x.save();x.rotate(-ang);x.strokeStyle='rgba(210,225,255,.3)';x.lineWidth=1;x.beginPath();x.ellipse(0,3,10,2,0,0,7);x.stroke();x.restore()}
    const g=x.createLinearGradient(-4,0,4,0);g.addColorStop(0,'rgba(60,140,90,.75)');g.addColorStop(.4,'rgba(150,230,170,.6)');g.addColorStop(1,'rgba(40,100,70,.8)');x.fillStyle=g;
    x.beginPath();x.roundRect(-4.5,-6,9,16,3);x.fill();x.fillRect(-2,-11,4,6);x.fillStyle='#a0703f';x.fillRect(-2.2,-13,4.4,3);
    x.fillStyle='rgba(245,230,200,.9)';x.fillRect(-2,-3,4,10);x.fillStyle='#b33';x.fillRect(-2,1,4,1.2);
    x.restore();if(!inWater){x.globalCompositeOperation='lighter';x.globalAlpha*=.5+.5*Math.sin(et*2);glow(bx-2*k,by-4*k,8*k,'rgba(255,255,230,.8)');x.globalCompositeOperation='source-over'}x.globalAlpha=1}},
  rocket:{msg:'とおくで ロケットが うちあがった！',dur:22,layer:'sky',draw(p,st,et){
    st.sm??=[];const sx=WL+WW*.2,sy=hz-6*k,q=clamp((p-.05)/.8),rx=sx+q*q*140*k,ry=lerp(sy,WT-80*k,Math.pow(q,1.5)),ang=Math.atan2(2*q*140*k,-(1.5*Math.pow(q,.5)*(sy-WT+80*k))||-1);
    if(p<.12){x.globalCompositeOperation='lighter';glow(sx,sy,60*k*(p/.12),'rgba(255,170,90,.35)');x.globalCompositeOperation='source-over'}
    if(q>0&&q<1)st.sm.push({x:rx,y:ry+4*k,r:2*k,l:1});
    for(const m of st.sm){m.r+=.12*k;m.l-=.004;const g=x.createRadialGradient(m.x,m.y,0,m.x,m.y,m.r);g.addColorStop(0,`rgba(200,190,210,${m.l*.25})`);g.addColorStop(1,'rgba(200,190,210,0)');x.fillStyle=g;x.fillRect(m.x-m.r,m.y-m.r,m.r*2,m.r*2)}st.sm=st.sm.filter(m=>m.l>0);
    if(q>0&&q<1){x.globalCompositeOperation='lighter';const f=.8+.2*Math.sin(et*30);glow(rx,ry+5*k,20*k*f,'rgba(255,180,80,.6)');glow(rx,ry+4*k,5*k,'rgba(255,255,230,1)');x.globalCompositeOperation='source-over';
      x.save();x.translate(rx,ry);x.rotate(Math.atan2(140*2*q,(sy-WT+80*k)/k*1.5*Math.sqrt(q)));x.fillStyle='#d8dbe6';x.fillRect(-1.2*k,-7*k,2.4*k,8*k);x.beginPath();x.moveTo(-1.2*k,-7*k);x.lineTo(0,-10*k);x.lineTo(1.2*k,-7*k);x.fill();x.restore()}}},
  };
  Object.assign(EV,{
   kite:{msg:'たこあげ してる人が いる🪁',dur:30,layer:'sky',when:'day',draw(p,st,et){const a=fade(p,.08,.1),kx=WL+WW*(.25+p*.4)+Math.sin(et*.7)*20*k,ky=hz*.35+Math.sin(et*1.1)*14*k,ax=WL+WW*.3,ay=shore+30*k;x.globalAlpha=a;
     x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.8;x.beginPath();x.moveTo(ax,ay);x.quadraticCurveTo((ax+kx)/2,ky+60*k,kx,ky+16*k);x.stroke();
     x.save();x.translate(kx,ky);x.rotate(Math.sin(et*1.3)*.2);const C=['#ff5c8a','#ffd23f','#3e8fc4','#55e0b4'];[[0,-18,12,0],[12,0,0,22],[0,22,-12,0],[-12,0,0,-18]].forEach(([a1,b1,a2,b2],n)=>{x.fillStyle=C[n];x.beginPath();x.moveTo(0,0);x.lineTo(a1*k,b1*k);x.lineTo(a2*k,b2*k);x.fill()});
     x.strokeStyle='#ff5c8a';x.lineWidth=1.4*k;x.beginPath();x.moveTo(0,22*k);for(let i=1;i<8;i++)x.lineTo(Math.sin(et*4+i)*5*k,22*k+i*7*k);x.stroke();x.restore();x.globalAlpha=1}},
   surfer:{msg:'サーファーが 波に 乗ってる🏄',dur:16,layer:'sea',when:'day',draw(p,st,et){const sx=lerp(-30*k,W+30*k,p),sy=seaY(.62)+Math.sin(et*2)*2*k,a=fade(p,.05,.05);x.globalAlpha=a;
     x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.ellipse(sx-16*k,sy+4*k,22*k,4*k,0,0,7);x.fill();
     x.fillStyle='#ff7a3c';x.beginPath();x.ellipse(sx,sy+2*k,14*k,2.6*k,-.1,0,7);x.fill();x.strokeStyle='#2a1d14';x.lineWidth=2.2*k;x.lineCap='round';
     x.beginPath();x.moveTo(sx-4*k,sy);x.lineTo(sx-1*k,sy-9*k);x.lineTo(sx+4*k,sy);x.moveTo(sx-1*k,sy-9*k);x.lineTo(sx,sy-17*k);x.moveTo(sx,sy-14*k);x.lineTo(sx-8*k,sy-12*k);x.moveTo(sx,sy-14*k);x.lineTo(sx+8*k,sy-16*k);x.stroke();
     x.fillStyle='#2a1d14';x.beginPath();x.arc(sx,sy-20*k,3*k,0,7);x.fill();x.globalAlpha=1}},
   rainbow:{msg:'虹が 出た！🌈',dur:40,layer:'sky',when:'day',draw(p){const a=fade(p,.15,.2),cx=WL+WW*.55,cy=hz+WH*.05,R0=WW*.48;x.save();
     ['255,80,80','255,170,60','255,235,90','110,220,120','90,170,255','150,110,230'].forEach((c,i)=>{x.strokeStyle=`rgba(${c},${.22*a})`;x.lineWidth=4.5*k;x.beginPath();x.arc(cx,cy,R0-i*4.2*k,Math.PI,0);x.stroke()});x.restore()}}
  });

  // ---- time-of-day events, batch 2 ----
  const HAIRS=['#2a1c14','#5a3a22','#1c1c24','#7a4a24','#c9a060','#3a2a2a'];
  const tone2=(c,f)=>mixc(c,f>0?'#ffffff':'#000000',Math.abs(f));
  const human=(hx,hy,sc,ph,shirt,skin,run,dir=1,o={})=>{const nt=dark>.5,S2=c=>nt?mixc(c,'#1a1830',.5):c;
    // 見た目の 個性（色から 決まるので 同じ人は いつも 同じ）
    const hs=(shirt.charCodeAt(1)*13+shirt.charCodeAt(3)*7+shirt.charCodeAt(5)*3+skin.charCodeAt(2)*5)>>>0;
    const formal0=0,formal=['#f4f4f4','#ffffff','#1a1a22','#1e2a44','#2a3a6a','#3a3a3a'].includes(shirt),hat=o.hat!==undefined?o.hat:(formal?null:hs%9===1?'straw':hs%9===5?'cap':null),pony=o.long!=null?o.long:hs%5===2,stripe=!formal&&hs%6===3,shorts=o.shorts!=null?o.shorts:(!o.pants&&!formal&&hs%3===0);
    const hair=S2(o.hair||HAIRS[(shirt.charCodeAt(1)*7+shirt.charCodeAt(4))%HAIRS.length]),pants=S2(o.pants||(shorts?['#33405e','#5a7fa0','#c9a878','#2c3e30'][hs%4]:'#33405e')),sh=S2(shirt),sk=S2(skin),shoe=S2(hs%4===1?'#f0ece4':'#2a2228');
    const idle=!run&&Math.abs(Math.sin(ph))<.02,br=idle?Math.sin(t*1.6+hs)*.25*sc:0;
    const sw=Math.sin(ph)*(run?1:.55),bob=Math.abs(Math.cos(ph))*(run?2.2:.7)*sc,lean=run?.16:.02;
    x.save();x.translate(hx,hy-bob);x.scale(dir,1);x.rotate(lean);x.lineCap='round';x.lineJoin='round';
    // 足もとの 接地影
    x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.ellipse(.5*sc,.4*sc+bob,4.2*sc,1*sc,0,0,7);x.fill();
    const leg=(a,back)=>{const kx=Math.sin(a)*4.2*sc,ky=-6.2*sc+(run?Math.max(0,Math.sin(a))*-1.5*sc:0),fx=kx+(run?(a<0?-3.5:1)*sc*Math.abs(Math.sin(a)):Math.sin(a)*1.2*sc),fy=run?-Math.max(0,-Math.sin(a))*3.5*sc:0,px0=a>0?.6*sc:-.6*sc;
      const pc=back?tone2(pants,-.25):pants,lc=back?tone2(sk,-.22):sk;
      if(shorts){x.strokeStyle=pc;x.lineWidth=3.3*sc;x.beginPath();x.moveTo(px0,-12.5*sc);x.lineTo(px0+(kx-px0)*.55,-12.5*sc+(ky+12.5*sc)*.55);x.stroke();x.strokeStyle=lc;x.lineWidth=2.3*sc;x.beginPath();x.moveTo(px0+(kx-px0)*.5,-12.5*sc+(ky+12.5*sc)*.5);x.lineTo(kx,ky);x.lineTo(fx,fy-.8*sc);x.stroke()}
      else{x.strokeStyle=pc;x.lineWidth=3*sc;x.beginPath();x.moveTo(px0,-12.5*sc);x.lineTo(kx,ky);x.lineTo(fx,fy-.8*sc);x.stroke();x.strokeStyle=tone2(pc,.12);x.lineWidth=.6*sc;x.beginPath();x.moveTo(px0+.8*sc,-12*sc);x.lineTo(kx+.8*sc,ky);x.stroke()}
      x.fillStyle=back?tone2(shoe,-.2):shoe;x.beginPath();x.ellipse(fx+1.2*sc,fy-.6*sc,2.5*sc,1.25*sc,0,0,7);x.fill();x.fillStyle=tone2(shoe,.25);x.fillRect(fx-.8*sc,fy-.3*sc,4*sc,.45*sc)};
    const arm=(a,back)=>{const ex=Math.sin(a)*3.6*sc,ey=-16.5*sc,hx2=ex+(run?2.6*sc:Math.sin(a)*1.4*sc),hy2=run?-14.5*sc-Math.max(0,Math.sin(a))*2*sc:-11.6*sc;
      const ac=back?tone2(sh,-.25):sh,kc=back?tone2(sk,-.2):sk;x.strokeStyle=ac;x.lineWidth=2.5*sc;x.beginPath();x.moveTo(0,-21*sc+br);x.lineTo(ex*.55,-21*sc+(ey+21*sc)*.55);x.stroke();
      x.strokeStyle=kc;x.lineWidth=1.8*sc;x.beginPath();x.moveTo(ex*.5,-21*sc+(ey+21*sc)*.5);x.lineTo(ex,ey);x.lineTo(hx2,hy2);x.stroke();x.fillStyle=kc;x.beginPath();x.arc(hx2,hy2,1.05*sc,0,7);x.fill()};
    leg(-sw,true);arm(sw,true);
    // 胴体（やわらかい 陰影・しわ・えり）
    const g=x.createLinearGradient(-4*sc,-23*sc,4*sc,-12*sc);g.addColorStop(0,tone2(sh,.16));g.addColorStop(.6,sh);g.addColorStop(1,tone2(sh,-.2));x.fillStyle=g;
    x.beginPath();x.moveTo(-3.4*sc,-11.8*sc);x.quadraticCurveTo(-4.7*sc,-18*sc,-3.7*sc,-22.4*sc+br);x.quadraticCurveTo(0,-23.8*sc+br,3.7*sc,-22.4*sc+br);x.quadraticCurveTo(4.7*sc,-18*sc,3.4*sc,-11.8*sc);x.closePath();x.fill();
    if(stripe){x.save();x.clip();x.fillStyle=tone2(sh,.45);for(let i=0;i<4;i++)x.fillRect(-5*sc,(-21+i*2.6)*sc,10*sc,.8*sc);x.restore()}
    x.strokeStyle=tone2(sh,-.28);x.lineWidth=.45*sc;x.beginPath();x.moveTo(-1.5*sc,-19*sc);x.quadraticCurveTo(-.6*sc,-16*sc,-1.8*sc,-13.4*sc);x.stroke();
    x.fillStyle=tone2(sk,-.06);x.beginPath();x.moveTo(-1.6*sc,-22.9*sc+br);x.lineTo(1.6*sc,-22.9*sc+br);x.lineTo(0,-21.2*sc+br);x.fill();
    x.fillStyle=pants;x.fillRect(-3.4*sc,-13*sc,6.8*sc,1.7*sc);x.fillStyle=tone2(pants,-.3);x.fillRect(-3.4*sc,-11.6*sc,6.8*sc,.3*sc);
    leg(sw,false);
    // 首・頭・顔
    const hb=br*.8;x.fillStyle=tone2(sk,-.12);x.fillRect(-.9*sc,-24.6*sc+hb,1.8*sc,2.4*sc);
    const hg=x.createRadialGradient(1.6*sc,-28.4*sc+hb,.4*sc,.6*sc,-27.4*sc+hb,4*sc);hg.addColorStop(0,tone2(sk,.12));hg.addColorStop(1,tone2(sk,-.08));x.fillStyle=hg;x.beginPath();x.ellipse(.6*sc,-27.4*sc+hb,3.3*sc,3.7*sc,0,0,7);x.fill();
    x.fillStyle=sk;x.beginPath();x.ellipse(3.6*sc,-27*sc+hb,.7*sc,.6*sc,0,0,7);x.fill();
    x.fillStyle=hair;x.beginPath();x.ellipse(-.2*sc,-28.6*sc+hb,3.65*sc,3.05*sc,-.15,Math.PI*.95,Math.PI*2.15);x.quadraticCurveTo(-3.8*sc,-26*sc+hb,-3.2*sc,-24.8*sc+hb);x.fill();
    x.fillStyle=tone2(hair,.22);x.beginPath();x.ellipse(.4*sc,-30.6*sc+hb,1.8*sc,.6*sc,-.2,0,7);x.fill();
    if(pony){x.fillStyle=hair;const pw=Math.sin(t*3+hs)*.15+(run?.4:0);x.save();x.translate(-3*sc,-27.6*sc+hb);x.rotate(.3+pw);x.beginPath();x.ellipse(-.6*sc,2.6*sc,1.5*sc,3.6*sc,.1,0,7);x.fill();x.restore();x.fillStyle=S2('#ff7a9a');x.beginPath();x.arc(-3*sc,-27.4*sc+hb,.6*sc,0,7);x.fill()}
    x.fillStyle=tone2(sk,-.18);x.beginPath();x.arc(-.6*sc,-27*sc+hb,.75*sc,0,7);x.fill();
    if(!nt){x.fillStyle='#1a1414';x.beginPath();x.ellipse(2.5*sc,-27.6*sc+hb,.42*sc,(t*.6+hs)%4<.12?.1*sc:.5*sc,0,0,7);x.fill();x.fillStyle='rgba(255,120,120,.35)';x.beginPath();x.arc(2.2*sc,-26.2*sc+hb,.75*sc,0,7);x.fill();
      x.strokeStyle='rgba(90,40,30,.6)';x.lineWidth=.35*sc;x.beginPath();x.arc(2.8*sc,-25.6*sc+hb,.55*sc,.2,1.6);x.stroke()}
    if(hat==='straw'){x.fillStyle=S2('#e8cf86');x.beginPath();x.ellipse(.4*sc,-29.6*sc+hb,5.6*sc,1.2*sc,-.08,0,7);x.fill();x.beginPath();x.ellipse(.2*sc,-30.8*sc+hb,3.1*sc,2*sc,0,Math.PI,0);x.fill();x.fillStyle=S2('#c0392b');x.fillRect(-2.9*sc,-30.2*sc+hb,6.2*sc,.7*sc)}
    else if(hat==='cap'){const cc=S2(['#2f6fd0','#d23b3b','#2a2a2a','#f2c14e'][hs%4]);x.fillStyle=cc;x.beginPath();x.ellipse(.2*sc,-29.6*sc+hb,3.5*sc,2.3*sc,0,Math.PI,0);x.fill();x.beginPath();x.ellipse(3.6*sc,-29.4*sc+hb,2.6*sc,.65*sc,.05,0,7);x.fill()}
    arm(-sw,false);
    // 焚き火の 照り返し（夜）・日の光（昼）
    x.strokeStyle=nt?'rgba(255,170,90,.38)':'rgba(255,255,240,.32)';x.lineWidth=.7*sc;x.beginPath();x.moveTo(3.7*sc,-22*sc);x.quadraticCurveTo(4.7*sc,-18*sc,3.4*sc,-12*sc);x.stroke();x.beginPath();x.arc(.6*sc,-27.4*sc+hb,3.3*sc,-.9,.5);x.stroke();
    x.restore()};
  const evShad=(sx,sy,rw)=>{if(window._vrec)window._vrec.push([sx,sy,rw]);x.fillStyle='rgba(0,0,0,.22)';x.beginPath();x.ellipse(sx,sy,rw,rw*.22,0,0,7);x.fill()};
  Object.assign(EV,{
   jogger:{msg:'朝の ジョギングの人が 走っていく🏃',dur:14,layer:'beach',when:'morning',draw(p,st,et){const gy=shore+20*k,hx=lerp(-20*k,W+20*k,p);x.globalAlpha=fade(p,.04,.04);
     evShad(hx,gy,9*k);human(hx,gy,.95*k,et*11,'#ff6f61','#f1c7a0',true);x.globalAlpha=1}},
   gull:{msg:'カモメが 魚を つかまえた！',dur:12,layer:'sea',when:'morning',draw(p,st,et){const tx=WL+WW*.62,ty=seaY(.45);let gx,gy;
     if(p<.45){const q=p/.45;gx=lerp(WL-20*k,tx,q);gy=lerp(hz*.35,ty,q*q)}else if(p<.52){gx=tx;gy=ty}else{const q=(p-.52)/.48;gx=lerp(tx,W+30*k,q);gy=lerp(ty,hz*.2,Math.sqrt(q))}
     x.globalAlpha=fade(p,.05,.05);if(p>.42&&p<.7){const q=(p-.42)/.28;x.strokeStyle=`rgba(255,255,255,${.8*(1-q)})`;x.lineWidth=1.4*k;x.beginPath();x.ellipse(tx,ty+2*k,(4+q*22)*k,(1+q*4)*k,0,0,7);x.stroke();
       x.fillStyle=`rgba(255,255,255,${.7*(1-q)})`;for(let i=0;i<6;i++){const a=-Math.PI*(.15+i*.14);x.beginPath();x.arc(tx+Math.cos(a)*q*16*k,ty+Math.sin(a)*q*22*k+q*q*20*k,1.4*k,0,7);x.fill()}}
     const fl=Math.sin(et*(p<.45?10:14))*.9;x.save();x.translate(gx,gy);x.strokeStyle='#f6f6f2';x.lineWidth=2.2*k;x.lineCap='round';x.beginPath();x.moveTo(-11*k,-fl*6*k);x.quadraticCurveTo(-5*k,-4*k,0,0);x.quadraticCurveTo(5*k,-4*k,11*k,-fl*6*k);x.stroke();
     x.fillStyle='#f6f6f2';x.beginPath();x.ellipse(0,1*k,4*k,2*k,0,0,7);x.fill();x.fillStyle='#ffb02e';x.fillRect(3*k,.4*k,3*k,1.2*k);if(p>.5){x.fillStyle='#b8d6e6';x.beginPath();x.ellipse(1*k,4.5*k,3.2*k,1.3*k,0,0,7);x.fill()}x.restore();x.globalAlpha=1}},
   fishboat:{msg:'朝の 漁に 船が でていく⛵',dur:40,layer:'sea',when:'dawn',draw(p,st,et){const q=ease(p),bx=lerp(WL+WW*.2,WL+WW*.78,q),by=lerp(seaY(.8),hz+4*k,q),sc=lerp(1.1,.35,q)*k;x.globalAlpha=fade(p,.06,.1);
     x.save();x.translate(bx,by+Math.sin(et*2)*1.5*sc);x.fillStyle='#1d2433';x.beginPath();x.moveTo(-22*sc,-4*sc);x.lineTo(24*sc,-4*sc);x.lineTo(18*sc,4*sc);x.lineTo(-18*sc,4*sc);x.fill();
     x.fillStyle='#e9e4d8';x.fillRect(-6*sc,-14*sc,12*sc,10*sc);x.fillStyle='#ffd27a';x.fillRect(-4*sc,-12*sc,3*sc,3*sc);x.fillRect(1*sc,-12*sc,3*sc,3*sc);x.strokeStyle='#1d2433';x.lineWidth=1.2*sc;x.beginPath();x.moveTo(0,-14*sc);x.lineTo(0,-26*sc);x.stroke();
     x.globalCompositeOperation='lighter';glow(0,-27*sc,7*sc,'rgba(255,220,150,.9)');x.restore();
     x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;x.beginPath();x.moveTo(bx-20*sc,by+4*sc);x.lineTo(bx-60*sc,by+10*sc);x.moveTo(bx-20*sc,by+5*sc);x.lineTo(bx-55*sc,by+2*sc);x.stroke();x.globalAlpha=1}},
   mist:{msg:'朝もやが 浜辺を つつむ…',dur:55,layer:'beach',when:'dawn',draw(p,st,et){const a=fade(p,.2,.25);for(let i=0;i<5;i++){const yy=hz+(i*.28)*(shore-hz+40*k),xx=((et*(6+i*2)*k+i*90*k)%(W+300*k))-150*k;
     const g=x.createRadialGradient(xx,yy,0,xx,yy,180*k);g.addColorStop(0,`rgba(235,235,245,${.32*a})`);g.addColorStop(1,'rgba(235,235,245,0)');x.fillStyle=g;x.save();x.translate(xx,yy);x.scale(1,.25);x.translate(-xx,-yy);x.fillRect(xx-180*k,yy-180*k,360*k,360*k);x.restore()}}},
   beachball:{msg:'ビーチボールが ころがってきた！',dur:13,layer:'beach',when:'noon',draw(p,st,et){const bx=lerp(-20*k,W+20*k,p),gy=WT+WH*.9,hop=Math.abs(Math.sin(p*Math.PI*5))*36*k*(1-p*.5),r=8*k;x.globalAlpha=fade(p,.03,.03);
     evShad(bx,gy,r*(1-hop/(80*k)));x.save();x.translate(bx,gy-r-hop);x.rotate(et*6);['#ff4f5a','#ffffff','#3ea0ff','#ffffff','#ffd23f','#ffffff'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.moveTo(0,0);x.arc(0,0,r,i*Math.PI/3,(i+1)*Math.PI/3);x.fill()});
     x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.arc(-r*.35,-r*.35,r*.3,0,7);x.fill();x.restore();x.globalAlpha=1}},
   sandcastle:{msg:'だれかが 砂のお城を つくった🏰',dur:45,layer:'beach',when:'noon',draw(p,st,et){const cx=WL+WW*.72,gy=shore+22*k,gr=Math.min(1,p/.3),wash=p>.8?(p-.8)/.2:0,sc=k;x.globalAlpha=1-wash;
     x.save();x.beginPath();x.rect(cx-40*sc,gy-60*sc*gr,80*sc,60*sc*gr+2);x.clip();x.fillStyle='#d9b77e';x.fillRect(cx-26*sc,gy-16*sc,52*sc,16*sc);x.fillRect(cx-30*sc,gy-30*sc,12*sc,30*sc);x.fillRect(cx+18*sc,gy-30*sc,12*sc,30*sc);x.fillRect(cx-9*sc,gy-36*sc,18*sc,36*sc);
     x.fillStyle='#c39c62';for(const [tx,tw,ty] of [[-30,12,-30],[18,12,-30],[-9,18,-36]])for(let i=0;i<3;i++)x.fillRect(cx+(tx+i*tw/3)*sc,gy+(ty-4)*sc,tw/6*sc,4*sc);x.fillStyle='#7a5a32';x.beginPath();x.arc(cx,gy-4*sc,4*sc,Math.PI,0);x.fill();
     x.strokeStyle='#7a5a32';x.lineWidth=1*sc;x.beginPath();x.moveTo(cx,gy-40*sc);x.lineTo(cx,gy-52*sc);x.stroke();x.fillStyle='#ff4f5a';x.beginPath();x.moveTo(cx,gy-52*sc);x.lineTo(cx+8*sc,gy-49*sc);x.lineTo(cx,gy-46*sc);x.fill();x.restore();
     if(wash>0){x.fillStyle=`rgba(255,255,255,${.5*(1-wash)})`;x.beginPath();x.ellipse(cx,gy,60*sc*wash+10*sc,6*sc,0,0,7);x.fill()}x.globalAlpha=1}},
   parasail:{msg:'パラセーリング してる！🪂',dur:28,layer:'sea',when:'noon',draw(p,st,et){const bx=lerp(W+40*k,-60*k,p),by=seaY(.35),px=bx+70*k,py=hz*.42+Math.sin(et)*6*k;x.globalAlpha=fade(p,.05,.05);
     x.fillStyle='#f4f4f4';x.beginPath();x.moveTo(bx-12*k,by-3*k);x.lineTo(bx+12*k,by-3*k);x.lineTo(bx+9*k,by+2*k);x.lineTo(bx-10*k,by+2*k);x.fill();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(bx+22*k,by+2*k,14*k,2.5*k,0,0,7);x.fill();
     x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.8;x.beginPath();x.moveTo(bx+10*k,by-3*k);x.quadraticCurveTo(px-10*k,py+50*k,px,py+20*k);x.stroke();
     const C=['#ff5c3c','#ffd23f','#ff5c3c','#ffffff','#3e8fc4'];C.forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.moveTo(px,py+20*k);x.arc(px,py+4*k,20*k,Math.PI+i*Math.PI/5,Math.PI+(i+1)*Math.PI/5);x.fill()});
     x.strokeStyle='rgba(40,40,60,.6)';x.beginPath();for(const a of [-18,-8,8,18]){x.moveTo(px+a*k,py+2*k);x.lineTo(px,py+20*k)}x.stroke();x.fillStyle='#2b2230';x.beginPath();x.arc(px,py+22*k,2.4*k,0,7);x.fill();x.globalAlpha=1}},
   jetski:{msg:'水上バイクが かけぬけた！💨',dur:9,layer:'sea',when:'day',draw(p,st,et){const jx=lerp(-30*k,W+40*k,p),jy=seaY(.55)+Math.sin(et*9)*1.5*k;x.globalAlpha=fade(p,.04,.04);
     x.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<10;i++){const d=i*7*k;x.beginPath();x.arc(jx-14*k-d,jy-Math.abs(Math.sin(et*20+i))*6*k*(1-i/10),(2.5-i*.15)*k,0,7);x.fill()}
     x.fillStyle='#ffd23f';x.beginPath();x.moveTo(jx-12*k,jy);x.lineTo(jx+13*k,jy);x.lineTo(jx+6*k,jy-5*k);x.lineTo(jx-10*k,jy-5*k);x.fill();x.fillStyle='#222';x.fillRect(jx-6*k,jy-7*k,8*k,2*k);human(jx-2*k,jy-6*k,.6*k,0,'#3ea0ff','#e9b88f',true);x.globalAlpha=1}},
   icecart:{msg:'アイスキャンディー屋さんが きた🍦',dur:26,layer:'beach',when:'day',draw(p,st,et){const gy=WT+WH*.93,cx=lerp(-50*k,W+50*k,p),sc=k;x.globalAlpha=fade(p,.04,.04);
     evShad(cx,gy,26*sc);human(cx-22*sc,gy,1*sc,et*5,'#ffffff','#f1c7a0',false);x.fillStyle='#f5f0e6';x.fillRect(cx-14*sc,gy-24*sc,30*sc,16*sc);x.fillStyle='#ff7aa8';x.fillRect(cx-14*sc,gy-24*sc,30*sc,4*sc);
     x.fillStyle='#333';x.beginPath();x.arc(cx-8*sc,gy-4*sc,4*sc,0,7);x.arc(cx+10*sc,gy-4*sc,4*sc,0,7);x.fill();x.strokeStyle='#888';x.lineWidth=1.2*sc;x.beginPath();x.moveTo(cx+1*sc,gy-24*sc);x.lineTo(cx+1*sc,gy-44*sc);x.stroke();
     ['#ff5c8a','#fff','#55e0b4','#fff','#ffd23f','#fff'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.moveTo(cx+1*sc,gy-56*sc);x.arc(cx+1*sc,gy-44*sc,20*sc,Math.PI+i*Math.PI/6,Math.PI+(i+1)*Math.PI/6);x.fill()});
     x.font=`${9*sc}px sans-serif`;x.textAlign='center';x.fillStyle='#e0457b';x.fillText('ICE',cx+1*sc,gy-11*sc);if(Math.sin(et*3)>.6){x.fillStyle='rgba(255,255,255,.8)';x.fillText('♪',cx+24*sc,gy-30*sc)}x.globalAlpha=1}},
   dragonfly:{msg:'赤とんぼが とんでいる',dur:24,layer:'front',when:'evening',draw(p,st,et){const K0=k,a=fade(p,.12,.15);if(!st.d)st.d=[0,1,2,3,4].map(i=>({x:WL+WW*(.15+i*.18),y:WT+WH*(.45+Math.random()*.25),s:Math.random()*9,v:.6+Math.random()*.6}));
     x.globalAlpha=a;for(const d of st.d){const k=K0*1.5,hov=Math.sin(et*2+d.s)>.2,dx=d.x+Math.sin(et*d.v+d.s)*40*k+(hov?0:Math.sin(et*7+d.s)*4*k),dy=d.y+Math.cos(et*d.v*1.3+d.s)*20*k;
       x.strokeStyle='#d8422e';x.lineWidth=1.8*k;x.lineCap='round';x.beginPath();x.moveTo(dx-7*k,dy);x.lineTo(dx+4*k,dy);x.stroke();x.fillStyle='#b8321f';x.beginPath();x.arc(dx+5*k,dy,1.6*k,0,7);x.fill();
       const fl=Math.sin(et*40+d.s)*.35;x.fillStyle='rgba(230,240,255,.55)';for(const sgn of [-1,1]){x.beginPath();x.ellipse(dx+2*k,dy+sgn*4*k,1.6*k,5*k,fl*sgn,0,7);x.fill();x.beginPath();x.ellipse(dx-1*k,dy+sgn*4*k,1.4*k,4.5*k,-fl*sgn,0,7);x.fill()}}x.globalAlpha=1}},
   cat:{msg:'ねこが のんびり 歩いてきた🐈',dur:26,layer:'beach',when:'evening',draw(p,st,et){const[fx]=fireP(),gy=WT+WH*.97,sitX=fx+70*k;let cx,sit=false;
     if(p<.3)cx=lerp(W+40*k,sitX,ease(p/.3));else if(p<.75){cx=sitX;sit=true}else cx=lerp(sitX,-40*k,(p-.75)/.25);const dir=-1,sc=k*1.25,ph=et*9;x.globalAlpha=fade(p,.02,.02);
     evShad(cx,gy,14*sc);x.save();x.translate(cx,gy);x.scale(dir,1);x.fillStyle='#e0a35a';x.strokeStyle='#e0a35a';x.lineCap='round';
     if(sit){x.beginPath();x.ellipse(0,-9*sc,8*sc,10*sc,0,0,7);x.fill();x.beginPath();x.arc(2*sc,-21*sc,6*sc,0,7);x.fill();x.lineWidth=2.4*sc;x.beginPath();x.moveTo(-6*sc,-2*sc);x.quadraticCurveTo(-16*sc,-2*sc,-14*sc,-10*sc+Math.sin(et*2)*3*sc);x.stroke()}
     else{x.lineWidth=2.4*sc;[[-8,0],[-5,1.5],[7,Math.PI],[10,Math.PI+1.5]].forEach(([lx,o])=>{x.beginPath();x.moveTo(lx*sc,-8*sc);x.lineTo(lx*sc+Math.sin(ph+o)*3*sc,0);x.stroke()});x.beginPath();x.ellipse(0,-10*sc,12*sc,5.5*sc,0,0,7);x.fill();
       x.beginPath();x.arc(12*sc,-15*sc,5.5*sc,0,7);x.fill();x.beginPath();x.moveTo(-11*sc,-11*sc);x.quadraticCurveTo(-20*sc,-14*sc,-18*sc,-24*sc+Math.sin(et*3)*2*sc);x.stroke()}
     const hx=sit?2:12,hy=sit?-21:-15;x.beginPath();x.moveTo((hx-5)*sc,(hy-3)*sc);x.lineTo((hx-4)*sc,(hy-10)*sc);x.lineTo((hx-1)*sc,(hy-5)*sc);x.moveTo((hx+5)*sc,(hy-3)*sc);x.lineTo((hx+4)*sc,(hy-10)*sc);x.lineTo((hx+1)*sc,(hy-5)*sc);x.fill();
     x.fillStyle='#b5762f';x.fillRect(-4*sc,(sit?-14:-14)*sc,2*sc,4*sc);x.fillStyle='#2a1d14';x.beginPath();x.arc((hx-2)*sc,(hy-1)*sc,.9*sc,0,7);x.arc((hx+2)*sc,(hy-1)*sc,.9*sc,0,7);x.fill();x.restore();
     if(sit&&Math.sin(et*1.5)>.85){x.font=`${10*k}px sans-serif`;x.fillStyle='rgba(255,255,255,.85)';x.textAlign='center';x.fillText('にゃ',cx,gy-34*k)}x.globalAlpha=1}},
   couple:{msg:'夕日の なかを 二人が 歩いていく',dur:34,layer:'beach',when:'sunset',draw(p,st,et){const gy=shore+16*k,hx=lerp(W+20*k,-30*k,p);x.globalAlpha=fade(p,.06,.06);
     human(hx,gy,.85*k,et*5,'#3a2a3a','#3a2a3a',false,-1);human(hx+11*k,gy,.8*k,et*5+1,'#5a3248','#3a2a3a',false,-1,{long:true});x.strokeStyle='#3a2a3a';x.lineWidth=1.4*k;x.beginPath();x.moveTo(hx+3*k,gy-14*k);x.lineTo(hx+8*k,gy-14*k);x.stroke();
     if(p>.35&&p<.6){const q=(p-.35)/.25;x.globalAlpha=Math.sin(q*Math.PI);x.font=`${12*k}px sans-serif`;x.textAlign='center';x.fillStyle='#ff7a9a';x.fillText('♥',hx+6*k,gy-34*k-q*24*k)}
     x.globalAlpha=fade(p,.06,.06)*.35;x.fillStyle='#3a2a3a';for(let i=1;i<10;i++){x.beginPath();x.ellipse(hx+i*9*k,gy+1*k,1.6*k,.7*k,0,0,7);x.fill()}x.globalAlpha=1}},
   greenflash:{msg:'グリーンフラッシュだ…！ 幻の 緑の光',dur:9,layer:'sea',when:[17.8,18.35],draw(p){const gx=WL+WW*.92,a=Math.sin(Math.min(1,p*1.6)*Math.PI);x.save();x.globalCompositeOperation='lighter';
     glow(gx,hz,90*k*a,`rgba(80,255,140,${.75*a})`);glow(gx,hz,30*k*a,`rgba(160,255,190,${.8*a})`);x.fillStyle=`rgba(170,255,190,${a})`;x.beginPath();x.ellipse(gx,hz-1*k,18*k,5*k*a,0,Math.PI,0);x.fill();x.restore()}},
   iss:{msg:'宇宙ステーションが 空を わたっていく🛰️',dur:24,layer:'sky',when:'night',draw(p,st,et){const ix=lerp(WL-10*k,WL+WW+10*k,p),iy=hz*.15+Math.sin(p*Math.PI)*(-hz*.05)+p*hz*.25,a=fade(p,.25,.25);
     x.save();x.globalCompositeOperation='lighter';glow(ix,iy,14*k,`rgba(255,250,230,${.8*a})`);x.fillStyle=`rgba(255,255,245,${a})`;x.beginPath();x.arc(ix,iy,2.2*k,0,7);x.fill();x.restore()}},
   farfire:{msg:'とおくの 町で 花火が あがってる🎆',dur:30,layer:'sky',when:'night',draw(p,st,et){if(!st.b)st.b=[];if(!st.n)st.n=0;const a=fade(p,.05,.1);
     if(et>st.n&&p<.85){st.n=et+.9+Math.random()*1.4;st.b.push({x:WL+WW*(.05+Math.random()*.25),y:hz-WH*(.06+Math.random()*.1),t:0,c:['255,120,140','255,220,120','140,220,255','190,140,255'][Math.random()*4|0]})}
     x.save();x.globalCompositeOperation='lighter';for(const b of st.b){b.t+=.033;const q=b.t/1.8;if(q>1)continue;const r=(1-Math.pow(1-q,3))*16*k;for(let i=0;i<14;i++){const an=i/14*Math.PI*2;x.fillStyle=`rgba(${b.c},${(1-q)*a})`;x.beginPath();x.arc(b.x+Math.cos(an)*r,b.y+Math.sin(an)*r+q*q*5*k,1*k,0,7);x.fill()}}x.restore();st.b=st.b.filter(b=>b.t<1.8)}}
  });

  Object.assign(EV,{
   seaplane:{msg:'水上飛行機が 着水した！',dur:30,layer:'sea',when:'day',draw(p,st,et){const q=p<.4?p/.4:1,sx=lerp(W+60*k,WL+WW*.45,ease(q))-(p>.7?(p-.7)/.3*W*.8:0),sy=p<.4?lerp(hz-60*k,seaY(.3),ease(q)):seaY(.3)-(p>.85?(p-.85)/.15*60*k:0),sc=k*.8;x.globalAlpha=fade(p,.04,.05);
     if(p>.38&&p<.88){x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.ellipse(sx+20*sc,sy+5*sc,26*sc*(1+Math.sin(et*3)*.1),2.4*sc,0,0,7);x.fill()}
     x.save();x.translate(sx,sy);x.fillStyle='#f2f2f2';x.beginPath();x.ellipse(0,-6*sc,18*sc,3.8*sc,0,0,7);x.fill();x.fillStyle='#d23f3f';x.fillRect(-14*sc,-7*sc,28*sc,1.4*sc);x.fillStyle='#e8e8e8';x.fillRect(-4*sc,-12*sc,6*sc,14*sc*.0+1);x.fillRect(-20*sc,-11*sc,26*sc,2*sc);
     x.beginPath();x.moveTo(14*sc,-7*sc);x.lineTo(20*sc,-16*sc);x.lineTo(22*sc,-16*sc);x.lineTo(19*sc,-6*sc);x.fill();x.fillStyle='#7aa2c8';x.fillRect(-14*sc,-8.5*sc,6*sc,2*sc);x.strokeStyle='#555';x.lineWidth=1;x.beginPath();x.moveTo(-8*sc,-3*sc);x.lineTo(-10*sc,2*sc);x.moveTo(6*sc,-3*sc);x.lineTo(8*sc,2*sc);x.stroke();
     x.fillStyle='#ddd';x.fillRect(-14*sc,1.5*sc,26*sc,1.8*sc);x.strokeStyle='rgba(60,60,60,.5)';x.beginPath();x.ellipse(-19*sc,-6*sc,1*sc,5*sc*Math.abs(Math.sin(et*30)),0,0,7);x.stroke();x.restore();x.globalAlpha=1}},
   supermoon:{msg:'スーパームーンが のぼってきた🌕',dur:60,layer:'sky',when:'night',draw(p,st,et){const mx=WL+WW*.3,my=lerp(hz+30*k,hz-55*k,ease(Math.min(1,p*1.6))),r=34*k,a=fade(p,.05,.12);x.save();x.beginPath();x.rect(0,0,W,hz);x.clip();x.globalAlpha=a;
     x.globalCompositeOperation='lighter';glow(mx,my,r*4,'rgba(255,190,110,.28)');x.globalCompositeOperation='source-over';const g=x.createRadialGradient(mx-r*.3,my-r*.3,r*.1,mx,my,r);g.addColorStop(0,'#fff0c8');g.addColorStop(.7,'#ffcc80');g.addColorStop(1,'#e8955a');x.fillStyle=g;x.beginPath();x.arc(mx,my,r,0,7);x.fill();
     x.fillStyle='rgba(180,110,60,.25)';[[-.3,-.2,.22],[.25,.1,.18],[-.05,.35,.14],[.35,-.35,.1]].forEach(([a1,b1,c1])=>{x.beginPath();x.arc(mx+a1*r,my+b1*r,c1*r,0,7);x.fill()});x.restore()}},
   pirate:{msg:'海賊船が 水平線を ゆく🏴‍☠️',dur:60,layer:'sea',when:null,draw(p,st,et){const sx=lerp(-80*k,W+80*k,p),sy=hz+3*k+Math.sin(et*1.2)*1*k,sc=k*.75,c=dark>.5?'#20182a':'#4a3020';x.globalAlpha=fade(p,.05,.05);x.save();x.translate(sx,sy);x.rotate(Math.sin(et*1.2)*.03);
     x.fillStyle=c;x.beginPath();x.moveTo(-34*sc,-6*sc);x.lineTo(34*sc,-8*sc);x.lineTo(26*sc,4*sc);x.lineTo(-28*sc,4*sc);x.closePath();x.fill();x.fillRect(22*sc,-14*sc,12*sc,7*sc);
     x.strokeStyle=c;x.lineWidth=2*sc;[[-12,-50],[8,-56]].forEach(([mx2,h])=>{x.beginPath();x.moveTo(mx2*sc,-6*sc);x.lineTo(mx2*sc,h*sc);x.stroke();x.fillStyle=dark>.5?'#8a8070':'#e8dcc0';x.beginPath();x.moveTo(mx2*sc-11*sc,(h+6)*sc);x.quadraticCurveTo(mx2*sc,(h+4)*sc,mx2*sc+11*sc,(h+6)*sc);x.lineTo(mx2*sc+12*sc,(h+24)*sc);x.quadraticCurveTo(mx2*sc,(h+28)*sc,mx2*sc-12*sc,(h+24)*sc);x.closePath();x.fill()});
     x.fillStyle='#111';x.fillRect(8*sc,-64*sc,10*sc,7*sc);x.fillStyle='#eee';x.beginPath();x.arc(13*sc,-61.5*sc,1.6*sc,0,7);x.fill();x.restore();x.globalAlpha=1}},
   mermaid:{msg:'岩の上に… 人魚！？🧜',dur:30,layer:'sea',when:'night',draw(p,st,et){const rx=WL+WW*.6,ry=seaY(.4),sc=k*1,a=fade(p,.15,.2);x.globalAlpha=a;x.fillStyle='#1a1a26';x.beginPath();x.ellipse(rx,ry,18*sc,6*sc,0,Math.PI,0);x.fill();
     x.fillStyle='#2a6a6a';x.beginPath();x.moveTo(rx-4*sc,ry-5*sc);x.quadraticCurveTo(rx+10*sc,ry-3*sc,rx+16*sc,ry+2*sc+Math.sin(et*2)*2*sc);x.lineTo(rx+21*sc,ry-2*sc+Math.sin(et*2)*3*sc);x.lineTo(rx+20*sc,ry+5*sc+Math.sin(et*2)*2*sc);x.quadraticCurveTo(rx+6*sc,ry+2*sc,rx-6*sc,ry-2*sc);x.fill();
     x.fillStyle='#cfa98a';x.beginPath();x.ellipse(rx-5*sc,ry-11*sc,3.4*sc,6*sc,-.1,0,7);x.fill();x.beginPath();x.arc(rx-5*sc,ry-20*sc,3.4*sc,0,7);x.fill();x.fillStyle='#7a2a3a';x.beginPath();x.moveTo(rx-8*sc,ry-22*sc);x.quadraticCurveTo(rx-12*sc,ry-12*sc+Math.sin(et)*1.5*sc,rx-9*sc,ry-6*sc);x.lineTo(rx-6*sc,ry-14*sc);x.lineTo(rx-2*sc,ry-22*sc);x.closePath();x.fill();
     x.save();x.globalCompositeOperation='lighter';glow(rx,ry-14*sc,30*sc,'rgba(160,200,255,.12)');x.restore();x.globalAlpha=1}},
   jelly:{msg:'光る クラゲが ただよってる',dur:40,layer:'sea',when:'night',draw(p,st,et){st.j??=Array.from({length:6},()=>({x:WL+WW*(.1+Math.random()*.8),f:.4+Math.random()*.5,ph:Math.random()*6,c:['150,220,255','255,170,230','170,255,210'][Math.random()*3|0]}));const a=fade(p,.12,.15);x.save();x.globalCompositeOperation='lighter';
     for(const j of st.j){const jx=j.x+Math.sin(et*.3+j.ph)*14*k,jy=seaY(j.f)+Math.sin(et*.9+j.ph)*3*k,sc=k*(.6+j.f*.6),pul=1+Math.sin(et*2+j.ph)*.12;glow(jx,jy,18*sc,`rgba(${j.c},${.25*a})`);x.fillStyle=`rgba(${j.c},${.55*a})`;x.beginPath();x.ellipse(jx,jy,6*sc*pul,4*sc/pul,0,Math.PI,0);x.fill();
       x.strokeStyle=`rgba(${j.c},${.4*a})`;x.lineWidth=.8;for(let n=-2;n<=2;n++){x.beginPath();x.moveTo(jx+n*2*sc,jy);x.quadraticCurveTo(jx+n*2*sc+Math.sin(et*2+n)*2*sc,jy+5*sc,jx+n*2.4*sc,jy+10*sc);x.stroke()}}x.restore()}},
   farthunder:{msg:'遠くで 稲妻が 光ってる⚡',dur:24,layer:'sky',when:[17.5,24],draw(p,st,et){st.n??=0;if(et>st.n){st.n=et+1.5+Math.random()*3;st.f={x:WL+WW*(.55+Math.random()*.4),t:et,seg:Array.from({length:6},()=>Math.random()*10-5)}}const f=st.f;if(!f)return;const dt=et-f.t;if(dt>.5)return;const a=(1-dt/.5)*fade(p,.05,.05);
     x.save();x.globalCompositeOperation='lighter';glow(f.x,hz-30*k,90*k,`rgba(200,200,255,${.25*a})`);x.strokeStyle=`rgba(240,240,255,${a})`;x.lineWidth=1.3*k;x.beginPath();let lx=f.x,ly=hz-80*k;x.moveTo(lx,ly);f.seg.forEach(sg=>{lx+=sg*k;ly+=13*k;x.lineTo(lx,ly)});x.stroke();x.restore()}},
   flyfish:{msg:'トビウオが 跳ねてる！',dur:10,layer:'sea',when:'day',draw(p,st,et){st.f??=Array.from({length:4},(_,n)=>({d:n*.12,y:.4+Math.random()*.3}));for(const f of st.f){const q=(p-f.d)/.55;if(q<0||q>1)continue;const fx=lerp(WL-10*k,WL+WW+10*k,q),fy=seaY(f.y)-Math.abs(Math.sin(q*Math.PI*3))*14*k,sc=k*.7;x.save();x.translate(fx,fy);
       x.fillStyle='#4a6a9a';x.beginPath();x.ellipse(0,0,6*sc,1.8*sc,0,0,7);x.fill();x.fillStyle='rgba(180,210,255,.8)';x.beginPath();x.moveTo(-1*sc,0);x.lineTo(-4*sc,-6*sc);x.lineTo(3*sc,-1*sc);x.fill();x.restore();if(Math.abs(Math.sin(q*Math.PI*3))<.08){x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc(fx,seaY(f.y),2*k,0,7);x.fill()}}}},
   redballoon:{msg:'赤い 風船が 空へ…🎈',dur:30,layer:'sky',when:null,draw(p,st,et){const bx=WL+WW*.35+Math.sin(et*.6)*20*k+p*60*k,by=lerp(hz+40*k,-30*k,p),sc=k;x.globalAlpha=fade(p,.04,.1);x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.7;x.beginPath();x.moveTo(bx,by+10*sc);x.quadraticCurveTo(bx+Math.sin(et*2)*4*sc,by+18*sc,bx,by+28*sc);x.stroke();
     const g=x.createRadialGradient(bx-3*sc,by-4*sc,1,bx,by,10*sc);g.addColorStop(0,'#ff9a9a');g.addColorStop(1,'#d2283a');x.fillStyle=g;x.beginPath();x.ellipse(bx,by,8*sc,10*sc,0,0,7);x.fill();x.globalAlpha=1}},
   heli:{msg:'ヘリコプターが 飛んでいく🚁',dur:16,layer:'sky',when:'day',draw(p,st,et){const hx=lerp(W+40*k,-40*k,p),hy=hz*.38+Math.sin(et)*3*k,sc=k*.7;x.globalAlpha=fade(p,.05,.05);x.save();x.translate(hx,hy);x.fillStyle='#3a4a5a';x.beginPath();x.ellipse(0,0,9*sc,5*sc,0,0,7);x.fill();x.fillRect(6*sc,-1.5*sc,16*sc,2.4*sc);x.fillRect(20*sc,-5*sc,2*sc,6*sc);
     x.fillStyle='#9fc8e8';x.beginPath();x.ellipse(-4*sc,-1*sc,4*sc,3*sc,0,0,7);x.fill();x.strokeStyle='#222';x.lineWidth=1.2*sc;const r=Math.abs(Math.sin(et*40));x.beginPath();x.moveTo(-14*sc*r,-7*sc);x.lineTo(14*sc*r,-7*sc);x.moveTo(0,-5*sc);x.lineTo(0,-7*sc);x.moveTo(-6*sc,6*sc);x.lineTo(6*sc,6*sc);x.stroke();x.restore();x.globalAlpha=1}},
   sunshower:{msg:'天気雨が ふってきた☔',dur:30,layer:'front',when:'day',draw(p,st,et){st.d??=Array.from({length:90},()=>({x:Math.random(),y:Math.random(),v:.6+Math.random()*.4}));const a=fade(p,.12,.15);x.strokeStyle=`rgba(220,235,255,${.45*a})`;x.lineWidth=1;x.beginPath();
     for(const d of st.d){const yy=((d.y+et*d.v*.9)%1)*H,xx=d.x*W+yy*.08;x.moveTo(xx,yy);x.lineTo(xx+1.5*k,yy+9*k)}x.stroke()}}
  });
  ['ufo','meteors','biolum','lanterns','turtle','plane','fishing'].forEach(n=>EV[n].when='night');
  const PHW={dawn:[4.8,7.2],morning:[6.5,11],noon:[10.5,15.5],evening:[14.5,18],sunset:[17.4,20]};
  Object.assign(EV,{
   rn_lantern:{msg:'🏮 天灯が ゆっくり 夜空へ…',dur:45,layer:'front',when:'night',draw(p,st,et){const a=fade(p,.08,.15);for(let i=0;i<18;i++){const s0=(i*.137)%1,u=et*.03-s0*.5;if(u<=0||u>1.25)continue;const lx=WL+WW*((i*.618)%1)+Math.sin(et*.5+i)*8*k,ly=shore-u*(shore-WT)*1.05,sz=k*(2.6+((i*7)%5)*.5)*(1-u*.4);x.globalAlpha=a*Math.min(1,u*4)*Math.max(0,1-Math.max(0,u-.85)/.4);glow(lx,ly,sz*5,'rgba(255,170,80,.45)');x.fillStyle='#ffcf7a';x.fillRect(lx-sz*.7,ly-sz,sz*1.4,sz*1.8);x.fillStyle='#fff3c8';x.fillRect(lx-sz*.35,ly-sz*.2,sz*.7,sz*.8)}x.globalAlpha=1}},
   rn_moonroad:{msg:'🌕 海に 月の道が できた',dur:50,layer:'sea',when:'night',draw(p,st,et){const a=fade(p,.15,.2),cx=WL+WW*.52;x.save();x.globalCompositeOperation='lighter';for(let i=0;i<80;i++){const v=i/80,y=lerp(hz+2*k,shore,v*v),w=lerp(6,70,v*v)*k,ox=Math.sin(i*12.9+et*1.7)*w,tw=.5+.5*Math.sin(et*3+i*1.3);x.fillStyle=`rgba(255,245,210,${a*.5*tw})`;x.fillRect(cx+ox-w*.15,y,w*.3,1.2*k+v*1.5*k)}x.restore()}},
   rn_heart:{msg:'💕 星が ハートの 形に 並んだ…',dur:30,layer:'sky',when:'night',draw(p,st,et){const a=fade(p,.2,.2),cx=WL+WW*.3,cy=WT+(hz-WT)*.35,R=Math.min(WW,hz-WT)*.13;x.save();x.globalCompositeOperation='lighter';for(let i=0;i<34;i++){const q=i/34*Math.PI*2,hx=16*Math.pow(Math.sin(q),3),hy=-(13*Math.cos(q)-5*Math.cos(2*q)-2*Math.cos(3*q)-Math.cos(4*q)),px=cx+hx/16*R,py=cy+hy/16*R,tw=.55+.45*Math.sin(et*2.4+i*2.1),ap=a*tw*Math.min(1,Math.max(0,p*4-i/34));glow(px,py,5*k,`rgba(255,190,225,${ap*.8})`);x.fillStyle=`rgba(255,255,255,${ap})`;x.fillRect(px-.9*k,py-.9*k,1.8*k,1.8*k)}x.restore()}},
   rn_firefly:{msg:'✨ 波打ち際に 蛍が 舞ってる',dur:40,layer:'front',when:'night',draw(p,st,et){const a=fade(p,.1,.15);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<26;i++){const fx=WL+WW*(((i*.381+Math.sin(et*.13+i)*.04)%1+1)%1),fy=shore-6*k+Math.sin(et*.7+i*1.7)*14*k-((i*13)%30)*k,bl=Math.max(0,Math.sin(et*1.6+i*2.3));glow(fx,fy,7*k,`rgba(190,255,140,${a*bl*.55})`);x.fillStyle=`rgba(230,255,190,${a*bl})`;x.fillRect(fx-1*k,fy-1*k,2*k,2*k)}x.restore()}},
   rn_milky:{msg:'🌌 天の川が くっきり 見える',dur:50,layer:'sky',when:'night',draw(p,st,et){const a=fade(p,.2,.2);x.save();x.globalCompositeOperation='lighter';x.translate(WL+WW*.5,WT+(hz-WT)*.45);x.rotate(-.5);const g=x.createLinearGradient(0,-40*k,0,40*k);g.addColorStop(0,'rgba(170,160,255,0)');g.addColorStop(.5,`rgba(210,200,255,${.2*a})`);g.addColorStop(1,'rgba(170,160,255,0)');x.fillStyle=g;x.fillRect(-WW,-40*k,WW*2,80*k);for(let i=0;i<170;i++){const sx=((i*97.31)%1)*2-1,sy=(((i*57.17)%1)-.5)*(1-Math.abs(sx)*.3),tw=.5+.5*Math.sin(et*2+i);x.fillStyle=`rgba(255,255,255,${a*.8*tw})`;x.fillRect(sx*WW,sy*70*k,1.1*k,1.1*k)}x.restore()}},
   rn_candle:{msg:'🕯️ 浜辺に キャンドルの 道が…',dur:45,layer:'beach',when:'night',draw(p,st,et){const a=fade(p,.08,.12);for(let i=0;i<14;i++){const u=i/13,cx=lerp(WL+WW*.15,WL+WW*.85,u),cy=lerp(shore+40*k,shore+14*k,Math.sin(u*Math.PI))+Math.sin(u*9)*3*k,on=Math.min(1,Math.max(0,p*8-u*2));if(on<=0)continue;const fl=.8+.2*Math.sin(et*9+i*3);x.globalAlpha=a*on;glow(cx,cy-5*k,12*k,`rgba(255,180,90,${.35*fl})`);x.fillStyle='#f4ead6';x.fillRect(cx-1.6*k,cy-4*k,3.2*k,5*k);x.fillStyle='#ffd27a';x.beginPath();x.ellipse(cx,cy-6*k,1.1*k,2.2*k*fl,0,0,7);x.fill()}x.globalAlpha=1}},
   rn_starfall:{msg:'🌟 星くずが 海に 降りそそぐ',dur:35,layer:'sky',when:'night',draw(p,st,et){const a=fade(p,.1,.15);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<44;i++){const ph=(et*.12+i*.173)%1,sx=WL+WW*((i*.618)%1),sy=lerp(WT,hz,ph);x.fillStyle=`rgba(255,250,220,${a*(1-ph*.6)*.9})`;x.fillRect(sx,sy,1.5*k,1.5*k);if(ph>.9)glow(sx,hz,9*k,`rgba(200,220,255,${a*.4})`)}x.restore()}},
   rn_aurora:{msg:'🌌 夜空に オーロラが ゆらめいた…',dur:45,layer:'sky',when:'night',draw(p,st,et){const a=fade(p,.2,.25);x.save();x.globalCompositeOperation='lighter';for(let b=0;b<3;b++){const col=['120,255,190','150,200,255','255,150,220'][b];for(let i=0;i<=40;i++){const u=i/40,ax=WL+WW*u,ay=WT+(hz-WT)*(.12+b*.08)+Math.sin(u*6+et*.4+b)*14*k,h=(40+20*Math.sin(u*9+et*.7+b*2))*k,g=x.createLinearGradient(0,ay,0,ay+h);g.addColorStop(0,`rgba(${col},0)`);g.addColorStop(.4,`rgba(${col},${.16*a})`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.fillRect(ax-1,ay,WW/40+3,h)}}x.restore()}},
   rn_bubble:{msg:'🫧 月夜の シャボン玉が 飛んでいく',dur:35,layer:'front',when:'night',draw(p,st,et){const a=fade(p,.1,.15);x.save();for(let i=0;i<14;i++){const ph=(et*.05+i*.13)%1,bx=WL+WW*(.3+((i*.29)%.5))+Math.sin(et+i)*10*k,by=lerp(shore,WT+(hz-WT)*.4,ph),r=(3+(i%4))*k;x.globalAlpha=a*(1-ph);x.strokeStyle='rgba(220,230,255,.75)';x.lineWidth=.8;x.beginPath();x.arc(bx,by,r,0,7);x.stroke();x.fillStyle='rgba(255,210,245,.3)';x.beginPath();x.arc(bx-r*.35,by-r*.35,r*.3,0,7);x.fill()}x.restore();x.globalAlpha=1}},
   rn_wish:{msg:'🌠 ふたつの 流れ星が 寄りそって 流れた',dur:8,layer:'sky',when:'night',draw(p,st,et){const a=fade(p,.05,.15),u=Math.min(1,p*1.6);x.save();x.globalCompositeOperation='lighter';[0,1].forEach(j=>{const sx=lerp(WL+WW*.15,WL+WW*.8,u),sy=lerp(WT+20*k,hz-30*k,u)+j*9*k,g=x.createLinearGradient(sx,sy,sx-60*k,sy-26*k);g.addColorStop(0,`rgba(255,255,255,${a})`);g.addColorStop(1,'rgba(255,220,240,0)');x.strokeStyle=g;x.lineWidth=2*k;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx-60*k,sy-26*k);x.stroke();glow(sx,sy,6*k,`rgba(255,240,250,${a})`)});x.restore()}}
  });
  Object.assign(EV,{
   fm_mochi:{msg:'🌕 満月の 中で うさぎが 餅つきしてる…？',dur:30,layer:'sky',when:'fullmoon',draw(p,st,et){const a=fade(p,.15,.2),mx=moonX,my=moonY,r=(moonR||16*k);x.save();x.globalCompositeOperation='lighter';glow(mx,my,r*1.8,`rgba(255,245,215,${a*.5})`);x.globalCompositeOperation='source-over';x.globalAlpha=a*.85;x.fillStyle='#fff6dc';x.beginPath();x.arc(mx,my,r,0,7);x.fill();x.fillStyle='rgba(150,130,120,.85)';const up=Math.sin(et*3)>0;
     x.beginPath();x.ellipse(mx-r*.35,my+r*.15,r*.22,r*.28,0,0,7);x.fill();x.beginPath();x.arc(mx-r*.3,my-r*.2,r*.15,0,7);x.fill();x.beginPath();x.ellipse(mx-r*.35,my-r*.45,r*.05,r*.18,-.2,0,7);x.ellipse(mx-r*.24,my-r*.45,r*.05,r*.18,.2,0,7);x.fill();
     x.beginPath();x.ellipse(mx+r*.25,my+r*.42,r*.22,r*.12,0,0,7);x.fill();x.strokeStyle='rgba(150,130,120,.85)';x.lineWidth=r*.07;x.beginPath();x.moveTo(mx-r*.2,my);x.lineTo(mx+r*.15,up?my-r*.25:my+r*.25);x.stroke();x.fillRect(mx+r*.08,(up?my-r*.35:my+r*.18),r*.18,r*.12);x.restore()}},
   fm_halo:{msg:'🌕 月の まわりに 光の 輪が できた',dur:40,layer:'sky',when:'fullmoon',draw(p,st,et){const a=fade(p,.2,.25),R=(moonR||16*k)*4.2;x.save();x.globalCompositeOperation='lighter';for(let i=0;i<3;i++){x.strokeStyle=`rgba(${['255,220,200','220,240,255','200,210,255'][i]},${a*(.18-i*.04)})`;x.lineWidth=(5-i)*k;x.beginPath();x.arc(moonX,moonY,R+i*3*k,0,7);x.stroke()}x.restore()}},
   fm_howl:{msg:'🐺 遠くの 岬で 何かが 遠吠えしてる…',dur:20,layer:'sky',when:'fullmoon',draw(p,st,et){const a=fade(p,.15,.2),bx=WL+WW*.12,by=hz-WH*.04;x.save();x.globalAlpha=a;x.fillStyle='#0a0e22';const s=k*1.2,lift=Math.min(1,p*3)*.5;
     x.beginPath();x.ellipse(bx,by-6*s,10*s,4*s,0,0,7);x.fill();x.save();x.translate(bx+8*s,by-8*s);x.rotate(-.6-lift);x.beginPath();x.ellipse(5*s,0,6*s,2.6*s,0,0,7);x.fill();x.beginPath();x.moveTo(1*s,-2*s);x.lineTo(2.5*s,-6*s);x.lineTo(4*s,-2*s);x.fill();x.restore();
     [-7,-3,5,8].forEach(l=>x.fillRect(bx+l*s,by-4*s,1.6*s,5*s));x.beginPath();x.moveTo(bx-10*s,by-7*s);x.quadraticCurveTo(bx-16*s,by-4*s,bx-15*s,by);x.lineWidth=2*s;x.strokeStyle='#0a0e22';x.stroke();
     if(p>.3&&p<.75){x.fillStyle=`rgba(220,230,255,${.6*Math.sin((p-.3)/.45*Math.PI)})`;x.font=`${7*k}px sans-serif`;x.fillText('アオーン…',bx+12*s,by-24*s)}x.restore()}},
   fm_tsukimi:{msg:'🍡 浜辺に お月見だんごと すすきが…',dur:50,layer:'beach',when:'fullmoon',draw(p,st,et){const a=fade(p,.06,.08),bx=WL+WW*.28,by=WT+WH*.95,s=k*1.2;x.save();x.globalAlpha=a;x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(bx,by+1*s,14*s,3*s,0,0,7);x.fill();
     x.fillStyle='#c9a46a';x.fillRect(bx-10*s,by-4*s,20*s,4*s);x.fillStyle='#e8d0a0';x.fillRect(bx-12*s,by-5*s,24*s,1.5*s);[[-6,-8],[0,-8],[6,-8],[-3,-13],[3,-13],[0,-18]].forEach(([a2,b])=>{x.fillStyle='#fffbf0';x.beginPath();x.arc(bx+a2*s,by+b*s,3*s,0,7);x.fill();x.fillStyle='rgba(200,190,170,.5)';x.beginPath();x.arc(bx+a2*s+1*s,by+b*s+1*s,2*s,0,Math.PI);x.fill()});
     x.strokeStyle='#b8a070';x.lineWidth=1*s;for(let i=0;i<5;i++){const sx=bx+16*s+i*2*s,sw=Math.sin(et*1.2+i)*2*s;x.beginPath();x.moveTo(sx,by);x.quadraticCurveTo(sx+sw,by-18*s,sx+sw*2+3*s,by-30*s);x.stroke();x.fillStyle='rgba(240,225,190,.85)';x.beginPath();x.ellipse(sx+sw*2+3*s,by-32*s,1.6*s,5*s,.3,0,7);x.fill()}x.restore()}},
   fm_kaguya:{msg:'🌕 光の 牛車が 月へ のぼっていく…',dur:26,layer:'sky',when:'fullmoon',draw(p,st,et){const a=fade(p,.1,.2),sx=lerp(WL+WW*.5,moonX,ease(p)),sy=lerp(hz-10*k,moonY+8*k,ease(p)),s=k*(1.4-p*.9);x.save();x.globalCompositeOperation='lighter';
     for(let i=0;i<14;i++){const q=Math.max(0,p-i*.012),tx=lerp(WL+WW*.5,moonX,ease(q)),ty=lerp(hz-10*k,moonY+8*k,ease(q));glow(tx,ty,(6-i*.35)*k,`rgba(255,240,200,${a*(.35-i*.022)})`)}
     glow(sx,sy,16*s,`rgba(255,245,215,${a*.8})`);x.fillStyle=`rgba(255,250,235,${a})`;x.fillRect(sx-5*s,sy-4*s,10*s,6*s);x.beginPath();x.arc(sx-3*s,sy+3*s,2*s,0,7);x.arc(sx+3*s,sy+3*s,2*s,0,7);x.fill();x.restore()}},
   fm_turtle:{msg:'🐢 満月の 夜… ウミガメが 浜に あがってきた',dur:45,layer:'beach',when:'fullmoon',draw(p,st,et){const a=fade(p,.06,.08),s=k*1.5,tx=WL+WW*.78,ty=lerp(shore+6*k,WT+WH*.9,Math.min(1,p*2.2))-(p>.75?(p-.75)*4*(WT+WH*.9-shore-6*k):0);x.save();x.globalAlpha=a;
     x.fillStyle='rgba(0,0,0,.22)';x.beginPath();x.ellipse(tx,ty+2*s,13*s,3*s,0,0,7);x.fill();const fl=Math.sin(et*2.4)*.4;[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy])=>{x.save();x.translate(tx+dx*9*s,ty+dy*3*s);x.rotate(dx*(fl*dy)+dx*.6);x.fillStyle='#4a5a3a';x.beginPath();x.ellipse(0,0,5*s,2*s,0,0,7);x.fill();x.restore()});
     x.fillStyle=shadeF(tx,ty-3*s,12*s,'#6a7a4a');x.beginPath();x.ellipse(tx,ty-2*s,11*s,5.5*s,0,0,7);x.fill();x.strokeStyle='rgba(30,40,20,.5)';x.lineWidth=.6*s;for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(tx+i*5*s,ty-7*s);x.lineTo(tx+i*5*s,ty+2*s);x.stroke()}
     x.fillStyle='#5a6a42';x.beginPath();x.ellipse(tx,ty-9.5*s,3*s,2.6*s,0,0,7);x.fill();x.fillStyle='#111';x.fillRect(tx-1.5*s,ty-10*s,.8*s,.8*s);x.fillRect(tx+.8*s,ty-10*s,.8*s,.8*s);x.restore()}},
   fm_coral:{msg:'🪸 満月の 夜… 海の 中で サンゴが 産卵してる',dur:40,layer:'sea',when:'fullmoon',draw(p,st,et){const a=fade(p,.12,.2);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<70;i++){const u=(i*.618)%1,ph=(et*.07+i*.137)%1,px=WL+WW*u+Math.sin(et*.5+i)*4*k,py=lerp(shore-4*k,hz+(shore-hz)*.25,ph*(.4+((i*7)%10)/18));x.fillStyle=`rgba(255,${180+(i%3)*20},${200+(i%2)*30},${a*(1-ph)*.7})`;x.beginPath();x.arc(px,py,(.8+(i%3)*.4)*k,0,7);x.fill()}x.restore()}},
   fm_owl:{msg:'🌕 月の 前を フクロウが 横切った',dur:10,layer:'sky',when:'fullmoon',draw(p,st,et){const a=fade(p,.05,.1),r=(moonR||16*k),ox=lerp(moonX-r*4,moonX+r*4,p),oy=moonY-r*.2+Math.sin(p*Math.PI)*r*.4,s=k*1.1,fl=Math.sin(et*9);x.save();x.globalAlpha=a;x.fillStyle='#0a0e22';x.beginPath();x.ellipse(ox,oy,4*s,3*s,0,0,7);x.fill();x.beginPath();x.moveTo(ox-2*s,oy);x.quadraticCurveTo(ox-9*s,oy-6*s*fl,ox-15*s,oy-1*s*fl);x.lineTo(ox-3*s,oy+2*s);x.fill();x.beginPath();x.moveTo(ox+2*s,oy);x.quadraticCurveTo(ox+9*s,oy-6*s*fl,ox+15*s,oy-1*s*fl);x.lineTo(ox+3*s,oy+2*s);x.fill();x.restore()}}
  });
  Object.assign(EV,{
   w_fog:{msg:'🌫️ 朝霧が 海を 包んでいる…',dur:90,layer:'front',when:'morning',draw(p,st,et){const a=fade(p,.12,.2);if(a<=0)return;x.save();
     const fc='236,240,246';
     /* 全体の もや：水平線が いちばん 濃い */
     let g=x.createLinearGradient(0,WT,0,H);g.addColorStop(0,`rgba(${fc},${.18*a})`);g.addColorStop(Math.max(0,(hz-60*k-WT)/(H-WT)),`rgba(${fc},${.42*a})`);g.addColorStop(Math.min(1,(hz+10*k-WT)/(H-WT)),`rgba(${fc},${.72*a})`);g.addColorStop(Math.min(1,(shore+20*k-WT)/(H-WT)),`rgba(${fc},${.45*a})`);g.addColorStop(1,`rgba(${fc},${.22*a})`);x.fillStyle=g;x.fillRect(0,0,W,H);
     /* 流れる 霧の かたまり */
     st.b??=Array.from({length:9},(_,i)=>({u:Math.random()*1.4-.2,y:(i%3===0?-.3:i%3===1?.15:.6)+Math.random()*.25,w:.6+Math.random()*.7,h:.14+Math.random()*.12,v:(.004+Math.random()*.006)*(i%2?1:-1),o:.35+Math.random()*.35}));
     for(const b of st.b){b.u+=b.v*.05;if(b.u>1.5)b.u=-.5;if(b.u<-.5)b.u=1.5;const cx=W*b.u,cy=hz+(shore-hz)*b.y+Math.sin(et*.2+b.w*9)*4*k,rw=W*b.w,rh=Math.max(30*k,(shore-hz+60*k)*b.h*2);
       const rg=x.createRadialGradient(cx,cy,0,cx,cy,rw*.5);rg.addColorStop(0,`rgba(${fc},${b.o*a})`);rg.addColorStop(.55,`rgba(${fc},${b.o*.5*a})`);rg.addColorStop(1,`rgba(${fc},0)`);x.fillStyle=rg;x.save();x.translate(cx,cy);x.scale(1,rh/(rw*.5));x.beginPath();x.arc(0,0,rw*.5,0,7);x.fill();x.restore()}
     /* 朝の 光の 筋 */
     if(sunUp>.02){x.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const ang=Math.PI*.5+(i-2)*.32+Math.sin(et*.1+i)*.04,len=H*.9,sx=sunX,sy=Math.min(sunY,hz);const ex=sx+Math.cos(ang)*len*.5*(i%2?1:-1),ey=sy+Math.sin(ang)*len;
       const lg=x.createLinearGradient(sx,sy,ex,ey);lg.addColorStop(0,`rgba(255,240,200,${.06*a*sunUp})`);lg.addColorStop(1,'rgba(255,240,200,0)');x.fillStyle=lg;x.beginPath();x.moveTo(sx-6*k,sy);x.lineTo(sx+6*k,sy);x.lineTo(ex+60*k,ey);x.lineTo(ex-60*k,ey);x.closePath();x.fill()}}
     /* 露の きらめき */
     x.globalCompositeOperation='lighter';st.d??=Array.from({length:22},()=>({u:Math.random(),v:Math.random(),p:Math.random()*6}));for(const d of st.d){const al=Math.max(0,Math.sin(et*1.5+d.p))**6*a;if(al<.02)continue;const dx=W*d.u,dy=shore+(H-shore)*d.v*.8;x.fillStyle=`rgba(255,255,255,${al})`;x.beginPath();x.arc(dx,dy,1.2*k,0,7);x.fill()}
     x.restore()}},
   w_lightning:{msg:'⚡ 遠くの 空で 稲光が…',dur:30,layer:'sky',when:'night',draw(p,st,et){const ph=et%5.5;if(ph<.5){const a=(ph<.08||(ph>.18&&ph<.26))?.55:.12;const lx=WL+WW*(st.lx??=(.15+Math.random()*.7));x.save();x.globalCompositeOperation='lighter';const g=x.createRadialGradient(lx,hz-20*k,0,lx,hz-20*k,WW*.45);g.addColorStop(0,`rgba(200,210,255,${a})`);g.addColorStop(1,'rgba(200,210,255,0)');x.fillStyle=g;x.fillRect(lx-WW*.45,WT,WW*.9,hz-WT);
       if(ph<.08){x.strokeStyle=`rgba(240,245,255,${a+.3})`;x.lineWidth=1.4*k;x.beginPath();let yy=hz-90*k,xx=lx;x.moveTo(xx,yy);while(yy<hz-4*k){yy+=8*k;xx+=(Math.random()-.5)*10*k;x.lineTo(xx,yy)}x.stroke()}x.restore()}else st.lx=undefined;
     if(ph>.4&&ph<.45&&!st.boom){st.boom=1;try{if(S.sound)noise(1.6,{v:.04,type:'lowpass',f:180})}catch(e){}}if(ph>1)st.boom=0}},
   w_puddle:{msg:'💧 砂浜の 水たまりに 空が 映ってる',dur:60,layer:'beach',when:null,draw(p,st,et){const a=fade(p,.1,.15);st.pp??=Array.from({length:5},()=>({u:.15+Math.random()*.7,v:.3+Math.random()*.6,w:18+Math.random()*26}));x.save();
     for(const q of st.pp){const px=WL+WW*q.u,py=shore+(WT+WH-shore)*q.v*.8+10*k;x.save();x.beginPath();x.ellipse(px,py,q.w*k,q.w*.28*k,0,0,7);x.clip();const g=x.createLinearGradient(0,py-q.w*.3*k,0,py+q.w*.3*k);g.addColorStop(0,PAL.mid);g.addColorStop(1,PAL.hz);x.globalAlpha=a*.75;x.fillStyle=g;x.fillRect(px-q.w*k,py-q.w*k,q.w*2*k,q.w*2*k);
       x.globalAlpha=a*.5;x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.8;x.beginPath();x.ellipse(px+Math.sin(et+q.u*9)*3*k,py,q.w*.4*k*(1+((et*.6+q.v)%1)),q.w*.1*k*(1+((et*.6+q.v)%1)),0,0,7);x.stroke();x.restore();
       x.globalAlpha=a*.5;x.strokeStyle='rgba(90,70,50,.5)';x.lineWidth=1;x.beginPath();x.ellipse(px,py,q.w*k,q.w*.28*k,0,0,7);x.stroke()}x.restore()}},
   mig_birds:{msg:'🐦 渡り鳥の 群れが 空を 渡っていく',dur:28,layer:'sky',when:null,draw(p,st,et){const m=new Date().getMonth()+1,kind=m>=9&&m<=11?'gan':m===12||m<=2?'swan':m>=3&&m<=5?'tsubame':'kamome';
     const a=fade(p,.05,.08),n=kind==='tsubame'?7:kind==='swan'?5:9,cx=lerp(W+60*k,-120*k,p),cy=WT+(hz-WT)*(kind==='tsubame'?.5:.3)+Math.sin(p*6)*6*k,s=k*(kind==='swan'?1.5:kind==='tsubame'?.8:1.1),col=kind==='swan'?(dark>.5?'#c8cce0':'#ffffff'):dark>.5?'#1a1e36':'#2a2e40';
     x.save();x.globalAlpha=a;for(let i=0;i<n;i++){const row=Math.ceil(i/2),side=i%2?1:-1,bx=cx+row*10*s,by=cy+side*row*6*s,fl=Math.sin(et*(kind==='tsubame'?14:7)+i)*.9;x.strokeStyle=col;x.fillStyle=col;x.lineWidth=(kind==='swan'?1.6:1.1)*s;
       if(kind==='swan'){x.beginPath();x.ellipse(bx,by,5*s,2*s,0,0,7);x.fill();x.beginPath();x.moveTo(bx-4*s,by);x.lineTo(bx-10*s,by-1.5*s);x.stroke()}
       x.beginPath();x.moveTo(bx-6*s,by-fl*4*s);x.quadraticCurveTo(bx-2*s,by-1*s,bx,by);x.quadraticCurveTo(bx+2*s,by-1*s,bx+6*s,by-fl*4*s);x.stroke()}x.restore();
     if(!st.m){st.m=1;try{MUMS.ev_mig_birds=kind==='gan'?['雁の 列… 秋やなぁ','渡り鳥 の 季節','V字 きれい']:kind==='swan'?['白鳥が 渡ってく','冬の 使者','真っ白…']:kind==='tsubame'?['ツバメ！ 春や','すいすい 飛んでく','春が 来た']:['カモメの 群れ','夏の 空']}catch(e){}}}}
  });
  const timeOk=n=>{const w=EV[n].when;if(!w)return true;if(w==='fullmoon')return dark>.6&&typeof moonFull==='function'&&moonFull();if(w==='night')return dark>.6;if(w==='day')return dark<.35;const r=Array.isArray(w)?w:PHW[w],h=gameHour();return h>=r[0]&&h<r[1]};
  const evWeight=n=>{const w=EV[n].when;return w==='fullmoon'?4:!w?1:w==='night'||w==='day'?1.4:2.4};
  delete EV.supermoon;const EVN=Object.keys(EV);let cur=null,lastEv=null,nextAt=performance.now()+300000;
  function startEvent(name){try{if(['dblPick','won','dblTie'].includes(S.phase)||document.body.classList.contains('dbl'))setTimeout(()=>say('evDuringDbl',{delay:0}),5200)}catch(e){}if(!name){const c=EVN.filter(n=>n!==lastEv&&timeOk(n));let tot=c.reduce((a,n)=>a+evWeight(n),0),r=Math.random()*tot;name=c[c.length-1];for(const n of c){r-=evWeight(n);if(r<=0){name=n;break}}}lastEv=name;cur={name,et:0,st:{}};try{window.diaryNote&&diaryNote('ev',name)}catch(e){}
    let g='';try{g=grantEvent(name)}catch(e){}try{if(S.mapN>0||Math.random()<(.12+treB())/3){if(S.mapN>0)S.mapN--;const tr=giveTre(0);g=g?g+'<br>'+tr:tr}}catch(e){}
    sfx.chime();const el=$('toast');el.innerHTML=EV[name].msg+(g?`<br><b>${g}</b>`:'');el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),4800)}

  // ---- animal visitors: their own gentle schedule, one at a time ----
  const shadeF=(cx,cy,r,c)=>{const b=dark>.5?mixc(c,'#1a1830',.3):c,g=x.createRadialGradient(cx-r*.35,cy-r*.45,r*.1,cx,cy,r*1.15);g.addColorStop(0,mixc(b,'#ffffff',.22));g.addColorStop(.6,b);g.addColorStop(1,mixc(b,'#000000',.3));return g};
  const walkPath=(p,a,b,sitX,s1,s2)=>p<s1?{x:lerp(a,sitX,ease(p/s1)),m:'go'}:p<s2?{x:sitX,m:'sit'}:{x:lerp(sitX,b,ease((p-s2)/(1-s2))),m:'go'};
  const VIS={
   rabbit:{msg:'うさぎが ぴょんぴょん やってきた🐰',dur:22,when:null,draw(p,st,et){const gy=WT+WH*.93,w=walkPath(p,-30*k,W+30*k,WL+WW*.2,.3,.72),s=k*1.45,hop=w.m==='go'?Math.abs(Math.sin(et*7))*10*s:0,c0=st.c??=(Math.random()<.5?'#f4f1ea':'#b98a62'),c=dark>.5?mixc(c0,'#1a1830',.3):c0;
     x.globalAlpha=fade(p,.02,.02);evShad(w.x,gy,9*s);x.save();x.translate(w.x,gy-hop);
     x.fillStyle=shadeF(0,-8*s,10*s,c0);x.beginPath();x.ellipse(0,-7*s,9*s,6.5*s,0,0,7);x.fill();x.fillStyle=shadeF(7*s,-13*s,5*s,c0);x.beginPath();x.arc(7*s,-12*s,4.6*s,0,7);x.fill();
     const tw=w.m==='sit'?Math.sin(et*5)*.15:0;[[-.25,5],[.1,8]].forEach(([r0,ox])=>{x.save();x.translate(ox*s,-15*s);x.rotate(r0+tw);x.fillStyle=c;x.beginPath();x.ellipse(0,-5*s,1.8*s,6*s,0,0,7);x.fill();x.fillStyle='#f3b6c4';x.beginPath();x.ellipse(0,-5*s,.8*s,4.5*s,0,0,7);x.fill();x.restore()});
     x.fillStyle='#fff';x.beginPath();x.arc(-9*s,-8*s,2.6*s,0,7);x.fill();x.fillStyle='#2a1a14';x.beginPath();x.arc(9*s,-13*s,.9*s,0,7);x.fill();x.fillStyle='#f3a6b6';x.beginPath();x.arc(11.4*s,-11.5*s,.7*s,0,7);x.fill();x.restore();x.globalAlpha=1}},
   tanuki:{msg:'たぬきが 焚き火を のぞきに きた',dur:26,when:'night',draw(p,st,et){const[fx]=fireP(),gy=WT+WH*.975,w=walkPath(p,-40*k,W+40*k,fx-100*k,.3,.75),s=k*1.3,ph=et*9;x.globalAlpha=fade(p,.02,.02);evShad(w.x,gy,14*s);x.save();x.translate(w.x,gy);
     x.fillStyle='#3a2a1e';if(w.m==='go')[[-7,0],[-4,1.6],[7,3.1],[10,4.7]].forEach(([lx,o])=>{x.fillRect(lx*s+Math.sin(ph+o)*2*s,-6*s,2.6*s,6*s)});else{x.fillRect(-8*s,-4*s,5*s,4*s);x.fillRect(6*s,-4*s,5*s,4*s)}
     x.fillStyle='#7a5a3a';x.beginPath();x.ellipse(-15*s,-10*s,7*s,4.6*s,-.5,0,7);x.fill();x.fillStyle='#3a2a1e';x.fillRect(-19*s,-12*s,2*s,5*s);x.fillRect(-15*s,-14*s,2*s,6*s);
     x.fillStyle=shadeF(0,-11*s,13*s,'#8a6a48');x.beginPath();x.ellipse(0,-10*s,13*s,(w.m==='sit'?9:7.5)*s,0,0,7);x.fill();x.fillStyle='#c9ab86';x.beginPath();x.ellipse(4*s,-8*s,7*s,4*s,0,0,7);x.fill();
     x.fillStyle='#8a6a48';x.beginPath();x.arc(13*s,-16*s,6.2*s,0,7);x.fill();x.fillStyle='#3a2a1e';x.beginPath();x.moveTo(9*s,-21*s);x.lineTo(10*s,-26*s);x.lineTo(13*s,-22*s);x.moveTo(15*s,-22*s);x.lineTo(17*s,-26*s);x.lineTo(18*s,-20*s);x.fill();
     x.fillStyle='#e8dcc6';x.beginPath();x.ellipse(15*s,-13*s,4.5*s,3*s,0,0,7);x.fill();x.fillStyle='#2a1c12';x.beginPath();x.ellipse(13*s,-17*s,5.4*s,2*s,0,0,7);x.fill();x.fillStyle='#fff7';x.beginPath();x.arc(11.5*s,-17*s,.8*s,0,7);x.arc(15*s,-17*s,.8*s,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(19*s,-13.5*s,1.2*s,0,7);x.fill();
     if(w.m==='sit'){x.save();x.globalCompositeOperation='lighter';glow(8*s,-12*s,16*s,'rgba(255,150,60,.18)');x.restore()}x.restore();x.globalAlpha=1}},
   fox:{msg:'きつねが そっと 通りすぎる🦊',dur:20,when:'dusk',draw(p,st,et){const gy=shore+26*k,w=walkPath(p,W+30*k,-40*k,WL+WW*.62,.35,.7),s=k*1.1,ph=et*10;x.globalAlpha=fade(p,.03,.03);evShad(w.x,gy,13*s);x.save();x.translate(w.x,gy);x.scale(-1,1);
     x.strokeStyle='#5a2e14';x.lineWidth=2*s;x.lineCap='round';if(w.m==='go')[[-8,0],[-5,1.6],[7,3.1],[10,4.7]].forEach(([lx,o])=>{x.beginPath();x.moveTo(lx*s,-9*s);x.lineTo(lx*s+Math.sin(ph+o)*3*s,0);x.stroke()});else{x.beginPath();x.moveTo(8*s,-9*s);x.lineTo(9*s,0);x.moveTo(11*s,-9*s);x.lineTo(12*s,0);x.stroke()}
     x.fillStyle='#d9772f';x.beginPath();x.moveTo(-10*s,-12*s);x.quadraticCurveTo(-26*s,-18*s+Math.sin(et*2)*2*s,-28*s,-8*s);x.quadraticCurveTo(-20*s,-6*s,-10*s,-9*s);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(-27*s,-9*s,2.4*s,0,7);x.fill();
     x.fillStyle=shadeF(0,-13*s,12*s,'#d9772f');x.beginPath();x.ellipse(0,-12*s,12*s,(w.m==='sit'?6:4.6)*s,w.m==='sit'?-.35:0,0,7);x.fill();x.fillStyle='#fff1e0';x.beginPath();x.ellipse(9*s,-11*s,3.6*s,3*s,0,0,7);x.fill();
     const hy=w.m==='sit'?-24:-17;x.fillStyle='#d9772f';x.beginPath();x.moveTo(8*s,(hy+3)*s);x.lineTo(21*s,(hy+5)*s);x.lineTo(10*s,(hy+9)*s);x.closePath();x.fill();x.beginPath();x.arc(10*s,(hy+4)*s,4.5*s,0,7);x.fill();
     x.beginPath();x.moveTo(7*s,(hy+1)*s);x.lineTo(8*s,(hy-6)*s);x.lineTo(11*s,(hy)*s);x.moveTo(11*s,(hy)*s);x.lineTo(13*s,(hy-6)*s);x.lineTo(14*s,(hy+1)*s);x.fill();x.fillStyle='#111';x.beginPath();x.arc(21*s,(hy+5)*s,1*s,0,7);x.arc(12*s,(hy+3)*s,.8*s,0,7);x.fill();x.restore();x.globalAlpha=1}},
   penguin:{msg:'ペンギンが 海から あがってきた🐧',dur:24,when:null,draw(p,st,et){const sx0=WL+WW*.6;let px,py,sc;if(p<.25){const q=ease(p/.25);px=sx0;py=lerp(seaY(.85),shore+16*k,q);sc=lerp(.7,1,q)}else if(p<.72){px=sx0+Math.sin((p-.25)*14)*30*k;py=shore+16*k;sc=1}else{const q=ease((p-.72)/.28);px=sx0;py=lerp(shore+16*k,seaY(.85),q);sc=lerp(1,.7,q)}
     const s=k*1.45*sc,wd=Math.sin(et*9)*.14;x.globalAlpha=fade(p,.05,.05);evShad(px,py,7*s);x.save();x.translate(px,py);x.rotate(wd);
     x.fillStyle='#ff9a2e';x.fillRect(-4*s,-1.2*s,3.6*s,1.6*s);x.fillRect(.6*s,-1.2*s,3.6*s,1.6*s);x.fillStyle=shadeF(0,-13*s,10*s,'#2a3044');x.beginPath();x.ellipse(0,-11*s,6.5*s,10.5*s,0,0,7);x.fill();
     x.fillStyle='#f4f4f0';x.beginPath();x.ellipse(1*s,-9.5*s,4.2*s,8*s,0,0,7);x.fill();x.fillStyle='#1d2230';x.beginPath();x.arc(0,-21*s,4.8*s,0,7);x.fill();x.save();x.translate(-5.5*s,-12*s);x.rotate(.35+Math.sin(et*9)*.25);x.beginPath();x.ellipse(0,0,1.8*s,6*s,0,0,7);x.fill();x.restore();
     x.fillStyle='#fff';x.beginPath();x.arc(2*s,-22*s,1.6*s,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(2.4*s,-22*s,.8*s,0,7);x.fill();x.fillStyle='#ff9a2e';x.beginPath();x.moveTo(4*s,-21*s);x.lineTo(8*s,-20*s);x.lineTo(4*s,-19*s);x.fill();x.restore();x.globalAlpha=1}},
   seal:{msg:'アザラシが 波打ち際で ひとやすみ',dur:30,when:null,draw(p,st,et){const sx=WL+WW*.74,sy=shore+5*k,up=p<.12?p/.12:p>.86?(1-p)/.14:1,s=k*1.35,br=1+Math.sin(et*1.6)*.03;x.save();x.globalAlpha=Math.min(1,up*1.2);x.translate(sx,sy+(1-up)*10*k);
     x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(0,2*s,24*s,4*s,0,0,7);x.fill();x.fillStyle=shadeF(0,-8*s,20*s,'#8a909c');x.beginPath();x.ellipse(0,-6*s,20*s*br,7.5*s,0,0,7);x.fill();
     x.beginPath();x.moveTo(-18*s,-6*s);x.lineTo(-28*s,-12*s+Math.sin(et*3)*2*s);x.lineTo(-27*s,-2*s);x.closePath();x.fill();x.fillStyle='#a9aeb8';x.beginPath();x.ellipse(2*s,-3.5*s,14*s,3*s,0,0,7);x.fill();
     x.fillStyle='#6d737e';[[-8,-9],[-2,-11],[5,-8],[-12,-6]].forEach(([a,b])=>{x.beginPath();x.arc(a*s,b*s,1.2*s,0,7);x.fill()});x.fillStyle='#8a909c';x.beginPath();x.arc(19*s,-11*s,6.5*s,0,7);x.fill();
     x.save();x.translate(8*s,-4*s);x.rotate(Math.sin(et*2.4)*.5);x.fillStyle='#7a808c';x.beginPath();x.ellipse(0,3*s,2.2*s,5*s,.3,0,7);x.fill();x.restore();
     x.fillStyle='#111';x.beginPath();x.arc(21*s,-13*s,1.3*s,0,7);x.arc(24.5*s,-10.5*s,1*s,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.5;x.beginPath();x.moveTo(24*s,-9.5*s);x.lineTo(30*s,-11*s);x.moveTo(24*s,-9*s);x.lineTo(30*s,-8*s);x.stroke();x.restore()}},
   hermit:{msg:'ヤドカリが のそのそ 歩いてる',dur:30,when:null,draw(p,st,et){const gy=WT+WH*.9,hx=lerp(W+20*k,-20*k,p),s=k*1.5;x.globalAlpha=fade(p,.03,.03);evShad(hx,gy,7*s);x.save();x.translate(hx,gy);
     x.strokeStyle='#d0502c';x.lineWidth=1.3*s;x.lineCap='round';for(let n=0;n<3;n++){const o=Math.sin(et*8+n)*1.5*s;x.beginPath();x.moveTo(-3*s+n*2*s,-3*s);x.lineTo(-6*s+n*2*s+o,0);x.stroke()}
     x.fillStyle='#e05a34';x.beginPath();x.ellipse(-5*s,-5*s,3*s,2.4*s,0,0,7);x.fill();x.beginPath();x.moveTo(-6*s,-6*s);x.lineTo(-7*s,-10*s);x.moveTo(-4*s,-6*s);x.lineTo(-4.5*s,-10.5*s);x.stroke();x.fillStyle='#111';x.beginPath();x.arc(-7*s,-10.5*s,.8*s,0,7);x.arc(-4.5*s,-11*s,.8*s,0,7);x.fill();
     const g=x.createRadialGradient(2*s,-8*s,1*s,3*s,-6*s,8*s);g.addColorStop(0,'#fff1d8');g.addColorStop(1,'#c79a62');x.fillStyle=g;x.beginPath();x.ellipse(3*s,-6*s,7*s,6*s,0,0,7);x.fill();
     x.strokeStyle='#8a5f32';x.lineWidth=.9*s;x.beginPath();for(let a=0;a<12;a+=.3){const r=6*s*(1-a/13);x.lineTo(3*s+Math.cos(a)*r,-6*s+Math.sin(a)*r*.85)}x.stroke();x.restore();x.globalAlpha=1}},
   deer:{msg:'朝もやの 中を しかが 歩いていく🦌',dur:24,when:'morning',draw(p,st,et){const gy=shore+12*k,dx=lerp(-30*k,W+30*k,p),s=k*1,ph=et*5;x.globalAlpha=fade(p,.06,.06)*.92;evShad(dx,gy,13*s);x.save();x.translate(dx,gy);
     x.strokeStyle='#5d3f26';x.lineWidth=2.2*s;x.lineCap='round';[[-9,0],[-6,1.6],[8,3.1],[11,4.7]].forEach(([lx,o])=>{x.beginPath();x.moveTo(lx*s,-16*s);x.lineTo(lx*s+Math.sin(ph+o)*3*s,0);x.stroke()});
     x.fillStyle=shadeF(0,-20*s,14*s,'#9a6a3e');x.beginPath();x.ellipse(0,-19*s,14*s,6.5*s,0,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.ellipse(-13*s,-20*s,2.4*s,2*s,0,0,7);x.fill();
     x.fillStyle='#e8d6bc';[[-6,-20],[-1,-21],[4,-20],[-3,-17],[2,-17]].forEach(([a,b])=>{x.beginPath();x.arc(a*s,b*s,1*s,0,7);x.fill()});
     x.fillStyle='#9a6a3e';x.beginPath();x.moveTo(10*s,-22*s);x.lineTo(16*s,-34*s);x.lineTo(20*s,-32*s);x.lineTo(15*s,-20*s);x.fill();x.beginPath();x.ellipse(20*s,-34*s,5*s,3.4*s,.3,0,7);x.fill();
     x.strokeStyle='#e9dcc4';x.lineWidth=1.3*s;x.beginPath();x.moveTo(18*s,-37*s);x.lineTo(15*s,-45*s);x.lineTo(12*s,-48*s);x.moveTo(15*s,-45*s);x.lineTo(19*s,-49*s);x.moveTo(20*s,-37*s);x.lineTo(21*s,-46*s);x.lineTo(25*s,-49*s);x.stroke();x.fillStyle='#111';x.beginPath();x.arc(24.5*s,-33*s,1*s,0,7);x.fill();x.restore();x.globalAlpha=1}},
   ducks:{msg:'カモの 親子が 行進してる🦆',dur:20,when:'day',draw(p,st,et){const gy=WT+WH*.88,s=k*1.25;x.globalAlpha=fade(p,.03,.03);[0,1,2,3,4].forEach(n=>{const sc=n?.6:1,dx=lerp(-30*k,W+120*k,p)-n*18*k,bob=Math.abs(Math.sin(et*8+n))*1.6*s,ss=s*sc;evShad(dx,gy,7*ss);x.save();x.translate(dx,gy-bob);
       x.fillStyle=n?'#ffd84a':'#b48a5a';x.beginPath();x.ellipse(0,-6*ss,8*ss,5*ss,0,0,7);x.fill();x.beginPath();x.arc(6*ss,-12*ss,3.8*ss,0,7);x.fill();if(!n){x.fillStyle='#2f7a4a';x.beginPath();x.arc(6*ss,-12*ss,3.8*ss,0,7);x.fill();x.fillStyle='#fff';x.fillRect(3*ss,-9.5*ss,6*ss,1.2*ss)}
       x.fillStyle='#ff9a2e';x.beginPath();x.ellipse(10*ss,-11.5*ss,2.8*ss,1.2*ss,0,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(7*ss,-13*ss,.7*ss,0,7);x.fill();x.fillStyle='#ff9a2e';x.fillRect(-2*ss,-1.4*ss,2*ss,1.4*ss);x.fillRect(1.5*ss,-1.4*ss,2*ss,1.4*ss);x.restore()});x.globalAlpha=1}},
   flamingo:{msg:'フラミンゴが 浅瀬に 立ってる🦩',dur:30,when:'day',draw(p,st,et){const fx2=WL+WW*.82,fy=shore-1*k,w=walkPath(p,W+40*k,W+40*k,fx2,.18,.82),s=k*1.3,dip=w.m==='sit'&&Math.sin(et*.8)>.7;x.globalAlpha=fade(p,.03,.03);x.save();x.translate(w.x,fy);
     x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=.8;x.beginPath();x.ellipse(0,0,8*s,1.6*s,0,0,7);x.stroke();x.strokeStyle='#e8749a';x.lineWidth=1.4*s;x.beginPath();x.moveTo(0,0);x.lineTo(0,-22*s);x.stroke();if(w.m==='go'){x.beginPath();x.moveTo(2*s,-22*s);x.lineTo(3*s+Math.sin(et*6)*3*s,0);x.stroke()}else{x.beginPath();x.moveTo(1*s,-22*s);x.lineTo(5*s,-15*s);x.lineTo(1*s,-12*s);x.stroke()}
     x.fillStyle='#f48fb1';x.beginPath();x.ellipse(1*s,-26*s,9*s,5.5*s,-.15,0,7);x.fill();x.fillStyle='#e0607e';x.beginPath();x.ellipse(-3*s,-26*s,5*s,3*s,-.2,0,7);x.fill();
     x.strokeStyle='#f48fb1';x.lineWidth=2.4*s;x.beginPath();x.moveTo(8*s,-28*s);if(dip){x.quadraticCurveTo(16*s,-24*s,12*s,-6*s)}else{x.bezierCurveTo(14*s,-34*s,4*s,-40*s,10*s,-48*s)}x.stroke();
     const hx=dip?12:10,hy=dip?-6:-48;x.fillStyle='#f48fb1';x.beginPath();x.arc(hx*s,hy*s,2.6*s,0,7);x.fill();x.fillStyle='#222';x.beginPath();x.moveTo((hx+2)*s,(hy-1)*s);x.lineTo((hx+6)*s,(hy+1)*s);x.lineTo((hx+5)*s,(hy+4)*s);x.lineTo((hx+1.5)*s,(hy+1.5)*s);x.fill();x.restore();x.globalAlpha=1}},
   otter:{msg:'ラッコが ぷかぷか 浮いてる🦦',dur:30,when:null,layer:'sea',draw(p,st,et){const ox=lerp(WL+WW*.2,WL+WW*.7,p),oy=seaY(.5)+Math.sin(et*1.5)*1.5*k,s=k*1.4,tap=Math.abs(Math.sin(et*6))>.8;x.globalAlpha=fade(p,.08,.08);x.save();x.translate(ox,oy);
     x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.8;x.beginPath();x.ellipse(0,3*s,20*s,3*s,0,0,7);x.stroke();x.fillStyle='#6b4a33';x.beginPath();x.ellipse(0,0,15*s,5.5*s,0,Math.PI,0);x.fill();
     x.fillStyle='#d9c2a3';x.beginPath();x.arc(13*s,-3*s,5*s,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(14*s,-5*s,.8*s,0,7);x.arc(17*s,-3.5*s,1*s,0,7);x.fill();
     x.fillStyle='#e9e1d0';x.beginPath();x.ellipse(2*s,-7*s-(tap?1.5*s:0),3.6*s,2.6*s,0,0,7);x.fill();x.strokeStyle='#5a3b26';x.lineWidth=2*s;x.lineCap='round';x.beginPath();x.moveTo(5*s,-4*s);x.lineTo(3*s,-7*s-(tap?1.5*s:0));x.moveTo(-1*s,-4*s);x.lineTo(1*s,-7*s-(tap?1.5*s:0));x.stroke();
     x.fillStyle='#5a3b26';x.beginPath();x.ellipse(-14*s,-3*s,3*s,1.6*s,-.5,0,7);x.fill();if(tap&&Math.random()<.3){x.fillStyle='#fff';x.font=`${7*k}px sans-serif`;x.fillText('コン',4*s,-12*s)}x.restore();x.globalAlpha=1}},
   hatch:{msg:'ウミガメの 赤ちゃんが 海へ…🐢',dur:26,when:'night',draw(p,st,et){st.b??=Array.from({length:7},(_,n)=>({x:WL+WW*(.58+Math.random()*.3),y:WT+WH*(.84+Math.random()*.1),d:Math.random()*.25,v:.8+Math.random()*.4}));const s=k*1.15;x.globalAlpha=fade(p,.05,.05);
     for(const b of st.b){const q=Math.max(0,Math.min(1,(p-b.d)*b.v*1.5));if(q>=1)continue;const tx=b.x+(q*20-10)*k,ty=lerp(b.y,shore-2*k,q),sw=Math.sin(et*12+b.x)*.5;x.save();x.translate(tx,ty);x.rotate(-1.4+sw*.2);
       x.fillStyle='#4a5a3a';x.beginPath();x.ellipse(0,0,3.6*s,4.6*s,0,0,7);x.fill();x.fillStyle='#6e7f55';x.beginPath();x.ellipse(0,-.5*s,2.4*s,3.2*s,0,0,7);x.fill();x.fillStyle='#4a5a3a';x.beginPath();x.arc(0,-5.5*s,1.8*s,0,7);x.fill();
       [[-1,1],[1,1]].forEach(([a])=>{x.save();x.translate(a*3.5*s,-1.5*s);x.rotate(a*(.9+sw));x.beginPath();x.ellipse(0,0,1*s,3*s,0,0,7);x.fill();x.restore()});x.restore()}x.globalAlpha=1}}
  };
  Object.assign(VIS,{
   pelican:{msg:'ペリカンが 魚を ねらってる',dur:20,when:'day',layer:'sky',draw(p,st,et){const a=fade(p,.05,.05),s=k*1.3;let px,py,dive=0;if(p<.55){px=lerp(-30*k,WL+WW*.6,p/.55);py=hz-30*k+Math.sin(et*1.2)*4*k}else if(p<.7){const q=(p-.55)/.15;px=WL+WW*.6+q*20*k;py=lerp(hz-30*k,seaY(.4),q*q);dive=q}else{const q=(p-.7)/.3;px=WL+WW*.6+20*k+q*WW*.6;py=lerp(seaY(.4),hz-50*k,Math.sqrt(q));dive=0}
     x.globalAlpha=a;x.save();x.translate(px,py);if(dive)x.rotate(dive*1.1);const fl=Math.sin(et*5)*(dive?0:1);x.fillStyle=sil('#f2efe8');x.beginPath();x.ellipse(0,0,9*s,3.4*s,0,0,7);x.fill();
     x.beginPath();x.moveTo(-2*s,-1*s);x.lineTo(-10*s,-8*s*fl-2*s);x.lineTo(4*s,-1*s);x.fill();x.fillStyle=sil('#3a3a3a');x.beginPath();x.moveTo(-8*s,-6*s*fl-2*s);x.lineTo(-11*s,-8*s*fl-2*s);x.lineTo(-6*s,-4*s*fl-1*s);x.fill();
     x.fillStyle=sil('#f2efe8');x.beginPath();x.arc(9*s,-2*s,2.4*s,0,7);x.fill();x.fillStyle=sil('#f2b04e');x.beginPath();x.moveTo(10*s,-2.6*s);x.lineTo(20*s,-.5*s);x.lineTo(10*s,0);x.fill();x.fillStyle=sil('#e8a040');x.beginPath();x.moveTo(11*s,0);x.quadraticCurveTo(15*s,3*s,19*s,0);x.fill();x.restore();
     if(p>.68&&p<.74){x.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<6;i++){x.beginPath();x.arc(WL+WW*.6+20*k+(i-2.5)*4*k,seaY(.4)-((p-.68)*200)*Math.abs(Math.sin(i))*k,1.5*k,0,7);x.fill()}}x.globalAlpha=1}},
   ray:{msg:'エイが 海から ジャンプ！',dur:14,when:null,layer:'sea',draw(p,st,et){const a=fade(p,.05,.1),bx=WL+WW*(.3+p*.4),base=seaY(.45),s=k*1.2;x.globalAlpha=a;const jumps=[[.15,.35],[.5,.7]];
     for(const[j0,j1]of jumps){if(p>j0&&p<j1){const q=(p-j0)/(j1-j0),y=base-Math.sin(q*Math.PI)*26*k,fl=Math.sin(et*10)*.3;x.save();x.translate(bx+(q-.5)*30*k,y);x.rotate((q-.5)*.6);x.fillStyle=sil('#4a5a6a');x.beginPath();x.moveTo(8*s,0);x.quadraticCurveTo(0,-4*s,-9*s,-5*s-fl*6*s);x.quadraticCurveTo(-5*s,0,-9*s,5*s+fl*6*s);x.quadraticCurveTo(0,4*s,8*s,0);x.fill();
       x.strokeStyle=sil('#4a5a6a');x.lineWidth=.8*s;x.beginPath();x.moveTo(-6*s,0);x.lineTo(-18*s,1*s);x.stroke();x.fillStyle='#fff';x.beginPath();x.arc(5*s,-1.5*s,.6*s,0,7);x.fill();x.restore()}
       if(Math.abs(p-j1)<.04||Math.abs(p-j0)<.04){x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1;x.beginPath();x.ellipse(bx+(p>j1-.05?15:-15)*k,base,10*k,2*k,0,0,7);x.stroke()}}x.globalAlpha=1}},
   orca:{msg:'シャチの 群れが 沖を 泳いでる',dur:22,when:null,layer:'sea',draw(p,st,et){const a=fade(p,.06,.08);x.globalAlpha=a;[0,.12,.22].forEach((o,n)=>{const ox=lerp(W+40*k,-60*k,p)+n*26*k,f=.3+n*.06,oy=seaY(f),ph=Math.sin(et*1.6+n*1.3),up=Math.max(0,ph),s=k*(.7+f*.6);if(up<.05)return;
     x.save();x.beginPath();x.rect(0,0,W,oy+.5*k);x.clip();x.fillStyle=sil('#111418');x.beginPath();x.ellipse(ox,oy+(1-up)*8*s,16*s,5*s*up,0,Math.PI,0);x.fill();x.beginPath();x.moveTo(ox-2*s,oy-4*s*up);x.lineTo(ox+1*s,oy-(4+12*up)*s);x.lineTo(ox+5*s,oy-4*s*up);x.fill();
     x.fillStyle=sil('#f4f4f4');x.beginPath();x.ellipse(ox-9*s,oy-3*s*up,2.6*s,1.1*s*up,0,0,7);x.fill();x.restore();if(n===0&&ph>.9){x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(ox-10*s,oy-14*s,2*s,6*s,0,0,7);x.fill()}});x.globalAlpha=1}},
   crane:{msg:'鶴が 優雅に 飛んでいく',dur:22,when:'morning',layer:'sky',draw(p,st,et){const a=fade(p,.06,.06);x.globalAlpha=a;[0,1].forEach(n=>{const cx=lerp(-40*k,W+40*k,p-n*.05),cy=hz*.45+n*14*k+Math.sin(et+n)*3*k,s=k*1.2,fl=Math.sin(et*2.6+n);x.save();x.translate(cx,cy);
     x.strokeStyle=sil('#f6f6f6');x.lineWidth=1.2*s;x.beginPath();x.moveTo(6*s,0);x.lineTo(16*s,-1*s);x.moveTo(-6*s,0);x.lineTo(-16*s,1*s);x.stroke();x.fillStyle=sil('#f6f6f6');x.beginPath();x.ellipse(0,0,7*s,2.4*s,0,0,7);x.fill();
     x.beginPath();x.moveTo(-3*s,0);x.quadraticCurveTo(0,-14*s*fl,8*s,-16*s*fl);x.lineTo(4*s,0);x.fill();x.fillStyle=sil('#222222');x.beginPath();x.moveTo(4*s,-12*s*fl);x.lineTo(8*s,-16*s*fl);x.lineTo(6*s,-9*s*fl);x.fill();x.fillStyle='#d23b3b';x.beginPath();x.arc(16*s,-1.4*s,.9*s,0,7);x.fill();x.restore()});x.globalAlpha=1}},
   owl:{msg:'フクロウが 杭の上に とまった',dur:40,when:'night',layer:'beach',draw(p,st,et){const a=fade(p,.12,.12),ox=WL+WW*.16,oy=shore+12*k,s=k*1.2;x.globalAlpha=a;x.fillStyle=sil('#5a4030');x.fillRect(ox-2.5*s,oy+8*s,5*s,22*k);blink=Math.sin(et*.9)>.95,turn=Math.sin(et*.4)*2*s;x.globalAlpha=a;x.save();x.translate(ox,oy);
     x.fillStyle='#7a5a3a';x.beginPath();x.ellipse(0,0,6*s,8*s,0,0,7);x.fill();x.fillStyle='#c9a77a';x.beginPath();x.ellipse(0,2*s,4*s,5*s,0,0,7);x.fill();x.fillStyle='#7a5a3a';x.beginPath();x.arc(turn*.3,-7*s,5.2*s,0,7);x.fill();
     x.beginPath();x.moveTo(-4*s+turn*.3,-10*s);x.lineTo(-5*s+turn*.3,-14*s);x.lineTo(-2*s+turn*.3,-11*s);x.moveTo(4*s+turn*.3,-10*s);x.lineTo(5*s+turn*.3,-14*s);x.lineTo(2*s+turn*.3,-11*s);x.fill();
     [-2,2].forEach(e=>{x.fillStyle='#ffe07a';x.beginPath();x.arc(e*s+turn*.4,-7.5*s,1.8*s,0,7);x.fill();x.fillStyle='#111';blink?x.fillRect(e*s+turn*.4-1.8*s,-7.8*s,3.6*s,.6*s):(x.beginPath(),x.arc(e*s+turn*.4,-7.5*s,.9*s,0,7),x.fill())});
     x.fillStyle='#e8a040';x.beginPath();x.moveTo(-.7*s+turn*.4,-6*s);x.lineTo(.7*s+turn*.4,-6*s);x.lineTo(turn*.4,-4.4*s);x.fill();x.restore();if(Math.sin(et*.5)>.97){x.fillStyle='rgba(255,255,255,.8)';x.font=`${7*k}px sans-serif`;x.fillText('ホー',ox-20*k,oy-18*k)}x.globalAlpha=1}},
   shiba:{msg:'柴犬が 全力で 走ってきた',dur:12,when:'day',draw(p,st,et){const gy=shore+22*k,hx=lerp(-30*k,W+30*k,p),s=k*1.2,b=Math.abs(Math.sin(et*14))*2*s;x.globalAlpha=fade(p,.05,.05);evShad(hx,gy,7*k);x.save();x.translate(hx,gy-b);
     x.fillStyle=sil('#d98a3c');x.beginPath();x.ellipse(0,-6*s,8*s,4*s,0,0,7);x.fill();x.strokeStyle=sil('#d98a3c');x.lineWidth=2*s;x.lineCap='round';const l=Math.sin(et*14)*3*s;x.beginPath();x.moveTo(-5*s,-4*s);x.lineTo(-5*s-l,0);x.moveTo(5*s,-4*s);x.lineTo(5*s+l,0);x.stroke();
     x.fillStyle=sil('#d98a3c');x.beginPath();x.arc(8*s,-10*s,3.6*s,0,7);x.fill();x.beginPath();x.moveTo(6*s,-12*s);x.lineTo(6.5*s,-16*s);x.lineTo(8.5*s,-13*s);x.moveTo(9*s,-13*s);x.lineTo(10.5*s,-16*s);x.lineTo(11*s,-12*s);x.fill();
     x.fillStyle=sil('#fff3e0');x.beginPath();x.ellipse(10*s,-8.6*s,2.4*s,1.6*s,0,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(12*s,-9*s,.6*s,0,7);x.arc(9*s,-11*s,.5*s,0,7);x.fill();
     x.strokeStyle=sil('#d98a3c');x.lineWidth=2*s;x.beginPath();x.arc(-9*s,-10*s,2.5*s,0,Math.PI*1.5);x.stroke();x.restore();x.globalAlpha=1}},
   horse:{msg:'馬に 乗った 人が 波打ち際を 歩いてる',dur:34,when:null,draw(p,st,et){const gy=shore+8*k,hx=lerp(W+50*k,-60*k,p),s=k*1.1,g=Math.sin(et*5);x.globalAlpha=fade(p,.05,.05);evShad(hx,gy,14*k);x.save();x.translate(hx,gy);
     const C=sil('#6b4226');x.strokeStyle=C;x.lineWidth=2*s;x.lineCap='round';[[-8,g],[-5,-g],[7,-g],[10,g]].forEach(([lx,q])=>{x.beginPath();x.moveTo(lx*s,-14*s);x.lineTo(lx*s+q*2*s,0);x.stroke()});
     x.fillStyle=C;x.beginPath();x.ellipse(0,-16*s,13*s,5.5*s,0,0,7);x.fill();x.beginPath();x.moveTo(-10*s,-19*s);x.lineTo(-17*s,-28*s);x.lineTo(-20*s,-26*s);x.lineTo(-14*s,-16*s);x.fill();x.beginPath();x.ellipse(-19*s,-27*s,4.6*s,2.2*s,-.5,0,7);x.fill();
     x.strokeStyle=sil('#2a1a10');x.lineWidth=1.6*s;x.beginPath();x.moveTo(-12*s,-24*s);x.lineTo(-8*s,-18*s);x.moveTo(12*s,-17*s);x.quadraticCurveTo(17*s,-14*s,15*s,-6*s+g*s);x.stroke();x.restore();
     human(hx+1*k,gy-19*k,.8*k,0,'#f4f4f4','#e9bf98',false,-1,{hair:'#2a1a10',pants:'#2c3e66'});x.globalAlpha=1}},
   capy:{msg:'カピバラが のんびり 歩いてきた',dur:40,when:null,draw(p,st,et){const gy=shore+26*k,q=p<.4?p/.4:p<.6?1:1-(p-.6)/.4,hx=lerp(W+30*k,WL+WW*.72,q),s=k*1.3,sit=p>.4&&p<.6;x.globalAlpha=fade(p,.05,.05);evShad(hx,gy,10*k);x.save();x.translate(hx,gy);if(p>.6)x.scale(-1,1);
     x.fillStyle=sil('#8a6a48');x.beginPath();x.ellipse(0,-6*s,10*s,6*s,0,0,7);x.fill();x.beginPath();x.ellipse(-10*s,-9*s+(sit?1:0)*s,5.5*s,4*s,-.1,0,7);x.fill();x.fillStyle=sil('#6a4a30');x.beginPath();x.arc(-7*s,-13*s,1.4*s,0,7);x.fill();
     x.fillStyle='#111';x.beginPath();x.arc(-11*s,-10*s,.6*s,0,7);x.fill();x.fillStyle=sil('#6a4a30');if(!sit){const l=Math.sin(et*4)*1.5*s;x.fillRect(-6*s+l,-2*s,2.4*s,2*s);x.fillRect(5*s-l,-2*s,2.4*s,2*s)}
     if(sit&&Math.sin(et*.8)>.6){x.fillStyle='#ff9a3c';x.beginPath();x.arc(-8*s,-17*s,2.4*s,0,7);x.fill();x.fillStyle='#55a050';x.fillRect(-8.4*s,-20*s,.8*s,1.6*s)}x.restore();x.globalAlpha=1}},
   whaleshark:{msg:'ジンベエザメの 大きな 影…！',dur:30,when:'day',layer:'sea',draw(p,st,et){const a=fade(p,.1,.12),cx=lerp(WL-60*k,WL+WW+60*k,p),cy=seaY(.55),s=k*1.6;x.globalAlpha=a*.55;x.save();x.translate(cx,cy);x.scale(1,.35);
     x.fillStyle='#0d2a40';x.beginPath();x.ellipse(0,0,26*s,8*s,0,0,7);x.fill();x.beginPath();x.moveTo(-24*s,0);x.lineTo(-38*s,-9*s+Math.sin(et*2)*2*s);x.lineTo(-36*s,9*s+Math.sin(et*2)*2*s);x.fill();x.beginPath();x.moveTo(-4*s,4*s);x.lineTo(-10*s,16*s);x.lineTo(2*s,6*s);x.fill();
     x.fillStyle='rgba(200,230,255,.6)';for(let i=0;i<14;i++)x.fillRect((-18+(i%7)*5)*s,(-4+Math.floor(i/7)*4)*s,1*s,1*s);x.restore();x.globalAlpha=a;x.fillStyle=sil('#203040');x.beginPath();x.moveTo(cx-2*s,cy);x.lineTo(cx+1*s,cy-7*s);x.lineTo(cx+4*s,cy);x.fill();x.globalAlpha=1}},
   butterfly:{msg:'ちょうちょが ひらひら',dur:26,when:'day',layer:'front',draw(p,st,et){const a=fade(p,.06,.06);x.globalAlpha=a;[['#ffd23f',0],['#7aa2ff',.7]].forEach(([c,o],n)=>{const bx=lerp(-20*k,W+20*k,p)+Math.sin(et*.9+o*5)*30*k-n*30*k,by=shore+Math.sin(et*1.7+o*3)*16*k,s=k*1.7,f=Math.abs(Math.sin(et*12+o*4));x.save();x.translate(bx,by);
     x.fillStyle=c;x.beginPath();x.ellipse(-3*s*f,-2*s,3.4*s*f,2.6*s,-.5,0,7);x.ellipse(3*s*f,-2*s,3.4*s*f,2.6*s,.5,0,7);x.fill();x.beginPath();x.ellipse(-2*s*f,1.8*s,2.2*s*f,1.8*s,.4,0,7);x.ellipse(2*s*f,1.8*s,2.2*s*f,1.8*s,-.4,0,7);x.fill();x.fillStyle='#2a1d14';x.fillRect(-.4*s,-3*s,.8*s,6*s);x.restore()});x.globalAlpha=1}},
   swan:{msg:'白鳥が 海に 浮かんでる',dur:44,when:'morning',layer:'sea',draw(p,st,et){const a=fade(p,.08,.08);x.globalAlpha=a;[0,1,2].forEach(n=>{const sx=lerp(WL+WW*.15,WL+WW*.6,p)+n*16*k,sy=seaY(.62+n*.05)+Math.sin(et*1.2+n)*k,s=k*(1.2-n*.15);x.save();x.translate(sx,sy);
     x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.8;x.beginPath();x.ellipse(0,1*s,13*s,2*s,0,0,7);x.stroke();x.fillStyle='#fafafa';x.beginPath();x.moveTo(-9*s,0);x.quadraticCurveTo(-8*s,-7*s,2*s,-5*s);x.quadraticCurveTo(8*s,-4*s,8*s,0);x.fill();
     x.strokeStyle='#fafafa';x.lineWidth=2*s;x.lineCap='round';x.beginPath();x.moveTo(5*s,-3*s);x.quadraticCurveTo(10*s,-8*s,6*s,-14*s);x.stroke();x.fillStyle='#ff8a2a';x.beginPath();x.moveTo(6*s,-15*s);x.lineTo(10*s,-13.6*s);x.lineTo(6*s,-13*s);x.fill();x.restore()});x.globalAlpha=1}},
   parrot:{msg:'カラフルな オウムが 飛んできた',dur:16,when:'day',layer:'sky',draw(p,st,et){const a=fade(p,.05,.05),px=lerp(W+20*k,-20*k,p),py=hz-40*k+Math.sin(p*9)*20*k,s=k*1.3,f=Math.sin(et*14);x.globalAlpha=a;x.save();x.translate(px,py);x.scale(-1,1);
     x.fillStyle='#ff3b3b';x.beginPath();x.ellipse(0,0,6*s,2.6*s,-.1,0,7);x.fill();x.fillStyle='#3b7bff';x.beginPath();x.moveTo(-6*s,0);x.lineTo(-15*s,2*s);x.lineTo(-6*s,2*s);x.fill();x.fillStyle='#ffd23f';x.beginPath();x.moveTo(-1*s,-1*s);x.lineTo(-5*s,-9*s*f);x.lineTo(3*s,-1*s);x.fill();
     x.fillStyle='#ff3b3b';x.beginPath();x.arc(6*s,-1.6*s,2.4*s,0,7);x.fill();x.fillStyle='#f4f4f4';x.beginPath();x.moveTo(8*s,-2*s);x.lineTo(10.5*s,-.5*s);x.lineTo(8*s,.3*s);x.fill();x.fillStyle='#111';x.beginPath();x.arc(6.6*s,-2.4*s,.5*s,0,7);x.fill();x.restore();x.globalAlpha=1}}});
  Object.assign(VIS,{
   shiba:{msg:'柴犬が 全力で 走ってきた',dur:14,when:'day',draw(p,st,et){const gy=shore+22*k,stop=p>.42&&p<.58,hx=p<.42?lerp(-30*k,WL+WW*.5,p/.42):p<.58?WL+WW*.5:lerp(WL+WW*.5,W+30*k,(p-.58)/.42),s=k*1.25,run=!stop,c=sil('#d98a3c'),cl=sil('#fff3e0'),cd=sil('#b06a28');
     const b=run?Math.abs(Math.sin(et*14))*2*s:0;x.globalAlpha=fade(p,.05,.05);evShad(hx,gy,8*k);x.save();x.translate(hx,gy-b);
     const L=(lx,ph,back)=>{const sw=run?Math.sin(et*14+ph)*3.4*s:0;x.strokeStyle=back?cd:c;x.lineWidth=2.1*s;x.lineCap='round';x.beginPath();x.moveTo(lx*s,-5*s);x.lineTo(lx*s+sw*.6,-2.4*s);x.lineTo(lx*s+sw,0);x.stroke();x.fillStyle=cl;x.beginPath();x.ellipse(lx*s+sw+.4*s,0,1.3*s,.8*s,0,0,7);x.fill()};
     L(-5,1.6,1);L(5,0,1);
     const g=x.createLinearGradient(0,-10*s,0,-2*s);g.addColorStop(0,tone2(c,.12));g.addColorStop(1,cd);x.fillStyle=g;x.beginPath();x.ellipse(0,-6*s,8.4*s,4.2*s,0,0,7);x.fill();x.fillStyle=cl;x.beginPath();x.ellipse(1*s,-3.4*s,6*s,1.8*s,0,0,7);x.fill();
     L(-6.4,3.2,0);L(6.4,1.6,0);
     // しっぽ（くるん）
     const tw=Math.sin(et*(stop?10:4))*.3;x.save();x.translate(-8*s,-9*s);x.rotate(tw);x.strokeStyle=c;x.lineWidth=2.4*s;x.beginPath();x.arc(0,-2*s,2.3*s,Math.PI*.4,Math.PI*1.9);x.stroke();x.strokeStyle=cl;x.lineWidth=1*s;x.beginPath();x.arc(0,-2*s,1.6*s,Math.PI*.8,Math.PI*1.6);x.stroke();x.restore();
     // 頭
     const hy=stop?-12*s+Math.sin(et*2)*.4*s:-10.6*s;x.fillStyle=c;x.beginPath();x.ellipse(8.4*s,hy+1.6*s,2.6*s,3.4*s,.3,0,7);x.fill();x.beginPath();x.arc(9.4*s,hy,3.9*s,0,7);x.fill();
     x.beginPath();x.moveTo(6.8*s,hy-2.4*s);x.lineTo(7.2*s,hy-6.6*s);x.lineTo(9.4*s,hy-3.4*s);x.fill();x.beginPath();x.moveTo(10.4*s,hy-3.4*s);x.lineTo(12.2*s,hy-6.6*s);x.lineTo(12.6*s,hy-2.2*s);x.fill();
     x.fillStyle=sil('#f2b8a0');x.beginPath();x.moveTo(7.5*s,hy-3*s);x.lineTo(7.7*s,hy-5.3*s);x.lineTo(8.8*s,hy-3.4*s);x.fill();
     x.fillStyle=cl;x.beginPath();x.ellipse(11.8*s,hy+1.4*s,2.9*s,2.1*s,0,0,7);x.fill();x.beginPath();x.ellipse(8.4*s,hy+1.8*s,1.6*s,1.2*s,0,0,7);x.fill();
     x.fillStyle='#1a1414';x.beginPath();x.arc(14.3*s,hy+.6*s,.85*s,0,7);x.fill();x.beginPath();x.ellipse(10.6*s,hy-.9*s,.62*s,.75*s,0,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(10.8*s,hy-1.1*s,.22*s,0,7);x.fill();
     x.fillStyle=sil('#ff8a9a');if(run||Math.sin(et*3)>0){x.beginPath();x.ellipse(13*s,hy+3.3*s,.9*s,1.4*s,.2,0,7);x.fill()}
     x.restore();if(stop&&Math.sin(et*4)>.7){x.fillStyle='#fff';x.font=`${7*k}px sans-serif`;x.fillText('ワン！',hx+14*k,gy-26*k)}x.globalAlpha=1}},
   capy:{msg:'カピバラが のんびり 歩いてきた',dur:44,when:null,draw(p,st,et){const gy=shore+26*k,q=p<.38?p/.38:p<.62?1:1-(p-.62)/.38,hx=lerp(W+30*k,WL+WW*.72,q),s=k*1.35,sit=p>.38&&p<.62,c=sil('#8a6a48'),cd=sil('#6a4e34'),cl=sil('#a8865e');
     x.globalAlpha=fade(p,.05,.05);evShad(hx,gy,11*k);x.save();x.translate(hx,gy);if(p>.62)x.scale(-1,1);const stp=sit?0:Math.sin(et*4)*1.4*s;
     x.fillStyle=cd;[[-6,stp],[6,-stp]].forEach(([lx,o])=>{x.beginPath();x.ellipse(lx*s+o,-2.2*s,1.2*s,2.8*s,0,0,7);x.fill()});
     const g=x.createRadialGradient(-2*s,-10*s,1*s,0,-6*s,12*s);g.addColorStop(0,cl);g.addColorStop(1,cd);x.fillStyle=g;x.beginPath();x.moveTo(-10*s,-2*s);x.quadraticCurveTo(-12*s,-13*s,-2*s,-12.5*s);x.quadraticCurveTo(7*s,-12*s,8*s,-6*s);x.lineTo(8*s,-2*s);x.closePath();x.fill();
     x.strokeStyle=tone2(c,-.2);x.lineWidth=.4*s;for(let i=0;i<9;i++){x.beginPath();x.moveTo((-8+i*1.8)*s,(-10+Math.sin(i)*.6)*s);x.lineTo((-8.6+i*1.8)*s,(-7.4+Math.sin(i)*.6)*s);x.stroke()}
     x.fillStyle=c;[[-4,-stp],[7,stp]].forEach(([lx,o])=>{x.beginPath();x.ellipse(lx*s+o,-2*s,1.3*s,2.8*s,0,0,7);x.fill()});
     const hy=sit?-9*s:-8.4*s,nod=sit?Math.sin(et*.6)*.6*s:0;x.fillStyle=c;x.beginPath();x.moveTo(5*s,hy-3*s+nod);x.quadraticCurveTo(9*s,hy-5.6*s+nod,14.4*s,hy-2.4*s+nod);x.quadraticCurveTo(16*s,hy+1.4*s+nod,13.6*s,hy+3.2*s+nod);x.lineTo(6*s,hy+3.4*s+nod);x.closePath();x.fill();
     x.fillStyle=cd;x.beginPath();x.ellipse(7*s,hy-4.4*s+nod,1.3*s,1*s,-.3,0,7);x.fill();x.beginPath();x.ellipse(14.6*s,hy+.4*s+nod,.5*s,.8*s,0,0,7);x.fill();
     x.fillStyle='#1a1414';x.beginPath();x.ellipse(10.4*s,hy-1.8*s+nod,.75*s,sit&&Math.sin(et*.4)>.2?.15*s:.55*s,0,0,7);x.fill();x.strokeStyle=cd;x.lineWidth=.4*s;x.beginPath();x.moveTo(13.8*s,hy+1.8*s+nod);x.lineTo(15*s,hy+2*s+nod);x.stroke();
     if(sit){x.fillStyle=sil('#ff9a3c');const mg=x.createRadialGradient(9.4*s,hy-7.6*s,.4*s,10*s,hy-6.8*s,3*s);mg.addColorStop(0,sil('#ffc070'));mg.addColorStop(1,sil('#e8781a'));x.fillStyle=mg;x.beginPath();x.ellipse(10*s,hy-6.8*s+nod,2.8*s,2.2*s,0,0,7);x.fill();x.fillStyle=sil('#4a8a3a');x.beginPath();x.ellipse(10.6*s,hy-9.2*s+nod,1.4*s,.6*s,.4,0,7);x.fill()
       const q2=(et*.5)%1;x.globalAlpha=fade(p,.05,.05)*(1-q2)*.7;x.fillStyle='#fff';x.beginPath();x.arc(-2*s+q2*2*s,hy-8*s-q2*8*s,(1+q2*1.6)*s,0,7);x.fill()}
     x.restore();x.globalAlpha=1}},
   horse:{msg:'馬に 乗った 人が 波打ち際を 歩いてる',dur:34,when:null,draw(p,st,et){const gy=shore+8*k,hx=lerp(W+50*k,-60*k,p),s=k*1.1,g=Math.sin(et*5),C=sil('#6b4226'),Cd=sil('#4a2c18'),Cl=sil('#8a5a36'),M=sil('#2a1a10');x.globalAlpha=fade(p,.05,.05);evShad(hx,gy,15*k);
     x.save();x.translate(hx,gy);x.scale(-1,1);x.lineCap='round';
     const leg=(lx,a,back)=>{x.strokeStyle=back?Cd:C;x.lineWidth=2.2*s;x.beginPath();x.moveTo(lx*s,-14*s);x.lineTo(lx*s+a*1.6*s,-7*s);x.lineTo(lx*s+a*2.6*s,-1.2*s);x.stroke();x.fillStyle='#1a1414';x.fillRect(lx*s+a*2.6*s-1.3*s,-1.4*s,2.6*s,1.4*s)};
     leg(-8,g,1);leg(9,-g,1);
     const bg=x.createLinearGradient(0,-22*s,0,-10*s);bg.addColorStop(0,Cl);bg.addColorStop(1,Cd);x.fillStyle=bg;x.beginPath();x.moveTo(-13*s,-17*s);x.quadraticCurveTo(-13*s,-22*s,-4*s,-21.6*s);x.lineTo(9*s,-21*s);x.quadraticCurveTo(14*s,-20*s,13*s,-14*s);x.quadraticCurveTo(0,-10.4*s,-12*s,-13*s);x.closePath();x.fill();
     leg(-6,-g,0);leg(11,g,0);
     // 首と頭
     x.fillStyle=C;x.beginPath();x.moveTo(9*s,-20*s);x.quadraticCurveTo(13*s,-28*s,16*s,-32*s);x.lineTo(20*s,-30*s);x.quadraticCurveTo(16*s,-24*s,14*s,-15*s);x.closePath();x.fill();
     x.beginPath();x.ellipse(19.6*s,-29.4*s,5.4*s,2.6*s,.55,0,7);x.fill();x.fillStyle=Cd;x.beginPath();x.ellipse(22.6*s,-26.8*s,1.6*s,1.4*s,0,0,7);x.fill();
     x.fillStyle=C;x.beginPath();x.moveTo(15.6*s,-33*s);x.lineTo(16.4*s,-36*s);x.lineTo(17.6*s,-33*s);x.fill();x.fillStyle='#111';x.beginPath();x.arc(18.6*s,-30.6*s,.55*s,0,7);x.fill();
     x.strokeStyle=M;x.lineWidth=1.8*s;x.beginPath();x.moveTo(15.6*s,-33*s);x.quadraticCurveTo(12*s,-28*s+Math.sin(et*3)*s,10*s,-21*s);x.stroke();
     x.strokeStyle=M;x.lineWidth=1.8*s;x.beginPath();x.moveTo(-13*s,-18*s);x.quadraticCurveTo(-18*s,-14*s+Math.sin(et*4)*1.5*s,-16*s,-6*s+g*s);x.stroke();
     x.fillStyle=sil('#8a2a2a');x.fillRect(-4*s,-23*s,9*s,2.6*s);x.strokeStyle=sil('#3a2a1a');x.lineWidth=.5*s;x.beginPath();x.moveTo(17*s,-28*s);x.lineTo(4*s,-29*s);x.stroke();x.restore();
     {const hipY=gy-25.6*k,rb=Math.abs(g)*.6*k;x.save();x.beginPath();x.rect(hx-30*k,gy-80*k,60*k,80*k-25.2*k);x.clip();human(hx+1*k,hipY+10.6*k-rb,.85*k,0,'#f4f4f4','#e9bf98',false,-1,{hair:'#2a1a10',pants:'#2c3e66',hat:'straw',shorts:false});x.restore();const P=sil('#2c3e66');x.lineCap='round';x.strokeStyle=P;x.lineWidth=2.6*k;x.beginPath();x.moveTo(hx+1*k,hipY-rb);x.lineTo(hx-3.4*k,hipY+1.6*k-rb);x.lineTo(hx-2.6*k,hipY+7.6*k-rb);x.stroke();x.fillStyle=sil('#3a2a1a');x.beginPath();x.ellipse(hx-3.6*k,hipY+8*k-rb,2.2*k,1.1*k,0,0,7);x.fill()}x.globalAlpha=1}}});
  /* ---- 作り込み版の 動物 ---- */
  const wingP=(len,fl,c1,c2,s)=>{const g=x.createLinearGradient(0,0,0,-len*s);g.addColorStop(0,c1);g.addColorStop(1,c2);x.fillStyle=g;x.beginPath();x.moveTo(-3*s,0);x.quadraticCurveTo(-len*.4*s,-len*.6*s*fl-2*s,-len*s,-len*.25*s*fl-len*.5*s*fl);x.quadraticCurveTo(-len*.5*s,-len*.2*s*fl,4*s,1*s);x.closePath();x.fill();
    x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=.4*s;for(let i=1;i<4;i++){x.beginPath();x.moveTo(-len*.3*s,-len*.2*s*fl*i/2);x.lineTo(-len*(.55+i*.12)*s,-len*(.25+i*.12)*s*fl);x.stroke()}};
  Object.assign(VIS,{
   pelican:{msg:'ペリカンが 魚を ねらってる',dur:20,when:'day',layer:'sky',draw(p,st,et){const a=fade(p,.05,.05),s=k*1.35;let px,py,dive=0,catchF=p>.7;if(p<.55){px=lerp(-30*k,WL+WW*.6,p/.55);py=hz-34*k+Math.sin(et*1.2)*4*k}else if(p<.7){const q=(p-.55)/.15;px=WL+WW*.6+q*20*k;py=lerp(hz-34*k,seaY(.4),q*q);dive=q}else{const q=(p-.7)/.3;px=WL+WW*.6+20*k+q*WW*.6;py=lerp(seaY(.4),hz-56*k,Math.sqrt(q))}
     x.globalAlpha=a;x.save();x.translate(px,py);if(dive)x.rotate(dive*1.15);const fl=dive?.15:Math.sin(et*4.4);const W1=sil('#f4f1ea'),W2=sil('#d8d2c4'),D=sil('#2a2a30');
     x.save();x.scale(1,1);wingP(16,fl,W2,D,s);x.restore();
     const bg=x.createLinearGradient(0,-4*s,0,4*s);bg.addColorStop(0,W1);bg.addColorStop(1,W2);x.fillStyle=bg;x.beginPath();x.ellipse(0,0,10*s,3.8*s,-.05,0,7);x.fill();x.beginPath();x.moveTo(-9*s,-1*s);x.lineTo(-14*s,-2.5*s);x.lineTo(-13*s,1.5*s);x.fill();
     x.strokeStyle=W1;x.lineWidth=2.4*s;x.lineCap='round';x.beginPath();x.moveTo(7*s,-1.5*s);x.quadraticCurveTo(10*s,-6*s,11*s,-4*s);x.stroke();x.fillStyle=W1;x.beginPath();x.arc(11.4*s,-4.4*s,2.4*s,0,7);x.fill();
     x.fillStyle=sil('#f2b04e');x.beginPath();x.moveTo(12.6*s,-5.2*s);x.lineTo(23*s,-3.2*s);x.lineTo(13*s,-3*s);x.fill();x.fillStyle=sil(catchF?'#e89a3a':'#f0b860');x.beginPath();x.moveTo(13*s,-3.2*s);x.quadraticCurveTo(17*s,(catchF?3:.6)*s,22.6*s,-3.2*s);x.fill();
     if(catchF){x.fillStyle=sil('#9ab8d0');x.beginPath();x.ellipse(17*s,-1*s,2.2*s,1*s,.2,0,7);x.fill()}x.fillStyle='#111';x.beginPath();x.arc(11.8*s,-5.2*s,.5*s,0,7);x.fill();x.fillStyle=sil('#ffd27a');x.beginPath();x.ellipse(10.6*s,-6.4*s,1.6*s,.6*s,-.3,0,7);x.fill();
     wingP(16,-fl*.2+fl,W1,sil('#3a3a40'),s);x.restore();
     if(p>.68&&p<.75){x.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<9;i++){const q=(p-.68)/.07;x.beginPath();x.arc(WL+WW*.6+20*k+(i-4)*3*k*(1+q),seaY(.4)-Math.sin(q*Math.PI)*(6+Math.abs(Math.sin(i*1.7))*12)*k,1.4*k,0,7);x.fill()}}x.globalAlpha=1}},
   crane:{msg:'鶴が 優雅に 飛んでいく',dur:24,when:'morning',layer:'sky',draw(p,st,et){const a=fade(p,.06,.06);x.globalAlpha=a;[0,1].forEach(n=>{const cx=lerp(-50*k,W+50*k,p-n*.06),cy=hz*.42+n*16*k+Math.sin(et*.8+n)*3*k,s=k*1.3,fl=Math.sin(et*2.2+n*.8);x.save();x.translate(cx,cy);
     const W1=sil('#fbfbf8'),D=sil('#1e1e24');x.strokeStyle=W1;x.lineWidth=1.6*s;x.lineCap='round';x.beginPath();x.moveTo(6*s,-.5*s);x.quadraticCurveTo(12*s,-2*s,18*s,-1*s);x.stroke();x.strokeStyle=D;x.lineWidth=1.2*s;x.beginPath();x.moveTo(13*s,-1.8*s);x.lineTo(18*s,-1*s);x.stroke();
     x.fillStyle=W1;x.beginPath();x.arc(18.6*s,-1.2*s,1.4*s,0,7);x.fill();x.fillStyle='#d23b3b';x.beginPath();x.arc(18.6*s,-2.2*s,.8*s,0,7);x.fill();x.fillStyle=sil('#8a8a70');x.beginPath();x.moveTo(19.8*s,-1.5*s);x.lineTo(23*s,-.8*s);x.lineTo(19.8*s,-.6*s);x.fill();
     x.strokeStyle=sil('#2a2a2a');x.lineWidth=.9*s;x.beginPath();x.moveTo(-6*s,.5*s);x.lineTo(-18*s,1.4*s);x.stroke();
     x.fillStyle=W1;x.beginPath();x.ellipse(0,0,7.4*s,2.4*s,0,0,7);x.fill();x.fillStyle=D;x.beginPath();x.moveTo(-6*s,-.5*s);x.quadraticCurveTo(-9*s,1*s,-11*s,2.6*s);x.lineTo(-6*s,1.6*s);x.fill();
     [1,-1].forEach(sd=>{x.save();x.scale(1,sd>0?1:.55);const g=x.createLinearGradient(0,0,0,-18*s);g.addColorStop(0,W1);g.addColorStop(.75,W1);g.addColorStop(1,D);x.fillStyle=g;x.beginPath();x.moveTo(-4*s,0);x.quadraticCurveTo(-2*s,-12*s*fl,-6*s,-19*s*fl);x.lineTo(1*s,-17*s*fl);x.quadraticCurveTo(3*s,-8*s*fl,4*s,0);x.closePath();x.fill();x.restore()});
     x.restore()});x.globalAlpha=1}},
   swan:{msg:'白鳥が 海に 浮かんでる',dur:44,when:'morning',layer:'sea',draw(p,st,et){const a=fade(p,.08,.08);x.globalAlpha=a;[0,1,2].forEach(n=>{const sx=lerp(WL+WW*.15,WL+WW*.6,p)+n*18*k,sy=seaY(.62+n*.05)+Math.sin(et*1.2+n)*k,s=k*(1.35-n*.25),dip=n===0&&Math.sin(et*.5)>.85;x.save();x.translate(sx,sy);
     x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.8;x.beginPath();x.ellipse(-2*s,1.2*s,15*s,2*s,0,0,7);x.stroke();x.beginPath();x.ellipse(-12*s,1.4*s,6*s,1*s,0,0,7);x.stroke();
     const W1=sil('#fdfdfb'),W2=sil('#dcdcd6');const g=x.createLinearGradient(0,-8*s,0,1*s);g.addColorStop(0,W1);g.addColorStop(1,W2);x.fillStyle=g;x.beginPath();x.moveTo(-11*s,-1*s);x.quadraticCurveTo(-13*s,-9*s,-6*s,-7*s);x.quadraticCurveTo(0,-9*s,5*s,-5*s);x.quadraticCurveTo(9*s,-3*s,8*s,.6*s);x.lineTo(-10*s,.6*s);x.closePath();x.fill();
     x.strokeStyle=W2;x.lineWidth=.5*s;x.beginPath();x.moveTo(-8*s,-5*s);x.quadraticCurveTo(-3*s,-6*s,2*s,-3.5*s);x.moveTo(-7*s,-3*s);x.quadraticCurveTo(-2*s,-4*s,3*s,-1.8*s);x.stroke();
     x.strokeStyle=W1;x.lineWidth=2.2*s;x.lineCap='round';x.beginPath();x.moveTo(5*s,-4*s);if(dip){x.quadraticCurveTo(12*s,-6*s,12*s,0)}else{x.bezierCurveTo(11*s,-6*s,4*s,-12*s,8*s,-16*s)}x.stroke();
     if(!dip){x.fillStyle=W1;x.beginPath();x.arc(8.6*s,-16*s,1.7*s,0,7);x.fill();x.fillStyle='#1a1a1a';x.beginPath();x.moveTo(9.6*s,-16.6*s);x.lineTo(10.6*s,-15.6*s);x.lineTo(9.6*s,-15*s);x.fill();x.fillStyle='#ff8a2a';x.beginPath();x.moveTo(10.4*s,-16.2*s);x.lineTo(13*s,-15.2*s);x.lineTo(10.4*s,-14.8*s);x.fill();x.fillStyle='#111';x.beginPath();x.arc(8.9*s,-16.4*s,.35*s,0,7);x.fill()}
     x.restore()});x.globalAlpha=1}},
   parrot:{msg:'カラフルな オウムが 飛んできた',dur:16,when:'day',layer:'sky',draw(p,st,et){const a=fade(p,.05,.05),px=lerp(W+20*k,-20*k,p),py=hz-44*k+Math.sin(p*9)*20*k,s=k*1.4,f=Math.sin(et*13);x.globalAlpha=a;x.save();x.translate(px,py);x.scale(-1,1);
     const R1=sil('#ff2e3a'),Y=sil('#ffd23f'),B=sil('#2f6fff'),G=sil('#2fbf6a');
     [[B,-7],[Y,-4],[R1,-1]].forEach(([c,o],i)=>{x.fillStyle=c;x.beginPath();x.moveTo(-5*s,(i-1)*.6*s);x.lineTo((-17+i*1.5)*s,(1.8+i*.4)*s);x.lineTo((-15+i*1.5)*s,(3+i*.3)*s);x.lineTo(-5*s,(1.4+i*.3)*s);x.fill()});
     const wg=(fl,back)=>{x.save();x.scale(1,fl);[[R1,10],[Y,8],[B,6.5]].forEach(([c,l],i)=>{x.fillStyle=back?tone2(c,-.25):c;x.beginPath();x.moveTo(-2*s,0);x.quadraticCurveTo(-3*s,-l*.6*s,(-5-i*1.5)*s,-l*s);x.lineTo((2-i)*s,-l*.4*s);x.quadraticCurveTo(3*s,-1*s,3*s,0);x.fill()});x.restore()};
     wg(-f*.6,1);const bg=x.createLinearGradient(0,-3*s,0,3*s);bg.addColorStop(0,tone2(R1,.15));bg.addColorStop(1,tone2(R1,-.2));x.fillStyle=bg;x.beginPath();x.ellipse(0,0,6.4*s,2.8*s,-.12,0,7);x.fill();
     x.beginPath();x.arc(6*s,-1.8*s,2.7*s,0,7);x.fill();x.fillStyle='#fff8f0';x.beginPath();x.ellipse(7*s,-2*s,1.4*s,1.6*s,0,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(7.2*s,-2.2*s,.5*s,0,7);x.fill();
     x.fillStyle=sil('#2a2a2a');x.beginPath();x.moveTo(8*s,-2.8*s);x.quadraticCurveTo(11.4*s,-2.6*s,10.4*s,.4*s);x.quadraticCurveTo(9.6*s,-.8*s,8.2*s,-.6*s);x.fill();x.fillStyle=sil('#f4efe4');x.beginPath();x.moveTo(8.2*s,-2.6*s);x.quadraticCurveTo(10.6*s,-2.4*s,10*s,-.6*s);x.lineTo(8.4*s,-1.2*s);x.fill();
     wg(f,0);x.fillStyle=G;x.beginPath();x.ellipse(-1*s,1*s,2*s,.8*s,0,0,7);x.fill();x.restore();x.globalAlpha=1}},
   orca:{msg:'シャチの 群れが 沖を 泳いでる',dur:22,when:null,layer:'sea',draw(p,st,et){const a=fade(p,.06,.08);x.globalAlpha=a;[0,.12,.22].forEach((o,n)=>{const ox=lerp(W+40*k,-60*k,p)+n*28*k,f=.3+n*.06,oy=seaY(f),ph=Math.sin(et*1.5+n*1.3),up=Math.max(0,ph),s=k*(.75+f*.6);if(up<.05)return;
     x.save();x.beginPath();x.rect(0,0,W,oy+.6*k);x.clip();const B=sil('#0e1116');const g=x.createLinearGradient(0,oy-8*s,0,oy);g.addColorStop(0,tone2(B,.18));g.addColorStop(1,B);x.fillStyle=g;
     x.beginPath();x.moveTo(ox-17*s,oy+(1-up)*9*s);x.quadraticCurveTo(ox-14*s,oy-6.4*s*up,ox,oy-6.8*s*up);x.quadraticCurveTo(ox+12*s,oy-6*s*up,ox+17*s,oy+(1-up)*9*s);x.closePath();x.fill();
     x.beginPath();x.moveTo(ox-3*s,oy-6*s*up);x.quadraticCurveTo(ox-1*s,oy-(8+12*up)*s,ox+(n?1:2)*s,oy-(9+15*up)*s);x.quadraticCurveTo(ox+2*s,oy-(8+6*up)*s,ox+5*s,oy-5.6*s*up);x.fill();
     x.fillStyle=sil('#f4f4f4');x.beginPath();x.ellipse(ox-11*s,oy-4.2*s*up,3*s,1.2*s*up,-.2,0,7);x.fill();x.fillStyle=sil('#6a7480');x.beginPath();x.ellipse(ox+4*s,oy-5.6*s*up,3.2*s,.9*s*up,0,0,7);x.fill();x.restore();
     x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=.8;x.beginPath();x.ellipse(ox,oy+.5*k,19*s*up,1.6*s,0,0,7);x.stroke();
     if(n===0&&ph>.88){x.fillStyle='rgba(235,245,255,.55)';for(let i=0;i<6;i++){x.beginPath();x.arc(ox-12*s+(i-2.5)*1.6*s,oy-10*s-(ph-.88)*120*s*(1-Math.abs(i-2.5)/4),1.4*s,0,7);x.fill()}}});x.globalAlpha=1}},
   ray:{msg:'エイが 海から ジャンプ！',dur:14,when:null,layer:'sea',draw(p,st,et){const a=fade(p,.05,.1),bx=WL+WW*(.3+p*.4),base=seaY(.45),s=k*1.35;x.globalAlpha=a;const jumps=[[.15,.38],[.52,.74]];
     for(const[j0,j1]of jumps){if(p>j0&&p<j1){const q=(p-j0)/(j1-j0),y=base-Math.sin(q*Math.PI)*30*k,fl=Math.sin(et*9);x.save();x.translate(bx+(q-.5)*34*k,y);x.rotate((q-.5)*.7);x.scale(1,.75+.25*Math.cos(q*Math.PI*2));
       const g=x.createLinearGradient(0,-8*s,0,8*s);g.addColorStop(0,sil('#5a6a7c'));g.addColorStop(.5,sil('#7e8ea0'));g.addColorStop(1,sil('#3a4656'));x.fillStyle=g;
       x.beginPath();x.moveTo(9*s,0);x.quadraticCurveTo(4*s,-3*s,-2*s,-(7+fl*2.5)*s);x.quadraticCurveTo(-4*s,-3*s,-8*s,0);x.quadraticCurveTo(-4*s,3*s,-2*s,(7+fl*2.5)*s);x.quadraticCurveTo(4*s,3*s,9*s,0);x.fill();
       x.fillStyle=sil('#e8ecf0');x.beginPath();x.ellipse(1*s,0,3.4*s,1.4*s,0,0,7);x.fill();x.strokeStyle=sil('#3a4656');x.lineWidth=.8*s;x.beginPath();x.moveTo(-7*s,0);x.quadraticCurveTo(-14*s,1*s,-20*s,-.5*s);x.stroke();
       x.fillStyle='#111';x.beginPath();x.arc(6.4*s,-1.6*s,.5*s,0,7);x.arc(6.4*s,1.6*s,.5*s,0,7);x.fill();x.restore();
       if(q<.15||q>.85){x.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<5;i++){x.beginPath();x.arc(bx+(q-.5)*34*k+(i-2)*3*k,base-Math.abs(Math.sin(i*1.9+q*9))*6*k,1.2*k,0,7);x.fill()}}}
       if(Math.abs(p-j1)<.05||Math.abs(p-j0)<.05){x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1;x.beginPath();x.ellipse(bx+(Math.abs(p-j1)<.05?17:-17)*k,base,12*k,2.2*k,0,0,7);x.stroke()}}x.globalAlpha=1}},
   owl:{msg:'フクロウが 杭の上に とまった',dur:40,when:'night',layer:'beach',draw(p,st,et){const a=fade(p,.12,.12),ox=WL+WW*.16,oy=shore+12*k,s=k*1.3,blink=Math.sin(et*.9)>.95,turn=Math.sin(et*.4)*2*s,tilt=Math.sin(et*.25)>.8?.25:0;x.globalAlpha=a;
     const wd=x.createLinearGradient(ox-3*s,0,ox+3*s,0);wd.addColorStop(0,sil('#3a2818'));wd.addColorStop(.5,sil('#6a4a30'));wd.addColorStop(1,sil('#2a1c10'));x.fillStyle=wd;x.fillRect(ox-3*s,oy+7*s,6*s,24*k);x.fillStyle=sil('#7a5a3a');x.beginPath();x.ellipse(ox,oy+7*s,3*s,1*s,0,0,7);x.fill();
     x.save();x.translate(ox,oy);const B=sil('#7a5a3a'),L=sil('#c9a77a');const bg=x.createRadialGradient(-1*s,-3*s,1*s,0,0,9*s);bg.addColorStop(0,tone2(B,.2));bg.addColorStop(1,tone2(B,-.15));x.fillStyle=bg;x.beginPath();x.ellipse(0,0,6.2*s,8.2*s,0,0,7);x.fill();
     x.fillStyle=L;x.beginPath();x.ellipse(0,2.2*s,4*s,5.2*s,0,0,7);x.fill();x.strokeStyle=sil('#8a6a44');x.lineWidth=.5*s;for(let r=0;r<3;r++)for(let c=-1;c<=1;c++){x.beginPath();x.arc(c*1.6*s+(r%2)*.8*s,(0+r*1.8)*s,.7*s,.2,Math.PI-.2);x.stroke()}
     x.fillStyle=tone2(B,-.1);x.beginPath();x.ellipse(-5.4*s,1*s,2*s,5.4*s,.15,0,7);x.ellipse(5.4*s,1*s,2*s,5.4*s,-.15,0,7);x.fill();x.fillStyle=sil('#e8a040');[-1.6,1.6].forEach(fx=>{x.beginPath();x.ellipse(fx*s,7.6*s,1.2*s,.7*s,0,0,7);x.fill()});
     x.save();x.translate(turn*.3,-7*s);x.rotate(tilt);x.fillStyle=B;x.beginPath();x.ellipse(0,0,5.6*s,4.8*s,0,0,7);x.fill();x.beginPath();x.moveTo(-4.4*s,-2.6*s);x.lineTo(-5.4*s,-7*s);x.lineTo(-2*s,-3.8*s);x.moveTo(4.4*s,-2.6*s);x.lineTo(5.4*s,-7*s);x.lineTo(2*s,-3.8*s);x.fill();
     x.fillStyle=sil('#e9d8b8');x.beginPath();x.ellipse(-2.2*s,-.2*s,2.5*s,2.4*s,0,0,7);x.ellipse(2.2*s,-.2*s,2.5*s,2.4*s,0,0,7);x.fill();
     [-2.2,2.2].forEach(e=>{const eg=x.createRadialGradient(e*s,-.4*s,.2*s,e*s,-.2*s,1.8*s);eg.addColorStop(0,'#fff6b0');eg.addColorStop(1,'#f0b020');x.fillStyle=eg;x.beginPath();x.arc(e*s,-.2*s,1.7*s,0,7);x.fill();if(blink){x.fillStyle=B;x.beginPath();x.arc(e*s,-.2*s,1.8*s,Math.PI,0);x.fill()}else{x.fillStyle='#111';x.beginPath();x.arc(e*s+turn*.12,-.2*s,.9*s,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(e*s+turn*.12+.35*s,-.6*s,.3*s,0,7);x.fill()}});
     x.fillStyle=sil('#d08a30');x.beginPath();x.moveTo(-.8*s,1*s);x.lineTo(.8*s,1*s);x.lineTo(0,3*s);x.fill();x.restore();x.restore();
     if(Math.sin(et*.5)>.97){x.fillStyle='rgba(255,255,255,.85)';x.font=`${7*k}px sans-serif`;x.fillText('ホー',ox-22*k,oy-22*k)}x.globalAlpha=1}}});
  /* ---- 作り込み版（元からいる 動物たち） ---- */
  const NC=c=>dark>.5?mixc(c,'#1a1830',.3):c;
  const eyeD=(ex,ey,r,blink)=>{if(blink){x.strokeStyle='#1a1414';x.lineWidth=r*.5;x.beginPath();x.arc(ex,ey,r*.8,.2,Math.PI-.2);x.stroke();return}x.fillStyle='#1a1414';x.beginPath();x.arc(ex,ey,r,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(ex+r*.35,ey-r*.35,r*.35,0,7);x.fill()};
  const blinkAt=(et,o=0)=>((et+o)%3.7)<.12;
  Object.assign(VIS,{
   rabbit:{msg:'うさぎが ぴょんぴょん やってきた🐰',dur:22,when:null,draw(p,st,et){const gy=WT+WH*.93,w=walkPath(p,-30*k,W+30*k,WL+WW*.2,.3,.72),s=k*1.45,ph=(et*3.5)%1,hop=w.m==='go'?Math.sin(ph*Math.PI)*10*s:0,str=w.m==='go'?Math.sin(ph*Math.PI):0;
     const c0=st.c??=(Math.random()<.5?'#f4f1ea':'#b98a62'),c=NC(c0),cd=NC(mixc(c0,'#000000',.22)),pink=NC('#f4a8b8');x.globalAlpha=fade(p,.02,.02);evShad(w.x,gy,9*s*(1-hop/(30*s)));x.save();x.translate(w.x,gy-hop);
     const sit=w.m==='sit',nib=sit&&Math.sin(et*.7)>.3;
     // 後ろ足
     x.fillStyle=cd;x.beginPath();x.ellipse(-4*s-str*3*s,-1.4*s,4.6*s,1.8*s,-.1+str*.3,0,7);x.fill();
     // 体
     x.fillStyle=shadeF(-1*s,-8*s,10*s,c0);x.beginPath();x.moveTo(-9*s,-3*s);x.quadraticCurveTo(-11*s,-14*s,-1*s,-13*s);x.quadraticCurveTo(6*s,-12.4*s,7*s,-6*s);x.quadraticCurveTo(6*s,-1*s,0,-1*s);x.quadraticCurveTo(-7*s,-.6*s,-9*s,-3*s);x.fill();
     x.fillStyle=NC('#ffffff');x.beginPath();x.arc(-10*s,-8*s,2.6*s,0,7);x.fill();
     // 前足
     x.fillStyle=c;x.beginPath();x.ellipse(5*s+str*4*s,-1.2*s,1.4*s,2.4*s,str*.6,0,7);x.fill();
     // 頭
     const hx=7.6*s,hy=nib?-10*s:-13*s;x.fillStyle=shadeF(hx,hy,5.4*s,c0);x.beginPath();x.ellipse(hx,hy,5*s,4.4*s,.15,0,7);x.fill();
     const tw=sit?Math.sin(et*5)*.12:0,back=-str*.5;[[-.35+back,hx-2.2*s,0],[-.05+back+tw,hx+.4*s,1]].forEach(([r0,ex,fr])=>{x.save();x.translate(ex,hy-3*s);x.rotate(r0);x.fillStyle=fr?c:cd;x.beginPath();x.ellipse(0,-6*s,1.9*s,6.4*s,0,0,7);x.fill();if(fr){x.fillStyle=pink;x.beginPath();x.ellipse(.1*s,-6*s,.9*s,4.8*s,0,0,7);x.fill()}x.restore()});
     eyeD(hx+2*s,hy-.8*s,1.05*s,blinkAt(et));x.fillStyle=pink;x.beginPath();x.arc(hx+4.7*s,hy+.6*s+(nib?Math.sin(et*14)*.3*s:0),.75*s,0,7);x.fill();x.fillStyle='rgba(255,140,160,.35)';x.beginPath();x.arc(hx+2.6*s,hy+1.6*s,1.1*s,0,7);x.fill();
     x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=.3*s;for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(hx+4.6*s,hy+.9*s);x.lineTo(hx+8.4*s,hy+.6*s+i*1.2*s);x.stroke()}
     if(nib){x.fillStyle=NC('#ff9a3c');x.beginPath();x.moveTo(hx+5*s,hy+1.4*s);x.lineTo(hx+11*s,hy+3.2*s);x.lineTo(hx+5.4*s,hy+2.6*s);x.fill();x.fillStyle=NC('#4a9a3a');x.beginPath();x.ellipse(hx+11.6*s,hy+3.4*s,1.4*s,.6*s,.3,0,7);x.fill()}
     x.restore();x.globalAlpha=1}},
   tanuki:{msg:'たぬきが 焚き火を のぞきに きた',dur:26,when:'night',draw(p,st,et){const[fx]=fireP(),gy=WT+WH*.975,w=walkPath(p,-40*k,W+40*k,fx-62*k,.3,.75),s=k*1.3,ph=et*9,go=w.m==='go',warm=!go;x.globalAlpha=fade(p,.02,.02);evShad(w.x,gy,14*s);x.save();x.translate(w.x,gy);
     const B=NC('#8a6a48'),D=NC('#2e2016'),L=NC('#d8c4a0');
     // しっぽ（しましま）
     const tw=Math.sin(et*(warm?3:6))*.15;x.save();x.translate(-11*s,-9*s);x.rotate(-.5+tw);x.fillStyle=shadeF(-4*s,0,6*s,'#8a6a48');x.beginPath();x.ellipse(-4*s,0,7*s,4.2*s,0,0,7);x.fill();x.fillStyle=D;[-6,-2.4].forEach(o=>{x.beginPath();x.ellipse(o*s,0,1.1*s,4*s,0,0,7);x.fill()});x.beginPath();x.ellipse(-10*s,0,1.6*s,2.6*s,0,0,7);x.fill();x.restore();
     x.fillStyle=D;if(go)[[-7,0],[-4,1.6],[7,3.1],[10,4.7]].forEach(([lx,o])=>{x.beginPath();x.ellipse(lx*s+Math.sin(ph+o)*2*s,-3*s,1.4*s,3.4*s,Math.sin(ph+o)*.3,0,7);x.fill()});else{x.beginPath();x.ellipse(-6*s,-2*s,3.4*s,2.2*s,0,0,7);x.ellipse(8*s,-2*s,2.4*s,2*s,0,0,7);x.fill()}
     x.fillStyle=shadeF(0,-11*s,13*s,'#8a6a48');x.beginPath();x.ellipse(0,-9.6*s,12.4*s,7.4*s,0,0,7);x.fill();x.fillStyle=L;x.beginPath();x.ellipse(3*s,-5.4*s,7*s,3*s,0,0,7);x.fill();
     x.strokeStyle=NC('#6a4e32');x.lineWidth=.4*s;for(let i=0;i<8;i++){x.beginPath();x.moveTo((-9+i*2.4)*s,-15*s);x.lineTo((-9.6+i*2.4)*s,-12.6*s);x.stroke()}
     const hx=12*s,hy=warm?-13*s+Math.sin(et*1.2)*.4*s:-11*s;x.fillStyle=shadeF(hx,hy,6.4*s,'#8a6a48');x.beginPath();x.ellipse(hx,hy,6*s,5.2*s,0,0,7);x.fill();
     x.fillStyle=B;[[-3.6,-4.2],[2.2,-4.6]].forEach(([a,b])=>{x.beginPath();x.ellipse(hx+a*s,hy+b*s,1.8*s,1.6*s,0,0,7);x.fill()});x.fillStyle=D;[[-3.6,-4.2],[2.2,-4.6]].forEach(([a,b])=>{x.beginPath();x.ellipse(hx+a*s,hy+b*s,.9*s,.8*s,0,0,7);x.fill()});
     x.fillStyle=L;x.beginPath();x.ellipse(hx+2.6*s,hy+1.6*s,4.6*s,2.8*s,0,0,7);x.fill();x.fillStyle=D;x.beginPath();x.ellipse(hx+.4*s,hy-.6*s,3.2*s,2*s,.25,0,7);x.ellipse(hx+4*s,hy-.4*s,2.4*s,1.8*s,-.2,0,7);x.fill();
     eyeD(hx+.6*s,hy-.8*s,.85*s,warm&&Math.sin(et*.5)>.3);eyeD(hx+4*s,hy-.6*s,.75*s,warm&&Math.sin(et*.5)>.3);x.fillStyle='#1a1414';x.beginPath();x.ellipse(hx+6.6*s,hy+1.2*s,1*s,.8*s,0,0,7);x.fill();
     if(warm){x.save();x.globalCompositeOperation='lighter';glow(hx+3*s,hy,10*s,'rgba(255,150,70,.25)');x.restore();const q=(et*.5)%1;x.globalAlpha=fade(p,.02,.02)*(1-q);x.fillStyle='#fff';x.font=`${7*k}px sans-serif`;x.fillText('ぬくぬく',hx-2*s,hy-12*s-q*10*k)}
     x.restore();x.globalAlpha=1}},
   fox:{msg:'きつねが そっと 通りすぎる🦊',dur:20,when:'dusk',draw(p,st,et){const gy=shore+26*k,w=walkPath(p,W+30*k,-40*k,WL+WW*.62,.35,.7),s=k*1.15,ph=et*10,go=w.m==='go',look=!go;x.globalAlpha=fade(p,.03,.03);evShad(w.x,gy,13*s);x.save();x.translate(w.x,gy);x.scale(-1,1);
     const O=NC('#d9772f'),Od=NC('#a0501c'),Wt=NC('#fbf3e6'),Bk=NC('#2a1a10');x.lineCap='round';
     const leg=(lx,o,back)=>{const sw=go?Math.sin(ph+o)*3*s:0;x.strokeStyle=back?Od:O;x.lineWidth=1.9*s;x.beginPath();x.moveTo(lx*s,-9*s);x.lineTo(lx*s+sw*.5,-4*s);x.stroke();x.strokeStyle=Bk;x.lineWidth=1.7*s;x.beginPath();x.moveTo(lx*s+sw*.5,-4*s);x.lineTo(lx*s+sw,0);x.stroke()};
     leg(-8,0,1);leg(8,3.1,1);
     // しっぽ
     const tw=Math.sin(et*2)*2*s;x.fillStyle=shadeF(-20*s,-12*s,10*s,'#d9772f');x.beginPath();x.moveTo(-10*s,-12*s);x.quadraticCurveTo(-22*s,-20*s+tw,-29*s,-10*s+tw);x.quadraticCurveTo(-22*s,-6*s,-10*s,-9*s);x.fill();x.fillStyle=Wt;x.beginPath();x.moveTo(-25*s,-13*s+tw);x.quadraticCurveTo(-29*s,-12*s+tw,-29*s,-10*s+tw);x.quadraticCurveTo(-26*s,-8.6*s,-24*s,-10*s+tw*.8);x.fill();
     x.fillStyle=shadeF(0,-13*s,11*s,'#d9772f');x.beginPath();x.ellipse(0,-12*s,11*s,4.6*s,0,0,7);x.fill();x.fillStyle=Wt;x.beginPath();x.ellipse(4*s,-9.4*s,6*s,1.8*s,0,0,7);x.fill();
     leg(-5,1.6,0);leg(11,4.7,0);
     const hx=12*s,hy=look?-19*s:-17*s;x.fillStyle=O;x.beginPath();x.moveTo(8*s,-14*s);x.quadraticCurveTo(9*s,hy,hx,hy);x.lineTo(14*s,-12*s);x.fill();
     x.save();x.translate(hx,hy);if(look)x.rotate(-.12+Math.sin(et*.8)*.06);x.fillStyle=shadeF(0,0,5*s,'#d9772f');x.beginPath();x.moveTo(-3.6*s,1*s);x.quadraticCurveTo(-3*s,-4*s,1*s,-3.6*s);x.quadraticCurveTo(4*s,-3*s,8.6*s,.6*s);x.quadraticCurveTo(4*s,3*s,-1*s,3*s);x.closePath();x.fill();
     x.fillStyle=Wt;x.beginPath();x.moveTo(1*s,1*s);x.quadraticCurveTo(5*s,.8*s,8.6*s,.6*s);x.quadraticCurveTo(4*s,3.2*s,0,2.8*s);x.fill();
     [[-2.4,-2.8,0],[.6,-3.4,1]].forEach(([a,b,f])=>{x.fillStyle=f?O:Od;x.beginPath();x.moveTo(a*s,b*s);x.lineTo((a-.6)*s,(b-5.4)*s);x.lineTo((a+2.6)*s,(b-.4)*s);x.fill();x.fillStyle=Bk;x.beginPath();x.moveTo((a-.2)*s,(b-3.4)*s);x.lineTo((a-.6)*s,(b-5.4)*s);x.lineTo((a+.9)*s,(b-3.2)*s);x.fill()});
     x.fillStyle=Bk;x.beginPath();x.arc(8.6*s,.4*s,.8*s,0,7);x.fill();eyeD(2.6*s,-1*s,.75*s,blinkAt(et,1));x.restore();x.restore();x.globalAlpha=1}},
   deer:{msg:'朝もやの 中を しかが 歩いていく🦌',dur:24,when:'morning',draw(p,st,et){const gy=shore+12*k,dx=lerp(-30*k,W+30*k,p),s=k*1.05,ph=et*5,stopL=Math.sin(et*.4)>.75;x.globalAlpha=fade(p,.06,.06)*.95;evShad(dx,gy,13*s);x.save();x.translate(dx,gy);
     const B=NC('#9a6a3e'),Bd=NC('#6e4a28'),Wt=NC('#f4ead8'),Bk=NC('#2a1a10');x.lineCap='round';
     const leg=(lx,o,back)=>{const sw=Math.sin(ph+o)*3*s;x.strokeStyle=back?Bd:B;x.lineWidth=2*s;x.beginPath();x.moveTo(lx*s,-16*s);x.lineTo(lx*s+sw*.4,-8*s);x.lineTo(lx*s+sw,-1*s);x.stroke();x.fillStyle=Bk;x.fillRect(lx*s+sw-.9*s,-1.4*s,1.8*s,1.4*s)};
     leg(-9,0,1);leg(8,3.1,1);
     x.fillStyle=shadeF(0,-20*s,14*s,'#9a6a3e');x.beginPath();x.moveTo(-14*s,-19*s);x.quadraticCurveTo(-14*s,-25*s,-4*s,-24.6*s);x.lineTo(8*s,-24*s);x.quadraticCurveTo(14*s,-23*s,13*s,-17*s);x.quadraticCurveTo(0,-13*s,-13*s,-15.6*s);x.closePath();x.fill();
     x.fillStyle=Wt;x.beginPath();x.ellipse(-14*s,-20*s,2.4*s,2.6*s,0,0,7);x.fill();x.fillStyle=NC('#f0e2c8');x.beginPath();x.ellipse(0,-15.6*s,9*s,1.6*s,0,0,7);x.fill();
     x.fillStyle=NC('#e8d6bc');[[-6,-21],[-1,-22],[4,-21],[-3,-18.4],[2,-18.4],[8,-20.6],[-9,-19]].forEach(([a,b])=>{x.beginPath();x.arc(a*s,b*s,.9*s,0,7);x.fill()});
     leg(-6,1.6,0);leg(11,4.7,0);
     const hy=stopL?-36*s:-34*s;x.fillStyle=B;x.beginPath();x.moveTo(8*s,-23*s);x.quadraticCurveTo(12*s,-30*s,14*s,hy+2*s);x.lineTo(18*s,hy+2.4*s);x.quadraticCurveTo(16*s,-26*s,13*s,-18*s);x.closePath();x.fill();
     x.fillStyle=shadeF(17*s,hy,5*s,'#9a6a3e');x.beginPath();x.ellipse(18*s,hy+1*s,4*s,3*s,.3,0,7);x.fill();x.beginPath();x.ellipse(21.6*s,hy+3*s,2.2*s,1.6*s,.4,0,7);x.fill();x.fillStyle=Bk;x.beginPath();x.arc(23.2*s,hy+3.6*s,.7*s,0,7);x.fill();
     x.fillStyle=Bd;x.beginPath();x.ellipse(15*s,hy-1.6*s,2.4*s,1*s,-.6,0,7);x.fill();eyeD(18.6*s,hy+.4*s,.7*s,blinkAt(et,2));
     x.strokeStyle=NC('#e0cfa8');x.lineWidth=1*s;x.beginPath();x.moveTo(16.6*s,hy-1.6*s);x.lineTo(15*s,hy-8*s);x.lineTo(12*s,hy-12*s);x.moveTo(15*s,hy-8*s);x.lineTo(18*s,hy-11*s);x.moveTo(15.6*s,hy-5*s);x.lineTo(12.6*s,hy-6.6*s);x.moveTo(18*s,hy-1.6*s);x.lineTo(19*s,hy-7*s);x.lineTo(21.6*s,hy-10*s);x.moveTo(19*s,hy-7*s);x.lineTo(17.4*s,hy-10*s);x.stroke();
     x.restore();x.globalAlpha=1}},
   ducks:{msg:'カモの 親子が 行進してる🦆',dur:20,when:'day',draw(p,st,et){const gy=WT+WH*.88,s=k*1.25;x.globalAlpha=fade(p,.03,.03);[4,3,2,1,0].forEach(n=>{const sc=n?.6:1,dx=lerp(-30*k,W+120*k,p)-n*18*k,stp=Math.sin(et*8+n),bob=Math.abs(stp)*1.4*s,ss=s*sc;evShad(dx,gy,7*ss);x.save();x.translate(dx,gy-bob);x.rotate(stp*.05);
       const F=NC('#ff9a2e');x.strokeStyle=F;x.lineWidth=1.1*ss;[[-1,stp],[1.6,-stp]].forEach(([lx,o])=>{x.beginPath();x.moveTo(lx*ss,-2*ss);x.lineTo(lx*ss+o*1.2*ss,0);x.stroke();x.fillStyle=F;x.beginPath();x.ellipse(lx*ss+o*1.2*ss+.8*ss,0,1.3*ss,.5*ss,0,0,7);x.fill()});
       if(n){x.fillStyle=shadeF(0,-6*ss,8*ss,'#ffd84a');x.beginPath();x.ellipse(0,-5.6*ss,6.6*ss,4.6*ss,0,0,7);x.fill();x.beginPath();x.moveTo(-6*ss,-6*ss);x.lineTo(-8.4*ss,-8*ss);x.lineTo(-5.4*ss,-4*ss);x.fill();x.fillStyle=NC('#f2c030');x.beginPath();x.ellipse(-1*ss,-6*ss,3.4*ss,2*ss,.2,0,7);x.fill();
         x.fillStyle=shadeF(5*ss,-11*ss,4*ss,'#ffd84a');x.beginPath();x.arc(5*ss,-10.6*ss,3.8*ss,0,7);x.fill();x.fillStyle=NC('#ffe880');x.beginPath();x.arc(4*ss,-14*ss,.9*ss,0,7);x.fill()}
       else{x.fillStyle=shadeF(0,-6*ss,8*ss,'#b48a5a');x.beginPath();x.moveTo(-9*ss,-8*ss);x.quadraticCurveTo(-6*ss,-11*ss,2*ss,-10*ss);x.quadraticCurveTo(8*ss,-8*ss,7*ss,-4*ss);x.quadraticCurveTo(3*ss,-1*ss,-4*ss,-1.6*ss);x.quadraticCurveTo(-8*ss,-3*ss,-9*ss,-8*ss);x.fill();
         x.fillStyle=NC('#e8e4dc');x.beginPath();x.moveTo(-9*ss,-8*ss);x.lineTo(-11.6*ss,-9*ss);x.lineTo(-9*ss,-6.4*ss);x.fill();x.fillStyle=NC('#8a6440');x.beginPath();x.ellipse(-1*ss,-6.6*ss,5*ss,2.4*ss,.1,0,7);x.fill();x.fillStyle=NC('#3a6ab8');x.fillRect(-3*ss,-6*ss,3.6*ss,1.2*ss);
         x.strokeStyle=NC('#2f7a4a');x.lineWidth=3*ss;x.beginPath();x.moveTo(4*ss,-8*ss);x.lineTo(5.6*ss,-12*ss);x.stroke();x.fillStyle=NC('#ffffff');x.fillRect(3.4*ss,-9.4*ss,3.4*ss,1*ss);x.fillStyle=shadeF(6*ss,-14*ss,4*ss,'#2f7a4a');x.beginPath();x.arc(6*ss,-13.4*ss,3.4*ss,0,7);x.fill()}
       const hy=n?-10.6*ss:-13.4*ss,hx=n?5*ss:6*ss;x.fillStyle=NC(n?'#ff9a2e':'#f2c030');x.beginPath();x.moveTo(hx+2.4*ss,hy-.6*ss);x.quadraticCurveTo(hx+7*ss,hy-.4*ss,hx+6.6*ss,hy+1*ss);x.lineTo(hx+2.4*ss,hy+1*ss);x.fill();eyeD(hx+1.2*ss,hy-1*ss,.6*ss,blinkAt(et,n));x.restore()});
     if(Math.sin(et*2)>.9){x.fillStyle='#fff';x.font=`${6*k}px sans-serif`;x.fillText('グワッ',lerp(-30*k,W+120*k,p)+4*k,gy-28*k)}x.globalAlpha=1}},
   hermit:{msg:'ヤドカリが のそのそ 歩いてる',dur:30,when:null,draw(p,st,et){const gy=WT+WH*.9,hide=Math.sin(et*.45)>.8,hx=lerp(W+20*k,-20*k,p),s=k*1.6;x.globalAlpha=fade(p,.03,.03);evShad(hx,gy,7*s);x.save();x.translate(hx,gy);
     const R1=NC('#e05a34'),R2=NC('#b8401e');x.strokeStyle=R2;x.lineWidth=1*s;x.lineCap='round';if(!hide)for(let n=0;n<3;n++){const o=Math.sin(et*8+n*2)*1.2*s;x.beginPath();x.moveTo(-4*s+n*1.6*s,-3*s);x.lineTo(-6*s+n*1.6*s,-1.4*s);x.lineTo(-6.6*s+n*1.6*s+o,0);x.stroke()}
     if(!hide){x.fillStyle=R1;x.beginPath();x.ellipse(-5.4*s,-4.6*s,2.6*s,2*s,0,0,7);x.fill();x.fillStyle=shadeF(-8*s,-5*s,2*s,'#e05a34');x.beginPath();x.ellipse(-8.6*s,-4*s,2.2*s,1.6*s,-.2,0,7);x.fill();x.beginPath();x.moveTo(-10*s,-4.6*s);x.lineTo(-11.6*s,-5.6*s);x.lineTo(-10.6*s,-3.4*s);x.fill();
       x.strokeStyle=R1;x.lineWidth=.6*s;x.beginPath();x.moveTo(-6*s,-6*s);x.lineTo(-6.6*s,-9.4*s);x.moveTo(-4.6*s,-6*s);x.lineTo(-4.4*s,-9.8*s);x.stroke();eyeD(-6.6*s,-9.8*s,.7*s,false);eyeD(-4.4*s,-10.2*s,.7*s,false);
       x.strokeStyle=NC('#f0a080');x.lineWidth=.3*s;x.beginPath();x.moveTo(-7*s,-6*s);x.quadraticCurveTo(-10*s,-11*s,-11*s,-9*s);x.stroke()}
     const g=x.createRadialGradient(1*s,-8*s,.5*s,2*s,-6*s,7*s);g.addColorStop(0,NC('#fff4e0'));g.addColorStop(.6,NC('#f0c8a0'));g.addColorStop(1,NC('#b8845a'));x.fillStyle=g;x.beginPath();x.moveTo(-3.6*s,-.4*s);x.quadraticCurveTo(-4.4*s,-10*s,3*s,-10.6*s);x.quadraticCurveTo(8.4*s,-9*s,7*s,-2*s);x.quadraticCurveTo(3*s,0,-3.6*s,-.4*s);x.fill();
     x.strokeStyle=NC('#a06a40');x.lineWidth=.6*s;x.beginPath();for(let i=0;i<26;i++){const an=i*.42,rr=(5.6-i*.2)*s;const px=2.4*s+Math.cos(an)*rr*.9,py=-5.6*s+Math.sin(an)*rr*.75;i?x.lineTo(px,py):x.moveTo(px,py)}x.stroke();
     if(hide){x.fillStyle=R2;x.beginPath();x.arc(-3*s,-1.6*s,1.4*s,0,7);x.fill()}x.restore();x.globalAlpha=1}},
   penguin:{msg:'ペンギンが 海から あがってきた🐧',dur:24,when:null,draw(p,st,et){const sx0=WL+WW*.6;let px,py,sc;if(p<.25){const q=ease(p/.25);px=sx0;py=lerp(seaY(.85),shore+16*k,q);sc=lerp(.7,1,q)}else if(p<.72){px=sx0+Math.sin((p-.25)*14)*30*k;py=shore+16*k;sc=1}else{const q=ease((p-.72)/.28);px=sx0;py=lerp(shore+16*k,seaY(.85),q);sc=lerp(1,.7,q)}
     const s=k*1.5*sc,wd=Math.sin(et*9)*.14,dir=Math.cos((p-.25)*14)>0?1:-1,flap=Math.sin(et*12)>.6&&p>.4&&p<.6;x.globalAlpha=fade(p,.05,.05);evShad(px,py,7*s);x.save();x.translate(px,py);x.rotate(wd);x.scale(dir,1);
     const Bk=NC('#232838'),Wt=NC('#f6f4ee'),Or=NC('#ff9a2e');x.fillStyle=Or;x.beginPath();x.ellipse(-2.4*s,-.4*s,2.2*s,.9*s,0,0,7);x.ellipse(2.6*s,-.4*s,2.2*s,.9*s,0,0,7);x.fill();
     x.fillStyle=shadeF(-1*s,-13*s,10*s,'#232838');x.beginPath();x.moveTo(0,-21.6*s);x.bezierCurveTo(6.6*s,-21*s,7.4*s,-6*s,4.6*s,-1.2*s);x.quadraticCurveTo(0,.2*s,-4.6*s,-1.2*s);x.bezierCurveTo(-7.4*s,-6*s,-6.6*s,-21*s,0,-21.6*s);x.fill();
     const wg=x.createLinearGradient(0,-16*s,0,-2*s);wg.addColorStop(0,Wt);wg.addColorStop(1,NC('#dcdad2'));x.fillStyle=wg;x.beginPath();x.moveTo(.6*s,-15.6*s);x.bezierCurveTo(5*s,-14*s,5*s,-5*s,3.4*s,-2*s);x.quadraticCurveTo(.6*s,-1*s,-2.4*s,-2*s);x.bezierCurveTo(-4*s,-6*s,-3.4*s,-14*s,.6*s,-15.6*s);x.fill();
     x.fillStyle=NC('#ffd27a');x.beginPath();x.ellipse(1.6*s,-14.6*s,2.6*s,1.2*s,.2,0,7);x.fill();
     x.fillStyle=Bk;[[-1,1],[1,-1]].forEach(([d0,r])=>{x.save();x.translate(d0*5.4*s,-12*s);x.rotate(d0*(flap?.9:.25)+wd);x.beginPath();x.ellipse(0,4*s,1.5*s,5*s,0,0,7);x.fill();x.restore()});
     x.fillStyle=Wt;x.beginPath();x.ellipse(2.6*s,-17.6*s,2*s,1.6*s,0,0,7);x.fill();eyeD(3*s,-17.8*s,.7*s,blinkAt(et,1));x.fillStyle=Or;x.beginPath();x.moveTo(4.6*s,-17.2*s);x.lineTo(8*s,-16.2*s);x.lineTo(4.6*s,-15.4*s);x.fill();
     x.restore();x.globalAlpha=1}},
   seal:{msg:'アザラシが 波打ち際で ひとやすみ',dur:30,when:null,draw(p,st,et){const sx=WL+WW*.74,sy=shore+5*k,up=p<.12?p/.12:p>.86?(1-p)/.14:1,s=k*1.35,br=1+Math.sin(et*1.6)*.03,roll=p>.45&&p<.6,lift=Math.sin(et*.7)>.6;x.save();x.globalAlpha=Math.min(1,up*1.2);x.translate(sx,sy+(1-up)*10*k);
     x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(0,2*s,24*s,4*s,0,0,7);x.fill();const G=NC('#8a909c'),Gd=NC('#5e6470'),Gl=NC('#b4bac4');
     x.fillStyle=shadeF(-6*s,-8*s,20*s,'#8a909c');x.beginPath();x.moveTo(-26*s,-4*s);x.quadraticCurveTo(-24*s,-12*s*br,-6*s,-13*s*br);x.quadraticCurveTo(10*s,-14*s*br,15*s,-8*s);x.quadraticCurveTo(17*s,-1*s,8*s,0);x.lineTo(-20*s,0);x.quadraticCurveTo(-25*s,-1*s,-26*s,-4*s);x.fill();
     x.fillStyle=Gl;x.beginPath();x.ellipse(-2*s,-2.6*s,15*s,2.6*s,0,0,7);x.fill();x.fillStyle=Gd;[[-14,-9],[-8,-11],[-2,-10.6],[4,-11],[-10,-6],[1,-7],[8,-8]].forEach(([a,b])=>{x.beginPath();x.ellipse(a*s,b*s,1.2*s,.8*s,.3,0,7);x.fill()});
     const tf=Math.sin(et*3)*2*s;x.fillStyle=G;x.beginPath();x.moveTo(-25*s,-4*s);x.lineTo(-32*s,-9*s+tf);x.quadraticCurveTo(-30*s,-4*s,-32*s,0+tf*.5);x.closePath();x.fill();
     x.fillStyle=Gd;x.save();x.translate(2*s,-3*s);x.rotate(roll?-1.2+Math.sin(et*6)*.4:.4);x.beginPath();x.ellipse(0,2.6*s,1.6*s,3.6*s,0,0,7);x.fill();x.restore();
     const hy=lift?-15*s:-11*s;x.fillStyle=shadeF(16*s,hy,7*s,'#8a909c');x.beginPath();x.ellipse(15*s,hy,7*s,6*s,lift?-.2:0,0,7);x.fill();x.fillStyle=Gl;x.beginPath();x.ellipse(19.4*s,hy+2*s,3.4*s,2.6*s,0,0,7);x.fill();
     const sl=Math.sin(et*.3)>.3;eyeD(15.4*s,hy-1.6*s,1.3*s,sl);eyeD(19.6*s,hy-1.4*s,1.15*s,sl);x.fillStyle='#1a1414';x.beginPath();x.ellipse(21.4*s,hy+1.2*s,1.1*s,.8*s,0,0,7);x.fill();
     x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=.35*s;for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(20*s,hy+2.4*s);x.lineTo(25*s,hy+2*s+i*1.4*s);x.stroke()}
     if(sl&&!lift){const q=(et*.4)%1;x.globalAlpha=Math.min(1,up)*(1-q);x.fillStyle='#fff';x.font=`${(6+q*3)*k}px sans-serif`;x.fillText('z',10*s+q*6*k,hy-10*s-q*12*k)}x.restore();x.globalAlpha=1}},
   flamingo:{msg:'フラミンゴが 浅瀬に 立ってる🦩',dur:30,when:'day',draw(p,st,et){const fx2=WL+WW*.82,fy=shore-1*k,w=walkPath(p,W+40*k,W+40*k,fx2,.18,.82),s=k*1.35,sit=w.m==='sit',dip=sit&&Math.sin(et*.8)>.7,dir=p<.18?-1:p>.82?1:-1;x.globalAlpha=fade(p,.03,.03);x.save();x.translate(w.x,fy);x.scale(dir,1);
     const P=NC('#f48fb1'),Pd=NC('#e0648e'),Pl=NC('#ffc1d6');x.strokeStyle='rgba(255,255,255,.4)';x.lineWidth=.8;x.beginPath();x.ellipse(0,0,8*s,1.6*s,0,0,7);x.stroke();
     x.strokeStyle=Pd;x.lineWidth=1.1*s;x.lineCap='round';x.beginPath();x.moveTo(0,0);x.lineTo(.4*s,-11*s);x.lineTo(0,-22*s);x.stroke();x.fillStyle=Pd;x.beginPath();x.arc(.4*s,-11*s,.8*s,0,7);x.fill();
     if(!sit){x.beginPath();x.moveTo(2*s,-22*s);x.lineTo(3*s+Math.sin(et*6)*2*s,-11*s);x.lineTo(3*s+Math.sin(et*6)*3*s,0);x.stroke()}else{x.beginPath();x.moveTo(1*s,-22*s);x.lineTo(5*s,-15*s);x.lineTo(1*s,-13*s);x.stroke()}
     x.fillStyle=shadeF(0,-26*s,8*s,'#f48fb1');x.beginPath();x.moveTo(-8*s,-27*s);x.quadraticCurveTo(-6*s,-32*s,2*s,-31*s);x.quadraticCurveTo(8*s,-29*s,6*s,-24*s);x.quadraticCurveTo(0,-21*s,-6*s,-24*s);x.closePath();x.fill();
     x.fillStyle=Pl;x.beginPath();x.ellipse(-1*s,-27.6*s,5*s,2*s,-.1,0,7);x.fill();x.fillStyle=NC('#2a1a1a');x.beginPath();x.moveTo(-8*s,-27*s);x.lineTo(-11*s,-25*s);x.lineTo(-7*s,-24.6*s);x.fill();
     x.strokeStyle=P;x.lineWidth=1.6*s;x.beginPath();x.moveTo(4*s,-29*s);if(dip){x.bezierCurveTo(10*s,-32*s,12*s,-12*s,8*s,-2*s)}else{x.bezierCurveTo(9*s,-33*s,2*s,-42*s,6*s,-47*s)}x.stroke();
     const hx=dip?8*s:6.6*s,hy=dip?-2*s:-47.6*s;x.fillStyle=P;x.beginPath();x.arc(hx,hy,2*s,0,7);x.fill();x.fillStyle=NC('#fff4e8');x.beginPath();x.moveTo(hx+1.4*s,hy-.8*s);x.quadraticCurveTo(hx+4*s,hy-.4*s,hx+4.2*s,hy+2*s);x.lineTo(hx+1.6*s,hy+1*s);x.fill();x.fillStyle='#1a1414';x.beginPath();x.moveTo(hx+3*s,hy);x.quadraticCurveTo(hx+4.6*s,hy+.6*s,hx+4.2*s,hy+2.4*s);x.lineTo(hx+3.4*s,hy+1.4*s);x.fill();
     if(!dip)eyeD(hx+.4*s,hy-.6*s,.45*s,blinkAt(et,3));x.restore();x.globalAlpha=1}},
   otter:{msg:'ラッコが ぷかぷか 浮いてる🦦',dur:30,when:null,layer:'sea',draw(p,st,et){const ox=lerp(WL+WW*.2,WL+WW*.7,p),oy=seaY(.5)+Math.sin(et*1.5)*1.5*k,s=k*1.45,tap=Math.abs(Math.sin(et*6))>.8,spin=Math.sin(et*.35)>.92;x.globalAlpha=fade(p,.08,.08);x.save();x.translate(ox,oy);
     x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.8;x.beginPath();x.ellipse(0,3*s,20*s,3*s,0,0,7);x.stroke();x.beginPath();x.ellipse(0,3.4*s,26*s,4*s,0,0,7);x.stroke();
     const B=NC('#6b4a33'),Bd=NC('#4e3422'),Fc=NC('#d9c2a3');x.save();x.beginPath();x.rect(-30*s,-30*s,60*s,32*s);x.clip();
     x.fillStyle=shadeF(0,-2*s,15*s,'#6b4a33');x.beginPath();x.ellipse(0,0,15*s,5.6*s,0,Math.PI,0);x.fill();x.fillStyle=NC('#8a6a4e');x.beginPath();x.ellipse(1*s,-3*s,9*s,2.4*s,0,0,7);x.fill();
     x.fillStyle=Bd;x.beginPath();x.ellipse(-15*s,-2*s,4*s,1.6*s,-.5+Math.sin(et*2)*.2,0,7);x.fill();x.beginPath();x.ellipse(-11*s,-3.4*s,2*s,1.4*s,-.8,0,7);x.fill();x.restore();
     x.fillStyle=shadeF(13*s,-4*s,5.4*s,'#d9c2a3');x.beginPath();x.arc(13*s,-3.4*s,5.2*s,0,7);x.fill();x.fillStyle=B;x.beginPath();x.arc(13*s,-3.4*s,5.2*s,Math.PI*.95,Math.PI*1.55);x.lineTo(13*s,-3.4*s);x.fill();
     x.fillStyle=Fc;x.beginPath();x.arc(10.6*s,-7.8*s,1.4*s,0,7);x.fill();eyeD(14.4*s,-5*s,.8*s,blinkAt(et,1));x.fillStyle='#1a1414';x.beginPath();x.ellipse(17.6*s,-3.4*s,1.1*s,.8*s,0,0,7);x.fill();
     x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.3*s;for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(17*s,-2.4*s);x.lineTo(21*s,-2*s+i*1.2*s);x.stroke()}
     const cy=-7*s-(tap?1.5*s:0);x.fillStyle=NC('#5a6a8a');x.beginPath();x.ellipse(2*s,cy,3.6*s,2.6*s,0,0,7);x.fill();x.strokeStyle=NC('#3a4a6a');x.lineWidth=.4*s;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(2*s,cy+2.4*s);x.lineTo(2*s+i*1.5*s,cy-2*s);x.stroke()}
     x.strokeStyle=B;x.lineWidth=2*s;x.lineCap='round';x.beginPath();x.moveTo(6*s,-4*s);x.lineTo(4*s,cy+1*s);x.moveTo(-1*s,-4*s);x.lineTo(.4*s,cy+1*s);x.stroke();
     if(tap&&Math.random()<.3){x.fillStyle='#fff';x.font=`${7*k}px sans-serif`;x.fillText('コン',4*s,-12*s)}x.restore();x.globalAlpha=1}}});
  /* v126: 遊びに来る 動物たち */
  Object.assign(VIS,{
   nekomaru:{msg:'ネコが 焚き火の 前で まるくなった🐈',dur:60,when:null,draw(p,st,et){const[fx,fy]=fireP(),gy=fy+6*k,sx=fx-38*k,w=walkPath(p,-30*k,W+30*k,sx,.16,.86),s=k*1.3,c0=st.c??=pick(['#f2a65a','#4a4a52','#f4f1ea','#9a9a9a']),c=dark>.5?mixc(c0,'#1a1830',.25):c0;
     x.globalAlpha=fade(p,.02,.02);evShad(w.x,gy,10*s);x.save();x.translate(w.x,gy);
     if(w.m==='go'){const ph=et*9;x.strokeStyle=c;x.lineWidth=2*s;x.lineCap='round';[-6,-3,4,7].forEach((lx,i)=>{x.beginPath();x.moveTo(lx*s,-6*s);x.lineTo(lx*s+Math.sin(ph+i*1.6)*2*s,0);x.stroke()});
       x.fillStyle=shadeF(0,-9*s,10*s,c0);x.beginPath();x.ellipse(0,-8*s,9*s,4.6*s,0,0,7);x.fill();x.beginPath();x.arc(9*s,-12*s,4*s,0,7);x.fill();
       x.beginPath();x.moveTo(6.5*s,-15*s);x.lineTo(7.5*s,-19*s);x.lineTo(9.5*s,-15.5*s);x.moveTo(10*s,-15.5*s);x.lineTo(12*s,-19*s);x.lineTo(12.6*s,-14.5*s);x.fill();
       x.strokeStyle=c;x.lineWidth=2*s;x.beginPath();x.moveTo(-8*s,-9*s);x.quadraticCurveTo(-14*s,-14*s+Math.sin(et*3)*2*s,-12*s,-20*s);x.stroke();x.fillStyle='#1a1414';x.beginPath();x.arc(11*s,-12.5*s,.8*s,0,7);x.fill()}
     else{const br=1+Math.sin(et*1.6)*.03;x.fillStyle=shadeF(0,-6*s,10*s,c0);x.beginPath();x.ellipse(0,-5*s,10*s*br,5.5*s*br,0,0,7);x.fill();x.beginPath();x.arc(7*s,-6*s,4.2*s,0,7);x.fill();
       const tw=(et%3.2)<.22?1.2:0;x.beginPath();x.moveTo(5*s,-9*s);x.lineTo(5.5*s-tw*s,-13.5*s);x.lineTo(7.5*s,-9.8*s);x.moveTo(8*s,-9.8*s);x.lineTo(10*s+tw*s,-13.5*s);x.lineTo(10.6*s,-8.5*s);x.fill();
       x.strokeStyle=c;x.lineWidth=2.2*s;x.beginPath();x.moveTo(-9*s,-4*s);x.quadraticCurveTo(-6*s,1*s,4*s,-.5*s);x.stroke();
       x.strokeStyle='#1a1414';x.lineWidth=.7*s;x.beginPath();x.arc(6*s,-6.4*s,1*s,.3,Math.PI-.3);x.stroke();x.beginPath();x.arc(9*s,-6.4*s,1*s,.3,Math.PI-.3);x.stroke();
       x.fillStyle=`rgba(255,255,255,${.4+.3*Math.sin(et*2)})`;x.font=`${6*s}px sans-serif`;x.fillText('z',14*s,-14*s-((et*4)%8)*s)}
     x.restore();x.globalAlpha=1}},
   kanicard:{msg:'子ガニが トランプを 運んでる🦀',dur:24,when:null,draw(p,st,et){const gy=WT+WH*.965,s=k*1.2,cx=lerp(W+20*k,-20*k,p),bob=Math.abs(Math.sin(et*10))*s;x.globalAlpha=fade(p,.03,.03);evShad(cx,gy,7*s);x.save();x.translate(cx,gy-bob);
     x.strokeStyle='#c0392b';x.lineWidth=1*s;for(let i=0;i<3;i++)[-1,1].forEach(d=>{const sw=Math.sin(et*14+i)*1.2*s;x.beginPath();x.moveTo(d*3*s,-2*s);x.lineTo(d*(6+i)*s+sw,0);x.stroke()});
     x.fillStyle=shadeF(0,-3*s,6*s,'#e74c3c');x.beginPath();x.ellipse(0,-3*s,5.5*s,3.4*s,0,0,7);x.fill();
     x.save();x.translate(0,-12*s);x.rotate(Math.sin(et*5)*.08);x.fillStyle='#fff';x.fillRect(-5*s,-7*s,10*s,14*s);x.strokeStyle='#1b1740';x.lineWidth=.6*s;x.strokeRect(-5*s,-7*s,10*s,14*s);x.fillStyle=st.cc??=(Math.random()<.5?'#e2475a':'#1b1740');x.font=`bold ${7*s}px sans-serif`;x.textAlign='center';x.fillText(st.ch??=pick(['A','K','Q','J','7']),0,2*s);x.textAlign='left';x.restore();
     x.strokeStyle='#e74c3c';x.lineWidth=1.2*s;x.beginPath();x.moveTo(-3*s,-5*s);x.lineTo(-4.5*s,-8*s);x.moveTo(3*s,-5*s);x.lineTo(4.5*s,-8*s);x.stroke();
     x.fillStyle='#111';x.beginPath();x.arc(-1.6*s,-6.4*s,.8*s,0,7);x.arc(1.6*s,-6.4*s,.8*s,0,7);x.fill();x.restore();x.globalAlpha=1}},
   gullchase:{msg:'カモメが おやつを ねらってる！',dur:22,when:'day',draw(p,st,et){const s=k*1.2,gx=WL+WW*.52,gy=WT+WH*.9;x.globalAlpha=fade(p,.03,.05);
     const bag=(bx,by,r)=>{x.save();x.translate(bx,by);x.rotate(r);x.fillStyle='#e8463e';x.fillRect(-4*s,-8*s,8*s,9*s);x.fillStyle='#ffd23f';x.fillRect(-3*s,-6*s,6*s,3*s);x.restore()};
     const gull=(px,py,fly,flap)=>{x.save();x.translate(px,py);x.scale(-1,1);x.fillStyle=dark>.5?'#9aa0b8':'#f7f7f7';x.beginPath();x.ellipse(0,-4*s,6*s,3*s,0,0,7);x.fill();x.beginPath();x.arc(5*s,-6.5*s,2.4*s,0,7);x.fill();x.fillStyle='#f2b33a';x.beginPath();x.moveTo(7*s,-6.8*s);x.lineTo(10*s,-6.2*s);x.lineTo(7*s,-5.6*s);x.fill();x.fillStyle='#1a1414';x.beginPath();x.arc(5.8*s,-7*s,.5*s,0,7);x.fill();
       x.fillStyle='#b8bcc8';if(fly){const a=Math.sin(flap)*.9;x.save();x.translate(-1*s,-5*s);x.rotate(-a);x.beginPath();x.ellipse(-2*s,-5*s,2*s,6.5*s,-.4,0,7);x.fill();x.restore()}else{x.beginPath();x.ellipse(-1*s,-4*s,4*s,2*s,.1,0,7);x.fill();x.strokeStyle='#f2b33a';x.lineWidth=.8*s;x.beginPath();x.moveTo(0,-1*s);x.lineTo(0,1*s);x.moveTo(2*s,-1*s);x.lineTo(2*s,1*s);x.stroke()}x.restore()};
     let ax,ay,af=true;if(p<.25){const u=p/.25;ax=lerp(W+30*k,gx+14*s,u);ay=lerp(gy-120*k,gy,u*u)}else if(p<.6){ax=gx+14*s;ay=gy-(Math.sin(et*8)>.6?2*s:0);af=false}else{const u=(p-.6)/.4;ax=lerp(gx+14*s,-40*k,u);ay=gy-Math.sin(u*Math.PI)*60*k-u*40*k}
     if(p<.6)bag(gx,gy,.3+(p>.3?Math.sin(et*9)*.15:0));else bag(ax-8*s,ay-4*s,-.4);gull(ax,ay,af,et*14);
     if(p>.5){const u=(p-.5)/.5;gull(lerp(W+40*k,-70*k,u),gy-26*k-Math.sin(u*Math.PI*2)*18*k,true,et*16)}x.globalAlpha=1}},
   tanuki3:{msg:'タヌキたちが 腹つづみを 打ってる🎶',dur:32,when:'night',draw(p,st,et){const[fx,fy]=fireP(),gy=fy+10*k,s=k*1.2,a=fade(p,.06,.08);x.globalAlpha=a;
     if(p>.1&&p<.9&&et-(st.lb||0)>.55){st.lb=et;st.n=(st.n||0)+1;try{if(S.sound)tone(st.n%4===0?90:130,.14,'sine',.06)}catch(e){}}
     [0,1,2].forEach(i=>{const tx=fx+(32+i*16)*k,beat=((et*1.8+i*.33)%1)<.15?1:0,c='#7a5a3a';evShad(tx,gy,8*s);x.save();x.translate(tx,gy-beat*1.5*s);
       x.fillStyle=shadeF(0,-8*s,9*s,c);x.beginPath();x.ellipse(0,-7*s,7*s,8*s,0,0,7);x.fill();x.fillStyle=`rgb(${235-beat*10},210,170)`;x.beginPath();x.ellipse(0,-6*s,4.6*s*(1+beat*.12),5.4*s*(1+beat*.12),0,0,7);x.fill();
       x.fillStyle=c;x.beginPath();x.arc(0,-17*s,5*s,0,7);x.fill();x.beginPath();x.arc(-3.6*s,-21*s,1.8*s,0,7);x.arc(3.6*s,-21*s,1.8*s,0,7);x.fill();
       x.fillStyle='#3a2a1a';x.beginPath();x.ellipse(-2*s,-17*s,2*s,1.6*s,.3,0,7);x.ellipse(2*s,-17*s,2*s,1.6*s,-.3,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(-2*s,-17*s,.6*s,0,7);x.arc(2*s,-17*s,.6*s,0,7);x.fill();x.fillStyle='#f4e6d0';x.beginPath();x.ellipse(0,-14.5*s,2*s,1.4*s,0,0,7);x.fill();
       x.strokeStyle=c;x.lineWidth=2*s;x.lineCap='round';const arm=beat?-.2:.6;[-1,1].forEach(d=>{x.beginPath();x.moveTo(d*5*s,-10*s);x.lineTo(d*2*s,-10*s+arm*8*s);x.stroke()});
       x.fillStyle='#5a4028';x.beginPath();x.ellipse(-7*s,-2*s,3*s,2*s,.5,0,7);x.fill();x.restore();
       if(beat){x.fillStyle='rgba(255,240,200,.8)';x.font=`${6*s}px sans-serif`;x.fillText(['ポン','ポコ','♪'][i],tx+5*s,gy-22*s)}});x.globalAlpha=1}},
   azarashi:{msg:'アザラシが 波打ち際で ごろごろ🦭',dur:40,when:null,draw(p,st,et){const s=k*1.3,ax=WL+WW*.72,gy=shore+10*k,a=fade(p,.05,.05);x.globalAlpha=a;const splash=(et%9)<1.2,jump=splash?Math.sin(Math.min(1,(et%9)/1.2)*Math.PI)*6*s:0,roll=Math.sin(et*.8)*.35;
     evShad(ax,gy,14*s);x.save();x.translate(ax,gy-jump);x.rotate(roll);x.fillStyle=shadeF(0,-5*s,14*s,'#8a8f9a');x.beginPath();x.ellipse(0,-5*s,14*s,6*s,0,0,7);x.fill();
     x.fillStyle='#6a6f7a';for(let i=0;i<6;i++){x.beginPath();x.arc(-8*s+i*3.2*s,-7*s+Math.sin(i)*s,.7*s,0,7);x.fill()}x.beginPath();x.arc(12*s,-7*s,5*s,0,7);x.fillStyle='#9aa0aa';x.fill();x.fillStyle='#1a1414';x.beginPath();x.arc(13*s,-8*s,1*s,0,7);x.arc(15.5*s,-8*s,1*s,0,7);x.fill();x.beginPath();x.arc(16*s,-6*s,.7*s,0,7);x.fill();
     x.fillStyle='#7a7f8a';x.beginPath();x.ellipse(-15*s,-4*s,3.5*s,2*s,.6,0,7);x.fill();x.restore();
     if(splash){const u=(et%9)/1.2;x.fillStyle=`rgba(240,250,255,${.8*(1-u)})`;for(let i=0;i<10;i++){x.beginPath();x.arc(ax-20*s+i*4*s,gy-4*s-Math.sin(u*Math.PI)*(6+i%3*3)*s,1.2*s,0,7);x.fill()}if(u<.2){x.fillStyle='#fff';x.font=`${6*s}px sans-serif`;x.fillText('！',ax+16*s,gy-20*s)}}x.globalAlpha=1}},
   pengline:{msg:'ペンギンの 行列が 通っていく🐧',dur:26,when:null,draw(p,st,et){const gy=WT+WH*.94,s=k*1.35;x.globalAlpha=fade(p,.02,.02);
     for(let i=0;i<5;i++){const last=i===4,fall=last&&p>.45&&p<.6,lag=last&&p>.45?Math.min(.06,(p-.45)*.4):0,px=lerp(-40*k,W+40*k,Math.max(0,p-i*.035-lag+(last&&p>.6?(p-.6)*.12:0))),wob=Math.sin(et*10+i)*.15;
       evShad(px,gy,6*s);x.save();x.translate(px,gy);x.rotate(fall?1.4:wob);x.fillStyle=shadeF(0,-9*s,7*s,'#2a2e3a');x.beginPath();x.ellipse(0,-9*s,6*s,9*s,0,0,7);x.fill();x.fillStyle='#f4f4f4';x.beginPath();x.ellipse(1.5*s,-8*s,3.8*s,7*s,0,0,7);x.fill();
       x.fillStyle='#f2a33a';x.beginPath();x.moveTo(4*s,-15*s);x.lineTo(8*s,-14*s);x.lineTo(4*s,-13*s);x.fill();x.fillRect(-2*s,-.6*s,3*s,1.2*s);x.fillRect(1.5*s,-.6*s,3*s,1.2*s);x.fillStyle='#111';x.beginPath();x.arc(3*s,-15.5*s,.7*s,0,7);x.fill();x.restore();
       if(fall){x.fillStyle='#fff';x.font=`${6*s}px sans-serif`;x.fillText('ぺたん',px-8*s,gy-14*s)}}x.globalAlpha=1}},
   kawauso:{msg:'カワウソが 石で 貝を 割ってる',dur:30,when:null,draw(p,st,et){const s=k*1.25,ox=WL+WW*.16,gy=shore+16*k,a=fade(p,.06,.06);x.globalAlpha=a;const hit=(et%.7)<.1;
     if(hit&&p>.1&&p<.9&&et-(st.lb||0)>.5){st.lb=et;st.n=(st.n||0)+1;try{if(S.sound)tone(st.n%6===0?600:1700,.04,'square',.03)}catch(e){}}
     x.fillStyle=dark>.5?'#3a3a48':'#7a7a80';x.beginPath();x.ellipse(ox,gy,14*s,5*s,0,Math.PI,0);x.fill();evShad(ox,gy,15*s);
     x.save();x.translate(ox,gy-4*s);x.fillStyle=shadeF(0,-7*s,8*s,'#8a6038');x.beginPath();x.ellipse(0,-6*s,5*s,8*s,-.1,0,7);x.fill();x.fillStyle='#d8b890';x.beginPath();x.ellipse(1*s,-5*s,3*s,5.5*s,-.1,0,7);x.fill();
     x.fillStyle='#8a6038';x.beginPath();x.arc(1*s,-15*s,4*s,0,7);x.fill();x.fillStyle='#1a1414';x.beginPath();x.arc(2.4*s,-15.6*s,.7*s,0,7);x.arc(-.4*s,-15.6*s,.7*s,0,7);x.fill();x.fillStyle='#d8b890';x.beginPath();x.ellipse(1*s,-13.5*s,1.8*s,1.2*s,0,0,7);x.fill();
     const ay=hit?-6*s:-11*s;x.strokeStyle='#8a6038';x.lineWidth=1.8*s;x.lineCap='round';x.beginPath();x.moveTo(-3*s,-8*s);x.lineTo(-1*s,ay);x.moveTo(4*s,-8*s);x.lineTo(2*s,ay);x.stroke();x.fillStyle='#9a9a9a';x.beginPath();x.arc(.5*s,ay-1.5*s,2*s,0,7);x.fill();x.fillStyle='#e8c8b0';x.beginPath();x.ellipse(.5*s,-4*s,2.2*s,1.4*s,0,0,7);x.fill();
     x.strokeStyle='#8a6038';x.lineWidth=2.2*s;x.beginPath();x.moveTo(-3*s,-1*s);x.quadraticCurveTo(-10*s,0,-12*s,-4*s);x.stroke();x.restore();
     if(hit){x.fillStyle='rgba(255,255,220,.9)';x.font=`${5.5*s}px sans-serif`;x.fillText('カン',ox+6*s,gy-18*s)}x.globalAlpha=1}},
   hato:{msg:'ハトが 朝ごはんを ついばんでる',dur:30,when:'morning',draw(p,st,et){const gy=WT+WH*.95,s=k*1.5,cx=WL+WW*.5;x.globalAlpha=fade(p,.04,.04);st.b??=Array.from({length:6},(_,i)=>({x:(i-2.5)*14+Math.random()*6,ph:Math.random()*6,d:Math.random()<.5?1:-1}));
     for(const b of st.b){let bx=cx+b.x*k+Math.sin(et*.5+b.ph)*6*k,by=gy;const up=p>.85?(p-.85)/.15:0;by-=up*120*k;bx+=up*b.d*60*k;const peck=!up&&Math.sin(et*5+b.ph)>.5;evShad(bx,gy,5*s*(1-up));
       x.save();x.translate(bx,by);x.scale(b.d,1);x.fillStyle=shadeF(0,-5*s,6*s,'#8a8fa0');x.beginPath();x.ellipse(0,-4*s,5*s,3.4*s,0,0,7);x.fill();x.fillStyle='#7a6a9a';x.beginPath();x.arc(4*s,peck?-4*s:-8*s,2.4*s,0,7);x.fill();x.fillStyle='#5a8a6a';x.beginPath();x.arc(3.4*s,peck?-2.6*s:-6.4*s,1.6*s,0,7);x.fill();
       x.fillStyle='#e8a050';x.fillRect(6*s,peck?-4.4*s:-8.4*s,1.6*s,.8*s);if(up){x.fillStyle='#9aa0b0';x.beginPath();x.ellipse(-1*s,-8*s,2*s,5*s*Math.abs(Math.sin(et*20)),-.3,0,7);x.fill()}else{x.strokeStyle='#d07060';x.lineWidth=.7*s;x.beginPath();x.moveTo(0,-1*s);x.lineTo(0,1*s);x.stroke()}x.restore()}x.globalAlpha=1}},
   koinu2:{msg:'子犬が 2匹で 砂浜を 掘ってる🐕',dur:36,when:null,draw(p,st,et){const s=k*1.5,hx=WL+WW*.64,gy=WT+WH*.955,a=fade(p,.04,.04);x.globalAlpha=a;const dig=p>.15&&p<.85;
     x.fillStyle='rgba(120,90,50,.45)';x.beginPath();x.ellipse(hx,gy+1*s,8*s*Math.min(1,p*3),2.4*s*Math.min(1,p*3),0,0,7);x.fill();
     [[-1,'#e8c890'],[1,'#f4f1ea']].forEach(([side,c0],j)=>{const tx=dig?hx+side*10*s:lerp(side<0?-30*k:W+30*k,hx+side*10*s,Math.min(1,p/.15)),ty=gy;evShad(tx,ty,7*s);x.save();x.translate(tx,ty);x.scale(-side,1);
       const ph=et*14+j;x.fillStyle=shadeF(0,-6*s,7*s,c0);x.beginPath();x.ellipse(0,-5*s,6*s,3.6*s,dig?.3:0,0,7);x.fill();x.beginPath();x.arc(5*s,dig?-3*s:-9*s,3.4*s,0,7);x.fill();x.fillStyle='#8a6a4a';x.beginPath();x.ellipse(5*s,dig?-5.5*s:-11.5*s,1.4*s,2.6*s,.4,0,7);x.fill();
       x.strokeStyle=c0;x.lineWidth=1.6*s;x.lineCap='round';x.beginPath();x.moveTo(3*s,-2*s);x.lineTo(5*s+(dig?Math.sin(ph)*2*s:0),0);x.moveTo(-3*s,-2*s);x.lineTo(-3*s,0);x.moveTo(-5*s,-6*s);x.lineTo(-8*s,-9*s+Math.sin(et*12)*1.5*s);x.stroke();x.fillStyle='#1a1414';x.beginPath();x.arc(8*s,dig?-3.5*s:-9.5*s,.7*s,0,7);x.fill();x.restore();
       if(dig){x.fillStyle='rgba(220,190,140,.85)';for(let i=0;i<4;i++){const u=((et*2+i*.25+j*.5)%1);x.fillRect(tx-side*(4+u*16)*s,ty-4*s-Math.sin(u*Math.PI)*10*s,1.2*s,1.2*s)}}});
     if(p>.7&&p<.85){x.save();x.globalCompositeOperation='lighter';glow(hx,gy-2*s,10*s,`rgba(255,240,170,${.6*Math.sin((p-.7)/.15*Math.PI)})`);x.restore();if(!st.said){st.said=1;try{say('ev_an_koinu2_find',{delay:0})}catch(e){}}}x.globalAlpha=1}},
   fukuro:{msg:'フクロウが 杭の上で 首を かしげてる🦉',dur:45,when:'night',draw(p,st,et){const s=k*1.3,ox=WL+WW*.9,gy=shore+20*k,a=fade(p,.08,.08);x.globalAlpha=a;
     x.fillStyle='#4a3420';x.fillRect(ox-2*s,gy-26*s,4*s,26*s);x.save();x.translate(ox,gy-26*s);x.fillStyle=shadeF(0,-8*s,8*s,'#8a6a48');x.beginPath();x.ellipse(0,-8*s,6.5*s,8.5*s,0,0,7);x.fill();
     const c=et%6,rot=c<1.4?Math.sin(c/1.4*Math.PI)*Math.PI:0,tilt=c>3&&c<4.4?Math.sin((c-3)/1.4*Math.PI)*.5:0;x.save();x.translate(0,-17*s);x.rotate(tilt);x.scale(Math.cos(rot)>=0?1:-1,1);
     x.fillStyle='#9a7a58';x.beginPath();x.arc(0,0,6*s,0,7);x.fill();x.beginPath();x.moveTo(-5*s,-4*s);x.lineTo(-6*s,-9*s);x.lineTo(-2*s,-5*s);x.moveTo(5*s,-4*s);x.lineTo(6*s,-9*s);x.lineTo(2*s,-5*s);x.fill();
     if(Math.abs(Math.cos(rot))>.3){x.fillStyle='#f4e6c8';x.beginPath();x.arc(-2.4*s,0,2.4*s,0,7);x.arc(2.4*s,0,2.4*s,0,7);x.fill();x.fillStyle='#ffcc33';x.beginPath();x.arc(-2.4*s,0,1.4*s,0,7);x.arc(2.4*s,0,1.4*s,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(-2.4*s,0,.8*s,0,7);x.arc(2.4*s,0,.8*s,0,7);x.fill();x.fillStyle='#e8a050';x.beginPath();x.moveTo(-1*s,1.6*s);x.lineTo(1*s,1.6*s);x.lineTo(0,3.6*s);x.fill()}
     x.restore();x.fillStyle='#e8a050';x.fillRect(-3*s,-1*s,2*s,1.4*s);x.fillRect(1*s,-1*s,2*s,1.4*s);x.restore();
     if(c>3&&c<3.5){x.fillStyle='rgba(255,255,255,.8)';x.font=`${6*s}px sans-serif`;x.fillText('？',ox+8*s,gy-46*s)}x.globalAlpha=1}}
  });
  const VISN=Object.keys(VIS);let vcur=null,vlast=null,visitAt=performance.now()+R(300000,480000);
  const visOk=n=>{const w=VIS[n].when,h=gameHour();if(!w)return true;if(w==='night')return dark>.6;if(w==='day')return dark<.35;if(w==='dusk')return h>=17||h<6;if(w==='morning')return h>=5&&h<11;return true};
  function startVisitor(name){if(!name){const c=VISN.filter(n=>n!==vlast&&visOk(n));name=c[Math.random()*c.length|0]}if(!name)return;vlast=name;vcur={name,et:0,st:{}};try{window.diaryNote&&diaryNote('an',name)}catch(e){}let g='';try{if(Math.random()<.1+.03*((S.up&&S.up.gift)||0))g=grantEvent('an_'+name);else say('ev_an_'+name,{n:1+(Math.random()*2|0),origin:'beach',delay:1600,gap:1300})}catch(e){}try{if(S.mapN>0){if(S.mapN>0)S.mapN--;const tr=giveTre(0);g=g?g+'<br>'+tr:tr}}catch(e){}
    const el=$('toast');el.innerHTML=VIS[name].msg+(g?`<br><b>${g}</b>`:'');el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),4200);try{sfx.chime()}catch(e){}}
  function runVisitor(layer,rdt){if(!vcur)return;const v=VIS[vcur.name];if((v.layer||'beach')!==layer)return;vcur.et+=rdt;const p=vcur.et/v.dur;if(p>=1){vcur=null;return}window._vrec=[];x.save();v.draw(p,vcur.st,vcur.et);x.restore();window._visPts={name:vcur.name,pts:window._vrec,t:Date.now()};window._vrec=null}

  // ---- ambient scenes: no rewards, just life on the beach ----
  const sil=(c)=>dark>.5?mixc(c,'#1a1830',.55):c;
  const seatBack=(sx,sy,sc,shirt,hair,lean)=>{const nt=dark>.5,S2=c=>nt?mixc(c,'#1a1830',.5):c;x.save();x.translate(sx,sy);x.rotate(lean||0);
    const g=x.createLinearGradient(-8*sc,0,8*sc,0);g.addColorStop(0,tone2(S2(shirt),-.2));g.addColorStop(.5,S2(shirt));g.addColorStop(1,tone2(S2(shirt),-.25));x.fillStyle=g;
    x.beginPath();x.moveTo(-7.5*sc,0);x.quadraticCurveTo(-8.6*sc,-10*sc,-5*sc,-15.5*sc);x.quadraticCurveTo(0,-17.4*sc,5*sc,-15.5*sc);x.quadraticCurveTo(8.6*sc,-10*sc,7.5*sc,0);x.closePath();x.fill();
    x.strokeStyle=tone2(S2(shirt),-.3);x.lineWidth=.6*sc;x.beginPath();x.moveTo(0,-15*sc);x.lineTo(0,-3*sc);x.stroke();
    x.fillStyle=S2('#d9a882');x.fillRect(-1*sc,-18.2*sc,2*sc,2.6*sc);x.fillStyle=S2('#e9bf98');x.beginPath();x.ellipse(0,-21*sc,3.8*sc,4.2*sc,0,0,7);x.fill();
    x.fillStyle=S2(hair);x.beginPath();x.ellipse(0,-21.6*sc,4.1*sc,4.1*sc,0,0,7);x.fill();x.fillStyle=tone2(S2(hair),.15);x.beginPath();x.ellipse(-1.2*sc,-23.4*sc,1.4*sc,.8*sc,-.4,0,7);x.fill();
    if(nt){x.strokeStyle='rgba(255,170,90,.3)';x.lineWidth=.7*sc;x.beginPath();x.arc(0,-21.6*sc,4.1*sc,-2.6,-1.2);x.stroke()}x.restore()};
  const AMB={
   couple_sit:{when:'dusk',dur:70,layer:'beach',draw(p,st,et){const cx=WL+WW*.7,cy=shore+34*k,sc=k*1.6,a=fade(p,.06,.08);x.globalAlpha=a;
     x.fillStyle='rgba(0,0,0,.18)';x.beginPath();x.ellipse(cx,cy+1*k,22*sc,3.5*sc,0,0,7);x.fill();
     seatBack(cx-6*sc,cy,sc,'#3d5a80','#2a1c14',0);seatBack(cx+6.5*sc,cy,sc*.92,'#e07a8a','#5a3a22',-.22);
     x.strokeStyle=sil('#3d5a80');x.lineWidth=2.6*sc;x.lineCap='round';x.beginPath();x.moveTo(-1*sc+cx,cy-13*sc);x.quadraticCurveTo(cx+4*sc,cy-15*sc,cx+9*sc,cy-12*sc);x.stroke();
     if(Math.sin(et*.5)>.85){const q=(et*.5)%1;x.globalAlpha=a*(1-q);x.fillStyle='#ff7a9a';x.font=`${10*k}px sans-serif`;x.textAlign='center';x.fillText('♥',cx,cy-32*sc-q*14*k)}x.globalAlpha=1}},
   stargazer:{when:'night',dur:60,layer:'beach',draw(p,st,et){const cx=WL+WW*.72,cy=WT+WH*.92,sc=k*1.4;x.globalAlpha=fade(p,.08,.08);x.fillStyle='#3a6ea5';x.fillRect(cx-22*sc,cy-3*sc,44*sc,6*sc);
     x.fillStyle=sil('#4a4a6a');x.beginPath();x.ellipse(cx+2*sc,cy-3*sc,13*sc,3.6*sc,0,0,7);x.fill();x.fillStyle=sil('#e9bf98');x.beginPath();x.arc(cx-13*sc,cy-4*sc,3.6*sc,0,7);x.fill();
     const ang=-1.2+Math.sin(et*.4)*.4;x.strokeStyle=sil('#4a4a6a');x.lineWidth=2*sc;x.lineCap='round';x.beginPath();x.moveTo(cx-6*sc,cy-5*sc);x.lineTo(cx-6*sc+Math.cos(ang)*12*sc,cy-5*sc+Math.sin(ang)*12*sc);x.stroke();x.globalAlpha=1}},
   fisherman:{when:null,dur:70,layer:'beach',draw(p,st,et){const fx2=WL+WW*.8,fy=shore+14*k,sc=k*1.1,a=fade(p,.06,.06),CT=.5,caught=p>=CT,bite=!caught&&(Math.sin(et*.7)>.93||p>CT-.04);if(caught&&!st.fish){st.fish='🐟';try{st.fish=fishCatch()}catch(e){}}x.globalAlpha=a;evShad(fx2,fy,8*sc);human(fx2,fy,sc,0,'#5b7f4a','#e9bf98',false,-1);
     x.fillStyle=sil('#c9a060');x.beginPath();x.ellipse(fx2,fy-30.5*sc,6*sc,1.6*sc,0,0,7);x.fill();x.beginPath();x.ellipse(fx2,fy-32*sc,3.4*sc,2.2*sc,0,Math.PI,0);x.fill();
     const lift=caught?Math.min(1,(p-CT)/.04):0,tx=fx2-36*sc+lift*14*sc,ty=fy-46*sc-(bite?4*sc:0)-lift*16*sc;x.strokeStyle='#3a2a1a';x.lineWidth=1.3*sc;x.beginPath();x.moveTo(fx2-3*sc,fy-17*sc);x.lineTo(tx,ty);x.stroke();
     x.fillStyle=sil('#6a8aa0');x.fillRect(fx2+7*sc,fy-6*sc,7*sc,6*sc);if(caught&&p<CT+.16){const sw=Math.sin(et*9)*3*sc,hx=tx+sw,hy=ty+16*sc;x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=.6;x.beginPath();x.moveTo(tx,ty);x.lineTo(hx,hy);x.stroke();x.font=`${12*sc}px sans-serif`;x.textAlign='center';x.fillText(st.fish,hx,hy+10*sc)}else if(!caught){x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=.6;x.beginPath();x.moveTo(tx,ty);const flx=tx-34*sc,fly=seaY(.72)+Math.sin(et*1.6)*.8*k;x.quadraticCurveTo(tx-20*sc,fy-30*sc,flx,fly);x.stroke();x.fillStyle=bite?'#ff5c5c':'#fff';x.beginPath();x.arc(flx,fly+(bite?2:0),1.6*sc,0,7);x.fill();if(bite){x.strokeStyle='rgba(255,255,255,.5)';x.beginPath();x.arc(flx,fly,(4+Math.sin(et*10)*2)*sc,0,7);x.stroke()}}else{x.font=`${7*sc}px sans-serif`;x.textAlign='center';x.fillText(st.fish,fx2+10.5*sc,fy-6*sc)}x.globalAlpha=1}},
   kids_run:{when:'day',dur:16,layer:'beach',draw(p,st,et){const gy=shore+10*k;x.globalAlpha=fade(p,.04,.04);[[0,'#ff5c8a'],[16,'#3ea0ff']].forEach(([o,c],n)=>{const hx=lerp(W+30*k,-40*k,p)+o*k+Math.sin(et*3+n)*4*k;evShad(hx,gy,6*k);human(hx,gy,.75*k,et*13+n,c,'#f1c7a0',true,-1)});
     x.fillStyle='rgba(255,255,255,.7)';for(let n=0;n<5;n++){const sx=lerp(W+30*k,-40*k,p)+20*k+n*4*k;x.beginPath();x.arc(sx,gy-Math.abs(Math.sin(et*9+n))*5*k,1.3*k,0,7);x.fill()}x.globalAlpha=1}},
   dogwalk:{when:'morning',dur:26,layer:'beach',draw(p,st,et){const gy=shore+18*k,hx=lerp(-30*k,W+50*k,p),sc=k;x.globalAlpha=fade(p,.04,.04);evShad(hx,gy,8*sc);human(hx,gy,sc,et*6,'#e0b04a','#e9bf98',false);
     const dx=hx+26*sc+Math.sin(et*3)*3*sc,ph=et*14;x.strokeStyle='#aa3333';x.lineWidth=.7;x.beginPath();x.moveTo(hx+5*sc,gy-14*sc);x.quadraticCurveTo(hx+16*sc,gy-6*sc,dx-4*sc,gy-8*sc);x.stroke();
     x.fillStyle=shadeF(dx,gy-8*sc,8*sc,'#f0e2c8');x.beginPath();x.ellipse(dx,gy-7*sc,7*sc,3.6*sc,0,0,7);x.fill();x.beginPath();x.arc(dx+6*sc,gy-10*sc,3*sc,0,7);x.fill();x.strokeStyle=sil('#f0e2c8');x.lineWidth=1.6*sc;[[-4,0],[-2,1.6],[3,3.1],[5,4.7]].forEach(([lx,o])=>{x.beginPath();x.moveTo(dx+lx*sc,gy-5*sc);x.lineTo(dx+lx*sc+Math.sin(ph+o)*2*sc,gy);x.stroke()});
     x.beginPath();x.moveTo(dx-6*sc,gy-8*sc);x.lineTo(dx-10*sc,gy-12*sc+Math.sin(et*12)*2*sc);x.stroke();x.globalAlpha=1}},
   sunbather:{when:'noon',dur:70,layer:'beach',draw(p,st,et){const cx=WL+WW*.74,cy=WT+WH*.86,sc=k*1.1;x.globalAlpha=fade(p,.05,.05);x.fillStyle='#ff9a3c';x.fillRect(cx-20*sc,cy-3*sc,40*sc,7*sc);x.fillStyle='#fff';for(let n=0;n<5;n++)x.fillRect(cx-20*sc+n*9*sc,cy-3*sc,3*sc,7*sc);
     x.fillStyle='#e9bf98';x.beginPath();x.ellipse(cx+2*sc,cy-1*sc,13*sc,3*sc,0,0,7);x.fill();x.fillStyle='#3ea0ff';x.fillRect(cx-3*sc,cy-3.5*sc,8*sc,4*sc);x.fillStyle='#e9bf98';x.beginPath();x.arc(cx-13*sc,cy-2*sc,3.4*sc,0,7);x.fill();x.fillStyle='#222';x.fillRect(cx-16*sc,cy-3.5*sc,5*sc,1.3*sc);
     x.strokeStyle='#888';x.lineWidth=1.2*sc;x.beginPath();x.moveTo(cx+18*sc,cy+2*sc);x.lineTo(cx+12*sc,cy-30*sc);x.stroke();['#ff5c8a','#fff','#ffd23f','#fff','#55e0b4','#fff'].forEach((c,i)=>{x.fillStyle=c;x.beginPath();x.moveTo(cx+12*sc,cy-30*sc);x.arc(cx+12*sc,cy-30*sc,18*sc,Math.PI+.25+i*.45,Math.PI+.25+(i+1)*.45);x.fill()});x.globalAlpha=1}},
   farsail:{when:null,dur:70,layer:'sea',draw(p,st,et){const sx=lerp(-20*k,W+20*k,p),sy=hz+2*k,sc=k*.6;x.globalAlpha=fade(p,.05,.05)*.85;x.fillStyle=sil('#f4f4f4');x.beginPath();x.moveTo(sx,sy-22*sc);x.lineTo(sx,sy-2*sc);x.lineTo(sx+11*sc,sy-2*sc);x.closePath();x.fill();x.beginPath();x.moveTo(sx-1*sc,sy-18*sc);x.lineTo(sx-1*sc,sy-3*sc);x.lineTo(sx-9*sc,sy-3*sc);x.closePath();x.fill();
     x.fillStyle=sil('#7a4a2a');x.beginPath();x.moveTo(sx-10*sc,sy-1*sc);x.lineTo(sx+12*sc,sy-1*sc);x.lineTo(sx+9*sc,sy+2*sc);x.lineTo(sx-8*sc,sy+2*sc);x.fill();x.globalAlpha=1}},
   bigwave:{when:null,dur:6,layer:'beach',draw(p,st,et){const a=Math.sin(p*Math.PI);x.save();x.globalAlpha=a*.8;x.fillStyle='rgba(255,255,255,.85)';for(let n=0;n<40;n++){const px=WL+WW*(n/40)+Math.sin(n*7)*6*k,h=(8+Math.sin(n*3.1)*5)*k*a*(1+Math.sin(n)*.3);x.beginPath();x.arc(px,shore+2*k-h,(1.5+Math.abs(Math.sin(n*5)))*k,0,7);x.fill()}
     x.globalAlpha=a*.35;x.fillRect(0,shore-2*k,W,(4+a*10)*k);x.restore()}},
   musician:{when:'dusk',dur:60,layer:'beach',draw(p,st,et){const cx=WL+WW*.8,cy=shore+26*k,sc=k*1.4;x.globalAlpha=fade(p,.06,.06);seatBack(cx,cy,sc,'#7a4a8a','#2a1c14',Math.sin(et*2)*.05);
     x.fillStyle=sil('#c98a4a');x.save();x.translate(cx+5*sc,cy-9*sc);x.rotate(-.6);x.beginPath();x.ellipse(0,0,4*sc,3*sc,0,0,7);x.fill();x.fillRect(-1*sc,-14*sc,2*sc,12*sc);x.restore();
     if(Math.floor(et*1.2)%2===0){const q=(et*1.2)%1;x.globalAlpha=(1-q)*.9;x.fillStyle='#ffe7a8';x.font=`${10*k}px sans-serif`;x.fillText(['♪','♫','♬'][Math.floor(et)%3],cx+10*sc+q*8*k,cy-26*sc-q*18*k)}x.globalAlpha=1}},
   photographer:{when:'dusk',dur:30,layer:'beach',draw(p,st,et){const cx=WL+WW*.64,cy=shore+26*k,sc=k*1.3;x.globalAlpha=fade(p,.08,.08);evShad(cx,cy,7*sc);human(cx,cy,sc,0,'#4a6a8a','#e9bf98',false,-1);
     x.fillStyle='#222';x.fillRect(cx-7*sc,cy-30*sc,5*sc,3.6*sc);x.fillStyle='#555';x.beginPath();x.arc(cx-7.5*sc,cy-28.2*sc,1.2*sc,0,7);x.fill();if(Math.sin(et*.9)>.97){x.save();x.globalCompositeOperation='lighter';glow(cx-8*sc,cy-28*sc,30*sc,'rgba(255,255,255,.8)');x.restore()}x.globalAlpha=1}},
   toro:{when:'night',dur:60,layer:'sea',draw(p,st,et){st.l??=Array.from({length:9},()=>({x:WL+WW*(.1+Math.random()*.8),f:.45+Math.random()*.45,ph:Math.random()*6}));const a=fade(p,.1,.15);x.save();x.globalCompositeOperation='lighter';
     for(const l of st.l){const lx=l.x+Math.sin(et*.2+l.ph)*10*k+p*30*k,ly=seaY(l.f)+Math.sin(et+l.ph)*1.2*k,sc=k*(.5+l.f*.6);glow(lx,ly-2*sc,14*sc,`rgba(255,180,90,${.35*a})`);x.fillStyle=`rgba(255,220,150,${.9*a})`;x.fillRect(lx-3*sc,ly-6*sc,6*sc,6*sc);x.fillStyle=`rgba(255,200,120,${.25*a})`;x.fillRect(lx-.6*sc,ly,1.2*sc,10*sc)}x.restore()}},
   oldcouple:{when:'morning',dur:30,layer:'beach',draw(p,st,et){const gy=shore+14*k,hx=lerp(W+30*k,-40*k,p);x.globalAlpha=fade(p,.05,.05);evShad(hx,gy,8*k);human(hx,gy,.95*k,et*4,'#8a7a6a','#e9bf98',false,-1,{hair:'#cfcfcf',pants:'#6a5a4a'});human(hx+11*k,gy,.9*k,et*4+1,'#b06a7a','#e9bf98',false,-1,{hair:'#d8d8d8',long:true});
     x.strokeStyle='#e9bf98';x.lineWidth=1.3*k;x.beginPath();x.moveTo(hx+3*k,gy-14*k);x.lineTo(hx+8*k,gy-14*k);x.stroke();x.globalAlpha=1}},
   yoga:{when:'morning',dur:50,layer:'beach',draw(p,st,et){const cx=WL+WW*.75,cy=WT+WH*.9,sc=k*1.1,ph=Math.floor(et/6)%3;x.globalAlpha=fade(p,.06,.06);x.fillStyle='#8e6ad8';x.fillRect(cx-16*sc,cy-1*sc,32*sc,3*sc);x.strokeStyle=sil('#2a8a8a');x.lineWidth=3*sc;x.lineCap='round';x.fillStyle=sil('#e9bf98');
     if(ph===0){x.beginPath();x.moveTo(cx,cy);x.lineTo(cx,cy-16*sc);x.moveTo(cx,cy-14*sc);x.lineTo(cx-6*sc,cy-28*sc);x.moveTo(cx,cy-14*sc);x.lineTo(cx+6*sc,cy-28*sc);x.stroke();x.beginPath();x.arc(cx,cy-20*sc,3.4*sc,0,7);x.fill()}
     else if(ph===1){x.beginPath();x.moveTo(cx-10*sc,cy);x.lineTo(cx,cy-14*sc);x.lineTo(cx+10*sc,cy);x.moveTo(cx,cy-14*sc);x.lineTo(cx+9*sc,cy-6*sc);x.stroke();x.beginPath();x.arc(cx+10*sc,cy-4*sc,3.2*sc,0,7);x.fill()}
     else{x.beginPath();x.moveTo(cx,cy);x.lineTo(cx,cy-16*sc);x.moveTo(cx,cy-9*sc);x.lineTo(cx+7*sc,cy-6*sc);x.moveTo(cx,cy-15*sc);x.lineTo(cx-10*sc,cy-15*sc);x.moveTo(cx,cy-15*sc);x.lineTo(cx+10*sc,cy-15*sc);x.stroke();x.beginPath();x.arc(cx,cy-20*sc,3.4*sc,0,7);x.fill()}x.globalAlpha=1}},
   swimmer:{when:'noon',dur:30,layer:'sea',draw(p,st,et){const sx=lerp(WL+WW*.2,WL+WW*.85,p),sy=seaY(.6),sc=k;x.globalAlpha=fade(p,.06,.06);x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(sx-6*sc,sy+1*sc,10*sc,2*sc,0,0,7);x.fill();
     x.fillStyle='#e9bf98';x.beginPath();x.arc(sx,sy-2*sc,3*sc,0,7);x.fill();x.fillStyle='#ff5c5c';x.beginPath();x.arc(sx,sy-3*sc,3.1*sc,Math.PI,0);x.fill();const ar=Math.sin(et*5);x.strokeStyle='#e9bf98';x.lineWidth=1.8*sc;x.lineCap='round';x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+Math.cos(ar*2)*8*sc,sy-Math.abs(Math.sin(ar*2))*7*sc);x.stroke();x.globalAlpha=1}},
   sup:{when:'day',dur:45,layer:'sea',draw(p,st,et){const sx=lerp(W+30*k,-30*k,p),sy=seaY(.4)+Math.sin(et*1.5)*k,sc=k*.85;x.globalAlpha=fade(p,.05,.05);x.fillStyle='#ffd23f';x.beginPath();x.ellipse(sx,sy,14*sc,2*sc,0,0,7);x.fill();human(sx,sy-1*sc,sc,0,'#3ea0ff','#e9bf98',false,-1);
     const pa=Math.sin(et*1.6);x.strokeStyle='#333';x.lineWidth=1.2*sc;x.beginPath();x.moveTo(sx-2*sc+pa*4*sc,sy-24*sc);x.lineTo(sx-8*sc+pa*8*sc,sy+2*sc);x.stroke();x.globalAlpha=1}}
  };
  Object.assign(AMB,{
   fireflies:{when:'night',dur:60,layer:'front',draw(p,st,et){st.f??=Array.from({length:14},()=>({x:WL+WW*(.05+Math.random()*.4),y:shore+(10+Math.random()*60)*k,ph:Math.random()*6,sp:.3+Math.random()*.5}));const a=fade(p,.1,.15);x.save();x.globalCompositeOperation='lighter';
     for(const f of st.f){const fx=f.x+Math.sin(et*f.sp+f.ph)*22*k,fy=f.y+Math.cos(et*f.sp*.8+f.ph)*12*k,b=(Math.sin(et*2+f.ph*3)+1)/2;glow(fx,fy,7*k,`rgba(200,255,120,${.55*a*b})`);x.fillStyle=`rgba(240,255,190,${a*b})`;x.beginPath();x.arc(fx,fy,1.3*k,0,7);x.fill()}x.restore()}},
   moonroad:{when:'night',dur:50,layer:'sea',draw(p,st,et){const a=fade(p,.2,.25),mx=(typeof moonX==='number'&&moonX)?moonX:WL+WW*.6;x.save();x.globalCompositeOperation='lighter';
     for(let n=0;n<26;n++){const f=n/26,yy=lerp(hz+2*k,shore-4*k,f),w=(4+f*28)*k*(.6+.4*Math.sin(et*1.3+n*1.7)),xx=mx+Math.sin(et*.8+n*2.1)*6*k*f;x.fillStyle=`rgba(255,248,215,${.28*a*(1-f*.4)*(.5+.5*Math.sin(et*2+n))})`;x.fillRect(xx-w/2,yy,w,1.4*k)}x.restore()}},
   shells:{when:'morning',dur:40,layer:'beach',draw(p,st,et){const gy=shore+20*k,hx=lerp(-30*k,W*.75,Math.min(1,p*1.3)),stoop=Math.sin(et*.9)>.5;x.globalAlpha=fade(p,.05,.08);evShad(hx,gy,8*k);human(hx,gy+(stoop?2*k:0),k*.95,stoop?0:et*3,'#f2a6c0','#e9bf98',false);
     x.fillStyle=sil('#d9b48a');x.fillRect(hx+5*k,gy-12*k,6*k,5*k);if(stoop){x.fillStyle='#fff3e6';x.beginPath();x.arc(hx+10*k,gy-1*k,1.6*k,0,7);x.fill()}x.globalAlpha=1}},
   reader:{when:'noon',dur:70,layer:'beach',draw(p,st,et){const cx=WL+WW*.6,cy=shore+30*k,sc=k*1.1;x.globalAlpha=fade(p,.05,.05);x.fillStyle='rgba(0,0,0,.15)';x.beginPath();x.ellipse(cx,cy+2*sc,24*sc,4*sc,0,0,7);x.fill();
     x.strokeStyle='#bbb';x.lineWidth=1.2*sc;x.beginPath();x.moveTo(cx+10*sc,cy+2*sc);x.lineTo(cx+4*sc,cy-36*sc);x.stroke();x.fillStyle='#55e0b4';x.beginPath();x.moveTo(cx-18*sc,cy-30*sc);x.quadraticCurveTo(cx+4*sc,cy-48*sc,cx+26*sc,cy-30*sc);x.closePath();x.fill();
     seatBack(cx-4*sc,cy,sc*.9,'#f2c14e','#3a2a1a',0);const pg=Math.sin(et*.25)>.92;x.fillStyle=pg?'#fff':'#f4efe2';x.fillRect(cx-9*sc,cy-17*sc,8*sc,6*sc);x.strokeStyle='#999';x.lineWidth=.5;x.beginPath();x.moveTo(cx-5*sc,cy-17*sc);x.lineTo(cx-5*sc,cy-11*sc);x.stroke();x.globalAlpha=1}},
   sleepcat:{when:'night',dur:70,layer:'beach',draw(p,st,et){const[fx,fy]=fireP(),cx=fx-40*k,cy=fy+12*k,sc=k*1.35,br=1+Math.sin(et*1.4)*.05;x.globalAlpha=fade(p,.06,.06);x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(cx,cy+2*sc,12*sc,2.6*sc,0,0,7);x.fill();
     x.fillStyle=shadeF(cx,cy-4*sc,10*sc,'#d98a3a');x.beginPath();x.ellipse(cx,cy-4*sc,10*sc*br,5.5*sc*br,0,0,7);x.fill();x.beginPath();x.arc(cx-8*sc,cy-5*sc,4*sc,0,7);x.fill();x.beginPath();x.moveTo(cx-11*sc,cy-8*sc);x.lineTo(cx-10*sc,cy-12*sc);x.lineTo(cx-8*sc,cy-8.5*sc);x.moveTo(cx-7*sc,cy-8.5*sc);x.lineTo(cx-5.5*sc,cy-12*sc);x.lineTo(cx-4.5*sc,cy-7.5*sc);x.fill();
     x.strokeStyle='#b06a28';x.lineWidth=2.4*sc;x.lineCap='round';x.beginPath();x.moveTo(cx+9*sc,cy-3*sc);x.quadraticCurveTo(cx+12*sc,cy+2*sc,cx+2*sc,cy+1*sc);x.stroke();
     const q=(et*.5)%1;x.globalAlpha=fade(p,.06,.06)*(1-q);x.fillStyle='#e9e4ff';x.font=`${(7+q*4)*k}px sans-serif`;x.fillText('z',cx-6*sc+q*8*k,cy-14*sc-q*16*k);x.globalAlpha=1}},
   bubbles:{when:'day',dur:40,layer:'beach',draw(p,st,et){const cx=WL+WW*.66,gy=shore+22*k;x.globalAlpha=fade(p,.05,.05);evShad(cx,gy,6*k);human(cx,gy,.75*k,0,'#ffd23f','#e9bf98',false,-1);st.b??=[];if(Math.random()<.06&&p<.85)st.b.push({x:cx-8*k,y:gy-20*k,r:(2+Math.random()*4)*k,vx:-(0.3+Math.random()*.6),vy:-(0.2+Math.random()*.4),t:0});
     for(const b of st.b){b.t+=.016;b.x+=b.vx*k;b.y+=b.vy*k+Math.sin(b.t*3)*.2*k;x.globalAlpha=Math.max(0,1-b.t/5)*.8;x.strokeStyle=`hsla(${(b.t*90+b.x)%360},80%,80%,.9)`;x.lineWidth=.8;x.beginPath();x.arc(b.x,b.y,b.r,0,7);x.stroke();x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.arc(b.x-b.r*.35,b.y-b.r*.35,b.r*.2,0,7);x.fill()}st.b=st.b.filter(b=>b.t<5);x.globalAlpha=1}},
   petals:{when:null,dur:30,layer:'front',draw(p,st,et){st.l??=Array.from({length:12},()=>({x:Math.random()*W,y:-20-Math.random()*H*.3,s:.5+Math.random(),ph:Math.random()*6}));const a=fade(p,.1,.15),day=dark<.5;
     for(const l of st.l){l.y+=(.25+l.s*.25)*k;l.x+=(Math.sin(et+l.ph)*.5-.35)*k;if(l.y>H)l.y=-10;x.save();x.translate(l.x,l.y);x.rotate(et*l.s+l.ph);x.globalAlpha=a*.8;x.fillStyle=day?'#ffc7d9':'#f0e6ff';x.beginPath();x.ellipse(0,0,3*k*l.s,1.6*k*l.s,0,0,7);x.fill();x.restore()}}},
   footprints:{when:null,dur:40,layer:'beach',draw(p,st,et){const gy=shore+30*k,n=Math.floor(Math.min(1,p*1.6)*14),erase=p>.75?(p-.75)/.25:0;x.fillStyle=`rgba(90,60,30,${.22*(1-erase)})`;
     for(let i=0;i<n;i++){const fx=WL+WW*(.15+i*.05),fy=gy+(i%2?3:-3)*k+Math.sin(i*.7)*4*k;x.beginPath();x.ellipse(fx,fy,2.2*k,1.1*k,.1,0,7);x.fill()}}},
   paperboat:{when:'day',dur:45,layer:'sea',draw(p,st,et){const bx=lerp(WL+WW*.15,WL+WW*.9,p),by=seaY(.82)+Math.sin(et*1.8)*1.5*k,r=Math.sin(et*1.4)*.12,sc=k*1.1;x.globalAlpha=fade(p,.06,.06);x.save();x.translate(bx,by);x.rotate(r);
     x.fillStyle='#fdfcf6';x.beginPath();x.moveTo(-9*sc,0);x.lineTo(9*sc,0);x.lineTo(6*sc,3*sc);x.lineTo(-6*sc,3*sc);x.fill();x.fillStyle='#e8e4d8';x.beginPath();x.moveTo(-5*sc,0);x.lineTo(0,-8*sc);x.lineTo(5*sc,0);x.fill();x.restore();x.globalAlpha=1}},
   heron:{when:'morning',dur:60,layer:'beach',draw(p,st,et){const cx=WL+WW*.78,cy=shore+4*k,sc=k*1.2,peck=Math.sin(et*.5)>.9;x.globalAlpha=fade(p,.06,.06);x.strokeStyle=sil('#d8d0c0');x.lineWidth=1*sc;x.beginPath();x.moveTo(cx-1*sc,cy);x.lineTo(cx,cy-12*sc);x.moveTo(cx+2*sc,cy);x.lineTo(cx+1*sc,cy-12*sc);x.stroke();
     x.fillStyle=sil('#f4f4f4');x.beginPath();x.ellipse(cx+1*sc,cy-16*sc,6*sc,3.6*sc,-.3,0,7);x.fill();x.strokeStyle=sil('#f4f4f4');x.lineWidth=1.8*sc;x.beginPath();x.moveTo(cx-3*sc,cy-18*sc);if(peck)x.quadraticCurveTo(cx-7*sc,cy-16*sc,cx-9*sc,cy-6*sc);else x.quadraticCurveTo(cx-6*sc,cy-24*sc,cx-4*sc,cy-28*sc);x.stroke();
     x.strokeStyle='#e0b040';x.lineWidth=1*sc;x.beginPath();if(peck){x.moveTo(cx-9*sc,cy-6*sc);x.lineTo(cx-10*sc,cy-1*sc)}else{x.moveTo(cx-4*sc,cy-28*sc);x.lineTo(cx-10*sc,cy-27*sc)}x.stroke();x.globalAlpha=1}},
   pinksky:{when:'dusk',dur:60,layer:'sky',draw(p){const a=fade(p,.25,.3)*.28;const g=x.createLinearGradient(0,0,0,hz);g.addColorStop(0,'rgba(255,150,200,0)');g.addColorStop(.6,`rgba(255,150,190,${a})`);g.addColorStop(1,`rgba(255,190,140,${a*1.3})`);x.fillStyle=g;x.fillRect(0,0,W,hz)}},
   chime:{when:null,dur:20,layer:'beach',draw(p,st,et){if(!st.n)st.n=0;if(et>st.n*2.6&&st.n<6){st.n++;try{tone([1568,2093,1760,2349,1976][Math.random()*5|0],1.6,'sine',.012)}catch(e){}}}},
   lanternwalk:{when:'night',dur:36,layer:'beach',draw(p,st,et){const gy=shore+16*k,hx=lerp(W+30*k,-40*k,p);x.globalAlpha=fade(p,.05,.05);evShad(hx,gy,7*k);human(hx,gy,.95*k,et*4,'#6a5a8a','#e9bf98',false,-1);
     const lx=hx-8*k,ly=gy-12*k+Math.sin(et*4)*1*k;x.save();x.globalCompositeOperation='lighter';glow(lx,ly,26*k,'rgba(255,190,100,.35)');x.restore();x.fillStyle='#ffe2a0';x.fillRect(lx-2*k,ly-3*k,4*k,5*k);x.globalAlpha=1}},
  });
  Object.assign(AMB,{
   // ---- 明るい時間：アクティブ ----
   volley:{when:'day',dur:40,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),gy=shore+22*k,ax=WL+WW*.36,bx=WL+WW*.66,cyc=(et*.55)%2,dirR=cyc<1,u=dirR?cyc:cyc-1,f=dirR?u:1-u;x.globalAlpha=a;
     const bxp=lerp(ax+6*k,bx-6*k,f),byp=gy-22*k-Math.sin(u*Math.PI)*34*k;
     const jA=(!dirR&&u>.85)||(dirR&&u<.12),jB=(dirR&&u>.85)||(!dirR&&u<.12);evShad(ax,gy,6*k);evShad(bx,gy,6*k);
     human(ax,gy-(jA?5*k:0),.85*k,jA?1:0,'#ff5c8a','#f1c7a0',jA,1);human(bx,gy-(jB?5*k:0),.85*k,jB?1:0,'#3ea0ff','#e9bf98',jB,-1);
     x.fillStyle=sil('#ffffff');x.beginPath();x.arc(bxp,byp,2.6*k,0,7);x.fill();x.strokeStyle=sil('#ffd23f');x.lineWidth=.8*k;x.beginPath();x.arc(bxp,byp,2.6*k,.5,2.2);x.stroke();
     x.fillStyle='rgba(0,0,0,.12)';x.beginPath();x.ellipse(bxp,gy+1*k,2.4*k,.8*k,0,0,7);x.fill();x.globalAlpha=1}},
   frisbee:{when:'day',dur:32,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),gy=shore+16*k,px0=WL+WW*.3;x.globalAlpha=a;evShad(px0,gy,6*k);human(px0,gy,.85*k,0,'#55e0b4','#e9bf98',false,1);
     const cyc=(et*.4)%1,dx=lerp(px0+8*k,WL+WW*.82,cyc),dy=gy-24*k-Math.sin(cyc*Math.PI)*12*k,dogx=lerp(px0+20*k,WL+WW*.8,Math.min(1,cyc*1.08)),dogy=gy+2*k-Math.abs(Math.sin(et*9))*2*k;
     x.fillStyle=sil('#ff9a3c');x.beginPath();x.ellipse(dx,dy,4*k,1.3*k,Math.sin(et*3)*.2,0,7);x.fill();
     x.fillStyle=sil('#d9a066');x.beginPath();x.ellipse(dogx,dogy-5*k,6*k,3*k,0,0,7);x.fill();x.beginPath();x.arc(dogx+5*k,dogy-8*k,2.6*k,0,7);x.fill();x.strokeStyle=sil('#d9a066');x.lineWidth=1.4*k;x.beginPath();x.moveTo(dogx-4*k,dogy-3*k);x.lineTo(dogx-5*k,dogy+1*k);x.moveTo(dogx+3*k,dogy-3*k);x.lineTo(dogx+4*k,dogy+1*k);x.moveTo(dogx-6*k,dogy-6*k);x.lineTo(dogx-9*k,dogy-9*k+Math.sin(et*14)*1.5*k);x.stroke();x.globalAlpha=1}},
   splash:{when:'noon',dur:30,layer:'beach',draw(p,st,et){const a=fade(p,.05,.08);st.d??=[];x.globalAlpha=a;[[.42,'#ffd23f',0],[.5,'#ff5c8a',1.7],[.58,'#7aa2ff',3.1]].forEach(([fx,c,ph])=>{const hx=WL+WW*fx+Math.sin(et*.8+ph)*10*k,gy=shore+2*k;human(hx,gy+Math.abs(Math.sin(et*4+ph))*-3*k,.7*k,et*9+ph,c,'#f1c7a0',true,Math.sin(et*.8+ph)>0?1:-1);
       if(Math.random()<.25)st.d.push({x:hx+(Math.random()-.5)*8*k,y:gy-2*k,vx:(Math.random()-.5)*1.2*k,vy:-(1+Math.random()*1.6)*k,l:1})});
     x.fillStyle='rgba(220,240,255,.9)';for(const d of st.d){d.x+=d.vx;d.y+=d.vy;d.vy+=.12*k;d.l-=.03;x.globalAlpha=a*Math.max(0,d.l);x.beginPath();x.arc(d.x,d.y,1*k,0,7);x.fill()}st.d=st.d.filter(d=>d.l>0);x.globalAlpha=1}},
   joggers:{when:'morning',dur:18,layer:'beach',draw(p,st,et){const gy=shore+12*k;x.globalAlpha=fade(p,.04,.04);[['#ff5c8a',0],['#55e0b4',14],['#ffd23f',30]].forEach(([c,o],n)=>{const hx=lerp(-40*k,W+60*k,p)-o*k;evShad(hx,gy,5*k);human(hx,gy,.85*k,et*11+n,c,'#e9bf98',true,1)});x.globalAlpha=1}},
   snorkel:{when:'noon',dur:40,layer:'sea',draw(p,st,et){const a=fade(p,.06,.06),sx=lerp(WL+WW*.2,WL+WW*.75,p),sy=seaY(.55)+Math.sin(et*1.2)*1*k;x.globalAlpha=a;x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.ellipse(sx,sy+1*k,7*k,1.4*k,0,0,7);x.fill();
     x.fillStyle=sil('#e9bf98');x.beginPath();x.arc(sx,sy-1*k,2.4*k,Math.PI,0);x.fill();x.fillStyle='#3ea0ff';x.fillRect(sx-2.6*k,sy-2.2*k,5.2*k,1.3*k);x.strokeStyle='#ffd23f';x.lineWidth=1.1*k;x.beginPath();x.moveTo(sx+2*k,sy-1.5*k);x.lineTo(sx+2.4*k,sy-7*k);x.stroke();
     if(Math.sin(et*2)>.6){x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=.6;x.beginPath();x.arc(sx+2.4*k,sy-9*k-((et*2)%1)*4*k,1*k,0,7);x.stroke()}x.globalAlpha=1}},
   // ---- 夕方：ロマンチック ----
   handhold:{when:'eve',dur:46,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),gy=shore+6*k,hx=lerp(W+30*k,-50*k,p);x.globalAlpha=a;evShad(hx,gy,9*k);human(hx,gy,.92*k,et*3.6,'#f2f2f2','#e9bf98',false,-1,{hair:'#3a2a1a'});human(hx+9*k,gy,.86*k,et*3.6+1,'#ff9ec4','#f1c7a0',false,-1,{hair:'#6a3a1a',pants:'#f2e6d8'});
     x.strokeStyle=sil('#f1c7a0');x.lineWidth=1.6*k;x.beginPath();x.moveTo(hx+2*k,gy-12*k);x.lineTo(hx+7*k,gy-12*k);x.stroke();
     if(Math.sin(et*.7)>.8){const q=(et*.7)%1;x.globalAlpha=a*(1-q);x.fillStyle='#ff7a9a';x.font=`${9*k}px sans-serif`;x.textAlign='center';x.fillText('♥',hx+4*k,gy-34*k-q*12*k)}x.globalAlpha=1}},
   proposal:{when:'eve',dur:40,layer:'beach',draw(p,st,et){const a=fade(p,.06,.06),gy=shore+20*k,cx=WL+WW*.62;x.globalAlpha=a;evShad(cx,gy,7*k);evShad(cx+12*k,gy,6*k);
     human(cx+12*k,gy,.86*k,0,'#ffffff','#f1c7a0',false,-1,{hair:'#3a2010',pants:'#f2e6d8'});
     const kneel=p>.25;if(kneel){x.save();x.translate(cx,gy);x.scale(1,.78);human(0,0,.9*k,0,'#2c3e66','#e9bf98',false,1,{hair:'#2a1a10'});x.restore()}else human(cx,gy,.9*k,et*3,'#2c3e66','#e9bf98',false,1,{hair:'#2a1a10'});
     if(kneel){const rx=cx+5*k,ry=gy-14*k;x.save();x.globalCompositeOperation='lighter';glow(rx,ry,8*k*(1+.3*Math.sin(et*6)),'rgba(255,255,220,.6)');x.restore();x.fillStyle='#fff';x.beginPath();x.arc(rx,ry,1*k,0,7);x.fill()}
     if(p>.6){st.h??=[];if(Math.random()<.2)st.h.push({x:cx+6*k+(Math.random()-.5)*16*k,y:gy-30*k,l:1});x.fillStyle='#ff7a9a';x.font=`${8*k}px sans-serif`;x.textAlign='center';for(const h of st.h){h.y-=.35*k;h.l-=.012;x.globalAlpha=a*Math.max(0,h.l);x.fillText('♥',h.x,h.y)}st.h=st.h.filter(h=>h.l>0)}x.globalAlpha=1}},
   sandheart:{when:'eve',dur:44,layer:'beach',draw(p,st,et){const a=fade(p,.05,.08),cx=WL+WW*.55,cy=shore+26*k,pr=Math.min(1,p*1.4),r=9*k;x.globalAlpha=a;
     x.strokeStyle='rgba(120,80,50,.45)';x.lineWidth=1.4*k;x.beginPath();for(let i=0;i<=pr*60;i++){const th=i/60*Math.PI*2,hx=16*Math.pow(Math.sin(th),3),hy=-(13*Math.cos(th)-5*Math.cos(2*th)-2*Math.cos(3*th)-Math.cos(4*th));const X=cx+hx*r/16,Y=cy+hy*r/16*.45;i?x.lineTo(X,Y):x.moveTo(X,Y)}x.stroke();
     const th=pr*Math.PI*2,px1=cx+16*Math.pow(Math.sin(th),3)*r/16;evShad(px1-6*k,cy-2*k,5*k);x.save();x.translate(px1-6*k,cy-2*k);x.scale(1,.75);human(0,0,.8*k,0,'#ffd1a8','#f1c7a0',false,1,{hair:'#5a3a1a'});x.restore();
     evShad(cx-20*k,cy-4*k,5*k);human(cx-20*k,cy-4*k,.86*k,0,'#5a7fa0','#e9bf98',false,1);x.globalAlpha=1}},
   dance:{when:'eve',dur:40,layer:'beach',draw(p,st,et){const a=fade(p,.06,.06),gy=shore+14*k,cx=WL+WW*.7+Math.sin(et*.4)*8*k,sw=Math.sin(et*1.6)*.12;x.globalAlpha=a;evShad(cx,gy,9*k);
     x.save();x.translate(cx,gy);x.rotate(sw);human(-3*k,0,.9*k,0,'#2c3e66','#e9bf98',false,1,{hair:'#2a1a10'});human(4*k,0,.86*k,0,'#ff7a9a','#f1c7a0',false,-1,{hair:'#3a2010',pants:'#ff7a9a'});x.restore();
     if(Math.floor(et*1.3)%2===0){const q=(et*1.3)%1;x.globalAlpha=a*(1-q);x.fillStyle='#ffe7a8';x.font=`${9*k}px sans-serif`;x.fillText(['♪','♫','♬'][Math.floor(et)%3],cx+12*k+q*6*k,gy-34*k-q*14*k)}x.globalAlpha=1}},
   // ---- 夜：花火 ----
   sparklers:{when:'night',dur:46,layer:'beach',draw(p,st,et){const a=fade(p,.06,.08);st.s??=[];x.globalAlpha=a;const P=[[.46,'#ff9ec4',0],[.56,'#7aa2ff',1.3],[.65,'#ffd23f',2.6]];
     P.forEach(([fx,c,ph],n)=>{const hx=WL+WW*fx,gy=shore+24*k;evShad(hx,gy,5*k);human(hx,gy,.82*k,0,c,'#e9bf98',false,n%2?-1:1);const tx=hx+(n%2?-5:5)*k+Math.sin(et*2+ph)*3*k,ty=gy-26*k+Math.cos(et*2.4+ph)*3*k;
       x.strokeStyle='#777';x.lineWidth=.6;x.beginPath();x.moveTo(hx+(n%2?-2:2)*k,gy-13*k);x.lineTo(tx,ty);x.stroke();for(let i=0;i<3;i++)st.s.push({x:tx,y:ty,vx:(Math.random()-.5)*2.4*k,vy:(Math.random()-.7)*2.2*k,l:1,c:['#fff6c9','#ffd23f','#ffb3d0'][i]});
       x.save();x.globalCompositeOperation='lighter';glow(tx,ty,14*k,'rgba(255,220,140,.5)');x.restore()});
     x.save();x.globalCompositeOperation='lighter';for(const s of st.s){s.x+=s.vx;s.y+=s.vy;s.vy+=.06*k;s.l-=.06;x.globalAlpha=a*Math.max(0,s.l);x.fillStyle=s.c;x.fillRect(s.x,s.y,1.2*k,1.2*k)}x.restore();st.s=st.s.filter(s=>s.l>0);x.globalAlpha=1}},
   senko:{when:'night',dur:40,layer:'beach',draw(p,st,et){const a=fade(p,.06,.08),gy=shore+28*k,cx=WL+WW*.6;x.globalAlpha=a;st.s??=[];
     [[cx-8*k,'#5a7fa0',1],[cx+8*k,'#ff9ec4',-1]].forEach(([hx,c,d])=>{evShad(hx,gy,5*k);x.save();x.translate(hx,gy);x.scale(1,.7);human(0,0,.82*k,0,c,'#e9bf98',false,d);x.restore()});
     const life=p<.85,bx=cx,by=gy-6*k+(p>.85?(p-.85)*40*k:0);x.strokeStyle='#a33';x.lineWidth=.7;x.beginPath();x.moveTo(cx-3*k,gy-12*k);x.lineTo(bx,by-1*k);x.stroke();
     x.save();x.globalCompositeOperation='lighter';glow(bx,by,(life?8:3)*k,'rgba(255,140,60,.6)');x.fillStyle='#ffb347';x.beginPath();x.arc(bx,by,1.6*k,0,7);x.fill();
     if(life&&p>.15)for(let i=0;i<2;i++)st.s.push({x:bx,y:by,a:Math.random()*Math.PI*2,r:0,v:(1+Math.random()*2)*k,l:1});
     x.strokeStyle='rgba(255,200,120,.9)';x.lineWidth=.5;for(const s of st.s){s.r+=s.v;s.l-=.08;x.globalAlpha=a*Math.max(0,s.l);x.beginPath();x.moveTo(s.x+Math.cos(s.a)*s.r*.4,s.y+Math.sin(s.a)*s.r*.4);x.lineTo(s.x+Math.cos(s.a)*s.r,s.y+Math.sin(s.a)*s.r);x.stroke()}x.restore();st.s=st.s.filter(s=>s.l>0);x.globalAlpha=1}},
   rocketfw:{when:'night',dur:36,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),gy=shore+22*k,cx=WL+WW*.5;x.globalAlpha=a;st.r??=[];st.b??=[];st.n??=0;
     [[cx-14*k,'#55e0b4',1],[cx+14*k,'#ff9a3c',-1],[cx+24*k,'#7aa2ff',-1]].forEach(([hx,c,d])=>{evShad(hx,gy,5*k);human(hx,gy,.82*k,0,c,'#e9bf98',false,d)});
     if(et>st.n*5+2&&p<.85){st.n++;st.r.push({x:cx,y:gy,vy:-4.2*k,c:pick(['#ff5c8a','#ffd23f','#55e0b4','#7aa2ff','#ffffff'])});try{if(S.sound)noise(.4,{v:.015,f:2500,f2:600,q:.5})}catch(e){}}
     x.save();x.globalCompositeOperation='lighter';for(const r of st.r){r.y+=r.vy;r.vy+=.05*k;x.fillStyle='#ffe7a8';x.fillRect(r.x-.6,r.y,1.2,3*k);if(r.vy>-1*k&&!r.done){r.done=1;for(let i=0;i<36;i++){const an=i/36*Math.PI*2;st.b.push({x:r.x,y:r.y,vx:Math.cos(an)*1.6*k,vy:Math.sin(an)*1.6*k,l:1,c:r.c})}try{if(S.sound)tone(90,.4,'sine',.04,0,50)}catch(e){}}}
     st.r=st.r.filter(r=>!r.done);for(const b of st.b){b.x+=b.vx;b.y+=b.vy;b.vx*=.97;b.vy=b.vy*.97+.03*k;b.l-=.018;x.globalAlpha=a*Math.max(0,b.l);x.fillStyle=b.c;x.fillRect(b.x,b.y,1.5*k,1.5*k)}st.b=st.b.filter(b=>b.l>0);x.restore();x.globalAlpha=1}},
  });
  Object.assign(AMB,{
   castlekids:{when:'noon',dur:50,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),gy=shore+30*k,cx=WL+WW*.56,g=Math.min(1,p*1.5);x.globalAlpha=a;
     x.fillStyle=sil('#d9bf8c');x.beginPath();x.moveTo(cx-12*k,gy);x.lineTo(cx-10*k,gy-8*k*g);x.lineTo(cx+10*k,gy-8*k*g);x.lineTo(cx+12*k,gy);x.fill();if(g>.5){x.fillRect(cx-4*k,gy-15*k*g,8*k,7*k*g);x.fillStyle='#ff5c5c';x.fillRect(cx,gy-21*k*g,.6*k,6*k);x.beginPath();x.moveTo(cx+.6*k,gy-21*k*g);x.lineTo(cx+4*k,gy-19.5*k*g);x.lineTo(cx+.6*k,gy-18*k*g);x.fill()}
     [[cx-18*k,'#ffd23f',1],[cx+18*k,'#7aa2ff',-1]].forEach(([hx,c,d])=>{x.save();x.translate(hx,gy);x.scale(1,.72);human(0,0,.7*k,0,c,'#f1c7a0',false,d);x.restore()});x.fillStyle='#ff9a3c';x.fillRect(cx+20*k,gy-4*k,4*k,4*k);x.globalAlpha=1}},
   nap:{when:'noon',dur:70,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),cx=WL+WW*.62,cy=shore+34*k,sc=k;x.globalAlpha=a;x.fillStyle='#55e0b4';x.fillRect(cx-18*sc,cy-2*sc,36*sc,5*sc);
     x.fillStyle='#e9bf98';x.beginPath();x.ellipse(cx,cy-2*sc,12*sc,2.6*sc,0,0,7);x.fill();x.fillStyle='#ff5c8a';x.fillRect(cx-4*sc,cy-4.5*sc,9*sc,3.2*sc);x.fillStyle='#e9bf98';x.beginPath();x.arc(cx-13*sc,cy-3*sc,3*sc,0,7);x.fill();
     x.fillStyle='#f2c14e';x.beginPath();x.ellipse(cx-13*sc,cy-6*sc,5*sc,1.8*sc,0,0,7);x.fill();const q=(et*.5)%1;x.globalAlpha=a*(1-q);x.fillStyle='#fff';x.font=`${(7+q*4)*k}px sans-serif`;x.fillText('z',cx-10*sc+q*6*k,cy-12*sc-q*14*k);x.globalAlpha=1}},
   surfcarry:{when:'day',dur:24,layer:'beach',draw(p,st,et){const gy=shore+10*k,hx=lerp(W+30*k,-40*k,p);x.globalAlpha=fade(p,.04,.04);evShad(hx,gy,7*k);human(hx,gy,.9*k,et*5,'#2c3e66','#d9a57a',false,-1,{pants:'#2c3e66'});
     x.save();x.translate(hx+3*k,gy-16*k);x.rotate(-.12);x.fillStyle=sil('#ff9a3c');x.beginPath();x.ellipse(0,0,17*k,3*k,0,0,7);x.fill();x.fillStyle='#fff';x.fillRect(-14*k,-.5*k,28*k,1*k);x.restore();x.globalAlpha=1}},
   family:{when:'day',dur:40,layer:'beach',draw(p,st,et){const gy=shore+14*k,hx=lerp(-40*k,W+40*k,p);x.globalAlpha=fade(p,.04,.04);evShad(hx,gy,8*k);human(hx,gy,.95*k,et*3.5,'#5a7fa0','#e9bf98',false,1);
     human(hx,gy-23*k,.55*k,0,'#ffd23f','#f1c7a0',false,1);evShad(hx+12*k,gy,7*k);human(hx+12*k,gy,.88*k,et*3.5+1,'#ff9ec4','#f1c7a0',false,1,{pants:'#fff'});x.globalAlpha=1}},
   selfie:{when:'day',dur:30,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),gy=shore+20*k,cx=WL+WW*.6;x.globalAlpha=a;[[-12,'#ff5c8a'],[0,'#55e0b4'],[12,'#ffd23f']].forEach(([o,c],n)=>{evShad(cx+o*k,gy,5*k);human(cx+o*k,gy-(Math.sin(et*2+n)>.95?3*k:0),.85*k,0,c,'#f1c7a0',false,-1)});
     x.fillStyle='#222';x.fillRect(cx-22*k,gy-30*k,3*k,5*k);if(Math.sin(et*1.1)>.97){x.save();x.globalCompositeOperation='lighter';glow(cx-20*k,gy-28*k,30*k,'rgba(255,255,255,.7)');x.restore()}x.globalAlpha=1}},
   kayak:{when:'day',dur:50,layer:'sea',draw(p,st,et){const sx=lerp(-30*k,W+30*k,p),sy=seaY(.5)+Math.sin(et*1.3)*k,s=k*.8;x.globalAlpha=fade(p,.05,.05);x.fillStyle=sil('#ffd23f');x.beginPath();x.ellipse(sx,sy,16*s,2.6*s,0,0,7);x.fill();
     x.fillStyle=sil('#ff5c5c');x.fillRect(sx-3*s,sy-8*s,6*s,6*s);x.fillStyle=sil('#e9bf98');x.beginPath();x.arc(sx,sy-10.5*s,2.6*s,0,7);x.fill();const pa=Math.sin(et*2.2);x.strokeStyle='#333';x.lineWidth=1*s;x.beginPath();x.moveTo(sx-10*s,sy-6*s+pa*4*s);x.lineTo(sx+10*s,sy-6*s-pa*4*s);x.stroke();x.globalAlpha=1}},
   soccer:{when:'day',dur:30,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),gy=shore+24*k,c=(et*.6)%2,f=c<1?c:2-c,ax=WL+WW*.35,bx=WL+WW*.7,ballx=lerp(ax+6*k,bx-6*k,f),bally=gy-1.5*k-Math.abs(Math.sin(f*Math.PI*3))*4*k;x.globalAlpha=a;
     evShad(ax,gy,5*k);evShad(bx,gy,5*k);human(ax,gy,.72*k,et*6,'#ff5c8a','#f1c7a0',true,1);human(bx,gy,.72*k,et*6+2,'#7aa2ff','#e9bf98',true,-1);x.fillStyle='#fff';x.beginPath();x.arc(ballx,bally,2.2*k,0,7);x.fill();x.fillStyle='#222';x.beginPath();x.arc(ballx,bally,.8*k,0,7);x.fill();x.globalAlpha=1}},
   letter:{when:'eve',dur:44,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),gy=shore+4*k,cx=WL+WW*.48;x.globalAlpha=a;evShad(cx,gy,6*k);human(cx,gy,.88*k,0,'#c9a3ff','#f1c7a0',false,-1,{hair:'#3a2010'});
     const tq=Math.max(0,Math.min(1,(p-.25)/.2));if(p>.25){const bx=lerp(cx-4*k,cx-40*k,tq),by=gy-20*k-Math.sin(tq*Math.PI)*16*k+(tq>=1?14*k+Math.sin(et*1.5)*k:0);x.fillStyle='rgba(180,230,210,.85)';x.save();x.translate(bx-(tq>=1?(p-.45)*40*k:0),by);x.rotate(.6);x.fillRect(-1.5*k,-4*k,3*k,8*k);x.fillStyle='#c9a060';x.fillRect(-1*k,-5.5*k,2*k,1.6*k);x.restore()}x.globalAlpha=1}},
   telescope:{when:'night',dur:60,layer:'beach',draw(p,st,et){const a=fade(p,.06,.06),gy=shore+26*k,cx=WL+WW*.64;x.globalAlpha=a;evShad(cx,gy,6*k);human(cx,gy,.88*k,0,'#4a6a8a','#e9bf98',false,-1);
     x.strokeStyle='#888';x.lineWidth=1*k;x.beginPath();x.moveTo(cx-8*k,gy);x.lineTo(cx-11*k,gy-16*k);x.moveTo(cx-14*k,gy);x.lineTo(cx-11*k,gy-16*k);x.stroke();x.save();x.translate(cx-11*k,gy-17*k);x.rotate(-.7);x.fillStyle='#ddd';x.fillRect(-2*k,-1.6*k,14*k,3.2*k);x.restore();x.globalAlpha=1}},
   glowsticks:{when:'night',dur:36,layer:'beach',draw(p,st,et){const a=fade(p,.06,.06),gy=shore+22*k;x.globalAlpha=a;[[.42,'#7ff0c8',0],[.5,'#ff7ab8',1.2],[.58,'#7aa2ff',2.4],[.66,'#ffe066',3.6]].forEach(([fx,c,ph])=>{const hx=WL+WW*fx,j=Math.abs(Math.sin(et*3+ph))*3*k;evShad(hx,gy,4*k);human(hx,gy-j,.75*k,et*6+ph,'#2a2a3a','#e9bf98',false,1);
       const ang=Math.sin(et*4+ph)*1.2,tx=hx+Math.cos(ang-1.57)*0+Math.sin(ang)*9*k,ty=gy-j-20*k-Math.cos(ang)*6*k;x.save();x.globalCompositeOperation='lighter';x.strokeStyle=c;x.lineWidth=2*k;x.lineCap='round';x.beginPath();x.moveTo(hx+2*k,gy-j-14*k);x.lineTo(tx,ty);x.stroke();glow(tx,ty,10*k,'rgba(255,255,255,.22)');x.restore()});x.globalAlpha=1}},
   minilantern:{when:'night',dur:44,layer:'beach',draw(p,st,et){const a=fade(p,.06,.06),gy=shore+20*k,cx=WL+WW*.58;x.globalAlpha=a;evShad(cx-6*k,gy,5*k);evShad(cx+6*k,gy,5*k);human(cx-6*k,gy,.86*k,0,'#5a7fa0','#e9bf98',false,1);human(cx+6*k,gy,.82*k,0,'#ff9ec4','#f1c7a0',false,-1);
     const up=Math.max(0,(p-.3)/.7),lx=cx+Math.sin(et*.5)*6*k*up,ly=gy-28*k-up*150*k;x.save();x.globalCompositeOperation='lighter';glow(lx,ly,(16-up*8)*k,'rgba(255,170,80,.55)');x.fillStyle='rgba(255,210,140,.95)';x.fillRect(lx-3*k*(1-up*.5),ly-4*k*(1-up*.5),6*k*(1-up*.5),7*k*(1-up*.5));x.restore();x.globalAlpha=1}},
   wishstar:{when:'night',dur:30,layer:'beach',draw(p,st,et){const a=fade(p,.06,.06),gy=shore+18*k,cx=WL+WW*.45;x.globalAlpha=a;evShad(cx,gy,5*k);evShad(cx+10*k,gy,5*k);human(cx,gy,.86*k,0,'#4a6a8a','#e9bf98',false,1);human(cx+10*k,gy,.82*k,0,'#c9a3ff','#f1c7a0',false,1);
     x.strokeStyle=sil('#e9bf98');x.lineWidth=1.6*k;x.beginPath();x.moveTo(cx+2*k,gy-20*k);x.lineTo(cx+8*k,gy-30*k);x.stroke();
     const q=(et*.35)%1;if(q<.35){const u=q/.35,sx=WL+WW*(.8-u*.5),sy=WT+WH*(.08+u*.15);x.save();x.globalCompositeOperation='lighter';const g=x.createLinearGradient(sx,sy,sx+40*k,sy-12*k);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');x.strokeStyle=g;x.lineWidth=1.6*k;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+40*k,sy-12*k);x.stroke();x.restore()}x.globalAlpha=1}},
   taichi:{when:'morning',dur:50,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),gy=shore+18*k;x.globalAlpha=a;[[.52,'#f2f2f2',0],[.6,'#e8d4b8',.6]].forEach(([fx,c,ph])=>{const hx=WL+WW*fx;evShad(hx,gy,5*k);human(hx,gy,.86*k,0,c,'#e9bf98',false,1,{hair:'#cfcfcf',pants:c});
       const an=Math.sin(et*.6+ph);x.strokeStyle=sil(c);x.lineWidth=2*k;x.lineCap='round';x.beginPath();x.moveTo(hx,gy-20*k);x.lineTo(hx+an*9*k,gy-24*k-Math.abs(an)*4*k);x.moveTo(hx,gy-20*k);x.lineTo(hx-an*7*k,gy-17*k);x.stroke()});x.globalAlpha=1}},
   cleanup:{when:'morning',dur:40,layer:'beach',draw(p,st,et){const gy=shore+20*k,hx=lerp(-30*k,W+40*k,p),stoop=Math.sin(et*1.2)>.6;x.globalAlpha=fade(p,.04,.04);evShad(hx,gy,6*k);human(hx,gy+(stoop?2*k:0),.88*k,stoop?0:et*4,'#55e0b4','#e9bf98',false,1,{pants:'#556'});
     x.fillStyle='rgba(240,240,240,.9)';x.beginPath();x.ellipse(hx-6*k,gy-9*k,3.5*k,5*k,0,0,7);x.fill();x.strokeStyle='#888';x.lineWidth=.8*k;x.beginPath();x.moveTo(hx+3*k,gy-14*k);x.lineTo(hx+9*k,gy-(stoop?1:5)*k);x.stroke();x.globalAlpha=1}},
  });
  /* ---- 季節の かざり ---- */
  const SZ={};
  function pumpkin(px,py,sc,lit){x.save();x.translate(px,py);const nt=dark>.45;x.fillStyle='rgba(0,0,0,.2)';x.beginPath();x.ellipse(0,1*sc,9*sc,2*sc,0,0,7);x.fill();
    [[-5,7],[5,7],[0,8.5]].forEach(([o,w])=>{const g=x.createRadialGradient(o*sc-2*sc,-8*sc,1,o*sc,-6*sc,w*sc);g.addColorStop(0,nt?'#e07a2a':'#ffa040');g.addColorStop(1,nt?'#7a3010':'#c8561a');x.fillStyle=g;x.beginPath();x.ellipse(o*sc,-6*sc,w*sc,6.5*sc,0,0,7);x.fill()});
    x.fillStyle='#3a5a1a';x.fillRect(-1*sc,-15*sc,2*sc,4*sc);
    if(lit){const f=.75+.25*Math.sin(t*7+px);x.save();x.globalCompositeOperation='lighter';glow(0,-6*sc,22*sc*f,`rgba(255,150,40,${.35*Math.max(.3,dark)})`);x.restore();x.fillStyle=`rgba(255,${200+40*f|0},90,${.6+.4*dark})`}else x.fillStyle='#3a1a08';
    x.beginPath();x.moveTo(-5*sc,-9*sc);x.lineTo(-2*sc,-9*sc);x.lineTo(-3.5*sc,-11.5*sc);x.fill();x.beginPath();x.moveTo(5*sc,-9*sc);x.lineTo(2*sc,-9*sc);x.lineTo(3.5*sc,-11.5*sc);x.fill();
    x.beginPath();x.moveTo(-5*sc,-5*sc);x.quadraticCurveTo(0,-1*sc,5*sc,-5*sc);x.lineTo(3*sc,-4*sc);x.lineTo(1.5*sc,-5.5*sc);x.lineTo(0,-3.6*sc);x.lineTo(-1.5*sc,-5.5*sc);x.lineTo(-3*sc,-4*sc);x.closePath();x.fill();x.restore()}
  function seasonDraw(layer){const s=curSeason();if(!s||still)return;
    if(s==='halloween'){
      if(layer==='beach'){[[.13,.97,1.1],[.54,.99,.9],[.88,.93,1.25],[.33,.9,.75]].forEach(([fx,fy,sz])=>pumpkin(WL+WW*fx,WT+WH*fy,k*sz,true))}
      if(layer==='sky'&&dark>.3&&(t%60)<22){for(let i=0;i<2;i++){const ph=(t*.045+i*.13)%1,bx=WL-20*k+(WW+40*k)*ph,by=hz-60*k-Math.sin(ph*Math.PI*2+i)*16*k-i*7*k,fl=Math.sin(t*14+i)*4*k;x.fillStyle='rgba(20,10,30,.85)';x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo(bx-5*k,by-fl-2*k,bx-10*k,by-fl);x.quadraticCurveTo(bx-6*k,by+1*k,bx,by+1.5*k);x.quadraticCurveTo(bx+6*k,by+1*k,bx+10*k,by-fl);x.quadraticCurveTo(bx+5*k,by-fl-2*k,bx,by);x.fill()}}
      if(layer==='front'&&dark>.4){const c=(t%40)/40;if(c<.25){const u=c/.25,gx=WL+WW*(.2+u*.5),gy=shore-6*k+Math.sin(t*2)*4*k;x.save();x.globalAlpha=Math.sin(u*Math.PI)*.55;x.fillStyle='#f4f4ff';x.beginPath();x.arc(gx,gy-10*k,6*k,Math.PI,0);x.lineTo(gx+6*k,gy);for(let w=0;w<4;w++)x.quadraticCurveTo(gx+(4.5-w*3)*k,gy+3*k,gx+(3-w*3)*k,gy);x.closePath();x.fill();x.fillStyle='#222';x.fillRect(gx-3*k,gy-11*k,1.4*k,2*k);x.fillRect(gx+1.6*k,gy-11*k,1.4*k,2*k);x.restore()}}}
    else if(s==='xmas'){
      if(layer==='beach'){const tx=WL+WW*.5,ty=WT+WH*.98,sc=k*1.1;x.fillStyle='#5a3a1a';x.fillRect(tx-2*sc,ty-6*sc,4*sc,6*sc);x.fillStyle=dark>.5?'#1a4a2a':'#2f7a3f';[[0,22,-6],[0,17,-16],[0,12,-25]].forEach(([o,w,y])=>{x.beginPath();x.moveTo(tx-w*sc/2*1.2,ty+y*sc);x.lineTo(tx,ty+(y-14)*sc);x.lineTo(tx+w*sc/2*1.2,ty+y*sc);x.fill()});
        const C=['#ff5c5c','#ffd23f','#7aa2ff','#ff9ec4'];x.save();x.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const lx=tx+Math.sin(i*2.3)*(4+i)*sc*.9,ly=ty-8*sc-i*2.5*sc,on=Math.sin(t*3+i)>-.3;if(on)glow(lx,ly,3.5*sc,'rgba(255,230,160,.5)');x.fillStyle=on?C[i%4]:'#555';x.fillRect(lx-1*sc,ly-1*sc,2*sc,2*sc)}glow(tx,ty-40*sc,10*sc,'rgba(255,230,120,.6)');x.restore();x.fillStyle='#ffe066';x.font=`${10*sc}px sans-serif`;x.textAlign='center';x.fillText('★',tx,ty-36*sc)}
      if(layer==='sky'&&dark>.5){const c=(t%70)/70;if(c<.3){const u=c/.3,sx=lerp(W+40*k,-80*k,u),sy=WT+WH*.12+Math.sin(u*6)*6*k;x.fillStyle='rgba(30,20,20,.85)';x.font=`${14*k}px sans-serif`;x.fillText('🦌🦌🛷',sx,sy)}}
      if(layer==='front'&&dark>.45){SZ.sn??=Array.from({length:40},()=>({x:Math.random(),y:Math.random(),v:.2+Math.random()*.5}));x.fillStyle='rgba(255,255,255,.75)';for(const f of SZ.sn){f.y+=f.v*.002;if(f.y>1)f.y=0;x.beginPath();x.arc(WL+WW*(f.x+Math.sin(t+f.y*9)*.01),WT+WH*f.y,1.2*k,0,7);x.fill()}}}
    else if(s==='newyear'){
      if(layer==='beach'){[[.18,.97],[.28,.97]].forEach(([fx,fy])=>{const px=WL+WW*fx,py=WT+WH*fy,sc=k;x.fillStyle='#7a5a2a';x.fillRect(px-6*sc,py-8*sc,12*sc,8*sc);x.fillStyle='#3a8a3a';[-3,0,3].forEach((o,i)=>{x.save();x.translate(px+o*sc,py-8*sc);x.fillRect(-1.3*sc,-(16+i*4)*sc,2.6*sc,(16+i*4)*sc);x.fillStyle='#bfe0a0';x.beginPath();x.ellipse(0,-(16+i*4)*sc,1.3*sc,.7*sc,0,0,7);x.fill();x.restore()});x.fillStyle='#2a6a2a';x.beginPath();x.arc(px,py-9*sc,7*sc,Math.PI,0);x.fill()})}
      if(layer==='sky'){const kx=WL+WW*.7+Math.sin(t*.4)*14*k,ky=WT+WH*.18+Math.sin(t*.7)*6*k;x.strokeStyle='rgba(60,40,30,.6)';x.lineWidth=.6;x.beginPath();x.moveTo(kx,ky+8*k);x.quadraticCurveTo(kx-20*k,ky+60*k,kx-40*k,shore);x.stroke();x.save();x.translate(kx,ky);x.rotate(Math.sin(t)*.1);x.fillStyle='#f4ead8';x.fillRect(-7*k,-9*k,14*k,18*k);x.fillStyle='#c0392b';x.font=`bold ${10*k}px serif`;x.textAlign='center';x.fillText('福',0,4*k);x.restore()}}
    else if(s==='valentine'){if(layer==='front'){SZ.vh??=Array.from({length:12},()=>({x:Math.random(),y:Math.random(),v:.3+Math.random()*.5,s:.6+Math.random()*.6}));x.fillStyle='rgba(255,110,150,.6)';x.font=`${10*k}px sans-serif`;for(const h of SZ.vh){h.y-=h.v*.0015;if(h.y<0)h.y=1;x.save();x.globalAlpha=.5;x.font=`${10*k*h.s}px sans-serif`;x.fillText('♥',WL+WW*(h.x+Math.sin(t+h.y*7)*.02),WT+WH*(.3+h.y*.6));x.restore()}}}
    else if(s==='hanami'){
      if(layer==='beach'){const tx=WL+WW*.06,ty=WT+WH*.86,sc=k*1.2;x.fillStyle=dark>.5?'#3a2a2a':'#6a4a3a';x.beginPath();x.moveTo(tx-3*sc,ty);x.quadraticCurveTo(tx-1*sc,ty-30*sc,tx+6*sc,ty-50*sc);x.lineTo(tx+9*sc,ty-48*sc);x.quadraticCurveTo(tx+4*sc,ty-28*sc,tx+4*sc,ty);x.fill();
        [[6,-55,22],[24,-48,18],[-10,-48,16],[12,-66,16],[34,-60,12]].forEach(([o,y,r])=>{const g=x.createRadialGradient(tx+o*sc,ty+y*sc,2,tx+o*sc,ty+y*sc,r*sc);g.addColorStop(0,dark>.5?'rgba(240,180,210,.9)':'rgba(255,215,230,.95)');g.addColorStop(1,dark>.5?'rgba(200,120,170,.0)':'rgba(255,170,200,0)');x.fillStyle=g;x.beginPath();x.arc(tx+o*sc,ty+y*sc,r*sc,0,7);x.fill()})}
      if(layer==='front'){SZ.pt??=Array.from({length:18},()=>({x:Math.random(),y:Math.random(),v:.3+Math.random()*.5,r:Math.random()*6}));x.fillStyle='rgba(255,190,215,.85)';for(const p of SZ.pt){p.y+=p.v*.0018;p.x+=.0004;if(p.y>1){p.y=0;p.x=Math.random()}x.save();x.translate(WL+WW*(p.x%1),WT+WH*p.y);x.rotate(t*p.v*2+p.r);x.beginPath();x.ellipse(0,0,2.2*k,1.2*k,0,0,7);x.fill();x.restore()}}}
    else if(s==='tanabata'){
      if(layer==='beach'){const bx=WL+WW*.86,by=WT+WH*.95,sc=k*1.1;x.strokeStyle='#4a8a3a';x.lineWidth=2.4*sc;x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo(bx+4*sc,by-40*sc,bx-6*sc,by-80*sc);x.stroke();const C=['#ff5c8a','#ffd23f','#55e0b4','#7aa2ff','#c98cff'];
        for(let i=0;i<9;i++){const u=.3+i*.07,lx=bx+Math.sin(i*2.1)*12*sc,ly=by-u*80*sc+Math.sin(t*1.5+i)*1.5*sc;x.fillStyle=sil(C[i%5]);x.save();x.translate(lx,ly);x.rotate(Math.sin(t+i)*.15);x.fillRect(-1.6*sc,0,3.2*sc,9*sc);x.restore()}}
      if(layer==='sky'&&dark>.5){x.save();x.globalCompositeOperation='lighter';const g=x.createLinearGradient(WL,WT,WL+WW,hz);g.addColorStop(0,'rgba(180,160,255,0)');g.addColorStop(.5,'rgba(200,190,255,.16)');g.addColorStop(1,'rgba(180,160,255,0)');x.fillStyle=g;x.beginPath();x.moveTo(WL+WW*.1,WT);x.lineTo(WL+WW*.4,WT);x.lineTo(WL+WW,hz*.8);x.lineTo(WL+WW*.7,hz*.9);x.closePath();x.fill();x.restore()}}
    else if(s==='summer'){
      if(layer==='beach'){const y0=shore+2*k,L0=WL+WW*.05,R0=WL+WW*.95;x.strokeStyle='rgba(60,40,30,.6)';x.lineWidth=.8;x.beginPath();x.moveTo(L0,y0-30*k);x.quadraticCurveTo((L0+R0)/2,y0-20*k,R0,y0-30*k);x.stroke();
        for(let i=1;i<9;i++){const u=i/9,lx=lerp(L0,R0,u),ly=y0-30*k+Math.sin(u*Math.PI)*10*k+5*k;if(dark>.35){x.save();x.globalCompositeOperation='lighter';glow(lx,ly,12*k,'rgba(255,140,80,.45)');x.restore()}x.fillStyle=dark>.35?'#ff7a5a':'#e05a3a';x.beginPath();x.ellipse(lx,ly,3*k,4*k,0,0,7);x.fill();x.fillStyle='#222';x.fillRect(lx-2*k,ly-4.5*k,4*k,1*k);x.fillRect(lx-2*k,ly+3.6*k,4*k,1*k)}}}
    else if(s==='tsukimi'){
      if(layer==='beach'){const px=WL+WW*.14,py=WT+WH*.97,sc=k*1.1;x.fillStyle='#c8a060';x.fillRect(px-8*sc,py-6*sc,16*sc,6*sc);x.fillStyle='#f4f0e4';[[0,-12],[-3,-9],[3,-9],[-4.5,-6.5],[0,-6.5],[4.5,-6.5]].forEach(([a,b])=>{x.beginPath();x.arc(px+a*sc,py+b*sc,2.2*sc,0,7);x.fill()});
        x.strokeStyle=sil('#c9b07a');x.lineWidth=1*sc;for(let i=0;i<6;i++){const a=-1.9+i*.12;x.beginPath();x.moveTo(px+14*sc,py);x.quadraticCurveTo(px+14*sc+Math.cos(a)*10*sc,py-20*sc,px+14*sc+Math.cos(a)*16*sc+Math.sin(t+i)*2*sc,py-32*sc-i*2*sc);x.stroke()}}}}
  Object.assign(AMB,{
   hwparade:{season:'halloween',when:null,dur:30,layer:'beach',draw(p,st,et){const gy=shore+16*k,hx=lerp(W+30*k,-60*k,p);x.globalAlpha=fade(p,.04,.04);
     [[0,'#ff9a3c','pumpkin'],[14,'#2a2a3a','witch'],[28,'#f4f4ff','ghost']].forEach(([o,c,kind],n)=>{const X=hx+o*k,Y=gy-Math.abs(Math.sin(et*7+n))*1.5*k;evShad(X,gy,5*k);
       if(kind==='ghost'){x.fillStyle=sil('#f0f0ff');x.beginPath();x.arc(X,Y-16*k,5*k,Math.PI,0);x.lineTo(X+5*k,Y);for(let w=0;w<3;w++)x.quadraticCurveTo(X+(3.5-w*3.4)*k,Y+2*k,X+(1.7-w*3.4)*k,Y);x.closePath();x.fill();x.fillStyle='#222';x.fillRect(X-2.4*k,Y-17*k,1.2*k,1.6*k);x.fillRect(X+1.2*k,Y-17*k,1.2*k,1.6*k)}
       else{human(X,Y,.72*k,et*7+n,c,'#f1c7a0',false,-1);if(kind==='pumpkin')pumpkin(X,Y-17*k,k*.55,dark>.4);else{x.fillStyle=sil('#2a1a3a');x.beginPath();x.moveTo(X-5*k,Y-22*k);x.lineTo(X+5*k,Y-22*k);x.lineTo(X+1*k,Y-32*k);x.closePath();x.fill();x.fillRect(X-6*k,Y-22.6*k,12*k,1.2*k)}}
       x.fillStyle=sil('#ff9a3c');x.fillRect(X-6*k,Y-10*k,3*k,4*k)});x.globalAlpha=1}},
   santawalk:{season:'xmas',when:null,dur:28,layer:'beach',draw(p,st,et){const gy=shore+14*k,hx=lerp(-40*k,W+40*k,p);x.globalAlpha=fade(p,.04,.04);evShad(hx,gy,7*k);human(hx,gy,.95*k,et*4,'#d42a2a','#f1c7a0',false,1,{pants:'#d42a2a',hair:'#ffffff'});
     x.fillStyle='#fff';x.beginPath();x.arc(hx+.5*k,gy-24*k,3.4*k,0,Math.PI);x.fill();x.fillStyle='#d42a2a';x.beginPath();x.moveTo(hx-3.5*k,gy-29*k);x.lineTo(hx+3.5*k,gy-29*k);x.lineTo(hx-5*k,gy-36*k);x.closePath();x.fill();x.fillStyle='#fff';x.beginPath();x.arc(hx-5*k,gy-36*k,1.2*k,0,7);x.fill();
     x.fillStyle='#8a5a2a';x.beginPath();x.ellipse(hx-7*k,gy-18*k,5*k,6*k,0,0,7);x.fill();x.globalAlpha=1}},
   yukata:{season:'summer',when:'eve',dur:40,layer:'beach',draw(p,st,et){const gy=shore+10*k,hx=lerp(W+30*k,-50*k,p);x.globalAlpha=fade(p,.05,.05);evShad(hx,gy,8*k);human(hx,gy,.9*k,et*3.4,'#2c3e66','#e9bf98',false,-1,{pants:'#2c3e66'});human(hx+10*k,gy,.86*k,et*3.4+1,'#ff9ec4','#f1c7a0',false,-1,{pants:'#ff9ec4'});
     x.save();x.globalCompositeOperation='lighter';glow(hx+16*k,gy-14*k,10*k,'rgba(255,200,120,.4)');x.restore();x.fillStyle='#fff';x.beginPath();x.arc(hx+16*k,gy-12*k,2.4*k,0,7);x.fill();x.globalAlpha=1}},
   hanapic:{season:'hanami',when:'day',dur:60,layer:'beach',draw(p,st,et){const cx=WL+WW*.2,cy=WT+WH*.92;x.globalAlpha=fade(p,.05,.05);x.fillStyle='#4a90e2';x.fillRect(cx-16*k,cy-2*k,32*k,6*k);[[-8,'#ff9ec4'],[8,'#ffd23f']].forEach(([o,c])=>{x.save();x.translate(cx+o*k,cy);x.scale(1,.7);human(0,0,.8*k,0,c,'#f1c7a0',false,o<0?1:-1);x.restore()});x.fillStyle='#fff';x.fillRect(cx-3*k,cy-4*k,6*k,3*k);x.globalAlpha=1}},
  });
  Object.assign(AMB,{
   radiotaiso:{when:'morning',dur:46,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),gy=shore+18*k,ph=Math.floor(et/3)%3,b=Math.abs(Math.sin(et*2.2))*(ph===1?3:1)*k;x.globalAlpha=a;
     [[.4,'#f4f4f4','#2c3e66'],[.48,'#ffd23f','#2c3e66'],[.56,'#7aa2ff','#3a3a3a'],[.64,'#ff9ec4','#2c3e66'],[.72,'#55e0b4','#5a4030']].forEach(([fx,c,pn],n)=>{const hx=WL+WW*fx,y=gy+(n%2)*6*k;evShad(hx,y,5*k);x.save();x.translate(0,-b);human(hx,y,.82*k,0,c,n%3?'#e9bf98':'#d9a57a',false,-1,{pants:pn,hair:n===0?'#cfcfcf':'#2a1a10'});
       x.strokeStyle=sil(c);x.lineWidth=1.6*k;x.lineCap='round';const ar=ph===0?-1.4:ph===1?-.3:.4;[-1,1].forEach(sd=>{x.beginPath();x.moveTo(hx,y-16*k);x.lineTo(hx+sd*Math.cos(ar)*8*k,y-16*k+Math.sin(ar)*8*k);x.stroke()});x.restore()});
     const q=(et*.8)%1;x.globalAlpha=a*(1-q);x.fillStyle='#ffe7a8';x.font=`${8*k}px sans-serif`;x.fillText(['いち','にっ','さん','しっ'][Math.floor(et*.8)%4],WL+WW*.35,gy-34*k-q*10*k);x.globalAlpha=1}},
   karate:{when:'morning',dur:36,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),hx=WL+WW*.62,gy=shore+20*k,hit=Math.sin(et*3)>.7;x.globalAlpha=a;evShad(hx,gy,6*k);human(hx,gy,.95*k,0,'#f4f4f4','#d9a57a',false,-1,{pants:'#f4f4f4',hair:'#111111'});
     x.fillStyle='#111';x.fillRect(hx-4*k,gy-12*k,8*k,1.4*k);x.strokeStyle=sil('#f4f4f4');x.lineWidth=2*k;x.lineCap='round';x.beginPath();x.moveTo(hx,gy-17*k);x.lineTo(hx-(hit?13:5)*k,gy-18*k);x.stroke();
     if(hit){x.fillStyle='rgba(255,255,255,.85)';x.font=`bold ${8*k}px sans-serif`;x.fillText('せいっ！',hx-34*k,gy-28*k)}x.globalAlpha=1}},
   painter:{when:'day',dur:70,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),hx=WL+WW*.74,gy=shore+24*k;x.globalAlpha=a;evShad(hx,gy,6*k);human(hx,gy,.9*k,0,'#8a6ab0','#e9bf98',false,-1,{hair:'#6a4a30'});x.fillStyle='#a33';x.beginPath();x.ellipse(hx,gy-29*k,5*k,1.6*k,0,0,7);x.fill();
     x.strokeStyle=sil('#7a5a3a');x.lineWidth=1*k;x.beginPath();x.moveTo(hx-14*k,gy);x.lineTo(hx-10*k,gy-26*k);x.moveTo(hx-6*k,gy);x.lineTo(hx-10*k,gy-26*k);x.stroke();x.fillStyle='#fdf8ec';x.fillRect(hx-17*k,gy-28*k,14*k,11*k);
     const q=Math.min(1,p*1.6);x.fillStyle='#7ab8ff';x.fillRect(hx-16*k,gy-27*k,12*k*q,4*k);x.fillStyle='#ffb27a';x.beginPath();x.arc(hx-10*k,gy-23*k,1.8*k*q,0,7);x.fill();x.fillStyle='#3a6ab0';x.fillRect(hx-16*k,gy-22*k,12*k*q,2.5*k);x.fillStyle='#e8d8a8';x.fillRect(hx-16*k,gy-19.5*k,12*k*q,1.5*k);
     x.strokeStyle='#5a4030';x.lineWidth=1*k;x.beginPath();x.moveTo(hx-2*k,gy-17*k);x.lineTo(hx-5*k+Math.sin(et*3)*1.5*k,gy-23*k);x.stroke();x.globalAlpha=1}},
   detector:{when:'day',dur:40,layer:'beach',draw(p,st,et){const gy=shore+26*k,hx=lerp(W+30*k,-40*k,p),beep=Math.sin(et*.7)>.85;x.globalAlpha=fade(p,.04,.04);evShad(hx,gy,7*k);human(hx,gy,.92*k,beep?0:et*2,'#6a7a4a','#d9a57a',false,-1,{hair:'#cfcfcf'});x.fillStyle='#e8d070';x.beginPath();x.ellipse(hx,gy-29*k,5*k,1.6*k,0,0,7);x.fill();
     const sw=Math.sin(et*2)*5*k;x.strokeStyle=sil('#888888');x.lineWidth=1*k;x.beginPath();x.moveTo(hx-2*k,gy-14*k);x.lineTo(hx-14*k+sw,gy-1*k);x.stroke();x.fillStyle=sil('#333333');x.beginPath();x.ellipse(hx-15*k+sw,gy,4*k,1.3*k,0,0,7);x.fill();
     if(beep){x.fillStyle='#ffe07a';x.font=`${7*k}px sans-serif`;x.fillText('ピピッ',hx-24*k,gy-10*k)}x.globalAlpha=1}},
   lifeguard:{when:'day',dur:60,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),cx=WL+WW*.84,gy=shore+16*k;x.globalAlpha=a;x.strokeStyle=sil('#f4f4f4');x.lineWidth=1.6*k;x.beginPath();x.moveTo(cx-8*k,gy);x.lineTo(cx-5*k,gy-20*k);x.moveTo(cx+8*k,gy);x.lineTo(cx+5*k,gy-20*k);x.moveTo(cx-7*k,gy-8*k);x.lineTo(cx+7*k,gy-8*k);x.stroke();
     x.fillStyle=sil('#ff3b3b');x.fillRect(cx-7*k,gy-22*k,14*k,2.5*k);human(cx,gy-21*k,.8*k,0,'#ff3b3b','#d9a57a',false,Math.sin(et*.5)>0?-1:1,{pants:'#ffd23f'});x.fillStyle=sil('#ffd23f');x.fillRect(cx+10*k,gy-26*k,.8*k,26*k);x.fillStyle='#ff3b3b';x.fillRect(cx+10.8*k,gy-26*k,6*k,4*k);
     if(Math.sin(et*.6)>.93){x.fillStyle='#fff';x.font=`${7*k}px sans-serif`;x.fillText('ピーッ！',cx-24*k,gy-34*k)}x.globalAlpha=1}},
   beachflags:{when:'noon',dur:24,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),gy=shore+24*k,fx=WL+WW*.35;x.globalAlpha=a;x.fillStyle='#ff3b3b';x.fillRect(fx,gy-8*k,.8*k,8*k);x.fillRect(fx+.8*k,gy-8*k,4*k,3*k);
     [['#7aa2ff',0],['#ffd23f',1]].forEach(([c,n])=>{let hx,run=true,y=gy+n*5*k;if(p<.25){hx=WL+WW*.8+n*6*k;run=false}else if(p<.6){const q=(p-.25)/.35;hx=lerp(WL+WW*.8+n*6*k,fx+(n?14:6)*k,q*(n?.95:1))}else{hx=fx+(n?14:6)*k;run=false}
       evShad(hx,y,6*k);if(p>.55&&p<.65&&n===0){x.save();x.translate(hx,y);x.rotate(-1.2);human(0,0,.85*k,0,c,'#d9a57a',false,-1);x.restore()}else human(hx,y,.85*k,run?et*9:0,c,'#d9a57a',run,-1)});
     if(p>.65){x.fillStyle='#fff';x.font=`bold ${8*k}px sans-serif`;x.fillText('とったー！',fx-6*k,gy-34*k)}x.globalAlpha=1}},
   sumo:{when:'noon',dur:30,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),cx=WL+WW*.6,gy=shore+28*k;x.globalAlpha=a;x.strokeStyle='rgba(120,90,60,.6)';x.lineWidth=1*k;x.beginPath();x.ellipse(cx,gy,22*k,6*k,0,0,7);x.stroke();
     const push=Math.sin(et*2.4)*3*k,fall=p>.8;[[-1,'#ff9ec4'],[1,'#7aa2ff']].forEach(([d,c])=>{const hx=cx+d*5*k+push;x.save();if(fall&&d===1){x.translate(hx+8*k,gy);x.rotate(1.2);human(0,0,.72*k,0,c,'#f1c7a0',false,-d);x.restore()}else{x.translate(0,0);human(hx,gy,.72*k,0,c,'#f1c7a0',false,-d);x.restore()}});
     x.fillStyle='#fff';x.font=`${7*k}px sans-serif`;x.fillText(fall?'勝負あり！':'はっけよい のこった',cx-22*k,gy-30*k);x.globalAlpha=1}},
   juggler:{when:'day',dur:44,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),hx=WL+WW*.48,gy=shore+22*k;x.globalAlpha=a;evShad(hx,gy,6*k);human(hx,gy,.92*k,0,'#ff5c5c','#e9bf98',false,1,{pants:'#2c3e66'});x.fillStyle='#ffd23f';x.beginPath();x.moveTo(hx-5*k,gy-29*k);x.lineTo(hx+5*k,gy-29*k);x.lineTo(hx,gy-37*k);x.fill();
     ['#ff5c8a','#55e0b4','#7aa2ff','#ffd23f'].forEach((c,i)=>{const t=et*3+i*Math.PI/2,bx=hx+Math.cos(t)*8*k,by=gy-34*k-Math.abs(Math.sin(t))*14*k;x.fillStyle=c;x.beginPath();x.arc(bx,by,1.8*k,0,7);x.fill()});
     [[-16,'#5a7fa0'],[-24,'#ff9a3c'],[18,'#55a050']].forEach(([o,c],n)=>{human(hx+o*k,gy+8*k,.7*k,0,c,'#f1c7a0',false,o<0?1:-1);if(Math.sin(et*2+n)>.9){x.fillStyle='#fff';x.font=`${6*k}px sans-serif`;x.fillText('👏',hx+o*k-3*k,gy-14*k)}});x.globalAlpha=1}},
   students:{when:'day',dur:30,layer:'beach',draw(p,st,et){const gy=shore+12*k,hx0=lerp(-60*k,W+40*k,p);x.globalAlpha=fade(p,.04,.04);for(let i=0;i<6;i++){const hx=hx0-i*11*k,y=gy+(i%2)*5*k,g=i%2===0;evShad(hx,y,5*k);human(hx,y,.82*k,et*4+i,g?'#1e2a44':'#f4f4f4','#f1c7a0',false,1,{pants:g?'#1e2a44':'#2a3550',hair:'#1a1008'})}
     human(hx0+14*k,gy,.92*k,et*4,'#6a6a6a','#e9bf98',false,1,{hair:'#3a3a3a'});x.fillStyle='#ffd23f';x.fillRect(hx0+18*k,gy-34*k,.6*k,14*k);x.fillRect(hx0+18.6*k,gy-34*k,5*k,3.5*k);x.globalAlpha=1}},
   droneman:{when:'day',dur:40,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),hx=WL+WW*.3,gy=shore+26*k;x.globalAlpha=a;evShad(hx,gy,6*k);human(hx,gy,.9*k,0,'#3a3a3a','#e9bf98',false,1);x.fillStyle='#222';x.fillRect(hx+2*k,gy-17*k,5*k,3*k);
     const dx=hx+Math.sin(et*.5)*WW*.25+20*k,dy=hz+10*k-Math.abs(Math.sin(et*.3))*30*k;x.fillStyle=sil('#dddddd');x.fillRect(dx-4*k,dy-1*k,8*k,2*k);x.fillStyle='rgba(200,200,200,.6)';[-5,5].forEach(o=>{x.beginPath();x.ellipse(dx+o*k,dy-2*k,3*k*Math.abs(Math.sin(et*40)),.6*k,0,0,7);x.fill()});
     if(Math.sin(et*2)>.9){x.fillStyle='#ff3b3b';x.beginPath();x.arc(dx,dy+1*k,.8*k,0,7);x.fill()}x.globalAlpha=1}},
   cyclist:{when:'day',dur:12,layer:'beach',draw(p,st,et){const gy=shore+10*k,hx=lerp(W+30*k,-40*k,p),s=k;x.globalAlpha=fade(p,.04,.04);x.strokeStyle=sil('#333333');x.lineWidth=1*s;[-7,7].forEach(o=>{x.beginPath();x.arc(hx+o*s,gy-4*s,4*s,0,7);x.stroke()});
     x.strokeStyle=sil('#ff5c5c');x.lineWidth=1.4*s;x.beginPath();x.moveTo(hx-7*s,gy-4*s);x.lineTo(hx,gy-10*s);x.lineTo(hx+7*s,gy-4*s);x.moveTo(hx,gy-10*s);x.lineTo(hx-6*s,gy-12*s);x.stroke();human(hx+1*s,gy-9*s,.75*k,et*8,'#55e0b4','#e9bf98',false,-1,{pants:'#2c3e66'});x.globalAlpha=1}},
   cosplay:{when:'day',dur:40,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),hx=WL+WW*.56,gy=shore+22*k;x.globalAlpha=a;evShad(hx,gy,5*k);human(hx,gy,.9*k,0,'#c58cff','#f1c7a0',false,-1,{hair:'#55c8ff',pants:'#c58cff'});x.fillStyle='#55c8ff';x.fillRect(hx+2*k,gy-28*k,2*k,12*k);
     human(hx+26*k,gy+4*k,.88*k,0,'#3a3a3a','#e9bf98',false,-1);x.fillStyle='#111';x.fillRect(hx+19*k,gy-14*k,6*k,4*k);if(Math.sin(et*1.4)>.92){x.save();x.globalCompositeOperation='lighter';glow(hx+19*k,gy-12*k,26*k,'rgba(255,255,255,.7)');x.restore()}x.globalAlpha=1}},
   wedding:{when:'eve',dur:60,layer:'beach',draw(p,st,et){const a=fade(p,.05,.05),cx=WL+WW*.5,gy=shore+20*k;x.globalAlpha=a;evShad(cx,gy,9*k);human(cx-4*k,gy,.95*k,0,'#1a1a22','#e9bf98',false,1,{pants:'#1a1a22',hair:'#2a1a10'});human(cx+5*k,gy,.9*k,0,'#ffffff','#f1c7a0',false,-1,{pants:'#ffffff',hair:'#3a2010'});
     x.fillStyle=sil('#ffffff');x.beginPath();x.moveTo(cx+1*k,gy);x.lineTo(cx+5*k,gy-14*k);x.lineTo(cx+10*k,gy);x.fill();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.moveTo(cx+4*k,gy-26*k);x.lineTo(cx+12*k,gy-8*k);x.lineTo(cx+8*k,gy-24*k);x.fill();
     x.fillStyle='#ff9ec4';x.beginPath();x.arc(cx+1*k,gy-15*k,1.6*k,0,7);x.fill();human(cx-30*k,gy+8*k,.85*k,0,'#5a5a5a','#e9bf98',false,1);x.fillStyle='#111';x.fillRect(cx-26*k,gy-8*k,5*k,3.5*k);
     if(Math.sin(et*1.2)>.9){x.save();x.globalCompositeOperation='lighter';glow(cx-24*k,gy-6*k,30*k,'rgba(255,255,255,.6)');x.restore()}const q=(et*.6)%1;x.globalAlpha=a*(1-q);x.fillStyle='#ff9ec4';x.font=`${8*k}px sans-serif`;x.fillText('💕',cx-3*k,gy-34*k-q*14*k);x.globalAlpha=1}},
   headlamp:{when:'night',dur:16,layer:'beach',draw(p,st,et){const gy=shore+14*k,hx=lerp(-30*k,W+30*k,p);x.globalAlpha=fade(p,.04,.04);human(hx,gy,.9*k,et*8,'#2a3a5a','#e9bf98',true,1);x.save();x.globalCompositeOperation='lighter';glow(hx+2*k,gy-27*k,6*k,'rgba(255,255,220,.9)');
     x.fillStyle='rgba(255,255,200,.12)';x.beginPath();x.moveTo(hx+2*k,gy-27*k);x.lineTo(hx+60*k,gy-8*k);x.lineTo(hx+60*k,gy+10*k);x.fill();x.restore();x.globalAlpha=1}},
   kimodameshi:{when:'night',dur:30,layer:'beach',draw(p,st,et){const gy=shore+20*k,hx=lerp(W+30*k,-40*k,p),scare=p>.45&&p<.6;x.globalAlpha=fade(p,.04,.04);[0,1,2].forEach(n=>{const h=hx+n*9*k+(scare?Math.sin(et*30)*1*k:0);human(h,gy+(n%2)*4*k,.78*k,scare?0:et*3,['#ff9ec4','#ffd23f','#7aa2ff'][n],'#e9bf98',false,-1)});
     x.save();x.globalCompositeOperation='lighter';glow(hx-6*k,gy-14*k,10*k,'rgba(255,240,180,.6)');x.restore();if(scare){x.fillStyle='rgba(230,240,255,.8)';x.beginPath();x.arc(hx-26*k,gy-26*k,6*k,Math.PI,0);x.lineTo(hx-20*k,gy-12*k);x.lineTo(hx-23*k,gy-15*k);x.lineTo(hx-26*k,gy-12*k);x.lineTo(hx-29*k,gy-15*k);x.lineTo(hx-32*k,gy-12*k);x.fill();
       x.fillStyle='#fff';x.font=`bold ${8*k}px sans-serif`;x.fillText('ぎゃーー！',hx,gy-34*k)}x.globalAlpha=1}},
   patrol:{when:'night',dur:30,layer:'beach',draw(p,st,et){const gy=shore+18*k,hx=lerp(-30*k,W+30*k,p);x.globalAlpha=fade(p,.04,.04);evShad(hx,gy,6*k);human(hx,gy,.92*k,et*3,'#2a3a6a','#e9bf98',false,1,{pants:'#2a3a6a'});x.fillStyle='#2a3a6a';x.fillRect(hx-4*k,gy-31*k,8*k,2.4*k);
     const an=Math.sin(et*.8)*.5;x.save();x.globalCompositeOperation='lighter';x.fillStyle='rgba(255,250,210,.13)';x.beginPath();x.moveTo(hx+5*k,gy-16*k);x.lineTo(hx+50*k,gy-16*k+(an-.3)*40*k);x.lineTo(hx+50*k,gy-16*k+(an+.3)*40*k);x.fill();x.restore();x.globalAlpha=1}}});
  /* ---------- 光の 背景シーン ---------- */
  Object.assign(AMB,{
   lightpaint:{when:'night',dur:40,layer:'beach',draw(p,st,et){const a=fade(p,.05,.08),hx=WL+WW*.62,gy=shore+22*k;x.globalAlpha=a;evShad(hx,gy,6*k);human(hx,gy,.9*k,0,'#3a3a4a','#e9bf98',false,-1);
     const shp=Math.floor(et/9)%3,q=(et%9)/7,C=['255,120,190','120,200,255','255,220,120'][shp],P=u=>{const t2=u*Math.PI*2;if(shp===0)return[16*Math.pow(Math.sin(t2),3),-(13*Math.cos(t2)-5*Math.cos(2*t2)-2*Math.cos(3*t2)-Math.cos(4*t2))];if(shp===1){const n=5,i=Math.floor(u*n*2),f=u*n*2-i,R0=i%2?7:16,R1=i%2?16:7,a0=i/(n*2)*Math.PI*2-Math.PI/2,a1=(i+1)/(n*2)*Math.PI*2-Math.PI/2;return[lerp(Math.cos(a0)*R0,Math.cos(a1)*R1,f),lerp(Math.sin(a0)*R0,Math.sin(a1)*R1,f)]}return[Math.cos(t2)*14,Math.sin(t2)*14]};
     const ox=hx-28*k,oy=gy-36*k,end=Math.min(1,q);x.save();x.globalCompositeOperation='lighter';x.lineCap='round';x.lineJoin='round';
     for(const[lw,al]of[[6,.12],[3,.35],[1.2,.95]]){x.strokeStyle=`rgba(${C},${al*a})`;x.lineWidth=lw*k;x.beginPath();for(let i=0;i<=60*end;i++){const[u,v]=P(i/60);i?x.lineTo(ox+u*k,oy+v*k):x.moveTo(ox+u*k,oy+v*k)}x.stroke()}
     if(q<1){const[u,v]=P(end);glow(ox+u*k,oy+v*k,8*k,`rgba(${C},.9)`);x.strokeStyle='#888';x.lineWidth=1*k;x.beginPath();x.moveTo(hx-4*k,gy-17*k);x.lineTo(ox+u*k,oy+v*k);x.stroke()}x.restore();x.globalAlpha=1}},
   candlepath:{when:'night',dur:60,layer:'beach',draw(p,st,et){const a=fade(p,.04,.1),N=14,lit=Math.min(N,Math.floor(p*N*3));x.save();for(let i=0;i<N;i++){const u=i/(N-1),cx=WL+WW*(.48+Math.sin(u*3)*.06+u*.1),cy=lerp(WT+WH*.98,shore+6*k,u),sc=k*(1-u*.55);
       x.globalAlpha=a;x.fillStyle=sil('#f4ead8');x.fillRect(cx-1.2*sc,cy-5*sc,2.4*sc,5*sc);if(i<lit){const f=.85+.15*Math.sin(et*9+i*2);x.globalCompositeOperation='lighter';pool(cx,cy,26*sc*f,`rgba(255,170,80,${.35*a})`);glow(cx,cy-7*sc,10*sc*f,`rgba(255,200,110,${.6*a})`);x.globalCompositeOperation='source-over';x.fillStyle='#fff3c0';x.beginPath();x.ellipse(cx,cy-7*sc,1*sc,2*sc*f,0,0,7);x.fill()}}
     x.restore();x.globalAlpha=1}},
   seaglowwalk:{when:'night',dur:30,layer:'beach',draw(p,st,et){const gy=shore+6*k,hx=lerp(-30*k,W+30*k,p);st.f??=[];if(!st.l||et-st.l>.35){st.l=et;st.f.push({x:hx,y:gy+(st.f.length%2?2:-1)*k,t:et})}x.globalAlpha=fade(p,.04,.04);
     x.save();x.globalCompositeOperation='lighter';for(const f of st.f){const age=et-f.t,al=Math.max(0,1-age/6);if(al<=0)continue;glow(f.x,f.y,7*k,`rgba(80,200,255,${.55*al})`);x.fillStyle=`rgba(170,240,255,${.8*al})`;x.beginPath();x.ellipse(f.x,f.y,1.8*k,.9*k,0,0,7);x.fill()}
     glow(hx,gy+1*k,14*k,'rgba(80,200,255,.35)');x.restore();human(hx,gy,.88*k,et*4,'#f4f4f4','#e9bf98',false,1,{shorts:true});st.f=st.f.filter(f=>et-f.t<6);x.globalAlpha=1}},
   phonelights:{when:'night',dur:40,layer:'beach',draw(p,st,et){const a=fade(p,.05,.08),gy=shore+18*k;x.globalAlpha=a;for(let i=0;i<7;i++){const hx=WL+WW*(.3+i*.075),sw=Math.sin(et*1.6+i*.5)*6*k,y=gy+(i%2)*5*k;human(hx,y,.78*k,0,['#ff7a9a','#7aa2ff','#55e0b4','#ffd23f','#c58cff','#ff9a3c','#f4f4f4'][i],'#e9bf98',false,1);
       const lx=hx+3*k+sw,ly=y-30*k;x.strokeStyle=sil('#e9bf98');x.lineWidth=1.4*k;x.beginPath();x.moveTo(hx+1*k,y-20*k);x.lineTo(lx,ly);x.stroke();x.save();x.globalCompositeOperation='lighter';glow(lx,ly,9*k,'rgba(220,235,255,.6)');x.fillStyle='#ffffff';x.fillRect(lx-1*k,ly-1.6*k,2*k,3.2*k);x.restore()}
     if(Math.floor(et*1.2)%2===0){const q=(et*1.2)%1;x.globalAlpha=a*(1-q);x.fillStyle='#ffe7a8';x.font=`${8*k}px sans-serif`;x.fillText('♪',WL+WW*.5,gy-44*k-q*12*k)}x.globalAlpha=1}},
   angelladder:{when:'day',dur:50,layer:'sky',draw(p,st,et){const a=fade(p,.15,.2),cx=WL+WW*(.35+Math.sin(et*.05)*.05),cy=hz*.18;x.save();x.globalCompositeOperation='lighter';
     x.fillStyle=`rgba(255,255,255,${.12*a})`;x.beginPath();x.ellipse(cx,cy,WW*.3,hz*.08,0,0,7);x.fill();
     for(let i=0;i<9;i++){const sp=(i-4)*.09+Math.sin(et*.2+i)*.01,w0=WW*.015,len=hz*1.2;const g=x.createLinearGradient(cx,cy,cx+Math.sin(sp)*len,cy+len);g.addColorStop(0,`rgba(255,248,220,${(.16+.06*Math.sin(et*.5+i*1.7))*a})`);g.addColorStop(1,'rgba(255,248,220,0)');x.fillStyle=g;
       x.beginPath();x.moveTo(cx+(i-4)*w0,cy);x.lineTo(cx+Math.sin(sp)*len-w0*2,cy+len);x.lineTo(cx+Math.sin(sp)*len+w0*2.5,cy+len);x.lineTo(cx+(i-4)*w0+w0,cy);x.fill()}
     x.restore()}},
   moonrise:{when:'dusk',dur:70,layer:'sea',draw(p,st,et){const a=fade(p,.1,.15),mx=WL+WW*.68,R0=WW*.09,my=hz-R0*.2-p*R0*1.6;x.save();x.beginPath();x.rect(0,0,W,hz);x.clip();x.globalAlpha=a;
     x.globalCompositeOperation='lighter';glow(mx,my,R0*3,'rgba(255,140,60,.25)');x.globalCompositeOperation='source-over';const g=x.createRadialGradient(mx-R0*.3,my-R0*.3,R0*.1,mx,my,R0);g.addColorStop(0,'#ffd7a0');g.addColorStop(1,'#e8783a');x.fillStyle=g;x.beginPath();x.arc(mx,my,R0,0,7);x.fill();
     x.fillStyle='rgba(180,80,40,.25)';[[-.3,-.2,.22],[.25,.1,.16],[-.05,.35,.12]].forEach(([u,v,r])=>{x.beginPath();x.arc(mx+u*R0,my+v*R0,r*R0,0,7);x.fill()});x.restore();
     x.save();x.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const yy=hz+4*k+i*i*1.6*k,wd=R0*(.9-i*.05)*(1+Math.sin(et*2+i)*.15);x.fillStyle=`rgba(255,160,80,${(.3-i*.025)*a})`;x.fillRect(mx-wd/2+Math.sin(et*1.5+i*1.3)*3*k,yy,wd,1.4*k)}x.restore();x.globalAlpha=1}}});
  const AMBN=Object.keys(AMB);let acur=null,alast=null,ambAt=performance.now()+R(120000,200000);
  const ambOk=n=>{if(AMB[n].season&&AMB[n].season!==curSeason())return false;const w=AMB[n].when,h=gameHour();if(!w)return true;if(w==='night')return dark>.6;if(w==='day')return dark<.35;if(w==='dusk')return h>=16.5&&h<23;if(w==='eve')return h>=16&&h<20.5;if(w==='morning')return h>=5&&h<11;if(w==='noon')return h>=10&&h<16;return true};
  function startAmb(name){if(!name&&curSeason()&&Math.random()<.35){const sp=AMBN.filter(n=>AMB[n].season===curSeason()&&ambOk(n));if(sp.length)name=pick(sp)}try{if(Math.random()<.1+treB())setTimeout(()=>{if(S.phase!=='busy')treToast(giveTre(0))},7000)}catch(e){}if(!name){const c=AMBN.filter(n=>n!==alast&&ambOk(n));name=c[Math.random()*c.length|0]}if(!name)return;alast=name;acur={name,et:0,st:{}};try{say('am_'+name,{n:1+(Math.random()<.5),origin:'beach',delay:2500,gap:1600})}catch(e){}}
  function runAmb(layer,rdt){if(!acur)return;const v=AMB[acur.name];if(v.layer!==layer)return;acur.et+=rdt;const p=acur.et/v.dur;if(p>=1){acur=null;return}x.save();v.draw(p,acur.st,acur.et);x.restore()}
  function runEvents(layer,rdt){if(!cur)return;const e=EV[cur.name];if(e.layer!==layer)return;cur.et+=rdt;const p=cur.et/e.dur;if(p>=1){cur=null;return}x.save();e.draw(p,cur.st,cur.et);x.restore()}
  /* ---------- purchasable shows ---------- */
  let shows=[],notes=[];
    /* 複数の 背景イベントを 組み合わせた ショー */
  const cmbE=n=>EV[n]||(typeof VIS!=='undefined'&&VIS[n])||(typeof AMB!=='undefined'&&AMB[n]);const cmbL=list=>{const L={};list.forEach((it,ix)=>{const E=cmbE(it[0]);if(!E)return;const ly=E.layer||'beach';(L[ly]??=[]).push([it,ix])});const o={L:{}};
    for(const ly in L)o.L[ly]=(p,st,et)=>{const a=fade(p,.03,.05);if(a<.02)return;for(const[[n,off,dx,dy,sp],ix]of L[ly]){const E=cmbE(n),D=(E.dur||30)/(sp||1),t=et+off*D,cy=Math.floor(t/D),key='s'+ix;
      if(st['c'+ix]!==cy){st['c'+ix]=cy;st[key]={}}x.save();x.translate((dx||0)*WW,(dy||0)*k);try{E.draw((t%D)/D,st[key],et)}catch(e){if(!st['e'+ix]){st['e'+ix]=1;console.warn('cmb',n,e.message)}}x.restore();x.globalAlpha=1}};return o};
  const SHOW={
   odako:{layer:'beach',draw(p,st,et,rdt){
    if(st.win==null){st.win=Math.random()<.5?0:1;st.fall=0;st.conf=[];st.splash=0}
    const KW=62*k,KH=46*k,top=hz*.4,low=shore-KH*.2,ease=q=>q<.5?2*q*q:1-Math.pow(-2*q+2,2)/2,cl=v=>Math.max(0,Math.min(1,v));
    const AN=[[-12*k,shore+60*k],[W+12*k,shore+60*k]];
    const kp=i=>{const sg=i?-1:1;let kx,ky,ang=Math.sin(et*1.3+i*2)*.06*sg;
      const qR=ease(cl(p/.2)),qA=ease(cl((p-.2)/.18));
      kx=(i?W*.84:W*.16)+sg*qA*W*.2;ky=low+(top-low)*qR;
      if(p>.38&&p<.82){const b=cl((p-.38)/.44);ky=top+b*(hz*.62-top)+Math.sin(et*2.6+i)*3*k;kx+=Math.sin(et*1.7+i*3)*6*k*sg+Math.sin(et*7)*1.2*k;ang+=Math.sin(et*3.1+i)*.08}
      if(p>=.82){const b=cl((p-.82)/.18);if(i===st.win){ky=hz*.62+(top*.9-hz*.62)*ease(b);ang=Math.sin(et*1.5)*.05}
        else{ky=hz*.62+(shore+8*k-hz*.62)*Math.pow(b,1.6);kx+=sg*-b*W*.08+Math.sin(et*6)*6*k*b;ang=sg*(b*1.6+Math.sin(et*8)*.25*b)}}
      return[kx,ky,ang]};
    const P=[kp(0),kp(1)],cross=p>.38&&p<.82||p>=.82&&false;
    const brid=(i)=>{const[kx,ky,a]=P[i];return[kx+Math.sin(a)*KH*.9,ky+KH*.95]};
    // 綱
    x.save();x.lineCap='round';
    const C=[(P[0][0]+P[1][0])/2,(Math.max(P[0][1],P[1][1])+KH*1.6)+Math.sin(et*2)*2*k];
    for(let i=0;i<2;i++){const[bx,by]=brid(i),[ax,ay]=AN[i];x.strokeStyle='rgba(70,50,30,.75)';x.lineWidth=1.6*k;x.beginPath();x.moveTo(ax,ay);
      if(p>.38&&p<.82){x.quadraticCurveTo((ax+C[0])/2,(ay+C[1])/2+18*k,C[0],C[1]);x.quadraticCurveTo((C[0]+bx)/2,(C[1]+by)/2+4*k,bx,by)}
      else if(p>=.82&&i!==st.win){const b=cl((p-.82)/.18);x.quadraticCurveTo((ax+bx)/2,Math.max(ay,by)+40*k*b,bx,by)}
      else x.quadraticCurveTo((ax+bx)/2,(ay+by)/2+26*k,bx,by);x.stroke()}
    if(p>.38&&p<.82){x.fillStyle='rgba(70,50,30,.9)';x.beginPath();x.arc(C[0],C[1],2.4*k,0,7);x.fill()}
    x.restore();
    // 凧
    const DES=[{bd:'#c8282a',bg:'#fbf3dc',ch:'龍',cc:'#1a1a1a',em:'#c8282a'},{bd:'#1f4fa8',bg:'#fbf3dc',ch:'勝',cc:'#c8282a',em:'#1f4fa8'}];
    for(let i=0;i<2;i++){const[kx,ky,a]=P[i],D=DES[i];if(p>=.98&&i!==st.win)continue;x.save();x.translate(kx,ky);x.rotate(a);
      // 糸目
      x.strokeStyle='rgba(60,40,20,.45)';x.lineWidth=.5;const bx=Math.sin(-a)*0+0,by=KH*.95;for(let r=0;r<3;r++)for(let c=0;c<4;c++){x.beginPath();x.moveTo(-KW/2+KW*(c+.5)/4,-KH/2+KH*(r+.5)/3);x.lineTo(bx,by);x.stroke()}
      x.fillStyle='rgba(0,0,0,.18)';x.fillRect(-KW/2+2*k,-KH/2+3*k,KW,KH);
      x.fillStyle=D.bd;x.fillRect(-KW/2,-KH/2,KW,KH);x.fillStyle=D.bg;x.fillRect(-KW/2+3*k,-KH/2+3*k,KW-6*k,KH-6*k);
      x.fillStyle=D.em;x.globalAlpha=.9;x.beginPath();x.arc(0,0,KH*.36,0,7);x.fill();x.globalAlpha=1;
      x.fillStyle=i?'#fbf3dc':'#fbf3dc';x.font=`900 ${Math.round(KH*.5)}px "Yu Mincho","Hiragino Mincho ProN",serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(D.ch,0,KH*.02);
      x.strokeStyle='rgba(90,60,30,.55)';x.lineWidth=.9*k;x.beginPath();for(let c=1;c<4;c++){x.moveTo(-KW/2+KW*c/4,-KH/2);x.lineTo(-KW/2+KW*c/4,KH/2)}for(let r=1;r<3;r++){x.moveTo(-KW/2,-KH/2+KH*r/3);x.lineTo(KW/2,-KH/2+KH*r/3)}x.stroke();
      x.fillStyle='rgba(255,255,255,.12)';x.fillRect(-KW/2,-KH/2,KW,KH*.3);x.restore()}
    // 綱が 切れた 瞬間・着水・勝者の 紙吹雪
    if(p>=.82&&!st.snap){st.snap=1;for(let n=0;n<40;n++)st.conf.push({x:P[st.win][0]+R(-30,30)*k,y:P[st.win][1]+R(-20,10)*k,vx:R(-1.5,1.5),vy:R(-2.5,-.5),c:['#ff5c8a','#ffd23f','#55e0b4','#7aa2ff','#fff'][n%5],r:R(0,6)})}
    if(p>=.95&&!st.splash){st.splash=1;st.sx=P[1-st.win][0];st.st=et}
    if(st.splash){const q=(et-st.st)/1.6;if(q<1){x.strokeStyle=`rgba(255,255,255,${.7*(1-q)})`;x.lineWidth=1.4;for(let r=0;r<3;r++){x.beginPath();x.ellipse(st.sx,shore-4*k,(8+q*40+r*8)*k,(2+q*8+r*2)*k,0,0,7);x.stroke()}}}
    for(const c of st.conf){c.x+=c.vx*rdt*60;c.y+=c.vy*rdt*60;c.vy+=.04*rdt*60;c.r+=.1;if(c.y<shore){x.fillStyle=c.c;x.save();x.translate(c.x,c.y);x.rotate(c.r);x.fillRect(-1.5,-.8,3,1.6);x.restore()}}
   }},
   kitefest:cmbL([['kite',0,-.22,6],['kite',.33,0,-8],['kite',.66,.22,2],['redballoon',.2,.1,0]]),
   surfcomp:cmbL([['surfer',0,0,0],['surfer',.33,0,-10],['surfer',.66,0,8],['sup',.1,0,0],['jetski',.5,0,4]]),
   skyshow:cmbL([['parasail',0,-.15,0],['parasail',.5,.15,-6],['seaplane',.2,0,0],['heli',.4,0,0],['heli',.9,0,-20]]),
   animals:cmbL([['penguin',0,0,0],['rabbit',.25,0,0],['otter',.1,0,0],['seal',.5,0,0],['ducks',.35,0,0],['flamingo',.7,0,0],['fox',.6,0,0],['tanuki',.85,0,0],['shiba',.15,0,0],['capy',.4,-.1,0],['swan',.3,0,0],['butterfly',.55,0,0],['parrot',.75,0,0],['orca',.05,0,0]]),
   biolum:cmbL([['biolum',0,0,0,.5],['jelly',.2,-.15,0],['jelly',.7,.15,0]]),
   torofest:cmbL([['toro',0,0,0],['toro',.5,0,0],['minilantern',.2,0,0],['lanternwalk',.6,0,0]]),
   lightparade:cmbL([['lanternwalk',0,0,0],['glowsticks',.3,0,0],['minilantern',.5,-.1,0],['sparklers',.15,.05,0]]),
   ufos:cmbL([['ufo',0,-.2,0],['ufo',.45,.2,-12],['ufo',.8,0,10]]),
   yacht:{layer:'sea',draw(p,st,et){const a=fade(p,.04,.06);st.b??=Array.from({length:6},(_,i)=>({f:.18+i*.1+Math.random()*.05,sp:R(.9,1.4),off:Math.random(),c:['#ff5c8a','#ffd23f','#55e0b4','#7aa2ff','#ffffff','#ff9a3c'][i]}));x.globalAlpha=a;
     for(const b of st.b.slice().sort((u,v)=>u.f-v.f)){const u=(p*b.sp*1.6+b.off)%1,bx=lerp(-50*k,W+50*k,u),by=seaY(b.f)+Math.sin(et*1.5+b.off*6)*k,sc=k*(.45+b.f*.9);
       x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(bx-14*sc,by+1*sc,16*sc,1.6*sc,0,0,7);x.fill();
       x.fillStyle=sil('#3a2a20');x.beginPath();x.moveTo(bx-12*sc,by-2*sc);x.lineTo(bx+13*sc,by-2*sc);x.lineTo(bx+9*sc,by+2*sc);x.lineTo(bx-9*sc,by+2*sc);x.fill();
       x.strokeStyle=sil('#4a3a2a');x.lineWidth=.8*sc;x.beginPath();x.moveTo(bx,by-2*sc);x.lineTo(bx,by-28*sc);x.stroke();
       x.fillStyle=sil(b.c);x.beginPath();x.moveTo(bx+1*sc,by-27*sc);x.quadraticCurveTo(bx+13*sc,by-14*sc,bx+11*sc,by-4*sc);x.lineTo(bx+1*sc,by-4*sc);x.fill();
       x.fillStyle=sil('#f4f4f4');x.beginPath();x.moveTo(bx-1*sc,by-24*sc);x.lineTo(bx-1*sc,by-5*sc);x.lineTo(bx-10*sc,by-5*sc);x.fill()}x.globalAlpha=1}},
   laser:{layer:'sky',draw(p,st,et){const a=fade(p,.04,.08),ox=WL+WW*.5,oy=hz;x.save();x.globalCompositeOperation='lighter';const mode=Math.floor(et/8)%3;
     for(let i=0;i<8;i++){const ph=i/8;let an;if(mode===0)an=-Math.PI/2+Math.sin(et*.9+ph*6)*.9;else if(mode===1)an=-Math.PI+.25+ph*(Math.PI-.5)+Math.sin(et*1.6)*.15;else an=-Math.PI/2+(ph-.5)*1.6*Math.cos(et*1.2);
       const L=Math.max(W,hz)*1.4,hue=(et*60+i*45)%360;x.strokeStyle=`hsla(${hue},100%,60%,${.55*a})`;x.lineWidth=2.2*k;x.beginPath();x.moveTo(ox,oy);x.lineTo(ox+Math.cos(an)*L,oy+Math.sin(an)*L);x.stroke();
       x.strokeStyle=`hsla(${hue},100%,85%,${.5*a})`;x.lineWidth=.7*k;x.stroke()}
     glow(ox,oy,40*k,`rgba(180,140,255,${.5*a})`);if(Math.floor(et*2)%5===0){x.fillStyle=`rgba(255,255,255,${.05*a})`;x.fillRect(0,0,W,hz)}x.restore()}},
   firedance:{layer:'beach',draw(p,st,et){const a=fade(p,.05,.08),cx=WL+WW*.64+Math.sin(et*.5)*10*k,gy=shore+20*k;st.t??=[[],[]];st.s??=[];x.globalAlpha=a;evShad(cx,gy,8*k);human(cx,gy,.95*k,0,'#26203a','#d9a982',false,Math.sin(et*.5)>0?1:-1);
     x.save();x.globalCompositeOperation='lighter';[0,1].forEach(j=>{const hx=cx+(j?6:-6)*k,hy=gy-21*k,an=et*(j?-6.5:6)+j*Math.PI,rr=11*k,fx=hx+Math.cos(an)*rr,fy=hy+Math.sin(an)*rr*.9,tr=st.t[j];tr.push([fx,fy]);if(tr.length>14)tr.shift();
       tr.forEach((q,n)=>{const f=n/tr.length;x.globalAlpha=a*f*.7;glow(q[0],q[1],(3+5*f)*k,'rgba(255,140,40,.8)')});x.globalAlpha=a;glow(fx,fy,9*k,'rgba(255,200,90,.9)');if(Math.random()<.5)st.s.push({x:fx,y:fy,vx:R(-.6,.6)*k,vy:R(-1,.2)*k,l:1})});
     for(const s of st.s){s.x+=s.vx;s.y+=s.vy;s.vy+=.03*k;s.l-=.04;x.globalAlpha=a*Math.max(0,s.l);x.fillStyle='#ffd27a';x.fillRect(s.x,s.y,1.4*k,1.4*k)}st.s=st.s.filter(s=>s.l>0);x.restore();x.globalAlpha=1}},
   bonodori:{layer:'beach',draw(p,st,et){const a=fade(p,.04,.06),cx=WL+WW*.5,gy=shore+12*k,RX=WW*.3,RY=9*k,C=['#ff7a9a','#7aa2ff','#ffd23f','#55e0b4','#c58cff','#ff9a3c'];x.globalAlpha=a;
     const ds=Array.from({length:12},(_,i)=>{const th=i/12*Math.PI*2+et*.18;return{th,px:cx+Math.cos(th)*RX,py:gy+10*k+Math.sin(th)*RY,i}}).sort((u,v)=>u.py-v.py);
     const dancer=d=>{const sc=k*(.72+.12*(Math.sin(d.th)+1)/2),bob=Math.abs(Math.sin(et*2.4+d.i))*2*k;evShad(d.px,d.py,5*sc/k*k);x.save();x.translate(0,-bob);human(d.px,d.py,sc,0,C[d.i%6],'#e9bf98',false,Math.cos(d.th)>0?-1:1,{hair:'#2a1a10',pants:C[d.i%6]});x.restore()};
     ds.filter(d=>Math.sin(d.th)<0).forEach(dancer);
     // やぐら
     x.fillStyle=sil('#7a4a2a');x.fillRect(cx-16*k,gy-26*k,32*k,5*k);[-14,-5,4,13].forEach(o=>x.fillRect(cx+o*k,gy-21*k,2*k,21*k));x.fillStyle=sil('#d23b3b');x.fillRect(cx-16*k,gy-21*k,32*k,3*k);
     x.fillStyle=sil('#5a3420');x.beginPath();x.moveTo(cx-19*k,gy-38*k);x.lineTo(cx+19*k,gy-38*k);x.lineTo(cx+15*k,gy-44*k);x.lineTo(cx-15*k,gy-44*k);x.fill();x.fillRect(cx-14*k,gy-38*k,2*k,12*k);x.fillRect(cx+12*k,gy-38*k,2*k,12*k);
     const db=Math.sin(et*7)>.6?-2*k:0;human(cx,gy-26*k,.75*k,0,'#ffffff','#e9bf98',false,1,{hair:'#111111'});x.fillStyle=sil('#8a3a1a');x.beginPath();x.ellipse(cx+7*k,gy-31*k,4*k,5*k,0,0,7);x.fill();x.strokeStyle='#2a1a10';x.lineWidth=1*k;x.beginPath();x.moveTo(cx+2*k,gy-38*k+db);x.lineTo(cx+5*k,gy-34*k);x.stroke();
     // ちょうちん
     x.strokeStyle='rgba(40,30,20,.6)';x.lineWidth=.7;[[-1],[1]].forEach(([s])=>{x.beginPath();x.moveTo(cx,gy-44*k);x.quadraticCurveTo(cx+s*WW*.2,gy-30*k,cx+s*WW*.42,gy-40*k);x.stroke()});
     x.save();x.globalCompositeOperation=dark>.4?'lighter':'source-over';for(let i=1;i<=6;i++)[-1,1].forEach(s=>{const u=i/7,lx=cx+s*(2*u*(1-u)*WW*.2+u*u*WW*.42),ly=(1-u)*(1-u)*(gy-44*k)+2*u*(1-u)*(gy-30*k)+u*u*(gy-40*k);if(dark>.4)glow(lx,ly+3*k,9*k,'rgba(255,140,80,.45)');x.fillStyle=i%2?'#ff5a4a':'#ffe7a8';x.beginPath();x.ellipse(lx,ly+3*k,2.4*k,3.2*k,0,0,7);x.fill()});x.restore();
     ds.filter(d=>Math.sin(d.th)>=0).forEach(dancer);
     if(Math.floor(et*1.2)%2===0){const q=(et*1.2)%1;x.globalAlpha=a*(1-q);x.fillStyle='#ffe7a8';x.font=`${9*k}px sans-serif`;x.textAlign='center';x.fillText(['ドン','♪','カッ','♫'][Math.floor(et)%4],cx+22*k+q*8*k,gy-48*k-q*12*k)}x.globalAlpha=1}},
   magichour:{layer:'sky',draw(p,st,et){const a=fade(p,.12,.15);const g=x.createLinearGradient(0,0,0,hz);g.addColorStop(0,`rgba(255,120,170,${.18*a})`);g.addColorStop(.6,`rgba(255,170,90,${.3*a})`);g.addColorStop(1,`rgba(255,220,140,${.45*a})`);x.fillStyle=g;x.fillRect(0,0,W,hz);
     x.save();x.globalCompositeOperation='lighter';const sx=WL+WW*.5,sy=hz;for(let i=0;i<9;i++){const an=-Math.PI+(i+.5)/9*Math.PI+Math.sin(et*.2+i)*.03;x.fillStyle=`rgba(255,210,150,${.07*a})`;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx+Math.cos(an-.05)*W,sy+Math.sin(an-.05)*W);x.lineTo(sx+Math.cos(an+.05)*W,sy+Math.sin(an+.05)*W);x.fill()}x.restore()}},

   fest:{layer:'beach',draw(p,st,et){const a=fade(p,.03,.05);x.globalAlpha=a;const y0=shore+4*k,L0=WL+WW*.05,R0=WL+WW*.95;
     // bunting
     x.strokeStyle='rgba(60,40,30,.7)';x.lineWidth=.8;x.beginPath();x.moveTo(L0,y0-34*k);x.quadraticCurveTo((L0+R0)/2,y0-22*k,R0,y0-34*k);x.stroke();const C=['#ff5c8a','#ffd23f','#55e0b4','#7aa2ff','#ff9a3c'];
     for(let i=1;i<18;i++){const u=i/18,fx=lerp(L0,R0,u),fy=y0-34*k+Math.sin(u*Math.PI)*12*k+Math.sin(et*2+i)*.6*k;x.fillStyle=sil(C[i%5]);x.beginPath();x.moveTo(fx-3*k,fy);x.lineTo(fx+3*k,fy);x.lineTo(fx,fy+6*k);x.fill()}
     // paper lanterns at night
     if(dark>.4){x.save();x.globalCompositeOperation='lighter';for(let i=1;i<6;i++){const u=i/6,lx=lerp(L0,R0,u),ly=y0-33*k+Math.sin(u*Math.PI)*12*k+8*k;glow(lx,ly,10*k,'rgba(255,150,80,.45)');x.fillStyle='rgba(255,120,80,.9)';x.beginPath();x.ellipse(lx,ly,2.6*k,3.4*k,0,0,7);x.fill()}x.restore()}
     // stall
     const sx=WL+WW*.5,sy=shore+30*k;x.fillStyle=sil('#8a5a3a');x.fillRect(sx-14*k,sy-14*k,28*k,14*k);x.fillStyle=sil('#ff5c5c');for(let i=0;i<6;i++){x.fillStyle=sil(i%2?'#ffffff':'#ff5c5c');x.fillRect(sx-16*k+i*5.4*k,sy-22*k,5.4*k,6*k)}
     x.fillStyle='#fff';x.font=`${6*k}px sans-serif`;x.textAlign='center';x.fillText('やたい',sx,sy-6*k);
     // crowd along the shore
     st.c??=Array.from({length:9},(_,i)=>({x:.3+i*.075+Math.random()*.03,c:C[i%5],ph:Math.random()*6,d:Math.random()<.5?1:-1}));
     for(const c of st.c){const hx=WL+WW*c.x,gy=shore+8*k+(c.x*13%3)*k,j=Math.max(0,Math.sin(et*3+c.ph))*1.8*k;evShad(hx,gy,4*k);human(hx,gy-j,.7*k,0,c.c,'#e9bf98',false,c.d)}
     x.globalAlpha=1}},
   cruise:{layer:'sea',draw(p,st,et){const sx=lerp(W+220*k,-220*k,p),sy=hz+6*k,s=.9*k,a=fade(p,.04,.04);x.globalAlpha=a;x.save();x.translate(sx,sy);
     x.fillStyle='#e9ecf4';x.beginPath();x.moveTo(-130*s,-6*s);x.lineTo(140*s,-6*s);x.lineTo(124*s,8*s);x.lineTo(-120*s,8*s);x.fill();x.fillStyle='#1d2a4a';x.fillRect(-120*s,4*s,244*s,4*s);
     for(let d=0;d<4;d++){x.fillStyle=d%2?'#dfe3ee':'#f4f6fb';x.fillRect((-110+d*12)*s,(-14-d*8)*s,(200-d*30)*s,8*s)}
     x.fillStyle='#c0392b';x.fillRect(40*s,-52*s,14*s,16*s);x.fillRect(64*s,-52*s,14*s,16*s);x.fillStyle='#222';x.fillRect(40*s,-54*s,14*s,3*s);x.fillRect(64*s,-54*s,14*s,3*s);
     x.globalCompositeOperation='lighter';const lit=dark>.3;for(let d=0;d<5;d++)for(let i=0;i<34-d*5;i++){if(((i*7+d*3)%5)===0)continue;x.fillStyle=lit?'rgba(255,214,130,.95)':'rgba(70,90,130,.8)';x.fillRect((-108+d*12+i*6)*s,(-10-d*8+ (d===0?6:0))*s,2.4*s,2*s)}
     if(lit){const C=['255,92,138','255,210,63','85,224,180','122,162,255'];for(let i=0;i<24;i++){const tx=lerp(-128,138,i/23)*s,ty=(-46+Math.abs(i-11.5)*-1.6+20)*s;x.fillStyle=`rgba(${C[i%4]},${.6+.4*Math.sin(et*3+i)})`;x.beginPath();x.arc(tx,ty-30*s,1.4*s,0,7);x.fill()}
       for(let i=0;i<8;i++){x.fillStyle=`rgba(255,214,140,${.12})`;x.fillRect((-100+i*28)*s+Math.sin(et*2+i)*2,10*s,2.5*s,(14+i%3*6)*s)}}
     x.restore();x.globalAlpha=1}},
   grandfw:{layer:'sky',draw(p,st,et,rdt){st.a??={};st.b??={};st.c??={};SHOW.fireworks.draw(p,st.a,et,rdt);SHOW.fireworks.draw(p,st.b,et+.41,rdt);if(p>.75)SHOW.fireworks.draw(Math.min(.9,p),st.c,et+.2,rdt)}},
   constel:{layer:'sky',draw(p,st,et){const C=[['オリオン座',[[.3,.2],[.7,.22],[.42,.5],[.5,.52],[.58,.54],[.28,.85],[.72,.82]],[[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[0,1]]],
      ['カシオペヤ座',[[.1,.4],[.3,.65],[.5,.45],[.7,.7],[.9,.42]],[[0,1],[1,2],[2,3],[3,4]]],
      ['はくちょう座',[[.5,.1],[.5,.45],[.5,.9],[.15,.38],[.85,.52]],[[0,1],[1,2],[3,1],[1,4]]],
      ['おおぐま座',[[.05,.3],[.22,.38],[.38,.42],[.52,.5],[.55,.75],[.85,.78],[.82,.5]],[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]]]];
     const n=C.length,seg=1/n,i=Math.min(n-1,Math.floor(p/seg)),q=(p-i*seg)/seg,[nm,pts,ln]=C[i],bx=WL+WW*.2,by=hz*.12,bw=WW*.6,bh=hz*.6,a=fade(q,.12,.18);
     x.save();x.globalCompositeOperation='lighter';const P=pts.map(([u,v])=>[bx+u*bw,by+v*bh]);
     ln.forEach(([u,v],j)=>{const f=Math.max(0,Math.min(1,(q-.1-j*.05)/.25));if(f<=0)return;x.strokeStyle=`rgba(160,200,255,${.55*a})`;x.lineWidth=1.4*k;x.beginPath();x.moveTo(P[u][0],P[u][1]);x.lineTo(lerp(P[u][0],P[v][0],f),lerp(P[u][1],P[v][1],f));x.stroke()});
     P.forEach(([px,py],j)=>{glow(px,py,10*k,`rgba(200,225,255,${.6*a})`);x.fillStyle=`rgba(255,255,255,${a})`;x.beginPath();x.arc(px,py,2*k,0,7);x.fill()});
     x.globalCompositeOperation='source-over';x.font=`${13*k}px sans-serif`;x.textAlign='center';x.fillStyle=`rgba(220,235,255,${a*Math.min(1,q*3)})`;x.fillText(nm,bx+bw/2,by+bh+16*k);x.restore()}},
   goldrain:{layer:'front',draw(p,st,et){st.g??=Array.from({length:90},()=>({x:R(0,W),y:R(-H,0),v:R(1.5,3.5)*k,r:R(1.5,3.5)*k,ph:R(0,6)}));const a=fade(p,.05,.15);x.save();x.globalCompositeOperation='lighter';
     glow(W/2,WT+WH*.5,Math.max(W,H)*.7,`rgba(255,200,80,${.12*a})`);for(const g of st.g){g.y+=g.v;if(g.y>H)g.y=-10;const tw=.6+.4*Math.sin(et*6+g.ph);x.globalAlpha=a*tw;x.fillStyle='#ffd86a';x.beginPath();x.ellipse(g.x,g.y,g.r*Math.abs(Math.sin(et*3+g.ph))+.5,g.r,0,0,7);x.fill();x.strokeStyle='rgba(255,230,150,.35)';x.lineWidth=1;x.beginPath();x.moveTo(g.x,g.y-g.r);x.lineTo(g.x,g.y-g.r-g.v*5);x.stroke()}x.restore()}},
   mstorm:{layer:'sky',draw(p,st,et){st.a??={};st.b??={};st.c??={};const q=Math.min(p,.85);EV.meteors.draw(q,st.a,et);EV.meteors.draw(q,st.b,et+.5);EV.meteors.draw(q,st.c,et+1.1);x.save();x.globalCompositeOperation='lighter';glow(W/2,hz*.3,W*.8,`rgba(120,140,255,${.08*fade(p,.1,.15)})`);x.restore()}},
   whaleshow:{layer:'sea',draw(p,st,et){const a=fade(p,.03,.06);if(a<.05)return;const D=EV.whale.dur,cy=Math.floor(et/D);if(st.cy!==cy){st.cy=cy;st.sub={}}x.globalAlpha=a;EV.whale.draw((et%D)/D,st.sub,et);x.globalAlpha=1}},
   eclipse:{layer:'front',draw(p,st,et){const cx=sunUp>.05?sunX:WL+WW*.5,cy=sunUp>.05?sunY:hz*.4,sr=17*k,tot=Math.max(0,1-Math.abs(p-.5)/.18),mx=cx+lerp(60,-60,p)*k*.7;x.save();
     x.fillStyle=`rgba(4,6,24,${.62*tot})`;x.fillRect(0,0,W,H);x.globalCompositeOperation='lighter';if(tot>0){glow(cx,cy,sr*7*tot,`rgba(230,240,255,${.55*tot})`);for(let i=0;i<14;i++){const an=i/14*Math.PI*2+et*.05;x.strokeStyle=`rgba(255,255,255,${.25*tot})`;x.lineWidth=2*k;x.beginPath();x.moveTo(cx+Math.cos(an)*sr,cy+Math.sin(an)*sr);x.lineTo(cx+Math.cos(an)*sr*(2.2+Math.sin(i*3)*.6),cy+Math.sin(an)*sr*(2.2+Math.sin(i*3)*.6));x.stroke()}}
     if(tot>.9){const d=Math.sin(et*2)*.5+.5;glow(cx+sr*.7,cy-sr*.7,sr*.9,`rgba(255,255,255,${.9*d*(tot-.9)*10})`)}
     x.globalCompositeOperation='source-over';x.fillStyle=`rgba(8,8,16,${Math.max(0,1-Math.abs(mx-cx)/(2.2*sr))})`;x.beginPath();x.arc(mx,cy,sr*1.03,0,7);x.fill();x.restore()}},
   dragon:{layer:'sky',draw(p,st,et){const a=fade(p,.06,.08),N=46,path=u=>[lerp(-W*.4,W*1.4,u),hz*.6+Math.sin(u*10)*hz*.14+Math.sin(u*23)*hz*.04],u0=p*1.35;x.save();x.globalAlpha=a;
     const P=[];for(let i=0;i<N;i++)P.push(path(u0-i*.011));
     x.save();x.globalCompositeOperation='lighter';glow(P[0][0]+30*k,P[0][1]-6*k,26*k,'rgba(255,240,180,.8)');x.fillStyle='#fffbe6';x.beginPath();x.arc(P[0][0]+30*k,P[0][1]-6*k,6*k,0,7);x.fill();x.restore();
     for(let i=N-1;i>=0;i--){const [px,py]=P[i],rr=(i<3?14:Math.max(3,16.5-i*.28))*k,nx=P[Math.max(0,i-1)],an=Math.atan2(py-nx[1],px-nx[0]);
       if(i%4===2&&i<N-6){x.fillStyle='#d8432e';x.beginPath();x.moveTo(px+Math.cos(an+1.57)*rr,py+Math.sin(an+1.57)*rr);x.lineTo(px+Math.cos(an+1.57)*(rr+9*k)+Math.cos(an)*4*k,py+Math.sin(an+1.57)*(rr+9*k)+Math.sin(an)*4*k);x.lineTo(px+Math.cos(an)*6*k+Math.cos(an+1.57)*rr,py+Math.sin(an)*6*k+Math.sin(an+1.57)*rr);x.fill()}
       if(i===10||i===26){x.strokeStyle='#2f7a4a';x.lineWidth=3*k;x.lineCap='round';for(const sg of [-1,1]){x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(an-sg*1.2)*16*k,py+Math.sin(an-sg*1.2)*16*k+6*k);x.stroke()}}
       const g=x.createRadialGradient(px-rr*.3,py-rr*.4,1,px,py,rr);g.addColorStop(0,'#9ff0b4');g.addColorStop(.6,'#3a9a5c');g.addColorStop(1,'#1e5a3a');x.fillStyle=g;x.beginPath();x.arc(px,py,rr,0,7);x.fill();
       if(i>2){x.fillStyle='rgba(255,230,140,.35)';x.beginPath();x.arc(px+Math.cos(an-1.57)*rr*.5,py+Math.sin(an-1.57)*rr*.5,rr*.35,0,7);x.fill()}}
     const [hx,hy]=P[0],an=Math.atan2(P[0][1]-P[2][1],P[0][0]-P[2][0]);x.translate(hx,hy);x.rotate(an);const sc=k*1.3;
     x.fillStyle='#3a9a5c';x.beginPath();x.ellipse(8*sc,0,18*sc,10*sc,0,0,7);x.fill();x.fillStyle='#2f7a4a';x.beginPath();x.ellipse(20*sc,4*sc,10*sc,5*sc,0,0,7);x.fill();
     x.strokeStyle='#ffd86a';x.lineWidth=2.4*sc;x.lineCap='round';x.beginPath();x.moveTo(2*sc,-8*sc);x.quadraticCurveTo(-8*sc,-20*sc,-16*sc,-22*sc);x.moveTo(6*sc,-9*sc);x.quadraticCurveTo(0,-22*sc,-6*sc,-28*sc);x.stroke();
     x.strokeStyle='rgba(255,240,200,.85)';x.lineWidth=1.2*sc;x.beginPath();x.moveTo(26*sc,6*sc);x.quadraticCurveTo(36*sc,14*sc+Math.sin(et*3)*5*sc,30*sc,26*sc);x.moveTo(26*sc,2*sc);x.quadraticCurveTo(40*sc,-4*sc+Math.sin(et*3+1)*5*sc,46*sc,6*sc);x.stroke();
     x.fillStyle='#ffef7a';x.beginPath();x.arc(12*sc,-3*sc,2.6*sc,0,7);x.fill();x.fillStyle='#200';x.beginPath();x.arc(13*sc,-3*sc,1.1*sc,0,7);x.fill();x.restore()}},
   balloons:{layer:'front',draw(p,st,et){st.b??=Array.from({length:22},(_,i)=>({x:R(WL,WL+WW),y:WT+WH+R(10,260)*k,v:R(.35,.7)*k,ph:R(0,6),c:['#ff4f6d','#ffd23f','#3ea0ff','#55e0b4','#c48bff','#ff9a3c'][i%6],r:R(9,13)*k}));const a=fade(p,.03,.1);x.globalAlpha=a;
     for(const b of st.b){b.y-=b.v;const bx=b.x+Math.sin(et*.9+b.ph)*10*k;if(b.y<-40*k&&p<.8)b.y=WT+WH+R(10,80)*k;x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=.8;x.beginPath();x.moveTo(bx,b.y+b.r*1.2);x.quadraticCurveTo(bx+Math.sin(et*2+b.ph)*5*k,b.y+b.r*2.4,bx,b.y+b.r*3.6);x.stroke();
       x.fillStyle=b.c;x.beginPath();x.ellipse(bx,b.y,b.r*.85,b.r,0,0,7);x.fill();x.beginPath();x.moveTo(bx-2*k,b.y+b.r*1.15);x.lineTo(bx+2*k,b.y+b.r*1.15);x.lineTo(bx,b.y+b.r*.95);x.fill();x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.ellipse(bx-b.r*.3,b.y-b.r*.4,b.r*.18,b.r*.3,-.4,0,7);x.fill()}x.globalAlpha=1}},
   suika:{layer:'beach',draw(p,st,et){const wx=WL+WW*.68,gy=WT+WH*.9,a=fade(p,.04,.08),hit=.62;x.globalAlpha=a;
     const px=p<hit?lerp(WL+WW*.25,wx-22*k,Math.min(1,p/hit))+Math.sin(et*2.2)*14*k*(1-p/hit):wx-22*k;evShad(px,gy,9*k);
     x.fillStyle='rgba(0,0,0,.22)';x.beginPath();x.ellipse(wx,gy,18*k,4*k,0,0,7);x.fill();
     if(p<hit){x.fillStyle='#2f8a3a';x.beginPath();x.ellipse(wx,gy-11*k,15*k,12*k,0,0,7);x.fill();x.strokeStyle='#14501e';x.lineWidth=2*k;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(wx+i*5*k,gy-22*k);x.quadraticCurveTo(wx+i*7*k,gy-11*k,wx+i*5*k,gy);x.stroke()}}
     else{const q=Math.min(1,(p-hit)/.08);[-1,1].forEach(sg=>{x.save();x.translate(wx+sg*q*9*k,gy-6*k);x.rotate(sg*q*.5);x.fillStyle='#2f8a3a';x.beginPath();x.arc(0,0,13*k,sg<0?Math.PI*.5:-Math.PI*.5,sg<0?Math.PI*1.5:Math.PI*.5);x.fill();x.fillStyle='#ff4f5a';x.beginPath();x.arc(0,0,11*k,sg<0?Math.PI*.5:-Math.PI*.5,sg<0?Math.PI*1.5:Math.PI*.5);x.fill();
       x.fillStyle='#222';for(let i=0;i<4;i++){x.beginPath();x.arc(sg*(-4-i%2*3)*k,(-5+i*3.5)*k,.9*k,0,7);x.fill()}x.restore()});
       if(q<1){x.fillStyle='rgba(255,90,100,.8)';for(let i=0;i<8;i++){const an=-Math.PI*(i/7);x.beginPath();x.arc(wx+Math.cos(an)*q*30*k,gy-10*k+Math.sin(an)*q*26*k,1.6*k,0,7);x.fill()}}
       if(p>hit&&p<hit+.25){x.font=`bold ${14*k}px sans-serif`;x.textAlign='center';x.fillStyle='#fff';x.strokeStyle='#ff4f5a';x.lineWidth=3;x.strokeText('パカーン！',wx,gy-40*k);x.fillText('パカーン！',wx,gy-40*k)}}
     human(px,gy,1*k,p<hit?et*5:0,'#3ea0ff','#f1c7a0',false);x.fillStyle='#222';x.fillRect(px-3.5*k,gy-26.5*k,7*k,2*k);
     const sw=p<hit-.04?-1.2+Math.sin(et*3)*.3:p<hit?-2.2:.6;x.save();x.translate(px,gy-19*k);x.rotate(sw);x.strokeStyle='#a0703c';x.lineWidth=2.2*k;x.lineCap='round';x.beginPath();x.moveTo(0,0);x.lineTo(24*k,0);x.stroke();x.restore();x.globalAlpha=1}},
   rainbow:{layer:'sky',draw(p,st,et){EV.rainbow.draw(p,st,et)}},
   balloonfest:{layer:'sky',draw(p,st,et){st.b??=[0,1,2,3,4,5].map(i=>({x:WL+WW*(.1+i*.16),y:hz*.62+R(0,50)*k,s:R(.55,1.1),v:R(.05,.1),c:[['#ff5c5c','#ffd23f'],['#3ea0ff','#ffffff'],['#55e0b4','#ff9a3c'],['#c48bff','#ffe066'],['#ff7aa8','#ffffff'],['#ffb347','#3e8fc4']][i],d:R(0,6)}));const a=fade(p,.05,.1);
     st.b.sort((A,B)=>A.s-B.s);for(const b of st.b){const by=b.y-et*b.v*14*k*b.s,bx=b.x+Math.sin(et*.15+b.d)*20*k,sc=b.s*k;x.globalAlpha=a*(.55+.45*b.s);
       for(let i=0;i<6;i++){x.fillStyle=b.c[i%2];x.beginPath();x.ellipse(bx+(i-2.5)*4.4*sc,by,4.6*sc,(22-Math.abs(i-2.5)*1.6)*sc,0,0,7);x.fill()}
       x.fillStyle=b.c[0];x.beginPath();x.arc(bx,by-2*sc,15*sc,Math.PI,0);x.fill();x.strokeStyle='rgba(60,40,30,.7)';x.lineWidth=.8;x.beginPath();x.moveTo(bx-6*sc,by+20*sc);x.lineTo(bx-4*sc,by+30*sc);x.moveTo(bx+6*sc,by+20*sc);x.lineTo(bx+4*sc,by+30*sc);x.stroke();
       x.fillStyle='#8a5a32';x.fillRect(bx-4.5*sc,by+29*sc,9*sc,6*sc);if(Math.sin(et*1.5+b.d*3)>.75){x.save();x.globalCompositeOperation='lighter';glow(bx,by+22*sc,8*sc,'rgba(255,170,60,.9)');x.restore()}}x.globalAlpha=1}},
   dolphinshow:{layer:'sea',draw(p,st,et){const a=fade(p,.03,.06);if(a<.05)return;const D=EV.dolphins.dur,cy=Math.floor(et/D);if(st.cy!==cy){st.cy=cy;st.sub={}}x.globalAlpha=a;EV.dolphins.draw((et%D)/D,st.sub,et);x.globalAlpha=1}},
   airshow:{layer:'sky',draw(p,st,et){const cx=WL+WW*.5,cy=hz*.5,S0=Math.min(WW,hz)*.028,heart=t=>[cx+16*Math.pow(Math.sin(t),3)*S0,cy-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*S0];
     st.tr??=[[],[]];const draw=Math.min(1,p/.55),out=Math.max(0,(p-.55)/.45);const jets=[0,1].map(j=>{let pt;if(p<.55){const t=draw*Math.PI;pt=heart(j?-t:t)}else{const e=heart(0);pt=[e[0]+(j?-1:1)*out*WW*.8,e[1]-out*hz*.3]}return pt});
     jets.forEach((pt,j)=>{const tr=st.tr[j];if(!tr.length||Math.hypot(pt[0]-tr[tr.length-1][0],pt[1]-tr[tr.length-1][1])>2)tr.push([pt[0],pt[1],p<.55])});
     const fadeT=p>.7?1-(p-.7)/.3:1;st.tr.forEach((tr,j)=>{x.strokeStyle=j?`rgba(255,110,140,${.75*fadeT})`:`rgba(255,255,255,${.8*fadeT})`;x.lineWidth=4*k;x.lineCap='round';x.beginPath();let on=false;for(const q of tr){if(q[2]){on?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]);on=true}else on=false}x.stroke()});
     jets.forEach((pt,j)=>{const tr=st.tr[j],pr=tr[Math.max(0,tr.length-3)],an=Math.atan2(pt[1]-pr[1],pt[0]-pr[0]);x.save();x.translate(pt[0],pt[1]);x.rotate(an);x.fillStyle='#e8ecf4';x.beginPath();x.moveTo(8*k,0);x.lineTo(-6*k,-2*k);x.lineTo(-6*k,2*k);x.fill();x.beginPath();x.moveTo(1*k,0);x.lineTo(-3*k,-7*k);x.lineTo(-4*k,0);x.lineTo(-3*k,7*k);x.fill();x.restore()})}},
   bubbles:{layer:'front',draw(p,st,et){st.b??=Array.from({length:26},()=>({x:R(0,W),y:R(WT+WH*.6,WT+WH*1.3),r:R(5,14)*k,v:R(.3,.8)*k,ph:R(0,6)}));const a=fade(p,.05,.12);
     for(const b of st.b){b.y-=b.v;b.x+=Math.sin(et*.8+b.ph)*.4;if(b.y<-20)b.y=WT+WH+R(0,60);x.globalAlpha=a*.8;const g=x.createRadialGradient(b.x-b.r*.3,b.y-b.r*.3,1,b.x,b.y,b.r);g.addColorStop(0,'rgba(255,255,255,.05)');g.addColorStop(.8,'rgba(180,220,255,.08)');g.addColorStop(1,`hsla(${(et*40+b.ph*60)%360},90%,75%,.55)`);
       x.fillStyle=g;x.beginPath();x.arc(b.x,b.y,b.r,0,7);x.fill();x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(b.x-b.r*.35,b.y-b.r*.4,b.r*.22,b.r*.12,-.6,0,7);x.fill()}x.globalAlpha=1}},
   fireflies:{layer:'beach',draw(p,st,et){st.f??=Array.from({length:34},()=>({x:R(0,W),y:R(shore,WT+WH),ph:R(0,6),sp:R(.2,.5)}));const a=fade(p,.06,.12);x.save();x.globalCompositeOperation='lighter';
     for(const f of st.f){const px=f.x+Math.sin(et*f.sp+f.ph)*24*k,py=f.y+Math.cos(et*f.sp*1.3+f.ph)*12*k-Math.sin(et*.2+f.ph)*10*k,b=Math.max(0,Math.sin(et*1.2+f.ph*3));x.globalAlpha=a*b;glow(px,py,10*k,'rgba(200,255,120,.7)');x.fillStyle='#f4ffc8';x.beginPath();x.arc(px,py,1.6*k,0,7);x.fill()}x.restore()}},
   lanterns:{layer:'sky',draw(p,st,et){EV.lanterns.draw(p,st,et)}},
   bigfire:{layer:'beach',draw(){}},
   meteors:{layer:'sky',draw(p,st,et){EV.meteors.draw(Math.min(p,.85),st,et)}},
   sakura:{layer:'front',draw(p,st,et){st.s??=Array.from({length:55},()=>({x:R(0,W),y:R(-H,0),v:R(.5,1.2)*k,r:R(0,6),vr:R(-.05,.05),sw:R(0,6),sz:R(3,6)*k}));const a=fade(p,.05,.15);
     for(const q of st.s){q.y+=q.v;q.x+=Math.sin(et+q.sw)*.6;q.r+=q.vr;if(q.y>H+10){q.y=-10;q.x=R(0,W)}x.save();x.globalAlpha=a*.9;x.translate(q.x,q.y);x.rotate(q.r);x.scale(1,Math.abs(Math.cos(q.r*2))*.6+.4);
       x.fillStyle='#ffc6d9';x.beginPath();x.moveTo(0,-q.sz);x.quadraticCurveTo(q.sz,0,0,q.sz);x.quadraticCurveTo(-q.sz,0,0,-q.sz);x.fill();x.fillStyle='rgba(255,140,180,.6)';x.beginPath();x.arc(0,q.sz*.5,q.sz*.25,0,7);x.fill();x.restore()}}},
   fireworks:{layer:'sky',draw(p,st,et,rdt){st.b??=[];st.n??=0;if(p<.92&&et>st.n){st.n=et+R(.35,1.1);const bx=R(W*.08,W*.92),by=R(hz*.15,hz*.6),c=['255,92,138','255,210,63','85,224,180','122,162,255','255,154,60','200,140,255'][Math.random()*6|0],big=Math.random()<.3,n=big?90:56;
       for(let i=0;i<n;i++){const ang=i/n*Math.PI*2,v=R(1.2,big?3:2.2)*k;st.b.push({x:bx,y:by,px:bx,py:by,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v,l:1,c})}try{sfx.boom(big)}catch(e){}st.flash={x:bx,y:by,l:1,c}}
     x.save();x.globalCompositeOperation='lighter';if(st.flash&&st.flash.l>0){glow(st.flash.x,st.flash.y,90*k*st.flash.l,`rgba(${st.flash.c},.35)`);st.flash.l-=.06}
     for(const b of st.b){b.px=b.x;b.py=b.y;b.x+=b.vx;b.y+=b.vy;b.vy+=.025*k;b.vx*=.985;b.vy*=.985;b.l-=.012;x.strokeStyle=`rgba(${b.c},${b.l})`;x.lineWidth=1.6*k;x.beginPath();x.moveTo(b.px,b.py);x.lineTo(b.x,b.y);x.stroke();if(b.l<.35&&Math.random()<.3){x.fillStyle=`rgba(255,250,230,${b.l*2})`;x.fillRect(b.x,b.y,1.4*k,1.4*k)}}
     st.b=st.b.filter(b=>b.l>0);x.restore()}},
   aurora:{layer:'sky',draw(p,st,et){const a=fade(p,.12,.15);x.save();x.globalCompositeOperation='lighter';const C=['80,255,170','110,210,255','190,120,255'];
     for(let r=0;r<3;r++){for(let px=0;px<=W;px+=3){const y=hz*(.22+r*.09)+Math.sin(px*.004+et*.25+r*2)*hz*.07+Math.sin(px*.012-et*.4+r)*hz*.025,h=hz*(.16+.07*Math.sin(px*.008+et*.3+r)),i=.5+.5*Math.sin(px*.02+et*.8+r*3);
       const g=x.createLinearGradient(0,y,0,y-h);g.addColorStop(0,`rgba(${C[r]},${.16*a*i})`);g.addColorStop(1,`rgba(${C[r]},0)`);x.fillStyle=g;x.fillRect(px,y-h,3,h)}}x.restore()}},
   moonbow:{layer:'sky',draw(p,st){const a=fade(p,.15,.15),cx=WL+WW*.5,cy=hz+WH*.12,R0=Math.min(W,WW*1.1)*.5;x.save();x.globalCompositeOperation='lighter';
     ['255,90,90','255,180,80','255,240,120','120,255,140','110,180,255','170,120,255'].forEach((c,i)=>{x.strokeStyle=`rgba(${c},${.11*a})`;x.lineWidth=5*k;x.beginPath();x.arc(cx,cy,R0-i*4.5*k,Math.PI,0);x.stroke()});x.restore()}},
   drones:{layer:'sky',draw(p,st,et){if(window.droneDraw)return window.droneDraw(p,st,et,{x,WL,WW,hz,k,glow,fade,ease})}}
  };
  /* ---------- v142 scene ---------- */
  Object.assign(SHOW,{
   gflash:{layer:'sea',draw(p,st,et){const a=Math.sin(Math.min(1,p)*Math.PI),sr=17*k,top=Math.max(sunY-sr,hz-sr*.9);x.save();x.globalCompositeOperation='lighter';glow(sunX,top+2*k,sr*3.4,`rgba(90,255,140,${.5*a})`);glow(sunX,hz,sr*1.6,`rgba(150,255,170,${.45*a})`);
     x.fillStyle=`rgba(120,255,150,${.95*a})`;x.beginPath();x.ellipse(sunX,top+1.2*k,sr*.55,2.2*k,0,Math.PI,0);x.fill();x.fillStyle=`rgba(210,255,220,${.8*a})`;x.beginPath();x.ellipse(sunX,top+1.4*k,sr*.3,1*k,0,Math.PI,0);x.fill();x.restore()}},
   senko:{layer:'front',draw(p,st,et){const a=fade(p,.04,.02),bx=WL+WW*.64,by=shore+(WT+WH-shore)*.38,s=k;window._senko={x:bx+8*s,y:by-22*s,t:Date.now(),p};
     x.save();x.globalAlpha=a;x.fillStyle='rgba(18,16,30,.92)';x.beginPath();x.ellipse(bx-6*s,by-2*s,9*s,11*s,0,0,7);x.fill();x.beginPath();x.arc(bx-4*s,by-18*s,6*s,0,7);x.fill();x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(bx-4*s,by+9*s,14*s,3*s,0,0,7);x.fill();
     const tx=bx+9*s,ty=by-4*s,ex=bx+11*s,ey=by+6*s;x.strokeStyle='#c86a9a';x.lineWidth=1*s;x.beginPath();x.moveTo(tx,ty);x.lineTo(ex,ey);x.stroke();
     const boost=Math.max(0,1-(performance.now()-(window._senkoBoost||0))/3500);let ballY=ey+2*s,ballA=1;
     if(p>.94){const q=(p-.94)/.06;ballY=ey+2*s+q*q*(by+9*s-ey);ballA=1-q*.6;if(!st.drop){st.drop=1;try{window.senkoDrop&&senkoDrop()}catch(e){}}}
     x.globalCompositeOperation='lighter';const stage=p<.12?0:p<.3?1:p<.7?2:p<.9?3:4;const br=(stage===0?1.6:2.6)*s;glow(tx+2*s,ballY,br*7*(1+boost),`rgba(255,150,60,${.35*ballA})`);x.fillStyle=`rgba(255,${stage===4?120:190},90,${ballA})`;x.beginPath();x.arc(ex+1*s,ballY,br,0,7);x.fill();
     if(p<.94){const n=[0,5,14,7,3][stage]*(1+boost*2.2)|0;for(let i=0;i<n;i++){const ang=Math.random()*Math.PI*2,len=(stage===3?10:stage===4?4:8+Math.random()*10)*s*(1+boost*.6),cx=ex+1*s,cy=ballY;x.strokeStyle=`rgba(255,${200+Math.random()*55|0},${120+Math.random()*80|0},${.8})`;x.lineWidth=.7*s;x.beginPath();x.moveTo(cx,cy);
       if(stage===3){x.quadraticCurveTo(cx+Math.cos(ang)*len*.6,cy-2*s,cx+Math.cos(ang)*len,cy+len*.8)}else{const mx=cx+Math.cos(ang)*len*.6,my=cy+Math.sin(ang)*len*.6;x.lineTo(mx,my);x.lineTo(mx+Math.cos(ang+.6)*len*.4,my+Math.sin(ang+.6)*len*.4);x.moveTo(mx,my);x.lineTo(mx+Math.cos(ang-.6)*len*.4,my+Math.sin(ang-.6)*len*.4)}x.stroke()}}
     x.restore()}},
   snowday:{layer:'front',draw(p,st,et,rdt){const a=fade(p,.05,.1),acc=Math.min(1,p*3)*a;st.f??=Array.from({length:110},()=>({x:R(WL,WL+WW),y:R(WT,WT+WH),r:R(1.2,3),v:R(.3,.8),ph:R(0,6)}));
     x.save();x.fillStyle=`rgba(150,160,180,${.28*a*(1-dark*.6)})`;x.fillRect(WL,WT,WW,shore-WT);const g=x.createLinearGradient(0,shore,0,WT+WH);g.addColorStop(0,`rgba(240,244,255,${.12*acc})`);g.addColorStop(.3,`rgba(240,244,255,${.32*acc})`);g.addColorStop(1,`rgba(250,252,255,${.42*acc})`);x.fillStyle=g;x.fillRect(WL,shore+3*k,WW,WT+WH-shore);
     x.fillStyle=`rgba(255,255,255,${.95*a})`;x.shadowColor='rgba(60,70,100,.55)';x.shadowBlur=2*k;for(const f of st.f){f.y+=f.v*k*(rdt||.04)*30;f.x+=Math.sin(et*.8+f.ph)*.25;if(f.y>WT+WH){f.y=WT-4;f.x=R(WL,WL+WW)}x.beginPath();x.arc(f.x,f.y,f.r*k,0,7);x.fill()}x.restore();window._snowOn=performance.now()}}
  });
  function tideLv(){const h=gameHour();return Math.cos(2*Math.PI*(h-3)/12.4)}
  function tideDraw(){if(still)return;const tl=tideLv(),bot=WT+WH;window._tide=tl;
    if(tl>.2){const a=(tl-.2)/.8,up=a*9*k;x.save();x.beginPath();x.moveTo(WL,shore-2*k);for(let i=0;i<=24;i++){const xx=WL+WW*i/24;x.lineTo(xx,shore+up+Math.sin(t*1.3+i*.9)*2*k)}x.lineTo(WL+WW,shore-2*k);x.closePath();
      const g=x.createLinearGradient(0,shore-2*k,0,shore+up+2*k);g.addColorStop(0,PAL.seaB);g.addColorStop(1,'rgba(255,255,255,.35)');x.globalAlpha=.55*a;x.fillStyle=g;x.fill();x.restore()}
    window._tidePts=[];if(tl<-.25){const a=Math.min(1,(-tl-.25)/.5);x.save();x.globalAlpha=a;
      for(const [u,v,w] of [[.07,.2,1],[.15,.6,.7],[.86,.3,1.1],[.93,.75,.6]]){const rx=WL+WW*u,ry=shore+(2+v*6)*k,rw=16*k*w;
        x.fillStyle='rgba(120,150,170,.35)';x.beginPath();x.ellipse(rx+rw*.9,ry+3*k,rw*.8,3*k,0,0,7);x.fill();
        x.fillStyle=vgrad(ry-rw*.6,ry+3*k,[[0,'#6a6470'],[1,'#2e2a34']]);x.beginPath();x.moveTo(rx-rw,ry+3*k);x.quadraticCurveTo(rx-rw*.9,ry-rw*.5,rx-rw*.2,ry-rw*.6);x.quadraticCurveTo(rx+rw*.7,ry-rw*.5,rx+rw,ry+3*k);x.closePath();x.fill();
        x.fillStyle='rgba(80,140,90,.6)';x.fillRect(rx-rw*.8,ry+1*k,rw*1.6,1.6*k);x.fillStyle='rgba(255,255,255,.5)';x.fillRect(rx+rw*.6+Math.sin(t*2+u*20)*3*k,ry+2.5*k,2*k,.8*k);
        window._tidePts.push([rx,ry,rw])}
      const cx=WL+WW*.86+Math.sin(t*.7)*14*k,cy=shore+5*k;x.fillStyle='#e0523a';x.beginPath();x.ellipse(cx,cy,3.4*k,2.2*k,0,0,7);x.fill();x.strokeStyle='#e0523a';x.lineWidth=.8*k;for(const sd of[-1,1]){x.beginPath();x.moveTo(cx+sd*3*k,cy);x.lineTo(cx+sd*5*k,cy-2*k);x.stroke()}
      x.restore()}}
  /* ---------- v145 scene：季節の 行事・雲・曜日の 住人 ---------- */
  const rdN=()=>window._fakeDate?new Date(window._fakeDate):new Date();
  const JUGOYA=[[2026,9,25],[2027,9,15],[2028,10,3],[2029,9,22],[2030,9,12],[2031,10,1],[2032,9,19]];
  let fkC=null,fkT=0;
  function festKind(){if(fkC&&performance.now()-fkT<5000)return fkC;const d=rdN(),m=d.getMonth()+1,dd=d.getDate(),o={};
    if(m===7&&dd<=7)o.tanabata=1;if(m===8&&dd>=13&&dd<=16)o.obon=1;if(m===1&&dd<=3)o.newyear=1;if(m===12&&dd>=18&&dd<=25)o.xmas=1;
    const d0=new Date(d.getFullYear(),m-1,dd);for(const [y,mm,dy] of JUGOYA){if(Math.abs(d0-new Date(y,mm-1,dy))<=864e5)o.tsukimi=1}
    fkC=o;fkT=performance.now();window._fest=o;return o}
  const bY=f=>shore+(WT+WH-shore)*f;
  function sasaDraw(){const px=WL+WW*.09,py=bY(.42),s=k;x.save();shadowE(px+4*s,py+1*s,10*s,2*s,.35);x.strokeStyle='#4f8a3a';x.lineWidth=2.6*s;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+6*s,py-50*s,px+2*s+Math.sin(t*.8)*3*s,py-96*s);x.stroke();
    const C=['#ff5c8a','#ffd23f','#55e0b4','#7aa2ff','#c98cff','#ffffff','#ff9a3c'];for(let i=0;i<9;i++){const u=.25+i*.08,sx=px+3*s+Math.sin(t*.8)*3*s*u,sy=py-96*s*u,side=i%2?1:-1,sw=Math.sin(t*1.4+i)*.25;
      x.fillStyle=dark>.6?'#2e5a2a':'#5fae4a';x.beginPath();x.ellipse(sx+side*9*s,sy,10*s,2.4*s,side*.4+sw*.3,0,7);x.fill();
      x.save();x.translate(sx+side*12*s,sy+2*s);x.rotate(sw);x.fillStyle=C[i%C.length];x.globalAlpha=dark>.6?.75:1;x.fillRect(-1.6*s,0,3.2*s,11*s);x.restore()}
    x.restore();window._sasa={x:px,y:py-50*s,t:Date.now()}}
  function toroDraw(){if(dark<.45)return;const a=Math.min(1,(dark-.45)/.3);x.save();for(let i=0;i<8;i++){const q=((t*.012+i/8)%1),px=WL-20*k+(WW+40*k)*q,f=.25+.65*((i*.618)%1),py=hz+(shore-hz)*f+Math.sin(t+i)*1.2*k,s=k*(.45+.8*f);
      x.globalAlpha=a;x.globalCompositeOperation='lighter';glow(px,py-4*s,22*s,'rgba(255,170,80,.35)');x.fillStyle='rgba(255,180,90,.25)';x.fillRect(px-1.5*s,py+2*s,3*s,14*s*f+4*s);x.globalCompositeOperation='source-over';
      x.fillStyle='#3a2414';x.fillRect(px-5*s,py,10*s,2*s);x.fillStyle='#ffe6b0';x.fillRect(px-4*s,py-9*s,8*s,9*s);x.fillStyle='rgba(255,140,60,.55)';x.fillRect(px-4*s,py-3*s,8*s,3*s);x.strokeStyle='#3a2414';x.lineWidth=.7*s;x.strokeRect(px-4*s,py-9*s,8*s,9*s)}x.restore()}
  function kadoDraw(){for(const u of [.06,.94]){const px=WL+WW*u,py=bY(.4),s=k*.9;x.save();shadowE(px,py+1*s,10*s,2*s,.35);x.fillStyle='#e8c070';x.fillRect(px-8*s,py-12*s,16*s,12*s);x.strokeStyle='#8a6a30';x.lineWidth=.8*s;for(let j=0;j<4;j++){x.beginPath();x.moveTo(px-8*s,py-12*s+j*3.5*s);x.lineTo(px+8*s,py-12*s+j*3.5*s);x.stroke()}
      [[-4,34],[0,44],[4,30]].forEach(([dx,h])=>{x.fillStyle='#3f8a3a';x.beginPath();x.moveTo(px+dx*s-2.4*s,py-12*s);x.lineTo(px+dx*s-2.4*s,py-12*s-h*s+3*s);x.lineTo(px+dx*s+2.4*s,py-12*s-h*s);x.lineTo(px+dx*s+2.4*s,py-12*s);x.fill();x.fillStyle='#d8e8b0';x.beginPath();x.ellipse(px+dx*s,py-12*s-h*s+1.5*s,2.4*s,1.2*s,-.5,0,7);x.fill()});
      x.fillStyle='#2d5a2a';for(let j=0;j<5;j++){x.beginPath();x.arc(px+(-9+j*4.5)*s,py-14*s,3.2*s,0,7);x.fill()}x.restore()}}
  function hatsuSky(){const h=gameHour();if(h<5||h>9)return;const a=Math.sin(Math.min(1,(h-5)/4)*Math.PI);x.save();x.globalCompositeOperation='lighter';const cy=Math.min(sunY,hz);for(let i=0;i<14;i++){const ang=-Math.PI+i/13*Math.PI;x.fillStyle=`rgba(255,${190+i%3*20},120,${.07*a})`;x.beginPath();x.moveTo(sunX,cy);x.arc(sunX,cy,WW*.9,ang-.04,ang+.04);x.fill()}
    glow(sunX,cy,90*k,`rgba(255,120,80,${.25*a})`);x.restore()}
  function xmasTree(){const px=WL+WW*.9,py=bY(.38),s=k;x.save();shadowE(px+6*s,py+1*s,14*s,2.4*s,.35);x.strokeStyle='#7a5530';x.lineWidth=4*s;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px-6*s,py-30*s,px-2*s,py-62*s);x.stroke();
    x.fillStyle=dark>.6?'#1e4a2a':'#3e9a4a';for(let i=0;i<7;i++){const ang=-Math.PI*.95+i/6*Math.PI*.9;x.beginPath();x.ellipse(px-2*s+Math.cos(ang)*16*s,py-62*s+Math.sin(ang)*6*s+8*s,17*s,3.6*s,ang+Math.PI/2*.0+(Math.cos(ang)>0?.35:-.35),0,7);x.fill()}
    const C=['#ff4a5a','#ffd23f','#55e0b4','#7aa2ff','#ff9ad5'];for(let i=0;i<22;i++){const q=i/21,lx=px-2*s+Math.sin(q*Math.PI*6)*(3+q*2)*s,ly=py-q*58*s,on=((Math.floor(t*2)+i)%3)!==0;
      x.globalCompositeOperation='lighter';if(on&&dark>.3)glow(lx,ly,6*s,'rgba(255,240,200,.35)');x.globalCompositeOperation='source-over';x.fillStyle=on?C[i%5]:'#555';x.beginPath();x.arc(lx,ly,1.4*s,0,7);x.fill()}
    for(let i=0;i<10;i++){const ang=-Math.PI*.95+i/9*Math.PI*.9,ex=px-2*s+Math.cos(ang)*26*s,ey=py-56*s+Math.sin(ang)*5*s+(Math.cos(ang)*Math.cos(ang))*8*s,on=((Math.floor(t*2.4)+i)%2)===0;x.fillStyle=on?C[(i+2)%5]:'#555';x.beginPath();x.arc(ex,ey,1.3*s,0,7);x.fill()}
    x.fillStyle='#ffe066';x.save();x.translate(px-2*s,py-70*s);x.beginPath();for(let i=0;i<10;i++){const r=i%2?2.6*s:6*s,an=-Math.PI/2+i*Math.PI/5;x.lineTo(Math.cos(an)*r,Math.sin(an)*r)}x.fill();x.restore();x.globalCompositeOperation='lighter';glow(px-2*s,py-70*s,16*s,'rgba(255,230,120,.4)');x.restore()}
  let xmasP=null;function xmasLights(){if(dark<.5)return;xmasP??=Array.from({length:30},()=>({x:R(WL,WL+WW),y:R(WT,WT+WH),v:R(.1,.3),ph:R(0,6),c:['255,232,160','255,208,232','200,240,255'][Math.random()*3|0]}));x.save();x.globalCompositeOperation='lighter';
    for(const p of xmasP){p.y+=p.v*k;if(p.y>WT+WH)p.y=WT;const al=.35+.35*Math.sin(t*2+p.ph);glow(p.x+Math.sin(t*.5+p.ph)*6*k,p.y,5*k,`rgba(${p.c},${al*.6})`)}x.restore()}
  function tsukiMoon(){if(dark<.5)return;const r=moonR*.62,mx=moonX,my=moonY;x.save();x.globalAlpha=.22*Math.min(1,(dark-.5)/.3);x.fillStyle='#5a4a3a';x.beginPath();x.ellipse(mx-r*.15,my+r*.25,r*.42,r*.3,0,0,7);x.fill();x.beginPath();x.arc(mx-r*.45,my-r*.05,r*.2,0,7);x.fill();
    x.beginPath();x.ellipse(mx-r*.55,my-r*.45,r*.07,r*.28,-.3,0,7);x.fill();x.beginPath();x.ellipse(mx-r*.38,my-r*.47,r*.07,r*.28,.1,0,7);x.fill();x.beginPath();x.ellipse(mx+r*.45,my+r*.4,r*.22,r*.12,0,0,7);x.fill();x.fillRect(mx+r*.15,my-r*.1,r*.08,r*.5);x.restore()}
  function tsukiBeach(){const px=WL+WW*.2,py=bY(.36),s=k;x.save();shadowE(px,py+1*s,13*s,2.4*s,.35);x.fillStyle='#c8a070';x.fillRect(px-9*s,py-8*s,18*s,8*s);x.fillStyle='#e0bc88';x.fillRect(px-11*s,py-10*s,22*s,2.4*s);
    const D=[[-6,-13],[0,-13],[6,-13],[-3,-18],[3,-18],[0,-23]];x.fillStyle=dark>.6?'#d8d4c8':'#fffaf0';for(const [dx,dy] of D){x.beginPath();x.arc(px+dx*s,py+dy*s,3*s,0,7);x.fill()}
    for(let i=0;i<5;i++){const bx=px+16*s+i*3*s,sw=Math.sin(t*1.2+i)*3*s;x.strokeStyle=dark>.6?'#6a6a50':'#b8a870';x.lineWidth=.9*s;x.beginPath();x.moveTo(bx,py);x.quadraticCurveTo(bx+sw*.4,py-20*s,bx+sw,py-34*s-i*2*s);x.stroke();x.fillStyle=dark>.6?'rgba(220,210,190,.6)':'rgba(240,230,200,.9)';x.beginPath();x.ellipse(bx+sw,py-36*s-i*2*s,2*s,6*s,sw*.05,0,7);x.fill()}x.restore()}
  function festX(layer){if(still)return;const f=festKind();
    if(layer==='sky'){if(f.newyear)hatsuSky();if(f.tsukimi)tsukiMoon()}
    else if(layer==='sea'){if(f.obon)toroDraw()}
    else if(layer==='beach'){if(f.tanabata)sasaDraw();else window._sasa=null;if(f.newyear)kadoDraw();if(f.xmas)xmasTree();if(f.tsukimi)tsukiBeach()}
    else if(layer==='front'){if(f.xmas)xmasLights()}}
  /* 雲の かたち */
  const CLOUDK={cream:[[0,-14,6],[-4,-8,7],[4,-8,7],[0,-2,9]],whale:[[-12,0,9],[0,-2,11],[12,0,9],[22,-2,5],[28,-7,4],[28,3,4]],heart:[[-6,-6,8],[6,-6,8],[0,2,7],[-3,6,4],[3,6,4],[0,10,3]],rabbit:[[0,0,10],[-5,-16,3],[-5,-22,3],[3,-16,3],[3,-22,3],[12,4,5]],fish:[[-10,0,7],[0,0,9],[10,0,6],[18,-5,4],[18,5,4]],cat:[[0,0,11],[-7,-10,4],[7,-10,4],[14,6,4],[18,2,3]]};
  Object.assign(SHOW,{cloudshape:{layer:'sky',draw(p,st,et){st.kd??=window._cloudK||'cream';const sh=CLOUDK[st.kd]||CLOUDK.cream,a=fade(p,.15,.2)*(1-dark*.7),s=k*1.5,cx=WL+WW*(.85-.5*p),cy=WT+(hz-WT)*.32;x.save();x.globalAlpha=a*.92;x.fillStyle='#ffffff';
    for(const [dx,dy,r] of sh){x.beginPath();x.arc(cx+dx*s,cy+dy*s,r*s,0,7);x.fill()}if(st.kd==='cream'){x.beginPath();x.moveTo(cx-7*s,cy+4*s);x.lineTo(cx,cy+22*s);x.lineTo(cx+7*s,cy+4*s);x.fill()}x.globalAlpha=a*.25;x.fillStyle='#c8d4e8';for(const [dx,dy,r] of sh){x.beginPath();x.arc(cx+dx*s,cy+dy*s+r*s*.35,r*s*.7,0,7);x.fill()}x.restore()}}});
  /* 曜日の 住人 */
  function hum(px,py,s,o={}){const nt=dark>.6,sk=nt?'#2a2632':'#f2c9a0',sh=nt?'#24202e':(o.c||'#5a8ad8'),pt=nt?'#1e1a26':(o.p||'#3a3a52'),lg=o.leg||0,sc=o.sc||1;s*=sc;
    x.strokeStyle=pt;x.lineWidth=2.4*s;x.lineCap='round';x.beginPath();x.moveTo(px,py-9*s);x.lineTo(px-lg*4*s,py);x.moveTo(px,py-9*s);x.lineTo(px+lg*4*s+(o.sit?6*s:0),py-(o.sit?7*s:0));x.stroke();
    x.fillStyle=sh;x.beginPath();x.ellipse(px,py-15*s,3.8*s,7*s,0,0,7);x.fill();x.strokeStyle=sk;x.lineWidth=1.8*s;const ar=o.arm||[0,0];x.beginPath();x.moveTo(px-2.5*s,py-19*s);x.lineTo(px-6*s+ar[0]*2*s,py-12*s-ar[1]*8*s);x.moveTo(px+2.5*s,py-19*s);x.lineTo(px+6*s-ar[0]*2*s,py-12*s-ar[1]*8*s);x.stroke();
    x.fillStyle=sk;x.beginPath();x.arc(px,py-25*s,3.6*s,0,7);x.fill();if(o.hat){x.fillStyle=nt?'#1a1622':o.hat;x.beginPath();x.ellipse(px,py-27.5*s,5*s,1.4*s,0,0,7);x.fill();x.fillRect(px-2.6*s,py-31*s,5.2*s,3.5*s)}x.lineCap='butt'}
  const WKD={
   wk1:(p,et)=>{const px=lerp(WL-20*k,WL+WW+20*k,p),py=bY(.25);evShad(px,py,6*k);hum(px,py,k,{leg:Math.sin(et*12),arm:[Math.sin(et*12)*.6,.3],c:'#ff7a5a',p:'#2a2a3a'})},
   wk2:(p,et)=>{const px=lerp(WL+WW+20*k,WL-30*k,p),py=bY(.28);evShad(px,py,6*k);hum(px,py,k,{leg:Math.sin(et*5)*.6,c:'#8ac86a'});const dx=px-22*k,dy=py;evShad(dx,dy,5*k);x.fillStyle=dark>.6?'#2a2420':'#d8a060';x.beginPath();x.ellipse(dx,dy-5*k,6*k,3.2*k,0,0,7);x.fill();x.beginPath();x.arc(dx-6*k,dy-8*k,2.8*k,0,7);x.fill();x.fillRect(dx-4*k,dy-3*k,1.4*k,3*k+Math.sin(et*9)*k);x.fillRect(dx+3*k,dy-3*k,1.4*k,3*k-Math.sin(et*9)*k);
     x.strokeStyle='rgba(200,60,60,.8)';x.lineWidth=.7*k;x.beginPath();x.moveTo(px-5*k,py-13*k);x.quadraticCurveTo(px-14*k,py-4*k,dx-5*k,dy-8*k);x.stroke()},
   wk3:(p,et)=>{const a=fade(p,.08,.1),px=WL+WW*.72,py=bY(.3);x.globalAlpha=a;evShad(px,py,8*k);hum(px,py,k,{arm:[Math.sin(et*2)*.5,.5+Math.sin(et*2)*.2],c:'#6a5acd',hat:'#c84a4a'});const ex=px+14*k;x.strokeStyle=dark>.6?'#2a2018':'#8a6038';x.lineWidth=1.4*k;x.beginPath();x.moveTo(ex-6*k,py);x.lineTo(ex,py-30*k);x.lineTo(ex+6*k,py);x.stroke();
     x.fillStyle=dark>.6?'#3a3836':'#fffaf0';x.fillRect(ex-8*k,py-30*k,16*k,13*k);if(dark<.6){[['#4aa0e0',-4,-26],['#ffd23f',3,-23],['#55c080',-2,-21]].forEach(([c,dx,dy])=>{x.fillStyle=c;x.beginPath();x.arc(ex+dx*k,py+dy*k,2.2*k*Math.min(1,p*3),0,7);x.fill()})}},
   wk4:(p,et)=>{const a=fade(p,.08,.1),px=WL+WW*.36,py=bY(.3);x.globalAlpha=a;x.fillStyle=dark>.6?'#2a2a3a':'#b48ae0';x.fillRect(px-14*k,py-1*k,28*k,3*k);evShad(px,py,7*k);const ph=(et%12)<6;hum(px,py,k,ph?{arm:[1.2,1.6],c:'#ff9ad5',p:'#5a4a7a'}:{arm:[-1,.3],c:'#ff9ad5',p:'#5a4a7a',leg:.6})},
   wk5:(p,et,st)=>{const a=fade(p,.06,.1),px=WL+WW*.78,py=bY(.3);x.globalAlpha=a;evShad(px,py,8*k);hum(px,py,k,{sit:1,arm:[.4,.2],c:'#3a6aa8'});x.save();x.translate(px+3*k,py-12*k);x.rotate(-.5);x.fillStyle=dark>.6?'#2a1e14':'#c87a30';x.beginPath();x.ellipse(0,0,6*k,4.2*k,0,0,7);x.fill();x.fillRect(4*k,-1*k,12*k,2*k);x.restore();
     if((st.n=(st.n||0)+1)%40===0)notes.push({x:px+R(-10,20)*k,y:py-R(20,40)*k,s:['♪','♫','♬'][Math.random()*3|0],c:'#ffe7a8',l:1})},
   wk6:(p,et)=>{const px=lerp(WL+WW*.15,WL+WW*.6,p),py=bY(.24);for(const [dx,c] of [[0,'#ffd23f'],[-14,'#ff7a9a']]){const qx=px+dx*k;evShad(qx,py,5*k);hum(qx,py,k,{sc:.72,leg:Math.sin(et*9+dx),arm:[0,.8],c})}
     const kx=px+40*k+Math.sin(et*.8)*8*k,ky=WT+(hz-WT)*.45+Math.sin(et*1.1)*6*k;x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=.6;x.beginPath();x.moveTo(px+3*k,py-14*k);x.quadraticCurveTo(px+30*k,py-60*k,kx,ky);x.stroke();x.fillStyle='#ff5c8a';x.beginPath();x.moveTo(kx,ky-8*k);x.lineTo(kx+6*k,ky);x.lineTo(kx,ky+8*k);x.lineTo(kx-6*k,ky);x.fill();x.fillStyle='#ffd23f';x.beginPath();x.moveTo(kx,ky-8*k);x.lineTo(kx+6*k,ky);x.lineTo(kx,ky);x.fill()},
   wk0:(p,et)=>{const px=lerp(WL-40*k,WL+WW+40*k,p),py=bY(.27);[[0,'#5a8ad8',1],[-12,'#ff9a6a',1],[-6,'#ffd23f',.62]].forEach(([dx,c,sc])=>{const qx=px+dx*k,qy=py+(sc<1?3*k:0);evShad(qx,qy,5*k*sc);hum(qx,qy,k,{sc,leg:Math.sin(et*5+dx)*.6,c})})}};
  for(const n in WKD)SHOW[n]={layer:'beach',draw(p,st,et){x.save();WKD[n](p,et,st);x.restore()}};
  /* ---------- v155 カニの かけっこ ---------- */
  Object.assign(SHOW,{crabrace:{layer:'beach',draw(p,st,et,rdt){const kk=k*1.6;const C=[['#e8343a','赤'],['#ff9a2a','オレンジ'],['#3a8ad8','青'],['#8a5ad8','むらさき']];const y0=shore+(WT+WH-shore)*.2,gap=12*kk,x0=WL+WW*.08,x1=WL+WW*.9;
    st.c??=C.map((c,i)=>({x:0,v:0,col:c[0],n:c[1],burst:0}));const run=et>2&&!st.done;const dt=Math.min(.1,rdt||.04);if(st.done){st.dAt??=et;if(et-st.dAt>1)return}
    x.save();if(st.dAt!=null)x.globalAlpha=Math.max(0,1-(et-st.dAt));x.strokeStyle='rgba(255,255,255,.55)';x.setLineDash([3*kk,3*kk]);x.lineWidth=1*kk;x.beginPath();x.moveTo(x1,y0-8*kk);x.lineTo(x1,y0+gap*4);x.stroke();x.setLineDash([]);
    x.fillStyle='rgba(255,255,255,.8)';x.beginPath();x.moveTo(x1,y0-8*kk);x.lineTo(x1+8*kk,y0-5*kk);x.lineTo(x1,y0-2*kk);x.fill();
    st.c.forEach((c,i)=>{if(run){if(Math.random()<.02)c.burst=.6;c.burst=Math.max(0,c.burst-dt);c.v=.05+Math.random()*.05+(c.burst?.12:0)+(Math.random()<.03?-.04:0);c.x=Math.min(1,c.x+c.v*dt*1.4);
        if(c.x>=1&&!st.done){st.done=1;try{window.crabDone&&crabDone(c.n,c.col)}catch(e){}}}
      const cx=lerp(x0,x1,c.x),cy=y0+i*gap,wob=run?Math.sin(et*22+i)*1.2*kk:0;evShad(cx,cy+2*kk,6*kk);x.fillStyle=c.col;x.beginPath();x.ellipse(cx,cy-3*kk+wob*.3,5*kk,3.4*kk,0,0,7);x.fill();
      x.strokeStyle=c.col;x.lineWidth=1*kk;for(const sd of[-1,1]){for(let l=0;l<3;l++){x.beginPath();x.moveTo(cx+sd*3*kk,cy-2*kk);x.lineTo(cx+sd*(6+l)*kk,cy+(l-1)*1.5*kk+wob*(l%2?1:-1));x.stroke()}
        x.beginPath();x.arc(cx+sd*6*kk,cy-6*kk,1.6*kk,0,7);x.stroke()}
      x.fillStyle='#fff';x.beginPath();x.arc(cx-1.6*kk,cy-6.5*kk,.9*kk,0,7);x.arc(cx+1.6*kk,cy-6.5*kk,.9*kk,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(cx-1.6*kk,cy-6.5*kk,.45*kk,0,7);x.arc(cx+1.6*kk,cy-6.5*kk,.45*kk,0,7);x.fill()});
    if(et<2){x.fillStyle='rgba(255,255,255,.9)';x.font=`bold ${12*kk}px sans-serif`;x.textAlign='center';x.fillText(et<1?'よーい…':'ドン！',x0+20*kk,y0-12*kk)}
    x.restore()}}});
  /* ---------- v156 scene ---------- */
  const sayCB=(k)=>{try{window.sceneSay&&sceneSay(k)}catch(e){}};
  Object.assign(SHOW,{
   kogame:{layer:'beach',draw(p,st,et,rdt){st.t??=Array.from({length:7},(_,i)=>({x:WL+WW*(.15+Math.random()*.7),y:shore+(WT+WH-shore)*(.35+Math.random()*.45),sp:.6+Math.random()*.6,d:i*1.2+Math.random(),gone:0}));
     const dt=Math.min(.1,rdt||.04);x.save();let left=0;
     st.t.forEach((t,i)=>{if(et<t.d)return;const slow=i===st.t.length-1?.45:1;if(!t.gone){t.y-=t.sp*slow*dt*9*k;t.x+=Math.sin(et*2+i)*.15*k;if(t.y<shore-2*k){t.gone=et;}}
       if(t.gone&&et-t.gone>1.5)return;left++;const a=t.gone?Math.max(0,1-(et-t.gone)/1.5):1,s=k*.9,fl=Math.sin(et*10+i)*.6;x.globalAlpha=a;
       x.fillStyle='#4a3a28';x.beginPath();x.ellipse(t.x,t.y,3.4*s,4*s,0,0,7);x.fill();x.fillStyle='#6a5a3a';x.beginPath();x.ellipse(t.x,t.y,2.4*s,3*s,0,0,7);x.fill();
       x.fillStyle='#3a2e20';x.beginPath();x.arc(t.x,t.y-4.6*s,1.5*s,0,7);x.fill();for(const sd of[-1,1]){x.beginPath();x.ellipse(t.x+sd*3.6*s,t.y-1.5*s+fl*sd,2*s,.9*s,sd*(.6+fl*.3),0,7);x.fill();x.beginPath();x.ellipse(t.x+sd*3*s,t.y+3*s,1.4*s,.7*s,-sd*.5,0,7);x.fill()}
       x.strokeStyle='rgba(120,90,60,.35)';x.lineWidth=.6*k;x.beginPath();x.moveTo(t.x-1*s,t.y+4*s);x.lineTo(t.x-1*s,t.y+10*s);x.moveTo(t.x+1*s,t.y+4*s);x.lineTo(t.x+1*s,t.y+10*s);x.stroke()});
     x.restore();if(!st.fin&&et>4&&st.t.every(t=>t.gone)){st.fin=1;sayCB('kogameEnd')}}},
   lamplighter:{layer:'beach',draw(p,st,et){const px=lerp(WL-20*k,WL+WW+20*k,p),py=bY(.12);hum(px,py,k,{leg:Math.sin(et*5)*.6,arm:[-.3,.9],c:'#7a5a3a',hat:'#3a2a1a'});
     const lx=px+6*k,ly=py-26*k;x.save();x.globalCompositeOperation='lighter';glow(lx,ly,14*k,'rgba(255,190,90,.6)');x.restore();x.fillStyle='#ffd27a';x.fillRect(lx-2*k,ly-3*k,4*k,5*k);x.strokeStyle='#3a2a1a';x.lineWidth=.8*k;x.strokeRect(lx-2*k,ly-3*k,4*k,5*k);
     const gh=gameHour();if(gh<5.5||gh>=17.5){st.done??={};LAMPS.forEach((u,i)=>{if(!st.done[i]&&px>WL+WW*u+4*k){st.done[i]=1;lampLit[i]=1;sayCB(i===LAMPS.length-1?'lampAll':'lampOne')}})}}},
   pengdoji:{layer:'beach',draw(p,st,et){st.fall??=.3+Math.random()*.35;const fall=p>st.fall&&p<st.fall+.12,q=fall?(p-st.fall)/.12:0;const prog=p<st.fall?p:p<st.fall+.12?st.fall+(q<.3?q*.02:.006):p-.12+.006;
     const px=lerp(WL+WW+20*k,WL-20*k,Math.min(1,prog*1.14)),py=bY(.3),s=k*1.1;evShad(px,py,6*s);x.save();x.translate(px,py);
     if(fall){const r=q<.25?q/.25*1.5:q<.75?1.5:1.5*(1-(q-.75)/.25);x.rotate(-r);if(!st.said){st.said=1;sayCB('pengFall')}}else x.rotate(Math.sin(et*8)*.12);
     x.fillStyle='#1e2230';x.beginPath();x.ellipse(0,-9*s,5.5*s,9*s,0,0,7);x.fill();x.fillStyle='#f4f4f4';x.beginPath();x.ellipse(.8*s,-8*s,3.6*s,7*s,0,0,7);x.fill();
     x.fillStyle='#1e2230';x.beginPath();x.arc(0,-17*s,4*s,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(-1.4*s,-17.6*s,1*s,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(-1.6*s,-17.6*s,.5*s,0,7);x.fill();
     x.fillStyle='#ffb02a';x.beginPath();x.moveTo(-3.6*s,-17*s);x.lineTo(-7*s,-16.2*s);x.lineTo(-3.6*s,-15.6*s);x.fill();const w=fall?.9:Math.sin(et*8)*.3;x.fillStyle='#1e2230';x.beginPath();x.ellipse(4.6*s,-9*s,1.4*s,5*s,.3+w,0,7);x.fill();x.beginPath();x.ellipse(-4.6*s,-9*s,1.4*s,5*s,-.3-w,0,7);x.fill();
     x.fillStyle='#ffb02a';x.beginPath();x.ellipse(-1.6*s,0,2*s,.9*s,0,0,7);x.ellipse(2*s,0,2*s,.9*s,0,0,7);x.fill();x.restore();
     if(fall&&q>.3&&q<.75){x.fillStyle='rgba(240,220,180,.7)';for(let i=0;i<4;i++){x.beginPath();x.arc(px+R(-10,10)*k,py-R(0,6)*k,1.2*k,0,7);x.fill()}}}},
   castlewave:{layer:'beach',draw(p,st,et){const cx=WL+WW*.3,cy=shore+(WT+WH-shore)*.16,s=k*1.2;const build=Math.min(1,et/14),wave=et>15&&et<19,wq=wave?(et-15)/4:0,broken=et>=16.6,rebuild=et>21?Math.min(1,(et-21)/9):0;
     const h=broken?Math.max(.45,1-(et<19?(et-16.6)/2.4*.55:.55))+rebuild*.55:build;const lv=Math.max(0,Math.min(1,h));
     evShad(cx,cy,14*s);x.save();x.fillStyle='#d8b880';x.fillRect(cx-12*s,cy-6*s*lv,24*s,6*s*lv);if(lv>.4){x.fillRect(cx-9*s,cy-12*s*lv,18*s,6*s*lv*.9);[-10,0,10].forEach(dx=>{x.fillRect(cx+dx*s-2.4*s,cy-(lv>.7?18:14)*s*lv,4.8*s,6*s*lv)})}
     if(lv>.85){x.strokeStyle='#8a5a2a';x.lineWidth=.7*s;x.beginPath();x.moveTo(cx,cy-18*s*lv);x.lineTo(cx,cy-25*s*lv);x.stroke();x.fillStyle='#e8343a';x.beginPath();x.moveTo(cx,cy-25*s*lv);x.lineTo(cx+5*s,cy-23.5*s*lv);x.lineTo(cx,cy-22*s*lv);x.fill()}
     if(broken){x.fillStyle='rgba(200,170,120,.8)';for(let i=0;i<6;i++){x.beginPath();x.ellipse(cx+(i-2.5)*5*s,cy+1*s,3*s,1.4*s,0,0,7);x.fill()}}x.restore();
     const bx=cx+18*s,by=cy+2*s,sad=et>16.8&&et<21;hum(bx,by,k,{sit:sad?0:1,arm:sad?[1.2,1.4]:[Math.sin(et*6)*.5,.2],c:'#ff8a5a',sc:.85});
     if(wave){const reach=Math.sin(wq*Math.PI),wy=lerp(shore,cy+10*k,reach),L0=WL+WW*.02,L1=WL+WW*.62,N=28,edge=[];for(let n=0;n<=N;n++){const u=n/N,env=Math.pow(Math.sin(u*Math.PI),.55);edge.push([lerp(L0,L1,u),shore+(wy-shore)*env+Math.sin(et*6+n*1.3)*1.6*k*env])}
       x.save();const g=x.createLinearGradient(0,shore,0,wy+4*k);g.addColorStop(0,'rgba(90,170,210,.55)');g.addColorStop(.75,'rgba(170,220,240,.5)');g.addColorStop(1,'rgba(255,255,255,.85)');x.fillStyle=g;x.beginPath();x.moveTo(L0,shore-1*k);edge.forEach(([ex,ey])=>x.lineTo(ex,ey));x.lineTo(L1,shore-1*k);x.closePath();x.fill();
       x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=2.2*k;x.lineJoin='round';x.beginPath();edge.forEach(([ex,ey],n)=>n?x.lineTo(ex,ey):x.moveTo(ex,ey));x.stroke();
       x.fillStyle='rgba(255,255,255,.9)';edge.forEach(([ex,ey],n)=>{if(n%2)return;x.beginPath();x.arc(ex+Math.sin(et*9+n)*2*k,ey-1.5*k,(1+((n*7)%3)*.5)*k,0,7);x.fill()});x.restore();if(!st.w){st.w=1;sayCB('castleWave')}}
     if(et>17&&!st.a){st.a=1;sayCB('castleAh')}if(et>22&&!st.r){st.r=1;sayCB('castleRe')}}}});
  const LAMPS=[.12,.32,.52,.72,.9];const lampLit=[0,0,0,0,0];window._lampLit=lampLit;
  function lampDraw(){const h=gameHour();if(h>=5.5&&h<17.5)lampLit.fill(0);else if((h>=19||h<5.5)&&!shows.some(s=>s.name==='lamplighter')&&lampLit.every(v=>!v)){lampLit.fill(1)}
    LAMPS.forEach((u,i)=>{const px=WL+WW*u,py=bY(.08),s=k*.8;x.save();x.fillStyle=dark>.6?'#2a2018':'#6a4a2a';x.fillRect(px-.8*s,py-26*s,1.6*s,26*s);x.fillRect(px-3*s,py-26*s,6*s,1.2*s);
      const lit=lampLit[i];if(lit){x.globalCompositeOperation='lighter';glow(px,py-21*s,16*s,'rgba(255,190,90,.55)');x.globalCompositeOperation='source-over'}x.fillStyle=lit?'#ffd88a':'#5a4a3a';x.fillRect(px-2*s,py-24*s,4*s,5*s);x.strokeStyle='#2a2018';x.lineWidth=.6*s;x.strokeRect(px-2*s,py-24*s,4*s,5*s);x.restore()})}
  /* ---------- v166 夜の 雰囲気 ---------- */
  const NT={cl:[{x:-.3,y:.18,w:.5,v:.006},{x:.4,y:.12,w:.35,v:.004},{x:1.1,y:.24,w:.45,v:.005}],cover:0,res:null};
  window._nt=NT;
  function nightFx(layer){if(still)return;const dk=Math.max(0,Math.min(1,(dark-.55)/.35));if(dk<=0)return;const h=gameHour();let ill=.5;try{ill=moonIllum()}catch(e){}
    if(layer==='sky'){
      /* 6. 夜の 色の 移ろい */
      x.save();let col=null,a=0;if(h>=18.5&&h<22){col='30,50,130';a=.16}else if(h>=22||h<3.3){col='0,0,12';a=.22}else if(h>=3.3&&h<5.5){col='120,80,160';a=.18}
      if(col){const g=x.createLinearGradient(0,0,0,hz);g.addColorStop(0,`rgba(${col},${a*dk})`);g.addColorStop(1,`rgba(${col},${a*dk*(h>=3.3&&h<5.5?1.4:.5)})`);x.fillStyle=g;x.fillRect(0,0,W,hz)}
      /* 7. 新月ほど 星が 多い */
      const extra=(1-ill)*dk*((h>=22||h<3.3)?1:.6);if(extra>.05){NT.st??=Array.from({length:70},()=>({u:Math.random(),v:Math.random()*.9,r:.4+Math.random()*.9,p:Math.random()*6}));x.globalCompositeOperation='lighter';
        for(const s of NT.st){const al=extra*(.35+.35*Math.sin(t*1.6+s.p));x.fillStyle=`rgba(230,235,255,${al})`;x.beginPath();x.arc(WL+WW*s.u,WT+(hz-WT)*s.v,s.r*k,0,7);x.fill()}}
      x.globalCompositeOperation='source-over';
      /* 8. 月と 雲 */
      let cover=0;x.globalAlpha=dk;for(const c of NT.cl){c.x+=c.v*.016;if(c.x>1.4){c.x=-.6;c.y=.08+Math.random()*.22;c.w=.3+Math.random()*.3}
        const cx=WL+WW*c.x,cy=WT+(hz-WT)*c.y,cw=WW*c.w;const g=x.createRadialGradient(cx,cy,0,cx,cy,cw*.5);g.addColorStop(0,'rgba(40,44,70,.55)');g.addColorStop(.6,'rgba(40,44,70,.3)');g.addColorStop(1,'rgba(40,44,70,0)');x.fillStyle=g;x.save();x.translate(cx,cy);x.scale(1,.28);x.translate(-cx,-cy);x.beginPath();x.arc(cx,cy,cw*.5,0,7);x.fill();x.restore();
        const dx=(moonX-cx)/(cw*.5),dy=(moonY-cy)/(cw*.14);cover=Math.max(cover,Math.max(0,1-Math.hypot(dx,dy)))}
      x.globalAlpha=1;NT.cover+=(cover-NT.cover)*.05;x.restore()}
    else if(layer==='sea'){
      x.save();x.globalCompositeOperation='lighter';
      /* 3. 沖の 漁火 */
      const d=new Date();const on=((d.getDate()*7+d.getMonth()*3)%10)<7;if(on){for(let i=0;i<7;i++){const u=.55+i*.055+Math.sin(i*3.1)*.012,lx=WL+WW*u,ly=hz-1*k+Math.sin(t*.8+i)*.6*k,fl=.75+.25*Math.sin(t*3+i*2);glow(lx,ly,7*k,`rgba(255,240,190,${.5*dk*fl})`);
        x.fillStyle=`rgba(255,248,220,${.85*dk})`;x.beginPath();x.arc(lx,ly,.9*k,0,7);x.fill();const rg=x.createLinearGradient(0,ly+2*k,0,ly+(8+i%3*3)*k);rg.addColorStop(0,`rgba(255,230,170,${.16*dk*fl})`);rg.addColorStop(1,'rgba(255,230,170,0)');x.fillStyle=rg;x.fillRect(lx-.6*k,ly+2*k,1.2*k,(6+i%3*3)*k)}}
      /* 4. 遠くの 灯台 */
      const lx=WL+WW*.05,ly=hz-26*k;x.globalCompositeOperation='source-over';x.fillStyle='rgba(20,18,30,.9)';x.beginPath();x.moveTo(lx-2.2*k,hz-8*k);x.lineTo(lx-1.4*k,ly);x.lineTo(lx+1.4*k,ly);x.lineTo(lx+2.2*k,hz-8*k);x.fill();x.fillRect(lx-2*k,ly-3*k,4*k,3*k);
      const ang=(t*.35)%(Math.PI*2),face=Math.max(0,Math.cos(ang));x.globalCompositeOperation='lighter';glow(lx,ly-1.5*k,(8+18*face)*k,`rgba(255,250,215,${(.35+.6*face)*dk})`);
      const bx=Math.sin(ang);if(face>.05){const len=WW*.9,ex=lx+len*Math.max(.15,Math.abs(bx))*(bx>=0?1:.3),g=x.createLinearGradient(lx,ly,ex,ly);g.addColorStop(0,`rgba(255,250,215,${.22*dk*face})`);g.addColorStop(1,'rgba(255,250,215,0)');x.fillStyle=g;x.beginPath();x.moveTo(lx,ly-1.5*k);x.lineTo(ex,ly-14*k*face);x.lineTo(ex,ly+10*k*face);x.closePath();x.fill();
        x.fillStyle=`rgba(255,250,215,${.08*dk*face})`;x.fillRect(lx,hz+1*k,len*.6*Math.abs(bx),2*k)}
      /* 2. 夜光虫 */
      NT.bio=(NT.bio??0);const env=Math.max(0,Math.sin(t*.12))**3;if(env>.02){for(let i=0;i<28;i++){const u=(i/28+Math.sin(i*7.3)*.02),bx2=WL+WW*u,ph=Math.sin(t*1.3+u*9)*.5+.5,by=shore-2*k+ph*4*k,al=env*dk*(.4+.6*Math.max(0,Math.sin(t*2.2+i*1.7)));
        const g=x.createRadialGradient(bx2,by,0,bx2,by,10*k);g.addColorStop(0,`rgba(90,230,255,${.55*al})`);g.addColorStop(1,'rgba(90,230,255,0)');x.fillStyle=g;x.save();x.translate(bx2,by);x.scale(2.6,.5);x.translate(-bx2,-by);x.beginPath();x.arc(bx2,by,10*k,0,7);x.fill();x.restore()}}
      x.restore()}
    else if(layer==='front'){
      x.save();
      /* 7+8. 月明かりの 強さ（満月で 明るく、新月・雲で 暗く） */
      const moonLight=Math.max(0,ill*(1-NT.cover*.8));x.globalCompositeOperation='lighter';x.fillStyle=`rgba(110,130,190,${.07*moonLight*dk})`;x.fillRect(0,hz,W,H-hz);
      x.globalCompositeOperation='source-over';x.fillStyle=`rgba(0,0,15,${.16*(1-moonLight)*dk})`;x.fillRect(0,hz,W,H-hz);
      /* 1. 焚き火の 照り返し */
      if(fireLv>.05){const[fx,fy]=fireP(),f=flick(),R=(110+14*f)*k*(shows.some(s=>s.name==='bigfire')?1.4:1);x.globalCompositeOperation='lighter';x.save();x.translate(fx,fy-6*k);x.scale(1.35,.62);
        const g=x.createRadialGradient(0,0,0,0,0,R);g.addColorStop(0,`rgba(255,150,60,${.2*dk*fireLv*f})`);g.addColorStop(.5,`rgba(255,120,40,${.08*dk*fireLv*f})`);g.addColorStop(1,'rgba(255,100,30,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,R,0,7);x.fill();x.restore()}
      /* 12. 画面の ふちは 青く */
      x.globalCompositeOperation='source-over';const[fx2,fy2]=fireP();const v=x.createRadialGradient(fx2,fy2-20*k,Math.min(WW,WH)*.25,W/2,WT+WH*.5,Math.max(WW,WH)*.85);v.addColorStop(0,'rgba(10,20,60,0)');v.addColorStop(1,`rgba(10,20,70,${.28*dk})`);x.fillStyle=v;x.fillRect(0,0,W,H);
      x.restore()}}
  /* 11. 夜の 住人 */
  Object.assign(SHOW,{
   nt_couple:{layer:'beach',draw(p,st,et){const a=fade(p,.1,.12),px=WL+WW*.66,py=shore+(WT+WH-shore)*.14;x.save();x.globalAlpha=a;evShad(px,py,12*k);hum(px-4*k,py,k,{sit:1,arm:[.3,.2],c:'#555'});hum(px+5*k,py,k,{sit:1,arm:[-.6,.1],c:'#555',sc:.92});
     x.fillStyle=dark>.6?'rgba(20,18,30,.9)':'#444';x.beginPath();x.arc(px+1*k,py-24*k,1.4*k,0,7);x.fill();x.restore()}},
   nt_blanket:{layer:'beach',draw(p,st,et){const a=fade(p,.1,.12),[fx,fy]=fireP(),px=fx+38*k,py=fy-4*k;x.save();x.globalAlpha=a;evShad(px,py,9*k);x.fillStyle=dark>.6?'#2a2433':'#5a4a6a';x.beginPath();x.moveTo(px-8*k,py);x.quadraticCurveTo(px-9*k,py-20*k,px,py-24*k);x.quadraticCurveTo(px+9*k,py-20*k,px+8*k,py);x.fill();
     x.fillStyle=dark>.6?'#2a2632':'#f2c9a0';x.beginPath();x.arc(px,py-24*k,3.6*k,0,7);x.fill();x.strokeStyle=dark>.6?'#2a2632':'#f2c9a0';x.lineWidth=1.6*k;const w=Math.sin(et*1.5)*1.2*k;x.beginPath();x.moveTo(px-4*k,py-14*k);x.lineTo(px-11*k,py-15*k+w);x.moveTo(px-4*k,py-12*k);x.lineTo(px-11*k,py-12*k-w);x.stroke();
     x.globalCompositeOperation='lighter';glow(px-12*k,py-13*k,8*k,'rgba(255,150,60,.25)');x.restore()}},
   nt_kid:{layer:'beach',draw(p,st,et){const a=fade(p,.1,.12),px=WL+WW*.24,py=shore+(WT+WH-shore)*.2;x.save();x.globalAlpha=a;evShad(px,py,7*k);hum(px,py,k,{c:'#555'});evShad(px+12*k,py,5*k);hum(px+12*k,py,k,{sc:.66,arm:[-1.4,1.8],c:'#555'});x.restore()}}});
  /* ---------- v169 海辺の アイテム 追加 ---------- */
  const NEWB=['ビーチハウス','ブランコ','ふきながし','流木アート','かき氷の屋台','シャボン玉マシン'],NEWS=['小舟','イルカの浮き輪'];
  ITEMS.push({c:2200,n:'イルカの浮き輪',d:[0,0],m:[.36,.555],a:0},{c:1800,n:'ふきながし',d:[0,0],m:[.66,.76],a:0},{c:3500,n:'かき氷の屋台',d:[0,0],m:[.87,.83],a:0},{c:4500,n:'シャボン玉マシン',d:[0,0],m:[.7,.965],a:0},
   {c:7000,n:'流木アート',d:[0,0],m:[.52,.77],a:0},{c:9000,n:'ブランコ',d:[0,0],m:[.1,.8],a:0},{c:12000,n:'小舟',d:[0,0],m:[.82,.5],a:0},{c:80000,n:'ビーチハウス',d:[0,0],m:[.93,.72],a:0});
  ITEMS.sort((a,b)=>a.c-b.c);
  Object.assign(DRAW,{
   'イルカの浮き輪'(px,py){const s=k*.95,by=py+Math.sin(t*1.3)*1.4*k,r=Math.sin(t*.8)*.1;x.save();x.translate(px+Math.sin(t*.25)*8*k,by);x.rotate(r);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.8;x.beginPath();x.ellipse(0,5*s,18*s,3*s,0,0,7);x.stroke();
     x.fillStyle='#5ab8ff';x.beginPath();x.moveTo(-16*s,2*s);x.quadraticCurveTo(-14*s,-10*s,2*s,-9*s);x.quadraticCurveTo(14*s,-8*s,16*s,0);x.quadraticCurveTo(0,6*s,-16*s,2*s);x.fill();
     x.beginPath();x.moveTo(-2*s,-9*s);x.lineTo(2*s,-15*s);x.lineTo(5*s,-8.5*s);x.fill();x.beginPath();x.moveTo(15*s,-1*s);x.lineTo(21*s,-5*s);x.lineTo(20*s,2*s);x.fill();
     x.fillStyle='#e8f6ff';x.beginPath();x.ellipse(-4*s,-1*s,9*s,3*s,0,0,7);x.fill();x.fillStyle='#14304a';x.beginPath();x.arc(-11*s,-4*s,1.1*s,0,7);x.fill();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(2*s,-6*s,5*s,1.2*s,-.1,0,7);x.fill();x.restore()},
   '小舟'(px,py){const s=k*1.05,by=py+Math.sin(t*1.1)*1.2*k,r=Math.sin(t*.7)*.05;x.save();x.translate(px,by);x.rotate(r);x.fillStyle='rgba(255,255,255,.3)';x.fillRect(-26*s,3*s,52*s,1.2*s);
     x.fillStyle=vgrad(-7*s,4*s,[[0,'#c87a3a'],[1,'#6a3a18']]);x.beginPath();x.moveTo(-26*s,-6*s);x.lineTo(26*s,-6*s);x.lineTo(19*s,4*s);x.lineTo(-19*s,4*s);x.closePath();x.fill();x.fillStyle='#f4ead8';x.fillRect(-26*s,-7.5*s,52*s,2*s);
     x.strokeStyle='#5a3418';x.lineWidth=1.2*s;x.beginPath();x.moveTo(-10*s,-6*s);x.lineTo(-22*s,4*s);x.moveTo(10*s,-6*s);x.lineTo(22*s,4*s);x.stroke();x.restore()},
   'ふきながし'(px,py){const s=k;shadowE(px,py+1*s,5*s,1.2*s,.35);x.strokeStyle='#8a6a4a';x.lineWidth=1.6*s;x.beginPath();x.moveTo(px,py);x.lineTo(px,py-46*s);x.stroke();
     const C=['#ff5c8a','#ffd23f','#55e0b4','#7aa2ff','#c98cff'];C.forEach((c,i)=>{x.strokeStyle=c;x.lineWidth=2.4*s;x.beginPath();x.moveTo(px,py-44*s+i*2.2*s);for(let j=1;j<=8;j++){const xx=px+j*4*s,yy=py-44*s+i*2.2*s+Math.sin(t*4-j*.7+i*.4)*2.2*s*j/8+j*.6*s;x.lineTo(xx,yy)}x.stroke()});
     x.fillStyle='#ffd23f';x.beginPath();x.arc(px,py-47*s,2*s,0,7);x.fill()},
   'かき氷の屋台'(px,py){const s=k*1.05;shadowE(px,py+1*s,22*s,3*s,.4);x.fillStyle='#d8b080';x.fillRect(px-18*s,py-16*s,36*s,16*s);x.fillStyle='#b8885a';x.fillRect(px-18*s,py-17*s,36*s,2.4*s);
     x.fillStyle='#8a5a2a';x.fillRect(px-17*s,py-38*s,1.6*s,22*s);x.fillRect(px+15.4*s,py-38*s,1.6*s,22*s);for(let i=0;i<6;i++){x.fillStyle=i%2?'#ffffff':'#3a8ad8';x.beginPath();x.moveTo(px-20*s+i*6.7*s,py-38*s);x.lineTo(px-20*s+(i+1)*6.7*s,py-38*s);x.lineTo(px-20*s+(i+.5)*6.7*s,py-33*s);x.closePath();x.fill()}
     x.fillStyle='#3a8ad8';x.fillRect(px-20*s,py-41*s,40*s,3.5*s);const fx=px+20*s,fy=py-30*s,w=Math.sin(t*3)*1.5*s;x.strokeStyle='#8a5a2a';x.lineWidth=.8*s;x.beginPath();x.moveTo(fx,py-16*s);x.lineTo(fx,fy-8*s);x.stroke();
     x.fillStyle='#fff';x.beginPath();x.moveTo(fx,fy-8*s);x.quadraticCurveTo(fx+6*s,fy-8*s+w,fx+11*s,fy-7*s+w);x.lineTo(fx+11*s,fy+2*s+w);x.quadraticCurveTo(fx+6*s,fy+1*s+w,fx,fy+1*s);x.fill();x.fillStyle='#e8343a';x.font=`bold ${6.5*s}px sans-serif`;x.textAlign='center';x.fillText('氷',fx+5.5*s,fy-1*s+w*.5);
     [['#ff5c8a',-8],['#55e0b4',0],['#ffd23f',8]].forEach(([c,dx])=>{x.fillStyle='rgba(220,240,255,.8)';x.fillRect(px+dx*s-2.2*s,py-21*s,4.4*s,4*s);x.fillStyle='#fff';x.beginPath();x.arc(px+dx*s,py-21.5*s,3*s,Math.PI,0);x.fill();x.fillStyle=c;x.beginPath();x.arc(px+dx*s,py-22*s,2.4*s,Math.PI,0);x.fill()})},
   'シャボン玉マシン'(px,py){const s=k;shadowE(px,py+1*s,8*s,1.6*s,.35);x.fillStyle='#ff9ad5';x.fillRect(px-6*s,py-9*s,12*s,9*s);x.fillStyle='#ffd23f';x.beginPath();x.arc(px+3*s,py-9*s,3*s,Math.PI,0);x.fill();x.fillStyle='#fff';x.fillRect(px-4*s,py-6*s,3*s,2*s);
     x.save();x.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const q=((t*.12+i/7)%1),bx=px+3*s+Math.sin(t*1.3+i*2)*10*s*q+q*24*s,byy=py-12*s-q*60*s,rr=(1.5+i%3)*s*(.6+q);if(q>.95)continue;x.strokeStyle=`rgba(${['200,240,255','255,210,240','220,255,220'][i%3]},${.7*(1-q)})`;x.lineWidth=.7*s;x.beginPath();x.arc(bx,byy,rr,0,7);x.stroke();x.fillStyle=`rgba(255,255,255,${.5*(1-q)})`;x.beginPath();x.arc(bx-rr*.4,byy-rr*.4,rr*.25,0,7);x.fill()}x.restore()},
   '流木アート'(px,py){const s=k*1.1;shadowE(px,py+1*s,16*s,2.4*s,.35);x.strokeStyle='#8a6a48';x.lineWidth=2.2*s;x.lineCap='round';x.beginPath();x.moveTo(px-14*s,py-10*s);x.quadraticCurveTo(px,py-22*s,px+12*s,py-10*s);x.quadraticCurveTo(px,py+0*s,px-14*s,py-10*s);x.stroke();
     x.beginPath();x.moveTo(px+12*s,py-10*s);x.lineTo(px+20*s,py-17*s);x.moveTo(px+12*s,py-10*s);x.lineTo(px+20*s,py-4*s);x.stroke();x.lineWidth=1.2*s;for(let i=0;i<4;i++){x.beginPath();x.moveTo(px-8*s+i*5*s,py-15*s+i*.5*s);x.lineTo(px-6*s+i*5*s,py-6*s);x.stroke()}
     x.fillStyle='#f4ead8';x.beginPath();x.arc(px-8*s,py-12*s,1.4*s,0,7);x.fill();x.strokeStyle='#6a4a30';x.lineWidth=1.2*s;x.beginPath();x.moveTo(px-2*s,py-1*s);x.lineTo(px-2*s,py+1*s);x.moveTo(px+4*s,py-1*s);x.lineTo(px+4*s,py+1*s);x.stroke();x.lineCap='butt'},
   'ブランコ'(px,py){const s=k*1.1;shadowE(px,py+1*s,18*s,2.6*s,.35);x.strokeStyle='#7a5530';x.lineWidth=2.4*s;x.beginPath();x.moveTo(px-16*s,py);x.lineTo(px-11*s,py-40*s);x.lineTo(px+11*s,py-40*s);x.lineTo(px+16*s,py);x.stroke();
     const sw=Math.sin(t*1.6)*.35;x.save();x.translate(px,py-40*s);x.rotate(sw);x.strokeStyle='#d8c8a8';x.lineWidth=.8*s;x.beginPath();x.moveTo(-5*s,0);x.lineTo(-5*s,32*s);x.moveTo(5*s,0);x.lineTo(5*s,32*s);x.stroke();x.fillStyle='#c87a3a';x.fillRect(-7*s,32*s,14*s,2.4*s);x.restore()},
   'ビーチハウス'(px,py){const s=k*1.15;shadowE(px,py+1*s,26*s,3.5*s,.4);x.fillStyle=vgrad(py-24*s,py,[[0,'#f4ead8'],[1,'#d8c8a8']]);x.fillRect(px-20*s,py-24*s,40*s,24*s);
     x.fillStyle='#4aa0c8';x.beginPath();x.moveTo(px-25*s,py-23*s);x.lineTo(px,py-40*s);x.lineTo(px+25*s,py-23*s);x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.moveTo(px-25*s,py-23*s);x.lineTo(px,py-40*s);x.lineTo(px-2*s,py-34*s);x.lineTo(px-20*s,py-23*s);x.fill();
     x.fillStyle='#8a5a2a';x.fillRect(px-5*s,py-14*s,10*s,14*s);const lit=dark>.5;x.fillStyle=lit?'#ffd88a':'#9ad0ee';x.fillRect(px-16*s,py-18*s,7*s,6*s);x.fillRect(px+9*s,py-18*s,7*s,6*s);
     if(lit){x.save();x.globalCompositeOperation='lighter';glow(px-12.5*s,py-15*s,12*s,'rgba(255,200,120,.35)');glow(px+12.5*s,py-15*s,12*s,'rgba(255,200,120,.35)');x.restore()}
     x.strokeStyle='#8a5a2a';x.lineWidth=.8*s;x.strokeRect(px-16*s,py-18*s,7*s,6*s);x.strokeRect(px+9*s,py-18*s,7*s,6*s);x.fillStyle='#c87a3a';x.fillRect(px-22*s,py-1*s,44*s,2*s)}
  });
  function startShow(name,sec){shows=shows.filter(s=>s.name!==name);shows.push({name,et:0,dur:sec,st:{}})}
  function runShows(layer,rdt){for(const s of shows){const d=SHOW[s.name];if(!d){s.done=true;continue}const f=d.L?d.L[layer]:(d.layer===layer?d.draw:null);if(d.L?layer==='sky':d.layer===layer)s.et+=rdt;if(!f)continue;const p=s.et/s.dur;if(p>=1){s.done=true;continue}x.save();f(p,s.st,s.et,rdt);x.restore()}shows=shows.filter(s=>!s.done)}
  function drawNotes(){x.save();for(const n of notes){n.y-=.5*k;n.x+=Math.sin(n.y*.05)*.4;n.l-=.006;x.globalAlpha=Math.max(0,n.l);x.fillStyle=n.c;x.font=`${Math.round(14*k)}px sans-serif`;x.fillText(n.s,n.x,n.y)}notes=notes.filter(n=>n.l>0);x.restore()}
  let coins=0;
  function frame(now){
    {const idle=performance.now()-(window._lastInput||0)>60000,iv=window._eco?Math.max(90,!document.hasFocus()?140:90):!document.hasFocus()?100:document.body.classList.contains('reachOn')||document.body.classList.contains('dbl')?36:idle?70:42;if(now-last<iv&&!still){requestAnimationFrame(frame);return}}
    const rdt=still?0:Math.min(.1,(now-last)/1000||.033);t+=rdt*.55;last=now;
    if(!still&&!cur&&now>=nextAt&&!document.hidden){startEvent();nextAt=now+300000*evMul()}
    if(festOn()){if(ambAt-now>25000)ambAt=now+R(4000,12000);if(visitAt-now>90000)visitAt=now+R(15000,40000)}
    if(!still&&!vcur&&now>=visitAt&&!document.hidden){startVisitor();visitAt=now+R(540000,720000)*visMul()*(festOn()?.12:1)}
    if(!still&&!acur&&now>=ambAt&&!document.hidden){startAmb();ambAt=now+R(150000,240000)*(festOn()?.08:1)}
    sky();runEvents('sky',rdt);runAmb('sky',rdt);runVisitor('sky',rdt);seasonDraw('sky');try{festX('sky')}catch(e){}try{nightFx('sky')}catch(e){}runShows('sky',rdt);try{skyDeco()}catch(e){}try{sekkiFx()}catch(e){}try{wxSky()}catch(e){}
    ITEMS.forEach(it=>{const target=hasDeco(it.n)?1:0;it.a+=(target-it.a)*(still?1:.04)});
    const by=n=>ITEMS.find(i=>i.n===n);
    LT=Math.max(0,Math.min(1,(dark-.2)/.5));
    const drawItem=n=>{const it=by(n);if(!it||it.a<.01)return;const[px,py]=pos(it);x.globalAlpha=it.a;
      if(LITS.has(n)&&LT<1){const og=glow;glow=(a,b,c,d,e)=>{if(LT<.02)return;x.save();x.globalAlpha*=LT;og(a,b,c,d,e);x.restore()};try{DRAW[n](px,py)}finally{glow=og}}else DRAW[n](px,py);x.globalAlpha=1};
    drawItem('うちあげ はなび');drawItem('カイト');drawItem('気球');
    sea();runEvents('sea',rdt);runVisitor('sea',rdt);runAmb('sea',rdt);drawFloat();runShows('sea',rdt);try{festX('sea')}catch(e){}try{nightFx('sea')}catch(e){}drawItem('とうだい');drawItem('豪華クルーザー');drawItem('ヨット');drawItem('さんばし');drawItem('カヌー');drawItem('浮き輪');GENL.sea.forEach(drawItem);try{NEWS.forEach(drawItem)}catch(e){}try{tideDraw()}catch(e){}
    ['キャンピングカー','木の看板','天体望遠鏡','星の門','ビーチパラソル','テント','ヤシの木','ハンモック','ライトのガーランド','ギター','サーフボード','ながれぎの ベンチ','ロッキングチェア','ふうりん','ホタルの小びん','砂の城','ちょうちん','浮き玉ランプ','星のプロジェクター','ミラーボール','ビーチチェア','ドリームキャッチャー','石灯籠'].forEach(drawItem);try{NEWB.forEach(drawItem)}catch(e){}GENL.beach.forEach(drawItem);ITEMS.forEach(i=>{if(i.gen)drawItem(i.n)});
    runEvents('beach',rdt);runAmb('beach',rdt);seasonDraw('beach');try{festX('beach')}catch(e){}runVisitor('beach',rdt);runShows('beach',rdt);drawNotes();
    try{moonScene()}catch(e){}
    if(!S.moonOn){fire();try{fireFx()}catch(e){}}
    ['ランタン','キャンドル','スイカ','ビーチボール','たからばこ','バーベキューグリル','たいまつ'].forEach(drawItem);
    runEvents('front',rdt);runAmb('front',rdt);runVisitor('front',rdt);seasonDraw('front');try{festX('front')}catch(e){}try{nightFx('front')}catch(e){}runShows('front',rdt);try{wxFx(rdt)}catch(e){}
    const v=x.createRadialGradient(W/2,WT+WH*.6,Math.max(WW,WH)*.45,W/2,WT+WH*.6,Math.max(W,H)*.9);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(0,0,0,${.12+.16*dark})`);x.fillStyle=v;x.fillRect(0,0,W,H);
    if(!still)requestAnimationFrame(frame);
  }
  rs();addEventListener('resize',()=>{rs();if(still)frame(performance.now())});
  let rsT;if(window.ResizeObserver)new ResizeObserver(()=>{clearTimeout(rsT);rsT=setTimeout(()=>{rs();if(still)frame(performance.now())},60)}).observe($('window'));
  try{document.fonts&&document.fonts.ready.then(()=>{rs();if(still)frame(performance.now())})}catch(e){}
  setInterval(()=>{const r=$('window').getBoundingClientRect();if(Math.abs(r.left-WL)>1||Math.abs(r.top+scrollY-WT)>1||Math.abs((r.width||W)-WW)>1||Math.abs(Math.max(r.height,120)-WH)>1||innerWidth!==W||docH()!==H){rs();if(still)frame(performance.now())}},1000);
  /* ---------- 海辺の アイテム（購入制）追加分 ---------- */
  ITEMS.push({c:1200,n:'浮き輪',d:[0,0],m:[.22,.52],a:0},{c:15000,n:'カヌー',d:[0,0],m:[.55,.5],a:0},{c:6000,n:'カイト',d:[0,0],m:[.3,.13],a:0},{c:2500,n:'ふうりん',d:[0,0],m:[.78,.4],a:0},
   {c:60000,n:'天体望遠鏡',d:[0,0],m:[.67,.95],a:0},{c:1500,n:'砂の城',d:[0,0],m:[.57,.985],a:0},{c:600,n:'スイカ',d:[0,0],m:[.3,.985],a:0},{c:500,n:'ビーチボール',d:[0,0],m:[.8,.97],a:0},{c:4000,n:'ホタルの小びん',d:[0,0],m:[.27,.9],a:0});
  LITS.add('ホタルの小びん');
  {const PR={'ランタン':300,'ロッキングチェア':800,'ヤシの木':2000,'テント':3000,'ライトのガーランド':5000,'ヨット':10000,'ハンモック':20000,'サーフボード':25000,'ビーチパラソル':35000,'気球':150000,'豪華クルーザー':250000,'星の門':400000};ITEMS.forEach(i=>{if(PR[i.n])i.c=PR[i.n]});ITEMS.sort((a,b)=>a.c-b.c)}
  Object.assign(DRAW,{
   '浮き輪'(px,py){const s=k*1.1,by=py+Math.sin(t*1.4)*1.2*k,r=Math.sin(t*.9)*.08;x.save();x.translate(px+Math.sin(t*.2)*6*k,by);x.rotate(r);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.8;x.beginPath();x.ellipse(0,3*s,16*s,3*s,0,0,7);x.stroke();
     for(let i=0;i<8;i++){x.strokeStyle=i%2?'#ffffff':'#ff4a5a';x.lineWidth=4.5*s;x.beginPath();x.ellipse(0,0,10*s,4*s,0,i/8*Math.PI*2,(i+1)/8*Math.PI*2);x.stroke()}x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.ellipse(-4*s,-3*s,3*s,.8*s,-.2,0,7);x.fill();x.restore()},
   'カヌー'(px,py){const s=k*.8,bx=px+Math.sin(t*.15)*10*k,by=py+Math.sin(t*1.2)*.8*k;x.fillStyle='rgba(255,255,255,.25)';x.fillRect(bx-24*s,by+3*s,48*s,1*s);x.fillStyle=vgrad(by-5*s,by+3*s,[[0,'#e8a040'],[1,'#8a4a1a']]);
     x.beginPath();x.moveTo(bx-28*s,by-5*s);x.quadraticCurveTo(bx,by+6*s,bx+28*s,by-5*s);x.quadraticCurveTo(bx,by-1*s,bx-28*s,by-5*s);x.fill();x.strokeStyle='#5a3418';x.lineWidth=1.4*s;x.beginPath();x.moveTo(bx+4*s,by-12*s);x.lineTo(bx+14*s,by+2*s);x.stroke();x.fillStyle='#5a3418';x.beginPath();x.ellipse(bx+14*s,by+2*s,1.6*s,3*s,.6,0,7);x.fill()},
   'カイト'(px,py){const s=k,kx=px+Math.sin(t*.7)*10*k,ky=py+Math.sin(t*1.1)*6*k,r=Math.sin(t*.9)*.2;x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.6;x.beginPath();x.moveTo(kx,ky+10*s);x.quadraticCurveTo(kx-30*k,ky+120*k,WL+WW*.05,WT+WH*.78);x.stroke();
     x.save();x.translate(kx,ky);x.rotate(r);const C=['#ff5c8a','#ffd23f','#55e0b4','#7aa2ff'];[[0,-12,10,0],[10,0,0,12],[0,12,-10,0],[-10,0,0,-12]].forEach((q,i)=>{x.fillStyle=C[i];x.beginPath();x.moveTo(0,0);x.lineTo(q[0]*s,q[1]*s);x.lineTo(q[2]*s,q[3]*s);x.fill()});
     x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.6;x.beginPath();x.moveTo(0,12*s);for(let i=1;i<6;i++)x.lineTo(Math.sin(t*3+i)*3*s,(12+i*5)*s);x.stroke();for(let i=1;i<5;i++){x.fillStyle=C[i%4];x.fillRect(Math.sin(t*3+i)*3*s-1.5*s,(12+i*5)*s,3*s,1.6*s)}x.restore()},
   'ふうりん'(px,py){const s=k*1.5,sw=Math.sin(t*1.7)*.18;x.strokeStyle='rgba(230,230,230,.6)';x.lineWidth=.6;x.beginPath();x.moveTo(px,py-16*s);x.lineTo(px,py-6*s);x.stroke();x.save();x.translate(px,py-6*s);x.rotate(sw);
     const g=x.createRadialGradient(-2*s,-1*s,1,0,2*s,7*s);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(150,210,255,.55)');x.fillStyle=g;x.beginPath();x.arc(0,4*s,5*s,Math.PI,0);x.lineTo(5*s,5*s);x.lineTo(-5*s,5*s);x.fill();
     x.fillStyle='#ff5c5c';x.beginPath();x.arc(-2*s,2*s,.9*s,0,7);x.arc(2*s,3*s,.8*s,0,7);x.fill();x.strokeStyle='rgba(230,230,230,.6)';x.beginPath();x.moveTo(0,5*s);x.lineTo(0,10*s);x.stroke();x.rotate(sw*1.4);x.fillStyle='#fff8e0';x.fillRect(-2.2*s,10*s,4.4*s,8*s);x.fillStyle='#d23b3b';x.fillRect(-1*s,12*s,2*s,.6*s);x.restore()},
   '天体望遠鏡'(px,py){const s=k*1.1;shadowE(px,py+1*s,14*s,3*s,.4);x.strokeStyle='#3a3a44';x.lineWidth=1.4*s;x.beginPath();x.moveTo(px,py-14*s);x.lineTo(px-8*s,py);x.moveTo(px,py-14*s);x.lineTo(px+8*s,py);x.moveTo(px,py-14*s);x.lineTo(px+1*s,py);x.stroke();
     x.save();x.translate(px,py-15*s);x.rotate(-.55+Math.sin(t*.1)*.05);x.fillStyle=hgrad(-12*s,16*s,[[0,'#2a2f45'],[.5,'#e8ecf4'],[1,'#8a90a8']]);x.fillRect(-12*s,-3*s,28*s,6*s);x.fillStyle='#d4af37';x.fillRect(14*s,-3.6*s,3*s,7.2*s);x.fillStyle='#3a3a44';x.fillRect(-14*s,-1.6*s,3*s,3.2*s);
     if(dark>.5){x.globalCompositeOperation='lighter';glow(17*s,0,6*s,'rgba(200,220,255,.5)')}x.restore()},
   '砂の城'(px,py){const s=k*1.05,c1='#e8cf96',c2='#c9a96a';shadowE(px,py+1*s,26*s,4*s,.3);x.fillStyle=vgrad(py-10*s,py,[[0,c1],[1,c2]]);x.fillRect(px-20*s,py-10*s,40*s,10*s);x.fillRect(px-14*s,py-20*s,10*s,10*s);x.fillRect(px+4*s,py-20*s,10*s,10*s);x.fillRect(px-4*s,py-28*s,8*s,18*s);
     x.fillStyle=c2;for(let i=0;i<4;i++){x.fillRect(px-20*s+i*11*s,py-12*s,4*s,2*s)}[[-9,-20],[9,-20],[0,-28]].forEach(([o,h])=>{x.fillStyle=c1;x.beginPath();x.moveTo(px+(o-6)*s,py+h*s);x.lineTo(px+o*s,py+(h-7)*s);x.lineTo(px+(o+6)*s,py+h*s);x.fill()});
     x.fillStyle='#8a6a3a';x.beginPath();x.arc(px,py-3*s,3*s,Math.PI,0);x.fill();x.fillStyle='#ff5c5c';x.fillRect(px-.3*s,py-42*s,.6*s,7*s);x.beginPath();x.moveTo(px+.3*s,py-42*s);x.lineTo(px+5*s+Math.sin(t*4)*1*s,py-40*s);x.lineTo(px+.3*s,py-38*s);x.fill();
     x.fillStyle='#f4e7d0';x.beginPath();x.ellipse(px+16*s,py-1*s,2.4*s,1.6*s,.4,0,7);x.fill()},
   'スイカ'(px,py){const s=k*1.1;shadowE(px,py+1*s,12*s,3*s,.4);const g=x.createRadialGradient(px-3*s,py-9*s,1,px,py-6*s,10*s);g.addColorStop(0,'#5fbf5a');g.addColorStop(1,'#1f6a2a');x.fillStyle=g;x.beginPath();x.ellipse(px,py-6*s,10*s,7*s,0,0,7);x.fill();
     x.strokeStyle='#0e3a16';x.lineWidth=1.3*s;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(px+i*3.6*s,py-12.6*s);x.quadraticCurveTo(px+i*5*s+Math.sin(i)*2*s,py-6*s,px+i*3.6*s,py+.6*s);x.stroke()}x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.ellipse(px-4*s,py-10*s,3*s,1.2*s,-.3,0,7);x.fill()},
   'ビーチボール'(px,py){const s=k*1.1,b=Math.abs(Math.sin(t*.6))>.97?2*k:0,r=Math.sin(t*.3)*.3;shadowE(px,py+1*s,8*s,2*s,.4);x.save();x.translate(px,py-7*s-b);x.rotate(r);const C=['#ff4a5a','#ffffff','#2f8fff','#ffd23f','#ffffff','#55c870'];
     for(let i=0;i<6;i++){x.fillStyle=C[i];x.beginPath();x.moveTo(0,0);x.arc(0,0,7*s,i/6*Math.PI*2,(i+1)/6*Math.PI*2);x.fill()}x.fillStyle='#fff';x.beginPath();x.arc(0,0,1.6*s,0,7);x.fill();x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(-3*s,-3*s,2*s,1*s,-.6,0,7);x.fill();x.restore()},
   'ホタルの小びん'(px,py){const s=k*1.1;shadowE(px,py+1*s,6*s,1.6*s,.4);x.save();x.globalCompositeOperation='lighter';glow(px,py-7*s,22*s,'rgba(200,255,120,.25)');x.restore();x.fillStyle='rgba(200,230,255,.28)';x.strokeStyle='rgba(230,245,255,.6)';x.lineWidth=.7;
     x.beginPath();x.moveTo(px-5*s,py);x.lineTo(px-5*s,py-11*s);x.quadraticCurveTo(px-5*s,py-13*s,px-3*s,py-13*s);x.lineTo(px+3*s,py-13*s);x.quadraticCurveTo(px+5*s,py-13*s,px+5*s,py-11*s);x.lineTo(px+5*s,py);x.closePath();x.fill();x.stroke();x.fillStyle='#8a6a3a';x.fillRect(px-3.4*s,py-15.5*s,6.8*s,2.6*s);
     x.save();x.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const fx=px+Math.sin(t*1.3+i*2)*3*s,fy=py-6*s+Math.cos(t*1.1+i*1.7)*4*s,b=.4+.6*Math.max(0,Math.sin(t*2+i*1.9));glow(fx,fy,3*s,`rgba(220,255,140,${.8*b})`)}x.restore()}});
  /* 固有イベント（購入した アイテムだけで 起こる） */
  const DP=n=>{const it=ITEMS.find(i=>i.n===n);return it?pos(it):[WL+WW*.5,WT+WH*.8]};
  const dk=(n,dur,layer,draw)=>({deco:n,dur,layer,draw});
  Object.assign(AMB,{
   dk_lantern:dk('ランタン',22,'front',(p,st,et)=>{const[px,py]=DP('ランタン'),a=fade(p,.08,.1);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const an=et*(1+i*.1)+i,rr=(10+i*2)*k,fx=px+Math.cos(an)*rr,fy=py-18*k+Math.sin(an*1.3)*rr*.6;x.globalAlpha=a;glow(fx,fy,5*k,'rgba(255,240,170,.8)')}x.restore();x.globalAlpha=1}),
   dk_chair:dk('ロッキングチェア',40,'front',(p,st,et)=>{const[px,py]=DP('ロッキングチェア'),a=fade(p,.06,.08),sw=Math.sin(et*1.1)*.065;x.globalAlpha=a;const s2=k*1.2;x.save();x.translate(px+sw*58*s2,py);x.rotate(sw);x.translate(2*s2,-40*s2);const nt=dark>.5,C=c=>nt?mixc(c,'#1a1830',.45):c;x.lineCap='round';x.strokeStyle=C('#5a4a3a');x.lineWidth=4.5*s2;x.beginPath();x.moveTo(0,0);x.lineTo(14*s2,-1*s2);x.lineTo(16*s2,13*s2);x.stroke();x.fillStyle=C('#3a2a1a');x.fillRect(14*s2,12*s2,5*s2,2.4*s2);x.fillStyle=C('#8a7a6a');x.beginPath();x.moveTo(-4*s2,1*s2);x.lineTo(-6*s2,-18*s2);x.quadraticCurveTo(0,-21*s2,4*s2,-17*s2);x.lineTo(5*s2,1*s2);x.fill();x.strokeStyle=C('#8a7a6a');x.lineWidth=3*s2;x.beginPath();x.moveTo(1*s2,-15*s2);x.lineTo(9*s2,-6*s2);x.lineTo(14*s2,-5*s2);x.stroke();x.fillStyle=C('#e9bf98');x.beginPath();x.arc(-1*s2,-24*s2,4.6*s2,0,7);x.fill();x.fillStyle=C('#e0e0e0');x.beginPath();x.arc(-2*s2,-25.5*s2,4.6*s2,Math.PI*.9,Math.PI*1.9);x.fill();x.strokeStyle='#333';x.lineWidth=.6*s2;x.beginPath();x.arc(2.4*s2,-24*s2,1.3*s2,0,7);x.stroke();x.restore();
     if(p>.5){const q=(et*.5)%1;x.globalAlpha=a*(1-q);x.fillStyle='#fff';x.font=`${(6+q*3)*k}px sans-serif`;x.fillText('z',px+10*k+q*5*k,py-48*k-q*12*k)}x.globalAlpha=1}),
   dk_palm:dk('ヤシの木',10,'beach',(p,st,et)=>{const[px,py]=DP('ヤシの木'),tx=px-48*k*1.05,ty=py-255*k,gy=WT+WH*.97;let cx=tx+6*k,cy;if(p<.15)cy=ty+Math.sin(et*30)*1*k;else if(p<.4){const q=(p-.15)/.25;cy=lerp(ty,gy,q*q)}else{const q=(p-.4)/.6;cx=tx+6*k+q*30*k;cy=gy-Math.abs(Math.sin(q*Math.PI*3))*14*k*(1-q)}
     x.globalAlpha=fade(p,.02,.1);x.fillStyle='#6a4a2a';x.beginPath();x.arc(cx,cy-4*k,4.6*k,0,7);x.fill();x.fillStyle='#3a2a18';x.beginPath();x.arc(cx-1.4*k,cy-5*k,.7*k,0,7);x.arc(cx+1*k,cy-5.4*k,.7*k,0,7);x.fill();if(p>.38&&p<.46){x.fillStyle='#fff';x.font=`bold ${8*k}px sans-serif`;x.fillText('ゴンッ',cx-12*k,cy-14*k)}x.globalAlpha=1}),
   dk_tent:dk('テント',36,'beach',(p,st,et)=>{const[px,py]=DP('テント'),a=fade(p,.06,.08);x.globalAlpha=a;x.save();x.globalCompositeOperation='lighter';glow(px-6*k,py-16*k,40*k,`rgba(255,200,120,${.35+.1*Math.sin(et*3)})`);x.restore();
     [[-12,Math.sin(et*2)],[0,Math.sin(et*2+2)]].forEach(([o,b])=>{x.fillStyle='rgba(60,25,10,.55)';x.beginPath();x.ellipse(px-6*k+o*k*.6,py-14*k-b*1.5*k,3.2*k,4*k,0,0,7);x.fill();x.fillRect(px-9*k+o*k*.6,py-11*k-b*1.5*k,6*k,10*k)});
     const q=(et*.6)%1;x.globalAlpha=a*(1-q);x.fillStyle='#fff';x.font=`${7*k}px sans-serif`;x.fillText(['ふふっ','♪','あはは','…'][Math.floor(et*.6)%4],px+6*k+q*4*k,py-46*k-q*10*k);x.globalAlpha=1}),
   dk_garland:dk('ライトのガーランド',20,'front',(p,st,et)=>{const a=fade(p,.05,.08);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<30;i++){const u=i/30,fx=WL+WW*(.58+u*.34),fy=WT+WH*(.42+Math.sin(u*Math.PI)*.18)+Math.sin(et*3+i)*3*k,on=Math.sin(et*6-i*.7)>0;
     if(!on)continue;x.globalAlpha=a;glow(fx,fy,6*k,`hsla(${(i*40+et*120)%360},100%,70%,.8)`)}x.restore();x.globalAlpha=1}),
   dk_yacht:dk('ヨット',26,'sea',(p,st,et)=>{const[px,py]=DP('ヨット'),a=fade(p,.06,.08);x.globalAlpha=a;for(let i=0;i<3;i++){const an=et*.9+i*2.1,gx=px+Math.cos(an)*28*k,gy=py-34*k+Math.sin(an)*8*k,f=Math.sin(et*8+i);x.strokeStyle=sil('#f4f4f4');x.lineWidth=1.2*k;x.beginPath();x.moveTo(gx-6*k,gy-f*3*k);x.quadraticCurveTo(gx-3*k,gy-2*k,gx,gy);x.quadraticCurveTo(gx+3*k,gy-2*k,gx+6*k,gy-f*3*k);x.stroke()}
     x.fillStyle='#ff5c5c';x.fillRect(px+1*k,py-38*k,.6*k,5*k);x.beginPath();x.moveTo(px+1.6*k,py-38*k);x.lineTo(px+7*k+Math.sin(et*5)*k,py-36.5*k);x.lineTo(px+1.6*k,py-35*k);x.fill();x.globalAlpha=1}),
   dk_hammock:dk('ハンモック',44,'beach',(p,st,et)=>{const mx=WL+WW*.75+Math.sin(t*.9)*3*k,my=WT+WH*.69+26*k,a=fade(p,.06,.08);x.globalAlpha=a;x.save();x.translate(mx,my-4*k);x.rotate(Math.PI/2-.08);human(0,0,.85*k,0,'#55e0b4','#e9bf98',false,1,{hair:'#3a2010'});x.restore();
     x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.ellipse(mx-10*k,my-30*k,14*k,8*k,0,0,7);x.fill();x.beginPath();x.arc(mx-2*k,my-18*k,2*k,0,7);x.arc(mx+1*k,my-13*k,1.2*k,0,7);x.fill();x.font=`${9*k}px sans-serif`;x.textAlign='center';x.fillText(['💰','🍀','🌟','🍰'][Math.floor(et/3)%4],mx-10*k,my-27*k);x.textAlign='left';x.globalAlpha=1}),
   dk_surf:dk('サーフボード',20,'sea',(p,st,et)=>{const sx=lerp(WL+WW*.1,WL+WW*.95,p),sy=seaY(.75)+Math.sin(et*2)*2*k;x.globalAlpha=fade(p,.08,.08);x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.ellipse(sx-16*k,sy+4*k,22*k,4*k,0,0,7);x.fill();x.fillStyle='#9be0ff';x.beginPath();x.ellipse(sx,sy+2*k,14*k,2.6*k,-.1,0,7);x.fill();human(sx,sy,.9*k,0,'#2c3e66','#d9a57a',false,1);x.globalAlpha=1}),
   dk_parasol:dk('ビーチパラソル',16,'front',(p,st,et)=>{const[px,py]=DP('ビーチパラソル'),q=p<.5?p*2:2-p*2,cx=px+q*WW*.5,cy=py-70*k-Math.sin(q*Math.PI)*60*k;x.globalAlpha=fade(p,.04,.04)*(p>.1&&p<.9?1:.6);x.save();x.translate(cx,cy);x.rotate(et*4);for(let i=0;i<8;i++){x.fillStyle=i%2?'#f6efe2':'#e8463e';x.beginPath();x.moveTo(0,0);x.arc(0,0,22*k,i/8*Math.PI*2,(i+1)/8*Math.PI*2);x.fill()}x.restore();
     if(p>.2&&p<.6){x.fillStyle='#fff';x.font=`bold ${8*k}px sans-serif`;x.fillText('あーっ！',px+4*k,py-90*k)}x.globalAlpha=1}),
   dk_balloon:dk('気球',24,'sky',(p,st,et)=>{const[px,py]=DP('気球');st.c??=[];if(Math.random()<.5)st.c.push({x:px+R(-4,4)*k,y:py+16*k,vx:R(-.6,.6)*k,vy:R(.2,.6)*k,c:['#ff9ec4','#ffd23f','#ffffff','#7aa2ff'][Math.random()*4|0],r:R(0,6)});const a=fade(p,.05,.1);
     for(const c of st.c){c.x+=c.vx+Math.sin(et+c.r)*.2;c.y+=c.vy;c.r+=.1;x.globalAlpha=a;x.fillStyle=c.c;x.save();x.translate(c.x,c.y);x.rotate(c.r);x.fillRect(-1.6*k,-.8*k,3.2*k,1.6*k);x.restore()}st.c=st.c.filter(c=>c.y<shore);x.globalAlpha=1}),
   dk_cruiser:dk('豪華クルーザー',30,'sea',(p,st,et)=>{const[px,py]=DP('豪華クルーザー'),a=fade(p,.05,.08);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const fx=px-20*k+i*8*k,fy=py-8*k;x.globalAlpha=a*(Math.sin(et*5+i)>0?1:.3);glow(fx,fy,4*k,`hsla(${(i*60+et*90)%360},100%,65%,.9)`)}
     if(Math.floor(et*.7)%3===0){const q=(et*.7)%1;x.globalAlpha=a*(1-q);for(let i=0;i<14;i++){const an=i/14*Math.PI*2;glow(px+Math.cos(an)*q*22*k,py-50*k+Math.sin(an)*q*22*k,3*k,'rgba(255,210,120,.9)')}}x.restore();
     const q=(et*1.2)%1;x.globalAlpha=a*(1-q);x.fillStyle='#ffe7a8';x.font=`${8*k}px sans-serif`;x.fillText('♪',px+12*k+q*6*k,py-16*k-q*14*k);x.globalAlpha=1}),
   dk_gate:dk('星の門',22,'front',(p,st,et)=>{const[px,py]=DP('星の門'),a=fade(p,.06,.1);st.s??=[];if(Math.random()<.6)st.s.push({x:px+R(-20,20)*k,y:py-38*k,vx:R(-1.4,1.4)*k,vy:R(-1.6,-.2)*k,l:1});x.save();x.globalCompositeOperation='lighter';x.globalAlpha=a;glow(px,py-36*k,40*k,`rgba(180,200,255,${.35+.2*Math.sin(et*3)})`);
     for(const s of st.s){s.x+=s.vx;s.y+=s.vy;s.vy+=.03*k;s.l-=.012;x.globalAlpha=a*Math.max(0,s.l);glow(s.x,s.y,4*k,'rgba(255,250,200,.9)')}st.s=st.s.filter(s=>s.l>0);x.restore();x.globalAlpha=1}),
   dk_ring:dk('浮き輪',30,'sea',(p,st,et)=>{const[px,py]=DP('浮き輪'),a=fade(p,.06,.08),bx=px+Math.sin(t*.2)*6*k,by=py+Math.sin(t*1.4)*1.2*k;x.globalAlpha=a;x.fillStyle='#e9bf98';x.beginPath();x.arc(bx,by-6*k,3.6*k,0,7);x.fill();x.fillStyle='#3a2010';x.beginPath();x.arc(bx,by-7.4*k,3.6*k,Math.PI,0);x.fill();
     x.strokeStyle='#e9bf98';x.lineWidth=1.6*k;const w=Math.sin(et*6)*3*k;x.beginPath();x.moveTo(bx+3*k,by-3*k);x.lineTo(bx+8*k,by-8*k-w);x.stroke();x.globalAlpha=1}),
   dk_canoe:dk('カヌー',30,'sea',(p,st,et)=>{const[px,py]=DP('カヌー'),a=fade(p,.06,.08),bx=px+Math.sin(t*.15)*10*k,by=py,pd=Math.sin(et*3);x.globalAlpha=a;human(bx-2*k,by-2*k,.7*k,0,'#ffd23f','#d9a57a',false,1);x.strokeStyle='#5a3418';x.lineWidth=1.2*k;x.beginPath();x.moveTo(bx-6*k-pd*6*k,by-14*k);x.lineTo(bx+2*k+pd*6*k,by+3*k);x.stroke();
     if(p>.6){x.fillStyle='#8ab4d8';x.beginPath();x.moveTo(bx+8*k,by-12*k);x.quadraticCurveTo(bx+14*k,by-16*k,bx+18*k,by-12*k);x.quadraticCurveTo(bx+14*k,by-8*k,bx+8*k,by-12*k);x.fill();x.fillStyle='#fff';x.font=`${7*k}px sans-serif`;x.fillText('釣れた！',bx-4*k,by-22*k)}x.globalAlpha=1}),
   dk_scope:dk('天体望遠鏡',30,'beach',(p,st,et)=>{const[px,py]=DP('天体望遠鏡'),a=fade(p,.06,.08);x.globalAlpha=a;human(px-12*k,py,.85*k,0,'#5a6a9a','#e9bf98',false,1);const sx=WL+WW*(.2+p*.5),sy=hz*(.2+p*.2);x.save();x.globalCompositeOperation='lighter';glow(sx,sy,6*k,'rgba(255,255,220,.9)');
     x.strokeStyle='rgba(255,255,220,.5)';x.lineWidth=1.2*k;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx-30*k,sy-12*k);x.stroke();x.restore();x.globalAlpha=1}),
   dk_castle:dk('砂の城',26,'beach',(p,st,et)=>{const[px,py]=DP('砂の城'),cx=p<.3?lerp(px+40*k,px+4*k,p/.3):p<.7?px+4*k:lerp(px+4*k,px-40*k,(p-.7)/.3),cy=p<.3||p>.7?py:py-28*k*1.05,a=fade(p,.05,.05),w=Math.sin(et*8);x.globalAlpha=a;x.save();x.translate(cx,cy-3*k);
     x.fillStyle='#e8553a';x.beginPath();x.ellipse(0,0,5*k,3.2*k,0,0,7);x.fill();x.strokeStyle='#e8553a';x.lineWidth=1*k;[-1,1].forEach(d=>{for(let i=0;i<3;i++){x.beginPath();x.moveTo(d*4*k,i*1*k);x.lineTo(d*8*k,(i*1.6+2)*k+w*k);x.stroke()}x.beginPath();x.arc(d*6*k,-4*k-Math.abs(w)*k,2*k,0,7);x.stroke()});x.fillStyle='#111';x.fillRect(-2*k,-3*k,1*k,1*k);x.fillRect(1*k,-3*k,1*k,1*k);x.restore();x.globalAlpha=1}),
   dk_suika:dk('スイカ',24,'beach',(p,st,et)=>{const[px,py]=DP('スイカ'),a=fade(p,.05,.06),hx=px+18*k+Math.sin(et*.8)*6*k;x.globalAlpha=a;human(hx,py,.85*k,p<.7?et*2:0,'#ff9ec4','#f1c7a0',false,-1);x.fillStyle='#fff';x.fillRect(hx-3*k,py-28*k,6*k,1.6*k);
     const sw=p>.65&&p<.72;x.strokeStyle='#8a5a3a';x.lineWidth=1.6*k;x.beginPath();x.moveTo(hx-2*k,py-17*k);sw?x.lineTo(hx-16*k,py-6*k):x.lineTo(hx+2*k,py-34*k);x.stroke();if(p>.7){x.fillStyle='#ff4a5a';x.beginPath();x.arc(px,py-6*k*1.1,9*k,Math.PI,0);x.fill();x.fillStyle='#fff';x.font=`bold ${8*k}px sans-serif`;x.fillText('パカッ！',px-12*k,py-20*k)}x.globalAlpha=1}),
   dk_ball:dk('ビーチボール',14,'front',(p,st,et)=>{const[px,py]=DP('ビーチボール'),a=fade(p,.04,.06),q=p,bx=lerp(px,px-WW*.5,q),by=py-7*k-Math.abs(Math.sin(q*Math.PI*4))*40*k*(1-q*.6);x.globalAlpha=a;x.fillStyle='#ff4a5a';x.beginPath();x.arc(bx,by,7*k,0,7);x.fill();x.fillStyle='#2f8fff';x.beginPath();x.arc(bx,by,7*k,0,2);x.lineTo(bx,by);x.fill();
     const dx=lerp(px+30*k,px-WW*.5+14*k,q);x.fillStyle=sil('#d98a3c');x.beginPath();x.ellipse(dx,py-6*k,8*k,4*k,0,0,7);x.fill();x.beginPath();x.arc(dx-8*k,py-10*k,3.4*k,0,7);x.fill();x.globalAlpha=1}),
   dk_firefly:dk('ホタルの小びん',30,'front',(p,st,et)=>{const[px,py]=DP('ホタルの小びん'),a=fade(p,.06,.1);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const q=Math.min(1,p*1.6+i*.02),fx=px+Math.sin(et*.7+i*1.3)*(10+q*60)*k,fy=py-10*k-q*(40+i*4)*k+Math.cos(et+i)*6*k,b=Math.max(0,Math.sin(et*2+i*1.7));x.globalAlpha=a*b;glow(fx,fy,6*k,'rgba(220,255,140,.85)')}x.restore();x.globalAlpha=1}),
   dk_chime:dk('ふうりん',16,'front',(p,st,et)=>{const[px,py]=DP('ふうりん'),a=fade(p,.05,.1);st.s??=Array.from({length:16},()=>({x:R(-W*.3,0),y:R(WT,WT+WH*.6),v:R(1,2)}));for(const s of st.s){s.x+=s.v*k*1.4;s.y+=Math.sin(et*2+s.v)*.4;x.globalAlpha=a*.8;x.fillStyle='#ffc6d9';x.beginPath();x.ellipse(s.x,s.y,2.4*k,1.2*k,et+s.v,0,7);x.fill()}
     if(Math.floor(et*1.5)%2===0){x.globalAlpha=a;x.fillStyle='#fff';x.font=`${7*k}px sans-serif`;x.fillText('チリーン',px-30*k,py-10*k)}x.globalAlpha=1}),
   dk_kite:dk('カイト',14,'sky',(p,st,et)=>{const[px,py]=DP('カイト'),a=fade(p,.05,.05);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<20;i++){const an=et*2-i*.15,rx=px+Math.cos(an)*30*k,ry=py+Math.sin(an)*18*k;x.globalAlpha=a*(1-i/20);glow(rx,ry,3*k,'rgba(255,230,150,.8)')}x.restore();x.globalAlpha=1})});
  /* ---------- リアル天気の 雨・雪（キャンバス描画） ---------- */
  const wxCode=()=>{try{return window.WX_TEST!=null?window.WX_TEST:WX.code}catch(e){return null}};
  const wxKind=()=>{const c=wxCode();if(c==null)return null;if((c>=71&&c<=77)||c===85||c===86)return'snow';if(c>=95)return'storm';if((c>=61&&c<=67)||(c>=80&&c<=82))return c===61||c===80?'rain':'heavy';if(c>=51&&c<=57)return'drizzle';return null};
  let wxA=0,wxDrops=[],wxSpl=[],wxRip=[],wxFlakes=[],wxFlash=0,wxNextBolt=0;
  function wxSky(){const kd=wxKind(),tgt=kd?1:0;wxA+=(tgt-wxA)*.01;if(wxA<.01)return;const sn=kd==='snow',hv=kd==='heavy'||kd==='storm';
    x.fillStyle=sn?`rgba(200,205,220,${.22*wxA})`:`rgba(52,58,74,${(hv?.62:.5)*wxA})`;x.fillRect(0,0,W,hz+2);
    const g=x.createLinearGradient(0,0,0,hz*.6);g.addColorStop(0,`rgba(${sn?'170,175,190':'40,44,58'},${.55*wxA})`);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,hz*.6);
    if(wxFlash>0){x.fillStyle=`rgba(230,235,255,${wxFlash*.55})`;x.fillRect(0,0,W,hz+2)}}
  function wxFx(rdt){const kd=wxKind();if(wxA<.01&&!kd){wxDrops.length=0;wxFlakes.length=0;return}const dt=Math.min(rdt||.016,.05)*60,top=WT,bot=WT+WH;
    x.save();x.beginPath();x.rect(WL,WT,WW,WH);x.clip();
    // 全体を すこし 暗く・しっとり
    x.fillStyle=kd==='snow'?`rgba(220,225,240,${.06*wxA})`:`rgba(20,26,40,${.16*wxA})`;x.fillRect(WL,WT,WW,WH);
    if(kd==='snow'){const N=Math.round(110*wxA);while(wxFlakes.length<N)wxFlakes.push({x:R(WL,WL+WW),y:R(top-WH,bot),r:R(.8,2.6)*k,v:R(.25,.7)*k,ph:R(0,6)});if(wxFlakes.length>N)wxFlakes.length=N;
      for(const f of wxFlakes){f.y+=f.v*dt*(f.r/k*.5+.6);f.x+=Math.sin(t*.8+f.ph)*.35*dt;if(f.y>bot){f.y=top-R(0,40);f.x=R(WL,WL+WW)}x.globalAlpha=.85*wxA;x.fillStyle='#ffffff';x.beginPath();x.arc(f.x,f.y,f.r,0,7);x.fill()}x.restore();x.globalAlpha=1;return}
    const I=kd==='drizzle'?.45:kd==='rain'?.8:1.25,N=Math.round(170*I*wxA),wind=kd==='storm'?2.2:1.1;
    while(wxDrops.length<N){const z=Math.random();wxDrops.push({x:R(WL-40,WL+WW+20),y:R(top-WH,bot),z,l:(6+z*16)*k*(kd==='drizzle'?.55:1),v:(7+z*9)*k*(kd==='drizzle'?.6:1),end:R(shore-6*k,bot)})}if(wxDrops.length>N)wxDrops.length=N;
    x.lineCap='round';
    for(const d of wxDrops){d.y+=d.v*dt;d.x+=wind*d.v*.12*dt;if(d.y>d.end){if(d.z>.35){if(d.end<shore+6*k)wxRip.push({x:d.x,y:d.end,r:.5,l:1});else wxSpl.push({x:d.x,y:d.end,l:1,s:.6+d.z*.6})}d.y=top-R(0,60);d.x=R(WL-40,WL+WW+20);d.end=Math.random()<.5?R(seaY(.15),shore):R(shore,bot);continue}
      x.strokeStyle=`rgba(${200+d.z*40|0},${212+d.z*30|0},255,${(.18+d.z*.4)*wxA})`;x.lineWidth=(.5+d.z*.9)*k*.9;x.beginPath();x.moveTo(d.x,d.y);x.lineTo(d.x-wind*d.l*.12,d.y-d.l);x.stroke()}
    // 海の 波紋
    x.lineWidth=.7;for(const r of wxRip){r.r+=.35*dt;r.l-=.035*dt;x.strokeStyle=`rgba(210,225,255,${.45*r.l*wxA})`;x.beginPath();x.ellipse(r.x,r.y,r.r*k*1.6,r.r*k*.45,0,0,7);x.stroke()}wxRip=wxRip.filter(r=>r.l>0).slice(-120);
    // 砂の しぶき
    for(const s of wxSpl){s.l-=.08*dt;const q=1-s.l;x.strokeStyle=`rgba(225,232,255,${.55*s.l*wxA})`;x.lineWidth=.7*k;x.beginPath();x.moveTo(s.x-1*k-q*3*k*s.s,s.y-q*3*k*s.s);x.lineTo(s.x-.3*k,s.y);x.moveTo(s.x+1*k+q*3*k*s.s,s.y-q*3*k*s.s);x.lineTo(s.x+.3*k,s.y);x.moveTo(s.x,s.y-q*4*k*s.s);x.lineTo(s.x,s.y-.5*k);x.stroke()}wxSpl=wxSpl.filter(s=>s.l>0).slice(-90);
    // 雷
    if(kd==='storm'){const now=performance.now();if(now>wxNextBolt){wxNextBolt=now+R(6000,16000);wxFlash=1;try{setTimeout(()=>{noise(1.6,{v:.09,type:'lowpass',f:220,q:.5});tone(55,1.2,'sine',.05)},R(300,1200))}catch(e){}}}
    if(wxFlash>0){x.fillStyle=`rgba(230,235,255,${wxFlash*.25})`;x.fillRect(WL,WT,WW,WH);wxFlash-=.04*dt}
    x.restore()}
  /* ---------- 光の 海辺アイテム ---------- */
  ITEMS.push({c:1800,n:'キャンドル',d:[0,0],m:[.5,.995],a:0},{c:4500,n:'ちょうちん',d:[0,0],m:[.16,.6],a:0},{c:8000,n:'浮き玉ランプ',d:[0,0],m:[.92,.985],a:0},{c:80000,n:'星のプロジェクター',d:[0,0],m:[.76,.99],a:0},{c:120000,n:'ミラーボール',d:[0,0],m:[.62,.36],a:0});
  ITEMS.sort((a,b)=>a.c-b.c);['キャンドル','ちょうちん','浮き玉ランプ','星のプロジェクター','ミラーボール','星の門'].forEach(n=>LITS.add(n));
  Object.assign(DRAW,{
   'キャンドル'(px,py){const s=k*1.1;[[-9,0,7],[-3,2,11],[3,-1,8],[9,1,5],[0,3,6]].forEach(([o,dy,h],i)=>{const cx=px+o*s,cy=py+dy*s,f=flick(1.6+i*.2);pool(cx,cy,30*s*f,'rgba(255,170,80,.28)');
     const g=x.createLinearGradient(cx-2*s,0,cx+2*s,0);g.addColorStop(0,'#e8dcc4');g.addColorStop(.5,'#fff8ec');g.addColorStop(1,'#cfc2a8');x.fillStyle=g;x.fillRect(cx-2*s,cy-h*s,4*s,h*s);x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(cx,cy-h*s,2*s,.7*s,0,0,7);x.fill();
     x.strokeStyle='#2a1a10';x.lineWidth=.5*s;x.beginPath();x.moveTo(cx,cy-h*s);x.lineTo(cx,cy-(h+1.2)*s);x.stroke();
     if(LT<.03)return;x.save();x.globalCompositeOperation='lighter';glow(cx,cy-(h+3)*s,12*s*f,'rgba(255,190,100,.5)');x.restore();const fl=Math.sin(t*7+i)*.4*s;x.save();x.globalAlpha*=LT;x.fillStyle='#ffe9a0';x.beginPath();x.moveTo(cx-1.1*s,cy-(h+1.6)*s);x.quadraticCurveTo(cx+fl,cy-(h+6*f)*s,cx+1.1*s,cy-(h+1.6)*s);x.quadraticCurveTo(cx,cy-(h+.6)*s,cx-1.1*s,cy-(h+1.6)*s);x.fill();
     x.fillStyle='#ffffff';x.beginPath();x.ellipse(cx,cy-(h+2.4)*s,.45*s,1*s,0,0,7);x.fill();x.restore()})},
   'ちょうちん'(px,py){const s=k,A=[WL+WW*.01,WT+WH*.6],B=[WL+WW*.32,WT+WH*.57],cx=(A[0]+B[0])/2,cy=Math.max(A[1],B[1])+18*s;x.strokeStyle='rgba(30,22,18,.8)';x.lineWidth=.9;x.beginPath();x.moveTo(...A);x.quadraticCurveTo(cx,cy,...B);x.stroke();
     for(let i=1;i<6;i++){const u=i/6,v=1-u,qx=v*v*A[0]+2*u*v*cx+u*u*B[0],qy=v*v*A[1]+2*u*v*cy+u*u*B[1],sw=Math.sin(t*1.2+i)*.08,f=flick(.8+i*.1);x.save();x.translate(qx,qy);x.rotate(sw);
       x.save();x.globalCompositeOperation='lighter';glow(0,8*s,22*s*f,'rgba(255,120,70,.35)');x.restore();x.fillStyle='#2a1a10';x.fillRect(-2.4*s,0,4.8*s,1.6*s);x.fillRect(-2.4*s,11.4*s,4.8*s,1.4*s);
       x.fillStyle=i%2?'#c8402a':'#d89040';x.beginPath();x.ellipse(0,6.6*s,4.2*s,5.2*s,0,0,7);x.fill();if(LT>.02){const g=x.createRadialGradient(-1*s,5*s,.5*s,0,6.6*s,6*s);g.addColorStop(0,`rgba(255,${200+40*f|0},150,1)`);g.addColorStop(.6,i%2?'#ff5a3a':'#ffb03a');g.addColorStop(1,i%2?'#a02a1a':'#b0601a');x.save();x.globalAlpha*=LT;x.fillStyle=g;x.fill();x.restore()}
       x.strokeStyle='rgba(60,20,10,.35)';x.lineWidth=.4*s;for(let r=-2;r<=2;r++){x.beginPath();x.ellipse(0,6.6*s+r*1.8*s,4.2*s*Math.sqrt(1-(r*.34)**2),.4*s,0,0,7);x.stroke()}x.fillStyle='rgba(30,10,5,.6)';x.font=`bold ${4*s}px serif`;x.textAlign='center';x.fillText(['祭','福','星','海','夢'][i-1],0,8*s);x.textAlign='left';x.restore()}},
   '浮き玉ランプ'(px,py){const s=k*1.2,hue=(t*12)%360,f=flick(.6);pool(px,py,40*s*f,`hsla(${hue},90%,60%,.28)`);shadowE(px,py+1*s,10*s,2.4*s,.35);x.strokeStyle='#6a5030';x.lineWidth=.8*s;
     {const g0=x.createRadialGradient(px-3*s,py-11*s,1*s,px,py-8*s,9*s);g0.addColorStop(0,'rgba(220,240,240,.9)');g0.addColorStop(1,'rgba(60,110,120,.85)');x.fillStyle=g0;x.beginPath();x.arc(px,py-8*s,8*s,0,7);x.fill()}if(LT>.02){const g=x.createRadialGradient(px-3*s,py-11*s,1*s,px,py-8*s,9*s);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.35,`hsla(${hue},90%,72%,.9)`);g.addColorStop(1,`hsla(${(hue+40)%360},80%,35%,.85)`);x.save();x.globalAlpha*=LT;x.fillStyle=g;x.beginPath();x.arc(px,py-8*s,8*s,0,7);x.fill();x.restore()}
     for(let i=-2;i<=2;i++){x.beginPath();x.ellipse(px,py-8*s,8*s*Math.abs(Math.cos(i*.5)),8*s,0,0,7);x.stroke()}x.beginPath();x.moveTo(px-8*s,py-8*s);x.lineTo(px+8*s,py-8*s);x.stroke();x.save();x.globalCompositeOperation='lighter';glow(px,py-8*s,26*s*f,`hsla(${hue},90%,65%,.4)`);x.restore();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.ellipse(px-3*s,py-12*s,2*s,1*s,-.5,0,7);x.fill()},
   '星のプロジェクター'(px,py){const s=k*1.1;shadowE(px,py+1*s,9*s,2*s,.4);x.fillStyle=vgrad(py-10*s,py,[[0,'#3a3f6a'],[1,'#1a1d3a']]);x.beginPath();x.moveTo(px-6*s,py);x.lineTo(px-4*s,py-5*s);x.lineTo(px+4*s,py-5*s);x.lineTo(px+6*s,py);x.fill();
     const g=x.createRadialGradient(px-2*s,py-10*s,.5*s,px,py-8*s,5*s);g.addColorStop(0,'#ffffff');g.addColorStop(.4,'#9ab8ff');g.addColorStop(1,'#3a4a9a');x.fillStyle=g;x.beginPath();x.arc(px,py-8*s,4.6*s,0,7);x.fill();
     if(LT<.03)return;x.save();x.globalAlpha*=LT;x.globalCompositeOperation='lighter';glow(px,py-8*s,16*s,'rgba(150,180,255,.5)');const rot=t*.05;for(let i=0;i<46;i++){const an=i*2.39996+rot,rr=(18+(i*37%160))*k,sx=px+Math.cos(an)*rr*1.6,sy=py-8*s+Math.sin(an)*rr*.42,tw=.5+.5*Math.sin(t*2+i);if(sy>py+6*k||sy<shore-4*k)continue;glow(sx,sy,3*k*tw,`rgba(200,220,255,${.55*tw})`);x.fillStyle=`rgba(255,255,255,${.8*tw})`;x.fillRect(sx-.6,sy-.6,1.2,1.2)}x.restore()},
   'ミラーボール'(px,py){const s=k*1.15,rot=t*.6;x.strokeStyle='rgba(220,220,220,.5)';x.lineWidth=.6;x.beginPath();x.moveTo(px,py-30*s);x.lineTo(px,py-8*s);x.stroke();
     const g=x.createRadialGradient(px-2*s,py-3*s,1*s,px,py,8*s);g.addColorStop(0,'#ffffff');g.addColorStop(.5,'#b8c0d0');g.addColorStop(1,'#4a5060');x.fillStyle=g;x.beginPath();x.arc(px,py,7*s,0,7);x.fill();
     for(let r=-3;r<=3;r++)for(let c=0;c<8;c++){const an=c/8*Math.PI*2+rot,cz=Math.cos(an);if(cz<0)continue;const yy=py+r*2*s,ww=7*s*Math.sqrt(1-(r/3.6)**2),xx=px+Math.sin(an)*ww;const b=(Math.sin(t*3+c*1.7+r)+1)/2;x.fillStyle=`rgba(${200+55*b|0},${200+55*b|0},255,${.4+.5*b*cz})`;x.fillRect(xx-.9*s,yy-.9*s,1.8*s,1.8*s)}
     if(LT<.03)return;x.save();x.globalAlpha*=LT;x.globalCompositeOperation='lighter';glow(px,py,14*s,'rgba(220,230,255,.35)');for(let i=0;i<22;i++){const an=i*1.7+rot*1.3,sx=WL+WW*(.5+.45*Math.sin(an)),sy=shore+((i*53)%100)/100*(WT+WH-shore),hue=(i*47+t*30)%360;glow(sx,sy,5*k,`hsla(${hue},100%,75%,.45)`)}x.restore()}});
  /* 固有イベント */
  Object.assign(AMB,{
   dk_candle:dk('キャンドル',20,'front',(p,st,et)=>{const[px,py]=DP('キャンドル'),a=fade(p,.05,.1),out=p>.25&&p<.45;x.save();x.globalCompositeOperation='lighter';
     if(out){x.fillStyle=`rgba(200,200,220,${.25*a})`;for(let i=0;i<5;i++){x.beginPath();x.arc(px+(i-2)*6*k+Math.sin(et*3+i)*2*k,py-22*k-(et*20%30)*k,2*k,0,7);x.fill()}}
     else if(p>=.45){for(let i=0;i<20;i++){const q=(et*.4+i/20)%1,an=i*2.4;glow(px+Math.cos(an)*q*50*k,py-12*k-q*70*k,4*k*(1-q),`rgba(255,200,110,${.7*(1-q)*a})`)}}x.restore();
     if(out){x.fillStyle=`rgba(10,10,30,${.35*a})`;x.fillRect(WL,WT,WW,WH)}}),
   dk_chochin:dk('ちょうちん',24,'beach',(p,st,et)=>{const a=fade(p,.05,.1);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const an=et*(1.2+i*.07)+i,fx=WL+WW*(.05+((i*.031+et*.01)%.28))+Math.cos(an)*8*k,fy=WT+WH*(.6+Math.sin(an*1.3)*.03);x.globalAlpha=a;glow(fx,fy,3*k,'rgba(255,230,170,.9)')}x.restore();x.globalAlpha=1}),
   dk_globe:dk('浮き玉ランプ',24,'front',(p,st,et)=>{const[px,py]=DP('浮き玉ランプ'),a=fade(p,.05,.1);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const q=((et*.35)+i/6)%1,hue=(i*60+et*60)%360;x.strokeStyle=`hsla(${hue},100%,70%,${.5*(1-q)*a})`;x.lineWidth=2*k;x.beginPath();x.ellipse(px,py-8*k,q*90*k,q*30*k,0,0,7);x.stroke()}x.restore()}),
   dk_proj:dk('星のプロジェクター',30,'sky',(p,st,et)=>{const a=fade(p,.08,.12);x.save();x.globalCompositeOperation='lighter';const C=[[.2,.25],[.27,.18],[.35,.22],[.42,.15],[.5,.2],[.46,.3],[.38,.32]],n=Math.min(C.length,Math.floor(p*C.length*2.2));
     x.strokeStyle=`rgba(180,200,255,${.5*a})`;x.lineWidth=1*k;x.beginPath();for(let i=0;i<n;i++){const X=WL+WW*C[i][0],Y=hz*C[i][1]*2.2;i?x.lineTo(X,Y):x.moveTo(X,Y)}x.stroke();for(let i=0;i<n;i++){glow(WL+WW*C[i][0],hz*C[i][1]*2.2,8*k,`rgba(220,230,255,${.9*a})`)}x.restore()}),
   dk_mirror:dk('ミラーボール',22,'front',(p,st,et)=>{const a=fade(p,.05,.1);x.save();x.globalCompositeOperation='lighter';const[px,py]=DP('ミラーボール');for(let i=0;i<10;i++){const an=et*1.4+i*.63,ex=px+Math.cos(an)*WW*.6,ey=py+Math.abs(Math.sin(an))*WH*.55+20*k,hue=(i*36+et*90)%360;
     const g=x.createLinearGradient(px,py,ex,ey);g.addColorStop(0,`hsla(${hue},100%,75%,${.35*a})`);g.addColorStop(1,`hsla(${hue},100%,75%,0)`);x.strokeStyle=g;x.lineWidth=3*k;x.beginPath();x.moveTo(px,py);x.lineTo(ex,ey);x.stroke();glow(ex,ey,8*k,`hsla(${hue},100%,70%,${.5*a})`)}x.restore()})});
  /* キャンドルナイト（ショー） */
  Object.assign(SHOW,{candlenight:{layer:'front',draw(p,st,et){const a=fade(p,.04,.08);st.c??=Array.from({length:44},(_,i)=>({x:WL+WW*Math.random(),y:shore+8*k+Math.random()*(WT+WH-shore-10*k),h:R(4,10),d:Math.random()*.4}));
     x.save();x.fillStyle=`rgba(8,8,24,${.3*a})`;x.fillRect(WL,WT,WW,WH);for(const c of st.c){const on=p>c.d*.5;if(!on)continue;const sc=k*(.6+(c.y-shore)/(WT+WH-shore)*.7),f=.85+.15*Math.sin(et*8+c.x);
       x.globalAlpha=a;x.fillStyle='#f4ead8';x.fillRect(c.x-1.4*sc,c.y-c.h*sc,2.8*sc,c.h*sc);x.globalCompositeOperation='lighter';pool(c.x,c.y,28*sc*f,'rgba(255,170,80,.25)');glow(c.x,c.y-(c.h+2.6)*sc,9*sc*f,'rgba(255,200,110,.55)');x.globalCompositeOperation='source-over';x.fillStyle='#fff3c0';x.beginPath();x.ellipse(c.x,c.y-(c.h+2)*sc,.8*sc,1.8*sc*f,0,0,7);x.fill()}x.restore();x.globalAlpha=1}}});
  /* ---------- 本物の 月の 満ち欠け ---------- */
  let moonPhCv=null,moonPhKey=-1;
  function moonPh(){const ph=moonPhase(),key=Math.round(ph*400);if(moonPhCv&&key===moonPhKey&&moonPhCv.width===moonCv.width)return moonPhCv;moonPhKey=key;
    const Wc=moonCv.width,Hc=moonCv.height,c=document.createElement('canvas');c.width=Wc;c.height=Hc;const m=c.getContext('2d'),cx=Wc/2,cy=Hc/2,r=moonR*DPR;
    m.globalAlpha=.13;m.drawImage(moonCv,0,0);m.globalAlpha=1;
    const mk=document.createElement('canvas');mk.width=Wc;mk.height=Hc;const q=mk.getContext('2d'),kk=Math.cos(ph*Math.PI*2),wax=ph<.5,sg=wax?1:-1;
    q.beginPath();for(let i=0;i<=48;i++){const y=-r+2*r*i/48,w=Math.sqrt(Math.max(0,r*r-y*y));const px=cx+sg*w;i?q.lineTo(px,cy+y):q.moveTo(px,cy+y)}for(let i=48;i>=0;i--){const y=-r+2*r*i/48,w=Math.sqrt(Math.max(0,r*r-y*y));q.lineTo(cx+sg*kk*w,cy+y)}q.closePath();q.fillStyle='#fff';q.fill();
    q.globalCompositeOperation='source-in';q.drawImage(moonCv,0,0);m.drawImage(mk,0,0);moonPhCv=c;return c}
  /* ---------- 焚き火の 表情 ---------- */
  let ffx={next:performance.now()+R(8000,20000),kind:null,t0:0,parts:[]};
  function fireFx(){if(!fireLv||fireLv<.3)return;const now=performance.now(),[fx,fy]=fireP();
    if(now>ffx.next){ffx.next=now+R(12000,35000);ffx.kind=window.FFX_K||pick(['pop','pop','pop','collapse','swirl']);window.FFX_K=null;ffx.t0=now;
      try{if(ffx.kind==='pop'){noise(.05,{v:.06,type:'highpass',f:2500});noise(.04,{v:.04,type:'highpass',f:3500,delay:.07})}else if(ffx.kind==='collapse'){noise(.5,{v:.05,type:'lowpass',f:400});noise(.08,{v:.05,type:'highpass',f:2200,delay:.2})}else if(ffx.kind==='swirl')noise(1.2,{v:.02,type:'bandpass',f:900,f2:1600,q:.6})}catch(e){}
      if(ffx.kind==='pop')for(let i=0;i<26;i++)ffx.parts.push({x:fx+R(-4,4)*k,y:fy-22*k,vx:R(-1.3,1.3)*k,vy:-R(2.4,4.6)*k,l:1,c:'255,200,120'});
      if(ffx.kind==='collapse')for(let i=0;i<40;i++)ffx.parts.push({x:fx+R(-14,14)*k,y:fy-6*k,vx:R(-1.8,1.8)*k,vy:-R(.6,2.2)*k,l:1,c:'255,150,70'});
      if(ffx.kind==='swirl')for(let i=0;i<30;i++)ffx.parts.push({x:fx,y:fy-20*k,a:i/30*Math.PI*2,r:2*k,vy:-R(.6,1.2)*k,l:1,c:'255,220,140',sw:1})}
    const age=(now-ffx.t0)/1000;x.save();x.globalCompositeOperation='lighter';
    if(ffx.kind==='blue'&&age<1.4){const a=Math.sin(age/1.4*Math.PI);glow(fx,fy-12*k,26*k,`rgba(90,150,255,${.45*a})`);glow(fx,fy-24*k,14*k,`rgba(160,200,255,${.35*a})`)}
    if(ffx.kind==='collapse'&&age<.6){glow(fx,fy-10*k,50*k*(1+age),`rgba(255,140,60,${.3*(1-age/.6)})`)}
    for(const p of ffx.parts){if(p.sw){p.a+=.12;p.r+=.25*k;p.x=fx+Math.cos(p.a)*p.r;p.y+=p.vy}else{p.x+=p.vx;p.y+=p.vy;p.vy+=.05*k;p.vx*=.99}p.l-=.016;glow(p.x,p.y,2.4*k,`rgba(${p.c},${Math.max(0,p.l)*.9})`)}
    ffx.parts=ffx.parts.filter(p=>p.l>0);x.restore()}
  /* ---------- 今日の 空模様（雲の 種類が 日替わり） ---------- */
  let skyT=null,skyD=null;
  function skyKind(){const d=new Date(),key=d.toDateString();if(skyD===key&&skyT)return skyT;skyD=key;const m=d.getMonth()+1,h=(d.getFullYear()*400+(d.getMonth()+1)*32+d.getDate())*2246822519>>>0;
    const L=m>=6&&m<=8?['nyudo','nyudo','contrail','sheep','none']:m>=9&&m<=11?['uroko','uroko','suji','contrail','sheep']:m===12||m<=2?['suji','contrail','none','sheep']:['sheep','contrail','suji','none'];
    skyT={kind:L[h%L.length],seed:h,blobs:null};return skyT}
  function skyDeco(){const s=skyKind();if(!s||s.kind==='none')return;const dayA=Math.max(0,1-dark*1.25);if(dayA<.03&&s.kind!=='nyudo')return;
    const warm=PAL&&PAL.hz?PAL.hz:'#ffffff';let rnd=s.seed;const rr=()=>{rnd=(rnd*1664525+1013904223)>>>0;return rnd/4294967296};
    if(!s.blobs){s.blobs=[];if(s.kind==='uroko')for(let i=0;i<150;i++)s.blobs.push([rr(),rr()*.45+.08,.6+rr()*.8]);if(s.kind==='sheep')for(let i=0;i<26;i++)s.blobs.push([rr(),rr()*.35+.12,1+rr()*1.4]);if(s.kind==='suji')for(let i=0;i<9;i++)s.blobs.push([rr(),rr()*.4+.06,rr()]);if(s.kind==='contrail')s.blobs.push([rr()*.5,rr()*.25+.1,0]);if(s.kind==='nyudo')s.blobs.push([.15+rr()*.6,0,0])}
    x.save();const drift=t*.004;
    if(s.kind==='uroko'){x.fillStyle=`rgba(255,255,255,${.5*dayA})`;for(const[u,v,z]of s.blobs){const px=((u+drift)%1.2-.1)*W,py=hz*v;x.beginPath();x.ellipse(px,py,4*k*z,2.2*k*z,0,0,7);x.fill()}}
    else if(s.kind==='sheep'){for(const[u,v,z]of s.blobs){const px=((u+drift*.8)%1.3-.15)*W,py=hz*v,g=x.createRadialGradient(px-3*k*z,py-3*k*z,1,px,py,9*k*z);g.addColorStop(0,`rgba(255,255,255,${.6*dayA})`);g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.ellipse(px,py,10*k*z,6*k*z,0,0,7);x.fill()}}
    else if(s.kind==='suji'){x.strokeStyle=`rgba(255,255,255,${.28*dayA})`;x.lineCap='round';for(const[u,v,z]of s.blobs){const px=((u+drift*.6)%1.3-.15)*W,py=hz*v;x.lineWidth=(1.5+z*2)*k;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+40*k,py-8*k*z,px+90*k,py-20*k*z-6*k);x.stroke();x.lineWidth=.8*k;x.beginPath();x.moveTo(px+20*k,py+4*k);x.quadraticCurveTo(px+55*k,py-2*k,px+80*k,py-10*k);x.stroke()}}
    else if(s.kind==='contrail'){const[u,v]=s.blobs[0],ph=(t*.012)%1.4,x0=W*u-40,y0=hz*v,len=Math.min(1,ph)*W*.7;x.strokeStyle=`rgba(255,255,255,${.5*dayA})`;x.lineCap='round';x.lineWidth=2*k;x.beginPath();x.moveTo(x0+len,y0-len*.18);x.lineTo(Math.max(x0,x0+len-W*.5),y0-Math.max(0,len-W*.5)*.18);x.stroke();
      x.lineWidth=5*k;x.strokeStyle=`rgba(255,255,255,${.16*dayA})`;x.beginPath();x.moveTo(Math.max(x0,x0+len-W*.5),y0-Math.max(0,len-W*.5)*.18);x.lineTo(x0+len*.6,y0-len*.6*.18);x.stroke();if(ph<1){x.fillStyle=`rgba(255,255,255,${.9*dayA})`;x.beginPath();x.arc(x0+len,y0-len*.18,1.4*k,0,7);x.fill()}}
    else if(s.kind==='nyudo'){const[u]=s.blobs[0],bx=W*u,by=hz,a=Math.max(.25,dayA);for(let i=0;i<14;i++){const ang=i/14,cx=bx+(Math.sin(i*2.1)*.5)*WW*.22,cy=by-(ang*hz*.45)-Math.abs(Math.sin(i))*10*k,r=(26-ang*10)*k;const g=x.createRadialGradient(cx-r*.3,cy-r*.4,r*.1,cx,cy,r);g.addColorStop(0,`rgba(255,255,255,${.75*a})`);g.addColorStop(.7,`rgba(235,238,245,${.55*a})`);g.addColorStop(1,'rgba(220,225,240,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill()}}
    x.restore()}
  /* ---------- 二十四節気の 小さな 変化（赤とんぼ・梅・柚子 など） ---------- */
  let tombo=null;
  function sekkiFx(){const sk=typeof sekkiNow==='function'?sekkiNow():null;if(!sk)return;
    if(['白露','秋分','寒露'].includes(sk.n)&&dark<.6){tombo??=Array.from({length:7},()=>({x:R(0,W),y:R(hz*.3,shore),ph:R(0,6),v:R(.3,.8)}));for(const d of tombo){d.x+=d.v*(Math.sin(t*.4+d.ph)>.7?0:1);d.y+=Math.sin(t*1.3+d.ph)*.3;if(d.x>W+10)d.x=-10;const hov=Math.sin(t*30+d.ph);
      x.save();x.translate(d.x,d.y);x.globalAlpha=.85;x.fillStyle='#d8402a';x.fillRect(-4*k,-.5*k,8*k,1*k);x.beginPath();x.arc(4.4*k,0,1*k,0,7);x.fill();x.fillStyle='rgba(230,240,255,.55)';x.beginPath();x.ellipse(1*k,-1.4*k-hov*.3*k,3.4*k,.9*k,-.25,0,7);x.ellipse(1*k,1.4*k+hov*.3*k,3.4*k,.9*k,.25,0,7);x.fill();x.restore()}}
    else tombo=null}
  /* ---------- 新入荷の 海辺アイテム ---------- */
  ITEMS.push({c:6500,n:'ビーチチェア',d:[0,0],m:[.46,.67],a:0},{c:14000,n:'ドリームキャッチャー',d:[0,0],m:[.7,.46],a:0},{c:42000,n:'石灯籠',d:[0,0],m:[.86,.84],a:0});
  ITEMS.sort((a,b)=>a.c-b.c);LITS.add('石灯籠');
  Object.assign(DRAW,{
   'ビーチチェア'(px,py){const s=k*1.45;shadowE(px+2*s,py+1*s,20*s,3.5*s,.35);x.strokeStyle='#d8c8a8';x.lineWidth=1.4*s;x.lineCap='round';x.beginPath();x.moveTo(px-14*s,py);x.lineTo(px+4*s,py-10*s);x.moveTo(px+10*s,py);x.lineTo(px-4*s,py-10*s);x.moveTo(px+4*s,py-10*s);x.lineTo(px+12*s,py-26*s);x.stroke();
     x.save();x.beginPath();x.moveTo(px-12*s,py-9*s);x.lineTo(px+5*s,py-11*s);x.lineTo(px+13*s,py-27*s);x.lineTo(px+9*s,py-28*s);x.lineTo(px+1*s,py-13*s);x.lineTo(px-13*s,py-12*s);x.closePath();x.clip();for(let i=-6;i<8;i++){x.fillStyle=i%2?'#f4efe4':'#e8553a';x.beginPath();x.moveTo(px+i*4*s,py-30*s);x.lineTo(px+i*4*s+4*s,py-30*s);x.lineTo(px+i*4*s-6*s,py);x.lineTo(px+i*4*s-10*s,py);x.fill()}x.restore();
     x.fillStyle='#f4efe4';x.beginPath();x.ellipse(px+10*s,py-27*s,3*s,1.6*s,-.9,0,7);x.fill()},
   'ドリームキャッチャー'(px,py){const s=k*1.15,sw=Math.sin(t*1.1)*.12;x.strokeStyle='rgba(220,210,190,.7)';x.lineWidth=.6;x.beginPath();x.moveTo(px,py-24*s);x.lineTo(px,py-9*s);x.stroke();x.save();x.translate(px,py);x.rotate(sw);
     x.strokeStyle='#b88a5a';x.lineWidth=1.6*s;x.beginPath();x.arc(0,0,8*s,0,7);x.stroke();x.strokeStyle='rgba(255,245,225,.75)';x.lineWidth=.45*s;x.beginPath();for(let i=0;i<=8;i++){const a=i/8*Math.PI*2,r2=i%2?3*s:7.6*s;i?x.lineTo(Math.cos(a)*r2,Math.sin(a)*r2):x.moveTo(Math.cos(a)*r2,Math.sin(a)*r2)}x.stroke();
     x.fillStyle='#7ab8ff';x.beginPath();x.arc(0,0,1.2*s,0,7);x.fill();[[-5,0],[0,1],[5,0]].forEach(([o,d],i)=>{x.strokeStyle='rgba(220,210,190,.7)';x.beginPath();x.moveTo(o*s,7*s);x.lineTo(o*s+Math.sin(t*2+i)*1*s,(13+d*3)*s);x.stroke();x.fillStyle=['#ff9ec4','#ffffff','#ffd23f'][i];x.beginPath();x.ellipse(o*s+Math.sin(t*2+i)*1.2*s,(16+d*3)*s,1.4*s,3.6*s,Math.sin(t*2+i)*.3,0,7);x.fill()});x.restore()},
   '石灯籠'(px,py){const s=k*1.1,f=flick(.9);shadowE(px+3*s,py+1*s,14*s,3*s,.45);const G=c=>vgrad(py-34*s,py,[[0,c],[1,'#5a5a5a']]);x.fillStyle=G('#9a9a92');x.fillRect(px-7*s,py-4*s,14*s,4*s);x.fillRect(px-2.6*s,py-16*s,5.2*s,12*s);x.fillRect(px-6*s,py-19*s,12*s,3*s);
     x.fillStyle='#4a4a46';x.fillRect(px-5*s,py-27*s,10*s,8*s);if(LT>.03){x.save();x.globalAlpha*=LT;x.fillStyle=`rgba(255,${190+40*f|0},110,1)`;x.fillRect(px-3.4*s,py-25.6*s,6.8*s,5.4*s);x.restore()}else{x.fillStyle='#2a2a28';x.fillRect(px-3.4*s,py-25.6*s,6.8*s,5.4*s)}
     x.fillStyle=G('#a8a8a0');x.beginPath();x.moveTo(px-9*s,py-27*s);x.lineTo(px+9*s,py-27*s);x.lineTo(px+3*s,py-33*s);x.lineTo(px-3*s,py-33*s);x.closePath();x.fill();x.beginPath();x.arc(px,py-34.5*s,2*s,0,7);x.fill();
     x.fillStyle='rgba(80,110,60,.5)';x.beginPath();x.ellipse(px-5*s,py-1*s,3*s,1.4*s,0,0,7);x.fill();x.save();x.globalCompositeOperation='lighter';glow(px,py-23*s,30*s*f,'rgba(255,170,80,.45)');pool(px,py,40*s*f,'rgba(255,160,70,.3)');x.restore()}});
  Object.assign(AMB,{
   dk_bchair:dk('ビーチチェア',40,'beach',(p,st,et)=>{const[px,py]=DP('ビーチチェア'),a=fade(p,.06,.08);x.globalAlpha=a;x.save();x.translate(px-15*k,py-14*k);x.rotate(1.2);human(0,0,1.05*k,0,'#2c3e66','#e9bf98',false,1,{hat:'straw',shorts:true});x.restore();
     const q=(et*.45)%1;x.globalAlpha=a*(1-q);x.fillStyle='#fff';x.font=`${(6+q*3)*k}px sans-serif`;x.fillText('z',px+14*k+q*5*k,py-30*k-q*12*k);x.globalAlpha=1}),
   dk_dream:dk('ドリームキャッチャー',24,'front',(p,st,et)=>{const[px,py]=DP('ドリームキャッチャー'),a=fade(p,.06,.1);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<16;i++){const q=(et*.25+i/16)%1,an=i*2.4+et*.5;x.globalAlpha=a*(1-q);glow(px+Math.cos(an)*q*50*k,py+Math.sin(an)*q*30*k-q*30*k,4*k,`hsla(${(i*40+et*40)%360},100%,80%,.8)`)}x.restore();x.globalAlpha=1}),
   dk_toro:dk('石灯籠',30,'front',(p,st,et)=>{const[px,py]=DP('石灯籠'),a=fade(p,.08,.12);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const an=et*.6+i*2.1,hx=px+Math.cos(an)*26*k,hy=py-40*k+Math.sin(an*1.4)*10*k-i*6*k;x.globalAlpha=a;glow(hx,hy,9*k,'rgba(170,220,255,.65)');x.fillStyle='rgba(230,245,255,.9)';x.beginPath();x.arc(hx,hy,2*k,0,7);x.fill();
     x.strokeStyle='rgba(170,220,255,.35)';x.lineWidth=2*k;x.beginPath();x.moveTo(hx,hy);x.quadraticCurveTo(hx-Math.cos(an)*6*k,hy+6*k,hx-Math.cos(an)*4*k,hy+12*k);x.stroke()}x.restore();x.globalAlpha=1})});
  /* ---------- 自動生成：住人（パーツの 組み合わせ） ---------- */
  function drawCreature(P,hx,gy,sc,ph,dir,moving){const s=sc*(P.size||1),C1=sil(P.c1),C2=sil(P.c2),D=sil(mixc(P.c1,'#000000',.3)),sp=P.sp,mv=moving?1:0;
    let bob=0;if(P.gait==='hop'&&mv)bob=Math.abs(Math.sin(ph*1.6))*6*s;else if(mv)bob=Math.abs(Math.sin(ph*2))*1.2*s;else bob=Math.sin(ph*.8)*.4*s;
    x.save();x.translate(hx,gy);evShad(0,0,(sp==='crab'?11:9)*s);x.translate(0,-bob);x.scale(dir,1);if(P.gait==='waddle'&&mv)x.rotate(Math.sin(ph*2)*.12);x.lineCap='round';
    const eye=(ex,ey,r)=>{const bl=((ph*.3+P.seed%7)%4)<.06;if(bl){x.strokeStyle='#1a1414';x.lineWidth=r*.5;x.beginPath();x.moveTo(ex-r,ey);x.lineTo(ex+r,ey);x.stroke();return}x.fillStyle='#1a1414';x.beginPath();x.arc(ex,ey,r,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(ex+r*.35,ey-r*.35,r*.38,0,7);x.fill()};
    const pat=(cx,cy,rx,ry)=>{if(P.pat==='none')return;x.save();x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,7);x.clip();x.fillStyle=C2;if(P.pat==='stripe')for(let i=-3;i<=3;i++)x.fillRect(cx+i*rx*.32-rx*.06,cy-ry,rx*.13,ry*2);else for(let i=0;i<6;i++){x.beginPath();x.arc(cx+Math.sin(i*2.3+P.seed)*rx*.6,cy+Math.cos(i*1.7+P.seed)*ry*.5,rx*.13,0,7);x.fill()}x.restore()};
    const legs=(n,y0,len,sp2)=>{x.strokeStyle=D;x.lineWidth=2*s;for(let i=0;i<n;i++){const lx=(i-(n-1)/2)*sp2*s,sw=mv?Math.sin(ph*2+i*1.7)*2*s:0;x.beginPath();x.moveTo(lx,y0);x.lineTo(lx+sw,y0+len*s);x.stroke()}};
    if(sp==='crab'){x.strokeStyle=D;x.lineWidth=1.3*s;for(let i=0;i<3;i++)[-1,1].forEach(d=>{const sw=mv?Math.sin(ph*3+i)*1.4*s:0;x.beginPath();x.moveTo(d*5*s,-4*s);x.lineTo(d*(9+i*1.6)*s+sw,-2*s);x.lineTo(d*(10+i*2)*s+sw,0);x.stroke()});
      x.fillStyle=shadeF(0,-7*s,9*s,P.c1);x.beginPath();x.ellipse(0,-6*s,9*s,5.4*s,0,0,7);x.fill();pat(0,-6*s,9*s,5.4*s);[-1,1].forEach(d=>{const cl=Math.sin(ph*2)*.2;x.save();x.translate(d*10*s,-11*s);x.rotate(d*(-.4+cl));x.fillStyle=C1;x.beginPath();x.ellipse(0,0,3.6*s,2.4*s,0,0,7);x.fill();x.fillStyle=D;x.beginPath();x.moveTo(1*s,-1*s);x.lineTo(4*s,-2.4*s);x.lineTo(1.6*s,.2*s);x.fill();x.restore()});
      x.strokeStyle=C1;x.lineWidth=1*s;[-2.4,2.4].forEach(ex=>{x.beginPath();x.moveTo(ex*s,-10*s);x.lineTo(ex*s,-14*s);x.stroke()});eye(-2.4*s,-14.6*s,1.2*s);eye(2.4*s,-14.6*s,1.2*s);var headY=-17*s,headX=0}
    else if(sp==='blob'){const sq=mv?1+Math.sin(ph*3)*.08:1;x.fillStyle=shadeF(0,-8*s,10*s,P.c1);x.beginPath();x.moveTo(-10*s*sq,0);x.quadraticCurveTo(-11*s,-16*s/sq,0,-17*s/sq);x.quadraticCurveTo(11*s,-16*s/sq,10*s*sq,0);x.closePath();x.fill();pat(0,-7*s,10*s,7*s);x.fillStyle='rgba(255,255,255,.4)';x.beginPath();x.ellipse(-4*s,-12*s,2.4*s,1.4*s,-.4,0,7);x.fill();eye(-1*s,-9*s,1.3*s);eye(4.4*s,-9*s,1.3*s);x.strokeStyle='#5a2a2a';x.lineWidth=.6*s;x.beginPath();x.arc(1.8*s,-6.6*s,1.2*s,.2,Math.PI-.2);x.stroke();var headY=-17*s,headX=1*s}
    else if(sp==='bird'){legs(2,-3*s,3,3);x.fillStyle=shadeF(0,-9*s,9*s,P.c1);x.beginPath();x.ellipse(0,-8*s,7.4*s,6.4*s,0,0,7);x.fill();x.fillStyle=C2;x.beginPath();x.ellipse(1.6*s,-6*s,4.4*s,3.6*s,0,0,7);x.fill();x.fillStyle=D;x.beginPath();x.ellipse(-2*s,-8*s,4*s,2.4*s,-.4+(mv?Math.sin(ph*4)*.3:0),0,7);x.fill();x.fillStyle=C1;x.beginPath();x.arc(4*s,-15*s,4.6*s,0,7);x.fill();x.fillStyle=sil('#f2a33a');x.beginPath();x.moveTo(8*s,-15.6*s);x.lineTo(11.4*s,-14.6*s);x.lineTo(8*s,-13.6*s);x.fill();eye(5.4*s,-16*s,1.1*s);var headY=-19*s,headX=4*s}
    else{const tall=sp==='bear'||sp==='dog'?1:sp==='frog'?.8:.95;legs(2,-4*s,4,6);x.fillStyle=shadeF(0,-9*s,10*s,P.c1);x.beginPath();x.ellipse(0,-9*s,8*s,6.4*s*tall,0,0,7);x.fill();pat(0,-9*s,8*s,6.4*s*tall);x.fillStyle=C2;x.beginPath();x.ellipse(1.6*s,-7*s,4.4*s,3.6*s,0,0,7);x.fill();
      if(sp==='cat'||sp==='dog'||sp==='bear'||sp==='rabbit'){const tw=Math.sin(ph*(mv?4:1.4))*.4;x.strokeStyle=C1;x.lineWidth=(sp==='bear'?2.4:1.8)*s;x.beginPath();x.moveTo(-7*s,-10*s);x.quadraticCurveTo(-11*s,-13*s+tw*4*s,-12*s,(sp==='rabbit'?-10:-17)*s);x.stroke()}
      const hX=5*s,hY=-17*s*tall,hr=(sp==='frog'?5.6:5.2)*s;x.fillStyle=shadeF(hX,hY,hr,P.c1);x.beginPath();x.ellipse(hX,hY,hr,hr*(sp==='frog'?.8:.95),0,0,7);x.fill();
      if(sp==='cat'){x.fillStyle=C1;[[-3,1],[2,0]].forEach(([o])=>{x.beginPath();x.moveTo(hX+(o-1.6)*s,hY-3*s);x.lineTo(hX+(o)*s,hY-8.4*s);x.lineTo(hX+(o+2.4)*s,hY-3.4*s);x.fill()})}
      else if(sp==='dog'){x.fillStyle=D;[-3.6,3.2].forEach(o=>{x.beginPath();x.ellipse(hX+o*s,hY-1*s,1.8*s,4*s,o<0?.3:-.3,0,7);x.fill()})}
      else if(sp==='bear'){x.fillStyle=C1;[-3.4,3.4].forEach(o=>{x.beginPath();x.arc(hX+o*s,hY-4.4*s,2*s,0,7);x.fill()});x.fillStyle=C2;x.beginPath();x.ellipse(hX+2.4*s,hY+1.6*s,2.6*s,2*s,0,0,7);x.fill()}
      else if(sp==='rabbit'){x.fillStyle=C1;[-1.6,1.4].forEach((o,i)=>{x.save();x.translate(hX+o*s,hY-4*s);x.rotate(-.2+i*.3+Math.sin(ph)*.05);x.beginPath();x.ellipse(0,-5*s,1.6*s,5.4*s,0,0,7);x.fill();x.fillStyle=sil('#f4a8b8');x.beginPath();x.ellipse(0,-5*s,.7*s,4*s,0,0,7);x.fill();x.restore()})}
      else if(sp==='frog'){x.fillStyle=C1;[-2.4,2.6].forEach(o=>{x.beginPath();x.arc(hX+o*s,hY-3.6*s,2.2*s,0,7);x.fill()})}
      if(sp==='frog'){eye(hX-2.4*s,hY-3.8*s,1.2*s);eye(hX+2.6*s,hY-3.8*s,1.2*s);x.strokeStyle='#3a1a1a';x.lineWidth=.6*s;x.beginPath();x.arc(hX+.6*s,hY+.4*s,3*s,.3,Math.PI-.3);x.stroke()}
      else{eye(hX+2.2*s,hY-1*s,1*s);x.fillStyle='#1a1414';x.beginPath();x.arc(hX+4.8*s,hY+.8*s,.8*s,0,7);x.fill();x.fillStyle='rgba(255,130,150,.35)';x.beginPath();x.arc(hX+1.6*s,hY+1.6*s,1.2*s,0,7);x.fill()}
      var headY=hY-hr*.85,headX=hX}
    // 小物
    const A=P.acc;if(A==='straw'){x.fillStyle=sil('#e8cf86');x.beginPath();x.ellipse(headX,headY+1*s,6.4*s,1.4*s,0,0,7);x.fill();x.beginPath();x.ellipse(headX,headY,3.6*s,2.4*s,0,Math.PI,0);x.fill();x.fillStyle=sil('#c0392b');x.fillRect(headX-3.4*s,headY-.4*s,6.8*s,.8*s)}
    else if(A==='cap'){x.fillStyle=sil(P.c3);x.beginPath();x.ellipse(headX,headY+.6*s,4*s,2.6*s,0,Math.PI,0);x.fill();x.beginPath();x.ellipse(headX+3.6*s,headY+.6*s,2.8*s,.7*s,0,0,7);x.fill()}
    else if(A==='bow'){x.fillStyle=sil(P.c3);x.beginPath();x.moveTo(headX-1*s,headY);x.lineTo(headX-4*s,headY-2.4*s);x.lineTo(headX-4*s,headY+2*s);x.closePath();x.moveTo(headX+1*s,headY);x.lineTo(headX+4*s,headY-2.4*s);x.lineTo(headX+4*s,headY+2*s);x.closePath();x.fill();x.beginPath();x.arc(headX,headY,1*s,0,7);x.fill()}
    else if(A==='flower'){x.fillStyle=sil(P.c3);for(let i=0;i<5;i++){const a=i/5*Math.PI*2;x.beginPath();x.arc(headX+Math.cos(a)*1.6*s,headY+Math.sin(a)*1.6*s,1.2*s,0,7);x.fill()}x.fillStyle='#ffe066';x.beginPath();x.arc(headX,headY,.9*s,0,7);x.fill()}
    else if(A==='crown'){x.fillStyle='#ffd23f';x.beginPath();x.moveTo(headX-3*s,headY+1*s);x.lineTo(headX-3*s,headY-2*s);x.lineTo(headX-1.5*s,headY-.6*s);x.lineTo(headX,headY-3*s);x.lineTo(headX+1.5*s,headY-.6*s);x.lineTo(headX+3*s,headY-2*s);x.lineTo(headX+3*s,headY+1*s);x.fill()}
    else if(A==='scarf'){x.strokeStyle=sil(P.c3);x.lineWidth=2*s;x.beginPath();x.moveTo(headX-4*s,headY+7*s);x.lineTo(headX+3*s,headY+7.6*s);x.stroke();x.beginPath();x.moveTo(headX-3*s,headY+7.6*s);x.lineTo(headX-5*s+(mv?Math.sin(ph*3)*1.5*s:0),headY+12*s);x.stroke()}
    else if(A==='glasses'){x.strokeStyle='#1a1a1a';x.lineWidth=.6*s;x.fillStyle='rgba(40,40,60,.75)';[0,3.6].forEach(o=>{x.beginPath();x.arc(headX+o*s,headY+3.6*s,1.5*s,0,7);x.fill();x.stroke()})}
    x.restore()}
  Object.assign(AMB,{gen_res:{dur:34,layer:'beach',draw(p,st,et){const P=window.RES_CUR;if(!P)return;st.dir??=(Math.random()<.5?1:-1);st.sx??=WL+WW*(.3+Math.random()*.4);const gy=shore+16*k+(P.seed%3)*5*k,a0=st.dir>0?-30*k:W+30*k,a1=st.dir>0?W+30*k:-30*k,w=walkPath(p,a0,a1,st.sx,.25,.7);
    x.globalAlpha=fade(p,.02,.02);drawCreature(P,w.x,gy,k*1.25,et*(P.gait==='hop'?2:3),st.dir,w.m==='go');x.globalAlpha=1}},
   dk_gen:{dur:22,layer:'front',draw(p,st,et){const n=window.GEN_DK;if(!n)return;const[px,py]=DP(n),a=fade(p,.06,.1);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const q=(et*.35+i/14)%1,an=i*2.4+et;x.globalAlpha=a*(1-q);glow(px+Math.cos(an)*q*40*k,py-10*k-q*50*k,4*k,`hsla(${(i*30+et*50)%360},100%,75%,.85)`)}x.restore();x.globalAlpha=1}}});
  /* ---------- 自動生成：海辺の 置物 ---------- */
  const GSLOT=[[.08,.97],[.36,.8],[.52,.78],[.44,.995],[.74,.88],[.93,.93]];
  function drawGenDeco(P,px,py){const s=k*1.1,C1=P.c1,C2=P.c2;shadowE(px,py+1*s,9*s,2*s,.4);
    if(P.type==='pinwheel'){x.strokeStyle='#8a6a4a';x.lineWidth=1.2*s;x.beginPath();x.moveTo(px,py);x.lineTo(px,py-24*s);x.stroke();x.save();x.translate(px,py-24*s);x.rotate(t*2.4);for(let i=0;i<4;i++){x.rotate(Math.PI/2);x.fillStyle=i%2?C1:C2;x.beginPath();x.moveTo(0,0);x.lineTo(7*s,-1*s);x.lineTo(5*s,5*s);x.fill()}x.fillStyle='#fff';x.beginPath();x.arc(0,0,1*s,0,7);x.fill();x.restore()}
    else if(P.type==='flag'){x.strokeStyle='#d8d0c0';x.lineWidth=1*s;x.beginPath();x.moveTo(px,py);x.lineTo(px,py-30*s);x.stroke();x.fillStyle=C1;x.beginPath();x.moveTo(px,py-30*s);for(let i=0;i<=10;i++){const u=i/10;x.lineTo(px+u*14*s,py-30*s+Math.sin(t*4+u*5)*1.4*s)}for(let i=10;i>=0;i--){const u=i/10;x.lineTo(px+u*14*s,py-22*s+Math.sin(t*4+u*5)*1.4*s)}x.fill();x.fillStyle=C2;x.beginPath();x.arc(px+7*s,py-26*s+Math.sin(t*4+2.5)*1.4*s,2*s,0,7);x.fill()}
    else if(P.type==='pot'){x.fillStyle=vgrad(py-8*s,py,[[0,C2],[1,mixc(C2,'#000000',.3)]]);x.beginPath();x.moveTo(px-5*s,py-8*s);x.lineTo(px+5*s,py-8*s);x.lineTo(px+4*s,py);x.lineTo(px-4*s,py);x.fill();x.strokeStyle='#3a7a3a';x.lineWidth=1*s;[-3,0,3].forEach((o,i)=>{x.beginPath();x.moveTo(px,py-8*s);x.quadraticCurveTo(px+o*s,py-14*s,px+o*1.4*s,py-18*s-i*2*s);x.stroke();x.fillStyle=C1;for(let j=0;j<5;j++){const a=j/5*Math.PI*2+t*.3;x.beginPath();x.arc(px+o*1.4*s+Math.cos(a)*1.4*s,py-18*s-i*2*s+Math.sin(a)*1.4*s,1*s,0,7);x.fill()}x.fillStyle='#ffe066';x.beginPath();x.arc(px+o*1.4*s,py-18*s-i*2*s,.7*s,0,7);x.fill()})}
    else if(P.type==='totem'){[[0,C1],[1,C2],[2,C1]].forEach(([i,c])=>{const y=py-(i+1)*7*s;x.fillStyle=vgrad(y,y+7*s,[[0,c],[1,mixc(c,'#000000',.25)]]);x.fillRect(px-4*s,y,8*s,7*s);x.fillStyle='#1a1414';x.fillRect(px-2.4*s,y+2*s,1.4*s,1.4*s);x.fillRect(px+1*s,y+2*s,1.4*s,1.4*s);x.fillRect(px-1.6*s,y+4.6*s,3.2*s,.8*s)});x.fillStyle=C2;x.beginPath();x.moveTo(px-8*s,py-17*s);x.lineTo(px-4*s,py-19*s);x.lineTo(px-4*s,py-15*s);x.fill();x.beginPath();x.moveTo(px+8*s,py-17*s);x.lineTo(px+4*s,py-19*s);x.lineTo(px+4*s,py-15*s);x.fill()}
    else if(P.type==='bottle'){const f=flick(.8);if(LT>.03){x.save();x.globalAlpha*=LT;x.globalCompositeOperation='lighter';glow(px,py-7*s,22*s*f,`${P.glow}`);x.restore()}x.fillStyle=`rgba(${P.rgb},.45)`;x.strokeStyle=`rgba(${P.rgb},.8)`;x.lineWidth=.6;x.beginPath();x.moveTo(px-4*s,py);x.lineTo(px-4*s,py-10*s);x.quadraticCurveTo(px-4*s,py-13*s,px-1.4*s,py-14*s);x.lineTo(px-1.4*s,py-17*s);x.lineTo(px+1.4*s,py-17*s);x.lineTo(px+1.4*s,py-14*s);x.quadraticCurveTo(px+4*s,py-13*s,px+4*s,py-10*s);x.lineTo(px+4*s,py);x.closePath();x.fill();x.stroke();if(LT>.03){x.save();x.globalAlpha*=LT;x.fillStyle='#fff6c0';x.beginPath();x.arc(px,py-6*s,1.6*s*f,0,7);x.fill();x.restore()}}
    else if(P.type==='shellpile'){[[-4,0,C1],[3,0,C2],[0,-3,C1],[-1.5,-6,C2]].forEach(([o,y,c])=>{x.fillStyle=c;x.beginPath();x.moveTo(px+o*s-3*s,py+y*s);x.quadraticCurveTo(px+o*s,py+y*s-6*s,px+o*s+3*s,py+y*s);x.closePath();x.fill();x.strokeStyle='rgba(0,0,0,.2)';x.lineWidth=.4*s;for(let i=-1;i<=1;i++){x.beginPath();x.moveTo(px+o*s,py+y*s);x.lineTo(px+o*s+i*2*s,py+y*s-4.4*s);x.stroke()}})}
    else{x.fillStyle=vgrad(py-16*s,py,[[0,'#e8cf96'],[1,'#c9a96a']]);x.beginPath();x.ellipse(px,py-3*s,7*s,3*s,0,0,7);x.fill();x.beginPath();x.arc(px,py-11*s,5*s,0,7);x.fill();x.fillStyle=C1;x.beginPath();x.arc(px-1.6*s,py-12*s,.8*s,0,7);x.arc(px+1.6*s,py-12*s,.8*s,0,7);x.fill();x.fillStyle=C2;x.beginPath();x.arc(px,py-17*s,1.8*s,0,7);x.fill()}}
  function addGenDeco(P){if(ITEMS.some(i=>i.n===P.n))return;const sl=GSLOT[P.slot%GSLOT.length];ITEMS.push({c:P.price,n:P.n,d:[0,0],m:sl,a:0,gen:1});ITEMS.sort((a,b)=>a.c-b.c);DRAW[P.n]=(px,py)=>drawGenDeco(P,px,py);if(P.type==='bottle')LITS.add(P.n)}
  function addGenShow(key,parts){const L={};parts.forEach((pk,ix)=>{const d=SHOW[pk];if(!d)return;(d.L?Object.keys(d.L):[d.layer]).forEach(ly=>{(L[ly]??=[]).push([pk,ix])})});const o={L:{}};for(const ly in L)o.L[ly]=(p,st,et,rdt)=>{for(const[pk,ix]of L[ly]){const d=SHOW[pk],f=d.L?d.L[ly]:d.draw;st['s'+ix]??={};x.save();try{f(p,st['s'+ix],et,rdt)}catch(e){}x.restore()}};SHOW[key]=o}
  /* ---------- 自動生成（海辺アイテム・演出） ---------- */
  const GENL={beach:[],sea:[]};
  const hsl=(h,s,l,a=1)=>`hsla(${h},${s}%,${l}%,${a})`;
  const GFAM={
   lamp(px,py,P){const s=k*(1+P.sz*.3),f=flick(.8+P.v*.2),h=P.h1,lh=P.h2;shadowE(px,py+1*s,9*s,2*s,.4);
     if(P.v===0){x.fillStyle=hsl(h,30,30);x.fillRect(px-5*s,py-3*s,10*s,3*s);x.fillStyle=hsl(h,40,75,.35);x.beginPath();x.moveTo(px-5*s,py-3*s);x.lineTo(px-6*s,py-16*s);x.quadraticCurveTo(px,py-19*s,px+6*s,py-16*s);x.lineTo(px+5*s,py-3*s);x.fill();x.strokeStyle=hsl(h,30,85,.6);x.lineWidth=.6;x.stroke()}
     else if(P.v===1){x.fillStyle=hsl(h,45,32);x.fillRect(px-5*s,py-2*s,10*s,2*s);x.fillRect(px-4*s,py-18*s,8*s,2*s);x.strokeStyle=hsl(h,45,32);x.lineWidth=1*s;x.beginPath();[-4,4].forEach(o=>{x.moveTo(px+o*s,py-2*s);x.lineTo(px+o*s,py-16*s)});x.stroke();x.beginPath();x.arc(px,py-20*s,2*s,Math.PI,0);x.stroke()}
     else{x.strokeStyle=hsl(h,30,40);x.lineWidth=1.2*s;x.beginPath();x.moveTo(px,py);x.lineTo(px,py-6*s);x.stroke();x.fillStyle=hsl(h,50,70,.5);x.beginPath();x.arc(px,py-12*s,7*s,0,7);x.fill()}
     const cy=P.v===2?py-12*s:py-10*s;if(LT>.03){x.save();x.globalAlpha*=LT;x.globalCompositeOperation='lighter';glow(px,cy,26*s*f,hsl(lh,90,65,.45));pool(px,py,36*s*f,hsl(lh,90,60,.25));x.restore();x.save();x.globalAlpha*=LT;x.fillStyle=hsl(lh,100,85);x.beginPath();x.ellipse(px,cy,1.4*s,2.6*s*f,0,0,7);x.fill();x.restore()}},
   flag(px,py,P){const s=k*(1+P.sz*.3);shadowE(px,py+1*s,6*s,1.5*s,.35);x.strokeStyle='#7a5a3a';x.lineWidth=1.3*s;x.beginPath();x.moveTo(px,py);x.lineTo(px,py-40*s);x.stroke();
     x.save();x.beginPath();const w=t*3;x.moveTo(px,py-39*s);for(let i=0;i<=10;i++){const u=i/10;x.lineTo(px+u*20*s,py-39*s+Math.sin(w+u*4)*2*s*u)}for(let i=10;i>=0;i--){const u=i/10;x.lineTo(px+u*20*s,py-(P.v===2?24:28)*s+Math.sin(w+u*4)*2*s*u)}x.closePath();x.fillStyle=hsl(P.h1,70,55);x.fill();x.clip();
     x.fillStyle=hsl(P.h2,80,85);if(P.v===0)for(let i=0;i<3;i++)x.fillRect(px,py-(37-i*4)*s,22*s,1.6*s);else if(P.v===1)for(let i=0;i<6;i++){x.beginPath();x.arc(px+(3+i*3.2)*s,py-(34-(i%2)*3)*s,1.2*s,0,7);x.fill()}else{x.beginPath();x.arc(px+10*s,py-32*s,3.4*s,0,7);x.fill()}x.restore();x.fillStyle='#e8c860';x.beginPath();x.arc(px,py-41*s,1.4*s,0,7);x.fill()},
   pot(px,py,P){const s=k*(1+P.sz*.3);shadowE(px,py+1*s,8*s,2*s,.4);x.fillStyle=hsl(P.h1,45,45);x.beginPath();x.moveTo(px-6*s,py-9*s);x.lineTo(px+6*s,py-9*s);x.lineTo(px+4.6*s,py);x.lineTo(px-4.6*s,py);x.fill();x.fillStyle=hsl(P.h1,45,58);x.fillRect(px-6.6*s,py-10.6*s,13.2*s,2*s);
     const sw=Math.sin(t*1.3+P.h1)*.06;x.save();x.translate(px,py-10*s);x.rotate(sw);if(P.v===0){x.fillStyle='#4a8a4a';x.beginPath();x.ellipse(0,-8*s,3*s,8*s,0,0,7);x.fill();x.beginPath();x.ellipse(-4.6*s,-7*s,1.8*s,4*s,-.3,0,7);x.ellipse(4.6*s,-9*s,1.8*s,4*s,.3,0,7);x.fill();x.fillStyle=hsl(P.h2,80,70);x.beginPath();x.arc(0,-16.4*s,1.8*s,0,7);x.fill()}
     else if(P.v===1){x.strokeStyle='#3a7a3a';x.lineWidth=.8*s;[[-4,-14],[0,-18],[4,-13],[-1.5,-11]].forEach(([a,b],i)=>{x.beginPath();x.moveTo(0,0);x.quadraticCurveTo(a*.3*s,b*.5*s,a*s,b*s);x.stroke();x.fillStyle=hsl(P.h2+i*25,80,70);for(let j=0;j<5;j++){x.beginPath();x.arc(a*s+Math.cos(j*1.26)*1.6*s,b*s+Math.sin(j*1.26)*1.6*s,1.2*s,0,7);x.fill()}x.fillStyle='#ffe07a';x.beginPath();x.arc(a*s,b*s,.8*s,0,7);x.fill()})}
     else{x.fillStyle='#3a8a4a';for(let i=0;i<5;i++){x.save();x.rotate((i-2)*.35);x.beginPath();x.ellipse(0,-9*s,1.6*s,9*s,0,0,7);x.fill();x.restore()}}x.restore()},
   chime(px,py,P){const s=k*(1+P.sz*.25),sw=Math.sin(t*1.2+P.h1)*.12;x.strokeStyle='rgba(230,225,210,.6)';x.lineWidth=.6;x.beginPath();x.moveTo(px,py-30*s);x.lineTo(px,py-20*s);x.stroke();x.save();x.translate(px,py-20*s);x.rotate(sw);x.strokeStyle='#8a6a4a';x.lineWidth=1*s;x.beginPath();x.moveTo(-9*s,0);x.lineTo(9*s,0);x.stroke();
     for(let i=0;i<5;i++){const ox=(-8+i*4)*s,len=(6+((i*7+P.v)%4)*3)*s,ss=Math.sin(t*2+i)*.12;x.save();x.translate(ox,0);x.rotate(ss);x.strokeStyle='rgba(230,225,210,.6)';x.lineWidth=.4;x.beginPath();x.moveTo(0,0);x.lineTo(0,len);x.stroke();x.translate(0,len+2*s);const c=hsl((P.h1+i*P.h2/5)%360,70,72,.9);x.fillStyle=c;
       if(P.v===0){x.beginPath();x.arc(0,0,2*s,0,7);x.fill();x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.arc(-.6*s,-.6*s,.6*s,0,7);x.fill()}else if(P.v===1){x.beginPath();for(let j=0;j<10;j++){const a=j/10*Math.PI*2-Math.PI/2,r=j%2?1*s:2.4*s;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.fill()}else{x.beginPath();x.moveTo(0,-2*s);x.quadraticCurveTo(2.4*s,0,0,2.4*s);x.quadraticCurveTo(-2.4*s,0,0,-2*s);x.fill()}x.restore()}
     x.restore();if(LT>.3&&P.glow){x.save();x.globalAlpha*=LT;x.globalCompositeOperation='lighter';glow(px,py-12*s,20*s,hsl(P.h1,90,70,.3));x.restore()}},
   stone(px,py,P){const s=k*(1+P.sz*.3);shadowE(px,py+1*s,10*s,2.4*s,.4);let y=py;const n=3+P.v;for(let i=0;i<n;i++){const w=(9-i*1.6)*s,hh=(3.6-i*.3)*s;const g=x.createRadialGradient(px-w*.3,y-hh*1.4,1,px,y-hh,w);g.addColorStop(0,hsl(P.h1,12,72-i*3));g.addColorStop(1,hsl(P.h1,10,38));x.fillStyle=g;x.beginPath();x.ellipse(px+Math.sin(i*2.3)*1.4*s,y-hh,w,hh,Math.sin(i)*.08,0,7);x.fill();y-=hh*1.8}
     x.fillStyle=hsl(P.h2,60,85);x.beginPath();x.moveTo(px-2*s,y);x.quadraticCurveTo(px,y-4*s,px+2*s,y);x.fill()},
   float(px,py,P){const s=k*(1+P.sz*.3),by=py+Math.sin(t*1.3+P.h1)*1.2*k,r=Math.sin(t*.9)*.08;x.save();x.translate(px+Math.sin(t*.2+P.h2)*6*k,by);x.rotate(r);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.8;x.beginPath();x.ellipse(0,3*s,16*s,3*s,0,0,7);x.stroke();
     if(P.v===0){x.fillStyle=hsl(P.h1,80,62);x.beginPath();x.ellipse(0,0,9*s,5*s,0,0,7);x.fill();x.beginPath();x.arc(7*s,-6*s,4*s,0,7);x.fill();x.fillStyle='#ff9a2e';x.beginPath();x.ellipse(11*s,-5.4*s,2.4*s,1.1*s,0,0,7);x.fill();x.fillStyle='#111';x.beginPath();x.arc(8.4*s,-7*s,.7*s,0,7);x.fill()}
     else if(P.v===1){x.fillStyle=hsl(P.h1,40,45);x.fillRect(-12*s,-3*s,24*s,4*s);x.fillStyle=hsl(P.h1,40,35);for(let i=-2;i<=2;i++)x.fillRect(i*5*s-.4*s,-3*s,.8*s,4*s);x.fillStyle=hsl(P.h2,80,70);x.beginPath();x.moveTo(0,-3*s);x.lineTo(0,-16*s);x.lineTo(8*s,-6*s);x.closePath();x.fill()}
     else{for(let i=0;i<8;i++){x.strokeStyle=i%2?'#fff':hsl(P.h1,80,60);x.lineWidth=4*s;x.beginPath();x.ellipse(0,0,10*s,4*s,0,i/8*Math.PI*2,(i+1)/8*Math.PI*2);x.stroke()}}x.restore()},
   windmill(px,py,P){const s=k*(1+P.sz*.3);shadowE(px,py+1*s,5*s,1.4*s,.35);x.strokeStyle='#8a7a5a';x.lineWidth=1.2*s;x.beginPath();x.moveTo(px,py);x.lineTo(px,py-26*s);x.stroke();x.save();x.translate(px,py-26*s);x.rotate(t*(1.4+P.v*.8));for(let i=0;i<4;i++){x.rotate(Math.PI/2);x.fillStyle=hsl((P.h1+i*P.h2/4)%360,75,60);x.beginPath();x.moveTo(0,0);x.lineTo(9*s,-2*s);x.lineTo(9*s,3*s);x.closePath();x.fill()}x.fillStyle='#fff3c0';x.beginPath();x.arc(0,0,1.4*s,0,7);x.fill();x.restore()}};
  const GEV={
   lamp:(D,p,st,et)=>{const[px,py]=pos(D),a=fade(p,.08,.1);x.save();x.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const an=et*(1+i*.1)+i,rr=(8+i*2)*k;x.globalAlpha=a;glow(px+Math.cos(an)*rr,py-14*k+Math.sin(an*1.3)*rr*.6,4*k,hsl(D.P.h2,90,75,.85))}x.restore();x.globalAlpha=1},
   flag:(D,p,st,et)=>{const[px,py]=pos(D),a=fade(p,.05,.1);st.c??=[];if(Math.random()<.5)st.c.push({x:px+10*k,y:py-34*k,vx:R(.5,2)*k,vy:R(-.6,.4)*k,r:R(0,6),c:Math.random()<.5?D.P.h1:D.P.h2});for(const c of st.c){c.x+=c.vx;c.y+=c.vy;c.vy+=.02*k;c.r+=.15;x.globalAlpha=a;x.fillStyle=hsl(c.c,80,65);x.save();x.translate(c.x,c.y);x.rotate(c.r);x.fillRect(-1.4*k,-.7*k,2.8*k,1.4*k);x.restore()}st.c=st.c.filter(c=>c.y<py+20*k);x.globalAlpha=1},
   pot:(D,p,st,et)=>{const[px,py]=pos(D),a=fade(p,.05,.1),q=p<.4?p/.4:p<.7?1:1-(p-.7)/.3,bx=lerp(px-80*k,px+2*k,q)+Math.sin(et*3)*4*k,by=lerp(py-80*k,py-26*k,q)+Math.cos(et*2.4)*3*k,f=Math.abs(Math.sin(et*12));x.globalAlpha=a;x.fillStyle=hsl(D.P.h2+40,80,70);x.beginPath();x.ellipse(bx-2.6*k*f,by,2.8*k*f,2*k,-.4,0,7);x.ellipse(bx+2.6*k*f,by,2.8*k*f,2*k,.4,0,7);x.fill();x.fillStyle='#2a1d14';x.fillRect(bx-.3*k,by-2*k,.6*k,4*k);x.globalAlpha=1},
   chime:(D,p,st,et)=>{const[px,py]=pos(D),a=fade(p,.05,.1);st.s??=Array.from({length:14},()=>({x:R(-W*.3,0),y:R(WT,WT+WH*.6),v:R(1,2)}));for(const s of st.s){s.x+=s.v*k*1.3;s.y+=Math.sin(et*2+s.v)*.4;x.globalAlpha=a*.8;x.fillStyle=hsl(D.P.h1,80,82);x.beginPath();x.ellipse(s.x,s.y,2.2*k,1.1*k,et+s.v,0,7);x.fill()}if(Math.floor(et*1.5)%2===0){x.globalAlpha=a;x.fillStyle='#fff';x.font=`${7*k}px sans-serif`;x.fillText('チリン',px-28*k,py-30*k)}x.globalAlpha=1},
   stone:(D,p,st,et)=>{const[px,py]=pos(D),a=fade(p,.05,.08),q=Math.min(1,p*1.6),cx=lerp(px+30*k,px,Math.min(1,q*1.5)),cy=lerp(py,py-22*k,Math.max(0,q*1.5-.5)),w=Math.sin(et*9);x.globalAlpha=a;x.save();x.translate(cx,cy-2*k);x.fillStyle='#e8553a';x.beginPath();x.ellipse(0,0,3.6*k,2.4*k,0,0,7);x.fill();x.strokeStyle='#e8553a';x.lineWidth=.8*k;[-1,1].forEach(d=>{x.beginPath();x.arc(d*4.4*k,-2.6*k-Math.abs(w)*.6*k,1.4*k,0,7);x.stroke()});x.restore();x.globalAlpha=1},
   float:(D,p,st,et)=>{const[px,py]=pos(D),a=fade(p,.05,.08),q=p<.35?p/.35:p<.75?1:1-(p-.75)/.25,gx=lerp(px+90*k,px,q),gy=lerp(py-80*k,py-10*k,q),f=q<1?Math.sin(et*9):0;x.globalAlpha=a;x.strokeStyle='#f4f4f4';x.lineWidth=1.4*k;x.beginPath();x.moveTo(gx-7*k,gy-f*4*k);x.quadraticCurveTo(gx-3*k,gy-2*k,gx,gy);x.quadraticCurveTo(gx+3*k,gy-2*k,gx+7*k,gy-f*4*k);x.stroke();if(q>=1){x.fillStyle='#f4f4f4';x.beginPath();x.ellipse(gx,gy,4*k,2.4*k,0,0,7);x.fill();x.fillStyle='#f2b04e';x.fillRect(gx+3*k,gy-1*k,3*k,1*k)}x.globalAlpha=1},
   windmill:(D,p,st,et)=>{const[px,py]=pos(D),a=fade(p,.05,.1);st.l??=[];if(Math.random()<.4)st.l.push({x:WL-10,y:R(WT+WH*.4,WT+WH*.9),v:R(2,4)*k,r:R(0,6)});for(const l of st.l){l.x+=l.v;l.y+=Math.sin(et*3+l.r)*.6;l.r+=.2;x.globalAlpha=a;x.fillStyle='#7aaa4a';x.save();x.translate(l.x,l.y);x.rotate(l.r);x.beginPath();x.ellipse(0,0,2.6*k,1*k,0,0,7);x.fill();x.restore()}st.l=st.l.filter(l=>l.x<WL+WW+20);x.globalAlpha=1}};
  function genAddDeco(D){if(ITEMS.some(i=>i.n===D.n))return;const it={c:D.price,n:D.n,d:[0,0],m:D.m||[.5,.95],a:0,gen:1,lay:D.lay};ITEMS.push(it);ITEMS.sort((a,b)=>a.c-b.c);DRAW[D.n]=(px,py)=>{try{GFAM[D.fam](px,py,D.P)}catch(e){}};if(D.fam==='lamp'||(D.fam==='chime'&&D.P.glow))LITS.add(D.n);
    GENL[D.lay].push(D.n);AMB[D.ev]={deco:D.n,dur:24,layer:D.fam==='float'?'sea':'front',draw:(p,st,et)=>{const it2=ITEMS.find(i=>i.n===D.n);if(it2)GEV[D.fam]({...D,m:it2.m},p,st,et)}}}
  function genDelDeco(n){const i=ITEMS.findIndex(x=>x.n===n);if(i>=0)ITEMS.splice(i,1);['beach','sea'].forEach(l=>{const j=GENL[l].indexOf(n);if(j>=0)GENL[l].splice(j,1)})}
  function genSetPos(n,m){const it=ITEMS.find(i=>i.n===n);if(it)it.m=m}
  const GPOOL=['kite','surfer','jetski','parasail','seaplane','penguin','rabbit','otter','seal','ducks','flamingo','fox','shiba','capy','swan','parrot','pelican','crane','horse','lanternwalk','glowsticks','sparklers','juggler','cyclist','students','kids_run','dogwalk','volley','frisbee','family'];
  const GSHAPE={heart:(s)=>{x.beginPath();x.moveTo(0,s*.35);x.bezierCurveTo(-s,-s*.3,-s*.5,-s,0,-s*.45);x.bezierCurveTo(s*.5,-s,s,-s*.3,0,s*.35);x.fill()},star:(s)=>{x.beginPath();for(let j=0;j<10;j++){const a=j/10*Math.PI*2-Math.PI/2,r=j%2?s*.42:s;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.fill()},bubble:(s)=>{x.beginPath();x.arc(0,0,s*.8,0,7);x.lineWidth=s*.18;x.strokeStyle=x.fillStyle;x.stroke()},petal:(s)=>{x.beginPath();x.ellipse(0,0,s*.5,s,0,0,7);x.fill()},orb:(s)=>{x.beginPath();x.arc(0,0,s*.6,0,7);x.fill()},lantern:(s)=>{x.fillRect(-s*.45,-s*.6,s*.9,s*1.2)}};
  function genAddShow(key,G){const L={};const add=(ly,fn)=>{(L[ly]??=[]).push(fn)};
    if(G.parade){const c=cmbL(G.parade);for(const ly in c.L)add(ly,c.L[ly])}
    if(G.tint)add('sky',(p,st,et)=>{const a=fade(p,.1,.15);const g=x.createLinearGradient(0,0,0,hz);g.addColorStop(0,hsl(G.tint[0],70,60,.18*a));g.addColorStop(1,hsl(G.tint[1],80,65,.32*a));x.fillStyle=g;x.fillRect(0,0,W,hz)});
    if(G.motes)add(G.motes.ly||'front',(p,st,et)=>{const a=fade(p,.05,.1),M=G.motes,key2='m'+M.shape;st[key2]??=Array.from({length:M.n},()=>({x:R(0,W),y:R(WT,WT+WH),v:R(.3,.9)*k*(M.dir||1),ph:R(0,6),s:R(.7,1.3),h:M.hues[Math.random()*M.hues.length|0]}));x.save();if(M.glow)x.globalCompositeOperation='lighter';
      for(const m of st[key2]){m.y-=m.v;m.x+=Math.sin(et*.8+m.ph)*.5;if(m.y<WT-10)m.y=WT+WH+10;if(m.y>WT+WH+12)m.y=WT-8;x.globalAlpha=a*(.55+.45*Math.sin(et*2+m.ph));x.fillStyle=hsl(m.h,85,72);x.save();x.translate(m.x,m.y);x.rotate(Math.sin(et+m.ph)*.5);GSHAPE[M.shape](5*k*m.s);x.restore();if(M.glow)glow(m.x,m.y,8*k*m.s,hsl(m.h,90,70,.35))}x.restore();x.globalAlpha=1});
    if(G.bursts)add('sky',(p,st,et)=>{const B=G.bursts;st.b??=[];st.n??=0;if(p<.9&&et>st.n){st.n=et+R(.5,1.3);const bx=R(W*.1,W*.9),by=R(hz*.15,hz*.6),h=B.hues[Math.random()*B.hues.length|0],n=B.pat==='heart'?40:60;for(let i=0;i<n;i++){let vx,vy;const an=i/n*Math.PI*2;if(B.pat==='heart'){const tt=an;vx=16*Math.pow(Math.sin(tt),3)*.13*k;vy=-(13*Math.cos(tt)-5*Math.cos(2*tt)-2*Math.cos(3*tt)-Math.cos(4*tt))*.13*k}else{const v=(B.pat==='ring'?2:R(1,2.4))*k;vx=Math.cos(an)*v;vy=Math.sin(an)*v}st.b.push({x:bx,y:by,vx,vy,l:1,h,w:B.pat==='willow'})}try{sfx.boom(false)}catch(e){}}
      x.save();x.globalCompositeOperation='lighter';for(const q of st.b){q.x+=q.vx;q.y+=q.vy;q.vy+=(q.w?.04:.02)*k;q.vx*=.985;q.l-=q.w?.008:.014;x.globalAlpha=Math.max(0,q.l);glow(q.x,q.y,3*k,hsl(q.h,95,70,.9))}st.b=st.b.filter(q=>q.l>0);x.restore();x.globalAlpha=1});
    SHOW[key]={L:Object.fromEntries(Object.entries(L).map(([ly,fs])=>[ly,(p,st,et,rdt)=>{fs.forEach((f,i)=>{st['_'+i]??={};x.save();try{f(p,st['_'+i],et,rdt)}catch(e){}x.restore()})}]))}}
  /* v125: higher quality beach items */
  Object.assign(DRAW,{
   'テント'(px,py){const s=k*1.05,f=flick(.7),P=(a,b)=>[px+a*s,py+b*s],nt=dark;
    shadowE(px+12*s,py+2*s,76*s,10*s,.45);if(nt>.4)pool(px-6*s,py+8*s,80*s*f,`rgba(255,170,70,${.4*nt})`);
    const A=P(-6,-62),B=P(34,-54),FL=P(-44,0),FR=P(28,0),BR=P(68,-6);
    x.fillStyle=vgrad(py-56*s,py,[[0,'#7a3e20'],[1,'#4e2412']]);x.beginPath();x.moveTo(...A);x.lineTo(...B);x.lineTo(...BR);x.lineTo(...FR);x.closePath();x.fill();
    for(let i=1;i<5;i++){const u=i/5,a=[A[0]+(B[0]-A[0])*u,A[1]+(B[1]-A[1])*u],b=[FR[0]+(BR[0]-FR[0])*u,FR[1]+(BR[1]-FR[1])*u];x.strokeStyle='rgba(20,8,2,.35)';x.lineWidth=1.1*s;x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke();x.strokeStyle='rgba(255,190,130,.1)';x.lineWidth=2.4*s;x.beginPath();x.moveTo(a[0]+3*s,a[1]+1*s);x.quadraticCurveTo((a[0]+b[0])/2+4*s,(a[1]+b[1])/2,b[0]+3*s,b[1]);x.stroke()}
    x.strokeStyle='#3a2414';x.lineWidth=2*s;x.beginPath();x.moveTo(...A);x.lineTo(...B);x.stroke();
    x.fillStyle=vgrad(py-62*s,py,[[0,'#ee9a52'],[.6,'#cc6a30'],[1,'#9a4a20']]);x.beginPath();x.moveTo(...FL);x.lineTo(...A);x.lineTo(...FR);x.closePath();x.fill();
    x.fillStyle=hgrad(px-44*s,px+28*s,[[0,'rgba(255,215,160,.28)'],[.5,'rgba(255,215,160,0)'],[1,'rgba(0,0,0,.2)']]);x.fill();
    x.strokeStyle='rgba(120,50,15,.35)';x.lineWidth=.8*s;for(let i=1;i<4;i++){const u=i/4;x.beginPath();x.moveTo(A[0]+(FL[0]-A[0])*u,A[1]+(FL[1]-A[1])*u);x.lineTo(A[0]+(FR[0]-A[0])*u,A[1]+(FR[1]-A[1])*u);x.stroke()}
    const D1=P(-18,0),D2=P(10,0),DT=P(-5,-40);const ig=x.createLinearGradient(0,DT[1],0,py);ig.addColorStop(0,nt>.4?`rgba(255,205,120,${.95*f})`:'#3a1a0c');ig.addColorStop(1,nt>.4?`rgba(255,150,60,${.85*f})`:'#24100a');x.fillStyle=ig;x.beginPath();x.moveTo(...D1);x.lineTo(...DT);x.lineTo(...D2);x.closePath();x.fill();
    if(nt>.4){x.save();x.globalCompositeOperation='lighter';glow(DT[0],py-14*s,32*s*f,`rgba(255,170,80,${.35*nt})`);x.restore()}
    x.fillStyle='#f4ae6e';x.beginPath();x.moveTo(...DT);x.quadraticCurveTo(px-20*s,py-22*s,px-26*s,py-1*s);x.lineTo(...D1);x.closePath();x.fill();
    x.fillStyle='#b8622c';x.beginPath();x.moveTo(...DT);x.quadraticCurveTo(px+12*s,py-22*s,px+18*s,py-1*s);x.lineTo(...D2);x.closePath();x.fill();
    x.strokeStyle='#5a3418';x.lineWidth=1.3*s;x.beginPath();x.moveTo(px-24*s,py-14*s);x.lineTo(px-17*s,py-13*s);x.moveTo(px+16*s,py-14*s);x.lineTo(px+9*s,py-13*s);x.stroke();
    x.strokeStyle='rgba(60,25,8,.6)';x.lineWidth=1.3*s;x.beginPath();x.moveTo(...FL);x.lineTo(...A);x.lineTo(...FR);x.stroke();
    x.strokeStyle='rgba(235,225,205,.6)';x.lineWidth=.8*s;[[A,P(-62,6)],[B,P(88,-2)],[P(-28,-18),P(-58,8)]].forEach(([a,b])=>{x.beginPath();x.moveTo(...a);x.lineTo(...b);x.stroke();x.fillStyle='#6a5030';x.fillRect(b[0]-1*s,b[1]-3*s,2*s,4*s)});
    x.strokeStyle='#3a2414';x.lineWidth=1*s;x.beginPath();x.moveTo(A[0],A[1]);x.lineTo(A[0],A[1]-13*s);x.stroke();x.fillStyle='#ffd23f';x.beginPath();x.moveTo(A[0],A[1]-13*s);x.lineTo(A[0]+9*s+Math.sin(t*3)*1.5*s,A[1]-10*s);x.lineTo(A[0],A[1]-7*s);x.fill()},
   'ビーチパラソル'(px,py){const s=k*1.1;shadowE(px+14*s,py+1*s,40*s,6*s,.32);
    x.strokeStyle=hgrad(px-8*s,px,[[0,'#bfb6a6'],[.5,'#fffaf0'],[1,'#a89e8c']]);x.lineWidth=2.2*s;x.beginPath();x.moveTo(px,py);x.lineTo(px-6*s,py-70*s);x.stroke();
    x.save();x.translate(px-6*s,py-70*s);x.rotate(-.12);const cols=['#e8463e','#f6efe2'],N=10,Pt=a=>[Math.cos(a)*44*s,Math.sin(a)*-16*s+10*s];
    for(let i=0;i<N;i++){const a0=Math.PI+i*Math.PI/N,a1=a0+Math.PI/N,am=(a0+a1)/2,p0=Pt(a0),p1=Pt(a1),pm=Pt(am),sh=Math.cos(am)*.5+.5;
     x.beginPath();x.moveTo(0,-5*s);x.lineTo(...p0);x.quadraticCurveTo(pm[0],pm[1]+5*s,...p1);x.closePath();x.fillStyle=cols[i%2];x.fill();x.fillStyle=`rgba(0,0,0,${.2*(1-sh)})`;x.fill();x.fillStyle=`rgba(255,255,255,${.14*sh})`;x.fill();
     x.strokeStyle=i%2?'#e6dcc6':'#c8342c';x.lineWidth=.6*s;for(let q=0;q<4;q++){const u=(q+.5)/4,fx=p0[0]+(p1[0]-p0[0])*u,fy=p0[1]+(p1[1]-p0[1])*u+Math.sin(u*Math.PI)*4.6*s;x.beginPath();x.moveTo(fx,fy);x.lineTo(fx+Math.sin(t*2+q+i)*.6*s,fy+3*s);x.stroke()}}
    x.strokeStyle='rgba(80,60,40,.3)';x.lineWidth=.6*s;for(let i=0;i<=N;i++){const a=Math.PI+i*Math.PI/N;x.beginPath();x.moveTo(0,-5*s);x.lineTo(...Pt(a));x.stroke()}
    x.fillStyle=vgrad(-6*s,14*s,[[0,'rgba(255,255,255,0)'],[1,'rgba(0,0,0,.18)']]);x.beginPath();x.moveTo(-44*s,10*s);x.quadraticCurveTo(0,-14*s,44*s,10*s);x.lineTo(0,-6*s);x.closePath();x.fill();
    x.fillStyle='#e8c44a';x.beginPath();x.arc(0,-6*s,2.4*s,0,7);x.fill();x.restore()},
   'カヌー'(px,py){const s=k*.8,bx=px+Math.sin(t*.15)*10*k,by=py+Math.sin(t*1.2)*.8*k;x.save();x.translate(bx,by);x.rotate(Math.sin(t*1.1)*.03);
    x.fillStyle='rgba(10,30,55,.28)';x.beginPath();x.ellipse(0,3*s,31*s,2.6*s,0,0,7);x.fill();x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=.8*s;for(let i=0;i<2;i++){x.beginPath();x.ellipse(0,2.5*s,(34+i*5)*s+Math.sin(t*2+i)*s,(2.2+i)*s,0,0,Math.PI);x.stroke()}
    const hg=x.createLinearGradient(0,-6*s,0,2*s);hg.addColorStop(0,'#ec7a44');hg.addColorStop(.5,'#c04a22');hg.addColorStop(1,'#6a2410');x.fillStyle=hg;x.beginPath();x.moveTo(-30*s,-5*s);x.quadraticCurveTo(-26*s,2*s,0,2.2*s);x.quadraticCurveTo(26*s,2*s,30*s,-5*s);x.quadraticCurveTo(0,-2.5*s,-30*s,-5*s);x.fill();
    x.fillStyle='#4a2210';x.beginPath();x.moveTo(-27*s,-4.6*s);x.quadraticCurveTo(0,-1*s,27*s,-4.6*s);x.quadraticCurveTo(0,-3.6*s,-27*s,-4.6*s);x.fill();
    x.strokeStyle='#f4d9a0';x.lineWidth=1.2*s;x.beginPath();x.moveTo(-30*s,-5*s);x.quadraticCurveTo(0,-2.5*s,30*s,-5*s);x.stroke();
    x.fillStyle='#d9b27a';x.fillRect(-10*s,-4.3*s,4*s,1.2*s);x.fillRect(8*s,-4.3*s,4*s,1.2*s);
    x.strokeStyle='#c99a5a';x.lineWidth=1.1*s;x.beginPath();x.moveTo(-18*s,-9*s);x.lineTo(14*s,-3.5*s);x.stroke();x.fillStyle='#d8aa66';x.beginPath();x.ellipse(17*s,-3*s,4*s,1.4*s,.17,0,7);x.fill();
    x.strokeStyle='rgba(255,230,200,.35)';x.lineWidth=.8*s;x.beginPath();x.moveTo(-26*s,-2.6*s);x.quadraticCurveTo(0,.2*s,26*s,-2.6*s);x.stroke();x.restore()},
   '砂の城'(px,py){const s=k*1.05,c1='#f2dca4',c2='#cfae6e',c3='#a88650';shadowE(px+2*s,py+1*s,30*s,4.5*s,.3);
    x.fillStyle='rgba(110,170,195,.5)';x.beginPath();x.ellipse(px,py+.6*s,28*s,4.2*s,0,0,7);x.fill();x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(px-6*s,py+1.6*s,8*s,.8*s,0,0,7);x.fill();x.fillStyle=c2;x.beginPath();x.ellipse(px,py,23*s,3*s,0,0,7);x.fill();
    x.fillStyle=vgrad(py-12*s,py,[[0,c1],[1,c2]]);x.fillRect(px-20*s,py-12*s,40*s,12*s);for(let i=0;i<8;i++)x.fillRect(px-20*s+i*5.4*s,py-15*s,3*s,3*s);
    x.fillStyle='#5a3e24';x.beginPath();x.moveTo(px-4*s,py);x.lineTo(px-4*s,py-6*s);x.arc(px,py-6*s,4*s,Math.PI,0);x.lineTo(px+4*s,py);x.fill();
    const tower=(cx,w,h,cone)=>{x.fillStyle=hgrad(cx-w/2,cx+w/2,[[0,c1],[.6,c2],[1,c3]]);x.fillRect(cx-w/2,py-h,w,h-2*s);for(let i=0;i<3;i++)x.fillRect(cx-w/2+i*w/2.5,py-h-3*s,w/4,3*s);x.fillStyle='#5a3e24';x.beginPath();x.moveTo(cx-1.3*s,py-h+9*s);x.lineTo(cx-1.3*s,py-h+6*s);x.arc(cx,py-h+6*s,1.3*s,Math.PI,0);x.lineTo(cx+1.3*s,py-h+9*s);x.fill();
      x.strokeStyle='rgba(120,90,50,.35)';x.lineWidth=.6*s;for(let y=py-h+3*s;y<py-2*s;y+=4*s){x.beginPath();x.moveTo(cx-w/2,y);x.lineTo(cx+w/2,y);x.stroke()}
      if(cone){x.fillStyle=hgrad(cx-w/2,cx+w/2,[[0,c1],[1,c3]]);x.beginPath();x.moveTo(cx-w/2-1*s,py-h-3*s);x.lineTo(cx,py-h-14*s);x.lineTo(cx+w/2+1*s,py-h-3*s);x.fill()}};
    tower(px-15*s,9*s,22*s,true);tower(px+15*s,9*s,22*s,true);tower(px,12*s,32*s,false);
    x.strokeStyle='#5a4028';x.lineWidth=.9*s;x.beginPath();x.moveTo(px,py-35*s);x.lineTo(px,py-48*s);x.stroke();x.fillStyle='#e8463e';x.beginPath();x.moveTo(px,py-48*s);x.lineTo(px+9*s+Math.sin(t*4)*1.5*s,py-45*s);x.lineTo(px,py-42*s);x.fill();
    x.fillStyle='#ffd8e0';[[-8,-8],[6,-9],[12,-3],[-16,-4]].forEach(([a,b])=>{x.beginPath();x.arc(px+a*s,py+b*s,1.3*s,0,7);x.fill()});
    x.fillStyle='rgba(120,90,50,.28)';for(let i=0;i<70;i++){x.fillRect(px-20*s+((i*37.7)%40)*s,py-34*s+((i*53.3)%34)*s,.7*s,.7*s)}},
   'ビーチチェア'(px,py){const s=k*1.45;shadowE(px+2*s,py+1*s,22*s,3.6*s,.38);x.lineCap='round';
    const wd=(a,b,c,d,w)=>{x.strokeStyle='#7a4e2a';x.lineWidth=w*s;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.strokeStyle='rgba(255,220,170,.45)';x.lineWidth=w*.35*s;x.beginPath();x.moveTo(a,b-.4*s);x.lineTo(c,d-.4*s);x.stroke()};
    wd(px+10*s,py,px-4*s,py-10*s,1.6);
    x.save();x.beginPath();x.moveTo(px-13*s,py-6*s);x.quadraticCurveTo(px-4*s,py-4.5*s,px+3*s,py-9*s);x.lineTo(px+11.5*s,py-26*s);x.lineTo(px+15*s,py-25*s);x.lineTo(px+6.5*s,py-7.5*s);x.quadraticCurveTo(px-3*s,py-2.5*s,px-12.5*s,py-3.5*s);x.closePath();x.clip();
    for(let i=-10;i<12;i++){x.fillStyle=['#e8463e','#fbf4e6','#3e8fc4','#fbf4e6'][((i%4)+4)%4];x.fillRect(px+i*2.2*s,py-30*s,2.2*s,32*s)}
    x.fillStyle=vgrad(py-26*s,py,[[0,'rgba(255,255,255,.15)'],[.6,'rgba(0,0,0,.05)'],[1,'rgba(0,0,0,.3)']]);x.fillRect(px-16*s,py-30*s,34*s,32*s);x.restore();
    wd(px-14*s,py,px+4*s,py-10*s,1.8);wd(px+4*s,py-10*s,px+12*s,py-26*s,1.6);wd(px+6*s,py-8*s,px+15*s,py-25*s,1.3);
    x.fillStyle='#ffd23f';x.beginPath();x.moveTo(px+9*s,py-19*s);x.lineTo(px+13.5*s,py-20*s);x.lineTo(px+11*s,py-14*s);x.lineTo(px+7*s,py-13.5*s);x.fill()}
  });
  function update(c){coins=c;const ul=$('items');if(ul)ul.innerHTML=ITEMS.map(i=>`<li class="${hasDeco(i.n)?'got':''}">${i.c.toLocaleString()}枚</li><li class="${hasDeco(i.n)?'got':''}">${i.n}</li>`).join('');if(still)frame(performance.now())}
  requestAnimationFrame(frame);
  let floatSt=0;function drawFloat(){if(!floatSt)return;const fx=WL+WW*.27,base=seaY(.74),hk=floatSt===2,fy=base+Math.sin(t*1.6)*.9*k+(hk?2.5*k+Math.sin(t*11)*1.6*k:0),s=k*1.1;
    x.save();x.strokeStyle=`rgba(255,255,255,${hk?.55:.3})`;x.lineWidth=.7;for(let i=0;i<(hk?3:2);i++){const ph=((t*(hk?1.6:.5)+i/3)%1);x.globalAlpha=1-ph;x.beginPath();x.ellipse(fx,base+3*k,(4+ph*(hk?18:10))*k,(1.2+ph*(hk?5:3))*k,0,0,7);x.stroke()}x.globalAlpha=1;
    x.fillStyle='#fff';x.beginPath();x.ellipse(fx,fy+1.5*s,2.6*s,2*s,0,0,Math.PI);x.fill();x.fillStyle=hk?'#ff2d4a':'#ff5c5c';x.beginPath();x.ellipse(fx,fy+1.5*s,2.6*s,3.2*s,0,Math.PI,0);x.fill();x.fillStyle='#333';x.fillRect(fx-.4*s,fy-4.5*s,.8*s,3*s);
    if(hk&&Math.sin(t*6)>0){x.fillStyle='#ffe066';x.font=`bold ${9*k}px sans-serif`;x.textAlign='center';x.fillText('!',fx,fy-8*s)}x.restore()}
  return{visNow:()=>!!vcur,setFloat:v=>{floatSt=v},dbg:()=>({WL,WT,WW,WH,k,W,H,hz,shore,dark,mx:moonX,my:moonY,fire:fireP(),sx:sunX,sy:sunY,gh:gameHour()}),curEv:()=>cur&&cur.name,fest:()=>festKind(),itemAt:(px,py)=>{let best=null,bd=1e9;for(const it of ITEMS){if(!hasDeco(it.n))continue;const[ix,iy]=pos(it);const dx=px-ix,dy=py-(iy-14*k),dd=Math.hypot(dx,dy*1.2);if(dd<26*k&&dd<bd){bd=dd;best=it.n}}return best},setFire:on=>{fireT=on?1:0},fireHit:(cx,cy)=>{const[fx,fy]=fireP();return Math.abs(cx-fx)<34*k&&cy<fy+18*k&&cy>fy-16*k},amb:(n,et)=>{startAmb(n);if(et&&acur)acur.et=et},ambs:AMBN,visit:(n,et)=>{startVisitor(n);if(et&&vcur)vcur.et=et},visitors:VISN,update,items:()=>ITEMS.filter(i=>hasDeco(i.n)).map(i=>i.n),decos:()=>ITEMS.map(i=>({n:i.n,c:i.c,g:i.gen})),gen:{addDeco:genAddDeco,delDeco:genDelDeco,setPos:genSetPos,addShow:genAddShow},skyKind:()=>skyKind().kind,addDeco:addGenDeco,addShow:addGenShow,fireFxNow:k=>{ffx.next=0;window.FFX_K=k},showing:()=>shows.map(x=>x.name),dark:()=>dark,play:(n,et)=>{startEvent(n);if(et)cur.et=et},names:EVN,show:startShow,notes:()=>{const[fx,fy]=fireP();for(let i=0;i<2;i++)notes.push({x:fx+R(-40,40)*k,y:fy-R(10,40)*k,s:['♪','♫','♬'][Math.random()*3|0],c:['#ffe7a8','#ffd1e0','#c9fff0'][Math.random()*3|0],l:1})}};
})();
SCENE.update(S.coins);
(()=>{const R=(a,b)=>a+Math.random()*(b-a);
  const ok=()=>{try{return ac&&waveBus&&S.sound&&S.waves&&!document.hidden}catch(e){return false}};
  const buf=()=>NB;
  const outP=(pan,v=1,life=14000)=>{const g=ac.createGain();g.gain.value=v;let n=g;if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));g.connect(p);p.connect(waveBus)}else g.connect(waveBus);setTimeout(()=>{try{g.disconnect()}catch(e){}},life);return g};
  const env=(g,t,a,hold,rel,v)=>{g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+a+hold);g.gain.exponentialRampToValueAtTime(.0001,t+a+hold+rel)};
  const nz=(o,t,dur,{type='bandpass',f=1000,f2,q=.7,v=.01,a=.02,hold=0,rel})=>{const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=buf();s.loop=true;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);fl.Q.value=q;
    env(g,t,a,hold,rel??Math.max(.02,dur-a-hold),v);s.connect(fl).connect(g).connect(o);s.start(t,R(0,1.5));s.stop(t+dur+.2)};
  const tn=(o,t,dur,{type='sine',f=440,f2,v=.01,a=.01,hold=0,rel,vib=0,vibF=6,lp})=>{const s=ac.createOscillator(),g=ac.createGain();s.type=type;s.frequency.setValueAtTime(f,t);if(f2)s.frequency.exponentialRampToValueAtTime(f2,t+dur);
    if(vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=vibF;lg.gain.value=vib;l.connect(lg).connect(s.frequency);l.start(t);l.stop(t+dur+.1)}
    env(g,t,a,hold,rel??Math.max(.02,dur-a-hold),v);let n=s;if(lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;s.connect(fl);n=fl}n.connect(g).connect(o);s.start(t);s.stop(t+dur+.1)};
  /* ---------- 波：新しい パターン ---------- */
  const W={
   // 寄せては 返す 小波（ちゃぷ…ちゃぷ…）
   lap(t){const n=3+(Math.random()*3|0);let x=t;for(let i=0;i<n;i++){const d=R(1.6,2.6),o=outP(R(-.5,.5),1.5);nz(o,x,d,{type:'lowpass',f:300,f2:700,v:R(.025,.04),a:d*.4,rel:d*.6});nz(o,x+d*.35,d*.6,{f:R(2500,3500),q:.6,v:R(.004,.007),a:.15});x+=d*R(.75,1)}return (x-t)*1000+R(1500,3000)},
   // 引き波の シュワー（長く 細かく 消えていく）
   backwash(t){const d=R(5.5,7.5),o=outP(R(-.3,.3),1.5);nz(o,t,d,{type:'lowpass',f:220,f2:1100,v:R(.07,.09),a:d*.38,rel:d*.62});nz(o,t+d*.36,d*.9,{f:R(3000,4200),f2:1800,q:.5,v:R(.014,.02),a:.25,rel:d*.8});return d*1000+R(2500,4500)},
   // 小石が 転がる 引き波（カラカラ…）
   pebble(t){const d=R(5,6.5),o=outP(R(-.2,.4),1.6);nz(o,t,d,{type:'lowpass',f:240,f2:1000,v:R(.065,.085),a:d*.4,rel:d*.6});
     const st=t+d*.45,n=40+(Math.random()*40|0);for(let i=0;i<n;i++){const tt=st+Math.pow(Math.random(),1.6)*d*.55;nz(o,tt,.03,{f:R(3500,6500),q:3,v:R(.003,.008),a:.002,rel:.025})}return d*1000+R(3000,5000)},
   // 遠くの 波（低く ゆっくり）
   far(t){const d=R(9,12),o=outP(R(-.8,.8),1);nz(o,t,d,{type:'lowpass',f:160,f2:420,q:.4,v:R(.05,.07),a:d*.45,rel:d*.55});return d*1000*R(.55,.75)},
   // 岩に あたる 波（ザバッ… ぽちゃ）
   rock(t){const d=R(5,7),o=outP(R(.3,.8),1.5);nz(o,t,d,{type:'lowpass',f:220,f2:1200,v:R(.07,.09),a:d*.36,rel:d*.64});const pk=t+d*.36;nz(o,pk,.9,{f:1600,q:.6,v:R(.02,.03),a:.02,rel:.85});
     for(let i=0;i<4+(Math.random()*4|0);i++)tn(o,pk+R(.3,1.6),.12,{f:R(900,1800),f2:R(1800,2600),v:R(.002,.004),a:.004,rel:.1});return d*1000+R(3000,4500)},
   // セット波（大きいのが 3つ 続く → しばらく 静か）
   set(t){let x=t;for(let i=0;i<3;i++){const d=R(7,9);oneWave(x,d,R(.36,.44),R(.075,.09)*(1-i*.12),R(.016,.022),R(1000,1300),i===0?R(.01,.018):0);x+=R(5.5,7)}return (x-t)*1000+R(6000,9000)},
   // 凪（ほとんど 音が しない）
   calm(t){const o=outP(0);nz(o,t,4,{type:'lowpass',f:200,f2:350,v:.018,a:1.8,rel:2.2});return R(7000,10000)}};
  const WP=[['lap',14],['backwash',12],['pebble',9],['far',10],['rock',8],['set',1],['calm',6]];const WT=WP.reduce((a,b)=>a+b[1],0);
  {const _sf=surf;surf=function(){if(!amb)return;if(S.waves&&!document.hidden&&Math.random()<.42){try{let r=Math.random()*WT,k='lap';for(const[n,w]of WP){r-=w;if(r<0){k=n;break}}
      const next=W[k](ac.currentTime+.05);setTimeout(surf,Math.max(2500,next));return}catch(e){}}return _sf.apply(this,arguments)}}
  /* ---------- 風景の 音（たまに・小さく） ---------- */
  const H=()=>{try{return GH()}catch(e){return 12}},Mo=()=>new Date().getMonth()+1;
  const SN={
   gull(t){const o=outP(R(-.9,.9),1);const n=2+(Math.random()*3|0);for(let i=0;i<n;i++){const tt=t+i*R(.28,.45);tn(o,tt,R(.25,.4),{type:'triangle',f:R(1250,1500),f2:R(800,950),v:.006,a:.03,vib:40,vibF:R(18,26),lp:2600})}},
   tobi(t){const o=outP(R(-.7,.7),1);tn(o,t,.9,{f:2350,f2:2650,v:.0045,a:.12,rel:.7,lp:4000});tn(o,t+1,1.1,{f:2500,f2:1500,v:.004,a:.05,vib:180,vibF:11,rel:1})},
   horn(t){const o=outP(R(-.6,.6),1);[[98,.008],[147,.005],[196,.002]].forEach(([f,v])=>tn(o,t,3.4,{type:'sawtooth',f,v,a:.5,hold:2,rel:.9,lp:420}));},
   wind(t){const o=outP(R(-.4,.4));const d=R(4,6.5);nz(o,t,d,{f:R(300,450),f2:R(700,1000),q:.9,v:R(.012,.018),a:d*.45,rel:d*.55})},
   palm(t){const o=outP(R(.2,.8));const d=R(2.5,4);for(let i=0;i<14;i++){const tt=t+R(0,d);nz(o,tt,R(.08,.2),{type:'highpass',f:R(3000,5000),q:.5,v:R(.002,.005),a:.01})}},
   chime(t){const o=outP(R(-.5,.5));const sc=[2093,2349,2637,3136,3520];const n=2+(Math.random()*3|0);for(let i=0;i<n;i++){const f=pick(sc),tt=t+i*R(.18,.5);tn(o,tt,2.6,{f,v:.0035,a:.004,rel:2.5});tn(o,tt,1.8,{f:f*2.76,v:.0012,a:.004,rel:1.7})}},
   semi(t){const o=outP(R(-.8,-.2));const d=R(5,8);const s=ac.createBufferSource(),bp=ac.createBiquadFilter(),g=ac.createGain(),tg=ac.createGain(),l=ac.createOscillator(),lg=ac.createGain();s.buffer=buf();s.loop=true;bp.type='bandpass';bp.frequency.value=R(4800,6000);bp.Q.value=4;
     tg.gain.value=.5;l.frequency.value=R(50,80);lg.gain.value=.5;l.connect(lg).connect(tg.gain);env(g,t,d*.3,d*.4,d*.3,.006);s.connect(bp).connect(tg).connect(g).connect(o);s.start(t);s.stop(t+d+.2);l.start(t);l.stop(t+d+.2)},
   higurashi(t){const o=outP(R(-.8,.8));const n=5+(Math.random()*4|0);for(let i=0;i<n;i++){const tt=t+i*.16;tn(o,tt,.15,{f:4400-i*55,v:.004*(1-i/(n+2)),a:.005,vib:350,vibF:28,rel:.13})}},
   bell(t){const o=outP(R(-.4,.4),1,16000);const f=R(170,200);[[1,.009],[2.4,.004],[3.9,.0025],[5.4,.0012]].forEach(([m,v])=>tn(o,t,8,{f:f*m,v,a:.006,rel:7.9}))},
   owl(t){const o=outP(R(-.9,.9),1);const n=2+(Math.random()*2|0);for(let i=0;i<n;i++){const tt=t+i*R(.55,.8)+(i===n-1?.3:0);tn(o,tt,.45,{f:R(380,420),f2:R(340,370),v:.007,a:.1,rel:.33,lp:900})}},
   buoy(t){const o=outP(R(-.9,.9),1);const f=R(620,700);tn(o,t,3,{f,v:.0035,a:.004,rel:2.9});tn(o,t,2,{f:f*2.41,v:.0012,a:.004,rel:1.9});if(Math.random()<.5){tn(o,t+R(2.2,3),3,{f,v:.0028,a:.004,rel:2.9})}},
   plane(t){const o=outP(R(-1,1));const d=R(12,16);nz(o,t,d,{type:'lowpass',f:180,f2:260,q:.5,v:.01,a:d*.5,rel:d*.5})},
   boat(t){const o=outP(-.9);const d=R(8,11);const s=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter();s.type='sawtooth';s.frequency.setValueAtTime(R(62,70),t);s.frequency.linearRampToValueAtTime(R(55,60),t+d);fl.type='lowpass';fl.frequency.value=220;env(g,t,d*.45,0,d*.55,.004);
     let n=g;if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.setValueAtTime(-.9,t);p.pan.linearRampToValueAtTime(.9,t+d);g.connect(p);n=p}s.connect(fl).connect(g);n.connect(o);s.start(t);s.stop(t+d+.1)},
   crackle(t){const o=outP(R(-.15,.15));const n=2+(Math.random()*4|0);for(let i=0;i<n;i++)nz(o,t+R(0,1.2),.04,{f:R(1500,3500),q:1.5,v:R(.006,.014),a:.002,rel:.035})}};
  const lastAt={};
  function choose(){const h=H(),m=Mo(),night=h>=19||h<5,day=h>=6&&h<17,dusk=h>=16&&h<19.5,sum=m>=6&&m<=8;const L=[];
    if(!S.fireOff)L.push(['crackle',5]);
    L.push(['wind',4],['buoy',2],['plane',1]);
    if(day||dusk)L.push(['gull',6],['tobi',3],['palm',3],['boat',1.5]);
    if(day&&sum)L.push(['semi',2.5]);
    if(dusk&&(m>=7&&m<=9))L.push(['higurashi',4]);
    if(dusk)L.push(['bell',1.2]);
    if(sum||m===5||m===9)L.push(['chime',2.5]);
    if(night)L.push(['owl',2.5]);
    L.push(['horn',.8]);
    const now=Date.now();const cand=L.filter(([k])=>now-(lastAt[k]||0)>(k==='crackle'?20000:k==='bell'||k==='horn'||k==='plane'?240000:90000));
    if(!cand.length)return null;const T=cand.reduce((a,b)=>a+b[1],0);let r=Math.random()*T;for(const[k,w]of cand){r-=w;if(r<0)return k}return cand[0][0]}
  const busyFx=()=>document.body.classList.contains('miracle')||!!document.querySelector('.rv2Big,#jpPop,#ccRain,#lotPop,#rkFx,#susCut.on');
  function sceneTick(){let next=R(22000,48000);try{if(ok()&&!S.moonOn&&!busyFx()){const k=choose();if(k){lastAt[k]=Date.now();SN[k](ac.currentTime+.05);window._lastScene=k;if(k==='crackle')next=R(14000,30000)}}}catch(e){}setTimeout(sceneTick,next)}
  setTimeout(sceneTick,R(12000,20000));
  window._SN=SN;window._W=W;
})();
(()=>{const R=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>a+(Math.random()*(b-a+1)|0);
  const ok=()=>{try{return ac&&waveBus&&S.sound&&S.waves&&!document.hidden&&!S.moonOn}catch(e){return false}};
  const outP=(pan,v=1,life=20000)=>{const g=ac.createGain();g.gain.value=v;if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));g.connect(p);p.connect(waveBus)}else g.connect(waveBus);setTimeout(()=>{try{g.disconnect()}catch(e){}},life);return g};
  const env=(g,t,a,hold,rel,v)=>{g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.0002,v),t+a);g.gain.setValueAtTime(Math.max(.0002,v),t+a+hold);g.gain.exponentialRampToValueAtTime(.0001,t+a+hold+rel)};
  const nz=(o,t,dur,{type='bandpass',f=1000,f2,q=.7,v=.01,a=.02,hold=0,rel,am,amD=.5})=>{const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();s.buffer=NB;s.loop=true;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);fl.Q.value=q;
    env(g,t,a,hold,rel??Math.max(.02,dur-a-hold),v);let n=fl;s.connect(fl);if(am){const tg=ac.createGain(),l=ac.createOscillator(),lg=ac.createGain();tg.gain.value=1-amD;l.frequency.value=am;lg.gain.value=amD;l.connect(lg).connect(tg.gain);fl.connect(tg);n=tg;l.start(t);l.stop(t+dur+.2)}
    n.connect(g).connect(o);s.start(t,R(0,1.5));s.stop(t+dur+.2)};
  const tn=(o,t,dur,{type='sine',f=440,f2,f3,v=.01,a=.01,hold=0,rel,vib=0,vibF=6,lp,bp})=>{const s=ac.createOscillator(),g=ac.createGain();s.type=type;s.frequency.setValueAtTime(f,t);if(f2&&f3){s.frequency.exponentialRampToValueAtTime(f2,t+dur*.5);s.frequency.exponentialRampToValueAtTime(f3,t+dur)}else if(f2)s.frequency.exponentialRampToValueAtTime(f2,t+dur);
    if(vib){const l=ac.createOscillator(),lg=ac.createGain();l.frequency.value=vibF;lg.gain.value=vib;l.connect(lg).connect(s.frequency);l.start(t);l.stop(t+dur+.1)}
    env(g,t,a,hold,rel??Math.max(.02,dur-a-hold),v);let n=s;if(lp){const fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;s.connect(fl);n=fl}if(bp){const fl=ac.createBiquadFilter();fl.type='bandpass';fl.frequency.value=bp;fl.Q.value=2;n.connect(fl);n=fl}n.connect(g).connect(o);s.start(t);s.stop(t+dur+.1)};
  const H=()=>{try{return GH()}catch(e){return 12}},Mo=()=>new Date().getMonth()+1;
  // 潮：ゲーム内の 時間で ゆっくり 満ち引き（約12.4時間 周期）
  const tide=()=>Math.cos(2*Math.PI*((H()+3)/12.42));window.tideNow=tide;
  /* ---------- 音の 部品 ---------- */
  const X={
   // 海そのもの
   tidepool(t){const o=outP(R(.2,.8));const n=ri(10,22);for(let i=0;i<n;i++){const tt=t+R(0,3.2);tn(o,tt,R(.03,.07),{f:R(900,1800),f2:R(1900,3400),v:R(.0015,.0035),a:.003})}},
   foam(t){const o=outP(R(-.4,.4),1.4);const d=R(3.5,5);const n=ri(60,110);for(let i=0;i<n;i++){const tt=t+Math.pow(Math.random(),.7)*d;nz(o,tt,.025,{type:'highpass',f:R(5000,8000),q:.7,v:R(.002,.005)*(1-(tt-t)/d*.7),a:.002,rel:.022})}},
   sand(t){const o=outP(R(-.6,.6));const d=R(3.5,5.5);nz(o,t,d,{f:R(2500,3800),q:1.2,v:R(.004,.007),a:d*.35,rel:d*.6,am:R(5,9),amD:.6})},
   reef(t){const o=outP(R(-.9,.9),1);nz(o,t,3.5,{type:'lowpass',f:150,f2:70,q:.4,v:R(.03,.045),a:.18,rel:3.2});nz(o,t+.05,2.2,{type:'lowpass',f:600,f2:250,v:.008,a:.15,rel:2})},
   // 生き物
   dolphin(t){const o=outP(R(-.7,.7),1);const n=ri(2,4);let x=t;for(let i=0;i<n;i++){const d=R(.25,.55),up=Math.random()<.5;tn(o,x,d,{f:up?R(3500,4500):R(6000,7000),f2:up?R(6000,7200):R(3600,4400),v:.0028,a:.02,vib:R(80,200),vibF:R(9,16),bp:5000});x+=d+R(.08,.25)}
     const cs=x+R(.1,.3),cn=ri(10,22),rate=R(18,35);for(let i=0;i<cn;i++)nz(o,cs+i/rate,.008,{f:R(4500,6500),q:2,v:.004,a:.001,rel:.007})},
   whale(t){const o=outP(R(-.5,.5),1,26000);let x=t;const n=ri(2,3);for(let i=0;i<n;i++){const d=R(2.2,3.6);const b=R(150,230);tn(o,x,d,{f:b,f2:b*R(1.4,1.9),f3:b*R(.75,.95),v:.0065,a:.6,rel:d*.55,vib:R(3,8),vibF:R(3,5),lp:700});tn(o,x,d,{f:b*2,f2:b*R(2.6,3.4),f3:b*1.6,v:.0018,a:.7,rel:d*.5,lp:900});x+=d+R(.8,1.8)}},
   fishjump(t){const o=outP(R(-.6,.6));nz(o,t,.3,{f:R(1000,1500),q:.8,v:R(.012,.018),a:.004,rel:.28});for(let i=0;i<ri(3,6);i++)tn(o,t+R(.08,.5),.08,{f:R(1100,2000),f2:R(2000,3000),v:.002,a:.003})},
   crab(t){const o=outP(R(-.8,.8));let x=t;for(let i=0;i<ri(8,16);i++){nz(o,x,.012,{f:R(2500,4200),q:3,v:R(.0025,.004),a:.001,rel:.011});x+=R(.035,.09)}},
   umineko(t){const o=outP(R(-.9,.9),1);for(let i=0;i<ri(2,3);i++){const tt=t+i*R(.45,.7);tn(o,tt,R(.35,.5),{type:'triangle',f:R(780,860),f2:R(1000,1100),f3:R(700,780),v:.005,a:.05,vib:15,vibF:8,lp:2200})}},
   // 船・港
   pompon(t){const o=outP(R(-.9,-.4),1,16000);const d=R(7,10),rate=R(3.6,4.6),n=Math.floor(d*rate);for(let i=0;i<n;i++){const tt=t+i/rate,p=i/n,lv=Math.sin(Math.PI*p);if(lv<.05)continue;tn(o,tt,.12,{f:R(70,80),f2:55,v:.007*lv,a:.004,rel:.11,lp:240});nz(o,tt,.06,{type:'lowpass',f:400,v:.0025*lv,a:.003,rel:.05})}},
   chain(t){const o=outP(R(-.8,.8),1);const d=R(1.2,2),n=ri(14,24);for(let i=0;i<n;i++){const tt=t+i*(d/n)*R(.7,1.3);nz(o,tt,.03,{f:R(2600,3600),q:6,v:.003,a:.001,rel:.028});if(Math.random()<.3)tn(o,tt,.15,{f:R(1900,2800),v:.0012,a:.002})}},
   creak(t){const o=outP(R(-.6,.6));for(let i=0;i<ri(1,2);i++){const tt=t+i*R(.9,1.5),d=R(.5,.9);tn(o,tt,d,{type:'sawtooth',f:R(110,150),f2:R(160,210),v:.0035,a:.08,vib:R(10,25),vibF:R(25,40),bp:R(700,1000),rel:d*.5})}},
   foghorn(t){const o=outP(R(-.5,.5),1,16000);const n=Math.random()<.5?1:2;for(let i=0;i<n;i++){const tt=t+i*5;[[88,.012],[132,.006],[176,.002]].forEach(([f,v])=>tn(o,tt,3.8,{type:'sawtooth',f,v,a:.6,hold:2.2,rel:1,lp:300}))}},
   // 天気
   raindrop(t,k=1){const o=outP(R(-.3,.3),.45);const n=ri(10,18)*k;for(let i=0;i<n;i++){const tt=t+R(0,4);nz(o,tt,.02,{type:'highpass',f:R(3000,6000),v:R(.002,.004),a:.001,rel:.018});if(Math.random()<.35)tn(o,tt+.005,.05,{f:R(1500,2600),f2:R(2600,3800),v:.0015,a:.003})}},
   thunder(t){const o=outP(R(-.8,.8),1,16000);const d=R(5,7.5);nz(o,t,d,{type:'lowpass',f:R(160,240),f2:60,q:.5,v:R(.025,.035),a:R(.3,.8),rel:d*.85,am:R(2,4),amD:.6});nz(o,t+R(.2,.6),d*.6,{type:'lowpass',f:500,f2:150,v:.006,a:.3,rel:d*.5})},
   stormy(t){const o=outP(R(-.4,.4),1.3);const d=R(4,6);nz(o,t,d,{f:R(500,700),f2:R(900,1300),q:.6,v:.012,a:d*.4,rel:d*.6,am:R(.6,1.2),amD:.7})},
   // 季節
   crowd(t){const o=outP(R(-.9,-.5),1);const d=R(6,9);[[480,4.2],[1050,5.3],[1800,6.7],[2700,3.6]].forEach(([f,am])=>nz(o,t,d,{f:f*R(.9,1.1),q:2.5,v:.0018,a:d*.35,rel:d*.55,am:am*R(.8,1.2),amD:.8}))},
   winter(t){if(typeof oneWave!=='function')return;oneWave(t,R(9,11.5),R(.38,.46),R(.08,.095),R(.02,.027),R(1200,1500),R(.015,.025))}};
  window._X=X;
  /* ---------- 波の 選び方：潮・季節・天気で 変わる ---------- */
  {const _sf=surf;surf=function(){if(!amb)return;try{if(S.waves&&!document.hidden&&Math.random()<.3&&window._W){const td=tide(),m=Mo(),win=m===12||m<=2,rain=typeof rainKind==='function'?rainKind():0;
      const L=[['foamW',6],['reef',2+(td>0?2:0)],['tideW',td<-.2?7:1.5],['winter',win?4:0],['stormW',0],['setW',td>.4?1.5:.4],['farW',td<-.3?6:2]];const T=L.reduce((a,b)=>a+b[1],0);let r=Math.random()*T,k='foamW';for(const[n,w]of L){r-=w;if(r<0){k=n;break}}
      const t=ac.currentTime+.05;let next=6000;
      if(k==='foamW'){next=_W.backwash(t);X.foam(t+R(3,4.5))}
      else if(k==='reef'){next=_W.lap(t);X.reef(t+R(.5,2))}
      else if(k==='tideW'){next=_W.lap(t);X.tidepool(t+R(1,3))}
      else if(k==='winter'){X.winter(t);next=R(9000,12000)}
      else if(k==='stormW'){next=_W.rock(t);X.stormy(t+R(.5,2))}
      else if(k==='setW'){next=_W.set(t)}
      else{next=_W.far(t)}
      setTimeout(surf,Math.max(3000,next));return}}catch(e){}return _sf.apply(this,arguments)}}
  // 満ち潮は 少し 近く・大きく、引き潮は 遠く・小さく
  setInterval(()=>{try{if(!amb||!ac||ducked)return;const td=tide();amb.g.gain.setTargetAtTime(S.waves?.02*(1+.25*td):0,ac.currentTime,6)}catch(e){}},15000);
  /* ---------- たまに 聞こえる 海の 音 ---------- */
  const lastAt={};
  function choose(){const h=H(),m=Mo(),night=h>=19||h<5,day=h>=6&&h<17,morn=h>=4.5&&h<9,dusk=h>=16&&h<19.5,sum=m>=7&&m<=8,rain=typeof rainKind==='function'?rainKind():0,td=tide();const L=[];
    L.push(['fishjump',3],['chain',.8],['creak',1.2],['sand',1.5]);
    if(td<-.2)L.push(['tidepool',4]);
    if(day||dusk)L.push(['umineko',3],['crab',2.5],['dolphin',.8]);
    if(night)L.push(['whale',.7]);
    if(morn)L.push(['pompon',4],['foghorn',1.2]);else L.push(['pompon',.6]);
    if(night)L.push(['foghorn',.5]);
    if(sum&&day)L.push(['crowd',2.5]);
    if(sum&&dusk&&!rain)L.push(['thunder',.3]);
    
    const now=Date.now(),gap={whale:420000,dolphin:300000,thunder:300000,foghorn:300000,pompon:240000,crowd:200000,chain:200000};
    const cand=L.filter(([k,w])=>w>0&&now-(lastAt[k]||0)>(gap[k]||100000));if(!cand.length)return null;const T=cand.reduce((a,b)=>a+b[1],0);let r=Math.random()*T;for(const[k,w]of cand){r-=w;if(r<0)return k}return cand[0][0]}
  const busyFx=()=>document.body.classList.contains('miracle')||!!document.querySelector('.rv2Big,#jpPop,#ccRain,#lotPop,#rkFx,#susCut.on');
  function tick(){let next=R(45000,85000);try{if(ok()&&!busyFx()){const k=choose();if(k){lastAt[k]=Date.now();X[k](ac.currentTime+.05);window._lastSea=k}}}catch(e){}setTimeout(tick,next)}
  setTimeout(tick,R(30000,45000));
  // 雨：海面に 落ちる 雨つぶ ／ 雷雨は ときどき 遠雷
  setInterval(()=>{try{if(!ok())return;const rk=typeof rainKind==='function'?rainKind():0;if(!rk)return;if(Math.random()<.12)X.raindrop(ac.currentTime+.05,.5);if(rk>=3&&Math.random()<.03&&Date.now()-(lastAt.thunder||0)>60000){lastAt.thunder=Date.now();X.thunder(ac.currentTime+R(1,3))}}catch(e){}},4500);
  /* ---------- 背景イベントと 音を 合わせる ---------- */
  const EVS={dolphins:[['dolphin',1.2],['dolphin',4.5]],whale:[['whale',1.5]],mist:[['foghorn',2]],fishboat:[['pompon',.8]],fishing:[['fishjump',3]],ship:[['chain',2.5]],pirate:[['creak',1],['chain',3]],flyfish:[['fishjump',.6],['fishjump',1.4],['fishjump',2.1]],
    crab:[['crab',.6],['crab',2.2]],turtle:[['fishjump',2.5]],jelly:[['tidepool',1]],farthunder:[['thunder',.8]],sunshower:[['raindrop',.3],['raindrop',4]],seaplane:[['foam',4]],mermaid:[['fishjump',1],['whale',3]],bottle:[['tidepool',1.2]]};
  {const _ge=grantEvent;grantEvent=function(name){try{const L=EVS[name];if(L&&ok())L.forEach(([k,d])=>{lastAt[k]=Date.now();X[k](ac.currentTime+d)})}catch(e){}return _ge.apply(this,arguments)}}
})();
{const _av=ambVoice;ambVoice=function(){const before=ambNext;const r=_av.apply(this,arguments);try{if(ambNext!==before){const now=performance.now();if(ambNext>now)ambNext=now+(ambNext-now)*5}}catch(e){}return r}}
(()=>{const R=(a,b)=>a+Math.random()*(b-a);
  /* ① 響き：リバーブ ＋ ステレオ ディレイ ＋ やわらかい コンプ／音色の 整え */
  let FXN=null;
  function impulse(sec,decay){const n=Math.floor(ac.sampleRate*sec),b=ac.createBuffer(2,n,ac.sampleRate);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++){const x=i/n;d[i]=(Math.random()*2-1)*Math.pow(1-x,decay)*(i<ac.sampleRate*.012?i/(ac.sampleRate*.012):1)}}return b}
  function buildFx(){if(FXN)return FXN;const inp=ac.createGain();
    const hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=45;
    const warm=ac.createBiquadFilter();warm.type='lowshelf';warm.frequency.value=220;warm.gain.value=1.5;
    const air=ac.createBiquadFilter();air.type='highshelf';air.frequency.value=7000;air.gain.value=-2.5;
    const comp=ac.createDynamicsCompressor();comp.threshold.value=-20;comp.knee.value=18;comp.ratio.value=2.5;comp.attack.value=.012;comp.release.value=.25;
    const mk=ac.createGain();mk.gain.value=.92;
    inp.connect(hp).connect(warm).connect(air);air.connect(comp).connect(mk).connect(musOut);
    // リバーブ
    const rv=ac.createConvolver();rv.buffer=impulse(2.8,2.6);const rvLP=ac.createBiquadFilter();rvLP.type='lowpass';rvLP.frequency.value=4200;const rvG=ac.createGain();rvG.gain.value=.26;
    const pre=ac.createDelay(.1);pre.delayTime.value=.022;air.connect(pre).connect(rv).connect(rvLP).connect(rvG).connect(comp);
    // ステレオ ディレイ（付点8分）
    const dl=ac.createDelay(2),dr=ac.createDelay(2),fb=ac.createGain(),dLP=ac.createBiquadFilter(),dG=ac.createGain();fb.gain.value=.28;dLP.type='lowpass';dLP.frequency.value=2600;dG.gain.value=.1;
    let mg=null;try{mg=ac.createChannelMerger(2)}catch(e){}
    air.connect(dLP);dLP.connect(dl);dl.connect(dr);dr.connect(fb).connect(dl);
    if(mg){dl.connect(mg,0,0);dr.connect(mg,0,1);mg.connect(dG)}else{dl.connect(dG);dr.connect(dG)}dG.connect(comp);
    FXN={inp,dl,dr,rvG,dG};return FXN}
  function setDelay(bpm){try{if(!FXN)return;const q=60/bpm,t=q*.75;FXN.dl.delayTime.setTargetAtTime(t,ac.currentTime,.05);FXN.dr.delayTime.setTargetAtTime(t,ac.currentTime,.05)}catch(e){}}
  {const _mb=mBus;mBus=function(){const was=MUS.bus;const b=_mb.apply(this,arguments);try{if(!b._fx){const f=buildFx();try{b.disconnect()}catch(e){}b.connect(f.inp);b._fx=1}}catch(e){}return b}}
  /* ② 人の 揺らぎ＆広がり：音ごとに 少しだけ タイミング・強さ・左右を 変える */
  {const _osc=osc;osc=function(type,f,t,d,v,dest,f2){try{if(MUS.on&&MUS.bus){t+=R(0,.007);v*=R(.84,1.08);if(MUS.soft)v*=MUS.soft;
      if((!dest||dest===MUS.bus)&&ac.createStereoPanner){const p=ac.createStereoPanner();const hi=f>500?Math.min(1,(f-500)/1500):0;p.pan.value=R(-.45,.45)*(.25+.75*hi);p.connect(MUS.bus);dest=p;setTimeout(()=>{try{p.disconnect()}catch(e){}},(d+1)*1000+400)}}}catch(e){}
    return _osc.call(this,type,f,t,d,v,dest,f2)}}
  /* ③ 曲の 展開：はじまりは 静かに → 盛り上がり → ときどき ブレイク → 終わりは そっと */
  const DR=['kick','snare','hat','ride','shaker'];
  DR.forEach(k=>{const _f=I[k];I[k]=function(){try{if(MUS.track)MUS.track._dr=1;if(MUS.drumMute)return}catch(e){}return _f.apply(this,arguments)}});
  {const _b=I.bass;I.bass=function(){try{if(MUS.bassMute)return}catch(e){}return _b.apply(this,arguments)}}
  {const _cs=chordSet;chordSet=function(tr,st){try{const b=st>>4,s=st%16,left=MUS.endAt-ac.currentTime;
      MUS.drumMute=b<2||(b%16===12||b%16===13)||left<7;MUS.bassMute=b===0&&s<8;MUS.soft=b===0?.8:(b%16===12||b%16===13)?.88:1;
      // フィル：8小節目の 終わりに 小さな 合図
      if(tr._dr&&b>=2&&b%8===7&&s>=12&&!(b%16===12||b%16===13)&&left>7){const t=MUS.next;if(s%2===0&&Math.random()<.8)_rawSnare(t+.002,.018+(s-12)*.006)}
      if(st===0)setDelay(tr.bpm||90)}catch(e){}return _cs.apply(this,arguments)}}
  let _rawSnare=()=>{};try{const sn0=I.snare;_rawSnare=(t,v)=>{const m=MUS.drumMute;MUS.drumMute=false;try{sn0(t,v)}catch(e){}MUS.drumMute=m}}catch(e){}
  /* ④ メロディ：くり返しと 変化、終わりは 落ち着く 音へ */
  {const _mo=motif;motif=function(len,base,scale,range=7){try{if(len<8||Math.random()<.15)return _mo.apply(this,arguments);const half=len/2;let idx=Math.floor(range/2);const A=[];
      const stepC=[-2,-1,-1,0,1,1,1,2];for(let i=0;i<half;i++){idx=Math.max(0,Math.min(range,idx+stepC[Math.random()*stepC.length|0]));A.push(idx)}
      const B=A.map((x,i)=>i<half/2?x:Math.max(0,Math.min(range,x+[-1,0,0,1][Math.random()*4|0])));
      const home=Math.floor(range/2)-Math.floor(range/2)%scale.length;B[half-1]=Math.random()<.6?home:Math.min(range,home+2);A[half-1]=Math.min(range,A[half-1]+(Math.random()<.5?1:0));
      const toN=(x,i)=>((i%4===3&&Math.random()<.35)||(i!==0&&Math.random()<.08))?null:base+Math.floor(x/scale.length)*12+scale[x%scale.length];
      return A.map(toN).concat(B.map((x,i)=>i===half-1?base+Math.floor(x/scale.length)*12+scale[x%scale.length]:toN(x,i)))}catch(e){return _mo.apply(this,arguments)}}}
  /* ⑤ 始まりと 終わりを なめらかに */
  {const _sm=startMusic;startMusic=function(id,sec){const r=_sm.apply(this,arguments);try{MUS.bus.gain.cancelScheduledValues(ac.currentTime);MUS.bus.gain.setValueAtTime(.0001,ac.currentTime);MUS.bus.gain.exponentialRampToValueAtTime(.8,ac.currentTime+3);setDelay(MUS.track.bpm||90)}catch(e){}return r}}
})();
(()=>{const R=(a,b)=>a+Math.random()*(b-a);
  const out=(pan=0)=>{const vg=ac.createGain();vg.gain.value=(MUS.track&&MUS.track.vol)||1;if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=pan;vg.connect(p);p.connect(MUS.bus);setTimeout(()=>{try{p.disconnect()}catch(e){}},14000)}else vg.connect(MUS.bus);setTimeout(()=>{try{vg.disconnect()}catch(e){}},14000);return vg};
  const envL=(g,t,a,d,v,rel)=>{g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+Math.max(a,d-rel));g.gain.linearRampToValueAtTime(.0001,t+d)};
  const hz=m=>mf(m);
  // ---- 楽器 ----
  I.vln=function(m,t,d,v=.03,pan=R(-.1,.15)){try{const o=out(pan),f=ac.createBiquadFilter(),g=ac.createGain();f.type='lowpass';f.frequency.value=2300;f.Q.value=.8;
    const bp=ac.createBiquadFilter();bp.type='peaking';bp.frequency.value=1100;bp.gain.value=4;bp.Q.value=1;
    [0,1].forEach(k=>{const s=ac.createOscillator();s.type='sawtooth';s.frequency.value=hz(m);s.detune.value=k?6:-4;const lf=ac.createOscillator(),lg=ac.createGain();lf.frequency.value=R(4.8,5.6);lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(hz(m)*.0065,t+Math.min(.6,d*.4));lf.connect(lg).connect(s.frequency);
      s.connect(f);s.start(t);s.stop(t+d+.05);lf.start(t);lf.stop(t+d+.05)});f.connect(bp).connect(g).connect(o);envL(g,t,Math.min(.18,d*.3),d,v,Math.min(.35,d*.35))}catch(e){}};
  I.str=function(ns,t,d,v=.008){try{ns.forEach((m,i)=>{const o=out((i-ns.length/2)*.25),f=ac.createBiquadFilter(),g=ac.createGain();f.type='lowpass';f.frequency.value=1500;[-7,7].forEach(dt=>{const s=ac.createOscillator();s.type='sawtooth';s.frequency.value=hz(m);s.detune.value=dt;s.connect(f);s.start(t);s.stop(t+d+.05)});f.connect(g).connect(o);envL(g,t,d*.3,d,v,d*.3)})}catch(e){}};
  I.cello=function(m,t,d,v=.05){try{const o=out(-.15),f=ac.createBiquadFilter(),g=ac.createGain();f.type='lowpass';f.frequency.value=650;const s=ac.createOscillator(),s2=ac.createOscillator();s.type='sawtooth';s2.type='sine';s.frequency.value=hz(m);s2.frequency.value=hz(m);
    s.connect(f);s2.connect(f);f.connect(g).connect(o);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.04);g.gain.linearRampToValueAtTime(v*.6,t+d*.5);g.gain.linearRampToValueAtTime(.0001,t+d);s.start(t);s2.start(t);s.stop(t+d+.05);s2.stop(t+d+.05)}catch(e){}};
  I.pf=function(m,t,v=.04,d=2.2,pan=R(-.2,.2)){try{const o=out(pan),g=ac.createGain(),f=ac.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(Math.min(6000,hz(m)*6),t);f.frequency.exponentialRampToValueAtTime(Math.max(300,hz(m)*1.5),t+d);
    [[1,1,'triangle'],[2,.35,'sine'],[3,.12,'sine'],[1.003,.4,'sine']].forEach(([k,a,ty])=>{const s=ac.createOscillator();s.type=ty;s.frequency.value=hz(m)*k;const sg=ac.createGain();sg.gain.value=a;s.connect(sg).connect(f);s.start(t);s.stop(t+d+.05)});
    f.connect(g).connect(o);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(v*.35,t+.35);g.gain.exponentialRampToValueAtTime(.0001,t+d)}catch(e){}};
  I.acc=function(m,t,d,v=.02,pan=.15){try{const o=out(pan),f=ac.createBiquadFilter(),g=ac.createGain(),tr=ac.createGain(),lf=ac.createOscillator(),lg=ac.createGain();f.type='lowpass';f.frequency.value=2100;tr.gain.value=.8;lf.frequency.value=5.8;lg.gain.value=.2;lf.connect(lg).connect(tr.gain);
    [[0,'sawtooth'],[9,'square'],[-8,'sawtooth']].forEach(([dt,ty],i)=>{const s=ac.createOscillator();s.type=ty;s.frequency.value=hz(m);s.detune.value=dt;const sg=ac.createGain();sg.gain.value=i===1?.35:.6;s.connect(sg).connect(f);s.start(t);s.stop(t+d+.05)});
    f.connect(tr).connect(g).connect(o);envL(g,t,.03,d,v,Math.min(.12,d*.3));lf.start(t);lf.stop(t+d+.05)}catch(e){}};
  // 音階の 上下
  const DMAJ=[2,4,6,7,9,11,1];const step=(m,dir,sc)=>{let x=m;for(let k=0;k<12;k++){x+=dir;if(sc.includes(((x%12)+12)%12))return x}return m+dir};
  /* ① 弦楽「海辺のアリア」（G線上のアリア風：オクターブで 歩く ベース・長く 歌う バイオリン） */
  TRACKS.aria={vol:.8,name:'弦楽「海辺のアリア」',bpm:52,cc:[[62,66,69],[61,64,69],[59,62,66],[57,61,64],[55,59,62],[54,57,62],[52,55,59,62],[57,61,64,67]],bs:[38,37,35,33,31,30,28,33],
    init(){this.prev=78;this.cur=78;this.hold=false},
    play(st,t,spb){const b=st>>4,s=st%16,i=b%8,c=this.cc[i],r=this.bs[i];
      if(s%2===0)I.cello(r+((s/2)%2?12:0),t,spb*2*.92,(s%4===0?.05:.04));
      if(s===0)I.str(c.map(n=>n-12),t,spb*16*1.03,.006);
      if(s===0){if(this.hold==='next'){this.hold='res';return}
        const cand=[];c.forEach(n=>{for(let o=0;o<3;o++){const m=(n%12)+60+o*12;if(m>=69&&m<=86)cand.push(m)}});cand.sort((a,z)=>Math.abs(a-(this.prev-1.5))-Math.abs(z-(this.prev-1.5)));
        const tg=cand[Math.random()<.7?0:Math.min(1,cand.length-1)];this.cur=tg;this.prev=tg;
        const sus=i%4===3&&Math.random()<.6;I.vln(tg,t,spb*(sus?19:11.5),.032);this.hold=sus?'next':false}
      if(s===4&&this.hold==='res'){const d=step(this.cur,-1,DMAJ);I.vln(d,t,spb*7.5,.028);this.cur=d;this.prev=d;this.hold=false}
      if(this.hold===false){if(s===12){I.vln(step(this.cur,1,DMAJ),t,spb*1.1,.026)}if(s===13){I.vln(this.cur,t,spb*1.1,.024)}if(s===14){const d=step(this.cur,-1,DMAJ);I.vln(d,t,spb*2.2,.026);this.prev=d+1}}}};
  /* ② ピアノと弦「浜辺のカノン」（カノン進行：D→A→Bm→F#m→G→D→G→A） */
  TRACKS.canon={vol:.75,name:'ピアノと弦「浜辺のカノン」',bpm:60,cc:[[62,66,69],[61,64,69],[62,66,71],[61,66,69],[62,67,71],[62,66,69],[62,67,71],[61,64,69]],bs:[38,33,35,30,31,26,31,33],
    top:[78,76,74,73,71,69,71,73],
    play(st,t,spb){const b=st>>4,s=st%16,k=(b*2+(s>=8?1:0))%8,c=this.cc[k],r=this.bs[k],sec=Math.floor(b/4)%5,ss=s%8;
      if(ss===0){I.cello(r,t,spb*8*.98,.05);I.cello(r+12,t,spb*8*.98,.02)}
      if(s%2===0){const arp=[c[0]-12,c[1]-12,c[2]-12,c[1]-12][(s/2)%4];I.pf(arp,t,.016,1.2,-.25)}
      if(sec===0&&ss===0)I.vln(this.top[k],t,spb*7.6,.026);
      if(sec===1){if(ss===0||ss===4){const m=ss?step(this.top[k],-1,DMAJ):this.top[k];I.pf(m,t,.04,2)}if(ss===0)I.str(c,t,spb*8,.005)}
      if(sec===2&&s%2===0){const m=[c[0]+12,c[1]+12,c[2]+12,c[1]+12][(ss/2)%4];I.pf(m,t,.03,1.4,.25)}
      if(sec===3){if(ss===0)I.vln(this.top[k]+12,t,spb*3.8,.022);if(ss===4)I.vln(step(this.top[k]+12,-1,DMAJ),t,spb*3.8,.02);if(s%2===1)I.bell(c[(s>>1)%3]+24,t,.008,.6)}
      if(sec===4){if(ss===0){I.str(c,t,spb*8,.007);I.pf(this.top[k],t,.035,3)}}}};
  /* ③ ピアノ「凪のジムノペディ」（ゆっくり 三拍子・ふたつの 和音を 行き来） */
  TRACKS.gymno={vol:1.9,name:'ピアノ「凪のジムノペディ」',bpm:76,init(){this.prev=78;this.mel=[]},
    play(st,t,spb){const bar=Math.floor(st/12),s=st%12;const G=bar%2===0;const bass=G?43:38,ch=G?[59,62,66]:[57,61,64];
      if(s===0)I.pf(bass,t,.04,3.2,-.3);if(s===4)ch.forEach(n=>I.pf(n,t,.018,2.6,.15));
      if(bar>=4&&bar%16<14){if(s===4&&Math.random()<.85){const sc=[66,69,71,73,74,76,78,79,81];let i=sc.indexOf(this.prev);if(i<0)i=6;i=Math.max(0,Math.min(sc.length-1,i+[-2,-1,-1,0,1,1][Math.random()*6|0]));this.prev=sc[i];I.pf(this.prev,t,.04,spb*12*.95+.6,.05)}
        if(s===8&&Math.random()<.25){I.pf(step(this.prev,-1,DMAJ),t,.03,spb*4+.5,.05)}}}};
  /* ④ ピアノ「夜想曲・月の砂浜」（大きく ひろがる 左手・歌う 右手） */
  const EB=[3,5,7,8,10,0,2];
  TRACKS.nocturne={vol:2,name:'ピアノ「夜想曲・月の砂浜」',bpm:58,cc:[[51,55,58],[48,51,55],[44,48,51],[46,50,53,56],[43,46,51],[44,48,51],[41,44,48,51],[46,50,53,56]],
    init(){this.prev=79;this.cur=79},
    play(st,t,spb){const b=st>>4,s=st%16,c=this.cc[b%8];const lh=[c[0]-12,c[0]-5,c[1],c[2],c[0]+12,c[2],c[1],c[0]-5];if(s%2===0)I.pf(lh[(s/2)%8],t,.017,1.6,-.25);
      if(s===0||(s===8&&Math.random()<.55)){const cand=[];c.forEach(n=>{for(let o=0;o<3;o++){const m=(n%12)+60+o*12;if(m>=70&&m<=87)cand.push(m)}});cand.sort((a,z)=>Math.abs(a-this.prev)-Math.abs(z-this.prev));
        const tg=cand[Math.random()<.6?0:Math.min(1,cand.length-1)];if(Math.random()<.3)I.pf(step(tg,1,EB),t-spb*.35,.018,.4,.2);I.pf(tg,t,.042,s?2.2:3,.15);this.cur=tg;this.prev=tg}
      if(s===12&&Math.random()<.6){const a=step(this.cur,Math.random()<.5?1:-1,EB);I.pf(a,t,.03,1,.15);if(Math.random()<.5)I.pf(step(a,-1,EB),t+spb*2,.028,1,.15)}}};
  /* ⑤ アコーディオン「港のワルツ」（ズン・チャッ・チャッ） */
  const AMI=[9,11,0,2,4,5,8];
  TRACKS.waltz={vol:1.9,name:'アコーディオン「港のワルツ」',bpm:138,ccw:[[57,60,64],[57,62,65],[56,59,62,64],[57,60,64],[53,57,60],[50,53,57],[52,56,59,62],[57,60,64]],bsw:[45,50,40,45,41,38,40,45],
    init(){this.mel=motif(16,69,[0,2,3,5,7,8,11],9);this.prev=72},
    play(st,t,spb){const bar=Math.floor(st/12),s=st%12,i=bar%8,c=this.ccw[i],r=this.bsw[i];
      if(s===0)I.bass(bar%2?r+7-12:r-12,t,spb*3.5,.1);if(s===4||s===8)c.forEach(n=>I.acc(n-12,t,spb*2.2,.006,-.2));
      if(bar>=2&&s%4===0){const m=this.mel[(bar*3+s/4)%16];if(m){let n=m;const p=((n%12)+12)%12;if(!AMI.includes(p))n=step(n,1,AMI);I.acc(n,t,spb*(s===0?3.6:3.4),.02,.2)}}
      if(bar%16===15&&s===0)this.mel=motif(16,69,[0,2,3,5,7,8,11],9)}};
  // ショップに 追加
  SHOP.push(
   {id:'m_aria',kind:'music',track:'aria',sec:180,price:300,ico:'🎻',name:'弦楽「海辺のアリア」',desc:'ゆったり 歩く ベースに のせて、バイオリンが 長く 歌う'},
   {id:'m_canon',kind:'music',track:'canon',sec:200,price:280,ico:'🎹',name:'ピアノと弦「浜辺のカノン」',desc:'あの なつかしい 和音の 流れが、少しずつ 姿を 変えて くり返す'},
   {id:'m_gymno',t:['dawn','morning','noon','evening'],kind:'music',track:'gymno',sec:150,price:200,ico:'🎹',name:'ピアノ「凪のジムノペディ」',desc:'ゆっくり 三拍子。ふたつの 和音を 行ったり 来たり'},
   {id:'m_nocturne',t:['sunset','night','dawn'],kind:'music',track:'nocturne',sec:180,price:240,ico:'🌙',name:'ピアノ「夜想曲・月の砂浜」',desc:'月明かりの 下で ひとり 弾く ピアノ'},
   {id:'m_waltz',t:['evening','sunset','night'],kind:'music',track:'waltz',sec:150,price:220,ico:'🪗',name:'アコーディオン「港のワルツ」',desc:'ちょっと 切ない 港町の 三拍子'});
  try{Object.assign(MUMS,{mus_aria:['心が 洗われる…','バイオリン、泣いてる','時間が ゆっくりに なった','ええ曲や…'],mus_canon:['この 和音、なつかしい','結婚式みたい','何回 聞いても ええな','だんだん 盛り上がる'],mus_gymno:['ぼーっと できる','何も 考えたくない 午後','ゆらゆら…'],mus_nocturne:['月が 弾いてる みたい','しっとり…','夜に ぴったり'],mus_waltz:['踊りたく なる','港の 酒場みたい','ちょっと 切ない']});
   Object.assign(EMO,{mus_aria:['🎻','🥹'],mus_canon:['🎹','💐'],mus_gymno:['🎹','☁️'],mus_nocturne:['🌙','🎹'],mus_waltz:['🪗','💃']});
   const _sm=startMusic;startMusic=function(id){const r=_sm.apply(this,arguments);try{if(MUMS['mus_'+id])say('mus_'+id,{delay:R(6000,12000)})}catch(e){}return r}}catch(e){}
})();
(()=>{const P={
  blue:{nm:'青い 炎',f:['200,235,255','110,180,255','60,110,235','30,50,140'],g:['70,130,255','120,180,255'],c:'170,210,255',e:'#9fd3ff',m:'fcBlue'},
  green:{nm:'みどりの 炎',f:['220,255,200','140,240,150','60,190,110','20,90,60'],g:['70,220,120','140,255,160'],c:'190,255,190',e:'#a8ffb8',m:'fcGreen'},
  purple:{nm:'むらさきの 炎',f:['240,215,255','200,150,255','150,80,230','70,30,120'],g:['170,90,255','210,150,255'],c:'220,190,255',e:'#d6a8ff',m:'fcPurple'},
  pink:{nm:'さくら色の 炎',f:['255,230,240','255,170,205','240,110,160','140,40,90'],g:['255,120,180','255,180,215'],c:'255,210,230',e:'#ffc0dc',m:'fcPink'},
  gold:{nm:'金色の 炎',f:['255,250,210','255,225,120','240,180,40','150,100,10'],g:['255,200,60','255,230,140'],c:'255,240,170',e:'#ffe680',m:'fcGold'},
  white:{nm:'しろい 炎',f:['255,255,255','230,240,255','190,205,235','100,110,140'],g:['200,215,255','235,240,255'],c:'240,245,255',e:'#ffffff',m:'fcWhite'}};
 let cur=null,until=0,next=Date.now()+(4+Math.random()*8)*60000,rb=null;
 function setPal(k){window.FIREPAL=k?P[k]:null;cur=k}
 function begin(){const m=new Date().getMonth()+1;const L=['blue','blue','green','purple','gold','white'];if(m>=3&&m<=4)L.push('pink','pink','pink');const rare=Math.random()<.12;
   if(rare){cur='rainbow';const ks=Object.keys(P);let i=0;rb=setInterval(()=>{window.FIREPAL=P[ks[i++%ks.length]]},1600);until=Date.now()+60000;say('fcRainbow',{n:2,delay:600,gap:1400});try{tone(1568,.4,'sine',.012);tone(2093,.5,'sine',.01,.1)}catch(e){}return}
   const k=L[Math.random()*L.length|0];setPal(k);until=Date.now()+(60+Math.random()*120)*1000;say(P[k].m,{delay:500});try{noise(.6,{v:.02,type:'bandpass',f:2400,f2:4800,q:.6,attack:.1});tone(k==='blue'?1319:1047,.6,'sine',.01,.1)}catch(e){}}
 function end(){if(rb){clearInterval(rb);rb=null}setPal(null);say('fcBack',{delay:300})}
 setInterval(()=>{try{const now=Date.now();if(cur&&now>until){end();next=now+(6+Math.random()*12)*60000;return}
   if(!cur&&now>next){next=now+(6+Math.random()*12)*60000;if(S.fireOff||document.hidden||S.moonOn||S.phase==='busy')return;begin()}}catch(e){}},5000);
 window.fireColorTest=k=>{if(k==='rainbow'){next=0;const r=Math.random;Math.random=()=>.01;try{begin()}finally{Math.random=r}}else{setPal(k);until=Date.now()+60000}};
 Object.assign(MUMS,{fcBlue:['炎が 青い…！','流木に 塩が しみてたんかな','青い 炎、きれい','ガスコンロみたいや','冷たそうで あったかい'],fcGreen:['みどりの 炎！？','銅が まざってたんかも','魔法みたい','なんか 呪文 唱えたくなる'],
  fcPurple:['むらさき色に なった','あやしい 雰囲気','占い師に なれそう','夜に 似合う 色'],fcPink:['さくら色の 炎…','春の 匂い','やさしい 色やな','花びら 燃えてるみたい'],
  fcGold:['金色に 光ってる','縁起 よさそう','お金が 増えそうな 色','キラキラしてる'],fcWhite:['真っ白な 炎','神聖な 感じ','月の 光みたい','しずかに 燃えてる'],
  fcRainbow:['炎が 七色に！？','なにこれ すごい','虹の 焚き火や','ずっと 見てられる'],fcBack:['いつもの 炎に もどった','やっぱり この色が 落ち着く','ふつうの 焚き火も ええな']});
 Object.assign(EMO,{fcBlue:['🔵','🔥'],fcGreen:['🟢','✨'],fcPurple:['🟣','🔮'],fcPink:['🌸','🔥'],fcGold:['🟡','✨'],fcWhite:['⚪','🌙'],fcRainbow:['🌈','🔥'],fcBack:['🔥','😊']});
})();
(()=>{const N=110,TAU=Math.PI*2;
  // 文字・絵文字の 形を 点に する
  const sampCache={};
  function sample(str,font,w=200,h=140,edge=false){const key=str+font+edge;if(sampCache[key])return sampCache[key];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font=font;g.fillText(str,w/2,h/2+4);
    let d;try{d=g.getImageData(0,0,w,h).data}catch(e){return null}const A=(x,y)=>x<0||y<0||x>=w||y>=h?0:d[(y*w+x)*4+3];let P=[];
    if(edge){for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(A(x,y)>140&&(A(x-1,y)<=140||A(x+1,y)<=140||A(x,y-1)<=140||A(x,y+1)<=140))P.push([x,y])}}
    else{for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){if(A(x,y)>140)P.push([x,y])}}
    if(P.length<20)return null;
    if(edge){// 輪郭を なぞる 順に 並べる（近い 点を つないでいく）
      const left=P.slice(),path=[left.pop()];while(left.length){const q=path[path.length-1];let bi=0,bd=1e9;for(let j=0;j<left.length;j++){const dx=left[j][0]-q[0],dy=left[j][1]-q[1],dd=dx*dx+dy*dy;if(dd<bd){bd=dd;bi=j}}path.push(left.splice(bi,1)[0])}P=path}
    let mx=0,my=0;P.forEach(p=>{mx+=p[0];my+=p[1]});mx/=P.length;my/=P.length;let sc=0;P.forEach(p=>{sc=Math.max(sc,Math.abs(p[0]-mx),Math.abs(p[1]-my)*1.15)});
    const out=[];for(let i=0;i<N;i++){const p=P[Math.floor((i+.5)/N*P.length)];out.push([(p[0]-mx)/sc,(p[1]-my)/sc])}
    if(!edge)out.sort((a,b)=>Math.atan2(a[1],a[0])-Math.atan2(b[1],b[0]));return sampCache[key]=out}
  const T=(s,f)=>()=>sample(s,f||'bold 110px sans-serif',200,140,true);
  const W=(s)=>()=>sample(s,'bold 52px "Hiragino Sans","Noto Sans JP",sans-serif',260,90);
  const lerpPoly=(P,i)=>{const per=i/N*(P.length-1),s=Math.floor(per),f=per-s,a=P[s],b=P[Math.min(P.length-1,s+1)];return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]};
  // 形の ライブラリ（i=点の番号, t=時間）
  const F={
   star:{c:'255,214,90',f:i=>{const P=[];for(let k=0;k<=10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?.42:1;P.push([Math.cos(a)*r,Math.sin(a)*r])}return lerpPoly(P,i)}},
   heart:{c:'255,110,170',f:i=>{const t=i/N*TAU;return[16*Math.pow(Math.sin(t),3)/17,-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17]}},
   diamond:{c:'255,160,70',f:i=>lerpPoly([[0,-1],[.7,0],[0,1],[-.7,0],[0,-1]],i)},
   ring:{c:'255,214,90',f:i=>{const a=i/N*TAU;return i%2?[Math.cos(a)*.95,Math.sin(a)*.95]:[Math.cos(a)*.6,Math.sin(a)*.6]}},
   spiral:{c:'rainbow',f:(i,t)=>{const q=i/N,a=q*TAU*3+t*.8;return[Math.cos(a)*q,Math.sin(a)*q]}},
   flower:{c:'255,150,200',f:(i,t)=>{const a=i/N*TAU,r=.35+.65*Math.abs(Math.cos(2.5*a));return[Math.cos(a+t*.2)*r,Math.sin(a+t*.2)*r]}},
   infinity:{c:'130,220,255',f:(i,t)=>{const a=i/N*TAU+t*.3,d=1+Math.sin(a)**2;return[Math.cos(a)/d*1.1,Math.sin(a)*Math.cos(a)/d*1.1]}},
   smile:{c:'255,230,90',f:i=>{if(i<60){const a=i/60*TAU;return[Math.cos(a),Math.sin(a)]}if(i<72){const a=(i-60)/12*TAU;return[-.35+Math.cos(a)*.1,-.3+Math.sin(a)*.12]}if(i<84){const a=(i-72)/12*TAU;return[.35+Math.cos(a)*.1,-.3+Math.sin(a)*.12]}const q=(i-84)/(N-85);const a=Math.PI*.15+q*Math.PI*.7;return[Math.cos(a)*.55,Math.sin(a)*.55+.05]}},
   moon:{c:'255,240,190',f:i=>{const q=i/N,D=Math.PI/180;if(q<.6){const a=(60+q/.6*240)*D;return[Math.cos(a),Math.sin(a)]}const a=(75+(q-.6)/.4*210)*D;return[.38+Math.cos(a)*.78,Math.sin(a)*.78]}},
   sphere:{c:'140,200,255',z:1,f:(i,t)=>{const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),a=i*2.39996+t*.9;return[Math.cos(a)*r*.9,y*.9,Math.sin(a)*r]}},
   helix:{c:'rainbow',z:1,f:(i,t)=>{const q=i/N,a=q*TAU*2.5+t*1.2+(i%2)*Math.PI;return[Math.cos(a)*.45,(q-.5)*2,Math.sin(a)]}},
   wave:{c:'90,200,255',f:(i,t)=>{const q=i/N;return[(q-.5)*2.2,Math.sin(q*TAU*1.5-t*2.5)*.35+(i%3-1)*.12]}},
   fireburst:{c:'rainbow',f:(i,t)=>{const a=i/N*TAU,r=.2+.8*((t*.55)%1);return[Math.cos(a)*r,Math.sin(a)*r]}},
   spade:{c:'150,190,255',pts:T('♠')},club:{c:'120,230,150',pts:T('♣')},suitD:{c:'255,90,110',pts:T('♦')},
   whale:{c:'110,170,255',pts:T('🐋','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   dolphin:{c:'130,210,255',pts:T('🐬','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   fish:{c:'255,170,80',pts:T('🐟','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   turtle:{c:'120,230,160',pts:T('🐢','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   crab:{c:'255,110,90',pts:T('🦀','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   cat:{c:'255,220,150',pts:T('🐱','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   boat:{c:'255,255,255',pts:T('⛵','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   palm:{c:'140,240,140',pts:T('🌴','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   rocket:{c:'255,200,120',pts:T('🚀','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   crown:{c:'255,215,80',pts:T('👑','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   clover:{c:'120,240,140',pts:T('🍀','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   n777:{c:'255,214,90',pts:W('777')},lucky:{c:'rainbow',pts:W('LUCKY')},thanks:{c:'255,180,210',pts:W('ありがとう')},umi:{c:'110,190,255',pts:W('海')},hoshi:{c:'255,230,120',pts:W('星')},jp:{c:'255,200,60',pts:W('JACKPOT')},
   // ---- v217 追加：動く 形 ----
   butterfly:{c:'255,150,230',f:(i,t)=>{const a=i/N*TAU*2,r=(Math.exp(Math.cos(a))-2*Math.cos(4*a)+Math.pow(Math.sin(a/12),5))*.26,fl=.55+.45*Math.abs(Math.sin(t*3.2));return[Math.sin(a)*r*fl,-Math.cos(a)*r*.9+.1]}},
   bird:{c:'200,235,255',f:(i,t)=>{const q=i/N,x=(q-.5)*2.2,fl=Math.sin(t*4.5);if(i<12){const a=i/12*TAU;return[Math.cos(a)*.08,Math.sin(a)*.05+.05]}return[x,-Math.pow(Math.abs(x),1.3)*.55*fl+Math.abs(x)*.1+Math.sin(x*3+t*4)*.04]}},
   jelly:{c:'210,160,255',f:(i,t)=>{if(i<55){const a=Math.PI+i/54*Math.PI,pu=1+Math.sin(t*2.4)*.08;return[Math.cos(a)*.6*pu,Math.sin(a)*.45*pu-.15]}const k=(i-55)%6,q=Math.floor((i-55)/6)/9;const x0=-.45+k*.18;return[x0+Math.sin(q*6-t*3+k)*.08*(1+q),-.1+q*1.05]}},
   cube:{c:'120,240,255',z:1,f:(i,t)=>{const E=[[0,1],[1,3],[3,2],[2,0],[4,5],[5,7],[7,6],[6,4],[0,4],[1,5],[2,6],[3,7]],V=k=>[(k&1)?1:-1,(k&2)?1:-1,(k&4)?1:-1];const e=E[i%12],q=(Math.floor(i/12)+.5)/Math.ceil(N/12),A=V(e[0]),B=V(e[1]);let x=A[0]+(B[0]-A[0])*q,y=A[1]+(B[1]-A[1])*q,z=A[2]+(B[2]-A[2])*q;const ay=t*.7,ax=t*.45;[x,z]=[x*Math.cos(ay)-z*Math.sin(ay),x*Math.sin(ay)+z*Math.cos(ay)];[y,z]=[y*Math.cos(ax)-z*Math.sin(ax),y*Math.sin(ax)+z*Math.cos(ax)];return[x*.55,y*.55,z*.55]}},
   torus:{c:'rainbow',z:1,f:(i,t)=>{const u=i/N*TAU*6,v=i/N*TAU,R0=.7,r0=.28;let x=(R0+r0*Math.cos(u))*Math.cos(v),y=(R0+r0*Math.cos(u))*Math.sin(v),z=r0*Math.sin(u);const ax=1.1+Math.sin(t*.5)*.3,az=t*.6;[y,z]=[y*Math.cos(ax)-z*Math.sin(ax),y*Math.sin(ax)+z*Math.cos(ax)];[x,y]=[x*Math.cos(az)-y*Math.sin(az),x*Math.sin(az)+y*Math.cos(az)];return[x,y,z]}},
   galaxy:{c:(i,t)=>i%7===0?'255,240,200':i%2?'170,190,255':'255,170,230',z:1,f:(i,t)=>{const arm=i%2,q=Math.pow((Math.floor(i/2)+.5)/(N/2),.8),a=q*TAU*1.4+arm*Math.PI+t*.35;let x=Math.cos(a)*q,y=Math.sin(a)*q*.38,z=Math.sin(a)*q;return[x,y,z*.5]}},
   saturn:{c:(i,t)=>i<60?'255,215,150':'220,200,255',z:1,f:(i,t)=>{if(i<60){const y=1-2*(i+.5)/60,r=Math.sqrt(1-y*y),a=i*2.39996+t*.6;return[Math.cos(a)*r*.5,y*.5,Math.sin(a)*r*.5]}const a=(i-60)/(N-60)*TAU+t*.4,rr=.85+((i%3)*.06);return[Math.cos(a)*rr,Math.sin(a)*rr*.22-Math.cos(a)*rr*.05,Math.sin(a)*rr]}},
   rainbow:{c:(i,t)=>['255,90,110','255,160,70','255,230,90','110,230,130','90,170,255','170,120,255'][i%6],f:i=>{const b=i%6,q=Math.floor(i/6)/(Math.ceil(N/6)-1),a=Math.PI+q*Math.PI,r=1-b*.09;return[Math.cos(a)*r,Math.sin(a)*r*.9+.35]}},
   lighthouse:{c:(i,t)=>i<50?'255,255,255':'255,240,160',f:(i,t)=>{if(i<50){const q=i/49,side=i%2?1:-1;return[side*(.12-.04*q)+(i%5===0?0:0),.9-q*1.3]}const q=(i-50)/(N-50),a=t*1.2,d=q*1.4;return[Math.cos(a)*d,-.42+Math.sin(a)*d*.25]}},
   shoot:{c:'255,250,220',f:(i,t)=>{const ph=(t*.35)%1,hx=-1.2+ph*2.6,hy=-.8+ph*1.2,q=i/N;return[hx-q*1.1+Math.sin(i)*q*.05,hy-q*.5+Math.cos(i)*q*.05]}},
   multiburst:{c:'rainbow',f:(i,t)=>{const g=i%3,C=[[-.6,-.3],[.55,-.45],[0,.25]][g],ph=((t*.5)+g*.33)%1,a=(Math.floor(i/3)/(N/3))*TAU,r=ph*.55;return[C[0]+Math.cos(a)*r,C[1]+Math.sin(a)*r+ph*ph*.15]}},
   sakura:{c:'255,180,210',pts:T('🌸','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},maple:{c:'255,120,60',pts:T('🍁','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},pumpkin:{c:'255,150,40',pts:T('🎃','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},ghost:{c:'235,235,255',pts:T('👻','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   snowman:{c:'230,245,255',pts:T('⛄','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},rabbit:{c:'255,240,240',pts:T('🐇','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},octopus:{c:'255,120,150',pts:T('🐙','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},shell:{c:'255,200,180',pts:T('🐚','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},sun:{c:'255,210,80',pts:T('☀','110px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif')},
   n3:{c:'255,255,255',pts:W('3')},n2:{c:'255,255,255',pts:W('2')},n1:{c:'255,255,255',pts:W('1')},oyasumi:{c:'200,210,255',pts:W('おやすみ')},matane:{c:'255,200,230',pts:W('またね')},
};
  const THEMES={
   mix:{nm:'ドローンショー',pool:['star','heart','spade','diamond','ring','spiral','flower','infinity','smile','sphere','helix','wave','whale','dolphin','boat','palm','crown','clover','n777','lucky'],end:'thanks'},
   sea:{nm:'ドローンショー「海の仲間たち」',pool:['wave','whale','dolphin','fish','turtle','crab','boat','umi','spiral','sphere'],end:'thanks'},
   sky:{nm:'ドローンショー「星空の物語」',pool:['star','moon','hoshi','rocket','sphere','helix','spiral','infinity','ring','fireburst'],end:'heart'},
   season:{nm:'ドローンショー「四季のうた」',pool:()=>{const m=new Date().getMonth()+1;return m>=3&&m<=5?['sakura','butterfly','flower','rabbit','rainbow','bird','heart','spiral']:m>=6&&m<=8?['sun','wave','dolphin','palm','rainbow','multiburst','fish','shell']:m>=9&&m<=11?['maple','moon','rabbit','pumpkin','ghost','star','shoot','flower']:['snowman','star','galaxy','ring','shoot','moon','sphere','heart']},end:'thanks'},
   life:{nm:'ドローンショー「光の いきもの」',pool:['butterfly','bird','jelly','whale','dolphin','octopus','turtle','fish','crab','cat'],end:'heart'},
   cosmos:{nm:'ドローンショー「宇宙の旅」',pool:['galaxy','saturn','cube','torus','sphere','rocket','shoot','helix','moon','star'],end:'hoshi'},
   night:{nm:'ドローンショー「おやすみの空」',pool:['moon','wave','lighthouse','star','jelly','shoot','rabbit','flower'],end:'oyasumi',slow:1},
   casino:{nm:'ドローンショー「カジノナイト」',pool:['spade','heart','suitD','club','diamond','crown','n777','jp','lucky','clover','fireburst'],end:'n777'}};
  function program(theme){const Th=THEMES[theme]||THEMES.mix;let src=typeof Th.pool==='function'?Th.pool():Th.pool.slice();
    if(theme==='mix'){src=src.concat(['butterfly','bird','jelly','cube','torus','galaxy','saturn','rainbow','multiburst','lighthouse']);const m=new Date().getMonth()+1;if(m===10)src.push('pumpkin','ghost','pumpkin');if(m===12)src.push('snowman');if(m>=3&&m<=4)src.push('sakura')}
    const n=Th.slow?6:8;const pool=src.sort(()=>Math.random()-.5).filter((v,i,a)=>a.indexOf(v)===i).slice(0,n);const cd=(theme==='mix'||theme==='casino')&&Math.random()<.4?['n3','n2','n1']:[];return ['_scat',...cd,...pool,Th.end,'_burst']}
  const hueRGB=h=>{const f=n=>{const k=(n+h*12)%12;return Math.round(255*(.62-.38*Math.max(-1,Math.min(k-3,9-k,1))))};return `${f(0)},${f(8)},${f(4)}`};
  function pos(name,i,t,st){if(name==='_scat')return st.rnd[i];if(name==='_burst'){const a=st.rnd[i][0]*3,r=1.6+st.rnd[i][1];return[Math.cos(a)*r,Math.sin(a)*r]}
    const S=F[name];if(!S)return st.rnd[i];if(S.pts){if(S.arr===undefined)S.arr=S.pts()||null;return S.arr?S.arr[i]:st.rnd[i]}return S.f(i,t)}
  function col(name,i,t){if(name==='_scat'||name==='_burst')return '255,255,255';let c=(F[name]||{}).c||'255,255,255';if(typeof c==='function')c=c(i,t);return c==='rainbow'?hueRGB((i/N+t*.08)%1):c}
  window.droneDraw=function(p,st,et,H){const{x,WL,WW,hz,k,glow,fade,ease}=H;const cx=WL+WW*.5,cy=hz*.42,Rr=Math.min(WW,hz)*.32;
    if(!st.prog){st.theme=window._droneTheme||'mix';window._droneTheme=null;st.prog=program(st.theme);st.rnd=Array.from({length:N},()=>[Math.random()*2.8-1.4,Math.random()*2-1]);try{say('drShow_'+st.theme,{delay:1500})}catch(e){}}
    const SEQ=st.prog,L=SEQ.length-1,seg=Math.min(L-1,Math.floor(p*L)),f=p*L-seg,e=f<.32?ease(f/.32):1,a=fade(p,.03,.05);
    if(seg!==st.lastSeg){st.lastSeg=seg;const nm=SEQ[seg+1];if(nm&&!nm.startsWith('_')&&Math.random()<.35)try{say('drShape',{delay:1800})}catch(er){}}
    x.save();x.globalCompositeOperation='lighter';
    for(let i=0;i<N;i++){const A=SEQ[seg],B=SEQ[seg+1];const pa=pos(A,i,et,st),pb=pos(B,i,et,st);
      const mx=pa[0]+(pb[0]-pa[0])*e,my=pa[1]+(pb[1]-pa[1])*e,mz=(pa[2]??0)+((pb[2]??0)-(pa[2]??0))*e;const dep=.55+.45*((mz+1)/2);
      const px=cx+mx*Rr+Math.sin(et*2+i)*1.1,py=cy+my*Rr+Math.cos(et*1.7+i)*1.1;const c=e<.5?col(A,i,et):col(B,i,et);
      const tw=B==='_burst'?Math.max(0,1-f*1.3):1;x.globalAlpha=a*tw*(.65+.35*Math.sin(et*3+i))*((F[B]&&F[B].z)||(F[A]&&F[A].z)?dep:1);
      glow(px,py,6*k*((F[B]&&F[B].z)?dep:1),`rgba(${c},.6)`);x.fillStyle=`rgb(${c})`;x.fillRect(px-1,py-1,2.2,2.2)}
    x.restore()};
  // ショップ：テーマ別の ドローンショーを 追加
  try{const base=SHOP.find(s=>s.id==='s_drones');if(base){base.desc='光のドローン 110機が、毎回 ちがう 形を つぎつぎ えがく';base.sec=Math.max(base.sec,110)}
    SHOP.push({id:'s_drones_sea',t:['night'],kind:'show',show:'drones',theme:'sea',sec:110,price:1500,ico:'🐋',name:'ドローンショー「海の仲間たち」',desc:'クジラ・イルカ・カメ…夜空に 海の 生き物たちが 泳ぐ'},
     {id:'s_drones_sky',t:['night'],kind:'show',show:'drones',theme:'sky',sec:110,price:1500,ico:'🌙',name:'ドローンショー「星空の物語」',desc:'星・月・ロケット、くるくる 回る 光の 地球'},
     {id:'s_drones_season',t:['night'],kind:'show',show:'drones',theme:'season',sec:110,price:1800,ico:'🌸',name:'ドローンショー「四季のうた」',desc:'いまの 季節の 花や 生きものが 夜空に（季節で 中身が 変わる）'},
     {id:'s_drones_life',t:['night'],kind:'show',show:'drones',theme:'life',sec:110,price:2200,ico:'🦋',name:'ドローンショー「光の いきもの」',desc:'はばたく 蝶や 鳥、ゆらめく クラゲ…光が 生きてるみたいに 動く'},
     {id:'s_drones_cosmos',t:['night'],kind:'show',show:'drones',theme:'cosmos',sec:110,price:2500,ico:'🪐',name:'ドローンショー「宇宙の旅」',desc:'回る 銀河・土星・立体の 箱、宇宙を 旅する 光'},
     {id:'s_drones_night',t:['night'],kind:'show',show:'drones',theme:'night',sec:120,price:1500,ico:'🌙',name:'ドローンショー「おやすみの空」',desc:'ゆっくり 静かな ショー。灯台の 光と 月、最後に「おやすみ」'},
     {id:'s_drones_casino',t:['night'],kind:'show',show:'drones',theme:'casino',sec:110,price:2000,ico:'🃏',name:'ドローンショー「カジノナイト」',desc:'トランプの マークに 王冠、最後は 777！'})}catch(e){}
  {const _b=buy;buy=function(id){try{const it=SHOP.find(i=>i.id===id);if(it&&it.show==='drones')window._droneTheme=it.theme||'mix'}catch(e){}return _b.apply(this,arguments)}}
  Object.assign(MUMS,{drShow_mix:['ドローンショー はじまった！','何が 出てくるかな','光の 粒が 集まってく'],drShow_sea:['空に 海が できた','クジラ 出るかな','空飛ぶ 水族館や'],drShow_sky:['星空の 物語や','ロマンチック…','宇宙みたい'],drShow_casino:['カジノっぽい！','777 来るか！？','トランプの マークや'],drShow_season:['季節の ショーや','今の 季節 らしい','風流やなぁ'],drShow_life:['生きてる みたい！','蝶が 飛んでる…','クラゲ ふわふわ'],drShow_cosmos:['宇宙や…','銀河 回ってる！','立体に 見える！'],drShow_night:['静かな ショーやな','眠く なってきた','やさしい 光'],
   drShape:['次は 何の 形？','おおっ 変わった！','すごい 技術','どうやって 動かしてるん','拍手〜👏','きれい…','あれ なんや？','形 わかった！']});
  Object.assign(EMO,{drShow_mix:['🛸','✨'],drShow_sea:['🐋','🛸'],drShow_sky:['🌙','🛸'],drShow_casino:['🃏','🛸'],drShow_season:['🌸','🛸'],drShow_life:['🦋','🛸'],drShow_cosmos:['🪐','🛸'],drShow_night:['🌙','🛸'],drShape:['👀','✨']});
})();
(()=>{const R=(a,b)=>a+Math.random()*(b-a);
  function seaBufs(){if(window.PNB||!ac)return;const len=ac.sampleRate*8,P=ac.createBuffer(2,len,ac.sampleRate),B=ac.createBuffer(2,len,ac.sampleRate);
    for(let c=0;c<2;c++){const d=P.getChannelData(c),e=B.getChannelData(c);let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0,last=0;
      for(let i=0;i<len;i++){const w=Math.random()*2-1;b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*window.PNK;b6=w*.115926;last=(last+.02*w)/1.02;e[i]=last*3.5}
      const X=Math.floor(ac.sampleRate*.05);for(let i=0;i<X;i++){const f=i/X;d[len-X+i]=d[len-X+i]*(1-f)+d[i]*f;e[len-X+i]=e[len-X+i]*(1-f)+e[i]*f}}
    window.PNB=P;window.BNB=B}
  window.PNK=window.PNK||.16;
  let roar=null;
  function roarOn(){if(roar||!amb||!ac||!window.BNB)return;const s=ac.createBufferSource();s.buffer=window.BNB;s.loop=true;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=170;lp.Q.value=.4;const g=ac.createGain();g.gain.value=.0001;
    s.connect(lp).connect(g).connect(amb.g);s.start(0,R(0,6));roar={s,g};
    const mod=()=>{try{if(!roar)return;const td=typeof window.tideNow==='function'?window.tideNow():0;roar.g.gain.setTargetAtTime(R(.35,.9)*(1+.2*td),ac.currentTime,R(2.5,5))}catch(e){}setTimeout(mod,R(4000,9000))};mod()}
  {const _am=ambient;ambient=function(){const r=_am.apply(this,arguments);try{seaBufs();roarOn()}catch(e){}return r}}
  try{if(ac){seaBufs();roarOn()}}catch(e){}
})();
(()=>{const R=(a,b)=>a+Math.random()*(b-a);const _ow=oneWave;
  function seaOut(t,dur,p0,p1){const g=ac.createGain();g.gain.value=1;let head=g;if(ac.createStereoPanner){const pn=ac.createStereoPanner();pn.pan.setValueAtTime(p0,t);pn.pan.linearRampToValueAtTime(p1,t+dur);g.connect(pn);pn.connect(waveBus);setTimeout(()=>{try{pn.disconnect()}catch(e){}},(dur+3)*1000+(t-ac.currentTime)*1000)}else g.connect(waveBus);
    setTimeout(()=>{try{g.disconnect()}catch(e){}},(dur+3)*1000+(t-ac.currentTime)*1000);return head}
  function src(buf,t,dur){const s=ac.createBufferSource();s.buffer=buf;s.loop=true;s.playbackRate.value=R(.92,1.06);s.start(t,R(0,7));s.stop(t+dur+.3);return s}
  const filt=(type,f,q=.7)=>{const b=ac.createBiquadFilter();b.type=type;b.frequency.value=f;b.Q.value=q;return b};
  oneWave=function(t,dur,pk,peak,fizz,lpMax,thump){if(!window.PNB||!ac)return _ow.apply(this,arguments);try{
    const P=window.PNB,B=window.BNB,dir=Math.random()<.5?1:-1,p0=R(.2,.6)*-dir,p1=R(.1,.5)*dir,out=seaOut(t,dur,p0,p1),tp=t+dur*pk,end=t+dur,V=peak*.6;
    // ① 寄せる：遠くから 近づく うねり（低い→明るく）
    {const s=src(P,t,dur),lp=filt('lowpass',160,.5),g=ac.createGain();lp.frequency.setValueAtTime(160,t);lp.frequency.exponentialRampToValueAtTime(Math.max(300,lpMax*.85),tp);lp.frequency.exponentialRampToValueAtTime(260,end);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(V*.55,t+(tp-t)*.7);g.gain.exponentialRampToValueAtTime(V,tp);g.gain.exponentialRampToValueAtTime(V*.4,tp+(end-tp)*.35);g.gain.exponentialRampToValueAtTime(.0001,end);s.connect(lp).connect(g).connect(out)}
    // ② 崩れる：くずれる 瞬間の ザバッ（中音の 厚み）
    {const d=Math.min(1.6,dur*.28),s=src(P,tp-.08,d+.2),bp=filt('bandpass',R(700,1100),.45),g=ac.createGain();bp.frequency.setValueAtTime(R(1300,1700),tp-.08);bp.frequency.exponentialRampToValueAtTime(R(500,750),tp+d);
      g.gain.setValueAtTime(.0001,tp-.08);g.gain.exponentialRampToValueAtTime(V*.55,tp+.06);g.gain.exponentialRampToValueAtTime(.0001,tp+d);s.connect(bp).connect(g).connect(out)}
    // ③ 泡：シュワ〜（なめらかに 消える 高い 音 ＋ ランダムに はじける 細かい 泡の 粒）
    {const d=(end-tp)*.95,s=src(P,tp,d+.2),hp=filt('highpass',2400,.5),pkF=filt('peaking',5000,.6);pkF.gain.value=2;const g=ac.createGain();
      const fz=Math.max(.005,fizz*2.1);g.gain.setValueAtTime(.0001,tp);g.gain.exponentialRampToValueAtTime(fz*.8,tp+.2);g.gain.setTargetAtTime(fz*.35,tp+.25,d*.25);g.gain.setTargetAtTime(.0001,tp+d*.55,d*.18);s.connect(hp).connect(pkF).connect(g).connect(out);
      const n=Math.round(R(35,60)*Math.min(1.5,fz/.006));for(let k=0;k<n;k++){const tt=tp+.1+Math.pow(Math.random(),1.7)*d*.85,gl=R(.012,.035),gs=ac.createBufferSource(),bp=filt('bandpass',R(2500,6500),R(1.5,3)),gg=ac.createGain();gs.buffer=P;
        const lv=fz*R(.5,1.3)*(1-(tt-tp)/d*.7);gg.gain.setValueAtTime(.0001,tt);gg.gain.exponentialRampToValueAtTime(Math.max(.0002,lv),tt+.003);gg.gain.exponentialRampToValueAtTime(.0001,tt+gl);gs.connect(bp).connect(gg).connect(out);gs.start(tt,R(0,7));gs.stop(tt+gl+.02)}}
    // ④ 引き波：砂を すべって 戻る さらさら（逆向きに 流れる）
    {const st=tp+(end-tp)*.4,d=(end-st)*1.1,s=src(P,st,d+.2),bp=filt('bandpass',1800,.6),g=ac.createGain();bp.frequency.setValueAtTime(2600,st);bp.frequency.exponentialRampToValueAtTime(900,st+d);
      let o2=out;if(ac.createStereoPanner){const pn=ac.createStereoPanner();pn.pan.setValueAtTime(p1,st);pn.pan.linearRampToValueAtTime(p0*.5,st+d);pn.connect(waveBus);o2=pn;setTimeout(()=>{try{pn.disconnect()}catch(e){}},(d+4)*1000+(st-ac.currentTime)*1000)}
      g.gain.setValueAtTime(.0001,st);g.gain.exponentialRampToValueAtTime(V*.22,st+d*.3);g.gain.exponentialRampToValueAtTime(.0001,st+d);s.connect(bp).connect(g).connect(o2)}
    // ⑤ ドン：大きな 波の 低い 響き
    if(thump&&B){const s=src(B,tp-.05,1.6),lp=filt('lowpass',120,.5),g=ac.createGain();g.gain.setValueAtTime(.0001,tp-.05);g.gain.exponentialRampToValueAtTime(thump*1.1,tp+.06);g.gain.exponentialRampToValueAtTime(.0001,tp+1.4);s.connect(lp).connect(g).connect(out)}
  }catch(e){return _ow.apply(this,arguments)}};
})();