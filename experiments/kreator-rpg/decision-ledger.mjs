const decisions = events => events.filter(event => event.type === 'human-decision');

export function decisionStatus(events, decision) {
  if (!decision) return null;
  const allDecisions = decisions(events);
  if (allDecisions.some(event => event.supersedes === decision.id)) return 'superseded';
  if (events.some(event => event.type === 'decision-invalidated' && event.decisionId === decision.id)) return 'invalidated';
  if (events.some(event => event.type === 'movement' && event.authorizedBy?.id === decision.id)) return 'effect-authorized';
  if (events.some(event => event.type === 'closure' && event.authorizedBy?.id === decision.id)) return 'closed-without-effect';
  if (allDecisions.some((event, index) => event.id === decision.id && index < allDecisions.length - 1)) return 'unresolved';
  return 'active';
}

export function activeDecision(events) {
  return decisions(events).filter(decision => decisionStatus(events, decision) === 'active').at(-1) || null;
}

export function appendHumanDecision(events, decision) {
  const previous = activeDecision(events);
  events.push(previous ? {...decision, supersedes: previous.id} : decision);
  return events.at(-1);
}

export function latestHumanDecisionSummary(events) {
  const latest = decisions(events).at(-1);
  return latest ? {
    id: latest.id,
    actorKind: 'human',
    action: latest.action,
    at: latest.at,
    status: decisionStatus(events, latest),
    unresolvedPriorDecisionIds: decisions(events)
      .filter(decision => decisionStatus(events, decision) === 'unresolved')
      .map(decision => decision.id),
    ...(latest.supersedes ? {supersedes: latest.supersedes} : {})
  } : null;
}
