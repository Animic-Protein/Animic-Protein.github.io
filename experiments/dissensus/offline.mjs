// Cache only the public Site resources; never the participant's session.
if ('serviceWorker' in navigator) {
  try {
    const registration = await navigator.serviceWorker.register('../../sw.js', {updateViaCache:'none'});
    await registration.update();
  } catch (error) {
    console.warn('[DISSENSUS] Mode offline no disponible:', error);
  }
}
