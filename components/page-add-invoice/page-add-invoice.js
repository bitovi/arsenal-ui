import Component from 'can/component/';

import datePicker from 'components/date-picker/';

import template from './template.stache!';
import styles from './page-add-invoice.less!';

var page = Component.extend({
  tag: 'page-add-invoice',
  template: template,
  scope: {}
});

export default page;
