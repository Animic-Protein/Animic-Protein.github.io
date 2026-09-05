const $=id=>document.getElementById(id);
const history=[];
const randomInt=faces=>Math.floor(Math.random()*faces)+1;
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const profiles={
  Rastrejador:{rastre:78,mutacio:34,escolta:66,cartografia:72},
  Herbarium:{rastre:54,mutacio:28,escolta:74,cartografia:48},
  Mutador:{rastre:44,mutacio:86,escolta:52,cartografia:39},
  Escoltador:{rastre:61,mutacio:31,escolta:91,cartografia:57},
  Cartògraf:{rastre:69,mutacio:42,escolta:58,cartografia:89}
};
const labels={rastre:'Rastre',mutacio:'Mutació',escolta:'Escolta',cartografia:'Cartografia'};
function renderStats(){
  const role=$('role').value;
  const stats=profiles[role]||profiles.Rastrejador;
  $('stats').innerHTML=Object.entries(stats).map(([key,value])=>`<div class="stat"><strong>${labels[key]}</strong> · ${value}%<div class="bar"><div class="fill" style="width:${value}%"></div></div></div>`).join('');
}
function renderHistory(){
  $('history').innerHTML=history.length?history.slice().reverse().map(x=>`<div>${x.at} · ${x.kreator} · ${x.alias} · ${x.role} · ${x.axis[0].toUpperCase()} d${x.faces[0]}:${x.result[0]} + ${x.axis[1].toUpperCase()} d${x.faces[1]}:${x.result[1]} · ${x.condition||'indeterminació oberta'} · <strong>ruta, no veritat</strong></div>`).join(''):'Encara no hi ha tirades.';
}
async function roll(){
  const button=$('roll');
  if(button.disabled)return;
  button.disabled=true;
  const faces=[Number($('faces1').value),Number($('faces2').value)];
  const axis=[$('axis1').value,$('axis2').value];
  const dice=[$('die1'),$('die2')];
  dice.forEach(d=>d.classList.add('rolling'));
  const timer=setInterval(()=>dice.forEach((d,i)=>d.textContent=randomInt(faces[i])),70);
  await wait(900);
  clearInterval(timer);
  const result=faces.map(randomInt);
  dice.forEach((d,i)=>{d.classList.remove('rolling');d.textContent=result[i]});
  history.push({at:new Date().toISOString(),kreator:$('kid').value.trim()||'KREATOR-?',alias:$('alias').value.trim()||'sense-àlies',role:$('role').value,profile:{...profiles[$('role').value]},condition:$('condition').value.trim()||null,faces,axis,result,principle:'uncertainty',authority:'route-only',canonical:false});
  renderHistory();
  button.disabled=false;
}
$('role').addEventListener('change',renderStats);
$('roll').addEventListener('click',roll);
renderStats();
renderHistory();
