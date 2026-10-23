/* 浜辺の英語: 浜辺でめくる単語帳と、つぶやくラジオ。
   ラジオの問題に正解するとコインがもらえ、コインでラジオや浜辺のかざりを買う。 */
(()=>{
const {scene:SC,sfx:SFX,S:ST}=BEACH;
const panel=$('panel');
const START_COINS=150;

/* ---------- save ---------- */
const GAP0=10;
try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');ST.radios=oneRadioEach(s.radios||[]);ST.radioGap=s.gapV>=2?s.radioGap:GAP0;ST.bookPos=s.bookPos||{};ST.music=s.music||[];ST.learned=s.learned||{};ST.slow=!!s.slow;ST.autoSay=s.autoSay!==false;ST.cheer=s.cheer!==false;ST.gram=Object.assign({owned:[],cleared:[]},s.gram||{});
  if(!s.started)ST.coins=Math.max(ST.coins,START_COINS);ST.started=1}catch(e){ST.radios=[];ST.radioGap=GAP0;ST.bookPos={};ST.music=[];ST.learned={};ST.slow=false;ST.autoSay=true;ST.cheer=true;ST.gram={owned:[],cleared:[]};ST.started=1}
ST.vol=Object.assign({se:1,wave:1,mus:1,voice:1},ST.vol||{});
_saveHooks.push(()=>{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');Object.assign(s,{gram:ST.gram,learned:ST.learned,slow:ST.slow,autoSay:ST.autoSay,cheer:ST.cheer,music:ST.music,radios:ST.radios,radioGap:ST.radioGap,gapV:2,bookPos:ST.bookPos,started:1});localStorage.setItem(SAVE_KEY,JSON.stringify(s))});

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const allWords=lv=>LEVELS[lv].books.flatMap(b=>b.w);

/* ---------- voice ----------
   every word and line is pre-recorded into one mp3 per level (audio/<lv>.mp3 + .json offsets),
   played through Web Audio so it also works inside app web views without speech synthesis */
const AUD={};
/* which sprite holds which line: every sprite's small .json index is read up front */
const SPRITES=['es','jh','hs','adv','suika','pop','season','star','folk','gram','jh2a','jh2b','jh2c','jh2d','hs2a','hs2b','hs2c','hs2d','adv2a','adv2b','adv2c','adv2d','cheer','owarai','talk2es','talk2jh','talk2hs','talk2adv'],IDX={};
const idxP=Promise.all(SPRITES.map(k=>fetch(`audio/${k}.json`).then(r=>r.json()).then(m=>{for(const t in m)if(!(t in IDX))IDX[t]=k}).catch(()=>{})));let idxOk=false;idxP.then(()=>{idxOk=true});
function loadAud(lv){if(AUD[lv])return AUD[lv].p;const a=AUD[lv]={};
  a.p=Promise.all([fetch(`audio/${lv}.json`).then(r=>r.json()),fetch(`audio/${lv}.mp3`).then(r=>r.arrayBuffer())])
    .then(([m,ab])=>{a.map=m;return new Promise((res,rej)=>A().decodeAudioData(ab,res,rej))}).then(b=>{a.buf=b}).catch(e=>{a.err=e});return a.p}
let voiceOut=null,clip=null;
function stopClip(){if(clip){try{clip.onended=null;clip.stop()}catch(e){}clip=null}window.speechSynthesis&&speechSynthesis.cancel()}
function say(lv,t,done){let fin=false;const end=()=>{if(!fin){fin=true;done&&done()}};
  if(!ST.sound){setTimeout(end,1500);return}
  if(!idxOk){idxP.then(()=>say(lv,t,done));return}
  if(!(AUD[lv]&&AUD[lv].map&&AUD[lv].map[t])&&IDX[t])lv=IDX[t];
  const a=AUD[lv];
  if(!a||(!a.buf&&!a.err)){loadAud(lv).then(()=>say(lv,t,done));return}
  const seg=a.buf&&a.map[t];if(!seg){speak(t,{done:end});return}
  try{A();if(ac.state==='suspended')ac.resume();if(!voiceOut){voiceOut=ac.createGain();voiceOut.connect(master)}voiceOut.gain.value=1.5*ST.vol.voice;
    stopClip();duck(true);const s=ac.createBufferSource();s.buffer=a.buf;s.playbackRate.value=ST.slow?.8:1;s.connect(voiceOut);s.onended=()=>{if(clip===s)clip=null;duck(false);end()};s.start(0,seg[0],seg[1]);clip=s}catch(e){speak(t,{done:end})}}
document.addEventListener('pointerdown',()=>{try{A()}catch(e){}loadAud('es')},{once:true});
/* music steps back while someone speaks */
function duck(on){try{if(musOut)musOut.gain.setTargetAtTime(ST.vol.mus*(on?.3:1),ac.currentTime,on?.08:.4)}catch(e){}}
let voice=null;
function pickVoice(){const vs=speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang));voice=vs.find(v=>/en[-_]US/i.test(v.lang)&&/Samantha|Google|Natural/i.test(v.name))||vs.find(v=>/en[-_]US/i.test(v.lang))||vs[0]||null}
if(window.speechSynthesis){pickVoice();speechSynthesis.onvoiceschanged=pickVoice}
/* speaks and calls done() once the line has finished (or right away when it can't speak) */
function speak(t,{done}={}){let fin=false;const end=()=>{if(!fin){fin=true;done&&done()}};
  if(!window.speechSynthesis||!ST.sound){setTimeout(end,1200);return}
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-US';if(voice)u.voice=voice;u.rate=ST.slow?.65:.85;u.onend=end;u.onerror=end;speechSynthesis.speak(u);setTimeout(end,600+t.length*160)}catch(e){end()}}

/* ---------- toast ---------- */
function toast(html,ms=2600){const el=$('toast');el.innerHTML=html;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),ms)}
BEACH.on('toast',h=>toast(h));
$('toast').addEventListener('click',()=>$('toast').classList.remove('on'));

/* ---------- header ---------- */
function head(){$('coins').textContent=ST.coins.toLocaleString();const ph=phaseOf(GH());$('clock').textContent=ph[2]+' '+clockStr();$('snd').textContent=ST.sound?'🔊':'🔇'}
setInterval(head,1000);
$('gear').onclick=()=>{SFX.pop();screen==='settings'?home():settings()};
$('snd').onclick=()=>{ST.sound=!ST.sound;ST.waves=ST.sound;ambient();if(!ST.sound){try{stopMusic(true)}catch(e){}stopClip()}else SFX.snd();save();head()};
function addCoins(n){ST.coins+=n;save();head();const c=document.querySelector('.coin');c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump')}
function flyCoin(x,y,n,quick){const d=document.createElement('div');d.className='fly'+(quick?' quick':'');d.innerHTML=(quick?'<small>はやい！</small>':'')+'+'+n;d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),1000)}

/* ---------- screens ---------- */
let screen='home';
function show(name,html){screen=name;panel.innerHTML=html;if(name!=='home')radioQuiet()}

function home(){const back=screen!=='home';   // coming back from a word book, the shop, settings…
  show('home',`<section class="pnl home">
    <p id="rq" class="note"></p>
    <div class="lvs">${LV_ORDER.map(k=>{const L=LEVELS[k];return `<button class="lv lv-${k}" data-lv="${k}"><span class="li">${L.ico}</span><b>${L.name}</b><small>${L.books.length}さつ</small></button>`}).join('')}</div>
    <div class="row">
      <button id="shopOpen" class="sub">🛍️ ショップ</button>
      <button id="mini" class="sub">🗺️ 宝の地図</button>
      <button id="gramOpen" class="sub">📚 文法</button>
    </div>
    ${MUS.on&&MUS.id?`<div class="np"><span>🎵 ${esc(TRACKS[MUS.id].name)}</span><button id="npStop" class="sub">■ とめる</button></div>`:''}
    ${ST.radios.length?`<label class="gap"><span>📻 つぶやき</span><input id="gapR" type="range" min="3" max="30" step="1" value="${ST.radioGap}"><output id="gapV">${ST.radioGap}秒ごと</output></label>`:''}
  </section>`);
  panel.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{SFX.vopen();books(b.dataset.lv)});
  $('shopOpen').onclick=()=>{SFX.vopen();shop('radio')};
  $('mini').onclick=()=>{SFX.vopen();window.ADV&&ADV.open()};
  $('gramOpen').onclick=()=>{SFX.vopen();gramList()};
  const ns=$('npStop');if(ns)ns.onclick=()=>{stopMusic(true);SFX.pop();home()};
  const g=$('gapR');if(g)g.oninput=()=>{ST.radioGap=+g.value;$('gapV').textContent=g.value+'秒ごと';save();if(nextAt>performance.now()+ST.radioGap*1000)nextAt=performance.now()+ST.radioGap*1000};
  rqIdle();if(back)nextAt=Math.max(nextAt,performance.now()+RADIO_REST);else radioWake();
}

