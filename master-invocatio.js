(() => {
  'use strict';

  if (window.MasterInvocatio) return;

  const KEY='animic-master-invocations-v1';
  const CHOICES=['quiet','reobserve','relate','transform','return'];

  const readTrace=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const writeTrace=items=>{try{localStorage.setItem(KEY,JSON.stringify(items.slice(-120)))}catch{}}
  const now=()=>new Date().toISOString();
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();

  function context(){
    const p=location.pathname;
    const title=clean(document.querySelector('h1')?.textContent)||document.title||'Còdex Viu';
    const organ=clean(document.querySelector('#organName')?.textContent||document.querySelector('[data-current-organ]')?.textContent);
    const signal=clean(document.querySelector('#signal')?.textContent||document.querySelector('#impulsPanel')?.textContent);
    let zone='Còdex Viu';
    if(p.includes('universe')) zone='Universe';
    else if(p.includes('fusio-total')) zone='Fusió Total';
    else if(p.includes('cambra-nua-2')) zone='Cambra Nua del Temps';
    else if(p.includes('inter-nos-creative')) zone='INTER NOS';
    else if(p.includes('portal-multimedia')) zone='Portal multimèdia';
    else if(p.includes('looperum')) zone='Looperum';
    return{path:p,zone,title,organ,signal};
  }

  function propose(c){
    const s=(c.signal||'').toLowerCase();
    if(/reobserv|reescolt|alleujament/.test(s)) return{action:'reobserve',uncertainty:'active',text:'Hi ha un senyal que demana reobservació. Conserva el context i comprova si la tensió continua abans d’intervenir.'};
    if(/relacion|pont|conflu/.test(s)) return{action:'relate',uncertainty:'active',text:'Hi ha una possible relació, però encara no és significat. Prova un únic pont reversible i conserva la divergència si no funciona.'};
    if(/transform|metabol|mutatio/.test(s)) return{action:'transform',uncertainty:'active',text:'La situació admet una transformació possible. Limita-la a un gest petit, perceptible i reversible; MUTATIO només després de decisió humana.'};
    if(/retorn|return|fragment/.test(s)) return{action:'return',uncertainty:'active',text:'Hi ha material amb rastre suficient per retornar-lo al circuit sense multiplicar-lo. Fes circular una sola cosa.'};
    if(c.zone==='Cambra Nua del Temps') return{action:'reobserve',uncertainty:'active',text:'Aquí la primera operació coherent és sostenir el temps una mica més. Reobserva abans de convertir l’absència en explicació.'};
    if(c.zone==='INTER NOS') return{action:'relate',uncertainty:'active',text:'Estàs en un espai relacional. Formula una sola relació possible i deixa que la Persona decideixi si mereix continuar.'};
    return{action:'quiet',uncertainty:'insufficient-signal',text:'No hi ha prou senyal local per justificar moviment. El silenci és una proposta vàlida; pots invocar de nou després d’una diferència observable.'};
  }

  function style(){
    if(document.querySelector('#master-invocatio-style'))return;
    const s=document.createElement('style');s.id='master-invocatio-style';s.textContent=`
      .master-invoke{position:fixed;z-index:9998;left:max(14px,env(safe-area-inset-left));bottom:max(18px,calc(env(safe-area-inset-bottom) + 12px));border:1px solid #b8832f88;border-radius:999px;background:#07172fe8;color:#f6df9b;padding:9px 13px;font:700 11px/1 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.12em;text-transform:uppercase;box-shadow:0 12px 40px #0006;backdrop-filter:blur(14px)}
      .master-invoke:hover,.master-invoke:focus-visible{outline:none;border-color:#e5b348;color:#fff3c4}
      .master-panel[hidden]{display:none}.master-panel{position:fixed;z-index:10020;inset:0;background:#020812cc;backdrop-filter:blur(12px);display:grid;place-items:center;padding:18px}.master-card{width:min(620px,100%);max-height:min(760px,calc(100vh - 36px));overflow:auto;border:1px solid #d49a3488;border-radius:26px;background:linear-gradient(150deg,#0b1b35,#071019 68%);color:#eef6ff;padding:clamp(20px,4vw,32px);box-shadow:0 30px 100px #000a;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.master-ey{margin:0 0 8px;color:#e6ad42;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}.master-card h2{margin:.1rem 0 .6rem;font:400 clamp(28px,5vw,46px)/1 Georgia,serif}.master-context{color:#8fa8b8;font-size:12px}.master-proposal{margin:1rem 0;padding:16px;border:1px solid #31557b;border-radius:18px;background:#061320}.master-proposal strong{display:block;color:#fff0b4;margin-bottom:6px}.master-choices{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.master-choices button,.master-close{border:1px solid #42617a;border-radius:999px;background:#0b1b29;color:#dbe9f2;padding:9px 12px;font-weight:700}.master-choices button:hover,.master-choices button:focus-visible{border-color:#e0a43f;color:white}.master-close{float:right;background:transparent}.master-note{margin:.8rem 0 0;color:#6f8795;font-size:11px}.master-result{margin-top:10px;color:#9fc7a8;font-size:12px}.master-card[data-decided="true"] .master-choices{opacity:.55}
      @media(max-width:850px){.master-invoke{bottom:max(86px,calc(env(safe-area-inset-bottom) + 78px))}}
    `;document.head.append(s);
  }

  function mount(){
    style();
    const button=document.createElement('button');
    button.type='button';button.className='master-invoke';button.textContent='Invocar MASTER';button.setAttribute('aria-haspopup','dialog');
    const panel=document.createElement('div');panel.className='master-panel';panel.hidden=true;panel.innerHTML=`<section class="master-card" role="dialog" aria-modal="true" aria-labelledby="master-title"><button class="master-close" type="button" aria-label="Tancar MASTER">×</button><p class="master-ey">MASTER · INVOCATIO 1.0</p><h2 id="master-title">Situar, no decidir.</h2><p class="master-context"></p><div class="master-proposal"></div><div class="master-choices" aria-label="Decisió humana"></div><p class="master-result" aria-live="polite"></p><p class="master-note">Invocació reversible · no canònica · LOCUTUS formula · KREATOR decideix</p></section>`;
    document.body.append(button,panel);

    const close=()=>{panel.hidden=true;button.focus()};
    panel.querySelector('.master-close').onclick=close;
    panel.addEventListener('click',e=>{if(e.target===panel)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close()});

    button.onclick=()=>invoke(panel);
  }

  function invoke(panel){
    const c=context(),p=propose(c),id=`master-${Date.now().toString(36)}`;
    const record={id,invokedAt:now(),context:c,proposal:p,humanDecision:null,diverges:null,provenance:{kind:'master-invocatio',reversible:true,canonical:false}};
    const trace=readTrace();trace.push(record);writeTrace(trace);
    panel.hidden=false;
    const card=panel.querySelector('.master-card');card.dataset.decided='false';
    panel.querySelector('.master-context').textContent=`${c.zone} · ${c.organ||c.title} · ${c.path}`;
    panel.querySelector('.master-proposal').innerHTML=`<strong>${p.action.toUpperCase()} · ${p.uncertainty}</strong><span></span>`;
    panel.querySelector('.master-proposal span').textContent=p.text;
    panel.querySelector('.master-result').textContent='';
    const choices=panel.querySelector('.master-choices');choices.replaceChildren();
    CHOICES.forEach(action=>{const b=document.createElement('button');b.type='button';b.textContent=action;b.dataset.action=action;b.onclick=()=>decide(id,action,p.action,panel);choices.append(b)});
    window.dispatchEvent(new CustomEvent('codex:master-invoked',{detail:record}));
  }

  function decide(id,action,suggested,panel){
    const trace=readTrace();const rec=trace.find(x=>x.id===id);if(!rec)return;
    rec.humanDecision=action;rec.decidedAt=now();rec.diverges=action!==suggested;writeTrace(trace);
    const card=panel.querySelector('.master-card');card.dataset.decided='true';
    panel.querySelector('.master-result').textContent=rec.diverges?`KREATOR decideix ${action}. Divergeix de MASTER (${suggested}); la divergència queda al rastre.`:`KREATOR decideix ${action}. Coincideix amb la proposta, però continua essent decisió humana.`;
    window.dispatchEvent(new CustomEvent('codex:master-decision',{detail:rec}));
  }

  window.MasterInvocatio={invoke:()=>{const p=document.querySelector('.master-panel');if(p)invoke(p)},readTrace};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
