// 音が出るアプリのひな形：ほかのアプリに切りかえたり画面をロックしたりしたら、すべての音を止め、もどったら再開する
// 使い方は同じフォルダの README.md。<script src="bg-sound.js"></script> を、音を鳴らすスクリプトより先に読みこむ。
//  - Web Audio：AudioContext を作ったら BgSound.add(ctx) で登録する
//  - <audio> / <video>：何もしなくてよい（鳴っていたものだけ止めて、もどったら続きから）
//  - 読みあげ（speechSynthesis）：裏に回ったら打ち切る
//  - アプリでミュートにしているときは、もどっても鳴らさない：BgSound.muted=()=>ミュートかどうか
const BgSound=(()=>{const ctxs=new Set(),paused=new Set();
  const api={add(c){ctxs.add(c);return c},muted:()=>false};
  function hide(){ctxs.forEach(c=>{try{c.suspend()}catch(e){}});
    document.querySelectorAll('audio,video').forEach(m=>{if(!m.paused){m.pause();paused.add(m)}});
    try{speechSynthesis.cancel()}catch(e){}}
  function show(){if(api.muted())return;ctxs.forEach(c=>{try{c.resume()}catch(e){}});
    paused.forEach(m=>{m.play().catch(()=>{})});paused.clear()}
  document.addEventListener('visibilitychange',()=>{document.hidden?hide():show()});
  addEventListener('pagehide',hide);
  return api})();
