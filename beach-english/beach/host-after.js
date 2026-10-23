/* the poker game switched these off after building them; keep them off here too */
resVisit=function(){};
/* game clock: one in-game day lasts three real hours, same as the original */
setInterval(()=>{if(document.hidden)return;const nw=Date.now(),dt=Math.min(30,Math.max(0,(nw-(window._gT||nw-1000))/1000));window._gT=nw;const g0=S.gameMin||0;S.gameMin=(g0+dt*1440/10800)%1440;if(S.gameMin<g0)S.gday=(S.gday||0)+1;document.body.classList.toggle('bright',DK()<.45)},1000);
setInterval(save,15000);
window.BEACH={on:(n,f)=>{(BEACH_EV[n]=BEACH_EV[n]||[]).push(f)},scene:SCENE,sfx,S,save,ambient,startMusic,stopMusic,applyVol,FX};
