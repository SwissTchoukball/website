export default defineNuxtPlugin((nuxtApp) => {
  const { loadMainMenu, loadSecondaryMenu } = useNavigationStore();
  const { loadLiveStreams } = useLiveStreamsStore();
  const { loadDomains } = useDomainsStore();
  const { eventTypes, loadEventTypes } = useEventsStore();
  const { playerPositions, loadPlayerPositions } = useNationalTeamsStore();
  const { resourceTypes, loadResourceTypes } = useResourcesStore();

  nuxtApp.hook('i18n:localeSwitched', async () => {
    const dataLoads = [loadMainMenu(), loadSecondaryMenu(), loadLiveStreams(), loadDomains()];

    // We load the event types only if we already have them in the old locale
    if (eventTypes) {
      dataLoads.push(loadEventTypes());
    }

    // We load the positions only if we already have them in the old locale
    if (playerPositions) {
      dataLoads.push(loadPlayerPositions());
    }

    // We load the resource types only if we already have them in the old locale
    if (resourceTypes.length) {
      dataLoads.push(loadResourceTypes());
    }

    await Promise.all(dataLoads);
  });
});