/* ---------- word books ---------- */
/* the seasonal book (game/extras/season.js) sits at the top of every level's shelf while its season lasts */
function getBook(lv,bi){if(bi==='season'){const sn=seasonNow();return sn&&{t:`${sn[1].name}の たんごちょう`,ico:sn[1].ico,w:sn[1].w}}return LEVELS[lv].books[bi]}
const lkey=(lv,bi,w)=>(bi==='season'?'season':lv)+':'+w[0];
const isLearned=(lv,bi,w)=>!!ST.learned[lkey(lv,bi,w)];
function books(lv){
  const L=LEVELS[lv],sn=seasonNow();
  const tile=(bi,num)=>{const b=getBook(lv,bi),p=ST.bookPos[lv+':'+bi]||0,n=b.w.filter(w=>isLearned(lv,bi,w)).length;
    return `<button class="book ${bi==='season'?'season':''} ${n===b.w.length?'mastered':''}" data-i="${bi}"><span class="bn">${num}</span><span class="bt">${esc(b.t)}</span><span class="bp">${n?`✓ ${n}/${b.w.length}`:p?`${p+1} / ${b.w.length}`:`${b.w.length}ご`}</span><i class="lbar" style="width:${n/b.w.length*100}%"></i></button>`};
  const all=L.books.flatMap((b,i)=>b.w.map(w=>[i,w])),got=all.filter(([i,w])=>isLearned(lv,i,w)).length;
  show('books',`<section class="pnl books">
    <div class="qtop"><button class="x" id="bx" aria-label="もどる">←</button><b>${L.ico} ${L.name}の たんごちょう</b><span class="qn">✓ ${got}/${all.length}</span></div>
    <div class="shelf">${sn?tile('season',sn[1].ico):''}${L.books.map((b,i)=>tile(i,i+1)).join('')}</div>
    ${sn?`<p class="note">${sn[1].ico} いまだけ「${sn[1].name}の たんごちょう」が あるよ</p>`:''}
  </section>`);
  $('bx').onclick=()=>{SFX.pop();home()};
  panel.querySelectorAll('.book').forEach(b=>b.onclick=()=>{SFX.flip();const v=b.dataset.i;cards(lv,v==='season'?v:+v)});
}

function cards(lv,bi,onlyLeft=false){
  const L=LEVELS[lv],B=getBook(lv,bi),key=lv+':'+bi;if(!B)return books(lv);
  const left=()=>B.w.map((w,j)=>j).filter(j=>!isLearned(lv,bi,B.w[j]));
  let i=Math.min(ST.bookPos[key]||0,B.w.length-1);if(onlyLeft&&isLearned(lv,bi,B.w[i]))i=left()[0]??0;
  show('cards',`<section class="pnl wb">
    <div class="qtop"><button class="x" id="cx" aria-label="たんごちょうを とじる">←</button><b>${bi==='season'?B.ico:bi+1+'.'} ${esc(B.t)}</b><span class="qn" id="cn"></span></div>
    <div class="seg only"><button data-o="0" class="${onlyLeft?'':'on'}">ぜんぶ</button><button data-o="1" class="${onlyLeft?'on':''}">のこりだけ（<span id="ln"></span>）</button></div>
    <div class="deck" id="deck"><div class="fc" id="fc" tabindex="0" role="button" aria-label="カードを めくる"><div class="cface cfront" id="ff"></div><div class="cface cback" id="fb"></div></div></div>
    <div class="ctl"><button id="cp" aria-label="まえの カード">◀</button><button id="cs" class="say" aria-label="はつおんを きく">🔊</button><button id="ck" class="mark" aria-label="おぼえた">✓</button><button id="cnx" aria-label="つぎの カード">▶</button></div>
    <p class="note">タップで うら・おもて　よこに スワイプで めくる　うえに スワイプで「おぼえた」</p>
  </section>`);
  const fc=$('fc');
  function draw(){const w=B.w[i],lr=isLearned(lv,bi,w);fc.classList.remove('flip');fc.classList.toggle('learned',lr);
    $('ff').innerHTML=`${lr?'<em class="lmark">✓ おぼえた</em>':''}${w[2]?`<span class="ce">${w[2]}</span>`:''}<span class="cw">${esc(w[0])}</span>`;
    $('fb').innerHTML=`<span class="cj">${esc(w[1])}</span><span class="cw2">${esc(w[0])}</span>`;
    $('cn').textContent=`${i+1} / ${B.w.length}`;$('ln').textContent=left().length;$('ck').classList.toggle('on',lr);ST.bookPos[key]=i;save()}
  /* read the card aloud as it appears (after its sound file loads, and only if it is still the card on screen) */
  function autoSay(){if(!ST.autoSay)return;const t=B.w[i][0];idxP.then(()=>loadAud(IDX[t]||lv)).then(()=>{if(screen==='cards'&&B.w[i]&&B.w[i][0]===t&&fc.isConnected)say(lv,t)})}
  /* the next card in direction d (skipping learned ones in のこりだけ); -1 when there is none */
  const nextIdx=d=>{let n=i+d;while(n>=0&&n<B.w.length&&onlyLeft&&isLearned(lv,bi,B.w[n]))n+=d;return n};
  let sliding=false,pend=0;  // a turn asked for while a card is still flying waits for it, so quick taps neither get lost nor replay the same card
  function slide(n,dir,up){if(sliding)return;sliding=true;fc.style.transition='transform .18s ease-in,opacity .18s';fc.style.transform=up?'translateY(-130%) rotate(-4deg)':`translateX(${dir>0?-120:120}%) rotate(${dir>0?-8:8}deg)`;fc.style.opacity='0';SFX.flip();
    setTimeout(()=>{i=n;draw();autoSay();fc.style.transition='none';fc.style.transform=up?'translateY(40%)':`translateX(${dir>0?120:-120}%)`;void fc.offsetWidth;fc.style.transition='transform .2s ease-out,opacity .2s';fc.style.transform='';fc.style.opacity='1';sliding=false;if(pend){const d=pend;pend=0;go(d)}},180)}
  function go(d){if(sliding){pend=d;return}const n=nextIdx(d);
    if(n<0){fc.classList.add('nudge');setTimeout(()=>fc.classList.remove('nudge'),250);return}
    if(n>=B.w.length){done();return}
    slide(n,d)}
  /* mark the card learned (or not) and move on */
  /* a soft two-note bell for "learned" (much quieter than the coin chime) */
  const learnSnd=()=>{try{bell(1319,.012,0,.45);bell(1760,.008,.07,.5)}catch(e){}};
  function mark(){if(sliding)return;const w=B.w[i],k=lkey(lv,bi,w);if(ST.learned[k]){delete ST.learned[k];save();draw();SFX.pop();return}
    ST.learned[k]=1;save();learnSnd();const r=fc.getBoundingClientRect();FX.ring(r.left+r.width/2,r.top+r.height/2,'#55e0b4');
    if(onlyLeft&&!left().length){draw();done();return}
    const n=nextIdx(1);if(n>=B.w.length){draw();done();return}slide(n,1,true)}
  function done(){ST.bookPos[key]=0;save();SFX.fanfare(1);const r=$('deck').getBoundingClientRect();FX.firework(r.left+r.width/2,r.top+r.height/2);
    const nx=typeof bi==='number'&&bi+1<L.books.length,rest=left().length;
    $('deck').innerHTML=`<div class="fin"><b>${rest?`🎉 さいごまで めくったよ！<small>のこり ${rest}ご</small>`:'🌟 ぜんぶ おぼえた！'}</b><div class="row">${rest?'<button id="leftB" class="sub">のこりだけ もういちど</button>':'<button id="again" class="sub">もういちど</button>'}${nx?'<button id="nextB">つぎの たんごちょう ▶</button>':''}</div></div>`;
    panel.querySelector('.ctl').hidden=true;panel.querySelector('.wb .note').hidden=true;
    const a=$('again');if(a)a.onclick=()=>cards(lv,bi);const lb=$('leftB');if(lb)lb.onclick=()=>{ST.bookPos[key]=0;cards(lv,bi,true)};if(nx)$('nextB').onclick=()=>{SFX.flip();cards(lv,bi+1)}}
  /* swipe: sideways turns the page, up marks it learned; a short tap flips it */
  let sx=null,sy=0,dx=0,dy=0;
  fc.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;dx=dy=0;fc.setPointerCapture(e.pointerId);fc.style.transition='none'});
  fc.addEventListener('pointermove',e=>{if(sx==null)return;dx=e.clientX-sx;dy=e.clientY-sy;
    if(Math.abs(dy)>Math.abs(dx)&&dy<-6)fc.style.transform=`translateY(${dy}px)`;else if(Math.abs(dx)>6)fc.style.transform=`translateX(${dx}px) rotate(${dx/30}deg)`});
  const up=()=>{if(sx==null)return;const ax=Math.abs(dx),ay=Math.abs(dy);sx=null;fc.style.transition='transform .2s';
    if(dy<-60&&ay>ax){fc.style.transform='';mark()}else if(ax>60&&ax>ay)go(dx<0?1:-1);else{fc.style.transform='';if(ax<20&&ay<20){fc.classList.toggle('flip');SFX.pop()}}};
  fc.addEventListener('pointerup',up);fc.addEventListener('pointercancel',()=>{sx=null;fc.style.transform=''});
  fc.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();fc.classList.toggle('flip')}});
  $('cp').onclick=()=>go(-1);$('cnx').onclick=()=>go(1);$('ck').onclick=mark;
  $('cs').onclick=e=>{e.stopPropagation();say(lv,B.w[i][0])};
  panel.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{const o=b.dataset.o==='1';if(o&&!left().length){toast('🌟 この たんごちょうは ぜんぶ おぼえたよ');return}SFX.pop();cards(lv,bi,o)});
  loadAud(bi==='season'?'season':lv);
  $('cx').onclick=()=>{SFX.pop();books(lv)};
  cardKeys=e=>{if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1);if(e.key==='ArrowUp')mark()};
  draw();autoSay();
}
let cardKeys=null;
/* ---------- settings: volumes and voice speed ---------- */
function settings(){
  const S_=[['se','🔔','効果音'],['wave','🌊','波の音'],['mus','🎵','BGM'],['voice','🗣️','英語の 発音']];
  show('settings',`<section class="pnl settings">
    <div class="qtop"><button class="x" id="gx" aria-label="設定を とじる">←</button><b>⚙️ 設定</b><span></span></div>
    ${S_.map(([k,i,n])=>`<label class="vol"><span>${i} ${n}</span><input type="range" id="v_${k}" min="0" max="100" step="5" value="${Math.round(ST.vol[k]*100)}"><output id="o_${k}">${Math.round(ST.vol[k]*100)}%</output></label>`).join('')}
    <div class="vol"><span>🐢 発音の 速さ</span><div class="seg spd"><button data-sp="0" class="${ST.slow?'':'on'}">ふつう</button><button data-sp="1" class="${ST.slow?'on':''}">ゆっくり</button></div></div>
    <div class="vol"><span>📖 カードを 出したら 読みあげ</span><div class="seg spd"><button data-as="1" class="${ST.autoSay?'on':''}">オン</button><button data-as="0" class="${ST.autoSay?'':'on'}">オフ</button></div></div>
    <div class="vol"><span>💪 おうえん メッセージ</span><div class="seg spd"><button data-ch="1" class="${ST.cheer?'on':''}">オン</button><button data-ch="0" class="${ST.cheer?'':'on'}">オフ</button></div></div>
    <button id="vtest" class="sub">🔊 ためしに きく（hello）</button>
    <p class="note">枠の 外を タップすると とじるよ</p>
  </section>`);
  $('gx').onclick=()=>{SFX.pop();home()};
  S_.forEach(([k])=>{const r=$('v_'+k);r.oninput=()=>{ST.vol[k]=r.value/100;$('o_'+k).textContent=r.value+'%';try{applyVol()}catch(e){}if(voiceOut)voiceOut.gain.value=1.5*ST.vol.voice;save()};
    r.onchange=()=>{if(k==='se')SFX.coin();if(k==='voice')say('es','hello')}});
  panel.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{ST.cheer=b.dataset.ch==='1';save();SFX.pop();settings()});
  panel.querySelectorAll('[data-as]').forEach(b=>b.onclick=()=>{ST.autoSay=b.dataset.as==='1';save();SFX.pop();settings()});
  panel.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{ST.slow=b.dataset.sp==='1';save();say('es','hello');settings()});
  $('vtest').onclick=()=>say('es','hello')}
