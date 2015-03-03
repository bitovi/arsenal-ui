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
              pickTime: false,
              useCurrent: false

        });

        $("#"+self.attr().name).datetimepicker().on("dp.show",function (e) {
            var InputName = this.id;
            if($("input[name='"+InputName+"']").val() === ""){
              $(".picker-open").find("td.active").removeClass("active");
              $(".picker-open").find("td.today").addClass("active");
            }
        });
         
        }
      } 
});

export default datePicker;
