import Component from 'can/component/';

import template from './template.stache!';
import styles from './header-navigation.less!';

var headerNavigation = Component.extend({
  tag: 'header-navigation',
  template: template,
  scope: {
    appstate: undefined // this gets passed in
  },
  helpers: {
    isActive: function(pageName) {
      return 'class="' + (pageName === this.appstate.attr('page') ? 'active' : '') + '"'
    }
  }
});

export default headerNavigation;
