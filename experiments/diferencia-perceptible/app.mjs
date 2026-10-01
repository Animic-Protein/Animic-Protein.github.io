import {advanceTrial, createTrace, createTrial, reportPerception, reobserve, CONDITIONS} from './protocol.mjs';

const COPY={
ca:{articleLink:'Article didàctic',languageLabel:'Idioma',eyebrow:'CÒDEX VIU · DISPOSICIÓ EXPERIMENTAL',title:'Laboratori de la<br><em>diferència perceptible.</em>',intro:'Compara una forma, una absència o una relació. No hi ha puntuació, resposta correcta ni dada desada automàticament.',scope:'Aquesta experiència il·lustra condicions d’observació. No és una prova neurològica, no mesura la teva capacitat i no interpreta què significa allò que has percebut.',setupTitle:'Prepara una comparació',conditionLabel:'Quina diferència vols observar?',absence:'Absència',position:'Desplaçament',context:'Relació',focusLabel:'On orientaràs l’atenció?',focusPresence:'Presència / absència',focusPosition:'Posició',focusContext:'Relació entre elements',focusNote:'L’orientació ajuda a descriure què mires; no determina què hauries de percebre.',start:'Comença',stop:'QUIET · Atura i dissol',reflectKicker:'OBSERVACIÓ · SENSE PUNTUACIÓ',reflectTitle:'Què has percebut?',reflectCopy:'Descriu primer l’observació. La interpretació pot esperar. “No ho sé” també és una resposta completa.',noticed:'He percebut un canvi',notNoticed:'No n’he percebut cap',uncertain:'No ho sé · REOBSERVE',descriptionLabel:'Si vols, anota què t’ha semblat que canviava. Aquesta nota queda només en aquesta pàgina fins que decideixis exportar-la.',revealKicker:'CONTRAST · RETORN',resultTitle:'La diferència del protocol',resultCaveat:'Això descriu l’estímul preparat, no explica per què l’has percebut —o no— ni què significa per a tu.',export:'RETURN · Exporta rastre JSON',reobserve:'REOBSERVE · Torna a mirar',discard:'QUIET · Dissol sense desar',exportNote:'Només el botó d’exportació crea un fitxer al teu dispositiu. El Còdex no desa ni envia aquesta observació.',footer:'Diferència perceptible ≠ interpretació. Interpretació ≠ decisió. Proposta ≠ execució.',phases:{baseline:['PUNT DE PARTIDA','Observa aquesta forma. Decideix tu què vols atendre.'],interval:['INTERVAL','La forma s’atura. Continua quan vulguis.'],change:['VARIACIÓ','Observa aquesta segona forma sense haver de donar-li encara un sentit.'],return:['RETORN','Torna a aparèixer la forma inicial. Comprova si ara es llegeix igual.']},next:{baseline:'Pausa',interval:'Continua',change:'Retorna al punt de partida',return:'Descriu què has percebut'},responses:{noticed:'Has indicat que has percebut un canvi.', 'not-noticed':'Has indicat que no has percebut un canvi.',uncertain:'Has triat mantenir la incertesa i tornar a observar.'},difference:{absence:'Un element desapareix del centre.',position:'Dos elements intercanvien la posició.',context:'Els mateixos elements canvien de proximitat i agrupació.'},pattern:'Seqüència de formes presentada per comparar.',download:'Còdex-diferencia-perceptible.json',exported:'El rastre s’ha preparat com a fitxer JSON. No s’ha desat a l’historial del Còdex.'},
es:{articleLink:'Artículo didáctico',languageLabel:'Idioma',eyebrow:'CÒDEX VIU · DISPOSICIÓN EXPERIMENTAL',title:'Laboratorio de la<br><em>diferencia perceptible.</em>',intro:'Compara una forma, una ausencia o una relación. No hay puntuación, respuesta correcta ni datos guardados automáticamente.',scope:'Esta experiencia ilustra condiciones de observación. No es una prueba neurológica, no mide tu capacidad ni interpreta qué significa lo que has percibido.',setupTitle:'Prepara una comparación',conditionLabel:'¿Qué diferencia quieres observar?',absence:'Ausencia',position:'Desplazamiento',context:'Relación',focusLabel:'¿Dónde orientarás la atención?',focusPresence:'Presencia / ausencia',focusPosition:'Posición',focusContext:'Relación entre elementos',focusNote:'La orientación ayuda a describir qué miras; no determina qué deberías percibir.',start:'Comenzar',stop:'QUIET · Detener y disolver',reflectKicker:'OBSERVACIÓN · SIN PUNTUACIÓN',reflectTitle:'¿Qué has percibido?',reflectCopy:'Describe primero la observación. La interpretación puede esperar. «No lo sé» también es una respuesta completa.',noticed:'He percibido un cambio',notNoticed:'No he percibido ninguno',uncertain:'No lo sé · REOBSERVE',descriptionLabel:'Si quieres, anota qué te ha parecido que cambiaba. Esta nota solo permanece en esta página hasta que decidas exportarla.',revealKicker:'CONTRASTE · RETORNO',resultTitle:'La diferencia del protocolo',resultCaveat:'Esto describe el estímulo preparado; no explica por qué lo has percibido —o no— ni qué significa para ti.',export:'RETURN · Exportar rastro JSON',reobserve:'REOBSERVE · Volver a mirar',discard:'QUIET · Disolver sin guardar',exportNote:'Solo el botón de exportación crea un archivo en tu dispositivo. El Còdex no guarda ni envía esta observación.',footer:'Diferencia perceptible ≠ interpretación. Interpretación ≠ decisión. Propuesta ≠ ejecución.',phases:{baseline:['PUNTO DE PARTIDA','Observa esta forma. Tú decides a qué atender.'],interval:['INTERVALO','La forma se detiene. Continúa cuando quieras.'],change:['VARIACIÓN','Observa esta segunda forma sin tener que darle todavía un sentido.'],return:['RETORNO','Vuelve a aparecer la forma inicial. Comprueba si ahora se lee igual.']},next:{baseline:'Pausa',interval:'Continuar',change:'Volver al punto de partida',return:'Describir qué has percibido'},responses:{noticed:'Has indicado que has percibido un cambio.','not-noticed':'Has indicado que no has percibido un cambio.',uncertain:'Has elegido mantener la incertidumbre y volver a observar.'},difference:{absence:'Un elemento desaparece del centro.',position:'Dos elementos intercambian su posición.',context:'Los mismos elementos cambian de proximidad y agrupación.'},pattern:'Secuencia de formas presentada para comparar.',download:'Codex-diferencia-perceptible.json',exported:'El rastro se ha preparado como archivo JSON. No se ha guardado en el historial del Còdex.'},
en:{articleLink:'Explanatory article',languageLabel:'Language',eyebrow:'CÒDEX VIU · EXPERIMENTAL DISPOSITION',title:'Laboratory of<br><em>perceptible difference.</em>',intro:'Compare a form, an absence, or a relation. There is no score, correct answer, or automatic data storage.',scope:'This experience illustrates conditions of observation. It is not a neurological test, does not measure your ability, and does not interpret what your perception means.',setupTitle:'Prepare a comparison',conditionLabel:'Which difference would you like to observe?',absence:'Absence',position:'Displacement',context:'Relation',focusLabel:'Where will you direct your attention?',focusPresence:'Presence / absence',focusPosition:'Position',focusContext:'Relation between elements',focusNote:'The focus helps describe what you are attending to; it does not determine what you should perceive.',start:'Begin',stop:'QUIET · Stop and dissolve',reflectKicker:'OBSERVATION · NO SCORE',reflectTitle:'What did you perceive?',reflectCopy:'Describe the observation first. Interpretation can wait. “I don’t know” is also a complete response.',noticed:'I perceived a change',notNoticed:'I did not perceive one',uncertain:'I don’t know · REOBSERVE',descriptionLabel:'If you wish, note what seemed to change. This note stays on this page until you choose to export it.',revealKicker:'CONTRAST · RETURN',resultTitle:'The protocol’s difference',resultCaveat:'This describes the prepared stimulus. It does not explain why you did —or did not— perceive it, or what it means to you.',export:'RETURN · Export JSON trace',reobserve:'REOBSERVE · Look again',discard:'QUIET · Dissolve without saving',exportNote:'Only the export button creates a file on your device. Còdex does not store or send this observation.',footer:'Perceptible difference ≠ interpretation. Interpretation ≠ decision. Proposal ≠ execution.',phases:{baseline:['STARTING POINT','Observe this form. You decide what to attend to.'],interval:['INTERVAL','The form pauses. Continue whenever you choose.'],change:['VARIATION','Observe this second form without having to assign meaning yet.'],return:['RETURN','The starting form appears again. Check whether it reads the same now.']},next:{baseline:'Pause',interval:'Continue',change:'Return to the starting point',return:'Describe what you perceived'},responses:{noticed:'You indicated that you perceived a change.','not-noticed':'You indicated that you did not perceive a change.',uncertain:'You chose to keep uncertainty open and observe again.'},difference:{absence:'One element disappears from the centre.',position:'Two elements exchange positions.',context:'The same elements change their proximity and grouping.'},pattern:'Sequence of forms presented for comparison.',download:'Codex-perceptible-difference.json',exported:'The trace was prepared as a JSON file. It was not saved to Còdex history.'},
zh:{articleLink:'说明文章',languageLabel:'语言',eyebrow:'CÒDEX VIU · 实验性布置',title:'可感知差异<br><em>实验室。</em>',intro:'比较一种形态、一处缺席或一种关系。没有分数、标准答案，也不会自动保存数据。',scope:'本体验用于展示观察条件。它不是神经学测试，不测量你的能力，也不解释你的感知意味着什么。',setupTitle:'准备一次比较',conditionLabel:'你想观察哪种差异？',absence:'缺席',position:'位移',context:'关系',focusLabel:'你将把注意力放在哪里？',focusPresence:'存在 / 缺席',focusPosition:'位置',focusContext:'元素之间的关系',focusNote:'注意方向帮助描述你在看什么；它不决定你应该感知到什么。',start:'开始',stop:'QUIET · 停止并消散',reflectKicker:'观察 · 不评分',reflectTitle:'你感知到了什么？',reflectCopy:'先描述观察到的现象，解释可以稍后进行。“我不知道”也是完整的回答。',noticed:'我感知到了变化',notNoticed:'我没有感知到变化',uncertain:'我不确定 · REOBSERVE',descriptionLabel:'如果你愿意，可以记下你觉得哪里发生了变化。在你决定导出之前，这段文字只留在本页面。',revealKicker:'对照 · 返回',resultTitle:'本次协议中的差异',resultCaveat:'这里描述的是预先设定的刺激，不解释你为何感知到或没有感知到它，也不解释它对你意味着什么。',export:'RETURN · 导出 JSON 痕迹',reobserve:'REOBSERVE · 再观察',discard:'QUIET · 消散且不保存',exportNote:'只有点击导出才会在你的设备上生成文件。Còdex 不会保存或发送这条观察记录。',footer:'可感知差异 ≠ 解释。解释 ≠ 决定。提议 ≠ 执行。',phases:{baseline:['起点','观察这个形态。由你决定关注什么。'],interval:['间隔','形态暂停。你可以随时继续。'],change:['变化','观察第二个形态；此刻不必急着赋予它意义。'],return:['返回','最初的形态再次出现。看看它现在是否仍被读作相同。']},next:{baseline:'暂停',interval:'继续',change:'返回起点',return:'描述你的感知'},responses:{noticed:'你表示自己感知到了变化。','not-noticed':'你表示自己没有感知到变化。',uncertain:'你选择保留不确定性并再次观察。'},difference:{absence:'中间的一个元素消失了。',position:'两个元素交换了位置。',context:'相同的元素改变了彼此的距离和组合关系。'},pattern:'用于比较的一组形态。',download:'Codex-感知差异.json',exported:'痕迹已准备为 JSON 文件。它没有保存在 Còdex 历史中。'}
};