/* tapping anywhere outside the panel works like its ← button (and that tap does nothing else); screens without ← (mini games, chests) ignore it */
document.addEventListener('pointerdown',e=>{if(screen==='home'||e.target.closest('#panel,#toast,header,#nowplay,#cheerBox'))return;
  const x=panel.querySelector('.qtop .x');if(!x)return;
  e.preventDefault();e.stopPropagation();x.click();
  const eat=ev=>{ev.stopPropagation();ev.preventDefault()};document.addEventListener('click',eat,{capture:true,once:true});setTimeout(()=>document.removeEventListener('click',eat,true),400)},true);
/* moving things (answer bubbles, residents, mini-game targets) answer the moment a finger touches them.
   A normal click needs the finger to go down and up on the same element, which fails when it drifts away in between. */
const FAST='.ab.opt,.ab.line,button.folk,#ar .shell,#ar .st,#ar .crab,#ar .tile,#ar [data-d]';let eatUntil=0;
document.addEventListener('pointerdown',e=>{if(e.button>0)return;const t=e.target.closest(FAST);if(!t)return;
  e.preventDefault();t.click();eatUntil=performance.now()+600},true);
document.addEventListener('click',e=>{if(e.isTrusted&&performance.now()<eatUntil){eatUntil=0;e.stopPropagation();e.preventDefault()}},true);
document.addEventListener('keydown',e=>{if(screen==='cards'&&cardKeys)cardKeys(e)});

/* when the app goes to the background (another app, the lock screen, another tab) every sound stops, and comes back when it returns */
function bgSound(){const hide=document.hidden;try{if(ac){if(hide)ac.suspend();else if(ST.sound)ac.resume()}}catch(e){}
  if(hide){try{speechSynthesis.cancel()}catch(e){}}}
document.addEventListener('visibilitychange',bgSound);addEventListener('pagehide',()=>{try{ac&&ac.suspend()}catch(e){}});

/* ---------- cheer: a few warm words in the sky after every 5 minutes of play (paused while the app is hidden or a mini game runs) ----------
   It takes turns with the other things on the beach: it waits until no radio or resident is talking, no fresh question is waiting
   and no message is up; while it shows, radios and residents stay quiet, and they come back 10 seconds after it goes. */
const CHEER_EVERY=5*60*1000,CHEER_REST=10000;let cheerAt=0,cheerLast=performance.now(),cheerBag=[],cheerOn=false;
const cheerDue=()=>ST.cheer&&cheerAt>=CHEER_EVERY;   // once due, radios and residents hold their next turn so it can come in
const beachBusy=()=>talking||folkNow||(cur&&!cur.done&&performance.now()-cur.t0<7000)||document.querySelector('#toast.on');
const cheerEl=document.createElement('div');cheerEl.id='cheerBox';cheerEl.hidden=true;$('window').appendChild(cheerEl);
function cheerShow(){if(!cheerBag.length)cheerBag=shuffle(CHEER.map((c,i)=>i));const [en,ja,who]=CHEER[cheerBag.pop()];
  cheerEl.innerHTML=`${en?`<p class="che">${esc(en)} <i>🔊</i></p>`:''}<p class="chj">${esc(ja)}</p>${who?`<small>— ${esc(who)}</small>`:''}`;
  cheerOn=true;if(cur&&!cur.done)radioQuiet();cheerEl.hidden=false;cheerEl.classList.remove('on','bye');void cheerEl.offsetWidth;cheerEl.classList.add('on');SFX.chime();
  cheerEl.onclick=()=>{if(en){say('cheer',en);clearTimeout(cheerEl._t);cheerEl._t=setTimeout(cheerHide,8000)}else cheerHide()};
  clearTimeout(cheerEl._t);cheerEl._t=setTimeout(cheerHide,en?12000:9000)}
