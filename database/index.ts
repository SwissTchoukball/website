import { Database } from '@vuex-orm/core';
import Season from '~/models/season.model';
import Competition from '~/models/competition.model';
import CompetitionEdition from '~/models/competition-edition.model';
import Team from '~/models/team.model';
import Phase from '~/models/phase.model';
import Round from '~/models/round.model';
import Match from '~/models/match.model';
import Facility from '~/models/facility.model';

const database = new Database();

database.register(Season);
database.register(Competition);
database.register(CompetitionEdition);
database.register(Team);
database.register(Phase);
database.register(Round);
database.register(Match);
database.register(Facility);

export default database;
