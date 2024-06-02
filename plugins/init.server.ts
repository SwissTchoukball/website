import { useDomainsStore } from '~/stores/domains';
import { useLiveStreamsStore } from '~/stores/live-streams';
import { useNavigationStore } from '~/stores/navigation';
import { useSeasonsStore } from '~/stores/seasons';

export default defineNuxtPlugin(async () => {
  const { loadMainMenu, loadSecondaryMenu } = useNavigationStore();
  const { loadLiveStreams } = useLiveStreamsStore();
  const { loadSeasons } = useSeasonsStore();
  const { loadDomains } = useDomainsStore();

  await loadMainMenu();
  loadSecondaryMenu();
  await loadLiveStreams();
  await loadSeasons();
  await loadDomains();
});
