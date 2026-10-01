import {advance,createSession,createTrace,reobserve,respond} from './protocol.mjs';
import {CONDITIONS} from '../diferencia-perceptible/protocol.mjs';

const COPY={
ca:{
 back:'Arrels del Pensament',language:'Idioma',navigationLabel:'Navegació',moduleListAria:'Cinc disposicions del Còdex',subtitle:'Laboratori de les Cinc Disposicions',intro:'Un sol espai per orientar l’atenció, retenir una referència, contrastar sense puntuar, pausar i separar observació d’interpretació.',scope:'LIMEN és una experiència didàctica. No és una prova neurològica ni una mesura de rendiment. La persona decideix què ha percebut i què vol fer.',
 setupTitle:'Tria com vols entrar',moduleLabel:'Mòdul que vols practicar',moduleIntegrated:'Recorregut integrat · cinc disposicions',conditionLabel:'Quina variació vols observar?',absence:'Absència',position:'Desplaçament',relation:'Canvi de relació',focusLabel:'On orientaràs l’atenció?',focusForm:'Forma / presència',focusPosition:'Posició',focusRelation:'Relació entre elements',start:'Comença el recorregut',firstExperience:'Obrir la primera experiència · diferència perceptible →',
 attentio:'Tria forma, posició o relació com a orientació de l’atenció.',retentio:'Mantén present el punt de partida durant la comparació.',discrimen:'Compara sense puntuació; la variació es revela després de respondre.',quies:'Pausa, repeteix o deixa oberta la incertesa.',metacognitio:'Separa el que has observat del sentit que li dones.',
 integratedHelp:'El recorregut integra les cinc disposicions. Pots avançar al teu ritme o dissoldre’l quan vulguis.',
 moduleHelp:{integrated:'Les cinc disposicions acompanyen un mateix recorregut, sense convertir-se en una puntuació.',ATTENTIO:'Tria l’orientació i comprova què t’ajuda a notar; l’opció no determina què hauries de percebre.',RETENTIO:'Observa el punt de partida, travessa l’interval i torna-hi. Tu decideixes quant de temps vols sostenir la referència.',DISCRIMEN:'Compara les formes sense buscar una resposta correcta. El contrast preparat només es mostra després de la teva resposta.',QUIES:'Atura’t, reprèn el ritme quan vulguis o tria la incertesa. No cal completar el recorregut.',METACOGNITIO:'Escriu primer què has observat i, si ho vols, què podria significar per a tu. LIMEN no resoldrà la segona pregunta.'},
 modulePractice:{integrated:'La pausa, la comparació i la reflexió són sempre voluntàries.',ATTENTIO:'Mantén l’orientació que has triat; pots canviar-la en una nova sessió.',RETENTIO:'Conserva el punt de partida a la memòria durant l’interval, a la teva manera.',DISCRIMEN:'No endevinis: descriu què has percebut abans de veure el contrast.',QUIES:'Cada pas espera el teu gest. Pots aturar o dissoldre la sessió.',METACOGNITIO:'Observació i interpretació són camps separats i tots dos són opcionals.'},
 stop:'QUIES · Atura i dissol',reflectTitle:'Què has percebut?',reflectLead:'Primer registra l’observació. Pots deixar la interpretació en blanc. «No ho sé» és una resposta completa.',noticed:'He percebut un canvi',notNoticed:'No n’he percebut cap',uncertain:'No ho sé · REOBSERVE',observationLabel:'Què has notat? (opcional)',interpretationLabel:'Què podria significar per a tu? (opcional)',reveal:'Revela el contrast preparat',responseChosen:{noticed:'Has triat «he percebut un canvi». Tu decideixes quan revelar el contrast.', 'not-noticed':'Has triat «no n’he percebut cap». Tu decideixes quan revelar el contrast.',uncertain:'Has triat mantenir la incertesa. Tu decideixes si vols revelar el contrast.'},
 resultKicker:'CONTRAST · RETORN',resultTitle:'El que descriu el protocol',resultCaveat:'El protocol descriu l’estímul; no explica per què l’has percebut ni decideix què significa.',responses:{noticed:'Has indicat que has percebut un canvi.', 'not-noticed':'Has indicat que no n’has percebut cap.',uncertain:'Has indicat que vols mantenir oberta la incertesa.'},difference:{absence:'Un element desapareix del centre.',position:'Dos elements intercanvien la posició.',context:'Els mateixos elements canvien de proximitat i agrupació.'},export:'RETURN · Exporta rastre JSON',reobserve:'REOBSERVE · Torna a mirar',discard:'QUIET · Dissol sense desar',exportNote:'Només l’exportació crea un fitxer al teu dispositiu; LIMEN no desa ni envia l’observació.',footer:'senyal → suggestedImpulse → decisió humana → acció autoritzada → provenance',download:'LIMEN-rastre.json',exported:'El rastre s’ha descarregat al teu dispositiu.',pattern:'Formes disposades per comparar.',shapes:{circle:'cercle',diamond:'rombe',triangle:'triangle',empty:'contorn buit',ring:'anell buit',dot:'punt','ring-with-dot':'anell amb un punt a dins'},
 phases:{baseline:['PUNT DE PARTIDA','Observa aquesta forma. Decideix tu què vols atendre.'],interval:['INTERVAL','La forma s’atura. Continua quan vulguis.'],change:['VARIACIÓ','Observa aquesta forma sense haver de donar-li encara un sentit.'],return:['RETORN','Torna a aparèixer la forma inicial. Comprova si ara es llegeix igual.']},
 next:{baseline:'Pausa',interval:'Continua',change:'Retorna al punt de partida',return:'Descriu què has percebut'}
},
en:{
 back:'Roots of Thought',language:'Language',navigationLabel:'Navigation',moduleListAria:'Five Codex dispositions',subtitle:'Laboratory of the Five Dispositions',intro:'One place to orient attention, retain a reference, compare without scoring, pause, and separate observation from interpretation.',scope:'LIMEN is a learning experience. It is not a neurological test or a performance measure. The person decides what they perceived and what to do.',
 setupTitle:'Choose how to begin',moduleLabel:'Choose a practice module',moduleIntegrated:'Integrated route · all five dispositions',conditionLabel:'Which variation would you like to observe?',absence:'Absence',position:'Displacement',relation:'Changed relation',focusLabel:'Where will you direct attention?',focusForm:'Form / presence',focusPosition:'Position',focusRelation:'Relation between elements',start:'Begin the route',firstExperience:'Open the first experience · perceptible difference →',
 attentio:'Choose form, position, or relation as an attentional orientation.',retentio:'Keep the starting point present during comparison.',discrimen:'Compare without a score; the prepared variation is revealed after your response.',quies:'Pause, repeat, or leave uncertainty open.',metacognitio:'Separate what you observed from the meaning you give it.',
 integratedHelp:'The route brings all five dispositions together. Move at your own pace or dissolve the session whenever you choose.',
 moduleHelp:{integrated:'All five dispositions support one route without turning it into a score.',ATTENTIO:'Choose an orientation and notice what it helps you attend to; it does not determine what you should perceive.',RETENTIO:'Observe the starting point, cross the interval, and return. You decide how long to hold the reference.',DISCRIMEN:'Compare the forms without seeking a correct answer. The prepared contrast appears only after you respond.',QUIES:'Stop, resume at your pace, or choose uncertainty. You do not have to complete the route.',METACOGNITIO:'First note what you observed, then, if you wish, what it might mean to you. LIMEN will not answer the second question.'},
 modulePractice:{integrated:'Pausing, comparing, and reflecting are always optional.',ATTENTIO:'Keep the orientation you chose; you can change it in a new session.',RETENTIO:'Hold the starting point in memory through the interval, in your own way.',DISCRIMEN:'Do not guess: describe what you perceived before seeing the contrast.',QUIES:'Each step waits for your action. You can stop or dissolve the session.',METACOGNITIO:'Observation and interpretation are separate fields, and both are optional.'},
 stop:'QUIES · Stop and dissolve',reflectTitle:'What did you perceive?',reflectLead:'Record the observation first. You may leave interpretation blank. “I don’t know” is a complete response.',noticed:'I perceived a change',notNoticed:'I did not perceive one',uncertain:'I don’t know · REOBSERVE',observationLabel:'What did you notice? (optional)',interpretationLabel:'What might it mean to you? (optional)',reveal:'Reveal the prepared contrast',responseChosen:{noticed:'You chose “I perceived a change.” You decide when to reveal the contrast.','not-noticed':'You chose “I did not perceive one.” You decide when to reveal the contrast.',uncertain:'You chose to keep uncertainty open. You decide whether to reveal the contrast.'},
 resultKicker:'CONTRAST · RETURN',resultTitle:'What the protocol describes',resultCaveat:'The protocol describes the stimulus; it does not explain why you perceived it or decide what it means.',responses:{noticed:'You indicated that you perceived a change.','not-noticed':'You indicated that you did not perceive one.',uncertain:'You indicated that you want to keep uncertainty open.'},difference:{absence:'One element disappears from the centre.',position:'Two elements exchange positions.',context:'The same elements change proximity and grouping.'},export:'RETURN · Export JSON trace',reobserve:'REOBSERVE · Look again',discard:'QUIET · Dissolve without saving',exportNote:'Only export creates a file on your device; LIMEN does not store or send the observation.',footer:'signal → suggestedImpulse → human decision → authorized action → provenance',download:'LIMEN-trace.json',exported:'The trace was downloaded to your device.',pattern:'Forms arranged for comparison.',shapes:{circle:'circle',diamond:'diamond',triangle:'triangle',empty:'empty outline',ring:'ring',dot:'dot','ring-with-dot':'ring with a dot inside'},
 phases:{baseline:['STARTING POINT','Observe this form. You decide what to attend to.'],interval:['INTERVAL','The form pauses. Continue whenever you choose.'],change:['VARIATION','Observe this form without having to assign meaning yet.'],return:['RETURN','The starting form appears again. Check whether it reads the same now.']},
 next:{baseline:'Pause',interval:'Continue',change:'Return to the starting point',return:'Describe what you perceived'}
},
zh:{
 back:'思想之根',language:'语言',navigationLabel:'导航',moduleListAria:'Còdex 的五种布置',subtitle:'五种布置实验室',intro:'在同一处练习引导注意、保留参照、无评分对照、暂停，以及区分观察与解释。',scope:'LIMEN 是一种教学体验。它不是神经学测试，也不衡量表现。由参与者决定自己感知到了什么，以及接下来要做什么。',
 setupTitle:'选择进入方式',moduleLabel:'选择练习模块',moduleIntegrated:'综合路线 · 五种布置',conditionLabel:'你想观察哪种变化？',absence:'缺席',position:'位移',relation:'关系变化',focusLabel:'你将把注意力放在哪里？',focusForm:'形态 / 存在',focusPosition:'位置',focusRelation:'元素之间的关系',start:'开始体验',firstExperience:'打开第一项体验 · 可感知差异 →',
 attentio:'选择形态、位置或关系作为注意方向。',retentio:'在比较过程中保留起点参照。',discrimen:'不评分地对照；你回应之后才会揭示预设变化。',quies:'暂停、重复，或保留不确定性。',metacognitio:'区分你观察到的内容与赋予它的意义。',
 integratedHelp:'这一路径综合五种布置。你可以按自己的节奏前进，也可以随时结束。',moduleHelp:{integrated:'五种布置共同支持一次体验，但不会产生分数。',ATTENTIO:'选择一种注意方向，看看它如何帮助你观察；它不规定你应该感知到什么。',RETENTIO:'观察起点，经过间隔，再返回。由你决定要把参照保留多久。',DISCRIMEN:'对照形态，不必寻找正确答案。只有你回应后才会显示预设变化。',QUIES:'可以停止、按自己的节奏继续，或选择不确定；不必完成整个过程。',METACOGNITIO:'先记录观察；如果愿意，再记录它可能对你意味着什么。LIMEN 不会替你回答第二个问题。'},
 modulePractice:{integrated:'暂停、比较和反思始终由你自愿选择。',ATTENTIO:'保持你选定的注意方向；下一次体验时可以更改。',RETENTIO:'以自己的方式，在间隔期间记住起点。',DISCRIMEN:'先描述自己的感知，再看对照；不必猜答案。',QUIES:'每一步都等待你的操作。你可以停止或结束体验。',METACOGNITIO:'观察与解释分开记录，而且两项都可以留空。'},
 stop:'QUIES · 停止并消散',reflectTitle:'你感知到了什么？',reflectLead:'先记录观察。解释可以留空。“我不知道”也是完整的回答。',noticed:'我感知到了变化',notNoticed:'我没有感知到变化',uncertain:'我不确定 · REOBSERVE',observationLabel:'你注意到了什么？（可选）',interpretationLabel:'这对你可能意味着什么？（可选）',reveal:'显示预设对照',responseChosen:{noticed:'你选择了“我感知到了变化”。何时显示对照由你决定。','not-noticed':'你选择了“我没有感知到变化”。何时显示对照由你决定。',uncertain:'你选择保留不确定性。是否显示对照由你决定。'},
 resultKicker:'对照 · 返回',resultTitle:'协议所描述的内容',resultCaveat:'协议描述的是预设刺激；它不解释你为何感知到变化，也不替你决定其意义。',responses:{noticed:'你表示自己感知到了变化。','not-noticed':'你表示自己没有感知到变化。',uncertain:'你表示希望保留不确定性。'},difference:{absence:'中间的一个元素消失了。',position:'两个元素交换了位置。',context:'相同的元素改变了彼此的距离和组合关系。'},export:'RETURN · 导出 JSON 痕迹',reobserve:'REOBSERVE · 再观察',discard:'QUIET · 消散且不保存',exportNote:'只有导出操作会在你的设备上生成文件；LIMEN 不会保存或发送观察记录。',footer:'信号 → suggestedImpulse → 人的决定 → 获授权的行动 → provenance',download:'LIMEN-痕迹.json',exported:'痕迹已下载到你的设备。',pattern:'用于对照的一组形态。',shapes:{circle:'圆形',diamond:'菱形',triangle:'三角形',empty:'空轮廓',ring:'圆环',dot:'圆点','ring-with-dot':'内含圆点的圆环'},
 phases:{baseline:['起点','观察这个形态。由你决定关注什么。'],interval:['间隔','形态暂停。你可以随时继续。'],change:['变化','观察这个形态；此刻不必急着赋予它意义。'],return:['返回','最初的形态再次出现。看看它现在是否仍被读作相同。']},
 next:{baseline:'暂停',interval:'继续',change:'返回起点',return:'描述你的感知'}
},
ja:{
 back:'思想の根',language:'言語',navigationLabel:'ナビゲーション',moduleListAria:'Còdexの五つの構え',subtitle:'五つの思考の構えの実験室',intro:'注意を向け、参照点を保ち、採点せずに比べ、立ち止まり、観察と解釈を分けるための一つの場所です。',scope:'LIMENは学びのための体験です。神経学的検査でも、能力の測定でもありません。何を感じ、次にどうするかは、本人が決めます。',
 setupTitle:'始め方を選んでください',moduleLabel:'練習するモジュール',moduleIntegrated:'統合ルート · 五つの構え',conditionLabel:'どの変化を観察しますか？',absence:'欠如',position:'位置の移動',relation:'関係の変化',focusLabel:'どこに注意を向けますか？',focusForm:'形 / ある・ない',focusPosition:'位置',focusRelation:'要素どうしの関係',start:'体験を始める',firstExperience:'最初の体験を開く · 知覚できる差異 →',
 attentio:'形、位置、関係から注意の向け先を選びます。',retentio:'比較のあいだ、出発点を心に留めます。',discrimen:'点数をつけずに比べます。あなたの応答のあとで、用意された変化を示します。',quies:'立ち止まる、繰り返す、不確かさを残すことができます。',metacognitio:'観察したことと、そこに与える意味を分けます。',
 integratedHelp:'五つの構えを一つの体験に織り込みます。自分のペースで進め、いつでも終了できます。',moduleHelp:{integrated:'五つの構えを通して体験しますが、点数はつきません。',ATTENTIO:'注意の向け先を選び、それが何に気づく助けになるかを見ます。感じるべきことを決める選択ではありません。',RETENTIO:'出発点を見て、間を置き、そこへ戻ります。参照をどれほど保つかは自分で決めます。',DISCRIMEN:'正解を探さずに形を比べます。用意された差異は、あなたの応答のあとにだけ表示されます。',QUIES:'止まる、自分のペースで再開する、不確かさを選ぶことができます。最後まで行う必要はありません。',METACOGNITIO:'まず観察したことを書き、望むなら自分にとっての意味を書きます。二つ目の問いにLIMENは答えません。'},
 modulePractice:{integrated:'立ち止まる、比べる、振り返ることは、いつでも本人の選択です。',ATTENTIO:'選んだ注意の向け先を保ちます。次の体験では変更できます。',RETENTIO:'自分なりの方法で、間のあいだ出発点を記憶に保ちます。',DISCRIMEN:'答えを推測せず、差異を見る前に感じたことを記述します。',QUIES:'各段階はあなたの操作を待ちます。停止または終了できます。',METACOGNITIO:'観察と解釈は別々に記録し、どちらも空欄にできます。'},
 stop:'QUIES · 停止して終了',reflectTitle:'何を感じ取りましたか？',reflectLead:'まず観察したことを記録します。解釈は空欄でもかまいません。「わからない」も十分な応答です。',noticed:'変化を感じ取った',notNoticed:'変化は感じ取らなかった',uncertain:'わからない · REOBSERVE',observationLabel:'何に気づきましたか？（任意）',interpretationLabel:'あなたにとって何を意味するかもしれませんか？（任意）',reveal:'用意された対照を表示',responseChosen:{noticed:'「変化を感じ取った」を選びました。対照を表示する時点も自分で決めます。','not-noticed':'「変化は感じ取らなかった」を選びました。対照を表示する時点も自分で決めます。',uncertain:'不確かさを残すことを選びました。対照を表示するかどうかも自分で決めます。'},
 resultKicker:'対照 · 回帰',resultTitle:'このプロトコルが示すこと',resultCaveat:'ここに示すのは用意された刺激です。なぜ感じ取れたか、どんな意味があるかを説明・決定するものではありません。',responses:{noticed:'変化を感じ取ったと回答しました。','not-noticed':'変化は感じ取らなかったと回答しました。',uncertain:'不確かさを残すと回答しました。'},difference:{absence:'中央の要素が一つ消えます。',position:'二つの要素の位置が入れ替わります。',context:'同じ要素どうしの距離とまとまり方が変わります。'},export:'RETURN · JSON記録を書き出す',reobserve:'REOBSERVE · もう一度見る',discard:'QUIET · 保存せず終了',exportNote:'ファイルを作成するのは書き出し操作をしたときだけです。LIMENは観察を保存・送信しません。',footer:'信号 → suggestedImpulse → 人の判断 → 許可された行動 → provenance',download:'LIMEN-記録.json',exported:'記録を端末にダウンロードしました。',pattern:'比較のために並べた形です。',shapes:{circle:'円',diamond:'ひし形',triangle:'三角形',empty:'空の輪郭',ring:'輪',dot:'点','ring-with-dot':'中に点のある輪'},
 phases:{baseline:['出発点','この形を観察します。何に注意を向けるかは自分で決めます。'],interval:['間','形の提示が止まります。自分のタイミングで続けてください。'],change:['変化','この形を観察します。今は意味を決めなくてかまいません。'],return:['回帰','最初の形がもう一度現れます。今も同じように見えるか確かめてください。']},
 next:{baseline:'間を置く',interval:'続ける',change:'出発点に戻る',return:'感じたことを記述する'}
}
};

