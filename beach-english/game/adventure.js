/* 宝の地図: 分かれ道のある地図を、ミニゲームをクリアしながら進む。
   ミニゲームのマスは挑戦にコインがいる（クリアで2倍もどる）。失敗すると1マス もどる。
   ゴールの宝箱には、ショップでは手に入らない レアな たからもの。 */
(()=>{
const {S:ST,sfx:SFX,scene:SC}=BEACH;
const H=HE,$p=()=>H.panel,esc=H.esc,shuffle=H.shuffle;

/* ---------- maps: nodes on a 100×140 board, each points to the nodes you can go to next ---------- */
const MAPS=[
 {name:'さざなみ海岸',sky:['#2b6fb3','#8ec9ef'],land:'#e8d3a2',
  reward:{deco:['ミラーボール'],music:['orch'],title:'さざなみの 冒険家'},
  nodes:{S:[50,128,'start',['a','b']],a:[28,110,'shell',['c']],b:[72,110,'star',['d']],c:[22,88,'dj',['e']],d:[76,90,'mys',['e','f']],
   e:[46,72,'shop',['g']],f:[80,68,'crab',['h']],g:[26,52,'star',['i']],h:[70,48,'dj',['i']],i:[48,32,'mys',['G']],G:[50,12,'goal',[]]}},
 {name:'ほたる入り江',sky:['#3b2f7a','#c06c84'],land:'#d9c08f',
  reward:{deco:['星のプロジェクター'],event:['goldrain'],title:'ほたる入り江の 探検家'},
  nodes:{S:[50,128,'start',['a','b','c']],a:[18,108,'dj',['d']],b:[50,106,'crab',['d','e']],c:[82,108,'star',['e']],d:[30,86,'mys',['f']],
   e:[68,86,'shop',['f','g']],f:[42,66,'star',['h']],g:[80,64,'suika',['h']],h:[60,46,'shell',['i','j']],i:[26,32,'shop',['G']],j:[80,30,'mys',['G']],G:[50,12,'goal',[]]}},
 {name:'星くず岬',sky:['#0b1030','#2c3f86'],land:'#b9a77f',
  reward:{deco:['星の門'],event:['dragon','mstorm'],title:'星くず岬の 伝説'},
  nodes:{S:[50,128,'start',['a','b']],a:[30,112,'star',['c','d']],b:[70,112,'dj',['d']],c:[14,92,'suika',['e']],d:[52,94,'mys',['e','f']],
   e:[30,74,'dj',['g']],f:[78,76,'star',['g','h']],g:[50,58,'shop',['i']],h:[84,52,'crab',['i']],i:[60,40,'dj',['j','k']],j:[30,28,'star',['G']],k:[78,24,'mys',['G']],G:[52,8,'goal',[]]}},
];
const GAMES={shell:{ico:'🐚',name:'貝がらつり',desc:'日本語に あう 英単語の 貝を ひろう'},dj:{ico:'📻',name:'DJチャレンジ',desc:'ながれた 英文を ならべかえる'},star:{ico:'✨',name:'星座つなぎ',desc:'きこえた 単語の つづりを なぞる'},
  suika:{ico:'🍉',name:'スイカ割り',desc:'カニの 英語の 指示どおりに すすんで スイカを わる'},crab:{ico:'🦀',name:'カニの早押し',desc:'きこえた 単語の カードを もった カニを タップ'}};
const NODE_ICO={start:'⛵',shop:'🏪',mys:'❓',goal:'💎',...Object.fromEntries(Object.entries(GAMES).map(([k,g])=>[k,g.ico]))};
const COST={es:5,jh:15,hs:30,adv:50};
const ITEMS={compass:{ico:'🧭',name:'コンパス',desc:'失敗しても もどらない',p:40},glass:{ico:'⏳',name:'砂時計',desc:'ゲーム中に 時間を +10びょう',p:20},hint:{ico:'💡',name:'ヒント貝',desc:'ゲーム中に 答えを 1回 光らせる',p:15}};
const RARE_EV={goldrain:{ico:'💰',n:'黄金の雨',sec:40},dragon:{ico:'🐉',n:'天翔ける龍',sec:45},mstorm:{ico:'🌠',n:'星降る夜',sec:60,t:['night']}};

/* ---------- save ---------- */
const A0={map:0,node:'S',trail:[],done:[],lv:'es',items:{compass:0,glass:0,hint:0},rareEv:[],titles:[],laps:0};
let AD;try{AD=Object.assign({},A0,JSON.parse(localStorage.getItem(SAVE_KEY)||'{}').adv||{})}catch(e){AD={...A0}}
AD.items=Object.assign({compass:0,glass:0,hint:0},AD.items);
_saveHooks.push(()=>{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');s.adv=AD;localStorage.setItem(SAVE_KEY,JSON.stringify(s))});
const map=()=>MAPS[AD.map%MAPS.length],cost=()=>COST[AD.lv]*(1+Math.floor(AD.map/MAPS.length));

/* ---------- the map screen ---------- */
function open(){
  const M=map(),N=M.nodes,cur=N[AD.node],next=cur[3];
  const edges=Object.entries(N).flatMap(([k,n])=>n[3].map(t=>[k,t]));
  const svg=`<svg class="amap" viewBox="0 0 100 140" role="img" aria-label="${M.name}の 地図">
    <defs><linearGradient id="sea${AD.map}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${M.sky[0]}"/><stop offset="1" stop-color="${M.sky[1]}"/></linearGradient></defs>
    <rect x="0" y="0" width="100" height="140" rx="6" fill="url(#sea${AD.map})"/>
    <path d="M8 138 C 4 100, 14 70, 10 40 C 8 20, 30 4, 50 4 C 74 4, 94 18, 90 44 C 86 70, 96 100, 92 138 Z" fill="${M.land}" opacity=".92"/>
    ${edges.map(([a,b])=>{const A=N[a],B=N[b],path=[...AD.trail,AD.node],walked=path.some((p,i)=>p===a&&path[i+1]===b);
      return `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" class="ae ${walked?'walked':''} ${a===AD.node?'open':''}"/>`}).join('')}
    ${Object.entries(N).map(([k,n])=>{const st=k===AD.node?'here':next.includes(k)?'next':AD.trail.includes(k)?'past':'';
      return `<g class="an ${st} t-${n[2]}" data-n="${k}" ${st==='next'?'tabindex="0" role="button"':''}><circle cx="${n[0]}" cy="${n[1]}" r="${n[2]==='goal'?7.5:6}"/><text x="${n[0]}" y="${n[1]+2.2}">${NODE_ICO[n[2]]}</text></g>`}).join('')}
    <text class="me" x="${cur[0]}" y="${cur[1]-8}">🧒</text>
  </svg>`;
  H.show('adv',`<section class="pnl adv">
    <div class="qtop"><button class="x" id="ax" aria-label="地図を とじる">←</button><b>🗺️ ${M.name}${AD.map>=MAPS.length?` <small>${Math.floor(AD.map/MAPS.length)+1}しゅうめ</small>`:''}</b><span class="qn">${AD.map%MAPS.length+1}/${MAPS.length}</span></div>
    <div class="seg lvsel">${LV_ORDER.map(k=>`<button data-alv="${k}" class="${AD.lv===k?'on':''}">${LEVELS[k].ico} ${LEVELS[k].short}</button>`).join('')}</div>
    <div class="mapwrap">${svg}</div>
    <div class="abag">${Object.entries(ITEMS).map(([k,it])=>`<span title="${it.name}：${it.desc}">${it.ico}×${AD.items[k]}</span>`).join('')}<span class="hint">光っている マスを タップして すすもう</span></div>
    ${AD.rareEv.length||AD.titles.length?`<div class="atre"><b>💎 たからもの</b>${AD.rareEv.map(id=>`<button data-call="${id}">${RARE_EV[id].ico} ${RARE_EV[id].n}を よぶ</button>`).join('')}${AD.titles.map(t=>`<span class="ttl">🏅 ${t}</span>`).join('')}</div>`:''}
  </section>`);
  $('ax').onclick=()=>{SFX.pop();H.home()};
  $p().querySelectorAll('[data-alv]').forEach(b=>b.onclick=()=>{AD.lv=b.dataset.alv;save();SFX.pop();open()});
  $p().querySelectorAll('.an.next').forEach(g=>{const go=()=>step(g.dataset.n);g.onclick=go;g.onkeydown=e=>{if(e.key==='Enter')go()}});
  $p().querySelectorAll('[data-call]').forEach(b=>b.onclick=()=>callRare(b.dataset.call));
}
/* a rare event from the treasure chest can be called any time (keeping its time of day) */
function callRare(id){const R=RARE_EV[id];if(R.t&&!R.t.includes(phaseOf(GH())[1])){H.toast(`${R.ico} ${R.n}は 夜だけ よべるよ`);return}
  SFX.chime();H.home();H.toast(`${R.ico} <b>${R.n}</b>`,2200);setTimeout(()=>{try{SC.show(id,R.sec)}catch(e){}},500)}

/* walking onto a node: games cost coins, shops and ? are free, the goal opens the chest */
function step(k){const n=map().nodes[k],t=n[2];
  if(GAMES[t])return confirmGame(k,t);
  arrive(k);
  if(t==='shop')return advShop();
  if(t==='mys')return mystery();
  if(t==='goal')return treasure();
  open()}
function arrive(k){AD.trail.push(AD.node);AD.node=k;save()}
function back(){if(AD.trail.length)AD.node=AD.trail.pop();save()}

function confirmGame(k,t){const G=GAMES[t],c=cost();
  H.show('adv',`<section class="pnl adv">
    <div class="qtop"><button class="x" id="ax" aria-label="地図に もどる">←</button><b>${G.ico} ${G.name}</b><span class="qn">${LEVELS[AD.lv].short}</span></div>
    <p class="gdesc">${G.desc}</p>
    <ul class="grule"><li>クリアすると 🪙${c*2} もらえて、つぎの マスへ すすめる</li><li>しっぱいすると 1マス もどる${AD.items.compass?'（🧭コンパスで もどらない）':''}</li><li>もっている 道具：${Object.entries(ITEMS).map(([k,it])=>`${it.ico}×${AD.items[k]}`).join('　')}</li></ul>
    <div class="row"><button id="go" ${ST.coins<c?'disabled':''}>🪙${c} で ちょうせん</button><button id="no" class="sub">やめる</button></div>
    ${ST.coins<c?'<p class="note">コインが たりないよ。ラジオで ためてこよう</p>':''}
  </section>`);
  $('ax').onclick=$('no').onclick=()=>{SFX.pop();open()};
  $('go').onclick=()=>{if(ST.coins<c)return;ST.coins-=c;save();H.head();SFX.deal();
    play(t,ok=>{if(ok){arrive(k);H.toast(`🎉 <b>クリア！</b><small>🪙${c*2} ゲット</small>`);SFX.fanfare(1);setTimeout(()=>{const r=$('panel').getBoundingClientRect();H.coinBurst(r.left+r.width/2,r.top+40,c*2)},300);open()}
      else if(AD.items.compass){AD.items.compass--;save();H.toast('🧭 コンパスの おかげで もどらずに すんだ！');open()}
      else{const was=AD.node;back();H.toast(was===AD.node?'😢 しっぱい… もう一度 ちょうせんしよう':'😢 しっぱい… 1マス もどった');open()}})}}

/* ---------- adventure shop and ? nodes ---------- */
function advShop(){
  H.show('adv',`<section class="pnl adv">
    <div class="qtop"><button class="x" id="ax" aria-label="地図に もどる">←</button><b>🏪 冒険の お店</b><span></span></div>
    <div class="rlist">${Object.entries(ITEMS).map(([k,it])=>`<div class="ritem"><span class="ri">${it.ico}</span><span class="rn"><b>${it.name}　×${AD.items[k]}</b><small>${it.desc}</small></span><span class="rbtn"><button class="buy" data-it="${k}" ${ST.coins<it.p?'disabled':''}>かう 🪙${it.p}</button></span></div>`).join('')}</div>
    <div class="row"><button id="ok">地図に もどる</button></div>
  </section>`);
  $('ax').onclick=$('ok').onclick=()=>{SFX.pop();open()};
  $p().querySelectorAll('[data-it]').forEach(b=>b.onclick=()=>{const it=ITEMS[b.dataset.it];if(ST.coins<it.p)return;ST.coins-=it.p;AD.items[b.dataset.it]++;save();H.head();SFX.save();advShop()})}
function mystery(){const r=Math.random(),c=cost();let msg;
  if(r<.45){const n=c*3;H.addCoins(n);msg=`🪙 コインが ${n}まい おちていた！`;SFX.coin()}
  else if(r<.85){const k=pick(Object.keys(ITEMS));AD.items[k]++;save();msg=`${ITEMS[k].ico} ${ITEMS[k].name}を ひろった！`;SFX.chime()}
  else{const k=pick(['dolphins','whale','turtle','mermaid','rainbow']);msg='🌊 浜辺で なにか おきた…！';setTimeout(()=>{try{SC.play(k)}catch(e){}},400);SFX.whoosh()}
  H.toast(`❓ <b>ひみつの マス</b><small>${msg}</small>`,3000);open()}

/* ---------- the treasure chest ---------- */
function treasure(){const M=map(),R=M.reward,first=AD.map<MAPS.length,got=[];
  if(first){(R.deco||[]).forEach(n=>{ST.deco[n]=true;const d=CATALOG.deco.find(x=>x[0]===n);got.push(`${d?d[2]:'✨'} ${n}`)});
    (R.music||[]).forEach(id=>{if(!ST.music.includes(id))ST.music.push(id);got.push(`🎵 ${TRACKS[id].name}`)});
    (R.event||[]).forEach(id=>{if(!AD.rareEv.includes(id))AD.rareEv.push(id);got.push(`${RARE_EV[id].ico} ${RARE_EV[id].n}（いつでも よべる）`)});
    if(R.title&&!AD.titles.includes(R.title)){AD.titles.push(R.title);got.push(`🏅 しょうごう「${R.title}」`)}}
  const bonus=cost()*20;ST.coins+=bonus;got.push(`🪙 ${bonus}まい`);
  AD.done.push(AD.map);AD.map++;AD.node='S';AD.trail=[];save();H.head();SC.update(ST.coins);
  SFX.fanfare(3);try{FX.meteor()}catch(e){}
  H.show('adv',`<section class="pnl adv chest">
    <div class="box">💎</div><b class="ct">${M.name}の 宝箱を あけた！</b>
    <ul class="got">${got.map(g=>`<li>${g}</li>`).join('')}</ul>
    <div class="row"><button id="nx">つぎの 地図へ ▶</button><button id="hm" class="sub">浜辺に もどる</button></div>
  </section>`);
  const r=$('panel').getBoundingClientRect();for(let i=0;i<4;i++)setTimeout(()=>FX.firework(r.left+r.width*(.2+Math.random()*.6),r.top+20+Math.random()*60),i*350);
  $('nx').onclick=()=>{SFX.vopen();open()};$('hm').onclick=()=>{SFX.pop();H.home()}}

/* ---------- mini games ---------- */
/* shared frame: a timer bar, ✓ / ✗ counters and the item buttons; finish(true|false) ends it */
function frame(t,{need,miss,time},body){const G=GAMES[t];
  H.show('adv',`<section class="pnl adv game g-${t}">
    <div class="qtop"><b>${G.ico} ${G.name}</b><span class="score" id="gs"></span></div>
    <div class="tbar"><i id="tb"></i></div>
    <div class="arena" id="ar">${body}</div>
    <div class="gtools"><button id="useG" class="sub" ${AD.items.glass?'':'disabled'}>⏳ +10びょう ×${AD.items.glass}</button><button id="useH" class="sub" ${AD.items.hint?'':'disabled'}>💡 ヒント ×${AD.items.hint}</button><button id="quit" class="sub">あきらめる</button></div>
  </section>`);
  const g={ok:0,ng:0,need,miss,left:time,total:time,over:false,onHint:null};
  const draw=()=>{$('gs').innerHTML=`⭕ ${g.ok}/${need}　❌ ${g.ng}/${miss}`;$('tb').style.width=Math.max(0,g.left/g.total*100)+'%';$('tb').classList.toggle('low',g.left<8)};
  let last=performance.now();const tick=()=>{if(g.over)return;const now=performance.now();g.left-=(now-last)/1000;last=now;draw();if(g.left<=0){g.end(false);return}requestAnimationFrame(tick)};
  g.hit=()=>{g.ok++;SFX.coin();draw();if(g.ok>=need)g.end(true)};
  g.miss_=()=>{g.ng++;SFX.tie();draw();if(g.ng>=miss)g.end(false)};
  g.end=ok=>{if(g.over)return;g.over=true;g.onEnd&&g.onEnd();setTimeout(()=>g.done(ok),ok?700:900)};
  $('useG').onclick=()=>{if(!AD.items.glass||g.over)return;AD.items.glass--;save();g.left+=10;g.total=Math.max(g.total,g.left);$('useG').innerHTML=`⏳ +10びょう ×${AD.items.glass}`;$('useG').disabled=!AD.items.glass;SFX.chime()};
  $('useH').onclick=()=>{if(!AD.items.hint||g.over||!g.onHint)return;AD.items.hint--;save();g.onHint();$('useH').innerHTML=`💡 ヒント ×${AD.items.hint}`;$('useH').disabled=!AD.items.hint;SFX.chime()};
  $('quit').onclick=()=>g.end(false);
  draw();requestAnimationFrame(tick);return g}
function play(t,done){H.loadAud(AD.lv);const g=({shell:shellGame,dj:djGame,star:starGame,suika:suikaGame,crab:crabGame})[t]();g.done=done}

/* 🐚 shells with English words drift along the shore; pick the one that matches the Japanese */
function shellGame(){const lv=AD.lv,pool=shuffle(H.allWords(lv)),kids=lv==='es';
  const g=frame('shell',{need:5,miss:3,time:40},`<div class="prompt" id="sp"></div><div class="shore" id="sh"></div>`);
  let target=null,qi=0,spawnT=0,shells=[];const sh=$('sh');
  const ask=()=>{target=pool[qi++%pool.length];$('sp').innerHTML=`${kids&&target[2]?`<span class="pe">${target[2]}</span>`:''}${esc(target[1])}`;spawnT=0};
  const spawn=word=>{const el=document.createElement('button');el.className='shell';el.innerHTML=`<span>🐚</span>${esc(word[0])}`;
    const lane=Math.random()*.7+.08,dir=Math.random()<.5?1:-1,sp=(kids?38:48)+Math.random()*26;sh.appendChild(el);
    const o={el,w:word,x:dir>0?-el.offsetWidth:sh.clientWidth,y:lane*sh.clientHeight,dir,sp};shells.push(o);
    el.onclick=()=>{if(g.over)return;if(o.w===target){el.classList.add('got');SFX.pop();setTimeout(()=>el.remove(),300);shells=shells.filter(s=>s!==o);g.hit();if(!g.over)ask()}
      else{el.classList.add('bad');setTimeout(()=>el.classList.remove('bad'),300);g.miss_()}}};
  let last=performance.now();
  const loop=now=>{if(g.over)return;const dt=(now-last)/1000;last=now;spawnT-=dt;
    if(spawnT<=0){spawnT=.9+Math.random()*.5;const hasT=shells.some(s=>s.w===target);spawn(!hasT&&Math.random()<.6?target:pick(pool))}
    shells.forEach(s=>{s.x+=s.dir*s.sp*dt;s.el.style.transform=`translate(${s.x}px,${s.y}px)`;if(s.x<-s.el.offsetWidth-20||s.x>sh.clientWidth+20){s.el.remove();s.dead=1}});
    shells=shells.filter(s=>!s.dead);requestAnimationFrame(loop)};
  g.onHint=()=>shells.filter(s=>s.w===target).forEach(s=>s.el.classList.add('glow'));
  ask();requestAnimationFrame(loop);return g}

/* 📻 a line plays; tap its words in order to put it back together */
function djGame(){const lv=AD.lv,lines=shuffle(LEVELS[lv].talk.filter(l=>l[0].split(' ').length>=3));
  const g=frame('dj',{need:2,miss:3,time:70},`<div class="prompt dj"><button id="rp" class="sub">🔁 もう一度 きく</button><small id="dja"></small></div><div class="built" id="bt"></div><div class="tiles" id="tl"></div>`);
  let li=0,words=[],pos=0;
  const next=()=>{const L=lines[li++%lines.length];words=L[0].split(' ');pos=0;$('dja').textContent=L[1];$('bt').innerHTML='';
    $('tl').innerHTML=shuffle(words.map((w,i)=>[w,i])).map(([w,i])=>`<button class="tile" data-w="${esc(w)}">${esc(w)}</button>`).join('');
    $('tl').querySelectorAll('.tile').forEach(b=>b.onclick=()=>{if(g.over)return;if(b.dataset.w===words[pos]){b.disabled=true;b.classList.add('used');$('bt').insertAdjacentHTML('beforeend',`<span>${esc(words[pos])}</span>`);pos++;SFX.pop();
        if(pos>=words.length){$('bt').classList.add('done');g.hit();if(!g.over)setTimeout(()=>{$('bt').classList.remove('done');next()},700)}}
      else{b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),300);g.miss_()}});
    H.say(lv,L[0]);$('rp').onclick=()=>H.say(lv,L[0])};
  g.onHint=()=>{const b=[...$('tl').querySelectorAll('.tile:not(.used)')].find(x=>x.dataset.w===words[pos]);b&&b.classList.add('glow')};
  next();return g}

/* ✨ letters are stars in the night sky; tap them in spelling order to draw the constellation */
function starGame(){const lv=AD.lv,maxL=lv==='es'||lv==='jh'?7:9,kids=lv==='es';
  const pool=shuffle(H.allWords(lv).filter(w=>/^[a-z]+$/i.test(w[0])&&w[0].length>=3&&w[0].length<=maxL));
  const g=frame('star',{need:3,miss:4,time:60},`<div class="prompt star"><span id="sj"></span><button id="sw" class="sub">🔊</button></div><div class="sky" id="sk"><svg id="sl" class="lines"></svg></div>`);
  let wi=0,word='',pos=0,stars=[],lastXY=null;const sk=$('sk');
  const next=()=>{const W=pool[wi++%pool.length];word=W[0].toLowerCase();pos=0;lastXY=null;$('sj').innerHTML=`${kids&&W[2]?W[2]+' ':''}${esc(W[1])}　<b>${'＿'.repeat(word.length)}</b>`;
    sk.querySelectorAll('.st').forEach(e=>e.remove());$('sl').innerHTML='';
    const letters=shuffle([...word,...shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(c=>!word.includes(c))).slice(0,Math.max(2,9-word.length))]);
    const Wd=sk.clientWidth,Hd=sk.clientHeight,pts=[];
    letters.forEach(ch=>{let x,y,t=0;do{x=24+Math.random()*(Wd-48);y=22+Math.random()*(Hd-44);t++}while(t<60&&pts.some(p=>Math.hypot(p[0]-x,p[1]-y)<44));pts.push([x,y]);
      const b=document.createElement('button');b.className='st';b.textContent=ch;b.style.left=x+'px';b.style.top=y+'px';b.dataset.c=ch;sk.appendChild(b);
      b.onclick=()=>{if(g.over||b.classList.contains('lit'))return;if(ch===word[pos]){b.classList.add('lit');SFX.hold();
          if(lastXY)$('sl').insertAdjacentHTML('beforeend',`<line x1="${lastXY[0]}" y1="${lastXY[1]}" x2="${x}" y2="${y}"/>`);lastXY=[x,y];pos++;
          $('sj').querySelector('b').textContent=word.slice(0,pos)+'＿'.repeat(word.length-pos);
          if(pos>=word.length){H.say(lv,W[0]);g.hit();if(!g.over)setTimeout(next,900)}}
        else{b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),300);g.miss_()}}});
    H.say(lv,W[0]);$('sw').onclick=()=>H.say(lv,W[0])};
  g.onHint=()=>{const b=[...sk.querySelectorAll('.st:not(.lit)')].find(x=>x.dataset.c===word[pos]);b&&b.classList.add('glow')};
  next();return g}

/* 🍉 the crab guide shouts directions in English; follow them blindfolded and swing at the watermelon */
const SUIKA_SAY={L:['Go left!','Turn left.','Move to your left.','Step to the left.'],R:['Go right!','Turn right.','Move to your right.','Step to the right.'],
  U:['Go forward!','Walk straight ahead.','Keep going forward.','Take a step forward.'],D:['Go back!','Step back.','Move backward.','Take a step back.'],
  HIT:['Hit it!','Swing now!','Right there! Hit it!','Stop! Swing the stick!']};
function suikaGame(){const lv=AD.lv,kids=lv==='es',C=5,R=4;H.loadAud('suika');
  const g=frame('suika',{need:3,miss:3,time:50},`<div class="prompt suika"><button id="sa" class="sub">🦀 🔁</button><small id="st"></small></div>
    <div class="field" id="fd" style="--c:${C};--r:${R}">${Array.from({length:C*R},(_,i)=>`<i data-i="${i}"></i>`).join('')}<span class="kid" id="kd">🙈</span><span class="melon" id="ml">🍉</span></div>
    <div class="pad"><span></span><button data-d="U" aria-label="まえ">↑</button><span></span><button data-d="L" aria-label="ひだり">←</button><button data-d="HIT" class="hit" aria-label="わる">🔨</button><button data-d="R" aria-label="みぎ">→</button><span></span><button data-d="D" aria-label="うしろ">↓</button><span></span></div>`);
  let kid=[2,3],melon=[0,0],want='';
  const put=(el,[x,y])=>{el.style.left=`calc(${(x+.5)/C*100}% )`;el.style.top=`calc(${(y+.5)/R*100}% )`};
  /* the next instruction is the first step on the way from the kid to the melon */
  const instruct=()=>{const [kx,ky]=kid,[mx,my]=melon;want=kx<mx?'R':kx>mx?'L':ky>my?'U':ky<my?'D':'HIT';
    const line=kids?SUIKA_SAY[want][0]:pick(SUIKA_SAY[want]);$('st').textContent=kids?line:'';$('st').dataset.l=line;H.say('suika',line)};
  const newMelon=()=>{do{melon=[Math.random()*C|0,Math.random()*R|0]}while(melon[0]===kid[0]&&melon[1]===kid[1]);put($('ml'),melon);$('ml').className='melon';instruct()};
  $p().querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{if(g.over)return;const d=b.dataset.d;$p().querySelectorAll('.pad .glow').forEach(x=>x.classList.remove('glow'));
    if(d!==want){b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),300);g.miss_();if(!g.over)setTimeout(instruct,500);return}
    if(d==='HIT'){$('ml').className='melon split';$('kd').classList.add('swing');setTimeout(()=>$('kd').classList.remove('swing'),400);g.hit();if(!g.over)setTimeout(newMelon,800);return}
    kid=[kid[0]+(d==='R')-(d==='L'),kid[1]+(d==='D')-(d==='U')];put($('kd'),kid);SFX.tick();setTimeout(instruct,250)});
  $('sa').onclick=()=>H.say('suika',$('st').dataset.l||'');
  g.onHint=()=>{$('st').textContent=$('st').dataset.l;const b=$p().querySelector(`[data-d="${want}"]`);b&&b.classList.add('glow')};
  put($('kd'),kid);newMelon();return g}

/* 🦀 a word is read out; tap the crab holding its picture (or meaning) before it scuttles off */
function crabGame(){const lv=AD.lv,kids=lv==='es',pool=shuffle(H.allWords(lv).filter(w=>!kids||w[2]));
  const g=frame('crab',{need:6,miss:3,time:40},`<div class="prompt crabq"><button id="cw" class="sub">🔊 もう一度</button></div><div class="beachrow" id="cb"></div>`);
  let qi=0,target=null;const cb=$('cb');
  const label=w=>kids?`<span class="ce">${w[2]}</span>`:`<span class="cj">${esc(w[1])}</span>`;
  const round=()=>{target=pool[qi++%pool.length];const n=kids?3:4;
    const others=shuffle(pool.filter(w=>w!==target&&w[1]!==target[1]&&(!kids||w[2]!==target[2]))).slice(0,n-1);
    cb.innerHTML=shuffle([target,...others]).map((w,i)=>`<button class="crab" data-i="${pool.indexOf(w)}" style="--d:${(i*.12).toFixed(2)}s">${label(w)}<span class="cr">🦀</span></button>`).join('');
    const t0=performance.now();
    cb.querySelectorAll('.crab').forEach(b=>b.onclick=()=>{if(g.over||b.disabled)return;const w=pool[+b.dataset.i];
      if(w===target){b.classList.add('got');cb.querySelectorAll('.crab').forEach(x=>x.disabled=true);
        if(performance.now()-t0<2500){g.left=Math.min(g.total,g.left+2);H.toast('⚡ はやい！ +2びょう',900)}
        g.hit();if(!g.over)setTimeout(round,600)}
      else{b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),300);g.miss_()}});
    setTimeout(()=>{if(!g.over)H.say(lv,target[0])},250)};
  $('cw').onclick=()=>target&&H.say(lv,target[0]);
  g.onHint=()=>{const b=cb.querySelector(`.crab[data-i="${pool.indexOf(target)}"]`);b&&b.classList.add('glow')};
  round();return g}

window.ADV={open};
})();
