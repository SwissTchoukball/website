import { Database } from '@vuex-orm/core';
import Domain from '~/models/domain.model';
import Competition from '~/models/competition.model';
import CompetitionEdition from '~/models/competition-edition.model';
import Team from '~/models/team.model';
import Phase from '~/models/phase.model';
import Round from '~/models/round.model';
import Faceoff from '~/models/faceoff.model';
import Match from '~/models/match.model';
import Facility from '~/models/facility.model';
import Group from '~/models/group.model';
import Role from '~/models/role.model';
import Person from '~/models/person.model';
import Resource from '~/models/resource.model';
import ResourceType from '~/models/resource-type.model';
import DomainResource from '~/models/domain-resource.model';
import RolePerson from '~/models/role-person.model';

const database = new Database();

// Core models
database.register(Domain);

// Competition models
database.register(Competition);
database.register(CompetitionEdition);
database.register(Team);
database.register(Phase);
database.register(Round);
database.register(Faceoff);
database.register(Match);
database.register(Facility);

// Staff models
database.register(Group);
database.register(Role);
database.register(Person);

// Other models
database.register(Resource);
database.register(ResourceType);

// Relationship models
database.register(DomainResource);
database.register(RolePerson);

export default database;