function cheerHide(){if(cheerEl.hidden)return;cheerOn=false;const t=performance.now()+CHEER_REST;nextAt=Math.max(nextAt,t);folkNext=Math.max(folkNext,t);cheerEl.classList.add('bye');setTimeout(()=>{cheerEl.hidden=true;cheerEl.classList.remove('on','bye')},400)}
setInterval(()=>{const now=performance.now(),dt=now-cheerLast;cheerLast=now;if(document.hidden||!ST.cheer)return;cheerAt+=dt;
  if(cheerAt>=CHEER_EVERY&&!cheerOn&&!$('ar')&&!beachBusy()){cheerAt=0;cheerShow()}},2000);

/* ---------- radios on the beach ---------- */
/* one radio of each kind: extra copies from older saves are sold back for half price */
function oneRadioEach(list){const out=list.filter((r,i)=>list.findIndex(x=>x.lv===r.lv)===i),gone=list.filter(r=>!out.includes(r));
  if(gone.length){const back=gone.reduce((a,r)=>a+((LEVELS[r.lv]&&LEVELS[r.lv].price||0)/2|0),0);ST.coins+=back;
    setTimeout(()=>{save();head();toast(`📻 おなじ ラジオは 1台まで に なったよ<small>2台目からを うって ${back}まい もどしたよ</small>`,3600)},1500)}
  return out}
const layer=document.createElement('div');layer.id='radios';$('window').appendChild(layer);
const bub=document.createElement('div');bub.id='abubs';$('window').appendChild(bub);
/* where the campfire sits, as fractions of the beach window, so radios keep clear of it */
function fireSpot(){try{const d=SC.dbg(),[fx,fy]=d.fire;return [(fx-d.WL)/d.WW,(fy-d.WT)/d.WH]}catch(e){return [.42,.8]}}
function clearOfFire(x,y){const [fx,fy]=fireSpot();return Math.abs(x-fx)>.17||Math.abs(y-fy)>.12}
function freeSpot(skip){const others=ST.radios.filter(r=>r!==skip);
  for(let t=0;t<80;t++){const x=.07+Math.random()*.86,y=.66+Math.random()*.1;if(clearOfFire(x,y)&&others.every(o=>Math.abs(o.x-x)>.1||Math.abs(o.y-y)>.06))return [x,y]}
  return [Math.random()<.5?.1:.9,.7]}
function placeRadios(){ST.radios.forEach(r=>{if(r.y==null||r.y>.78||!clearOfFire(r.x,r.y)){[r.x,r.y]=freeSpot(r)}})}
const isNight=()=>phaseOf(GH())[1]==='night';
const asleep=r=>LEVELS[r.lv].nightOnly&&!isNight();
function drawRadios(){layer.innerHTML=ST.radios.map((r,i)=>`<button class="radio ${r.on?'on':''} ${asleep(r)?'sleep':''}" data-i="${i}" style="left:${r.x*100}%;top:${r.y*100}%" aria-label="${LEVELS[r.lv].name}ラジオ ${r.on?'オン':'オフ'}"><span class="rb">📻</span><b class="lv-${r.lv}">${LEVELS[r.lv].short}</b>${asleep(r)?'<i class="zz">💤</i>':''}</button>`).join('');
  layer.querySelectorAll('.radio').forEach(b=>b.onclick=()=>{const r=ST.radios[+b.dataset.i];r.on=!r.on;save();drawRadios();SFX.beep(r.on?880:440);toast(`📻 ${LEVELS[r.lv].name}ラジオ <b>${r.on?'オン':'オフ'}</b>${asleep(r)?'<small>夜に なると しゃべるよ 💤</small>':''}`,1600);if(screen==='home'){rqIdle();radioWake()}})}

let nextAt=0,talking=false,lastRadio=-1,cur=null;
function clearBubbles(){bub.querySelectorAll('.bubble').forEach(b=>{b.classList.add('gone');setTimeout(()=>b.remove(),260)})}
function radioQuiet(){talking=false;cur=null;stopClip();clearBubbles();layer.querySelectorAll('.talk').forEach(b=>b.classList.remove('talk'))}
const RADIO_REST=10000;  // after closing a panel, the radios wait this long before talking again
function radioWake(){nextAt=Math.min(nextAt||Infinity,performance.now()+1500)}
function rqIdle(){const el=$('rq');if(!el)return;const on=ST.radios.filter(r=>r.on).length;
  el.textContent=!ST.radios.length?'📻 ショップで 小学生ラジオを もらおう（むりょう）。浜辺で 英語を つぶやくよ':on?'📻 ラジオの こたえが 浜辺に うかぶよ。タップして コインを もらおう':'📻 ラジオが ぜんぶ オフだよ。浜辺の ラジオを タップすると オンになるよ'}
/* distractors must not share a meaning with the answer (e.g. 提案 / 提案する) */
const overlap=(a,b)=>{a=a.replace(/[〜（）・、。？！ ]/g,'');b=b.replace(/[〜（）・、。？！ ]/g,'');for(let i=0;i<a.length-1;i++)if(b.includes(a.slice(i,i+2)))return true;return false};
/* a radio line: a word, a sentence, a character / trend line, or (in season) a seasonal line */
/* what a radio says: words 45%, character/trend lines 15%, sentences the rest (seasonal lines join them in season),
   and once in a long while a comedy bit (game/extras/owarai.js) where the right answer is the tsukkomi */
let owaraiForce=false;const OWARAI_RATE=.02,owSay=t=>t.replace(/（[^）]*）/g,'').trim();
function makeLine(lv){const L=LEVELS[lv],r=Math.random(),sn=seasonNow();
  if(!L.nightOnly&&(owaraiForce||Math.random()<OWARAI_RATE)){owaraiForce=false;const o=pick(OWARAI);return {lv,src:'owarai',en:o[0],ja:o[1],say:owSay(o[0]),opts:shuffle(o.slice(1,4)),reward:3}}
  const pool=r<.45?allWords(lv):L.pop&&r<.6?L.pop:sn&&!L.nightOnly&&r<.7?[...sn[1].talk,...L.talk]:L.talk.length?L.talk:allWords(lv);
  const ans=pick(pool),n=L.choices;
  const others=shuffle(pool.filter(o=>o!==ans&&o[0]!==ans[0]&&o[1]!==ans[1]&&!overlap(o[1],ans[1]))).slice(0,n-1);
  return {lv,en:ans[0],ja:ans[1],opts:shuffle([ans[1],...others.map(o=>o[1])])}}
function tick(){
  if(screen!=='home'||talking||cheerOn||cheerDue()||document.hidden||performance.now()<nextAt)return;
  if(cur&&cur.src==='folk'&&!cur.done)return;                // a resident is talking
  const on=ST.radios.map((r,i)=>[r,i]).filter(([r])=>r.on&&!asleep(r));if(!on.length)return;
  let pickd=pick(on);if(on.length>1)while(pickd[1]===lastRadio)pickd=pick(on);
  const [r,ri]=pickd;lastRadio=ri;cur=makeLine(r.lv);cur.ri=ri;cur.t0=performance.now();talking=true;
  const btn=layer.querySelector(`[data-i="${ri}"]`);btn&&btn.classList.add('talk');
  SFX.tick();drawLine(r);
  const c=cur;setTimeout(()=>{if(cur!==c){talking=false;return}say(c.lv,c.say||c.en,()=>{talking=false;btn&&btn.classList.remove('talk');nextAt=performance.now()+ST.radioGap*1000})},250);
}
setInterval(tick,250);
/* wake the star radios at nightfall (and put them to sleep at dawn) */
let wasNight=isNight();setInterval(()=>{const n=isNight();if(n!==wasNight){wasNight=n;drawRadios();if(n&&ST.radios.some(r=>r.on&&LEVELS[r.lv].nightOnly))toast('🌙 星空ラジオが 目を さました')}},2000);
const BC=['#ffe066','#ff9ec4','#8ff0c8','#9fd3ff','#d4b8ff','#ffc078'];
const RISE=9,FAST_MS=5000;
/* the radio's line pops up above it; the answers rise from the sand one by one, like the poker mumbles */
function bubbleEl(html,cls){const b=document.createElement('div');b.className='bubble ab '+cls;
  b.innerHTML=`<span class="in" style="--bc:${pick(BC)};--tilt:${(Math.random()*8-4).toFixed(1)}deg">${html}${Math.random()<.35?'<i class="sp a">✦</i><i class="sp b">✦</i>':''}</span>`;bub.appendChild(b);return b}
