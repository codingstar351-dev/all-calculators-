(() => {
  const registry = window.ActivityCollection = window.ActivityCollection || { items: {}, start(name) { this.stopAll(); this.items[name]?.start(); }, stopAll() { Object.values(this.items).forEach((activity) => activity.stop?.()); } };
  const canvas = document.querySelector('#runner-canvas');
  const ctx = canvas.getContext('2d');
  const scoreElement = document.querySelector('[data-runner-score]');
  const lanes = [canvas.width * .3, canvas.width * .5, canvas.width * .7];
  let lane = 1, playerY = 400, jumpVelocity = 0, score = 0, speed = 5, running = false, frame = 0, animation = null, obstacles = [];

  function reset() { lane = 1; playerY = 400; jumpVelocity = 0; score = 0; speed = 5; frame = 0; obstacles = []; scoreElement.textContent = '0'; }
  function move(direction) { lane = Math.max(0, Math.min(2, lane + direction)); }
  function jump() { if (playerY >= 399) jumpVelocity = -15; }
  function spawn() { obstacles.push({ lane: Math.floor(Math.random() * 3), y: -60, size: 44 + Math.random() * 15 }); }
  function roundRect(x,y,w,h,r,color){ ctx.fillStyle=color; ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill(); }

  function draw() {
    const gradient = ctx.createLinearGradient(0,0,0,canvas.height); gradient.addColorStop(0,'#15143a'); gradient.addColorStop(1,'#6d2f88'); ctx.fillStyle=gradient; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='rgba(255,255,255,.08)'; for(let i=0;i<22;i++){ const y=(i*60+(frame*speed)%60); ctx.fillRect(205,y,490,2); }
    ctx.strokeStyle='rgba(255,255,255,.34)'; ctx.lineWidth=5; lanes.forEach(x=>{ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke();});
    obstacles.forEach(o=>{ roundRect(lanes[o.lane]-o.size/2,o.y,o.size,o.size,9,'#ff704f'); ctx.fillStyle='#171717';ctx.fillRect(lanes[o.lane]-o.size/4,o.y+10,o.size/2,8); });
    const x=lanes[lane]; roundRect(x-23,playerY-55,46,58,17,'#c6ff3d'); ctx.fillStyle='#10110f';ctx.beginPath();ctx.arc(x,playerY-67,17,0,Math.PI*2);ctx.fill();
  }

  function message(title, subtitle) { ctx.fillStyle='rgba(8,9,8,.72)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='800 42px system-ui';ctx.fillText(title,canvas.width/2,220);ctx.fillStyle='#c6ff3d';ctx.font='700 20px system-ui';ctx.fillText(subtitle,canvas.width/2,260); }
  function prepare() { stop(); reset(); draw(); message('READY TO RUN?', 'Press Start / Restart'); }
  function end() { running=false; cancelAnimationFrame(animation); draw(); message('RUN OVER', 'Press Start / Restart to try again'); }
  function loop(){ if(!running)return; frame++; if(frame%72===0)spawn(); if(frame%420===0)speed+=.5; playerY+=jumpVelocity; jumpVelocity+=.8; if(playerY>400){playerY=400;jumpVelocity=0;} obstacles.forEach(o=>o.y+=speed); obstacles=obstacles.filter(o=>{ if(o.y>canvas.height+80){score+=10;scoreElement.textContent=score;return false;} const hit=o.lane===lane&&o.y+o.size>playerY-55&&o.y<playerY&&playerY>350; if(hit)end(); return !hit; }); draw(); animation=requestAnimationFrame(loop); }
  function start(){ stop();reset();running=true;loop(); }
  function stop(){ running=false;cancelAnimationFrame(animation); }
  function act(action){ if(action==='start'){start();return;} if(!running)return; if(action==='left')move(-1);if(action==='right')move(1);if(action==='jump')jump(); }
  document.querySelectorAll('[data-runner-control]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.runnerControl)));
  document.addEventListener('keydown',e=>{ if(document.querySelector('[data-activity-panel="runner"]').hidden)return; if(['ArrowLeft','a','A'].includes(e.key))act('left'); if(['ArrowRight','d','D'].includes(e.key))act('right'); if(e.code==='Space'||e.key==='ArrowUp'){e.preventDefault();act('jump');} });
  let touchX=0; canvas.addEventListener('pointerdown',e=>touchX=e.clientX); canvas.addEventListener('pointerup',e=>{if(!running){start();return;}const dx=e.clientX-touchX; if(Math.abs(dx)>35)act(dx>0?'right':'left');else act('jump');});
  registry.items.runner={start:prepare,stop};
})();
