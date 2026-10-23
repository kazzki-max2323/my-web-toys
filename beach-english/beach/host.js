/* beach host: the small slice of game state the beach scene and sound read.
   The scene code itself is lifted unchanged from 星降るポーカー; everything it
   used to ask the poker game for is answered here. */
var SAVE_KEY='hoshienglish';
var S=(()=>{const d={coins:0,sound:true,waves:true,vol:{se:1,wave:1,mus:1},gameMin:21*60,gday:0,phase:'idle',deco:{},up:{},town:{},mapN:0,moonOn:false,fireOff:false,arr:null,pts:0,resMet:{},streak:0,f:{}};
  try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');for(const k of ['coins','sound','waves','vol','gameMin','gday','deco','fireOff'])if(s[k]!=null)d[k]=s[k]}catch(e){}
  return d})();
var _saveHooks=[];
/* merges into the saved record, so parts saved by other scripts (game, treasure map) are never dropped */
var save=function(){try{let s={};try{s=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch(e){}
  Object.assign(s,{coins:S.coins,sound:S.sound,waves:S.waves,vol:S.vol,gameMin:Math.round(S.gameMin*10)/10,gday:S.gday,deco:S.deco,fireOff:S.fireOff});localStorage.setItem(SAVE_KEY,JSON.stringify(s))}catch(e){}_saveHooks.forEach(f=>{try{f()}catch(e){}})};
/* beach events fire these; the host page can listen via BEACH.on(...) */
var BEACH_EV={};
function beachEmit(n,...a){(BEACH_EV[n]||[]).forEach(f=>{try{f(...a)}catch(e){}})}
var say=function(key,opt){beachEmit('say',key,opt)};
var sceneSay=function(t){beachEmit('say',null,{text:t})};
var evToast=function(html){beachEmit('toast',html)};
var treToast=function(html){if(html)beachEmit('toast',html)};
var giveTre=function(){return ''};
var grantEvent=function(){return null};
var diaryNote=function(){};
var fishCatch=function(){return '🐟'};
var ui=function(){},renderStatus=function(){},openDrift=function(){},openMystery=function(){},buy=function(){};
var showGet=function(){},getItem=function(){},getCoin=function(n){if(n>0){S.coins+=n;save();beachEmit('coins',S.coins)}};
var showLv=function(){return 0},runDeco=function(){},addTre=function(){},rewardItem=function(){};
var specSay=function(){},specUp=function(){},specEnd=function(){},spawnBubble=function(){},power=function(){return 1};
var updStreak=function(){},coinWatch=function(){},musChip=function(){};
var hasDeco=function(n){return !!(S.deco&&S.deco[n])};
var evMul=function(){return 1},visMul=function(){return 1},treB=function(){return 0},festOn=function(){return false};
var residents=function(){return []},resTitle=function(){return ''},nextGet=function(){},rollTre=function(){return {id:''}};
var skipping=false;
var MUMS=new Proxy({},{get:(o,k)=>k in o?o[k]:(o[k]=[])}),EMO=new Proxy({},{get:(o,k)=>k in o?o[k]:(o[k]=[])});
var SHOP=[],DECO_INFO={};