function clampX(b,W){const w=b.offsetWidth,l=parseFloat(b.style.left);b.style.left=Math.max(6,Math.min(W.width-6-w,l))+'px'}
function drawLine(r){const c=cur;clearBubbles();const W=bub.getBoundingClientRect();
  /* the radio's English line sits at the top of the sky, in front of everything, so answers never cover it */
  const line=bubbleEl(c.src==='owarai'?`🎤<b class="lvt owat">お笑い</b> ${esc(c.en)} <i class="again">🔁</i>`:c.src==='folk'?`${c.ico}<b class="lvt folkt">${esc(c.who)}</b> ${esc(c.en)} <i class="again">🔁</i>`:`📻<b class="lvt lv-${c.lv}">${LEVELS[c.lv].short}</b> ${esc(c.en)} <i class="again">🔁</i>`,'line');
  line.style.left=(W.width/2-line.offsetWidth/2)+'px';line.style.top='10px';clampX(line,W);
  line.onclick=()=>say(c.lv,c.say||c.en);
  /* answers are born on the sand and float up like balloons until they press against the line */
  const lw=line.offsetWidth,lh=line.offsetHeight,lx=parseFloat(line.style.left)+lw/2,ly=10+lh/2;
  const room={w:W.width,floor:W.height*.86,fixed:[{x:lx,y:ly,r:lh/2,a:Math.max(0,lw/2-lh/2),im:0,vx:0,vy:0}]};
  shuffle(c.opts.map((o,i)=>i)).forEach((i,k)=>setTimeout(()=>{if(cur!==c)return;
    const b=bubbleEl(esc(c.opts[i]),'opt');b.dataset.o=i;b.onclick=()=>answer(c,i,b);
    const w=b.offsetWidth,h=b.offsetHeight,x=w/2+8+Math.random()*(room.w-w-16);
    addBody({el:b,w,h,x,y:room.floor-h/2,vx:Math.random()*30-15,vy:-40-Math.random()*30,born:performance.now(),room,c});SFX.pop()},350+k*520));
  /* nobody answered: the question drifts away with its bubbles */
  setTimeout(()=>{if(cur===c&&!c.done)cur=null},350+c.opts.length*520+RISE*1000)}
/* ---------- bubble physics ----------
   each bubble is a horizontal capsule (a pill: segment of half-length a, radius r) with mass from its area.
   Buoyancy lifts it, air drag slows it, and contacts are solved with impulses (restitution + friction).
   The hit also feeds a spring that squashes the bubble along the contact normal, so it wobbles back. */
const BUOY=230,DRAG=1.7,REST=.45,FRIC=.25,SQ_K=380,SQ_C=11,SUB=3;
let bodies=[],phys=0,lastT=0;
function addBody(o){Object.assign(o,{r:o.h/2,a:Math.max(0,o.w/2-o.h/2),d:0,dv:0,nx:0,ny:1,tilt:0});o.im=1/(o.w*o.h/1000);
  o.el.style.left='0';o.el.style.top='0';bodies.push(o);place(o);if(!phys){lastT=performance.now();phys=requestAnimationFrame(step)}}
function place(o){const th=Math.atan2(o.ny,o.nx),d=Math.max(-.16,Math.min(.22,o.d));
  o.el.style.transform=`translate(${(o.x-o.w/2).toFixed(1)}px,${(o.y-o.h/2).toFixed(1)}px) rotate(${o.tilt.toFixed(2)}deg) rotate(${th}rad) scale(${(1-d).toFixed(3)},${(1+d*.8).toFixed(3)}) rotate(${-th}rad)`}
/* a hit squashes the bubble along the normal; harder hits squash more */
function squash(o,nx,ny,dv){if(!o.el||o.frozen)return;const k=Math.min(.9,dv*.0045);if(k<.02)return;
  if(Math.abs(o.d)<.03){o.nx=nx;o.ny=ny}o.dv+=k*6}
/* closest approach of two horizontal capsules */
function contact(A,B){const dx=B.x-A.x,gap=Math.abs(dx)-(A.a+B.a),cx=gap>0?Math.sign(dx)*gap:0,cy=B.y-A.y;
  let len=Math.hypot(cx,cy);const pen=A.r+B.r+3-len;if(pen<=0)return null;
  if(len<1e-3)return {nx:0,ny:-1,pen};return {nx:cx/len,ny:cy/len,pen}}
function solve(A,B){const n=contact(A,B);if(!n)return;const ia=A.frozen?0:A.im,ib=B.frozen?0:B.im,is=ia+ib;if(!is)return;
  const rvx=B.vx-A.vx,rvy=B.vy-A.vy,vn=rvx*n.nx+rvy*n.ny;
  if(vn<0){const j=-(1+REST)*vn/is;A.vx-=j*ia*n.nx;A.vy-=j*ia*n.ny;B.vx+=j*ib*n.nx;B.vy+=j*ib*n.ny;
    const tx=-n.ny,ty=n.nx,vt=rvx*tx+rvy*ty,jt=Math.max(-FRIC*j,Math.min(FRIC*j,-vt/is));A.vx-=jt*ia*tx;A.vy-=jt*ia*ty;B.vx+=jt*ib*tx;B.vy+=jt*ib*ty;
    squash(A,n.nx,n.ny,-vn*ia/is*2);squash(B,n.nx,n.ny,-vn*ib/is*2)}
  const corr=Math.max(0,n.pen-.5)*.6/is;A.x-=n.nx*corr*ia;A.y-=n.ny*corr*ia;B.x+=n.nx*corr*ib;B.y+=n.ny*corr*ib}
function walls(o){const R=o.room,L=o.a+o.r;
  if(o.x-L<6){o.x=6+L;if(o.vx<0){squash(o,1,0,-o.vx);o.vx=-o.vx*REST}}
  if(o.x+L>R.w-6){o.x=R.w-6-L;if(o.vx>0){squash(o,-1,0,o.vx);o.vx=-o.vx*REST}}
  if(o.y-o.r<4){o.y=4+o.r;if(o.vy<0){squash(o,0,1,-o.vy);o.vy=-o.vy*REST}}}
function step(now){const DT=Math.min(.05,(now-lastT)/1000);lastT=now;const dt=DT/SUB;
  for(let s=0;s<SUB;s++){
    for(const o of bodies){if(o.frozen||o.fading)continue;
      o.vy-=BUOY*dt;o.vx+=Math.sin(now/900+o.born)*10*dt;                 // buoyancy and a light breeze
      const drag=Math.exp(-DRAG*dt);o.vx*=drag;o.vy*=drag;o.x+=o.vx*dt;o.y+=o.vy*dt}
    const live=bodies.filter(o=>!o.fading);
    for(let i=0;i<live.length;i++){for(let j=i+1;j<live.length;j++)solve(live[i],live[j]);for(const f of live[i].room.fixed)solve(f,live[i])}
    live.forEach(o=>{if(!o.frozen)walls(o)})}
  for(const o of bodies){
    o.dv+=(-SQ_K*o.d-SQ_C*o.dv)*DT;o.d+=o.dv*DT;                             // squash spring
    o.tilt+=((Math.max(-9,Math.min(9,o.vx*.06)))-o.tilt)*Math.min(1,DT*5);
    if(now-o.born>RISE*1000&&!o.fading){o.fading=1;o.el.classList.add('gone')}}
  bodies=bodies.filter(o=>{if(o.fading&&now-o.born>RISE*1000+400){o.el.remove();return false}return o.el.isConnected});
  bodies.forEach(place);
  phys=bodies.length?requestAnimationFrame(step):0}
