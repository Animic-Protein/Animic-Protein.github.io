export const PROTOCOL_ID = 'animic.codex.perceptible-difference/v1';

export const CONDITIONS = Object.freeze({
  absence: Object.freeze({
    id: 'absence',
    title: 'Absència',
    focus: 'presència',
    baseline: Object.freeze(['circle', 'diamond', 'circle']),
    change: Object.freeze(['circle', 'empty', 'circle']),
    relation: 'Un element desapareix del centre.'
  }),
  position: Object.freeze({
    id: 'position',
    title: 'Desplaçament',
    focus: 'posició',
    baseline: Object.freeze(['diamond', 'circle', 'triangle']),
    change: Object.freeze(['circle', 'diamond', 'triangle']),
    relation: 'Dos elements intercanvien la posició.'
  }),
  context: Object.freeze({
    id: 'context',
    title: 'Relació',
    focus: 'context',
    baseline: Object.freeze(['ring-with-dot', 'ring', 'dot']),
    change: Object.freeze(['ring', 'dot', 'ring-with-dot']),
    relation: 'Els mateixos elements canvien de proximitat i agrupació.'
  })
});

export const PHASES = Object.freeze(['baseline', 'interval', 'change', 'return', 'reflect', 'reveal']);
const RESPONSES = new Set(['noticed', 'not-noticed', 'uncertain']);

export function createTrial(conditionId, attentionFocus = 'presència') {
  if (!CONDITIONS[conditionId]) throw new TypeError('Condició desconeguda.');
  return Object.freeze({
    protocol: PROTOCOL_ID,
    conditionId,
    attentionFocus: String(attentionFocus),
    phase: 'baseline',
    response: null,
    description: '',
    reobservations: 0
  });
}

export function advanceTrial(trial) {
  const index = PHASES.indexOf(trial?.phase);
  if (index < 0 || index >= PHASES.length - 2) return trial;
  return Object.freeze({...trial, phase: PHASES[index + 1]});
}

export function reportPerception(trial, response, description = '') {
  if (trial?.phase !== 'reflect') throw new Error('La resposta s’accepta després de l’observació.');
  if (!RESPONSES.has(response)) throw new TypeError('Resposta d’observació no reconeguda.');
  return Object.freeze({
    ...trial,
    phase: 'reveal',
    response,
    description: String(description).slice(0, 500)
  });
}

export function reobserve(trial) {
  return Object.freeze({
    ...createTrial(trial.conditionId, trial.attentionFocus),
    reobservations: Number(trial.reobservations || 0) + 1
  });
}

export function createTrace(trial, createdAt = new Date().toISOString(), differenceLabel = '') {
  if (trial?.phase !== 'reveal' || !trial.response) throw new Error('No es pot exportar un rastre abans de la decisió humana.');
  const condition = CONDITIONS[trial.conditionId];
  return {
    schema: PROTOCOL_ID,
    id: 'differentia-' + Date.parse(createdAt).toString(36),
    type: 'perceptual-observation',
    source: {id: 'laboratorium-differentia', path: 'experiments/diferencia-perceptible/', canonical: false},
    observation: {
      condition: condition.id,
      attentionFocus: trial.attentionFocus,
      presentedSequence: ['baseline', 'interval', 'change', 'return'],
      reportedPerception: trial.response,
      description: trial.description,
      reobservations: trial.reobservations,
      disclosedDifference: condition.relation
    },
    humanDecision: 'return',
    effect: {transformed: false},
    provenance: {createdAt, reversible: true, canonical: false, persistence: 'user-initiated-download'}
  };
}
