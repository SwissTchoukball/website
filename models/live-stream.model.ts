import { Model } from '@vuex-orm/core';

export default class LiveStream extends Model {
  static entity = 'live-streams';

  id!: number;
  title!: string;
  url!: string;
  date_start!: string;
  date_end!: string;
  stream_start!: string;

  static fields() {
    return {
      id: this.number(null),
      title: this.string(null),
      url: this.string(null),
      date_start: this.string(null),
      date_end: this.string(null),
      stream_start: this.string(null),
    };
  }
}
