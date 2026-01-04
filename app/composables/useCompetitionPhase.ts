import type Phase from '~/models/phase.model';

export const useCompetitionPhase = (seasonSlug: string, competitionSlug: string, phaseId: string) => {
  const { competitionEdition, season, fetchStatus, fetchError } = useCompetitionEdition(seasonSlug, competitionSlug);

  const phase = computed<Phase | undefined>(() => {
    if (!phaseId || !competitionEdition.value?.phases) {
      return;
    }
    const phaseData = competitionEdition.value.phases.find((phase) => phase.id === phaseId);
    if (!phaseData) {
      return;
    }
    return phaseData;
  });

  return { competitionEdition, season, phase, fetchStatus, fetchError };
};
