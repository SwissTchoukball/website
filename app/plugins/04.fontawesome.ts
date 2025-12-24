import { library, config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
  faAsterisk,
  faAward,
  faCalendarDays,
  faChevronDown,
  faCircleDot,
  faCirclePlay,
  faClock,
  faEnvelope,
  faFile,
  faFilePdf,
  faFileZipper,
  faHashtag,
  faLocationDot,
  faLink,
  faList,
  faMagnifyingGlass,
  faNewspaper,
  faQuestion,
  faRss,
  faShieldHalved,
  faSliders,
  faSquareRss,
  faTimes,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebook, faFlickr, faYoutube } from '@fortawesome/free-brands-svg-icons';

// This is important, we are going to let Nuxt worry about the CSS
config.autoAddCss = false;

// You can add your icons directly in this plugin. See other examples for how you
// can add other styles or just individual icons.
library.add(
  faAngleLeft,
  faAngleRight,
  faAnglesLeft,
  faAnglesRight,
  faAsterisk,
  faAward,
  faCalendarDays,
  faChevronDown,
  faCircleDot,
  faCirclePlay,
  faClock,
  faEnvelope,
  faFile,
  faFilePdf,
  faFileZipper,
  faHashtag,
  faLocationDot,
  faLink,
  faList,
  faMagnifyingGlass,
  faNewspaper,
  faQuestion,
  faRss,
  faShieldHalved,
  faSliders,
  faSquareRss,
  faTimes,
  faUser,
  faInstagram,
  faFacebook,
  faFlickr,
  faYoutube,
);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon);
});
