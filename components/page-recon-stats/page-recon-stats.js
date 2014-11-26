import Component from 'can/component/';
import template from './template.stache!';
import styles from './page-recon-stats.less!';
import Stats from 'models/refreshstats/refreshstats';

import ReconStats from 'components/recon-stats/';


var page = Component.extend({
  tag: 'page-recon-stats',
  template: template,

  scope: {
    tabSelected :""

  },

  helpers: {

    isRejectBtn:function(pageName){
      //TODO based on the selected rows
      return (pageName === this.attr('tabSelected') ? 'disabled' : '' ) ;
      //return 'style="display:' + (pageName === this.attr('tabSelected') ? 'block' : 'none') + '"';
    }

  },
  events:{
    'shown.bs.tab': function(el, ev) {
        this.scope.attr("tabSelected", $('.nav-tabs .active').text());

       console.log(this.scope.attr("tabSelected"));
    }
  }

});


export default page;
