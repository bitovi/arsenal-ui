import Component from 'can/component/';

import GlobalParameterBar from 'components/global-parameter-bar/';
import Switcher from 'components/switcher/';
import DashboardInvoices from 'components/dashboard-invoices/';
import DashboardApprovals from 'components/dashboard-approvals/';
import DashboardApprovals from 'components/dashboard-payments/';

import template from './template.stache!';
import styles from './page-dashboard.less!';
import fieldPermission from 'utils/fieldPermission';

var page = Component.extend({
  tag: 'page-dashboard',
  template: template,
  scope: {
    appstate:undefined,  // passed in
    role :"",
    screenId: 10,
    tabs: [
    {
      text: 'Approvals',
      id: 1
    },

    {
      text: 'Invoices Received',
      id:2
    }
    ,
    {
      text: 'Payments',
      id:3
    }

    ],
    selectedTab: null,

  },

  init: function(){
    for(var i=0; i<this.scope.tabs.length; i++)
    {
      var screenId = this.scope.attr("screenId") ;
      var fieldId = this.scope.tabs[i].id ;

      var attr = fieldPermission.formRequestDetails(fieldId,screenId);

      if(attr == 'hidden')
      {
        this.scope.tabs.splice(i, 1);

      }

    }

   },

  helpers: {
    getFieldAttribute:function(fieldId){
      var role = this.attr("role") ;
      return fieldPermission.formRequestDetails(fieldId,this.attr("screenId"),role);

    },
    ifSelectedTab: function(tabText, options) {
      return this.attr('selectedTab').text === tabText ? options.fn(this) : '';
    }
  },
  events: {
    init: function() {
      this.scope.appstate.attr('renderGlobalSearch', true);
      if(this.scope.appstate.attr('DISPLAY_HOLES_REPORT')){
        this.scope.attr('selectedTab', this.scope.tabs[1]);
        this.scope.appstate.attr('DISPLAY_HOLES_REPORT','');
      }else
      this.scope.attr('selectedTab', this.scope.tabs[0]);
    }
  }
});

export default page;
