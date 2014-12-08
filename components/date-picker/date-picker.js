import Component from 'can/component/';

import css_datepicker from 'bootstrap-datetimepicker.css!';

import moment from 'moment';

import datepicker from 'bootstrap-datetimepicker';

import template from './template.stache!';
import styles from './date-picker.less!';

var datePicker = Component.extend({
  tag: 'date-picker',
  template: template,
  scope: {
    appstate: undefined, 
    name:"@",
    placeholder:"@"
  },
  events: {
      "inserted": function(){
        var self = this.scope;
        $("#"+self.attr().name).datetimepicker({
              pickTime: false
        })
         
        }
      } 
});

export default datePicker;
