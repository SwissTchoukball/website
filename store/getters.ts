import { GetterTree } from 'vuex/types/index';
import { Item } from '@vuex-orm/core';
import { RootState } from '~/store/state';
import Season from '~/models/season.model';

export default {
  currentSeason: (): Item<Season> => {
    const today = new Date().toISOString().substring(0, 10);
    return Season.query()
      .where('date_start', (value: string) => value <= today)
      .where('date_end', (value: string) => value >= today)
      .first();
  },
} as GetterTree<RootState, RootState>;
