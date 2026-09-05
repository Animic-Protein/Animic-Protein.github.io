const $=id=>document.getElementById(id);
const history=[];
const randomInt=faces=>Math.floor(Math.random()*faces)+1;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function renderHistory(){
  $('history').innerHTML=history.length?history.slice().reverse().map(x=>`<div>${x.at} · ${x.kreator} · ${x.alias} · d${x.faces[0]}:${x.result[0]} + d${x.faces[1]}:${x.result[1]} · ${x.condition||'indeterminació oberta'} · <strong>ruta, no veritat</strong></div>`).join(''):'Encara no hi ha tirades.';
}
async function roll(){
  const button=$('roll');
  if(button.disabled)return;
  button.disabled=true;
  const faces=[$('faces1').valueAsNumber||Number($('faces1').value),$('faces2').valueAsNumber||Number($('faces2').value)];
  const dice=[$('die1'),$('die2')];
  dice.forEach(d=>d.classList.add('rolling'));
  const timer=setInterval(()=>dice.forEach((d,i)=>d.textContent=randomInt(faces[i])),70);
  await wait(900);
  clearInterval(timer);
  const result=faces.map(randomInt);
  dice.forEach((d,i)=>{d.classList.remove('rolling');d.textContent=result[i]});
  history.push({at:new Date().toISOString(),kreator:$('kid').value.trim()||'KREATOR-?',alias:$('alias').value.trim()||'sense-àlies',role:$('role').value.trim()||null,condition:$('condition').value.trim()||null,faces,result,authority:'route-only',canonical:false});
  renderHistory();
  button.disabled=false;
}
$('roll').addEventListener('click',roll);
renderHistory();
