(() => {
  const registry = window.ActivityCollection;
  const canvas=document.querySelector('#flight-canvas'),ctx=canvas.getContext('2d'),scoreEl=document.querySelector('[data-flight-score]'),control=document.querySelector('[data-flight-control]');
  let y=240,velocity=0,lifting=false,running=false,animation=null,frame=0,score=0,rings=[];
  function reset(){y=240;velocity=0;frame=0;score=0;rings=[];scoreEl.textContent='0';}
  function spawn(){rings.push({x:canvas.width+50,y:90+Math.random()*290,r:38,passed:false});}
  function draw(){const g=ctx.createLinearGradient(0,0,0,canvas.height);g.addColorStop(0,'#58d5ea');g.addColorStop(1,'#e6ffcb');ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<6;i++){const x=(i*190-frame*1.1)%1100;ctx.beginPath();ctx.ellipse(x,80+(i%3)*75,58,17,0,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#275e66';ctx.beginPath();ctx.moveTo(0,500);for(let x=0;x<=900;x+=90)ctx.lineTo(x,420-Math.sin(x*.018)*40);ctx.lineTo(900,500);ctx.fill();rings.forEach(r=>{ctx.strokeStyle=r.passed?'rgba(255,255,255,.3)':'#ff5c35';ctx.lineWidth=10;ctx.beginPath();ctx.arc(r.x,r.y,r.r,0,Math.PI*2);ctx.stroke();});ctx.save();ctx.translate(150,y);ctx.rotate(Math.max(-.35,Math.min(.35,velocity*.035)));ctx.fillStyle='#171817';ctx.beginPath();ctx.moveTo(-30,0);ctx.lineTo(28,-12);ctx.lineTo(12,0);ctx.lineTo(28,12);ctx.closePath();ctx.fill();ctx.fillStyle='#c6ff3d';ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(4,-28);ctx.lineTo(10,0);ctx.lineTo(4,28);ctx.closePath();ctx.fill();ctx.restore();}
  function message(title,subtitle){ctx.fillStyle='rgba(8,9,8,.7)';ctx.fillRect(0,0,900,500);ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='800 42px system-ui';ctx.fillText(title,450,220);ctx.fillStyle='#c6ff3d';ctx.font='700 20px system-ui';ctx.fillText(subtitle,450,260);}
  function prepare(){stop();reset();draw();message('READY FOR TAKEOFF?', 'Press Start flight, then hold for lift');}
  function end(){running=false;cancelAnimationFrame(animation);draw();message('FLIGHT COMPLETE', 'Press Start flight to try again');}
  function loop(){if(!running)return;frame++;if(frame%120===0)spawn();velocity+=lifting?-.22:.08;velocity=Math.max(-5,Math.min(5,velocity));y+=velocity;rings.forEach(r=>{r.x-=3.5;if(!r.passed&&r.x<150){r.passed=true;if(Math.abs(r.y-y)<r.r+12){score++;scoreEl.textContent=score;}}});rings=rings.filter(r=>r.x>-70);if(y<20||y>465){end();return;}draw();animation=requestAnimationFrame(loop);}
  function start(){stop();reset();velocity=-1.5;running=true;loop();} function stop(){running=false;lifting=false;cancelAnimationFrame(animation);} function lift(on){if(!running)return;lifting=on;}
  control.addEventListener('pointerdown',e=>{e.preventDefault();control.setPointerCapture(e.pointerId);lift(true);});control.addEventListener('pointerup',()=>lift(false));control.addEventListener('pointercancel',()=>lift(false));
  document.querySelector('[data-flight-start]').addEventListener('click',start);
  canvas.addEventListener('pointerdown',e=>{e.preventDefault();if(!running)start();lift(true);});canvas.addEventListener('pointerup',()=>lift(false));
  document.addEventListener('keydown',e=>{if(document.querySelector('[data-activity-panel="flight"]').hidden||e.code!=='Space')return;e.preventDefault();lift(true);});document.addEventListener('keyup',e=>{if(e.code==='Space')lift(false);});
  registry.items.flight={start:prepare,stop};
})();