/* keep the line bubble inside the beach window when the screen size changes */
function fitBubbles(){const W=bub.getBoundingClientRect();bub.querySelectorAll('.bubble.line').forEach(b=>clampX(b,W));bodies.forEach(o=>o.room.w=W.width)}
function answer(c,i,b){if(c!==cur||c.done)return;c.done=1;const ok=c.opts[i]===c.ja,L=LEVELS[c.lv];
  bodies.forEach(o=>{if(o.c===c){o.frozen=1;o.vx=o.vy=0}});
  bub.querySelectorAll('.opt').forEach(x=>{if(c.opts[+x.dataset.o]===c.ja)x.classList.add('right');else if(x!==b)x.classList.add('gone')});
  const rc=b.getBoundingClientRect(),cx=rc.left+rc.width/2,cy=rc.top+rc.height/2;
  /* a quick answer (within FAST_MS of the line starting) earns the level's fast reward */
  const quick=L&&L.fast&&performance.now()-c.t0<=FAST_MS,amt=c.reward||(quick?L.fast:L.reward);
  if(ok){coinBurst(cx,cy,amt,quick);FX.ring(cx,cy,'#ffd23f');FX.firework(cx,cy-10);SFX.chime()}
  else{b.classList.add('wrong');SFX.tie()}
  if(c.src==='folk')folkDone(ok);
  if(c.src==='owarai'){nextAt=Math.max(nextAt,performance.now()+4000);if(ok){toast('🎤 ナイス ツッコミ！');setTimeout(()=>{if(cur===c)say('owarai',c.ja)},350)}else toast('🎤 そこは ツッコまな〜')}
  setTimeout(()=>{if(cur===c){cur=null;clearBubbles()}},ok?1500:2400)}
/* coins burst out of the bubble and fly into the coin counter, ringing as each one lands */
function coinBurst(x,y,amt,quick){const tg=document.querySelector('.coin i').getBoundingClientRect(),tx=tg.left+tg.width/2,ty=tg.top+tg.height/2;
  const n=Math.min(12,Math.max(3,amt*2));let left=amt;flyCoin(x,y-18,amt,quick);
  for(let k=0;k<n;k++){const share=k===n-1?left:Math.floor(amt/n);left-=share;
    const d=document.createElement('i');d.className='cfly';document.body.appendChild(d);
    const a=Math.random()*Math.PI*2,sp=36+Math.random()*46,mx=x+Math.cos(a)*sp,my=y+Math.sin(a)*sp-24;
    const an=d.animate([{transform:`translate(${x}px,${y}px) scale(.3)`,opacity:1},{transform:`translate(${mx}px,${my}px) scale(1.15)`,opacity:1,offset:.32},{transform:`translate(${tx}px,${ty}px) scale(.6)`,opacity:.9}],
      {duration:760+k*70,easing:'cubic-bezier(.45,0,.55,1)',fill:'forwards'});
    an.onfinish=()=>{d.remove();if(share)addCoins(share);SFX.coin()}}}

/* ---------- beach residents ----------
   the more decorations on the beach, the more residents drop by. One walks in now and then;
   tap it and it says something in English — pick the right Japanese for coins. */
const folkLayer=document.createElement('div');folkLayer.id='folk';$('window').appendChild(folkLayer);
const FOLK_REWARD=5;
/* a resident drops by once every ten minutes */
const FOLK_EVERY=10*60*1000;
let folkNow=null,folkNext=performance.now()+FOLK_EVERY;
const decoCount=()=>Object.keys(ST.deco||{}).length;
function folkUnlocked(){const n=Math.min(FOLK.length,1+Math.floor(decoCount()/3));return FOLK.slice(0,n).filter(f=>!f[4]||isNight()).concat(isNight()&&n<FOLK.length?[FOLK.find(f=>f[4])]:[])}
function folkSpawn(){const pool=folkUnlocked().filter(Boolean);if(!pool.length)return;const F=pick(pool),[fx]=fireSpot();
  let x;do{x=.12+Math.random()*.76}while(Math.abs(x-fx)<.16);const from=Math.random()<.5?-.08:1.08;
  const el=document.createElement('button');el.className='folk';el.innerHTML=`<span class="fe">${F[1]}</span><b>${F[2]}</b><i class="fq">💬</i>`;
  el.style.left=from*100+'%';el.style.top=(.72+Math.random()*.06)*100+'%';el.setAttribute('aria-label',`${F[2]}（${F[3]}）`);folkLayer.appendChild(el);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.left=x*100+'%'}));el.classList.toggle('flip',from>x);
  folkNow={F,el,x,until:performance.now()+26000,talked:false};
  el.onclick=()=>folkTalk()}
function folkLeave(){const f=folkNow;if(!f)return;folkNow=null;const el=f.el;el.classList.remove('flip');el.classList.toggle('flip',f.x>.5);el.style.left=(f.x>.5?1.1:-.1)*100+'%';el.classList.add('bye');setTimeout(()=>el.remove(),3200);folkNext=performance.now()+FOLK_EVERY}
/* a resident's line uses the same floating answers as the radios */
function folkTalk(){const f=folkNow;if(!f||f.talked||screen!=='home')return;if(cur&&!cur.done&&talking)return;
  f.talked=true;f.el.querySelector('.fq').textContent='…';radioQuiet();
  const lines=f.F[5],ans=pick(lines),others=shuffle(FOLK.flatMap(x=>x[5]).filter(l=>l!==ans&&!overlap(l[1],ans[1]))).slice(0,2);
  cur={lv:'folk',src:'folk',who:f.F[2],ico:f.F[1],en:ans[0],ja:ans[1],opts:shuffle([ans[1],...others.map(o=>o[1])]),reward:FOLK_REWARD,t0:performance.now()};
  drawLine({x:f.x,y:.7});talking=true;f.el.classList.add('talk');say('folk',ans[0],()=>{talking=false;f.el.classList.remove('talk')})}
function folkDone(ok){const f=folkNow;if(!f)return;f.el.querySelector('.fq').textContent=ok?'❤️':'💦';setTimeout(folkLeave,1800);nextAt=Math.max(nextAt,performance.now()+4000)}
setInterval(()=>{const now=performance.now();
  if(folkNow&&(now>folkNow.until&&!(cur&&cur.src==='folk'&&!cur.done)))folkLeave();
  if(!folkNow&&!cheerOn&&!cheerDue()&&screen==='home'&&!document.hidden&&now>folkNext&&!(cur&&!cur.done))folkSpawn()},1000);

/* ---------- grammar notes (game/grammar/*.js): bought in the shop, read and practised here ---------- */
const GLV=['es','jh','hs'];
const gOwned=id=>ST.gram.owned.includes(id),gCleared=id=>ST.gram.cleared.includes(id);
function gramList(lv='es'){
  const G=GRAMMAR[lv],own=G.notes.filter(n=>gOwned(n.id)).length,clr=G.notes.filter(n=>gCleared(n.id)).length;
  show('gram',`<section class="pnl gram">
    <div class="qtop"><button class="x" id="gx" aria-label="もどる">←</button><b>📚 文法ノート</b><span class="qn">✓ ${clr}/${G.notes.length}</span></div>
    <div class="seg">${GLV.map(k=>`<button data-gl="${k}" class="${lv===k?'on':''}">${GRAMMAR[k].ico} ${GRAMMAR[k].name}</button>`).join('')}</div>
    <div class="rlist glist">${G.notes.map((n,i)=>{const o=gOwned(n.id),c=gCleared(n.id);
      return `<button class="gnote ${o?'':'locked'} ${c?'clear':''}" data-gn="${i}"><span class="gi">${c?'✅':o?'📘':'🔒'}</span><span class="gt">${i+1}. ${esc(n.t)}</span><small>${c?'クリア':o?'よめるよ':'ショップで かえるよ'}</small></button>`}).join('')}</div>
    ${own<G.notes.length?`<div class="row"><button id="gshop" class="sub">🛍️ ショップで 文法ノートを かう</button></div>`:''}
  </section>`);
  $('gx').onclick=()=>{SFX.pop();home()};
  panel.querySelectorAll('[data-gl]').forEach(b=>b.onclick=()=>{SFX.pop();gramList(b.dataset.gl)});
  panel.querySelectorAll('[data-gn]').forEach(b=>b.onclick=()=>{const n=G.notes[+b.dataset.gn];if(!gOwned(n.id)){SFX.tie();toast(`🔒 ショップで「${n.t}」を かうと よめるよ`);return}SFX.flip();gramNote(lv,+b.dataset.gn)});
  const gs=$('gshop');if(gs)gs.onclick=()=>{SFX.vopen();shop('gram',lv)}}
