(()=>{
  const $=id=>document.getElementById(id);
  const degrees=[null,0,2,3,4,5,6,7,8,9,10,11];
  const labels=['·','1','2','♭3','3','4','♯4','5','♭6','6','♭7','7'];
  const noteNames=['Do','Re♭','Re','Mi♭','Mi','Fa','Fa♯','Sol','La♭','La','Si♭','Si'];
  const initial=[1,2,3,5,7,6,4,0];
  let melody=[...initial],ctx=null,active=[],readings=[],selected=null,lastTrace=null;
  const ensembleRoles={
    trio:['contrabaix o baix sec','piano / guitarra amb espai','veu, vent o melodia nua'],
    chamber:['cello en pedal','vidre harmònic / corda mitjana','metall fregat o harmònics'],
    zajj:['baix mòbil discontinu','comping per gestos','alè, saxòfon o veu en risc'],
    electronic:['sub greu monofònic','pad filtrat','impuls granular o ona clara']
  };
  const readingDefs=[
    {id:'root',kicker:'A · SOSTENIR',title:'Arrel respirada',text:'Un pedal deixa que la figura defineixi la tensió. Útil quan la melodia ja té caràcter.',coach:'Escolta si el fonament sosté o empresona. Si explica massa, retira la tercera.'},
    {id:'modal',kicker:'B · DIALOGAR',title:'Camp modal mòbil',text:'Dues regions harmòniques responen al contorn sense perseguir cada nota.',coach:'Mou l’harmonia només quan canvia la funció de la frase, no a cada altura.'},
    {id:'friction',kicker:'C · FRICCIONAR',title:'Baix contrari',text:'El baix avança en direcció oposada i produeix una pregunta cromàtica reversible.',coach:'La fricció és útil si revela la melodia. Si només exhibeix complexitat, simplifica.'}
  ];

  function renderMelody(){
    $('melody').innerHTML='';
    melody.forEach((degree,index)=>{
      const button=document.createElement('button');
      button.type='button';button.className='note'+(degree===0?' rest':'');button.dataset.step=String(index+1);
      button.textContent=labels[degree];button.setAttribute('aria-label',`Pas ${index+1}: ${labels[degree]}`);
      button.onclick=()=>{melody[index]=(melody[index]+1)%labels.length;renderMelody();invalidate('La figura ha canviat. Torna a fer aparèixer les lectures.');};
      $('melody').appendChild(button);
    });
  }
  function ensureAudio(){const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return null;if(!ctx)ctx=new AudioCtx();if(ctx.state==='suspended')ctx.resume();return ctx;}
  function stop(){active.forEach(node=>{try{node.stop()}catch{}});active=[];}
  function voice(freq,at,duration,type='sine',volume=.035){
    if(!ctx||!freq)return;
    if(type==='codex'){voice(freq,at,duration,'triangle',volume);voice(freq*2,at,duration,'sine',volume*.16);return;}
    const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,at);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain).connect(ctx.destination);osc.start(at);osc.stop(at+duration+.03);active.push(osc);osc.onended=()=>active=active.filter(x=>x!==osc);
  }
  const hz=midi=>440*Math.pow(2,(midi-69)/12);
  function melodyPitches(){const root=Number($('root').value);return melody.map(d=>d===0?null:60+root+degrees[d]);}
  function playMelody(){
    if(!ensureAudio()){ $('coach').textContent='Aquest navegador no exposa Web Audio; la lectura visual continua disponible.';return; }
    stop();const beat=60/Number($('tempo').value),start=ctx.currentTime+.05;melodyPitches().forEach((m,i)=>{if(m)voice(hz(m+12),start+i*beat*.5,beat*.42,'codex',.052)});$('coach').textContent='Ara escolta el contorn: on demana suport, on demana aire i on ja és suficient?';
  }
  function chordName(offset,quality){return noteNames[(Number($('root').value)+offset+12)%12]+quality;}
  function buildReadings(){
    const mode=$('mode').value;
    const minor=mode==='dorian'||mode==='aeolian';
    readings=[
      {...readingDefs[0],chords:[chordName(0,minor?'m':'')+'(add9)','pedal '+noteNames[Number($('root').value)]]},
      {...readingDefs[1],chords:[chordName(0,minor?'m7':'maj7'),chordName(mode==='ionian'?5:10,'sus2')]},
      {...readingDefs[2],chords:[chordName(0,'5'),chordName(1,'maj7/♯11'),chordName(10,'sus')]}
    ];
  }
  function renderReadings(){
    buildReadings();selected=null;$('readingGrid').innerHTML='';
    readings.forEach(reading=>{const button=document.createElement('button');button.type='button';button.className='reading-card';button.dataset.reading=reading.id;button.setAttribute('aria-pressed','false');button.innerHTML=`<small>${reading.kicker}</small><b>${reading.title}</b><p>${reading.text}</p><code>${reading.chords.join(' · ')}</code>`;button.onclick=()=>selectReading(reading.id);$('readingGrid').appendChild(button);});
    $('readings').hidden=false;$('decision').hidden=true;$('listenArrangement').disabled=true;$('readingStatus').textContent='Tria amb l’orella';$('coach').textContent='Compara funcions, no prestigi harmònic: estable, mòbil i friccional són possibilitats, no nivells.';$('readings').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function selectReading(id){
    selected=readings.find(x=>x.id===id);document.querySelectorAll('.reading-card').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.reading===id)));$('listenArrangement').disabled=false;$('readingStatus').textContent=selected.title;
    const roles=ensembleRoles[$('ensemble').value];$('foundationRole').textContent=roles[0];$('centerRole').textContent=roles[1];$('airRole').textContent=roles[2];$('coach').textContent=selected.coach;$('decision').hidden=false;
  }
  function chordOffsets(id,index){if(id==='root')return [0,7,14,19];if(id==='modal')return index<4?[0,3,7,10]:[10,0,5,7];return index<4?[0,7,14]:[1,7,11,18];}
  function playArrangement(){
    if(!selected||!ensureAudio())return;stop();const beat=60/Number($('tempo').value),start=ctx.currentTime+.05,root=48+Number($('root').value),density=$('density').value,register=$('register').value,ensemble=$('ensemble').value;
    const type={trio:'triangle',chamber:'sine',zajj:'sawtooth',electronic:'square'}[ensemble];const count={air:2,dialogue:3,body:4}[density];
    [0,4].forEach((step,block)=>{let offsets=chordOffsets(selected.id,step).slice(0,count);if(register==='open')offsets=offsets.map((x,i)=>x+(i===offsets.length-1?12:0));if(register==='high')offsets=offsets.map(x=>x+12);offsets.forEach((off,i)=>voice(hz(root+off),start+block*beat*2,beat*1.85,type,.024/(1+i*.12)));});
    melodyPitches().forEach((m,i)=>{if(m)voice(hz(m+12),start+i*beat*.5,beat*.38,'codex',.048)});
    $('coach').textContent='Segona escolta: pots reconèixer encara la figura? Si no, redueix densitat o separa el registre.';
  }
  function snapshot(decision){return{kind:'harmonia-viva-arrangement-trace',version:'1.0',createdAt:new Date().toISOString(),source:{melody:melody.map(x=>labels[x]),root:noteNames[Number($('root').value)],mode:$('mode').value},suggestedImpulse:{reading:selected.id,title:selected.title,harmony:selected.chords,ensemble:$('ensemble').value,density:$('density').value,register:$('register').value},humanDecision:{action:decision,decidedAt:new Date().toISOString()},provenance:{organ:'Rosa de l’Escolta · Harmonia Viva',localOnly:true,canonical:false,reversible:true}};}
  function decide(action){
    if(!selected)return;lastTrace=snapshot(action);localStorage.setItem('codex:harmonia-viva-arrangement-trace',JSON.stringify(lastTrace));$('trace').textContent=JSON.stringify(lastTrace,null,2);$('trace').hidden=false;$('traceActions').hidden=false;$('coach').textContent={reobserve:'Reobserva canviant només un paràmetre.',relate:'La relació queda anotada localment; encara no és cànon.',transform:'Has autoritzat una transformació reversible, no una veritat.',return:'La proposta retorna sense efecte; la figura queda disponible.'}[action];
  }
  function invalidate(message){readings=[];selected=null;$('readings').hidden=true;$('decision').hidden=true;$('coach').textContent=message;}
  $('listenMelody').onclick=playMelody;$('propose').onclick=renderReadings;$('listenArrangement').onclick=playArrangement;
  $('tempo').oninput=()=>{$('tempoOut').textContent=$('tempo').value;};
  $('resetMelody').onclick=()=>{melody=[...initial];renderMelody();invalidate('Figura restaurada. Escolta-la abans de tornar a harmonitzar.');};
  ['root','mode','ensemble','density','register'].forEach(id=>$(id).onchange=()=>invalidate('El camp ha canviat. Genera de nou les lectures per poder comparar honestament.'));
  document.querySelectorAll('[data-decision]').forEach(button=>button.onclick=()=>decide(button.dataset.decision));
  $('downloadTrace').onclick=()=>{if(!lastTrace)return;const blob=new Blob([JSON.stringify(lastTrace,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='harmonia-viva-rastre.json';a.click();URL.revokeObjectURL(url);};
  $('dissolveTrace').onclick=()=>{localStorage.removeItem('codex:harmonia-viva-arrangement-trace');lastTrace=null;$('trace').hidden=true;$('traceActions').hidden=true;$('coach').textContent='Rastre dissolt. La possibilitat no queda convertida en precedent.';};
  renderMelody();
})();
