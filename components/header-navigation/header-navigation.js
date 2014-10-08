import Component from 'can/component/';

import template from './template.stache!';
import styles from './header-navigation.less!';

var headerNavigation = Component.extend({
  tag: 'header-navigation',
  template: template,
  scope: {}
});

export default headerNavigation;