function gramNote(lv,i){const G=GRAMMAR[lv],n=G.notes[i];loadAud('gram');
  show('gram',`<section class="pnl gram gview">
    <div class="qtop"><button class="x" id="gx" aria-label="ノートの 一覧に もどる">←</button><b>${esc(n.t)}</b><span class="qn">${G.ico}</span></div>
    <div class="gbody">
      <h4>📌 ルール</h4><ul class="grules">${n.r.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>
      <h4>💬 れいぶん</h4><div class="gex">${n.ex.map((e,j)=>`<button class="gexr" data-ex="${j}"><span class="ge">🔊 ${esc(e[0])}</span><small>${esc(e[1])}</small></button>`).join('')}</div>
    </div>
    <div class="row"><button id="gq">✏️ れんしゅう ${gCleared(n.id)?'（クリアずみ）':`（クリアで 🪙${G.reward}）`}</button></div>
  </section>`);
  $('gx').onclick=()=>{SFX.pop();gramList(lv)};
  panel.querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>say('gram',n.ex[+b.dataset.ex][0]));
  $('gq').onclick=()=>{SFX.deal();gramQuiz(lv,i)}}
function gramQuiz(lv,i){const G=GRAMMAR[lv],n=G.notes[i];let k=0,miss=0;
  const ask=()=>{const q=n.q[k],[before,after]=q[0].split('___');
    show('gram',`<section class="pnl gram quizg">
      <div class="qtop"><button class="x" id="gx" aria-label="ノートに もどる">←</button><b>✏️ ${esc(n.t)}</b><span class="qn">${k+1}/${n.q.length}</span></div>
      <p class="gsent">${esc(before)}<span class="blank" id="bl">？</span>${esc(after)}</p>
      <p class="note">${esc(q[3])}</p>
      <div class="gopts">${q[1].map((o,j)=>`<button data-go="${j}">${esc(o)}</button>`).join('')}</div>
    </section>`);
    $('gx').onclick=()=>{SFX.pop();gramNote(lv,i)};
    panel.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{const j=+b.dataset.go,ok=j===q[2];panel.querySelectorAll('[data-go]').forEach(x=>x.disabled=true);
      const right=panel.querySelector(`[data-go="${q[2]}"]`);right.classList.add('right');$('bl').textContent=q[1][q[2]];$('bl').classList.add(ok?'ok':'ng');
      if(ok)SFX.coin();else{miss++;b.classList.add('wrong');SFX.tie()}
      setTimeout(()=>{k++;k<n.q.length?ask():finish()},ok?800:1600)})};
  const finish=()=>{const first=!miss&&!gCleared(n.id);if(!miss&&!gCleared(n.id)){ST.gram.cleared.push(n.id);save()}
    show('gram',`<section class="pnl gram chest">
      <div class="box">${miss?'📝':'💯'}</div><b class="ct">${miss?`${n.q.length-miss}/${n.q.length} せいかい`:'ぜんもん せいかい！'}</b>
      <p class="note">${miss?'ルールを 見なおして もう一度 ちょうせんしよう':first?`「${esc(n.t)}」を クリア！`:'クリアずみの ノートだよ'}</p>
      <div class="row">${miss?'<button id="gr">もう一度</button>':''}<button id="gb" class="sub">ノートに もどる</button></div>
    </section>`);
    if(!miss){SFX.fanfare(1);if(first){const r=panel.getBoundingClientRect();coinBurst(r.left+r.width/2,r.top+60,G.reward)}}
    const gr=$('gr');if(gr)gr.onclick=()=>gramQuiz(lv,i);$('gb').onclick=()=>gramNote(lv,i)};
  ask()}

