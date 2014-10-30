import Component from 'can/component/';
import List from 'can/list/';

import BundleDetailGrid from 'components/bundle-detail-grid/';

import licensorColumns from './column-sets/licensor-columns';
import countryColumns from './column-sets/country-columns';

import template from './template.stache!';
import _less from './bundle-detail.less!';

var columnSets = {
  'licensor': licensorColumns,
  'country': countryColumns
};

var BundleDetailTabs = Component.extend({
  tag: 'rn-bundle-detail',
  template: template,
  scope: {
    appstate: null, // passed in
    pageState: null, // passed in
    selectedTab: 'licensor', // by default
    isCashAdjusted: false, // TODO: set up checkbox
    paymentType: 'recon', // TODO: set up dropdown
    gridColumns: columnSets['licensor'],
    gridRows: new List([])
  },
  helpers: {
    selectedTabClass: function(tabName) {
      return this.attr('selectedTab') === tabName ? 'selected' : '';
    }
  },
  events: {
    '{scope} selectedTab': function(scope, ev, newVal) {
      this.scope.attr('gridColumns', columnSets[newVal]);
    },
    '{scope} pageState.selectedBundle': function(scope, ev, newBundle) {
      var self = this;

      newBundle.getDetails(
        this.scope.attr('appstate'),
        this.scope.attr('isCashAdjusted'),
        this.scope.attr('paymentType')
      );
    },
    '.tabs > li click': function(el, ev) {
      this.scope.attr('selectedTab', el.data('tabValue'));
    }
  }
});

export default BundleDetailTabs;
