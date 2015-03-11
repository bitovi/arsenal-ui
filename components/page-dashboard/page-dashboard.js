import Component from 'can/component/';

import GlobalParameterBar from 'components/global-parameter-bar/';
import Switcher from 'components/switcher/';
import DashboardInvoices from 'components/dashboard-invoices/';
import DashboardApprovals from 'components/dashboard-approvals/';
import DashboardPayments from 'components/dashboard-payments/';

import template from './template.stache!';
import styles from './page-dashboard.less!';
import fieldPermission from 'utils/fieldPermission';

import commonUtils from 'utils/commonUtils';

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
      id: 1,
      tabIndex:0
    },

    {
      text: 'Invoices Received',
      id:2,
      tabIndex:1
    }
    ,
    {
      text: 'Payments',
      id:3,
      tabIndex:2
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
      console.log("Before Hide="+attr);
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
      commonUtils.hideUIMessage();
      return this.attr('selectedTab').text === tabText ? options.fn(this) : '';

    }
  },
  events: {
    init: function() {
      this.scope.appstate.attr('renderGlobalSearch', true);

      var tabIndex = 0;
      var self = this;
      if(this.scope.appstate.screenLookup.targetScreen != undefined){
        this.scope.tabs.each(function(tab){
          if(self.scope.appstate.screenLookup.targetScreen == tab.id){
            self.scope.appstate.screenLookup.attr('targetScreen',undefined);
            tabIndex = tab.tabIndex;
          }
        });
      }

      this.scope.attr('selectedTab', this.scope.tabs[tabIndex]);
      self.scope.appstate.screenLookup.attr('screenid',this.scope.tabs[tabIndex].id);

      console.log(self.scope.appstate.screenLookup.attr('screenid'));

    }
  }
});

export default page;
