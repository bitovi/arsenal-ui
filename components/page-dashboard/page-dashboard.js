import Component from 'can/component/';

import template from './template.stache!';
import styles from './page-dashboard.less!';

var page = Component.extend({
  tag: 'page-dashboard',
  template: template,
  scope: {}
});

export default page;