/* ---------- shop ---------- */
const nowPh=()=>phaseOf(GH())[1];
const onSale=it=>!it.t||it.t.includes(nowPh());
/* "🌙 夜専用" etc. for events that only happen at some times of day */
function timeBadge(t){const k=t.join(',');return ({'night':'🌙 夜専用','sunset,night':'🌙 夕暮れ・夜専用','sunset,night,dawn':'🌙 夕暮れ〜夜明け専用','dawn,morning':'🌅 朝専用','noon':'☀️ 昼専用','morning,noon,evening':'☀️ 昼間専用','noon,evening':'☀️ 昼〜夕方専用','sunset':'🌇 夕暮れ専用','morning,noon,evening,sunset':'☀️ 朝〜夕暮れ専用','noon,evening,sunset,night':'🎪 昼〜夜専用'})[k]||t.map(x=>PH_LABEL[x]).join('・')+'専用'}
/* real minutes until the first of these times of day begins (one game day = three real hours) */
function minutesUntil(t){const h=GH();let best=24;for(const x of t){const st=PHASES.find(p=>p[1]===x)[0];best=Math.min(best,(st-h+24)%24)}return Math.max(1,Math.ceil(best*60*10800/1440/60))}
function row(ico,name,desc,btns,cls=''){return `<div class="ritem ${cls}"><span class="ri">${ico}</span><span class="rn"><b>${name}</b><small>${desc}</small></span><span class="rbtn">${btns}</span></div>`}
const coin=n=>n?'🪙'+n.toLocaleString():'むりょう';
let shopScroll=0;
function shop(tab,glv='es'){
  const TABS=[['radio','📻','ラジオ'],['deco','🏖️','かざり'],['music','🎵','おんがく'],['event','🎆','イベント'],['gram','📚','文法']];
  let body='';
  if(tab==='radio')body=[...LV_ORDER,'star'].map(k=>{const L=LEVELS[k],n=ST.radios.filter(r=>r.lv===k).length;
    return row(`📻<b class="lv-${k}">${L.short}</b>`,`${L.name}ラジオ${L.nightOnly?' <em class="tb">🌙 夜だけ しゃべる</em>':''}`,`${L.nightOnly?'星と 宇宙の 英語・':''}${L.choices}たく・せいかい +${L.reward}${L.fast?`（${FAST_MS/1000}びょう いないなら +${L.fast}）`:''}　もっている ${n}だい`,
      `<button class="buy" data-k="${k}" ${n||ST.coins<L.price?'disabled':''}>${n?'✅ もっている':L.price?'かう '+coin(L.price):'もらう（むりょう）'}</button><button class="sell sub" data-k="${k}" ${n?'':'disabled'}>${L.price?'うる +'+(L.price/2|0):'てばなす'}</button>`)}).join('')
    +'<p class="note">ラジオは 1しゅるい 1台まで（小学生ラジオは むりょう）</p>';
  if(tab==='deco')body=CATALOG.deco.map(([n,c,ico,d,rare])=>{const has=hasDeco(n);
    if(rare)return row(ico,n+' <em class="tb rare">🗝️ レア</em>',has?'✨ 宝の地図で 手に入れた たからもの':'宝の地図の 宝箱から 見つかる',`<button class="buy" disabled>${has?'たからもの':'🗺️ 宝の地図'}</button>`,has?'has':'off');
    return row(ico,n,has?'✨ 浜辺に かざっているよ':d,has?`<button class="sell sub" data-sd="${n}">うる +${c/2|0}</button>`:`<button class="buy" data-bd="${n}" ${ST.coins<c?'disabled':''}>かう ${coin(c)}</button>`,has?'has':'')}).join('')
    +'<p class="note">うると かった ねだんの はんぶんが もどってくる</p>';
  if(tab==='music')body=CATALOG.music.filter(([id])=>TRACKS[id]).map(([id,c,ico,d,rare])=>{const has=ST.music.includes(id),pl=MUS.on&&MUS.id===id;
    const name=esc(TRACKS[id].name)+(rare?' <em class="tb rare">🗝️ レア</em>':'');
    if(rare&&!has)return row(ico,name,'宝の地図の 宝箱から 見つかる','<button class="buy" disabled>🗺️ 宝の地図</button>','off');
    return row(ico,name,pl?'🎵 いま ながれているよ':d,has?`<button class="play ${pl?'on':''}" data-pl="${id}">${pl?'■ とめる':'▶ ながす'}</button>${rare?'':`<button class="sell sub" data-sm="${id}">うる +${c/2|0}</button>`}`:`<button class="buy" data-bm="${id}" ${ST.coins<c?'disabled':''}>かう ${coin(c)}</button>`,has?'has':'')}).join('')
    +'<p class="note">いちど かえば いつでも ながせるよ。ラジオが しゃべる時は 小さくなる</p>';
  if(tab==='event'){const ph=nowPh(),ev=CATALOG.event.filter(e=>!e.rare).sort((a,b)=>a.p-b.p),now=ev.filter(onSale),later=ev.filter(it=>!onSale(it));
    const evRow=(it,ok)=>row(it.ico,it.n+(it.t?` <em class="tb">${timeBadge(it.t)}</em>`:''),ok?it.d:`あと やく${minutesUntil(it.t)}ぷんで かえるよ`,
      ok?`<button class="buy" data-ev="${it.id}" ${ST.coins<it.p?'disabled':''}>かう ${coin(it.p)}</button>`:`<button class="buy" disabled>いまは かえない</button>`,ok?'':'off');
    body=`<p class="note">いまは ${PH_LABEL[ph]}。かうと 浜辺で すぐ はじまるよ</p>`+now.map(it=>evRow(it,true)).join('')
      +(later.length?`<p class="sub-h">⏳ いまは かえない イベント</p>`+later.map(it=>evRow(it,false)).join(''):'')}
  if(tab==='gram'){const G=GRAMMAR[glv],left=G.notes.filter(n=>!gOwned(n.id)),setP=Math.floor(left.length*G.price*.8/10)*10;
    body=`<div class="seg">${GLV.map(k=>`<button data-sg="${k}" class="${glv===k?'on':''}">${GRAMMAR[k].ico} ${GRAMMAR[k].name}</button>`).join('')}</div>`
      +(left.length>1?`<div class="ritem set"><span class="ri">📦</span><span class="rn"><b>${G.name}の 文法ノート まとめて ${left.length}さつ</b><small>2わり びき（ばらばらだと 🪙${(left.length*G.price).toLocaleString()}）</small></span><span class="rbtn"><button class="buy" data-gset="${glv}" ${ST.coins<setP?'disabled':''}>かう ${coin(setP)}</button></span></div>`:'')
      +G.notes.map((n,i)=>{const o=gOwned(n.id);return row(o?'📘':'📕',`${i+1}. ${esc(n.t)}`,o?'✨ もっているよ（ホームの 📚 文法から よめる）':`ルール・れいぶん・れんしゅう3もん`,o?`<button class="play" data-gopen="${i}">ひらく</button>`:`<button class="buy" data-gb="${n.id}" ${ST.coins<G.price?'disabled':''}>かう ${coin(G.price)}</button>`,o?'has':'')}).join('')}
  show('shop',`<section class="pnl shop">
    <div class="qtop"><button class="x" id="sx" aria-label="ショップを とじる">←</button><b>🛍️ ショップ</b><span></span></div>
    <div class="seg tabs">${TABS.map(([k,i,n])=>`<button data-t="${k}" class="${tab===k?'on':''}"><span>${i}</span>${n}</button>`).join('')}</div>
    <div class="rlist" id="slist">${body}</div>
  </section>`);
  const sl=$('slist');if(shop.last===tab+glv)sl.scrollTop=shopScroll;shop.last=tab+glv;sl.onscroll=()=>{shopScroll=sl.scrollTop};
  $('sx').onclick=()=>{SFX.pop();home()};
  panel.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{SFX.pop();shopScroll=0;shop(b.dataset.t)});
  const spend=(c,b)=>{if(ST.coins<c)return false;ST.coins-=c;save();head();const r=b.getBoundingClientRect();FX.ring(r.left+r.width/2,r.top+r.height/2,'#ffd23f');return true};
  /* radios */
  panel.querySelectorAll('[data-k].buy').forEach(b=>b.onclick=()=>{const k=b.dataset.k,L=LEVELS[k];if(ST.radios.some(r=>r.lv===k)||!spend(L.price,b))return;
    const [x,y]=freeSpot();ST.radios.push({lv:k,on:true,x,y});save();drawRadios();SFX.save();toast(`📻 <b>${L.name}ラジオ</b> を 浜辺に おいた！`);shop('radio')});
  panel.querySelectorAll('[data-k].sell').forEach(b=>b.onclick=()=>{const k=b.dataset.k,L=LEVELS[k];let idx=-1;ST.radios.forEach((r,i)=>{if(r.lv===k)idx=i});if(idx<0)return;
    ST.radios.splice(idx,1);if(L.price)addCoins(L.price/2|0);save();drawRadios();SFX.coin();toast(`📻 ${L.name}ラジオを ${L.price?'うった':'てばなした'}`);shop('radio')});
  /* decorations */
  panel.querySelectorAll('[data-bd]').forEach(b=>b.onclick=()=>{const n=b.dataset.bd,it=CATALOG.deco.find(d=>d[0]===n);if(hasDeco(n)||!spend(it[1],b))return;
    ST.deco[n]=true;save();SC.update(ST.coins);SFX.save();toast(`${it[2]} <b>${n}</b> を かざった！`);shop('deco')});
  panel.querySelectorAll('[data-sd]').forEach(b=>b.onclick=()=>{const n=b.dataset.sd,it=CATALOG.deco.find(d=>d[0]===n);if(!hasDeco(n))return;
    delete ST.deco[n];addCoins(it[1]/2|0);SC.update(ST.coins);SFX.coin();toast(`${it[2]} ${n}を うった`);shop('deco')});
  /* music */
  panel.querySelectorAll('[data-bm]').forEach(b=>b.onclick=()=>{const id=b.dataset.bm,it=CATALOG.music.find(m=>m[0]===id);if(ST.music.includes(id)||!spend(it[1],b))return;
    ST.music.push(id);save();SFX.save();playTrack(id);shop('music')});
  panel.querySelectorAll('[data-pl]').forEach(b=>b.onclick=()=>{const id=b.dataset.pl;if(MUS.on&&MUS.id===id){stopMusic(true)}else playTrack(id);setTimeout(()=>shop('music'),60)});
  panel.querySelectorAll('[data-sm]').forEach(b=>b.onclick=()=>{const id=b.dataset.sm,it=CATALOG.music.find(m=>m[0]===id);
    if(MUS.on&&MUS.id===id)stopMusic(true);ST.music=ST.music.filter(m=>m!==id);addCoins(it[1]/2|0);save();SFX.coin();toast(`🎵 ${TRACKS[id].name}を うった`);shop('music')});
  /* grammar notes */
  panel.querySelectorAll('[data-sg]').forEach(b=>b.onclick=()=>{SFX.pop();shopScroll=0;shop('gram',b.dataset.sg)});
  panel.querySelectorAll('[data-gb]').forEach(b=>b.onclick=()=>{const G=GRAMMAR[glv],n=G.notes.find(x=>x.id===b.dataset.gb);if(gOwned(n.id)||!spend(G.price,b))return;
    ST.gram.owned.push(n.id);save();SFX.save();toast(`📘 <b>${n.t}</b><small>ホームの 📚 文法から よめるよ</small>`);shop('gram',glv)});
  panel.querySelectorAll('[data-gset]').forEach(b=>b.onclick=()=>{const G=GRAMMAR[glv],left=G.notes.filter(n=>!gOwned(n.id)),setP=Math.floor(left.length*G.price*.8/10)*10;if(!spend(setP,b))return;
    left.forEach(n=>ST.gram.owned.push(n.id));save();SFX.fanfare(1);toast(`📦 <b>${G.name}の 文法ノート ${left.length}さつ</b> を かった！`);shop('gram',glv)});
  panel.querySelectorAll('[data-gopen]').forEach(b=>b.onclick=()=>{SFX.flip();gramNote(glv,+b.dataset.gopen)});
  /* events: buy, close the shop and watch it happen on the beach */
  panel.querySelectorAll('[data-ev]').forEach(b=>b.onclick=()=>{const it=CATALOG.event.find(e=>e.id===b.dataset.ev);if(!onSale(it)||!spend(it.p,b))return;
    SFX.chime();home();toast(`${it.ico} <b>${it.n}</b>`,2200);setTimeout(()=>{try{it.k==='show'?SC.show(it.id,it.sec):SC.play(it.id)}catch(e){}},500)});
}
function playTrack(id){if(!ST.sound){toast('🔇 音を オンにすると きこえるよ');return}try{startMusic(id,3600)}catch(e){}toast(`🎵 ${TRACKS[id].name}`,1800)}

/* what the treasure map (game/adventure.js) needs from here */
window.HE={panel,show,home,say,loadAud,addCoins,toast,coinBurst,flyCoin,head,esc,shuffle,allWords,playTrack,cheerSoon:()=>{cheerAt=CHEER_EVERY},owaraiSoon:()=>{owaraiForce=true},folkSoon:()=>{folkNext=0},get screen(){return screen},get stage(){return {nextIn:Math.round(nextAt-performance.now()),talking,question:!!(cur&&!cur.done),cheer:cheerOn,folk:!!folkNow}}};
save();head();setTimeout(()=>{placeRadios();save();drawRadios()},300);home();SC.update(ST.coins);
addEventListener('resize',()=>{if(cur)fitBubbles()});
})();
