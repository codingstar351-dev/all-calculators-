(() => {
  const registry=window.ActivityCollection,boardEl=document.querySelector('[data-puzzle-board]'),scoreEl=document.querySelector('[data-puzzle-score]');
  let board=[],score=0,touchStart=null,active=false;
  function emptyBoard(){return Array.from({length:4},()=>Array(4).fill(0));}
  function addTile(){const open=[];board.forEach((row,r)=>row.forEach((value,c)=>{if(!value)open.push([r,c]);}));if(!open.length)return;const [r,c]=open[Math.floor(Math.random()*open.length)];board[r][c]=Math.random()<.9?2:4;}
  function render(){boardEl.innerHTML='';board.flat().forEach(value=>{const cell=document.createElement('div');cell.className='puzzle-cell';if(value){cell.textContent=value;cell.dataset.value=value;}boardEl.appendChild(cell);});scoreEl.textContent=score;}
  function compress(line){const values=line.filter(Boolean),result=[];for(let i=0;i<values.length;i++){if(values[i]===values[i+1]){const merged=values[i]*2;result.push(merged);score+=merged;i++;}else result.push(values[i]);}while(result.length<4)result.push(0);return result;}
  function transpose(grid){return grid[0].map((_,c)=>grid.map(row=>row[c]));}
  function move(direction){if(!active)return;const before=JSON.stringify(board);if(direction==='left')board=board.map(compress);if(direction==='right')board=board.map(row=>compress([...row].reverse()).reverse());if(direction==='up'){board=transpose(transpose(board).map(compress));}if(direction==='down'){board=transpose(transpose(board).map(row=>compress([...row].reverse()).reverse()));}if(JSON.stringify(board)!==before){addTile();render();}}
  function start(){active=true;board=emptyBoard();score=0;addTile();addTile();render();}function stop(){active=false;}
  document.querySelector('[data-puzzle-new]').addEventListener('click',start);document.querySelectorAll('[data-puzzle-move]').forEach(b=>b.addEventListener('click',()=>move(b.dataset.puzzleMove)));
  document.addEventListener('keydown',e=>{if(document.querySelector('[data-activity-panel="puzzle"]').hidden)return;const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(map[e.key]){e.preventDefault();move(map[e.key]);}});
  boardEl.addEventListener('pointerdown',e=>touchStart={x:e.clientX,y:e.clientY});boardEl.addEventListener('pointerup',e=>{if(!touchStart)return;const dx=e.clientX-touchStart.x,dy=e.clientY-touchStart.y;if(Math.max(Math.abs(dx),Math.abs(dy))>25)move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));touchStart=null;});
  registry.items.puzzle={start,stop};
})();