const $=id=>document.getElementById(id);
const language=$('language'),moduleSelect=$('module'),conditionSelect=$('condition'),focusSelect=$('focus');
const setup=$('setup'),trialPanel=$('trial'),reflectPanel=$('reflect'),resultPanel=$('result');
let locale='ca',session=null,selectedResponse=null;
const copy=()=>COPY[locale];
function applyCopy(){
 const c=copy();
 document.documentElement.lang=locale==='zh'?'zh-Hans':locale==='ja'?'ja':locale;
 document.querySelectorAll('[data-copy]').forEach(node=>{const value=c[node.dataset.copy];if(value!==undefined)node.textContent=value;});
 document.querySelectorAll('[data-copy-aria]').forEach(node=>{const value=c[node.dataset.copyAria];if(value!==undefined)node.setAttribute('aria-label',value);});
 if(selectedResponse)$('responseStatus').textContent=c.responseChosen[selectedResponse];
 document.title='LIMEN · '+c.subtitle+' · Còdex Viu';
 renderModuleHelp();
 if(session)renderPhase();
}
function setLanguage(value){locale=COPY[value]?value:'ca';applyCopy();}
function renderModuleHelp(){$('moduleHelp').textContent=copy().moduleHelp[moduleSelect.value]||copy().integratedHelp;}
function tokenNode(token){
 const mark=document.createElement('span');mark.classList.add('mark');mark.setAttribute('aria-hidden','true');
 if(token==='ring-with-dot'){const ring=document.createElement('span');ring.className='ring';const dot=document.createElement('span');dot.className='dot';ring.appendChild(dot);mark.appendChild(ring);return mark;}
 const glyphs={circle:['circle','●'],diamond:['diamond','◆'],triangle:['triangle','▲'],empty:['empty',' '],ring:['circle','○'],dot:['diamond','●']};
 const entry=glyphs[token]||['circle','●'];mark.classList.add(entry[0]);mark.textContent=entry[1];return mark;
}
function drawStimulus(phase){
 const host=$('stimulus');host.replaceChildren();
 if(phase==='interval'){host.setAttribute('aria-label',copy().phases.interval[1]);return;}
 const condition=CONDITIONS[session.conditionId],tokens=phase==='change'?condition.change:condition.baseline;
 host.setAttribute('aria-label',copy().pattern+' '+tokens.map(token=>copy().shapes[token]).join(', '));
 tokens.forEach(token=>host.appendChild(tokenNode(token)));
}
function renderPhase(){
 if(!session)return;
 const c=copy(),phase=session.phase;
 if(phase==='reflect'){trialPanel.hidden=true;reflectPanel.hidden=false;resultPanel.hidden=true;return;}
 if(phase==='reveal'){trialPanel.hidden=true;reflectPanel.hidden=true;resultPanel.hidden=false;renderResult();return;}
 trialPanel.hidden=false;reflectPanel.hidden=true;resultPanel.hidden=true;
 const item=c.phases[phase];$('phaseLabel').textContent=item[0];$('phaseTitle').textContent=item[0].charAt(0)+item[0].slice(1).toLowerCase();$('phaseText').textContent=item[1];$('next').textContent=c.next[phase];$('focusReminder').textContent=c.modulePractice[session.module]||c.modulePractice.integrated;
 drawStimulus(phase);
}
function clearResponse(){selectedResponse=null;$('responseStatus').textContent='';document.querySelectorAll('[data-response]').forEach(button=>button.setAttribute('aria-pressed','false'));}
function begin(){
 session=createSession({module:moduleSelect.value,conditionId:conditionSelect.value,focus:focusSelect.value});clearResponse();
 $('observation').value='';$('interpretation').value='';$('exportStatus').textContent='';
 setup.hidden=true;trialPanel.hidden=false;reflectPanel.hidden=true;resultPanel.hidden=true;renderPhase();
}
function chooseResponse(response){
 selectedResponse=response;document.querySelectorAll('[data-response]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.response===response)));$('responseStatus').textContent=copy().responseChosen[response];
}
function reveal(){
 if(!selectedResponse)return;
 session=respond(session,{response:selectedResponse,observation:$('observation').value,interpretation:$('interpretation').value});
 renderPhase();
}
function renderResult(){
 const c=copy();$('resultText').textContent=c.responses[session.response];$('resultDifference').textContent=c.difference[session.conditionId];
}
function exportTrace(){
 const trace=createTrace(session,new Date().toISOString(),copy().difference[session.conditionId]);
 const blob=new Blob([JSON.stringify(trace,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=copy().download;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('exportStatus').textContent=copy().exported;
}
function dissolve(){session=null;clearResponse();trialPanel.hidden=true;reflectPanel.hidden=true;resultPanel.hidden=true;setup.hidden=false;$('observation').value='';$('interpretation').value='';}
$('start').addEventListener('click',begin);
$('next').addEventListener('click',()=>{session=advance(session);renderPhase();});
$('stop').addEventListener('click',dissolve);$('reflectStop').addEventListener('click',dissolve);
document.querySelectorAll('[data-response]').forEach(button=>button.addEventListener('click',()=>chooseResponse(button.dataset.response)));
$('reveal').addEventListener('click',reveal);
$('export').addEventListener('click',exportTrace);
$('reobserve').addEventListener('click',()=>{session=reobserve(session);clearResponse();$('observation').value='';$('interpretation').value='';renderPhase();});
$('discard').addEventListener('click',dissolve);
language.addEventListener('change',()=>setLanguage(language.value));
moduleSelect.addEventListener('change',renderModuleHelp);
setLanguage('ca');