const $=id=>document.getElementById(id);
const language=$('language');
const conditionSelect=$('condition');
const focusSelect=$('focus');
const setup=$('setup'),trialPanel=$('trial'),reflectPanel=$('reflect'),resultPanel=$('result');
let locale='ca',trial=null;
const copy=()=>COPY[locale];
function applyCopy(){
 const c=copy();
 document.documentElement.lang=locale==='zh'?'zh-Hans':locale;
 document.querySelectorAll('[data-copy]').forEach(node=>{
   const value=c[node.dataset.copy];
   if(value!==undefined)node.innerHTML=value;
 });
 document.title=locale==='zh'?'可感知差异实验室 · Còdex Viu':c.title.replace(/<[^>]+>/g,'')+' · Còdex Viu';
 if(trial){renderPhase();if(!reflectPanel.hidden){}if(!resultPanel.hidden)renderResult()}
}
function setLanguage(value){locale=COPY[value]?value:'ca';applyCopy()}
function tokenNode(token){
 const mark=document.createElement('span');
 mark.classList.add('mark');
 mark.setAttribute('aria-hidden','true');
 if(token==='ring-with-dot'){
   const ring=document.createElement('span');ring.className='ring';
   const dot=document.createElement('span');dot.className='dot';ring.appendChild(dot);mark.appendChild(ring);return mark;
 }
 const chars={circle:['circle','●'],diamond:['diamond','◆'],triangle:['triangle','▲'],empty:['empty',''] ,ring:['circle','○'],dot:['diamond','●']};
 const [kind,glyph]=chars[token]||['circle','●'];
 mark.classList.add(kind);
 if(token==='empty')mark.textContent=' ';
 else mark.textContent=glyph;
 return mark;
}
function drawStimulus(phase){
 const host=$('stimulus');host.replaceChildren();
 host.setAttribute('aria-label',copy().pattern);
 if(phase==='interval'){host.textContent='';return}
 const data=CONDITIONS[trial.conditionId];
 const tokens=phase==='change'?data.change:data.baseline;
 tokens.forEach(token=>host.appendChild(tokenNode(token)));
}
function renderPhase(){
 if(!trial)return;
 if(trial.phase==='reflect'){trialPanel.hidden=true;reflectPanel.hidden=false;return}
 if(trial.phase==='reveal'){trialPanel.hidden=true;reflectPanel.hidden=true;resultPanel.hidden=false;renderResult();return}
 trialPanel.hidden=false;reflectPanel.hidden=true;resultPanel.hidden=true;
 const c=copy(),phase=trial.phase,[label,text]=c.phases[phase];
 $('phaseLabel').textContent=label;$('phaseTitle').textContent=c.phases[phase][0].charAt(0)+c.phases[phase][0].slice(1).toLowerCase();
 $('phaseText').textContent=text;$('next').textContent=c.next[phase];
 drawStimulus(phase);
}
function begin(){
 trial=createTrial(conditionSelect.value,focusSelect.value);
 setup.hidden=true;resultPanel.hidden=true;reflectPanel.hidden=true;
 $('description').value='';
 renderPhase();
}
function renderResult(){
 const c=copy();
 $('exactDifference').textContent=c.responses[trial.response]+' '+c.difference[trial.conditionId];
}
function report(response){
 trial=reportPerception(trial,response,$('description').value);
 renderPhase();
}
function exportTrace(){
 const trace=createTrace(trial,new Date().toISOString(),copy().difference[trial.conditionId]);
 const blob=new Blob([JSON.stringify(trace,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=copy().download;link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('exportStatus').textContent=copy().exported;
}
function dissolve(){trial=null;trialPanel.hidden=true;reflectPanel.hidden=true;resultPanel.hidden=true;setup.hidden=false;$('description').value='';}
$('start').addEventListener('click',begin);
$('next').addEventListener('click',()=>{
 if(trial.phase==='return'){trial=advanceTrial(trial);renderPhase();return}
 trial=advanceTrial(trial);renderPhase();
});
$('stop').addEventListener('click',dissolve);$('reflectStop').addEventListener('click',dissolve);
document.querySelectorAll('[data-response]').forEach(button=>button.addEventListener('click',()=>report(button.dataset.response)));
$('export').addEventListener('click',exportTrace);
$('reobserve').addEventListener('click',()=>{trial=reobserve(trial);$('description').value='';renderPhase()});
$('discard').addEventListener('click',dissolve);
language.addEventListener('change',()=>setLanguage(language.value));
setLanguage('ca');
