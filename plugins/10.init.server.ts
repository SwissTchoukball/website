import { useDomainsStore } from '~/stores/domains';
import { useLiveStreamsStore } from '~/stores/live-streams';
import { useNavigationStore } from '~/stores/navigation';
import { useSeasonsStore } from '~/stores/seasons';

export default defineNuxtPlugin(async () => {
  const { loadMainMenu, loadSecondaryMenu, loadFooterLinks } = useNavigationStore();
  const { loadLiveStreams } = useLiveStreamsStore();
  const { loadAnnouncements } = useAnnouncementsStore();
  const { loadSeasons } = useSeasonsStore();
  const { loadDomains } = useDomainsStore();

  await loadMainMenu();
  loadSecondaryMenu();
  loadFooterLinks();
  await loadAnnouncements();
  await loadLiveStreams();
  await loadSeasons();
  await loadDomains();
});
