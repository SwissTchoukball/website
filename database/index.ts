import { Database } from '@vuex-orm/core';
import CompetitionEdition from '~/models/competition-edition.model';
import Phase from '~/models/phase.model';
import Round from '~/models/round.model';
import Faceoff from '~/models/faceoff.model';
import Match from '~/models/match.model';

const database = new Database();

// Competition models
database.register(CompetitionEdition);
database.register(Phase);
database.register(Round);
database.register(Faceoff);
database.register(Match);

export default database;
