import Component from 'can/component/';

import template from './template.stache!';
import styles from './header-navigation.less!';

import GlobalParameterBar from 'components/global-parameter-bar/';
import topfilter from 'models/sharedMap/topfilter';

var headerNavigation = Component.extend({
  tag: 'header-navigation',
  template: template,
  scope: {
    appstate: undefined,// this gets passed in
    show:true
  },
  helpers: {
    isActive: function(pageName) {
      return 'class="' + (pageName === this.appstate.attr('page') ? 'active' : '') + '"'
    }
  },
  events:{
    init:function(){
      var self = this;
      topfilter.bind('show', function(ev, newVal, oldVal) {
         self.scope.attr("show", newVal);
      });
    }
  }
});

export default headerNavigation;
