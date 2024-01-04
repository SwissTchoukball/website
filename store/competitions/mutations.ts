import { MutationTree } from 'vuex/types/index';
import { CompetitionsState } from './state';
import Competition from '~/models/competition.model';

const competitionMutations: MutationTree<CompetitionsState> = {
  setCompetitions(state, competitions: Competition[]) {
    state.competitions = competitions;
  },
};

export default competitionMutations;
