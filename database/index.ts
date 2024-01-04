import { Database } from '@vuex-orm/core';
import CompetitionEdition from '~/models/competition-edition.model';
import Team from '~/models/team.model';
import Phase from '~/models/phase.model';
import Round from '~/models/round.model';
import Faceoff from '~/models/faceoff.model';
import Match from '~/models/match.model';
import Facility from '~/models/facility.model';

const database = new Database();

// Competition models
database.register(CompetitionEdition);
database.register(Team);
database.register(Phase);
database.register(Round);
database.register(Faceoff);
database.register(Match);
database.register(Facility);

export default database;
