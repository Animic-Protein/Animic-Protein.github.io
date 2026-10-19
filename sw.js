const CACHE = 'codex-viu-canonical-v129';
const ASSETS = [
  './', './index.html', './styles.css', './rosa.css', './rosa-lamina.css', './rosa-enhanced.css', './rosa-inter-nos.css', './cartographia.css',
  './germinacio.css', './error-fertil-i.css', './radices-brodsky.css', './vortex-ant.css', './temps-nu.css', './app.js', './foundation.js', './core.js', './germinacio.js', './phase3.js', './seed-bridge.js', './compost-cycle.js', './error-fertil-i.js', './metabolism.js', './homeostasis.js', './lineage.js',
  './rosa.js', './rosa-lamina.js', './rosa-enhanced.js', './rosa-inter-nos.js', './memoria-radicum.js', './probatio-radicum.js', './lex-radicum.js', './constitutio-vitae.js', './promocio.js', './promocio.css', './branques.js', './branques.css', './pressio.js', './pressio.css', './homeostasi-constitucional.js', './homeostasi-constitucional.css', './histeresi.js', './histeresi.css', './allostasi.js', './allostasi.css', './consolidacio.js', './consolidacio.css', './reconsolidacio.js', './breathing.js', './attention.js', './context-propi.js', './radices-brodsky.js', './vortex-ant.js', './temps-nu.js', './ressonancia.js', './ressonancia.css',
  './pont-site.json', './arrels/michel-faber-listen-retorn.md', './governanca/TANCAMENT_ESCOLTA_FABER_1.0.md', './404.html', './experiments/eco-01/', './experiments/eco-01/index.html', './experiments/eco-01/eco-01.js', './experiments/eco-01/README.md', './experiments/eco-01/eco-01-import.js', './archivum/coniunctio/casos/02-direccio-que-desapareix.md', './compost/error-fertil-i.md', './arrels/joseph-brodsky-creativitat.md', './arrels/joseph-brodsky-elogi-avorriment.md', './governanca/MUTATIO_GRAMATICA_OPERATIVA_1.0.md', './governanca/VIGILIA_CONFLUENTIA_1.0.md', './governanca/SOURCE_ROUTING_1.0.md', './governanca/IMPULS_OPERATIU_1.0.md', './governanca/REENTRADA_SUBJECTE_1.0.md', './governanca/KREATOR1_ORDRE_CAUSAL_1.1.md', './governanca/INVISIBILIS_KRONOS_1.0.md', './research/casos/CAMBRA_NUA_TEMPS_PERCEBUT_PROTOCOL_01.md', './research/casos/CAMBRA_NUA_INVISIBILIS_KRONOS_PROTOCOL_03.md', './archivum/verbal-seed.js', './archivum/custodia/contracte-1.0.json', './archivum/custodia/history-tales-v1.1.json', './archivum/custodia/history-tales-v1.1-custody-v1.2.json', './archivum/custodia/eco-01-cas-real-01.json', './governanca/ARCHIVUM_CUSTODIA_1.0.md',
  './mutatio/history-tales/site/', './mutatio/history-tales/site/index.html', './mutatio/history-tales/site/history-tales-media.html', './mutatio/history-tales/site/futurs-recordats.html', './mutatio/history-tales/site/ht-01.html', './mutatio/history-tales/site/ht-a2.html', './mutatio/history-tales/site/ht-03.html', './mutatio/history-tales/site/ht-a4.html', './mutatio/history-tales/site/ht-05.html', './mutatio/history-tales/site/ht-06.html', './mutatio/history-tales/site/ht-a7.html',
  './experiments/kreator-rpg/', './experiments/kreator-rpg/index.html', './experiments/kreator-rpg/rpg.js', './experiments/kreator-rpg/README.md', './governanca/actor-contract.mjs', './governanca/CONTRACTE_ACTOR_1.0.md', './manifest.webmanifest', './LICENSE.md', './universe/', './universe/index.html', './universe/impuls.html', './universe/travessa-beta2.js', './universe/impuls.js', './kreator1/', './kreator1/index.html', './kreator1/session-01.js', './cartographia-mutabilis/', './cartographia-mutabilis/index.html', './cartographia-mutabilis/cartographia.css', './cartographia-mutabilis/cartographia.js', './fusio-total/', './fusio-total/index.html', './fusio-total/mutatio-receptor.js', './inter-nos-creative/', './cambra-nua-2/', './cambra-nua-2/espera.html', './cambra-nua-2/perceived-duration.mjs', './cambra-nua-2/trace-history.mjs', './cambra-nua-2/temporal-fragment.js', './cambra-nua-2/temporal-fragment-ui.js', './cambra-nua-2/fragment-circulation.html', './cambra-nua-2/fragment-circulation.mjs', './portal-multimedia/', './portal-multimedia/index.html', './portal-multimedia/model.js', './portal-multimedia/source-routing.js', './portal-multimedia/source-ingest.js', './portal-multimedia/source-routing-ui.js', './portal-multimedia/storage.js', './portal-multimedia/pulsarium.js', './portal-multimedia/beta12-ui.js', './portal-multimedia/archivum-sheets-lazy.js', './portal-multimedia/media-runtime-hotfix.js', './portal-multimedia/custodia.js', './formiga.css', './formiga.js', './assets/cambra-nua.svg', './assets/icon.svg', './assets/icon-192.png', './assets/icon-512.png', './assets/apple-touch-icon.png'
];
ASSETS.push(
  './frictiones/',
  './frictiones/index.html',
  './frictiones/frictiones.css',
  './frictiones/benvolgut-error/',
  './frictiones/benvolgut-error/index.html',
  './frictiones/benvolgut-error/frictiones.css',
  './frictiones/benvolgut-error/contraarticle.md',
  './arrels/ignacio-orovio-benvolgut-error.md',
  './frictiones/ansiatat/',
  './frictiones/ansiatat/index.html',
  './frictiones/ansiatat/ansiatat.css',
  './frictiones/ansiatat/contraarticle.md',
  './arrels/marta-ricart-ansiatat.md',
  './frictiones/cornudos-juerga/',
  './frictiones/cornudos-juerga/index.html',
  './frictiones/cornudos-juerga/contraarticle.md',
  './arrels/imma-turbau-cornudos-juerga.md',
  './governanca/FRICTIONES_1.0.md'
);
ASSETS.push(
  './arrels/',
  './arrels/index.html',
  './arrels/tractatus-brevis-i/',
  './arrels/tractatus-brevis-i/index.html'
);
ASSETS.push(
  './harmonia-viva/',
  './harmonia-viva/index.html',
  './harmonia-viva/arranjament.css',
  './harmonia-viva/arranjament.js',
  './governanca/HARMONIA_VIVA_ARRANJAMENT_1.0.md'
);
ASSETS.push(
  './experiments/limen/',
  './experiments/limen/index.html',
  './experiments/limen/app.mjs',
  './experiments/limen/assets/medusa-pelagica.webp'
);
ASSETS.push(
  './experiments/dissensus/',
  './experiments/dissensus/index.html',
  './experiments/dissensus/dissensus.css',
  './experiments/dissensus/dissensus.mjs',
  './experiments/dissensus/dissensus-i18n.mjs',
  './experiments/dissensus/protocol.mjs',
  './experiments/dissensus/offline.mjs',
  './experiments/dissensus/DISSENSUS-guia-CAT-RU-KO-YUE-reparat.pdf'
);
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=event.request.url;const livePath=url.includes('/portal-multimedia/')||url.includes('/universe/')||url.includes('/cartographia-mutabilis/')||url.includes('/fusio-total/')||url.includes('/cambra-nua-2/')||url.includes('/mutatio/history-tales/site/')||url.includes('/experiments/eco-01/')||url.includes('/beta/');if(livePath){event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(async()=>{const cached=await caches.match(event.request);if(cached)return cached;if(event.request.mode==='navigate'){if(url.includes('/universe/'))return caches.match('./universe/index.html');if(url.includes('/cartographia-mutabilis/'))return caches.match('./cartographia-mutabilis/index.html');if(url.includes('/fusio-total/'))return caches.match('./fusio-total/index.html');if(url.includes('/cambra-nua-2/'))return caches.match('./cambra-nua-2/');if(url.includes('/mutatio/history-tales/site/'))return caches.match('./mutatio/history-tales/site/index.html');if(url.includes('/experiments/eco-01/'))return caches.match('./experiments/eco-01/index.html');if(url.includes('/beta/'))return caches.match('./404.html');return caches.match('./portal-multimedia/')}return Response.error()}));return}event.respondWith(fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(async()=>{const cached=await caches.match(event.request);if(cached)return cached;if(event.request.mode==='navigate')return caches.match('./index.html');return Response.error()}))});

