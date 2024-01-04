import Competition from '~/models/competition.model';

export interface CompetitionsState {
  competitions: Competition[];
}

export default (): CompetitionsState => ({
  competitions: [],
});
